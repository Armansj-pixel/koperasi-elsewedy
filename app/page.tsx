export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-600 text-white p-8">
      <div className="text-center max-w-2xl">
        <div className="text-6xl mb-4">🏦</div>
        <h1 className="text-4xl font-bold mb-2">Koperasi Karyawan</h1>
        <h2 className="text-xl mb-8 opacity-90">PT Elsewedy Electric Indonesia</h2>
        <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
          <h3 className="text-2xl font-semibold mb-4">🚀 Sistem Sedang Dikembangkan</h3>
          <p className="text-lg opacity-90 mb-6">
            Aplikasi PWA Koperasi Simpan-Pinjam Modern untuk Karyawan
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 bg-amber-500 text-slate-900 rounded-full text-sm font-semibold">Next.js 14</span>
            <span className="px-3 py-1 bg-emerald-500 rounded-full text-sm font-semibold">Supabase</span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">PWA</span>
          </div>
        </div>
        <p className="mt-8 text-sm opacity-70">
          🔧 Build #1 · {new Date().toLocaleDateString('id-ID')}
        </p>
      </div>
    </main>
  );
}
