'use client'

// ─────────────────────────────────────────
// components/dashboard/FinancialHealthDashboard.tsx
// ─────────────────────────────────────────

import type { DashboardData } from '@/types/dashboard'
import { buildRatioCards } from '@/lib/dashboard/calculations'
import {
  KpiCard,
  RatioCard,
  HealthGauge,
  SafetyMeter,
  TrendChart,
  ShuChart,
  LoanCompositionChart,
  NplTable,
  AlertPanel,
  formatRupiah,
} from './DashboardParts'

interface Props {
  data: DashboardData
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-2 mt-8 mb-2">
      <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
        {children}
      </span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  )
}

export default function FinancialHealthDashboard({ data }: Props) {
  const { kpi, ratios, healthIndex, monthlyTrend, loanComposition, nplMembers, alerts, lastUpdated } = data
  const ratioCards = buildRatioCards(ratios)

  const lastUpdatedStr = new Date(lastUpdated).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <div className="space-y-6 p-6 md:p-8 max-w-7xl mx-auto">
      
      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 md:text-3xl tracking-tight">
            Kesehatan Keuangan Koperasi
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Diperbarui: {lastUpdatedStr}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-xl border border-slate-200 bg-white shadow-sm px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900">
            ⬇ Ekspor PDF
          </button>
          <button
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            ⟳ Refresh
          </button>
        </div>
      </div>

      {/* ── KPI ROW ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Total Aset"           value={formatRupiah(kpi.totalAset)}     change={kpi.asetChange} />
        <KpiCard label="Total Pinjaman Aktif" value={formatRupiah(kpi.totalPinjaman)} change={kpi.pinjamanChange} />
        <KpiCard label="Total Simpanan"       value={formatRupiah(kpi.totalSimpanan)} change={kpi.simpananChange} />
        <KpiCard label="SHU YTD"              value={formatRupiah(kpi.shuYtd)}        change={kpi.shuChange} changeLabel="vs semester lalu" />
      </div>

      {/* ── HEALTH INDEX + RATIOS ── */}
      <SectionTitle>Indeks Kesehatan & Rasio Utama</SectionTitle>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
        <HealthGauge healthIndex={healthIndex} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {ratioCards.map((card) => (
            <RatioCard key={card.key} card={card} />
          ))}
        </div>
      </div>

      {/* ── SAFETY RATIO ── */}
      <SectionTitle>Safety Ratio Engine</SectionTitle>
      <SafetyMeter ratios={ratios} />

      {/* ── CHARTS ── */}
      <SectionTitle>Tren Keuangan 12 Bulan</SectionTitle>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TrendChart data={monthlyTrend} />
        <ShuChart data={monthlyTrend} />
        <LoanCompositionChart data={loanComposition} />
      </div>

      {/* ── NPL + ALERTS ── */}
      <SectionTitle>Detail & Notifikasi</SectionTitle>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
        <NplTable members={nplMembers} />
        <AlertPanel alerts={alerts} />
      </div>
      
    </div>
  )
}
