// ─────────────────────────────────────────
// lib/dashboard/queries.ts — final schema
// Tabel: akun_perkiraan, jurnal_induk, jurnal_rincian,
//        pinjaman, cicilan_pinjaman, saldo_simpanan, simpanan
// tipe_akun: ASSET | LIABILITY | EQUITY | REVENUE | EXPENSE
// saldo_normal: DEBIT | KREDIT
// ─────────────────────────────────────────
import { createClient } from '@/lib/supabase/server'

// ── Raw types ────────────────────────────────────────────────

export interface AkunSaldo {
  id: string
  kode_akun: string
  nama_akun: string
  tipe_akun: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE'
  saldo_normal: 'DEBIT' | 'KREDIT'
  total_debit: number
  total_kredit: number
  saldo_akhir: number
}

export interface RawPinjaman {
  id: number
  user_id: string
  nominal_pokok: number
  biaya_admin: number
  nominal_diterima: number
  tenor_bulan: number
  cicilan_per_bulan: number
  sisa_pokok: number
  sisa_cicilan: number
  status: string
  tanggal_cair: string | null
  tanggal_lunas: string | null
  tanggal_pengajuan: string | null
  pelunasan_pinjaman_lama_id: number | null
}

export interface RawSaldoSimpanan {
  user_id: string
  total_saldo: number
  saldo_pokok: number
  saldo_wajib: number
  saldo_sukarela: number
}

// ─────────────────────────────────────────────────────────────
// CORE HELPER — identik dengan getSaldoAkun di laporan-mu
// Reuse pattern yang sama supaya angka dashboard = angka laporan
// ─────────────────────────────────────────────────────────────

export async function getSaldoAkun(
  startDate: string,
  endDate: string
): Promise<AkunSaldo[]> {
  const supabase = await createClient()

  const { data: accounts } = await supabase
    .from('akun_perkiraan')
    .select('id, kode_akun, nama_akun, tipe_akun, saldo_normal')
    .order('kode_akun', { ascending: true })

  if (!accounts) return []

  // Ambil jurnal_induk ids dalam periode
  const { data: indukList } = await supabase
    .from('jurnal_induk')
    .select('id')
    .gte('tanggal_transaksi', startDate)
    .lte('tanggal_transaksi', endDate)

  const indukIds = indukList?.map((i: any) => i.id) ?? []
  let rincian: { akun_id: string; debit: number; kredit: number }[] = []

  if (indukIds.length > 0) {
    const { data } = await supabase
      .from('jurnal_rincian')
      .select('akun_id, debit, kredit')
      .in('jurnal_induk_id', indukIds)
    rincian = data ?? []
  }

  return accounts.map((akun: any) => {
    const trxs = rincian.filter((r) => r.akun_id === akun.id)
    const totalDebit  = trxs.reduce((s, t) => s + Number(t.debit  || 0), 0)
    const totalKredit = trxs.reduce((s, t) => s + Number(t.kredit || 0), 0)
    const saldo_akhir = akun.saldo_normal === 'DEBIT'
      ? totalDebit - totalKredit
      : totalKredit - totalDebit

    return { ...akun, total_debit: totalDebit, total_kredit: totalKredit, saldo_akhir }
  })
}

// ─────────────────────────────────────────────────────────────
// FETCH FUNCTIONS
// ─────────────────────────────────────────────────────────────

export async function fetchPinjaman(): Promise<RawPinjaman[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('pinjaman')
    .select(`
      id, user_id, nominal_pokok, biaya_admin, nominal_diterima,
      tenor_bulan, cicilan_per_bulan, sisa_pokok, sisa_cicilan,
      status, tanggal_cair, tanggal_lunas, tanggal_pengajuan,
      pelunasan_pinjaman_lama_id
    `)
  return data ?? []
}

export async function fetchSaldoSimpanan(): Promise<RawSaldoSimpanan[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('saldo_simpanan')
    .select('user_id, total_saldo, saldo_pokok, saldo_wajib, saldo_sukarela')
  return data ?? []
}

/** Tren bulanan 12 bulan — pinjaman cair + setoran simpanan masuk */
export async function fetchTrenBulanan() {
  const supabase = await createClient()

  const twelveAgo = new Date()
  twelveAgo.setMonth(twelveAgo.getMonth() - 11)
  const start = `${twelveAgo.getFullYear()}-${String(twelveAgo.getMonth() + 1).padStart(2, '0')}-01`

  const [pinjamanRes, setoranRes] = await Promise.all([
    supabase
      .from('pinjaman')
      .select('nominal_pokok, tanggal_cair')
      .gte('tanggal_cair', start)
      .not('tanggal_cair', 'is', null)
      .in('status', ['ACTIVE', 'LUNAS']),

    supabase
      .from('simpanan')
      .select('nominal, tanggal')
      .gte('tanggal', start)
      .eq('jenis', 'SETORAN')
      .eq('status', 'APPROVED'),
  ])

  return {
    pinjamanCair: pinjamanRes.data ?? [],
    setoranMasuk: setoranRes.data ?? [],
  }
}

/** NPL detail: pinjaman ACTIVE dengan cicilan overdue */
export async function fetchNplDetail() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: aktif } = await supabase
    .from('pinjaman')
    .select(`
      id, user_id, nominal_pokok, sisa_pokok, cicilan_per_bulan,
      biaya_admin, nominal_diterima, tenor_bulan, sisa_cicilan, status,
      tanggal_cair, tanggal_lunas, tanggal_pengajuan, pelunasan_pinjaman_lama_id,
      users:user_id ( nama, nik )
    `)
    .eq('status', 'ACTIVE')

  if (!aktif || aktif.length === 0) return []

  const pinjamanIds = aktif.map((p) => p.id)

  const { data: overdue } = await supabase
    .from('cicilan_pinjaman')
    .select('pinjaman_id')
    .in('pinjaman_id', pinjamanIds)
    .in('status', ['SCHEDULED', 'OVERDUE'])
    .lt('tanggal_jatuh_empo', today)

  const overdueMap: Record<number, number> = {}
  overdue?.forEach((c: any) => {
    overdueMap[c.pinjaman_id] = (overdueMap[c.pinjaman_id] ?? 0) + 1
  })

  return aktif
    .filter((p) => (overdueMap[p.id] ?? 0) >= 1)
    .map((p) => ({ pinjaman: p, cicilanOverdue: overdueMap[p.id] ?? 0 }))
}

export async function fetchSystemAlerts() {
  const supabase = await createClient()
  try {
    const { data } = await supabase
      .from('system_alerts')
      .select('id, level, message, detail, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    return data ?? []
  } catch {
    return []
  }
}

/** Entry point tunggal untuk page.tsx */
export async function fetchAllDashboardRaw() {
  const safeTahun = new Date().getFullYear()
  const startOfYear = `${safeTahun}-01-01`
  const today = new Date().toISOString().split('T')[0]

  // getSaldoAkun dari awal tahun (untuk SHU YTD) + dari 1900 (untuk neraca)
  const [
    akunSaldoYtd,     // REVENUE - EXPENSE sejak 1 Jan → SHU YTD
    akunSaldoNeraca,  // semua tipe dari 1900 → aset, kewajiban, modal
    pinjaman,
    saldoSimpanan,
    trenBulanan,
    nplDetail,
    alerts,
  ] = await Promise.all([
    getSaldoAkun(startOfYear, today),
    getSaldoAkun('1900-01-01', today),
    fetchPinjaman(),
    fetchSaldoSimpanan(),
    fetchTrenBulanan(),
    fetchNplDetail(),
    fetchSystemAlerts(),
  ])

  return {
    akunSaldoYtd,
    akunSaldoNeraca,
    pinjaman,
    saldoSimpanan,
    trenBulanan,
    nplDetail,
    alerts,
  }
}
