import React from "react";
import { requireRole } from "@/lib/auth/session";
import { getProfilSaya } from "@/lib/profil/actions";
import Link from "next/link";

const ROLE_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  ANGGOTA: { label: "Anggota", bg: "#dbeafe", color: "#1d4ed8" },
  SEKRETARIS: { label: "Sekretaris", bg: "#fef3c7", color: "#b45309" },
  BENDAHARA: { label: "Bendahara", bg: "#dcfce7", color: "#15803d" },
  KETUA: { label: "Ketua Koperasi", bg: "#f3e8ff", color: "#7e22ce" },
  SUPERADMIN: { label: "Super Admin", bg: "#fee2e2", color: "#b91c1c" },
};

function formatRupiah(n: number) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

function formatTanggal(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function getInisial(nama: string) {
  return nama
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function ProfilPage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string };
}) {
  await requireRole(["ANGGOTA", "SUPERADMIN", "SEKRETARIS", "BENDAHARA", "KETUA"]);

  const { data: profil, error } = await getProfilSaya();

  if (!profil || error) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
        Gagal memuat profil: {error}
      </div>
    );
  }

  const roleInfo = ROLE_LABEL[profil.role] ?? { label: profil.role, bg: "#f1f5f9", color: "#64748b" };

  // Fallback ke 0 jika data tidak ada, agar aman dari undefined
  const wajib = profil.simpanan_wajib_bulanan || 0;
  const sukarela = profil.simpanan_sukarela_bulanan || 0;

  return (
    <div style={{ backgroundColor: "#f1f5f9", minHeight: "100vh", paddingBottom: "40px" }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; font-family: 'Inter', sans-serif; }

        .fintech-header {
          position: relative;
          background: linear-gradient(145deg, #0f2d6b 0%, #1a4db3 60%, #2563eb 100%);
          overflow: hidden;
          padding: 24px 20px;
          height: 260px;
          border-bottom-left-radius: 24px;
          border-bottom-right-radius: 24px;
        }
        .fintech-header::before, .fintech-header::after {
          content: ''; position: absolute; pointer-events: none; border-radius: 50%;
        }
        .fintech-header::before { top: -40px; left: -40px; width: 150px; height: 150px; background: rgba(255,255,255,0.08); }
        .fintech-header::after { bottom: -20px; right: -60px; width: 200px; height: 200px; background: rgba(255,255,255,0.05); }

        .card-fintech {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 12px rgba(15,45,107,.06);
          padding: 24px;
        }

        .profil-action-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          text-decoration: none;
          transition: background 0.15s ease;
        }
        .profil-action-btn:hover {
          background: #f8fafc;
        }
      `,
        }}
      />

      <header className="fintech-header">
        <div style={{ maxWidth: "640px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.2)",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "20px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "500",
              backdropFilter: "blur(4px)",
              marginBottom: "20px",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: profil.foto_profil ? "transparent" : "rgba(255,255,255,0.2)",
                border: "3px solid rgba(255,255,255,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {profil.foto_profil ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profil.foto_profil} alt={profil.nama} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ color: "#fff", fontSize: "26px", fontWeight: "700" }}>{getInisial(profil.nama)}</span>
              )}
            </div>
            <div>
              <h1 style={{ color: "#fff", margin: 0, fontSize: "22px", fontWeight: "700" }}>{profil.nama}</h1>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px", marginTop: "2px" }}>NIK {profil.nik}</div>
              <span
                style={{
                  display: "inline-block",
                  marginTop: "8px",
                  background: roleInfo.bg,
                  color: roleInfo.color,
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "700",
                }}
              >
                {roleInfo.label}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "640px", margin: "-60px auto 0 auto", padding: "0 20px", position: "relative", zIndex: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {searchParams.success && (
            <div style={{ background: "#dcfce7", border: "1px solid #bbf7d0", color: "#15803d", borderRadius: "12px", padding: "14px 18px", fontSize: "14px", fontWeight: "500" }}>
              ✓ {searchParams.success}
            </div>
          )}
          {searchParams.error && (
            <div style={{ background: "#fee2e2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: "12px", padding: "14px 18px", fontSize: "14px", fontWeight: "500" }}>
              ✗ {searchParams.error}
            </div>
          )}

          {!profil.is_active && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "14px 18px", fontSize: "13px", color: "#b91c1c", fontWeight: "500" }}>
              Akun Anda saat ini nonaktif. Hubungi pengurus koperasi untuk informasi lebih lanjut.
            </div>
          )}

          {/* Info Kontak */}
          <div className="card-fintech">
            <div style={{ fontWeight: "700", fontSize: "15px", color: "#0f2d6b", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>
              Informasi Kontak
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", color: "#94a3b8" }}>Email</span>
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#1e293b" }}>{profil.email || "-"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", color: "#94a3b8" }}>No HP</span>
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#1e293b" }}>{profil.no_hp || "-"}</span>
              </div>
            </div>
          </div>

          {/* Info Keanggotaan */}
          <div className="card-fintech">
            <div style={{ fontWeight: "700", fontSize: "15px", color: "#0f2d6b", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>
              Info Keanggotaan
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", color: "#94a3b8" }}>NIK</span>
                <span style={{ fontSize: "14px", color: "#1e293b" }}>{profil.nik}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", color: "#94a3b8" }}>Tanggal Bergabung</span>
                <span style={{ fontSize: "14px", color: "#1e293b" }}>{formatTanggal(profil.tanggal_bergabung)}</span>
              </div>
              
              {/* BAGIAN POTONGAN DIPERBARUI */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "#94a3b8" }}>Simpanan Wajib / Bln</span>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#16a34a" }}>{formatRupiah(wajib)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "#94a3b8" }}>Simpanan Sukarela / Bln</span>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#16a34a" }}>{formatRupiah(sukarela)}</span>
              </div>
              {/* END BAGIAN POTONGAN DIPERBARUI */}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                <span style={{ fontSize: "13px", color: "#94a3b8" }}>No. Rekening</span>
                <span style={{ fontSize: "14px", color: "#1e293b" }}>{profil.no_rekening || "-"} {profil.nama_bank ? `(${profil.nama_bank})` : ""}</span>
              </div>
            </div>
            <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #f1f5f9", fontSize: "12px", color: "#94a3b8" }}>
              NIK, rekening, dan potongan simpanan hanya dapat diubah oleh pengurus koperasi.
            </div>
          </div>

          {/* Aksi */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link href="/dashboard/profil/edit" className="profil-action-btn">
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>Edit Profil</div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>Ubah foto, nama, email, dan no HP</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>

          {/* Info password */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "14px 16px",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: "2px", flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div style={{ fontSize: "12px", color: "#64748b", lineHeight: "1.6" }}>
              Lupa atau ingin mengubah password? Reset password hanya dapat dilakukan oleh Super Admin. Hubungi pengurus koperasi untuk bantuan.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
