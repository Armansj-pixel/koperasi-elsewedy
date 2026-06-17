'use client'

import { useTransition } from 'react'
import { cairkanPinjaman, bayarCicilan } from '@/lib/pinjaman/actions'
import type { CicilanPinjaman } from '@/lib/pinjaman/actions'

// ─── Form Pencairan ────────────────────────────────────────────────────────────

interface CairanFormProps {
  pinjamanId: number
}

export function CairanForm({ pinjamanId }: CairanFormProps) {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(() => cairkanPinjaman(formData))
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/40 border border-violet-100 p-5">
      <p className="text-sm font-bold text-slate-800 mb-1">Pencairan Pinjaman</p>
      <p className="text-xs text-slate-400 mb-4">
        Jadwal cicilan akan dibuat otomatis dan pinjaman menjadi Aktif.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="hidden" name="pinjaman_id" value={pinjamanId} />
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Tanggal Pencairan <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            name="tanggal_pencairan"
            defaultValue={today}
            max={today}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-violet-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 bg-violet-600 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-violet-200/50 disabled:opacity-50 active:scale-95 transition"
        >
          {isPending ? 'Memproses...' : '💰 Cairkan Pinjaman'}
        </button>
      </form>
    </div>
  )
}

// ─── Form Bayar Cicilan ────────────────────────────────────────────────────────

interface BayarCicilanFormProps {
  cicilan: CicilanPinjaman[]
  pinjamanId: number
  userRole: string
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function formatTanggal(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const STATUS_CICILAN: Record<string, { label: string; color: string }> = {
  SCHEDULED: { label: 'Belum Bayar', color: 'text-slate-400' },
  PAID:       { label: 'Lunas', color: 'text-emerald-600' },
  OVERDUE:    { label: 'Jatuh Tempo', color: 'text-rose-600' },
  WAIVED:     { label: 'Dihapuskan', color: 'text-slate-400' },
}

export function BayarCicilanForm({ cicilan, pinjamanId, userRole }: BayarCicilanFormProps) {
  const [isPending, startTransition] = useTransition()
  const canInput = ['BENDAHARA', 'SUPERADMIN'].includes(userRole)

  const today = new Date().toISOString().split('T')[0]
  const totalBayar = cicilan.filter((c) => c.status === 'PAID').length
  const totalCicilan = cicilan.length

  function handleBayar(cicilanId: number, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(() => bayarCicilan(formData))
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/40 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <p className="text-sm font-bold text-slate-800">Jadwal Cicilan</p>
        <p className="text-xs text-slate-400">{totalBayar}/{totalCicilan} terbayar</p>
      </div>

      <div className="px-5 py-3 border-b border-slate-100">
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all"
            style={{ width: `${totalCicilan > 0 ? (totalBayar / totalCicilan) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
        {cicilan.map((c) => {
          const statusInfo = STATUS_CICILAN[c.status] ?? { label: c.status, color: 'text-slate-500' }
          const isOverdue = c.status === 'SCHEDULED' && new Date(c.tanggal_jatuh_tempo) < new Date()
          const isPaid = c.status === 'PAID'

          return (
            <div key={c.id} className={`px-5 py-3.5 ${isOverdue ? 'bg-rose-50' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    isPaid ? 'bg-emerald-100 text-emerald-600' :
                    isOverdue ? 'bg-rose-100 text-rose-600' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {isPaid ? '✓' : c.nomor_cicilan}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{formatRupiah(c.nominal_cicilan)}</p>
                    <p className="text-xs text-slate-400">
                      {formatTanggal(c.tanggal_jatuh_tempo)}
                      {c.tanggal_pembayaran && ` · Bayar ${formatTanggal(c.tanggal_pembayaran)}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${isOverdue ? 'text-rose-600' : statusInfo.color}`}>
                    {isOverdue ? 'Jatuh Tempo!' : statusInfo.label}
                  </span>

                  {canInput && (c.status === 'SCHEDULED' || isOverdue) && (
                    <form onSubmit={(e) => handleBayar(c.id, e)}>
                      <input type="hidden" name="cicilan_id" value={c.id} />
                      <input type="hidden" name="pinjaman_id" value={pinjamanId} />
                      <input type="hidden" name="tanggal_pembayaran" value={today} />
                      <button
                        type="submit"
                        disabled={isPending}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-full text-xs font-semibold disabled:opacity-50 active:scale-95 transition"
                      >
                        {isPending ? '...' : 'Bayar'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {cicilan.length === 0 && (
          <div className="py-10 text-center text-slate-400 text-sm">
            Jadwal cicilan belum dibuat
          </div>
        )}
      </div>
    </div>
  )
}
