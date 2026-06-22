"use client";

import { useState } from "react";
import { potongCicilanMassal } from "@/lib/pinjaman/actions";

const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export function SyncPinjamanForm({ defaultBulan, defaultTahun, isAllowedDate }: { defaultBulan: number; defaultTahun: number; isAllowedDate: boolean }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [bulan, setBulan] = useState(defaultBulan);
  const [tahun, setTahun] = useState(defaultTahun);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isAllowedDate) return;

    if (!confirm(`Proses pemotongan cicilan PINJAMAN secara massal untuk tagihan bulan ${BULAN[bulan - 1]} ${tahun}?\n\nPastikan HR sudah mengeksekusi payroll.`)) {
      return;
    }

    setLoading(true);
    setResult(null);
    const res = await potongCicilanMassal(bulan, tahun);
    setLoading(false);
    setResult(res);
  }

  const years = Array.from({ length: 5 }, (_, i) => defaultTahun - 2 + i);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .kop-label { display: block; font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 8px; letter-spacing: -.01em; }
        .kop-req { color: #dc2626; margin-left: 2px; }
        .kop-select { width: 100%; padding: 14px 16px; border-radius: 12px; border: 1.5px solid #e2e8f0; font-size: 14px; font-weight: 600; color: #0f172a; background: #fff; transition: all 0.2s ease; font-family: inherit; }
        .kop-select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59,130,246,.15); }
        .kop-select:disabled { background: #f8fafc; color: #94a3b8; cursor: not-allowed; border-color: #f1f5f9; }
        .kop-btn-submit { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: none; padding: 16px; border-radius: 14px; font-size: 15px; font-weight: 800; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; font-family: inherit; box-shadow: 0 4px 12px rgba(16,185,129,.2); }
        .kop-btn-submit:hover:not(:disabled) { box-shadow: 0 8px 20px rgba(16,185,129,.3); transform: translateY(-2px); }
        .kop-btn-submit:active:not(:disabled) { transform: scale(0.97); }
        .kop-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; background: #94a3b8; box-shadow: none; transform: none; }
        .kop-spin { width: 20px; height: 20px; border: 2.5px solid rgba(255,255,255,.3); border-top-color: white; border-radius: 50%; animation: kop-spin .7s linear infinite; }
        @keyframes kop-spin { to { transform: rotate(360deg); } }
        .kop-grid-form { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 640px) { .kop-grid-form { grid-template-columns: 1fr 1fr; } }
      `}} />

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {result && (
          <div style={{ background: result.success ? "#f0fdf4" : "#fef2f2", border: `1.5px solid ${result.success ? "#bbf7d0" : "#fecaca"}`, color: result.success ? "#15803d" : "#b91c1c", padding: "16px", borderRadius: "14px", display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "13px", fontWeight: "600", lineHeight: "1.5" }}>
            <div style={{ flexShrink: 0, marginTop: "2px" }}>
              {result.success ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
            </div>
            <div style={{ width: "100%" }}>{result.message}</div>
          </div>
        )}

        <div className="kop-grid-form">
          <div>
            <label className="kop-label">Bulan Tagihan <span className="kop-req">*</span></label>
            <select value={bulan} onChange={(e) => setBulan(Number(e.target.value))} disabled={loading || !isAllowedDate} className="kop-select" style={{ WebkitAppearance: "none", MozAppearance: "none", appearance: "none", backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 16px top 50%", backgroundSize: "10px auto" }}>
              {BULAN.map((b, i) => <option key={i + 1} value={i + 1}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="kop-label">Tahun <span className="kop-req">*</span></label>
            <select value={tahun} onChange={(e) => setTahun(Number(e.target.value))} disabled={loading || !isAllowedDate} className="kop-select" style={{ WebkitAppearance: "none", MozAppearance: "none", appearance: "none", backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 16px top 50%", backgroundSize: "10px auto" }}>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading || !isAllowedDate} className="kop-btn-submit">
          {loading ? (
            <><span className="kop-spin"></span><span>Memproses Tagihan Massal...</span></>
          ) : !isAllowedDate ? (
            <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><span>Terkunci (Bukan Tgl 25)</span></>
          ) : (
            <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>Eksekusi Semua Tagihan {BULAN[bulan - 1]} {tahun}</span></>
          )}
        </button>
      </form>
    </>
  );
}
