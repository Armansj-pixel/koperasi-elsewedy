'use client'

import { useState, useTransition } from 'react'
import { approvePinjaman } from '@/lib/pinjaman/actions'

interface ApprovalFormProps {
  pinjamanId: number
  currentStatus: string
  userRole: string
}

const ROLE_LEVEL: Record<string, string> = {
  SEKRETARIS: 'L1',
  BENDAHARA: 'L2',
  KETUA: 'L3',
}

export default function ApprovalForm({ pinjamanId, currentStatus, userRole }: ApprovalFormProps) {
  const [isPending, startTransition] = useTransition()
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [catatan, setCatatan] = useState('')

  const level = ROLE_LEVEL[userRole]

  const STATUS_CAN_APPROVE: Record<string, string> = {
    SEKRETARIS: 'PENDING_L1',
    BENDAHARA: 'PENDING_L2',
    KETUA: 'PENDING_L3',
  }

  const canApprove = STATUS_CAN_APPROVE[userRole] === currentStatus

  if (!canApprove) return null

  function handleSubmit(selectedAction: 'approve' | 'reject') {
    if (selectedAction === 'reject' && !catatan.trim()) {
      alert('Alasan penolakan wajib diisi')
      return
    }
    setAction(selectedAction)

    const formData = new FormData()
    formData.set('pinjaman_id', String(pinjamanId))
    formData.set('action', selectedAction)
    formData.set('catatan', catatan)

    startTransition(() => approvePinjaman(formData))
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/40 border border-teal-100 p-5">
      <p className="text-sm font-bold text-slate-800 mb-1">
        Aksi Persetujuan
      </p>
      <p className="text-xs text-slate-400 mb-4">
        {userRole} · Level {level} — tinjau detail di atas sebelum memutuskan
      </p>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Catatan {action === 'reject' ? <span className="text-rose-500">*</span> : <span className="text-slate-400 font-normal">(opsional)</span>}
        </label>
        <textarea
          rows={3}
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder={action === 'reject' ? 'Tuliskan alasan penolakan...' : 'Catatan tambahan...'}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => handleSubmit('reject')}
          disabled={isPending}
          className="flex-1 py-3 bg-white border-2 border-rose-200 text-rose-600 rounded-2xl text-sm font-semibold disabled:opacity-50 active:scale-95 transition"
        >
          {isPending && action === 'reject' ? 'Memproses...' : '✗ Tolak'}
        </button>
        <button
          onClick={() => handleSubmit('approve')}
          disabled={isPending}
          className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-emerald-200/50 disabled:opacity-50 active:scale-95 transition"
        >
          {isPending && action === 'approve' ? 'Memproses...' : '✓ Setujui'}
        </button>
      </div>
    </div>
  )
}
