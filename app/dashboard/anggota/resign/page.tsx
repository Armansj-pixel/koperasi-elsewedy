import React from "react";
import { requireRole } from "@/lib/auth/session";
import { getKalkulasiResign } from "@/lib/anggota/actions"; 
import Link from "next/link";
import ResignForm from "./ResignForm";
import { redirect } from "next/navigation";

// ── CSS STYLES ──
const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  .kop-shell { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
  .kop-header { background: linear-gradient(150deg, #be123c 0%, #e11d48 40%, #f43f5e 75%, #fb7185 100%); padding: 30px 20px 100px; position: relative; overflow: hidden; }
  .kop-orb { position: absolute; border-radius: 50%; pointer-events: none; }
  .kop-card { background: #fff; border-radius: 20px; border: 1.5px solid #e2e8f0; box-shadow: 0 4px 28px rgba(15,45,107,.05); margin-bottom: 20px; overflow: hidden; }
  .kop-btn-nav { display: inline-flex; align-items: center; gap: 6px; background: rgba(255, 255, 255, 0.15); color: #fff; padding: 8px 14px; border-radius: 20px; text-decoration: none; font-size: 13px; font-weight: 600; backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.2); transition: transform 0.2s, background 0.2s; }
  .kop-btn-nav:hover { background: rgba(255, 255, 255, 0.25); }
  .kop-content-wrapper { padding: 0 16px 40px; margin-top: -70px; position: relative; z-index: 20; }
  @media (min-width: 768px) { .kop-header { padding: 40px 32px 100px; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; } .kop-content-wrapper { padding: 0 32px 40px; margin-top: -70px; } }
`;

export default async function ResignPage({
  searchParams,
}: {
  searchParams: { id?: string; error?: string };
}) {
  await requireRole(["SUPERADMIN", "BENDAHARA", "SEKRETARIS"]);

  if (!searchParams.id) {
    redirect("/dashboard/anggota");
  }

  const kalkulasi = await getKalkulasiResign(searchParams.id);

  if (kalkulasi.error || !kalkulasi.user) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#b91c1c", fontWeight: "700" }}>
        {kalkulasi.error || "Data anggota tidak ditemukan."}
      </div>
    );
  }

  return (
    <main className="kop-shell bg-slate-100 min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div className="w-full max-w-5xl mx-auto bg-slate-100 min-h-screen relative sm:shadow-xl sm:border-x sm:border-slate-200">
        
        <header className="kop-header">
          <div className="kop-orb" style={{ width: 280, height: 280, top: -100, right: -100, background: 'radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 70%)' }} />
          <div className="kop-orb" style={{ width: 200, height: 200, bottom: -40, left: -40, background: 'radial-gradient(circle, rgba(255,255,255,.15) 0%, transparent 70%)' }} />
          
          <div style={{ position: "relative", zIndex: 10, maxWidth: "640px", margin: "0 auto" }}>
            <Link href={`/dashboard/anggota/${kalkulasi.user.id}`} className="kop-btn-nav" style={{ marginBottom: "20px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Kembali ke Profil Anggota
            </Link>
            <h1 style={{ color: "#fff", margin: 0, fontSize: "28px", fontWeight: "800", letterSpacing: "-.02em" }}>
              Proses Clearance (Resign)
            </h1>
            <p style={{ color: "rgba(255,255,255,0.9)", margin: "4px 0 0 0", fontSize: "14px", fontWeight: "500" }}>
              Kalkulasi hak dan kewajiban atas nama <strong style={{ color: "#fff" }}>{kalkulasi.user.nama}</strong>
            </p>
          </div>
        </header>

        <div className="kop-content-wrapper">
          <div style={{ maxWidth: "640px", margin: "0 auto" }}>
            
            {searchParams.error && (
              <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#b91c1c", borderRadius: "14px", padding: "16px", marginBottom: "20px", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>{searchParams.error}</span>
              </div>
            )}

            {!kalkulasi.user.is_active ? (
              <div className="kop-card" style={{ padding: "40px 24px", textAlign: "center" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div style={{ fontWeight: "800", fontSize: "18px", color: "#0f172a", marginBottom: "8px" }}>Anggota Sudah Nonaktif</div>
                <div style={{ fontSize: "14px", color: "#475569", fontWeight: "500" }}>Proses clearance untuk {kalkulasi.user.nama} sudah pernah dilakukan sebelumnya.</div>
              </div>
            ) : (
              <div className="kop-card" style={{ padding: "24px" }}>
                <ResignForm kalkulasi={kalkulasi} />
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}
