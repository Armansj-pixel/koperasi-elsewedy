'use client'

// ─────────────────────────────────────────
// components/dashboard/DashboardParts.tsx
// Semua sub-komponen dashboard dalam satu file
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
  sehat:   { bg: 'bg-teal-500/10',   text: 'text-teal-400',   border: 'border-teal-500/20' },
  waspada: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  kritis:  { bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/20' },
  info:    { bg: 'bg-blue-500/10',   text: 'text-blue-400',   border: 'border-blue-500/20' },
}

const NPL_STATUS = {
  diperhatikan: { bg: 'bg-orange-500/10', text: 'text-orange-400', label: 'Diperhatikan' },
  bermasalah:   { bg: 'bg-red-500/10',    text: 'text-red-400',    label: 'Bermasalah' },
  macet:        { bg: 'bg-red-600/20',    text: 'text-red-300',    label: 'Macet' },
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
    <div className="rounded-2xl border border-white/[0.07] bg-[#1A2540] p-5">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        {label}
      </div>
      <div className="mb-2 font-['DM_Serif_Display',serif] text-2xl text-white">
        {value}
      </div>
      <div className={`flex items-center gap-1 text-xs font-medium ${isUp ? 'text-teal-400' : 'text-red-400'}`}>
        <span>{isUp ? '▲' : '▼'}</span>
        <span>{Math.abs(change)}% {changeLabel ?? 'vs tahun lalu'}</span>
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
    <div className="rounded-2xl border border-white/[0.07] bg-[#1A2540] p-5">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        {card.label}
      </div>
      <div className="mb-1 font-['DM_Serif_Display',serif] text-[28px] leading-none text-white">
        {card.value}
        <span className="ml-1 text-lg text-slate-400">{card.unit}</span>
      </div>
      <div className="mb-3 text-xs text-slate-400">{card.description}</div>
      <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-[11px] font-semibold ${c.bg} ${c.text} ${c.border}`}>
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

  const trackColor = 'rgba(255,255,255,0.06)'
  const fillColor = score >= 80 ? '#22D3A5' : score >= 65 ? '#60A5FA' : score >= 50 ? '#F97316' : '#EF4444'

  return (
    <div className="flex flex-col items-center rounded-2xl border border-white/[0.07] bg-[#1A2540] p-7">
      <div className="mb-5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        Indeks Kesehatan Koperasi
      </div>

      <div className="relative mb-4">
        <svg width="180" height="140" viewBox="0 0 180 140">
          {/* Track */}
          <path
            d={arc(CX, CY, R, startAngle, startAngle + sweepAngle)}
            fill="none"
            stroke={trackColor}
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Fill */}
          <path
            d={arc(CX, CY, R, startAngle, endAngle)}
            fill="none"
            stroke={fillColor}
            strokeWidth="12"
            strokeLinecap="round"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          <span className="font-['DM_Serif_Display',serif] text-[40px] leading-none text-white">
            {score}
          </span>
          <span className="text-sm text-slate-500">/ 100</span>
        </div>
      </div>

      <div
        className="mb-6 rounded-full px-4 py-1 text-sm font-semibold"
        style={{
          background: fillColor + '20',
          color: fillColor,
        }}
      >
        ● {status.toUpperCase()}
      </div>

      {/* Pillars */}
      <div className="w-full space-y-2.5">
        {pillars.map((p) => (
          <div key={p.key} className="flex items-center gap-2 text-xs">
            <span className="w-24 shrink-0 text-slate-400">{p.label}</span>
            <div className="h-[4px] flex-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${p.score}%`, background: p.color }}
              />
            </div>
            <span className="w-6 text-right font-semibold" style={{ color: p.color }}>
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
  const ldrColor = ratios.ldr <= 110 ? '#22D3A5' : ratios.ldr <= 150 ? '#F97316' : '#EF4444'
  const ldrZone = ratios.ldr <= 110 ? 'HIJAU (Aman)' : ratios.ldr <= 150 ? 'KUNING (Waspada)' : 'MERAH (Kritis)'
  const ldrZoneColor = ratios.ldr <= 110 ? 'text-teal-400' : ratios.ldr <= 150 ? 'text-orange-400' : 'text-red-400'
  const ldrAdvice =
    ratios.ldr <= 110
      ? { bg: 'bg-teal-500/10 border-teal-500/20 text-teal-400', msg: '✓ LDR dalam batas aman. Pemberian pinjaman baru dapat dilanjutkan.' }
      : ratios.ldr <= 150
      ? { bg: 'bg-orange-500/10 border-orange-500/20 text-orange-400', msg: '⚠ Batasi pinjaman baru. Fokus pada penghimpunan simpanan anggota.' }
      : { bg: 'bg-red-500/10 border-red-500/20 text-red-400', msg: '✕ Kritis! Pinjaman baru diblokir. Segera rapat pengurus.' }

  const crPct = Math.min((ratios.cr / 4) * 100, 100)
  const crColor = ratios.cr >= 2 ? '#22D3A5' : ratios.cr >= 1 ? '#F97316' : '#EF4444'
  const crZone = ratios.cr >= 2 ? 'HIJAU (Aman)' : ratios.cr >= 1 ? 'KUNING (Cukup)' : 'MERAH (Bahaya)'
  const crZoneColor = ratios.cr >= 2 ? 'text-teal-400' : ratios.cr >= 1 ? 'text-orange-400' : 'text-red-400'
  const crAdvice =
    ratios.cr >= 2
      ? { bg: 'bg-teal-500/10 border-teal-500/20 text-teal-400', msg: '✓ Likuiditas cukup untuk menanggung seluruh kewajiban jangka pendek.' }
      : ratios.cr >= 1
      ? { bg: 'bg-orange-500/10 border-orange-500/20 text-orange-400', msg: '⚠ Likuiditas tipis. Tunda pengeluaran tidak mendesak.' }
      : { bg: 'bg-red-500/10 border-red-500/20 text-red-400', msg: '✕ Bahaya! Tidak mampu bayar kewajiban jangka pendek. Tindakan darurat diperlukan.' }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {/* LDR */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#1A2540] p-6">
        <div className="mb-1 text-sm font-semibold text-slate-200">LDR Monitor</div>
        <div className="mb-4 text-xs text-slate-400">Loan-to-Deposit Ratio — ambang batas pemberian pinjaman</div>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="font-['DM_Serif_Display',serif] text-3xl text-white">{ratios.ldr}%</span>
          <span className="text-xs text-slate-400">
            Zona: <span className={`font-semibold ${ldrZoneColor}`}>{ldrZone}</span>
          </span>
        </div>
        <div className="mb-2 h-3 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${ldrPct}%`, background: `linear-gradient(to right, #22D3A5, ${ldrColor})` }}
          />
        </div>
        <div className="mb-4 flex justify-between text-[10px] text-slate-500">
          <span>0%</span>
          <span className="text-teal-500">Aman &lt;110%</span>
          <span className="text-orange-500">Waspada 110–150%</span>
          <span className="text-red-500">Kritis &gt;150%</span>
          <span>160%</span>
        </div>
        <div className={`rounded-xl border p-3 text-xs ${ldrAdvice.bg}`}>
          {ldrAdvice.msg}
        </div>
      </div>

      {/* CR */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#1A2540] p-6">
        <div className="mb-1 text-sm font-semibold text-slate-200">Current Ratio Monitor</div>
        <div className="mb-4 text-xs text-slate-400">Kemampuan membayar kewajiban jangka pendek</div>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="font-['DM_Serif_Display',serif] text-3xl text-white">{ratios.cr}×</span>
          <span className="text-xs text-slate-400">
            Zona: <span className={`font-semibold ${crZoneColor}`}>{crZone}</span>
          </span>
        </div>
        <div className="mb-2 h-3 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${crPct}%`, background: `linear-gradient(to right, #EF4444, #F97316, ${crColor})` }}
          />
        </div>
        <div className="mb-4 flex justify-between text-[10px] text-slate-500">
          <span>0×</span>
          <span className="text-red-500">Bahaya &lt;1×</span>
          <span className="text-orange-500">Waspada 1–1.5×</span>
          <span className="text-teal-500">Aman &gt;2×</span>
          <span>4×</span>
        </div>
        <div className={`rounded-xl border p-3 text-xs ${crAdvice.bg}`}>
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
  backgroundColor: '#1A2540',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '10px',
  color: '#E2E8F0',
  fontSize: '12px',
}

export function TrendChart({ data }: { data: MonthlyTrend[] }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#1A2540] p-6">
      <div className="mb-1 text-sm font-semibold text-slate-200">
        Pertumbuhan Simpanan vs Pinjaman
      </div>
      <div className="mb-5 text-xs text-slate-400">12 bulan terakhir (Rp Juta)</div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gSimpanan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22D3A5" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22D3A5" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gPinjaman" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}jt`} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`Rp ${v} jt`, '']} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} />
          <Area type="monotone" dataKey="simpanan" name="Simpanan" stroke="#22D3A5" strokeWidth={2} fill="url(#gSimpanan)" dot={false} />
          <Area type="monotone" dataKey="pinjaman" name="Pinjaman" stroke="#F97316" strokeWidth={2} fill="url(#gPinjaman)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ShuChart({ data }: { data: MonthlyTrend[] }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#1A2540] p-6">
      <div className="mb-1 text-sm font-semibold text-slate-200">SHU Bulanan</div>
      <div className="mb-5 text-xs text-slate-400">Pendapatan bersih koperasi (Rp Juta)</div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}jt`} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`Rp ${v} jt`, 'SHU']} />
          <Bar dataKey="shu" name="SHU" radius={[5, 5, 0, 0]}>
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={i === data.length - 1 ? '#22D3A5' : 'rgba(96,165,250,0.5)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function LoanCompositionChart({ data }: { data: LoanComposition[] }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#1A2540] p-6 md:col-span-2">
      <div className="mb-1 text-sm font-semibold text-slate-200">Komposisi Pinjaman Aktif</div>
      <div className="mb-5 text-xs text-slate-400">Distribusi outstanding per produk</div>
      <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[200px_1fr]">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`Rp ${v} jt`, '']} />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2.5">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-2.5"
            >
              <div className="flex items-center gap-2.5 text-xs text-slate-400">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: item.color }} />
                {item.name}
              </div>
              <div className="text-sm font-semibold text-slate-200">
                {formatRupiah(item.value)}{' '}
                <span className="text-xs font-normal text-slate-500">{item.pct}%</span>
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
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#1A2540]">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4">
        <div className="text-sm font-semibold text-slate-200">Pinjaman Menunggak (NPL)</div>
        {members.length > 0 && (
          <span className="rounded-full bg-red-500/10 px-3 py-0.5 text-[11px] font-semibold text-red-400">
            {members.length} Anggota
          </span>
        )}
      </div>
      {members.length === 0 ? (
        <div className="px-6 py-10 text-center text-sm text-slate-500">
          ✓ Tidak ada pinjaman bermasalah saat ini.
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="bg-black/10">
              {['Anggota', 'Outstanding', 'Tunggakan', 'Status'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const s = NPL_STATUS[m.status]
              return (
                <tr key={m.id} className="border-t border-white/[0.05] transition-colors hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-200">{m.nama}</td>
                  <td className="px-5 py-3.5 text-sm tabular-nums text-slate-400">
                    {formatRupiah(m.outstanding / 1_000_000)}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-400">{m.bulanTunggak} bulan</td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-3 py-0.5 text-[11px] font-semibold ${s.bg} ${s.text}`}>
                      {s.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
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
  kritis: 'bg-red-500',
  waspada: 'bg-orange-400',
  info: 'bg-teal-400',
}

export function AlertPanel({ alerts }: { alerts: SystemAlert[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#1A2540]">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
        <div className="text-sm font-semibold text-slate-200">Notifikasi Sistem</div>
        {alerts.filter((a) => a.level === 'kritis').length > 0 && (
          <span className="rounded-full bg-red-500/10 px-3 py-0.5 text-[11px] font-semibold text-red-400">
            {alerts.filter((a) => a.level === 'kritis').length} Kritis
          </span>
        )}
      </div>
      <div className="divide-y divide-white/[0.05]">
        {alerts.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-slate-500">
            Tidak ada notifikasi aktif.
          </div>
        )}
        {alerts.map((a) => (
          <div key={a.id} className="flex gap-3 px-5 py-4">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${ALERT_DOT[a.level] ?? 'bg-slate-500'}`} />
            <div>
              <div className="text-sm font-medium text-slate-200">{a.message}</div>
              <div className="mt-0.5 text-xs leading-relaxed text-slate-400">{a.detail}</div>
              <div className="mt-1 text-[11px] text-slate-600">{timeAgo(a.createdAt)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
