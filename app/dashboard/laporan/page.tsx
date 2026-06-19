import React from "react";
import { requireRole } from "@/lib/auth/session";
import { getDaftarAnggotaUntukSlip } from "@/lib/laporan/actions";
import LaporanForm from "./LaporanForm";
import Link from "next/link";

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
    <div style={{ backgroundColor: "#f1f5f9", minHeight: "100vh", paddingBottom: "40px" }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; font-family: 'Inter', sans-serif; }

        .fintech-header {
          position: relative;
          background: linear-gradient(145deg, #0f2d6b 0%, #1a4db3 60%, #2563eb 100%);
          overflow: hidden;
          padding: 24px 20px;
          height: 200px;
          border-bottom-left-radius: 24px;
          border-bottom-right-radius: 24px;
        }
        .fintech-header::before, .fintech-header::after {
          content: ''; position: absolute; pointer-events: none; border-radius: 50%;
        }
        .fintech-header::before { top: -40px; left: -40px; width: 150px; height: 150px; background: rgba(255,255,255,0.08); }
        .fintech-header::after { bottom: -20px; right: -60px; width: 200px; height: 200px; background: rgba(255,255,255,0.05); }

        .card-fintech {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 12px rgba(15,45,107,.06);
          padding: 24px;
        }
        .fintech-input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          font-size: 14px;
          background-color: #fff;
          color: #1e293b;
        }
        .fintech-input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,.12);
        }
      `,
        }}
      />

      <header className="fintech-header">
        <div style={{ maxWidth: "640px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.2)",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "20px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "500",
              backdropFilter: "blur(4px)",
              marginBottom: "20px",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>

          <h1
            style={{
              color: "#fff",
              margin: 0,
              fontSize: "26px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Laporan
          </h1>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px", marginTop: "4px" }}>
            Slip potongan & rekap bulanan
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "640px", margin: "-50px auto 0 auto", padding: "0 20px", position: "relative", zIndex: 20 }}>
        <LaporanForm
          isAdmin={isAdmin}
          currentUserId={currentUser.id}
          currentUserNama={(currentUser as any).nama ?? ""}
          anggotaList={anggotaList ?? []}
        />
      </main>
    </div>
  );
}
