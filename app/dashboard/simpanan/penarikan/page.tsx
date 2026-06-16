import React from "react";
import { requireRole } from "@/lib/auth/session";
import {
  getListPenarikan,
  updateStatusPenarikan,
} from "@/lib/simpanan/actions";
import Link from "next/link";
import { redirect } from "next/navigation";

// Diganti ke CSS Properties
const statusStyle: Record<string, React.CSSProperties> = {
  PENDING: { backgroundColor: "#fef3c7", color: "#b45309" },
  APPROVED: { backgroundColor: "#dcfce7", color: "#15803d" },
  REJECTED: { backgroundColor: "#fee2e2", color: "#b91c1c" },
  DISBURSED: { backgroundColor: "#dbeafe", color: "#1d4ed8" },
};

const statusLabel: Record<string, string> = {
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  DISBURSED: "Dicairkan",
};

export default async function PenarikanPage({
  searchParams,
}: {
  searchParams: { filter?: string; msg?: string; error?: string };
}) {
  await requireRole(["SUPERADMIN", "BENDAHARA", "KETUA"]);

  const filter = searchParams.filter || "";
  const { data: penarikanList } = await getListPenarikan(
    filter || undefined
  );

  const totalPending = penarikanList.filter(
    (p: any) => p.status === "PENDING"
  ).length;
  const totalApproved = penarikanList.filter(
    (p: any) => p.status === "APPROVED"
  ).length;
  const totalRejected = penarikanList.filter(
    (p: any) => p.status === "REJECTED"
  ).length;

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
          padding: 20px;
          margin-bottom: 16px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }

        .filter-btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-action {
          flex: 1;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
          cursor: pointer;
          border: none;
        }
      `}} />

      {/* --- Header Area --- */}
      <header className="fintech-header">
        <div style={{ maxWidth: "1000px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          
          {/* Tombol Back: Transparan Putih */}
          <Link 
            href="/dashboard/simpanan"
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
            Kembali ke Simpanan
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
            Pengajuan Penarikan Simpanan
          </h1>

        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main style={{ maxWidth: "1000px", margin: "-50px auto 0 auto", padding: "0 20px", position: "relative", zIndex: 20 }}>

        {/* Flash Messages */}
        {searchParams.msg && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "14px", fontWeight: "500" }}>
            <svg style={{ flexShrink: 0, marginTop: "2px" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>{searchParams.msg}</span>
          </div>
        )}
        {searchParams.error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "14px", fontWeight: "500" }}>
            <svg style={{ flexShrink: 0, marginTop: "2px" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>{searchParams.error}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="card-fintech" style={{ padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: "700", color: "#d97706" }}>
              {totalPending}
            </div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Menunggu
            </div>
          </div>
          <div className="card-fintech" style={{ padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: "700", color: "#16a34a" }}>
              {totalApproved}
            </div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Disetujui
            </div>
          </div>
          <div className="card-fintech" style={{ padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: "700", color: "#ef4444" }}>
              {totalRejected}
            </div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Ditolak
            </div>
          </div>
        </div>

        {/* Filter */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
          {[
            { 
              label: "Semua", 
              value: "", 
              icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            },
            { 
              label: "Menunggu", 
              value: "PENDING", 
              icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> 
            },
            { 
              label: "Disetujui", 
              value: "APPROVED", 
              icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            },
            { 
              label: "Ditolak", 
              value: "REJECTED", 
              icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            },
          ].map((f) => {
            const isActive = filter === f.value;
            return (
              <Link
                key={f.value}
                href={`/dashboard/simpanan/penarikan${
                  f.value ? `?filter=${f.value}` : ""
                }`}
                className="filter-btn"
                style={{
                  background: isActive ? "#2563eb" : "#fff",
                  color: isActive ? "#fff" : "#475569",
                  border: `1px solid ${isActive ? "#2563eb" : "#e2e8f0"}`,
                  boxShadow: isActive ? "0 2px 4px rgba(37,99,235,0.2)" : "none"
                }}
              >
                {f.icon}
                {f.label}
              </Link>
            )
          })}
        </div>

        {/* List Penarikan */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {penarikanList.length === 0 ? (
            <div className="card-fintech" style={{ padding: "48px 20px", textAlign: "center", color: "#94a3b8" }}>
              <svg style={{ margin: "0 auto 12px auto", display: "block", color: "#cbd5e1" }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 4v4"/><path d="M14 4v4"/><path d="M6 4v4"/><path d="M18 4v4"/>
              </svg>
              <div style={{ fontSize: "14px" }}>
                Tidak ada pengajuan penarikan
              </div>
            </div>
          ) : (
            penarikanList.map((item: any) => {
              const user = item.users;
              return (
                <div key={item.id} className="card-fintech">
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                    
                    {/* Info Anggota */}
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "700", color: "#1d4ed8", flexShrink: 0, border: "2px solid #dbeafe" }}>
                        {user?.nama?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: "700", color: "#0f2d6b", fontSize: "16px" }}>
                          {user?.nama}
                        </div>
                        <div style={{ fontSize: "13px", color: "#64748b", fontFamily: "monospace", margin: "2px 0" }}>
                          NIK: {user?.nik}
                        </div>
                        {user?.nama_bank && user?.no_rekening && (
                          <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>
                            {user.nama_bank} - {user.no_rekening}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Nominal + Status */}
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "20px", fontWeight: "800", color: "#0f2d6b" }}>
                        Rp {Number(item.nominal).toLocaleString("id-ID")}
                      </div>
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: "6px",
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          ...statusStyle[item.status]
                        }}
                      >
                        {statusLabel[item.status]}
                      </span>
                    </div>
                  </div>

                  {/* Detail */}
                  <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f1f5f9", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px", color: "#64748b" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      Diajukan: {new Date(item.tanggal_pengajuan).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                    {item.catatan && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Catatan: {item.catatan}
                      </div>
                    )}
                    {item.rejected_reason && (
                      <div style={{ color: "#ef4444", gridColumn: "span 2", display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                        Alasan ditolak: {item.rejected_reason}
                      </div>
                    )}
                    {item.approved_at && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        Diproses: {new Date(item.approved_at).toLocaleDateString("id-ID")}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons - hanya untuk PENDING */}
                  {item.status === "PENDING" && (
                    <div style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
                      
                      {/* Approve */}
                      <form
                        style={{ flex: 1 }}
                        action={async () => {
                          "use server";
                          const result = await updateStatusPenarikan(item.id, "APPROVED");
                          if (result.success) {
                            redirect(`/dashboard/simpanan/penarikan?msg=${encodeURIComponent(result.message ?? "Berhasil")}`);
                          } else {
                            redirect(`/dashboard/simpanan/penarikan?error=${encodeURIComponent(result.error ?? "Gagal")}`);
                          }
                        }}
                      >
                        <button
                          type="submit"
                          className="btn-action"
                          style={{ background: "#16a34a", color: "#fff" }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          Setujui
                        </button>
                      </form>

                      {/* Reject */}
                      <form
                        style={{ flex: 1 }}
                        action={async () => {
                          "use server";
                          const result = await updateStatusPenarikan(item.id, "REJECTED", "Ditolak oleh Bendahara");
                          if (result.success) {
                            redirect(`/dashboard/simpanan/penarikan?msg=${encodeURIComponent(result.message ?? "Berhasil")}`);
                          } else {
                            redirect(`/dashboard/simpanan/penarikan?error=${encodeURIComponent(result.error ?? "Gagal")}`);
                          }
                        }}
                      >
                        <button
                          type="submit"
                          className="btn-action"
                          style={{ background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          Tolak
                        </button>
                      </form>
                      
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
