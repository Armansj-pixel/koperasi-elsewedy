import React from "react";
import { requireRole } from "@/lib/auth/session";
import { getListPenarikan } from "@/lib/simpanan/actions";
import Link from "next/link";

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
    cursor: pointer;
  }
  .kop-btn-nav-light:hover { background: #f8fafc; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.15); }

  /* ── Table Styles ── */
  .kop-table-wrap { overflow-x: auto; }
  .kop-table { width: 100%; border-collapse: collapse; text-align: left; }
  .kop-table th { 
    padding: 16px 20px; font-size: 13px; font-weight: 800; color: #64748b; 
    border-bottom: 2px solid #e2e8f0; background: #f8fafc; white-space: nowrap; 
    letter-spacing: .02em; text-transform: uppercase;
  }
  .kop-table td { padding: 16px 20px; font-size: 14px; color: #1e293b; border-bottom: 1px solid #f1f5f9; font-weight: 500; }
  .kop-table tbody tr:hover { background-color: #f8fafc; }

  /* ── RESPONSIVE RULES ── */
  .kop-content-wrapper { padding: 0 16px 40px; margin-top: -70px; position: relative; z-index: 20; }
  
  @media (min-width: 768px) {
    .kop-header { padding: 40px 32px 100px; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; }
    .kop-content-wrapper { padding: 0 32px 40px; margin-top: -70px; }
  }

  /* ── PRINT MEDIA QUERY ── */
  @media print {
    body { background: #fff !important; }
    .no-print { display: none !important; }
    .kop-shell, .w-full { background: #fff !important; box-shadow: none !important; border: none !important; }
    .kop-header { background: #fff !important; color: #000 !important; padding: 0 !important; height: auto !important; margin-bottom: 20px; border-radius: 0 !important; }
    .kop-header h1 { color: #000 !important; }
    .kop-orb, .kop-btn-nav, .kop-btn-nav-light { display: none !important; }
    .kop-content-wrapper { margin-top: 0 !important; padding: 0 !important; }
    .kop-card { box-shadow: none !important; border: 1px solid #000 !important; border-radius: 0 !important; margin-bottom: 20px !important; }
    .kop-table th, .kop-table td { color: #000 !important; border-color: #000 !important; }
    .kop-table th { background: #f1f5f9 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .print-only-title { display: block !important; font-size: 20px; font-weight: bold; margin-bottom: 10px; }
  }
`;

export default async function RekapPenarikanPage() {
  // 1. Kunci hanya untuk Pengurus
  await requireRole(["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS"]);

  // 2. Ambil HANYA data yang berstatus PENDING
  const { data: penarikanList } = await getListPenarikan("PENDING");

  // 3. Hitung total uang yang harus dicairkan
  const totalCair = penarikanList.reduce((sum: number, item: any) => {
    return sum + Number(item.nominal || 0);
  }, 0);

  // 4. Deteksi apakah saat ini SEDANG dalam masa cut-off (JUMAT 09:00 - 15:00)
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const isJumat = now.getDay() === 5; // <-- 5 adalah hari Jumat
  const currentMinute = (now.getHours() * 60) + now.getMinutes();
  const isCutOffActive = isJumat && currentMinute >= (9 * 60) && currentMinute < (15 * 60);

  return (
    <main className="kop-shell bg-slate-100 min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div className="w-full max-w-5xl mx-auto bg-slate-100 min-h-screen relative sm:shadow-xl sm:border-x sm:border-slate-200">
        
        {/* --- Header Area --- */}
        <header className="kop-header">
          <div className="kop-orb" style={{ width: 280, height: 280, top: -100, right: -100, background: 'radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 70%)' }} />
          <div className="kop-orb" style={{ width: 200, height: 200, bottom: -40, left: -40, background: 'radial-gradient(circle, rgba(96,165,250,.2) 0%, transparent 70%)' }} />
          
          <div style={{ position: "relative", zIndex: 10, maxWidth: "900px", margin: "0 auto" }}>
            
            <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <Link href="/dashboard/simpanan" className="kop-btn-nav">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Kembali ke Simpanan
              </Link>
              
              {/* Tombol Cetak Dokumen - Menggunakan trik href="javascript:..." untuk Server Component */}
              <a href="javascript:window.print()" className="kop-btn-nav kop-btn-nav-light">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Cetak PDF Laporan
              </a>
            </div>
            
            <h1 className="no-print" style={{ 
              color: "#fff", margin: "0 0 8px 0", fontSize: "28px", fontWeight: "800",
              letterSpacing: "-.02em", display: "flex", alignItems: "center", gap: "10px"
            }}>
              <div style={{ background: "rgba(255,255,255,0.2)", padding: "8px", borderRadius: "12px", display: "flex" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              </div>
              Rekapitulasi Penarikan Dana
            </h1>
            <p className="no-print" style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", margin: 0, fontWeight: "500" }}>
              Daftar pengajuan berstatus PENDING untuk diverifikasi dan dieksekusi Bendahara.
            </p>

            {/* Elemen ini hanya muncul saat dicetak ke PDF/Kertas */}
            <div className="print-only-title" style={{ display: "none" }}>
              Laporan Rekapitulasi Penarikan Koperasi
              <div style={{ fontSize: "12px", fontWeight: "normal", marginTop: "4px" }}>
                Dicetak pada: {new Date().toLocaleString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} WIB
              </div>
            </div>

          </div>
        </header>

        {/* --- Main Content Area --- */}
        <div className="kop-content-wrapper">
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            
            {/* Status Indikator Cut-Off */}
            <div className="kop-card" style={{ 
              display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px",
              padding: "24px", background: isCutOffActive ? "#fffbeb" : "#f8fafc", 
              border: `1.5px solid ${isCutOffActive ? "#fde68a" : "#e2e8f0"}` 
            }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: "800", color: isCutOffActive ? "#b45309" : "#64748b", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: "6px" }}>
                  Status Sistem Pengajuan
                </div>
                <div style={{ fontSize: "16px", fontWeight: "800", color: isCutOffActive ? "#92400e" : "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                  {isCutOffActive ? (
                    <><span style={{ display: "flex", width: 12, height: 12, borderRadius: "50%", background: "#ef4444" }}></span> Masa Cut-Off Aktif (Terkunci)</>
                  ) : (
                    <><span style={{ display: "flex", width: 12, height: 12, borderRadius: "50%", background: "#22c55e" }}></span> Sistem Terbuka (Menerima Pengajuan)</>
                  )}
                </div>
              </div>
              <div style={{ textAlign: "right", background: "#fff", padding: "12px 20px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", marginBottom: "4px", textTransform: "uppercase", letterSpacing: ".05em" }}>
                  Total Kebutuhan Dana
                </div>
                <div style={{ fontSize: "24px", fontWeight: "900", color: "#dc2626", letterSpacing: "-.02em" }}>
                  Rp {totalCair.toLocaleString("id-ID")}
                </div>
              </div>
            </div>

            {/* Tabel Data Rekap */}
            <div className="kop-card" style={{ padding: 0 }}>
              {penarikanList.length === 0 ? (
                 <div style={{ padding: "64px 20px", textAlign: "center", color: "#94a3b8" }}>
                   <div style={{ fontSize: "48px", marginBottom: "16px", filter: "grayscale(0.5)" }}>🎉</div>
                   <div style={{ fontWeight: "800", fontSize: "18px", color: "#1e293b" }}>Tidak ada antrean penarikan</div>
                   <div style={{ fontSize: "14px", marginTop: "6px", fontWeight: "500" }}>Bendahara bisa bersantai minggu ini. Semua tagihan sudah bersih!</div>
                 </div>
              ) : (
                <div className="kop-table-wrap">
                  <table className="kop-table">
                    <thead>
                      <tr>
                        <th style={{ width: "5%" }}>No</th>
                        <th style={{ width: "35%" }}>Info Anggota</th>
                        <th style={{ width: "35%" }}>Rekening Tujuan</th>
                        <th style={{ width: "25%", textAlign: "right" }}>Nominal Cair</th>
                      </tr>
                    </thead>
                    <tbody>
                      {penarikanList.map((item: any, idx: number) => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: "800", color: "#94a3b8" }}>{idx + 1}</td>
                          <td>
                            <div style={{ fontWeight: "800", color: "#0f172a", fontSize: "15px", marginBottom: "4px" }}>{item.users?.nama}</div>
                            <div style={{ fontSize: "12px", color: "#64748b", fontFamily: "monospace", fontWeight: "600", letterSpacing: ".05em" }}>NIK: {item.users?.nik}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: "800", color: "#1e293b", fontSize: "14px", marginBottom: "4px" }}>
                              {item.users?.nama_bank || "CASH / TUNAI"}
                            </div>
                            {item.users?.no_rekening ? (
                              <div style={{ fontSize: "13px", color: "#475569", fontFamily: "monospace", fontWeight: "600", letterSpacing: ".05em" }}>
                                {item.users.no_rekening}
                              </div>
                            ) : (
                              <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "500", fontStyle: "italic" }}>
                                Serahkan tunai ke anggota
                              </div>
                            )}
                          </td>
                          <td style={{ textAlign: "right", fontWeight: "900", color: "#059669", fontSize: "16px" }}>
                            Rp {Number(item.nominal).toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Info Aksi */}
            {penarikanList.length > 0 && (
              <div className="no-print" style={{ textAlign: "center", marginTop: "32px" }}>
                <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px", fontWeight: "500" }}>
                  Pastikan Anda mencetak rekap ini atau menyalin nominal di atas sebelum masuk ke portal persetujuan.
                </p>
                <Link 
                  href="/dashboard/simpanan/penarikan" 
                  style={{ 
                    display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #1d4ed8, #1e40af)", 
                    color: "#fff", padding: "16px 28px", borderRadius: "14px", fontWeight: "800", 
                    textDecoration: "none", boxShadow: "0 4px 14px rgba(29,78,216,0.25)", transition: "transform 0.15s, box-shadow 0.15s" 
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  Proses Persetujuan Sekarang &rarr;
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}
