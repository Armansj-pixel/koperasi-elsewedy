import React from "react";
import { requireRole } from "@/lib/auth/session";
import { getProfilSaya } from "@/lib/profil/actions";
import EditProfilForm from "./EditProfilForm";
import Link from "next/link";

export default async function EditProfilPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  await requireRole(["ANGGOTA", "SUPERADMIN", "SEKRETARIS", "BENDAHARA", "KETUA"]);

  const { data: profil, error } = await getProfilSaya();

  if (!profil || error) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
        Gagal memuat profil: {error}
      </div>
    );
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
          height: 180px;
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
        <div style={{ maxWidth: "560px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          <Link
            href="/dashboard/profil"
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
              marginBottom: "16px",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Profil
          </Link>
          <h1 style={{ color: "#fff", margin: 0, fontSize: "24px", fontWeight: "700" }}>Edit Profil</h1>
        </div>
      </header>

      <main style={{ maxWidth: "560px", margin: "-40px auto 0 auto", padding: "0 20px", position: "relative", zIndex: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {searchParams.error && (
            <div style={{ background: "#fee2e2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: "12px", padding: "14px 18px", fontSize: "14px", fontWeight: "500" }}>
              ✗ {searchParams.error}
            </div>
          )}

          <div className="card-fintech">
            <EditProfilForm
              nama={profil.nama}
              email={profil.email ?? ""}
              noHp={profil.no_hp ?? ""}
              fotoProfil={profil.foto_profil}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
