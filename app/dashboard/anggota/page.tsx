import { requireRole } from "@/lib/auth/session";
import { getAnggotaList } from "@/lib/anggota/actions";
import Link from "next/link";

const roleLabels: Record<string, string> = {
  ANGGOTA: "Anggota",
  SEKRETARIS: "Sekretaris",
  BENDAHARA: "Bendahara",
  KETUA: "Ketua",
  SUPERADMIN: "Super Admin",
};

const roleColors: Record<string, { bg: string; color: string }> = {
  ANGGOTA:    { bg: "#dbeafe", color: "#1d4ed8" },
  SEKRETARIS: { bg: "#ede9fe", color: "#7c3aed" },
  BENDAHARA:  { bg: "#d1fae5", color: "#059669" },
  KETUA:      { bg: "#fef3c7", color: "#d97706" },
  SUPERADMIN: { bg: "#fee2e2", color: "#dc2626" },
};

export default async function AnggotaPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const currentUser = await requireRole([
    "SUPERADMIN", "SEKRETARIS", "BENDAHARA", "KETUA",
  ]);
  const search = searchParams.search || "";
  const { data: anggotaList } = await getAnggotaList(search);

  const totalAktif    = anggotaList.filter((a: any) =>  a.is_active).length;
  const totalNonaktif = anggotaList.filter((a: any) => !a.is_active).length;
  const totalSaldo    = anggotaList.reduce((sum: number, a: any) => sum + Number(a.total_saldo || 0), 0);

  return (
    <>
      <style>{`
        .ap-header {
          background: linear-gradient(145deg, #0f2d6b 0%, #1a4db3 60%, #2563eb 100%);
          padding: 20px 24px;
          position: relative;
          overflow: hidden;
        }
        .ap-header::after {
          content: '';
          position: absolute;
          top: -40px; right: -40px;
          width: 160px; height: 160px;
          background: radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .ap-back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 600;
          color: rgba(255,255,255,.7);
          text-decoration: none;
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.15);
          padding: 6px 12px;
          border-radius: 20px;
          transition: background .2s, color .2s;
        }
        .ap-back-btn:hover { background: rgba(255,255,255,.2); color: #fff; }

        .ap-add-btn {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 700;
          color: #1d4ed8;
          text-decoration: none;
          background: #fff;
          border: none;
          padding: 9px 16px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,.15);
          transition: box-shadow .2s, transform .15s;
        }
        .ap-add-btn:hover { box-shadow: 0 4px 16px rgba(0,0,0,.2); transform: translateY(-1px); }

        .ap-stat-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          padding: 16px;
          text-align: center;
          box-shadow: 0 2px 12px rgba(15,45,107,.06);
          transition: box-shadow .2s, transform .2s;
        }
        .ap-stat-card:hover { box-shadow: 0 4px 20px rgba(15,45,107,.1); transform: translateY(-2px); }

        .ap-search-input {
          width: 100%;
          padding: 11px 14px 11px 40px;
          font-size: 13px; font-weight: 500;
          font-family: inherit;
          color: #0f172a;
          background: #fff;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          outline: none;
          box-shadow: 0 2px 8px rgba(15,45,107,.05);
          transition: border-color .2s, box-shadow .2s;
        }
        .ap-search-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,.12);
        }
        .ap-search-input::placeholder { color: #cbd5e1; }

        .ap-table-wrap {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 12px rgba(15,45,107,.06);
          overflow: hidden;
        }

        .ap-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .ap-table thead tr { background: #f8fafc; border-bottom: 1.5px solid #e2e8f0; }
        .ap-table th { padding: 12px 16px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #94a3b8; text-align: left; white-space: nowrap; }
        .ap-table th.right { text-align: right; }
        .ap-table th.center { text-align: center; }

        .ap-table tbody tr { border-bottom: 1px solid #f1f5f9; transition: background .15s; }
        .ap-table tbody tr:last-child { border-bottom: none; }
        .ap-table tbody tr:hover { background: #f8fafc; }
        .ap-table td { padding: 13px 16px; color: #334155; vertical-align: middle; }
        .ap-table td.right { text-align: right; }
        .ap-table td.center { text-align: center; }

        .ap-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .03em;
        }

        .ap-detail-link {
          display: inline-flex; align-items: center; gap-4px;
          font-size: 12px; font-weight: 700;
          color: #2563eb;
          text-decoration: none;
          padding: 5px 10px;
          border-radius: 8px;
          background: #eff6ff;
          transition: background .2s, color .2s;
        }
        .ap-detail-link:hover { background: #dbeafe; color: #1d4ed8; }

        @media (max-width: 768px) {
          .ap-hide-mobile { display: none; }
        }
      `}</style>

      <main style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Inter', sans-serif" }}>

        {/* ── HEADER ── */}
        <div className="ap-header">
          <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Link href="/dashboard" className="ap-back-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Dashboard
              </Link>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(255,255,255,.5)", marginBottom: 2 }}>
                  Koperasi Elsewedy
                </p>
                <h1 style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-.02em" }}>
                  Manajemen Anggota
                </h1>
              </div>
            </div>

            {["SUPERADMIN", "SEKRETARIS"].includes(currentUser.role) && (
              <Link href="/dashboard/anggota/tambah" className="ap-add-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Tambah Anggota
              </Link>
            )}
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 16px 40px" }}>

          {/* ── STATS ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
            <div className="ap-stat-card">
              <div style={{ fontSize: 28, fontWeight: 800, color: "#2563eb", letterSpacing: "-.02em" }}>{anggotaList.length}</div>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#94a3b8", marginTop: 4 }}>Total Anggota</div>
            </div>
            <div className="ap-stat-card">
              <div style={{ fontSize: 28, fontWeight: 800, color: "#059669", letterSpacing: "-.02em" }}>{totalAktif}</div>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#94a3b8", marginTop: 4 }}>Aktif</div>
            </div>
            <div className="ap-stat-card">
              <div style={{ fontSize: 28, fontWeight: 800, color: "#dc2626", letterSpacing: "-.02em" }}>{totalNonaktif}</div>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#94a3b8", marginTop: 4 }}>Nonaktif</div>
            </div>
            <div className="ap-stat-card">
              <div style={{ fontSize: 22, fontWeight: 800, color: "#7c3aed", letterSpacing: "-.02em" }}>
                Rp {(totalSaldo / 1000000).toFixed(1)}jt
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#94a3b8", marginTop: 4 }}>Total Saldo</div>
            </div>
          </div>

          {/* ── SEARCH ── */}
          <form method="GET" style={{ marginBottom: 16 }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", color: "#94a3b8" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Cari NIK, nama, atau email..."
                className="ap-search-input"
              />
            </div>
          </form>

          {/* ── TABLE ── */}
          <div className="ap-table-wrap">
            <div style={{ overflowX: "auto" }}>
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>NIK</th>
                    <th>Nama</th>
                    <th className="ap-hide-mobile">Role</th>
                    <th className="right ap-hide-mobile">Potongan/Bln</th>
                    <th className="right ap-hide-mobile">Total Saldo</th>
                    <th>Status</th>
                    <th className="center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {anggotaList.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "48px 16px" }}>
                        <div style={{ fontSize: 36, marginBottom: 8 }}>👥</div>
                        <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>Belum ada anggota terdaftar</div>
                      </td>
                    </tr>
                  ) : (
                    anggotaList.map((anggota: any) => {
                      const rc = roleColors[anggota.role] || { bg: "#f1f5f9", color: "#475569" };
                      
                      // LOGIKA UNTUK MENAMPILKAN WAJIB + SUKARELA
                      const wajib = Number(anggota.simpanan_wajib_bulanan || 0);
                      const sukarela = Number(anggota.simpanan_sukarela_bulanan || 0);
                      const totalPotongan = wajib + sukarela;

                      return (
                        <tr key={anggota.id}>
                          <td>
                            <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#0f172a", fontSize: 13 }}>
                              {anggota.nik}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>{anggota.nama}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>
                              {anggota.email?.includes("@koperasi.local") ? "—" : anggota.email}
                            </div>
                          </td>
                          <td className="ap-hide-mobile">
                            <span className="ap-badge" style={{ background: rc.bg, color: rc.color }}>
                              {roleLabels[anggota.role]}
                            </span>
                          </td>
                          <td className="right ap-hide-mobile">
                            {/* TAMPILAN RINCIAN POTONGAN */}
                            <div style={{ fontWeight: 700, color: "#0f172a" }}>
                              Rp {totalPotongan.toLocaleString("id-ID")}
                            </div>
                            <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>
                              W: {wajib / 1000}k | S: {sukarela / 1000}k
                            </div>
                          </td>
                          <td className="right ap-hide-mobile" style={{ fontWeight: 700, color: "#059669" }}>
                            Rp {Number(anggota.total_saldo || 0).toLocaleString("id-ID")}
                          </td>
                          <td>
                            <span className="ap-badge" style={{
                              background: anggota.is_active ? "#d1fae5" : "#fee2e2",
                              color:      anggota.is_active ? "#059669" : "#dc2626",
                            }}>
                              {anggota.is_active ? "✓ Aktif" : "✗ Nonaktif"}
                            </span>
                          </td>
                          <td className="center">
                            <Link href={`/dashboard/anggota/${anggota.id}`} className="ap-detail-link">
                              Detail
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 4 }}>
                                <polyline points="9 18 15 12 9 6"/>
                              </svg>
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
