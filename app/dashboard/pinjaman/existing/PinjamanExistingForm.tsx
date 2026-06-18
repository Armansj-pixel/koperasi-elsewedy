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
  
  // Tenor default diubah jadi 12 bulan sesuai aturan baru
  const [tenor, setTenor] = useState(12); 
  const [cicilanTerbayar, setCicilanTerbayar] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<Anggota | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const biayaAdmin = Math.round(nominal * 0.04);
  const totalDiterima = nominal - biayaAdmin;
  const cicilanPerBulan = tenor > 0 ? Math.round(nominal / tenor) : 0;
  const sisaCicilan = Math.max(0, tenor - cicilanTerbayar);

  // LOGIKA PENCARIAN (ANTI-ERROR & AMAN DARI DATA NULL)
  const safeSearch = search.toLowerCase().trim();
  const filtered = anggotaList
    .filter((a) => {
      const safeNama = (a.nama || "").toLowerCase();
      const safeNik = (a.nik || "").toLowerCase();
      return safeNama.includes(safeSearch) || safeNik.includes(safeSearch);
    })
    .slice(0, 8); // Tampilkan maksimal 8 teratas biar rapi

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
                setTimeout(() => setShowDropdown(true), 100);
              }}
              style={{ fontSize: "12px", color: "#94a3b8", background: "none", border: "none", cursor: "pointer", padding: "4px 8px" }}
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
              onBlur={() => setShowDropdown(false)} // Otomatis tutup kalau ngeklik di luar form
              placeholder="Ketik 2 huruf nama atau NIK..."
              className="fintech-input"
              autoComplete="off"
            />
            
            {showDropdown && (
              <div
                style={{
                  position: "absolute",
                  zIndex: 50,
                  width: "100%",
                  marginTop: "4px",
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px rgba(15,45,107,.15)",
                  maxHeight: "220px",
                  overflowY: "auto",
                }}
              >
                {filtered.length === 0 ? (
                  <div style={{ padding: "12px 16px", fontSize: "14px", color: "#94a3b8", textAlign: "center" }}>
                    {anggotaList.length === 0 ? "Data anggota kosong" : "Tidak ada yang cocok"}
                  </div>
                ) : (
                  filtered.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      // Gunakan onMouseDown agar event klik ditangkap SEBELUM input kehilangan fokus (onBlur)
                      onMouseDown={(e) => {
                        e.preventDefault(); 
                        setSelectedUser(a);
                        setShowDropdown(false);
                        setSearch("");
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "12px 16px",
                        fontSize: "14px",
                        background: "none",
                        border: "none",
                        borderBottom: "1px solid #f1f5f9",
                        cursor: "pointer",
                        transition: "background 0.2s ease"
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                    >
                      <div style={{ fontWeight: "600", color: "#1e293b" }}>{a.nama || "Tanpa Nama"}</div>
                      <div style={{ color: "#64748b", fontSize: "12px", marginTop: "2px" }}>NIK: {a.nik || "-"}</div>
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
          <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "14px", fontWeight: "600" }}>
            Rp
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={nominal > 0 ? nominal.toLocaleString("id-ID") : ""}
            onChange={(e) => {
              const val = parseInt(e.target.value.replace(/\D/g, "")) || 0;
              // Batasi input tidak boleh lebih dari 15 Juta sesuai limit
              setNominal(Math.min(val, 15000000));
            }}
            placeholder="0"
            className="fintech-input"
            style={{ paddingLeft: "48px", fontWeight: "600" }}
          />
          <input type="hidden" name="nominal" value={nominal} />
        </div>
      </div>

      {/* Tenor */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
          Tenor (Bulan) <span style={{ color: "#dc2626" }}>*</span>
        </label>
        <input
          type="number"
          value={tenor}
          onChange={(e) => setTenor(Math.min(parseInt(e.target.value) || 1, 12))}
          name="tenor_bulan"
          min={1}
          max={12}
          className="fintech-input"
        />
        <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Maksimal 12 bulan</div>
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
        <div style={{ fontSize: "12px", color: "#1d4ed8", fontWeight: "600", marginTop: "6px" }}>Sisa cicilan: {sisaCicilan} bulan</div>
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
        <div style={{ background: "#eff6ff", border: "1px solid #dbeafe", borderRadius: "14px", padding: "18px", marginBottom: "24px" }}>
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
              marginTop: "4px",
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
      <div style={{ marginBottom: "30px" }}>
        <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
          Catatan Migrasi <span style={{ color: "#94a3b8", fontWeight: "400" }}>(opsional)</span>
        </label>
        <textarea
          name="catatan"
          rows={2}
          placeholder="Contoh: Saldo bawaan dari file Excel bulan Mei"
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
          Kembali
        </Link>
        <button
          type="submit"
          disabled={isPending || !selectedUser || nominal === 0}
          style={{
            flex: 1,
            padding: "14px 0",
            background: isPending || !selectedUser || nominal === 0 ? "#cbd5e1" : "#1e293b",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: isPending || !selectedUser || nominal === 0 ? "not-allowed" : "pointer",
            transition: "background 0.2s ease"
          }}
        >
          {isPending ? "Menyimpan..." : "+ Simpan Data"}
        </button>
      </div>
    </form>
  );
}
