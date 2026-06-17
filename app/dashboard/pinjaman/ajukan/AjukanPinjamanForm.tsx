"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { ajukanPinjaman } from "@/lib/pinjaman/actions";

const TENOR_OPTIONS = [3, 6, 9, 12, 18, 24, 36];

function formatRupiah(n: number) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

export default function AjukanPinjamanForm() {
  const [isPending, startTransition] = useTransition();
  const [nominal, setNominal] = useState(0);
  const [tenor, setTenor] = useState(12);

  const biayaAdmin = Math.round(nominal * 0.04);
  const totalDiterima = nominal - biayaAdmin;
  const cicilanPerBulan = tenor > 0 ? Math.round(nominal / tenor) : 0;

  function handleNominalChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    setNominal(parseInt(raw) || 0);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => ajukanPinjaman(formData));
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Nominal */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
          Nominal Pinjaman <span style={{ color: "#dc2626" }}>*</span>
        </label>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "14px", fontWeight: "500" }}>
            Rp
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={nominal > 0 ? nominal.toLocaleString("id-ID") : ""}
            onChange={handleNominalChange}
            placeholder="0"
            className="fintech-input"
            style={{ paddingLeft: "44px" }}
            required
          />
          {/* Satu-satunya input bernama "nominal" yang dibaca FormData (integer murni) */}
          <input type="hidden" name="nominal" value={nominal} />
        </div>
        <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>
          Min Rp 100.000 — Maks Rp 50.000.000
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
          {[1000000, 2000000, 5000000, 10000000, 20000000].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setNominal(v)}
              style={{
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: "600",
                background: "#eff6ff",
                color: "#2563eb",
                border: "1px solid #dbeafe",
                borderRadius: "20px",
                cursor: "pointer",
              }}
            >
              {formatRupiah(v)}
            </button>
          ))}
        </div>
      </div>

      {/* Tenor */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
          Tenor <span style={{ color: "#dc2626" }}>*</span>
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
          {TENOR_OPTIONS.map((t) => {
            const active = tenor === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTenor(t)}
                style={{
                  padding: "10px 0",
                  fontSize: "13px",
                  fontWeight: "700",
                  borderRadius: "10px",
                  border: active ? "1px solid #2563eb" : "1px solid #e2e8f0",
                  background: active ? "#2563eb" : "#fff",
                  color: active ? "#fff" : "#475569",
                  cursor: "pointer",
                }}
              >
                {t} bln
              </button>
            );
          })}
        </div>
        <input type="hidden" name="tenor_bulan" value={tenor} />
      </div>

      {/* Ringkasan Kalkulasi */}
      {nominal > 0 && (
        <div
          style={{
            background: "#eff6ff",
            border: "1px solid #dbeafe",
            borderRadius: "14px",
            padding: "18px",
            marginBottom: "20px",
          }}
        >
          <div style={{ fontWeight: "700", fontSize: "14px", color: "#1d4ed8", marginBottom: "12px" }}>
            Rincian Pinjaman
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "8px" }}>
            <span style={{ color: "#64748b" }}>Nominal pinjaman</span>
            <span style={{ fontWeight: "600", color: "#1e293b" }}>{formatRupiah(nominal)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "8px", color: "#dc2626" }}>
            <span>Biaya admin (4%)</span>
            <span style={{ fontWeight: "600" }}>- {formatRupiah(biayaAdmin)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "14px",
              fontWeight: "700",
              color: "#1e293b",
              borderTop: "1px solid #dbeafe",
              paddingTop: "10px",
              marginBottom: "10px",
            }}
          >
            <span>Dana diterima</span>
            <span>{formatRupiah(totalDiterima)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: "1px solid #dbeafe",
              paddingTop: "10px",
            }}
          >
            <span style={{ fontWeight: "700", color: "#15803d" }}>Cicilan / bulan</span>
            <span style={{ fontWeight: "700", fontSize: "18px", color: "#15803d" }}>{formatRupiah(cicilanPerBulan)}</span>
          </div>
        </div>
      )}

      {/* Catatan */}
      <div style={{ marginBottom: "24px" }}>
        <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
          Catatan / Keperluan <span style={{ color: "#94a3b8", fontWeight: "400" }}>(opsional)</span>
        </label>
        <textarea
          name="catatan_pengaju"
          rows={3}
          placeholder="Contoh: keperluan renovasi rumah"
          className="fintech-input"
          style={{ resize: "vertical" }}
        />
      </div>

      {/* Submit */}
      <div style={{ display: "flex", gap: "12px" }}>
        <Link
          href="/dashboard/pinjaman"
          style={{
            flex: 1,
            textAlign: "center",
            padding: "14px 0",
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#475569",
            textDecoration: "none",
          }}
        >
          Batal
        </Link>
        <button
          type="submit"
          disabled={isPending || nominal < 100000}
          style={{
            flex: 1,
            padding: "14px 0",
            background: isPending || nominal < 100000 ? "#94a3b8" : "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: isPending || nominal < 100000 ? "not-allowed" : "pointer",
            boxShadow: isPending || nominal < 100000 ? "none" : "0 4px 12px rgba(37,99,235,0.25)",
          }}
        >
          {isPending ? "Mengirim..." : "Ajukan Pinjaman"}
        </button>
      </div>
    </form>
  );
}
