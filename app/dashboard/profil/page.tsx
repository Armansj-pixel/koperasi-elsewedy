import React from "react";
import { requireRole } from "@/lib/auth/session";
import { getProfilSaya } from "@/lib/profil/actions";
import Link from "next/link";

const ROLE_LABEL: Record<string, { label: string; bg: string; color: string; border: string }> = {
  ANGGOTA: { label: "Anggota", bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  SEKRETARIS: { label: "Sekretaris", bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
  BENDAHARA: { label: "Bendahara", bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  KETUA: { label: "Ketua Koperasi", bg: "#faf5ff", color: "#7e22ce", border: "#e9d5ff" },
  SUPERADMIN: { label: "Super Admin", bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" },
};

function formatRupiah(n: number) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

function formatTanggal(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function getInisial(nama: string) {
  return nama
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ── CSS STYLES ──
const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  .kop-shell { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
  
  .kop-header {
    background: linear-gradient(150deg, #0a1e4a 0%, #0f2d6b 40%, #1a4db3 75%, #2563eb 100%);
    padding: 30px 20px 100px;
    position: relative; overflow: hidden;
  }
  .kop-orb { position: absolute; border-radius: 50%; pointer-events: none; }

  .kop-card {
    background: #fff;
    border-radius: 20px;
    border: 1.5px solid #e2e8f0;
    box-shadow: 0 4px 28px rgba(15,45,107,.05);
    padding: 24px;
    margin-bottom: 20px;
  }

  .kop-btn-nav {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(255, 255, 255, 0.15); color: #fff;
    padding: 8px 14px; border-radius: 20px;
    text-decoration: none; font-size: 13px; font-weight: 600;
    backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.2);
    transition: transform 0.2s, background 0.2s;
  }
  .kop-btn-nav:hover { background: rgba(255, 255, 255, 0.25); transform: translateY(-1px); }

  .kop-action-card {
    display: flex; align-items: center; gap: 16px; padding: 18px 20px;
    background: #fff; border: 1.5px solid #e2e8f0; border-radius: 16px;
    text-decoration: none; transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,.02);
  }
  .kop-action-card:hover {
    border-color: #3b82f6; box-shadow: 0 8px 24px rgba(59,130,246,.1); transform: translateY(-2px);
  }

  .kop-list-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px dashed #e2e8f0; }
  .kop-list-item:last-child { border-bottom: none; padding-bottom: 0; }

  .kop-content-wrapper { padding: 0 16px 40px; margin-top: -70px; position: relative; z-index: 20; }
  
  @media (min-width: 768px) {
    .kop-header { padding: 40px 32px 100px; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; }
    .kop-content-wrapper { padding: 0 32px 40px; margin-top: -70px; }
  }
`;

export default async function ProfilPage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string };
}) {
  await requireRole(["ANGGOTA", "SUPERADMIN", "SEKRETARIS", "BENDAHARA", "KETUA"]);

  const { data: profil, error } = await getProfilSaya();

  if (!profil || error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ textAlign: "center", color: "#64748b", background: "#fff", padding: "32px", borderRadius: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
          <svg style={{ margin: "0 auto 16px", color: "#cbd5e1" }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div style={{ fontWeight: "700", fontSize: "18px", color: "#0f172a", marginBottom: "8px" }}>Gagal Memuat Data</div>
          <div style={{ fontSize: "14px" }}>{error || "Profil tidak ditemukan."}</div>
        </div>
      </div>
    );
  }

  const roleInfo = ROLE_LABEL[profil.role] ?? { label: profil.role, bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" };

  // Fallback ke 0 jika data tidak ada, agar aman dari undefined
  const wajib = profil.simpanan_wajib_bulanan || 0;
  const sukarela = profil.simpanan_sukarela_bulanan || 0;

  return (
    <main className="kop-shell bg-slate-100 min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div className="w-full max-w-5xl mx-auto bg-slate-100 min-h-screen relative sm:shadow-xl sm:border-x sm:border-slate-200">
        
        {/* --- Header Area --- */}
        <header className="kop-header">
          <div className="kop-orb" style={{ width: 280, height: 280, top: -100, right: -100, background: 'radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 70%)' }} />
          <div className="kop-orb" style={{ width: 200, height: 200, bottom: -40, left: -40, background: 'radial-gradient(circle, rgba(96,165,250,.2) 0%, transparent 70%)' }} />
          
          <div style={{ position: "relative", zIndex: 10, maxWidth: "640px", margin: "0 auto" }}>
            <Link href="/dashboard" className="kop-btn-nav" style={{ marginBottom: "24px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Dashboard
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div
                style={{
                  width: "80px", height: "80px", borderRadius: "24px",
                  background: profil.foto_profil ? "#fff" : "linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))",
                  border: "3px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden", flexShrink: 0, boxShadow: "0 8px 24px rgba(0,0,0,0.15)"
                }}
              >
                {profil.foto_profil ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profil.foto_profil} alt={profil.nama} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ color: "#fff", fontSize: "28px", fontWeight: "800", letterSpacing: "1px" }}>{getInisial(profil.nama)}</span>
                )}
              </div>
              <div>
                <h1 style={{ color: "#fff", margin: 0, fontSize: "26px", fontWeight: "800", letterSpacing: "-.02em" }}>{profil.nama}</h1>
                <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "14px", marginTop: "4px", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Bergabung {formatTanggal(profil.tanggal_bergabung)}
                </div>
                <div style={{ marginTop: "10px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ background: roleInfo.bg, color: roleInfo.color, border: `1px solid ${roleInfo.border}`, padding: "4px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: ".05em" }}>
                    {roleInfo.label}
                  </span>
                  <span style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "700", fontFamily: "monospace" }}>
                    NIK: {profil.nik}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* --- Main Content Area --- */}
        <div className="kop-content-wrapper">
          <div style={{ maxWidth: "640px", margin: "0 auto" }}>
            
            {/* Notifikasi */}
            {searchParams.success && (
              <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", color: "#15803d", borderRadius: "14px", padding: "14px 18px", marginBottom: "16px", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span>{searchParams.success}</span>
              </div>
            )}
            {searchParams.error && (
              <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#b91c1c", borderRadius: "14px", padding: "14px 18px", marginBottom: "16px", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>{searchParams.error}</span>
              </div>
            )}

            {!profil.is_active && (
              <div style={{ background: "linear-gradient(to right, #fff1f2, #ffe4e6)", border: "1.5px solid #fecaca", color: "#be123c", borderRadius: "16px", padding: "16px 20px", marginBottom: "20px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{ fontSize: "20px" }}>⚠️</div>
                <div>
                  <div style={{ fontWeight: "800", fontSize: "14px", marginBottom: "4px" }}>Akun Nonaktif</div>
                  <div style={{ fontSize: "13px", fontWeight: "600", lineHeight: "1.5" }}>Akun Anda saat ini dinonaktifkan. Hubungi pengurus koperasi untuk informasi lebih lanjut.</div>
                </div>
              </div>
            )}

            {/* Info Keanggotaan & Keuangan */}
            <div className="kop-card">
              <div style={{ fontWeight: "800", fontSize: "15px", color: "#0f172a", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Profil Keuangan
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div className="kop-list-item">
                  <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>Nomor Rekening Bank</span>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a", fontFamily: "monospace", letterSpacing: ".05em" }}>{profil.no_rekening || "Belum Diatur"}</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", marginTop: "2px" }}>{profil.nama_bank || "Nama Bank Belum Diatur"}</div>
                  </div>
                </div>
                <div className="kop-list-item">
                  <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>Potongan Simp. Wajib / Bln</span>
                  <span style={{ fontSize: "14px", fontWeight: "800", color: "#16a34a" }}>{formatRupiah(wajib)}</span>
                </div>
                <div className="kop-list-item">
                  <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>Potongan Simp. Sukarela / Bln</span>
                  <span style={{ fontSize: "14px", fontWeight: "800", color: "#16a34a" }}>{formatRupiah(sukarela)}</span>
                </div>
              </div>
              <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px dashed #e2e8f0", fontSize: "12px", color: "#94a3b8", fontWeight: "500", lineHeight: "1.5" }}>
                <strong style={{ color: "#64748b" }}>Catatan:</strong> NIK, rekening bank, dan nominal potongan simpanan hanya dapat diubah oleh administrator atau pengurus koperasi.
              </div>
            </div>

            {/* Info Kontak Pribadi */}
            <div className="kop-card">
              <div style={{ fontWeight: "800", fontSize: "15px", color: "#0f172a", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Kontak & Personal
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div className="kop-list-item">
                  <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>Alamat Email</span>
                  <span style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>{profil.email || "Belum Diatur"}</span>
                </div>
                <div className="kop-list-item">
                  <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>No HP / WhatsApp</span>
                  <span style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>{profil.no_hp || "Belum Diatur"}</span>
                </div>
              </div>
            </div>

            {/* Aksi & Pengaturan */}
            <div style={{ marginBottom: "24px" }}>
              <Link href="/dashboard/profil/edit" className="kop-action-card">
                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid #bfdbfe" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a", marginBottom: "2px" }}>Perbarui Data Diri</div>
                  <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>Ubah foto profil, alamat email, dan nomor HP</div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>

            {/* Info Password Reset */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "16px 20px" }}>
              <div style={{ color: "#94a3b8", marginTop: "2px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", lineHeight: "1.6", fontWeight: "500" }}>
                <strong style={{ color: "#475569" }}>Kendala Akses?</strong><br />
                Jika Anda lupa atau ingin mengubah kata sandi (password), silakan hubungi Administrator atau pengurus Koperasi untuk melakukan reset akun.
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
