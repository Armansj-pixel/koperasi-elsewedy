import React from "react";
import { requireRole } from "@/lib/auth/session";
import {
  getSaldoByUserId,
  getRiwayatSimpanan,
} from "@/lib/simpanan/actions";
import Link from "next/link";
import { redirect } from "next/navigation";

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
    margin-bottom: 20px;
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
  
  .kop-btn-nav-light {
    background: #fff; color: #1a4db3; border: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1); font-weight: 700;
  }
  .kop-btn-nav-light:hover { background: #f8fafc; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.15); }

  .kop-list-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid #f1f5f9;
    transition: background-color 0.2s ease;
  }
  .kop-list-row:hover { background: #f8fafc; }
  .kop-list-row:last-child { border-bottom: none; }

  .kop-btn-outline {
    flex: 1; background: #fff; border: 1.5px solid #e2e8f0; color: #475569;
    font-weight: 700; padding: 14px; border-radius: 14px; text-align: center;
    text-decoration: none; font-size: 14px; transition: all 0.2s ease;
    display: flex; justify-content: center; align-items: center; gap: 8px;
  }
  .kop-btn-outline:hover { background: #f1f5f9; color: #0f172a; border-color: #cbd5e1; }
  .kop-btn-outline:active { transform: scale(0.98); }

  .kop-btn-primary {
    flex: 1; background: linear-gradient(135deg, #1d4ed8, #1e40af);
    border: none; color: #fff; font-weight: 700; padding: 14px; border-radius: 14px;
    text-align: center; text-decoration: none; font-size: 14px; transition: all 0.2s ease;
    display: flex; justify-content: center; align-items: center; gap: 8px;
    box-shadow: 0 4px 12px rgba(29,78,216,.2);
  }
  .kop-btn-primary:hover { box-shadow: 0 6px 16px rgba(29,78,216,.3); transform: translateY(-2px); }
  .kop-btn-primary:active { transform: scale(0.98); }

  /* ── RESPONSIVE RULES ── */
  .kop-content-wrapper { padding: 0 16px 40px; margin-top: -70px; position: relative; z-index: 20; }
  .kop-grid-2 { display: grid; grid-template-columns: 1fr; gap: 0; }
  
  @media (min-width: 640px) {
    .kop-grid-2 { grid-template-columns: 1fr 1fr; }
    .kop-grid-2 > div:first-child { border-right: 1px solid #f1f5f9; border-bottom: none; }
  }

  @media (min-width: 768px) {
    .kop-header { padding: 40px 32px 100px; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; }
    .kop-content-wrapper { padding: 0 32px 40px; margin-top: -70px; }
  }
`;

// Utility helpers
const jenisLabel: Record<string, string> = {
  SETORAN: "Setoran",
  PENARIKAN: "Penarikan",
  KOREKSI: "Koreksi",
};

const getBadgeStyle = (jenis: string): React.CSSProperties => {
  if (jenis === "SETORAN") return { backgroundColor: "#dcfce7", color: "#15803d", border: "1px solid #86efac" };
  if (jenis === "PENARIKAN") return { backgroundColor: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5" };
  return { backgroundColor: "#fefce8", color: "#a16207", border: "1px solid #fde68a" }; // KOREKSI
};

const getIconBg = (jenis: string) => {
  if (jenis === "SETORAN") return "#dcfce7";
  if (jenis === "PENARIKAN") return "#fee2e2";
  return "#fef3c7";
};

const getJenisIcon = (jenis: string) => {
  if (jenis === "SETORAN") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
      </svg>
    );
  }
  if (jenis === "PENARIKAN") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
};

export default async function DetailSimpananPage({
  params,
}: {
  params: { id: string };
}) {
  const currentUser = await requireRole([
    "SUPERADMIN", "SEKRETARIS", "BENDAHARA", "KETUA", "ANGGOTA"
  ]);

  // PROTEKSI PRIVASI: Cegah Anggota mengintip ID orang lain
  if (currentUser.role === "ANGGOTA" && currentUser.id !== params.id) {
    redirect("/dashboard/simpanan?view=personal");
  }

  const { data, error } = await getSaldoByUserId(params.id);
  const { data: riwayat } = await getRiwayatSimpanan(params.id, 50);

  if (error || !data) {
    redirect("/dashboard/simpanan");
  }

  const { saldo, user } = data;
  
  // Tentukan hak akses UI tambahan
  const canInput = ["SUPERADMIN", "BENDAHARA"].includes(currentUser.role);
  const isOwner = currentUser.id === params.id;

  // Hitung total setoran & penarikan
  const totalSetoran = (riwayat || [])
    .filter((r: any) => r.jenis === "SETORAN")
    .reduce((sum: number, r: any) => sum + Number(r.nominal), 0);

  const totalPenarikan = (riwayat || [])
    .filter((r: any) => r.jenis === "PENARIKAN")
    .reduce((sum: number, r: any) => sum + Number(r.nominal), 0);

  return (
    <main className="kop-shell bg-slate-100 min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div className="w-full max-w-5xl mx-auto bg-slate-100 min-h-screen relative sm:shadow-xl sm:border-x sm:border-slate-200">
        
        {/* --- Header Area --- */}
        <header className="kop-header">
          <div className="kop-orb" style={{ width: 280, height: 280, top: -100, right: -100, background: 'radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 70%)' }} />
          <div className="kop-orb" style={{ width: 200, height: 200, bottom: -40, left: -40, background: 'radial-gradient(circle, rgba(96,165,250,.2) 0%, transparent 70%)' }} />
          
          <div style={{ position: "relative", zIndex: 10, maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              
              {/* Bagian Kiri: Navigasi */}
              <div>
                <Link 
                  href={isOwner ? "/dashboard/simpanan?view=personal" : "/dashboard/simpanan"}
                  className="kop-btn-nav"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Kembali
                </Link>
              </div>

              {/* Bagian Kanan: Tombol Aksi Utama (Hanya terlihat oleh Admin/Bendahara) */}
              {canInput && (
                <Link
                  href={`/dashboard/simpanan/input?user_id=${params.id}`}
                  className="kop-btn-nav kop-btn-nav-light"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Input Setoran Anggota
                </Link>
              )}
            </div>

            {/* Judul Halaman */}
            <h1 style={{ 
              color: "#fff", margin: "24px 0 0 0", fontSize: "24px", fontWeight: "800",
              letterSpacing: "-.02em", display: "flex", alignItems: "center", gap: "10px"
            }}>
              <div style={{ background: "rgba(255,255,255,0.2)", padding: "8px", borderRadius: "12px", display: "flex" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              {isOwner ? "Buku Simpanan Saya" : "Detail Simpanan Anggota"}
            </h1>
          </div>
        </header>

        {/* --- Main Content Area --- */}
        <div className="kop-content-wrapper">
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>

            {/* ── PROFILE & SALDO CARD ── */}
            <div className="kop-card">
              
              {/* Header Profile Info */}
              <div style={{ padding: "24px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: "linear-gradient(145deg, #dbeafe, #eff6ff)", color: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, border: "2px solid #bfdbfe", flexShrink: 0 }}>
                  {user?.nama?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ margin: "0 0 4px 0", fontSize: 18, color: "#0f172a", fontWeight: 800, letterSpacing: "-.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user?.nama}
                  </h2>
                  <p style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: 13, fontWeight: 600, letterSpacing: ".05em" }}>
                    NIK: {user?.nik}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                    <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0" }}>
                      Wajib: Rp {Number(user?.simpanan_wajib_bulanan || 0).toLocaleString("id-ID")}
                    </span>
                    <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0" }}>
                      Sukarela: Rp {Number(user?.simpanan_sukarela_bulanan || 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Saldo Utama */}
              <div style={{ padding: "24px 20px", borderBottom: "1px solid #f1f5f9", background: "linear-gradient(to right, #f8fafc, #f1f5f9)" }}>
                <p style={{ margin: "0 0 8px 0", fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg>
                  Total Saldo Keseluruhan
                </p>
                <p style={{ margin: 0, fontSize: 36, color: "#059669", fontWeight: 900, letterSpacing: "-.02em" }}>
                  Rp {Number(saldo?.total_saldo || 0).toLocaleString("id-ID")}
                </p>
                {saldo?.last_updated && (
                  <p style={{ margin: "8px 0 0 0", fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    Terakhir update: {new Date(saldo.last_updated).toLocaleString("id-ID", { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>

              {/* Stats Setoran vs Penarikan */}
              <div className="kop-grid-2" style={{ backgroundColor: "#fff" }}>
                <div style={{ padding: "20px", borderBottom: "1px solid #f1f5f9" }}>
                  <p style={{ margin: "0 0 6px 0", fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>
                    Akumulasi Setoran
                  </p>
                  <p style={{ margin: 0, fontSize: 18, color: "#16a34a", fontWeight: 800 }}>
                    Rp {totalSetoran.toLocaleString("id-ID")}
                  </p>
                  <p style={{ margin: "4px 0 0 0", fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>
                    {(riwayat || []).filter((r: any) => r.jenis === "SETORAN").length} transaksi berhasil
                  </p>
                </div>
                <div style={{ padding: "20px", borderBottom: "1px solid #f1f5f9" }}>
                  <p style={{ margin: "0 0 6px 0", fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>
                    Akumulasi Penarikan
                  </p>
                  <p style={{ margin: 0, fontSize: 18, color: "#dc2626", fontWeight: 800 }}>
                    Rp {totalPenarikan.toLocaleString("id-ID")}
                  </p>
                  <p style={{ margin: "4px 0 0 0", fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>
                    {(riwayat || []).filter((r: any) => r.jenis === "PENARIKAN").length} transaksi ditarik
                  </p>
                </div>
              </div>
            </div>

            {/* ── RIWAYAT MUTASI ── */}
            <div className="kop-card" style={{ padding: 0 }}>
              <div style={{ padding: "20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc" }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                  Riwayat Mutasi Simpanan
                </h3>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700, padding: "4px 10px", background: "#e2e8f0", borderRadius: 12 }}>
                  {(riwayat || []).length} transaksi
                </span>
              </div>

              {!riwayat || riwayat.length === 0 ? (
                <div style={{ padding: "48px 20px", textAlign: "center", color: "#94a3b8" }}>
                  <svg style={{ margin: "0 auto 12px auto", display: "block", color: "#cbd5e1" }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 4v4"/><path d="M14 4v4"/><path d="M6 4v4"/><path d="M18 4v4"/>
                  </svg>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Belum ada riwayat transaksi.</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Mutasi setoran dan penarikan akan muncul di sini.</div>
                </div>
              ) : (
                <div>
                  {riwayat.map((item: any) => (
                    <div key={item.id} className="kop-list-row">
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                        
                        {/* Icon Status */}
                        <div style={{ width: 44, height: 44, borderRadius: 16, background: getIconBg(item.jenis), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {getJenisIcon(item.jenis)}
                        </div>
                        
                        {/* Keterangan */}
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <span style={{ padding: "3px 8px", borderRadius: 16, fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em", ...getBadgeStyle(item.jenis) }}>
                              {jenisLabel[item.jenis] || item.jenis}
                            </span>
                            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, letterSpacing: ".05em" }}>
                              {item.periode}
                            </span>
                          </div>
                          <p style={{ margin: "0 0 4px 0", fontSize: 13, color: "#1e293b", fontWeight: 700, lineHeight: 1.4 }}>
                            {item.keterangan || "Tanpa Keterangan"}
                          </p>
                          <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>
                            {new Date(item.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        </div>
                      </div>

                      {/* Nominal & Status */}
                      <div style={{ textAlign: "right" }}>
                        <p style={{ 
                          margin: "0 0 4px 0", fontSize: 15, fontWeight: 800, letterSpacing: "-.02em",
                          color: item.jenis === "SETORAN" ? "#059669" : item.jenis === "PENARIKAN" ? "#dc2626" : "#d97706"
                        }}>
                          {item.jenis === "SETORAN" ? "+" : "-"}Rp {Number(item.nominal).toLocaleString("id-ID")}
                        </p>
                        <p style={{ 
                          margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase",
                          color: item.status === "APPROVED" ? "#15803d" : item.status === "PENDING" ? "#d97706" : "#b91c1c"
                        }}>
                          {item.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── TOMBOL AKSI BAWAH ── */}
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <Link href={isOwner ? "/dashboard/simpanan?view=personal" : "/dashboard/simpanan"} className="kop-btn-outline">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Kembali
              </Link>
              <Link 
                href={isOwner ? "/dashboard/profil" : `/dashboard/anggota/${params.id}`} 
                className="kop-btn-primary"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                {isOwner ? "Buka Profil Saya" : "Buka Profil Anggota"}
              </Link>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
