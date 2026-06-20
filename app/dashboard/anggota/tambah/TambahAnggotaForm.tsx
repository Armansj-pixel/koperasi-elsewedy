"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { tambahAnggota } from "@/lib/anggota/actions";

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

export function TambahAnggotaForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const result = await tambahAnggota(formData);

    setLoading(false);

    if (!result.success) {
      setError(result.error || "Gagal tambah anggota");
      return;
    }

    setSuccess(result.message || "Anggota berhasil ditambahkan!");
    setTimeout(() => {
      router.push("/dashboard/anggota");
      router.refresh();
    }, 2000);
  }

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
        .kop-input-highlight { border-color: #60a5fa; background: #eff6ff; }
        .kop-input-highlight:focus { border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37,99,235,.2); }

        /* Input dengan Ikon Rp */
        .kop-input-curr { position: relative; }
        .kop-input-curr::before {
          content: 'Rp'; position: absolute; left: 16px; top: 50%;
          transform: translateY(-50%); font-size: 14px; font-weight: 700;
          color: #64748b; pointer-events: none;
        }
        .kop-input-curr .kop-input { padding-left: 42px; font-weight: 700; color: #0f172a; }

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

        {/* ── DATA UTAMA ── */}
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Data Pribadi Anggota</h3>
        <div className="kop-grid-form">
          <div className="kop-input-wrap">
            <label className="kop-label" htmlFor="nik">Nomor Induk Karyawan (NIK) <span className="kop-req">*</span></label>
            <input name="nik" id="nik" type="text" inputMode="numeric" placeholder="Masukkan angka NIK" required disabled={loading} className="kop-input" />
          </div>

          <div className="kop-input-wrap">
            <label className="kop-label" htmlFor="nama">Nama Lengkap <span className="kop-req">*</span></label>
            <input name="nama" id="nama" type="text" placeholder="Sesuai KTP" required disabled={loading} className="kop-input" />
          </div>

          <div className="kop-input-wrap">
            <label className="kop-label" htmlFor="email">Email</label>
            <input name="email" id="email" type="email" placeholder="email@contoh.com (opsional)" disabled={loading} className="kop-input" />
          </div>

          <div className="kop-input-wrap">
            <label className="kop-label" htmlFor="no_hp">Nomor HP / WhatsApp</label>
            <input name="no_hp" id="no_hp" type="tel" placeholder="08xxxxxxxxxx" disabled={loading} className="kop-input" />
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
              <label className="kop-label" htmlFor="bank_lain">Ketik Nama Bank <span className="kop-req">*</span></label>
              <input id="bank_lain" name="nama_bank_lainnya" type="text" disabled={loading} required autoFocus className="kop-input kop-input-highlight" placeholder="Misal: Bank Jago" />
            </div>
          )}

          <div className="kop-input-wrap">
            <label className="kop-label" htmlFor="no_rek">Nomor Rekening</label>
            <input id="no_rek" name="no_rekening" type="text" inputMode="numeric" disabled={loading} className="kop-input" placeholder="Masukkan angka saja" />
          </div>
          
          <div className="kop-input-wrap">
            <label className="kop-label" htmlFor="atas_nama">Atas Nama Rekening</label>
            <input id="atas_nama" name="nama_rekening" type="text" disabled={loading} className="kop-input" placeholder="Sesuai buku tabungan" />
          </div>
        </div>

        <div style={{ height: 1, background: '#f1f5f9', margin: '8px 0 24px' }} />

        {/* ── PENGATURAN AKUN & SIMPANAN ── */}
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Pengaturan Akun & Simpanan</h3>
        <div className="kop-grid-form">
          <div className="kop-input-wrap">
            <label className="kop-label" htmlFor="role">Role Akun <span className="kop-req">*</span></label>
            <select name="role" id="role" required disabled={loading} defaultValue="ANGGOTA" className="kop-select">
              <option value="ANGGOTA">Anggota</option>
              <option value="SEKRETARIS">Sekretaris</option>
              <option value="BENDAHARA">Bendahara</option>
              <option value="KETUA">Ketua</option>
              <option value="SUPERADMIN">Super Admin</option>
            </select>
          </div>

          <div className="kop-input-wrap">
            <label className="kop-label" htmlFor="tgl_gabung">Tanggal Bergabung</label>
            <input name="tanggal_bergabung" id="tgl_gabung" type="date" defaultValue={new Date().toISOString().split("T")[0]} disabled={loading} className="kop-input" />
          </div>

          <div className="kop-input-wrap kop-input-curr">
            <label className="kop-label" htmlFor="simpanan_wajib">Simpanan Wajib Bulanan</label>
            <input id="simpanan_wajib" name="simpanan_wajib_bulanan" type="number" min={0} step={1000} defaultValue={0} disabled={loading} className="kop-input" />
          </div>

          <div className="kop-input-wrap kop-input-curr">
            <label className="kop-label" htmlFor="simpanan_sukarela">Simpanan Sukarela Bulanan</label>
            <input id="simpanan_sukarela" name="simpanan_sukarela_bulanan" type="number" min={0} step={1000} defaultValue={0} disabled={loading} className="kop-input" />
          </div>
        </div>

        {/* Submit Buttons */}
        <div style={{ display: "flex", gap: "14px", marginTop: "12px" }}>
          <button type="button" onClick={() => router.back()} disabled={loading} className="kop-btn-cancel">
            Batal
          </button>
          
          <button type="submit" disabled={loading} className="kop-btn-submit" aria-busy={loading}>
            {loading ? ( <span className="kop-spin" aria-hidden="true" /> ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Tambahkan Anggota
              </>
            )}
          </button>
        </div>

      </form>
    </>
  );
}
