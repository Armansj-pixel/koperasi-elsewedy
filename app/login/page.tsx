import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden p-4 sm:p-6 lg:p-8 font-sans selection:bg-blue-500 selection:text-white">
      {/* Background Decorative Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30"></div>
        <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-sky-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>
        {/* Overlay untuk memperhalus warna */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-950/80 to-slate-900/90 backdrop-blur-[1px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 flex flex-col">
        {/* Logo & Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/10 backdrop-blur-md text-5xl sm:text-6xl mb-6 border border-white/20 shadow-xl shadow-blue-900/20 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            🏦
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight">
            Koperasi Karyawan
          </h1>
          <p className="text-blue-200 text-sm sm:text-base font-medium tracking-wide opacity-90">
            PT Elsewedy Electric Indonesia
          </p>
        </div>

        {/* Card Login */}
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-blue-950/50 p-6 sm:p-10 border border-white/50 relative overflow-hidden">
          {/* Subtle Top Highlight */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500"></div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">
              Selamat Datang 👋
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Silakan masuk menggunakan NIK dan kata sandi Anda untuk mengakses sistem.
            </p>
          </div>

          <LoginForm />

          {/* Help Info Box */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 transition-colors hover:bg-blue-50/50 hover:border-blue-100">
              <div className="text-xl shrink-0 mt-0.5">💡</div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Lupa password atau tidak bisa login? Silakan hubungi{" "}
                <span className="font-bold text-blue-700">Pengurus Koperasi</span> atau{" "}
                <span className="font-bold text-blue-700">Super Admin</span> untuk bantuan.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-blue-200/60 font-medium">
            © {new Date().getFullYear()} Koperasi Jasa Karyawan PT Elsewedy Electric Indonesia
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <p className="text-[10px] text-blue-200/40 uppercase tracking-widest font-semibold">
              System PWA v1.0 · Secured
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
