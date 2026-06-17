import React from "react";
import { requireRole } from "@/lib/auth/session";
import { SetoranMassalForm } from "./SetoranMassalForm";
import Link from "next/link";

export default async function SetoranMassalPage() {
  await requireRole(["SUPERADMIN", "BENDAHARA"]);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  return (
    <div style={{ backgroundColor: "#f1f5f9", minHeight: "100vh", paddingBottom: "40px" }}>
      {/* --- Global & Design System Styles --- */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
        }

        .fintech-header {
          position: relative;
          background: linear-gradient(145deg, #0f2d6b 0%, #1a4db3 60%, #2563eb 100%);
          overflow: hidden;
          padding: 24px 20px;
          height: 180px;
          border-bottom-left-radius: 24px;
          border-bottom-right-radius: 24px;
        }

        /* Aturan wajib: pointer-events: none untuk elemen pseudo */
        .fintech-header::before,
        .fintech-header::after {
          content: '';
          position: absolute;
          pointer-events: none; 
          border-radius: 50%;
        }

        .fintech-header::before {
          top: -40px;
          left: -40px;
          width: 150px;
          height: 150px;
          background: rgba(255, 255, 255, 0.08);
        }

        .fintech-header::after {
          bottom: -20px;
          right: -60px;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.05);
        }

        .card-fintech {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 12px rgba(15,45,107,.06);
          padding: 24px;
        }
      `}} />

      {/* --- Header Area --- */}
      <header className="fintech-header">
        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          
          {/* Tombol Back: Transparan Putih */}
          <Link 
            href="/dashboard/simpanan"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255, 255, 255, 0.2)",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "20px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "500",
              backdropFilter: "blur(4px)"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Kembali ke Simpanan
          </Link>

          {/* Judul Halaman */}
          <h1 style={{ 
            color: "#fff", 
            margin: "24px 0 0 0", 
            fontSize: "24px", 
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Setoran Bulanan Massal
          </h1>
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main style={{ maxWidth: "800px", margin: "-50px auto 0 auto", padding: "0 20px", position: "relative", zIndex: 20 }}>
        <div className="card-fintech">
          
          {/* Alert Info Box */}
          <div style={{ 
            background: "#eff6ff", 
            border: "1px solid #bfdbfe", 
            borderRadius: "8px", 
            padding: "16px", 
            marginBottom: "24px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px"
          }}>
            <div style={{ color: "#1d4ed8", marginTop: "2px", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            </div>
            <p style={{ margin: 0, fontSize: "14px", color: "#1e40af", lineHeight: "1.6" }}>
              <strong style={{ fontWeight: "600" }}>Info Payroll:</strong> Fitur ini akan otomatis memotong <strong style={{ fontWeight: "600" }}>Simpanan Wajib</strong> dan <strong style={{ fontWeight: "600" }}>Simpanan Sukarela</strong> bulanan untuk semua anggota aktif sekaligus sesuai nominal di profil masing-masing. Anggota yang sudah diproses pada periode ini akan <strong style={{ fontWeight: "600" }}>dilewati otomatis</strong> untuk mencegah data ganda.
            </p>
          </div>

          {/* Form Component */}
          <SetoranMassalForm
            defaultBulan={currentMonth}
            defaultTahun={currentYear}
          />

        </div>
      </main>
    </div>
  );
}
