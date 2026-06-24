"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { logoutAction } from "@/lib/auth/actions";
import type { CurrentUser } from "@/lib/auth/session";

// ─────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────
const roleLabels: Record<CurrentUser["role"], string> = {
  ANGGOTA:    "Anggota",
  SEKRETARIS: "Sekretaris",
  BENDAHARA:  "Bendahara",
  KETUA:      "Ketua",
  SUPERADMIN: "Super Admin",
};

const roleColors: Record<CurrentUser["role"], { bg: string; color: string; border: string; dot: string }> = {
  ANGGOTA:    { bg: "#f0fdf4", color: "#15803d", border: "#86efac", dot: "#22c55e" },
  SEKRETARIS: { bg: "#eff6ff", color: "#1d4ed8", border: "#93c5fd", dot: "#3b82f6" },
  BENDAHARA:  { bg: "#fefce8", color: "#a16207", border: "#fde68a", dot: "#eab308" },
  KETUA:      { bg: "#fdf4ff", color: "#7e22ce", border: "#d8b4fe", dot: "#a855f7" },
  SUPERADMIN: { bg: "#fff1f2", color: "#be123c", border: "#fca5a5", dot: "#ef4444" },
};

const PENGURUS_ROLES = ["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS"] as const;

type Module = {
  icon: string;
  label: string;
  href: string;
  isActive: boolean;
  bg: string;
  iconColor: string;
  allowedRoles: string[];
  desc: string;
};

const modules: Module[] = [
  {
    icon: "👥",
    label: "Anggota",
    href: "/dashboard/anggota",
    isActive: true,
    bg: "#dbeafe",
    iconColor: "#1d4ed8",
    desc: "Data keanggotaan",
    allowedRoles: ["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS"],
  },
  {
    icon: "💰",
    label: "Simpanan",
    href: "/dashboard/simpanan",
    isActive: true,
    bg: "#d1fae5",
    iconColor: "#059669",
    desc: "Kelola tabungan",
    allowedRoles: ["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS", "ANGGOTA"],
  },
  {
    icon: "💳",
    label: "Pinjaman",
    href: "/dashboard/pinjaman",
    isActive: true,
    bg: "#fef3c7",
    iconColor: "#b45309",
    desc: "Pengajuan kredit",
    allowedRoles: ["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS", "ANGGOTA"],
  },
  {
    icon: "👤",
    label: "Profil",
    href: "/dashboard/profil",
    isActive: true,
    bg: "#f3e8ff",
    iconColor: "#7e22ce",
    desc: "Data pribadi",
    allowedRoles: ["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS", "ANGGOTA"],
  },
  {
    icon: "✅",
    label: "Approval",
    href: "#",
    isActive: false,
    bg: "#ede9fe",
    iconColor: "#6d28d9",
    desc: "Persetujuan",
    allowedRoles: ["SUPERADMIN", "KETUA", "BENDAHARA", "SEKRETARIS"],
  },
  {
    icon: "📊",
    label: "Laporan HR",
    href: "/dashboard/laporan",
    isActive: true,
    bg: "#ffe4e6",
    iconColor: "#be123c",
    desc: "Analitik & rekap",
    allowedRoles: ["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS"],
  },
  {
    icon: "📒",
    label: "Kas Kecil",
    href: "/dashboard/kas",
    isActive: true,
    bg: "#ccfbf1",
    iconColor: "#0f766e",
    desc: "Arus kas harian",
    allowedRoles: ["SUPERADMIN", "BENDAHARA"],
  },
  {
    icon: "📰",
    label: "Berita",
    href: "/dashboard/berita",
    isActive: true,
    bg: "#e0f2fe",
    iconColor: "#0369a1",
    desc: "Info & pengumuman",
    allowedRoles: ["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS", "ANGGOTA"],
  },
  {
    icon: "📚",
    label: "Akuntansi",
    href: "/dashboard/akuntansi",
    isActive: true,
    bg: "#e0e7ff",
    iconColor: "#4338ca",
    desc: "Pembukuan",
    allowedRoles: ["SUPERADMIN", "BENDAHARA", "SEKRETARIS", "KETUA"],
  },
  {
    icon: "⚖️",
    label: "Laporan Finansial",
    href: "/dashboard/FinancialReport",
    isActive: true,
    bg: "#ffe4e6",
    iconColor: "#be123c",
    desc: "Analitik Keuangan",
    allowedRoles: ["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS"],
  },
  {
    icon: "🩺",
    label: "System Health",
    href: "/dashboard/superadmin/health",
    isActive: true,
    bg: "#fee2e2",
    iconColor: "#dc2626",
    desc: "Monitoring sistem",
    allowedRoles: ["SUPERADMIN"],
  },
];

function getGreeting(): { text: string; emoji: string } {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return { text: "Selamat Pagi",   emoji: "🌤️" };
  if (h >= 12 && h < 15) return { text: "Selamat Siang",  emoji: "☀️" };
  if (h >= 15 && h < 18) return { text: "Selamat Sore",   emoji: "🌆" };
  return                          { text: "Selamat Malam", emoji: "🌙" };
}

// ─────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────
export function DashboardClient({ user }: { user: CurrentUser }) {
  const [loggingOut,   setLoggingOut]   = useState(false);
  const [isMemberMode, setIsMemberMode] = useState(false);
  const [greeting,     setGreeting]     = useState({ text: "Selamat Datang", emoji: "👋" });
  const [logoutModal,  setLogoutModal]  = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("kop_member_mode");
    if (saved === "true") setIsMemberMode(true);
    setGreeting(getGreeting());
  }, []);

  const toggleMode = useCallback(() => {
    setIsMemberMode(prev => {
      const next = !prev;
      localStorage.setItem("kop_member_mode", String(next));
      return next;
    });
  }, []);

  const isPengurus     = PENGURUS_ROLES.includes(user.role as typeof PENGURUS_ROLES[number]);
  const effectiveRole  = isPengurus && isMemberMode ? "ANGGOTA" : user.role;
  const visibleModules = modules.filter(m => m.allowedRoles.includes(effectiveRole));
  const activeModules  = visibleModules.filter(m => m.isActive);
  const comingSoon     = visibleModules.filter(m => !m.isActive);
  const rc             = roleColors[user.role];

  async function handleLogout() {
    setLoggingOut(true);
    setLogoutModal(false);
    try {
      localStorage.removeItem("kop_member_mode");
      await logoutAction();
    } catch { /* Next.js redirect — intentional */ }
    finally { setLoggingOut(false); }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .kop-shell { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
        .kop-page::-webkit-scrollbar { display: none; }
        .kop-page { -ms-overflow-style: none; scrollbar-width: none; }

        /* ── Header ── */
        .kop-header {
          background: linear-gradient(150deg, #0a1e4a 0%, #0f2d6b 40%, #1a4db3 75%, #2563eb 100%);
          padding: 52px 20px 88px;
          position: relative; overflow: hidden;
        }
        .kop-orb { position: absolute; border-radius: 50%; pointer-events: none; }

        /* ── Logout Button ── */
        .kop-logout-btn {
          position: relative; width: 42px; height: 42px; border-radius: 13px;
          background: rgba(255,255,255,.13); border: 1px solid rgba(255,255,255,.22);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background .2s, transform .15s, box-shadow .2s;
          backdrop-filter: blur(10px); flex-shrink: 0;
        }
        .kop-logout-btn:hover:not(:disabled) { background: rgba(255,255,255,.24); transform: scale(1.06); box-shadow: 0 4px 16px rgba(0,0,0,.25); }
        .kop-logout-btn:active:not(:disabled) { transform: scale(.95); }
        .kop-logout-btn:disabled { opacity: .6; cursor: not-allowed; }

        /* ── Card Base ── */
        .kop-card {
          background: #fff; border-radius: 20px; border: 1px solid #eaeef5;
          box-shadow: 0 4px 28px rgba(15,45,107,.06), 0 1px 3px rgba(0,0,0,.03);
        }

        /* ── Profile Avatar ── */
        .kop-avatar {
          width: 54px; height: 54px; border-radius: 16px; flex-shrink: 0;
          background: linear-gradient(145deg, #dbeafe, #eff6ff); border: 2px solid #bfdbfe;
          display: flex; align-items: center; justify-content: center;
          transition: transform .25s, box-shadow .25s;
        }
        .kop-avatar:hover { transform: scale(1.05); box-shadow: 0 6px 18px rgba(37,99,235,.22); }

        /* ── Toggle Switch ── */
        .kop-toggle-row {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 13px;
          padding: 11px 14px; cursor: pointer; user-select: none;
          transition: background .2s, border-color .2s;
        }
        .kop-toggle-row:hover { background: #f1f5f9; border-color: #c7d7f0; }
        .kop-switch { position: relative; width: 42px; height: 24px; flex-shrink: 0; }
        .kop-switch input { opacity: 0; width: 0; height: 0; position: absolute; }
        .kop-slider { position: absolute; inset: 0; border-radius: 24px; background: #cbd5e1; cursor: pointer; transition: background .25s; }
        .kop-slider::before {
          content: ''; position: absolute; width: 18px; height: 18px; border-radius: 50%;
          background: white; top: 3px; left: 3px; transition: transform .25s cubic-bezier(.34,1.56,.64,1);
          box-shadow: 0 1px 4px rgba(0,0,0,.22);
        }
        .kop-switch input:checked + .kop-slider { background: #2563eb; }
        .kop-switch input:checked + .kop-slider::before { transform: translateX(18px); }

        /* ── Section label ── */
        .kop-sec { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
        .kop-sec-label { font-size: 10.5px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #94a3b8; white-space: nowrap; }
        .kop-sec::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, #e2e8f0, transparent); }

        /* ── Module Grid ── */
        .kop-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }

        /* ── Module Tile ── */
        .kop-tile {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          padding: 18px 8px 14px; background: #fff; border-radius: 17px; border: 1.5px solid #eaeef5;
          text-decoration: none; transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease;
          box-shadow: 0 1px 5px rgba(15,45,107,.06); position: relative; overflow: hidden; cursor: pointer;
        }
        .kop-tile::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; opacity: 0;
          transition: opacity .22s; background: linear-gradient(90deg, #2563eb, #6366f1);
        }
        .kop-tile:hover { transform: translateY(-5px); box-shadow: 0 14px 36px rgba(15,45,107,.15); border-color: #bfdbfe; }
        .kop-tile:hover::before { opacity: 1; }
        .kop-tile:active { transform: translateY(-2px); }

        .kop-tile.is-off { opacity: .45; cursor: not-allowed; pointer-events: none; background: #fafafa; }
        .kop-tile.is-off::before { display: none; }

        .kop-tile-icon { width: 54px; height: 54px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 26px; transition: transform .22s ease; }
        .kop-tile:hover .kop-tile-icon { transform: scale(1.12) rotate(-5deg); }

        .kop-tile-label { font-size: 12px; font-weight: 700; color: #334155; text-align: center; line-height: 1.2; letter-spacing: -.01em; }
        .kop-tile-desc { font-size: 10px; font-weight: 500; color: #94a3b8; text-align: center; line-height: 1.3; letter-spacing: -.01em; }

        .kop-soon-pill {
          position: absolute; top: 8px; right: 8px; font-size: 7px; font-weight: 800; letter-spacing: .06em;
          text-transform: uppercase; background: #fef9c3; color: #92400e; border: 1px solid #fde68a;
          padding: 2px 6px; border-radius: 6px; line-height: 1.5;
        }

        /* ── Animation & Utilities ── */
        .kop-spin { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,.3); border-top-color: white; border-radius: 50%; animation: kop-spin .7s linear infinite; }
        @keyframes kop-spin { to { transform: rotate(360deg); } }
        .kop-ping-wrap { position: relative; width: 8px; height: 8px; flex-shrink: 0; }
        .kop-ping { position: absolute; inset: 0; border-radius: 50%; background: #22c55e; opacity: .4; animation: kop-ping 2s ease-out infinite; }
        .kop-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; position: relative; z-index: 1; }
        @keyframes kop-ping { 0% { transform: scale(1); opacity: .4; } 70% { transform: scale(2.4); opacity: 0; } 100% { opacity: 0; } }

        /* ── RESPONSIVE RULES ── */
        .kop-content-wrapper { padding: 0 16px 40px; margin-top: -60px; position: relative; z-index: 5; }
        
        @media (max-width: 360px) {
          .kop-tile { padding: 12px 5px 10px; }
          .kop-tile-icon { width: 42px; height: 42px; font-size: 20px; }
          .kop-tile-desc { display: none; }
          .kop-grid { gap: 7px; }
          .kop-header { padding: 44px 16px 80px; }
        }
        @media (min-width: 640px) {
          .kop-grid { grid-template-columns: repeat(4, 1fr); gap: 14px; }
        }
        @media (min-width: 768px) {
          .kop-header { padding: 52px 32px 100px; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; }
          .kop-content-wrapper { padding: 0 32px 40px; margin-top: -70px; }
        }
        @media (min-width: 1024px) {
          .kop-grid { grid-template-columns: repeat(5, 1fr); gap: 16px; }
        }
      `}} />

      {/* ══════════════════════════════════════
          LOGOUT CONFIRMATION MODAL
      ══════════════════════════════════════ */}
      {logoutModal && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(10,20,50,.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 12px 24px' }}
          role="dialog" aria-modal="true" aria-labelledby="logout-modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) setLogoutModal(false); }}
        >
          <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 24, padding: '28px 24px 20px', boxShadow: '0 30px 80px rgba(0,0,0,.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, background: '#fff1f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </div>
              <div>
                <h3 id="logout-modal-title" style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-.02em' }}>Keluar dari Sistem?</h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.5 }}>Sesi Anda akan diakhiri. Pastikan semua pekerjaan sudah tersimpan.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ flex: 1, padding: 13, borderRadius: 13, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', background: '#f1f5f9', color: '#475569' }} onClick={() => setLogoutModal(false)}>Batal</button>
              <button style={{ flex: 1, padding: 13, borderRadius: 13, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: '#fff', boxShadow: '0 4px 14px rgba(220,38,38,.35)' }} onClick={handleLogout}>Ya, Keluar</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          MAIN SHELL (RESPONSIVE GRID)
      ══════════════════════════════════════ */}
      <main className="kop-shell min-h-screen bg-slate-100 flex justify-center">
        {/* Kontainer diperlebar menjadi max-w-5xl untuk mengakomodasi layar besar proporsional */}
        <div className="kop-page w-full max-w-5xl bg-slate-100 min-h-screen relative sm:shadow-xl sm:border-x sm:border-slate-200 overflow-y-auto">

          {/* ── HEADER ── */}
          <header className="kop-header">
            <div className="kop-orb" aria-hidden="true" style={{ width: 280, height: 280, top: -110, right: -90,  background: 'radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 70%)' }} />
            <div className="kop-orb" aria-hidden="true" style={{ width: 200, height: 200, bottom: -20, left: -60,  background: 'radial-gradient(circle, rgba(96,165,250,.22) 0%, transparent 70%)' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
              <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 10, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 20, padding: '3px 10px' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2-2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,.6)' }}>KJK PT Elsewedy Electric Indonesia</span>
                </div>
                <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '-.03em', margin: '0 0 6px', lineHeight: 1 }}>Dashboard</h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', fontWeight: 500, margin: 0 }}>
                  {greeting.text}, <strong style={{ color: '#fff', fontWeight: 800 }}>{user.nama.split(' ').slice(0, 2).join(' ')}</strong> {greeting.emoji}
                </p>
              </div>

              <button onClick={() => setLogoutModal(true)} disabled={loggingOut} className="kop-logout-btn" aria-label="Keluar dari sistem" title="Logout">
                {loggingOut ? <div className="kop-spin" aria-hidden="true" /> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>}
              </button>
            </div>
          </header>

          {/* ── BODY ── */}
          <div className="kop-content-wrapper">

            {/* ── PROFILE CARD ── */}
            <div className="kop-card" style={{ padding: 20, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: isPengurus ? 16 : 0 }}>
                <div className="kop-avatar" aria-hidden="true">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a4db3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, margin: '0 0 4px' }}>Selamat datang kembali,</p>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', letterSpacing: '-.02em', lineHeight: 1.2, margin: '0 0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.nama}</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: rc.bg, border: `1px solid ${rc.border}`, color: rc.color, fontSize: 10, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 20 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: rc.dot, flexShrink: 0 }} />
                      {roleLabels[user.role]}
                    </div>
                    {isMemberMode && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac', fontSize: 10, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 20 }}>
                        ✓ Mode Anggota
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {isPengurus && (
                <>
                  <div style={{ height: 1, background: 'linear-gradient(90deg, #e2e8f0, transparent)', margin: '0 0 14px' }} />
                  <label className="kop-toggle-row" htmlFor="member-mode-toggle">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }} aria-hidden="true">{isMemberMode ? '👤' : '🛡️'}</span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: '0 0 2px', letterSpacing: '-.01em' }}>Mode Tampilan Anggota</p>
                        <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{isMemberMode ? 'Aktif — menu pengurus disembunyikan' : 'Nonaktif — semua menu tersedia'}</p>
                      </div>
                    </div>
                    <div className="kop-switch">
                      <input id="member-mode-toggle" type="checkbox" checked={isMemberMode} onChange={toggleMode} aria-label="Aktifkan mode tampilan anggota" />
                      <span className="kop-slider" />
                    </div>
                  </label>
                </>
              )}
            </div>

            {/* ── ACTIVE MODULES ── */}
            {activeModules.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div className="kop-sec"><span className="kop-sec-label">Menu Utama</span></div>
                <div className="kop-grid">
                  {activeModules.map(mod => (
                    <Link key={mod.label} href={mod.href} className="kop-tile" aria-label={`${mod.label} — ${mod.desc}`}>
                      <div className="kop-tile-icon" style={{ background: mod.bg }}>{mod.icon}</div>
                      <span className="kop-tile-label">{mod.label}</span>
                      <span className="kop-tile-desc">{mod.desc}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ── COMING SOON MODULES ── */}
            {comingSoon.length > 0 && (
              <div style={{ marginBottom: 30 }}>
                <div className="kop-sec"><span className="kop-sec-label">Segera Hadir</span></div>
                <div className="kop-grid">
                  {comingSoon.map(mod => (
                    <div key={mod.label} className="kop-tile is-off" role="button" aria-disabled="true" aria-label={`${mod.label} — belum tersedia`} tabIndex={-1}>
                      <span className="kop-soon-pill" aria-hidden="true">Segera</span>
                      <div className="kop-tile-icon" style={{ background: mod.bg }}>{mod.icon}</div>
                      <span className="kop-tile-label">{mod.label}</span>
                      <span className="kop-tile-desc">{mod.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── FOOTER ── */}
            <div style={{ borderTop: '1px solid #e8edf5', paddingTop: 24, textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 20, padding: '6px 14px' }}>
                <div className="kop-ping-wrap" aria-hidden="true"><div className="kop-ping" /><div className="kop-dot" /></div>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#94a3b8' }}>System Online · PWA v1.0 · Secured</span>
              </div>
              <p style={{ fontSize: 11, color: '#cbd5e1', fontWeight: 500, margin: 0, lineHeight: 1.7 }}>
                © {new Date().getFullYear()} Koperasi Jasa Karyawan<br />PT Elsewedy Electric Indonesia
              </p>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
