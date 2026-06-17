"use client";

import { useState, useMemo } from "react";
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
    allowedRoles: ["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS"],
  },
  {
    icon: "💰", label: "Simpanan",  href: "/dashboard/simpanan", isActive: true,  bg: "#d1fae5",
    allowedRoles: ["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS", "ANGGOTA"],
  },
  {
    icon: "💳", label: "Pinjaman",  href: "/dashboard/pinjaman", isActive: true,  bg: "#fef3c7",
    allowedRoles: ["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS", "ANGGOTA"],
  },
  {
    icon: "👤", label: "Profil",    href: "/dashboard/profil",   isActive: true,  bg: "#f3e8ff",
    allowedRoles: ["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS", "ANGGOTA"],
  },
  {
    icon: "✅", label: "Approval",  href: "#",                   isActive: false, bg: "#ede9fe",
    allowedRoles: ["SUPERADMIN", "KETUA", "BENDAHARA", "SEKRETARIS"],
  },
  {
    icon: "📊", label: "Laporan",   href: "#",                   isActive: false, bg: "#ffe4e6",
    allowedRoles: ["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS"],
  },
  {
    icon: "📒", label: "Kas Kecil", href: "#",                   isActive: false, bg: "#ccfbf1",
    allowedRoles: ["SUPERADMIN", "BENDAHARA"],
  },
  {
    icon: "📰", label: "Berita",    href: "#",                   isActive: false, bg: "#e0f2fe",
    allowedRoles: ["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS", "ANGGOTA"],
  },
  {
    icon: "📚", label: "Akuntansi", href: "#",                   isActive: false, bg: "#e0e7ff",
    allowedRoles: ["SUPERADMIN", "BENDAHARA"],
  },
];

export function DashboardClient({ user }: { user: CurrentUser }) {
  const [loggingOut, setLoggingOut]     = useState(false);
  const [isMemberMode, setIsMemberMode] = useState(false);

  const isPengurus = ["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS"].includes(user.role);
  const effectiveRole = isPengurus && isMemberMode ? "ANGGOTA" : user.role;

  // Memoize daftar menu agar tidak dihitung ulang setiap kali toggle ditekan
  const allowedModules = useMemo(
    () => modules.filter((m) => m.allowedRoles.includes(effectiveRole)),
    [effectiveRole]
  );

  // Penanganan logout yang proper untuk Next.js App Router
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

  return (
    <main className="kop-shell min-h-screen bg-slate-100 flex justify-center">

      {/* Global & Animation Styles */}
      <style>{`
        .kop-shell { font-family: var(--font-inter, 'Inter', sans-serif); }

        .kop-header {
          background: linear-gradient(145deg, #0f2d6b 0%, #1a4db3 60%, #2563eb 100%);
          padding: 48px 24px 80px;
          position: relative;
          overflow: hidden;
        }
        .kop-header::before {
          content: ''; position: absolute;
          top: -60px; right: -40px;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(255,255,255,.12) 0%, transparent 70%);
          border-radius: 50%; pointer-events: none;
        }
        .kop-header::after {
          content: ''; position: absolute;
          bottom: 20px; left: -30px;
          width: 140px; height: 140px;
          background: radial-gradient(circle, rgba(59,130,246,.25) 0%, transparent 70%);
          border-radius: 50%; pointer-events: none;
        }

        .kop-logout-btn {
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(255,255,255,.15);
          border: 1px solid rgba(255,255,255,.2);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background .2s;
          backdrop-filter: blur(8px);
        }
        .kop-logout-btn:hover  { background: rgba(255,255,255,.25); }
        .kop-logout-btn:disabled { opacity: .6; cursor: not-allowed; }

        .kop-card {
          background: #fff; border-radius: 24px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 24px rgba(15,45,107,.07);
        }

        .kop-menu-icon {
          width: 52px; height: 52px; border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; position: relative;
          transition: transform .2s, box-shadow .2s;
        }
        .kop-menu-link:hover .kop-menu-icon {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,.12);
        }

        @keyframes kop-ping {
          0%  { transform: scale(1); opacity: .4; }
          70% { transform: scale(2.2); opacity: 0; }
          100%{ opacity: 0; }
        }
        .kop-ping-ring {
          position: absolute; inset: 0; border-radius: 50%;
          background: #3b82f6; opacity: .4;
          animation: kop-ping 1.4s ease-out infinite;
        }

        @keyframes kop-spin { to { transform: rotate(360deg); } }
        .kop-spin {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,.3);
          border-top-color: white; border-radius: 50%;
          animation: kop-spin .7s linear infinite;
        }
      `}</style>

      <div className="w-full max-w-md bg-slate-100 min-h-screen relative sm:shadow-2xl sm:border-x sm:border-slate-200 overflow-hidden">

        {/* ── HEADER ── */}
        <div className="kop-header">
          <div className="flex justify-between items-center relative z-10">
            <div>
              <p className="text-[11px] font-semibold tracking-widest uppercase text-white/55 mb-1">
                Koperasi Elsewedy
              </p>
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                Dashboard
              </h1>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="kop-logout-btn"
              aria-label="Logout"
            >
              {loggingOut ? (
                <div className="kop-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="px-4 pb-8 -mt-[60px] relative z-[5]">

          {/* ── PROFILE CARD ── */}
          <div className="kop-card p-5 mb-4">
            <div className="flex items-center gap-3.5 mb-4">

              {/* Avatar */}
              <div className="w-[52px] h-[52px] rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center border-2 border-blue-100 shrink-0">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                  stroke="#1a4db3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-400 font-medium mb-0.5">
                  Selamat datang,
                </p>
                <h2 className="text-[17px] font-extrabold text-slate-900 tracking-tight leading-tight truncate">
                  {user.nama}
                </h2>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">
                  {roleLabels[user.role]}
                </span>
              </div>
            </div>

            {/* Toggle Member Mode (Khusus Pengurus) */}
            {isPengurus && (
              <button
                onClick={() => setIsMemberMode((prev) => !prev)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                  isMemberMode
                    ? "bg-purple-50 border-purple-200 text-purple-700"
                    : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <span className="text-[13px] font-medium">
                  {isMemberMode ? "👁️ Mode Anggota Aktif" : "👁️ Lihat sebagai Anggota"}
                </span>
                <div className={`w-9 h-5 rounded-full transition-colors duration-200 relative ${
                  isMemberMode ? "bg-purple-500" : "bg-slate-300"
                }`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                    isMemberMode ? "translate-x-4" : "translate-x-0.5"
                  }`} />
                </div>
              </button>
            )}
          </div>

          {/* ── MODULE GRID ── */}
          <div className="kop-card p-5">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-400 mb-4">
              Menu Utama
            </p>

            <div className="grid grid-cols-3 gap-3">
              {allowedModules.map((module) => {
                // LOGIKA PENGALIHAN URL PRIBADI PENGURUS
                let targetHref = module.href;
                if (isPengurus && isMemberMode) {
                  if (module.label === "Simpanan") targetHref = `/dashboard/simpanan/${user.id}`;
                  if (module.label === "Pinjaman") targetHref = `/dashboard/pinjaman/${user.id}`;
                }

                const iconContent = (
                  <>
                    <div className="kop-menu-icon" style={{ background: module.bg }}>
                      <span>{module.icon}</span>
                      {module.isActive && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white">
                          <span className="kop-ping-ring" />
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] font-medium mt-2 text-center leading-tight ${
                      module.isActive ? "text-slate-700" : "text-slate-400"
                    }`}>
                      {module.label}
                    </p>
                    {!module.isActive && (
                      <span className="text-[9px] text-slate-400 mt-0.5">Segera</span>
                    )}
                  </>
                );

                return (
                  <div key={module.label} className="flex flex-col items-center">
                    {module.isActive ? (
                      <Link
                        href={targetHref}
                        className="kop-menu-link flex flex-col items-center w-full"
                      >
                        {iconContent}
                      </Link>
                    ) : (
                      <div className="flex flex-col items-center w-full opacity-50 cursor-not-allowed">
                        {iconContent}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
