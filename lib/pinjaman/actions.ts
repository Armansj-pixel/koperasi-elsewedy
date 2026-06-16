'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'
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
  const biayaAdmin = Math.round(nominal * 0.04)
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

    // Cicilan terakhir = sisa pokok (menghindari selisih pembulatan)
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

  // Query pinjaman
  let query = supabase
    .from('pinjaman')
    .select('*')
    .order('created_at', { ascending: false })

  if (filter?.status) query = query.eq('status', filter.status)
  if (filter?.userId) query = query.eq('user_id', filter.userId)

  const { data: pinjaman, error } = await query

  if (error) return { data: [], error: error.message }

  // Query users terpisah (hindari FK cache issue)
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

  // Ambil data user
  const { data: user } = await supabase
    .from('users')
    .select('id, nama, nik, no_hp, simpanan_bulanan')
    .eq('id', pinjaman.user_id)
    .single()

  // Ambil cicilan
  const { data: cicilan } = await supabase
    .from('cicilan_pinjaman')
    .select('*')
    .eq('pinjaman_id', id)
    .order('nomor_cicilan', { ascending: true })

  // Ambil nama approver (jika ada)
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

// ─── ACTION: Ajukan Pinjaman ──────────────────────────────────────────────────

const AjukanPinjamanSchema = z.object({
  nominal: z.number().min(100000, 'Minimal pinjaman Rp 100.000').max(50000000, 'Maksimal pinjaman Rp 50.000.000'),
  tenor_bulan: z.number().min(1).max(36),
  catatan_pengaju: z.string().optional(),
})

export async function ajukanPinjaman(formData: FormData) {
  const session = await getSession()
  if (!session) redirect('/login')

  const nominal = parseInt(formData.get('nominal') as string)
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

  // Cek pinjaman aktif
  const pinjamanAktif = await getPinjamanAktifAnggota(session.userId)
  if (pinjamanAktif.length > 0) {
    redirect(`/dashboard/pinjaman/ajukan?error=${encodeURIComponent('Anda masih memiliki pinjaman aktif atau dalam proses persetujuan')}`)
  }

  const { biayaAdmin, totalDiterima, cicilanPerBulan } = await hitungPinjaman(nominal, tenor)

  const supabase = await createClient()

  const { data: pinjaman, error } = await supabase
    .from('pinjaman')
    .insert({
      user_id: session.userId,
      nominal,
      biaya_admin: biayaAdmin,
      total_diterima: totalDiterima,
      tenor_bulan: tenor,
      cicilan_per_bulan: cicilanPerBulan,
      status: 'PENDING_L1',
      tanggal_pengajuan: new Date().toISOString().split('T')[0],
      catatan_pengaju: (parsed.data.catatan_pengaju ?? '').trim() || null,
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
  const session = await getSession()
  if (!session) redirect('/login')

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

  // Validasi role vs status
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
    // Approve: tentukan next status
    const nextStatus: Record<string, PinjamanStatus> = {
      PENDING_L1: 'PENDING_L2',
      PENDING_L2: 'PENDING_L3',
      PENDING_L3: 'APPROVED',
    }

    const levelFields: Record<string, Record<string, unknown>> = {
      PENDING_L1: {
        approved_l1_by: session.userId,
        approved_l1_at: new Date().toISOString(),
        catatan_l1: catatan.trim() || null,
      },
      PENDING_L2: {
        approved_l2_by: session.userId,
        approved_l2_at: new Date().toISOString(),
        catatan_l2: catatan.trim() || null,
      },
      PENDING_L3: {
        approved_l3_by: session.userId,
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

// ─── ACTION: Cairkan Pinjaman ─────────────────────────────────────────────────

export async function cairkanPinjaman(formData: FormData) {
  const session = await getSession()
  if (!session || session.role !== 'BENDAHARA') redirect('/login')

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

  // Update status pinjaman
  const { error: updateError } = await supabase
    .from('pinjaman')
    .update({
      status: 'ACTIVE',
      tanggal_pencairan: tanggalMulai.toISOString().split('T')[0],
      tanggal_jatuh_tempo: tanggalJatuhTempo.toISOString().split('T')[0],
      disbursed_by: session.userId,
      disbursed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', pinjamanId)

  if (updateError) {
    redirect(`/dashboard/pinjaman/${pinjamanId}?error=${encodeURIComponent('Gagal mencairkan pinjaman: ' + updateError.message)}`)
  }

  // Generate jadwal cicilan
  const jadwal = generateJadwalCicilan(
    pinjamanId,
    pinjaman.nominal,
    pinjaman.tenor_bulan,
    pinjaman.cicilan_per_bulan,
    tanggalMulai
  )

  const { error: cicilanError } = await supabase.from('cicilan_pinjaman').insert(jadwal)

  if (cicilanError) {
    // Rollback status pinjaman
    await supabase.from('pinjaman').update({ status: 'APPROVED' }).eq('id', pinjamanId)
    redirect(`/dashboard/pinjaman/${pinjamanId}?error=${encodeURIComponent('Gagal generate jadwal cicilan: ' + cicilanError.message)}`)
  }

  revalidatePath('/dashboard/pinjaman')
  revalidatePath(`/dashboard/pinjaman/${pinjamanId}`)
  redirect(`/dashboard/pinjaman/${pinjamanId}?success=${encodeURIComponent('Pinjaman berhasil dicairkan dan jadwal cicilan dibuat')}`)
}

// ─── ACTION: Bayar Cicilan ────────────────────────────────────────────────────

export async function bayarCicilan(formData: FormData) {
  const session = await getSession()
  if (!session) redirect('/login')

  const cicilanId = parseInt(formData.get('cicilan_id') as string)
  const pinjamanId = parseInt(formData.get('pinjaman_id') as string)
  const tanggalBayar = (formData.get('tanggal_pembayaran') as string) || new Date().toISOString().split('T')[0]

  const supabase = await createClient()

  // Update cicilan
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

  // Cek apakah semua cicilan sudah lunas
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
  const session = await getSession()
  if (!session || !['BENDAHARA', 'SUPERADMIN'].includes(session.role)) {
    redirect('/login')
  }

  const nominal = parseInt(formData.get('nominal') as string)
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

  const { biayaAdmin, totalDiterima, cicilanPerBulan } = await hitungPinjaman(nominal, tenor)
  const tanggalCairan = new Date(tanggal_pencairan)
  const tanggalJatuhTempo = new Date(tanggalCairan)
  tanggalJatuhTempo.setMonth(tanggalJatuhTempo.getMonth() + tenor)

  const supabase = await createClient()

  // Insert pinjaman dengan status ACTIVE
  const { data: pinjaman, error } = await supabase
    .from('pinjaman')
    .insert({
      user_id: parsed.data.user_id,
      nominal,
      biaya_admin: biayaAdmin,
      total_diterima: totalDiterima,
      tenor_bulan: tenor,
      cicilan_per_bulan: cicilanPerBulan,
      status: cicilan_terbayar >= tenor ? 'LUNAS' : 'ACTIVE',
      tanggal_pengajuan: tanggal_pencairan,
      tanggal_disetujui: tanggal_pencairan,
      tanggal_pencairan: tanggal_pencairan,
      tanggal_jatuh_tempo: tanggalJatuhTempo.toISOString().split('T')[0],
      disbursed_by: session.userId,
      disbursed_at: new Date().toISOString(),
      catatan_pengaju: `[MIGRASI] ${parsed.data.catatan ?? ''}`.trim(),
    })
    .select()
    .single()

  if (error || !pinjaman) {
    redirect(`/dashboard/pinjaman/existing?error=${encodeURIComponent('Gagal input pinjaman: ' + (error?.message ?? ''))}`)
  }

  // Generate jadwal cicilan
  const jadwal = generateJadwalCicilan(
    pinjaman.id,
    nominal,
    tenor,
    cicilanPerBulan,
    tanggalCairan
  )

  // Tandai cicilan yang sudah terbayar
  const jadwalWithStatus = jadwal.map((c, i) => ({
    ...c,
    status: i < cicilan_terbayar ? ('PAID' as CicilanStatus) : ('SCHEDULED' as CicilanStatus),
    tanggal_pembayaran: i < cicilan_terbayar ? tanggal_pencairan : null,
  }))

  await supabase.from('cicilan_pinjaman').insert(jadwalWithStatus)

  revalidatePath('/dashboard/pinjaman')
  redirect(`/dashboard/pinjaman/${pinjaman.id}?success=${encodeURIComponent('Data pinjaman existing berhasil diinput')}`)
}

// ─── GET: Statistik Pinjaman ──────────────────────────────────────────────────

export async function getStatistikPinjaman() {
  const supabase = await createClient()

  const { data: pinjaman } = await supabase
    .from('pinjaman')
    .select('nominal, status, cicilan_per_bulan')

  if (!pinjaman) return { total: 0, aktif: 0, pending: 0, lunas: 0, totalOutstanding: 0 }

  const aktif = pinjaman.filter((p) => p.status === 'ACTIVE')
  const pending = pinjaman.filter((p) =>
    ['PENDING_L1', 'PENDING_L2', 'PENDING_L3', 'APPROVED'].includes(p.status)
  )
  const lunas = pinjaman.filter((p) => p.status === 'LUNAS')

  return {
    total: pinjaman.length,
    aktif: aktif.length,
    pending: pending.length,
    lunas: lunas.length,
    totalOutstanding: aktif.reduce((sum, p) => sum + (p.nominal ?? 0), 0),
    totalCicilanBulanan: aktif.reduce((sum, p) => sum + (p.cicilan_per_bulan ?? 0), 0),
  }
}
