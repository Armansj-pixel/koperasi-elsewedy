"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { changePasswordAction } from "@/lib/auth/actions";

export function ChangePasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // Password strength indicator
  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (pwd.length >= 12) score++;
    return score;
  };

  const strength = getStrength(newPassword);
  const strengthLabels = ["Sangat Lemah", "Lemah", "Sedang", "Kuat", "Sangat Kuat", "Maksimal"];
  const strengthColors = ["#ef4444", "#f97316", "#eab308", "#3b82f6", "#10b981", "#059669"];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await changePasswordAction(formData);

    if (!result.success) {
      setError(result.error || "Gagal mengganti password");
      setLoading(false);
      return;
    }

    setSuccess(true);

    // Tunggu 1.5 detik untuk show success message, lalu redirect
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1500);
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-4xl mb-4">
          ✅
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Password Berhasil Diubah!
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          Mengarahkan ke dashboard...
        </p>
        <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
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

      {/* New Password */}
      <div>
        <label
          htmlFor="newPassword"
          className="block text-sm font-semibold text-slate-700 mb-2"
        >
          Password Baru
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            🔑
          </span>
          <input
            id="newPassword"
            name="newPassword"
            type={showNew ? "text" : "password"}
            placeholder="Min. 8 karakter"
            required
            disabled={loading}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition disabled:bg-slate-50"
            autoComplete="new-password"
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
          >
            {showNew ? "🙈" : "👁️"}
          </button>
        </div>

        {/* Password Strength Bar */}
        {newPassword && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-1.5 flex-1 rounded-full transition-all"
                  style={{
                    backgroundColor:
                      i < strength ? strengthColors[strength - 1] : "#e2e8f0",
                  }}
                />
              ))}
            </div>
            <p
              className="text-xs font-semibold"
              style={{ color: strengthColors[strength - 1] || "#64748b" }}
            >
              {newPassword ? strengthLabels[strength] || "Sangat Lemah" : ""}
            </p>
          </div>
        )}

        {/* Validation Hints */}
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span
            className={`flex items-center gap-1 ${
              newPassword.length >= 8 ? "text-green-600" : "text-slate-400"
            }`}
          >
            {newPassword.length >= 8 ? "✓" : "○"} 8+ karakter
          </span>
          <span
            className={`flex items-center gap-1 ${
              /[A-Z]/.test(newPassword) ? "text-green-600" : "text-slate-400"
            }`}
          >
            {/[A-Z]/.test(newPassword) ? "✓" : "○"} Huruf besar
          </span>
          <span
            className={`flex items-center gap-1 ${
              /[0-9]/.test(newPassword) ? "text-green-600" : "text-slate-400"
            }`}
          >
            {/[0-9]/.test(newPassword) ? "✓" : "○"} Angka
          </span>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-semibold text-slate-700 mb-2"
        >
          Konfirmasi Password Baru
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            🔒
          </span>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            placeholder="Ketik ulang password baru"
            required
            disabled={loading}
            className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition disabled:bg-slate-50"
            autoComplete="new-password"
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
          >
            {showConfirm ? "🙈" : "👁️"}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || strength < 3}
        className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3 rounded-lg transition shadow-lg shadow-orange-500/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span>Memproses...</span>
          </>
        ) : (
          <>
            <span>🔐</span>
            <span>Ganti Password Sekarang</span>
          </>
        )}
      </button>
    </form>
  );
}
