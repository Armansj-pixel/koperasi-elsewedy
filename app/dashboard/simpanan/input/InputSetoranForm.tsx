"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inputSetoran } from "@/lib/simpanan/actions";

const JENIS_SIMPANAN = [
  {
    value: "SIMPANAN_WAJIB",
    label: "💸 Simpanan Wajib",
    desc: "Dipotong dari gaji bulanan",
  },
  {
    value: "SIMPANAN_POKOK",
    label: "💵 Simpanan Pokok",
    desc: "Dibayar sekali saat mendaftar",
  },
  {
    value: "SIMPANAN_SUKARELA",
    label: "🎁 Simpanan Sukarela",
    desc: "Setoran tambahan atas inisiatif anggota",
  },
];

export function InputSetoranForm({
  anggotaList,
}: {
  anggotaList: any[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedAnggota, setSelectedAnggota] = useState<any>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const result = await inputSetoran(formData);

    setLoading(false);

    if (!result.success) {
      setError(result.error || "Gagal input setoran");
      return;
    }

    setSuccess(result.message || "Setoran berhasil dicatat!");
    // Reset form
    (e.target as HTMLFormElement).reset();
    setSelectedAnggota(null);
  }

  function handleAnggotaChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const anggota = anggotaList.find((a) => a.id === e.target.value);
    setSelectedAnggota(anggota || null);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
          <span>✅</span>
          <span>{success}</span>
        </div>
      )}

      {/* Pilih Anggota */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Anggota <span className="text-red-500">*</span>
        </label>
        <select
          name="user_id"
          required
          disabled={loading}
          onChange={handleAnggotaChange}
          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm disabled:bg-slate-50 bg-white"
        >
          <option value="">-- Pilih anggota --</option>
          {anggotaList.map((anggota: any) => (
            <option key={anggota.id} value={anggota.id}>
              {anggota.nik} - {anggota.nama}
            </option>
          ))}
        </select>

        {/* Info Saldo Anggota */}
        {selectedAnggota && (
          <div className="mt-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-green-800">
              <span className="font-semibold">{selectedAnggota.nama}</span>
            </div>
            <div className="text-right">
              <div className="text-xs text-green-600">Saldo saat ini</div>
              <div className="font-bold text-green-700">
                Rp{" "}
                {Number(
                  selectedAnggota.saldo_simpanan?.[0]?.total_saldo || 0
                ).toLocaleString("id-ID")}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Jenis Simpanan */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Jenis Simpanan <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {JENIS_SIMPANAN.map((jenis) => (
            <label
              key={jenis.value}
              className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition has-[:checked]:border-blue-400 has-[:checked]:bg-blue-50"
            >
              <input
                type="radio"
                name="jenis"
                value={jenis.value}
                defaultChecked={jenis.value === "SIMPANAN_WAJIB"}
                disabled={loading}
                className="accent-blue-600"
              />
              <div>
                <div className="text-sm font-semibold">{jenis.label}</div>
                <div className="text-xs text-slate-500">{jenis.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Jumlah */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Jumlah Setoran (Rp) <span className="text-red-500">*</span>
        </label>
        <input
          name="jumlah"
          type="number"
          min="1000"
          step="1000"
          placeholder="0"
          required
          disabled={loading}
          defaultValue={
            selectedAnggota?.simpanan_bulanan || ""
          }
          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm disabled:bg-slate-50"
        />
        <p className="text-xs text-slate-400 mt-1">
          Minimal Rp 1.000
        </p>
      </div>

      {/* Tanggal */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Tanggal
        </label>
        <input
          name="tanggal"
          type="date"
          defaultValue={new Date().toISOString().split("T")[0]}
          disabled={loading}
          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm disabled:bg-slate-50"
        />
      </div>

      {/* Keterangan */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Keterangan
        </label>
        <input
          name="keterangan"
          type="text"
          placeholder="Keterangan setoran (opsional)"
          disabled={loading}
          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm disabled:bg-slate-50"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-lg transition text-sm disabled:opacity-50"
        >
          ← Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <span>💾</span>
              <span>Simpan Setoran</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
