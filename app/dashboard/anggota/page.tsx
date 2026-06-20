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

const roleColors: Record<string, string> = {
  ANGGOTA: "bg-blue-100 text-blue-700",
  SEKRETARIS: "bg-purple-100 text-purple-700",
  BENDAHARA: "bg-green-100 text-green-700",
  KETUA: "bg-amber-100 text-amber-700",
  SUPERADMIN: "bg-red-100 text-red-700",
};

export default async function AnggotaPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const currentUser = await requireRole(["SUPERADMIN", "SEKRETARIS", "BENDAHARA", "KETUA"]);
  const search = searchParams.search || "";
  const { data: anggotaList } = await getAnggotaList(search);
  const totalAktif = anggotaList.filter((a: any) => a.is_active).length;
  const totalNonaktif = anggotaList.filter((a: any) => !a.is_active).length;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-slate-500 hover:text-slate-700 transition"
            >
              ← Dashboard
            </Link>
            <span className="text-slate-300">|</span>
            <h1 className="font-bold text-slate-800">👥 Manajemen Anggota</h1>
          </div>
          {["SUPERADMIN", "SEKRETARIS"].includes(currentUser.role) && (
            <Link
              href="/dashboard/anggota/tambah"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
            >
              <span>➕</span>
              <span>Tambah Anggota</span>
            </Link>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-blue-600">{anggotaList.length}</div>
            <div className="text-xs text-slate-500 mt-1 font-semibold uppercase">Total Anggota</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-green-600">{totalAktif}</div>
            <div className="text-xs text-slate-500 mt-1 font-semibold uppercase">Aktif</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-red-500">{totalNonaktif}</div>
            <div className="text-xs text-slate-500 mt-1 font-semibold uppercase">Nonaktif</div>
          </div>
        </div>

        {/* Search */}
        <form method="GET" className="mb-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Cari NIK, nama, atau email..."
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
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">NIK</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Nama</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Simpanan/Bln</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {anggotaList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      <div className="text-4xl mb-2">👥</div>
                      <div>Belum ada anggota terdaftar</div>
                    </td>
                  </tr>
                ) : (
                  anggotaList.map((anggota: any) => (
                    <tr key={anggota.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-mono font-semibold text-slate-700">
                        {anggota.nik}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{anggota.nama}</div>
                        <div className="text-xs text-slate-400">{anggota.email}</div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${roleColors[anggota.role]}`}>
                          {roleLabels[anggota.role]}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell font-semibold text-slate-700">
                        Rp {Number(anggota.simpanan_bulanan).toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${anggota.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {anggota.is_active ? "✓ Aktif" : "✗ Nonaktif"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/anggota/${anggota.id}`}
                          className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                        >
                          Detail →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
