import React from "react";
import { requireRole } from "@/lib/auth/session";
import {
  getSaldoByUserId,
  getRiwayatSimpanan,
} from "@/lib/simpanan/actions";
import Link from "next/link";
import { redirect } from "next/navigation";

// Utility helpers untuk menggantikan Record dengan CSS Properties & SVG
const jenisLabel: Record<string, string> = {
  SETORAN: "Setoran",
  PENARIKAN: "Penarikan",
  KOREKSI: "Koreksi",
};

const getBadgeStyle = (jenis: string): React.CSSProperties => {
  if (jenis === "SETORAN") return { backgroundColor: "#dcfce7", color: "#15803d" };
  if (jenis === "PENARIKAN") return { backgroundColor: "#fee2e2", color: "#b91c1c" };
  return { backgroundColor: "#fef3c7", color: "#b45309" }; // KOREKSI
};

const getIconBg = (jenis: string) => {
  if (jenis === "SETORAN") return "#dcfce7";
  if (jenis === "PENARIKAN") return "#fee2e2";
  return "#fef3c7";
};

const getJenisIcon = (jenis: string) => {
  if (jenis === "SETORAN") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
      </svg>
    );
  }
  if (jenis === "PENARIKAN") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
};

export default async function DetailSimpananPage({
  params,
}: {
  params: { id: string };
}) {
  const currentUser = await requireRole([
    "SUPERADMIN", "SEKRETARIS", "BENDAHARA", "KETUA", "ANGGOTA"
  ]);

  // PROTEKSI PRIVASI: Cegah Anggota mengintip ID orang lain
  if (currentUser.role === "ANGGOTA" && currentUser.id !== params.id) {
    redirect("/dashboard/simpanan");
  }

  const { data, error } = await getSaldoByUserId(params.id);
  const { data: riwayat } = await getRiwayatSimpanan(params.id, 50);

  if (error || !data) {
    redirect("/dashboard/simpanan");
  }

  const { saldo, user } = data;
  
  // Tentukan hak akses UI tambahan
  const canInput = ["SUPERADMIN", "BENDAHARA"].includes(currentUser.role);
  const isOwner = currentUser.id === params.id;

  // Hitung total setoran & penarikan
  const totalSetoran = (riwayat || [])
    .filter((r: any) => r.jenis === "SETORAN")
    .reduce((sum: number, r: any) => sum + Number(r.nominal), 0);

  const totalPenarikan = (riwayat || [])
    .filter((r: any) => r.jenis === "PENARIKAN")
    .reduce((sum: number, r: any) => sum + Number(r.nominal), 0);

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
          height: 220px;
          border-bottom-left-radius: 24px;
          border-bottom-right-radius: 24px;
        }

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
          margin-bottom: 20px;
          overflow: hidden;
        }

        .list-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
          transition: background-color 0.2s ease;
        }

        .list-row:hover {
          background-color: #f8fafc;
        }

        .list-row:last-child {
          border-bottom: none;
        }

        .fintech-btn-outline {
          flex: 1;
          background: #fff;
          border: 1px solid #e2e8f0;
          color: #334155;
          font-weight: 600;
          padding: 14px;
          border-radius: 12px;
          text-align: center;
          text-decoration: none;
          font-size: 14px;
          transition: all 0.2s ease;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
        }

        .fintech-btn-outline:hover {
          background: #f8fafc;
        }

        .fintech-btn-primary {
          flex: 1;
          background: #2563eb;
          border: none;
          color: #fff;
          font-weight: 600;
          padding: 14px;
          border-radius: 12px;
          text-align: center;
          text-decoration: none;
          font-size: 14px;
          transition: all 0.2s ease;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
        }

        .fintech-btn-primary:hover {
          background: #1d4ed8;
        }
      `}} />

      {/* --- Header Area --- */}
      <header className="fintech-header">
        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            
            {/* Bagian Kiri: Navigasi */}
            <div>
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
            </div>

            {/* Bagian Kanan: Tombol Aksi Utama (Hanya terlihat oleh Admin/Bendahara) */}
            {canInput && (
              <Link
                href={`/dashboard/simpanan/input?user_id=${params.id}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#fff",
                  color: "#1a4db3",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: "600",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Input Setoran
              </Link>
            )}

          </div>

          {/* Judul */}
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
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            {isOwner ? "Riwayat Simpanan Saya" : "Detail Simpanan Anggota"}
          </h1>

        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main style={{ maxWidth: "800px", margin: "-60px auto 0 auto", padding: "0 20px", position: "relative", zIndex: 20 }}>

        {/* Profile + Saldo Card */}
        <div className="card-fintech">
          
          {/* Header Profile Info */}
          <div style={{ padding: "24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#eff6ff", color: "#1e40af", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "700", border: "2px solid #dbeafe", flexShrink: 0 }}>
              {user?.nama?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ margin: "0 0 4px 0", fontSize: "18px", color: "#0f2d6b", fontWeight: "700" }}>{user?.nama}</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
                <p style={{ margin: 0, color: "#64748b", fontSize: "13px", fontFamily: "monospace" }}>NIK: {user?.nik}</p>
                <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#cbd5e1" }}></span>
                
                {/* INI BAGIAN YANG DIPERBAIKI (Membaca Wajib & Sukarela) */}
                <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                  Wajib: Rp {Number(user?.simpanan_wajib_bulanan || 0).toLocaleString("id-ID")}
                </p>
                <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#cbd5e1" }}></span>
                <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                  Sukarela: Rp {Number(user?.simpanan_sukarela_bulanan || 0).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>

          {/* Saldo Utama */}
          <div style={{ padding: "24px", borderBottom: "1px solid #f1f5f9", background: "#fafafa" }}>
            <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg>
              Total Saldo Keseluruhan
            </p>
            <p style={{ margin: 0, fontSize: "36px", color: "#16a34a", fontWeight: "800", letterSpacing: "-0.5px" }}>
              Rp {Number(saldo?.total_saldo || 0).toLocaleString("id-ID")}
            </p>
            {saldo?.last_updated && (
              <p style={{ margin: "6px 0 0 0", fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Terakhir update: {new Date(saldo.last_updated).toLocaleString("id-ID")}
              </p>
            )}
          </div>

          {/* Stats Setoran vs Penarikan */}
          <div style={{ display: "flex", backgroundColor: "#fff" }}>
            <div style={{ flex: 1, padding: "20px 24px", borderRight: "1px solid #f1f5f9" }}>
              <p style={{ margin: "0 0 6px 0", fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Total Setoran
              </p>
              <p style={{ margin: 0, fontSize: "18px", color: "#16a34a", fontWeight: "700" }}>
                Rp {totalSetoran.toLocaleString("id-ID")}
              </p>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#94a3b8" }}>
                {(riwayat || []).filter((r: any) => r.jenis === "SETORAN").length} transaksi
              </p>
            </div>
            <div style={{ flex: 1, padding: "20px 24px" }}>
              <p style={{ margin: "0 0 6px 0", fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Total Penarikan
              </p>
              <p style={{ margin: 0, fontSize: "18px", color: "#ef4444", fontWeight: "700" }}>
                Rp {totalPenarikan.toLocaleString("id-ID")}
              </p>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#94a3b8" }}>
                {(riwayat || []).filter((r: any) => r.jenis === "PENARIKAN").length} transaksi
              </p>
            </div>
          </div>
        </div>

        {/* Riwayat Mutasi */}
        <div className="card-fintech" style={{ padding: 0 }}>
          <div style={{ padding: "20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f2d6b", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              Riwayat Mutasi Simpanan
            </h3>
            <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "500", padding: "4px 10px", background: "#f8fafc", borderRadius: "12px" }}>
              {(riwayat || []).length} transaksi
            </span>
          </div>

          {!riwayat || riwayat.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center", color: "#94a3b8" }}>
              <svg style={{ margin: "0 auto 12px auto", display: "block", color: "#cbd5e1" }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 4v4"/><path d="M14 4v4"/><path d="M6 4v4"/><path d="M18 4v4"/>
              </svg>
              <div style={{ fontSize: "14px" }}>Belum ada riwayat transaksi</div>
            </div>
          ) : (
            <div>
              {riwayat.map((item: any) => (
                <div key={item.id} className="list-row">
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                    {/* Icon Status */}
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: getIconBg(item.jenis), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {getJenisIcon(item.jenis)}
                    </div>
                    
                    {/* Keterangan */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", ...getBadgeStyle(item.jenis) }}>
                          {jenisLabel[item.jenis] || item.jenis}
                        </span>
                        <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "500" }}>
                          {item.periode}
                        </span>
                      </div>
                      <p style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#334155", fontWeight: "500" }}>
                        {item.keterangan || "Tanpa Keterangan"}
                      </p>
                      <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>
                        {new Date(item.tanggal).toLocaleDateString("id-ID", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Nominal & Status */}
                  <div style={{ textAlign: "right" }}>
                    <p style={{ 
                      margin: "0 0 4px 0", 
                      fontSize: "15px", 
                      fontWeight: "700",
                      color: item.jenis === "SETORAN" ? "#16a34a" : item.jenis === "PENARIKAN" ? "#ef4444" : "#d97706"
                    }}>
                      {item.jenis === "SETORAN" ? "+" : "-"}Rp {Number(item.nominal).toLocaleString("id-ID")}
                    </p>
                    <p style={{ 
                      margin: 0, 
                      fontSize: "11px", 
                      fontWeight: "600",
                      textTransform: "uppercase",
                      color: item.status === "APPROVED" ? "#22c55e" : item.status === "PENDING" ? "#f59e0b" : "#ef4444"
                    }}>
                      {item.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tombol Aksi Bawah */}
        <div style={{ display: "flex", gap: "12px" }}>
          <Link href="/dashboard/simpanan" className="fintech-btn-outline">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Kembali
          </Link>
          <Link 
            href={isOwner ? "/dashboard/profil" : `/dashboard/anggota/${params.id}`} 
            className="fintech-btn-primary"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            {isOwner ? "Lihat Profil Saya" : "Lihat Profil Anggota"}
          </Link>
        </div>

      </main>
    </div>
  );
}
