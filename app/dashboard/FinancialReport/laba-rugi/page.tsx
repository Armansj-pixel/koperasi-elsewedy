import React from "react";
import { requireRole } from "@/lib/auth/session";
import { getLaporanLabaRugi } from "@/lib/akuntansi/laporan";
import Link from "next/link";

const TAHUN_INI = new Date().getFullYear();

// PROTEKSI: Mencegah error format jika n adalah undefined/null
function formatRp(n: any) {
  if (typeof n !== 'number' || isNaN(n)) return "Rp 0";
  return "Rp " + Math.abs(n).toLocaleString("id-ID");
}

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; background: #f8fafc; }
  .lr-shell { font-family: 'Inter', sans-serif; }
  .lr-header { background: linear-gradient(150deg, #1e293b 0%, #0f172a 100%); padding: 30px 20px 90px; }
  .lr-btn-nav { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,.1); color: #fff; padding: 8px 14px; border-radius: 20px; text-decoration: none; font-size: 13px; font-weight: 600; border: 1px solid rgba(255,255,255,.2); }
  .lr-content { padding: 0 16px 40px; margin-top: -60px; position: relative; z-index: 20; }
  .lr-card { background: #fff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,.04); overflow: hidden; margin-bottom: 24px; }
  .lr-table { width: 100%; border-collapse: collapse; font-family: 'IBM Plex Mono', monospace; }
  .lr-table th { background: #f8fafc; padding: 12px 20px; text-align: left; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: .06em; border-bottom: 2px solid #e2e8f0; font-family: 'Inter', sans-serif; }
  .lr-table td { padding: 12px 20px; font-size: 13px; border-bottom: 1px solid #f8fafc; }
  .lr-table tr:last-child td { border-bottom: none; }
  .lr-section-header { background: #f8fafc; padding: 14px 20px; font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: .06em; border-bottom: 1px solid #e2e8f0; border-top: 1px solid #e2e8f0; }
  .lr-total-row td { font-weight: 800; border-top: 2px solid #e2e8f0 !important; border-bottom: 2px solid #e2e8f0 !important; background: #f8fafc; }
  .lr-shu-row td { font-weight: 900; font-size: 15px !important; border-top: 3px double #0f172a !important; background: #f0fdf4; }
  .lr-shu-row-neg td { background: #fff1f2 !important; }
  .btn-print { display: inline-flex; align-items: center; gap: 8px; background: #0f172a; color: #fff; border: none; padding: 10px 18px; border-radius: 12px; font-size: 13px; font-weight: 700; cursor: pointer; }

  @media print {
    .no-print { display: none !important; }
    body { background: #fff; }
    .lr-shell { background: #fff; }
    .lr-header { background: #0f172a !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .lr-content { margin-top: -60px; }
    .lr-card { box-shadow: none; border: 1px solid #e2e8f0; }
    @page { margin: 15mm; }
  }
  @media(min-width:768px) { .lr-header { padding: 40px 32px 90px; } .lr-content { padding: 0 32px 40px; } }
`;

export default async function LabaRugiPage({ searchParams }: any) {
  // 1. Validasi akses biarkan di luar
  await requireRole(["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS"]);

  // 2. Bungkus semua rendering dengan Try-Catch agar tidak ada error diam-diam
  try {
    const tahunParam = searchParams?.tahun;
    let tahun = parseInt(tahunParam ?? String(TAHUN_INI));
    if (isNaN(tahun)) tahun = TAHUN_INI;

    const startDate = searchParams?.start;
    const endDate = searchParams?.end;

    const { data: lr, error } = await getLaporanLabaRugi(tahun, startDate, endDate);

    if (error || !lr) {
      return <div style={{ padding: 40, color: "#e11d48", fontWeight: "bold" }}>Gagal memuat laporan: {error || "Data belum tersedia"}</div>;
    }

    // PROTEKSI UTAMA: Ubah undefined menjadi Array kosong [] agar .length dan .map tidak crash
    const pendapatanItems = lr?.pendapatan || [];
    const bebanItems = lr?.beban || [];
    const shuBersih = lr?.shu_bersih || 0;
    const shuPositif = shuBersih >= 0;

    return (
      <main className="lr-shell" style={{ background: "#f8fafc", minHeight: "100vh" }}>
        <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

        <div className="w-full max-w-3xl mx-auto bg-white min-h-screen sm:shadow-xl sm:border-x sm:border-slate-200">
          <header className="lr-header no-print">
            <div style={{ position: "relative", zIndex: 10 }}>
              <Link href="/dashboard/laporan" className="lr-btn-nav" style={{ marginBottom: 20 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Laporan
              </Link>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <h1 style={{ color: "#fff", margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: "-.02em" }}>Laporan Laba / Rugi</h1>
                  <p style={{ color: "#94a3b8", margin: "4px 0 0", fontSize: 14 }}>{lr.periode_label}</p>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <form method="GET" style={{ display: "flex", gap: 6 }}>
                    <select name="tahun" defaultValue={tahun} style={{ background: "rgba(255,255,255,.15)", color: "#fff", border: "1px solid rgba(255,255,255,.3)", borderRadius: 10, padding: "8px 10px", fontSize: 13, fontWeight: 700 }}>
                      {[TAHUN_INI, TAHUN_INI - 1, TAHUN_INI - 2].map(y => (
                        <option key={y} value={y} style={{ background: "#1e293b" }}>{y}</option>
                      ))}
                    </select>
                    <button type="submit" style={{ background: "rgba(255,255,255,.2)", color: "#fff", border: "none", borderRadius: 10, padding: "8px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Tampilkan</button>
                  </form>
                  <button className="btn-print" onClick={() => window.print()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                    Export PDF
                  </button>
                </div>
              </div>
            </div>
          </header>

          <div className="lr-content">
            <div style={{ textAlign: "center", padding: "24px 0 8px", display: "none" }} className="print-only">
              <div style={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>KOPERASI KARYAWAN PT. CGPSI</div>
              <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>LAPORAN LABA / RUGI</div>
              <div style={{ fontSize: 12, color: "#475569" }}>Periode: {lr.periode_label}</div>
              <div style={{ borderBottom: "2px solid #0f172a", margin: "12px 0" }} />
            </div>

            {/* ── PENDAPATAN ── */}
            <div className="lr-card">
              <div className="lr-section-header">I. Pendapatan</div>
              <table className="lr-table">
                <thead>
                  <tr>
                    <th>Kode</th>
                    <th>Keterangan</th>
                    <th style={{ textAlign: "right" }}>Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {pendapatanItems.length === 0 ? (
                    <tr><td colSpan={3} style={{ textAlign: "center", color: "#94a3b8", padding: "24px" }}>Belum ada pendapatan</td></tr>
                  ) : (
                    pendapatanItems.map((p: any) => (
                      <tr key={p.id || p.kode_akun}>
                        <td style={{ color: "#3b82f6", fontWeight: 600 }}>{p.kode_akun}</td>
                        <td style={{ color: "#334155" }}>{p.nama_akun}</td>
                        <td style={{ textAlign: "right", color: "#0f766e", fontWeight: 700 }}>{formatRp(p.saldo_akhir)}</td>
                      </tr>
                    ))
                  )}
                  <tr className="lr-total-row">
                    <td colSpan={2} style={{ color: "#0f172a" }}>Total Pendapatan</td>
                    <td style={{ textAlign: "right", color: "#0f766e", fontSize: 15 }}>{formatRp(lr?.total_pendapatan || 0)}</td>
                  </tr>
                </tbody>
              </table>

              {/* ── BEBAN ── */}
              <div className="lr-section-header">II. Beban Operasional</div>
              <table className="lr-table">
                <tbody>
                  {bebanItems.length === 0 ? (
                    <tr><td colSpan={3} style={{ textAlign: "center", color: "#94a3b8", padding: "24px" }}>Belum ada beban</td></tr>
                  ) : (
                    bebanItems.map((b: any) => (
                      <tr key={b.id || b.kode_akun}>
                        <td style={{ color: "#3b82f6", fontWeight: 600, width: 80 }}>{b.kode_akun}</td>
                        <td style={{ color: "#334155" }}>{b.nama_akun}</td>
                        <td style={{ textAlign: "right", color: "#e11d48", fontWeight: 700 }}>({formatRp(b.saldo_akhir)})</td>
                      </tr>
                    ))
                  )}
                  <tr className="lr-total-row">
                    <td colSpan={2} style={{ color: "#0f172a" }}>Total Beban</td>
                    <td style={{ textAlign: "right", color: "#e11d48", fontSize: 15 }}>({formatRp(lr?.total_beban || 0)})</td>
                  </tr>
                </tbody>
              </table>

              {/* ── SHU ── */}
              <table className="lr-table">
                <tbody>
                  <tr className={`lr-shu-row${!shuPositif ? " lr-shu-row-neg" : ""}`}>
                    <td style={{ width: 80, color: "#0f172a" }}>SHU</td>
                    <td style={{ color: "#0f172a" }}>Sisa Hasil Usaha {lr.periode_label}</td>
                    <td style={{ textAlign: "right", color: shuPositif ? "#0f766e" : "#e11d48", fontSize: 16 }}>
                      {shuPositif ? "" : "("}{formatRp(shuBersih)}{shuPositif ? "" : ")"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Catatan */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: "16px 20px", fontSize: 12, color: "#64748b", lineHeight: 1.7 }}>
              <strong style={{ color: "#0f172a" }}>Catatan:</strong><br/>
              1. Laporan ini disusun berdasarkan sistem pencatatan double-entry sesuai SAK ETAP.<br/>
              2. Pendapatan utama koperasi berasal dari biaya administrasi pinjaman (4% flat).<br/>
              3. SHU yang terbentuk tidak dibagikan tunai — dialokasikan ke Dana Cadangan &amp; Modal Koperasi, serta Parsel Lebaran saat tutup buku tahunan.
            </div>
          </div>
        </div>
      </main>
    );

  } catch (err: any) {
    // 🚨 TAMPILKAN ERROR KE LAYAR JIKA MASIH ADA YANG BOCOR
    return (
      <div style={{ padding: "40px", fontFamily: "sans-serif", backgroundColor: "#fee2e2", color: "#991b1b", minHeight: "100vh" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "900", marginBottom: "10px" }}>🚨 Detektif Error: Laba Rugi</h1>
        <p style={{ fontSize: "16px", marginBottom: "20px" }}>Website Anda tidak rusak, tapi terhenti karena kode/database ini:</p>
        <div style={{ backgroundColor: "#7f1d1d", color: "#fca5a5", padding: "20px", borderRadius: "10px", overflowX: "auto", fontWeight: "bold" }}>
          {err?.message || "Tidak ada pesan error spesifik"}
        </div>
        <h3 style={{ marginTop: "20px", color: "#7f1d1d" }}>Lokasi Kerusakan:</h3>
        <pre style={{ fontSize: "12px", background: "#f87171", color: "#450a0a", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
          {err?.stack}
        </pre>
      </div>
    );
  }
}
