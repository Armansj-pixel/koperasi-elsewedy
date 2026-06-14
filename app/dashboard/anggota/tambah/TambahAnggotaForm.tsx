"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { tambahAnggota } from "@/lib/anggota/actions";

export function TambahAnggotaForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const result = await tambahAnggota(formData);

    setLoading(false);

    if (!result.success) {
      setError(result.error || "Gagal tambah anggota");
      return;
    }

    setSuccess(result.message || "Anggota berhasil ditambahkan!");
    setTimeout(() => {
      router.push("/dashboard/anggota");
      router.refresh();
    }, 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          ✅ {success}
        </div>
      )}

      {/* NIK */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          NIK <span className="text-red-500">*</span>
        </label>
        <input
          name="nik"
          type="text"
          inputMode="numeric"
          placeholder="Nomor Induk Karyawan"
          required
          disabled={loading}
          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm disabled:bg-slate-50"
        />
      </div>

      {/* Nama */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Nama Lengkap <span className="text-red-500">*</span>
        </label>
        <input
          name="nama"
          type="text"
          placeholder="Nama lengkap sesuai KTP"
          required
          disabled={loading}
          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm disabled:bg-slate-50"
        />
      </div>

      {/* No HP */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          No. HP
        </label>
        <input
          name="no_hp"
          type="tel"
          placeholder="08xxxxxxxxxx"
          disabled={loading}
          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm disabled:bg-slate-50"
        />
      </div>

      {/* No Rekening + Bank */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            No. Rekening
          </label>
          <input
            name="no_rekening"
            type="text"
            placeholder="No. rekening bank"
            disabled={loading}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm disabled:bg-slate-50"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Nama Bank
          </label>
          <select
            name="nama_bank"
            disabled={loading}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm disabled:bg-slate-50"
          >
            <option value="">Pilih bank</option>
            <option value="BCA">BCA</option>
            <option value="BRI">BRI</option>
            <option value="BNI">BNI</option>
            <option value="Mandiri">Mandiri</option>
            <option value="BTN">BTN</option>
            <option value="CIMB">CIMB Niaga</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
      </div>

      {/* Role */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Role <span className="text-red-500">*</span>
        </label>
        <select
          name="role"
          required
          disabled={loading}
          defaultValue="ANGGOTA"
          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm disabled:bg-slate-50"
        >
          <option value="ANGGOTA">Anggota</option>
          <option value="SEKRETARIS">Sekretaris</option>
          <option value="BENDAHARA">Bendahara</option>
          <option value="KETUA">Ketua</option>
          <option value="SUPERADMIN">Super Admin</option>
        </select>
      </div>

      {/* Simpanan Bulanan */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Simpanan Bulanan (Rp)
        </label>
        <input
          name="simpanan_bulanan"
          type="number"
          min="0"
          step="10000"
          placeholder="0"
          defaultValue="0"
          disabled={loading}
          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm disabled:bg-slate-50"
        />
      </div>

      {/* Tanggal Bergabung */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Tanggal Bergabung
        </label>
        <input
          name="tanggal_bergabung"
          type="date"
          defaultValue={new Date().toISOString().split("T")[0]}
          disabled={loading}
          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm disabled:bg-slate-50"
        />
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-lg transition text-sm disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition text-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <span>➕</span>
              <span>Tambah Anggota</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
