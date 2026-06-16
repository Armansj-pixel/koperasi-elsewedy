"use client";

import { useState } from "react";
import Link from "next/link";
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
  ANGGOTA: "from-blue-600 to-indigo-700",
  SEKRETARIS: "from-purple-600 to-fuchsia-700",
  BENDAHARA: "from-emerald-600 to-teal-700",
  KETUA: "from-amber-600 to-orange-700",
  SUPERADMIN: "from-rose-600 to-pink-700",
};

const roleEmojis: Record<CurrentUser["role"], string> = {
  ANGGOTA: "👤",
  SEKRETARIS: "📋",
  BENDAHARA: "💼",
  KETUA: "👔",
  SUPERADMIN: "🛠️",
};

// Pemisahan data modul agar lebih mudah dikelola
const modules = [
  { icon: "👥", label: "Anggota", href: "/dashboard/anggota", isActive: true },
  { icon: "💰", label: "Simpanan", href: "/dashboard/simpanan", isActive: true },
  { icon: "💳", label: "Pinjaman", href: "/dashboard/pinjaman", isActive: true },
  { icon: "✅", label: "Approval", href: "#", isActive: false },
  { icon: "📊", label: "Laporan", href: "#", isActive: false },
  { icon: "📒", label: "Kas Kecil", href: "#", isActive: false },
  { icon: "📰", label: "Berita", href: "#", isActive: false },
  { icon: "📚", label: "Akuntansi", href: "#", isActive: false },
];

export function DashboardClient({ user }: { user: CurrentUser }) {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await logoutAction();
  }

  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200">
      {/* Header - Dibuat sticky dan glassmorphism */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl p-2 bg-blue-50 rounded-xl">🏦</div>
            <div>
              <h1 className="font-bold text-slate-800 tracking-tight">
                Koperasi Elsewedy
              </h1>
              <p className="text-xs font-medium text-slate-500">PWA v1.0</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="group flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-semibold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loggingOut ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-red-300 border-t-red-700 rounded-full animate-spin"></span>
                <span>Keluar...</span>
              </>
            ) : (
              <>
                <span className="group-hover:-translate-x-1 transition-transform">🚪</span>
                <span className="hidden sm:inline">Logout</span>
              </>
            )}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card - Warna gradient dipertajam dan shadow ditambahkan */}
        <div
          className={`bg-gradient-to-br ${roleColors[user.role]} rounded-3xl shadow-xl shadow-slate-200/50 p-6 md:p-10 text-white mb-8 relative overflow-hidden`}
        >
          {/* Dekorasi background */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-white/80 mb-1">
                Selamat datang kembali,
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
                {user.nama}
              </h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-xl bg-white/20 p-1.5 rounded-lg shadow-sm">
                  {roleEmojis[user.role]}
                </span>
                <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full font-semibold border border-white/20 shadow-sm">
                  {roleLabels[user.role]}
                </span>
              </div>
            </div>
            
            <div className="bg-black/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 w-full md:w-auto shadow-inner">
              <p className="text-xs font-medium text-white/70 uppercase tracking-wider mb-1">
                Nomor Induk Karyawan
              </p>
              <p className="font-mono font-bold text-2xl tracking-widest">{user.nik}</p>
            </div>
          </div>
        </div>

        {/* Status Cards - Dibuat lebih clean dengan hover state ringan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200/60 p-5 transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-2xl border border-green-100">
                ✅
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status Akun</p>
                <p className="font-bold text-green-700 text-lg">Aktif</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200/60 p-5 transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl border border-blue-100">
                📧
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Alamat Email</p>
                <p className="font-semibold text-slate-800 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200/60 p-5 transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-2xl border border-purple-100">
                🆔
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">User ID</p>
                <p className="font-mono text-sm font-semibold text-slate-700 truncate">
                  {user.id.substring(0, 13)}<span className="text-slate-400">...</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modules Grid - Pemisahan visual antara modul aktif dan coming soon */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4 px-1">Menu Utama</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {modules.map((item, idx) => {
              if (item.isActive) {
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-400 hover:-translate-y-1 transition-all text-center relative overflow-hidden active:scale-95"
                  >
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </div>
                    <div className="text-sm font-bold text-slate-700 group-hover:text-blue-700 transition-colors">
                      {item.label}
                    </div>
                  </Link>
                );
              }

              // Card untuk modul yang belum aktif
              return (
                <div
                  key={idx}
                  className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-sm text-center relative opacity-75 cursor-not-allowed"
                >
                  <div className="absolute top-3 right-3 bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                    Segera
                  </div>
                  <div className="text-4xl mb-3 grayscale opacity-60">
                    {item.icon}
                  </div>
                  <div className="text-sm font-semibold text-slate-500">
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Status Banner */}
        <div className="mt-12 bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <p className="text-sm font-medium text-blue-900">
              Sistem Operasional & Database Terhubung
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-blue-600 font-medium">
            <span className="bg-blue-100 px-2 py-1 rounded-md">Auth: Aktif</span>
            <span className="bg-blue-100 px-2 py-1 rounded-md">Host: Vercel</span>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-slate-400">
          <p className="text-xs font-medium">
            © {new Date().getFullYear()} Koperasi Jasa Karyawan PT Elsewedy Electric Indonesia
          </p>
          <p className="text-[10px] mt-1 opacity-70">
            Developed by Carlo Tech™️
          </p>
        </div>
      </div>
    </main>
  );
}
