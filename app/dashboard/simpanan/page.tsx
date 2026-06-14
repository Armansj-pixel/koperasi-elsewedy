import { requireRole } from "@/lib/auth/session";
import { getAllSaldoSimpanan } from "@/lib/simpanan/actions";
import Link from "next/link";

export default async function SimpananPage({
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
  const { data: anggotaList } = await getAllSaldoSimpanan(search);

  // Hitung total
  const totalSaldo = anggotaList.reduce((sum: number, a: any) => {
    return sum + Number(a.saldo_simpanan?.[0]?.total_saldo || 0);
  }, 0);

  const canInput = ["SUPERADMIN", "BENDAHARA"].includes(currentUser.role);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-slate-500 hover:text-slate-700 text-sm"
            >
              ← Dashboard
            </Link>
            <span className="text-slate-300">|</span>
            <h1 className="font-bold text-slate-800">
              💰 Modul Simpanan
            </h1>
          </div>
          <div className="flex gap-2">
            {canInput && (
              <>
                <Link
                  href="/dashboard/simpanan/input"
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition"
                >
                  ➕ Input Setoran
                </Link>
                <Link
                  href="/dashboard/simpanan/penarikan"
                  className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg text-xs font-semibold transition"
                >
                  📋 Penarikan
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {anggotaList.length}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-semibold uppercase">
              Total Anggota
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm md:col-span-2">
            <div className="text-2xl font-bold text-green-600">
              Rp {totalSaldo.toLocaleString("id-ID")}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-semibold uppercase">
              Total Saldo Simpanan
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-purple-600">
              Rp{" "}
              {anggotaList.length > 0
                ? Math.round(
                    totalSaldo / anggotaList.length
                  ).toLocaleString("id-ID")
                : 0}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-semibold uppercase">
              Rata-rata/Anggota
            </div>
          </div>
        </div>

        {/* Setoran Massal Banner */}
        {canInput && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 mb-6 text-white flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="font-bold text-lg">
                📅 Setoran Bulanan Massal
              </div>
              <div className="text-sm opacity-90">
                Input setoran bulanan untuk semua anggota aktif sekaligus
              </div>
            </div>
            <Link
              href="/dashboard/simpanan/setoran-massal"
              className="bg-white text-blue-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-50 transition"
            >
              Proses Sekarang →
            </Link>
          </div>
        )}

        {/* Search */}
        <form method="GET" className="mb-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Cari NIK atau nama anggota..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 text-sm shadow-sm"
            />
          </div>
        </form>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">
                    NIK
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">
                    Nama Anggota
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">
                    Setoran/Bulan
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">
                    Total Saldo
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {anggotaList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-12 text-slate-400"
                    >
                      <div className="text-4xl mb-2">💰</div>
                      <div>Tidak ada data simpanan</div>
                    </td>
                  </tr>
                ) : (
                  anggotaList.map((anggota: any) => {
                    const saldo = Number(
                      anggota.saldo_simpanan?.[0]?.total_saldo || 0
                    );
                    return (
                      <tr
                        key={anggota.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition"
                      >
                        <td className="px-4 py-3 font-mono text-sm text-slate-600">
                          {anggota.nik}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {anggota.nama}
                        </td>
                        <td className="px-4 py-3 text-right hidden md:table-cell text-slate-600">
                          Rp{" "}
                          {Number(
                            anggota.simpanan_bulanan
                          ).toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-green-700">
                          Rp {saldo.toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Link
                            href={`/dashboard/simpanan/${anggota.id}`}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                          >
                            Detail →
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
  );
}
