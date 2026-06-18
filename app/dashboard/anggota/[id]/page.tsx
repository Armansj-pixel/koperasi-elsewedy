import React from "react";
import { requireRole } from "@/lib/auth/session";
import {
  getAnggotaById,
  toggleAnggotaStatus,
  resetPasswordAnggota,
} from "@/lib/anggota/actions";
import Link from "next/link";
import { redirect } from "next/navigation";

const roleLabels: Record<string, string> = {
  ANGGOTA: "Anggota",
  SEKRETARIS: "Sekretaris",
  BENDAHARA: "Bendahara",
  KETUA: "Ketua",
  SUPERADMIN: "Super Admin",
};

// Disesuaikan menjadi object CSS Properties untuk inline styles
const roleColors: Record<string, React.CSSProperties> = {
  ANGGOTA: { backgroundColor: "#dbeafe", color: "#1d4ed8" },
  SEKRETARIS: { backgroundColor: "#f3e8ff", color: "#7e22ce" },
  BENDAHARA: { backgroundColor: "#dcfce7", color: "#15803d" },
  KETUA: { backgroundColor: "#fef3c7", color: "#b45309" },
  SUPERADMIN: { backgroundColor: "#fee2e2", color: "#b91c1c" },
};

export default async function DetailAnggotaPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { msg?: string; error?: string };
}) {
  const currentUser = await requireRole([
    "SUPERADMIN",
    "SEKRETARIS",
    "BENDAHARA",
    "KETUA",
  ]);

  const { data: anggota, error } = await getAnggotaById(params.id);

  if (error || !anggota) {
    redirect("/dashboard/anggota");
  }

  const saldo = anggota.saldo_simpanan?.[0]?.total_saldo || 0;
  const isSuperAdmin = currentUser.role === "SUPERADMIN";
  const canEdit = ["SUPERADMIN", "SEKRETARIS"].includes(currentUser.role);

  // LOGIKA POTONGAN BARU (Wajib + Sukarela)
  const wajib = Number(anggota.simpanan_wajib_bulanan || anggota.simpanan_bulanan || 0);
  const sukarela = Number(anggota.simpanan_sukarela_bulanan || 0);
  const totalPotongan = wajib + sukarela;

  return (
    <div style={{ backgroundColor: "#f1f5f9", minHeight: "100vh", paddingBottom: "40px" }}>
      {/* --- Global & Design System Styles --- */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
        }

        .fintech-header {
          position: relative;
          background: linear-gradient(145deg, #0f2d6b 0%, #1a4db3 60%, #2563eb 100%);
          overflow: hidden;
          padding: 24px 20px;
          height: 220px;
          border-bottom-left-radius: 24px;
          border-bottom-right-radius: 24px;
        }

        .fintech-header::before,
        .fintech-header::after {
          content: '';
          position: absolute;
          pointer-events: none; 
          border-radius: 50%;
        }

        .fintech-header::before {
          top: -40px;
          left: -40px;
          width: 150px;
          height: 150px;
          background: rgba(255, 255, 255, 0.08);
        }

        .fintech-header::after {
          bottom: -20px;
          right: -60px;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.05);
        }

        .card-fintech {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 12px rgba(15,45,107,.06);
          padding: 24px;
          margin-bottom: 20px;
        }

        .data-row:last-child {
          border-bottom: none !important;
        }

        .fintech-btn {
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .fintech-btn:hover {
          opacity: 0.9;
        }
      `}} />

      {/* --- Header Area --- */}
      <header className="fintech-header">
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 10 }}>
          
          <Link 
            href="/dashboard/anggota" 
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255, 255, 255, 0.2)",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "20px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "500",
              backdropFilter: "blur(4px)"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Kembali
          </Link>

          {canEdit && (
            <Link
              href={`/dashboard/anggota/${params.id}/edit`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#fff",
                color: "#1a4db3",
                padding: "8px 16px",
                borderRadius: "20px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "600",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Data
            </Link>
          )}
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main style={{ maxWidth: "800px", margin: "-100px auto 0 auto", padding: "0 20px", position: "relative", zIndex: 20 }}>
        
        {searchParams.msg && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "500" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            {searchParams.msg}
          </div>
        )}
        {searchParams.error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "500" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {searchParams.error}
          </div>
        )}

        {/* Profile Card */}
        <div className="card-fintech" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "24px", display: "flex", alignItems: "center", gap: "20px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#eff6ff", color: "#1e40af", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: "700", border: "2px solid #dbeafe" }}>
              {anggota.nama?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ margin: "0 0 4px 0", fontSize: "20px", color: "#0f2d6b", fontWeight: "700" }}>{anggota.nama}</h2>
              <p style={{ margin: 0, color: "#64748b", fontSize: "14px", fontFamily: "monospace" }}>NIK: {anggota.nik}</p>
              <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", ...roleColors[anggota.role] || { backgroundColor: "#f1f5f9", color: "#334155" } }}>
                  {roleLabels[anggota.role] || anggota.role}
                </span>
                <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", backgroundColor: anggota.is_active ? "#dcfce7" : "#fee2e2", color: anggota.is_active ? "#15803d" : "#b91c1c" }}>
                  {anggota.is_active ? "Aktif" : "Nonaktif"}
                </span>
              </div>
            </div>
          </div>
          
          <div style={{ padding: "20px 24px", background: "#fafafa", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: "0 0 6px 0", fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Total Saldo Simpanan
              </p>
              <p style={{ margin: 0, fontSize: "28px", color: "#16a34a", fontWeight: "700" }}>
                Rp {Number(saldo).toLocaleString("id-ID")}
              </p>
            </div>
            <div style={{ padding: "16px", background: "#dcfce7", borderRadius: "50%", color: "#15803d" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Data Lengkap */}
        <div className="card-fintech">
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "700", color: "#0f2d6b", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            Data Pribadi
          </h3>
          <div>
            <DataRow label="NIK" value={anggota.nik} mono />
            <DataRow label="Nama Lengkap" value={anggota.nama} />
            <DataRow label="Email" value={anggota.email} />
            <DataRow label="No. HP" value={anggota.no_hp || "-"} />
            <DataRow
              label="Tanggal Bergabung"
              value={
                anggota.tanggal_bergabung
                  ? new Date(anggota.tanggal_bergabung).toLocaleDateString(
                      "id-ID",
                      { day: "numeric", month: "long", year: "numeric" }
                    )
                  : "-"
              }
            />
            <DataRow
              label="Login Terakhir"
              value={
                anggota.last_login_at
                  ? new Date(anggota.last_login_at).toLocaleString("id-ID")
                  : "Belum pernah login"
              }
            />
          </div>
        </div>

        {/* Data Bank */}
        <div className="card-fintech">
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "700", color: "#0f2d6b", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>
            Data Rekening Bank
          </h3>
          <div>
            <DataRow label="Nama Bank" value={anggota.nama_bank || "-"} />
            <DataRow
              label="No. Rekening"
              value={anggota.no_rekening || "-"}
              mono
            />
          </div>
        </div>

        {/* Data Koperasi - DIPERBARUI */}
        <div className="card-fintech">
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "700", color: "#0f2d6b", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="2"/><line x1="15" y1="22" x2="15" y2="2"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="17" x2="20" y2="17"/></svg>
            Data Koperasi
          </h3>
          <div>
            <DataRow
              label="Role"
              value={roleLabels[anggota.role] || anggota.role}
              badge
              badgeStyle={roleColors[anggota.role] || { backgroundColor: "#f1f5f9", color: "#334155" }}
            />
            {/* TAMPILAN RINCIAN POTONGAN */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: "14px", color: "#64748b", flexShrink: 0, width: "160px" }}>Potongan / Bulan</span>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>
                  Rp {totalPotongan.toLocaleString("id-ID")}
                </div>
                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px", fontWeight: "500" }}>
                  Wajib: Rp {wajib.toLocaleString("id-ID")} | Sukarela: Rp {sukarela.toLocaleString("id-ID")}
                </div>
              </div>
            </div>
            <DataRow
              label="Status Akun"
              value={anggota.is_active ? "Aktif" : "Nonaktif"}
              badge
              badgeStyle={{
                backgroundColor: anggota.is_active ? "#dcfce7" : "#fee2e2",
                color: anggota.is_active ? "#15803d" : "#b91c1c",
              }}
            />
          </div>
        </div>

        {/* Action Buttons (Superadmin only) */}
        {isSuperAdmin && (
          <div className="card-fintech">
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "700", color: "#0f2d6b", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Aksi Admin
            </h3>
            
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {/* Reset Password */}
              <form
                style={{ flex: "1 1 200px" }}
                action={async () => {
                  "use server";
                  const result = await resetPasswordAnggota(params.id);
                  if (result.success) {
                    redirect(
                      `/dashboard/anggota/${params.id}?msg=${encodeURIComponent(result.message ?? "Berhasil")}`
                    );
                  } else {
                    redirect(
                      `/dashboard/anggota/${params.id}?error=${encodeURIComponent(result.error || "Gagal reset password")}`
                    );
                  }
                }}
              >
                <button
                  type="submit"
                  className="fintech-btn"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    background: "#fffbeb",
                    color: "#b45309",
                    border: "1px solid #fde68a",
                    padding: "12px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600"
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                  Reset Password
                </button>
              </form>

              {/* Toggle Aktif/Nonaktif */}
              <form
                style={{ flex: "1 1 200px" }}
                action={async () => {
                  "use server";
                  const result = await toggleAnggotaStatus(
                    params.id,
                    !anggota.is_active
                  );
                  if (result.success) {
                    redirect(
                      `/dashboard/anggota/${params.id}?msg=${encodeURIComponent(result.message ?? "Berhasil")}`
                    );
                  } else {
                    redirect(
                      `/dashboard/anggota/${params.id}?error=${encodeURIComponent(result.error || "Gagal update status")}`
                    );
                  }
                }}
              >
                <button
                  type="submit"
                  className="fintech-btn"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    background: anggota.is_active ? "#fef2f2" : "#f0fdf4",
                    color: anggota.is_active ? "#b91c1c" : "#15803d",
                    border: `1px solid ${anggota.is_active ? "#fecaca" : "#bbf7d0"}`,
                    padding: "12px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600"
                  }}
                >
                  {anggota.is_active ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19.69 14a6.9 6.9 0 0 0 .31-2V5l-8-3-3.16 1.18"/><path d="M4.73 4.73L4 5v7c0 6 8 10 8 10a20.29 20.29 0 0 0 5.62-4.38"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      Nonaktifkan Akun
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      Aktifkan Akun
                    </>
                  )}
                </button>
              </form>
            </div>

            <p style={{ margin: "12px 0 0 0", fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Reset password akan mengembalikan password ke 4 digit terakhir NIK
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

// Helper component
function DataRow({
  label,
  value,
  mono = false,
  badge = false,
  badgeStyle = {},
}: {
  label: string;
  value: string;
  mono?: boolean;
  badge?: boolean;
  badgeStyle?: React.CSSProperties;
}) {
  return (
    <div className="data-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ fontSize: "14px", color: "#64748b", flexShrink: 0, width: "160px" }}>{label}</span>
      {badge ? (
        <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", ...badgeStyle }}>
          {value}
        </span>
      ) : (
        <span style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b", textAlign: "right", fontFamily: mono ? "monospace" : "inherit" }}>
          {value}
        </span>
      )}
    </div>
  );
}
