import React from "react";
import { requireRole } from "@/lib/auth/session";
import { getAnggotaById } from "@/lib/anggota/actions";
import { EditAnggotaForm } from "./EditAnggotaForm";
import Link from "next/link";
import { redirect } from "next/navigation";

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

export default async function EditAnggotaPage({
  params,
}: {
  params: { id: string };
}) {
  await requireRole(["SUPERADMIN", "SEKRETARIS"]);

  const { data: anggota, error } = await getAnggotaById(params.id);

  if (error || !anggota) {
    redirect("/dashboard/anggota");
  }

  return (
    <main className="kop-shell bg-slate-100 min-h-screen">
      {/* CSS di-inject melalui variabel */}
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div className="w-full max-w-5xl mx-auto bg-slate-100 min-h-screen relative sm:shadow-xl sm:border-x sm:border-slate-200">
        
        {/* --- Header Area --- */}
        <header className="kop-header">
          <div className="kop-orb" style={{ width: 280, height: 280, top: -100, right: -100, background: 'radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 70%)' }} />
          <div className="kop-orb" style={{ width: 200, height: 200, bottom: -40, left: -40, background: 'radial-gradient(circle, rgba(96,165,250,.2) 0%, transparent 70%)' }} />
          
          <div style={{ position: "relative", zIndex: 10, maxWidth: "800px", margin: "0 auto" }}>
            {/* Navigasi Atas */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Link href={`/dashboard/anggota/${params.id}`} className="kop-btn-nav">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Detail Anggota
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
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              Edit Data — {anggota.nama}
            </h1>
          </div>
        </header>

        {/* --- Main Content Area --- */}
        <div className="kop-content-wrapper">
          {/* Form wrapper dengan maxWidth 800px agar form tidak melar terlalu lebar di layar PC */}
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div className="kop-card" style={{ padding: "24px" }}>
              
              {/* Alert Info/Warning */}
              <div style={{ 
                background: "#fffbeb", 
                border: "1px solid #fde68a", 
                borderRadius: "14px", 
                padding: "16px", 
                marginBottom: "24px",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                boxShadow: "0 4px 12px rgba(180,83,9,0.05)"
              }}>
                <div style={{ color: "#b45309", marginTop: "2px", flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <p style={{ margin: 0, fontSize: "13px", color: "#92400e", lineHeight: "1.5" }}>
                  <strong style={{ fontWeight: "700" }}>Perhatian:</strong> NIK tidak dapat diubah setelah
                  didaftarkan. Hubungi Super Admin jika NIK perlu diperbaiki.
                </p>
              </div>

              {/* Form Edit Component */}
              <EditAnggotaForm anggota={anggota} />

            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
