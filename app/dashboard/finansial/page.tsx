// ─────────────────────────────────────────
// app/dashboard/finansial/page.tsx
// ─────────────────────────────────────────
import { Suspense } from 'react'
import { requirePasswordChanged } from '@/lib/auth/session'
import { fetchAllDashboardRaw } from '@/lib/dashboard/queries'
import { composeDashboardData } from '@/lib/dashboard/calculations'
import FinancialHealthDashboard from '@/components/dashboard/FinancialHealthDashboard'

export const revalidate = 300

export default async function FinansialPage() {
  await requirePasswordChanged()

  const raw = await fetchAllDashboardRaw()
  const data = composeDashboardData(raw)

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <FinancialHealthDashboard data={data} />
    </Suspense>
  )
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-6 md:p-8">
      <div className="space-y-2">
        <div className="h-8 w-64 rounded-lg bg-white/[0.06]" />
        <div className="h-4 w-40 rounded-lg bg-white/[0.04]" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-white/[0.05]" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr]">
        <div className="h-72 rounded-2xl bg-white/[0.05]" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-white/[0.05]" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`h-64 rounded-2xl bg-white/[0.05] ${i === 2 ? 'md:col-span-2' : ''}`} />
        ))}
      </div>
    </div>
  )
}
