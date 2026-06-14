"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { tambahAnggota } from "@/lib/anggota/actions";

const BANK_OPTIONS = [
  "BCA",
  "BRI",
  "BNI",
  "Mandiri",
  "BTN",
  "CIMB Niaga",
  "HSBC",
  "Lainnya",
];

export function TambahAnggotaForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState("");

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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
          <span>✅</span>
          <span>{success}</span>
        </div>
      )}

      {/* ── SECTION: Data Utama ── */}
      <div className="border border-slate-200 rounded-xl p-4 space-y-4">
        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">
          📋 Data Utama
        </h3>

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
          <p className="text-xs text-slate-400 mt-1">
            Password default = 4 digit terakhir NIK
          </p>
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

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Email (Gmail)
          </label>
          <input
            name="email"
            type="email"
            placeholder="contoh@gmail.com"
            disabled={loading}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm disabled:bg-slate-50"
          />
          <p className="text-xs text-slate-400 mt-1">
            💡 Opsional — digunakan untuk notifikasi email
          </p>
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
      </div>

      {/* ── SECTION: Data Bank ── */}
      <div className="border border-slate-200 rounded-xl p-4 space-y-4">
        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">
          🏦 Data Rekening Bank
        </h3>

        {/* No Rekening */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            No. Rekening
          </label>
          <input
            name="no_rekening"
            type="text"
            inputMode="numeric"
            placeholder="Nomor rekening bank"
            disabled={loading}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm disabled:bg-slate-50"
          />
        </div>

        {/* Nama Bank */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Nama Bank
          </label>
          <select
            name="nama_bank"
            disabled={loading}
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm disabled:bg-slate-50 bg-white"
          >
            <option value="">-- Pilih bank --</option>
            {BANK_OPTIONS.map((bank) => (
              <option key={bank} value={bank}>
                {bank}
              </option>
            ))}
          </select>
        </div>

        {/* Input nama bank custom - muncul kalau pilih "Lainnya" */}
        {selectedBank === "Lainnya" && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Nama Bank (Lainnya) <span className="text-red-500">*</span>
            </label>
            <input
              name="nama_bank_custom"
              type="text"
              placeholder="Tuliskan nama bank Anda"
              required
              disabled={loading}
              autoFocus
              className="w-full px-3 py-2.5 border border-blue-400 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm disabled:bg-slate-50 bg-blue-50"
            />
            <p className="text-xs text-blue-600 mt-1">
              ✏️ Wajib diisi karena memilih "Lainnya"
            </p>
          </div>
        )}
      </div>

      {/* ── SECTION: Role & Simpanan ── */}
      <div className="border border-slate-200 rounded-xl p-4 space-y-4">
        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">
          ⚙️ Pengaturan Akun
        </h3>

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
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm disabled:bg-slate-50 bg-white"
          >
            <option value="ANGGOTA">👤 Anggota</option>
            <option value="SEKRETARIS">📋 Sekretaris</option>
            <option value="BENDAHARA">💼 Bendahara</option>
            <option value="KETUA">👔 Ketua</option>
            <option value="SUPERADMIN">🛠️ Super Admin</option>
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
          <p className="text-xs text-slate-400 mt-1">
            Nominal yang dipotong dari gaji setiap bulan
          </p>
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
      </div>

      {/* Submit Buttons */}
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
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
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
