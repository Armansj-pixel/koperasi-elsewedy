import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-md text-5xl mb-4 border border-white/30">
            🏦
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Koperasi Karyawan
          </h1>
          <p className="text-blue-100 text-sm">
            PT Elsewedy Electric Indonesia
          </p>
        </div>

        {/* Card Login */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-1">
            Masuk ke Akun Anda
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Gunakan NIK karyawan & password Anda
          </p>

          <LoginForm />

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              💡 Lupa password? Hubungi pengurus koperasi atau Super Admin.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-blue-100 mt-6">
          © 2026 Koperasi Karyawan PT Elsewedy Electric Indonesia
          <br />
          Powered by PWA Koperasi v1.0
        </p>
      </div>
    </main>
  );
}
