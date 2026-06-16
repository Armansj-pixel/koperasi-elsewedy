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

  return (
    <>
      {/* --- Scoped Styles untuk Form --- */}
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

        .fintech-input[readonly] {
          background-color: #f8fafc;
          color: #94a3b8;
          cursor: not-allowed;
          font-family: monospace;
        }

        .fintech-input-highlight {
          border-color: #60a5fa;
          background-color: #eff6ff;
        }

        .fintech-input-highlight:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,.2);
        }

        .fintech-btn-primary {
          background-color: #2563eb;
          color: #fff;
          transition: all 0.2s ease;
        }
        
        .fintech-btn-primary:hover:not(:disabled) {
          background-color: #1d4ed8;
          box-shadow: 0 4px 12px rgba(37,99,235,.2);
        }

        .fintech-btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .fintech-btn-secondary {
          background-color: #f1f5f9;
          color: #334155;
          transition: all 0.2s ease;
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

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        
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

        {/* ── SECTION: Data Utama ── */}
        <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "6px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
            Data Utama
          </h3>

          {/* NIK - Read Only */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
              NIK
            </label>
            <input
              name="nik"
              type="text"
              value={anggota.nik}
              readOnly
              className="fintech-input"
            />
            <p style={{ margin: "6px 0 0 0", fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              NIK tidak dapat diubah
            </p>
          </div>

          {/* Nama */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
              Nama Lengkap <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              name="nama"
              type="text"
              defaultValue={anggota.nama}
              required
              disabled={loading}
              className="fintech-input"
            />
          </div>

          {/* Email */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
              Email (Gmail)
            </label>
            <input
              name="email"
              type="email"
              defaultValue={
                anggota.email?.includes("@koperasi.local") ? "" : anggota.email
              }
              placeholder="contoh@gmail.com"
              disabled={loading}
              className="fintech-input"
            />
            <p style={{ margin: "6px 0 0 0", fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              Opsional — untuk notifikasi email
            </p>
          </div>

          {/* No HP */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
              No. HP
            </label>
            <input
              name="no_hp"
              type="tel"
              defaultValue={anggota.no_hp || ""}
              placeholder="08xxxxxxxxxx"
              disabled={loading}
              className="fintech-input"
            />
          </div>
        </div>

        {/* ── SECTION: Data Bank ── */}
        <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "6px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>
            Data Rekening Bank
          </h3>

          {/* No Rekening */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
              No. Rekening
            </label>
            <input
              name="no_rekening"
              type="text"
              inputMode="numeric"
              defaultValue={anggota.no_rekening || ""}
              placeholder="Nomor rekening bank"
              disabled={loading}
              className="fintech-input"
            />
          </div>

          {/* Nama Bank */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
              Nama Bank
            </label>
            <select
              name="nama_bank"
              disabled={loading}
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="fintech-select"
              style={{ WebkitAppearance: "none", MozAppearance: "none", appearance: "none", backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 16px top 50%", backgroundSize: "10px auto" }}
            >
              <option value="">-- Pilih bank --</option>
              {BANK_OPTIONS.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
          </div>

          {/* Input custom bank kalau pilih Lainnya */}
          {selectedBank === "Lainnya" && (
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                Nama Bank (Lainnya) <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                name="nama_bank_custom"
                type="text"
                defaultValue={
                  !KNOWN_BANKS.includes(anggota.nama_bank)
                    ? anggota.nama_bank
                    : ""
                }
                placeholder="Tuliskan nama bank Anda"
                required
                disabled={loading}
                autoFocus
                className="fintech-input fintech-input-highlight"
              />
              <p style={{ margin: "6px 0 0 0", fontSize: "12px", color: "#2563eb", display: "flex", alignItems: "center", gap: "4px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                Wajib diisi karena memilih opsi "Lainnya"
              </p>
            </div>
          )}
        </div>

        {/* ── SECTION: Pengaturan Akun ── */}
        <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "6px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Pengaturan Akun
          </h3>

          {/* Role */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
              Role <span style={{ color: "#ef4444" }}>*</span>
            </label>
            {/* Opsi Select dibersihkan dari emoji karena Select native tidak men-support render SVG didalamnya */}
            <select
              name="role"
              required
              disabled={loading}
              defaultValue={anggota.role}
              className="fintech-select"
              style={{ WebkitAppearance: "none", MozAppearance: "none", appearance: "none", backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 16px top 50%", backgroundSize: "10px auto" }}
            >
              <option value="ANGGOTA">Anggota</option>
              <option value="SEKRETARIS">Sekretaris</option>
              <option value="BENDAHARA">Bendahara</option>
              <option value="KETUA">Ketua</option>
              <option value="SUPERADMIN">Super Admin</option>
            </select>
          </div>

          {/* Simpanan Bulanan */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
              Simpanan Bulanan (Rp)
            </label>
            <input
              name="simpanan_bulanan"
              type="number"
              min="0"
              step="10000"
              defaultValue={anggota.simpanan_bulanan || 0}
              disabled={loading}
              className="fintech-input"
            />
            <p style={{ margin: "6px 0 0 0", fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              Nominal yang dipotong dari gaji setiap bulan
            </p>
          </div>

          {/* Tanggal Bergabung */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
              Tanggal Bergabung
            </label>
            <input
              name="tanggal_bergabung"
              type="date"
              defaultValue={
                anggota.tanggal_bergabung
                  ? new Date(anggota.tanggal_bergabung)
                      .toISOString()
                      .split("T")[0]
                  : new Date().toISOString().split("T")[0]
              }
              disabled={loading}
              className="fintech-input"
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div style={{ display: "flex", gap: "12px", paddingTop: "8px" }}>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="fintech-btn-secondary"
            style={{
              flex: "1",
              border: "none",
              padding: "14px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="fintech-btn-primary"
            style={{
              flex: "2",
              border: "none",
              padding: "14px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
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
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
}
