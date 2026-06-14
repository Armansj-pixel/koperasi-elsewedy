import { requireRole } from "@/lib/auth/session";
import {
  getAnggotaById,
  toggleAnggotaStatus,
  resetPasswordAnggota,
} from "@/lib/anggota/actions";
import Link from "next/link";
import { redirect } from "next/navigation";

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

export default async function DetailAnggotaPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { msg?: string; error?: string };
}) {
  const currentUser = await requireRole([
    "SUPERADMIN",
    "SEKRETARIS",
    "BENDAHARA",
    "KETUA",
  ]);

  const { data: anggota, error } = await getAnggotaById(params.id);

  if (error || !anggota) {
    redirect("/dashboard/anggota");
  }

  const saldo = anggota.saldo_simpanan?.[0]?.total_saldo || 0;
  const isSuperAdmin = currentUser.role === "SUPERADMIN";
  const canEdit = ["SUPERADMIN", "SEKRETARIS"].includes(currentUser.role);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/anggota"
              className="text-slate-500 hover:text-slate-700 transition text-sm"
            >
              ← Daftar Anggota
            </Link>
            <span className="text-slate-300">|</span>
            <h1 className="font-bold text-slate-800 text-sm">
              👤 Detail Anggota
            </h1>
          </div>
          {canEdit && (
            <Link
              href={`/dashboard/anggota/${params.id}/edit`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
            >
              ✏️ Edit
            </Link>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

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

        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold border-2 border-white/30">
                {anggota.nama?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold">{anggota.nama}</h2>
                <p className="text-blue-100 font-mono text-sm">
                  NIK: {anggota.nik}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20`}
                  >
                    {roleLabels[anggota.role] || anggota.role}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      anggota.is_active
                        ? "bg-green-400/30 text-green-100"
                        : "bg-red-400/30 text-red-100"
                    }`}
                  >
                    {anggota.is_active ? "✓ Aktif" : "✗ Nonaktif"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Saldo Simpanan */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
                  Saldo Simpanan
                </p>
                <p className="text-2xl font-bold text-green-700 mt-1">
                  Rp {Number(saldo).toLocaleString("id-ID")}
                </p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>
        </div>

        {/* Data Lengkap */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span>📋</span> Data Pribadi
          </h3>
          <div className="space-y-3">
            <DataRow label="NIK" value={anggota.nik} mono />
            <DataRow label="Nama Lengkap" value={anggota.nama} />
            <DataRow label="Email" value={anggota.email} />
            <DataRow label="No. HP" value={anggota.no_hp || "-"} />
            <DataRow
              label="Tanggal Bergabung"
              value={
                anggota.tanggal_bergabung
                  ? new Date(anggota.tanggal_bergabung).toLocaleDateString(
                      "id-ID",
                      { day: "numeric", month: "long", year: "numeric" }
                    )
                  : "-"
              }
            />
            <DataRow
              label="Login Terakhir"
              value={
                anggota.last_login_at
                  ? new Date(anggota.last_login_at).toLocaleString("id-ID")
                  : "Belum pernah login"
              }
            />
          </div>
        </div>

        {/* Data Bank */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span>🏦</span> Data Rekening Bank
          </h3>
          <div className="space-y-3">
            <DataRow label="Nama Bank" value={anggota.nama_bank || "-"} />
            <DataRow
              label="No. Rekening"
              value={anggota.no_rekening || "-"}
              mono
            />
          </div>
        </div>

        {/* Data Koperasi */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span>🏛️</span> Data Koperasi
          </h3>
          <div className="space-y-3">
            <DataRow
              label="Role"
              value={roleLabels[anggota.role] || anggota.role}
              badge
              badgeClass={roleColors[anggota.role]}
            />
            <DataRow
              label="Simpanan Bulanan"
              value={`Rp ${Number(anggota.simpanan_bulanan).toLocaleString("id-ID")}`}
            />
            <DataRow
              label="Status Akun"
              value={anggota.is_active ? "Aktif" : "Nonaktif"}
              badge
              badgeClass={
                anggota.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }
            />
          </div>
        </div>

        {/* Action Buttons (Superadmin only) */}
        {isSuperAdmin && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <span>⚙️</span> Aksi Admin
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">

              {/* Reset Password */}
              <form
                action={async () => {
                  "use server";
                  const result = await resetPasswordAnggota(params.id);
                  if (result.success) {
                    redirect(
                      `/dashboard/anggota/${params.id}?msg=${encodeURIComponent(result.message)}`
                    );
                  } else {
                    redirect(
                      `/dashboard/anggota/${params.id}?error=${encodeURIComponent(result.error || "Gagal reset password")}`
                    );
                  }
                }}
              >
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-4 py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                >
                  🔑 Reset Password
                </button>
              </form>

              {/* Toggle Aktif/Nonaktif */}
              <form
                action={async () => {
                  "use server";
                  const result = await toggleAnggotaStatus(
                    params.id,
                    !anggota.is_active
                  );
                  if (result.success) {
                    redirect(
                      `/dashboard/anggota/${params.id}?msg=${encodeURIComponent(result.message)}`
                    );
                  } else {
                    redirect(
                      `/dashboard/anggota/${params.id}?error=${encodeURIComponent(result.error || "Gagal update status")}`
                    );
                  }
                }}
              >
                <button
                  type="submit"
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 border ${
                    anggota.is_active
                      ? "bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                      : "bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                  }`}
                >
                  {anggota.is_active ? "🚫 Nonaktifkan" : "✅ Aktifkan"}
                </button>
              </form>
            </div>

            <p className="text-xs text-slate-400 mt-3">
              ⚠️ Reset password akan mengembalikan password ke 4 digit terakhir NIK
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

// Helper component
function DataRow({
  label,
  value,
  mono = false,
  badge = false,
  badgeClass = "",
}: {
  label: string;
  value: string;
  mono?: boolean;
  badge?: boolean;
  badgeClass?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-500 flex-shrink-0 w-40">{label}</span>
      {badge ? (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badgeClass}`}>
          {value}
        </span>
      ) : (
        <span className={`text-sm font-semibold text-slate-800 text-right ${mono ? "font-mono" : ""}`}>
          {value}
        </span>
      )}
    </div>
  );
}
