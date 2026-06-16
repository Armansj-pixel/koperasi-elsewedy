'use client'

import { useState, useTransition } from 'react'
import { inputPinjamanExisting } from '@/lib/pinjaman/actions'

interface Anggota {
  id: string
  nama: string
  nik: string
}

interface PinjamanExistingFormProps {
  anggotaList: Anggota[]
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export default function PinjamanExistingForm({ anggotaList }: PinjamanExistingFormProps) {
  const [isPending, startTransition] = useTransition()
  const [nominal, setNominal] = useState(0)
  const [tenor, setTenor] = useState(12)
  const [cicilanTerbayar, setCicilanTerbayar] = useState(0)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<Anggota | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  const biayaAdmin = Math.round(nominal * 0.04)
  const totalDiterima = nominal - biayaAdmin
  const cicilanPerBulan = tenor > 0 ? Math.round(nominal / tenor) : 0
  const sisaCicilan = Math.max(0, tenor - cicilanTerbayar)

  const filtered = anggotaList.filter(
    (a) =>
      a.nama.toLowerCase().includes(search.toLowerCase()) ||
      a.nik.includes(search)
  ).slice(0, 8)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(() => inputPinjamanExisting(formData))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Pilih Anggota */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Anggota <span className="text-red-500">*</span>
        </label>
        {selectedUser ? (
          <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-green-50">
            <div>
              <p className="text-sm font-medium text-gray-900">{selectedUser.nama}</p>
              <p className="text-xs text-gray-500">NIK: {selectedUser.nik}</p>
            </div>
            <button
              type="button"
              onClick={() => { setSelectedUser(null); setSearch('') }}
              className="text-xs text-gray-400 hover:text-red-500"
            >
              Ganti
            </button>
            <input type="hidden" name="user_id" value={selectedUser.id} />
          </div>
        ) : (
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowDropdown(true) }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Cari nama atau NIK anggota..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
            {showDropdown && search.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-gray-400">Tidak ditemukan</p>
                ) : (
                  filtered.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => { setSelectedUser(a); setShowDropdown(false); setSearch('') }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition"
                    >
                      <span className="font-medium">{a.nama}</span>
                      <span className="text-gray-400 ml-2">· {a.nik}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Nominal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nominal Pinjaman <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
          <input
            type="text"
            value={nominal > 0 ? nominal.toLocaleString('id-ID') : ''}
            onChange={(e) => setNominal(parseInt(e.target.value.replace(/\D/g, '')) || 0)}
            placeholder="0"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
          <input type="hidden" name="nominal" value={nominal} />
        </div>
      </div>

      {/* Tenor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tenor (bulan) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={tenor}
          onChange={(e) => setTenor(parseInt(e.target.value) || 1)}
          name="tenor_bulan"
          min={1} max={36}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Cicilan terbayar */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cicilan Sudah Terbayar <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={cicilanTerbayar}
          onChange={(e) => setCicilanTerbayar(Math.min(parseInt(e.target.value) || 0, tenor))}
          name="cicilan_terbayar"
          min={0}
          max={tenor}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-1">Sisa cicilan: {sisaCicilan} bulan</p>
      </div>

      {/* Tanggal pencairan */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tanggal Pencairan Asli <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="tanggal_pencairan"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Ringkasan */}
      {nominal > 0 && tenor > 0 && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-sm">
          <p className="font-semibold text-blue-900 mb-3">Ringkasan Pinjaman</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Nominal</span>
              <span className="font-medium">{formatRupiah(nominal)}</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Biaya admin (4%)</span>
              <span>- {formatRupiah(biayaAdmin)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Cicilan / bulan</span>
              <span className="font-medium">{formatRupiah(cicilanPerBulan)}</span>
            </div>
            <div className="flex justify-between border-t border-blue-200 pt-2 font-semibold">
              <span>Sisa cicilan</span>
              <span className="text-blue-800">{sisaCicilan} × {formatRupiah(cicilanPerBulan)} = {formatRupiah(sisaCicilan * cicilanPerBulan)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Catatan */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Catatan Migrasi <span className="text-gray-400 font-normal">(opsional)</span>
        </label>
        <textarea
          name="catatan"
          rows={2}
          placeholder="Contoh: Data migrasi dari Excel lama"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <a
          href="/dashboard/pinjaman"
          className="flex-1 text-center py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          Batal
        </a>
        <button
          type="submit"
          disabled={isPending || !selectedUser || nominal === 0}
          className="flex-1 py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isPending ? 'Menyimpan...' : '+ Simpan Data Existing'}
        </button>
      </div>
    </form>
  )
}
