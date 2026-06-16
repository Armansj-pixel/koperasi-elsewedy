"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inputSetoran } from "@/lib/simpanan/actions";

// Emoji dihapus dari label dan diganti dengan objek SVG di dalam render
const JENIS_SIMPANAN = [
  {
    value: "SIMPANAN_WAJIB",
    label: "Simpanan Wajib",
    desc: "Dipotong dari gaji bulanan",
  },
  {
    value: "SIMPANAN_POKOK",
    label: "Simpanan Pokok",
    desc: "Dibayar sekali saat mendaftar",
  },
  {
    value: "SIMPANAN_SUKARELA",
    label: "Simpanan Sukarela",
    desc: "Setoran tambahan atas inisiatif anggota",
  },
];

// Helper untuk ikon SVG Jenis Simpanan
const getJenisIcon = (value: string) => {
  if (value === "SIMPANAN_WAJIB") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg>
    );
  }
  if (value === "SIMPANAN_POKOK") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
  );
};

export function InputSetoranForm({
  anggotaList,
}: {
  anggotaList: any[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedAnggota, setSelectedAnggota] = useState<any>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const result = await inputSetoran(formData);

    setLoading(false);

    if (!result.success) {
      setError(result.error || "Gagal input setoran");
      return;
    }

    setSuccess(result.message || "Setoran berhasil dicatat!");
    // Reset form
    (e.target as HTMLFormElement).reset();
    setSelectedAnggota(null);
  }

  function handleAnggotaChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const anggota = anggotaList.find((a) => a.id === e.target.value);
    setSelectedAnggota(anggota || null);
  }

  return (
    <>
      {/* --- Scoped Styles --- */}
      <style dangerouslySetInnerHTML={{ __html: `
        .fintech-input, .fintech-select {
          width: 100%;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          font-size: 14px;
          transition: all 0.2s ease;
          background-color: #fff;
          color: #1e293b;
        }

        .fintech-input:focus, .fintech-select:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,.12);
        }

        .fintech-input:disabled, .fintech-select:disabled {
          background-color: #f8fafc;
          color: #94a3b8;
          cursor: not-allowed;
        }

        /* Styling untuk Radio Card (Menggantikan tailwind has-[:checked]) */
        .radio-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #fff;
        }

        .radio-card:hover {
          background-color: #f8fafc;
        }

        .radio-card:has(input:checked) {
          border-color: #60a5fa;
          background-color: #eff6ff;
        }

        .radio-icon-wrapper {
          color: #94a3b8;
          transition: color 0.2s ease;
        }

        .radio-card:has(input:checked) .radio-icon-wrapper {
          color: #2563eb;
        }

        .fintech-btn-success {
          flex: 1;
          background-color: #16a34a;
          color: #fff;
          border: none;
          font-weight: 600;
          padding: 14px;
          border-radius: 8px;
          text-align: center;
          font-size: 14px;
          transition: all 0.2s ease;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        
        .fintech-btn-success:hover:not(:disabled) {
          background-color: #15803d;
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2);
        }

        .fintech-btn-success:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .fintech-btn-secondary {
          flex: 1;
          background-color: #f1f5f9;
          color: #334155;
          border: none;
          font-weight: 600;
          padding: 14px;
          border-radius: 8px;
          text-align: center;
          font-size: 14px;
          transition: all 0.2s ease;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .fintech-btn-secondary:hover:not(:disabled) {
          background-color: #e2e8f0;
        }

        .fintech-btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .spinner-icon {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
      `}} />

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Error Alert */}
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "12px 16px", borderRadius: "8px", display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "14px", fontWeight: "500" }}>
            <svg style={{ flexShrink: 0, marginTop: "2px" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", padding: "12px 16px", borderRadius: "8px", display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "14px", fontWeight: "500" }}>
            <svg style={{ flexShrink: 0, marginTop: "2px" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>{success}</span>
          </div>
        )}

        {/* Pilih Anggota */}
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "8px" }}>
            Anggota <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <select
            name="user_id"
            required
            disabled={loading}
            onChange={handleAnggotaChange}
            className="fintech-select"
            style={{ WebkitAppearance: "none", MozAppearance: "none", appearance: "none", backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 16px top 50%", backgroundSize: "10px auto" }}
          >
            <option value="">-- Pilih anggota --</option>
            {anggotaList.map((anggota: any) => (
              <option key={anggota.id} value={anggota.id}>
                {anggota.nik} - {anggota.nama}
              </option>
            ))}
          </select>

          {/* Info Saldo Anggota */}
          {selectedAnggota && (
            <div style={{ marginTop: "12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: "14px", color: "#166534", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span style={{ fontWeight: "600" }}>{selectedAnggota.nama}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "12px", color: "#16a34a", fontWeight: "500" }}>Saldo saat ini</div>
                <div style={{ fontWeight: "700", color: "#15803d" }}>
                  Rp {Number(selectedAnggota.saldo_simpanan?.[0]?.total_saldo || 0).toLocaleString("id-ID")}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Jenis Simpanan */}
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "12px" }}>
            Jenis Simpanan <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {JENIS_SIMPANAN.map((jenis) => (
              <label key={jenis.value} className="radio-card">
                <input
                  type="radio"
                  name="jenis"
                  value={jenis.value}
                  defaultChecked={jenis.value === "SIMPANAN_WAJIB"}
                  disabled={loading}
                  style={{ accentColor: "#2563eb", width: "16px", height: "16px", marginTop: "2px", flexShrink: 0 }}
                />
                <div className="radio-icon-wrapper">
                  {getJenisIcon(jenis.value)}
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{jenis.label}</div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{jenis.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Jumlah */}
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "8px" }}>
            Jumlah Setoran (Rp) <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            name="jumlah"
            type="number"
            min="1000"
            step="1000"
            placeholder="0"
            required
            disabled={loading}
            defaultValue={selectedAnggota?.simpanan_bulanan || ""}
            className="fintech-input"
          />
          <p style={{ margin: "6px 0 0 0", fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            Minimal Rp 1.000
          </p>
        </div>

        {/* Tanggal */}
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "8px" }}>
            Tanggal
          </label>
          <input
            name="tanggal"
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]}
            disabled={loading}
            className="fintech-input"
          />
        </div>

        {/* Keterangan */}
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "8px" }}>
            Keterangan
          </label>
          <input
            name="keterangan"
            type="text"
            placeholder="Keterangan setoran (opsional)"
            disabled={loading}
            className="fintech-input"
          />
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "12px", paddingTop: "8px" }}>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="fintech-btn-secondary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="fintech-btn-success"
          >
            {loading ? (
              <>
                <span className="spinner-icon"></span>
                Menyimpan...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Simpan Setoran
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
}
