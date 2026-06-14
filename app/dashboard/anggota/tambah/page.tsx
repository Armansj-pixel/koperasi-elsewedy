import { requireRole } from "@/lib/auth/session";
import { TambahAnggotaForm } from "./TambahAnggotaForm";
import Link from "next/link";

export default async function TambahAnggotaPage() {
  await requireRole(["SUPERADMIN", "SEKRETARIS"]);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link
            href="/dashboard/anggota"
            className="text-slate-500 hover:text-slate-700 transition"
          >
            ← Daftar Anggota
          </Link>
          <span className="text-slate-300">|</span>
          <h1 className="font-bold text-slate-800">➕ Tambah Anggota Baru</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              💡 <strong>Info:</strong> Password default anggota baru adalah{" "}
              <strong>4 digit terakhir NIK</strong>. Anggota akan diminta ganti
              password saat login pertama kali.
            </p>
          </div>
          <TambahAnggotaForm />
        </div>
      </div>
    </main>
  );
}
