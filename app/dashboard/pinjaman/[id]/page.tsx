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
  PENDING_L1: { label: 'Menunggu Sekretaris', color: 'text-amber-700', bg: 'bg-amber-100' },
  PENDING_L2: { label: 'Menunggu Bendahara',  color: 'text-orange-700', bg: 'bg-orange-100' },
  PENDING_L3: { label: 'Menunggu Ketua',      color: 'text-sky-700',   bg: 'bg-sky-100' },
  APPROVED:   { label: 'Disetujui',           color: 'text-emerald-700',  bg: 'bg-emerald-100' },
  ACTIVE:     { label: 'Aktif',               color: 'text-teal-700',bg: 'bg-teal-100' },
  LUNAS:      { label: 'Lunas ✓',            color: 'text-slate-600',   bg: 'bg-slate-200' },
  REJECTED:   { label: 'Ditolak',             color: 'text-rose-700',    bg: 'bg-rose-100' },
  CANCELLED:  { label: 'Dibatalkan',          color: 'text-slate-500',   bg: 'bg-slate-100' },
}

function ApprovalStep({
  level, label, status, approvedAt, approvedBy, catatan,
}: {
  level: string; label: string; status: 'done' | 'current' | 'pending'
  approvedAt?: string | null; approvedBy?: string | null; catatan?: string | null
}) {
  return (
    <div className={`flex gap-3 ${status === 'pending' ? 'opacity-40' : ''}`}>
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
          status === 'done'    ? 'bg-emerald-500 border-emerald-500 text-white' :
          status === 'current' ? 'bg-sky-100 border-sky-400 text-sky-700' :
                                 'bg-slate-100 border-slate-200 text-slate-400'
        }`}>
          {status === 'done' ? '✓' : level}
        </div>
        <div className="w-0.5 h-full bg-slate-200 mt-1" />
      </div>
      <div className="pb-5 flex-1">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        {status === 'done' && (
          <p className="text-xs text-slate-400 mt-0.5">
            {approvedBy} · {formatTanggal(approvedAt ?? null)}
          </p>
        )}
        {catatan && (
          <p className="text-xs text-slate-500 mt-1 italic">"{catatan}"</p>
        )}
        {status === 'current' && (
          <p className="text-xs text-sky-600 mt-0.5 font-medium">Menunggu persetujuan...</p>
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

  if (session.role === 'ANGGOTA' && p.user_id !== session.id) {
    redirect('/dashboard/pinjaman')
  }

  const statusConfig = STATUS_CONFIG[p.status] ?? { label: p.status, color: 'text-slate-700', bg: 'bg-slate-100' }
  const isRejected = p.status === 'REJECTED'
  const isActive = p.status === 'ACTIVE'
  const isApproved = p.status === 'APPROVED'
  const isBendahara = session.role === 'BENDAHARA'

  return (
    <main className="min-h-screen bg-slate-50 font-sans sm:flex sm:justify-center">
      <div className="w-full max-w-md bg-slate-50 min-h-screen relative shadow-2xl sm:border-x sm:border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-6 pb-4 bg-white border-b border-slate-100">
          <Link href="/dashboard/pinjaman" className="text-xs text-slate-400">
            ← Pinjaman
          </Link>
          <div className="flex items-center justify-between mt-1">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Pinjaman #{pinjamanId}</h1>
              <p className="text-xs text-slate-400 mt-0.5">{p.user_nama} · {p.user_nik}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>

        <div className="px-5 py-5 space-y-4">
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

          {/* Rincian Pinjaman */}
          <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/40 p-5">
            <h2 className="text-sm font-bold text-slate-700 mb-4 pb-3 border-b border-slate-100">Rincian Pinjaman</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <p className="text-xs text-slate-400">Nominal</p>
                <p className="font-bold text-lg text-slate-900">{formatRupiah(p.nominal)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Dana Diterima</p>
                <p className="font-semibold text-slate-800">{formatRupiah(p.total_diterima)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Biaya Admin (4%)</p>
                <p className="text-rose-600 font-medium">{formatRupiah(p.biaya_admin)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Cicilan / Bulan</p>
                <p className="font-semibold text-teal-700">{formatRupiah(p.cicilan_per_bulan)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Tenor</p>
                <p className="font-medium text-slate-700">{p.tenor_bulan} bulan</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Tgl Pengajuan</p>
                <p className="font-medium text-slate-700">{formatTanggal(p.tanggal_pengajuan)}</p>
              </div>
              {p.tanggal_pencairan && (
                <div>
                  <p className="text-xs text-slate-400">Tgl Pencairan</p>
                  <p className="font-medium text-slate-700">{formatTanggal(p.tanggal_pencairan)}</p>
                </div>
              )}
              {p.tanggal_jatuh_tempo && (
                <div>
                  <p className="text-xs text-slate-400">Jatuh Tempo Akhir</p>
                  <p className="font-medium text-slate-700">{formatTanggal(p.tanggal_jatuh_tempo)}</p>
                </div>
              )}
            </div>
            {p.catatan_pengaju && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-1">Catatan Pengaju</p>
                <p className="text-sm text-slate-600 italic">"{p.catatan_pengaju}"</p>
              </div>
            )}
          </div>

          {/* Penolakan */}
          {isRejected && p.rejected_reason && (
            <div className="bg-rose-50 border border-rose-100 rounded-3xl p-4">
              <p className="text-sm font-bold text-rose-700 mb-1">Alasan Penolakan</p>
              <p className="text-sm text-rose-600">{p.rejected_reason}</p>
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

          {/* Timeline Approval */}
          <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/40 p-5">
            <h2 className="text-sm font-bold text-slate-700 mb-4 pb-3 border-b border-slate-100">Alur Persetujuan</h2>
            <div className="space-y-0">
              <ApprovalStep
                level="1" label="Sekretaris"
                status={p.status === 'PENDING_L1' ? 'current' :
                        ['PENDING_L2','PENDING_L3','APPROVED','ACTIVE','LUNAS'].includes(p.status) ? 'done' : 'pending'}
                approvedAt={p.approved_l1_at} approvedBy={p.nama_l1} catatan={p.catatan_l1}
              />
              <ApprovalStep
                level="2" label="Bendahara"
                status={p.status === 'PENDING_L2' ? 'current' :
                        ['PENDING_L3','APPROVED','ACTIVE','LUNAS'].includes(p.status) ? 'done' : 'pending'}
                approvedAt={p.approved_l2_at} approvedBy={p.nama_l2} catatan={p.catatan_l2}
              />
              <ApprovalStep
                level="3" label="Ketua Koperasi"
                status={p.status === 'PENDING_L3' ? 'current' :
                        ['APPROVED','ACTIVE','LUNAS'].includes(p.status) ? 'done' : 'pending'}
                approvedAt={p.approved_l3_at} approvedBy={p.nama_l3} catatan={p.catatan_l3}
              />
              <ApprovalStep
                level="💰" label="Pencairan"
                status={['ACTIVE','LUNAS'].includes(p.status) ? 'done' :
                        p.status === 'APPROVED' ? 'current' : 'pending'}
                approvedAt={p.disbursed_at} approvedBy={p.nama_disbursed}
              />
            </div>
          </div>

          {/* Info Anggota */}
          <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/40 p-5">
            <h2 className="text-sm font-bold text-slate-700 mb-3">Info Anggota</h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Nama</span>
                <span className="font-medium text-slate-700">{p.user_nama}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">NIK</span>
                <span className="text-slate-700">{p.user_nik}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">No HP</span>
                <span className="text-slate-700">{p.user_no_hp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Simpanan Bulanan</span>
                <span className="font-medium text-emerald-600">{formatRupiah(p.user_simpanan_bulanan ?? 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
