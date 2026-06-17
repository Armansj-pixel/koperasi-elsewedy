"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { inputPinjamanExisting } from "@/lib/pinjaman/actions";

interface Anggota {
  id: string;
  nama: string;
  nik: string;
}

interface PinjamanExistingFormProps {
  anggotaList: Anggota[];
}

function formatRupiah(n: number) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

export default function PinjamanExistingForm({ anggotaList }: PinjamanExistingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [nominal, setNominal] = useState(0);
  const [tenor, setTenor] = useState(12);
  const [cicilanTerbayar, setCicilanTerbayar] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<Anggota | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const biayaAdmin = Math.round(nominal * 0.04);
  const totalDiterima = nominal - biayaAdmin;
  const cicilanPerBulan = tenor > 0 ? Math.round(nominal / tenor) : 0;
  const sisaCicilan = Math.max(0, tenor - cicilanTerbayar);

  const filtered = anggotaList
    .filter((a) => a.nama.toLowerCase().includes(search.toLowerCase()) || a.nik.includes(search))
    .slice(0, 8);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => inputPinjamanExisting(formData));
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Pilih Anggota */}
      <div style={{ marginBottom: "20px", position: "relative" }}>
        <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
          Anggota <span style={{ color: "#dc2626" }}>*</span>
        </label>
        {selectedUser ? (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 16px",
              border: "1px solid #bbf7d0",
              borderRadius: "12px",
              background: "#f0fdf4",
            }}
          >
            <div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{selectedUser.nama}</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>NIK: {selectedUser.nik}</div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedUser(null);
                setSearch("");
              }}
              style={{ fontSize: "12px", color: "#94a3b8", background: "none", border: "none", cursor: "pointer" }}
            >
              Ganti
            </button>
            <input type="hidden" name="user_id" value={selectedUser.id} />
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Cari nama atau NIK anggota..."
              className="fintech-input"
            />
            {showDropdown && search.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  zIndex: 10,
                  width: "100%",
                  marginTop: "4px",
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  boxShadow: "0 8px 24px rgba(15,45,107,.12)",
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
              >
                {filtered.length === 0 ? (
                  <div style={{ padding: "12px 16px", fontSize: "14px", color: "#94a3b8" }}>Tidak ditemukan</div>
                ) : (
                  filtered.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        setSelectedUser(a);
                        setShowDropdown(false);
                        setSearch("");
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 16px",
                        fontSize: "14px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ fontWeight: "600", color: "#1e293b" }}>{a.nama}</span>
                      <span style={{ color: "#94a3b8", marginLeft: "8px" }}>· {a.nik}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Nominal */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
          Nominal Pinjaman <span style={{ color: "#dc2626" }}>*</span>
        </label>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "14px" }}>
            Rp
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={nominal > 0 ? nominal.toLocaleString("id-ID") : ""}
            onChange={(e) => setNominal(parseInt(e.target.value.replace(/\D/g, "")) || 0)}
            placeholder="0"
            className="fintech-input"
            style={{ paddingLeft: "44px" }}
          />
          <input type="hidden" name="nominal" value={nominal} />
        </div>
      </div>

      {/* Tenor */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
          Tenor (bulan) <span style={{ color: "#dc2626" }}>*</span>
        </label>
        <input
          type="number"
          value={tenor}
          onChange={(e) => setTenor(parseInt(e.target.value) || 1)}
          name="tenor_bulan"
          min={1}
          max={36}
          className="fintech-input"
        />
      </div>

      {/* Cicilan terbayar */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
          Cicilan Sudah Terbayar <span style={{ color: "#dc2626" }}>*</span>
        </label>
        <input
          type="number"
          value={cicilanTerbayar}
          onChange={(e) => setCicilanTerbayar(Math.min(parseInt(e.target.value) || 0, tenor))}
          name="cicilan_terbayar"
          min={0}
          max={tenor}
          className="fintech-input"
        />
        <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>Sisa cicilan: {sisaCicilan} bulan</div>
      </div>

      {/* Tanggal pencairan */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
          Tanggal Pencairan Asli <span style={{ color: "#dc2626" }}>*</span>
        </label>
        <input type="date" name="tanggal_pencairan" className="fintech-input" required />
      </div>

      {/* Ringkasan */}
      {nominal > 0 && tenor > 0 && (
        <div style={{ background: "#eff6ff", border: "1px solid #dbeafe", borderRadius: "14px", padding: "18px", marginBottom: "20px" }}>
          <div style={{ fontWeight: "700", fontSize: "14px", color: "#1d4ed8", marginBottom: "12px" }}>Ringkasan Pinjaman</div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "8px" }}>
            <span style={{ color: "#64748b" }}>Nominal</span>
            <span style={{ fontWeight: "600", color: "#1e293b" }}>{formatRupiah(nominal)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "8px", color: "#dc2626" }}>
            <span>Biaya admin (4%)</span>
            <span>- {formatRupiah(biayaAdmin)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "8px" }}>
            <span style={{ color: "#64748b" }}>Cicilan / bulan</span>
            <span style={{ fontWeight: "600", color: "#1e293b" }}>{formatRupiah(cicilanPerBulan)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: "1px solid #dbeafe",
              paddingTop: "10px",
              fontWeight: "700",
            }}
          >
            <span style={{ color: "#1e293b" }}>Sisa cicilan</span>
            <span style={{ color: "#1d4ed8" }}>
              {sisaCicilan} × {formatRupiah(cicilanPerBulan)}
            </span>
          </div>
        </div>
      )}

      {/* Catatan */}
      <div style={{ marginBottom: "24px" }}>
        <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
          Catatan Migrasi <span style={{ color: "#94a3b8", fontWeight: "400" }}>(opsional)</span>
        </label>
        <textarea
          name="catatan"
          rows={2}
          placeholder="Contoh: Data migrasi dari Excel lama"
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
          disabled={isPending || !selectedUser || nominal === 0}
          style={{
            flex: 1,
            padding: "14px 0",
            background: isPending || !selectedUser || nominal === 0 ? "#94a3b8" : "#1e293b",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: isPending || !selectedUser || nominal === 0 ? "not-allowed" : "pointer",
          }}
        >
          {isPending ? "Menyimpan..." : "+ Simpan Data"}
        </button>
      </div>
    </form>
  );
}
