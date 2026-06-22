import React from "react";
import { requireRole } from "@/lib/auth/session";
import {
  getListPenarikan,
  updateStatusPenarikan,
} from "@/lib/simpanan/actions";
import Link from "next/link";
import { redirect } from "next/navigation";

// Styling terpisah untuk Status Badge
const statusStyle: Record<string, React.CSSProperties> = {
  PENDING: { backgroundColor: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" },
  APPROVED: { backgroundColor: "#f0fdf4", color: "#15803d", border: "1px solid #86efac" },
  REJECTED: { backgroundColor: "#fef2f2", color: "#b91c1c", border: "1px solid #fca5a5" },
  DISBURSED: { backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #93c5fd" },
};

const statusLabel: Record<string, string> = {
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  DISBURSED: "Dicairkan",
};

// CSS diekstrak ke variabel string agar tidak membuat compiler Vercel SWC error
const pageStyles = `
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
    overflow: hidden;
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

  /* Stats Grid */
  .kop-stats-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;
  }

  /* Filter Buttons */
  .kop-filter-btn {
    padding: 10px 16px; border-radius: 12px; font-size: 13px; font-weight: 700;
    text-decoration: none; transition: all 0.2s ease; display: flex; align-items: center; gap: 6px;
  }
  .kop-filter-btn:active { transform: scale(0.97); }

  /* Action Buttons */
  .kop-btn-approve {
    flex: 1; padding: 14px; border-radius: 14px; font-size: 13px; font-weight: 700;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    background: linear-gradient(135deg, #16a34a, #15803d); color: #fff; border: none;
    cursor: pointer; transition: all 0.15s; box-shadow: 0 4px 12px rgba(22,163,74,.2); font-family: inherit;
  }
  .kop-btn-approve:hover { box-shadow: 0 6px 16px rgba(22,163,74,.3); transform: translateY(-2px); }
  .kop-btn-approve:active { transform: scale(0.97); }

  .kop-btn-reject {
    flex: 1; padding: 14px; border-radius: 14px; font-size: 13px; font-weight: 700;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    background: #fef2f2; color: #dc2626; border: 1.5px solid #fecaca;
    cursor: pointer; transition: all 0.15s; font-family: inherit;
  }
  .kop-btn-reject:hover { background: #fee2e2; border-color: #f87171; transform: translateY(-2px); }
  .kop-btn-reject:active { transform: scale(0.97); }

  /* ── RESPONSIVE RULES ── */
  .kop-content-wrapper { padding: 0 16px 40px; margin-top: -70px; position: relative; z-index: 20; }
  
  @media (max-width: 640px) {
    .kop-stats-grid { grid-template-columns: 1fr; gap: 12px; }
  }

  @media (min-width: 768px) {
    .kop-header { padding: 40px 32px 100px; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; }
    .kop-content-wrapper { padding: 0 32px 40px; margin-top: -70px; }
  }
`;

export default async function PenarikanPage({
  searchParams,
}: {
  searchParams: { filter?: string; msg?: string; error?: string };
}) {
  await requireRole(["SUPERADMIN", "BENDAHARA", "KETUA"]);

  const filter = searchParams.filter || "";
  const { data: penarikanList } = await getListPenarikan(
    filter || undefined
  );

  const totalPending = penarikanList.filter((p: any) => p.status === "PENDING").length;
  const totalApproved = penarikanList.filter((p: any) => p.status === "APPROVED").length;
  const totalRejected = penarikanList.filter((p: any) => p.status === "REJECTED").length;

  return (
    <main className="kop-shell bg-slate-100 min-h-screen">
      {/* CSS di-inject melalui variabel */}
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div className="w-full max-w-5xl mx-auto bg-slate-100 min-h-screen relative sm:shadow-xl sm:border-x sm:border-slate-200">
        
        {/* --- Header Area --- */}
        <header className="kop-header">
          <div className="kop-orb" style={{ width: 280, height: 280, top: -100, right: -100, background: 'radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 70%)' }} />
          <div className="kop-orb" style={{ width: 200, height: 200, bottom: -40, left: -40, background: 'radial-gradient(circle, rgba(96,165,250,.2) 0%, transparent 70%)' }} />
          
          <div style={{ position: "relative", zIndex: 10 }}>
            {/* Navigasi Atas */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Link href="/dashboard/simpanan" className="kop-btn-nav">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Kembali ke Simpanan
              </Link>
            </div>

            {/* Judul Halaman */}
            <h1 style={{ 
              color: "#fff", margin: "24px 0 0 0", fontSize: "24px", fontWeight: "800",
              letterSpacing: "-.02em", display: "flex", alignItems: "center", gap: "10px"
            }}>
              <div style={{ background: "rgba(255,255,255,0.2)", padding: "8px", borderRadius: "12px", display: "flex" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              Persetujuan Penarikan
            </h1>
          </div>
        </header>

        {/* --- Main Content Area --- */}
        <div className="kop-content-wrapper">
          
          {/* Notifikasi Alert */}
          {searchParams.msg && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", padding: "14px 16px", borderRadius: "14px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: "700" }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>{searchParams.msg}</span>
            </div>
          )}
          {searchParams.error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "14px 16px", borderRadius: "14px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: "700" }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>{searchParams.error}</span>
            </div>
          )}

          {/* Stats Grid */}
          <div className="kop-stats-grid">
            <div className="kop-card" style={{ padding: "20px", margin: 0, textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: "900", color: "#d97706", lineHeight: 1 }}>
                {totalPending}
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "8px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Menunggu
              </div>
            </div>
            <div className="kop-card" style={{ padding: "20px", margin: 0, textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: "900", color: "#059669", lineHeight: 1 }}>
                {totalApproved}
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "8px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Disetujui
              </div>
            </div>
            <div className="kop-card" style={{ padding: "20px", margin: 0, textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: "900", color: "#dc2626", lineHeight: 1 }}>
                {totalRejected}
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "8px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Ditolak
              </div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
            {[
              { 
                label: "Semua", value: "", 
                icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              },
              { 
                label: "Menunggu", value: "PENDING", 
                icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> 
              },
              { 
                label: "Disetujui", value: "APPROVED", 
                icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              },
              { 
                label: "Ditolak", value: "REJECTED", 
                icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              },
            ].map((f) => {
              const isActive = filter === f.value;
              return (
                <Link
                  key={f.label}
                  href={`/dashboard/simpanan/penarikan${f.value ? `?filter=${f.value}` : ""}`}
                  className="kop-filter-btn"
                  style={{
                    background: isActive ? "#2563eb" : "#fff",
                    color: isActive ? "#fff" : "#475569",
                    border: `1.5px solid ${isActive ? "#2563eb" : "#e2e8f0"}`,
                    boxShadow: isActive ? "0 4px 12px rgba(37,99,235,0.2)" : "none"
                  }}
                >
                  {f.icon}
                  {f.label}
                </Link>
              )
            })}
          </div>

          {/* List Penarikan */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {penarikanList.length === 0 ? (
              <div className="kop-card" style={{ padding: "48px 20px", textAlign: "center", color: "#94a3b8" }}>
                <svg style={{ margin: "0 auto 12px auto", display: "block", color: "#cbd5e1" }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 4v4"/><path d="M14 4v4"/><path d="M6 4v4"/><path d="M18 4v4"/>
                </svg>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>
                  Tidak ada pengajuan penarikan
                </div>
              </div>
            ) : (
              penarikanList.map((item: any) => {
                const user = item.users;
                return (
                  <div key={item.id} className="kop-card" style={{ padding: "20px", margin: 0 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                      
                      {/* Info Anggota */}
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div style={{ width: 48, height: 48, borderRadius: 16, background: "linear-gradient(145deg, #dbeafe, #eff6ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#1d4ed8", flexShrink: 0, border: "2px solid #bfdbfe" }}>
                          {user?.nama?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 16, letterSpacing: "-.01em" }}>
                            {user?.nama}
                          </div>
                          <div style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace", margin: "2px 0", fontWeight: 600, letterSpacing: ".05em" }}>
                            NIK: {user?.nik}
                          </div>
                          {user?.nama_bank && user?.no_rekening && (
                            <div style={{ fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4, fontWeight: 600, marginTop: 4 }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>
                              {user.nama_bank} - {user.no_rekening}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Nominal + Status */}
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", letterSpacing: "-.02em" }}>
                          Rp {Number(item.nominal).toLocaleString("id-ID")}
                        </div>
                        <span
                          style={{
                            display: "inline-block", marginTop: 6, padding: "4px 10px",
                            borderRadius: 20, fontSize: 10, fontWeight: 800,
                            textTransform: "uppercase", letterSpacing: ".05em",
                            ...statusStyle[item.status]
                          }}
                        >
                          {statusLabel[item.status]}
                        </span>
                      </div>
                    </div>

                    {/* Detail Ekstra */}
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f1f5f9", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12, color: "#64748b" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        Diajukan: {new Date(item.tanggal_pengajuan).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                      {item.catatan && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          Ket: {item.catatan}
                        </div>
                      )}
                      {item.rejected_reason && (
                        <div style={{ color: "#ef4444", gridColumn: "span 2", display: "flex", alignItems: "center", gap: 6, marginTop: 4, fontWeight: 600, background: "#fef2f2", padding: "8px 12px", borderRadius: 8 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                          Alasan ditolak: {item.rejected_reason}
                        </div>
                      )}
                      {item.approved_at && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                          Diproses: {new Date(item.approved_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons - hanya untuk PENDING */}
                    {item.status === "PENDING" && (
                      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
                        
                        {/* Approve */}
                        <form style={{ flex: 1 }} action={async () => {
                          "use server";
                          const result = await updateStatusPenarikan(item.id, "APPROVED");
                          if (result.success) {
                            redirect(`/dashboard/simpanan/penarikan?msg=${encodeURIComponent(result.message ?? "Berhasil")}`);
                          } else {
                            redirect(`/dashboard/simpanan/penarikan?error=${encodeURIComponent(result.error ?? "Gagal")}`);
                          }
                        }}>
                          <button type="submit" className="kop-btn-approve">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            Setujui Penarikan
                          </button>
                        </form>

                        {/* Reject */}
                        <form style={{ flex: 1 }} action={async () => {
                          "use server";
                          const result = await updateStatusPenarikan(item.id, "REJECTED", "Ditolak oleh Bendahara/Pengurus");
                          if (result.success) {
                            redirect(`/dashboard/simpanan/penarikan?msg=${encodeURIComponent(result.message ?? "Berhasil")}`);
                          } else {
                            redirect(`/dashboard/simpanan/penarikan?error=${encodeURIComponent(result.error ?? "Gagal")}`);
                          }
                        }}>
                          <button type="submit" className="kop-btn-reject">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            Tolak
                          </button>
                        </form>
                        
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
