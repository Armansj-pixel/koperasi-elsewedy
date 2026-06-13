import { requireAuth } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "./ChangePasswordForm";

export default async function ChangePasswordPage() {
  const user = await requireAuth();

  // Kalau sudah ganti password, redirect ke dashboard
  if (!user.mustChangePassword) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-md text-5xl mb-4 border border-white/30">
            🔐
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Ganti Password
          </h1>
          <p className="text-orange-100 text-sm">
            Login pertama - wajib ganti password default
          </p>
        </div>

        {/* Welcome Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-4 text-white">
          <div className="flex items-start gap-3">
            <span className="text-2xl">👋</span>
            <div>
              <p className="font-semibold">Halo, {user.nama}!</p>
              <p className="text-sm opacity-90">
                Demi keamanan akun Anda, silakan ganti password default ke
                password yang lebih kuat.
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-1">
            Buat Password Baru
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Password harus minimal 8 karakter, mengandung huruf besar dan angka
          </p>

          <ChangePasswordForm />

          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800">
                <strong>💡 Tips Password Aman:</strong>
                <br />• Minimal 8 karakter
                <br />• Kombinasi huruf besar (A-Z) & angka (0-9)
                <br />• Hindari tanggal lahir atau NIK
                <br />• Jangan share ke siapapun
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
