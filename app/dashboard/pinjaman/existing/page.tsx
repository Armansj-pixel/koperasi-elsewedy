import React from "react";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import PinjamanExistingForm from "./PinjamanExistingForm";
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
    border: 1px solid #eaeef5;
    box-shadow: 0 4px 28px rgba(15,45,107,.08), 0 1px 3px rgba(0,0,0,.03);
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
  .kop-btn-nav:hover { background: rgba(255, 255, 255, 0.25); }
  .kop-btn-nav:active { transform: scale(0.95); }

  .kop-content-wrapper { padding: 0 16px 40px; margin-top: -70px; position: relative; z-index: 20; }
  
  @media (min-width: 768px) {
    .kop-header { padding: 40px 32px 100px; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; }
    .kop-content-wrapper { padding: 0 32px 40px; margin-top: -70px; }
  }
`;

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
    <main className="kop-shell bg-slate-100 min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div className="w-full max-w-5xl mx-auto bg-slate-100 min-h-screen relative sm:shadow-xl sm:border-x sm:border-slate-200">
        
        {/* --- Header Area --- */}
        <header className="kop-header">
          <div className="kop-orb" style={{ width: 280, height: 280, top: -100, right: -100, background: 'radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 70%)' }} />
          <div className="kop-orb" style={{ width: 200, height: 200, bottom: -40, left: -40, background: 'radial-gradient(circle, rgba(96,165,250,.2) 0%, transparent 70%)' }} />
          
          <div style={{ position: "relative", zIndex: 10, maxWidth: "640px", margin: "0 auto" }}>
            <Link href="/dashboard/pinjaman" className="kop-btn-nav" style={{ marginBottom: "20px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Kembali
            </Link>
            <h1 style={{ color: "#fff", margin: 0, fontSize: "28px", fontWeight: "800", letterSpacing: "-.02em" }}>
              Input Pinjaman Lama
            </h1>
            <p style={{ color: "rgba(255,255,255,0.8)", margin: "4px 0 0 0", fontSize: "14px", fontWeight: "500" }}>
              Migrasi data historis dari Excel ke dalam sistem Koperasi.
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

            {/* Warning Banner */}
            <div style={{ background: "linear-gradient(to right, #fffbeb, #fef3c7)", border: "1.5px solid #fde68a", borderRadius: "16px", padding: "18px 20px", marginBottom: "20px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <div style={{ color: "#d97706", marginTop: "2px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div>
                <div style={{ fontWeight: "800", fontSize: "14px", color: "#b45309", marginBottom: "4px" }}>
                  Bypass Approval (Administrator)
                </div>
                <div style={{ fontSize: "13px", color: "#92400e", fontWeight: "500", lineHeight: "1.5" }}>
                  Data yang diinput melalui formulir ini akan langsung berstatus <strong style={{ color: "#b45309" }}>AKTIF</strong> (Bypass Level 1 s/d Pencairan) dan langsung men-generate jadwal cicilan. Pastikan data sudah diverifikasi silang dengan buku Excel!
                </div>
              </div>
            </div>

            <div className="kop-card" style={{ padding: "24px" }}>
              <PinjamanExistingForm anggotaList={anggota ?? []} />
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
