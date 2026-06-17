import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { getPinjamanAktifAnggota } from '@/lib/pinjaman/actions'
import AjukanPinjamanForm from './AjukanPinjamanForm'
import Link from 'next/link'

export default async function AjukanPinjamanPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const session = await getCurrentUser()
  if (!session) redirect('/login')

  if (session.role !== 'ANGGOTA') {
    redirect('/dashboard/pinjaman')
  }

  const pinjamanAktif = await getPinjamanAktifAnggota(session.id)
  const adaPinjamanAktif = pinjamanAktif.length > 0

  return (
    <main className="min-h-screen bg-slate-50 font-sans sm:flex sm:justify-center">
      <div className="w-full max-w-md bg-slate-50 min-h-screen relative shadow-2xl sm:border-x sm:border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-6 pb-4 bg-white border-b border-slate-100">
          <Link href="/dashboard/pinjaman" className="text-xs text-slate-400">
            ← Pinjaman
          </Link>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Pengajuan Pinjaman</h1>
        </div>

        <div className="px-5 py-5 space-y-4">
          {searchParams.error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm">
              ✗ {searchParams.error}
            </div>
          )}

          {adaPinjamanAktif ? (
            <div className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/40 text-center">
              <p className="text-4xl mb-3">⚠️</p>
              <p className="font-bold text-slate-800 mb-1">Masih Ada Pinjaman Aktif</p>
              <p className="text-sm text-slate-500 mb-4">
                Anda belum dapat mengajukan pinjaman baru selama masih ada pinjaman yang belum lunas atau dalam proses persetujuan.
              </p>
              <Link
                href={`/dashboard/pinjaman/${pinjamanAktif[0].id}`}
                className="inline-block px-5 py-2.5 bg-amber-500 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-amber-200/50 active:scale-95 transition"
              >
                Lihat Pinjaman Aktif →
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-5 shadow-lg shadow-slate-200/40">
              <AjukanPinjamanForm />
            </div>
          )}

          {/* Info syarat */}
          <div className="bg-slate-100 rounded-3xl p-4">
            <p className="text-sm font-bold text-slate-600 mb-2">Syarat & Ketentuan</p>
            <ul className="space-y-1 text-xs text-slate-500 list-disc list-inside">
              <li>Anggota aktif koperasi</li>
              <li>Tidak memiliki tunggakan cicilan</li>
              <li>Biaya admin 4% dari nominal pinjaman</li>
              <li>Persetujuan 3 level: Sekretaris → Bendahara → Ketua</li>
              <li>Tenor maksimal 36 bulan</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
