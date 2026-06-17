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
    <main className="min-h-screen bg-slate-50 font-sans sm:flex sm:justify-center">
      <div className="w-full max-w-md bg-slate-50 min-h-screen relative shadow-2xl sm:border-x sm:border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-6 pb-4 bg-white border-b border-slate-100">
          <Link href="/dashboard/pinjaman" className="text-xs text-slate-400">
            ← Pinjaman
          </Link>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Pinjaman Existing</h1>
          <p className="text-xs text-slate-400 mt-0.5">Input data pinjaman migrasi dari Excel</p>
        </div>

        <div className="px-5 py-5 space-y-4">
          {searchParams.error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm">
              ✗ {searchParams.error}
            </div>
          )}

          <div className="bg-amber-50 border border-amber-100 rounded-3xl p-4 text-sm text-amber-700">
            <p className="font-bold mb-1">⚠️ Fitur Migrasi Data</p>
            <p className="text-xs">Data yang diinput akan langsung berstatus AKTIF tanpa melalui proses approval. Pastikan data sudah diverifikasi dari sumber Excel.</p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/40 p-5">
            <PinjamanExistingForm anggotaList={anggota ?? []} />
          </div>
        </div>
      </div>
    </main>
  )
}
