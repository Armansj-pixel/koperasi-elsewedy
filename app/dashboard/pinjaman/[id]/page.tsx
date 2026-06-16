import { getCurrentUser } from '@/lib/auth/session'
import { redirect, notFound } from 'next/navigation'
import { getPinjamanDetail } from '@/lib/pinjaman/actions'
import ApprovalForm from './ApprovalForm'
import { CairanForm, BayarCicilanForm } from './CicilanForm'
import Link from 'next/link'

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function formatTanggal(d: string | null) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING_L1: { label: 'Menunggu Sekretaris', color: 'text-yellow-800', bg: 'bg-yellow-100' },
  PENDING_L2: { label: 'Menunggu Bendahara',  color: 'text-orange-800', bg: 'bg-orange-100' },
  PENDING_L3: { label: 'Menunggu Ketua',      color: 'text-blue-800',   bg: 'bg-blue-100' },
  APPROVED:   { label: 'Disetujui',           color: 'text-green-800',  bg: 'bg-green-100' },
  ACTIVE:     { label: 'Aktif',               color: 'text-emerald-800',bg: 'bg-emerald-100' },
  LUNAS:      { label: 'Lunas ✓',            color: 'text-gray-700',   bg: 'bg-gray-100' },
  REJECTED:   { label: 'Ditolak',             color: 'text-red-800',    bg: 'bg-red-100' },
  CANCELLED:  { label: 'Dibatalkan',          color: 'text-gray-600',   bg: 'bg-gray-100' },
}

// Timeline approval step
function ApprovalStep({
  level, label, status, approvedAt, approvedBy, catatan, currentStatus, targetStatus,
}: {
  level: string; label: string; status: 'done' | 'current' | 'pending'
  approvedAt?: string | null; approvedBy?: string | null; catatan?: string | null
  currentStatus: string; targetStatus: string
}) {
  return (
    <div className={`flex gap-3 ${status === 'pending' ? 'opacity-40' : ''}`}>
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
          status === 'done'    ? 'bg-green-500 border-green-500 text-white' :
          status === 'current' ? 'bg-blue-100 border-blue-400 text-blue-700' :
                                 'bg-gray-100 border-gray-300 text-gray-400'
        }`}>
          {status === 'done' ? '✓' : level}
        </div>
        <div className="w-0.5 h-full bg-gray-200 mt-1" />
      </div>
      <div className="pb-5 flex-1">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {status === 'done' && (
          <p className="text-xs text-gray-500 mt-0.5">
            {approvedBy} · {formatTanggal(approvedAt ?? null)}
          </p>
        )}
        {catatan && (
          <p className="text-xs text-gray-500 mt-1 italic">"{catatan}"</p>
        )}
        {status === 'current' && (
          <p className="text-xs text-blue-600 mt-0.5 font-medium">Menunggu persetujuan...</p>
        )}
      </div>
    </div>
  )
}

export default async function PinjamanDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { success?: string; error?: string }
}) {
  const session = await getCurrentUser()
if (!session) redirect('/login')
  
  const pinjamanId = parseInt(params.id)
  if (isNaN(pinjamanId)) notFound()

  const { data: p, cicilan, error } = await getPinjamanDetail(pinjamanId)
  if (!p || error) notFound()

  // Anggota hanya bisa lihat pinjaman sendiri
  if (session.role === 'ANGGOTA' && p.user_id !== session.userId) {
    redirect('/dashboard/pinjaman')
  }

  const statusConfig = STATUS_CONFIG[p.status] ?? { label: p.status, color: 'text-gray-700', bg: 'bg-gray-100' }
  const isRejected = p.status === 'REJECTED'
  const isActive = p.status === 'ACTIVE'
  const isApproved = p.status === 'APPROVED'
  const isBendahara = session.role === 'BENDAHARA'

  // Tentukan step approval
  const getStepStatus = (targetStatus: string) => {
    const order = ['PENDING_L1', 'PENDING_L2', 'PENDING_L3', 'APPROVED', 'ACTIVE', 'LUNAS']
    const currentIdx = order.indexOf(p.status)
    const targetIdx = order.indexOf(targetStatus)
    if (isRejected) return targetIdx < order.indexOf('PENDING_L2') ? 'done' : 'pending'
    if (currentIdx > targetIdx) return 'done'
    if (currentIdx === targetIdx) return 'current'
    return 'pending'
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-4">
        <Link href="/dashboard/pinjaman" className="hover:text-gray-600">Pinjaman</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-700">Detail #{pinjamanId}</span>
      </nav>

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

      {/* Status Badge + Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pinjaman #{pinjamanId}</h1>
          <p className="text-sm text-gray-500 mt-1">{p.user_nama} · NIK {p.user_nik}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold self-start ${statusConfig.bg} ${statusConfig.color}`}>
          {statusConfig.label}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom kiri: Detail + Approval */}
        <div className="lg:col-span-2 space-y-5">

          {/* Rincian Pinjaman */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b">Rincian Pinjaman</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400">Nominal</p>
                <p className="font-bold text-lg text-gray-900">{formatRupiah(p.nominal)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Dana Diterima</p>
                <p className="font-semibold text-gray-900">{formatRupiah(p.total_diterima)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Biaya Admin (4%)</p>
                <p className="text-red-600 font-medium">{formatRupiah(p.biaya_admin)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Cicilan / Bulan</p>
                <p className="font-semibold text-blue-700">{formatRupiah(p.cicilan_per_bulan)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Tenor</p>
                <p className="font-medium">{p.tenor_bulan} bulan</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Tgl Pengajuan</p>
                <p className="font-medium">{formatTanggal(p.tanggal_pengajuan)}</p>
              </div>
              {p.tanggal_pencairan && (
                <div>
                  <p className="text-xs text-gray-400">Tgl Pencairan</p>
                  <p className="font-medium">{formatTanggal(p.tanggal_pencairan)}</p>
                </div>
              )}
              {p.tanggal_jatuh_tempo && (
                <div>
                  <p className="text-xs text-gray-400">Jatuh Tempo Akhir</p>
                  <p className="font-medium">{formatTanggal(p.tanggal_jatuh_tempo)}</p>
                </div>
              )}
            </div>
            {p.catatan_pengaju && (
              <div className="mt-4 pt-3 border-t">
                <p className="text-xs text-gray-400 mb-1">Catatan Pengaju</p>
                <p className="text-sm text-gray-700 italic">"{p.catatan_pengaju}"</p>
              </div>
            )}
          </div>

          {/* Penolakan */}
          {isRejected && p.rejected_reason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-red-800 mb-1">Alasan Penolakan</p>
              <p className="text-sm text-red-700">{p.rejected_reason}</p>
            </div>
          )}

          {/* Form Approval */}
          <ApprovalForm
            pinjamanId={pinjamanId}
            currentStatus={p.status}
            userRole={session.role}
          />

          {/* Form Pencairan */}
          {isApproved && isBendahara && (
            <CairanForm pinjamanId={pinjamanId} />
          )}

          {/* Jadwal Cicilan */}
          {(isActive || p.status === 'LUNAS') && (
            <BayarCicilanForm
              cicilan={cicilan}
              pinjamanId={pinjamanId}
              userRole={session.role}
            />
          )}
        </div>

        {/* Kolom kanan: Timeline Approval */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b">Alur Persetujuan</h2>
            <div className="space-y-0">
              <ApprovalStep
                level="1" label="Sekretaris"
                status={getStepStatus('PENDING_L1') === 'current' ? 'current' :
                        ['PENDING_L2','PENDING_L3','APPROVED','ACTIVE','LUNAS'].includes(p.status) ? 'done' : 'pending'}
                approvedAt={p.approved_l1_at} approvedBy={p.nama_l1} catatan={p.catatan_l1}
                currentStatus={p.status} targetStatus="PENDING_L1"
              />
              <ApprovalStep
                level="2" label="Bendahara"
                status={p.status === 'PENDING_L2' ? 'current' :
                        ['PENDING_L3','APPROVED','ACTIVE','LUNAS'].includes(p.status) ? 'done' : 'pending'}
                approvedAt={p.approved_l2_at} approvedBy={p.nama_l2} catatan={p.catatan_l2}
                currentStatus={p.status} targetStatus="PENDING_L2"
              />
              <ApprovalStep
                level="3" label="Ketua Koperasi"
                status={p.status === 'PENDING_L3' ? 'current' :
                        ['APPROVED','ACTIVE','LUNAS'].includes(p.status) ? 'done' : 'pending'}
                approvedAt={p.approved_l3_at} approvedBy={p.nama_l3} catatan={p.catatan_l3}
                currentStatus={p.status} targetStatus="PENDING_L3"
              />
              <ApprovalStep
                level="💰" label="Pencairan"
                status={['ACTIVE','LUNAS'].includes(p.status) ? 'done' :
                        p.status === 'APPROVED' ? 'current' : 'pending'}
                approvedAt={p.disbursed_at} approvedBy={p.nama_disbursed}
                currentStatus={p.status} targetStatus="APPROVED"
              />
            </div>
          </div>

          {/* Info Anggota */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Info Anggota</h2>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-xs text-gray-400">Nama</p>
                <p className="font-medium">{p.user_nama}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">NIK</p>
                <p>{p.user_nik}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">No HP</p>
                <p>{p.user_no_hp}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Simpanan Bulanan</p>
                <p className="font-medium text-green-700">{formatRupiah(p.user_simpanan_bulanan ?? 0)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
