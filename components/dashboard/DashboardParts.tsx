'use client'

// ─────────────────────────────────────────
// components/dashboard/DashboardParts.tsx
// Semua sub-komponen dashboard dalam satu file (Refactored to Light/Clean Mode)
// ─────────────────────────────────────────

import type {
  DashboardKpi,
  RatioCardData,
  FinancialRatios,
  HealthIndex,
  NplMember,
  SystemAlert,
  LoanComposition,
  MonthlyTrend,
} from '@/types/dashboard'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

// ── Formatters ──────────────────────────────────────────────

export function formatRupiah(n: number, isJuta = true): string {
  if (isJuta) {
    if (n >= 1000) return `Rp ${(n / 1000).toFixed(1)}M`
    return `Rp ${n.toLocaleString('id')} jt`
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n)
}

// ── Status color map ────────────────────────────────────────

const STATUS_COLORS = {
  sehat:   { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  waspada: { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200' },
  kritis:  { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200' },
  info:    { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
}

const NPL_STATUS = {
  diperhatikan: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Diperhatikan' },
  bermasalah:   { bg: 'bg-red-50',    text: 'text-red-700',    label: 'Bermasalah' },
  macet:        { bg: 'bg-rose-100',  text: 'text-rose-800',   label: 'Macet' },
}

// ─────────────────────────────────────────────────────────────────────
// KPI CARD
// ─────────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: string
  change: number
  changeLabel?: string
}

export function KpiCard({ label, value, change, changeLabel }: KpiCardProps) {
  const isUp = change >= 0
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">
        {label}
      </div>
      <div className="mb-2 text-2xl font-black text-slate-900 tracking-tight">
        {value}
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold ${isUp ? 'text-emerald-600' : 'text-red-600'}`}>
        <span>{isUp ? '▲' : '▼'}</span>
        <span>{Math.abs(change)}% <span className="text-slate-500 font-medium ml-1">{changeLabel ?? 'vs tahun lalu'}</span></span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// RATIO CARD
// ─────────────────────────────────────────────────────────────────────

export function RatioCard({ card }: { card: RatioCardData }) {
  const c = STATUS_COLORS[card.status]
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">
        {card.label}
      </div>
      <div className="mb-1 text-[28px] font-black leading-none text-slate-900">
        {card.value}
        <span className="ml-1 text-lg font-semibold text-slate-400">{card.unit}</span>
      </div>
      <div className="mb-3 text-xs font-medium text-slate-500">{card.description}</div>
      <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-[11px] font-bold ${c.bg} ${c.text} ${c.border}`}>
        {card.statusLabel}
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// HEALTH GAUGE (SVG arc, no external lib)
// ─────────────────────────────────────────────────────────────────────

export function HealthGauge({ healthIndex }: { healthIndex: HealthIndex }) {
  const { score, status, pillars } = healthIndex

  // SVG arc parameters
  const R = 70
  const CX = 90
  const CY = 90
  const startAngle = -210
  const sweepAngle = 240
  const endAngle = startAngle + sweepAngle * (score / 100)

  function polar(cx: number, cy: number, r: number, deg: number) {
    const rad = (deg * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  function arc(cx: number, cy: number, r: number, a1: number, a2: number) {
    const s = polar(cx, cy, r, a1)
    const e = polar(cx, cy, r, a2)
    const large = Math.abs(a2 - a1) > 180 ? 1 : 0
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
  }

  const trackColor = '#f1f5f9' // slate-100
  const fillColor = score >= 80 ? '#10b981' : score >= 65 ? '#3b82f6' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
      <div className="mb-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">
        Indeks Kesehatan Koperasi
      </div>

      <div className="relative mb-4">
        <svg width="180" height="140" viewBox="0 0 180 140">
          {/* Track */}
          <path d={arc(CX, CY, R, startAngle, startAngle + sweepAngle)} fill="none" stroke={trackColor} strokeWidth="14" strokeLinecap="round" />
          {/* Fill */}
          <path d={arc(CX, CY, R, startAngle, endAngle)} fill="none" stroke={fillColor} strokeWidth="14" strokeLinecap="round" />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          <span className="text-[40px] font-black leading-none text-slate-900 tracking-tighter">
            {score}
          </span>
          <span className="text-sm font-bold text-slate-400">/ 100</span>
        </div>
      </div>

      <div className="mb-6 rounded-full px-4 py-1 text-sm font-bold border" style={{ background: fillColor + '15', color: fillColor, borderColor: fillColor + '30' }}>
        ● {status.toUpperCase()}
      </div>

      {/* Pillars */}
      <div className="w-full space-y-3">
        {pillars.map((p) => (
          <div key={p.key} className="flex items-center gap-3 text-xs font-semibold">
            <span className="w-24 shrink-0 text-slate-600">{p.label}</span>
            <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${p.score}%`, background: p.color }} />
            </div>
            <span className="w-8 text-right font-bold" style={{ color: p.color }}>
              {p.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// SAFETY METER
// ─────────────────────────────────────────────────────────────────────

interface SafetyMeterProps {
  ratios: FinancialRatios
}

export function SafetyMeter({ ratios }: SafetyMeterProps) {
  const ldrPct = Math.min((ratios.ldr / 160) * 100, 100)
  const ldrColor = ratios.ldr <= 110 ? '#10b981' : ratios.ldr <= 150 ? '#f59e0b' : '#ef4444' // emerald, orange, red
  const ldrZone = ratios.ldr <= 110 ? 'HIJAU (Aman)' : ratios.ldr <= 150 ? 'KUNING (Waspada)' : 'MERAH (Kritis)'
  const ldrZoneColor = ratios.ldr <= 110 ? 'text-emerald-600' : ratios.ldr <= 150 ? 'text-orange-600' : 'text-red-600'
  const ldrAdvice =
    ratios.ldr <= 110
      ? { bg: 'bg-emerald-50 border-emerald-200 text-emerald-800', msg: '✓ LDR dalam batas aman. Pemberian pinjaman baru dapat dilanjutkan.' }
      : ratios.ldr <= 150
      ? { bg: 'bg-orange-50 border-orange-200 text-orange-800', msg: '⚠ Batasi pinjaman baru. Fokus pada penghimpunan simpanan anggota.' }
      : { bg: 'bg-red-50 border-red-200 text-red-800', msg: '✕ Kritis! Pinjaman baru diblokir. Segera rapat pengurus.' }

  const crPct = Math.min((ratios.cr / 4) * 100, 100)
  const crColor = ratios.cr >= 2 ? '#10b981' : ratios.cr >= 1 ? '#f59e0b' : '#ef4444'
  const crZone = ratios.cr >= 2 ? 'HIJAU (Aman)' : ratios.cr >= 1 ? 'KUNING (Cukup)' : 'MERAH (Bahaya)'
  const crZoneColor = ratios.cr >= 2 ? 'text-emerald-600' : ratios.cr >= 1 ? 'text-orange-600' : 'text-red-600'
  const crAdvice =
    ratios.cr >= 2
      ? { bg: 'bg-emerald-50 border-emerald-200 text-emerald-800', msg: '✓ Likuiditas sangat sehat untuk menanggung seluruh kewajiban jangka pendek.' }
      : ratios.cr >= 1
      ? { bg: 'bg-orange-50 border-orange-200 text-orange-800', msg: '⚠ Likuiditas tipis. Tunda pengeluaran tidak mendesak.' }
      : { bg: 'bg-red-50 border-red-200 text-red-800', msg: '✕ Bahaya! Tidak mampu bayar kewajiban jangka pendek. Tindakan darurat diperlukan.' }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {/* LDR */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-1 text-sm font-bold text-slate-800">LDR Monitor</div>
        <div className="mb-4 text-xs font-medium text-slate-500">Loan-to-Deposit Ratio — ambang batas pemberian pinjaman</div>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-3xl font-black text-slate-900 tracking-tighter">{ratios.ldr}%</span>
          <span className="text-xs font-medium text-slate-500">
            Zona: <span className={`font-bold ${ldrZoneColor}`}>{ldrZone}</span>
          </span>
        </div>
        <div className="mb-2 h-4 overflow-hidden rounded-full bg-slate-100 border border-slate-200/50">
          <div className="h-full rounded-full transition-all duration-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]" style={{ width: `${ldrPct}%`, background: `linear-gradient(to right, #10b981, ${ldrColor})` }} />
        </div>
        <div className="mb-4 flex justify-between text-[10px] font-bold text-slate-400">
          <span>0%</span>
          <span className="text-emerald-600">Aman &lt;110%</span>
          <span className="text-orange-500">Waspada 110–150%</span>
          <span className="text-red-600">Kritis &gt;150%</span>
          <span>160%</span>
        </div>
        <div className={`rounded-xl border p-3.5 text-xs font-semibold shadow-sm ${ldrAdvice.bg}`}>
          {ldrAdvice.msg}
        </div>
      </div>

      {/* CR */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-1 text-sm font-bold text-slate-800">Current Ratio Monitor</div>
        <div className="mb-4 text-xs font-medium text-slate-500">Kemampuan membayar kewajiban jangka pendek</div>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-3xl font-black text-slate-900 tracking-tighter">{ratios.cr}×</span>
          <span className="text-xs font-medium text-slate-500">
            Zona: <span className={`font-bold ${crZoneColor}`}>{crZone}</span>
          </span>
        </div>
        <div className="mb-2 h-4 overflow-hidden rounded-full bg-slate-100 border border-slate-200/50">
          <div className="h-full rounded-full transition-all duration-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]" style={{ width: `${crPct}%`, background: `linear-gradient(to right, #ef4444, #f59e0b, ${crColor})` }} />
        </div>
        <div className="mb-4 flex justify-between text-[10px] font-bold text-slate-400">
          <span>0×</span>
          <span className="text-red-600">Bahaya &lt;1×</span>
          <span className="text-orange-500">Waspada 1–1.5×</span>
          <span className="text-emerald-600">Aman &gt;2×</span>
          <span>4×</span>
        </div>
        <div className={`rounded-xl border p-3.5 text-xs font-semibold shadow-sm ${crAdvice.bg}`}>
          {crAdvice.msg}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// TREND CHART
// ─────────────────────────────────────────────────────────────────────

const tooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  color: '#0f172a',
  fontSize: '12px',
  fontWeight: '600',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
}

export function TrendChart({ data }: { data: MonthlyTrend[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-1 text-sm font-bold text-slate-800">
        Pertumbuhan Simpanan vs Pinjaman
      </div>
      <div className="mb-6 text-xs font-medium text-slate-500">12 bulan terakhir (Rp Juta)</div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gSimpanan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gPinjaman" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}jt`} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`Rp ${v} jt`, '']} />
          <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#475569', paddingTop: '10px' }} />
          <Area type="monotone" dataKey="simpanan" name="Simpanan" stroke="#10b981" strokeWidth={3} fill="url(#gSimpanan)" dot={{ strokeWidth: 2, r: 4, fill: '#fff' }} activeDot={{ r: 6 }} />
          <Area type="monotone" dataKey="pinjaman" name="Pinjaman" stroke="#f59e0b" strokeWidth={3} fill="url(#gPinjaman)" dot={{ strokeWidth: 2, r: 4, fill: '#fff' }} activeDot={{ r: 6 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ShuChart({ data }: { data: MonthlyTrend[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-1 text-sm font-bold text-slate-800">Tren SHU Bulanan</div>
      <div className="mb-6 text-xs font-medium text-slate-500">Pendapatan bersih koperasi (Rp Juta)</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}jt`} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f8fafc' }} formatter={(v: number) => [`Rp ${v} jt`, 'SHU Bersih']} />
          <Bar dataKey="shu" name="SHU" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={i === data.length - 1 ? '#3b82f6' : '#bfdbfe'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function LoanCompositionChart({ data }: { data: LoanComposition[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
      <div className="mb-1 text-sm font-bold text-slate-800">Komposisi Produk Pinjaman Aktif</div>
      <div className="mb-5 text-xs font-medium text-slate-500">Distribusi outstanding piutang per jenis akad</div>
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[250px_1fr]">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} strokeWidth={0}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`Rp ${v} jt`, '']} />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-5 py-3 transition hover:shadow-sm">
              <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                <span className="h-3 w-3 shrink-0 rounded-full shadow-sm" style={{ background: item.color }} />
                {item.name}
              </div>
              <div className="text-sm font-black text-slate-900 tracking-tight">
                {formatRupiah(item.value)}{' '}
                <span className="text-xs font-semibold text-slate-400 ml-1">({item.pct}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// NPL TABLE
// ─────────────────────────────────────────────────────────────────────

export function NplTable({ members }: { members: NplMember[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
        <div className="text-sm font-bold text-slate-800">Daftar Pinjaman Menunggak (NPL)</div>
        {members.length > 0 && (
          <span className="rounded-full bg-red-100 px-3 py-1 text-[11px] font-bold text-red-700 shadow-sm border border-red-200">
            {members.length} Kasus Aktif
          </span>
        )}
      </div>
      {members.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm font-bold text-emerald-600 bg-emerald-50/30">
          <div className="text-3xl mb-2">🎉</div>
          Portofolio kredit sangat sehat. Tidak ada tunggakan.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Anggota', 'Outstanding', 'Tunggakan', 'Status'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const s = NPL_STATUS[m.status]
                return (
                  <tr key={m.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/80 last:border-0">
                    <td className="px-5 py-4 text-sm font-bold text-slate-800">{m.nama}</td>
                    <td className="px-5 py-4 text-sm font-semibold tabular-nums text-slate-600">
                      {formatRupiah(m.outstanding / 1_000_000)}
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-red-500">{m.bulanTunggak} bln</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-bold border shadow-sm ${s.bg} ${s.text}`}>
                        {s.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// ALERT PANEL
// ─────────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  return `${days} hari lalu`
}

const ALERT_DOT: Record<string, string> = {
  kritis: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]',
  waspada: 'bg-orange-400',
  info: 'bg-blue-500',
}

export function AlertPanel({ alerts }: { alerts: SystemAlert[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
        <div className="text-sm font-bold text-slate-800">Notifikasi & Rekomendasi AI</div>
        {alerts.filter((a) => a.level === 'kritis').length > 0 && (
          <span className="rounded-full bg-red-100 px-3 py-1 text-[11px] font-bold text-red-700 border border-red-200 shadow-sm animate-pulse">
            {alerts.filter((a) => a.level === 'kritis').length} Peringatan
          </span>
        )}
      </div>
      <div className="divide-y divide-slate-100 overflow-y-auto max-h-[400px]">
        {alerts.length === 0 && (
          <div className="px-6 py-12 text-center text-sm font-bold text-slate-400">
            Sistem beroperasi normal tanpa anomali.
          </div>
        )}
        {alerts.map((a) => (
          <div key={a.id} className="flex gap-4 px-6 py-5 transition hover:bg-slate-50">
            <div className="mt-1">
               <span className={`block h-2.5 w-2.5 rounded-full ${ALERT_DOT[a.level] ?? 'bg-slate-400'}`} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800">{a.message}</div>
              <div className="mt-1.5 text-xs font-medium leading-relaxed text-slate-500">{a.detail}</div>
              <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{timeAgo(a.createdAt)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
