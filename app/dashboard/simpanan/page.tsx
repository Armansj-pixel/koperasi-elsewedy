import React from "react";
import { requireRole } from "@/lib/auth/session";
import { getAllSaldoSimpanan, getSaldoByUserId } from "@/lib/simpanan/actions";
import Link from "next/link";
import { redirect } from "next/navigation";

// Komponen Pembungkus State (Wajib di-render agar sinkronisasi localStorage ke URL bekerja)
import { MemberModeSync } from "./MemberModeSync";

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

  .kop-btn-header {
    display: inline-flex; align-items: center; gap: 8px;
    background: #fff; color: #1a4db3; padding: 10px 16px; border-radius: 14px;
    text-decoration: none; font-size: 13px; font-weight: 700;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: all 0.2s ease; border: none;
  }
  .kop-btn-header:hover { opacity: 0.9; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.15); }
  .kop-btn-header:active { transform: scale(0.96); }

  .kop-input {
    width: 100%; padding: 14px 16px 14px 44px; border-radius: 14px;
    border: 1px solid #e2e8f0; font-size: 14px; font-weight: 500;
    color: #0f172a; background: #fff; transition: all 0.2s ease;
    font-family: inherit;
  }
  .kop-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59,130,246,.15); }
  .kop-input::placeholder { color: #94a3b8; font-weight: 400; }

  /* Table Styles */
  .kop-table-wrap { overflow-x: auto; border-radius: 20px; }
  .kop-table { width: 100%; border-collapse: collapse; text-align: left; }
  .kop-table th { 
    padding: 16px; font-size: 13px; font-weight: 700; color: #64748b; 
    border-bottom: 2px solid #e2e8f0; background: #f8fafc; white-space: nowrap; 
    letter-spacing: .02em;
  }
  .kop-table td { padding: 16px; font-size: 14px; color: #1e293b; border-bottom: 1px solid #f1f5f9; font-weight: 600; }
  .kop-table tbody tr:hover { background-color: #f8fafc; }

  /* ── RESPONSIVE RULES ── */
  .kop-content-wrapper { padding: 0 16px 40px; margin-top: -70px; position: relative; z-index: 20; }
  .kop-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; }
  
  @media (max-width: 768px) {
    .kop-stats-grid { grid-template-columns: 1fr; gap: 12px; }
    .hide-on-mobile { display: none; }
    .kop-action-wrap { flex-direction: column; align-items: stretch; width: 100%; }
    .kop-btn-header { justify-content: center; }
  }

  @media (min-width: 768px) {
    .kop-header { padding: 40px 32px 100px; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; }
    .kop-content-wrapper { padding: 0 32px 40px; margin-top: -70px; }
  }
`;

export default async function SimpananPage({
  searchParams,
}: {
  searchParams: { search?: string; msg?: string; error?: string; view?: string };
}) {
  // 1. Validasi Sesi
  const currentUser = await requireRole([
    "SUPERADMIN",
    "SEKRETARIS",
    "BENDAHARA",
    "KETUA",
    "ANGGOTA",
  ]);

  const search = searchParams?.search || "";
  const viewParam = searchParams?.view; // Parameter penentu UI dari Client
  
  // 2. Evaluasi Role
  const roleIsPengurus = ["SUPERADMIN", "SEKRETARIS", "BENDAHARA", "KETUA"].includes(currentUser.role);
  const canInput = ["SUPERADMIN", "BENDAHARA"].includes(currentUser.role);
  
  // Jika pengurus BUKAN di mode view personal, render mode Admin. Jika tidak, mode Member.
  const isPengurusView = roleIsPengurus && viewParam !== "personal";

  let anggotaList = [];
  let totalSaldo = 0;
  let dataSimpananPribadi = null;

  // 3. Tarik Data Sesuai View
  if (isPengurusView) {
    const { data } = await getAllSaldoSimpanan(search);
    anggotaList = data || [];
    totalSaldo = anggotaList.reduce((sum: number, a: any) => {
      return sum + Number(a.saldo_simpanan?.[0]?.total_saldo || 0);
    }, 0);
  } else {
    // Mode Anggota Biasa (atau Pengurus yang menyamar jadi anggota)
    const { data } = await getSaldoByUserId(currentUser.id);
    dataSimpananPribadi = data;
  }

  return (
    <main className="kop-shell bg-slate-100 min-h-screen">
      {/* Komponen ini berjalan diam-diam di client untuk membaca localStorage
        dan menambahkan ?view=personal ke URL jika isMemberMode true.
      */}
      <MemberModeSync currentView={viewParam} isPengurus={roleIsPengurus} />

      {/* CSS Injection */}
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div className="w-full max-w-5xl mx-auto bg-slate-100 min-h-screen relative sm:shadow-xl sm:border-x sm:border-slate-200">
        
        {/* --- Header Area --- */}
        <header className="kop-header">
          <div className="kop-orb" style={{ width: 280, height: 280, top: -100, right: -100, background: 'radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 70%)' }} />
          <div className="kop-orb" style={{ width: 200, height: 200, bottom: -40, left: -40, background: 'radial-gradient(circle, rgba(96,165,250,.2) 0%, transparent 70%)' }} />
          
          <div style={{ position: "relative", zIndex: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
              
              {/* Bagian Kiri: Navigasi & Judul */}
              <div>
                <Link href="/dashboard" className="kop-btn-nav" style={{ marginBottom: "16px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Dashboard Utama
                </Link>

                <h1 style={{ color: "#fff", margin: 0, fontSize: "26px", fontWeight: "800", letterSpacing: "-.02em", display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ background: "rgba(255,255,255,0.2)", padding: "8px", borderRadius: "12px", display: "flex" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                      <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                      <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
                    </svg>
                  </div>
                  {isPengurusView ? "Modul Simpanan Koperasi" : "Buku Tabungan Koperasi"}
                </h1>
              </div>

              {/* Bagian Kanan: Tombol Aksi */}
              <div className="kop-action-wrap" style={{ display: "flex", gap: "10px", marginTop: "8px", flexWrap: "wrap" }}>
                
                {/* TOMBOL PENGURUS */}
                {isPengurusView && (
                  <>
                    {canInput && (
                      <Link href="/dashboard/simpanan/input" className="kop-btn-header" style={{ color: "#059669" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Input Setoran
                      </Link>
                    )}
                    <Link href="/dashboard/simpanan/penarikan" className="kop-btn-header" style={{ color: "#d97706" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                      Antrean Penarikan
                    </Link>
                    <Link href="/dashboard/simpanan/rekap" className="kop-btn-header" style={{ color: "#7e22ce" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                      Rekap Laporan
                    </Link>
                  </>
                )}
                
                {/* TOMBOL ANGGOTA (TERMASUK PENGURUS YANG NYAMAR) */}
                {!isPengurusView && (
                  <Link href="/dashboard/simpanan/pengajuan-penarikan?view=personal" className="kop-btn-header" style={{ color: "#d97706" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Ajukan Penarikan
                  </Link>
                )}
              </div>

            </div>
          </div>
        </header>

        {/* --- Main Content Area --- */}
        <div className="kop-content-wrapper">
          
          {/* Flash Messages */}
          {searchParams?.msg && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", padding: "14px 16px", borderRadius: "14px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: "700" }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>{searchParams.msg}</span>
            </div>
          )}
          {searchParams?.error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "14px 16px", borderRadius: "14px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: "700" }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>{searchParams.error}</span>
            </div>
          )}

          {/* ========================================= */}
          {/* VIEW UNTUK PENGURUS (SUPERADMIN/BENDAHARA) */}
          {/* ========================================= */}
          {isPengurusView ? (
            <>
              {/* Statistik Rekap */}
              <div className="kop-stats-grid">
                <div className="kop-card" style={{ padding: "20px", margin: 0, textAlign: "center" }}>
                  <div style={{ fontSize: "28px", fontWeight: "900", color: "#1d4ed8", lineHeight: 1 }}>{anggotaList.length}</div>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "8px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Anggota</div>
                </div>
                <div className="kop-card" style={{ padding: "20px", margin: 0, textAlign: "center" }}>
                  <div style={{ fontSize: "28px", fontWeight: "900", color: "#059669", lineHeight: 1 }}>Rp {(totalSaldo / 1000000).toFixed(1)}<span style={{ fontSize: 16 }}>M</span></div>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "8px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Aset Simpanan</div>
                </div>
                <div className="kop-card" style={{ padding: "20px", margin: 0, textAlign: "center" }}>
                  <div style={{ fontSize: "28px", fontWeight: "900", color: "#7e22ce", lineHeight: 1 }}>
                    Rp {anggotaList.length > 0 ? (totalSaldo / anggotaList.length / 1000000).toFixed(1) : 0}<span style={{ fontSize: 16 }}>M</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "8px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>Rata-rata Saldo</div>
                </div>
              </div>

              {/* Banner Input Massal */}
              {canInput && (
                <div className="kop-card" style={{ 
                  background: "linear-gradient(135deg, #2563eb, #3b82f6)", border: "none", 
                  padding: "24px", color: "#fff", display: "flex", alignItems: "center", 
                  justifyContent: "space-between", flexWrap: "wrap", gap: "20px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ background: "rgba(255,255,255,0.2)", padding: "14px", borderRadius: "16px", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </div>
                    <div>
                      <div style={{ fontWeight: "800", fontSize: "18px", marginBottom: "4px", letterSpacing: "-.01em" }}>Setoran Bulanan Massal</div>
                      <div style={{ fontSize: "13px", fontWeight: "500", opacity: 0.9 }}>Eksekusi input potongan simpanan ke semua anggota.</div>
                    </div>
                  </div>
                  <Link href="/dashboard/simpanan/setoran-massal" className="kop-btn-header" style={{ color: "#1d4ed8", padding: "12px 24px", fontSize: "14px" }}>
                    Proses Sekarang →
                  </Link>
                </div>
              )}

              {/* Tabel Data Anggota */}
              <div className="kop-card" style={{ padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>Daftar Rekening Anggota</h2>
                  
                  <form method="GET" style={{ position: "relative", minWidth: "280px" }}>
                    <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", display: "flex" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </div>
                    <input type="text" name="search" defaultValue={search} placeholder="Cari NIK atau Nama..." className="kop-input" />
                  </form>
                </div>

                <div className="kop-table-wrap">
                  <table className="kop-table">
                    <thead>
                      <tr>
                        <th>NIK</th>
                        <th>Nama Anggota</th>
                        <th className="hide-on-mobile" style={{ textAlign: "right" }}>Potongan Wajib/Bln</th>
                        <th style={{ textAlign: "right" }}>Total Saldo</th>
                        <th style={{ textAlign: "center" }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {anggotaList.map((anggota: any) => {
                        const saldo = Number(anggota.saldo_simpanan?.[0]?.total_saldo || 0);
                        const wajib = Number(anggota.simpanan_wajib_bulanan || anggota.simpanan_bulanan || 0);
                        return (
                          <tr key={anggota.id}>
                            <td style={{ fontFamily: "monospace", color: "#64748b", letterSpacing: ".05em" }}>{anggota.nik}</td>
                            <td style={{ color: "#0f2d6b" }}>{anggota.nama}</td>
                            <td className="hide-on-mobile" style={{ textAlign: "right", color: "#64748b" }}>Rp {wajib.toLocaleString("id-ID")}</td>
                            <td style={{ textAlign: "right", fontWeight: "800", color: "#059669" }}>Rp {saldo.toLocaleString("id-ID")}</td>
                            <td style={{ textAlign: "center" }}>
                              <Link href={`/dashboard/simpanan/${anggota.id}`} style={{ background: "#f1f5f9", color: "#1d4ed8", padding: "8px 16px", borderRadius: "12px", textDecoration: "none", fontSize: "12px", fontWeight: "700", transition: "background 0.2s" }}>
                                Buka
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  {anggotaList.length === 0 && (
                    <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
                      <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 12px", opacity: 0.5 }} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      <p style={{ margin: 0, fontWeight: 600 }}>Tidak ada data anggota ditemukan.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* ========================================= */
            /* VIEW UNTUK ANGGOTA / PENGURUS NYAMAR      */
            /* ========================================= */
            <div className="kop-card" style={{ padding: "40px 24px", textAlign: "center", maxWidth: "480px", margin: "0 auto" }}>
              <div style={{ width: "72px", height: "72px", background: "linear-gradient(145deg, #dcfce7, #f0fdf4)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px auto", color: "#15803d", border: "2px solid #bbf7d0" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h0M2 9.5h20"/>
                </svg>
              </div>
              
              <h2 style={{ fontSize: "13px", color: "#64748b", textTransform: "uppercase", letterSpacing: ".1em", margin: "0 0 8px", fontWeight: "800" }}>
                Saldo Dapat Ditarik (Sukarela)
              </h2>
              
              <div style={{ fontSize: "42px", fontWeight: "900", color: "#059669", letterSpacing: "-.02em", marginBottom: "20px" }}>
                Rp {Number(dataSimpananPribadi?.saldo?.saldo_sukarela || 0).toLocaleString("id-ID")}
              </div>

              <div style={{ display: "inline-flex", flexDirection: "column", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "12px 20px", borderRadius: "16px", marginBottom: "32px", width: "100%", maxWidth: "320px", textAlign: "left" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                  <span style={{ color: "#64748b", fontWeight: 600 }}>Simpanan Pokok:</span>
                  <span style={{ color: "#1e293b", fontWeight: 800 }}>Rp {Number(dataSimpananPribadi?.saldo?.saldo_pokok || 0).toLocaleString("id-ID")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "#64748b", fontWeight: 600 }}>Simpanan Wajib:</span>
                  <span style={{ color: "#1e293b", fontWeight: 800 }}>Rp {Number(dataSimpananPribadi?.saldo?.saldo_wajib || 0).toLocaleString("id-ID")}</span>
                </div>
              </div>

              <p style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.6", margin: "0 0 24px", fontWeight: 500 }}>
                Dana simpanan Anda dikelola secara aman. Saldo sukarela dapat diajukan penarikannya sewaktu-waktu sesuai dengan ketentuan Koperasi.
              </p>

              <Link 
                href="/dashboard/simpanan/pengajuan-penarikan?view=personal"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "16px", background: "linear-gradient(135deg, #1d4ed8, #1e40af)", 
                  color: "#fff", borderRadius: "14px", textDecoration: "none", 
                  fontWeight: "700", fontSize: "15px", boxShadow: "0 8px 20px rgba(29,78,216,0.2)",
                  transition: "transform 0.15s", marginBottom: "12px"
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Ajukan Penarikan Dana
              </Link>
              
              <Link 
                href={`/dashboard/simpanan/${currentUser.id}?view=personal`}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "16px", background: "#f8fafc", 
                  color: "#0f172a", border: "1.5px solid #e2e8f0", borderRadius: "14px", textDecoration: "none", 
                  fontWeight: "700", fontSize: "14px", transition: "background 0.2s"
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                Lihat Detail & Riwayat
              </Link>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
