import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { getPinjamanList, getStatistikPinjaman } from '@/lib/pinjaman/actions'
import Link from 'next/link'

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING_L1: { label: 'Menunggu Sekretaris', color: 'bg-yellow-100 text-yellow-800' },
  PENDING_L2: { label: 'Menunggu Bendahara', color: 'bg-orange-100 text-orange-800' },
  PENDING_L3: { label: 'Menunggu Ketua', color: 'bg-blue-100 text-blue-800' },
  APPROVED:   { label: 'Disetujui', color: 'bg-green-100 text-green-800' },
  ACTIVE:     { label: 'Aktif', color: 'bg-emerald-100 text-emerald-800' },
  LUNAS:      { label: 'Lunas', color: 'bg-gray-100 text-gray-600' },
  REJECTED:   { label: 'Ditolak', color: 'bg-red-100 text-red-800' },
  CANCELLED:  { label: 'Dibatalkan', color: 'bg-gray-100 text-gray-500' },
  DISBURSED:  { label: 'Dicairkan', color: 'bg-purple-100 text-purple-800' },
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export default async function PinjamanPage({
  searchParams,
}: {
  searchParams: { status?: string; success?: string; error?: string }
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const filterStatus = searchParams.status as string | undefined
  const { data: pinjaman } = await getPinjamanList(
    filterStatus ? { status: filterStatus as any } : undefined
  )
  const stats = await getStatistikPinjaman()

  const isAnggota = session.role === 'ANGGOTA'
  const isBendahara = session.role === 'BENDAHARA'
  const isAdmin = ['SEKRETARIS', 'BENDAHARA', 'KETUA', 'SUPERADMIN'].includes(session.role)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modul Pinjaman</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola pengajuan dan cicilan pinjaman</p>
        </div>
        <div className="flex gap-2">
          {isAnggota && (
            <Link
              href="/dashboard/pinjaman/ajukan"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              + Ajukan Pinjaman
            </Link>
          )}
          {isBendahara && (
            <Link
              href="/dashboard/pinjaman/existing"
              className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
            >
              + Input Pinjaman Existing
            </Link>
          )}
        </div>
      </div>

      {/* Notifikasi */}
      {searchParams.success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
          ✓ {searchParams.success}
        </div>
      )}
      {searchParams.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          ✗ {searchParams.error}
        </div>
      )}

      {/* Statistik (hanya admin) */}
      {isAdmin && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs text-gray-500 mb-1">Total Pinjaman</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs text-gray-500 mb-1">Aktif</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.aktif}</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs text-gray-500 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs text-gray-500 mb-1">Outstanding</p>
            <p className="text-lg font-bold text-blue-600">{formatRupiah(stats.totalOutstanding)}</p>
          </div>
        </div>
      )}

      {/* Filter Status */}
      <div className="flex flex-wrap gap-2 mb-4">
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
            className={`px-3 py-1 rounded-full text-sm border transition ${
              filterStatus === f.value || (!filterStatus && f.value === '')
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {pinjaman.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium">Belum ada data pinjaman</p>
            {isAnggota && (
              <Link href="/dashboard/pinjaman/ajukan" className="mt-3 inline-block text-blue-600 text-sm hover:underline">
                Ajukan pinjaman pertama Anda →
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {isAdmin && <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Anggota</th>}
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Nominal</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tenor</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Cicilan/Bln</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tgl Pengajuan</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pinjaman.map((p) => {
                  const statusInfo = STATUS_LABEL[p.status] ?? { label: p.status, color: 'bg-gray-100 text-gray-600' }
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{p.user_nama}</p>
                          <p className="text-xs text-gray-400">{p.user_nik}</p>
                        </td>
                      )}
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {formatRupiah(p.nominal)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.tenor_bulan} bln</td>
                      <td className="px-4 py-3 text-gray-600">{formatRupiah(p.cicilan_per_bulan)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(p.tanggal_pengajuan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/dashboard/pinjaman/${p.id}`}
                          className="text-blue-600 hover:underline text-xs font-medium"
                        >
                          Detail →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
