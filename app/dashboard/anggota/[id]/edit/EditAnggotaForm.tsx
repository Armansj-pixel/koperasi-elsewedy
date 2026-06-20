"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { editAnggota } from "@/lib/anggota/actions";

const BANK_OPTIONS = [
  "BCA",
  "BRI",
  "BNI",
  "Mandiri",
  "BTN",
  "CIMB Niaga",
  "HSBC",
  "Lainnya",
];

const KNOWN_BANKS = ["BCA", "BRI", "BNI", "Mandiri", "BTN", "CIMB Niaga", "HSBC"];

export function EditAnggotaForm({ anggota }: { anggota: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Tentukan initial bank selection
  const initialBank = KNOWN_BANKS.includes(anggota.nama_bank)
    ? anggota.nama_bank
    : anggota.nama_bank
    ? "Lainnya"
    : "";

  const [selectedBank, setSelectedBank] = useState(initialBank);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const result = await editAnggota(anggota.id, formData);

    setLoading(false);

    if (!result.success) {
      setError(result.error || "Gagal update data anggota");
      return;
    }

    setSuccess(result.message || "Data berhasil diupdate!");
    setTimeout(() => {
      router.push(`/dashboard/anggota/${anggota.id}`);
      router.refresh();
    }, 1500);
  }

  // Default nilai potongan simpanan
  const defaultWajib = anggota.simpanan_wajib_bulanan || anggota.simpanan_bulanan || 0;
  const defaultSukarela = anggota.simpanan_sukarela_bulanan || 0;

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
        .kop-input[readonly] {
          background: #f8fafc; color: #64748b; cursor: not-allowed;
          font-family: monospace; letter-spacing: .05em; font-weight: 700;
        }

        /* Input dengan Ikon Rp */
        .kop-input-curr { position: relative; }
        .kop-input-curr::before {
          content: 'Rp'; position: absolute; left: 16px; top: 50%;
          transform: translateY(-50%); font-size: 14px; font-weight: 700;
          color: #64748b; pointer-events: none;
        }
        .kop-input-curr .kop-input { padding-left: 42px; font-weight: 700; color: #0f172a; }

        .kop-btn-submit {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, #1d4ed8, #1e40af);
          color: #fff; border: none; padding: 16px; border-radius: 14px;
          font-size: 14px; font-weight: 700; cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s; font-family: inherit;
        }
        .kop-btn-submit:hover:not(:disabled) {
          box-shadow: 0 8px 20px rgba(29,78,216,.3); transform: translateY(-2px);
        }
        .kop-btn-submit:active:not(:disabled) { transform: scale(0.97); }
        .kop-btn-submit:disabled { opacity: 0.7; cursor: not-allowed; background: #94a3b8; }

        .kop-alert {
          border-radius: 12px; padding: 14px 16px; font-size: 13px; font-weight: 600;
          display: flex; align-items: flex-start; gap: 10px; margin-bottom: 24px; line-height: 1.5;
        }
        .kop-alert-err { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; }
        .kop-alert-suc { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; }

        .kop-grid-form { display: grid; grid-template-columns: 1fr; gap: 0 20px; }
        @media (min-width: 640px) { .kop-grid-form { grid-template-columns: 1fr 1fr; } }

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

        <div className="kop-grid-form">
          {/* ── NIK ── */}
          <div className="kop-input-wrap">
            <label className="kop-label" htmlFor="nik">Nomor Induk Karyawan (NIK)</label>
            <input name="nik" id="nik" type="text" readOnly value={anggota.nik} className="kop-input" aria-describedby="nik-desc" />
            <p id="nik-desc" style={{ fontSize: 11, color: '#94a3b8', margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              Terkunci oleh sistem
            </p>
          </div>

          {/* ── Nama ── */}
          <div className="kop-input-wrap">
            <label className="kop-label" htmlFor="nama">Nama Lengkap <span className="kop-req">*</span></label>
            <input name="nama" id="nama" type="text" defaultValue={anggota.nama} required disabled={loading} className="kop-input" />
          </div>

          {/* ── Email ── */}
          <div className="kop-input-wrap">
            <label className="kop-label" htmlFor="email">Email</label>
            <input name="email" id="email" type="email" defaultValue={anggota.email?.includes("@koperasi.local") ? "" : anggota.email} placeholder="email@contoh.com" disabled={loading} className="kop-input" />
          </div>

          {/* ── No HP ── */}
          <div className="kop-input-wrap">
            <label className="kop-label" htmlFor="no_hp">Nomor HP / WhatsApp</label>
            <input name="no_hp" id="no_hp" type="tel" defaultValue={anggota.no_hp || ""} placeholder="08xxxxxxxxxx" disabled={loading} className="kop-input" />
          </div>
        </div>

        <div style={{ height: 1, background: '#f1f5f9', margin: '8px 0 24px' }} />

        {/* ── DATA REKENING BANK ── */}
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Data Rekening Pencairan</h3>
        <div className="kop-grid-form">
          <div className="kop-input-wrap">
            <label className="kop-label" htmlFor="bank">Nama Bank</label>
            <select id="bank" name="nama_bank" className="kop-select" value={selectedBank} disabled={loading} onChange={(e) => setSelectedBank(e.target.value)}>
              <option value="">-- Pilih Bank --</option>
              {BANK_OPTIONS.map((bank) => ( <option key={bank} value={bank}>{bank}</option> ))}
            </select>
          </div>

          {selectedBank === "Lainnya" && (
            <div className="kop-input-wrap">
              <label className="kop-label" htmlFor="bank_lain">Ketik Nama Bank</label>
              <input id="bank_lain" name="nama_bank_lainnya" type="text" defaultValue={anggota.nama_bank_lainnya || ""} disabled={loading} className="kop-input" placeholder="Misal: Bank Jago" />
            </div>
          )}

          <div className="kop-input-wrap">
            <label className="kop-label" htmlFor="no_rek">Nomor Rekening</label>
            <input id="no_rek" name="no_rekening" type="text" defaultValue={anggota.no_rekening || ""} disabled={loading} className="kop-input" placeholder="Masukkan angka saja" />
          </div>

          <div className="kop-input-wrap">
            <label className="kop-label" htmlFor="atas_nama">Atas Nama Rekening</label>
            <input id="atas_nama" name="nama_rekening" type="text" defaultValue={anggota.nama_rekening || ""} disabled={loading} className="kop-input" placeholder="Sesuai buku tabungan" />
          </div>
        </div>

        <div style={{ height: 1, background: '#f1f5f9', margin: '8px 0 24px' }} />

        {/* ── SIMPANAN BULANAN ── */}
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Potongan Simpanan / Bulan</h3>
        <div className="kop-grid-form">
          <div className="kop-input-wrap kop-input-curr">
            <label className="kop-label" htmlFor="simpanan_wajib">Simpanan Wajib</label>
            <input id="simpanan_wajib" name="simpanan_wajib_bulanan" type="number" min={0} defaultValue={defaultWajib} disabled={loading} className="kop-input" />
          </div>

          <div className="kop-input-wrap kop-input-curr">
            <label className="kop-label" htmlFor="simpanan_sukarela">Simpanan Sukarela</label>
            <input id="simpanan_sukarela" name="simpanan_sukarela_bulanan" type="number" min={0} defaultValue={defaultSukarela} disabled={loading} className="kop-input" />
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading} className="kop-btn-submit" aria-busy={loading}>
            {loading ? ( <span className="kop-spin" aria-hidden="true" /> ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Simpan Perubahan Data
              </>
            )}
          </button>
        </div>

      </form>
    </>
  );
}
