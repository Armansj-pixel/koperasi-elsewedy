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
  { icon: "👥", label: "Anggota",   href: "/dashboard/anggota",  isActive: true,  bg: "#dbeafe" },
  { icon: "💰", label: "Simpanan",  href: "/dashboard/simpanan", isActive: true,  bg: "#d1fae5" },
  { icon: "💳", label: "Pinjaman",  href: "/dashboard/pinjaman", isActive: true,  bg: "#fef3c7" },
  { icon: "✅", label: "Approval",  href: "#",                   isActive: false, bg: "#ede9fe" },
  { icon: "📊", label: "Laporan",   href: "#",                   isActive: false, bg: "#ffe4e6" },
  { icon: "📒", label: "Kas Kecil", href: "#",                   isActive: false, bg: "#ccfbf1" },
  { icon: "📰", label: "Berita",    href: "#",                   isActive: false, bg: "#e0f2fe" },
  { icon: "📚", label: "Akuntansi", href: "#",                   isActive: false, bg: "#e0e7ff" },
];

export function DashboardClient({ user }: { user: CurrentUser }) {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await logoutAction();
  }

  return (
    <>
      {/* ── GLOBAL STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .kop-shell { font-family: 'Inter', sans-serif; }

        .kop-header {
          background: linear-gradient(145deg, #0f2d6b 0%, #1a4db3 60%, #2563eb 100%);
          padding: 48px 24px 80px;
          position: relative;
          overflow: hidden;
        }
        .kop-header::before {
          content: '';
          position: absolute;
          top: -60px; right: -40px;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(255,255,255,.12) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .kop-header::after {
          content: '';
          position: absolute;
          bottom: 20px; left: -30px;
          width: 140px; height: 140px;
          background: radial-gradient(circle, rgba(59,130,246,.25) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .kop-logout-btn {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,.15);
          border: 1px solid rgba(255,255,255,.2);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background .2s;
          backdrop-filter: blur(8px);
        }
        .kop-logout-btn:hover { background: rgba(255,255,255,.25); }
        .kop-logout-btn:disabled { opacity: .6; cursor: not-allowed; }

        .kop-card {
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 24px rgba(15,45,107,.07);
        }

        .kop-menu-icon {
          width: 52px; height: 52px;
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
          position: relative;
          transition: transform .2s, box-shadow .2s;
        }
        .kop-menu-link:hover .kop-menu-icon {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,.12);
        }

        .kop-ping-ring {
          position: absolute; inset: 0;
          border-radius: 50%;
          background: #3b82f6;
          opacity: .4;
          animation: kop-ping 1.4s ease-out infinite;
        }
        @keyframes kop-ping {
          0%   { transform: scale(1); opacity: .4; }
          70%  { transform: scale(2.2); opacity: 0; }
          100% { opacity: 0; }
        }

        .kop-spin {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,.3);
          border-top-color: white;
          border-radius: 50%;
          animation: kop-spin .7s linear infinite;
        }
        @keyframes kop-spin { to { transform: rotate(360deg); } }
      `}</style>

      <main className="kop-shell min-h-screen bg-slate-100 flex justify-center">
        <div className="w-full max-w-md bg-slate-100 min-h-screen relative sm:shadow-2xl sm:border-x sm:border-slate-200 overflow-hidden">

          {/* ── 1. HEADER ── */}
          <div className="kop-header">
            <div className="flex justify-between items-center relative z-10">
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginBottom: 4 }}>
                  Koperasi Elsewedy
                </p>
                <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-.02em' }}>
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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* ── BODY ── */}
          <div style={{ padding: '0 16px 32px', marginTop: -60, position: 'relative', zIndex: 5 }}>

            {/* ── 2. PROFILE CARD ── */}
            <div className="kop-card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                {/* Avatar */}
                <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,#dbeafe,#eff6ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #dbeafe', flexShrink: 0 }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a4db3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>

                <div>
                  <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, marginBottom: 2 }}>Selamat datang,</p>
                  <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', letterSpacing: '-.02em', lineHeight: 1.2 }}>
                    {user.nama}
                  </h2>
                  <span style={{ display: 'inline-block', marginTop: 5, background: '#eff6ff', color: '#1a4db3', border: '1px solid #dbeafe', fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 20 }}>
                    {roleLabels[user.role]}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: '#f1f5f9', borderRadius: 14, padding: '12px 14px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#94a3b8', marginBottom: 5 }}>NIK Karyawan</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>{user.nik}</p>
                </div>
                <div style={{ background: '#f1f5f9', borderRadius: 14, padding: '12px 14px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#94a3b8', marginBottom: 5 }}>Status Akun</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 3px #ecfdf5' }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>Aktif</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 3. MENU ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', letterSpacing: '-.01em' }}>Menu Utama</h3>
            </div>

            <div className="kop-card" style={{ padding: '20px 16px', marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px 4px' }}>
                {modules.map((item, idx) => {
                  if (item.isActive) {
                    return (
                      <Link key={idx} href={item.href} className="kop-menu-link" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, textDecoration: 'none' }}>
                        <div className="kop-menu-icon" style={{ background: item.bg }}>
                          {item.icon}
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#475569', textAlign: 'center', lineHeight: 1.3 }}>
                          {item.label}
                        </span>
                      </Link>
                    );
                  }
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                      <div className="kop-menu-icon" style={{ background: '#f1f5f9', opacity: .45, filter: 'grayscale(1)', position: 'relative' }}>
                        {item.icon}
                        <span style={{ position: 'absolute', top: -5, right: -5, background: '#94a3b8', color: '#fff', fontSize: 7, fontWeight: 800, letterSpacing: '.05em', padding: '2px 5px', borderRadius: 8, textTransform: 'uppercase' }}>
                          Soon
                        </span>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textAlign: 'center', lineHeight: 1.3 }}>
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── 4. FOOTER ── */}
            <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: 20, padding: '5px 12px', marginBottom: 12 }}>
                <div style={{ position: 'relative', width: 8, height: 8 }}>
                  <div className="kop-ping-ring" />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb', position: 'relative', zIndex: 1 }} />
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#1a4db3', letterSpacing: '.1em', textTransform: 'uppercase' }}>
                  Sistem Terhubung
                </span>
              </div>
              <p style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.6, fontWeight: 500 }}>
                © {new Date().getFullYear()} Koperasi PT Elsewedy<br />
                Developed by Carlo Tech™
              </p>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
