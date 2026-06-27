"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { ajukanPinjaman } from "@/lib/pinjaman/actions";

function formatRupiah(n: number) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

export default function AjukanPinjamanForm({
  canOverride = false,
  anggotaList = [],
}: {
  canOverride?: boolean;
  anggotaList?: any[];
}) {
  const [isPending, startTransition] = useTransition();
  const [nominal, setNominal] = useState(0);
  const [tenor, setTenor] = useState(12);

  // State untuk Override Bendahara
  const [useCustomAdmin, setUseCustomAdmin] = useState(false);
  const [useCustomCicilan, setUseCustomCicilan] = useState(false);
  const [customBiayaAdmin, setCustomBiayaAdmin] = useState(0);
  const [customCicilanPerBulan, setCustomCicilanPerBulan] = useState(0);

  // Kalkulasi: pakai custom jika override aktif, fallback ke default
  const defaultBiayaAdmin = Math.round(nominal * 0.04);
  const biayaAdmin = canOverride && useCustomAdmin ? customBiayaAdmin : defaultBiayaAdmin;
  const totalDiterima = nominal - biayaAdmin;
  const defaultCicilanPerBulan = tenor > 0 ? Math.round(nominal / tenor) : 0;
  const cicilanPerBulan = canOverride && useCustomCicilan ? customCicilanPerBulan : defaultCicilanPerBulan;

  function handleNominalChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    const val = parseInt(raw) || 0;
    setNominal(Math.min(val, 15000000));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => ajukanPinjaman(formData));
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .kop-label { display: block; font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 8px; letter-spacing: -.01em; }
        .kop-req { color: #dc2626; margin-left: 2px; }
        .kop-input, .kop-select { width: 100%; padding: 14px 16px; border-radius: 12px; border: 1.5px solid #e2e8f0; font-size: 14px; font-weight: 600; color: #0f172a; background: #fff; transition: all 0.2s ease; font-family: inherit; }
        .kop-input:focus, .kop-select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59,130,246,.15); }
        .kop-input::placeholder { color: #94a3b8; font-weight: 400; }
        
        .kop-input-curr { position: relative; }
        .kop-input-curr::before { content: 'Rp'; position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-size: 15px; font-weight: 800; color: #64748b; pointer-events: none; }
        .kop-input-curr .kop-input { padding-left: 46px; font-weight: 800; font-size: 16px; }
        
        .kop-btn-submit { flex: 2; display: flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(135deg, #1d4ed8, #1e40af); color: #fff; border: none; padding: 16px; border-radius: 14px; font-size: 14px; font-weight: 800; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; font-family: inherit; box-shadow: 0 4px 12px rgba(29,78,216,.2); }
        .kop-btn-submit:hover:not(:disabled) { box-shadow: 0 8px 20px rgba(29,78,216,.3); transform: translateY(-2px); }
        .kop-btn-submit:active:not(:disabled) { transform: scale(0.97); }
        .kop-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; background: #94a3b8; box-shadow: none; transform: none; }
        
        .kop-btn-cancel { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; background: #f1f5f9; color: #475569; border: none; padding: 16px; border-radius: 14px; font-size: 14px; font-weight: 800; cursor: pointer; transition: background 0.15s; font-family: inherit; text-decoration: none; }
        .kop-btn-cancel:hover:not(:disabled) { background: #e2e8f0; }
        
        .kop-spin { width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,.3); border-top-color: white; border-radius: 50%; animation: kop-spin .7s linear infinite; }
        @keyframes kop-spin { to { transform: rotate(360deg); } }

        .kop-toggle-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .kop-toggle { position: relative; width: 40px; height: 22px; flex-shrink: 0; }
        .kop-toggle input { opacity: 0; width: 0; height: 0; }
        .kop-toggle-slider { position: absolute; cursor: pointer; inset: 0; background: #cbd5e1; border-radius: 22px; transition: .2s; }
        .kop-toggle-slider::before { content: ''; position: absolute; height: 16px; width: 16px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: .2s; }
        .kop-toggle input:checked + .kop-toggle-slider { background: #dc2626; }
        .kop-toggle input:checked + .kop-toggle-slider::before { transform: translateX(18px); }
      `}} />

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* DROPDOWN ANGGOTA (KHUSUS OVERRIDE PENGURUS) */}
        {canOverride && (
          <div style={{ background: "#fff1f2", border: "1.5px solid #fecaca", padding: "16px", borderRadius: "14px" }}>
            <label className="kop-label" style={{ color: "#991b1b" }}>
              Pilih Anggota (Mode Override) <span className="kop-req">*</span>
            </label>
            <select
              name="user_id"
              required
              className="kop-select"
              style={{ borderColor: "#fca5a5" }}
            >
              <option value="">-- Pilih Anggota --</option>
              {anggotaList.map((a) => (
                <option key={a.id} value={a.id}>{a.nik} - {a.nama}</option>
              ))}
            </select>
            <p style={{ fontSize: "11px", color: "#be123c", marginTop: "8px", fontWeight: "600" }}>
              * Anda sedang menggunakan mode Administrator. Pengajuan ini akan dicatat atas nama anggota yang dipilih.
            </p>
          </div>
        )}

        {/* Nominal */}
        <div>
          <label className="kop-label">
            Nominal Pinjaman <span className="kop-req">*</span>
          </label>
          <div className="kop-input-curr">
            <input
              type="text"
              inputMode="numeric"
              value={nominal > 0 ? nominal.toLocaleString("id-ID") : ""}
              onChange={handleNominalChange}
              placeholder="0"
              className="kop-input"
              required
            />
            <input type="hidden" name="nominal" value={nominal} />
          </div>
          <p style={{ fontSize: "11px", color: "#64748b", marginTop: "8px", fontWeight: "600" }}>
            Minimal Rp 100.000 — Maksimal Rp 15.000.000
          </p>

          {/* QUICK SELECT NOMINAL */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
            {[1000000, 2000000, 5000000, 10000000, 15000000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setNominal(v)}
                style={{
                  padding: "8px 16px", fontSize: "11px", fontWeight: "800", background: nominal === v ? "#1d4ed8" : "#f8fafc",
                  color: nominal === v ? "#fff" : "#475569", border: `1.5px solid ${nominal === v ? "#1d4ed8" : "#e2e8f0"}`,
                  borderRadius: "20px", cursor: "pointer", transition: "all 0.15s"
                }}
              >
                {formatRupiah(v)}
              </button>
            ))}
          </div>
        </div>

        {/* Tenor */}
        <div>
          <label className="kop-label">
            Tenor Angsuran <span className="kop-req">*</span>
          </label>
          <select
            name="tenor_bulan"
            value={tenor}
            onChange={(e) => setTenor(Number(e.target.value))}
            className="kop-select"
            required
            style={{ 
              WebkitAppearance: "none", MozAppearance: "none", appearance: "none", 
              backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E\")", 
              backgroundRepeat: "no-repeat", backgroundPosition: "right 16px top 50%", backgroundSize: "10px auto" 
            }}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((t) => (
              <option key={t} value={t}>{t} Bulan</option>
            ))}
          </select>
        </div>

        {/* ── SECTION OVERRIDE BENDAHARA ────────────────────────────── */}
        {canOverride && (
          <div style={{ background: "#fefce8", border: "1.5px solid #fde68a", borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ fontWeight: "800", fontSize: "13px", color: "#92400e", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Override Parameter (Admin Only)
            </div>

            {/* Toggle Override Biaya Admin */}
            <div>
              <div className="kop-toggle-row">
                <label style={{ fontSize: "13px", fontWeight: "700", color: "#78350f" }}>
                  Override Biaya Admin
                </label>
                <label className="kop-toggle">
                  <input
                    type="checkbox"
                    checked={useCustomAdmin}
                    onChange={(e) => {
                      setUseCustomAdmin(e.target.checked);
                      if (!e.target.checked) setCustomBiayaAdmin(0);
                    }}
                  />
                  <span className="kop-toggle-slider" />
                </label>
              </div>
              {useCustomAdmin ? (
                <>
                  <div className="kop-input-curr">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={customBiayaAdmin > 0 ? customBiayaAdmin.toLocaleString("id-ID") : ""}
                      onChange={(e) => setCustomBiayaAdmin(parseInt(e.target.value.replace(/\D/g, "")) || 0)}
                      placeholder="0"
                      className="kop-input"
                      style={{ borderColor: "#fbbf24" }}
                    />
                    <input type="hidden" name="custom_biaya_admin" value={customBiayaAdmin} />
                  </div>
                  <p style={{ fontSize: "11px", color: "#92400e", marginTop: "6px", fontWeight: "600" }}>
                    Default 4%: {formatRupiah(defaultBiayaAdmin)}. Diisi {formatRupiah(customBiayaAdmin)}.
                  </p>
                </>
              ) : (
                // Jika toggle off, jangan kirim field custom ke server
                null
              )}
            </div>

            {/* Toggle Override Cicilan Per Bulan */}
            <div>
              <div className="kop-toggle-row">
                <label style={{ fontSize: "13px", fontWeight: "700", color: "#78350f" }}>
                  Override Cicilan per Bulan
                </label>
                <label className="kop-toggle">
                  <input
                    type="checkbox"
                    checked={useCustomCicilan}
                    onChange={(e) => {
                      setUseCustomCicilan(e.target.checked);
                      if (!e.target.checked) setCustomCicilanPerBulan(0);
                    }}
                  />
                  <span className="kop-toggle-slider" />
                </label>
              </div>
              {useCustomCicilan ? (
                <>
                  <div className="kop-input-curr">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={customCicilanPerBulan > 0 ? customCicilanPerBulan.toLocaleString("id-ID") : ""}
                      onChange={(e) => setCustomCicilanPerBulan(parseInt(e.target.value.replace(/\D/g, "")) || 0)}
                      placeholder="0"
                      className="kop-input"
                      style={{ borderColor: "#fbbf24" }}
                    />
                    <input type="hidden" name="custom_cicilan_per_bulan" value={customCicilanPerBulan} />
                  </div>
                  <p style={{ fontSize: "11px", color: "#92400e", marginTop: "6px", fontWeight: "600" }}>
                    Default: {formatRupiah(defaultCicilanPerBulan)}/bulan. Diisi {formatRupiah(customCicilanPerBulan)}/bulan.
                  </p>
                </>
              ) : null}
            </div>

            <p style={{ fontSize: "11px", color: "#a16207", fontWeight: "600", margin: 0 }}>
              ⚠️ Override akan tercatat di audit trail sistem. Gunakan hanya untuk kasus khusus.
            </p>
          </div>
        )}
        {/* ──────────────────────────────────────────────────────────── */}

        {/* Ringkasan Kalkulasi */}
        {nominal > 0 && (
          <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "16px", padding: "20px" }}>
            <div style={{ fontWeight: "800", fontSize: "14px", color: "#0f172a", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg>
              Simulasi Pencairan
              {canOverride && (useCustomAdmin || useCustomCicilan) && (
                <span style={{ fontSize: "10px", background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: "10px", fontWeight: "800" }}>
                  OVERRIDE AKTIF
                </span>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "10px", fontWeight: "600", color: "#475569" }}>
              <span>Nominal pinjaman</span>
              <span style={{ color: "#1e293b" }}>{formatRupiah(nominal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "12px", fontWeight: "600", color: "#dc2626" }}>
              <span>Biaya admin {canOverride && useCustomAdmin ? "(custom)" : "(4%)"}</span>
              <span>- {formatRupiah(biayaAdmin)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "800", color: "#0f172a", borderTop: "1.5px dashed #cbd5e1", paddingTop: "12px", marginBottom: "12px" }}>
              <span>Estimasi Dana Diterima</span>
              <span style={{ color: "#16a34a" }}>{formatRupiah(totalDiterima)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", background: "#eff6ff", border: "1.5px solid #bfdbfe", padding: "12px 16px", borderRadius: "12px" }}>
              <span style={{ fontWeight: "800", color: "#1d4ed8", fontSize: "13px" }}>
                Cicilan per bulan {canOverride && useCustomCicilan ? "(custom)" : ""}
              </span>
              <span style={{ fontWeight: "900", fontSize: "16px", color: "#1d4ed8", letterSpacing: "-.02em" }}>{formatRupiah(cicilanPerBulan)}</span>
            </div>
          </div>
        )}

        {/* Catatan / Keperluan — WAJIB */}
        <div>
          <label className="kop-label">
            Keperluan Pinjaman <span className="kop-req">*</span>
          </label>
          <textarea
            name="catatan_pengaju"
            rows={3}
            placeholder="Contoh: Keperluan biaya sekolah anak semester ganjil"
            className="kop-input"
            style={{ resize: "vertical" }}
            required
            minLength={5}
          />
          <p style={{ fontSize: "11px", color: "#64748b", marginTop: "6px", fontWeight: "600" }}>
            Wajib diisi minimal 5 karakter. Jelaskan tujuan penggunaan dana secara singkat.
          </p>
        </div>

        {/* Submit */}
        <div style={{ display: "flex", gap: "14px" }}>
          <Link href="/dashboard/pinjaman?view=personal" className="kop-btn-cancel">
            Batal
          </Link>
          <button
            type="submit"
            disabled={isPending || nominal < 100000 || nominal > 15000000}
            className="kop-btn-submit"
          >
            {isPending ? (
              <><span className="kop-spin"></span> Mengirim...</>
            ) : (
              <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Ajukan Pinjaman</>
            )}
          </button>
        </div>
      </form>
    </>
  );
}
