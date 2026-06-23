"use client";

import React, { useState } from "react";

interface Anggota {
  id: string;
  nik: string;
  nama: string;
}

interface LaporanFormProps {
  isAdmin: boolean;
  currentUserId: string;
  currentUserNama: string;
  anggotaList: Anggota[];
}

function getDefaultPeriode() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getPeriodeOptions() {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  const bulanNama = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `${bulanNama[d.getMonth()]} ${d.getFullYear()}`;
    options.push({ value, label });
  }
  return options;
}

async function downloadPdf(url: string, onError: (msg: string) => void, onDone: () => void) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      onError(body.error ?? "Gagal membuat laporan dari Server");
      onDone();
      return;
    }
    const blob = await res.blob();
    const disposition = res.headers.get("Content-Disposition") ?? "";
    const match = disposition.match(/filename="(.+)"/);
    const filename = match ? match[1] : "laporan_koperasi.pdf";

    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch {
    onError("Terjadi kesalahan jaringan saat mengunduh laporan");
  } finally {
    onDone();
  }
}

export default function LaporanForm({ isAdmin, currentUserId, currentUserNama, anggotaList }: LaporanFormProps) {
  const periodeOptions = getPeriodeOptions();
  const [periodeRekap, setPeriodeRekap] = useState(getDefaultPeriode());
  const [periodeSlip, setPeriodeSlip] = useState(getDefaultPeriode());
  const [selectedAnggotaId, setSelectedAnggotaId] = useState(isAdmin ? "" : currentUserId);
  const [loadingRekap, setLoadingRekap] = useState(false);
  const [loadingSlip, setLoadingSlip] = useState(false);
  const [error, setError] = useState("");

  function handleDownloadRekap() {
    setError("");
    setLoadingRekap(true);
    downloadPdf(
      `/api/laporan/rekap-bulanan?periode=${periodeRekap}`,
      setError,
      () => setLoadingRekap(false)
    );
  }

  function handleDownloadSlip() {
    if (isAdmin && !selectedAnggotaId) {
      setError("Silakan pilih anggota terlebih dahulu untuk mencetak slip-nya.");
      return;
    }
    setError("");
    setLoadingSlip(true);
    const userId = isAdmin ? selectedAnggotaId : currentUserId;
    downloadPdf(
      `/api/laporan/slip-individu?userId=${userId}&periode=${periodeSlip}`,
      setError,
      () => setLoadingSlip(false)
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .kop-label { display: block; font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 8px; letter-spacing: -.01em; }
        .kop-req { color: #dc2626; margin-left: 2px; }
        
        .kop-select { 
          width: 100%; padding: 14px 16px; border-radius: 12px; border: 1.5px solid #e2e8f0; 
          font-size: 14px; font-weight: 600; color: #0f172a; background: #fff; transition: all 0.2s ease; 
          font-family: inherit; cursor: pointer;
          -webkit-appearance: none; -moz-appearance: none; appearance: none;
          background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
          background-repeat: no-repeat; background-position: right 16px top 50%; background-size: 10px auto;
        }
        .kop-select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59,130,246,.15); }
        
        .kop-btn-rekap { 
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; 
          background: linear-gradient(135deg, #1d4ed8, #1e40af); color: #fff; border: none; 
          padding: 16px; border-radius: 14px; font-size: 14px; font-weight: 800; cursor: pointer; 
          transition: transform 0.15s, box-shadow 0.15s; font-family: inherit; box-shadow: 0 4px 12px rgba(29,78,216,.2); 
        }
        .kop-btn-rekap:hover:not(:disabled) { box-shadow: 0 8px 20px rgba(29,78,216,.3); transform: translateY(-2px); }
        .kop-btn-rekap:active:not(:disabled) { transform: scale(0.97); }
        .kop-btn-rekap:disabled { opacity: 0.6; cursor: not-allowed; background: #94a3b8; box-shadow: none; transform: none; }

        .kop-btn-slip { 
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; 
          background: linear-gradient(135deg, #16a34a, #15803d); color: #fff; border: none; 
          padding: 16px; border-radius: 14px; font-size: 14px; font-weight: 800; cursor: pointer; 
          transition: transform 0.15s, box-shadow 0.15s; font-family: inherit; box-shadow: 0 4px 12px rgba(22,163,74,.2); 
        }
        .kop-btn-slip:hover:not(:disabled) { box-shadow: 0 8px 20px rgba(22,163,74,.3); transform: translateY(-2px); }
        .kop-btn-slip:active:not(:disabled) { transform: scale(0.97); }
        .kop-btn-slip:disabled { opacity: 0.6; cursor: not-allowed; background: #94a3b8; box-shadow: none; transform: none; }
        
        .kop-spin { width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,.3); border-top-color: white; border-radius: 50%; animation: kop-spin .7s linear infinite; }
        @keyframes kop-spin { to { transform: rotate(360deg); } }
      `}} />

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Error Alert */}
        {error && (
          <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#b91c1c", borderRadius: "14px", padding: "16px", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "flex-start", gap: "8px" }}>
            <svg style={{ flexShrink: 0, marginTop: "2px" }} width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span style={{ lineHeight: "1.5" }}>{error}</span>
          </div>
        )}

        {/* 1. KARTU REKAP BULANAN (KHUSUS ADMIN) */}
        {isAdmin && (
          <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "20px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1.5px dashed #f1f5f9" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid #bfdbfe" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: "800", fontSize: "15px", color: "#0f172a", marginBottom: "4px" }}>Rekap Potongan Master</div>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", lineHeight: "1.5" }}>Kumpulan potongan HR / Finance dalam 1 bulan (Excel format)</div>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label className="kop-label">Pilih Periode <span className="kop-req">*</span></label>
              <select
                value={periodeRekap}
                onChange={(e) => setPeriodeRekap(e.target.value)}
                className="kop-select"
              >
                {periodeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleDownloadRekap}
              disabled={loadingRekap}
              className="kop-btn-rekap"
            >
              {loadingRekap ? (
                <><span className="kop-spin"></span> Menyiapkan Laporan...</>
              ) : (
                <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg> Download PDF Rekap</>
              )}
            </button>
          </div>
        )}

        {/* 2. KARTU SLIP INDIVIDU (SEMUA BISA) */}
        <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "20px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1.5px dashed #f1f5f9" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid #bbf7d0" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: "800", fontSize: "15px", color: "#0f172a", marginBottom: "4px" }}>Cetak Slip Potongan</div>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", lineHeight: "1.5" }}>
                {isAdmin ? "Pilih anggota untuk mencetak slip pribadi mereka" : "Cetak slip simpanan & pinjaman Anda pribadi"}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isAdmin ? "1fr 1fr" : "1fr", gap: "16px", marginBottom: "24px" }}>
            {isAdmin && (
              <div>
                <label className="kop-label">Nama Anggota <span className="kop-req">*</span></label>
                <select
                  value={selectedAnggotaId}
                  onChange={(e) => setSelectedAnggotaId(e.target.value)}
                  className="kop-select"
                >
                  <option value="">-- Pilih Anggota --</option>
                  {anggotaList.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nik} - {a.nama}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="kop-label">Periode Slip <span className="kop-req">*</span></label>
              <select
                value={periodeSlip}
                onChange={(e) => setPeriodeSlip(e.target.value)}
                className="kop-select"
              >
                {periodeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleDownloadSlip}
            disabled={loadingSlip}
            className="kop-btn-slip"
          >
            {loadingSlip ? (
              <><span className="kop-spin"></span> Mencetak PDF...</>
            ) : (
              <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg> Download PDF Slip</>
            )}
          </button>
        </div>

      </div>
    </>
  );
}
