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

    const formData = new FormData()
    formData.set('pinjaman_id', String(pinjamanId))
    formData.set('action', selectedAction)
    formData.set('catatan', catatan)

    startTransition(() => approvePinjaman(formData))
  }

  return (
    <div className="bg-white rounded-xl border-2 border-blue-100 p-5">
      <p className="text-sm font-semibold text-blue-900 mb-1">
        Aksi Persetujuan — {userRole} (Level {level})
      </p>
      <p className="text-xs text-gray-500 mb-4">
        Tinjau detail pinjaman di atas sebelum menyetujui atau menolak.
      </p>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Catatan {action === 'reject' ? <span className="text-red-500">*</span> : <span className="text-gray-400">(opsional)</span>}
        </label>
        <textarea
          rows={3}
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder={action === 'reject' ? 'Tuliskan alasan penolakan...' : 'Catatan tambahan (opsional)...'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => handleSubmit('reject')}
          disabled={isPending}
          className="flex-1 py-2.5 border-2 border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition"
        >
          {isPending && action === 'reject' ? 'Memproses...' : '✗ Tolak Pinjaman'}
        </button>
        <button
          onClick={() => handleSubmit('approve')}
          disabled={isPending}
          className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition"
        >
          {isPending && action === 'approve' ? 'Memproses...' : '✓ Setujui Pinjaman'}
        </button>
      </div>
    </div>
  )
}
