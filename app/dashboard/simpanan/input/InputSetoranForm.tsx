"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inputSetoran } from "@/lib/simpanan/actions";

const JENIS_SIMPANAN = [
  {
    value: "SIMPANAN_WAJIB",
    label: "Simpanan Wajib",
    desc: "Dipotong otomatis dari gaji / dibayar rutin",
  },
  {
    value: "SIMPANAN_POKOK",
    label: "Simpanan Pokok",
    desc: "Dibayar satu kali saat pendaftaran",
  },
  {
    value: "SIMPANAN_SUKARELA",
    label: "Simpanan Sukarela",
    desc: "Setoran tambahan / tabungan bebas",
  },
];

const getJenisIcon = (value: string) => {
  if (value === "SIMPANAN_WAJIB") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg>
    );
  }
  if (value === "SIMPANAN_POKOK") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
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
    (e.target as HTMLFormElement).reset();
    setSelectedAnggota(null);
  }

  function handleAnggotaChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const anggota = anggotaList.find((a) => a.id === e.target.value);
    setSelectedAnggota(anggota || null);
  }

  // Tentukan default input nominal (Wajib diutamakan)
  const defaultNominal = selectedAnggota 
    ? (selectedAnggota.simpanan_wajib_bulanan || selectedAnggota.simpanan_bulanan || "")
    : "";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .kop-input-wrap { margin-bottom: 20px; }
        .kop-label {
          display: block; font-size: 13px; font-weight: 700; color: #1e293b;
          margin-bottom: 8px; letter-spacing: -.01em;
        }
        .kop-req { color: #dc2626; margin-left: 2px; }

        .kop-input, .kop-select {
          width: 100%; padding: 14px 16px; border-radius: 12px;
          border: 1.5px solid #e2e8f0; font-size: 14px; font-weight: 500;
          color: #0f172a; background: #fff; transition: all 0.2s ease;
          font-family: inherit;
        }
        .kop-input::placeholder { color: #94a3b8; font-weight: 400; }
        .kop-input:focus, .kop-select:focus {
          outline: none; border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59,130,246,.15);
        }
        .kop-input:disabled, .kop-select:disabled {
          background: #f8fafc; color: #94a3b8; cursor: not-allowed; border-color: #f1f5f9;
        }

        /* Input Nominal (Rp) */
        .kop-input-curr { position: relative; }
        .kop-input-curr::before {
          content: 'Rp'; position: absolute; left: 16px; top: 50%;
          transform: translateY(-50%); font-size: 14px; font-weight: 700;
          color: #64748b; pointer-events: none;
        }
        .kop-input-curr .kop-input { padding-left: 42px; font-weight: 700; color: #0f172a; }

        /* Radio Cards untuk Jenis Simpanan */
        .kop-radio-card {
          display: flex; align-items: center; gap: 14px; padding: 16px;
          border: 1.5px solid #e2e8f0; border-radius: 14px; cursor: pointer;
          transition: all 0.2s ease; background: #fff; margin-bottom: 12px;
        }
        .kop-radio-card:hover { background: #f8fafc; border-color: #cbd5e1; }
        .kop-radio-card:has(input:checked) {
          border-color: #3b82f6; background: #eff6ff;
          box-shadow: 0 4px 12px rgba(59,130,246,.08);
        }
        .kop-radio-icon { color: #94a3b8; transition: color 0.2s ease; display: flex; }
        .kop-radio-card:has(input:checked) .kop-radio-icon { color: #2563eb; }
        
        .kop-radio-input {
          accent-color: #2563eb; width: 18px; height: 18px; 
          margin-top: 2px; flex-shrink: 0; cursor: pointer;
        }

        /* Buttons */
        .kop-btn-submit {
          flex: 2; display: flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, #1d4ed8, #1e40af);
          color: #fff; border: none; padding: 16px; border-radius: 14px;
          font-size: 14px; font-weight: 700; cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s; font-family: inherit;
        }
        .kop-btn-submit:hover:not(:disabled) { box-shadow: 0 8px 20px rgba(29,78,216,.3); transform: translateY(-2px); }
        .kop-btn-submit:active:not(:disabled) { transform: scale(0.97); }
        .kop-btn-submit:disabled { opacity: 0.7; cursor: not-allowed; background: #94a3b8; }

        .kop-btn-cancel {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
          background: #f1f5f9; color: #475569; border: none; padding: 16px; border-radius: 14px;
          font-size: 14px; font-weight: 700; cursor: pointer; transition: background 0.15s; font-family: inherit;
        }
        .kop-btn-cancel:hover:not(:disabled) { background: #e2e8f0; }

        /* Alerts */
        .kop-alert {
          border-radius: 14px; padding: 16px; font-size: 13px; font-weight: 600;
          display: flex; align-items: flex-start; gap: 10px; margin-bottom: 24px; line-height: 1.5;
        }
        .kop-alert-err { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; }
        .kop-alert-suc { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; }

        /* Grid */
        .kop-grid-form { display: grid; grid-template-columns: 1fr; gap: 0 20px; }
        @media (min-width: 640px) { .kop-grid-form { grid-template-columns: 1fr 1fr; } }

        /* Spinner */
        .kop-spin {
          width: 20px; height: 20px; border: 2.5px solid rgba(255,255,255,.3);
          border-top-color: white; border-radius: 50%; animation: kop-spin .7s linear infinite;
        }
        @keyframes kop-spin { to { transform: rotate(360deg); } }
      `}} />

      <form onSubmit={handleSubmit}>
        
        {/* Error Alert */}
        {error && (
          <div className="kop-alert kop-alert-err" role="alert">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }} viewBox="0 0 24 24">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="kop-alert kop-alert-suc" role="alert">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }} viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {/* ── PILIH ANGGOTA ── */}
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Pilih Anggota</h3>
        <div className="kop-input-wrap">
          <label className="kop-label" htmlFor="user_id">Daftar Anggota Koperasi <span className="kop-req">*</span></label>
          <select
            id="user_id"
            name="user_id"
            required
            disabled={loading}
            onChange={handleAnggotaChange}
            className="kop-select"
            style={{ WebkitAppearance: "none", MozAppearance: "none", appearance: "none", backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 16px top 50%", backgroundSize: "10px auto" }}
          >
            <option value="">-- Ketik NIK atau pilih anggota --</option>
            {anggotaList.map((anggota: any) => (
              <option key={anggota.id} value={anggota.id}>
                {anggota.nik} - {anggota.nama}
              </option>
            ))}
          </select>

          {/* Info Saldo Anggota Realtime */}
          {selectedAnggota && (
            <div style={{ marginTop: "14px", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "14px", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span style={{ fontWeight: "800", letterSpacing: "-.01em" }}>{selectedAnggota.nama}</span>
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", fontWeight: "600" }}>Wajib: Rp {Number(defaultNominal).toLocaleString("id-ID")}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".05em" }}>Total Saldo</div>
                <div style={{ fontWeight: "900", color: "#059669", fontSize: "16px" }}>
                  Rp {Number(selectedAnggota.saldo_simpanan?.[0]?.total_saldo || 0).toLocaleString("id-ID")}
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ height: 1, background: '#f1f5f9', margin: '8px 0 24px' }} />

        {/* ── JENIS SIMPANAN ── */}
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Pilih Jenis Simpanan <span className="kop-req">*</span></h3>
        <div style={{ marginBottom: "24px" }}>
          {JENIS_SIMPANAN.map((jenis) => (
            <label key={jenis.value} className="kop-radio-card">
              <input
                type="radio"
                name="jenis"
                value={jenis.value}
                defaultChecked={jenis.value === "SIMPANAN_WAJIB"}
                disabled={loading}
                className="kop-radio-input"
              />
              <div className="kop-radio-icon">
                {getJenisIcon(jenis.value)}
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b", marginBottom: "2px" }}>{jenis.label}</div>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>{jenis.desc}</div>
              </div>
            </label>
          ))}
        </div>

        <div style={{ height: 1, background: '#f1f5f9', margin: '8px 0 24px' }} />

        {/* ── RINCIAN TRANSAKSI ── */}
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Rincian Transaksi</h3>
        <div className="kop-grid-form">
          <div className="kop-input-wrap kop-input-curr">
            <label className="kop-label" htmlFor="jumlah">Jumlah Setoran <span className="kop-req">*</span></label>
            <input
              id="jumlah"
              name="jumlah"
              type="number"
              min="1000"
              step="1000"
              placeholder="0"
              required
              disabled={loading}
              key={defaultNominal} /* Paksa re-render defaultValue jika anggota berubah */
              defaultValue={defaultNominal}
              className="kop-input"
            />
            <p style={{ margin: "6px 0 0 0", fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px", fontWeight: "500" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              Minimal Rp 1.000 (Otomatis mengisi Simpanan Wajib)
            </p>
          </div>

          <div className="kop-input-wrap">
            <label className="kop-label" htmlFor="tanggal">Tanggal Penyetoran</label>
            <input
              id="tanggal"
              name="tanggal"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              disabled={loading}
              className="kop-input"
            />
          </div>
        </div>

        <div className="kop-input-wrap">
          <label className="kop-label" htmlFor="keterangan">Keterangan Catatan (Opsional)</label>
          <input
            id="keterangan"
            name="keterangan"
            type="text"
            placeholder="Misal: Setoran tunai bulan Maret via Bendahara"
            disabled={loading}
            className="kop-input"
          />
        </div>

        {/* ── BUTTONS ── */}
        <div style={{ display: "flex", gap: "14px", marginTop: "12px" }}>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="kop-btn-cancel"
          >
            Batal
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="kop-btn-submit"
            aria-busy={loading}
          >
            {loading ? ( <span className="kop-spin" aria-hidden="true" /> ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Proses Setoran Tunai
              </>
            )}
          </button>
        </div>

      </form>
    </>
  );
}
