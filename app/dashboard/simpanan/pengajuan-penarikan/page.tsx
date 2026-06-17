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
  // 1. Izinkan akses
  const currentUser = await requireRole([
    "ANGGOTA", "SEKRETARIS", "BENDAHARA", "KETUA", "SUPERADMIN"
  ]);

  // 2. Ambil saldo saat ini untuk ditampilkan sebagai batas maksimal
  const { data } = await getSaldoByUserId(currentUser.id);
  const totalSaldo = Number(data?.saldo?.total_saldo || 0);

  // 3. Server Action Handler untuk Form
  async function submitPenarikan(formData: FormData) {
    "use server";
    const res = await ajukanPenarikan(formData);
    
    if (res.success) {
      // Jika sukses, lempar kembali ke halaman simpanan dengan pesan sukses
      redirect(`/dashboard/simpanan?msg=${encodeURIComponent(res.message || "Pengajuan berhasil")}`);
    } else {
      // Jika gagal, tetap di halaman ini dan tampilkan pesan error
      redirect(`/dashboard/simpanan/pengajuan-penarikan?error=${encodeURIComponent(res.error || "Gagal mengajukan penarikan")}`);
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

        .fintech-header::before, .fintech-header::after {
          content: ''; position: absolute; pointer-events: none; border-radius: 50%;
        }
        .fintech-header::before { top: -40px; left: -40px; width: 150px; height: 150px; background: rgba(255, 255, 255, 0.08); }
        .fintech-header::after { bottom: -20px; right: -60px; width: 200px; height: 200px; background: rgba(255, 255, 255, 0.05); }

        .card-form {
          background: #fff; border-radius: 16px; border: 1px solid #e2e8f0;
          box-shadow: 0 4px 16px rgba(15,45,107,.04); padding: 32px;
          max-width: 500px; margin: -45px auto 0 auto; position: relative; z-index: 20;
        }

        .form-group { margin-bottom: 20px; }
        .form-label { display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 8px; }
        .form-input {
          width: 100%; padding: 14px 16px; border-radius: 12px; border: 1.5px solid #e2e8f0;
          font-size: 15px; color: #0f172a; transition: all 0.2s ease; background: #f8fafc;
        }
        .form-input:focus { outline: none; border-color: #2563eb; background: #fff; box-shadow: 0 0 0 3px rgba(37,99,235,.12); }
        
        .btn-submit {
          width: 100%; padding: 16px; background: #2563eb; color: #fff; border: none;
          border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer;
          transition: all 0.2s ease; margin-top: 10px; box-shadow: 0 4px 12px rgba(37,99,235,0.2);
        }
        .btn-submit:hover { background: #1d4ed8; transform: translateY(-1px); }
      `}} />

      {/* --- Header Area --- */}
      <header className="fintech-header">
        <div style={{ maxWidth: "500px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          <Link 
            href="/dashboard/simpanan"
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: "rgba(255, 255, 255, 0.15)", color: "#fff",
              padding: "6px 14px", borderRadius: "20px", textDecoration: "none",
              fontSize: "13px", fontWeight: "500", backdropFilter: "blur(4px)",
              marginBottom: "16px"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Kembali
          </Link>
          <h1 style={{ color: "#fff", margin: 0, fontSize: "24px", fontWeight: "700" }}>
            Ajukan Penarikan
          </h1>
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main style={{ padding: "0 20px" }}>
        <div className="card-form">
          
          {/* Info Saldo Saat Ini */}
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "16px", borderRadius: "12px", marginBottom: "24px", textAlign: "center" }}>
            <div style={{ fontSize: "12px", color: "#166534", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
              Saldo Tersedia
            </div>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#15803d" }}>
              Rp {totalSaldo.toLocaleString("id-ID")}
            </div>
          </div>

          {/* Flash Error (Jika dana kurang dll) */}
          {searchParams.error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", fontWeight: "500" }}>
              <svg style={{ flexShrink: 0, marginTop: "2px" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{searchParams.error}</span>
            </div>
          )}

          {/* Formulir */}
          <form action={submitPenarikan}>
            <div className="form-group">
              <label className="form-label" htmlFor="nominal">Nominal Penarikan (Rp)</label>
              <input 
                type="number" 
                id="nominal" 
                name="nominal" 
                className="form-input" 
                placeholder="Contoh: 500000"
                min="10000"
                max={totalSaldo}
                required 
              />
              <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "6px" }}>Minimal penarikan Rp 10.000</p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="catatan">Catatan / Keperluan (Opsional)</label>
              <textarea 
                id="catatan" 
                name="catatan" 
                className="form-input" 
                placeholder="Contoh: Biaya pendidikan anak"
                rows={3}
              ></textarea>
            </div>

            <button type="submit" className="btn-submit">
              Kirim Pengajuan
            </button>
            <p style={{ fontSize: "12px", color: "#64748b", marginTop: "16px", textAlign: "center", lineHeight: "1.5" }}>
              Pengajuan Anda akan ditinjau oleh Bendahara Koperasi. Pencairan dana akan dilakukan setelah pengajuan disetujui.
            </p>
          </form>

        </div>
      </main>
    </div>
  );
}
