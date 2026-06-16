import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PinjamanExistingForm from './PinjamanExistingForm'
import Link from 'next/link'

export default async function PinjamanExistingPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const session = await getCurrentUser()
  if (!session) redirect('/login')

  if (!['BENDAHARA', 'SUPERADMIN'].includes(session.role)) {
    redirect('/dashboard/pinjaman')
  }

  const supabase = await createClient()
  const { data: anggota } = await supabase
    .from('users')
    .select('id, nama, nik')
    .eq('is_active', true)
    .eq('role', 'ANGGOTA')
    .order('nama')

  return (
    <div className="p-6 max-w-xl mx-auto">
      <nav className="text-sm text-gray-400 mb-4">
        <Link href="/dashboard/pinjaman" className="hover:text-gray-600">Pinjaman</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-700">Input Pinjaman Existing</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Pinjaman Existing</h1>
      <p className="text-sm text-gray-500 mb-6">Input data pinjaman yang sudah berjalan (migrasi dari Excel)</p>

      {searchParams.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          ✗ {searchParams.error}
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-sm text-amber-800">
        <p className="font-semibold mb-1">⚠️ Fitur Migrasi Data</p>
        <p>Data yang diinput akan langsung berstatus AKTIF tanpa melalui proses approval. Pastikan data sudah diverifikasi dari sumber Excel.</p>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <PinjamanExistingForm anggotaList={anggota ?? []} />
      </div>
    </div>
  )
}
