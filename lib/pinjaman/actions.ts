'use server'

import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { buatJurnalUmum, generateNomorBukti, generateNomorKontrak } from '@/lib/akuntansi/actions'
import {
  notifPencairanPinjaman,
  notifStatusPinjaman,
  notifPinjamanLunas,
  notifPengajuanDiterima,
} from '@/lib/notification/whatsapp'

// ─── Types ────────────────────────────────────────────────────────────────────
export type PinjamanStatus =
  | 'PENDING_L1' | 'PENDING_L2' | 'PENDING_L3'
  | 'APPROVED' | 'DISBURSED' | 'ACTIVE'
  | 'LUNAS' | 'REJECTED' | 'CANCELLED'

export type CicilanStatus = 'SCHEDULED' | 'PAID' | 'OVERDUE' | 'WAIVED'

export interface Pinjaman {
  id: number
  user_id: string
  nomor_kontrak: string
  nominal_pokok: number
  biaya_admin: number
  pelunasan_pinjaman_lama_id: number | null
  pelunasan_pinjaman_lama: number | null
  nominal_diterima: number
  tenor_bulan: number
  cicilan_per_bulan: number
  sisa_pokok: number
  sisa_cicilan: number
  cicilan_mulai_periode: string
  status: PinjamanStatus
  tujuan: string
  tanggal_pengajuan: string | null
  tanggal_cair: string | null
  tanggal_lunas: string | null
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

export interface PinjamanWithUser extends Partial<Pinjaman> {
  user_nama: string
  user_nik: string
  user_no_hp?: string
  user_bank?: string
  user_nomor_rekening?: string
  nominal: number
  total_diterima: number
  tanggal_pencairan: string | null
  sisa_cicilan_kali?: number
  sisa_outstanding?: number
}

// ─── Kalkulasi ────────────────────────────────────────────────────────────────
/**
 * PRODUK: Qardh (Pinjaman Kebajikan Koperasi Syariah)
 * - Cicilan per bulan = Pokok / Tenor (murni pokok, TANPA bunga/margin bulanan)
 * - Pendapatan koperasi = Biaya Admin 4% flat, dipotong di awal pencairan
 * - Pokok hutang = Plafon penuh (bukan plafon dikurangi admin)
 */
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
  const day = tanggalMulai.getDate()
  let startMonth = tanggalMulai.getMonth()
  const startYear = tanggalMulai.getFullYear()

  if (day > 10) startMonth += 1

  for (let i = 1; i <= tenor; i++) {
    const jatuhTempo = new Date(startYear, startMonth + (i - 1), 25)
    const nominalCicilan = i === tenor ? sisaPokok : cicilanPerBulan
    sisaPokok -= nominalCicilan

    const yyyy = jatuhTempo.getFullYear()
    const mm = String(jatuhTempo.getMonth() + 1).padStart(2, '0')
    const dd = String(jatuhTempo.getDate()).padStart(2, '0')

    cicilan.push({
      pinjaman_id: pinjamanId,
      nomor_cicilan: i,
      nominal_cicilan: nominalCicilan,
      tanggal_jatuh_tempo: `${yyyy}-${mm}-${dd}`,
      status: 'SCHEDULED' as CicilanStatus,
      created_at: new Date().toISOString(),
    })
  }
  return cicilan
}

// ─── HELPER: Ambil no_hp user ─────────────────────────────────────────────────
async function getUserNoHp(supabase: any, userId: string): Promise<{ nama: string; no_hp: string } | null> {
  const { data } = await supabase
    .from('users').select('nama, no_hp').eq('id', userId).single()
  return data ?? null
}

// ─── GET: List Pinjaman ───────────────────────────────────────────────────────
export async function getPinjamanList(filter?: { status?: PinjamanStatus; userId?: string }) {
  const supabase = await createClient()

  let query = supabase.from('pinjaman').select('*').order('created_at', { ascending: false })
  if (filter?.status) query = query.eq('status', filter.status)
  if (filter?.userId) query = query.eq('user_id', filter.userId)

  const { data: pinjaman, error } = await query
  if (error) return { data: [], error: error.message }

  const userIds = [...new Set(pinjaman?.map((p) => p.user_id) ?? [])]
  const { data: users } = await supabase.from('users').select('id, nama, nik').in('id', userIds)
  const userMap = new Map(users?.map((u) => [u.id, u]) ?? [])

  const { data: unpaid } = await supabase
    .from('cicilan_pinjaman').select('pinjaman_id').in('status', ['SCHEDULED', 'OVERDUE'])
  const countMap: Record<number, number> = {}
  unpaid?.forEach((c) => { countMap[c.pinjaman_id] = (countMap[c.pinjaman_id] || 0) + 1 })

  const result: PinjamanWithUser[] = (pinjaman ?? []).map((p) => {
    const sisaKali = countMap[p.id] || 0
    return {
      ...p,
      nominal: p.nominal_pokok,
      total_diterima: p.nominal_diterima,
      tanggal_pencairan: p.tanggal_cair,
      user_nama: userMap.get(p.user_id)?.nama ?? 'Unknown',
      user_nik: userMap.get(p.user_id)?.nik ?? '-',
      sisa_cicilan_kali: sisaKali,
      sisa_outstanding: p.status === 'ACTIVE' ? sisaKali * (Number(p.cicilan_per_bulan) || 0) : 0,
    }
  })
  return { data: result, error: null }
}

// ─── GET: Detail Pinjaman ─────────────────────────────────────────────────────
export async function getPinjamanDetail(id: number) {
  const supabase = await createClient()

  const { data: pinjaman, error: fetchError } = await supabase
    .from('pinjaman').select('*').eq('id', id).single()
  if (fetchError || !pinjaman) return { data: null, cicilan: [], error: fetchError?.message ?? 'Not found' }

  const { data: user } = await supabase.from('users').select('*').eq('id', pinjaman.user_id).single()
  const { data: cicilan } = await supabase
    .from('cicilan_pinjaman').select('*').eq('pinjaman_id', id).order('nomor_cicilan', { ascending: true })

  const approverIds = [
    pinjaman.approved_l1_by, pinjaman.approved_l2_by,
    pinjaman.approved_l3_by, pinjaman.disbursed_by,
  ].filter(Boolean) as string[]

  let approverMap = new Map<string, string>()
  if (approverIds.length > 0) {
    const { data: approvers } = await supabase.from('users').select('id, nama').in('id', approverIds)
    approverMap = new Map(approvers?.map((a) => [a.id, a.nama]) ?? [])
  }

  const cicilanBelumLunas = cicilan?.filter((c) => c.status === 'SCHEDULED' || c.status === 'OVERDUE') || []
  const sisaKali = cicilanBelumLunas.length

  return {
    data: {
      ...pinjaman,
      nominal: pinjaman.nominal_pokok,
      total_diterima: pinjaman.nominal_diterima,
      tanggal_pencairan: pinjaman.tanggal_cair,
      user_nama: user?.nama ?? 'Unknown',
      user_nik: user?.nik ?? '-',
      user_no_hp: user?.no_hp ?? '-',
      user_bank: user?.nama_bank ?? '-',
      user_nomor_rekening: user?.no_rekening ?? '-',
      user_simpanan_bulanan: 0,
      nama_l1: pinjaman.approved_l1_by ? approverMap.get(pinjaman.approved_l1_by) ?? '-' : null,
      nama_l2: pinjaman.approved_l2_by ? approverMap.get(pinjaman.approved_l2_by) ?? '-' : null,
      nama_l3: pinjaman.approved_l3_by ? approverMap.get(pinjaman.approved_l3_by) ?? '-' : null,
      nama_disbursed: pinjaman.disbursed_by ? approverMap.get(pinjaman.disbursed_by) ?? '-' : null,
      sisa_cicilan_kali: sisaKali,
      sisa_outstanding: pinjaman.status === 'ACTIVE' ? sisaKali * (Number(pinjaman.cicilan_per_bulan) || 0) : 0,
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
    .select('id, nominal:nominal_pokok, tenor_bulan, cicilan_per_bulan, status, tanggal_pengajuan')
    .eq('user_id', userId)
    .in('status', ['PENDING_L1', 'PENDING_L2', 'PENDING_L3', 'APPROVED', 'DISBURSED', 'ACTIVE'])
    .order('created_at', { ascending: false })
  return data ?? []
}

// ─── ACTION: Ajukan Pinjaman ──────────────────────────────────────────────────
const AjukanPinjamanSchema = z.object({
  user_id: z.string().uuid().optional(),
  nominal: z.number().min(100000, 'Minimal pinjaman Rp 100.000').max(15000000, 'Maksimal pinjaman Rp 15.000.000'),
  tenor_bulan: z.number().min(1).max(12),
  catatan_pengaju: z.string().min(5, 'Kolom keperluan pinjaman wajib diisi secara detail!'),
  custom_biaya_admin: z.number().min(0).optional(),
  custom_cicilan_per_bulan: z.number().min(0).optional(),
})

export async function ajukanPinjaman(formData: FormData) {
  const session = await requireRole(['ANGGOTA', 'BENDAHARA', 'SUPERADMIN'])
  const canOverride = ['BENDAHARA', 'SUPERADMIN'].includes(session.role)

  const nominalRaw = (formData.get('nominal') as string) ?? ''
  const nominal = parseInt(nominalRaw.replace(/\D/g, ''))
  const tenor = parseInt(formData.get('tenor_bulan') as string)
  const inputUserId = formData.get('user_id') as string | null

  const parsed = AjukanPinjamanSchema.safeParse({
    user_id: inputUserId || undefined,
    nominal,
    tenor_bulan: tenor,
    catatan_pengaju: formData.get('catatan_pengaju') as string,
    custom_biaya_admin: formData.get('custom_biaya_admin') ? parseInt(formData.get('custom_biaya_admin') as string) : undefined,
    custom_cicilan_per_bulan: formData.get('custom_cicilan_per_bulan') ? parseInt(formData.get('custom_cicilan_per_bulan') as string) : undefined,
  })

  if (!parsed.success) {
    redirect(`/dashboard/pinjaman/ajukan?error=${encodeURIComponent(parsed.error.errors[0]?.message ?? 'Validasi gagal')}`)
  }

  const targetUserId = canOverride && parsed.data.user_id ? parsed.data.user_id : session.id
  const supabase = await createClient()
  const pinjamanAktif = await getPinjamanAktifAnggota(targetUserId)

  let sisaPelunasanLama = 0
  let idPinjamanLamaLunas: number | null = null
  let catatanTopUp = ''

  if (pinjamanAktif.length > 0) {
    const pinjamanSekarang = pinjamanAktif[0]

    if (['PENDING_L1', 'PENDING_L2', 'PENDING_L3', 'APPROVED'].includes(pinjamanSekarang.status)) {
      redirect(`/dashboard/pinjaman/ajukan?error=${encodeURIComponent('Masih ada pengajuan pinjaman yang sedang diproses.')}`)
    }

    if (pinjamanSekarang.status === 'ACTIVE') {
      const { data: cicilanBelumLunas } = await supabase
        .from('cicilan_pinjaman')
        .select('nominal_cicilan')
        .eq('pinjaman_id', pinjamanSekarang.id)
        .in('status', ['SCHEDULED', 'OVERDUE'])

      const jumlahSisaBulan = cicilanBelumLunas?.length || 0

      if (!canOverride && jumlahSisaBulan > 3) {
        redirect(`/dashboard/pinjaman/ajukan?error=${encodeURIComponent(`Ditolak. Top-Up reguler maks sisa 3x. Sisa cicilan: ${jumlahSisaBulan}x.`)}`)
      }

      sisaPelunasanLama = cicilanBelumLunas?.reduce((t, c) => t + Number(c.nominal_cicilan), 0) || 0
      idPinjamanLamaLunas = pinjamanSekarang.id
      catatanTopUp = `\n\n[SISTEM TOP-UP] Dipotong otomatis Rp ${sisaPelunasanLama.toLocaleString('id-ID')} untuk pelunasan kontrak lama.`

      if (jumlahSisaBulan > 3 && canOverride) {
        catatanTopUp += `\n[URGENCY OVERRIDE] Limit bypass dieksekusi oleh ${session.role} (sisa sebelumnya: ${jumlahSisaBulan}x).`
      }
    }
  }

  let { biayaAdmin, totalDiterima, cicilanPerBulan } = await hitungPinjaman(nominal, tenor)

  if (canOverride) {
    if (parsed.data.custom_biaya_admin !== undefined) {
      biayaAdmin = parsed.data.custom_biaya_admin
      totalDiterima = nominal - biayaAdmin
    }
    if (parsed.data.custom_cicilan_per_bulan !== undefined) {
      cicilanPerBulan = parsed.data.custom_cicilan_per_bulan
    }
  }

  const totalDiterimaBersih = totalDiterima - sisaPelunasanLama

  if (totalDiterimaBersih <= 0) {
    redirect(`/dashboard/pinjaman/ajukan?error=${encodeURIComponent('Nominal pencairan bersih terlalu kecil untuk menutupi sisa pinjaman lama.')}`)
  }

  const catatanFinal = ((parsed.data.catatan_pengaju ?? '').trim() + catatanTopUp).trim()
  const nomorKontrak = await generateNomorKontrak(new Date().toISOString().split('T')[0])

  const { data: pinjaman, error } = await supabase.from('pinjaman').insert({
    user_id: targetUserId,
    nomor_kontrak: nomorKontrak,
    nominal_pokok: nominal,
    biaya_admin: biayaAdmin,
    pelunasan_pinjaman_lama_id: idPinjamanLamaLunas,
    pelunasan_pinjaman_lama: sisaPelunasanLama > 0 ? sisaPelunasanLama : null,
    nominal_diterima: totalDiterimaBersih,
    tenor_bulan: tenor,
    cicilan_per_bulan: cicilanPerBulan,
    sisa_pokok: nominal,
    sisa_cicilan: tenor,
    cicilan_mulai_periode: new Date().toISOString().slice(0, 7),
    tujuan: (parsed.data.catatan_pengaju || 'Pinjaman Reguler').trim(),
    status: 'PENDING_L1',
    tanggal_pengajuan: new Date().toISOString(),
    catatan_pengaju: catatanFinal || null,
  }).select().single()

  if (error || !pinjaman) {
    redirect(`/dashboard/pinjaman/ajukan?error=${encodeURIComponent('Gagal mengajukan: ' + (error?.message ?? ''))}`)
  }

  revalidatePath('/dashboard/pinjaman')

  // ── NOTIFIKASI WA — Pengajuan Diterima ───────────────────────────
  const userNotif = await getUserNoHp(supabase, targetUserId)
  if (userNotif?.no_hp) {
    notifPengajuanDiterima({
      noHp: userNotif.no_hp,
      nama: userNotif.nama,
      nomorKontrak: pinjaman.nomor_kontrak,
      nominal,
      tenor,
      cicilanPerBulan,
    }).catch(console.error)
  }
  // ─────────────────────────────────────────────────────────────────

  const viewParam = !canOverride ? '?view=personal&' : '?'
  redirect(`/dashboard/pinjaman/${pinjaman.id}${viewParam}success=${encodeURIComponent('Pengajuan berhasil dikirim')}`)
}

// ─── ACTION: Approve / Reject Pinjaman ───────────────────────────────────────
export async function approvePinjaman(formData: FormData) {
  const session = await requireRole(['SEKRETARIS', 'BENDAHARA', 'KETUA'])

  const pinjamanId = parseInt(formData.get('pinjaman_id') as string)
  const action = formData.get('action') as 'approve' | 'reject'
  const catatan = (formData.get('catatan') as string) ?? ''

  const supabase = await createClient()
  const { data: pinjaman, error: fetchError } = await supabase
    .from('pinjaman').select('*').eq('id', pinjamanId).single()

  if (fetchError || !pinjaman) {
    redirect(`/dashboard/pinjaman/${pinjamanId}?error=${encodeURIComponent('Pinjaman tidak ditemukan')}`)
  }

  const validApprovals: Record<string, string[]> = {
    SEKRETARIS: ['PENDING_L1'],
    BENDAHARA: ['PENDING_L2'],
    KETUA: ['PENDING_L3'],
  }

  if (!validApprovals[session.role]?.includes(pinjaman.status)) {
    redirect(`/dashboard/pinjaman/${pinjamanId}?error=${encodeURIComponent('Anda tidak berwenang melakukan aksi ini')}`)
  }

  let updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
  let statusAkhir: string | null = null

  if (action === 'reject') {
    if (!catatan.trim()) {
      redirect(`/dashboard/pinjaman/${pinjamanId}?error=${encodeURIComponent('Alasan penolakan wajib diisi')}`)
    }
    updateData = {
      ...updateData,
      status: 'REJECTED',
      rejected_reason: catatan.trim(),
      rejected_by: session.id,
      rejected_at: new Date().toISOString(),
    }
    statusAkhir = 'REJECTED'
  } else {
    const nextStatus: Record<string, PinjamanStatus> = {
      PENDING_L1: 'PENDING_L2',
      PENDING_L2: 'PENDING_L3',
      PENDING_L3: 'APPROVED',
    }
    const levelFields: Record<string, Record<string, unknown>> = {
      PENDING_L1: { approved_l1_by: session.id, approved_l1_at: new Date().toISOString(), catatan_l1: catatan.trim() || null },
      PENDING_L2: { approved_l2_by: session.id, approved_l2_at: new Date().toISOString(), catatan_l2: catatan.trim() || null },
      PENDING_L3: { approved_l3_by: session.id, approved_l3_at: new Date().toISOString(), catatan_l3: catatan.trim() || null },
    }
    const next = nextStatus[pinjaman.status]
    updateData = { ...updateData, status: next, ...levelFields[pinjaman.status] }
    // Hanya kirim WA jika status akhir APPROVED (dari PENDING_L3)
    if (next === 'APPROVED') statusAkhir = 'APPROVED'
  }

  await supabase.from('pinjaman').update(updateData).eq('id', pinjamanId)
  revalidatePath('/dashboard/pinjaman')
  revalidatePath(`/dashboard/pinjaman/${pinjamanId}`)

  // ── NOTIFIKASI WA — hanya APPROVED atau REJECTED ──────────────────
  if (statusAkhir) {
    const userInfo = await getUserNoHp(supabase, pinjaman.user_id)
    if (userInfo?.no_hp) {
      notifStatusPinjaman({
        noHp: userInfo.no_hp,
        nama: userInfo.nama,
        nomorKontrak: pinjaman.nomor_kontrak,
        status: statusAkhir as 'APPROVED' | 'REJECTED',
        catatan: catatan.trim() || undefined,
      }).catch(console.error)
    }
  }
  // ─────────────────────────────────────────────────────────────────

  const msg = action === 'approve' ? 'Pinjaman berhasil disetujui' : 'Pinjaman berhasil ditolak'
  redirect(`/dashboard/pinjaman/${pinjamanId}?success=${encodeURIComponent(msg)}`)
}

// ─── ACTION: Cairkan Pinjaman + JURNAL + NOTIFIKASI ───────────────────────────
export async function cairkanPinjaman(formData: FormData) {
  const session = await requireRole(['BENDAHARA'])

  const pinjamanId = parseInt(formData.get('pinjaman_id') as string)
  const tanggalCairan = formData.get('tanggal_pencairan') as string

  const supabase = await createClient()
  const { data: pinjaman, error: fetchError } = await supabase
    .from('pinjaman').select('*').eq('id', pinjamanId).single()

  if (fetchError || !pinjaman || pinjaman.status !== 'APPROVED') {
    redirect(`/dashboard/pinjaman/${pinjamanId}?error=${encodeURIComponent('Pinjaman tidak dapat dicairkan')}`)
  }

  const tanggalMulai = tanggalCairan ? new Date(tanggalCairan) : new Date()
  const tanggalFinalStr = tanggalMulai.toISOString().split('T')[0]

  // 1. Update status pinjaman
  await supabase.from('pinjaman').update({
    status: 'ACTIVE',
    tanggal_cair: tanggalFinalStr,
    disbursed_by: session.id,
    disbursed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', pinjamanId)

  // 2. Generate jadwal cicilan
  const jadwal = generateJadwalCicilan(
    pinjamanId, pinjaman.nominal_pokok,
    pinjaman.tenor_bulan, pinjaman.cicilan_per_bulan, tanggalMulai
  )
  await supabase.from('cicilan_pinjaman').insert(jadwal)

  // 3. Jika Top-Up: tutup kontrak lama + JURNAL 1 (JVSETTLE)
  if (pinjaman.pelunasan_pinjaman_lama_id && pinjaman.pelunasan_pinjaman_lama) {
    const oldLoanId = pinjaman.pelunasan_pinjaman_lama_id
    const sisaLama = Number(pinjaman.pelunasan_pinjaman_lama)

    await supabase.from('cicilan_pinjaman')
      .update({ status: 'PAID', tanggal_pembayaran: tanggalFinalStr })
      .eq('pinjaman_id', oldLoanId)
      .in('status', ['SCHEDULED', 'OVERDUE'])

    await supabase.from('pinjaman').update({
      status: 'LUNAS', sisa_cicilan: 0, sisa_pokok: 0,
      tanggal_lunas: tanggalFinalStr, updated_at: new Date().toISOString(),
    }).eq('id', oldLoanId)

    await buatJurnalUmum({
      prefix_bukti: 'JVSETTLE',
      tanggal_transaksi: tanggalFinalStr,
      keterangan: `Pelunasan Kontrak Lama via Top-Up ${pinjaman.nomor_kontrak}`,
      jenis_sumber: 'ANGSURAN_MASUK',
      id_sumber: oldLoanId.toString(),
      lines: [
        { kode_akun: '102-MND', debit: sisaLama, kredit: 0, user_id: pinjaman.user_id },
        { kode_akun: '111', debit: 0, kredit: sisaLama, user_id: pinjaman.user_id },
      ],
    })
  }

  // 4. JURNAL 2 (CAIR)
  const kreditBank = pinjaman.nominal_pokok - pinjaman.biaya_admin
  await buatJurnalUmum({
    prefix_bukti: 'CAIR',
    tanggal_transaksi: tanggalFinalStr,
    keterangan: `Pencairan Pinjaman ${pinjaman.nomor_kontrak}${pinjaman.pelunasan_pinjaman_lama ? ' (Top-Up)' : ''}`,
    jenis_sumber: 'PINJAMAN_CAIR',
    id_sumber: pinjaman.id.toString(),
    lines: [
      { kode_akun: '111', debit: pinjaman.nominal_pokok, kredit: 0, user_id: pinjaman.user_id },
      { kode_akun: '401', debit: 0, kredit: pinjaman.biaya_admin, user_id: pinjaman.user_id },
      { kode_akun: '102-MND', debit: 0, kredit: kreditBank, user_id: pinjaman.user_id },
    ],
  })

  // ── NOTIFIKASI WA — Pencairan ─────────────────────────────────────
  const userInfo = await getUserNoHp(supabase, pinjaman.user_id)
  if (userInfo?.no_hp) {
    notifPencairanPinjaman({
      noHp: userInfo.no_hp,
      nama: userInfo.nama,
      nomorKontrak: pinjaman.nomor_kontrak,
      nominalPokok: pinjaman.nominal_pokok,
      nominalDiterima: pinjaman.nominal_diterima,
      biayaAdmin: pinjaman.biaya_admin,
      cicilanPerBulan: pinjaman.cicilan_per_bulan,
      tenorBulan: pinjaman.tenor_bulan,
      tanggalCair: tanggalFinalStr,
    }).catch(console.error)
  }
  // ─────────────────────────────────────────────────────────────────

  revalidatePath('/dashboard/pinjaman')
  revalidatePath(`/dashboard/pinjaman/${pinjamanId}`)
  redirect(`/dashboard/pinjaman/${pinjamanId}?success=${encodeURIComponent('Pencairan berhasil! Jurnal Akuntansi otomatis tercatat.')}`)
}

// ─── ACTION: Bayar Cicilan Manual + JURNAL ────────────────────────────────────
// Notif WA hanya dikirim jika pinjaman LUNAS setelah pembayaran ini
export async function bayarCicilan(formData: FormData) {
  const session = await requireRole(['BENDAHARA', 'SUPERADMIN'])

  const cicilanId = parseInt(formData.get('cicilan_id') as string)
  const pinjamanId = parseInt(formData.get('pinjaman_id') as string)
  const tanggalBayar = (formData.get('tanggal_pembayaran') as string) || new Date().toISOString().split('T')[0]

  const supabase = await createClient()

  const { data: targetCicilan } = await supabase
    .from('cicilan_pinjaman').select('nominal_cicilan').eq('id', cicilanId).single()
  const nominalBayar = Number(targetCicilan?.nominal_cicilan || 0)

  await supabase.from('cicilan_pinjaman')
    .update({ status: 'PAID', tanggal_pembayaran: tanggalBayar })
    .eq('id', cicilanId).eq('pinjaman_id', pinjamanId)

  const { data: sisaCicilanData } = await supabase
    .from('cicilan_pinjaman').select('nominal_cicilan')
    .eq('pinjaman_id', pinjamanId).in('status', ['SCHEDULED', 'OVERDUE'])

  const sisaKali = sisaCicilanData?.length || 0
  const sisaPokok = sisaCicilanData?.reduce((s, c) => s + Number(c.nominal_cicilan), 0) || 0
  const semuaLunas = sisaKali === 0

  const { data: pinjamanUpdated } = await supabase.from('pinjaman').update({
    sisa_cicilan: sisaKali,
    sisa_pokok: sisaPokok,
    status: semuaLunas ? 'LUNAS' : 'ACTIVE',
    tanggal_lunas: semuaLunas ? new Date().toISOString().split('T')[0] : null,
    updated_at: new Date().toISOString(),
  }).eq('id', pinjamanId).select('user_id, nomor_kontrak').single()

  if (nominalBayar > 0 && pinjamanUpdated) {
    await buatJurnalUmum({
      prefix_bukti: 'BYR',
      tanggal_transaksi: tanggalBayar,
      keterangan: `Angsuran Manual Pinjaman ${pinjamanUpdated.nomor_kontrak}`,
      jenis_sumber: 'ANGSURAN_MASUK',
      id_sumber: cicilanId.toString(),
      lines: [
        { kode_akun: '102-MND', debit: nominalBayar, kredit: 0, user_id: pinjamanUpdated.user_id },
        { kode_akun: '111', debit: 0, kredit: nominalBayar, user_id: pinjamanUpdated.user_id },
      ],
    })

    // ── NOTIFIKASI WA — hanya jika LUNAS ─────────────────────────────
    if (semuaLunas) {
      const userInfo = await getUserNoHp(supabase, pinjamanUpdated.user_id)
      if (userInfo?.no_hp) {
        notifPinjamanLunas({
          noHp: userInfo.no_hp,
          nama: userInfo.nama,
          nomorKontrak: pinjamanUpdated.nomor_kontrak,
          tanggalLunas: tanggalBayar,
        }).catch(console.error)
      }
    }
    // ─────────────────────────────────────────────────────────────────
  }

  revalidatePath(`/dashboard/pinjaman/${pinjamanId}`)
  revalidatePath('/dashboard/pinjaman')
  redirect(`/dashboard/pinjaman/${pinjamanId}?success=${encodeURIComponent('Pembayaran berhasil & Jurnal tercatat.')}`)
}

// ─── ACTION: Pelunasan Sekaligus + JURNAL + NOTIFIKASI ───────────────────────
export async function pelunasanPinjamanSekaligus(formData: FormData) {
  const session = await requireRole(['BENDAHARA', 'SUPERADMIN'])

  const pinjamanId = parseInt(formData.get('pinjaman_id') as string)
  const tanggalPelunasan = (formData.get('tanggal_pembayaran') as string) || new Date().toISOString().split('T')[0]

  const supabase = await createClient()
  const { data: pinjaman, error: fetchError } = await supabase
    .from('pinjaman').select('status, nomor_kontrak, user_id').eq('id', pinjamanId).single()

  if (fetchError || !pinjaman || pinjaman.status !== 'ACTIVE') {
    redirect(`/dashboard/pinjaman/${pinjamanId}?error=${encodeURIComponent('Pinjaman tidak dapat dilunasi. Pastikan statusnya Aktif.')}`)
  }

  const { data: cicilanSisa } = await supabase
    .from('cicilan_pinjaman').select('nominal_cicilan')
    .eq('pinjaman_id', pinjamanId).in('status', ['SCHEDULED', 'OVERDUE'])
  const totalPelunasan = cicilanSisa?.reduce((s, c) => s + Number(c.nominal_cicilan), 0) || 0

  await supabase.from('cicilan_pinjaman')
    .update({ status: 'PAID', tanggal_pembayaran: tanggalPelunasan })
    .eq('pinjaman_id', pinjamanId).in('status', ['SCHEDULED', 'OVERDUE'])

  await supabase.from('pinjaman').update({
    sisa_cicilan: 0, sisa_pokok: 0,
    status: 'LUNAS', tanggal_lunas: tanggalPelunasan,
    updated_at: new Date().toISOString(),
  }).eq('id', pinjamanId)

  if (totalPelunasan > 0) {
    await buatJurnalUmum({
      prefix_bukti: 'LUNAS',
      tanggal_transaksi: tanggalPelunasan,
      keterangan: `Pelunasan Sekaligus Pinjaman ${pinjaman.nomor_kontrak}`,
      jenis_sumber: 'ANGSURAN_MASUK',
      id_sumber: pinjamanId.toString(),
      lines: [
        { kode_akun: '102-MND', debit: totalPelunasan, kredit: 0, user_id: pinjaman.user_id },
        { kode_akun: '111', debit: 0, kredit: totalPelunasan, user_id: pinjaman.user_id },
      ],
    })
  }

  // ── NOTIFIKASI WA — Lunas ─────────────────────────────────────────
  const userInfo = await getUserNoHp(supabase, pinjaman.user_id)
  if (userInfo?.no_hp) {
    notifPinjamanLunas({
      noHp: userInfo.no_hp,
      nama: userInfo.nama,
      nomorKontrak: pinjaman.nomor_kontrak,
      tanggalLunas: tanggalPelunasan,
    }).catch(console.error)
  }
  // ─────────────────────────────────────────────────────────────────

  revalidatePath(`/dashboard/pinjaman/${pinjamanId}`)
  revalidatePath('/dashboard/pinjaman')
  redirect(`/dashboard/pinjaman/${pinjamanId}?success=${encodeURIComponent('Pelunasan berhasil diproses & Jurnal tercatat.')}`)
}

// ─── ACTION: Input Pinjaman Existing (Migrasi) + JURNAL PEMBUKA ───────────────
const PinjamanExistingSchema = z.object({
  user_id: z.string().uuid('User ID tidak valid'),
  nominal: z.number().min(1),
  tenor_bulan: z.number().min(1).max(12),
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
    redirect(`/dashboard/pinjaman/existing?error=${encodeURIComponent(parsed.error.errors[0]?.message ?? 'Validasi gagal')}`)
  }

  const { biayaAdmin, totalDiterima, cicilanPerBulan } = await hitungPinjaman(nominal, tenor)
  const sisaKaliTersisa = Math.max(0, tenor - cicilan_terbayar)
  const outstandingSisa = sisaKaliTersisa * cicilanPerBulan

  const nomorKontrak = await generateNomorBukti('MIG', tanggal_pencairan)
  const supabase = await createClient()

  const { data: pinjaman, error } = await supabase.from('pinjaman').insert({
    user_id: parsed.data.user_id,
    nomor_kontrak: nomorKontrak,
    nominal_pokok: nominal,
    biaya_admin: biayaAdmin,
    nominal_diterima: totalDiterima,
    tenor_bulan: tenor,
    cicilan_per_bulan: cicilanPerBulan,
    sisa_pokok: outstandingSisa,
    sisa_cicilan: sisaKaliTersisa,
    cicilan_mulai_periode: tanggal_pencairan.slice(0, 7),
    tujuan: (parsed.data.catatan || 'Migrasi Pinjaman Excel').trim(),
    status: cicilan_terbayar >= tenor ? 'LUNAS' : 'ACTIVE',
    tanggal_pengajuan: new Date(tanggal_pencairan).toISOString(),
    tanggal_cair: tanggal_pencairan,
    tanggal_lunas: cicilan_terbayar >= tenor ? tanggal_pencairan : null,
    disbursed_by: session.id,
    disbursed_at: new Date().toISOString(),
    catatan_pengaju: `[MIGRASI] ${parsed.data.catatan ?? ''}`.trim(),
  }).select().single()

  if (error || !pinjaman) {
    redirect(`/dashboard/pinjaman/existing?error=${encodeURIComponent('Gagal input pinjaman: ' + (error?.message ?? ''))}`)
  }

  const jadwal = generateJadwalCicilan(pinjaman.id, nominal, tenor, cicilanPerBulan, new Date(tanggal_pencairan))
  const jadwalWithStatus = jadwal.map((c, i) => ({
    ...c,
    status: i < cicilan_terbayar ? ('PAID' as CicilanStatus) : ('SCHEDULED' as CicilanStatus),
    tanggal_pembayaran: i < cicilan_terbayar ? tanggal_pencairan : null,
    created_at: new Date().toISOString(),
  }))
  await supabase.from('cicilan_pinjaman').insert(jadwalWithStatus)

  if (outstandingSisa > 0 && cicilan_terbayar < tenor) {
    await buatJurnalUmum({
      nomor_bukti: `OP-${nomorKontrak}`,
      tanggal_transaksi: tanggal_pencairan,
      keterangan: `[SALDO AWAL MIGRASI] Sisa piutang ${nomorKontrak} per tanggal cut-off`,
      jenis_sumber: 'MANUAL',
      id_sumber: pinjaman.id.toString(),
      lines: [
        { kode_akun: '111', debit: outstandingSisa, kredit: 0, user_id: parsed.data.user_id },
        { kode_akun: '399', debit: 0, kredit: outstandingSisa },
      ],
    })
  }

  revalidatePath('/dashboard/pinjaman')
  redirect(`/dashboard/pinjaman/${pinjaman.id}?success=${encodeURIComponent('Data pinjaman existing berhasil diinput')}`)
}

// ─── GET: Statistik Pinjaman ──────────────────────────────────────────────────
export async function getStatistikPinjaman() {
  const supabase = await createClient()

  const { data: pinjaman } = await supabase
    .from('pinjaman').select('id, nominal_pokok, status, cicilan_per_bulan')
  if (!pinjaman) return { total: 0, aktif: 0, pending: 0, lunas: 0, totalOutstanding: 0, totalCicilanBulanan: 0 }

  const { data: unpaid } = await supabase
    .from('cicilan_pinjaman').select('pinjaman_id').in('status', ['SCHEDULED', 'OVERDUE'])
  const countMap: Record<number, number> = {}
  unpaid?.forEach((c) => { countMap[c.pinjaman_id] = (countMap[c.pinjaman_id] || 0) + 1 })

  const aktif = pinjaman.filter((p) => p.status === 'ACTIVE')
  const pending = pinjaman.filter((p) => ['PENDING_L1', 'PENDING_L2', 'PENDING_L3', 'APPROVED'].includes(p.status))
  const lunas = pinjaman.filter((p) => p.status === 'LUNAS')
  const totalOutstanding = aktif.reduce((s, p) => s + (countMap[p.id] || 0) * (Number(p.cicilan_per_bulan) || 0), 0)

  return {
    total: pinjaman.length,
    aktif: aktif.length,
    pending: pending.length,
    lunas: lunas.length,
    totalOutstanding,
    totalCicilanBulanan: aktif.reduce((s, p) => s + (p.cicilan_per_bulan ?? 0), 0),
  }
}

// ─── ACTION: Potong Cicilan Massal (Payroll) + JURNAL ─────────────────────────
export async function potongCicilanMassal(bulan: number, tahun: number) {
  const session = await requireRole(['BENDAHARA', 'SUPERADMIN'])
  const supabase = await createClient()

  const targetMonthStr = `${tahun}-${String(bulan).padStart(2, '0')}`
  const tanggalJurnal = new Date().toISOString().split('T')[0]
  const nomorBuktiPayroll = `PRPINJ-${tahun}${String(bulan).padStart(2, '0')}`

  const { data: existJurnal } = await supabase
    .from('jurnal_induk').select('id').eq('nomor_bukti', nomorBuktiPayroll).maybeSingle()
  if (existJurnal) {
    return { success: false, message: `Payroll Pinjaman periode ${targetMonthStr} sudah dieksekusi sebelumnya.` }
  }

  const { data: cicilanTertarget, error: fetchError } = await supabase
    .from('cicilan_pinjaman').select('*')
    .like('tanggal_jatuh_tempo', `${targetMonthStr}%`)
    .in('status', ['SCHEDULED', 'OVERDUE'])

  if (fetchError || !cicilanTertarget || cicilanTertarget.length === 0) {
    return { success: false, message: `Tidak ada tagihan cicilan aktif untuk periode ${targetMonthStr}.` }
  }

  const cicilanIds = cicilanTertarget.map((c) => c.id)
  const totalMassal = cicilanTertarget.reduce((s, c) => s + Number(c.nominal_cicilan), 0)

  await supabase.from('cicilan_pinjaman')
    .update({ status: 'PAID', tanggal_pembayaran: tanggalJurnal })
    .in('id', cicilanIds)

  const pinjamanIds = [...new Set(cicilanTertarget.map((c) => c.pinjaman_id))]
  for (const pId of pinjamanIds) {
    const { data: sisa } = await supabase
      .from('cicilan_pinjaman').select('nominal_cicilan')
      .eq('pinjaman_id', pId).in('status', ['SCHEDULED', 'OVERDUE'])
    const sisaKali = sisa?.length || 0
    const sisaPokok = sisa?.reduce((s, c) => s + Number(c.nominal_cicilan), 0) || 0
    await supabase.from('pinjaman').update({
      sisa_cicilan: sisaKali, sisa_pokok: sisaPokok,
      status: sisaKali === 0 ? 'LUNAS' : 'ACTIVE',
      tanggal_lunas: sisaKali === 0 ? tanggalJurnal : null,
      updated_at: new Date().toISOString(),
    }).eq('id', pId)
  }

  if (totalMassal > 0) {
    await buatJurnalUmum({
      nomor_bukti: nomorBuktiPayroll,
      tanggal_transaksi: tanggalJurnal,
      keterangan: `Pemotongan Massal Payroll Angsuran Pinjaman ${targetMonthStr}`,
      jenis_sumber: 'PAYROLL_MASSAL',
      id_sumber: targetMonthStr,
      lines: [
        { kode_akun: '102-MND', debit: totalMassal, kredit: 0 },
        { kode_akun: '111', debit: 0, kredit: totalMassal },
      ],
    })
  }

  revalidatePath('/dashboard/pinjaman')
  return {
    success: true,
    message: `Berhasil memproses payroll pinjaman & Jurnal total Rp ${totalMassal.toLocaleString('id-ID')} otomatis tercatat!`,
  }
}
