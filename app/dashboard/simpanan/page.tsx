import React from "react";
// import { requireRole } from "@/lib/auth/session";
// import { getAllSaldoSimpanan } from "@/lib/simpanan/actions";
import Link from "next/link";

// Mock data untuk keperluan demonstrasi agar bisa dirender
const mockAnggotaList = [
  { id: 1, nik: "045261", nama: "Armadio", simpanan_bulanan: 100000, saldo_simpanan: [{ total_saldo: 0 }] },
  { id: 2, nik: "045262", nama: "Budi", simpanan_bulanan: 150000, saldo_simpanan: [{ total_saldo: 500000 }] },
  { id: 3, nik: "045263", nama: "Citra", simpanan_bulanan: 200000, saldo_simpanan: [{ total_saldo: 250000 }] },
];

export default async function SimpananPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  // --- MOCK AUTH & DATA UNTUK DEMONSTRASI ---
  // Hapus/komen bagian ini dan gunakan kode asli Anda
  const currentUser = { role: "SUPERADMIN" };
  const search = searchParams?.search || "";
  const anggotaList = mockAnggotaList;

  // --- KODE ASLI ANDA ---
  // const currentUser = await requireRole([
  //   "SUPERADMIN",
  //   "SEKRETARIS",
  //   "BENDAHARA",
  //   "KETUA",
  // ]);
  // const search = searchParams.search || "";
  // const { data: anggotaList } = await getAllSaldoSimpanan(search);

  // Hitung total
  const totalSaldo = anggotaList.reduce((sum: number, a: any) => {
    return sum + Number(a.saldo_simpanan?.[0]?.total_saldo || 0);
  }, 0);

  const canInput = ["SUPERADMIN", "BENDAHARA"].includes(currentUser.role);

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
          padding: 32px 20px 80px 20px; /* Padding bottom diperbesar untuk efek tumpang tindih */
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
          box-shadow: 0 4px 16px rgba(15,45,107,.04);
          padding: 24px;
        }

        .fintech-input {
          width: 100%;
          padding: 14px 16px 14px 44px;
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

        .fintech-btn-header {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          color: #1a4db3;
          padding: 10px 16px;
          border-radius: 20px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: opacity 0.2s ease, transform 0.1s ease;
        }

        .fintech-btn-header:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        /* Table Styles */
        .fintech-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .fintech-table th {
          padding: 16px;
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
          background-color: #f8fafc;
          white-space: nowrap;
        }

        .fintech-table td {
          padding: 16px;
          font-size: 14px;
          color: #1e293b;
          border-bottom: 1px solid #f1f5f9;
        }

        .fintech-table tr:last-child td {
          border-bottom: none;
        }

        .fintech-table tbody tr:hover {
          background-color: #f8fafc;
        }

        /* Responsive Grid Helper */
        /* PERBAIKAN: Gunakan 3 kolom di desktop, 1 kolom di mobile agar lebih rapi */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr); 
          gap: 16px;
          margin-bottom: 24px;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr; /* Satu kolom di layar kecil */
          }
          .hide-on-mobile {
            display: none;
          }
          .fintech-header {
            padding-bottom: 60px; /* Sedikit penyesuaian untuk mobile */
          }
          .header-actions {
             flex-direction: column;
             align-items: stretch;
             width: 100%;
          }
          .fintech-btn-header {
             justify-content: center;
          }
        }
      `}} />

      {/* --- Header Area --- */}
      <header className="fintech-header">
        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
            
            {/* Bagian Kiri: Navigasi & Judul */}
            <div>
              {/* Tombol Back */}
              <Link 
                href="/dashboard"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(255, 255, 255, 0.15)",
                  color: "#fff",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: "500",
                  backdropFilter: "blur(4px)",
                  marginBottom: "16px",
                  transition: "background 0.2s"
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Dashboard
              </Link>

              <h1 style={{ 
                color: "#fff", 
                margin: 0, 
                fontSize: "26px", 
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                  <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                  <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
                </svg>
                Modul Simpanan
              </h1>
            </div>

            {/* Bagian Kanan: Tombol Aksi Utama */}
            {canInput && (
              <div className="header-actions" style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <Link href="/dashboard/simpanan/input" className="fintech-btn-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Input Setoran
                </Link>
                <Link href="/dashboard/simpanan/penarikan" className="fintech-btn-header" style={{ color: "#d97706" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                  </svg>
                  Penarikan
                </Link>
              </div>
            )}

          </div>
        </div>
      </header>

      {/* --- Main Content Area --- */}
      {/* Margin negatif diperbesar agar tumpang tindihnya pas */}
      <main style={{ maxWidth: "1200px", margin: "-45px auto 0 auto", padding: "0 20px", position: "relative", zIndex: 20 }}>
        
        {/* Stats Grid - PERBAIKAN: Menghapus gridColumn span 2, semuanya rata */}
        <div className="stats-grid">
          <div className="card-fintech" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: "700", color: "#2563eb", lineHeight: 1.2 }}>
              {anggotaList.length}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "6px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Total Anggota
            </div>
          </div>
          
          <div className="card-fintech" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: "700", color: "#16a34a", lineHeight: 1.2 }}>
              Rp {totalSaldo.toLocaleString("id-ID")}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "6px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Total Saldo Simpanan
            </div>
          </div>

          <div className="card-fintech" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: "700", color: "#9333ea", lineHeight: 1.2 }}>
              Rp{" "}
              {anggotaList.length > 0
                ? Math.round(totalSaldo / anggotaList.length).toLocaleString("id-ID")
                : 0}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "6px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Rata-rata/Anggota
            </div>
          </div>
        </div>

        {/* Setoran Massal Banner */}
        {canInput && (
          <div style={{
            background: "linear-gradient(to right, #2563eb, #4f46e5)",
            borderRadius: "16px",
            padding: "20px 24px",
            marginBottom: "24px",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ background: "rgba(255,255,255,0.2)", padding: "12px", borderRadius: "12px", backdropFilter: "blur(4px)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div>
                <div style={{ fontWeight: "700", fontSize: "18px", marginBottom: "4px" }}>
                  Setoran Bulanan Massal
                </div>
                <div style={{ fontSize: "13px", opacity: 0.9 }}>
                  Input setoran bulanan untuk semua anggota aktif sekaligus
                </div>
              </div>
            </div>
            <Link
              href="/dashboard/simpanan/setoran-massal"
              style={{
                background: "#fff",
                color: "#1d4ed8",
                padding: "10px 20px",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "14px",
                textDecoration: "none",
                transition: "opacity 0.2s ease, transform 0.1s ease",
                display: "inline-block",
                textAlign: "center"
              }}
            >
              Proses Sekarang →
            </Link>
          </div>
        )}

        {/* Search */}
        <form method="GET" style={{ marginBottom: "20px", position: "relative" }}>
          <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", display: "flex" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Cari NIK atau nama anggota..."
            className="fintech-input"
            style={{ boxShadow: "0 2px 12px rgba(15,45,107,.04)" }}
          />
        </form>

        {/* Table Data */}
        <div className="card-fintech" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="fintech-table">
              <thead>
                <tr>
                  <th>NIK</th>
                  <th>Nama Anggota</th>
                  <th className="hide-on-mobile" style={{ textAlign: "right" }}>Setoran/Bulan</th>
                  <th style={{ textAlign: "right" }}>Total Saldo</th>
                  <th style={{ textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {anggotaList.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "48px 20px", color: "#94a3b8" }}>
                      <svg style={{ margin: "0 auto 12px auto", display: "block", color: "#cbd5e1" }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                        <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                        <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
                      </svg>
                      <div>Tidak ada data simpanan</div>
                    </td>
                  </tr>
                ) : (
                  anggotaList.map((anggota: any) => {
                    const saldo = Number(
                      anggota.saldo_simpanan?.[0]?.total_saldo || 0
                    );
                    return (
                      <tr key={anggota.id} style={{ transition: "background-color 0.2s" }}>
                        <td style={{ fontFamily: "monospace", color: "#64748b" }}>
                          {anggota.nik}
                        </td>
                        <td style={{ fontWeight: "600", color: "#0f2d6b" }}>
                          {anggota.nama}
                        </td>
                        <td className="hide-on-mobile" style={{ textAlign: "right", color: "#64748b" }}>
                          Rp {Number(anggota.simpanan_bulanan).toLocaleString("id-ID")}
                        </td>
                        <td style={{ textAlign: "right", fontWeight: "700", color: "#16a34a" }}>
                          Rp {saldo.toLocaleString("id-ID")}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <Link
                            href={`/dashboard/simpanan/${anggota.id}`}
                            style={{
                              background: "#eff6ff",
                              color: "#2563eb",
                              padding: "6px 16px",
                              borderRadius: "20px",
                              textDecoration: "none",
                              fontSize: "12px",
                              fontWeight: "600",
                              display: "inline-block",
                              transition: "background 0.2s"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = "#dbeafe"}
                            onMouseOut={(e) => e.currentTarget.style.background = "#eff6ff"}
                          >
                            Detail
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
