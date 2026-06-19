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
      onError(body.error ?? "Gagal membuat laporan");
      onDone();
      return;
    }
    const blob = await res.blob();
    const disposition = res.headers.get("Content-Disposition") ?? "";
    const match = disposition.match(/filename="(.+)"/);
    const filename = match ? match[1] : "laporan.pdf";

    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch {
    onError("Terjadi kesalahan saat mengunduh laporan");
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
      setError("Pilih anggota terlebih dahulu");
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
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {error && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            borderRadius: "12px",
            padding: "14px 18px",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          ✗ {error}
        </div>
      )}

      {/* Rekap Bulanan - hanya admin */}
      {isAdmin && (
        <div className="card-fintech">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "#eff6ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: "700", fontSize: "15px", color: "#0f2d6b" }}>Rekap Potongan Gaji</div>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>Untuk dikirim ke HR / Finance perusahaan</div>
            </div>
          </div>

          <div style={{ marginTop: "16px", marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
              Periode
            </label>
            <select
              value={periodeRekap}
              onChange={(e) => setPeriodeRekap(e.target.value)}
              className="fintech-input"
              style={{ cursor: "pointer" }}
            >
              {periodeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleDownloadRekap}
            disabled={loadingRekap}
            style={{
              width: "100%",
              padding: "13px 0",
              background: loadingRekap ? "#94a3b8" : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: loadingRekap ? "not-allowed" : "pointer",
              boxShadow: loadingRekap ? "none" : "0 4px 12px rgba(37,99,235,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {loadingRekap ? (
              "Membuat PDF..."
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Unduh PDF Rekap
              </>
            )}
          </button>
        </div>
      )}

      {/* Slip Individu */}
      <div className="card-fintech">
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "#f0fdf4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: "700", fontSize: "15px", color: "#0f2d6b" }}>Slip Individu</div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              {isAdmin ? "Slip simpanan & pinjaman per anggota" : "Slip simpanan & pinjaman Anda"}
            </div>
          </div>
        </div>

        {isAdmin && (
          <div style={{ marginTop: "16px", marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
              Anggota
            </label>
            <select
              value={selectedAnggotaId}
              onChange={(e) => setSelectedAnggotaId(e.target.value)}
              className="fintech-input"
              style={{ cursor: "pointer" }}
            >
              <option value="">Pilih anggota...</option>
              {anggotaList.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nama} · {a.nik}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ marginTop: isAdmin ? 0 : "16px", marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
            Periode
          </label>
          <select
            value={periodeSlip}
            onChange={(e) => setPeriodeSlip(e.target.value)}
            className="fintech-input"
            style={{ cursor: "pointer" }}
          >
            {periodeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleDownloadSlip}
          disabled={loadingSlip}
          style={{
            width: "100%",
            padding: "13px 0",
            background: loadingSlip ? "#94a3b8" : "#16a34a",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: loadingSlip ? "not-allowed" : "pointer",
            boxShadow: loadingSlip ? "none" : "0 4px 12px rgba(22,163,74,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {loadingSlip ? (
            "Membuat PDF..."
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Unduh PDF Slip
            </>
          )}
        </button>
      </div>
    </div>
  );
}
