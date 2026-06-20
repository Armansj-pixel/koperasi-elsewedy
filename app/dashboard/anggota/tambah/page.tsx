import React from "react";
import { requireRole } from "@/lib/auth/session";
import { TambahAnggotaForm } from "./TambahAnggotaForm";
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

  /* ── RESPONSIVE RULES ── */
  .kop-content-wrapper { padding: 0 16px 40px; margin-top: -70px; position: relative; z-index: 20; }
  
  /* Tablet & Desktop Layout */
  @media (min-width: 768px) {
    .kop-header { padding: 40px 32px 100px; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; }
    .kop-content-wrapper { padding: 0 32px 40px; margin-top: -70px; }
  }
`;

export default async function TambahAnggotaPage() {
  await requireRole(["SUPERADMIN", "SEKRETARIS"]);

  return (
    <main className="kop-shell bg-slate-100 min-h-screen">
      {/* CSS di-inject melalui variabel untuk menghindari error build */}
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div className="w-full max-w-5xl mx-auto bg-slate-100 min-h-screen relative sm:shadow-xl sm:border-x sm:border-slate-200">
        
        {/* --- Header Area --- */}
        <header className="kop-header">
          <div className="kop-orb" style={{ width: 280, height: 280, top: -100, right: -100, background: 'radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 70%)' }} />
          <div className="kop-orb" style={{ width: 200, height: 200, bottom: -40, left: -40, background: 'radial-gradient(circle, rgba(96,165,250,.2) 0%, transparent 70%)' }} />
          
          <div style={{ position: "relative", zIndex: 10, maxWidth: "800px", margin: "0 auto" }}>
            {/* Navigasi Atas */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Link href="/dashboard/anggota" className="kop-btn-nav">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Daftar Anggota
              </Link>
            </div>

            {/* Judul Halaman */}
            <h1 style={{ 
              color: "#fff", 
              margin: "24px 0 0 0", 
              fontSize: "22px", 
              fontWeight: "800",
              letterSpacing: "-.02em",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              <div style={{ background: "rgba(255,255,255,0.2)", padding: "8px", borderRadius: "12px", display: "flex" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
              Tambah Anggota Baru
            </h1>
          </div>
        </header>

        {/* --- Main Content Area --- */}
        <div className="kop-content-wrapper">
          {/* Form wrapper dengan maxWidth 800px agar form tidak melar terlalu lebar di layar PC */}
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div className="kop-card" style={{ padding: "24px" }}>
              
              {/* Alert Info Box */}
              <div style={{ 
                background: "#eff6ff", 
                border: "1px solid #bfdbfe", 
                borderRadius: "14px", 
                padding: "16px", 
                marginBottom: "24px",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                boxShadow: "0 4px 12px rgba(29,78,216,0.05)"
              }}>
                <div style={{ color: "#1d4ed8", marginTop: "2px", flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                </div>
                <p style={{ margin: 0, fontSize: "13px", color: "#1e40af", lineHeight: "1.5" }}>
                  <strong style={{ fontWeight: "700" }}>Info Sistem:</strong> Kata sandi default untuk anggota baru adalah{" "}
                  <strong style={{ fontWeight: "700" }}>4 digit terakhir NIK</strong>. Anggota akan diminta untuk mengganti kata sandi saat pertama kali login.
                </p>
              </div>

              {/* Form Tambah Component */}
              <TambahAnggotaForm />

            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
