import React from "react";
import { requireRole } from "@/lib/auth/session";
import { getPinjamanAktifAnggota } from "@/lib/pinjaman/actions";
import { createClient } from "@/lib/supabase/server";
import AjukanPinjamanForm from "./AjukanPinjamanForm";
import Link from "next/link";

// ── CSS STYLES ──
const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  .kop-shell { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
  .kop-header { background: linear-gradient(150deg, #0a1e4a 0%, #0f2d6b 40%, #1a4db3 75%, #2563eb 100%); padding: 30px 20px 100px; position: relative; overflow: hidden; }
  .kop-orb { position: absolute; border-radius: 50%; pointer-events: none; }
  .kop-card { background: #fff; border-radius: 20px; border: 1px solid #eaeef5; box-shadow: 0 4px 28px rgba(15,45,107,.08), 0 1px 3px rgba(0,0,0,.03); margin-bottom: 20px; overflow: hidden; }
  .kop-btn-nav { display: inline-flex; align-items: center; gap: 6px; background: rgba(255, 255, 255, 0.15); color: #fff; padding: 8px 14px; border-radius: 20px; text-decoration: none; font-size: 13px; font-weight: 600; backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.2); transition: transform 0.2s, background 0.2s; }
  .kop-btn-nav:hover { background: rgba(255, 255, 255, 0.25); }
  .kop-content-wrapper { padding: 0 16px 40px; margin-top: -70px; position: relative; z-index: 20; }
  @media (min-width: 768px) { .kop-header { padding: 40px 32px 100px; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; } .kop-content-wrapper { padding: 0 32px 40px; margin-top: -70px; } }
`;

export default async function AjukanPinjamanPage({
  searchParams,
}: {
  // 1. Tambahkan parameter 'view' di sini agar Next.js membacanya
  searchParams: { error?: string; view?: string };
}) {
  const currentUser = await requireRole(["ANGGOTA", "BENDAHARA", "SUPERADMIN"]);
  const supabase = await createClient();

  // 2. KUNCI PERBAIKAN: Deteksi apakah URL memiliki ?view=personal
  const isPersonalView = searchParams.view === "personal";
  const hasAdminRole = ["BENDAHARA", "SUPERADMIN"].includes(currentUser.role);
  
  // Override hanya aktif jika punya role Admin DAN TIDAK SEDANG di mode personal
  const canOverride = hasAdminRole && !isPersonalView;

  // 3. AMBIL DATA ANGGOTA (Hanya diambil untuk dropdown jika dia pengurus & bukan personal view)
  let anggotaList: any[] = [];
  if (canOverride) {
    const { data: users } = await supabase
      .from('users')
      .select('id, nama, nik')
      .eq('role', 'ANGGOTA')
      .order('nama', { ascending: true });
    anggotaList = users || [];
  }

  // 4. LOGIKA BLOKIR
  const pinjamanAktif = await getPinjamanAktifAnggota(currentUser.id);
  
  let blockReason = "";
  let isEligibleForTopUp = false;
  let sisaCicilanLama = 0;
  let idPinjamanLama = null;

  if (pinjamanAktif.length > 0) {
    const p = pinjamanAktif[0];
    if (["PENDING_L1", "PENDING_L2", "PENDING_L3", "APPROVED"].includes(p.status)) {
      blockReason = "Masih ada pengajuan pinjaman yang sedang diproses. Harap tunggu hingga proses selesai.";
      idPinjamanLama = p.id;
    } else if (p.status === "ACTIVE") {
      const { count } = await supabase
        .from('cicilan_pinjaman')
        .select('*', { count: 'exact', head: true })
        .eq('pinjaman_id', p.id)
        .in('status', ['SCHEDULED', 'OVERDUE']);

      sisaCicilanLama = count || 0;

      // Jika canOverride false (karena mode personal atau anggota biasa), aturan maksimal 3 berlaku KETAT
      if (sisaCicilanLama > 3 && !canOverride) {
        blockReason = `Anda tidak dapat mengajukan pinjaman baru. Sisa cicilan Anda saat ini masih ${sisaCicilanLama} kali (Syarat normal Top-Up maksimal sisa 3 cicilan).`;
        idPinjamanLama = p.id;
      } else {
        isEligibleForTopUp = true;
      }
    }
  }

  // Pengurus (di mode admin) memegang Kunci Master, hilangkan blokir
  if (canOverride) {
    blockReason = ""; 
  }

  const backLink = isPersonalView ? "/dashboard/pinjaman?view=personal" : "/dashboard/pinjaman";

  return (
    <main className="kop-shell bg-slate-100 min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div className="w-full max-w-5xl mx-auto bg-slate-100 min-h-screen relative sm:shadow-xl sm:border-x sm:border-slate-200">
        
        {/* --- Header Area --- */}
        <header className="kop-header">
          <div className="kop-orb" style={{ width: 280, height: 280, top: -100, right: -100, background: 'radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 70%)' }} />
          <div className="kop-orb" style={{ width: 200, height: 200, bottom: -40, left: -40, background: 'radial-gradient(circle, rgba(96,165,250,.2) 0%, transparent 70%)' }} />
          
          <div style={{ position: "relative", zIndex: 10, maxWidth: "640px", margin: "0 auto" }}>
            <Link href={backLink} className="kop-btn-nav" style={{ marginBottom: "20px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Kembali
            </Link>
            <h1 style={{ color: "#fff", margin: 0, fontSize: "28px", fontWeight: "800", letterSpacing: "-.02em" }}>
              {canOverride ? "Formulir Override Pinjaman" : "Formulir Pinjaman Saya"}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.8)", margin: "4px 0 0 0", fontSize: "14px", fontWeight: "500" }}>
              {canOverride ? "Pengajuan pembiayaan khusus (Admin Mode)." : "Pengajuan pembiayaan baru atau Top-Up."}
            </p>
          </div>
        </header>

        {/* --- Main Content Area --- */}
        <div className="kop-content-wrapper">
          <div style={{ maxWidth: "640px", margin: "0 auto" }}>
            
            {searchParams.error && (
              <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#b91c1c", borderRadius: "14px", padding: "16px", marginBottom: "20px", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>{searchParams.error}</span>
              </div>
            )}

            {blockReason ? (
              <div className="kop-card" style={{ padding: "40px 24px", textAlign: "center" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div style={{ fontWeight: "800", fontSize: "18px", color: "#0f172a", marginBottom: "8px" }}>
                  Pengajuan Diblokir Sistem
                </div>
                <div style={{ fontSize: "14px", color: "#475569", marginBottom: "24px", lineHeight: "1.6", fontWeight: "500", maxWidth: "400px", margin: "0 auto 24px" }}>
                  {blockReason}
                </div>
                {idPinjamanLama && (
                  <Link href={`/dashboard/pinjaman/${idPinjamanLama}?view=personal`} style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#f8fafc", color: "#1e293b", padding: "12px 24px", borderRadius: "12px", fontWeight: "800", fontSize: "13px", textDecoration: "none", border: "1.5px solid #e2e8f0" }}>
                    Cek Pinjaman Aktif <span style={{ fontSize: "16px" }}>&rarr;</span>
                  </Link>
                )}
              </div>
            ) : (
              <>
                {isEligibleForTopUp && !canOverride && (
                  <div style={{ background: "linear-gradient(to right, #f0fdf4, #dcfce7)", border: "1.5px solid #bbf7d0", color: "#166534", borderRadius: "16px", padding: "16px 20px", marginBottom: "20px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ fontSize: "20px" }}>✨</div>
                    <div>
                      <div style={{ fontWeight: "800", fontSize: "14px", marginBottom: "4px" }}>Memenuhi Syarat Top-Up!</div>
                      <div style={{ fontSize: "13px", fontWeight: "500", lineHeight: "1.5" }}>
                        Sisa cicilan tinggal {sisaCicilanLama} kali. Pencairan baru akan otomatis dipotong untuk melunasi sisa pinjaman lama Anda.
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="kop-card" style={{ padding: "24px" }}>
                  <AjukanPinjamanForm canOverride={canOverride} anggotaList={anggotaList} />
                </div>
              </>
            )}

            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", marginTop: "20px" }}>
              <div style={{ fontWeight: "800", fontSize: "14px", color: "#0f172a", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                Syarat & Ketentuan Kebijakan
              </div>
              <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px", color: "#475569", lineHeight: "1.6", fontWeight: "500", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>Anggota aktif koperasi PT Elsewedy Electric Indonesia</li>
                <li><strong style={{ color: "#0f172a" }}>Plafon maksimal pengajuan Rp 15.000.000</strong></li>
                <li><strong style={{ color: "#0f172a" }}>Tenor maksimal 12 bulan</strong></li>
                <li>Biaya admin 4% akan dipotong otomatis di awal pencairan</li>
                <li>Persetujuan 3 level: Sekretaris &rarr; Bendahara &rarr; Ketua</li>
                <li>Berlaku sistem <strong style={{ color: "#0f172a" }}>Auto-Settlement</strong> untuk Top-Up</li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
