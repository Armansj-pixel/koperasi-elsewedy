import React from "react";
import { requireRole } from "@/lib/auth/session";
import { getPinjamanAktifAnggota } from "@/lib/pinjaman/actions";
import { createClient } from "@/lib/supabase/server";
import AjukanPinjamanForm from "./AjukanPinjamanForm";
import Link from "next/link";

export default async function AjukanPinjamanPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const currentUser = await requireRole(["ANGGOTA"]);
  const supabase = await createClient();

  const pinjamanAktif = await getPinjamanAktifAnggota(currentUser.id);
  
  // LOGIKA PENGECEKAN TOP-UP & BLOKIR
  let blockReason = "";
  let isEligibleForTopUp = false;
  let sisaCicilanLama = 0;
  let idPinjamanLama = null;

  if (pinjamanAktif.length > 0) {
    const p = pinjamanAktif[0];
    if (["PENDING_L1", "PENDING_L2", "PENDING_L3", "APPROVED"].includes(p.status)) {
      blockReason = "Anda masih memiliki pengajuan pinjaman yang sedang diproses. Harap tunggu hingga proses selesai.";
      idPinjamanLama = p.id;
    } else if (p.status === "ACTIVE") {
      // Hitung sisa cicilan untuk menentukan kelayakan Top-Up
      const { count } = await supabase
        .from('cicilan_pinjaman')
        .select('*', { count: 'exact', head: true })
        .eq('pinjaman_id', p.id)
        .in('status', ['SCHEDULED', 'OVERDUE']);

      sisaCicilanLama = count || 0;

      if (sisaCicilanLama > 3) {
        blockReason = `Anda tidak dapat mengajukan pinjaman baru. Sisa cicilan Anda saat ini masih ${sisaCicilanLama} kali (Syarat Top-Up maksimal sisa 3 cicilan).`;
        idPinjamanLama = p.id;
      } else {
        isEligibleForTopUp = true;
      }
    }
  }

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
          transition: all 0.2s ease;
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
            href="/dashboard/pinjaman"
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
            Pinjaman
          </Link>
          <h1 style={{ color: "#fff", margin: 0, fontSize: "26px", fontWeight: "700" }}>
            Pengajuan Pinjaman
          </h1>
        </div>
      </header>

      <main style={{ maxWidth: "640px", margin: "-50px auto 0 auto", padding: "0 20px", position: "relative", zIndex: 20 }}>
        {searchParams.error && (
          <div
            style={{
              background: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              borderRadius: "12px",
              padding: "14px 18px",
              marginBottom: "20px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            ✗ {searchParams.error}
          </div>
        )}

        {blockReason ? (
          <div className="card-fintech" style={{ textAlign: "center" }}>
            <svg style={{ margin: "0 auto 16px auto", display: "block" }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div style={{ fontWeight: "700", color: "#0f2d6b", marginBottom: "8px" }}>
              Pengajuan Diblokir Sistem
            </div>
            <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px", lineHeight: "1.6" }}>
              {blockReason}
            </div>
            {idPinjamanLama && (
              <Link
                href={`/dashboard/pinjaman/${idPinjamanLama}`}
                style={{
                  display: "inline-block",
                  background: "#d97706",
                  color: "#fff",
                  padding: "10px 24px",
                  borderRadius: "10px",
                  fontWeight: "600",
                  fontSize: "14px",
                  textDecoration: "none",
                }}
              >
                Lihat Pinjaman Aktif →
              </Link>
            )}
          </div>
        ) : (
          <>
            {isEligibleForTopUp && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", borderRadius: "16px", padding: "16px", marginBottom: "20px" }}>
                <div style={{ fontWeight: "700", fontSize: "14px", marginBottom: "4px" }}>
                  ✨ Anda Memenuhi Syarat Top-Up!
                </div>
                <div style={{ fontSize: "13px" }}>
                  Sisa cicilan Anda tinggal {sisaCicilanLama} kali. Anda dapat mengajukan pinjaman baru. Pencairan nanti akan otomatis dipotong untuk melunasi sisa pinjaman lama Anda.
                </div>
              </div>
            )}
            
            <div className="card-fintech">
              <AjukanPinjamanForm />
            </div>
          </>
        )}

        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "20px",
            marginTop: "20px",
          }}
        >
          <div style={{ fontWeight: "700", fontSize: "14px", color: "#475569", marginBottom: "10px" }}>
            Syarat & Ketentuan
          </div>
          <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "#64748b", lineHeight: "1.7" }}>
            <li>Anggota aktif koperasi PT Elsewedy Electric Indonesia</li>
            <li><strong>Plafon maksimal Rp 15.000.000</strong></li>
            <li><strong>Tenor maksimal 12 bulan</strong></li>
            <li>Biaya admin 4% dipotong di awal pencairan</li>
            <li>Persetujuan 3 level: Sekretaris → Bendahara → Ketua</li>
            <li>Berlaku sistem Auto-Settlement untuk Top-Up (Sisa utang dilunasi dari pencairan baru)</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
