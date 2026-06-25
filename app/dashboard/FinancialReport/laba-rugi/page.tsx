// =====================================================================
// FILE: app/dashboard/FinancialReport/laba-rugi/page.tsx
// =====================================================================
import React from "react";
import { requireRole } from "@/lib/auth/session";
import { getLaporanLabaRugi } from "@/lib/akuntansi/laporan";
import Link from "next/link";
import PrintButton from "./PrintButton";

// PAKSA NEXT.JS UNTUK TIDAK MELAKUKAN CACHE AGAR TIDAK CRASH (500)
export const dynamic = "force-dynamic";

const TAHUN_INI = new Date().getFullYear();

// PROTEKSI: Mencegah error format jika nilai kosong / NaN
function formatRp(n: any) {
  if (typeof n !== 'number' || isNaN(n)) return "Rp 0";
  return (n < 0 ? "- Rp " : "Rp ") + Math.abs(n).toLocaleString("id-ID");
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
`;

export default async function LabaRugiPage({ searchParams }: any) {
  try {
    // 1. Validasi Akses MASUK ke dalam Try-Catch
    await requireRole(["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS"]);

    // 2. Proteksi ketat pengambilan URL Parameter
    const params = (await searchParams) || {};
    let tahun = parseInt(params.tahun);
    if (isNaN(tahun)) tahun = TAHUN_INI;

    // 3. Panggil API Database
    const { data: lr, error } = await getLaporanLabaRugi(tahun, params.start, params.end);

    if (error || !lr) {
      return <div style={{ padding: 40, color: "#e11d48", fontWeight: "bold" }}>Gagal memuat laporan: {String(error) || "Data belum tersedia"}</div>;
    }

    // 4. Pastikan data tidak undefined (Ubah paksa jadi Array kosong)
    const pendapatanItems = Array.isArray(lr?.pendapatan) ? lr.pendapatan : [];
    const bebanItems = Array.isArray(lr?.beban) ? lr.beban : [];
    const shuBersih = typeof lr?.shu_bersih === 'number' ? lr.shu_bersih : 0;
    const shuPositif = shuBersih >= 0;

    return (
      <main className="lr-shell" style={{ background: "#f8fafc", minHeight: "100vh" }}>
        <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

        <div className="w-full max-w-3xl mx-auto bg-white min-h-screen sm:shadow-xl sm:border-x sm:border-slate-200">
          <header className="lr-header no-print">
            <div style={{ position: "relative", zIndex: 10 }}>
              <Link href="/dashboard/FinancialReport" className="lr-btn-nav" style={{ marginBottom: 20 }}>
                Kembali
              </Link>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <h1 style={{ color: "#fff", margin: 0, fontSize: 26, fontWeight: 900 }}>Laporan Laba / Rugi</h1>
                  <p style={{ color: "#94a3b8", margin: "4px 0 0", fontSize: 14 }}>{String(lr.periode_label)}</p>
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
                 <PrintButton />
                </div>
              </div>
            </div>
          </header>

          <div className="lr-content">
            {/* ── PENDAPATAN ── */}
            <div className="lr-card">
              <div className="lr-section-header">I. Pendapatan</div>
              <table className="lr-table">
                <tbody>
                  {pendapatanItems.length === 0 && (
                    <tr><td colSpan={3} style={{ textAlign: "center", padding: "24px" }}>Belum ada pendapatan</td></tr>
                  )}
                  {pendapatanItems.map((p: any) => (
                    <tr key={p.id || p.kode_akun}>
                      <td style={{ color: "#3b82f6", fontWeight: 600 }}>{String(p.kode_akun)}</td>
                      <td style={{ color: "#334155" }}>{String(p.nama_akun)}</td>
                      <td style={{ textAlign: "right", color: "#0f766e", fontWeight: 700 }}>{formatRp(p.saldo_akhir)}</td>
                    </tr>
                  ))}
                  <tr className="lr-total-row">
                    <td colSpan={2}>Total Pendapatan</td>
                    <td style={{ textAlign: "right" }}>{formatRp(lr?.total_pendapatan)}</td>
                  </tr>
                </tbody>
              </table>

              {/* ── BEBAN ── */}
              <div className="lr-section-header">II. Beban Operasional</div>
              <table className="lr-table">
                <tbody>
                  {bebanItems.length === 0 && (
                    <tr><td colSpan={3} style={{ textAlign: "center", padding: "24px" }}>Belum ada beban</td></tr>
                  )}
                  {bebanItems.map((b: any) => (
                    <tr key={b.id || b.kode_akun}>
                      <td style={{ color: "#3b82f6", fontWeight: 600, width: 80 }}>{String(b.kode_akun)}</td>
                      <td style={{ color: "#334155" }}>{String(b.nama_akun)}</td>
                      <td style={{ textAlign: "right", color: "#e11d48", fontWeight: 700 }}>({formatRp(b.saldo_akhir)})</td>
                    </tr>
                  ))}
                  <tr className="lr-total-row">
                    <td colSpan={2}>Total Beban</td>
                    <td style={{ textAlign: "right", color: "#e11d48" }}>({formatRp(lr?.total_beban)})</td>
                  </tr>
                </tbody>
              </table>

              {/* ── SHU ── */}
              <table className="lr-table">
                <tbody>
                  <tr className={`lr-shu-row${!shuPositif ? " lr-shu-row-neg" : ""}`}>
                    <td style={{ width: 80 }}>SHU</td>
                    <td>Sisa Hasil Usaha</td>
                    <td style={{ textAlign: "right", color: shuPositif ? "#0f766e" : "#e11d48", fontSize: 16 }}>
                      {shuPositif ? "" : "("}{formatRp(shuBersih)}{shuPositif ? "" : ")"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Indikator Laporan Berhasil Dimuat */}
             <div style={{ padding: 20, textAlign: "center", color: "#64748b" }}>✅ Laba Rugi berhasil dimuat!</div>
          </div>
        </div>
      </main>
    );

  } catch (err: any) {
    // PROTEKSI: Jika error berasal dari fungsi redirect Next.js, izinkan lewat!
    if (err?.message?.includes('NEXT_REDIRECT') || err?.digest?.includes('NEXT_REDIRECT')) {
      throw err;
    }

    // JIKA MASIH ADA ERROR SERVER, MUNCULKAN KE LAYAR!
    return (
      <div style={{ padding: "40px", backgroundColor: "#fee2e2", color: "#991b1b", minHeight: "100vh" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "900", marginBottom: "10px" }}>🚨 Detektif Error: Laba Rugi</h1>
        <p>Aplikasi dicegat oleh masalah berikut:</p>
        <div style={{ backgroundColor: "#7f1d1d", color: "#fca5a5", padding: "20px", borderRadius: "10px", fontWeight: "bold" }}>
          {err?.message || "Tidak ada pesan error spesifik."}
        </div>
        <pre style={{ marginTop: "20px", fontSize: "12px", background: "#f87171", color: "#450a0a", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
          {err?.stack}
        </pre>
      </div>
    );
  }
}
