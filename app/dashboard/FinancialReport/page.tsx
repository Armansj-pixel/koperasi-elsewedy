import React from "react";
import { requireRole } from "@/lib/auth/session";
import { getDashboardStats, getLaporanLabaRugi } from "@/lib/akuntansi/laporan";
import { getCekTutupBuku } from "@/app/dashboard/laporan/shu/actions";
import Link from "next/link";

const TAHUN_INI = new Date().getFullYear();

function formatRp(n: number) {
  const abs = Math.abs(n);
  const formatted = "Rp " + abs.toLocaleString("id-ID");
  return n < 0 ? `(${formatted})` : formatted;
}

function StatCard({
  label, value, sub, color = "#0f172a", bg = "#fff", accent
}: {
  label: string; value: string; sub?: string;
  color?: string; bg?: string; accent?: string;
}) {
  return (
    <div style={{
      background: bg, borderRadius: 16, padding: "20px",
      border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,.04)",
      borderLeft: accent ? `4px solid ${accent}` : undefined,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 900, color, lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}

function NavCard({ href, icon, title, desc }: { href: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: "20px",
        border: "1px solid #e2e8f0", display: "flex", gap: 16, alignItems: "flex-start",
        transition: "box-shadow .2s", cursor: "pointer",
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, background: "#f1f5f9",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>{icon}</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{title}</div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 2, fontWeight: 500 }}>{desc}</div>
        </div>
        <svg style={{ marginLeft: "auto", flexShrink: 0, color: "#cbd5e1" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </div>
    </Link>
  );
}

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  .lap-shell { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
  .lap-header { background: linear-gradient(150deg, #1e293b 0%, #0f172a 40%, #020617 100%); padding: 30px 20px 100px; position: relative; overflow: hidden; }
  .lap-btn-nav { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,.1); color: #fff; padding: 8px 14px; border-radius: 20px; text-decoration: none; font-size: 13px; font-weight: 600; backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,.2); }
  .lap-content { padding: 0 16px 40px; margin-top: -70px; position: relative; z-index: 20; }
  .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
  .stat-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px; }
  .nav-grid { display: flex; flex-direction: column; gap: 12px; }
  .section-title { font-size: 13px; font-weight: 800; color: "#475569"; text-transform: uppercase; letter-spacing: ".06em"; margin: 24px 0 12px; }
  @media(min-width:768px) { .lap-header { padding: 40px 32px 100px; } .lap-content { padding: 0 32px 40px; } .stat-grid { grid-template-columns: repeat(4,1fr); } .stat-grid-3 { grid-template-columns: repeat(3,1fr); } .nav-grid { display: grid; grid-template-columns: 1fr 1fr; } }
`;

export default async function LaporanDashboardPage({
  searchParams,
}: {
  searchParams: { tahun?: string };
}) {
  await requireRole(["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS"]);

  const tahun = parseInt(searchParams.tahun ?? String(TAHUN_INI));
  const [statsResult, lrResult, tutupBuku] = await Promise.all([
    getDashboardStats(tahun),
    getLaporanLabaRugi(tahun),
    getCekTutupBuku(tahun),
  ]);

  const stats = statsResult.data;
  const lr = lrResult.data;
  const shu = lr?.shu_bersih ?? 0;

  return (
    <main className="lap-shell" style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div className="w-full max-w-5xl mx-auto bg-slate-100 min-h-screen relative sm:shadow-xl sm:border-x sm:border-slate-200">
        <header className="lap-header">
          <div style={{ position: "relative", zIndex: 10 }}>
            <Link href="/dashboard" className="lap-btn-nav" style={{ marginBottom: 20 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Dashboard
            </Link>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h1 style={{ color: "#fff", margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: "-.02em" }}>Laporan Keuangan</h1>
                <p style={{ color: "#94a3b8", margin: "4px 0 0", fontSize: 14, fontWeight: 500 }}>
                  Koperasi Karyawan PT. CGPSI — {stats?.periode_label}
                </p>
              </div>
              {/* Selector Tahun */}
              <form method="GET" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select name="tahun" defaultValue={tahun} style={{
                  background: "rgba(255,255,255,.15)", color: "#fff", border: "1px solid rgba(255,255,255,.3)",
                  borderRadius: 10, padding: "8px 12px", fontSize: 14, fontWeight: 700, cursor: "pointer",
                }}>
                  {[TAHUN_INI, TAHUN_INI - 1, TAHUN_INI - 2].map(y => (
                    <option key={y} value={y} style={{ background: "#1e293b" }}>{y}</option>
                  ))}
                </select>
                <button type="submit" style={{
                  background: "rgba(255,255,255,.2)", color: "#fff", border: "none",
                  borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}>Tampilkan</button>
              </form>
            </div>

            {/* Badge tutup buku */}
            {tutupBuku.sudahTutup && (
              <div style={{
                marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(16,185,129,.2)", color: "#6ee7b7",
                padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
              }}>
                ✓ Buku {tahun} sudah ditutup
              </div>
            )}
          </div>
        </header>

        <div className="lap-content">

          {/* ── POSISI KEUANGAN ── */}
          <p style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: ".06em", margin: "0 0 12px" }}>Posisi Keuangan</p>
          <div className="stat-grid">
            <StatCard label="Total Aset" value={formatRp(stats?.total_aset ?? 0)} accent="#3b82f6" />
            <StatCard label="Kas & Bank" value={formatRp(stats?.total_kas_bank ?? 0)} sub="Tunai + 3 Rekening" accent="#0ea5e9" />
            <StatCard label="Piutang Pinjaman" value={formatRp(stats?.total_piutang ?? 0)} sub={`${stats?.total_pinjaman_aktif ?? 0} pinjaman aktif`} accent="#f59e0b" />
            <StatCard
              label={`SHU ${tahun}`}
              value={formatRp(shu)}
              color={shu >= 0 ? "#0f766e" : "#e11d48"}
              accent={shu >= 0 ? "#10b981" : "#f43f5e"}
              sub={shu >= 0 ? "Surplus" : "Defisit"}
            />
          </div>

          {/* ── SIMPANAN ANGGOTA ── */}
          <p style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: ".06em", margin: "16px 0 12px" }}>Simpanan Anggota</p>
          <div className="stat-grid-3">
            <StatCard label="Simpanan Pokok" value={formatRp(stats?.total_simpanan_pokok ?? 0)} accent="#8b5cf6" />
            <StatCard label="Simpanan Wajib" value={formatRp(stats?.total_simpanan_wajib ?? 0)} accent="#6366f1" />
            <StatCard label="Simpanan Sukarela" value={formatRp(stats?.total_simpanan_sukarela ?? 0)} accent="#a78bfa" />
          </div>

          {/* ── RINGKASAN L/R ── */}
          {lr && (
            <>
              <p style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: ".06em", margin: "16px 0 12px" }}>Ringkasan Laba / Rugi {tahun}</p>
              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: "20px", marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#475569" }}>Total Pendapatan</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#0f766e" }}>{formatRp(lr.total_pendapatan)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#475569" }}>Total Beban</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#e11d48" }}>({formatRp(lr.total_beban)})</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0" }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>SHU Bersih</span>
                  <span style={{ fontSize: 16, fontWeight: 900, color: shu >= 0 ? "#0f766e" : "#e11d48" }}>{formatRp(shu)}</span>
                </div>
              </div>
            </>
          )}

          {/* ── NAVIGASI LAPORAN ── */}
          <p style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: ".06em", margin: "8px 0 12px" }}>Laporan Keuangan</p>
          <div className="nav-grid">
            <NavCard
              href={`/dashboard/laporan/laba-rugi?tahun=${tahun}`}
              title="Laporan Laba / Rugi"
              desc={`Pendapatan & beban tahun ${tahun} — export PDF`}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>}
            />
            <NavCard
              href={`/dashboard/laporan/neraca?per=${tahun}-12-31`}
              title="Neraca (Balance Sheet)"
              desc="Posisi aset, kewajiban & ekuitas — export PDF"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>}
            />
            <NavCard
              href={`/dashboard/laporan/shu?tahun=${tahun}`}
              title="Tutup Buku & Alokasi SHU"
              desc={tutupBuku.sudahTutup ? `Buku ${tahun} sudah ditutup` : `Eksekusi penutupan tahun ${tahun}`}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
            />
            <NavCard
              href={`/dashboard/akuntansi`}
              title="Jurnal Umum & Trial Balance"
              desc="Rincian semua transaksi jurnal"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
            />
          </div>

        </div>
      </div>
    </main>
  );
}
