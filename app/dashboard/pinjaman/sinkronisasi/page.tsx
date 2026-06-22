import React from "react";
import { requireRole } from "@/lib/auth/session";
import { SyncPinjamanForm } from "./SyncPinjamanForm";
import Link from "next/link";

// ── CSS STYLES ──
const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  .kop-shell { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
  .kop-header { background: linear-gradient(150deg, #0a1e4a 0%, #0f2d6b 40%, #1a4db3 75%, #2563eb 100%); padding: 30px 20px 100px; position: relative; overflow: hidden; }
  .kop-orb { position: absolute; border-radius: 50%; pointer-events: none; }
  .kop-card { background: #fff; border-radius: 20px; border: 1px solid #eaeef5; box-shadow: 0 4px 28px rgba(15,45,107,.08), 0 1px 3px rgba(0,0,0,.03); margin-bottom: 20px; overflow: hidden; }
  .kop-btn-nav { display: inline-flex; align-items: center; gap: 6px; background: rgba(255, 255, 255, 0.15); color: #fff; padding: 8px 14px; border-radius: 20px; text-decoration: none; font-size: 13px; font-weight: 600; backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.2); transition: transform 0.2s, background 0.2s; }
  .kop-btn-nav:hover { background: rgba(255, 255, 255, 0.25); }
  .kop-content-wrapper { padding: 0 16px 40px; margin-top: -70px; position: relative; z-index: 20; }
  @media (min-width: 768px) { .kop-header { padding: 40px 32px 100px; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; } .kop-content-wrapper { padding: 0 32px 40px; margin-top: -70px; } }
`;

export default async function SinkronisasiPinjamanPage() {
  await requireRole(["SUPERADMIN", "BENDAHARA"]);

  // Setelan Waktu
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const currentDate = now.getDate();

  // Kunci eksekusi massal hanya pada tanggal 25
  const isAllowedDate = currentDate === 25;

  return (
    <main className="kop-shell bg-slate-100 min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div className="w-full max-w-5xl mx-auto bg-slate-100 min-h-screen relative sm:shadow-xl sm:border-x sm:border-slate-200">
        <header className="kop-header">
          <div className="kop-orb" style={{ width: 280, height: 280, top: -100, right: -100, background: 'radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 70%)' }} />
          <div className="kop-orb" style={{ width: 200, height: 200, bottom: -40, left: -40, background: 'radial-gradient(circle, rgba(96,165,250,.2) 0%, transparent 70%)' }} />
          
          <div style={{ position: "relative", zIndex: 10, maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <Link href="/dashboard/pinjaman" className="kop-btn-nav">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Kembali ke Pinjaman
              </Link>
            </div>
            
            <h1 style={{ color: "#fff", margin: "0 0 8px 0", fontSize: "24px", fontWeight: "800", letterSpacing: "-.02em", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ background: "rgba(255,255,255,0.2)", padding: "8px", borderRadius: "12px", display: "flex" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              Sync Pembayaran Massal
            </h1>
          </div>
        </header>

        <div className="kop-content-wrapper">
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div className="kop-card" style={{ padding: "24px" }}>
              
              {!isAllowedDate && (
                <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: "14px", padding: "16px", marginBottom: "24px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ color: "#dc2626", marginTop: "2px" }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
                  <div>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#991b1b", fontWeight: "800" }}>Sistem Terkunci (Bukan Tanggal 25)</h4>
                    <p style={{ margin: 0, fontSize: "13px", color: "#b91c1c", lineHeight: "1.5", fontWeight: "500" }}>Tombol eksekusi pemotongan cicilan pinjaman massal <strong>hanya aktif pada tanggal 25</strong> setiap bulannya (hari <em>payroll</em>).</p>
                  </div>
                </div>
              )}

              {isAllowedDate && (
                <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "14px", padding: "16px", marginBottom: "24px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ color: "#1d4ed8", marginTop: "2px" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></div>
                  <p style={{ margin: 0, fontSize: "13px", color: "#1e40af", lineHeight: "1.6", fontWeight: "500" }}>
                    <strong style={{ fontWeight: "800" }}>Info Payroll Pinjaman:</strong> Fitur ini akan otomatis memproses <strong>SELURUH</strong> tagihan cicilan pinjaman aktif yang jatuh tempo di bulan yang dipilih. Jika ada pinjaman yang mencapai cicilan akhir, statusnya akan otomatis berubah menjadi LUNAS.
                  </p>
                </div>
              )}

              <SyncPinjamanForm defaultBulan={currentMonth} defaultTahun={currentYear} isAllowedDate={isAllowedDate} />

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
