import { requireRole } from "@/lib/auth/session";
import { getAnggotaById } from "@/lib/anggota/actions";
import { EditAnggotaForm } from "./EditAnggotaForm";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function EditAnggotaPage({
  params,
}: {
  params: { id: string };
}) {
  await requireRole(["SUPERADMIN", "SEKRETARIS"]);

  const { data: anggota, error } = await getAnggotaById(params.id);

  if (error || !anggota) {
    redirect("/dashboard/anggota");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link
            href={`/dashboard/anggota/${params.id}`}
            className="text-slate-500 hover:text-slate-700 transition text-sm"
          >
            ← Detail Anggota
          </Link>
          <span className="text-slate-300">|</span>
          <h1 className="font-bold text-slate-800 text-sm">
            ✏️ Edit Anggota - {anggota.nama}
          </h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800">
              ⚠️ <strong>Perhatian:</strong> NIK tidak dapat diubah setelah
              didaftarkan. Hubungi Super Admin jika NIK perlu diperbaiki.
            </p>
          </div>
          <EditAnggotaForm anggota={anggota} />
        </div>
      </div>
    </main>
  );
}
