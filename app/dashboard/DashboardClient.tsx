"use client";

import { useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/lib/auth/actions";
import type { CurrentUser } from "@/lib/auth/session";

const roleLabels: Record<CurrentUser["role"], string> = {
  ANGGOTA: "Anggota",
  SEKRETARIS: "Sekretaris",
  BENDAHARA: "Bendahara",
  KETUA: "Ketua",
  SUPERADMIN: "Super Admin",
};

const modules = [
  { icon: "👥", label: "Anggota", href: "/dashboard/anggota", isActive: true, color: "bg-blue-100 text-blue-600" },
  { icon: "💰", label: "Simpanan", href: "/dashboard/simpanan", isActive: true, color: "bg-green-100 text-green-600" },
  { icon: "💳", label: "Pinjaman", href: "/dashboard/pinjaman", isActive: true, color: "bg-amber-100 text-amber-600" },
  { icon: "✅", label: "Approval", href: "#", isActive: false, color: "bg-purple-100 text-purple-600" },
  { icon: "📊", label: "Laporan", href: "#", isActive: false, color: "bg-rose-100 text-rose-600" },
  { icon: "📒", label: "Kas Kecil", href: "#", isActive: false, color: "bg-teal-100 text-teal-600" },
  { icon: "📰", label: "Berita", href: "#", isActive: false, color: "bg-sky-100 text-sky-600" },
  { icon: "📚", label: "Akuntansi", href: "#", isActive: false, color: "bg-indigo-100 text-indigo-600" },
];

export function DashboardClient({ user }: { user: CurrentUser }) {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await logoutAction();
  }

  return (
    // Background utama abu-abu terang agar Card putih bisa menonjol
    <main className="min-h-screen bg-slate-50 font-sans sm:flex sm:justify-center">
      
      {/* Mobile App Container (Maksimal lebar layar HP, di tengah kalau di PC) */}
      <div className="w-full max-w-md bg-slate-50 min-h-screen relative shadow-2xl sm:border-x sm:border-slate-200 overflow-hidden">
        
        {/* --- 1. CURVED HEADER BACKGROUND --- */}
        <div className="bg-blue-700 px-6 pt-10 pb-28 rounded-b-[2.5rem] relative">
          {/* Efek pattern/glow di background atas */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
          
          <div className="flex justify-between items-center relative z-10">
            <div>
              <p className="text-blue-200 text-sm font-medium mb-1">Koperasi Elsewedy</p>
              <h1 className="text-white text-xl font-bold tracking-wide">Dashboard</h1>
            </div>
            
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="bg-white/20 hover:bg-white/30 p-2.5 rounded-full backdrop-blur-sm transition-all"
              aria-label="Logout"
            >
              {loggingOut ? (
                <span className="block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <span className="text-white text-lg">🚪</span>
              )}
            </button>
          </div>
        </div>

        {/* --- 2. FLOATING PROFILE CARD --- */}
        {/* Margin top minus (-mt-20) menarik kartu ini ke atas sehingga menimpa header */}
        <div className="px-5 -mt-20 relative z-20">
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/60 border border-slate-100">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                👤
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-0.5">Selamat datang,</p>
                <h2 className="text-lg font-bold text-slate-800 leading-tight">
                  {user.nama}
                </h2>
                <div className="inline-block mt-1 bg-blue-50 border border-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {roleLabels[user.role]}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-1">NIK Karyawan</p>
                <p className="font-mono text-sm font-bold text-slate-700">{user.nik}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-1">Status Akun</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <p className="text-sm font-bold text-green-600">Aktif</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- 3. MENU GRID SECTION --- */}
        <div className="px-5 mt-8 pb-10">
          <div className="flex justify-between items-end mb-4 px-1">
            <h3 className="text-lg font-bold text-slate-800">Menu Utama</h3>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-lg shadow-slate-200/40 border border-slate-100">
            <div className="grid grid-cols-4 gap-y-6 gap-x-2">
              {modules.map((item, idx) => {
                if (item.isActive) {
                  return (
                    <Link key={idx} href={item.href} className="flex flex-col items-center gap-2 group">
                      <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center text-xl group-hover:scale-110 transition-transform shadow-sm`}>
                        {item.icon}
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 text-center leading-tight">
                        {item.label}
                      </span>
                    </Link>
                  );
                }

                // Modul belum aktif
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 relative opacity-60">
                    <div className="absolute -top-2 -right-1 z-10 bg-slate-200 text-slate-600 text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                      Soon
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl grayscale">
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 text-center leading-tight">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- 4. SYSTEM INFO FOOTER --- */}
        <div className="px-5 pb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">
              Sistem Terhubung
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            © {new Date().getFullYear()} Koperasi PT Elsewedy
            <br />
            Developed by Carlo Tech™️
          </p>
        </div>

      </div>
    </main>
  );
}
