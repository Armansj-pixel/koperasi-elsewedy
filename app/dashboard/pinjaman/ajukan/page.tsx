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

  // Hanya anggota yang bisa ajukan
  if (session.role !== 'ANGGOTA') {
    redirect('/dashboard/pinjaman')
  }

  // Cek pinjaman aktif
  const pinjamanAktif = await getPinjamanAktifAnggota(session.userId)
  const adaPinjamanAktif = pinjamanAktif.length > 0

  return (
    <div className="p-6 max-w-xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-4">
        <Link href="/dashboard/pinjaman" className="hover:text-gray-600">Pinjaman</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-700">Ajukan Pinjaman</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pengajuan Pinjaman</h1>

      {searchParams.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          ✗ {searchParams.error}
        </div>
      )}

      {adaPinjamanAktif ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="font-semibold text-yellow-900 mb-1">Masih Ada Pinjaman Aktif</p>
          <p className="text-sm text-yellow-700 mb-4">
            Anda tidak dapat mengajukan pinjaman baru selama masih memiliki pinjaman yang belum lunas.
          </p>
          <Link
            href={`/dashboard/pinjaman/${pinjamanAktif[0].id}`}
            className="inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition"
          >
            Lihat Pinjaman Aktif →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border p-6">
          <AjukanPinjamanForm />
        </div>
      )}

      {/* Info syarat */}
      <div className="mt-6 bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
        <p className="font-semibold mb-2 text-gray-700">Syarat & Ketentuan</p>
        <ul className="space-y-1 list-disc list-inside text-xs text-gray-500">
          <li>Anggota aktif koperasi</li>
          <li>Tidak memiliki tunggakan cicilan</li>
          <li>Biaya admin 4% dari nominal pinjaman</li>
          <li>Persetujuan 3 level: Sekretaris → Bendahara → Ketua</li>
          <li>Tenor maksimal 36 bulan</li>
        </ul>
      </div>
    </div>
  )
}
