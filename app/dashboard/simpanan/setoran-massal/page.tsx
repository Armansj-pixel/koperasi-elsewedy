import React from "react";
import { requireRole } from "@/lib/auth/session";
import { SetoranMassalForm } from "./SetoranMassalForm";
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

  /* ── RESPONSIVE RULES ── */
  .kop-content-wrapper { padding: 0 16px 40px; margin-top: -70px; position: relative; z-index: 20; }
  
  @media (min-width: 768px) {
    .kop-header { padding: 40px 32px 100px; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; }
    .kop-content-wrapper { padding: 0 32px 40px; margin-top: -70px; }
  }
`;

export default async function SetoranMassalPage() {
  await requireRole(["SUPERADMIN", "BENDAHARA"]);

  // 1. Dapatkan Waktu Saat Ini (Zona Waktu Jakarta)
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const currentDate = now.getDate();

  // 2. Kunci Eksekusi Hanya di Tanggal 25
  const isAllowedDate = currentDate === 25;

  return (
    <main className="kop-shell bg-slate-100 min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div className="w-full max-w-5xl mx-auto bg-slate-100 min-h-screen relative sm:shadow-xl sm:border-x sm:border-slate-200">
        
        {/* --- Header Area --- */}
        <header className="kop-header">
          <div className="kop-orb" style={{ width: 280, height: 280, top: -100, right: -100, background: 'radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 70%)' }} />
          <div className="kop-orb" style={{ width: 200, height: 200, bottom: -40, left: -40, background: 'radial-gradient(circle, rgba(96,165,250,.2) 0%, transparent 70%)' }} />
          
          <div style={{ position: "relative", zIndex: 10, maxWidth: "800px", margin: "0 auto" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <Link href="/dashboard/simpanan" className="kop-btn-nav">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Kembali ke Simpanan
              </Link>
            </div>
            
            <h1 style={{ 
              color: "#fff", margin: "0 0 8px 0", fontSize: "24px", fontWeight: "800",
              letterSpacing: "-.02em", display: "flex", alignItems: "center", gap: "10px"
            }}>
              <div style={{ background: "rgba(255,255,255,0.2)", padding: "8px", borderRadius: "12px", display: "flex" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              Setoran Bulanan Massal
            </h1>
          </div>
        </header>

        {/* --- Main Content Area --- */}
        <div className="kop-content-wrapper">
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div className="kop-card" style={{ padding: "24px" }}>
              
              {/* Alert Peringatan Jika BUKAN Tanggal 25 */}
              {!isAllowedDate && (
                <div style={{ 
                  background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: "14px", 
                  padding: "16px", marginBottom: "24px", display: "flex", alignItems: "flex-start", gap: "12px",
                  boxShadow: "0 4px 12px rgba(185,28,28,0.05)"
                }}>
                  <div style={{ color: "#dc2626", marginTop: "2px", flexShrink: 0 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#991b1b", fontWeight: "800" }}>Sistem Terkunci (Bukan Tanggal 25)</h4>
                    <p style={{ margin: 0, fontSize: "13px", color: "#b91c1c", lineHeight: "1.5", fontWeight: "500" }}>
                      Untuk mencegah terjadinya data ganda atau kesalahan rekonsiliasi, tombol eksekusi pemotongan massal <strong>hanya aktif pada tanggal 25</strong> (hari <em>payroll</em>) setiap bulannya.
                    </p>
                  </div>
                </div>
              )}

              {/* Alert Info Box (Aktif saat tanggal 25) */}
              {isAllowedDate && (
                <div style={{ 
                  background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "14px", 
                  padding: "16px", marginBottom: "24px", display: "flex", alignItems: "flex-start", gap: "12px"
                }}>
                  <div style={{ color: "#1d4ed8", marginTop: "2px", flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  </div>
                  <p style={{ margin: 0, fontSize: "13px", color: "#1e40af", lineHeight: "1.6", fontWeight: "500" }}>
                    <strong style={{ fontWeight: "800" }}>Info Payroll:</strong> Fitur ini akan otomatis memotong <strong>Simpanan Wajib</strong> dan <strong>Simpanan Sukarela</strong> bulanan untuk semua anggota aktif sekaligus sesuai nominal di profil masing-masing. Anggota yang sudah diproses pada periode ini akan <strong>dilewati otomatis</strong> untuk mencegah data ganda.
                  </p>
                </div>
              )}

              {/* Form Component (Mengirim prop isAllowedDate) */}
              <SetoranMassalForm
                defaultBulan={currentMonth}
                defaultTahun={currentYear}
                isAllowedDate={isAllowedDate} // <--- Prop baru untuk mendisable form
              />

            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
