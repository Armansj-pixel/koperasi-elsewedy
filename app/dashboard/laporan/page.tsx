import React from "react";
import { requireRole } from "@/lib/auth/session";
import { getDaftarAnggotaUntukSlip } from "@/lib/laporan/actions";
import LaporanForm from "./LaporanForm";
import Link from "next/link";

// ── CSS STYLES ──
const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  .kop-shell { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
  
  .kop-header {
    background: linear-gradient(150deg, #0a1e4a 0%, #0f2d6b 40%, #1a4db3 75%, #2563eb 100%);
    padding: 30px 20px 100px;
    position: relative; overflow: hidden;
  }
  .kop-orb { position: absolute; border-radius: 50%; pointer-events: none; }

  .kop-card {
    background: #fff;
    border-radius: 20px;
    border: 1.5px solid #e2e8f0;
    box-shadow: 0 4px 28px rgba(15,45,107,.05);
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
  .kop-btn-nav:hover { background: rgba(255, 255, 255, 0.25); transform: translateY(-1px); }
  .kop-btn-nav:active { transform: scale(0.95); }

  .kop-content-wrapper { padding: 0 16px 40px; margin-top: -70px; position: relative; z-index: 20; }
  
  @media (min-width: 768px) {
    .kop-header { padding: 40px 32px 100px; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; }
    .kop-content-wrapper { padding: 0 32px 40px; margin-top: -70px; }
  }
`;

export default async function LaporanPage() {
  const currentUser = await requireRole([
    "ANGGOTA",
    "SEKRETARIS",
    "BENDAHARA",
    "KETUA",
    "SUPERADMIN",
  ]);

  const isAdmin = ["SEKRETARIS", "BENDAHARA", "KETUA", "SUPERADMIN"].includes(currentUser.role);

  const anggotaList = isAdmin ? (await getDaftarAnggotaUntukSlip()).data : [];

  return (
    <main className="kop-shell bg-slate-100 min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div className="w-full max-w-5xl mx-auto bg-slate-100 min-h-screen relative sm:shadow-xl sm:border-x sm:border-slate-200">
        
        {/* --- Header Area --- */}
        <header className="kop-header">
          <div className="kop-orb" style={{ width: 280, height: 280, top: -100, right: -100, background: 'radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 70%)' }} />
          <div className="kop-orb" style={{ width: 200, height: 200, bottom: -40, left: -40, background: 'radial-gradient(circle, rgba(96,165,250,.2) 0%, transparent 70%)' }} />
          
          <div style={{ position: "relative", zIndex: 10, maxWidth: "640px", margin: "0 auto" }}>
            <Link href="/dashboard" className="kop-btn-nav" style={{ marginBottom: "20px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Dashboard
            </Link>
            
            <h1 style={{ color: "#fff", margin: 0, fontSize: "28px", fontWeight: "800", letterSpacing: "-.02em", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ background: "rgba(255,255,255,0.2)", padding: "8px", borderRadius: "12px", display: "flex", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              Laporan & Slip
            </h1>
            <p style={{ color: "rgba(255,255,255,0.85)", margin: "8px 0 0 0", fontSize: "14px", fontWeight: "500" }}>
              Unduh slip potongan dan cetak rekapitulasi Koperasi bulanan.
            </p>
          </div>
        </header>

        {/* --- Main Content Area --- */}
        <div className="kop-content-wrapper">
          <div style={{ maxWidth: "640px", margin: "0 auto" }}>
            
            {isAdmin && (
              <div style={{ background: "linear-gradient(to right, #eff6ff, #dbeafe)", border: "1.5px solid #bfdbfe", borderRadius: "16px", padding: "16px 20px", marginBottom: "20px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{ color: "#1d4ed8", marginTop: "2px" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                </div>
                <div>
                  <div style={{ fontWeight: "800", fontSize: "14px", color: "#1e40af", marginBottom: "4px" }}>Akses Administrator</div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#1d4ed8", lineHeight: "1.5" }}>
                    Anda memiliki hak untuk mencetak slip atas nama seluruh anggota serta men-download rekapitulasi master Excel bulanan.
                  </div>
                </div>
              </div>
            )}

            <div className="kop-card" style={{ padding: "24px" }}>
              <LaporanForm
                isAdmin={isAdmin}
                currentUserId={currentUser.id}
                currentUserNama={(currentUser as any).nama ?? ""}
                anggotaList={anggotaList ?? []}
              />
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
