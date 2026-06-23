import React from "react";
import { requireRole } from "@/lib/auth/session";
import { getProfilSaya } from "@/lib/profil/actions";
import EditProfilForm from "./EditProfilForm";
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
    padding: 24px;
    margin-bottom: 20px;
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

  .kop-content-wrapper { padding: 0 16px 40px; margin-top: -70px; position: relative; z-index: 20; }
  
  @media (min-width: 768px) {
    .kop-header { padding: 40px 32px 100px; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; }
    .kop-content-wrapper { padding: 0 32px 40px; margin-top: -70px; }
  }
`;

export default async function EditProfilPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  await requireRole(["ANGGOTA", "SUPERADMIN", "SEKRETARIS", "BENDAHARA", "KETUA"]);

  const { data: profil, error } = await getProfilSaya();

  if (!profil || error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ textAlign: "center", color: "#64748b", background: "#fff", padding: "32px", borderRadius: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
          <svg style={{ margin: "0 auto 16px", color: "#cbd5e1" }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div style={{ fontWeight: "700", fontSize: "18px", color: "#0f172a", marginBottom: "8px" }}>Gagal Memuat Data</div>
          <div style={{ fontSize: "14px" }}>{error || "Profil tidak ditemukan."}</div>
        </div>
      </div>
    );
  }

  return (
    <main className="kop-shell bg-slate-100 min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div className="w-full max-w-5xl mx-auto bg-slate-100 min-h-screen relative sm:shadow-xl sm:border-x sm:border-slate-200">
        
        {/* --- Header Area --- */}
        <header className="kop-header">
          <div className="kop-orb" style={{ width: 280, height: 280, top: -100, right: -100, background: 'radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 70%)' }} />
          <div className="kop-orb" style={{ width: 200, height: 200, bottom: -40, left: -40, background: 'radial-gradient(circle, rgba(96,165,250,.2) 0%, transparent 70%)' }} />
          
          <div style={{ position: "relative", zIndex: 10, maxWidth: "640px", margin: "0 auto" }}>
            <Link href="/dashboard/profil" className="kop-btn-nav" style={{ marginBottom: "20px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Kembali ke Profil
            </Link>
            <h1 style={{ color: "#fff", margin: 0, fontSize: "28px", fontWeight: "800", letterSpacing: "-.02em" }}>
              Edit Data Profil
            </h1>
            <p style={{ color: "rgba(255,255,255,0.8)", margin: "4px 0 0 0", fontSize: "14px", fontWeight: "500" }}>
              Perbarui informasi kontak dan data diri Anda.
            </p>
          </div>
        </header>

        {/* --- Main Content Area --- */}
        <div className="kop-content-wrapper">
          <div style={{ maxWidth: "640px", margin: "0 auto" }}>
            
            {searchParams.error && (
              <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#b91c1c", borderRadius: "14px", padding: "16px", marginBottom: "20px", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>{searchParams.error}</span>
              </div>
            )}

            <div className="kop-card" style={{ padding: "24px" }}>
              <EditProfilForm
                nama={profil.nama}
                email={profil.email ?? ""}
                noHp={profil.no_hp ?? ""}
                fotoProfil={profil.foto_profil}
              />
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
