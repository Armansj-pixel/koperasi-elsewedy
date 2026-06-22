import React from "react";
import { requireRole } from "@/lib/auth/session";
import { getSaldoByUserId, ajukanPenarikan } from "@/lib/simpanan/actions";
import Link from "next/link";
import { redirect } from "next/navigation";

// CSS diekstrak ke variabel string agar tidak membuat compiler Vercel SWC error
const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  .kop-shell { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
  
  /* ── Header ── */
  .kop-header {
    background: linear-gradient(150deg, #0a1e4a 0%, #0f2d6b 40%, #1a4db3 75%, #2563eb 100%);
    padding: 30px 20px 100px;
    position: relative; overflow: hidden;
  }
  .kop-orb { position: absolute; border-radius: 50%; pointer-events: none; }

  /* ── Card Base ── */
  .kop-card {
    background: #fff;
    border-radius: 20px;
    border: 1px solid #eaeef5;
    box-shadow: 0 4px 28px rgba(15,45,107,.08), 0 1px 3px rgba(0,0,0,.03);
    margin-bottom: 16px;
    overflow: hidden;
  }

  .kop-btn-nav {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(255, 255, 255, 0.15); color: #fff;
    padding: 8px 14px; border-radius: 20px;
    text-decoration: none; font-size: 13px; font-weight: 600;
    backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.2);
    transition: transform 0.2s, background 0.2s;
  }
  .kop-btn-nav:hover { background: rgba(255, 255, 255, 0.25); }
  .kop-btn-nav:active { transform: scale(0.95); }

  /* ── Form Inputs ── */
  .kop-input-wrap { margin-bottom: 20px; }
  .kop-label {
    display: block; font-size: 13px; font-weight: 700; color: #1e293b;
    margin-bottom: 8px; letter-spacing: -.01em;
  }
  
  .kop-input {
    width: 100%; padding: 16px; border-radius: 14px;
    border: 1.5px solid #e2e8f0; font-size: 14px; font-weight: 600;
    color: #0f172a; background: #fff; transition: all 0.2s ease;
    font-family: inherit;
  }
  .kop-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59,130,246,.15); }
  .kop-input::placeholder { color: #94a3b8; font-weight: 400; }

  /* Input Nominal (Rp) */
  .kop-input-curr { position: relative; }
  .kop-input-curr::before {
    content: 'Rp'; position: absolute; left: 16px; top: 50%;
    transform: translateY(-50%); font-size: 15px; font-weight: 800;
    color: #64748b; pointer-events: none;
  }
  .kop-input-curr .kop-input { padding-left: 46px; font-weight: 800; font-size: 15px; }

  /* ── Button Submit ── */
  .kop-btn-submit {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
    background: linear-gradient(135deg, #1d4ed8, #1e40af);
    color: #fff; border: none; padding: 16px; border-radius: 14px;
    font-size: 15px; font-weight: 800; cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s; font-family: inherit;
    box-shadow: 0 4px 12px rgba(29,78,216,.2);
  }
  .kop-btn-submit:hover:not(:disabled) { box-shadow: 0 8px 20px rgba(29,78,216,.3); transform: translateY(-2px); }
  .kop-btn-submit:active:not(:disabled) { transform: scale(0.97); }
  .kop-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; background: #94a3b8; box-shadow: none; transform: none; }

  /* ── RESPONSIVE RULES ── */
  .kop-content-wrapper { padding: 0 16px 40px; margin-top: -70px; position: relative; z-index: 20; }
  
  @media (min-width: 768px) {
    .kop-header { padding: 40px 32px 100px; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; }
    .kop-content-wrapper { padding: 0 32px 40px; margin-top: -70px; }
  }
`;

export default async function PengajuanPenarikanPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  // 1. Izinkan akses role terlebih dahulu
  const currentUser = await requireRole([
    "ANGGOTA", "SEKRETARIS", "BENDAHARA", "KETUA", "SUPERADMIN"
  ]);

  // Cek apakah user adalah pengurus untuk mengatur rute kembali
  const isPengurus = ["SUPERADMIN", "BENDAHARA", "SEKRETARIS", "KETUA"].includes(currentUser.role);
  const returnPath = isPengurus ? "/dashboard/simpanan?view=personal" : "/dashboard/simpanan";

  // =====================================================================
  // LOGIKA CUT-OFF JAMINAN (Jumat 09:00 - 15:00 WIB)
  // =====================================================================
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const dayOfWeek = now.getDay(); 
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const currentTimeInMinutes = (currentHour * 60) + currentMinute;
  const cutOffStart = (9 * 60);  // Jam 09:00 = 540 menit
  const cutOffEnd = (15 * 60);   // Jam 15:00 = 900 menit

  const isCutOffTime = dayOfWeek === 5 && currentTimeInMinutes >= cutOffStart && currentTimeInMinutes < cutOffEnd;

  // Jika yang mengakses adalah ANGGOTA dan di jam cut-off, BLOKIR tampilannya
  const isAnggota = currentUser.role === "ANGGOTA";
  // =====================================================================

  // Ambil saldo saat ini
  const { data } = await getSaldoByUserId(currentUser.id);
  
  // Form ini HANYA membaca dari saldo_sukarela
  const saldoSukarelaTersedia = Number(data?.saldo?.saldo_sukarela || 0);

  async function submitPenarikan(formData: FormData) {
    "use server";
    const res = await ajukanPenarikan(formData);
    if (res.success) {
      // Jika pengurus, kembalikan ke view personal agar tidak dilempar ke tabel admin
      const redirectUrl = isPengurus 
        ? `/dashboard/simpanan?view=personal&msg=${encodeURIComponent(res.message || "Pengajuan berhasil")}`
        : `/dashboard/simpanan?msg=${encodeURIComponent(res.message || "Pengajuan berhasil")}`;
      
      redirect(redirectUrl);
    } else {
      redirect(`/dashboard/simpanan/pengajuan-penarikan?error=${encodeURIComponent(res.error || "Gagal")}`);
    }
  }

  return (
    <main className="kop-shell bg-slate-100 min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div className="w-full max-w-5xl mx-auto bg-slate-100 min-h-screen relative sm:shadow-xl sm:border-x sm:border-slate-200">
        
        {/* --- Header Area --- */}
        <header className="kop-header">
          <div className="kop-orb" style={{ width: 280, height: 280, top: -100, right: -100, background: 'radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 70%)' }} />
          <div className="kop-orb" style={{ width: 200, height: 200, bottom: -40, left: -40, background: 'radial-gradient(circle, rgba(96,165,250,.2) 0%, transparent 70%)' }} />
          
          <div style={{ position: "relative", zIndex: 10, maxWidth: "600px", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Link href={returnPath} className="kop-btn-nav">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Kembali
              </Link>
            </div>

            <h1 style={{ 
              color: "#fff", margin: "24px 0 0 0", fontSize: "24px", fontWeight: "800",
              letterSpacing: "-.02em", display: "flex", alignItems: "center", gap: "10px"
            }}>
              <div style={{ background: "rgba(255,255,255,0.2)", padding: "8px", borderRadius: "12px", display: "flex" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
              Pengajuan Penarikan
            </h1>
          </div>
        </header>

        {/* --- Main Content Area --- */}
        <div className="kop-content-wrapper">
          {/* Lebar container form dibatasi maksimal 600px agar rapi di layar PC */}
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div className="kop-card" style={{ padding: "32px 24px" }}>
              
              {/* TAMPILKAN LAYAR BLOKIR JIKA DI JAM CUT-OFF (Khusus Anggota) */}
              {isCutOffTime && isAnggota ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ width: "80px", height: "80px", background: "#fefce8", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706", margin: "0 auto 20px" }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", marginBottom: "10px" }}>
                    Sistem Penarikan Ditutup Sementara
                  </h2>
                  <p style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.6", margin: "0 auto 24px", maxWidth: "400px" }}>
                    Setiap hari <strong style={{ color: "#b45309" }}>Jumat jam 09:00 s/d 15:00 WIB</strong>, sistem penarikan dibekukan untuk proses rekapitulasi data oleh Bendahara Koperasi.
                  </p>
                  <div style={{ background: "#fffbeb", border: "1px solid #fde68a", color: "#b45309", padding: "14px", borderRadius: "12px", fontSize: "13px", fontWeight: "700" }}>
                    Silakan ajukan kembali setelah jam 15:00 WIB.
                  </div>
                  <Link href={returnPath} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "24px", padding: "14px", background: "#f1f5f9", color: "#475569", borderRadius: "12px", textDecoration: "none", fontSize: "14px", fontWeight: "700", transition: "background 0.2s" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Kembali ke Simpanan
                  </Link>
                </div>
              ) : (
                /* TAMPILKAN FORMULIR NORMAL JIKA DI LUAR JAM CUT-OFF ATAU YANG MASUK ADALAH PENGURUS */
                <form action={submitPenarikan}>
                  
                  {/* Saldo Display */}
                  <div style={{ background: "linear-gradient(145deg, #f0fdf4, #dcfce7)", border: "1.5px solid #bbf7d0", padding: "20px", borderRadius: "16px", marginBottom: "28px", textAlign: "center", boxShadow: "0 4px 12px rgba(21,128,61,0.06)" }}>
                    <div style={{ fontSize: "12px", color: "#166534", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: "6px" }}>
                      Saldo Sukarela Tersedia
                    </div>
                    <div style={{ fontSize: "32px", fontWeight: "900", color: "#15803d", letterSpacing: "-.02em" }}>
                      Rp {saldoSukarelaTersedia.toLocaleString("id-ID")}
                    </div>
                  </div>

                  {/* Error Alert */}
                  {searchParams.error && (
                    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "14px 16px", borderRadius: "12px", marginBottom: "24px", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      <span>{searchParams.error}</span>
                    </div>
                  )}

                  {/* Input Nominal */}
                  <div className="kop-input-wrap kop-input-curr">
                    <label className="kop-label">Nominal Penarikan</label>
                    <input 
                      type="number" 
                      name="nominal" 
                      className="kop-input"
                      placeholder="Contoh: 500000" 
                      min="10000" 
                      max={saldoSukarelaTersedia} 
                      required 
                    />
                    <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px", fontWeight: "500" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                      Minimal penarikan Rp 10.000
                    </p>
                  </div>

                  {/* Textarea Catatan */}
                  <div className="kop-input-wrap">
                    <label className="kop-label">Catatan / Keperluan (Opsional)</label>
                    <textarea 
                      name="catatan" 
                      className="kop-input"
                      style={{ resize: "vertical", minHeight: "100px" }}
                      placeholder="Contoh: Biaya pendidikan anak" 
                      rows={3}
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <div style={{ marginTop: "32px" }}>
                    <button 
                      type="submit" 
                      className="kop-btn-submit"
                      disabled={saldoSukarelaTersedia < 10000}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      Kirim Pengajuan
                    </button>
                    
                    {saldoSukarelaTersedia < 10000 && (
                      <div style={{ marginTop: "16px", padding: "12px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                        <p style={{ margin: 0, fontSize: "12px", color: "#ef4444", textAlign: "center", fontWeight: "600" }}>
                          Saldo sukarela Anda tidak mencukupi untuk melakukan penarikan.
                        </p>
                      </div>
                    )}
                  </div>

                </form>
              )}

            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
