import { requireRole } from "@/lib/auth/session";
import { getAllSaldoSimpanan } from "@/lib/simpanan/actions";
import { InputSetoranForm } from "./InputSetoranForm";
import Link from "next/link";

export default async function InputSetoranPage() {
  await requireRole(["SUPERADMIN", "BENDAHARA"]);
  const { data: anggotaList } = await getAllSaldoSimpanan();

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
            ➕ Input Setoran Simpanan
          </h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              💡 <strong>Info:</strong> Input setoran simpanan manual per
              anggota. Untuk setoran bulanan massal semua anggota, gunakan
              fitur{" "}
              <Link
                href="/dashboard/simpanan/setoran-massal"
                className="underline font-semibold"
              >
                Setoran Bulanan Massal
              </Link>
              .
            </p>
          </div>
          <InputSetoranForm anggotaList={anggotaList} />
        </div>
      </div>
    </main>
  );
}
