import React from "react";
import { requireRole } from "@/lib/auth/session";
import { getAllSaldoSimpanan, getSaldoByUserId } from "@/lib/simpanan/actions";
import Link from "next/link";

export default async function SimpananPage({
  searchParams,
}: {
  searchParams: { search?: string; msg?: string; error?: string };
}) {
  // 1. Izinkan akses untuk semua role terkait
  const currentUser = await requireRole([
    "SUPERADMIN",
    "SEKRETARIS",
    "BENDAHARA",
    "KETUA",
    "ANGGOTA",
  ]);

  const search = searchParams?.search || "";
  
  // 2. Pisahkan logika tampilan berdasarkan role
  const isPengurus = ["SUPERADMIN", "SEKRETARIS", "BENDAHARA", "KETUA"].includes(currentUser.role);
  const canInput = ["SUPERADMIN", "BENDAHARA"].includes(currentUser.role);

  let anggotaList = [];
  let totalSaldo = 0;
  let dataSimpananPribadi = null;

  // 3. Panggil fungsi database berdasarkan role
  if (isPengurus) {
    const { data } = await getAllSaldoSimpanan(search);
    anggotaList = data || [];
    totalSaldo = anggotaList.reduce((sum: number, a: any) => {
      return sum + Number(a.saldo_simpanan?.[0]?.total_saldo || 0);
    }, 0);
  } else {
    const { data } = await getSaldoByUserId(currentUser.id);
    dataSimpananPribadi = data;
  }

  return (
    <div style={{ backgroundColor: "#f1f5f9", minHeight: "100vh", paddingBottom: "40px" }}>
      {/* --- Global & Design System Styles --- */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * { box-sizing: border-box; font-family: 'Inter', sans-serif; }

        .fintech-header {
          position: relative; background: linear-gradient(145deg, #0f2d6b 0%, #1a4db3 60%, #2563eb 100%);
          overflow: hidden; padding: 32px 20px 80px 20px;
          border-bottom-left-radius: 24px; border-bottom-right-radius: 24px;
        }

        .fintech-header::before, .fintech-header::after {
          content: ''; position: absolute; pointer-events: none; border-radius: 50%;
        }
        .fintech-header::before { top: -40px; left: -40px; width: 150px; height: 150px; background: rgba(255, 255, 255, 0.08); }
        .fintech-header::after { bottom: -20px; right: -60px; width: 200px; height: 200px; background: rgba(255, 255, 255, 0.05); }

        .card-fintech {
          background: #fff; border-radius: 16px; border: 1px solid #e2e8f0;
          box-shadow: 0 4px 16px rgba(15,45,107,.04); padding: 24px;
        }

        .fintech-input {
          width: 100%; padding: 14px 16px 14px 44px; border-radius: 12px;
          border: 1px solid #e2e8f0; font-size: 14px; transition: all 0.2s ease;
          background-color: #fff; color: #1e293b;
        }
        .fintech-input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.12); }

        .fintech-btn-header {
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff; color: #1a4db3; padding: 10px 16px; border-radius: 20px;
          text-decoration: none; font-size: 13px; font-weight: 600;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: all 0.2s ease;
        }
        .fintech-btn-header:hover { opacity: 0.9; transform: translateY(-1px); }

        .fintech-table { width: 100%; border-collapse: collapse; text-align: left; }
        .fintech-table th { padding: 16px; font-size: 13px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0; background-color: #f8fafc; white-space: nowrap; }
        .fintech-table td { padding: 16px; font-size: 14px; color: #1e293b; border-bottom: 1px solid #f1f5f9; }
        .fintech-table tbody tr:hover { background-color: #f8fafc; }

        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }

        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr; }
          .hide-on-mobile { display: none; }
          .header-actions { flex-direction: column; align-items: stretch; width: 100%; }
          .fintech-btn-header { justify-content: center; }
        }
      `}} />

      {/* --- Header Area --- */}
      <header className="fintech-header">
        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
            
            {/* Bagian Kiri: Navigasi & Judul */}
            <div>
              <Link 
                href="/dashboard"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  background: "rgba(255, 255, 255, 0.15)", color: "#fff",
                  padding: "6px 14px", borderRadius: "20px", textDecoration: "none",
                  fontSize: "13px", fontWeight: "500", backdropFilter: "blur(4px)",
                  marginBottom: "16px", transition: "background 0.2s"
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Dashboard
              </Link>

              <h1 style={{ color: "#fff", margin: 0, fontSize: "26px", fontWeight: "700", display: "flex", alignItems: "center", gap: "10px" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" /><path d="M4 6v12c0 1.1.9 2 2 2h14v-4" /><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
                </svg>
                {isPengurus ? "Modul Simpanan" : "Simpanan Saya"}
              </h1>
            </div>

            {/* Bagian Kanan: Tombol Aksi - DIPERBARUI */}
            <div className="header-actions" style={{ display: "flex", gap: "10px", marginTop: "8px", flexWrap: "wrap" }}>
              
              {/* TOMBOL KHUSUS PENGURUS */}
              {isPengurus && (
                <>
                  {canInput && (
                    <Link href="/dashboard/simpanan/input" className="fintech-btn-header">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Input Setoran
                    </Link>
                  )}
                  {/* Tombol Menuju Persetujuan Penarikan */}
                  <Link href="/dashboard/simpanan/penarikan" className="fintech-btn-header" style={{ color: "#d97706" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    Persetujuan
                  </Link>
                  {/* Tombol Menuju Rekap Pencairan */}
                  <Link href="/dashboard/simpanan/rekap" className="fintech-btn-header" style={{ color: "#9333ea" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                    Rekap Pencairan
                  </Link>
                </>
              )}
              
              {/* TOMBOL KHUSUS ANGGOTA */}
              {!isPengurus && (
                <Link href="/dashboard/simpanan/pengajuan-penarikan" className="fintech-btn-header" style={{ color: "#d97706" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  Ajukan Penarikan
                </Link>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main style={{ maxWidth: "1200px", margin: "-45px auto 0 auto", padding: "0 20px", position: "relative", zIndex: 20 }}>
        
        {/* ========================================= */}
        {/* NOTIFIKASI SUKSES / ERROR (FLASH MESSAGES) */}
        {/* ========================================= */}
        {searchParams?.msg && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", padding: "14px 16px", borderRadius: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "600", boxShadow: "0 2px 8px rgba(21,128,61,0.1)" }}>
            <span>✅ {searchParams.msg}</span>
          </div>
        )}
        {searchParams?.error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "14px 16px", borderRadius: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "600", boxShadow: "0 2px 8px rgba(185,28,28,0.1)" }}>
            <span>❌ {searchParams.error}</span>
          </div>
        )}

        {/* ========================================= */}
        {/* VIEW UNTUK PENGURUS (SUPERADMIN/BENDAHARA) */}
        {/* ========================================= */}
        {isPengurus ? (
          <>
            <div className="stats-grid">
              <div className="card-fintech" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: "700", color: "#2563eb", lineHeight: 1.2 }}>{anggotaList.length}</div>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "6px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Anggota</div>
              </div>
              <div className="card-fintech" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: "700", color: "#16a34a", lineHeight: 1.2 }}>Rp {totalSaldo.toLocaleString("id-ID")}</div>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "6px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Saldo Keseluruhan</div>
              </div>
              <div className="card-fintech" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: "700", color: "#9333ea", lineHeight: 1.2 }}>
                  Rp {anggotaList.length > 0 ? Math.round(totalSaldo / anggotaList.length).toLocaleString("id-ID") : 0}
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "6px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Rata-rata/Anggota</div>
              </div>
            </div>

            {canInput && (
              <div style={{
                background: "linear-gradient(to right, #2563eb, #4f46e5)", borderRadius: "16px", padding: "20px 24px",
                marginBottom: "24px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between",
                flexWrap: "wrap", gap: "16px", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ background: "rgba(255,255,255,0.2)", padding: "12px", borderRadius: "12px", backdropFilter: "blur(4px)" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "18px", marginBottom: "4px" }}>Setoran Bulanan Massal</div>
                    <div style={{ fontSize: "13px", opacity: 0.9 }}>Input setoran bulanan untuk semua anggota aktif sekaligus</div>
                  </div>
                </div>
                <Link href="/dashboard/simpanan/setoran-massal" style={{ background: "#fff", color: "#1d4ed8", padding: "10px 20px", borderRadius: "8px", fontWeight: "600", fontSize: "14px", textDecoration: "none", display: "inline-block" }}>
                  Proses Sekarang →
                </Link>
              </div>
            )}

            <form method="GET" style={{ marginBottom: "20px", position: "relative" }}>
              <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", display: "flex" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <input type="text" name="search" defaultValue={search} placeholder="Cari NIK atau nama anggota..." className="fintech-input" />
            </form>

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
                    {anggotaList.map((anggota: any) => {
                      const saldo = Number(anggota.saldo_simpanan?.[0]?.total_saldo || 0);
                      return (
                        <tr key={anggota.id}>
                          <td style={{ fontFamily: "monospace", color: "#64748b" }}>{anggota.nik}</td>
                          <td style={{ fontWeight: "600", color: "#0f2d6b" }}>{anggota.nama}</td>
                          <td className="hide-on-mobile" style={{ textAlign: "right", color: "#64748b" }}>Rp {Number(anggota.simpanan_bulanan || 0).toLocaleString("id-ID")}</td>
                          <td style={{ textAlign: "right", fontWeight: "700", color: "#16a34a" }}>Rp {saldo.toLocaleString("id-ID")}</td>
                          <td style={{ textAlign: "center" }}>
                            <Link href={`/dashboard/simpanan/${anggota.id}`} style={{ background: "#eff6ff", color: "#2563eb", padding: "6px 16px", borderRadius: "20px", textDecoration: "none", fontSize: "12px", fontWeight: "600" }}>Detail</Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* ========================================= */
          /* VIEW UNTUK ANGGOTA BIASA (Dengan Keranjang Terpisah) */
          /* ========================================= */
          <div className="card-fintech" style={{ padding: "32px", textAlign: "center", maxWidth: "500px", margin: "0 auto" }}>
            <div style={{ width: "64px", height: "64px", background: "#eff6ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto", color: "#2563eb" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h0M2 9.5h20"/>
              </svg>
            </div>
            
            <h2 style={{ fontSize: "14px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", fontWeight: "600" }}>
              Saldo Bisa Ditarik (Sukarela)
            </h2>
            
            <div style={{ fontSize: "36px", fontWeight: "800", color: "#16a34a", marginBottom: "16px" }}>
              Rp {Number(dataSimpananPribadi?.saldo?.saldo_sukarela || 0).toLocaleString("id-ID")}
            </div>

            <div style={{ display: "inline-block", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "8px 16px", borderRadius: "12px", fontSize: "12px", color: "#64748b", marginBottom: "24px" }}>
              <span style={{ fontWeight: "600" }}>Saldo Mengendap (Pokok & Wajib):</span> Rp {Number((dataSimpananPribadi?.saldo?.saldo_pokok || 0) + (dataSimpananPribadi?.saldo?.saldo_wajib || 0)).toLocaleString("id-ID")}
            </div>

            <hr style={{ border: "none", borderTop: "1px dashed #e2e8f0", margin: "0 0 24px 0" }} />

            <p style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.6", marginBottom: "24px" }}>
              Simpanan Anda dikelola secara aman. Saldo sukarela dapat diajukan penarikannya sesuai dengan syarat dan ketentuan Koperasi.
            </p>

            <Link 
              href="/dashboard/simpanan/pengajuan-penarikan"
              style={{
                display: "block", width: "100%", padding: "14px", background: "#2563eb", 
                color: "#fff", borderRadius: "12px", textDecoration: "none", 
                fontWeight: "600", fontSize: "15px", boxShadow: "0 4px 12px rgba(37,99,235,0.2)",
                transition: "background 0.2s"
              }}
            >
              Ajukan Penarikan Simpanan
            </Link>
            
            <Link 
              href={`/dashboard/simpanan/${currentUser.id}`}
              style={{
                display: "block", width: "100%", padding: "14px", background: "#fff", 
                color: "#0f2d6b", border: "1px solid #e2e8f0", borderRadius: "12px", textDecoration: "none", 
                fontWeight: "600", fontSize: "14px", marginTop: "12px"
              }}
            >
              Lihat Riwayat Transaksi
            </Link>
          </div>
        )}

      </main>
    </div>
  );
}
