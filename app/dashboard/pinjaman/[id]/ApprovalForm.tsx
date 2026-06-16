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
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .fintech-textarea {
          width: 100%;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          font-size: 14px;
          transition: all 0.2s ease;
          background-color: #fff;
          color: #1f2937;
          resize: vertical;
        }
        .fintech-textarea:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }
        .fintech-btn-reject {
          flex: 1;
          padding: 10px 0;
          background-color: #fff;
          border: 2px solid #fca5a5;
          color: #b91c1c;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .fintech-btn-reject:hover:not(:disabled) {
          background-color: #fef2f2;
        }
        .fintech-btn-reject:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .fintech-btn-approve {
          flex: 1;
          padding: 10px 0;
          background-color: #16a34a;
          border: none;
          color: #fff;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .fintech-btn-approve:hover:not(:disabled) {
          background-color: #15803d;
        }
        .fintech-btn-approve:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}} />
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '2px solid #dbeafe', padding: '20px' }}>
        <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#1e3a8a' }}>
          Aksi Persetujuan — {userRole} (Level {level})
        </p>
        <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#6b7280', lineHeight: '1.5' }}>
          Tinjau detail pinjaman di atas sebelum menyetujui atau menolak.
        </p>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
            Catatan {action === 'reject' ? <span style={{ color: '#ef4444' }}>*</span> : <span style={{ color: '#9ca3af' }}>(opsional)</span>}
          </label>
          <textarea
            rows={3}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder={action === 'reject' ? 'Tuliskan alasan penolakan...' : 'Catatan tambahan (opsional)...'}
            className="fintech-textarea"
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => handleSubmit('reject')}
            disabled={isPending}
            className="fintech-btn-reject"
          >
            {isPending && action === 'reject' ? 'Memproses...' : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Tolak Pinjaman
              </>
            )}
          </button>
          <button
            onClick={() => handleSubmit('approve')}
            disabled={isPending}
            className="fintech-btn-approve"
          >
            {isPending && action === 'approve' ? 'Memproses...' : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Setujui Pinjaman
              </>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
