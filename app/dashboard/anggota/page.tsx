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

function getGreeting(): { text: string; emoji: string } {
  const hour = new Date().getUTCHours() + 7; // Adjust UTC to WIB (GMT+7)
  if (hour >= 5 && hour < 12) return { text: "Selamat Pagi", emoji: "🌤️" };
  if (hour >= 12 && hour < 15) return { text: "Selamat Siang", emoji: "☀️" };
  if (hour >= 15 && hour < 18) return { text: "Selamat Sore", emoji: "🌆" };
  return { text: "Selamat Malam", emoji: "🌙" };
}

export default async function AnggotaPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const currentUser = await requireRole([
    "SUPERADMIN",
    "SEKRETARIS",
    "BENDAHARA",
    "KETUA",
  ]);
  const search = searchParams.search || "";
  const { data: anggotaList } = await getAnggotaList(search);

  const totalAktif = anggotaList.filter((a: any) => a.is_active).length;
  const totalNonaktif = anggotaList.filter((a: any) => !a.is_active).length;
  const totalSaldo = anggotaList.reduce(
    (sum: number, a: any) => sum + Number(a.total_saldo || 0),
    0
  );
  const totalPinjaman = anggotaList.reduce(
    (sum: number, a: any) => sum + Number(a.sisa_pinjaman || 0),
    0
  );

  const greeting = getGreeting();

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
      `}</style>

      <main
        style={{
          minHeight: "100vh",
          background: "#f1f5f9",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* ── HEADER ── */}
        <div className="ap-header">
          <div
            style={{
              maxWidth: 1280,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
              zIndex: 2,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Link href="/dashboard" className="ap-back-btn">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Dashboard
              </Link>
              <div>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,.5)",
                    marginBottom: 2,
                  }}
                >
                  Koperasi Elsewedy
                </p>
                <h1
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: "-.02em",
                  }}
                >
                  {greeting.text}, {currentUser.nama} {greeting.emoji}
                </h1>
              </div>
            </div>
            {["SUPERADMIN", "SEKRETARIS"].includes(currentUser.role) && (
              <Link href="/dashboard/anggota/tambah" className="ap-add-btn">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Tambah Anggota
              </Link>
            )}
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 16px" }}>
          {/* ── STATS ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
            }}
          >
            <div className="ap-stat-card">
              <div style={{ fontSize: 28, fontWeight: 800, color: "#2563eb" }}>
                {anggotaList.length}
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "#94a3b8",
                }}
              >
                Total Anggota
              </div>
            </div>
            <div className="ap-stat-card">
              <div style={{ fontSize: 28, fontWeight: 800, color: "#059669" }}>
                {totalAktif}
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "#94a3b8",
                }}
              >
                Aktif
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
