import React from "react";
import { requireRole } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { getPinjamanDetail } from "@/lib/pinjaman/actions";
import ApprovalForm from "./ApprovalForm";
import { CairanForm, BayarCicilanForm } from "./CicilanForm";
import Link from "next/link";

function formatRupiah(n: number) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

function formatTanggal(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  PENDING_L1: { label: "Menunggu Sekretaris", bg: "#fef3c7", color: "#b45309" },
  PENDING_L2: { label: "Menunggu Bendahara", bg: "#fed7aa", color: "#c2410c" },
  PENDING_L3: { label: "Menunggu Ketua", bg: "#dbeafe", color: "#1d4ed8" },
  APPROVED: { label: "Disetujui", bg: "#dcfce7", color: "#15803d" },
  ACTIVE: { label: "Aktif", bg: "#ccfbf1", color: "#0f766e" },
  LUNAS: { label: "Lunas ✓", bg: "#f1f5f9", color: "#475569" },
  REJECTED: { label: "Ditolak", bg: "#fee2e2", color: "#b91c1c" },
  CANCELLED: { label: "Dibatalkan", bg: "#f1f5f9", color: "#64748b" },
};

function ApprovalStep({
  level,
  label,
  status,
  approvedAt,
  approvedBy,
  catatan,
  isLast,
}: {
  level: string;
  label: string;
  status: "done" | "current" | "pending";
  approvedAt?: string | null;
  approvedBy?: string | null;
  catatan?: string | null;
  isLast?: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: "12px", opacity: status === "pending" ? 0.4 : 1 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            fontWeight: "700",
            border: "2px solid",
            borderColor: status === "done" ? "#16a34a" : status === "current" ? "#60a5fa" : "#e2e8f0",
            background: status === "done" ? "#16a34a" : status === "current" ? "#dbeafe" : "#f1f5f9",
            color: status === "done" ? "#fff" : status === "current" ? "#1d4ed8" : "#94a3b8",
          }}
        >
          {status === "done" ? "✓" : level}
        </div>
        {!isLast && <div style={{ width: "2px", flex: 1, background: "#e2e8f0", marginTop: "4px" }} />}
      </div>
      <div style={{ paddingBottom: "20px", flex: 1 }}>
        <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{label}</div>
        {status === "done" && (
          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
            {approvedBy} · {formatTanggal(approvedAt ?? null)}
          </div>
        )}
        {catatan && <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", fontStyle: "italic" }}>"{catatan}"</div>}
        {status === "current" && (
          <div style={{ fontSize: "12px", color: "#2563eb", marginTop: "2px", fontWeight: "600" }}>
            Menunggu persetujuan...
          </div>
        )}
      </div>
    </div>
  );
}

export default async function PinjamanDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { success?: string; error?: string };
}) {
  const currentUser = await requireRole([
    "ANGGOTA",
    "SUPERADMIN",
    "SEKRETARIS",
    "BENDAHARA",
    "KETUA",
  ]);

  const pinjamanId = parseInt(params.id);
  if (isNaN(pinjamanId)) notFound();

  const { data: p, cicilan, error } = await getPinjamanDetail(pinjamanId);
  if (!p || error) notFound();

  if (currentUser.role === "ANGGOTA" && p.user_id !== currentUser.id) {
    redirect("/dashboard/pinjaman");
  }

  const statusConfig = STATUS_CONFIG[p.status] ?? { label: p.status, bg: "#f1f5f9", color: "#64748b" };
  const isRejected = p.status === "REJECTED";
  const isActive = p.status === "ACTIVE";
  const isApproved = p.status === "APPROVED";
  const isBendahara = currentUser.role === "BENDAHARA";

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
          height: 220px;
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
        .fintech-input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          font-size: 14px;
          background-color: #fff;
          color: #1e293b;
        }
        .fintech-input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,.12);
        }
      `,
        }}
      />

      <header className="fintech-header">
        <div style={{ maxWidth: "720px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          <Link
            href="/dashboard/pinjaman"
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
              marginBottom: "16px",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Pinjaman
          </Link>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h1 style={{ color: "#fff", margin: 0, fontSize: "24px", fontWeight: "700" }}>
                Pinjaman #{pinjamanId}
              </h1>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px", marginTop: "4px" }}>
                {p.user_nama} · {p.user_nik}
              </div>
            </div>
            <span
              style={{
                background: statusConfig.bg,
                color: statusConfig.color,
                padding: "7px 16px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "700",
              }}
            >
              {statusConfig.label}
            </span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "720px", margin: "-50px auto 0 auto", padding: "0 20px", position: "relative", zIndex: 20 }}>
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

          {/* Rincian Pinjaman */}
          <div className="card-fintech">
            <div style={{ fontWeight: "700", fontSize: "15px", color: "#0f2d6b", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>
              Rincian Pinjaman
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
              <div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>Nominal</div>
                <div style={{ fontWeight: "700", fontSize: "18px", color: "#0f2d6b" }}>{formatRupiah(p.nominal)}</div>
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>Dana Diterima</div>
                <div style={{ fontWeight: "600", color: "#1e293b" }}>{formatRupiah(p.total_diterima)}</div>
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>Biaya Admin (4%)</div>
                <div style={{ color: "#dc2626", fontWeight: "600" }}>{formatRupiah(p.biaya_admin)}</div>
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>Cicilan / Bulan</div>
                <div style={{ fontWeight: "600", color: "#0f766e" }}>{formatRupiah(p.cicilan_per_bulan)}</div>
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>Tenor</div>
                <div style={{ fontWeight: "500", color: "#1e293b" }}>{p.tenor_bulan} bulan</div>
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>Tgl Pengajuan</div>
                <div style={{ fontWeight: "500", color: "#1e293b" }}>{formatTanggal(p.tanggal_pengajuan)}</div>
              </div>
              {p.tanggal_pencairan && (
                <div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>Tgl Pencairan</div>
                  <div style={{ fontWeight: "500", color: "#1e293b" }}>{formatTanggal(p.tanggal_pencairan)}</div>
                </div>
              )}
              {p.tanggal_jatuh_tempo && (
                <div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>Jatuh Tempo Akhir</div>
                  <div style={{ fontWeight: "500", color: "#1e293b" }}>{formatTanggal(p.tanggal_jatuh_tempo)}</div>
                </div>
              )}
            </div>
            {p.catatan_pengaju && (
              <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>Catatan Pengaju</div>
                <div style={{ fontSize: "14px", color: "#475569", fontStyle: "italic" }}>"{p.catatan_pengaju}"</div>
              </div>
            )}
          </div>

          {/* Penolakan */}
          {isRejected && p.rejected_reason && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "16px", padding: "18px" }}>
              <div style={{ fontWeight: "700", fontSize: "14px", color: "#b91c1c", marginBottom: "4px" }}>Alasan Penolakan</div>
              <div style={{ fontSize: "14px", color: "#dc2626" }}>{p.rejected_reason}</div>
            </div>
          )}

          <ApprovalForm pinjamanId={pinjamanId} currentStatus={p.status} userRole={currentUser.role} />

          {isApproved && isBendahara && <CairanForm pinjamanId={pinjamanId} />}

          {(isActive || p.status === "LUNAS") && (
            <BayarCicilanForm cicilan={cicilan} pinjamanId={pinjamanId} userRole={currentUser.role} />
          )}

          {/* Timeline Approval */}
          <div className="card-fintech">
            <div style={{ fontWeight: "700", fontSize: "15px", color: "#0f2d6b", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>
              Alur Persetujuan
            </div>
            <ApprovalStep
              level="1"
              label="Sekretaris"
              status={
                p.status === "PENDING_L1"
                  ? "current"
                  : ["PENDING_L2", "PENDING_L3", "APPROVED", "ACTIVE", "LUNAS"].includes(p.status)
                  ? "done"
                  : "pending"
              }
              approvedAt={p.approved_l1_at}
              approvedBy={p.nama_l1}
              catatan={p.catatan_l1}
            />
            <ApprovalStep
              level="2"
              label="Bendahara"
              status={
                p.status === "PENDING_L2"
                  ? "current"
                  : ["PENDING_L3", "APPROVED", "ACTIVE", "LUNAS"].includes(p.status)
                  ? "done"
                  : "pending"
              }
              approvedAt={p.approved_l2_at}
              approvedBy={p.nama_l2}
              catatan={p.catatan_l2}
            />
            <ApprovalStep
              level="3"
              label="Ketua Koperasi"
              status={
                p.status === "PENDING_L3"
                  ? "current"
                  : ["APPROVED", "ACTIVE", "LUNAS"].includes(p.status)
                  ? "done"
                  : "pending"
              }
              approvedAt={p.approved_l3_at}
              approvedBy={p.nama_l3}
              catatan={p.catatan_l3}
            />
            <ApprovalStep
              level="💰"
              label="Pencairan"
              status={["ACTIVE", "LUNAS"].includes(p.status) ? "done" : p.status === "APPROVED" ? "current" : "pending"}
              approvedAt={p.disbursed_at}
              approvedBy={p.nama_disbursed}
              isLast
            />
          </div>

          {/* Info Anggota */}
          <div className="card-fintech">
            <div style={{ fontWeight: "700", fontSize: "15px", color: "#0f2d6b", marginBottom: "14px" }}>Info Anggota</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>Nama</span>
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#1e293b" }}>{p.user_nama}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>NIK</span>
                <span style={{ fontSize: "14px", color: "#1e293b" }}>{p.user_nik}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>No HP</span>
                <span style={{ fontSize: "14px", color: "#1e293b" }}>{p.user_no_hp}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>Simpanan Bulanan</span>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#16a34a" }}>
                  {formatRupiah(p.user_simpanan_bulanan ?? 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
