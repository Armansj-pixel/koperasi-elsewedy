import { requireRole } from "@/lib/auth/session";
import {
  getSaldoByUserId,
  getRiwayatSimpanan,
} from "@/lib/simpanan/actions";
import Link from "next/link";
import { redirect } from "next/navigation";

const jenisLabel: Record<string, string> = {
  SETORAN: "Setoran",
  PENARIKAN: "Penarikan",
  KOREKSI: "Koreksi",
};

const jenisColor: Record<string, string> = {
  SETORAN: "bg-green-100 text-green-700",
  PENARIKAN: "bg-red-100 text-red-700",
  KOREKSI: "bg-amber-100 text-amber-700",
};

const jenisIcon: Record<string, string> = {
  SETORAN: "💰",
  PENARIKAN: "💸",
  KOREKSI: "📝",
};

export default async function DetailSimpananPage({
  params,
}: {
  params: { id: string };
}) {
  const currentUser = await requireRole([
    "SUPERADMIN", "SEKRETARIS", "BENDAHARA", "KETUA",
  ]);

  const { data, error } = await getSaldoByUserId(params.id);
  const { data: riwayat } = await getRiwayatSimpanan(params.id, 50);

  if (error || !data) {
    redirect("/dashboard/simpanan");
  }

  const { saldo, user } = data;
  const canInput = ["SUPERADMIN", "BENDAHARA"].includes(
    currentUser.role
  );

  // Hitung total setoran & penarikan
  const totalSetoran = (riwayat || [])
    .filter((r: any) => r.jenis === "SETORAN")
    .reduce((sum: number, r: any) => sum + Number(r.nominal), 0);

  const totalPenarikan = (riwayat || [])
    .filter((r: any) => r.jenis === "PENARIKAN")
    .reduce((sum: number, r: any) => sum + Number(r.nominal), 0);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/simpanan"
              className="text-slate-500 hover:text-slate-700 text-sm"
            >
              ← Simpanan
            </Link>
            <span className="text-slate-300">|</span>
            <h1 className="font-bold text-slate-800 text-sm">
              💰 Detail Simpanan
            </h1>
          </div>
          {canInput && (
            <Link
              href={`/dashboard/simpanan/input?user_id=${params.id}`}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
            >
              ➕ Input Setoran
            </Link>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">

        {/* Profile + Saldo Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold border-2 border-white/30">
                {user?.nama?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold">{user?.nama}</h2>
                <p className="text-green-100 font-mono text-sm">
                  NIK: {user?.nik}
                </p>
                <p className="text-green-100 text-xs mt-1">
                  Setoran bulanan: Rp{" "}
                  {Number(user?.simpanan_bulanan).toLocaleString(
                    "id-ID"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Saldo Utama */}
          <div className="px-6 py-5 border-b border-slate-100">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">
              Total Saldo Simpanan
            </p>
            <p className="text-4xl font-black text-green-700">
              Rp{" "}
              {Number(saldo?.total_saldo || 0).toLocaleString(
                "id-ID"
              )}
            </p>
            {saldo?.last_updated && (
              <p className="text-xs text-slate-400 mt-1">
                Terakhir update:{" "}
                {new Date(saldo.last_updated).toLocaleString(
                  "id-ID"
                )}
              </p>
            )}
          </div>

          {/* Stats Setoran vs Penarikan */}
          <div className="grid grid-cols-2 divide-x divide-slate-100">
            <div className="px-6 py-4">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
                Total Setoran
              </p>
              <p className="text-xl font-bold text-green-600 mt-1">
                Rp {totalSetoran.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {
                  (riwayat || []).filter(
                    (r: any) => r.jenis === "SETORAN"
                  ).length
                }{" "}
                transaksi
              </p>
            </div>
            <div className="px-6 py-4">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
                Total Penarikan
              </p>
              <p className="text-xl font-bold text-red-500 mt-1">
                Rp {totalPenarikan.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {
                  (riwayat || []).filter(
                    (r: any) => r.jenis === "PENARIKAN"
                  ).length
                }{" "}
                transaksi
              </p>
            </div>
          </div>
        </div>

        {/* Riwayat Mutasi */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <span>📋</span>
              <span>Riwayat Mutasi Simpanan</span>
            </h3>
            <span className="text-xs text-slate-400">
              {(riwayat || []).length} transaksi
            </span>
          </div>

          {!riwayat || riwayat.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <div className="text-4xl mb-2">📭</div>
              <div className="text-sm">Belum ada riwayat transaksi</div>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {riwayat.map((item: any) => (
                <div
                  key={item.id}
                  className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                        item.jenis === "SETORAN"
                          ? "bg-green-100"
                          : item.jenis === "PENARIKAN"
                          ? "bg-red-100"
                          : "bg-amber-100"
                      }`}
                    >
                      {jenisIcon[item.jenis] || "💰"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            jenisColor[item.jenis] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {jenisLabel[item.jenis] || item.jenis}
                        </span>
                        <span className="text-xs text-slate-400">
                          {item.periode}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-0.5">
                        {item.keterangan || "-"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(item.tanggal).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`text-base font-bold ${
                        item.jenis === "SETORAN"
                          ? "text-green-600"
                          : item.jenis === "PENARIKAN"
                          ? "text-red-500"
                          : "text-amber-600"
                      }`}
                    >
                      {item.jenis === "SETORAN" ? "+" : "-"}Rp{" "}
                      {Number(item.nominal).toLocaleString("id-ID")}
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${
                        item.status === "APPROVED"
                          ? "text-green-500"
                          : item.status === "PENDING"
                          ? "text-amber-500"
                          : "text-red-500"
                      }`}
                    >
                      {item.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tombol Aksi */}
        <div className="flex gap-3">
          <Link
            href="/dashboard/simpanan"
            className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl text-sm text-center hover:bg-slate-50 transition"
          >
            ← Kembali
          </Link>
          <Link
            href={`/dashboard/anggota/${params.id}`}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm text-center transition"
          >
            👤 Lihat Profil Anggota
          </Link>
        </div>
      </div>
    </main>
  );
}
