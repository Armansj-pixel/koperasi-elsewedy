"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/lib/auth/actions";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (!result.success) {
      setError(result.error || "Login gagal");
      setLoading(false);
      return;
    }

    // Redirect ke halaman sesuai
    router.push(result.redirectTo || "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
          <span className="text-lg">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* NIK Input */}
      <div>
        <label
          htmlFor="nik"
          className="block text-sm font-semibold text-slate-700 mb-2"
        >
          NIK (Nomor Induk Karyawan)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            👤
          </span>
          <input
            id="nik"
            name="nik"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="contoh: 12345678"
            required
            disabled={loading}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition disabled:bg-slate-50 disabled:cursor-not-allowed"
            autoComplete="username"
          />
        </div>
      </div>

      {/* Password Input */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-slate-700 mb-2"
        >
          Password
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            🔒
          </span>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            required
            disabled={loading}
            className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition disabled:bg-slate-50 disabled:cursor-not-allowed"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          🔑 Default: 4 digit terakhir NIK Anda (akan diminta ganti saat login pertama)
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition shadow-lg shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span>Memproses...</span>
          </>
        ) : (
          <>
            <span>🚀</span>
            <span>Masuk</span>
          </>
        )}
      </button>
    </form>
  );
}
