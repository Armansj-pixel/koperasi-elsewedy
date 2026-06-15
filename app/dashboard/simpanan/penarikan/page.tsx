import { requireRole } from "@/lib/auth/session";
import {
  getListPenarikan,
  updateStatusPenarikan,
} from "@/lib/simpanan/actions";
import Link from "next/link";
import { redirect } from "next/navigation";

const statusColor: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  DISBURSED: "bg-blue-100 text-blue-700",
};

const statusLabel: Record<string, string> = {
  PENDING: "⏳ Menunggu",
  APPROVED: "✅ Disetujui",
  REJECTED: "❌ Ditolak",
  DISBURSED: "💸 Dicairkan",
};

export default async function PenarikanPage({
  searchParams,
}: {
  searchParams: { filter?: string; msg?: string; error?: string };
}) {
  await requireRole(["SUPERADMIN", "BENDAHARA", "KETUA"]);

  const filter = searchParams.filter || "";
  const { data: penarikanList } = await getListPenarikan(
    filter || undefined
  );

  const totalPending = penarikanList.filter(
    (p: any) => p.status === "PENDING"
  ).length;
  const totalApproved = penarikanList.filter(
    (p: any) => p.status === "APPROVED"
  ).length;
  const totalRejected = penarikanList.filter(
    (p: any) => p.status === "REJECTED"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link
            href="/dashboard/simpanan"
            className="text-slate-500 hover:text-slate-700 text-sm"
          >
            ← Simpanan
          </Link>
          <span className="text-slate-300">|</span>
          <h1 className="font-bold text-slate-800 text-sm">
            📋 Pengajuan Penarikan Simpanan
          </h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">

        {/* Flash Message */}
        {searchParams.msg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            ✅ {searchParams.msg}
          </div>
        )}
        {searchParams.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            ⚠️ {searchParams.error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-amber-600">
              {totalPending}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-semibold uppercase">
              Menunggu
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {totalApproved}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-semibold uppercase">
              Disetujui
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-red-500">
              {totalRejected}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-semibold uppercase">
              Ditolak
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {[
            { label: "Semua", value: "" },
            { label: "⏳ Menunggu", value: "PENDING" },
            { label: "✅ Disetujui", value: "APPROVED" },
            { label: "❌ Ditolak", value: "REJECTED" },
          ].map((f) => (
            <Link
              key={f.value}
              href={`/dashboard/simpanan/penarikan${
                f.value ? `?filter=${f.value}` : ""
              }`}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition border ${
                filter === f.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {/* List Penarikan */}
        <div className="space-y-3">
          {penarikanList.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
              <div className="text-4xl mb-2">📭</div>
              <div className="text-sm">
                Tidak ada pengajuan penarikan
              </div>
            </div>
          ) : (
            penarikanList.map((item: any) => {
              const user = item.users;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-5"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    {/* Info Anggota */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-700 flex-shrink-0">
                        {user?.nama?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">
                          {user?.nama}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          NIK: {user?.nik}
                        </div>
                        {user?.nama_bank && user?.no_rekening && (
                          <div className="text-xs text-slate-400 mt-0.5">
                            🏦 {user.nama_bank} -{" "}
                            {user.no_rekening}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Nominal + Status */}
                    <div className="text-right">
                      <div className="text-xl font-black text-slate-800">
                        Rp{" "}
                        {Number(item.nominal).toLocaleString(
                          "id-ID"
                        )}
                      </div>
                      <span
                        className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          statusColor[item.status]
                        }`}
                      >
                        {statusLabel[item.status]}
                      </span>
                    </div>
                  </div>

                  {/* Detail */}
                  <div className="mt-3 pt-3 border-t border-slate-50 grid grid-cols-2 gap-2 text-xs text-slate-500">
                    <div>
                      📅 Diajukan:{" "}
                      {new Date(
                        item.tanggal_pengajuan
                      ).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                    {item.catatan && (
                      <div>📝 Catatan: {item.catatan}</div>
                    )}
                    {item.rejected_reason && (
                      <div className="text-red-500 col-span-2">
                        ❌ Alasan ditolak: {item.rejected_reason}
                      </div>
                    )}
                    {item.approved_at && (
                      <div>
                        ✅ Diproses:{" "}
                        {new Date(
                          item.approved_at
                        ).toLocaleDateString("id-ID")}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons - hanya untuk PENDING */}
                  {item.status === "PENDING" && (
                    <div className="mt-4 flex gap-2">
                      {/* Approve */}
                      <form
                        action={async () => {
                          "use server";
                          const result =
                            await updateStatusPenarikan(
                              item.id,
                              "APPROVED"
                            );
                          if (result.success) {
                            redirect(
                              `/dashboard/simpanan/penarikan?msg=${encodeURIComponent(
                                result.message ?? "Berhasil"
                              )}`
                            );
                          } else {
                            redirect(
                              `/dashboard/simpanan/penarikan?error=${encodeURIComponent(
                                result.error ?? "Gagal"
                              )}`
                            );
                          }
                        }}
                        className="flex-1"
                      >
                        <button
                          type="submit"
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg text-sm transition"
                        >
                          ✅ Setujui
                        </button>
                      </form>

                      {/* Reject */}
                      <form
                        action={async () => {
                          "use server";
                          const result =
                            await updateStatusPenarikan(
                              item.id,
                              "REJECTED",
                              "Ditolak oleh Bendahara"
                            );
                          if (result.success) {
                            redirect(
                              `/dashboard/simpanan/penarikan?msg=${encodeURIComponent(
                                result.message ?? "Berhasil"
                              )}`
                            );
                          } else {
                            redirect(
                              `/dashboard/simpanan/penarikan?error=${encodeURIComponent(
                                result.error ?? "Gagal"
                              )}`
                            );
                          }
                        }}
                        className="flex-1"
                      >
                        <button
                          type="submit"
                          className="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold py-2.5 rounded-lg text-sm transition"
                        >
                          ❌ Tolak
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
