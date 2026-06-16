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
    <div className="bg-white rounded-xl border-2 border-purple-100 p-5">
      <p className="text-sm font-semibold text-purple-900 mb-1">Pencairan Pinjaman</p>
      <p className="text-xs text-gray-500 mb-4">
        Setelah dicairkan, jadwal cicilan akan dibuat otomatis dan pinjaman menjadi AKTIF.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="hidden" name="pinjaman_id" value={pinjamanId} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Pencairan <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="tanggal_pencairan"
            defaultValue={today}
            max={today}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition"
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
  SCHEDULED: { label: 'Belum Bayar', color: 'text-gray-500' },
  PAID:       { label: 'Lunas', color: 'text-green-600' },
  OVERDUE:    { label: 'Jatuh Tempo', color: 'text-red-600' },
  WAIVED:     { label: 'Dihapuskan', color: 'text-gray-400' },
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
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">Jadwal Cicilan</p>
        <p className="text-xs text-gray-500">{totalBayar}/{totalCicilan} terbayar</p>
      </div>

      {/* Progress bar */}
      <div className="px-4 py-2 border-b">
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${totalCicilan > 0 ? (totalBayar / totalCicilan) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="divide-y max-h-96 overflow-y-auto">
        {cicilan.map((c) => {
          const statusInfo = STATUS_CICILAN[c.status] ?? { label: c.status, color: 'text-gray-500' }
          const isOverdue = c.status === 'SCHEDULED' && new Date(c.tanggal_jatuh_tempo) < new Date()
          const isPaid = c.status === 'PAID'

          return (
            <div key={c.id} className={`px-4 py-3 ${isOverdue ? 'bg-red-50' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    isPaid ? 'bg-green-100 text-green-700' :
                    isOverdue ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {isPaid ? '✓' : c.nomor_cicilan}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formatRupiah(c.nominal_cicilan)}</p>
                    <p className="text-xs text-gray-400">
                      Jatuh tempo: {formatTanggal(c.tanggal_jatuh_tempo)}
                      {c.tanggal_pembayaran && ` · Bayar: ${formatTanggal(c.tanggal_pembayaran)}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : statusInfo.color}`}>
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
                        className="px-2 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 disabled:opacity-50 transition"
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
          <div className="py-8 text-center text-gray-400 text-sm">
            Jadwal cicilan belum dibuat
          </div>
        )}
      </div>
    </div>
  )
}
