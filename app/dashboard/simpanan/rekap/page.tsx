import React from "react";
import { requireRole } from "@/lib/auth/session";
import { getListPenarikan } from "@/lib/simpanan/actions";
import Link from "next/link";

export default async function RekapPenarikanPage() {
  // 1. Kunci hanya untuk Pengurus
  await requireRole(["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS"]);

  // 2. Ambil HANYA data yang berstatus PENDING
  const { data: penarikanList } = await getListPenarikan("PENDING");

  // 3. Hitung total uang yang harus dicairkan
  const totalCair = penarikanList.reduce((sum: number, item: any) => {
    return sum + Number(item.nominal || 0);
  }, 0);

  // 4. Deteksi apakah saat ini SEDANG dalam masa cut-off
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const isKamis = now.getDay() === 4;
  const currentMinute = (now.getHours() * 60) + now.getMinutes();
  const isCutOffActive = isKamis && currentMinute >= (9 * 60) && currentMinute < (15 * 60);

  return (
    <div style={{ backgroundColor: "#f1f5f9", minHeight: "100vh", paddingBottom: "40px" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; font-family: 'Inter', sans-serif; }

        .fintech-header {
          position: relative; background: linear-gradient(145deg, #0f2d6b 0%, #1a4db3 60%, #2563eb 100%);
          overflow: hidden; padding: 24px 20px 80px 20px;
          border-bottom-left-radius: 24px; border-bottom-right-radius: 24px;
        }

        .card-rekap {
          background: #fff; border-radius: 16px; border: 1px solid #e2e8f0;
          box-shadow: 0 4px 16px rgba(15,45,107,.04); padding: 24px;
          margin-bottom: 24px;
        }

        .table-rekap { width: 100%; border-collapse: collapse; text-align: left; }
        .table-rekap th { padding: 12px 16px; background: #f8fafc; color: #64748b; font-size: 13px; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
        .table-rekap td { padding: 16px; font-size: 14px; color: #1e293b; border-bottom: 1px solid #f1f5f9; }

        @media print {
          body { background: #fff; }
          .no-print { display: none !important; }
          .fintech-header { background: #fff !important; color: #000 !important; padding: 0; height: auto; }
          h1, p, th, td { color: #000 !important; }
          .card-rekap { box-shadow: none; border: none; padding: 0; }
        }
      `}} />

      {/* HEADER */}
      <header className="fintech-header">
        <div style={{ maxWidth: "900px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          <div className="no-print" style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Link href="/dashboard/simpanan" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255, 255, 255, 0.15)", color: "#fff", padding: "6px 14px", borderRadius: "20px", textDecoration: "none", fontSize: "13px", fontWeight: "500" }}>
              Kembali
            </Link>
            
            {/* Tombol Cetak Dokumen untuk Bendahara */}
            <button onClick={() => window.print()} style={{ background: "#fff", color: "#1d4ed8", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Cetak PDF
            </button>
          </div>
          
          <h1 style={{ color: "#fff", margin: 0, fontSize: "28px", fontWeight: "800" }}>Rekapitulasi Penarikan</h1>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", marginTop: "8px" }}>
            Laporan pengajuan berstatus PENDING untuk dieksekusi Bendahara.
          </p>
        </div>
      </header>

      {/* KONTEN */}
      <main style={{ maxWidth: "900px", margin: "-40px auto 0 auto", padding: "0 20px", position: "relative", zIndex: 20 }}>
        
        {/* Status Indikator Cut-Off */}
        <div className="card-rekap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: isCutOffActive ? "#fffbeb" : "#fff", borderColor: isCutOffActive ? "#fcd34d" : "#e2e8f0" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: "700", color: isCutOffActive ? "#b45309" : "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
              Status Sistem Saat Ini
            </div>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
              {isCutOffActive ? "🔴 Masa Cut-Off Aktif (Terkunci)" : "🟢 Sistem Terbuka (Menerima Pengajuan)"}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>Total Kebutuhan Dana Cair</div>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#dc2626" }}>Rp {totalCair.toLocaleString("id-ID")}</div>
          </div>
        </div>

        {/* Tabel Data Rekap */}
        <div className="card-rekap" style={{ padding: 0, overflow: "hidden" }}>
          {penarikanList.length === 0 ? (
             <div style={{ padding: "48px 20px", textAlign: "center", color: "#94a3b8" }}>
               <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎉</div>
               <div style={{ fontWeight: "600", fontSize: "16px", color: "#0f172a" }}>Tidak ada antrean penarikan</div>
               <div style={{ fontSize: "13px", marginTop: "4px" }}>Bendahara bisa bersantai minggu ini.</div>
             </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="table-rekap">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Anggota</th>
                    <th>Info Rekening Tujuan</th>
                    <th style={{ textAlign: "right" }}>Nominal Pengajuan</th>
                  </tr>
                </thead>
                <tbody>
                  {penarikanList.map((item: any, idx: number) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: "600", color: "#64748b" }}>{idx + 1}</td>
                      <td>
                        <div style={{ fontWeight: "700", color: "#0f2d6b" }}>{item.users?.nama}</div>
                        <div style={{ fontSize: "12px", color: "#64748b", fontFamily: "monospace" }}>NIK: {item.users?.nik}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: "600", color: "#1e293b" }}>{item.users?.nama_bank || "CASH / TUNAI"}</div>
                        {item.users?.no_rekening && (
                          <div style={{ fontSize: "13px", color: "#64748b", fontFamily: "monospace" }}>{item.users.no_rekening}</div>
                        )}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: "800", color: "#16a34a" }}>
                        Rp {Number(item.nominal).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Aksi */}
        {penarikanList.length > 0 && (
          <div className="no-print" style={{ textAlign: "center", marginTop: "24px" }}>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>
              Pastikan Anda mencetak rekap ini atau menyalin nominal di atas sebelum masuk ke portal persetujuan.
            </p>
            <Link href="/dashboard/simpanan/penarikan" style={{ display: "inline-block", background: "#2563eb", color: "#fff", padding: "12px 24px", borderRadius: "12px", fontWeight: "700", textDecoration: "none", boxShadow: "0 4px 12px rgba(37,99,235,0.2)" }}>
              Proses Persetujuan Sekarang &rarr;
            </Link>
          </div>
        )}

      </main>
    </div>
  );
}
