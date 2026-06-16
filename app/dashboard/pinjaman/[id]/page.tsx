import { getCurrentUser } from '@/lib/auth/session'
import { redirect, notFound } from 'next/navigation'
import { getPinjamanDetail } from '@/lib/pinjaman/actions'
import ApprovalForm from './ApprovalForm'
import { CairanForm, BayarCicilanForm } from './CicilanForm'
import Link from 'next/link'

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function formatTanggal(d: string | null) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Diganti menggunakan properti CSS
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING_L1: { label: 'Menunggu Sekretaris', color: '#92400e', bg: '#fef3c7' },
  PENDING_L2: { label: 'Menunggu Bendahara',  color: '#9a3412', bg: '#ffedd5' },
  PENDING_L3: { label: 'Menunggu Ketua',      color: '#1e40af', bg: '#dbeafe' },
  APPROVED:   { label: 'Disetujui',           color: '#166534', bg: '#dcfce7' },
  ACTIVE:     { label: 'Aktif',               color: '#065f46', bg: '#d1fae5' },
  LUNAS:      { label: 'Lunas ✓',            color: '#374151', bg: '#f3f4f6' },
  REJECTED:   { label: 'Ditolak',             color: '#991b1b', bg: '#fee2e2' },
  CANCELLED:  { label: 'Dibatalkan',          color: '#4b5563', bg: '#f3f4f6' },
}

// Timeline approval step
function ApprovalStep({
  level, label, status, approvedAt, approvedBy, catatan, currentStatus, targetStatus,
}: {
  level: string; label: string; status: 'done' | 'current' | 'pending'
  approvedAt?: string | null; approvedBy?: string | null; catatan?: string | null
  currentStatus: string; targetStatus: string
}) {
  return (
    <div style={{ display: 'flex', gap: '12px', opacity: status === 'pending' ? 0.4 : 1 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: '700',
          border: '2px solid',
          ...(status === 'done' 
            ? { backgroundColor: '#22c55e', borderColor: '#22c55e', color: '#fff' }
            : status === 'current' 
            ? { backgroundColor: '#dbeafe', borderColor: '#60a5fa', color: '#1d4ed8' }
            : { backgroundColor: '#f3f4f6', borderColor: '#d1d5db', color: '#9ca3af' })
        }}>
          {status === 'done' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          ) : level === '💰' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          ) : level}
        </div>
        <div style={{ width: '2px', height: '100%', backgroundColor: '#e5e7eb', marginTop: '4px' }} />
      </div>
      <div style={{ paddingBottom: '20px', flex: 1 }}>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{label}</p>
        {status === 'done' && (
          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
            {approvedBy} · {formatTanggal(approvedAt ?? null)}
          </p>
        )}
        {catatan && (
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>
            &quot;{catatan}&quot;
          </p>
        )}
        {status === 'current' && (
          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#2563eb', fontWeight: '500' }}>
            Menunggu persetujuan...
          </p>
        )}
      </div>
    </div>
  )
}

export default async function PinjamanDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { success?: string; error?: string }
}) {
  const session = await getCurrentUser()
  if (!session) redirect('/login')
  
  const pinjamanId = parseInt(params.id)
  if (isNaN(pinjamanId)) notFound()

  const { data: p, cicilan, error } = await getPinjamanDetail(pinjamanId)
  if (!p || error) notFound()

  // Anggota hanya bisa lihat pinjaman sendiri
  if (session.role === 'ANGGOTA' && p.user_id !== session.id) {
    redirect('/dashboard/pinjaman')
  }

  const statusConfig = STATUS_CONFIG[p.status] ?? { label: p.status, color: '#374151', bg: '#f3f4f6' }
  const isRejected = p.status === 'REJECTED'
  const isActive = p.status === 'ACTIVE'
  const isApproved = p.status === 'APPROVED'
  const isBendahara = session.role === 'BENDAHARA'

  // Tentukan step approval
  const getStepStatus = (targetStatus: string) => {
    const order = ['PENDING_L1', 'PENDING_L2', 'PENDING_L3', 'APPROVED', 'ACTIVE', 'LUNAS']
    const currentIdx = order.indexOf(p.status)
    const targetIdx = order.indexOf(targetStatus)
    if (isRejected) return targetIdx < order.indexOf('PENDING_L2') ? 'done' : 'pending'
    if (currentIdx > targetIdx) return 'done'
    if (currentIdx === targetIdx) return 'current'
    return 'pending'
  }

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', paddingBottom: '40px' }}>
      {/* --- Global & Design System Styles --- */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
        }

        .fintech-header {
          position: relative;
          background: linear-gradient(145deg, #0f2d6b 0%, #1a4db3 60%, #2563eb 100%);
          overflow: hidden;
          padding: 24px 20px;
          height: 200px;
          border-bottom-left-radius: 24px;
          border-bottom-right-radius: 24px;
        }

        .fintech-header::before,
        .fintech-header::after {
          content: '';
          position: absolute;
          pointer-events: none; 
          border-radius: 50%;
        }

        .fintech-header::before {
          top: -40px;
          left: -40px;
          width: 150px;
          height: 150px;
          background: rgba(255, 255, 255, 0.08);
        }

        .fintech-header::after {
          bottom: -20px;
          right: -60px;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.05);
        }

        .card-fintech {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 12px rgba(15,45,107,.06);
          padding: 20px;
        }

        /* Layout Grid */
        .layout-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        /* Sub-grid untuk rincian */
        .rincian-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          column-gap: 24px;
          row-gap: 12px;
        }

        @media (max-width: 1024px) {
          .layout-grid {
            grid-template-columns: 1fr;
          }
        }
      `}} />

      {/* --- Header Area --- */}
      <header className="fintech-header">
        <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Link 
              href="/dashboard/pinjaman"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '20px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                backdropFilter: 'blur(4px)'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Kembali
            </Link>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ 
                color: '#fff', 
                margin: 0, 
                fontSize: '24px', 
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                </svg>
                Pinjaman #{pinjamanId}
              </h1>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#bfdbfe', fontWeight: '500' }}>
                {p.user_nama} · NIK {p.user_nik}
              </p>
            </div>
            
            <span style={{
              background: statusConfig.bg,
              color: statusConfig.color,
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {statusConfig.label}
            </span>
          </div>

        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main style={{ maxWidth: '1000px', margin: '-50px auto 0 auto', padding: '0 20px', position: 'relative', zIndex: 20 }}>
        
        {/* Notifikasi Flash Messages */}
        {searchParams.success && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500' }}>
            <svg style={{ flexShrink: 0 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            {searchParams.success}
          </div>
        )}
        {searchParams.error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500' }}>
            <svg style={{ flexShrink: 0 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {searchParams.error}
          </div>
        )}

        <div className="layout-grid">
          
          {/* Kolom Kiri: Detail + Approval */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Rincian Pinjaman */}
            <div className="card-fintech">
              <h2 style={{ margin: '0 0 16px 0', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '16px', fontWeight: '700', color: '#0f2d6b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Rincian Pinjaman
              </h2>
              <div className="rincian-grid">
                <div>
                  <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#64748b' }}>Nominal</p>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>{formatRupiah(p.nominal)}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#64748b' }}>Dana Diterima</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{formatRupiah(p.total_diterima)}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#64748b' }}>Biaya Admin (4%)</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#dc2626' }}>{formatRupiah(p.biaya_admin)}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#64748b' }}>Cicilan / Bulan</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#2563eb' }}>{formatRupiah(p.cicilan_per_bulan)}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#64748b' }}>Tenor</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#334155' }}>{p.tenor_bulan} bulan</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#64748b' }}>Tgl Pengajuan</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#334155' }}>{formatTanggal(p.tanggal_pengajuan)}</p>
                </div>
                {p.tanggal_pencairan && (
                  <div>
                    <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#64748b' }}>Tgl Pencairan</p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#334155' }}>{formatTanggal(p.tanggal_pencairan)}</p>
                  </div>
                )}
                {p.tanggal_jatuh_tempo && (
                  <div>
                    <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#64748b' }}>Jatuh Tempo Akhir</p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#334155' }}>{formatTanggal(p.tanggal_jatuh_tempo)}</p>
                  </div>
                )}
              </div>
              {p.catatan_pengaju && (
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Catatan Pengaju</p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#475569', fontStyle: 'italic' }}>&quot;{p.catatan_pengaju}&quot;</p>
                </div>
              )}
            </div>

            {/* Penolakan */}
            {isRejected && p.rejected_reason && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '700', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  Alasan Penolakan
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: '#b91c1c' }}>{p.rejected_reason}</p>
              </div>
            )}

            {/* Form Approval */}
            <ApprovalForm
              pinjamanId={pinjamanId}
              currentStatus={p.status}
              userRole={session.role}
            />

            {/* Form Pencairan */}
            {isApproved && isBendahara && (
              <CairanForm pinjamanId={pinjamanId} />
            )}

            {/* Jadwal Cicilan */}
            {(isActive || p.status === 'LUNAS') && (
              <BayarCicilanForm
                cicilan={cicilan}
                pinjamanId={pinjamanId}
                userRole={session.role}
              />
            )}
          </div>

          {/* Kolom Kanan: Timeline & Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Alur Persetujuan */}
            <div className="card-fintech">
              <h2 style={{ margin: '0 0 16px 0', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '16px', fontWeight: '700', color: '#0f2d6b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                Alur Persetujuan
              </h2>
              <div>
                <ApprovalStep
                  level="1" label="Sekretaris"
                  status={getStepStatus('PENDING_L1') === 'current' ? 'current' :
                          ['PENDING_L2','PENDING_L3','APPROVED','ACTIVE','LUNAS'].includes(p.status) ? 'done' : 'pending'}
                  approvedAt={p.approved_l1_at} approvedBy={p.nama_l1} catatan={p.catatan_l1}
                  currentStatus={p.status} targetStatus="PENDING_L1"
                />
                <ApprovalStep
                  level="2" label="Bendahara"
                  status={p.status === 'PENDING_L2' ? 'current' :
                          ['PENDING_L3','APPROVED','ACTIVE','LUNAS'].includes(p.status) ? 'done' : 'pending'}
                  approvedAt={p.approved_l2_at} approvedBy={p.nama_l2} catatan={p.catatan_l2}
                  currentStatus={p.status} targetStatus="PENDING_L2"
                />
                <ApprovalStep
                  level="3" label="Ketua Koperasi"
                  status={p.status === 'PENDING_L3' ? 'current' :
                          ['APPROVED','ACTIVE','LUNAS'].includes(p.status) ? 'done' : 'pending'}
                  approvedAt={p.approved_l3_at} approvedBy={p.nama_l3} catatan={p.catatan_l3}
                  currentStatus={p.status} targetStatus="PENDING_L3"
                />
                <ApprovalStep
                  level="💰" label="Pencairan"
                  status={['ACTIVE','LUNAS'].includes(p.status) ? 'done' :
                          p.status === 'APPROVED' ? 'current' : 'pending'}
                  approvedAt={p.disbursed_at} approvedBy={p.nama_disbursed}
                  currentStatus={p.status} targetStatus="APPROVED"
                />
              </div>
            </div>

            {/* Info Anggota */}
            <div className="card-fintech">
              <h2 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '700', color: '#0f2d6b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Info Anggota
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#64748b' }}>Nama</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{p.user_nama}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#64748b' }}>NIK</p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#334155', fontFamily: 'monospace' }}>{p.user_nik}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#64748b' }}>No HP</p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#334155' }}>{p.user_no_hp}</p>
                </div>
                <div style={{ paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                  <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#64748b' }}>Simpanan Bulanan</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#15803d' }}>{formatRupiah(p.user_simpanan_bulanan ?? 0)}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
