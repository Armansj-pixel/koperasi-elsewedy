'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/session'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RekapBaris {
  user_id: string
  nik: string
  nama: string
  simpanan_wajib: number
  simpanan_sukarela: number
  cicilan_pinjaman: number
  total_potongan: number
}

export interface RekapBulanan {
  periode: string // format "YYYY-MM"
  periodeLabel: string // format "Juni 2026"
  tanggalCetak: string
  baris: RekapBaris[]
  totalSimpananWajib: number
  totalSimpananSukarela: number
  totalCicilanPinjaman: number
  totalKeseluruhan: number
  jumlahAnggota: number
}

export interface SlipIndividu {
  periode: string
  periodeLabel: string
  tanggalCetak: string
  user: {
    nik: string
    nama: string
    no_hp: string | null
  }
  simpanan: {
    wajib: number
    sukarela: number
    saldoTotal: number
  }
  pinjaman: {
    adaPinjamanAktif: boolean
    nominalPinjaman: number
    cicilanBulanIni: number
    sisaCicilan: number
    tenorBulan: number
    cicilanKe: number
  } | null
  totalPotonganBulanIni: number
}

function getPeriodeLabel(periode: string) {
  const [year, month] = periode.split('-').map(Number)
  const bulanNama = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ]
  return `${bulanNama[month - 1]} ${year}`
}

// ─── GET: Rekap Bulanan untuk HR/Finance ──────────────────────────────────────

export async function getRekapBulanan(periode: string) {
  await requireRole(['SEKRETARIS', 'BENDAHARA', 'KETUA', 'SUPERADMIN'])

  const supabase = createServiceClient()

  // 1. Ambil semua anggota aktif
  const { data: anggotaList, error: anggotaError } = await supabase
    .from('users')
    .select('id, nik, nama, simpanan_wajib_bulanan, simpanan_sukarela_bulanan')
    .eq('role', 'ANGGOTA')
    .eq('is_active', true)
    .order('nama', { ascending: true })

  if (anggotaError || !anggotaList) {
    return { data: null, error: anggotaError?.message ?? 'Gagal mengambil data anggota' }
  }

  // 2. Ambil setoran simpanan periode ini (jenis SETORAN)
  const { data: simpananPeriode } = await supabase
    .from('simpanan')
    .select('user_id, nominal, jenis, periode, status')
    .eq('periode', periode)
    .eq('jenis', 'SETORAN')
    .in('status', ['APPROVED', 'COMPLETED', 'DISBURSED']) // Menambahkan COMPLETED untuk jaga-jaga

  // 3. Kalkulasi Tanggal Awal dan Akhir Bulan (Aman dari Timezone Bug Server)
  const [year, month] = periode.split('-').map(Number)
  const startDate = `${periode}-01`
  const lastDay = new Date(year, month, 0).getDate() // Mengambil angka hari terakhir (28/29/30/31)
  const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}` // Format manual: YYYY-MM-DD

  // 4. Ambil cicilan pinjaman yang jatuh tempo di periode ini
  const { data: cicilanPeriode } = await supabase
    .from('cicilan_pinjaman')
    .select('id, pinjaman_id, nominal_cicilan, tanggal_jatuh_tempo, status, pinjaman:pinjaman_id(user_id, status)')
    .gte('tanggal_jatuh_tempo', startDate)
    .lte('tanggal_jatuh_tempo', endDate)

  // 5. Map simpanan per user
  const simpananMap = new Map<string, number>()
  for (const s of simpananPeriode ?? []) {
    simpananMap.set(s.user_id, (simpananMap.get(s.user_id) ?? 0) + Number(s.nominal))
  }

  // 6. Map cicilan per user (hanya dari pinjaman yang ACTIVE dan cicilan tidak WAIVED)
  const cicilanMap = new Map<string, number>()
  for (const c of (cicilanPeriode ?? []) as any[]) {
    // Handling relasi Supabase (bisa berupa object tunggal atau array, biasanya object tunggal)
    const pinjamanData = Array.isArray(c.pinjaman) ? c.pinjaman[0] : c.pinjaman
    
    if (!pinjamanData || pinjamanData.status !== 'ACTIVE') continue
    if (c.status === 'WAIVED') continue
    
    const userId = pinjamanData.user_id
    cicilanMap.set(userId, (cicilanMap.get(userId) ?? 0) + Number(c.nominal_cicilan))
  }

  // 7. Bentuk baris rekapitulasi
  const baris: RekapBaris[] = anggotaList.map((a) => {
    const totalSetoranAktual = simpananMap.get(a.id) ?? 0
    // Jika belum ada setoran tercatat, fallback ke nominal wajib bulanan default anggota
    const simpananWajib = totalSetoranAktual > 0 
      ? Math.min(totalSetoranAktual, Number(a.simpanan_wajib_bulanan ?? 0)) 
      : Number(a.simpanan_wajib_bulanan ?? 0)
      
    const simpananSukarela = Number(a.simpanan_sukarela_bulanan ?? 0)
    const cicilan = cicilanMap.get(a.id) ?? 0
    const total = simpananWajib + simpananSukarela + cicilan

    return {
      user_id: a.id,
      nik: a.nik,
      nama: a.nama,
      simpanan_wajib: simpananWajib,
      simpanan_sukarela: simpananSukarela,
      cicilan_pinjaman: cicilan,
      total_potongan: total,
    }
  })

  const totalSimpananWajib = baris.reduce((sum, b) => sum + b.simpanan_wajib, 0)
  const totalSimpananSukarela = baris.reduce((sum, b) => sum + b.simpanan_sukarela, 0)
  const totalCicilanPinjaman = baris.reduce((sum, b) => sum + b.cicilan_pinjaman, 0)
  const totalKeseluruhan = totalSimpananWajib + totalSimpananSukarela + totalCicilanPinjaman

  const rekap: RekapBulanan = {
    periode,
    periodeLabel: getPeriodeLabel(periode),
    tanggalCetak: new Date().toLocaleDateString('id-ID').split('/').reverse().join('-'), // YYYY-MM-DD aman timezone
    baris,
    totalSimpananWajib,
    totalSimpananSukarela,
    totalCicilanPinjaman,
    totalKeseluruhan,
    jumlahAnggota: baris.length,
  }

  return { data: rekap, error: null }
}

// ─── GET: Slip Individu Anggota ───────────────────────────────────────────────

export async function getSlipIndividu(userId: string, periode: string) {
  const session = await requireRole(['ANGGOTA', 'SEKRETARIS', 'BENDAHARA', 'KETUA', 'SUPERADMIN'])

  if (session.role === 'ANGGOTA' && session.id !== userId) {
    return { data: null, error: 'Anda tidak berwenang mengakses slip anggota lain' }
  }

  const supabase = createServiceClient()

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, nik, nama, no_hp, simpanan_wajib_bulanan, simpanan_sukarela_bulanan')
    .eq('id', userId)
    .maybeSingle()

  if (userError || !user) {
    return { data: null, error: userError?.message ?? 'Anggota tidak ditemukan' }
  }

  const { data: saldo } = await supabase
    .from('saldo_simpanan')
    .select('total_saldo')
    .eq('user_id', userId)
    .maybeSingle()

  const { data: pinjamanAktif } = await supabase
    .from('pinjaman')
    .select('id, nominal, tenor_bulan, cicilan_per_bulan, status')
    .eq('user_id', userId)
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let pinjamanInfo: SlipIndividu['pinjaman'] = null

  if (pinjamanAktif) {
    // Sama seperti di atas, perbaikan Timezone Bug
    const [year, month] = periode.split('-').map(Number)
    const startDate = `${periode}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`

    const { data: cicilanBulanIni } = await supabase
      .from('cicilan_pinjaman')
      .select('nomor_cicilan, nominal_cicilan, status')
      .eq('pinjaman_id', pinjamanAktif.id)
      .gte('tanggal_jatuh_tempo', startDate)
      .lte('tanggal_jatuh_tempo', endDate)
      .maybeSingle()

    const { count: sisaCicilanCount } = await supabase
      .from('cicilan_pinjaman')
      .select('id', { count: 'exact', head: true })
      .eq('pinjaman_id', pinjamanAktif.id)
      .eq('status', 'SCHEDULED')

    pinjamanInfo = {
      adaPinjamanAktif: true,
      nominalPinjaman: Number(pinjamanAktif.nominal),
      cicilanBulanIni: cicilanBulanIni ? Number(cicilanBulanIni.nominal_cicilan) : Number(pinjamanAktif.cicilan_per_bulan),
      sisaCicilan: sisaCicilanCount ?? 0,
      tenorBulan: pinjamanAktif.tenor_bulan,
      cicilanKe: cicilanBulanIni?.nomor_cicilan ?? 0,
    }
  }

  const simpananWajib = Number(user.simpanan_wajib_bulanan ?? 0)
  const simpananSukarela = Number(user.simpanan_sukarela_bulanan ?? 0)
  const cicilanBulanIni = pinjamanInfo?.cicilanBulanIni ?? 0

  const slip: SlipIndividu = {
    periode,
    periodeLabel: getPeriodeLabel(periode),
    tanggalCetak: new Date().toLocaleDateString('id-ID').split('/').reverse().join('-'), // YYYY-MM-DD
    user: {
      nik: user.nik,
      nama: user.nama,
      no_hp: user.no_hp,
    },
    simpanan: {
      wajib: simpananWajib,
      sukarela: simpananSukarela,
      saldoTotal: Number(saldo?.total_saldo ?? 0),
    },
    pinjaman: pinjamanInfo,
    totalPotonganBulanIni: simpananWajib + simpananSukarela + cicilanBulanIni,
  }

  return { data: slip, error: null }
}

// ─── GET: Daftar Anggota (untuk dropdown pilih slip oleh admin) ──────────────

export async function getDaftarAnggotaUntukSlip() {
  await requireRole(['SEKRETARIS', 'BENDAHARA', 'KETUA', 'SUPERADMIN'])

  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('users')
    .select('id, nik, nama')
    .eq('role', 'ANGGOTA')
    .eq('is_active', true)
    .order('nama', { ascending: true })

  return { data: data ?? [], error: error?.message ?? null }
}
