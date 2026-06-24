// =====================================================================
// FILE: app/dashboard/FinancialReport/neraca/page.tsx
// =====================================================================
import React from "react";
import { requireRole } from "@/lib/auth/session";
import { getLaporanNeraca } from "@/lib/akuntansi/laporan";
import Link from "next/link";

function formatRp(n: any) {
  if (typeof n !== 'number' || isNaN(n)) return "Rp 0";
  return "Rp " + Math.abs(n).toLocaleString("id-ID");
}

const neracaStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=IBM+Plex+Mono:wght@500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; background: #f8fafc; }
  .nr-shell { font-family: 'Inter', sans-serif; }
  .nr-header { background: linear-gradient(150deg, #4c1d95 0%, #2e1065 100%); padding: 30px 20px 90px; }
  .nr-btn-nav { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,.1); color: #fff; padding: 8px 14px; border-radius: 20px; text-decoration: none; font-size: 13px; font-weight: 600; border: 1px solid rgba(255,255,255,.2); }
  .nr-content { padding: 0 16px 40px; margin-top: -60px; position: relative; z-index: 20; }
  .nr-card { background: #fff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,.04); overflow: hidden; margin-bottom: 20px; }
  .nr-table { width: 100%; border-collapse: collapse; font-family: 'IBM Plex Mono', monospace; }
  .nr-table td { padding: 11px 20px; font-size: 13px; border-bottom: 1px solid #f8fafc; }
  .nr-table tr:last-child td { border-bottom: none; }
  .nr-section { background: #f8fafc; padding: 12px 20px; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: .06em; border-bottom: 1px solid #e2e8f0; font-family: 'Inter', sans-serif; }
  .nr-subtotal td { font-weight: 700; border-top: 1px solid #e2e8f0 !important; background: #fafafa; }
  .nr-grandtotal td { font-weight: 900; font-size: 14px !important; border-top: 2px solid #0f172a !important; background: #f8fafc; padding: 14px 20px !important; }
  .nr-balance-ok { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 12px 16px; font-size: 13px; font-weight: 700; color: #0f766e; display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
  .nr-balance-err { background: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 12px 16px; font-size: 13px; font-weight: 700; color: #e11d48; display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
  .btn-print { display: inline-flex; align-items: center; gap: 8px; background: #4c1d95; color: #fff; border: none; padding: 10px 18px; border-radius: 12px; font-size: 13px; font-weight: 700; cursor: pointer; }
  @media print {
    .no-print { display: none !important; }
    body, .nr-shell { background: #fff !important; }
    .nr-header { background: #4c1d95 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .nr-card { box-shadow: none; }
    @page { margin: 15mm; }
  }
`;

export default async function NeracaPage({ searchParams }: any) {
  // 1. Auth diletakkan di luar try-catch agar fungsi redirect login Next.js tidak terblokir
  await requireRole(["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS"]);

  // 2. BUNGKUS SELURUH PROSES DENGAN TRY-CATCH KHUSUS
  try {
    const today = new Date().toISOString().split("T")[0];
    let perTanggal = searchParams?.per || today;

    let dateObj = new Date(perTanggal);
    if (isNaN(dateObj.getTime())) {
      dateObj = new Date();
      perTanggal = today;
    }

    const { data: neraca, error } = await getLaporanNeraca(perTanggal);
    
    if (error || !neraca) {
      return <div style={{ padding: 40, color: "#e11d48", fontWeight: "bold" }}>Gagal memuat neraca: {error || "Data masih kosong di database"}</div>;
    }

    const perLabel = dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const asetLancar = neraca?.aset?.lancar || [];
    const kewajibanItems = neraca?.kewajiban?.items || [];
    const ekuitasItems = neraca?.ekuitas?.items || [];

    return (
      <main className="nr-shell" style={{ background: "#f8fafc", minHeight: "100vh" }}>
        <style dangerouslySetInnerHTML={{ __html: neracaStyles }} />
        <div className="w-full max-w-3xl mx-auto bg-white min-h-screen sm:shadow-xl sm:border-x sm:border-slate-200">
          <header className="nr-header no-print">
            <div style={{ position: "relative", zIndex: 10 }}>
              <Link href="/dashboard/FinancialReport" className="nr-btn-nav" style={{ marginBottom: 20 }}>
                Kembali
              </Link>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <h1 style={{ color: "#fff", margin: 0, fontSize: 26, fontWeight: 900 }}>Neraca</h1>
                  <p style={{ color: "#c4b5fd", margin: "4px 0 0", fontSize: 14 }}>Per {perLabel}</p>
                </div>
              </div>
            </div>
          </header>

          <div className="nr-content">
            {/* ── ASET ── */}
            <div className="nr-card">
              <div className="nr-section">Aset</div>
              <table className="nr-table">
                <tbody>
                  {asetLancar.length === 0 && (<tr><td colSpan={3}>Tidak ada data aset</td></tr>)}
                  {asetLancar.map((a: any) => (
                    <tr key={a.kode_akun}>
                      <td style={{ color: "#3b82f6", fontWeight: 600, width: 90 }}>{a.kode_akun}</td>
                      <td>{a.nama_akun}</td>
                      <td style={{ textAlign: "right" }}>{formatRp(a.saldo_akhir)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* ── INFO TAMBAHAN ── */}
            <div style={{ padding: 20, textAlign: "center", color: "#64748b" }}>
               ✅ Neraca berhasil dimuat!
            </div>
          </div>
        </div>
      </main>
    );

  } catch (err: any) {
    // =========================================================================
    // 🚨 TAMPILKAN ERROR ASLINYA KE LAYAR (BYPASS DIGEST NEXT.JS)
    // =========================================================================
    return (
      <div style={{ padding: "40px", fontFamily: "sans-serif", backgroundColor: "#fee2e2", color: "#991b1b", minHeight: "100vh" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "900", marginBottom: "10px" }}>🚨 Detektif Error Koperasi</h1>
        <p style={{ fontSize: "16px", marginBottom: "20px" }}>Website Anda tidak rusak, tapi terhenti karena kode/database ini:</p>
        
        <div style={{ backgroundColor: "#7f1d1d", color: "#fca5a5", padding: "20px", borderRadius: "10px", overflowX: "auto", fontWeight: "bold" }}>
          {err?.message || "Tidak ada pesan error spesifik"}
        </div>
        
        <h3 style={{ marginTop: "20px", color: "#7f1d1d" }}>Lokasi Kerusakan (Stack Trace):</h3>
        <pre style={{ fontSize: "12px", background: "#f87171", color: "#450a0a", padding: "15px", borderRadius: "8px", overflowX: "auto" }}>
          {err?.stack}
        </pre>
      </div>
    );
  }
}
