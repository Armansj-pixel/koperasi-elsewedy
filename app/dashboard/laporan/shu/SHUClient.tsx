"use client";

// app/dashboard/laporan/shu/page.tsx
// CATATAN: Halaman ini butuh kombinasi Server + Client karena ada form interaktif
// Pisah ke dua file: page.tsx (server) + SHUClient.tsx (client)

// =====================================================================
// SHUClient.tsx — komponen client untuk form tutup buku
// =====================================================================

import React, { useState, useTransition } from "react";

function formatRp(n: number) {
  return "Rp " + Math.abs(n).toLocaleString("id-ID");
}

interface SimulasiSHU {
  tahun: number;
  shu_bersih: number;
  alokasi_dana_cadangan: number;
  alokasi_modal_koperasi: number;
  alokasi_parsel_lebaran: number;
  total_alokasi: number;
  is_valid: boolean;
}

interface Props {
  tahun: number;
  sudahTutup: boolean;
  shuBersih: number;
  defaultConfig: { pct_dana_cadangan: number; pct_modal_koperasi: number; pct_parsel_lebaran: number };
  onEksekusi: (config: any) => Promise<{ success: boolean; message: string; simulasi?: SimulasiSHU }>;
}

const shuStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; }
  .shu-shell { font-family: 'Inter', sans-serif; background: #f8fafc; min-height: 100vh; }
  .shu-header { background: linear-gradient(150deg, #92400e 0%, #78350f 100%); padding: 30px 20px 90px; }
  .shu-content { padding: 0 16px 40px; margin-top: -60px; position: relative; z-index: 20; }
  .shu-card { background: #fff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,.04); padding: 24px; margin-bottom: 20px; }
  .shu-btn-nav { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,.1); color: #fff; padding: 8px 14px; border-radius: 20px; text-decoration: none; font-size: 13px; font-weight: 600; border: 1px solid rgba(255,255,255,.2); cursor: pointer; }
  .shu-input { width: 100%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px; font-size: 15px; font-weight: 700; color: #0f172a; font-family: 'Inter', sans-serif; }
  .shu-label { font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 6px; display: block; }
  .alloc-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
  .alloc-row:last-child { border-bottom: none; }
  .btn-eksekusi { width: 100%; background: linear-gradient(135deg, #92400e, #b45309); color: #fff; border: none; border-radius: 14px; padding: 16px; font-size: 15px; font-weight: 800; cursor: pointer; margin-top: 8px; }
  .btn-eksekusi:disabled { background: #e2e8f0; color: #94a3b8; cursor: not-allowed; }
  .alert-success { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; padding: 16px; color: #0f766e; font-weight: 700; margin-bottom: 20px; }
  .alert-error { background: #fff1f2; border: 1px solid #fecdd3; border-radius: 14px; padding: 16px; color: "#e11d48"; font-weight: 700; margin-bottom: 20px; }
  .pct-warning { font-size: 12px; color: #f59e0b; font-weight: 600; margin-top: 8px; }
  @media(min-width:768px) { .shu-header { padding: 40px 32px 90px; } .shu-content { padding: 0 32px 40px; } }
`;

export default function SHUClient({ tahun, sudahTutup, shuBersih, defaultConfig, onEksekusi }: Props) {
  const [pctCadangan, setPctCadangan] = useState(defaultConfig.pct_dana_cadangan);
  const [pctModal, setPctModal] = useState(defaultConfig.pct_modal_koperasi);
  const [pctParsel, setPctParsel] = useState(defaultConfig.pct_parsel_lebaran);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [confirmed, setConfirmed] = useState(false);

  const totalPct = pctCadangan + pctModal + pctParsel;
  const isValidPct = Math.round(totalPct) === 100;

  // Hitung simulasi real-time
  const alokCadangan = Math.round((shuBersih * pctCadangan) / 100);
  const alokModal = Math.round((shuBersih * pctModal) / 100);
  const alokParsel = shuBersih - alokCadangan - alokModal;

  function handleEksekusi() {
    if (!isValidPct || !confirmed) return;
    startTransition(async () => {
      const res = await onEksekusi({
        pct_dana_cadangan: pctCadangan,
        pct_modal_koperasi: pctModal,
        pct_parsel_lebaran: pctParsel,
      });
      setResult(res);
    });
  }

  return (
    <div className="shu-shell">
      <style dangerouslySetInnerHTML={{ __html: shuStyles }} />
      <div className="w-full max-w-2xl mx-auto bg-slate-100 min-h-screen sm:shadow-xl sm:border-x sm:border-slate-200">

        <header className="shu-header">
          <div style={{ position: "relative", zIndex: 10 }}>
            <a href="/dashboard/laporan" className="shu-btn-nav" style={{ marginBottom: 20, display: "inline-flex" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Laporan
            </a>
            <h1 style={{ color: "#fff", margin: 0, fontSize: 26, fontWeight: 900 }}>Tutup Buku & SHU</h1>
            <p style={{ color: "#fcd34d", margin: "4px 0 0", fontSize: 14 }}>Tahun Buku {tahun}</p>
          </div>
        </header>

        <div className="shu-content">

          {result && (
            <div className={result.success ? "alert-success" : "alert-error"}>
              {result.success ? "✅ " : "❌ "}{result.message}
            </div>
          )}

          {sudahTutup && !result && (
            <div className="alert-success">
              ✅ Buku tahun {tahun} sudah ditutup. Jurnal penutup telah tercatat.
            </div>
          )}

          {/* SHU Summary */}
          <div className="shu-card">
            <div style={{ fontSize: 12, fontWeight: 800, color: "#92400e", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 16 }}>
              SHU Bersih Tahun {tahun}
            </div>
            <div style={{ fontSize: 36, fontWeight: 900, color: shuBersih >= 0 ? "#0f766e" : "#e11d48" }}>
              {shuBersih >= 0 ? "" : "−"}{formatRp(shuBersih)}
            </div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 6, fontWeight: 500 }}>
              {shuBersih >= 0 ? "Surplus — siap dialokasikan saat tutup buku" : "Defisit — tidak ada alokasi yang perlu dilakukan"}
            </div>
          </div>

          {shuBersih > 0 && !sudahTutup && (
            <>
              {/* Konfigurasi Alokasi */}
              <div className="shu-card">
                <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 20 }}>
                  Konfigurasi Alokasi SHU
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label className="shu-label">Dana Cadangan (%) → Akun 306</label>
                  <input type="number" className="shu-input" min={0} max={100}
                    value={pctCadangan}
                    onChange={e => setPctCadangan(Number(e.target.value))} />
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Min. 25% sesuai UU No. 25/1992 Pasal 45</div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label className="shu-label">Modal Koperasi (%) → Akun 304</label>
                  <input type="number" className="shu-input" min={0} max={100}
                    value={pctModal}
                    onChange={e => setPctModal(Number(e.target.value))} />
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Masuk sebagai SHU Belum Dibagikan (ekuitas)</div>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <label className="shu-label">Parsel Lebaran (%) → Akun 202 (Hutang)</label>
                  <input type="number" className="shu-input" min={0} max={100}
                    value={pctParsel}
                    onChange={e => setPctParsel(Number(e.target.value))} />
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Dicatat hutang dulu, realisasi biaya saat lebaran tiba</div>
                </div>

                <div style={{ marginTop: 12, padding: "10px 14px", background: isValidPct ? "#f0fdf4" : "#fff7ed", borderRadius: 10, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Total Alokasi</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: isValidPct ? "#0f766e" : "#f59e0b" }}>{totalPct}%</span>
                </div>
                {!isValidPct && <div className="pct-warning">⚠ Total harus tepat 100%</div>}
              </div>

              {/* Simulasi */}
              {isValidPct && (
                <div className="shu-card">
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 16 }}>
                    Preview Alokasi
                  </div>
                  <div className="alloc-row">
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Dana Cadangan ({pctCadangan}%)</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>→ Akun 306</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{formatRp(alokCadangan)}</div>
                  </div>
                  <div className="alloc-row">
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Modal Koperasi ({pctModal}%)</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>→ Akun 304 (SHU Belum Dibagikan)</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{formatRp(alokModal)}</div>
                  </div>
                  <div className="alloc-row">
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Parsel Lebaran ({pctParsel}%)</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>→ Akun 202 (Hutang, dicairkan saat lebaran)</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{formatRp(alokParsel)}</div>
                  </div>
                  <div className="alloc-row" style={{ borderTop: "2px solid #0f172a", marginTop: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 900, color: "#0f172a" }}>Total</span>
                    <span style={{ fontSize: 15, fontWeight: 900, color: "#0f766e" }}>{formatRp(shuBersih)}</span>
                  </div>
                </div>
              )}

              {/* Konfirmasi & Eksekusi */}
              <div className="shu-card" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#92400e", marginBottom: 12 }}>⚠ Perhatian — Tindakan Tidak Dapat Dibatalkan</div>
                <div style={{ fontSize: 13, color: "#78350f", lineHeight: 1.7, marginBottom: 16 }}>
                  Tutup buku akan membuat jurnal penutup yang me-nol-kan semua akun Pendapatan dan Beban tahun {tahun}, lalu mengalokasikan SHU ke akun yang dipilih. Proses ini <strong>tidak dapat diulang</strong> untuk tahun yang sama.
                </div>
                <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={e => setConfirmed(e.target.checked)}
                    style={{ marginTop: 2, width: 16, height: 16, accentColor: "#92400e" }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#92400e" }}>
                    Saya memahami dan menyetujui eksekusi tutup buku tahun {tahun}
                  </span>
                </label>

                <button
                  className="btn-eksekusi"
                  onClick={handleEksekusi}
                  disabled={!isValidPct || !confirmed || isPending}
                >
                  {isPending ? "⏳ Memproses..." : `🔒 Eksekusi Tutup Buku ${tahun}`}
                </button>
              </div>
            </>
          )}

          {shuBersih <= 0 && (
            <div className="shu-card" style={{ textAlign: "center", color: "#64748b" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📉</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>SHU Defisit atau Nol</div>
              <div style={{ fontSize: 13, marginTop: 8 }}>Tidak ada alokasi yang perlu dilakukan. Defisit akan tercermin di Neraca sebagai pengurang ekuitas.</div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
