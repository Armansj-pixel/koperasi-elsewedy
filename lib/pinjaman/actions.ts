'use server'

import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PinjamanStatus =
  | 'PENDING_L1'
  | 'PENDING_L2'
  | 'PENDING_L3'
  | 'APPROVED'
  | 'DISBURSED'
  | 'ACTIVE'
  | 'LUNAS'
  | 'REJECTED'
  | 'CANCELLED'

export type CicilanStatus = 'SCHEDULED' | 'PAID' | 'OVERDUE' | 'WAIVED'

export interface Pinjaman {
  id: number
  user_id: string
  nominal: number
  biaya_admin: number
  total_diterima: number
  tenor_bulan: number
  cicilan_per_bulan: number
  status: PinjamanStatus
  tanggal_pengajuan: string
  tanggal_disetujui: string | null
  tanggal_pencairan: string | null
  tanggal_jatuh_tempo: string | null
  catatan_pengaju: string | null
  catatan_l1: string | null
  catatan_l2: string | null
  catatan_l3: string | null
  approved_l1_by: string | null
  approved_l2_by: string | null
  approved_l3_by: string | null
  approved_l1_at: string | null
  approved_l2_at: string | null
  approved_l3_at: string | null
  disbursed_by: string | null
  disbursed_at: string | null
  rejected_reason: string | null
  created_at: string
  updated_at: string
}

export interface CicilanPinjaman {
  id: number
  pinjaman_id: number
  nomor_cicilan: number
  nominal_cicilan: number
  tanggal_jatuh_tempo: string
  tanggal_pembayaran: string | null
  status: CicilanStatus
  created_at: string
}

export interface PinjamanWithUser extends Pinjaman {
  user_nama: string
  user_nik: string
}

// ─── Kalkulasi ────────────────────────────────────────────────────────────────

export async function hitungPinjaman(nominal: number, tenor: number) {
  const biayaAdmin = Math.round(nominal * 0.04) // Potongan 4%
  const totalDiterima = nominal - biayaAdmin
  const cicilanPerBulan = Math.round(nominal / tenor)
  return { biayaAdmin, totalDiterima, cicilanPerBulan }
}

// ─── Generate Jadwal Cicilan ──────────────────────────────────────────────────

function generateJadwalCicilan(
  pinjamanId: number,
  nominal: number,
  tenor: number,
  cicilanPerBulan: number,
  tanggalMulai: Date
) {
  const cicilan = []
  let sisaPokok = nominal

  for (let i = 1; i <= tenor; i++) {
    const jatuhTempo = new Date(tanggalMulai)
    jatuhTempo.setMonth(jatuhTempo.getMonth() + i)

    const nominalCicilan = i === tenor ? sisaPokok : cicilanPerBulan
    sisaPokok -= nominalCicilan

    cicilan.push({
      pinjaman_id: pinjamanId,
      nomor_cicilan: i,
      nominal_cicilan: nominalCicilan,
      tanggal_jatuh_tempo: jatuhTempo.toISOString().split('T')[0],
      status: 'SCHEDULED' as CicilanStatus,
    })
  }

  return cicilan
}

// ─── GET: List Pinjaman ───────────────────────────────────────────────────────

export async function getPinjamanList(filter?: {
  status?: PinjamanStatus
  userId?: string
}) {
  const supabase = await createClient()

  let query = supabase
    .from('pinjaman')
    .select('*')
    .order('created_at', { ascending: false })

  if (filter?.status) query = query.eq('status', filter.status)
  if (filter?.userId) query = query.eq('user_id', filter.userId)

  const { data: pinjaman, error } = await query

  if (error) return { data: [], error: error.message }

  const userIds = [...new Set(pinjaman?.map((p) => p.user_id) ?? [])]
  const { data: users } = await supabase
    .from('users')
    .select('id, nama, nik')
    .in('id', userIds)

  const userMap = new Map(users?.map((u) => [u.id, u]) ?? [])

  const result: PinjamanWithUser[] = (pinjaman ?? []).map((p) => ({
    ...p,
    user_nama: userMap.get(p.user_id)?.nama ?? 'Unknown',
    user_nik: userMap.get(p.user_id)?.nik ?? '-',
  }))

  return { data: result, error: null }
}

// ─── GET: Detail Pinjaman ─────────────────────────────────────────────────────

export async function getPinjamanDetail(id: number) {
  const supabase = await createClient()

  const { data: pinjaman, error } = await supabase
    .from('pinjaman')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !pinjaman) return { data: null, cicilan: [], error: error?.message ?? 'Not found' }

  const { data: user } = await supabase
    .from('users')
    .select('id, nama, nik, no_hp, simpanan_bulanan')
    .eq('id', pinjaman.user_id)
    .single()

  const { data: cicilan } = await supabase
    .from('cicilan_pinjaman')
    .select('*')
    .eq('pinjaman_id', id)
    .order('nomor_cicilan', { ascending: true })

  const approverIds = [
    pinjaman.approved_l1_by,
    pinjaman.approved_l2_by,
    pinjaman.approved_l3_by,
    pinjaman.disbursed_by,
  ].filter(Boolean) as string[]

  let approverMap = new Map<string, string>()
  if (approverIds.length > 0) {
    const { data: approvers } = await supabase
      .from('users')
      .select('id, nama')
      .in('id', approverIds)
    approverMap = new Map(approvers?.map((a) => [a.id, a.nama]) ?? [])
  }

  return {
    data: {
      ...pinjaman,
      user_nama: user?.nama ?? 'Unknown',
      user_nik: user?.nik ?? '-',
      user_no_hp: user?.no_hp ?? '-',
      user_simpanan_bulanan: user?.simpanan_bulanan ?? 0,
      nama_l1: pinjaman.approved_l1_by ? approverMap.get(pinjaman.approved_l1_by) ?? '-' : null,
      nama_l2: pinjaman.approved_l2_by ? approverMap.get(pinjaman.approved_l2_by) ?? '-' : null,
      nama_l3: pinjaman.approved_l3_by ? approverMap.get(pinjaman.approved_l3_by) ?? '-' : null,
      nama_disbursed: pinjaman.disbursed_by ? approverMap.get(pinjaman.disbursed_by) ?? '-' : null,
    },
    cicilan: cicilan ?? [],
    error: null,
  }
}

// ─── GET: Pinjaman Aktif Anggota ──────────────────────────────────────────────

export async function getPinjamanAktifAnggota(userId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('pinjaman')
    .select('id, nominal, tenor_bulan, cicilan_per_bulan, status, tanggal_pengajuan')
    .eq('user_id', userId)
    .in('status', ['PENDING_L1', 'PENDING_L2', 'PENDING_L3', 'APPROVED', 'DISBURSED', 'ACTIVE'])
    .order('created_at', { ascending: false })

  return data ?? []
}

// ─── ACTION: Ajukan Pinjaman (Dengan Logika Top-Up Auto-Settlement) ───────────

const AjukanPinjamanSchema = z.object({
  // Plafon dikunci maksimal 15.000.000
  nominal: z.number().min(100000, 'Minimal pinjaman Rp 100.000').max(15000000, 'Maksimal pinjaman Rp 15.000.000'),
  // Tenor dikunci maksimal 12 bulan
  tenor_bulan: z.number().min(1).max(12),
  catatan_pengaju: z.string().optional(),
})

export async function ajukanPinjaman(formData: FormData) {
  const session = await requireRole(['ANGGOTA'])

  const nominalRaw = (formData.get('nominal') as string) ?? ''
  const nominal = parseInt(nominalRaw.replace(/\D/g, ''))
  const tenor = parseInt(formData.get('tenor_bulan') as string)

  const parsed = AjukanPinjamanSchema.safeParse({
    nominal,
    tenor_bulan: tenor,
    catatan_pengaju: formData.get('catatan_pengaju') as string,
  })

  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? 'Validasi gagal'
    redirect(`/dashboard/pinjaman/ajukan?error=${encodeURIComponent(msg)}`)
  }

  const supabase = await createClient()

  // 1. Cek pinjaman aktif / status top up
  const pinjamanAktif = await getPinjamanAktifAnggota(session.id)
  
  let sisaPelunasanLama = 0
  let catatanTopUp = ''

  if (pinjamanAktif.length > 0) {
    const pinjamanSekarang = pinjamanAktif[0]

    if (['PENDING_L1', 'PENDING_L2', 'PENDING_L3', 'APPROVED'].includes(pinjamanSekarang.status)) {
      redirect(`/dashboard/pinjaman/ajukan?error=${encodeURIComponent('Anda masih memiliki pengajuan pinjaman yang sedang diproses.')}`)
    }

    if (pinjamanSekarang.status === 'ACTIVE') {
      const { data: cicilanBelumLunas } = await supabase
        .from('cicilan_pinjaman')
        .select('nominal_cicilan')
        .eq('pinjaman_id', pinjamanSekarang.id)
        .in('status', ['SCHEDULED', 'OVERDUE'])

      const jumlahSisaBulan = cicilanBelumLunas?.length || 0

      // Batas Refinancing: Maksimal sisa 3 bulan
      if (jumlahSisaBulan > 3) {
        redirect(`/dashboard/pinjaman/ajukan?error=${encodeURIComponent(`Pengajuan ditolak. Sisa cicilan Anda masih ${jumlahSisaBulan} kali. Top-Up hanya berlaku jika sisa cicilan maksimal 3 kali.`)}`)
      }

      sisaPelunasanLama = cicilanBelumLunas?.reduce((total, item) => total + Number(item.nominal_cicilan), 0) || 0
      catatanTopUp = `\n\n[SISTEM TOP-UP] Dana pencairan ini akan dipotong otomatis sebesar Rp ${sisaPelunasanLama.toLocaleString('id-ID')} untuk melunasi Pinjaman ID #${pinjamanSekarang.id}.`
    }
  }

  // 2. Kalkulasi Pinjaman
  const { biayaAdmin, totalDiterima, cicilanPerBulan } = await hitungPinjaman(nominal, tenor)
  const totalDiterimaBersih = totalDiterima - sisaPelunasanLama

  if (totalDiterimaBersih <= 0) {
    redirect(`/dashboard/pinjaman/ajukan?error=${encodeURIComponent('Nominal pengajuan terlalu kecil untuk menutupi potongan sisa pinjaman lama.')}`)
  }

  const catatanFinal = ((parsed.data.catatan_pengaju ?? '').trim() + catatanTopUp).trim()

  // 3. Insert ke database
  const { data: pinjaman, error } = await supabase
    .from('pinjaman')
    .insert({
      user_id: session.id,
      nominal,
      biaya_admin: biayaAdmin,
      total_diterima: totalDiterimaBersih,
      tenor_bulan: tenor,
      cicilan_per_bulan: cicilanPerBulan,
      status: 'PENDING_L1',
      tanggal_pengajuan: new Date().toISOString().split('T')[0],
      catatan_pengaju: catatanFinal || null,
    })
    .select()
    .single()

  if (error || !pinjaman) {
    redirect(`/dashboard/pinjaman/ajukan?error=${encodeURIComponent('Gagal mengajukan pinjaman: ' + (error?.message ?? ''))}`)
  }

  revalidatePath('/dashboard/pinjaman')
  redirect(`/dashboard/pinjaman/${pinjaman.id}?success=${encodeURIComponent('Pengajuan pinjaman berhasil dikirim')}`)
}

// ─── ACTION: Approve / Reject Pinjaman ───────────────────────────────────────

export async function approvePinjaman(formData: FormData) {
  const session = await requireRole(['SEKRETARIS', 'BENDAHARA', 'KETUA'])

  const pinjamanId = parseInt(formData.get('pinjaman_id') as string)
  const action = formData.get('action') as 'approve' | 'reject'
  const catatan = (formData.get('catatan') as string) ?? ''

  const supabase = await createClient()

  const { data: pinjaman, error: fetchError } = await supabase
    .from('pinjaman')
    .select('*')
    .eq('id', pinjamanId)
    .single()

  if (fetchError || !pinjaman) {
    redirect(`/dashboard/pinjaman/${pinjamanId}?error=${encodeURIComponent('Pinjaman tidak ditemukan')}`)
  }

  const role = session.role

  const validApprovals: Record<string, string[]> = {
    SEKRETARIS: ['PENDING_L1'],
    BENDAHARA: ['PENDING_L2'],
    KETUA: ['PENDING_L3'],
  }

  if (!validApprovals[role]?.includes(pinjaman.status)) {
    redirect(`/dashboard/pinjaman/${pinjamanId}?error=${encodeURIComponent('Anda tidak berwenang melakukan aksi ini')}`)
  }

  let updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (action === 'reject') {
    if (!catatan.trim()) {
      redirect(`/dashboard/pinjaman/${pinjamanId}?error=${encodeURIComponent('Alasan penolakan wajib diisi')}`)
    }
    updateData = {
      ...updateData,
      status: 'REJECTED',
      rejected_reason: catatan.trim(),
    }
  } else {
    const nextStatus: Record<string, PinjamanStatus> = {
      PENDING_L1: 'PENDING_L2',
      PENDING_L2: 'PENDING_L3',
      PENDING_L3: 'APPROVED',
    }

    const levelFields: Record<string, Record<string, unknown>> = {
      PENDING_L1: {
        approved_l1_by: session.id,
        approved_l1_at: new Date().toISOString(),
        catatan_l1: catatan.trim() || null,
      },
      PENDING_L2: {
        approved_l2_by: session.id,
        approved_l2_at: new Date().toISOString(),
        catatan_l2: catatan.trim() || null,
      },
      PENDING_L3: {
        approved_l3_by: session.id,
        approved_l3_at: new Date().toISOString(),
        catatan_l3: catatan.trim() || null,
        tanggal_disetujui: new Date().toISOString().split('T')[0],
      },
    }

    updateData = {
      ...updateData,
      status: nextStatus[pinjaman.status],
      ...levelFields[pinjaman.status],
    }
  }

  const { error: updateError } = await supabase
    .from('pinjaman')
    .update(updateData)
    .eq('id', pinjamanId)

  if (updateError) {
    redirect(`/dashboard/pinjaman/${pinjamanId}?error=${encodeURIComponent('Gagal update status: ' + updateError.message)}`)
  }

  revalidatePath('/dashboard/pinjaman')
  revalidatePath(`/dashboard/pinjaman/${pinjamanId}`)

  const msg = action === 'approve' ? 'Pinjaman berhasil disetujui' : 'Pinjaman berhasil ditolak'
  redirect(`/dashboard/pinjaman/${pinjamanId}?success=${encodeURIComponent(msg)}`)
}

// ─── ACTION: Cairkan Pinjaman & Eksekusi Pelunasan Top-Up ─────────────────────

export async function cairkanPinjaman(formData: FormData) {
  const session = await requireRole(['BENDAHARA'])

  const pinjamanId = parseInt(formData.get('pinjaman_id') as string)
  const tanggalCairan = formData.get('tanggal_pencairan') as string

  const supabase = await createClient()

  const { data: pinjaman, error: fetchError } = await supabase
    .from('pinjaman')
    .select('*')
    .eq('id', pinjamanId)
    .single()

  if (fetchError || !pinjaman || pinjaman.status !== 'APPROVED') {
    redirect(`/dashboard/pinjaman/${pinjamanId}?error=${encodeURIComponent('Pinjaman tidak dapat dicairkan')}`)
  }

  const tanggalMulai = tanggalCairan ? new Date(tanggalCairan) : new Date()
  const tanggalJatuhTempo = new Date(tanggalMulai)
  tanggalJatuhTempo.setMonth(tanggalJatuhTempo.getMonth() + pinjaman.tenor_bulan)

  // 1. Update status pinjaman baru menjadi ACTIVE
  const { error: updateError } = await supabase
    .from('pinjaman')
    .update({
      status: 'ACTIVE',
      tanggal_pencairan: tanggalMulai.toISOString().split('T')[0],
      tanggal_jatuh_tempo: tanggalJatuhTempo.toISOString().split('T')[0],
      disbursed_by: session.id,
      disbursed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', pinjamanId)

  if (updateError) {
    redirect(`/dashboard/pinjaman/${pinjamanId}?error=${encodeURIComponent('Gagal mencairkan pinjaman: ' + updateError.message)}`)
  }

  // 2. Generate jadwal cicilan baru
  const jadwal = generateJadwalCicilan(
    pinjamanId,
    pinjaman.nominal,
    pinjaman.tenor_bulan,
    pinjaman.cicilan_per_bulan,
    tanggalMulai
  )

  const { error: cicilanError } = await supabase.from('cicilan_pinjaman').insert(jadwal)

  if (cicilanError) {
    await supabase.from('pinjaman').update({ status: 'APPROVED' }).eq('id', pinjamanId)
    redirect(`/dashboard/pinjaman/${pinjamanId}?error=${encodeURIComponent('Gagal generate jadwal cicilan: ' + cicilanError.message)}`)
  }

  // 3. AUTO-SETTLEMENT TOP-UP: Tutup pinjaman lama jika ada
  const { data: pinjamanLama } = await supabase
    .from('pinjaman')
    .select('id')
    .eq('user_id', pinjaman.user_id)
    .eq('status', 'ACTIVE')
    .neq('id', pinjamanId)

  if (pinjamanLama && pinjamanLama.length > 0) {
    const oldLoanId = pinjamanLama[0].id

    await supabase
      .from('cicilan_pinjaman')
      .update({
        status: 'PAID',
        tanggal_pembayaran: tanggalMulai.toISOString().split('T')[0],
      })
      .eq('pinjaman_id', oldLoanId)
      .in('status', ['SCHEDULED', 'OVERDUE'])

    await supabase
      .from('pinjaman')
      .update({ status: 'LUNAS', updated_at: new Date().toISOString() })
      .eq('id', oldLoanId)
  }

  revalidatePath('/dashboard/pinjaman')
  revalidatePath(`/dashboard/pinjaman/${pinjamanId}`)
  redirect(`/dashboard/pinjaman/${pinjamanId}?success=${encodeURIComponent('Pencairan berhasil! Jadwal cicilan dibuat (dan pelunasan Top-Up dieksekusi jika ada).')}`)
}

// ─── ACTION: Bayar Cicilan (Bulanan) ──────────────────────────────────────────

export async function bayarCicilan(formData: FormData) {
  const session = await requireRole(['BENDAHARA', 'SUPERADMIN'])

  const cicilanId = parseInt(formData.get('cicilan_id') as string)
  const pinjamanId = parseInt(formData.get('pinjaman_id') as string)
  const tanggalBayar = (formData.get('tanggal_pembayaran') as string) || new Date().toISOString().split('T')[0]

  const supabase = await createClient()

  const { error: cicilanError } = await supabase
    .from('cicilan_pinjaman')
    .update({
      status: 'PAID',
      tanggal_pembayaran: tanggalBayar,
    })
    .eq('id', cicilanId)
    .eq('pinjaman_id', pinjamanId)

  if (cicilanError) {
    redirect(`/dashboard/pinjaman/${pinjamanId}?error=${encodeURIComponent('Gagal input pembayaran: ' + cicilanError.message)}`)
  }

  const { data: cicilan } = await supabase
    .from('cicilan_pinjaman')
    .select('status')
    .eq('pinjaman_id', pinjamanId)

  const semuaLunas = cicilan?.every((c) => c.status === 'PAID' || c.status === 'WAIVED')

  if (semuaLunas) {
    await supabase
      .from('pinjaman')
      .update({ status: 'LUNAS', updated_at: new Date().toISOString() })
      .eq('id', pinjamanId)
  }

  revalidatePath(`/dashboard/pinjaman/${pinjamanId}`)
  revalidatePath('/dashboard/pinjaman')
  redirect(`/dashboard/pinjaman/${pinjamanId}?success=${encodeURIComponent('Pembayaran cicilan berhasil dicatat')}`)
}

// ─── ACTION: Pelunasan Pinjaman Langsung (Sekaligus) ──────────────────────────

export async function pelunasanPinjamanSekaligus(formData: FormData) {
  const session = await requireRole(['BENDAHARA', 'SUPERADMIN'])

  const pinjamanId = parseInt(formData.get('pinjaman_id') as string)
  const tanggalPelunasan = (formData.get('tanggal_pembayaran') as string) || new Date().toISOString().split('T')[0]
  const buktiTransfer = formData.get('catatan') as string 

  const supabase = await createClient()

  const { data: pinjaman, error: fetchError } = await supabase
    .from('pinjaman')
    .select('status')
    .eq('id', pinjamanId)
    .single()

  if (fetchError || !pinjaman || pinjaman.status !== 'ACTIVE') {
    redirect(`/dashboard/pinjaman/${pinjamanId}?error=${encodeURIComponent('Pinjaman tidak dapat dilunasi. Pastikan statusnya Aktif.')}`)
  }

  const { error: cicilanError } = await supabase
    .from('cicilan_pinjaman')
    .update({
      status: 'PAID',
      tanggal_pembayaran: tanggalPelunasan,
    })
    .eq('pinjaman_id', pinjamanId)
    .in('status', ['SCHEDULED', 'OVERDUE'])

  if (cicilanError) {
    redirect(`/dashboard/pinjaman/${pinjamanId}?error=${encodeURIComponent('Gagal memperbarui status cicilan: ' + cicilanError.message)}`)
  }

  let catatanTambahan = '\n[PELUNASAN DIPERCEPAT]'
  if (buktiTransfer) catatanTambahan += ` Catatan: ${buktiTransfer.trim()}`

  const { error: lunasError } = await supabase
    .from('pinjaman')
    .update({ 
      status: 'LUNAS', 
      updated_at: new Date().toISOString()
    })
    .eq('id', pinjamanId)

  if (lunasError) {
    redirect(`/dashboard/pinjaman/${pinjamanId}?error=${encodeURIComponent('Gagal menutup status pinjaman: ' + lunasError.message)}`)
  }

  revalidatePath(`/dashboard/pinjaman/${pinjamanId}`)
  revalidatePath('/dashboard/pinjaman')
  redirect(`/dashboard/pinjaman/${pinjamanId}?success=${encodeURIComponent('Pelunasan pinjaman berhasil diproses. Status pinjaman sekarang LUNAS.')}`)
}

// ─── ACTION: Input Pinjaman Existing (Migrasi) ────────────────────────────────

const PinjamanExistingSchema = z.object({
  user_id: z.string().uuid('User ID tidak valid'),
  nominal: z.number().min(1),
  tenor_bulan: z.number().min(1).max(36),
  cicilan_terbayar: z.number().min(0),
  tanggal_pencairan: z.string().min(1, 'Tanggal pencairan wajib diisi'),
  catatan: z.string().optional(),
})

export async function inputPinjamanExisting(formData: FormData) {
  const session = await requireRole(['BENDAHARA', 'SUPERADMIN'])

  const nominalRaw = (formData.get('nominal') as string) ?? ''
  const nominal = parseInt(nominalRaw.replace(/\D/g, ''))
  const tenor = parseInt(formData.get('tenor_bulan') as string)
  const cicilan_terbayar = parseInt(formData.get('cicilan_terbayar') as string) || 0
  const tanggal_pencairan = formData.get('tanggal_pencairan') as string

  const parsed = PinjamanExistingSchema.safeParse({
    user_id: formData.get('user_id') as string,
    nominal,
    tenor_bulan: tenor,
    cicilan_terbayar,
    tanggal_pencairan,
    catatan: formData.get('catatan') as string,
  })

  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? 'Validasi gagal'
    redirect(`/dashboard/pinjaman/existing?error=${encodeURIComponent(msg)}`)
  }

  const { biayaAdmin, totalDiterima, cicilanPerBulan
