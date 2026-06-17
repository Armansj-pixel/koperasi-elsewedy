import React from "react";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import PinjamanExistingForm from "./PinjamanExistingForm";
import Link from "next/link";

export default async function PinjamanExistingPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  await requireRole(["BENDAHARA", "SUPERADMIN"]);

  const supabase = await createClient();
  const { data: anggota } = await supabase
    .from("users")
    .select("id, nama, nik")
    .eq("is_active", true)
    .eq("role", "ANGGOTA")
    .order("nama");

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
          <h1 style={{ color: "#fff", margin: 0, fontSize: "24px", fontWeight: "700" }}>Pinjaman Existing</h1>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px", marginTop: "4px" }}>
            Input data pinjaman migrasi dari Excel
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "640px", margin: "-50px auto 0 auto", padding: "0 20px", position: "relative", zIndex: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {searchParams.error && (
            <div style={{ background: "#fee2e2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: "12px", padding: "14px 18px", fontSize: "14px", fontWeight: "500" }}>
              ✗ {searchParams.error}
            </div>
          )}

          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "16px", padding: "18px" }}>
            <div style={{ fontWeight: "700", fontSize: "14px", color: "#b45309", marginBottom: "4px" }}>
              ⚠️ Fitur Migrasi Data
            </div>
            <div style={{ fontSize: "13px", color: "#92400e" }}>
              Data yang diinput akan langsung berstatus AKTIF tanpa melalui proses approval. Pastikan data sudah diverifikasi dari sumber Excel.
            </div>
          </div>

          <div className="card-fintech">
            <PinjamanExistingForm anggotaList={anggota ?? []} />
          </div>
        </div>
      </main>
    </div>
  );
}
