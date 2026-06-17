import React from "react";
import { requireRole } from "@/lib/auth/session";
import { getPinjamanList, getStatistikPinjaman } from "@/lib/pinjaman/actions";
import Link from "next/link";

const STATUS_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  PENDING_L1: { label: "Menunggu Sekretaris", bg: "#fef3c7", color: "#b45309" },
  PENDING_L2: { label: "Menunggu Bendahara", bg: "#fed7aa", color: "#c2410c" },
  PENDING_L3: { label: "Menunggu Ketua", bg: "#dbeafe", color: "#1d4ed8" },
  APPROVED: { label: "Disetujui", bg: "#dcfce7", color: "#15803d" },
  ACTIVE: { label: "Aktif", bg: "#ccfbf1", color: "#0f766e" },
  LUNAS: { label: "Lunas", bg: "#f1f5f9", color: "#475569" },
  REJECTED: { label: "Ditolak", bg: "#fee2e2", color: "#b91c1c" },
  CANCELLED: { label: "Dibatalkan", bg: "#f1f5f9", color: "#64748b" },
  DISBURSED: { label: "Dicairkan", bg: "#f3e8ff", color: "#7e22ce" },
};

function formatRupiah(n: number) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

export default async function PinjamanPage({
  searchParams,
}: {
  searchParams: { status?: string; success?: string; error?: string };
}) {
  const currentUser = await requireRole([
    "ANGGOTA",
    "SUPERADMIN",
    "SEKRETARIS",
    "BENDAHARA",
    "KETUA",
  ]);

  const filterStatus = searchParams.status || "";
  const isAnggota = currentUser.role === "ANGGOTA";
  const isBendahara = currentUser.role === "BENDAHARA";
  const isAdmin = ["SEKRETARIS", "BENDAHARA", "KETUA", "SUPERADMIN"].includes(currentUser.role);

  const { data: pinjamanList } = await getPinjamanList({
    ...(filterStatus ? { status: filterStatus as any } : {}),
    ...(isAnggota ? { userId: currentUser.id } : {}),
  });
  const stats = isAdmin ? await getStatistikPinjaman() : null;

  const filters = [
    { label: "Semua", value: "" },
    { label: "Pending", value: "PENDING_L1" },
    { label: "Aktif", value: "ACTIVE" },
    { label: "Disetujui", value: "APPROVED" },
    { label: "Lunas", value: "LUNAS" },
    { label: "Ditolak", value: "REJECTED" },
  ];

  return (
    <div style={{ backgroundColor: "#f1f5f9", minHeight: "100vh", paddingBottom: "40px" }}>
      {/* --- Global & Design System Styles --- */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
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
          height: 240px;
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
        }

        .fintech-btn-header {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          color: #1a4db3;
          padding: 8px 16px;
          border-radius: 20px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: opacity 0.2s ease;
        }

        .fintech-btn-header:hover {
          opacity: 0.9;
        }

        .filter-chip {
          display: inline-flex;
          align-items: center;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .pinjaman-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 12px rgba(15,45,107,.06);
          padding: 20px;
          text-decoration: none;
          display: block;
          transition: box-shadow 0.2s ease, transform 0.15s ease;
        }

        .pinjaman-card:hover {
          box-shadow: 0 6px 20px rgba(15,45,107,.10);
          transform: translateY(-1px);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .filter-row {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 4px;
          margin-bottom: 20px;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .hide-on-mobile {
            display: none;
          }
        }
      `,
        }}
      />

      {/* --- Header Area --- */}
      <header className="fintech-header">
        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <Link
                href="/dashboard"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(255, 255, 255, 0.2)",
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

              <h1
                style={{
                  color: "#fff",
                  margin: 0,
                  fontSize: "28px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                Modul Pinjaman
              </h1>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              {isAnggota && (
                <Link href="/dashboard/pinjaman/ajukan" className="fintech-btn-header">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Ajukan Pinjaman
                </Link>
              )}
              {isBendahara && (
                <Link href="/dashboard/pinjaman/existing" className="fintech-btn-header" style={{ color: "#475569" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  Input Existing
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main style={{ maxWidth: "1200px", margin: "-70px auto 0 auto", padding: "0 20px", position: "relative", zIndex: 20 }}>
        {/* Notifikasi */}
        {searchParams.success && (
          <div
            style={{
              background: "#dcfce7",
              border: "1px solid #bbf7d0",
              color: "#15803d",
              borderRadius: "12px",
              padding: "14px 18px",
              marginBottom: "20px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            ✓ {searchParams.success}
          </div>
        )}
        {searchParams.error && (
          <div
            style={{
              background: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              borderRadius: "12px",
              padding: "14px 18px",
              marginBottom: "20px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            ✗ {searchParams.error}
          </div>
        )}

        {/* Stats Grid (hanya admin) */}
        {isAdmin && stats && (
          <div className="stats-grid">
            <div className="card-fintech" style={{ padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: "700", color: "#2563eb" }}>{stats.total}</div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Total Pinjaman
              </div>
            </div>
            <div className="card-fintech" style={{ padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: "700", color: "#0f766e" }}>{stats.aktif}</div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Aktif
              </div>
            </div>
            <div className="card-fintech" style={{ padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: "700", color: "#b45309" }}>{stats.pending}</div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Pending
              </div>
            </div>
            <div className="card-fintech" style={{ padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#1d4ed8" }}>
                {formatRupiah(stats.totalOutstanding ?? 0)}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Outstanding
              </div>
            </div>
          </div>
        )}

        {/* Filter chips */}
        <div className="filter-row">
          {filters.map((f) => {
            const active = filterStatus === f.value;
            return (
              <Link
                key={f.value}
                href={f.value ? `/dashboard/pinjaman?status=${f.value}` : "/dashboard/pinjaman"}
                className="filter-chip"
                style={{
                  background: active ? "#2563eb" : "#fff",
                  color: active ? "#fff" : "#64748b",
                  border: active ? "1px solid #2563eb" : "1px solid #e2e8f0",
                }}
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        {/* List Pinjaman */}
        {pinjamanList.length === 0 ? (
          <div className="card-fintech" style={{ textAlign: "center", padding: "48px 20px" }}>
            <svg style={{ margin: "0 auto 12px auto", display: "block", color: "#cbd5e1" }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <div style={{ color: "#94a3b8" }}>Belum ada data pinjaman</div>
            {isAnggota && (
              <Link href="/dashboard/pinjaman/ajukan" style={{ color: "#2563eb", fontSize: "14px", fontWeight: "600", marginTop: "12px", display: "inline-block", textDecoration: "none" }}>
                Ajukan pinjaman pertama Anda →
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {pinjamanList.map((p: any) => {
              const statusInfo = STATUS_LABEL[p.status] ?? { label: p.status, bg: "#f1f5f9", color: "#64748b" };
              return (
                <Link key={p.id} href={`/dashboard/pinjaman/${p.id}`} className="pinjaman-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div>
                      {isAdmin && (
                        <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "2px" }}>
                          {p.user_nama} · {p.user_nik}
                        </div>
                      )}
                      <div style={{ fontSize: "20px", fontWeight: "700", color: "#0f2d6b" }}>
                        {formatRupiah(p.nominal)}
                      </div>
                    </div>
                    <span
                      style={{
                        background: statusInfo.bg,
                        color: statusInfo.color,
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "700",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#64748b" }}>
                    <span>{p.tenor_bulan} bln · {formatRupiah(p.cicilan_per_bulan)}/bln</span>
                    <span>
                      {new Date(p.tanggal_pengajuan).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
