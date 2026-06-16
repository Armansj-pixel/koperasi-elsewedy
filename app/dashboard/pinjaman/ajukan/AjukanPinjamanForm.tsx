'use client'

import { useState, useTransition } from 'react'
import { ajukanPinjaman } from '@/lib/pinjaman/actions'

const TENOR_OPTIONS = [3, 6, 9, 12, 18, 24, 36]

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export default function AjukanPinjamanForm() {
  const [isPending, startTransition] = useTransition()
  const [nominal, setNominal] = useState(0)
  const [tenor, setTenor] = useState(12)

  const biayaAdmin = Math.round(nominal * 0.04)
  const totalDiterima = nominal - biayaAdmin
  const cicilanPerBulan = tenor > 0 ? Math.round(nominal / tenor) : 0

  function handleNominalChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '')
    setNominal(parseInt(raw) || 0)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(() => ajukanPinjaman(formData))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nominal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nominal Pinjaman <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">Rp</span>
          <input
            type="text"
            name="nominal"
            value={nominal > 0 ? nominal.toLocaleString('id-ID') : ''}
            onChange={handleNominalChange}
            placeholder="0"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            required
          />
          {/* Hidden input untuk nilai integer */}
          <input type="hidden" name="nominal" value={nominal} />
        </div>
        <p className="text-xs text-gray-400 mt-1">Min: Rp 100.000 — Maks: Rp 50.000.000</p>

        {/* Shortcut nominal */}
        <div className="flex flex-wrap gap-2 mt-2">
          {[1000000, 2000000, 5000000, 10000000, 20000000].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setNominal(v)}
              className="px-3 py-1 text-xs border border-gray-300 rounded-full hover:border-blue-400 hover:text-blue-600 transition"
            >
              {formatRupiah(v)}
            </button>
          ))}
        </div>
      </div>

      {/* Tenor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tenor <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {TENOR_OPTIONS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTenor(t)}
              className={`py-2 text-sm rounded-lg border transition font-medium ${
                tenor === t
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              {t} bln
            </button>
          ))}
        </div>
        <input type="hidden" name="tenor_bulan" value={tenor} />
      </div>

      {/* Ringkasan Kalkulasi */}
      {nominal > 0 && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-sm font-semibold text-blue-900 mb-3">Rincian Pinjaman</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Nominal pinjaman</span>
              <span className="font-medium">{formatRupiah(nominal)}</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Biaya admin (4%)</span>
              <span className="font-medium">- {formatRupiah(biayaAdmin)}</span>
            </div>
            <div className="flex justify-between border-t border-blue-200 pt-2 font-semibold text-blue-900">
              <span>Dana yang diterima</span>
              <span>{formatRupiah(totalDiterima)}</span>
            </div>
            <div className="flex justify-between border-t border-blue-200 pt-2 font-bold text-lg text-blue-800">
              <span>Cicilan / bulan</span>
              <span>{formatRupiah(cicilanPerBulan)}</span>
            </div>
            <p className="text-xs text-gray-500 pt-1">
              Tenor {tenor} bulan × {formatRupiah(cicilanPerBulan)} = {formatRupiah(cicilanPerBulan * tenor)}
            </p>
          </div>
        </div>
      )}

      {/* Catatan */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Catatan / Keperluan <span className="text-gray-400 font-normal">(opsional)</span>
        </label>
        <textarea
          name="catatan_pengaju"
          rows={3}
          placeholder="Contoh: Keperluan renovasi rumah, biaya pendidikan, dll."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <a
          href="/dashboard/pinjaman"
          className="flex-1 text-center py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          Batal
        </a>
        <button
          type="submit"
          disabled={isPending || nominal < 100000}
          className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isPending ? 'Mengirim...' : 'Ajukan Pinjaman'}
        </button>
      </div>
    </form>
  )
}
