"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { topUpKasKecil, catatPengeluaranOperasional, catatPendapatanLain } from "@/lib/akuntansi/actions";

export default function KasForm({ expenseAccounts, revenueAccounts }: { expenseAccounts: any[], revenueAccounts: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"BIAYA" | "PEMASUKAN" | "KAS">("BIAYA");

  const [notif, setNotif] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  async function handleCatatBiaya(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotif(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await catatPengeluaranOperasional(formData);
      if (res.success) { setNotif({ type: "success", msg: "✅ Biaya berhasil dicatat ke Buku Besar!" }); (e.target as HTMLFormElement).reset(); router.refresh(); } 
      else setNotif({ type: "error", msg: res.error || "Gagal mencatat biaya." });
    });
  }

  async function handleCatatPemasukan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotif(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await catatPendapatanLain(formData);
      if (res.success) { setNotif({ type: "success", msg: "✅ Pemasukan berhasil dicatat ke Buku Besar!" }); (e.target as HTMLFormElement).reset(); router.refresh(); } 
      else setNotif({ type: "error", msg: res.error || "Gagal mencatat pemasukan." });
    });
  }

  async function handleTopUpKas(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotif(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await topUpKasKecil(formData);
      if (res.success) { setNotif({ type: "success", msg: "✅ Tarik Tunai berhasil dicatat ke Buku Besar!" }); (e.target as HTMLFormElement).reset(); router.refresh(); } 
      else setNotif({ type: "error", msg: res.error || "Gagal top-up kas." });
    });
  }

  const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "14px", fontWeight: 500, outline: "none", backgroundColor: "#f8fafc" };
  const labelStyle = { display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px", textTransform: "uppercase" as const, letterSpacing: ".05em" };

  return (
    <div style={{ background: "#fff", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(0,0,0,0.03)", overflow: "hidden" }}>
      
      {/* Tab Navigation */}
      <div style={{ display: "flex", borderBottom: "1.5px solid #f1f5f9", overflowX: "auto" }}>
        <button onClick={() => setActiveTab("BIAYA")} style={{ flex: 1, padding: "16px", fontSize: "13px", fontWeight: 800, background: activeTab === "BIAYA" ? "#fff" : "#f8fafc", color: activeTab === "BIAYA" ? "#0f766e" : "#64748b", border: "none", borderBottom: activeTab === "BIAYA" ? "3px solid #0f766e" : "3px solid transparent", cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}>
          Catat Pengeluaran
        </button>
        <button onClick={() => setActiveTab("PEMASUKAN")} style={{ flex: 1, padding: "16px", fontSize: "13px", fontWeight: 800, background: activeTab === "PEMASUKAN" ? "#fff" : "#f8fafc", color: activeTab === "PEMASUKAN" ? "#0ea5e9" : "#64748b", border: "none", borderBottom: activeTab === "PEMASUKAN" ? "3px solid #0ea5e9" : "3px solid transparent", cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}>
          Catat Pemasukan
        </button>
        <button onClick={() => setActiveTab("KAS")} style={{ flex: 1, padding: "16px", fontSize: "13px", fontWeight: 800, background: activeTab === "KAS" ? "#fff" : "#f8fafc", color: activeTab === "KAS" ? "#8b5cf6" : "#64748b", border: "none", borderBottom: activeTab === "KAS" ? "3px solid #8b5cf6" : "3px solid transparent", cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}>
          Tarik Tunai (Isi Kas)
        </button>
      </div>

      <div style={{ padding: "24px" }}>
        {notif && (
          <div style={{ padding: "12px 16px", borderRadius: "12px", marginBottom: "20px", fontSize: "13px", fontWeight: 700, background: notif.type === "success" ? "#f0fdf4" : "#fef2f2", color: notif.type === "success" ? "#15803d" : "#b91c1c", border: `1px solid ${notif.type === "success" ? "#bbf7d0" : "#fecaca"}` }}>
            {notif.msg}
          </div>
        )}

        {/* TAB 1: CATAT BIAYA */}
        {activeTab === "BIAYA" && (
          <form onSubmit={handleCatatBiaya} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Kategori Biaya</label>
                <select name="akun_biaya" required style={inputStyle}>
                  <option value="">-- Pilih Jenis Biaya --</option>
                  {expenseAccounts.map(a => <option key={a.id} value={a.kode_akun}>{a.kode_akun} - {a.nama_akun}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Sumber Dana (Bayar Pakai Apa?)</label>
                <select name="sumber_dana" required style={inputStyle}>
                  <option value="101">101 - Kas Tunai (Uang Laci)</option>
                  <option value="102-MND">102-MND - Transfer Bank Mandiri</option>
                  <option value="102-BRIS">102-BRIS - Transfer Bank BRI Syariah</option>
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Nominal (Rp)</label>
                <input type="number" name="nominal" min="500" required placeholder="Contoh: 50000" style={{...inputStyle, fontSize: "16px", fontWeight: 800, color: "#0f766e"}} />
              </div>
              <div>
                <label style={labelStyle}>Tanggal Transaksi</label>
                <input type="date" name="tanggal" required defaultValue={new Date().toISOString().split("T")[0]} style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Keterangan Pengeluaran</label>
              <input type="text" name="keterangan" required placeholder="Contoh: Beli materai 3 lembar dan fotokopi berkas" style={inputStyle} />
            </div>
            <button type="submit" disabled={isPending} style={{ marginTop: "8px", background: "#0f766e", color: "#fff", border: "none", padding: "14px", borderRadius: "12px", fontSize: "14px", fontWeight: 800, cursor: "pointer", opacity: isPending ? 0.7 : 1 }}>
              {isPending ? "Mencatat Jurnal..." : "Simpan & Bukukan Biaya"}
            </button>
          </form>
        )}

        {/* TAB 2: CATAT PEMASUKAN */}
        {activeTab === "PEMASUKAN" && (
          <form onSubmit={handleCatatPemasukan} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Kategori Pendapatan</label>
                <select name="akun_pendapatan" required style={inputStyle}>
                  <option value="">-- Pilih Jenis Pendapatan --</option>
                  {revenueAccounts.map(a => <option key={a.id} value={a.kode_akun}>{a.kode_akun} - {a.nama_akun}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Tujuan Dana (Uang Masuk Ke Mana?)</label>
                <select name="tujuan_dana" required style={inputStyle}>
                  <option value="102-MND">102-MND - Transfer Bank Mandiri</option>
                  <option value="102-BRIS">102-BRIS - Transfer Bank BRI Syariah</option>
                  <option value="102-MAY">102-MAY - Transfer Bank May Bank</option>
                  <option value="101">101 - Kas Tunai (Uang Laci)</option>
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Nominal (Rp)</label>
                <input type="number" name="nominal" min="500" required placeholder="Contoh: 150000" style={{...inputStyle, fontSize: "16px", fontWeight: 800, color: "#0ea5e9"}} />
              </div>
              <div>
                <label style={labelStyle}>Tanggal Transaksi</label>
                <input type="date" name="tanggal" required defaultValue={new Date().toISOString().split("T")[0]} style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Keterangan Pemasukan</label>
              <input type="text" name="keterangan" required placeholder="Contoh: Cashback fee dari Bank BRI Agro bulan ini" style={inputStyle} />
            </div>
            <button type="submit" disabled={isPending} style={{ marginTop: "8px", background: "#0ea5e9", color: "#fff", border: "none", padding: "14px", borderRadius: "12px", fontSize: "14px", fontWeight: 800, cursor: "pointer", opacity: isPending ? 0.7 : 1 }}>
              {isPending ? "Mencatat Jurnal..." : "Simpan & Bukukan Pemasukan"}
            </button>
          </form>
        )}

        {/* TAB 3: TARIK TUNAI KAS */}
        {activeTab === "KAS" && (
          <form onSubmit={handleTopUpKas} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ padding: "16px", background: "#f5f3ff", border: "1px dashed #c4b5fd", borderRadius: "12px", fontSize: "13px", color: "#6d28d9", fontWeight: 600, lineHeight: 1.5 }}>
              Gunakan form ini saat Bendahara mengambil uang cash dari ATM Bank Koperasi untuk dipegang sebagai Kas Laci (Kas Tunai).
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Tarik dari Bank Mana?</label>
                <select name="sumber_bank" required style={inputStyle}>
                  <option value="102-MND">102-MND - Bank Mandiri</option>
                  <option value="102-MAY">102-MAY - Bank May Bank</option>
                  <option value="102-BRIS">102-BRIS - Bank BRI Syariah</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Nominal Tarik Tunai (Rp)</label>
                <input type="number" name="nominal" min="1000" required placeholder="Contoh: 1000000" style={{...inputStyle, fontSize: "16px", fontWeight: 800, color: "#8b5cf6"}} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Tanggal Tarik Tunai</label>
                <input type="date" name="tanggal" required defaultValue={new Date().toISOString().split("T")[0]} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Keterangan (Opsional)</label>
                <input type="text" name="keterangan" placeholder="Contoh: Tarik tunai untuk operasional minggu ini" style={inputStyle} />
              </div>
            </div>
            <button type="submit" disabled={isPending} style={{ marginTop: "8px", background: "#8b5cf6", color: "#fff", border: "none", padding: "14px", borderRadius: "12px", fontSize: "14px", fontWeight: 800, cursor: "pointer", opacity: isPending ? 0.7 : 1 }}>
              {isPending ? "Memproses..." : "Catat Tarik Tunai"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
