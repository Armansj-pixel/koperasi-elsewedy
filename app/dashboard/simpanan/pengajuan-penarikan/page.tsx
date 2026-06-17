import React from "react";
import { requireRole } from "@/lib/auth/session";
import { getSaldoByUserId, ajukanPenarikan } from "@/lib/simpanan/actions";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function PengajuanPenarikanPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  // 1. Izinkan akses role terlebih dahulu
  const currentUser = await requireRole([
    "ANGGOTA", "SEKRETARIS", "BENDAHARA", "KETUA", "SUPERADMIN"
  ]);

  // =====================================================================
  // LOGIKA CUT-OFF JAMINAN (Kamis 09:00 - 15:00 WIB)
  // =====================================================================
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const dayOfWeek = now.getDay(); 
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const currentTimeInMinutes = (currentHour * 60) + currentMinute;
  const cutOffStart = (9 * 60);  // Jam 09:00 = 540 menit
  const cutOffEnd = (15 * 60);   // Jam 15:00 = 900 menit

  const isCutOffTime = dayOfWeek === 4 && currentTimeInMinutes >= cutOffStart && currentTimeInMinutes < cutOffEnd;

  // Jika yang mengakses adalah ANGGOTA dan di jam cut-off, BLOKIR tampilannya
  const isAnggota = currentUser.role === "ANGGOTA";

  // =====================================================================

  // Ambil saldo saat ini
  const { data } = await getSaldoByUserId(currentUser.id);
  
  // PERUBAHAN: Sekarang form ini HANYA membaca dari saldo_sukarela, bukan total_saldo lagi
  const saldoSukarelaTersedia = Number(data?.saldo?.saldo_sukarela || 0);

  async function submitPenarikan(formData: FormData) {
    "use server";
    const res = await ajukanPenarikan(formData);
    if (res.success) {
      redirect(`/dashboard/simpanan?msg=${encodeURIComponent(res.message || "Pengajuan berhasil")}`);
    } else {
      redirect(`/dashboard/simpanan/pengajuan-penarikan?error=${encodeURIComponent(res.error || "Gagal")}`);
    }
  }

  return (
    <div style={{ backgroundColor: "#f1f5f9", minHeight: "100vh", paddingBottom: "40px" }}>
      {/* --- Global Styles --- */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; font-family: 'Inter', sans-serif; }

        .fintech-header {
          position: relative; background: linear-gradient(145deg, #0f2d6b 0%, #1a4db3 60%, #2563eb 100%);
          overflow: hidden; padding: 24px 20px 80px 20px;
          border-bottom-left-radius: 24px; border-bottom-right-radius: 24px;
        }

        .card-form {
          background: #fff; border-radius: 16px; border: 1px solid #e2e8f0;
          box-shadow: 0 4px 16px rgba(15,45,107,.04); padding: 32px;
          max-width: 500px; margin: -45px auto 0 auto; position: relative; z-index: 20;
        }
        
        .btn-submit {
          width: 100%; padding: 16px; background: #2563eb; color: #fff; border: none;
          border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer;
        }
      `}} />

      <header className="fintech-header">
        <div style={{ maxWidth: "500px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          <Link href="/dashboard/simpanan" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255, 255, 255, 0.15)", color: "#fff", padding: "6px 14px", borderRadius: "20px", textDecoration: "none", fontSize: "13px", fontWeight: "500" }}>
            Kembali
          </Link>
          <h1 style={{ color: "#fff", margin: "16px 0 0 0", fontSize: "24px", fontWeight: "700" }}>
            Ajukan Penarikan
          </h1>
        </div>
      </header>

      <main style={{ padding: "0 20px" }}>
        <div className="card-form">
          
          {/* TAMPILKAN LAYAR BLOKIR JIKA DI JAM CUT-OFF (Khusus Anggota) */}
          {isCutOffTime && isAnggota ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "54px", marginBottom: "16px" }}>⏳</div>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", marginBottom: "10px" }}>
                Sistem Penarikan Ditutup Sementara
              </h2>
              <p style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.6", marginBottom: "20px" }}>
                Setiap hari <strong style={{ color: "#b45309" }}>Kamis jam 09:00 s/d 15:00 WIB</strong>, sistem penarikan dibekukan sementara untuk proses rekapitulasi data oleh Bendahara Koperasi.
              </p>
              <div style={{ background: "#fef3c7", color: "#b45309", padding: "12px", borderRadius: "8px", fontSize: "12px", fontWeight: "600" }}>
                Silakan ajukan kembali setelah jam 15:00 WIB.
              </div>
              <Link href="/dashboard/simpanan" style={{ display: "block", marginTop: "24px", padding: "12px", background: "#f1f5f9", color: "#475569", borderRadius: "8px", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
                Kembali ke Dashboard Simpanan
              </Link>
            </div>
          ) : (
            /* TAMPILKAN FORMULIR NORMAL JIKA DI LUAR JAM CUT-OFF ATAU YANG MASUK ADALAH PENGURUS */
            <form action={submitPenarikan}>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "16px", borderRadius: "12px", marginBottom: "24px", textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: "#166534", fontWeight: "600", textTransform: "uppercase", marginBottom: "4px" }}>
                  Saldo Sukarela Tersedia
                </div>
                <div style={{ fontSize: "24px", fontWeight: "800", color: "#15803d" }}>
                  Rp {saldoSukarelaTersedia.toLocaleString("id-ID")}
                </div>
              </div>

              {searchParams.error && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontSize: "13px" }}>
                  <span>{searchParams.error}</span>
                </div>
              )}

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Nominal Penarikan (Rp)</label>
                <input 
                  type="number" 
                  name="nominal" 
                  style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1.5px solid #e2e8f0" }} 
                  placeholder="Contoh: 500000" 
                  min="10000" 
                  max={saldoSukarelaTersedia} 
                  required 
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Catatan / Keperluan (Opsional)</label>
                <textarea 
                  name="catatan" 
                  style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1.5px solid #e2e8f0" }} 
                  placeholder="Contoh: Biaya pendidikan anak" 
                  rows={3}
                ></textarea>
              </div>

              {/* Jika saldo sukarela kurang dari batas minimal penarikan (misal Rp 10.000), disable tombolnya */}
              <button 
                type="submit" 
                className="btn-submit"
                disabled={saldoSukarelaTersedia < 10000}
                style={{ opacity: saldoSukarelaTersedia < 10000 ? 0.5 : 1, cursor: saldoSukarelaTersedia < 10000 ? "not-allowed" : "pointer" }}
              >
                Kirim Pengajuan
              </button>
              
              {saldoSukarelaTersedia < 10000 && (
                <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "12px", textAlign: "center", fontWeight: "500" }}>
                  Saldo sukarela Anda tidak mencukupi untuk melakukan penarikan (Min. Rp 10.000).
                </p>
              )}
            </form>
          )}

        </div>
      </main>
    </div>
  );
}
