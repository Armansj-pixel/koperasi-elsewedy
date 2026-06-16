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
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .fintech-input-purple {
          width: 100%;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          font-size: 14px;
          transition: all 0.2s ease;
          background-color: #fff;
          color: #1f2937;
        }
        .fintech-input-purple:focus {
          outline: none;
          border-color: #a855f7;
          box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.15);
        }
        .fintech-btn-purple {
          width: 100%;
          padding: 10px 0;
          background-color: #9333ea;
          color: #fff;
          border: none;
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
        .fintech-btn-purple:hover:not(:disabled) {
          background-color: #7e22ce;
        }
        .fintech-btn-purple:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}} />
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '2px solid #f3e8ff', padding: '20px' }}>
        <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#581c87' }}>Pencairan Pinjaman</p>
        <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#6b7280', lineHeight: '1.5' }}>
          Setelah dicairkan, jadwal cicilan akan dibuat otomatis dan pinjaman menjadi AKTIF.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="hidden" name="pinjaman_id" value={pinjamanId} />
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              Tanggal Pencairan <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="date"
              name="tanggal_pencairan"
              defaultValue={today}
              max={today}
              className="fintech-input-purple"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="fintech-btn-purple"
          >
            {isPending ? 'Memproses...' : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/>
                </svg>
                Cairkan Pinjaman
              </>
            )}
          </button>
        </form>
      </div>
    </>
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
  SCHEDULED: { label: 'Belum Bayar', color: '#6b7280' },
  PAID:       { label: 'Lunas', color: '#16a34a' },
  OVERDUE:    { label: 'Jatuh Tempo', color: '#dc2626' },
  WAIVED:     { label: 'Dihapuskan', color: '#9ca3af' },
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
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .fintech-cicilan-container {
          background-color: #fff;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }
        .cicilan-list-wrapper {
          max-height: 384px;
          overflow-y: auto;
        }
        .cicilan-row {
          padding: 12px 16px;
          border-bottom: 1px solid #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .cicilan-row:last-child {
          border-bottom: none;
        }
        .fintech-btn-bayar {
          padding: 6px 12px;
          background-color: #16a34a;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .fintech-btn-bayar:hover:not(:disabled) {
          background-color: #15803d;
        }
        .fintech-btn-bayar:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        /* Custom Scrollbar for list */
        .cicilan-list-wrapper::-webkit-scrollbar {
          width: 6px;
        }
        .cicilan-list-wrapper::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .cicilan-list-wrapper::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .cicilan-list-wrapper::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}} />
      <div className="fintech-cicilan-container">
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111827' }}>Jadwal Cicilan</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{totalBayar}/{totalCicilan} terbayar</p>
        </div>

        {/* Progress bar */}
        <div style={{ padding: '8px 16px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ width: '100%', backgroundColor: '#f3f4f6', borderRadius: '9999px', height: '8px', overflow: 'hidden' }}>
            <div
              style={{
                backgroundColor: '#22c55e',
                height: '100%',
                borderRadius: '9999px',
                transition: 'width 0.3s ease',
                width: \`\${totalCicilan > 0 ? (totalBayar / totalCicilan) * 100 : 0}%\`
              }}
            />
          </div>
        </div>

        <div className="cicilan-list-wrapper">
          {cicilan.map((c) => {
            const statusInfo = STATUS_CICILAN[c.status] ?? { label: c.status, color: '#6b7280' }
            const isOverdue = c.status === 'SCHEDULED' && new Date(c.tanggal_jatuh_tempo) < new Date()
            const isPaid = c.status === 'PAID'

            return (
              <div key={c.id} className="cicilan-row" style={{ backgroundColor: isOverdue ? '#fef2f2' : 'transparent' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700',
                    backgroundColor: isPaid ? '#dcfce7' : isOverdue ? '#fee2e2' : '#f3f4f6',
                    color: isPaid ? '#15803d' : isOverdue ? '#b91c1c' : '#6b7280'
                  }}>
                    {isPaid ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : c.nomor_cicilan}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111827' }}>{formatRupiah(c.nominal_cicilan)}</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>
                      Jatuh tempo: {formatTanggal(c.tanggal_jatuh_tempo)}
                      {c.tanggal_pembayaran && ` · Bayar: ${formatTanggal(c.tanggal_pembayaran)}`}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '500', color: isOverdue ? '#dc2626' : statusInfo.color }}>
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
                        className="fintech-btn-bayar"
                      >
                        {isPending ? '...' : 'Bayar'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )
          })}

          {cicilan.length === 0 && (
            <div style={{ padding: '32px 0', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
              Jadwal cicilan belum dibuat
            </div>
          )}
        </div>
      </div>
    </>
  )
}
