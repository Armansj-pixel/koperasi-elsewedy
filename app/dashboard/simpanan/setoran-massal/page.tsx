import { requireRole } from "@/lib/auth/session";
import { SetoranMassalForm } from "./SetoranMassalForm";
import Link from "next/link";

export default async function SetoranMassalPage() {
  await requireRole(["SUPERADMIN", "BENDAHARA"]);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link
            href="/dashboard/simpanan"
            className="text-slate-500 hover:text-slate-700 text-sm"
          >
            ← Simpanan
          </Link>
          <span className="text-slate-300">|</span>
          <h1 className="font-bold text-slate-800 text-sm">
            📅 Setoran Bulanan Massal
          </h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              💡 Fitur ini akan input setoran wajib bulanan untuk{" "}
              <strong>semua anggota aktif</strong> sekaligus. Setiap
              anggota akan diproses sesuai nominal{" "}
              <strong>Simpanan Bulanan</strong> masing-masing. Anggota
              yang sudah di-input untuk bulan tersebut akan{" "}
              <strong>dilewati otomatis</strong>.
            </p>
          </div>
          <SetoranMassalForm
            defaultBulan={currentMonth}
            defaultTahun={currentYear}
          />
        </div>
      </div>
    </main>
  );
}
