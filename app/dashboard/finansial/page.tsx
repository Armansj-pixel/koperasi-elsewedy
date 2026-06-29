// ─────────────────────────────────────────
// app/dashboard/finansial/page.tsx
// ─────────────────────────────────────────
import { Suspense } from 'react'
import { requirePasswordChanged, requireRole } from '@/lib/auth/session'
import { fetchAllDashboardRaw } from '@/lib/dashboard/queries'
import { composeDashboardData } from '@/lib/dashboard/calculations'
import FinancialHealthDashboard from '@/components/dashboard/FinancialHealthDashboard'

export const revalidate = 300 // Revalidasi cache setiap 5 menit

export default async function FinansialPage() {
  // 1. Validasi Keamanan Lapis Ganda
  await requirePasswordChanged()
  await requireRole(['SUPERADMIN', 'BENDAHARA', 'KETUA']) // Hanya pengurus inti yang bisa melihat Dashboard Finansial

  // 2. Fetching & Kalkulasi Data
  const raw = await fetchAllDashboardRaw()
  const data = composeDashboardData(raw)

  return (
    <main className="min-h-screen bg-slate-50">
      <Suspense fallback={<DashboardSkeleton />}>
        <FinancialHealthDashboard data={data} />
      </Suspense>
    </main>
  )
}

// ─────────────────────────────────────────
// SKELETON UI: Diselaraskan dengan Enterprise Light Theme
// ─────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-6 md:p-8 max-w-7xl mx-auto">
      
      {/* Skeleton: Header Section */}
      <div className="space-y-3 mb-8">
        <div className="h-9 w-72 rounded-lg bg-slate-200" />
        <div className="h-4 w-48 rounded-lg bg-slate-200" />
      </div>
      
      {/* Skeleton: Top Metric Cards (4 Kolom) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-white border border-slate-100 shadow-sm p-5 flex flex-col justify-end gap-3">
             <div className="h-4 w-1/2 rounded bg-slate-100" />
             <div className="h-7 w-3/4 rounded bg-slate-200" />
          </div>
        ))}
      </div>
      
      {/* Skeleton: Middle Layout (Chart Kiri & Grid Kanan) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
        <div className="h-[22rem] rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
           <div className="h-5 w-40 rounded bg-slate-200 mb-6" />
           <div className="h-64 rounded-full bg-slate-50 max-w-[200px] mx-auto mt-4" /> {/* Circular chart mock */}
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-white border border-slate-100 shadow-sm p-4 flex flex-col gap-2">
               <div className="h-10 w-10 rounded-full bg-slate-100 mb-2" />
               <div className="h-3 w-full rounded bg-slate-100" />
               <div className="h-5 w-2/3 rounded bg-slate-200 mt-auto" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Skeleton: Bottom Layout (Grafik Lebar) */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`h-72 rounded-2xl bg-white border border-slate-100 shadow-sm p-5 ${i === 2 ? 'md:col-span-2' : ''}`}>
             <div className="h-5 w-48 rounded bg-slate-200 mb-6" />
             <div className="w-full h-48 bg-slate-50 rounded-xl" />
          </div>
        ))}
      </div>

    </div>
  )
}
