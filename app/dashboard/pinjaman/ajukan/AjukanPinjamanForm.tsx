'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ajukanPinjaman } from '@/lib/pinjaman/actions'

const TENOR_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nominal */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Nominal Pinjaman <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">Rp</span>
          {/* Satu-satunya input bernama "nominal" yang dibaca FormData (integer murni) */}
          <input
            type="text"
            inputMode="numeric"
            value={nominal > 0 ? nominal.toLocaleString('id-ID') : ''}
            onChange={handleNominalChange}
            placeholder="0"
            className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm shadow-sm"
            required
          />
          <input type="hidden" name="nominal" value={nominal} />
        </div>
        <p className="text-xs text-slate-400 mt-1.5">Min Rp 100.000 — Maks Rp 15.000.000</p>

        <div className="flex flex-wrap gap-2 mt-3">
          {[1000000, 2000000, 5000000, 10000000, 15000000].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setNominal(v)}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-full text-slate-600 active:scale-95 transition"
            >
              {formatRupiah(v)}
            </button>
          ))}
        </div>
      </div>

      {/* Tenor */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Tenor <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {TENOR_OPTIONS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTenor(t)}
              className={`py-2.5 text-sm rounded-2xl font-semibold transition active:scale-95 ${
                tenor === t
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-200/50'
                  : 'bg-white text-slate-600 border border-slate-200'
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
        <div className="bg-white rounded-3xl p-5 shadow-lg shadow-slate-200/40 border border-teal-50">
          <p className="text-sm font-bold text-slate-800 mb-3">Rincian Pinjaman</p>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Nominal pinjaman</span>
              <span className="font-medium text-slate-800">{formatRupiah(nominal)}</span>
            </div>
            <div className="flex justify-between text-rose-500">
              <span>Biaya admin (4%)</span>
              <span className="font-medium">- {formatRupiah(biayaAdmin)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2.5 font-semibold text-slate-800">
              <span>Dana diterima</span>
              <span>{formatRupiah(totalDiterima)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2.5">
              <span className="font-bold text-teal-700">Cicilan / bulan</span>
              <span className="font-bold text-lg text-teal-700">{formatRupiah(cicilanPerBulan)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Catatan */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Catatan / Keperluan <span className="text-slate-400 font-normal">(opsional)</span>
        </label>
        <textarea
          name="catatan_pengaju"
          rows={3}
          placeholder="Contoh: keperluan renovasi rumah"
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 text-sm shadow-sm"
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
          disabled={isPending || nominal < 100000}
          className="flex-1 py-3.5 bg-teal-600 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-teal-200/50 disabled:opacity-50 disabled:shadow-none active:scale-95 transition"
        >
          {isPending ? 'Mengirim...' : 'Ajukan Pinjaman'}
        </button>
      </div>
    </form>
  )
}
