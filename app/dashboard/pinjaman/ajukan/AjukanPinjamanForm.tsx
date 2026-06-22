"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { ajukanPinjaman } from "@/lib/pinjaman/actions";

// 1. KUNCI TENOR: Hanya sampai 12 bulan
const TENOR_OPTIONS = [3, 6, 9, 12];

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

  const biayaAdmin = Math.round(nominal * 0.04);
  const totalDiterima = nominal - biayaAdmin;
  const cicilanPerBulan = tenor > 0 ? Math.round(nominal / tenor) : 0;

  function handleNominalChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    const val = parseInt(raw) || 0;
    // 2. KUNCI INPUT: Otomatis tertahan di angka 15.000.000 kalau ngetik lebih
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
      `}} />

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* DROPDOWN ANGGOTA (KHUSUS OVERRIDE BENDAHARA) */}
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

          {/* 3. KUNCI QUICK SELECT */}
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
            {TENOR_OPTIONS.map((t) => {
              const active = tenor === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTenor(t)}
                  style={{
                    padding: "12px 0", fontSize: "14px", fontWeight: "800", borderRadius: "12px",
                    border: active ? "1.5px solid #2563eb" : "1.5px solid #e2e8f0",
                    background: active ? "#eff6ff" : "#fff", color: active ? "#1d4ed8" : "#64748b",
                    cursor: "pointer", transition: "all 0.15s", boxShadow: active ? "0 2px 8px rgba(37,99,235,0.1)" : "none"
                  }}
                >
                  {t} Bulan
                </button>
              );
            })}
          </div>
          <input type="hidden" name="tenor_bulan" value={tenor} />
        </div>

        {/* Ringkasan Kalkulasi */}
        {nominal > 0 && (
          <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "16px", padding: "20px" }}>
            <div style={{ fontWeight: "800", fontSize: "14px", color: "#0f172a", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg>
              Simulasi Pencairan
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "10px", fontWeight: "600", color: "#475569" }}>
              <span>Nominal pinjaman</span>
              <span style={{ color: "#1e293b" }}>{formatRupiah(nominal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "12px", fontWeight: "600", color: "#dc2626" }}>
              <span>Biaya admin (4%)</span>
              <span>- {formatRupiah(biayaAdmin)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "800", color: "#0f172a", borderTop: "1.5px dashed #cbd5e1", paddingTop: "12px", marginBottom: "12px" }}>
              <span>Estimasi Dana Diterima</span>
              <span style={{ color: "#16a34a" }}>{formatRupiah(totalDiterima)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", background: "#eff6ff", border: "1.5px solid #bfdbfe", padding: "12px 16px", borderRadius: "12px" }}>
              <span style={{ fontWeight: "800", color: "#1d4ed8", fontSize: "13px" }}>Cicilan per bulan</span>
              <span style={{ fontWeight: "900", fontSize: "16px", color: "#1d4ed8", letterSpacing: "-.02em" }}>{formatRupiah(cicilanPerBulan)}</span>
            </div>
          </div>
        )}

        {/* Catatan */}
        <div>
          <label className="kop-label">
            Catatan / Keperluan <span style={{ color: "#94a3b8", fontWeight: "500" }}>(opsional)</span>
          </label>
          <textarea
            name="catatan_pengaju"
            rows={3}
            placeholder="Contoh: Keperluan biaya sekolah anak"
            className="kop-input"
            style={{ resize: "vertical" }}
          />
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
