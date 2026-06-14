"use client";

import { useState } from "react";
import { inputSetoranBulananMassal } from "@/lib/simpanan/actions";

const BULAN = [
  "Januari", "Februari", "Maret", "April",
  "Mei", "Juni", "Juli", "Agustus",
  "September", "Oktober", "November", "Desember",
];

export function SetoranMassalForm({
  defaultBulan,
  defaultTahun,
}: {
  defaultBulan: number;
  defaultTahun: number;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [bulan, setBulan] = useState(defaultBulan);
  const [tahun, setTahun] = useState(defaultTahun);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !confirm(
        `Proses setoran bulanan untuk ${BULAN[bulan - 1]} ${tahun}?\n\nSemua anggota aktif akan diproses sekaligus.`
      )
    ) {
      return;
    }

    setLoading(true);
    setResult(null);

    const res = await inputSetoranBulananMassal(bulan, tahun);

    setLoading(false);
    setResult(res);
  }

  const years = Array.from({ length: 5 }, (_, i) => defaultTahun - 2 + i);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {result && (
        <div
          className={`px-4 py-3 rounded-lg text-sm flex items-start gap-2 ${
            result.success
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          <span>{result.success ? "✅" : "⚠️"}</span>
          <div>
            <div>{result.message}</div>
            {result.success && (
              <div className="mt-2 text-xs">
                ✅ Berhasil: {result.berhasil} anggota · ❌ Gagal:{" "}
                {result.gagal} anggota
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pilih Bulan & Tahun */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Bulan <span className="text-red-500">*</span>
          </label>
          <select
            value={bulan}
            onChange={(e) => setBulan(Number(e.target.value))}
            disabled={loading}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm bg-white"
          >
            {BULAN.map((b, i) => (
              <option key={i + 1} value={i + 1}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Tahun <span className="text-red-500">*</span>
          </label>
          <select
            value={tahun}
            onChange={(e) => setTahun(Number(e.target.value))}
            disabled={loading}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm bg-white"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="text-sm text-slate-600">
          <strong>📋 Preview:</strong> Akan memproses setoran wajib
          bulan{" "}
          <strong className="text-blue-700">
            {BULAN[bulan - 1]} {tahun}
          </strong>{" "}
          untuk semua anggota aktif pada tanggal{" "}
          <strong>25/{String(bulan).padStart(2, "0")}/{tahun}</strong>.
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span>Memproses semua anggota...</span>
          </>
        ) : (
          <>
            <span>📅</span>
            <span>
              Proses Setoran {BULAN[bulan - 1]} {tahun}
            </span>
          </>
        )}
      </button>
    </form>
  );
}
