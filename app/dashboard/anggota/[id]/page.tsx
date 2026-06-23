import React from "react";
import { requireRole } from "@/lib/auth/session";
import {
  getAnggotaById,
  toggleAnggotaStatus,
  resetPasswordAnggota,
} from "@/lib/anggota/actions";
import Link from "next/link";
import { redirect } from "next/navigation";

const roleLabels: Record<string, string> = {
  ANGGOTA: "Anggota",
  SEKRETARIS: "Sekretaris",
  BENDAHARA: "Bendahara",
  KETUA: "Ketua",
  SUPERADMIN: "Super Admin",
};

const roleColors: Record<string, React.CSSProperties> = {
  ANGGOTA: { backgroundColor: "#f0fdf4", color: "#15803d", border: "1px solid #86efac" },
  SEKRETARIS: { backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #93c5fd" },
  BENDAHARA: { backgroundColor: "#fefce8", color: "#a16207", border: "1px solid #fde68a" },
  KETUA: { backgroundColor: "#fdf4ff", color: "#7e22ce", border: "1px solid #d8b4fe" },
  SUPERADMIN: { backgroundColor: "#fff1f2", color: "#be123c", border: "1px solid #fca5a5" },
};

export default async function DetailAnggotaPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { msg?: string; error?: string };
}) {
  const currentUser = await requireRole([
    "SUPERADMIN",
    "SEKRETARIS",
    "BENDAHARA",
    "KETUA",
  ]);

  const { data: anggota, error } = await getAnggotaById(params.id);

  if (error || !anggota) {
    redirect("/dashboard/anggota");
  }

  const saldo = anggota.saldo_simpanan?.[0]?.total_saldo || 0;
  
  // LOGIKA HAK AKSES
  const isSuperAdmin = currentUser.role === "SUPERADMIN";
  const canEdit = ["SUPERADMIN", "SEKRETARIS"].includes(currentUser.role);
  const canResign = ["SUPERADMIN", "SEKRETARIS", "BENDAHARA"].includes(currentUser.role);

  const wajib = Number(anggota.simpanan_wajib_bulanan || anggota.simpanan_bulanan || 0);
  const sukarela = Number(anggota.simpanan_sukarela_bulanan || 0);
  const totalPotongan = wajib + sukarela;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .kop-shell { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
        
        /* ── Header ── */
        .kop-header {
          background: linear-gradient(150deg, #0a1e4a 0%, #0f2d6b 40%, #1a4db3 75%, #2563eb 100%);
          padding: 30px 20px 100px;
          position: relative; overflow: hidden;
        }
        .kop-orb { position: absolute; border-radius: 50%; pointer-events: none; }

        /* ── Card Base ── */
        .kop-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #eaeef5;
          box-shadow: 0 4px 28px rgba(15,45,107,.08), 0 1px 3px rgba(0,0,0,.03);
          margin-bottom: 16px;
        }

        .kop-btn-nav {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255, 255, 255, 0.15); color: #fff;
          padding: 8px 14px; border-radius: 20px;
          text-decoration: none; font-size: 13px; font-weight: 600;
          backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.2);
          transition: transform 0.2s, background 0.2s;
        }
        .kop-btn-nav:hover { background: rgba(255, 255, 255, 0.25); }
        .kop-btn-nav:active { transform: scale(0.95); }
        .kop-btn-nav-light {
          background: #fff; color: #1a4db3; border: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .kop-btn-nav-light:hover { background: #f8fafc; }

        .data-row:last-child { border-bottom: none !important; }

        .kop-action-btn {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 13px; border-radius: 14px; font-size: 13px; font-weight: 700;
          cursor: pointer; transition: transform 0.15s, box-shadow 0.15s;
          font-family: inherit;
        }
        .kop-action-btn:active { transform: scale(0.97); }

        /* ── RESPONSIVE GRID ── */
        .kop-content-wrapper { padding: 0 16px 40px; margin-top: -70px; position: relative; z-index: 20; }
        .kop-grid-responsive { display: flex; flex-direction: column; gap: 16px; }
        
        /* Tablet & Desktop Layout */
        @media (min-width: 768px) {
          .kop-header { padding: 40px 32px 100px; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; }
          .kop-content-wrapper { padding: 0 32px 40px; margin-top: -70px; }
          .kop-grid-responsive { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 24px; 
            align-items: start;
          }
        }
      `}} />

      <main className="kop-shell bg-slate-100 min-h-screen">
        <div className="w-full max-w-5xl mx-auto bg-slate-100 min-h-screen relative sm:shadow-xl sm:border-x sm:border-slate-200">
          
          {/* --- Header Area --- */}
          <header className="kop-header">
            <div className="kop-orb" style={{ width: 280, height: 280, top: -100, right: -100, background: 'radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 70%)' }} />
            <div className="kop-orb" style={{ width: 200, height: 200, bottom: -40, left: -40, background: 'radial-gradient(circle, rgba(96,165,250,.2) 0%, transparent 70%)' }} />
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 10 }}>
              <Link href="/dashboard/anggota" className="kop-btn-nav">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Kembali
              </Link>

              {canEdit && (
                <Link href={`/dashboard/anggota/${params.id}/edit`} className="kop-btn-nav kop-btn-nav-light">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  <span className="hidden sm:inline">Edit Data</span>
                  <span className="inline sm:hidden">Edit</span>
                </Link>
              )}
            </div>
          </header>

          {/* --- Main Content Area --- */}
          <div className="kop-content-wrapper">
            
            {/* Notifikasi Alert */}
            {searchParams.msg && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", padding: "12px 16px", borderRadius: "14px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: "600" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                {searchParams.msg}
              </div>
            )}
            {searchParams.error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "12px 16px", borderRadius: "14px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: "600" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {searchParams.error}
              </div>
            )}

            {/* --- Profile Header Card (Full Width) --- */}
            <div className="kop-card" style={{ padding: 0, overflow: "hidden", marginBottom: "20px" }}>
              <div style={{ padding: "24px 20px", display: "flex", alignItems: "center", gap: "16px", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ 
                  width: 72, height: 72, borderRadius: 20, flexShrink: 0,
                  background: "linear-gradient(145deg, #dbeafe, #eff6ff)", color: "#1d4ed8",
                  display: "flex", alignItems: "center", justifyContent: "center", 
                  fontSize: 28, fontWeight: 800, border: "2px solid #bfdbfe"
                }}>
                  {anggota.nama?.charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h2 style={{ margin: "0 0 4px 0", fontSize: 20, color: "#0f172a", fontWeight: 800, letterSpacing: "-.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {anggota.nama}
                  </h2>
                  <p style={{ margin: 0, color: "#64748b", fontSize: 13, fontWeight: 600, letterSpacing: ".05em" }}>
                    NIK: {anggota.nik}
                  </p>
                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                    <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", ...roleColors[anggota.role] || { backgroundColor: "#f1f5f9", color: "#334155", border: "1px solid #e2e8f0" } }}>
                      {roleLabels[anggota.role] || anggota.role}
                    </span>
                    <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", backgroundColor: anggota.is_active ? "#f0fdf4" : "#fef2f2", color: anggota.is_active ? "#15803d" : "#b91c1c", border: `1px solid ${anggota.is_active ? "#86efac" : "#fecaca"}` }}>
                      {anggota.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div style={{ padding: "20px", background: "linear-gradient(to right, #f8fafc, #f1f5f9)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: "0 0 6px 0", fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>
                    Total Saldo Simpanan
                  </p>
                  <p style={{ margin: 0, fontSize: 28, color: "#059669", fontWeight: 900, letterSpacing: "-.02em" }}>
                    Rp {Number(saldo).toLocaleString("id-ID")}
                  </p>
                </div>
                <div style={{ width: 48, height: 48, background: "#d1fae5", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "#059669", flexShrink: 0 }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                    <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* ── RESPONSIVE GRID CONTENT ── */}
            <div className="kop-grid-responsive">
              
              {/* Kolom Kiri */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* --- Data Pribadi --- */}
                <div className="kop-card" style={{ padding: "20px", margin: 0 }}>
                  <SectionTitle 
                    icon={
                      <>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10 9 9 9 8 9"/>
                      </>
                    } 
                    title="Data Pribadi" 
                  />
                  <div>
                    <DataRow label="NIK" value={anggota.nik} mono />
                    <DataRow label="Nama Lengkap" value={anggota.nama} />
                    <DataRow label="Email" value={anggota.email} />
                    <DataRow label="No. HP" value={anggota.no_hp || "-"} />
                    <DataRow
                      label="Tanggal Gabung"
                      value={
                        anggota.tanggal_bergabung
                          ? new Date(anggota.tanggal_bergabung).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                          : "-"
                      }
                    />
                    <DataRow
                      label="Login Terakhir"
                      value={
                        anggota.last_login_at
                          ? new Date(anggota.last_login_at).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                          : "Belum pernah"
                      }
                    />
                  </div>
                </div>

                {/* --- Data Rekening Bank --- */}
                <div className="kop-card" style={{ padding: "20px", margin: 0 }}>
                  <SectionTitle 
                    icon={
                      <>
                        <line x1="3" y1="22" x2="21" y2="22"/>
                        <line x1="6" y1="18" x2="6" y2="11"/>
                        <line x1="10" y1="18" x2="10" y2="11"/>
                        <line x1="14" y1="18" x2="14" y2="11"/>
                        <line x1="18" y1="18" x2="18" y2="11"/>
                        <polygon points="12 2 20 7 4 7"/>
                      </>
                    } 
                    title="Data Rekening Bank" 
                  />
                  <div>
                    <DataRow label="Nama Bank" value={anggota.nama_bank || "-"} />
                    <DataRow label="No. Rekening" value={anggota.no_rekening || "-"} mono />
                  </div>
                </div>
              </div>

              {/* Kolom Kanan */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* --- Data Koperasi --- */}
                <div className="kop-card" style={{ padding: "20px", margin: 0 }}>
                  <SectionTitle 
                    icon={
                      <>
                        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                        <line x1="9" y1="22" x2="9" y2="2"/>
                        <line x1="15" y1="22" x2="15" y2="2"/>
                        <line x1="4" y1="12" x2="20" y2="12"/>
                        <line x1="4" y1="7" x2="20" y2="7"/>
                        <line x1="4" y1="17" x2="20" y2="17"/>
                      </>
                    } 
                    title="Data Koperasi" 
                  />
                  <div>
                    <DataRow
                      label="Role Akun"
                      value={roleLabels[anggota.role] || anggota.role}
                      badge
                      badgeStyle={roleColors[anggota.role] || { backgroundColor: "#f1f5f9", color: "#334155", border: "1px solid #e2e8f0" }}
                    />
                    
                    <div className="data-row" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500, flexShrink: 0 }}>Total Potongan</span>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
                          Rp {totalPotongan.toLocaleString("id-ID")} <span style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8" }}>/ bln</span>
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, fontWeight: 500, display: "flex", flexDirection: "column", gap: 2 }}>
                          <span>Wajib: <strong style={{ color: "#334155" }}>Rp {wajib.toLocaleString("id-ID")}</strong></span>
                          <span>Sukarela: <strong style={{ color: "#334155" }}>Rp {sukarela.toLocaleString("id-ID")}</strong></span>
                        </div>
                      </div>
                    </div>

                    <DataRow
                      label="Status Aktif"
                      value={anggota.is_active ? "Aktif" : "Nonaktif"}
                      badge
                      badgeStyle={{
                        backgroundColor: anggota.is_active ? "#f0fdf4" : "#fef2f2",
                        color: anggota.is_active ? "#15803d" : "#b91c1c",
                        border: `1px solid ${anggota.is_active ? "#86efac" : "#fecaca"}`
                      }}
                    />
                  </div>
                </div>

                {/* --- Action Buttons --- */}
                {(isSuperAdmin || canResign) && (
                  <div className="kop-card" style={{ padding: "20px", margin: 0 }}>
                    <SectionTitle 
                      icon={
                        <>
                          <circle cx="12" cy="12" r="3"/>
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                        </>
                      } 
                      title="Aksi & Pengaturan" 
                    />
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      
                      {/* TOMBOL CLEARANCE (RESIGN) */}
                      {canResign && (
                        <Link 
                          href={`/dashboard/anggota/resign?id=${params.id}`} 
                          className="kop-action-btn" 
                          style={{
                            background: "linear-gradient(135deg, #be123c, #9f1239)", 
                            color: "#fff", 
                            border: "none", 
                            textDecoration: "none",
                            boxShadow: "0 4px 12px rgba(190,18,60,.2)"
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="8.5" cy="7" r="4"/>
                            <line x1="23" y1="11" x2="17" y2="11"/>
                          </svg>
                          Proses Tutup Keanggotaan (Resign)
                        </Link>
                      )}

                      {/* KHUSUS SUPERADMIN: Reset Password & Toggle Status */}
                      {isSuperAdmin && (
                        <>
                          <form action={async () => {
                            "use server";
                            const result = await resetPasswordAnggota(params.id);
                            if (result.success) {
                              redirect(`/dashboard/anggota/${params.id}?msg=${encodeURIComponent(result.message ?? "Berhasil")}`);
                            } else {
                              redirect(`/dashboard/anggota/${params.id}?error=${encodeURIComponent(result.error || "Gagal reset password")}`);
                            }
                          }}>
                            <button type="submit" className="kop-action-btn" style={{ background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a" }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                              Reset Password
                            </button>
                          </form>

                          <form action={async () => {
                            "use server";
                            const result = await toggleAnggotaStatus(params.id, !anggota.is_active);
                            if (result.success) {
                              redirect(`/dashboard/anggota/${params.id}?msg=${encodeURIComponent(result.message ?? "Berhasil")}`);
                            } else {
                              redirect(`/dashboard/anggota/${params.id}?error=${encodeURIComponent(result.error || "Gagal update status")}`);
                            }
                          }}>
                            <button type="submit" className="kop-action-btn" style={{
                              background: anggota.is_active ? "#fef2f2" : "#f0fdf4",
                              color: anggota.is_active ? "#b91c1c" : "#15803d",
                              border: `1px solid ${anggota.is_active ? "#fecaca" : "#bbf7d0"}`
                            }}>
                              {anggota.is_active ? (
                                <>
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19.69 14a6.9 6.9 0 0 0 .31-2V5l-8-3-3.16 1.18"/><path d="M4.73 4.73L4 5v7c0 6 8 10 8 10a20.29 20.29 0 0 0 5.62-4.38"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                  Nonaktifkan Akun
                                </>
                              ) : (
                                <>
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                  Aktifkan Akun
                                </>
                              )}
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}

// Helper components
function SectionTitle({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <h3 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 8, letterSpacing: "-.01em" }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
      </div>
      {title}
    </h3>
  );
}

function DataRow({
  label,
  value,
  mono = false,
  badge = false,
  badgeStyle = {},
}: {
  label: string;
  value: string;
  mono?: boolean;
  badge?: boolean;
  badgeStyle?: React.CSSProperties;
}) {
  return (
    <div className="data-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500, flexShrink: 0, width: "120px" }}>{label}</span>
      {badge ? (
        <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", ...badgeStyle }}>
          {value}
        </span>
      ) : (
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", textAlign: "right", fontFamily: mono ? "monospace" : "inherit", letterSpacing: mono ? ".05em" : "normal", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value}
        </span>
      )}
    </div>
  );
}
