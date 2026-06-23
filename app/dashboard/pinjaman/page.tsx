import React from "react";
import { requireRole } from "@/lib/auth/session";
import { getPinjamanList, getStatistikPinjaman } from "@/lib/pinjaman/actions";
import Link from "next/link";
import { MemberModeSync } from "../simpanan/MemberModeSync"; 

const STATUS_LABEL: Record<string, { label: string; bg: string; color: string; border: string }> = {
  PENDING_L1: { label: "Menunggu Sekretaris", bg: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" },
  PENDING_L2: { label: "Menunggu Bendahara", bg: "#ffedd5", color: "#c2410c", border: "1px solid #fdba74" },
  PENDING_L3: { label: "Menunggu Ketua", bg: "#eff6ff", color: "#1d4ed8", border: "1px solid #93c5fd" },
  APPROVED: { label: "Disetujui", bg: "#f0fdf4", color: "#15803d", border: "1px solid #86efac" },
  ACTIVE: { label: "Aktif", bg: "#ccfbf1", color: "#0f766e", border: "1px solid #5eead4" },
  LUNAS: { label: "Lunas", bg: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0" },
  REJECTED: { label: "Ditolak", bg: "#fef2f2", color: "#b91c1c", border: "1px solid #fca5a5" },
  CANCELLED: { label: "Dibatalkan", bg: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0" },
  DISBURSED: { label: "Dicairkan", bg: "#f3e8ff", color: "#7e22ce", border: "1px solid #d8b4fe" },
};

function formatRupiah(n: number) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  .kop-shell { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
  .kop-header { background: linear-gradient(150deg, #0a1e4a 0%, #0f2d6b 40%, #1a4db3 75%, #2563eb 100%); padding: 30px 20px 100px; position: relative; overflow: hidden; }
  .kop-orb { position: absolute; border-radius: 50%; pointer-events: none; }
  .kop-card { background: #fff; border-radius: 20px; border: 1px solid #eaeef5; box-shadow: 0 4px 28px rgba(15,45,107,.08), 0 1px 3px rgba(0,0,0,.03); }
  .kop-btn-nav { display: inline-flex; align-items: center; gap: 6px; background: rgba(255, 255, 255, 0.15); color: #fff; padding: 8px 14px; border-radius: 20px; text-decoration: none; font-size: 13px; font-weight: 600; backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.2); transition: transform 0.2s, background 0.2s; }
  .kop-btn-nav:hover { background: rgba(255, 255, 255, 0.25); }
  .kop-btn-header { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #1a4db3; padding: 10px 16px; border-radius: 14px; text-decoration: none; font-size: 13px; font-weight: 700; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: all 0.2s ease; border: none; }
  .kop-btn-header:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.15); }
  .kop-filter-row { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 16px; scrollbar-width: none; }
  .kop-filter-row::-webkit-scrollbar { display: none; }
  .kop-filter-chip { display: inline-flex; align-items: center; padding: 10px 16px; border-radius: 14px; font-size: 13px; font-weight: 700; text-decoration: none; white-space: nowrap; transition: all 0.2s ease; }
  .kop-pinjaman-card { background: #fff; border-radius: 16px; border: 1.5px solid #f1f5f9; box-shadow: 0 4px 12px rgba(15,45,107,.04); padding: 20px; text-decoration: none; display: block; transition: all 0.2s ease; }
  .kop-pinjaman-card:hover { border-color: #cbd5e1; box-shadow: 0 8px 24px rgba(15,45,107,.08); transform: translateY(-2px); }
  .kop-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .kop-content-wrapper { padding: 0 16px 40px; margin-top: -70px; position: relative; z-index: 20; }
  @media (max-width: 768px) { .kop-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; } }
  @media (min-width: 768px) { .kop-header { padding: 40px 32px 100px; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; } .kop-content-wrapper { padding: 0 32px 40px; margin-top: -70px; } }
`;

export default async function PinjamanPage({
  searchParams,
}: {
  searchParams: { status?: string; success?: string; error?: string; view?: string };
}) {
  const currentUser = await requireRole(["ANGGOTA", "SUPERADMIN", "SEKRETARIS", "BENDAHARA", "KETUA"]);
  const filterStatus = searchParams.status || "";
  const viewParam = searchParams.view;

  const roleIsPengurus = ["SUPERADMIN", "SEKRETARIS", "BENDAHARA", "KETUA"].includes(currentUser.role);
  const isBendahara = currentUser.role === "BENDAHARA";
  
  // Jika role pengurus TAPI tidak ada parameter view=personal, maka tampilkan halaman Admin
  const isPengurusView = roleIsPengurus && viewParam !== "personal";

  const { data: pinjamanList } = await getPinjamanList({
    ...(filterStatus ? { status: filterStatus as any } : {}),
    ...(!isPengurusView ? { userId: currentUser.id } : {}), 
  });
  
  const stats = isPengurusView ? await getStatistikPinjaman() : null;

  const filters = [
    { label: "Semua", value: "" },
    { label: "Pending", value: "PENDING_L1" },
    { label: "Aktif", value: "ACTIVE" },
    { label: "Disetujui", value: "APPROVED" },
    { label: "Lunas", value: "LUNAS" },
    { label: "Ditolak", value: "REJECTED" },
  ];

  const getFilterUrl = (statusValue: string) => {
    const params = new URLSearchParams();
    if (statusValue) params.set("status", statusValue);
    if (!isPengurusView) params.set("view", "personal");
    return `/dashboard/pinjaman${params.toString() ? `?${params.toString()}` : ""}`;
  };

  return (
    <main className="kop-shell bg-slate-100 min-h-screen">
      <MemberModeSync currentView={viewParam} isPengurus={roleIsPengurus} />
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div className="w-full max-w-5xl mx-auto bg-slate-100 min-h-screen relative sm:shadow-xl sm:border-x sm:border-slate-200">
        <header className="kop-header">
          <div className="kop-orb" style={{ width: 280, height: 280, top: -100, right: -100, background: 'radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 70%)' }} />
          <div className="kop-orb" style={{ width: 200, height: 200, bottom: -40, left: -40, background: 'radial-gradient(circle, rgba(96,165,250,.2) 0%, transparent 70%)' }} />
          
          <div style={{ position: "relative", zIndex: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <Link href="/dashboard" className="kop-btn-nav" style={{ marginBottom: "20px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                  Dashboard
                </Link>

                <h1 style={{ color: "#fff", margin: 0, fontSize: "26px", fontWeight: "800", letterSpacing: "-.02em", display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ background: "rgba(255,255,255,0.2)", padding: "8px", borderRadius: "12px", display: "flex" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                  </div>
                  {isPengurusView ? "Modul Pinjaman" : "Pinjaman Saya"}
                </h1>
              </div>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {!isPengurusView && (
                  <Link href="/dashboard/pinjaman/ajukan?view=personal" className="kop-btn-header" style={{ color: "#b45309" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Ajukan Pinjaman
                  </Link>
                )}
                
                {isPengurusView && isBendahara && (
                  <div style={{ display: "flex", gap: "12px" }}>
                    <Link href="/dashboard/pinjaman/sinkronisasi" className="kop-btn-header" style={{ color: "#16a34a" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                      Sync Pinjaman Massal
                    </Link>
                    <Link href="/dashboard/pinjaman/existing" className="kop-btn-header" style={{ color: "#475569" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                      Input Pinjaman Lama
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="kop-content-wrapper">
          {searchParams.success && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", padding: "14px 16px", borderRadius: "14px", marginBottom: "20px", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>{searchParams.success}</span>
            </div>
          )}
          {searchParams.error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "14px 16px", borderRadius: "14px", marginBottom: "20px", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{searchParams.error}</span>
            </div>
          )}

          {isPengurusView && stats && (
            <div className="kop-stats-grid">
              <div className="kop-card" style={{ padding: "20px", textAlign: "center", margin: 0 }}>
                <div style={{ fontSize: "28px", fontWeight: "900", color: "#1d4ed8" }}>{stats.total}</div>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Pengajuan</div>
              </div>
              <div className="kop-card" style={{ padding: "20px", textAlign: "center", margin: 0 }}>
                <div style={{ fontSize: "28px", fontWeight: "900", color: "#0f766e" }}>{stats.aktif}</div>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status Aktif</div>
              </div>
              <div className="kop-card" style={{ padding: "20px", textAlign: "center", margin: 0 }}>
                <div style={{ fontSize: "28px", fontWeight: "900", color: "#b45309" }}>{stats.pending}</div>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pending Verifikasi</div>
              </div>
              <div className="kop-card" style={{ padding: "20px", textAlign: "center", margin: 0 }}>
                <div style={{ fontSize: "18px", fontWeight: "900", color: "#1d4ed8", marginTop: "8px" }}>{formatRupiah(stats.totalOutstanding ?? 0)}</div>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "8px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>Sisa Outstanding</div>
              </div>
            </div>
          )}

          <div className="kop-filter-row">
            {filters.map((f) => {
              const active = filterStatus === f.value;
              return (
                <Link key={f.label} href={getFilterUrl(f.value)} className="kop-filter-chip" style={{ background: active ? "#2563eb" : "#fff", color: active ? "#fff" : "#475569", border: active ? "1.5px solid #2563eb" : "1.5px solid #e2e8f0", boxShadow: active ? "0 4px 12px rgba(37,99,235,0.2)" : "none" }}>{f.label}</Link>
              );
            })}
          </div>

          {pinjamanList.length === 0 ? (
            <div className="kop-card" style={{ textAlign: "center", padding: "64px 20px" }}>
              <svg style={{ margin: "0 auto 16px auto", display: "block", color: "#cbd5e1" }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              <div style={{ color: "#475569", fontWeight: 700, fontSize: "16px" }}>Belum ada data pinjaman</div>
              <div style={{ color: "#94a3b8", fontSize: "13px", marginTop: "4px" }}>Pengajuan pinjaman yang dibuat akan muncul di sini.</div>
              {!isPengurusView && (
                <Link href="/dashboard/pinjaman/ajukan?view=personal" style={{ background: "#f1f5f9", color: "#1d4ed8", padding: "10px 20px", borderRadius: "12px", fontSize: "13px", fontWeight: "700", marginTop: "20px", display: "inline-block", textDecoration: "none" }}>Ajukan pinjaman sekarang →</Link>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {pinjamanList.map((p: any) => {
                const statusInfo = STATUS_LABEL[p.status] ?? { label: p.status, bg: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" };
                return (
                  <Link key={p.id} href={`/dashboard/pinjaman/${p.id}${!isPengurusView ? '?view=personal' : ''}`} className="kop-pinjaman-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div>
                        {isPengurusView && (
                          <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            {p.user_nama} <span style={{ color: "#cbd5e1" }}>|</span> NIK: {p.user_nik}
                          </div>
                        )}
                        <div style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a", letterSpacing: "-.02em" }}>{formatRupiah(p.nominal)}</div>
                      </div>
                      <span style={{ background: statusInfo.bg, color: statusInfo.color, border: statusInfo.border, padding: "6px 12px", borderRadius: "20px", fontSize: "10px", fontWeight: "800", textTransform: "uppercase", letterSpacing: ".05em", whiteSpace: "nowrap" }}>{statusInfo.label}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", color: "#64748b", fontWeight: 600 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        {p.tenor_bulan} Bulan <span style={{ color: "#cbd5e1" }}>|</span> {formatRupiah(p.cicilan_per_bulan)}/bln
                      </div>
                      <span>{new Date(p.tanggal_pengajuan).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
