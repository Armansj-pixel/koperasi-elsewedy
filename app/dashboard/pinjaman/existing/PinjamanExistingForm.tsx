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
  
  // Search State
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

  function handleTenorChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newTenor = Number(e.target.value);
    setTenor(newTenor);
    // Pastikan cicilan terbayar tidak lebih dari tenor yang baru dipilih
    if (cicilanTerbayar > newTenor) {
      setCicilanTerbayar(newTenor);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => inputPinjamanExisting(formData));
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
        
        .kop-btn-submit { flex: 2; display: flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(135deg, #0f172a, #1e293b); color: #fff; border: none; padding: 16px; border-radius: 14px; font-size: 14px; font-weight: 800; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; font-family: inherit; box-shadow: 0 4px 12px rgba(15,23,42,.2); }
        .kop-btn-submit:hover:not(:disabled) { box-shadow: 0 8px 20px rgba(15,23,42,.3); transform: translateY(-2px); }
        .kop-btn-submit:active:not(:disabled) { transform: scale(0.97); }
        .kop-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; background: #94a3b8; box-shadow: none; transform: none; }
        
        .kop-btn-cancel { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; background: #f1f5f9; color: #475569; border: none; padding: 16px; border-radius: 14px; font-size: 14px; font-weight: 800; cursor: pointer; transition: background 0.15s; font-family: inherit; text-decoration: none; }
        .kop-btn-cancel:hover:not(:disabled) { background: #e2e8f0; }
        
        .kop-spin { width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,.3); border-top-color: white; border-radius: 50%; animation: kop-spin .7s linear infinite; }
        @keyframes kop-spin { to { transform: rotate(360deg); } }
      `}} />

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Pilih Anggota */}
        <div style={{ position: "relative" }}>
          <label className="kop-label">
            Anggota <span className="kop-req">*</span>
          </label>
          {selectedUser ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", border: "1.5px solid #bbf7d0", borderRadius: "12px", background: "#f0fdf4" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#166534" }}>{selectedUser.nama}</div>
                <div style={{ fontSize: "12px", color: "#15803d", fontWeight: "600", marginTop: "2px" }}>NIK: {selectedUser.nik}</div>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedUser(null); setSearch(""); setTimeout(() => setShowDropdown(true), 100); }}
                style={{ fontSize: "12px", fontWeight: "800", color: "#15803d", background: "#dcfce7", border: "none", cursor: "pointer", padding: "6px 12px", borderRadius: "8px" }}
              >
                Ubah
              </button>
              <input type="hidden" name="user_id" value={selectedUser.id} />
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setShowDropdown(false)}
                placeholder="Ketik 2 huruf nama atau NIK anggota..."
                className="kop-input"
                autoComplete="off"
              />
              
              {showDropdown && (
                <div style={{ position: "absolute", zIndex: 50, width: "100%", marginTop: "8px", background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "14px", boxShadow: "0 10px 25px rgba(15,45,107,.1)", maxHeight: "240px", overflowY: "auto" }}>
                  {filtered.length === 0 ? (
                    <div style={{ padding: "16px", fontSize: "13px", color: "#94a3b8", textAlign: "center", fontWeight: "600" }}>
                      {anggotaList.length === 0 ? "Data anggota kosong" : "Pencarian tidak ditemukan"}
                    </div>
                  ) : (
                    filtered.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); setSelectedUser(a); setShowDropdown(false); setSearch(""); }}
                        style={{ width: "100%", textAlign: "left", padding: "14px 16px", background: "none", border: "none", borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.2s ease" }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "#f8fafc")}
                        onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                      >
                        <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "14px" }}>{a.nama || "Tanpa Nama"}</div>
                        <div style={{ color: "#64748b", fontSize: "12px", marginTop: "4px", fontWeight: "600" }}>NIK: <span style={{ fontFamily: "monospace", color: "#475569" }}>{a.nik || "-"}</span></div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Nominal */}
        <div>
          <label className="kop-label">
            Nominal Pinjaman Kotor <span className="kop-req">*</span>
          </label>
          <div className="kop-input-curr">
            <input
              type="text"
              inputMode="numeric"
              value={nominal > 0 ? nominal.toLocaleString("id-ID") : ""}
              onChange={(e) => {
                const val = parseInt(e.target.value.replace(/\D/g, "")) || 0;
                setNominal(Math.min(val, 15000000)); // Limit 15 Juta
              }}
              placeholder="0"
              className="kop-input"
              required
            />
            <input type="hidden" name="nominal" value={nominal} />
          </div>
          
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
            {[1000000, 3000000, 5000000, 10000000, 15000000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setNominal(v)}
                style={{
                  padding: "8px 16px", fontSize: "11px", fontWeight: "800", background: nominal === v ? "#0f172a" : "#f8fafc",
                  color: nominal === v ? "#fff" : "#475569", border: `1.5px solid ${nominal === v ? "#0f172a" : "#e2e8f0"}`,
                  borderRadius: "20px", cursor: "pointer", transition: "all 0.15s"
                }}
              >
                {formatRupiah(v)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
          {/* Tenor Dropdown */}
          <div>
            <label className="kop-label">Tenor <span className="kop-req">*</span></label>
            <select
              name="tenor_bulan"
              value={tenor}
              onChange={handleTenorChange}
              className="kop-select"
              required
              style={{ WebkitAppearance: "none", MozAppearance: "none", appearance: "none", backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 16px top 50%", backgroundSize: "10px auto" }}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((t) => (
                <option key={t} value={t}>{t} Bulan</option>
              ))}
            </select>
          </div>

          {/* Cicilan Terbayar Dropdown */}
          <div>
            <label className="kop-label">Sdh Dibayar <span className="kop-req">*</span></label>
            <select
              name="cicilan_terbayar"
              value={cicilanTerbayar}
              onChange={(e) => setCicilanTerbayar(Number(e.target.value))}
              className="kop-select"
              required
              style={{ WebkitAppearance: "none", MozAppearance: "none", appearance: "none", backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 16px top 50%", backgroundSize: "10px auto" }}
            >
              {Array.from({ length: tenor + 1 }, (_, i) => i).map((t) => (
                <option key={t} value={t}>{t} Kali</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tanggal pencairan */}
        <div>
          <label className="kop-label">
            Tanggal Pencairan Asli <span className="kop-req">*</span>
          </label>
          <input 
            type="date" 
            name="tanggal_pencairan" 
            className="kop-input" 
            required 
            style={{ color: "#0f172a" }}
          />
          <p style={{ fontSize: "11px", color: "#64748b", marginTop: "8px", fontWeight: "600", lineHeight: "1.5" }}>
            * Tanggal awal pencairan pinjaman ini di sistem lama (digunakan untuk acuan penjatuhan tempo cicilan sisa).
          </p>
        </div>

        {/* Ringkasan */}
        {nominal > 0 && tenor > 0 && (
          <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "16px", padding: "20px" }}>
            <div style={{ fontWeight: "800", fontSize: "14px", color: "#0f172a", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg>
              Review Data Migrasi
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "10px", fontWeight: "600", color: "#475569" }}>
              <span>Total Nominal</span>
              <span style={{ color: "#1e293b" }}>{formatRupiah(nominal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "12px", fontWeight: "600", color: "#dc2626" }}>
              <span>Biaya admin kotor (4%)</span>
              <span>- {formatRupiah(biayaAdmin)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "12px", fontWeight: "600", color: "#475569" }}>
              <span>Angsuran per bulan</span>
              <span style={{ color: "#1e293b" }}>{formatRupiah(cicilanPerBulan)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#eff6ff", border: "1.5px solid #bfdbfe", padding: "12px 16px", borderRadius: "12px", marginTop: "16px" }}>
              <div>
                <div style={{ fontWeight: "800", color: "#1d4ed8", fontSize: "13px" }}>Sisa Utang Aktif</div>
                <div style={{ fontSize: "11px", color: "#3b82f6", fontWeight: "600", marginTop: "2px" }}>({sisaCicilan} cicilan tersisa)</div>
              </div>
              <span style={{ fontWeight: "900", fontSize: "16px", color: "#1d4ed8", letterSpacing: "-.02em" }}>
                {formatRupiah(sisaCicilan * cicilanPerBulan)}
              </span>
            </div>
          </div>
        )}

        {/* Catatan */}
        <div>
          <label className="kop-label">
            Catatan Historis <span style={{ color: "#94a3b8", fontWeight: "500" }}>(opsional)</span>
          </label>
          <textarea
            name="catatan"
            rows={2}
            placeholder="Contoh: Migrasi dari buku Excel Mei 2026..."
            className="kop-input"
            style={{ resize: "vertical" }}
          />
        </div>

        {/* Submit */}
        <div style={{ display: "flex", gap: "14px" }}>
          <Link href="/dashboard/pinjaman" className="kop-btn-cancel">
            Batal
          </Link>
          <button
            type="submit"
            disabled={isPending || !selectedUser || nominal === 0}
            className="kop-btn-submit"
          >
            {isPending ? (
              <><span className="kop-spin"></span> Menyimpan...</>
            ) : (
              <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Simpan Data Migrasi</>
            )}
          </button>
        </div>
      </form>
    </>
  );
}
