'use client'

// ═══════════════════════════════════════════════════════════════════
// components/dashboard/FinancialHealthDashboard.tsx
// UI selaras dengan design system koperasi (light mode, Inter, biru)
// ═══════════════════════════════════════════════════════════════════

import React from 'react'
import type { DashboardData, FinancialRatios, HealthIndex, NplMember, SystemAlert, LoanComposition, MonthlyTrend, RatioCardData } from '@/types/dashboard'
import { buildRatioCards } from '@/lib/dashboard/calculations'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

// ── CSS sesuai pola pageStyles di halaman lain ────────────────

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  .fin-shell { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
  .fin-header { background: linear-gradient(150deg, #0a1e4a 0%, #0f2d6b 40%, #1a4db3 75%, #2563eb 100%); padding: 30px 20px 100px; position: relative; overflow: hidden; }
  .fin-orb { position: absolute; border-radius: 50%; pointer-events: none; }
  .fin-card { background: #fff; border-radius: 20px; border: 1px solid #eaeef5; box-shadow: 0 4px 28px rgba(15,45,107,.08), 0 1px 3px rgba(0,0,0,.03); }
  .fin-stat-card { background: #fff; border-radius: 16px; border: 1.5px solid #f1f5f9; box-shadow: 0 4px 12px rgba(15,45,107,.04); padding: 20px; }
  .fin-btn-nav { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.15); color: #fff; padding: 8px 14px; border-radius: 20px; text-decoration: none; font-size: 13px; font-weight: 600; backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.2); transition: all 0.2s; }
  .fin-btn-nav:hover { background: rgba(255,255,255,0.25); }
  .fin-content { padding: 0 16px 40px; margin-top: -70px; position: relative; z-index: 20; }
  .fin-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .fin-ratio-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .fin-chart-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .fin-bottom-grid { display: grid; grid-template-columns: 1fr 360px; gap: 16px; }
  .fin-section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #94a3b8; margin-bottom: 14px; margin-top: 28px; display: flex; align-items: center; gap: 10px; }
  .fin-section-label::after { content: ''; flex: 1; height: 1px; background: #eaeef5; }
  .fin-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px; }
  .fin-badge-sehat   { background: #f0fdf4; color: #15803d; border: 1px solid #86efac; }
  .fin-badge-waspada { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
  .fin-badge-kritis  { background: #fef2f2; color: #b91c1c; border: 1px solid #fca5a5; }
  .fin-badge-info    { background: #eff6ff; color: #1d4ed8; border: 1px solid #93c5fd; }
  .fin-meter-track { height: 10px; background: #f1f5f9; border-radius: 5px; overflow: hidden; }
  .fin-alert-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
  .fin-dot-kritis  { background: #ef4444; }
  .fin-dot-waspada { background: #f97316; }
  .fin-dot-info    { background: #22c55e; }
  table { width: 100%; border-collapse: collapse; }
  thead th { padding: 11px 16px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: #94a3b8; background: #f8fafc; }
  tbody tr { border-top: 1px solid #f1f5f9; transition: background .1s; }
  tbody tr:hover { background: #f8fafc; }
  tbody td { padding: 13px 16px; font-size: 13px; color: #64748b; }
  tbody td:first-child { color: #0f172a; font-weight: 600; }
  @media (max-width: 900px) {
    .fin-kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .fin-ratio-grid { grid-template-columns: repeat(2, 1fr); }
    .fin-chart-grid { grid-template-columns: 1fr; }
    .fin-bottom-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 600px) {
    .fin-kpi-grid { grid-template-columns: repeat(2, 1fr); }
    .fin-ratio-grid { grid-template-columns: 1fr; }
  }
  @media (min-width: 768px) {
    .fin-header { padding: 40px 32px 100px; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; }
    .fin-content { padding: 0 32px 40px; }
  }
`

// ── Formatter ─────────────────────────────────────────────────

function formatRupiah(n: number): string {
  if (n >= 1000) return `Rp ${(n / 1000).toFixed(1)}M`
  return `Rp ${n.toLocaleString('id')} jt`
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m} menit lalu`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} jam lalu`
  return `${Math.floor(h / 24)} hari lalu`
}

const tooltipStyle = {
  backgroundColor: '#fff',
  border: '1px solid #eaeef5',
  borderRadius: '12px',
  color: '#0f172a',
  fontSize: '12px',
  boxShadow: '0 4px 16px rgba(15,45,107,.1)',
}

// ── KPI Card ──────────────────────────────────────────────────

function KpiCard({ label, value, change, changeLabel }: {
  label: string; value: string; change: number; changeLabel?: string
}) {
  const isUp = change >= 0
  return (
    <div className="fin-stat-card">
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#94a3b8', marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-.02em', marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: isUp ? '#15803d' : '#b91c1c', display: 'flex', alignItems: 'center', gap: 4 }}>
        <span>{isUp ? '▲' : '▼'}</span>
        <span>{Math.abs(change)}% {changeLabel ?? 'vs tahun lalu'}</span>
      </div>
    </div>
  )
}

// ── Ratio Card ────────────────────────────────────────────────

function RatioCard({ card }: { card: RatioCardData }) {
  const badgeClass = `fin-badge fin-badge-${card.status}`
  return (
    <div className="fin-stat-card" style={{ borderRadius: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#94a3b8', marginBottom: 10 }}>{card.label}</div>
      <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', letterSpacing: '-.02em', marginBottom: 4 }}>
        {card.value}<span style={{ fontSize: 16, color: '#94a3b8', marginLeft: 3 }}>{card.unit}</span>
      </div>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>{card.description}</div>
      <span className={badgeClass}>{card.statusLabel}</span>
    </div>
  )
}

// ── Health Gauge (SVG arc) ────────────────────────────────────

function HealthGauge({ healthIndex }: { healthIndex: HealthIndex }) {
  const { score, status, pillars } = healthIndex
  const R = 68; const CX = 88; const CY = 88
  const startAngle = -210; const endAngle = startAngle + 240 * (score / 100)

  function polar(cx: number, cy: number, r: number, deg: number) {
    const rad = (deg * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }
  function arc(a1: number, a2: number) {
    const s = polar(CX, CY, R, a1); const e = polar(CX, CY, R, a2)
    return `M ${s.x} ${s.y} A ${R} ${R} 0 ${Math.abs(a2 - a1) > 180 ? 1 : 0} 1 ${e.x} ${e.y}`
  }

  const fillColor = score >= 80 ? '#15803d' : score >= 65 ? '#1d4ed8' : score >= 50 ? '#d97706' : '#b91c1c'
  const statusBg  = score >= 80 ? '#f0fdf4' : score >= 65 ? '#eff6ff' : score >= 50 ? '#fffbeb' : '#fef2f2'

  return (
    <div className="fin-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#94a3b8', marginBottom: 20 }}>
        Indeks Kesehatan Koperasi
      </div>
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <svg width="176" height="136" viewBox="0 0 176 136">
          <path d={arc(startAngle, startAngle + 240)} fill="none" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" />
          <path d={arc(startAngle, endAngle)} fill="none" stroke={fillColor} strokeWidth="12" strokeLinecap="round" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 16 }}>
          <span style={{ fontSize: 40, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>/ 100</span>
        </div>
      </div>
      <div style={{ background: statusBg, color: fillColor, padding: '4px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700, marginBottom: 20 }}>
        ● {status.toUpperCase()}
      </div>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {pillars.map((p) => (
          <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <span style={{ width: 104, color: '#64748b', flexShrink: 0 }}>{p.label}</span>
            <div className="fin-meter-track" style={{ flex: 1 }}>
              <div style={{ width: `${p.score}%`, height: '100%', background: p.color, borderRadius: 5 }} />
            </div>
            <span style={{ width: 24, textAlign: 'right', fontWeight: 700, color: p.color }}>{p.score}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Safety Meter ──────────────────────────────────────────────

function SafetyMeter({ ratios }: { ratios: FinancialRatios }) {
  const ldrPct   = Math.min((ratios.ldr / 160) * 100, 100)
  const ldrColor = ratios.ldr <= 110 ? '#15803d' : ratios.ldr <= 150 ? '#d97706' : '#b91c1c'
  const ldrZone  = ratios.ldr <= 110 ? 'HIJAU — Aman' : ratios.ldr <= 150 ? 'KUNING — Waspada' : 'MERAH — Kritis'
  const ldrAdvBg = ratios.ldr <= 110 ? '#f0fdf4' : ratios.ldr <= 150 ? '#fffbeb' : '#fef2f2'
  const ldrAdvBorder = ratios.ldr <= 110 ? '#86efac' : ratios.ldr <= 150 ? '#fde68a' : '#fca5a5'
  const ldrAdvMsg = ratios.ldr <= 110
    ? '✓ LDR aman. Pemberian pinjaman baru dapat dilanjutkan.'
    : ratios.ldr <= 150
    ? '⚠ Batasi pinjaman baru. Fokus penghimpunan simpanan anggota.'
    : '✕ Kritis! Pinjaman baru diblokir. Segera rapat pengurus.'

  const crPct   = Math.min((ratios.cr / 4) * 100, 100)
  const crColor = ratios.cr >= 2 ? '#15803d' : ratios.cr >= 1 ? '#d97706' : '#b91c1c'
  const crZone  = ratios.cr >= 2 ? 'HIJAU — Aman' : ratios.cr >= 1 ? 'KUNING — Cukup' : 'MERAH — Bahaya'
  const crAdvBg = ratios.cr >= 2 ? '#f0fdf4' : ratios.cr >= 1 ? '#fffbeb' : '#fef2f2'
  const crAdvBorder = ratios.cr >= 2 ? '#86efac' : ratios.cr >= 1 ? '#fde68a' : '#fca5a5'
  const crAdvMsg = ratios.cr >= 2
    ? '✓ Likuiditas cukup menanggung seluruh kewajiban jangka pendek.'
    : ratios.cr >= 1
    ? '⚠ Likuiditas tipis. Tunda pengeluaran tidak mendesak.'
    : '✕ Bahaya! Tidak mampu bayar kewajiban jangka pendek.'

  return (
    <div className="fin-chart-grid">
      {[
        { title: 'LDR Monitor', sub: 'Loan-to-Deposit Ratio', val: `${ratios.ldr}%`, pct: ldrPct, color: ldrColor, zone: ldrZone, advBg: ldrAdvBg, advBorder: ldrAdvBorder, advMsg: ldrAdvMsg,
          zones: ['0%', 'Aman <110%', 'Waspada 110–150%', 'Kritis >150%', '160%'],
          zoneColors: ['#64748b','#15803d','#d97706','#b91c1c','#64748b'] },
        { title: 'Current Ratio Monitor', sub: 'Kemampuan bayar kewajiban jangka pendek', val: `${ratios.cr}×`, pct: crPct, color: crColor, zone: crZone, advBg: crAdvBg, advBorder: crAdvBorder, advMsg: crAdvMsg,
          zones: ['0×', 'Bahaya <1×', 'Waspada 1–1.5×', 'Aman >2×', '4×'],
          zoneColors: ['#64748b','#b91c1c','#d97706','#15803d','#64748b'] },
      ].map((m) => (
        <div key={m.title} className="fin-card" style={{ padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{m.title}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>{m.sub}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <span style={{ fontSize: 30, fontWeight: 900, color: '#0f172a' }}>{m.val}</span>
            <span style={{ fontSize: 12, color: '#64748b' }}>Zona: <span style={{ fontWeight: 700, color: m.color }}>{m.zone}</span></span>
          </div>
          <div className="fin-meter-track" style={{ marginBottom: 8 }}>
            <div style={{ width: `${m.pct}%`, height: '100%', background: `linear-gradient(to right, #22c55e, ${m.color})`, borderRadius: 5 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 14 }}>
            {m.zones.map((z, i) => <span key={i} style={{ color: m.zoneColors[i] }}>{z}</span>)}
          </div>
          <div style={{ background: m.advBg, border: `1px solid ${m.advBorder}`, borderRadius: 10, padding: '10px 14px', fontSize: 12, color: m.color, fontWeight: 600 }}>
            {m.advMsg}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Charts ────────────────────────────────────────────────────

function TrendChart({ data }: { data: MonthlyTrend[] }) {
  return (
    <div className="fin-card" style={{ padding: 24 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Simpanan vs Pinjaman</div>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>12 bulan terakhir (Rp Juta)</div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0f766e" stopOpacity={0.15} /><stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} /><stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}jt`} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`Rp ${v} jt`, '']} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
          <Area type="monotone" dataKey="simpanan" name="Simpanan" stroke="#0f766e" strokeWidth={2} fill="url(#gS)" dot={false} />
          <Area type="monotone" dataKey="pinjaman" name="Pinjaman" stroke="#2563eb" strokeWidth={2} fill="url(#gP)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function ShuChart({ data }: { data: MonthlyTrend[] }) {
  return (
    <div className="fin-card" style={{ padding: 24 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>SHU Bulanan</div>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>Pendapatan bersih koperasi (Rp Juta)</div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}jt`} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`Rp ${v} jt`, 'SHU']} />
          <Bar dataKey="shu" name="SHU" radius={[5, 5, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={i === data.length - 1 ? '#0f766e' : '#bfdbfe'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function LoanCompositionChart({ data }: { data: LoanComposition[] }) {
  const COLORS = ['#2563eb', '#0f766e', '#d97706', '#7c3aed']
  return (
    <div className="fin-card" style={{ padding: 24, gridColumn: '1 / -1' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Komposisi Pinjaman Aktif</div>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>Distribusi outstanding per produk</div>
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'center' }}>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} strokeWidth={0}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`Rp ${v} jt`, '']} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {data.map((item, i) => (
            <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', borderRadius: 12, padding: '10px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#475569' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0, display: 'inline-block' }} />
                {item.name}
              </div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                {formatRupiah(item.value)} <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>{item.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── NPL Table ─────────────────────────────────────────────────

const NPL_BADGE: Record<string, string> = {
  diperhatikan: 'fin-badge fin-badge-waspada',
  bermasalah:   'fin-badge fin-badge-kritis',
  macet:        'fin-badge fin-badge-kritis',
}
const NPL_LABEL: Record<string, string> = {
  diperhatikan: 'Diperhatikan',
  bermasalah:   'Bermasalah',
  macet:        'Macet',
}

function NplTable({ members }: { members: NplMember[] }) {
  return (
    <div className="fin-card" style={{ overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Pinjaman Menunggak (NPL)</div>
        {members.length > 0 && (
          <span className="fin-badge fin-badge-kritis">{members.length} Anggota</span>
        )}
      </div>
      {members.length === 0 ? (
        <div style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>
          ✓ Tidak ada pinjaman bermasalah saat ini.
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              {['Anggota', 'Outstanding', 'Tunggakan', 'Status'].map((h) => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td>{m.nama}</td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>Rp {(m.outstanding).toLocaleString('id-ID')}</td>
                <td>{m.bulanTunggak} bulan</td>
                <td><span className={NPL_BADGE[m.status]}>{NPL_LABEL[m.status]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// ── Alert Panel ───────────────────────────────────────────────

function AlertPanel({ alerts }: { alerts: SystemAlert[] }) {
  const kritisCount = alerts.filter((a) => a.level === 'kritis').length
  return (
    <div className="fin-card" style={{ overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Notifikasi Sistem</div>
        {kritisCount > 0 && <span className="fin-badge fin-badge-kritis">{kritisCount} Kritis</span>}
      </div>
      <div>
        {alerts.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>
            Tidak ada notifikasi aktif.
          </div>
        )}
        {alerts.map((a, idx) => (
          <div key={a.id} style={{ display: 'flex', gap: 12, padding: '14px 20px', borderTop: idx === 0 ? 'none' : '1px solid #f1f5f9' }}>
            <span className={`fin-alert-dot fin-dot-${a.level}`} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{a.message}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, lineHeight: 1.5 }}>{a.detail}</div>
              <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 4 }}>{timeAgo(a.createdAt)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function FinancialHealthDashboard({ data }: { data: DashboardData }) {
  const { kpi, ratios, healthIndex, monthlyTrend, loanComposition, nplMembers, alerts, lastUpdated } = data
  const ratioCards = buildRatioCards(ratios)
  const lastUpdatedStr = new Date(lastUpdated).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <main className="fin-shell bg-slate-100 min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />
      <div className="w-full max-w-5xl mx-auto bg-slate-100 min-h-screen relative sm:shadow-xl sm:border-x sm:border-slate-200">

        {/* ── HEADER ── */}
        <header className="fin-header">
          <div className="fin-orb" style={{ width: 280, height: 280, top: -100, right: -100, background: 'radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 70%)' }} />
          <div className="fin-orb" style={{ width: 200, height: 200, bottom: -40, left: -40, background: 'radial-gradient(circle, rgba(96,165,250,.2) 0%, transparent 70%)' }} />
          <div style={{ position: 'relative', zIndex: 10 }}>
            <a href="/dashboard" className="fin-btn-nav" style={{ marginBottom: 20, display: 'inline-flex' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Dashboard
            </a>
            <h1 style={{ color: '#fff', margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: '-.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 12, display: 'flex' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              Kesehatan Keuangan
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 6 }}>Diperbarui: {lastUpdatedStr}</p>
          </div>
        </header>

        {/* ── CONTENT ── */}
        <div className="fin-content">

          {/* KPI */}
          <div className="fin-kpi-grid">
            <KpiCard label="Total Aset"           value={formatRupiah(kpi.totalAset)}     change={kpi.asetChange} />
            <KpiCard label="Pinjaman Aktif"       value={formatRupiah(kpi.totalPinjaman)} change={kpi.pinjamanChange} />
            <KpiCard label="Total Simpanan"       value={formatRupiah(kpi.totalSimpanan)} change={kpi.simpananChange} />
            <KpiCard label="SHU YTD"              value={formatRupiah(kpi.shuYtd)}        change={kpi.shuChange} changeLabel="vs semester lalu" />
          </div>

          {/* Health + Ratios */}
          <div className="fin-section-label">Indeks Kesehatan & Rasio Utama</div>
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, marginBottom: 0 }}>
            <HealthGauge healthIndex={healthIndex} />
            <div className="fin-ratio-grid">
              {ratioCards.map((card) => <RatioCard key={card.key} card={card} />)}
            </div>
          </div>

          {/* Safety Meter */}
          <div className="fin-section-label">Safety Ratio Engine</div>
          <SafetyMeter ratios={ratios} />

          {/* Charts */}
          <div className="fin-section-label">Tren Keuangan 12 Bulan</div>
          <div className="fin-chart-grid">
            <TrendChart data={monthlyTrend} />
            <ShuChart data={monthlyTrend} />
            <LoanCompositionChart data={loanComposition} />
          </div>

          {/* NPL + Alerts */}
          <div className="fin-section-label">Detail & Notifikasi</div>
          <div className="fin-bottom-grid">
            <NplTable members={nplMembers} />
            <AlertPanel alerts={alerts} />
          </div>

        </div>
      </div>
    </main>
  )
}
