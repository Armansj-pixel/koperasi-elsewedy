// ─────────────────────────────────────────
// Dashboard Types — Koperasi Karyawan
// ─────────────────────────────────────────

export interface DashboardKpi {
  totalAset: number
  totalPinjaman: number
  totalSimpanan: number
  shuYtd: number
  totalAnggota: number
  anggotaAktif: number
  // YoY changes (%)
  asetChange: number
  pinjamanChange: number
  simpananChange: number
  shuChange: number
}

export interface FinancialRatios {
  ldr: number          // Loan to Deposit Ratio (%)
  cr: number           // Current Ratio (x)
  car: number          // Capital Adequacy Ratio (%)
  npl: number          // Non-Performing Loan (%)
  roa: number          // Return on Assets (%)
  der: number          // Debt to Equity Ratio (x)
}

export type RatioStatus = 'sehat' | 'waspada' | 'kritis' | 'info'

export interface RatioCardData {
  key: keyof FinancialRatios
  label: string
  value: number
  unit: string
  description: string
  status: RatioStatus
  statusLabel: string
  threshold?: string
}

export interface HealthPillar {
  key: string
  label: string
  score: number       // 0–100
  color: string
}

export interface HealthIndex {
  score: number       // 0–100 composite
  status: 'Sehat' | 'Cukup Sehat' | 'Kurang Sehat' | 'Tidak Sehat'
  pillars: HealthPillar[]
}

export interface MonthlyTrend {
  month: string       // e.g. "Jul", "Agu"
  simpanan: number    // in millions IDR
  pinjaman: number
  shu: number
}

export interface LoanComposition {
  name: string
  value: number       // in millions IDR
  pct: number
  color: string
}

export interface NplMember {
  id: string
  nama: string
  nik: string
  outstanding: number
  bulanTunggak: number
  status: 'diperhatikan' | 'bermasalah' | 'macet'
}

export interface SystemAlert {
  id: string
  level: 'kritis' | 'waspada' | 'info'
  message: string
  detail: string
  createdAt: string
}

export interface DashboardData {
  kpi: DashboardKpi
  ratios: FinancialRatios
  healthIndex: HealthIndex
  monthlyTrend: MonthlyTrend[]
  loanComposition: LoanComposition[]
  nplMembers: NplMember[]
  alerts: SystemAlert[]
  lastUpdated: string
}
