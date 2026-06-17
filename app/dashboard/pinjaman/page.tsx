import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { getPinjamanList, getStatistikPinjaman } from '@/lib/pinjaman/actions'
import Link from 'next/link'

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING_L1: { label: 'Menunggu Sekretaris', color: 'bg-amber-100 text-amber-700' },
  PENDING_L2: { label: 'Menunggu Bendahara', color: 'bg-orange-100 text-orange-700' },
  PENDING_L3: { label: 'Menunggu Ketua', color: 'bg-sky-100 text-sky-700' },
  APPROVED:   { label: 'Disetujui', color: 'bg-emerald-100 text-emerald-700' },
  ACTIVE:     { label: 'Aktif', color: 'bg-teal-100 text-teal-700' },
  LUNAS:      { label: 'Lunas', color: 'bg-slate-200 text-slate-600' },
  REJECTED:   { label: 'Ditolak', color: 'bg-rose-100 text-rose-700' },
  CANCELLED:  { label: 'Dibatalkan', color: 'bg-slate-100 text-slate-500' },
  DISBURSED:  { label: 'Dicairkan', color: 'bg-violet-100 text-violet-700' },
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export default async function PinjamanPage({
  searchParams,
}: {
  searchParams: { status?: string; success?: string; error?: string }
}) {
  const session = await getCurrentUser()
  if (!session) redirect('/login')

  const filterStatus = searchParams.status as string | undefined
  const isAnggota = session.role === 'ANGGOTA'
  const isBendahara = session.role === 'BENDAHARA'
  const isAdmin = ['SEKRETARIS', 'BENDAHARA', 'KETUA', 'SUPERADMIN'].includes(session.role)

  const { data: pinjaman } = await getPinjamanList({
    ...(filterStatus ? { status: filterStatus as any } : {}),
    ...(isAnggota ? { userId: session.id } : {}),
  })
  const stats = isAdmin ? await getStatistikPinjaman() : null

  return (
    <main className="min-h-screen bg-slate-50 font-sans sm:flex sm:justify-center">
      <div className="w-full max-w-md bg-slate-50 min-h-screen relative shadow-2xl sm:border-x sm:border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-6 pb-4 bg-white border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Pinjaman</h1>
              <p className="text-xs text-slate-400 mt-0.5">Kelola pengajuan dan cicilan</p>
            </div>
            {isAnggota && (
              <Link
                href="/dashboard/pinjaman/ajukan"
                className="bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded-2xl shadow-lg shadow-teal-200/50 active:scale-95 transition"
              >
                + Ajukan
              </Link>
            )}
            {isBendahara && (
              <Link
                href="/dashboard/pinjaman/existing"
                className="bg-slate-700 text-white text-sm font-medium px-4 py-2 rounded-2xl shadow-lg shadow-slate-300/50 active:scale-95 transition"
              >
                + Existing
              </Link>
            )}
          </div>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Notifikasi */}
          {searchParams.success && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm">
              ✓ {searchParams.success}
            </div>
          )}
          {searchParams.error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm">
              ✗ {searchParams.error}
            </div>
          )}

          {/* Statistik (hanya admin) */}
          {isAdmin && stats && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-3xl p-4 shadow-lg shadow-slate-200/40">
                <p className="text-xs text-slate-400 mb-1">Total Pinjaman</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="bg-white rounded-3xl p-4 shadow-lg shadow-slate-200/40">
                <p className="text-xs text-slate-400 mb-1">Aktif</p>
                <p className="text-2xl font-bold text-teal-600">{stats.aktif}</p>
              </div>
              <div className="bg-white rounded-3xl p-4 shadow-lg shadow-slate-200/40">
                <p className="text-xs text-slate-400 mb-1">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <div className="bg-white rounded-3xl p-4 shadow-lg shadow-slate-200/40">
                <p className="text-xs text-slate-400 mb-1">Outstanding</p>
                <p className="text-sm font-bold text-sky-600">{formatRupiah(stats.totalOutstanding ?? 0)}</p>
              </div>
            </div>
          )}

          {/* Filter Status */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-hide">
            {[
              { label: 'Semua', value: '' },
              { label: 'Pending', value: 'PENDING_L1' },
              { label: 'Aktif', value: 'ACTIVE' },
              { label: 'Disetujui', value: 'APPROVED' },
              { label: 'Lunas', value: 'LUNAS' },
              { label: 'Ditolak', value: 'REJECTED' },
            ].map((f) => (
              <Link
                key={f.value}
                href={f.value ? `/dashboard/pinjaman?status=${f.value}` : '/dashboard/pinjaman'}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  filterStatus === f.value || (!filterStatus && f.value === '')
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-200/50'
                    : 'bg-white text-slate-500 border border-slate-200'
                }`}
              >
                {f.label}
              </Link>
            ))}
          </div>

          {/* List */}
          {pinjaman.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/40 py-14 text-center">
              <p className="text-4xl mb-3">📋</p>
              <p className="font-medium text-slate-600 text-sm">Belum ada data pinjaman</p>
              {isAnggota && (
                <Link href="/dashboard/pinjaman/ajukan" className="mt-3 inline-block text-teal-600 text-sm font-medium">
                  Ajukan pinjaman pertama Anda →
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {pinjaman.map((p) => {
                const statusInfo = STATUS_LABEL[p.status] ?? { label: p.status, color: 'bg-slate-100 text-slate-600' }
                return (
                  <Link
                    key={p.id}
                    href={`/dashboard/pinjaman/${p.id}`}
                    className="block bg-white rounded-3xl p-4 shadow-lg shadow-slate-200/40 active:scale-[0.98] transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        {isAdmin && (
                          <p className="text-xs text-slate-400 mb-0.5">{p.user_nama} · {p.user_nik}</p>
                        )}
                        <p className="text-lg font-bold text-slate-900">{formatRupiah(p.nominal)}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{p.tenor_bulan} bln · {formatRupiah(p.cicilan_per_bulan)}/bln</span>
                      <span>{new Date(p.tanggal_pengajuan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
