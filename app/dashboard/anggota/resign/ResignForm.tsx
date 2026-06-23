"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { eksekusiTutupKeanggotaan } from "@/lib/anggota/actions"; 

function formatRupiah(n: number) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

export default function ResignForm({ kalkulasi }: { kalkulasi: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [catatan, setCatatan] = useState("");

  const {
    user,
    simpanan,
    pinjamanAktif,
    totalSimpanan,
    totalHutangPinjaman,
    netKembalian
  } = kalkulasi;

  const isMinus = netKembalian < 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm(`Tindakan ini PERMANEN.\n\nApakah Anda yakin ingin mengeksekusi penutupan akun atas nama ${user.nama}? Saldo simpanan akan dikosongkan dan pinjaman dianggap selesai.`)) return;

    const formData = new FormData();
    formData.append("user_id", user.id);
    formData.append("catatan", catatan);

    startTransition(async () => {
      const res = await eksekusiTutupKeanggotaan(formData);
      if (res.success) {
        alert(res.message);
        router.push("/dashboard/anggota");
      } else {
        alert(res.error);
      }
    });
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .kop-list-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px; }
        .kop-list-item:last-child { border-bottom: none; }
      `}} />

      <form onSubmit={handleSubmit}>
        
        {/* PANEL HAK SIMPANAN */}
        <div style={{ background: "#f8fafc", borderRadius: "16px", padding: "20px", marginBottom: "20px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontWeight: "800", fontSize: "14px", color: "#16a34a", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Hak Simpanan Anggota
          </div>
          <div className="kop-list-item">
            <span style={{ color: "#64748b", fontWeight: "600" }}>Simpanan Pokok</span>
            <span style={{ fontWeight: "700", color: "#0f172a" }}>{formatRupiah(simpanan.saldo_pokok || 0)}</span>
          </div>
          <div className="kop-list-item">
            <span style={{ color: "#64748b", fontWeight: "600" }}>Simpanan Wajib</span>
            <span style={{ fontWeight: "700", color: "#0f172a" }}>{formatRupiah(simpanan.saldo_wajib || 0)}</span>
          </div>
          <div className="kop-list-item">
            <span style={{ color: "#64748b", fontWeight: "600" }}>Simpanan Sukarela</span>
            <span style={{ fontWeight: "700", color: "#0f172a" }}>{formatRupiah(simpanan.saldo_sukarela || 0)}</span>
          </div>
          <div className="kop-list-item" style={{ borderTop: "1.5px solid #cbd5e1", borderBottom: "none", marginTop: "4px", paddingTop: "12px" }}>
            <span style={{ color: "#16a34a", fontWeight: "800" }}>Total Hak Simpanan</span>
            <span style={{ fontWeight: "900", color: "#16a34a", fontSize: "15px" }}>{formatRupiah(totalSimpanan)}</span>
          </div>
        </div>

        {/* PANEL KEWAJIBAN HUTANG */}
        <div style={{ background: "#fff1f2", borderRadius: "16px", padding: "20px", marginBottom: "24px", border: "1px solid #fecaca" }}>
          <div style={{ fontWeight: "800", fontSize: "14px", color: "#e11d48", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Kewajiban Hutang (Pinjaman Aktif)
          </div>
          {pinjamanAktif.length === 0 ? (
            <div style={{ fontSize: "13px", color: "#9f1239", fontWeight: "600" }}>Tidak ada tunggakan pinjaman aktif.</div>
          ) : (
            pinjamanAktif.map((p: any) => (
              <div key={p.id} className="kop-list-item" style={{ borderColor: "#fca5a5" }}>
                <span style={{ color: "#be123c", fontWeight: "600" }}>Sisa Kontrak {p.nomor_kontrak}</span>
                <span style={{ fontWeight: "700", color: "#9f1239" }}>- {formatRupiah(p.sisa_pokok)}</span>
              </div>
            ))
          )}
          <div className="kop-list-item" style={{ borderTop: "1.5px solid #fca5a5", borderBottom: "none", marginTop: "4px", paddingTop: "12px" }}>
            <span style={{ color: "#e11d48", fontWeight: "800" }}>Total Kewajiban</span>
            <span style={{ fontWeight: "900", color: "#e11d48", fontSize: "15px" }}>- {formatRupiah(totalHutangPinjaman)}</span>
          </div>
        </div>

        {/* SUMMARY SETTLEMENT */}
        <div style={{ background: isMinus ? "#fef2f2" : "#eff6ff", border: `2px solid ${isMinus ? "#fca5a5" : "#60a5fa"}`, borderRadius: "16px", padding: "20px", marginBottom: "24px", textAlign: "center" }}>
          <div style={{ fontSize: "13px", fontWeight: "800", color: isMinus ? "#be123c" : "#1d4ed8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
            {isMinus ? "Defisit (Wajib Dibayar Karyawan)" : "Net Settlement (Dikembalikan ke Karyawan)"}
          </div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: isMinus ? "#9f1239" : "#1e40af", letterSpacing: "-.02em" }}>
            {formatRupiah(Math.abs(netKembalian))}
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#1e293b", marginBottom: "8px" }}>
            Catatan Penutupan <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            required
            rows={2}
            placeholder="Contoh: Resign efektif per tanggal 15 Juni 2026. Sisa saldo ditransfer via BCA."
            style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "14px", fontWeight: "500", fontFamily: "inherit", outline: "none" }}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            background: "linear-gradient(135deg, #be123c, #9f1239)", color: "#fff", border: "none",
            padding: "16px", borderRadius: "14px", fontSize: "14px", fontWeight: "800", cursor: "pointer",
            boxShadow: "0 4px 12px rgba(190,18,60,.2)", opacity: isPending ? 0.6 : 1
          }}
        >
          {isPending ? "Mengeksekusi Penutupan..." : "Tutup Keanggotaan Permanen"}
        </button>

      </form>
    </>
  );
}
