"use client";

import { useState } from "react";
import { logoutAction } from "@/lib/auth/actions";
import type { CurrentUser } from "@/lib/auth/session";

const roleLabels: Record<CurrentUser["role"], string> = {
  ANGGOTA: "Anggota",
  SEKRETARIS: "Sekretaris Koperasi",
  BENDAHARA: "Bendahara Koperasi",
  KETUA: "Ketua Koperasi",
  SUPERADMIN: "Super Administrator",
};

const roleColors: Record<CurrentUser["role"], string> = {
  ANGGOTA: "from-blue-500 to-blue-600",
  SEKRETARIS: "from-purple-500 to-purple-600",
  BENDAHARA: "from-green-500 to-green-600",
  KETUA: "from-amber-500 to-orange-600",
  SUPERADMIN: "from-red-500 to-pink-600",
};

const roleEmojis: Record<CurrentUser["role"], string> = {
  ANGGOTA: "👤",
  SEKRETARIS: "📋",
  BENDAHARA: "💼",
  KETUA: "👔",
  SUPERADMIN: "🛠️",
};

export function DashboardClient({ user }: { user: CurrentUser }) {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await logoutAction();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🏦</div>
            <div>
              <h1 className="font-bold text-slate-800 text-lg">
                Koperasi Elsewedy
              </h1>
              <p className="text-xs text-slate-500">PWA v1.0</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center gap-2 disabled:opacity-50"
          >
            {loggingOut ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-red-300 border-t-red-700 rounded-full animate-spin"></span>
                <span>Logout...</span>
              </>
            ) : (
              <>
                <span>🚪</span>
                <span className="hidden sm:inline">Logout</span>
              </>
            )}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Card */}
        <div
          className={`bg-gradient-to-r ${roleColors[user.role]} rounded-2xl shadow-xl p-6 md:p-8 text-white mb-6`}
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm opacity-90 mb-1">Selamat datang kembali,</p>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {user.nama}
              </h2>
              <div className="flex items-center gap-2 text-sm opacity-95">
                <span className="text-2xl">{roleEmojis[user.role]}</span>
                <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full font-semibold">
                  {roleLabels[user.role]}
                </span>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30">
              <p className="text-xs opacity-90 mb-1">NIK</p>
              <p className="font-mono font-bold text-lg">{user.nik}</p>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-xl">
                ✅
              </div>
              <div>
                <p className="text-xs text-slate-500">Status Akun</p>
                <p className="font-bold text-green-700">Aktif</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-xl">
                📧
              </div>
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="font-semibold text-slate-700 text-sm truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-xl">
                🆔
              </div>
              <div>
                <p className="text-xs text-slate-500">User ID</p>
                <p className="font-mono text-xs text-slate-700 truncate">
                  {user.id.substring(0, 13)}...
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 md:p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              Modul Lengkap Akan Segera Hadir!
            </h3>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Anda berhasil login ke sistem PWA Koperasi Elsewedy. Modul
              simpan-pinjam, approval workflow, dan akuntansi sedang dalam
              pengembangan.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {[
  { icon: "👥", label: "Anggota", href: "/dashboard/anggota" },
  { icon: "💰", label: "Simpanan", href: "/dashboard/simpanan" },
  { icon: "💳", label: "Pinjaman", href: "#" },
  { icon: "✅", label: "Approval", href: "#" },
  { icon: "📊", label: "Laporan", href: "#" },
  { icon: "📒", label: "Kas Kecil", href: "#" },
  { icon: "📰", label: "Berita", href: "#" },
  { icon: "📚", label: "Akuntansi", href: "#" },
].map((item, idx) => (
  <a
    key={idx}
    href={item.href}
    className="bg-white rounded-xl p-3 border border-slate-200 hover:shadow-md hover:border-blue-300 transition text-center"
  >
    <div className="text-2xl mb-1">{item.icon}</div>
    <div className="text-xs font-semibold text-slate-700">{item.label}</div>
  </a>
))}

            </div>

            <div className="mt-6 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 text-sm text-slate-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>System Operational</span>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>
            🔐 Auth System Active · 🟢 Database Connected · ▲ Vercel Deployed
          </p>
          <p className="mt-2 text-xs">
            © 2026 Koperasi Karyawan PT Elsewedy Electric Indonesia
          </p>
        </div>
      </div>
    </main>
  );
}
