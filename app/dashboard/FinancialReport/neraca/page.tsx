// =====================================================================
// FILE 1: app/dashboard/laporan/neraca/page.tsx
// =====================================================================
import React from "react";
import { requireRole } from "@/lib/auth/session";
import { getLaporanNeraca } from "@/lib/akuntansi/laporan";
import Link from "next/link";

function formatRp(n: number) {
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
  @media(min-width:768px) { .nr-header { padding: 40px 32px 90px; } .nr-content { padding: 0 32px 40px; } }
`;

export default async function NeracaPage({
  searchParams,
}: {
  searchParams: { per?: string };
}) {
  await requireRole(["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS"]);

  const today = new Date().toISOString().split("T")[0];
  const perTanggal = searchParams.per ?? today;

  const { data: neraca, error } = await getLaporanNeraca(perTanggal);
  if (error || !neraca) {
    return <div style={{ padding: 40, color: "#e11d48" }}>Gagal memuat neraca: {error}</div>;
  }

  const perLabel = new Date(perTanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return (
    <main className="nr-shell" style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: neracaStyles }} />

      <div className="w-full max-w-3xl mx-auto bg-white min-h-screen sm:shadow-xl sm:border-x sm:border-slate-200">
        <header className="nr-header no-print">
          <div style={{ position: "relative", zIndex: 10 }}>
            <Link href="/dashboard/laporan" className="nr-btn-nav" style={{ marginBottom: 20 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Laporan
            </Link>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <h1 style={{ color: "#fff", margin: 0, fontSize: 26, fontWeight: 900 }}>Neraca</h1>
                <p style={{ color: "#c4b5fd", margin: "4px 0 0", fontSize: 14 }}>Per {perLabel}</p>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <form method="GET" style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input type="date" name="per" defaultValue={perTanggal} style={{
                    background: "rgba(255,255,255,.15)", color: "#fff", border: "1px solid rgba(255,255,255,.3)",
                    borderRadius: 10, padding: "8px 10px", fontSize: 13, fontWeight: 600,
                  }} />
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

        <div className="nr-content">
          {/* Kop print */}
          <div style={{ textAlign: "center", padding: "24px 0 8px", display: "none" }} className="print-kop">
            <div style={{ fontSize: 16, fontWeight: 900 }}>KOPERASI KARYAWAN PT. CGPSI</div>
            <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>NERACA (BALANCE SHEET)</div>
            <div style={{ fontSize: 12, color: "#475569" }}>Per {perLabel}</div>
            <div style={{ borderBottom: "2px solid #0f172a", margin: "12px 0" }} />
          </div>
          <style>{`.print-kop { display: none; } @media print { .print-kop { display: block !important; } }`}</style>

          {/* Badge balance */}
          {neraca.is_balanced
            ? <div className="nr-balance-ok">✓ Neraca seimbang — Aset = Kewajiban + Ekuitas</div>
            : <div className="nr-balance-err">⚠ Neraca tidak seimbang — periksa jurnal yang belum ter-posting</div>
          }

          {/* ── ASET ── */}
          <div className="nr-card">
            <div className="nr-section">Aset</div>
            <table className="nr-table">
              <tbody>
                {neraca.aset.lancar.map((a) => (
                  <tr key={a.kode_akun}>
                    <td style={{ color: "#3b82f6", fontWeight: 600, width: 90 }}>{a.kode_akun}</td>
                    <td style={{ color: "#334155" }}>{a.nama_akun}</td>
                    <td style={{ textAlign: "right", color: a.saldo_akhir < 0 ? "#e11d48" : "#0f172a", fontWeight: 600 }}>{formatRp(a.saldo_akhir)}</td>
                  </tr>
                ))}
                <tr className="nr-grandtotal">
                  <td colSpan={2} style={{ color: "#0f172a" }}>TOTAL ASET</td>
                  <td style={{ textAlign: "right", color: "#0f172a" }}>{formatRp(neraca.aset.total_aset)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── KEWAJIBAN ── */}
          <div className="nr-card">
            <div className="nr-section">Kewajiban</div>
            <table className="nr-table">
              <tbody>
                {neraca.kewajiban.items.length === 0
                  ? <tr><td colSpan={3} style={{ textAlign: "center", color: "#94a3b8", padding: 20 }}>Tidak ada kewajiban</td></tr>
                  : neraca.kewajiban.items.map((k) => (
                    <tr key={k.kode_akun}>
                      <td style={{ color: "#3b82f6", fontWeight: 600, width: 90 }}>{k.kode_akun}</td>
                      <td style={{ color: "#334155" }}>{k.nama_akun}</td>
                      <td style={{ textAlign: "right", color: "#0f172a", fontWeight: 600 }}>{formatRp(k.saldo_akhir)}</td>
                    </tr>
                  ))
                }
                <tr className="nr-subtotal">
                  <td colSpan={2} style={{ color: "#0f172a" }}>Total Kewajiban</td>
                  <td style={{ textAlign: "right", color: "#0f172a" }}>{formatRp(neraca.kewajiban.total_kewajiban)}</td>
                </tr>
              </tbody>
            </table>

            {/* ── EKUITAS ── */}
            <div className="nr-section">Ekuitas</div>
            <table className="nr-table">
              <tbody>
                {neraca.ekuitas.items.map((e) => (
                  <tr key={e.kode_akun}>
                    <td style={{ color: "#3b82f6", fontWeight: 600, width: 90 }}>{e.kode_akun}</td>
                    <td style={{ color: "#334155" }}>{e.nama_akun}</td>
                    <td style={{ textAlign: "right", color: "#0f172a", fontWeight: 600 }}>{formatRp(e.saldo_akhir)}</td>
                  </tr>
                ))}
                {neraca.ekuitas.shu_berjalan !== 0 && (
                  <tr>
                    <td style={{ color: "#3b82f6", fontWeight: 600, width: 90 }}>305</td>
                    <td style={{ color: "#334155" }}>SHU Tahun Berjalan</td>
                    <td style={{ textAlign: "right", color: neraca.ekuitas.shu_berjalan >= 0 ? "#0f766e" : "#e11d48", fontWeight: 700 }}>
                      {neraca.ekuitas.shu_berjalan >= 0 ? "" : "("}{formatRp(neraca.ekuitas.shu_berjalan)}{neraca.ekuitas.shu_berjalan >= 0 ? "" : ")"}
                    </td>
                  </tr>
                )}
                <tr className="nr-subtotal">
                  <td colSpan={2} style={{ color: "#0f172a" }}>Total Ekuitas</td>
                  <td style={{ textAlign: "right", color: "#0f172a" }}>{formatRp(neraca.ekuitas.total_ekuitas)}</td>
                </tr>
              </tbody>
            </table>

            <table className="nr-table">
              <tbody>
                <tr className="nr-grandtotal">
                  <td colSpan={2} style={{ color: "#0f172a" }}>TOTAL KEWAJIBAN + EKUITAS</td>
                  <td style={{ textAlign: "right", color: neraca.is_balanced ? "#0f766e" : "#e11d48" }}>
                    {formatRp(neraca.total_kewajiban_ekuitas)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}


// =====================================================================
// FILE 2: app/dashboard/laporan/shu/page.tsx
// Simpan file ini terpisah di path tersebut
// =====================================================================

/*
"use server" tidak berlaku di page.tsx — ini komponen server biasa.
Actions untuk SHU ada di: app/dashboard/laporan/shu/actions.ts
*/

export async function SHUPageContent({
  tahun,
  sudahTutup,
  simulasi,
}: {
  tahun: number;
  sudahTutup: boolean;
  simulasi: any;
}) {
  // Komponen ini di-render dari page.tsx SHU
  // Lihat file shu-page.tsx terpisah
  return null;
}
