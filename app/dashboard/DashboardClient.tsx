"use client";

import React, { useState, useMemo } from "react";
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
  { 
    icon: "👥", label: "Anggota",   href: "/dashboard/anggota",  isActive: true,  bg: "#dbeafe",
    allowedRoles: ["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS"]
  },
  { 
    icon: "💰", label: "Simpanan",  href: "/dashboard/simpanan", isActive: true,  bg: "#d1fae5",
    allowedRoles: ["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS", "ANGGOTA"] 
  },
  { 
    icon: "💳", label: "Pinjaman",  href: "/dashboard/pinjaman", isActive: true,  bg: "#fef3c7",
    allowedRoles: ["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS", "ANGGOTA"] 
  },
  { 
    icon: "👤", label: "Profil",    href: "/dashboard/profil",   isActive: true,  bg: "#f3e8ff",
    allowedRoles: ["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS", "ANGGOTA"] 
  },
  { 
    icon: "✅", label: "Approval",  href: "#",                   isActive: false, bg: "#ede9fe",
    allowedRoles: ["SUPERADMIN", "KETUA", "BENDAHARA", "SEKRETARIS"] 
  },
  { 
    icon: "📊", label: "Laporan",   href: "#",                   isActive: false, bg: "#ffe4e6",
    allowedRoles: ["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS"] 
  },
  { 
    icon: "📒", label: "Kas Kecil", href: "#",                   isActive: false, bg: "#ccfbf1",
    allowedRoles: ["SUPERADMIN", "BENDAHARA"] 
  },
  { 
    icon: "📰", label: "Berita",    href: "#",                   isActive: false, bg: "#e0f2fe",
    allowedRoles: ["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS", "ANGGOTA"] 
  },
  { 
    icon: "📚", label: "Akuntansi", href: "#",                   isActive: false, bg: "#e0e7ff",
    allowedRoles: ["SUPERADMIN", "BENDAHARA"] 
  },
];

export function DashboardClient({ user }: { user: CurrentUser }) {
  const [loggingOut, setLoggingOut] = useState(false);
  const [isMemberMode, setIsMemberMode] = useState(false);

  // Cek role dan tentukan role efektif berdasarkan Switch Mode
  const isPengurus = ["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS"].includes(user.role);
  const effectiveRole = (isPengurus && isMemberMode) ? "ANGGOTA" : user.role;

  // Filter menu yang boleh tampil
  const allowedModules = useMemo(
    () => modules.filter((m) => m.allowedRoles.includes(effectiveRole)),
    [effectiveRole]
  );

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logoutAction();
    } catch (error) {
      const isRedirect = error instanceof Error && error.message.includes("NEXT_REDIRECT");
      if (!isRedirect) {
        console.error("Logout gagal:", error);
        setLoggingOut(false);
      }
    }
  }

  // SEMUA CUSTOM CSS DIUBAH MENJADI TAILWIND & INLINE STYLE AGAR VERCEL TIDAK ERROR
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center font-sans">
      <div className="w-full max-w-md bg-slate-100 min-h-screen relative sm:shadow-2xl sm:border-x sm:border-slate-200 overflow-hidden">
        
        {/* ── HEADER ── */}
        <div className="relative overflow-hidden" style={{ background: "linear-gradient(145deg, #0f2d6b 0%, #1a4db3 60%, #2563eb 100%)", padding: "48px 24px 80px" }}>
          {/* Decorative Background Circles */}
          <div className="absolute top-[-60px] right-[-40px] w-[200px] h-[200px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,255,255,.12) 0%, transparent 70%)" }} />
          <div className="absolute bottom-[20px] left-[-30px] w-[140px] h-[140px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(59,130,246,.25) 0%, transparent 70%)" }} />
          
          <div className="flex justify-between items-center relative z-10">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-white/55 mb-1">
                Koperasi Elsewedy
              </p>
              <h1 className="text-[20px] font-extrabold text-white tracking-tight">
                Dashboard
              </h1>
            </div>

            <button 
              onClick={handleLogout} 
              disabled={loggingOut} 
              className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors backdrop-blur-md hover:bg-white/25 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.2)" }}
            >
              {loggingOut ? (
                <div className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="px-4 pb-8 -mt-[60px] relative z-10">

          {/* ── PROFILE CARD ── */}
          <div className="bg-white rounded-[24px] border border-slate-200 p-5 mb-4" style={{ boxShadow: "0 4px 24px rgba(15,45,107,.07)" }}>
            <div className="flex items-center gap-[14px] mb-4">
              <div className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center border-2 border-blue-100 shrink-0" style={{ background: "linear-gradient(135deg,#dbeafe,#eff6ff)" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a4db3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>

              <div>
                <p className="text-[11px] text-slate-400 font-medium mb-[2px]">Selamat datang,</p>
                <h2 className="text-[17px] font-extrabold text-slate-900 tracking-[-0.02em] leading-tight">
                  {user.nama}
                </h2>
                <span className="inline-block mt-[5px] bg-blue-50 text-blue-700 border border-blue-100 text-[9px] font-bold tracking-[0.1em] uppercase px-[8px] py-[3px] rounded-full">
                  {roleLabels[user.role]}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 rounded-[14px] p-3 border border-slate-200">
                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400 mb-[5px]">NIK Karyawan</p>
                <p className="text-[14px] font-bold text-slate-900 tabular-nums">{user.nik}</p>
              </div>
              <div className="bg-slate-50 rounded-[14px] p-3 border border-slate-200">
                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400 mb-[5px]">Status Akun</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-50" />
                  <span className="text-[14px] font-bold text-emerald-500">Aktif</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── TOMBOL SWITCH MODE (KHUSUS PENGURUS - DESAIN ORIGINAL) ── */}
          {isPengurus && (
            <div className="bg-white rounded-[24px] border p-3 px-4 mb-4 flex justify-between items-center transition-all duration-300" style={{ boxShadow: "0 4px 24px rgba(15,45,107,.07)", borderColor: isMemberMode ? "#bbf7d0" : "#e2e8f0", background: isMemberMode ? "#f0fdf4" : "#fff" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: isMemberMode ? "#dcfce7" : "#eff6ff", color: isMemberMode ? "#16a34a" : "#2563eb" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {isMemberMode ? (
                      <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>
                    ) : (
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    )}
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-bold mb-[2px]" style={{ color: isMemberMode ? "#166534" : "#0f172a" }}>
                    {isMemberMode ? 'Mode Anggota' : 'Mode Pengurus'}
                  </p>
                  <p className="text-[10px]" style={{ color: isMemberMode ? "#15803d" : "#64748b" }}>
                    {isMemberMode ? 'Menampilkan menu pribadi' : 'Akses menu admin'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsMemberMode(!isMemberMode)}
                className="px-3.5 py-2 rounded-lg text-[11px] font-semibold cursor-pointer transition-all duration-200"
                style={{ background: isMemberMode ? "#16a34a" : "#2563eb", color: "#fff", boxShadow: isMemberMode ? "0 2px 8px rgba(22,163,74,0.2)" : "0 2px 8px rgba(37,99,235,0.2)" }}
              >
                {isMemberMode ? 'Kembali' : 'Ganti Mode'}
              </button>
            </div>
          )}

          {/* ── MENU ── */}
          <div className="flex justify-between items-center px-1 mb-3">
            <h3 className="text-[15px] font-extrabold text-slate-900 tracking-[-0.01em]">Menu Utama</h3>
          </div>

          <div className="bg-white rounded-[24px] border border-slate-200 p-5 mb-4" style={{ boxShadow: "0 4px 24px rgba(15,45,107,.07)" }}>
            <div className="grid grid-cols-4 gap-y-4 gap-x-1">
              {allowedModules.map((item, idx) => {
                if (item.isActive) {
                  // LOGIKA PENGALIHAN URL PRIBADI PENGURUS
                  let targetHref = item.href;
                  if (isPengurus && isMemberMode) {
                    if (item.label === "Simpanan") targetHref = `/dashboard/simpanan/${user.id}`;
                    if (item.label === "Pinjaman") targetHref = `/dashboard/pinjaman/${user.id}`;
                  }

                  return (
                    <Link key={idx} href={targetHref} className="group flex flex-col items-center gap-[7px] decoration-transparent">
                      <div className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-[22px] relative transition-all duration-200 group-hover:-translate-y-[3px] group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)]" style={{ background: item.bg }}>
                        {item.icon}
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 text-center leading-[1.3]">
                        {item.label}
                      </span>
                    </Link>
                  );
                }
                return (
                  <div key={idx} className="flex flex-col items-center gap-[7px]">
                    <div className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-[22px] relative opacity-45 grayscale" style={{ background: "#f1f5f9" }}>
                      {item.icon}
                      <span className="absolute top-[-5px] right-[-5px] bg-slate-400 text-white text-[7px] font-extrabold tracking-[0.05em] px-[5px] py-[2px] rounded-lg uppercase">
                        Soon
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 text-center leading-[1.3]">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div className="text-center pt-2 pb-1">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5 mb-3">
              <div className="relative w-2 h-2 flex items-center justify-center">
                <div className="absolute w-full h-full bg-blue-500 rounded-full opacity-40 animate-ping" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 relative z-10" />
              </div>
              <span className="text-[9px] font-bold text-blue-700 tracking-[0.1em] uppercase">
                Sistem Terhubung
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-[1.6] font-medium">
              © {new Date().getFullYear()} Koperasi PT Elsewedy<br />
              Developed by Carlo Tech™
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
