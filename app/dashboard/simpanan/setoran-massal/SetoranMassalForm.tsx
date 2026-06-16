"use client";

import { useState } from "react";
import { inputSetoranBulananMassal } from "@/lib/simpanan/actions";

const BULAN = [
  "Januari", "Februari", "Maret", "April",
  "Mei", "Juni", "Juli", "Agustus",
  "September", "Oktober", "November", "Desember",
];

export function SetoranMassalForm({
  defaultBulan,
  defaultTahun,
}: {
  defaultBulan: number;
  defaultTahun: number;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [bulan, setBulan] = useState(defaultBulan);
  const [tahun, setTahun] = useState(defaultTahun);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !confirm(
        `Proses setoran bulanan untuk ${BULAN[bulan - 1]} ${tahun}?\n\nSemua anggota aktif akan diproses sekaligus.`
      )
    ) {
      return;
    }

    setLoading(true);
    setResult(null);

    const res = await inputSetoranBulananMassal(bulan, tahun);

    setLoading(false);
    setResult(res);
  }

  const years = Array.from({ length: 5 }, (_, i) => defaultTahun - 2 + i);

  return (
    <>
      {/* --- Scoped Styles --- */}
      <style dangerouslySetInnerHTML={{ __html: `
        .fintech-select {
          width: 100%;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          font-size: 14px;
          transition: all 0.2s ease;
          background-color: #fff;
          color: #1e293b;
        }

        .fintech-select:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,.12);
        }

        .fintech-select:disabled {
          background-color: #f8fafc;
          color: #94a3b8;
          cursor: not-allowed;
        }

        .fintech-btn-primary {
          width: 100%;
          background-color: #2563eb;
          color: #fff;
          border: none;
          font-weight: 600;
          padding: 16px;
          border-radius: 12px;
          text-align: center;
          font-size: 15px;
          transition: all 0.2s ease;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
        
        .fintech-btn-primary:hover:not(:disabled) {
          background-color: #1d4ed8;
          transform: translateY(-1px);
        }

        .fintech-btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .spinner-icon {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Responsive Grid Helper */
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        @media (max-width: 480px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}} />

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Flash Message Result */}
        {result && (
          <div style={{ 
            background: result.success ? "#f0fdf4" : "#fef2f2", 
            border: `1px solid ${result.success ? "#bbf7d0" : "#fecaca"}`, 
            color: result.success ? "#15803d" : "#b91c1c", 
            padding: "16px", 
            borderRadius: "12px", 
            display: "flex", 
            alignItems: "flex-start", 
            gap: "12px", 
            fontSize: "14px", 
            fontWeight: "500" 
          }}>
            <div style={{ flexShrink: 0, marginTop: "2px" }}>
              {result.success ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              )}
            </div>
            <div style={{ width: "100%" }}>
              <div style={{ fontWeight: "600", fontSize: "15px", marginBottom: result.success ? "8px" : "0" }}>
                {result.message}
              </div>
              {result.success && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: "#166534", backgroundColor: "#dcfce7", padding: "8px 12px", borderRadius: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Berhasil: <strong style={{ fontWeight: "700" }}>{result.berhasil}</strong> anggota
                  </div>
                  <span style={{ opacity: 0.5 }}>|</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#991b1b" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Gagal: <strong style={{ fontWeight: "700" }}>{result.gagal}</strong> anggota
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pilih Bulan & Tahun */}
        <div className="form-grid">
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "8px" }}>
              Bulan <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select
              value={bulan}
              onChange={(e) => setBulan(Number(e.target.value))}
              disabled={loading}
              className="fintech-select"
              style={{ WebkitAppearance: "none", MozAppearance: "none", appearance: "none", backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 16px top 50%", backgroundSize: "10px auto" }}
            >
              {BULAN.map((b, i) => (
                <option key={i + 1} value={i + 1}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "8px" }}>
              Tahun <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
              disabled={loading}
              className="fintech-select"
              style={{ WebkitAppearance: "none", MozAppearance: "none", appearance: "none", backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 16px top 50%", backgroundSize: "10px auto" }}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Preview */}
        <div style={{ 
          background: "#f8fafc", 
          border: "1px solid #e2e8f0", 
          borderRadius: "12px", 
          padding: "16px",
          display: "flex",
          gap: "12px",
          alignItems: "flex-start"
        }}>
          <div style={{ color: "#64748b", marginTop: "2px", flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <div style={{ fontSize: "14px", color: "#475569", lineHeight: "1.6" }}>
            <strong style={{ color: "#334155", fontWeight: "700" }}>Preview:</strong> Akan memproses setoran wajib
            bulan{" "}
            <strong style={{ color: "#1d4ed8", fontWeight: "700" }}>
              {BULAN[bulan - 1]} {tahun}
            </strong>{" "}
            untuk semua anggota aktif pada tanggal{" "}
            <strong style={{ color: "#334155", fontWeight: "700" }}>25/{String(bulan).padStart(2, "0")}/{tahun}</strong>.
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="fintech-btn-primary"
        >
          {loading ? (
            <>
              <span className="spinner-icon"></span>
              <span>Memproses semua anggota...</span>
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>
                Proses Setoran {BULAN[bulan - 1]} {tahun}
              </span>
            </>
          )}
        </button>
      </form>
    </>
  );
}
