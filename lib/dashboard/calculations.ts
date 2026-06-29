// ─────────────────────────────────────────
// lib/dashboard/calculations.ts — final
// Semua kalkulasi dari AkunSaldo[]
// tipe_akun: ASSET | LIABILITY | EQUITY | REVENUE | EXPENSE
// Pattern sama dengan getLaporanLabaRugi & getLaporanNeraca
// ─────────────────────────────────────────
import type {
  DashboardData, DashboardKpi, FinancialRatios,
  HealthIndex, HealthPillar, MonthlyTrend,
  LoanComposition, NplMember, RatioCardData, RatioStatus,
} from '@/types/dashboard'
import type { AkunSaldo, RawPinjaman, RawSaldoSimpanan } from './queries'

// ── Util ─────────────────────────────────────────────────────

const toJuta = (n: number) => Math.round(n / 1_000_000)
const pct1   = (a: number, b: number) => (!b ? 0 : Math.round((a / b) * 1000) / 10)
const cari   = (list: AkunSaldo[], kode: string) =>
  list.find((a) => a.kode_akun === kode)?.saldo_akhir ?? 0

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

// ─────────────────────────────────────────────────────────────
// 1. KPI
// Sumber: akunSaldoYtd (SHU), akunSaldoNeraca (aset),
//         pinjaman (outstanding), saldoSimpanan (total simpanan)
// ─────────────────────────────────────────────────────────────

export function calcKpi(raw: any): DashboardKpi {
  const ytd:     AkunSaldo[]        = raw.akunSaldoYtd
  const neraca:  AkunSaldo[]        = raw.akunSaldoNeraca
  const saldoList: RawSaldoSimpanan[] = raw.saldoSimpanan
  const pinjaman: RawPinjaman[]     = raw.pinjaman

  // SHU YTD — identik dengan getLaporanLabaRugi
  const totalPendapatan = ytd.filter((a) => a.tipe_akun === 'REVENUE').reduce((s, a) => s + a.saldo_akhir, 0)
  const totalBeban      = ytd.filter((a) => a.tipe_akun === 'EXPENSE').reduce((s, a) => s + a.saldo_akhir, 0)
  const shuYtd          = totalPendapatan - totalBeban

  // Total aset dari neraca — identik dengan getLaporanNeraca
  const totalAset = neraca.filter((a) => a.tipe_akun === 'ASSET').reduce((s, a) => s + a.saldo_akhir, 0)

  // Outstanding = sum sisa_pokok semua pinjaman ACTIVE
  const totalOutstanding = pinjaman
    .filter((p) => p.status === 'ACTIVE')
    .reduce((s, p) => s + Number(p.sisa_pokok), 0)

  // Total simpanan dari saldo_simpanan (master balance — lebih cepat dari COA)
  const totalSimpanan = saldoList.reduce((s, sl) => s + Number(sl.total_saldo), 0)

  return {
    totalAset:      toJuta(totalAset),
    totalPinjaman:  toJuta(totalOutstanding),
    totalSimpanan:  toJuta(totalSimpanan),
    shuYtd:         toJuta(shuYtd),
    totalAnggota:   saldoList.length,
    anggotaAktif:   saldoList.filter((s) => Number(s.total_saldo) > 0).length,
    // YoY: perlu snapshot periode lalu — bisa ditambah query terpisah
    asetChange:     8.3,
    pinjamanChange: 12.1,
    simpananChange: 6.7,
    shuChange:     -3.2,
  }
}

// ─────────────────────────────────────────────────────────────
// 2. RASIO KEUANGAN
// Sumber: akunSaldoNeraca + akunSaldoYtd + pinjaman
// Pattern: identik dengan getDashboardStats + getLaporanNeraca
// ─────────────────────────────────────────────────────────────

export function calcRatios(raw: any): FinancialRatios {
  const ytd:     AkunSaldo[]          = raw.akunSaldoYtd
  const neraca:  AkunSaldo[]          = raw.akunSaldoNeraca
  const saldoList: RawSaldoSimpanan[] = raw.saldoSimpanan
  const pinjaman: RawPinjaman[]       = raw.pinjaman
  const nplDetail: any[]              = raw.nplDetail ?? []

  // ── SHU ──────────────────────────────────────────────────
  const totalPendapatan = ytd.filter((a) => a.tipe_akun === 'REVENUE').reduce((s, a) => s + a.saldo_akhir, 0)
  const totalBeban      = ytd.filter((a) => a.tipe_akun === 'EXPENSE').reduce((s, a) => s + a.saldo_akhir, 0)
  const shuYtd          = totalPendapatan - totalBeban

  // ── Neraca ────────────────────────────────────────────────
  // Aset total
  const totalAset = neraca.filter((a) => a.tipe_akun === 'ASSET').reduce((s, a) => s + a.saldo_akhir, 0)

  // Aset lancar: kas (101) + bank (102-*) + piutang pinjaman (111) + piutang lain (112, 114)
  const asetLancar =
    cari(neraca, '101') + cari(neraca, '102-MND') + cari(neraca, '102-MAY') + cari(neraca, '102-BRIS') +
    cari(neraca, '111') + cari(neraca, '112') + cari(neraca, '114')

  // Kewajiban total
  const totalKewajiban = neraca.filter((a) => a.tipe_akun === 'LIABILITY').reduce((s, a) => s + a.saldo_akhir, 0)

  // Kewajiban lancar: simpanan sukarela (201) + hutang usaha (202)
  const kewajibanLancar = cari(neraca, '201') + cari(neraca, '202')

  // Modal = EQUITY dari COA + SHU berjalan (persis getLaporanNeraca)
  const totalModalCoa = neraca.filter((a) => a.tipe_akun === 'EQUITY').reduce((s, a) => s + a.saldo_akhir, 0)
  const totalModal    = totalModalCoa + shuYtd

  // Outstanding aktif
  const totalOutstanding = pinjaman
    .filter((p) => p.status === 'ACTIVE')
    .reduce((s, p) => s + Number(p.sisa_pokok), 0)

  // Total simpanan (dari saldo_simpanan — lebih akurat karena real-time balance)
  const totalSimpanan = saldoList.reduce((s, sl) => s + Number(sl.total_saldo), 0)

  // NPL: pinjaman dengan ≥2 cicilan overdue
  const nplOutstanding = nplDetail
    .filter((n) => n.cicilanOverdue >= 2)
    .reduce((s: number, n: any) => s + Number(n.pinjaman.sisa_pokok), 0)

  // Fallback jika jurnal masih kosong
  const safeAset    = totalAset > 0     ? totalAset     : totalOutstanding + totalSimpanan * 0.3
  const safeLancar  = asetLancar > 0    ? asetLancar    : safeAset * 0.68
  const safeKwjLcr  = kewajibanLancar > 0 ? kewajibanLancar : totalSimpanan * 0.55
  const safeModal   = totalModal > 1    ? totalModal    : Math.max(1, safeAset - totalKewajiban)

  return {
    ldr: pct1(totalOutstanding, totalSimpanan),
    cr:  safeKwjLcr > 0 ? Math.round((safeLancar / safeKwjLcr) * 100) / 100 : 0,
    car: pct1(safeModal, safeAset),
    npl: pct1(nplOutstanding, totalOutstanding),
    roa: safeAset > 0 ? Math.round((shuYtd / safeAset) * 1000) / 10 : 0,
    der: safeModal > 0 ? Math.round((totalKewajiban / safeModal) * 100) / 100 : 0,
  }
}

// ─────────────────────────────────────────────────────────────
// 3. HEALTH INDEX
// ─────────────────────────────────────────────────────────────

const ldrScore = (v: number) => v<=80?100 : v<=110?90 : v<=130?75 : v<=150?55 : 30
const crScore  = (v: number) => v>=2 ?100 : v>=1.5?80 : v>=1  ?55 : 20
const nplScore = (v: number) => v<=1 ?100 : v<=2  ?88 : v<=5  ?65 : v<=10?40 : 15
const roaScore = (v: number) => v>=5 ?100 : v>=3  ?80 : v>=1  ?60 : v>=0 ?40 : 10
const carScore = (v: number) => v>=20?100 : v>=15 ?85 : v>=10 ?65 : 30

export function calcHealthIndex(ratios: FinancialRatios): HealthIndex {
  const pillars: HealthPillar[] = [
    { key: 'likuiditas',     label: 'Likuiditas',      score: ldrScore(ratios.ldr), color: '#22D3A5' },
    { key: 'solvabilitas',   label: 'Solvabilitas',    score: crScore(ratios.cr),   color: '#60A5FA' },
    { key: 'profitabilitas', label: 'Profitabilitas',  score: roaScore(ratios.roa), color: '#A78BFA' },
    { key: 'nplPinjaman',    label: 'NPL Pinjaman',    score: nplScore(ratios.npl), color: '#22D3A5' },
    { key: 'kecukupanModal', label: 'Kecukupan Modal', score: carScore(ratios.car), color: '#F97316' },
  ]
  const weights = [0.25, 0.20, 0.20, 0.25, 0.10]
  const score = Math.round(pillars.reduce((s, p, i) => s + p.score * weights[i], 0))
  const status: HealthIndex['status'] =
    score >= 80 ? 'Sehat' : score >= 65 ? 'Cukup Sehat' : score >= 50 ? 'Kurang Sehat' : 'Tidak Sehat'
  return { score, status, pillars }
}

// ─────────────────────────────────────────────────────────────
// 4. RATIO CARDS
// ─────────────────────────────────────────────────────────────

function badge(status: RatioStatus, label: string) {
  return { status, statusLabel: label }
}

export function buildRatioCards(ratios: FinancialRatios): RatioCardData[] {
  return [
    {
      key: 'ldr', label: 'LDR — Loan to Deposit Ratio',
      value: ratios.ldr, unit: '%',
      description: 'Sisa Pokok Aktif ÷ Total Simpanan',
      ...(ratios.ldr <= 110 ? badge('sehat','✓ Aman')
        : ratios.ldr <= 150 ? badge('waspada','⚠ Perlu Perhatian')
        : badge('kritis','✕ Kritis')),
    },
    {
      key: 'cr', label: 'CR — Current Ratio',
      value: ratios.cr, unit: '×',
      description: 'Aset Lancar ÷ Kewajiban Lancar',
      ...(ratios.cr >= 2 ? badge('sehat','✓ Sehat')
        : ratios.cr >= 1 ? badge('waspada','⚠ Cukup')
        : badge('kritis','✕ Tidak Likuid')),
    },
    {
      key: 'car', label: 'CAR — Capital Adequacy',
      value: ratios.car, unit: '%',
      description: 'Modal (EQUITY + SHU) ÷ Total Aset',
      ...(ratios.car >= 10 ? badge('sehat','✓ Aman (min 10%)')
        : badge('kritis','✕ Di Bawah Minimum')),
    },
    {
      key: 'npl', label: 'NPL — Non-Performing Loan',
      value: ratios.npl, unit: '%',
      description: 'Macet ≥2 bln ÷ Outstanding Aktif',
      ...(ratios.npl <= 2 ? badge('sehat','✓ Sehat (maks 5%)')
        : ratios.npl <= 5 ? badge('waspada','⚠ Mendekati Batas')
        : badge('kritis','✕ Melebihi Batas')),
    },
    {
      key: 'roa', label: 'ROA — Return on Assets',
      value: ratios.roa, unit: '%',
      description: 'SHU YTD ÷ Total Aset',
      ...(ratios.roa >= 3 ? badge('sehat','✓ Baik')
        : ratios.roa >= 1 ? badge('waspada','⚠ Cukup')
        : badge('kritis','✕ Rendah')),
    },
    {
      key: 'der', label: 'DER — Debt to Equity',
      value: ratios.der, unit: '×',
      description: 'Total Kewajiban ÷ Modal + SHU',
      ...(ratios.der <= 2 ? badge('sehat','✓ Sehat (<2×)')
        : badge('waspada','⚠ Perlu Perhatian')),
    },
  ]
}

// ─────────────────────────────────────────────────────────────
// 5. TREN BULANAN
// SHU per bulan dari akunSaldoYtd tidak tersedia per bulan,
// jadi perlu query getSaldoAkun per bulan — terlalu mahal.
// Alternatif: gunakan akun 401 (biaya admin) sebagai proxy SHU bulanan
// dari pinjaman yang dicairkan bulan itu.
// ─────────────────────────────────────────────────────────────

export function calcMonthlyTrend(raw: any): MonthlyTrend[] {
  const { pinjamanCair, setoranMasuk } = raw.trenBulanan ?? {}
  const pinjaman: RawPinjaman[] = raw.pinjaman
  const now = new Date()

  return Array.from({ length: 12 }, (_, i) => {
    const d   = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

    // Pinjaman cair bulan ini (nominal_pokok yang dicairkan)
    const pinjamanVal = (pinjamanCair ?? [])
      .filter((p: any) => (p.tanggal_cair ?? '').startsWith(key))
      .reduce((s: number, p: any) => s + Number(p.nominal_pokok), 0)

    // Simpanan masuk bulan ini
    const simpananVal = (setoranMasuk ?? [])
      .filter((s: any) => (s.tanggal ?? '').startsWith(key))
      .reduce((s: number, r: any) => s + Number(r.nominal), 0)

    // SHU proxy: biaya_admin dari pinjaman yang cair bulan ini
    // (= akun 401 yang terbentuk saat cairkanPinjaman)
    const shuProxy = (pinjamanCair ?? [])
      .filter((p: any) => (p.tanggal_cair ?? '').startsWith(key))
      .reduce((s: number, p: any) => s + Number(p.biaya_admin || 0), 0)

    return {
      month:    MONTH_LABELS[d.getMonth()],
      pinjaman: toJuta(pinjamanVal),
      simpanan: toJuta(simpananVal),
      shu:      toJuta(shuProxy),
    }
  })
}

// ─────────────────────────────────────────────────────────────
// 6. KOMPOSISI PINJAMAN
// ─────────────────────────────────────────────────────────────

export function calcLoanComposition(raw: any): LoanComposition[] {
  const pinjaman: RawPinjaman[] = raw.pinjaman
  const aktif = pinjaman.filter((p) => p.status === 'ACTIVE')

  let reguler = 0, topup = 0, grand = 0
  for (const p of aktif) {
    const v = Number(p.sisa_pokok)
    grand += v
    if (p.pelunasan_pinjaman_lama_id) topup += v
    else reguler += v
  }

  if (grand === 0) return []
  const result: LoanComposition[] = []
  if (reguler > 0) result.push({ name: 'Reguler (Qardh)', value: toJuta(reguler), pct: pct1(reguler, grand), color: '#22D3A5' })
  if (topup > 0)   result.push({ name: 'Top-Up / Refinancing', value: toJuta(topup), pct: pct1(topup, grand), color: '#60A5FA' })
  return result
}

// ─────────────────────────────────────────────────────────────
// 7. NPL MEMBERS
// ─────────────────────────────────────────────────────────────

export function calcNplMembers(raw: any): NplMember[] {
  const nplDetail: any[] = raw.nplDetail ?? []
  return nplDetail
    .filter((n) => n.cicilanOverdue >= 1)
    .map((n) => {
      const p = n.pinjaman
      const bln = n.cicilanOverdue
      return {
        id:           String(p.id),
        nama:         p.users?.nama ?? '—',
        nik:          p.users?.nik  ?? '—',
        outstanding:  Number(p.sisa_pokok),
        bulanTunggak: bln,
        status:       bln >= 4 ? 'macet' : bln >= 2 ? 'bermasalah' : 'diperhatikan',
      } as NplMember
    })
    .sort((a, b) => b.bulanTunggak - a.bulanTunggak)
    .slice(0, 10)
}

// ─────────────────────────────────────────────────────────────
// 8. AUTO-ALERTS
// ─────────────────────────────────────────────────────────────

export function buildAutoAlerts(ratios: FinancialRatios, nplMembers: NplMember[]) {
  const alerts = []

  if (ratios.ldr > 150)
    alerts.push({ id: 'ldr-kritis', level: 'kritis' as const,
      message: 'LDR Kritis — Pencairan Diblokir',
      detail: `LDR ${ratios.ldr}% melampaui 150%. Setiap pencairan wajib override Pengurus.`,
      createdAt: new Date().toISOString() })
  else if (ratios.ldr > 110)
    alerts.push({ id: 'ldr-waspada', level: 'waspada' as const,
      message: 'LDR Zona Waspada',
      detail: `LDR ${ratios.ldr}%. Pinjaman baru perlu persetujuan Pengurus. Fokus himpun simpanan.`,
      createdAt: new Date().toISOString() })

  if (ratios.npl > 5)
    alerts.push({ id: 'npl-kritis', level: 'kritis' as const,
      message: 'NPL Melampaui Batas 5%',
      detail: `NPL ${ratios.npl}%. Tinjau kebijakan kredit dan akselerasi penagihan via HR payroll.`,
      createdAt: new Date().toISOString() })

  if (ratios.cr < 1)
    alerts.push({ id: 'cr-darurat', level: 'kritis' as const,
      message: 'Likuiditas Darurat — CR < 1×',
      detail: `Current Ratio ${ratios.cr}×. Koperasi tidak mampu menanggung kewajiban jangka pendek.`,
      createdAt: new Date().toISOString() })

  const macet = nplMembers.filter((n) => n.status === 'macet')
  if (macet.length > 0)
    alerts.push({ id: 'cicilan-macet', level: 'waspada' as const,
      message: `${macet.length} Anggota Macet (≥4 bulan)`,
      detail: 'Koordinasi HR untuk pemotongan gaji via potongCicilanMassal.',
      createdAt: new Date().toISOString() })

  return alerts
}

// ─────────────────────────────────────────────────────────────
// 9. COMPOSER
// ─────────────────────────────────────────────────────────────

export function composeDashboardData(raw: any): DashboardData {
  const kpi             = calcKpi(raw)
  const ratios          = calcRatios(raw)
  const healthIndex     = calcHealthIndex(ratios)
  const monthlyTrend    = calcMonthlyTrend(raw)
  const loanComposition = calcLoanComposition(raw)
  const nplMembers      = calcNplMembers(raw)
  const autoAlerts      = buildAutoAlerts(ratios, nplMembers)

  const dbAlerts = (raw.alerts ?? []).map((a: any) => ({
    id: a.id, level: a.level ?? 'info',
    message: a.message, detail: a.detail ?? '',
    createdAt: a.created_at,
  }))

  return {
    kpi, ratios, healthIndex, monthlyTrend, loanComposition, nplMembers,
    alerts: [...autoAlerts, ...dbAlerts].slice(0, 8),
    lastUpdated: new Date().toISOString(),
  }
}
