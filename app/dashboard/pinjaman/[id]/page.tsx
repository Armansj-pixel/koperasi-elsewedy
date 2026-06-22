import React from "react";
import { requireRole } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { getPinjamanDetail } from "@/lib/pinjaman/actions";
import ApprovalForm from "./ApprovalForm";
import { CairanForm, BayarCicilanForm } from "./CicilanForm";
import Link from "next/link";

// ── UTILITIES ──
function formatRupiah(n: number) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

function formatTanggal(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function getWhatsAppLink(phone: string) {
  if (!phone || phone === '-') return '#';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) cleaned = '62' + cleaned.slice(1);
  return `https://wa.me/${cleaned}`;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  PENDING_L1: { label: "Menunggu Sekretaris", bg: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" },
  PENDING_L2: { label: "Menunggu Bendahara", bg: "#ffedd5", color: "#c2410c", border: "1px solid #fdba74" },
  PENDING_L3: { label: "Menunggu Ketua", bg: "#eff6ff", color: "#1d4ed8", border: "1px solid #93c5fd" },
  APPROVED: { label: "Disetujui", bg: "#f0fdf4", color: "#15803d", border: "1px solid #86efac" },
  ACTIVE: { label: "Aktif", bg: "#ccfbf1", color: "#0f766e", border: "1px solid #5eead4" },
  LUNAS: { label: "Lunas ✓", bg: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0" },
  REJECTED: { label: "Ditolak", bg: "#fef2f2", color: "#b91c1c", border: "1px solid #fca5a5" },
  CANCELLED: { label: "Dibatalkan", bg: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0" },
};

// ── COMPONENT: TIMELINE STEP ──
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
    <div style={{ display: "flex", gap: "16px", opacity: status === "pending" ? 0.5 : 1, transition: "opacity 0.2s" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px", fontWeight: "800", transition: "all 0.2s",
            border: "2px solid",
            borderColor: status === "done" ? "#16a34a" : status === "current" ? "#3b82f6" : "#e2e8f0",
            background: status === "done" ? "#16a34a" : status === "current" ? "#eff6ff" : "#f8fafc",
            color: status === "done" ? "#fff" : status === "current" ? "#1d4ed8" : "#94a3b8",
            boxShadow: status === "current" ? "0 0 0 4px rgba(59,130,246,0.15)" : "none",
          }}
        >
          {status === "done" ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> : level}
        </div>
        {!isLast && <div style={{ width: "2px", flex: 1, background: status === "done" ? "#16a34a" : "#e2e8f0", margin: "6px 0" }} />}
      </div>
      <div style={{ paddingBottom: isLast ? "0" : "24px", flex: 1 }}>
        <div style={{ fontSize: "15px", fontWeight: "800", color: status === "current" ? "#1e40af" : "#0f172a", letterSpacing: "-.01em" }}>{label}</div>
        {status === "done" && (
          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            {approvedBy} <span style={{ color: "#cbd5e1" }}>|</span> {formatTanggal(approvedAt ?? null)}
          </div>
        )}
        {catatan && <div style={{ fontSize: "13px", color: "#475569", marginTop: "8px", fontStyle: "italic", background: "#f8fafc", padding: "8px 12px", borderRadius: "8px", borderLeft: "3px solid #cbd5e1" }}>"{catatan}"</div>}
        {status === "current" && (
          <div style={{ fontSize: "12px", color: "#2563eb", marginTop: "6px", fontWeight: "700", background: "#eff6ff", padding: "6px 10px", borderRadius: "6px", display: "inline-block" }}>
            Sedang menunggu verifikasi...
          </div>
        )}
      </div>
    </div>
  );
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
    border: 1px solid #eaeef5;
    box-shadow: 0 4px 28px rgba(15,45,107,.08), 0 1px 3px rgba(0,0,0,.03);
    margin-bottom: 20px;
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

  .kop-detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px 20px; }

  .kop-content-wrapper { padding: 0 16px 40px; margin-top: -70px; position: relative; z-index: 20; }
  
  @media (min-width: 768px) {
    .kop-header { padding: 40px 32px 100px; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; }
    .kop-content-wrapper { padding: 0 32px 40px; margin-top: -70px; }
  }
`;

export default async function PinjamanDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { success?: string; error?: string; view?: string };
}) {
  const currentUser = await requireRole([
    "ANGGOTA", "SUPERADMIN", "SEKRETARIS", "BENDAHARA", "KETUA",
  ]);

  const pinjamanId = parseInt(params.id);
  if (isNaN(pinjamanId)) notFound();

  const { data: p, cicilan, error } = await getPinjamanDetail(pinjamanId);
  if (!p || error) notFound();

  if (currentUser.role === "ANGGOTA" && p.user_id !== currentUser.id) {
    redirect("/dashboard/pinjaman");
  }

  // Tentukan Return Path
  const isPengurus = ["SUPERADMIN", "SEKRETARIS", "BENDAHARA", "KETUA"].includes(currentUser.role);
  const viewParam = searchParams.view;
  const isPengurusView = isPengurus && viewParam !== "personal";
  const returnPath = isPengurusView ? "/dashboard/pinjaman" : "/dashboard/pinjaman?view=personal";

  const statusConfig = STATUS_CONFIG[p.status] ?? { label: p.status, bg: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0" };
  const isRejected = p.status === "REJECTED";
  const isActive = p.status === "ACTIVE";
  const isApproved = p.status === "APPROVED";
  const roleIsBendahara = currentUser.role === "BENDAHARA";

  return (
    <main className="kop-shell bg-slate-100 min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div className="w-full max-w-5xl mx-auto bg-slate-100 min-h-screen relative sm:shadow-xl sm:border-x sm:border-slate-200">
        
        {/* --- Header Area --- */}
        <header className="kop-header">
          <div className="kop-orb" style={{ width: 280, height: 280, top: -100, right: -100, background: 'radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 70%)' }} />
          <div className="kop-orb" style={{ width: 200, height: 200, bottom: -40, left: -40, background: 'radial-gradient(circle, rgba(96,165,250,.2) 0%, transparent 70%)' }} />
          
          <div style={{ position: "relative", zIndex: 10, maxWidth: "720px", margin: "0 auto" }}>
            <Link href={returnPath} className="kop-btn-nav" style={{ marginBottom: "20px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Kembali
            </Link>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <h1 style={{ color: "#fff", margin: 0, fontSize: "28px", fontWeight: "800", letterSpacing: "-.02em" }}>
                  Pinjaman #{pinjamanId}
                </h1>
                <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "14px", marginTop: "6px", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  {p.user_nama} <span style={{ opacity: 0.5 }}>|</span> NIK: {p.user_nik}
                </div>
              </div>
              <span
                style={{
                  background: statusConfig.bg, color: statusConfig.color, border: statusConfig.border,
                  padding: "8px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: "800",
                  textTransform: "uppercase", letterSpacing: ".05em", boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}
              >
                {statusConfig.label}
              </span>
            </div>
          </div>
        </header>

        {/* --- Main Content Area --- */}
        <div className="kop-content-wrapper">
          <div style={{ maxWidth: "720px", margin: "0 auto" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Notifikasi */}
              {searchParams.success && (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", borderRadius: "14px", padding: "14px 18px", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <span>{searchParams.success}</span>
                </div>
              )}
              {searchParams.error && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: "14px", padding: "14px 18px", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>{searchParams.error}</span>
                </div>
              )}

              {/* Rincian Pinjaman */}
              <div className="kop-card">
                <div style={{ fontWeight: "800", fontSize: "16px", color: "#0f172a", margin: "24px 24px 16px", paddingBottom: "16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg>
                  Rincian Transaksi
                </div>
                
                <div style={{ padding: "0 24px 24px" }} className="kop-detail-grid">
                  <div>
                    <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".05em" }}>Nominal Pengajuan</div>
                    <div style={{ fontWeight: "900", fontSize: "20px", color: "#0f172a", letterSpacing: "-.02em" }}>{formatRupiah(p.nominal)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".05em" }}>Dana Diterima</div>
                    <div style={{ fontWeight: "800", fontSize: "20px", color: "#16a34a", letterSpacing: "-.02em" }}>{formatRupiah(p.total_diterima)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", marginBottom: "2px" }}>Biaya Admin (4%)</div>
                    <div style={{ color: "#dc2626", fontWeight: "700", fontSize: "14px" }}>{formatRupiah(p.biaya_admin)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", marginBottom: "2px" }}>Cicilan / Bulan</div>
                    <div style={{ fontWeight: "700", color: "#0f766e", fontSize: "14px" }}>{formatRupiah(p.cicilan_per_bulan)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", marginBottom: "2px" }}>Tenor Pembayaran</div>
                    <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "14px" }}>{p.tenor_bulan} bulan</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", marginBottom: "2px" }}>Tgl Pengajuan</div>
                    <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "14px" }}>{formatTanggal(p.tanggal_pengajuan)}</div>
                  </div>
                  {p.tanggal_pencairan && (
                    <div>
                      <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", marginBottom: "2px" }}>Tgl Pencairan</div>
                      <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "14px" }}>{formatTanggal(p.tanggal_pencairan)}</div>
                    </div>
                  )}
                  {p.tanggal_jatuh_tempo && (
                    <div>
                      <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", marginBottom: "2px" }}>Jatuh Tempo Akhir</div>
                      <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "14px" }}>{formatTanggal(p.tanggal_jatuh_tempo)}</div>
                    </div>
                  )}
                </div>

                {p.catatan_pengaju && (
                  <div style={{ margin: "0 24px 24px", background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Catatan / Keperluan Pengaju
                    </div>
                    <div style={{ fontSize: "14px", color: "#1e293b", fontStyle: "italic", fontWeight: "500", lineHeight: "1.5" }}>"{p.catatan_pengaju}"</div>
                  </div>
                )}
              </div>

              {/* Penolakan */}
              {isRejected && p.rejected_reason && (
                <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: "16px", padding: "20px", display: "flex", gap: "12px" }}>
                  <div style={{ flexShrink: 0, marginTop: "2px", color: "#dc2626" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: "800", fontSize: "14px", color: "#991b1b", marginBottom: "4px" }}>Alasan Penolakan</div>
                    <div style={{ fontSize: "14px", color: "#b91c1c", fontWeight: "500", lineHeight: "1.5" }}>{p.rejected_reason}</div>
                  </div>
                </div>
              )}

              {/* Forms akan di-render di sini, desain aslinya diatur dari dalam file komponen masing-masing */}
              <ApprovalForm pinjamanId={pinjamanId} currentStatus={p.status} userRole={currentUser.role} />

              {isApproved && roleIsBendahara && <CairanForm pinjamanId={pinjamanId} />}

              {(isActive || p.status === "LUNAS") && (
                <BayarCicilanForm cicilan={cicilan} pinjamanId={pinjamanId} userRole={currentUser.role} />
              )}

              {/* Timeline Approval */}
              <div className="kop-card">
                <div style={{ fontWeight: "800", fontSize: "16px", color: "#0f172a", margin: "24px 24px 16px", paddingBottom: "16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                  Alur Persetujuan
                </div>
                <div style={{ padding: "0 24px 24px" }}>
                  <ApprovalStep
                    level="1"
                    label="Verifikasi Sekretaris"
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
                    label="Verifikasi Bendahara"
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
                    label="Persetujuan Ketua"
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
                    label="Pencairan Dana"
                    status={["ACTIVE", "LUNAS"].includes(p.status) ? "done" : p.status === "APPROVED" ? "current" : "pending"}
                    approvedAt={p.disbursed_at}
                    approvedBy={p.nama_disbursed}
                    isLast
                  />
                </div>
              </div>

              {/* Info Anggota */}
              <div className="kop-card">
                <div style={{ fontWeight: "800", fontSize: "16px", color: "#0f172a", margin: "24px 24px 16px", paddingBottom: "16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Info Penerima Dana
                </div>
                <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "12px", borderBottom: "1px dashed #f1f5f9" }}>
                    <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>Nama Anggota</span>
                    <span style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>{p.user_nama}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "12px", borderBottom: "1px dashed #f1f5f9" }}>
                    <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>Nomor NIK</span>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#334155", fontFamily: "monospace" }}>{p.user_nik}</span>
                  </div>
                  
                  {/* Tautan WhatsApp */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px dashed #f1f5f9" }}>
                    <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>No HP / WA</span>
                    {p.user_no_hp && p.user_no_hp !== '-' ? (
                      <a 
                        href={getWhatsAppLink(p.user_no_hp)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          display: "inline-flex", alignItems: "center", gap: "6px",
                          background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", 
                          padding: "6px 12px", borderRadius: "20px", fontWeight: "700", 
                          textDecoration: "none", fontSize: "12px", boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
                          transition: "transform 0.15s"
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                        </svg>
                        {p.user_no_hp}
                      </a>
                    ) : (
                      <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: "600" }}>Belum Diisi</span>
                    )}
                  </div>

                  {/* Bank & Rekening */}
                  <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "12px", borderBottom: "1px dashed #f1f5f9" }}>
                    <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>Bank Tujuan</span>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>{p.user_bank || '-'}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>No. Rekening</span>
                    <span style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a", fontFamily: "monospace", letterSpacing: ".05em" }}>
                      {p.user_nomor_rekening || '-'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
