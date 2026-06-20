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

const roleStyles: Record<
  string,
  {
    bg: string;
    color: string;
  }
> = {
  ANGGOTA: {
    bg: "#dbeafe",
    color: "#2563eb",
  },
  SEKRETARIS: {
    bg: "#f3e8ff",
    color: "#7c3aed",
  },
  BENDAHARA: {
    bg: "#dcfce7",
    color: "#16a34a",
  },
  KETUA: {
    bg: "#fef3c7",
    color: "#d97706",
  },
  SUPERADMIN: {
    bg: "#fee2e2",
    color: "#dc2626",
  },
};

function getGreeting() {
  const hour = new Date().getUTCHours() + 7;

  if (hour >= 5 && hour < 12)
    return { text: "Selamat Pagi", emoji: "🌤️" };

  if (hour >= 12 && hour < 15)
    return { text: "Selamat Siang", emoji: "☀️" };

  if (hour >= 15 && hour < 18)
    return { text: "Selamat Sore", emoji: "🌆" };

  return { text: "Selamat Malam", emoji: "🌙" };
}

export default async function AnggotaPage({
  searchParams,
}: {
  searchParams: {
    search?: string;
  };
}) {
  const currentUser = await requireRole([
    "SUPERADMIN",
    "SEKRETARIS",
    "BENDAHARA",
    "KETUA",
  ]);

  const search = searchParams.search || "";

  const { data: anggotaList } =
    await getAnggotaList(search);

  const totalAktif =
    anggotaList.filter(
      (a: any) => a.is_active
    ).length;

  const totalNonaktif =
    anggotaList.filter(
      (a: any) => !a.is_active
    ).length;

  const greeting = getGreeting();

  return (
    <>
      <style>{`
        *{
          box-sizing:border-box;
        }

        .page{
          min-height:100dvh;
          background:
            linear-gradient(
              180deg,
              #060d1a 0%,
              #0b1629 100%
            );
          position:relative;
          overflow:hidden;
        }

        .orb{
          position:absolute;
          border-radius:50%;
          filter:blur(100px);
          pointer-events:none;
        }

        .container{
          max-width:1280px;
          margin:auto;
          padding:24px 16px 40px;
          position:relative;
          z-index:2;
        }

        .header{
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:16px;
          margin-bottom:28px;
          flex-wrap:wrap;
        }

        .header-left{
          display:flex;
          flex-direction:column;
          gap:6px;
        }

        .breadcrumb{
          display:flex;
          align-items:center;
          gap:10px;
          font-size:13px;
          color:rgba(147,197,253,.7);
        }

        .title{
          font-size:30px;
          font-weight:800;
          letter-spacing:-.03em;
          color:#fff;
          margin:0;
        }

        .subtitle{
          color:
            rgba(147,197,253,.65);
          font-size:14px;
          margin:0;
        }

        .primary-btn{
          display:inline-flex;
          align-items:center;
          gap:8px;
          padding:12px 18px;
          border:none;
          border-radius:14px;
          text-decoration:none;
          font-size:14px;
          font-weight:700;
          color:#fff;
          background:
            linear-gradient(
              135deg,
              #1d4ed8,
              #2563eb
            );
          box-shadow:
            0 8px 24px
            rgba(37,99,235,.35);
          transition:.2s;
        }

        .primary-btn:hover{
          transform:
            translateY(-2px);
        }

        .stats{
          display:grid;
          grid-template-columns:
            repeat(
              auto-fit,
              minmax(180px,1fr)
            );
          gap:16px;
          margin-bottom:24px;
        }

        .stat-card{
          background:
            rgba(255,255,255,.98);
          border-radius:24px;
          padding:24px;
          box-shadow:
            0 20px 60px
            rgba(0,0,0,.18);
        }

        .stat-value{
          font-size:34px;
          font-weight:800;
          color:#0f172a;
          line-height:1;
        }

        .stat-label{
          margin-top:10px;
          font-size:11px;
          font-weight:700;
          letter-spacing:.08em;
          text-transform:uppercase;
          color:#64748b;
        }

        .glass{
          background:
            rgba(255,255,255,.98);
          border-radius:24px;
          box-shadow:
            0 20px 60px
            rgba(0,0,0,.18);
        }

        .search-box{
          padding:20px;
          margin-bottom:20px;
        }

        .search-input{
          width:100%;
          height:54px;
          border-radius:16px;
          border:
            1px solid #e2e8f0;
          background:#f8fafc;
          padding:0 20px 0 48px;
          font-size:14px;
          outline:none;
        }

        .search-input:focus{
          border-color:#2563eb;
          background:#fff;
          box-shadow:
            0 0 0 4px
            rgba(37,99,235,.12);
        }

        .table-wrap{
          overflow-x:auto;
        }

        table{
          width:100%;
          border-collapse:collapse;
        }

        th{
          text-align:left;
          padding:18px;
          font-size:12px;
          font-weight:700;
          letter-spacing:.06em;
          text-transform:uppercase;
          color:#64748b;
          border-bottom:
            1px solid #e2e8f0;
        }

        td{
          padding:18px;
          border-bottom:
            1px solid #f1f5f9;
        }

        tr:hover{
          background:#f8fafc;
        }

        .nik{
          font-family:monospace;
          font-weight:700;
          color:#334155;
        }

        .nama{
          font-weight:700;
          color:#0f172a;
        }

        .email{
          margin-top:4px;
          font-size:12px;
          color:#94a3b8;
        }

        .badge{
          display:inline-flex;
          align-items:center;
          padding:4px 12px;
          border-radius:999px;
          font-size:11px;
          font-weight:700;
          letter-spacing:.04em;
        }

        .detail{
          color:#2563eb;
          text-decoration:none;
          font-weight:700;
          font-size:13px;
        }

        .empty{
          text-align:center;
          padding:80px 24px;
        }

        .empty-icon{
          font-size:54px;
        }

        .empty-title{
          margin-top:16px;
          font-size:20px;
          font-weight:700;
          color:#0f172a;
        }

        .empty-text{
          margin-top:10px;
          color:#64748b;
        }

        @media(max-width:768px){

          .title{
            font-size:24px;
          }

          .hide-mobile{
            display:none;
          }

          td,
          th{
            padding:14px;
          }
        }
      `}</style>

      <main className="page">
        <div
          className="orb"
          style={{
            width: 500,
            height: 500,
            background:
              "radial-gradient(circle,#2563eb,transparent)",
            opacity: 0.18,
            top: -220,
            left: -220,
          }}
        />

        <div
          className="orb"
          style={{
            width: 400,
            height: 400,
            background:
              "radial-gradient(circle,#4f46e5,transparent)",
            opacity: 0.14,
            top: "30%",
            right: -180,
          }}
        />

        <div className="container">

          <div className="header">

            <div className="header-left">
              <div className="breadcrumb">
                <Link
                  href="/dashboard"
                  style={{
                    color:
                      "rgba(147,197,253,.8)",
                    textDecoration: "none",
                  }}
                >
                  ← Dashboard
                </Link>

                <span>•</span>

                <span>
                  Manajemen Anggota
                </span>
              </div>

              <h1 className="title">
                {greeting.text},{" "}
                {currentUser.nama}{" "}
                {greeting.emoji}
              </h1>

              <p className="subtitle">
                Kelola data anggota
                koperasi secara aman dan
                terpusat.
              </p>
            </div>

            {[
              "SUPERADMIN",
              "SEKRETARIS",
            ].includes(
              currentUser.role
            ) && (
              <Link
                href="/dashboard/anggota/tambah"
                className="primary-btn"
              >
                ➕ Tambah Anggota
              </Link>
            )}
          </div>

          <div className="stats">

            <div className="stat-card">
              <div
                className="stat-value"
                style={{
                  color: "#2563eb",
                }}
              >
                {anggotaList.length}
              </div>
              <div className="stat-label">
                Total Anggota
              </div>
            </div>

            <div className="stat-card">
              <div
                className="stat-value"
                style={{
                  color: "#16a34a",
                }}
              >
                {totalAktif}
              </div>
              <div className="stat-label">
                Aktif
              </div>
            </div>

            <div className="stat-card">
              <div
                className="stat-value"
                style={{
                  color: "#dc2626",
                }}
              >
                {totalNonaktif}
              </div>
              <div className="stat-label">
                Nonaktif
              </div>
            </div>
          </div>

          <div
            className="glass search-box"
          >
            <form method="GET">
              <div
                style={{
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position:
                      "absolute",
                    left: 18,
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                  }}
                >
                  🔍
                </span>

                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Cari NIK, nama, atau email..."
                  className="search-input"
                />
              </div>
            </form>
          </div>

          <div className="glass">
            <div className="table-wrap">

              <table>

                <thead>
                  <tr>
                    <th>NIK</th>
                    <th>Nama</th>
                    <th className="hide-mobile">
                      Role
                    </th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>

                <tbody>

                  {anggotaList.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan={5}
                      >
                        <div className="empty">
                          <div className="empty-icon">
                            👥
                          </div>

                          <div className="empty-title">
                            Belum Ada
                            Anggota
                          </div>

                          <div className="empty-text">
                            Tambahkan
                            anggota baru
                            untuk mulai
                            menggunakan
                            sistem.
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    anggotaList.map(
                      (
                        anggota: any
                      ) => (
                        <tr
                          key={
                            anggota.id
                          }
                        >
                          <td className="nik">
                            {
                              anggota.nik
                            }
                          </td>

                          <td>
                            <div className="nama">
                              {
                                anggota.nama
                              }
                            </div>

                            <div className="email">
                              {
                                anggota.email
                              }
                            </div>
                          </td>

                          <td className="hide-mobile">
                            <span
                              className="badge"
                              style={{
                                background:
                                  roleStyles[
                                    anggota
                                      .role
                                  ]
                                    .bg,
                                color:
                                  roleStyles[
                                    anggota
                                      .role
                                  ]
                                    .color,
                              }}
                            >
                              {
                                roleLabels[
                                  anggota
                                    .role
                                ]
                              }
                            </span>
                          </td>

                          <td>
                            <span
                              className="badge"
                              style={{
                                background:
                                  anggota.is_active
                                    ? "#dcfce7"
                                    : "#fee2e2",
                                color:
                                  anggota.is_active
                                    ? "#16a34a"
                                    : "#dc2626",
                              }}
                            >
                              {anggota.is_active
                                ? "✓ Aktif"
                                : "✗ Nonaktif"}
                            </span>
                          </td>

                          <td>
                            <Link
                              href={`/dashboard/anggota/${anggota.id}`}
                              className="detail"
                            >
                              Detail →
                            </Link>
                          </td>
                        </tr>
                      )
                    )
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
