import React from "react";
import { requireRole } from "@/lib/auth/session";
import { getAnggotaById } from "@/lib/anggota/actions";
import { EditAnggotaForm } from "./EditAnggotaForm";
import Link from "next/link";
import { redirect } from "next/navigation";

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
          
          {/* Navigasi Atas */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* Tombol Back: Transparan Putih */}
            <Link 
              href={`/dashboard/anggota/${params.id}`}
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
              Detail Anggota
            </Link>
          </div>

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
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit Anggota - {anggota.nama}
          </h1>
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main style={{ maxWidth: "800px", margin: "-50px auto 0 auto", padding: "0 20px", position: "relative", zIndex: 20 }}>
        <div className="card-fintech">
          
          {/* Alert Info/Warning */}
          <div style={{ 
            background: "#fffbeb", 
            border: "1px solid #fde68a", 
            borderRadius: "8px", 
            padding: "16px", 
            marginBottom: "24px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px"
          }}>
            <div style={{ color: "#b45309", marginTop: "2px", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <p style={{ margin: 0, fontSize: "14px", color: "#92400e", lineHeight: "1.5" }}>
              <strong style={{ fontWeight: "600" }}>Perhatian:</strong> NIK tidak dapat diubah setelah
              didaftarkan. Hubungi Super Admin jika NIK perlu diperbaiki.
            </p>
          </div>

          {/* Form Edit Component */}
          {/* Styling di dalam EditAnggotaForm juga harus disesuaikan nantinya jika form tersebut memiliki UI tersendiri */}
          <EditAnggotaForm anggota={anggota} />

        </div>
      </main>
    </div>
  );
}
