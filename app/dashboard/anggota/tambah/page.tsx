import React from "react";
import { requireRole } from "@/lib/auth/session";
import { TambahAnggotaForm } from "./TambahAnggotaForm";
import Link from "next/link";

export default async function TambahAnggotaPage() {
  await requireRole(["SUPERADMIN", "SEKRETARIS"]);

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
          margin-bottom: 20px;
        }
      `}} />

      {/* --- Header Area --- */}
      <header className="fintech-header">
        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          
          {/* Tombol Back: Transparan Putih */}
          <Link 
            href="/dashboard/anggota"
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
            Daftar Anggota
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
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Tambah Anggota Baru
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
            <p style={{ margin: 0, fontSize: "14px", color: "#1e40af", lineHeight: "1.5" }}>
              <strong style={{ fontWeight: "600" }}>Info:</strong> Password default anggota baru adalah{" "}
              <strong style={{ fontWeight: "600" }}>4 digit terakhir NIK</strong>. Anggota akan diminta ganti
              password saat login pertama kali.
            </p>
          </div>

          {/* Form Tambah Component */}
          {/* Styling di dalam TambahAnggotaForm juga harus disesuaikan nantinya jika form tersebut memiliki UI tersendiri */}
          <TambahAnggotaForm />

        </div>
      </main>
    </div>
  );
}
