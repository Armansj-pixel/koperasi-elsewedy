'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
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
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Anggota <span className="text-rose-500">*</span>
        </label>
        {selectedUser ? (
          <div className="flex items-center justify-between p-3.5 border border-emerald-200 rounded-2xl bg-emerald-50">
            <div>
              <p className="text-sm font-semibold text-slate-800">{selectedUser.nama}</p>
              <p className="text-xs text-slate-500">NIK: {selectedUser.nik}</p>
            </div>
            <button
              type="button"
              onClick={() => { setSelectedUser(null); setSearch('') }}
              className="text-xs text-slate-400"
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
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-teal-500 shadow-sm"
            />
            {showDropdown && search.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-slate-400">Tidak ditemukan</p>
                ) : (
                  filtered.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => { setSelectedUser(a); setShowDropdown(false); setSearch('') }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition"
                    >
                      <span className="font-medium text-slate-800">{a.nama}</span>
                      <span className="text-slate-400 ml-2">· {a.nik}</span>
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
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Nominal Pinjaman <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Rp</span>
          <input
            type="text"
            inputMode="numeric"
            value={nominal > 0 ? nominal.toLocaleString('id-ID') : ''}
            onChange={(e) => setNominal(parseInt(e.target.value.replace(/\D/g, '')) || 0)}
            placeholder="0"
            className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-teal-500 shadow-sm"
          />
          <input type="hidden" name="nominal" value={nominal} />
        </div>
      </div>

      {/* Tenor */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Tenor (bulan) <span className="text-rose-500">*</span>
        </label>
        <input
          type="number"
          value={tenor}
          onChange={(e) => setTenor(parseInt(e.target.value) || 1)}
          name="tenor_bulan"
          min={1} max={36}
          className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-teal-500 shadow-sm"
        />
      </div>

      {/* Cicilan terbayar */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Cicilan Sudah Terbayar <span className="text-rose-500">*</span>
        </label>
        <input
          type="number"
          value={cicilanTerbayar}
          onChange={(e) => setCicilanTerbayar(Math.min(parseInt(e.target.value) || 0, tenor))}
          name="cicilan_terbayar"
          min={0}
          max={tenor}
          className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-teal-500 shadow-sm"
        />
        <p className="text-xs text-slate-400 mt-1.5">Sisa cicilan: {sisaCicilan} bulan</p>
      </div>

      {/* Tanggal pencairan */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Tanggal Pencairan Asli <span className="text-rose-500">*</span>
        </label>
        <input
          type="date"
          name="tanggal_pencairan"
          className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-teal-500 shadow-sm"
          required
        />
      </div>

      {/* Ringkasan */}
      {nominal > 0 && tenor > 0 && (
        <div className="bg-white rounded-3xl p-5 shadow-lg shadow-slate-200/40 border border-teal-50 text-sm">
          <p className="font-bold text-slate-800 mb-3">Ringkasan Pinjaman</p>
          <div className="space-y-2.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Nominal</span>
              <span className="font-medium text-slate-800">{formatRupiah(nominal)}</span>
            </div>
            <div className="flex justify-between text-rose-500">
              <span>Biaya admin (4%)</span>
              <span>- {formatRupiah(biayaAdmin)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Cicilan / bulan</span>
              <span className="font-medium text-slate-800">{formatRupiah(cicilanPerBulan)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2.5 font-semibold">
              <span className="text-slate-700">Sisa cicilan</span>
              <span className="text-teal-700">{sisaCicilan} × {formatRupiah(cicilanPerBulan)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Catatan */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Catatan Migrasi <span className="text-slate-400 font-normal">(opsional)</span>
        </label>
        <textarea
          name="catatan"
          rows={2}
          placeholder="Contoh: Data migrasi dari Excel lama"
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-teal-500 shadow-sm"
        />
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-1">
        <Link
          href="/dashboard/pinjaman"
          className="flex-1 text-center py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-600 active:scale-95 transition"
        >
          Batal
        </Link>
        <button
          type="submit"
          disabled={isPending || !selectedUser || nominal === 0}
          className="flex-1 py-3.5 bg-slate-800 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-slate-300/50 disabled:opacity-50 disabled:shadow-none active:scale-95 transition"
        >
          {isPending ? 'Menyimpan...' : '+ Simpan Data'}
        </button>
      </div>
    </form>
  )
}
