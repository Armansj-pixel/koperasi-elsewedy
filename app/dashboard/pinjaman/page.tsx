import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { getPinjamanList, getStatistikPinjaman } from '@/lib/pinjaman/actions'
import Link from 'next/link'

// Pemetaan diubah menjadi object CSS Properties untuk menggantikan class Tailwind
const STATUS_LABEL: Record<string, { label: string; style: React.CSSProperties }> = {
  PENDING_L1: { label: 'Menunggu Sekretaris', style: { backgroundColor: '#fef3c7', color: '#92400e' } },
  PENDING_L2: { label: 'Menunggu Bendahara', style: { backgroundColor: '#ffedd5', color: '#9a3412' } },
  PENDING_L3: { label: 'Menunggu Ketua', style: { backgroundColor: '#dbeafe', color: '#1e40af' } },
  APPROVED:   { label: 'Disetujui', style: { backgroundColor: '#dcfce7', color: '#166534' } },
  ACTIVE:     { label: 'Aktif', style: { backgroundColor: '#d1fae5', color: '#065f46' } },
  LUNAS:      { label: 'Lunas', style: { backgroundColor: '#f3f4f6', color: '#4b5563' } },
  REJECTED:   { label: 'Ditolak', style: { backgroundColor: '#fee2e2', color: '#991b1b' } },
  CANCELLED:  { label: 'Dibatalkan', style: { backgroundColor: '#f3f4f6', color: '#6b7280' } },
  DISBURSED:  { label: 'Dicairkan', style: { backgroundColor: '#f3e8ff', color: '#6b21a8' } },
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export default async function PinjamanPage({
  searchParams,
}: {
  searchParams: { status?: string; success?: string; error?: string }
}) {
  const session = await getCurrentUser()
  if (!session) redirect('/login')

  const filterStatus = searchParams.status as string | undefined
  const { data: pinjaman } = await getPinjamanList(
    filterStatus ? { status: filterStatus as any } : undefined
  )
  const stats = await getStatistikPinjaman()

  const isAnggota = session.role === 'ANGGOTA'
  const isBendahara = session.role === 'BENDAHARA'
  const isAdmin = ['SEKRETARIS', 'BENDAHARA', 'KETUA', 'SUPERADMIN'].includes(session.role)

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
          height: 240px;
          border-bottom-left-radius: 24px;
          border-bottom-right-radius: 24px;
        }

        /* Aturan wajib: pointer-events: none untuk elemen pseudo */
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
          padding: 24px;
        }

        .fintech-btn-header {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          color: #1a4db3;
          padding: 10px 18px;
          border-radius: 20px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .fintech-btn-header:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .filter-pill {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #475569;
        }

        .filter-pill.active {
          background: #2563eb;
          color: #fff;
          border-color: #2563eb;
          box-shadow: 0 2px 8px rgba(37,99,235,0.2);
        }

        .filter-pill:hover:not(.active) {
          border-color: #93c5fd;
          background: #f8fafc;
        }

        /* Table Styles */
        .fintech-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .fintech-table th {
          padding: 16px;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
          background-color: #f8fafc;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .fintech-table td {
          padding: 16px;
          font-size: 14px;
          color: #1e293b;
          border-bottom: 1px solid #f1f5f9;
        }

        .fintech-table tr:last-child td {
          border-bottom: none;
        }

        .fintech-table tbody tr {
          transition: background-color 0.2s ease;
        }

        .fintech-table tbody tr:hover {
          background-color: #f8fafc;
        }

        /* Responsive Grid Helper */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .hide-on-mobile {
            display: none;
          }
        }
      `}} />

      {/* --- Header Area --- */}
      <header className="fintech-header">
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            
            {/* Bagian Kiri: Navigasi & Judul */}
            <div>
              {/* Tombol Back: Transparan Putih */}
              <Link 
                href="/dashboard"
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
                  backdropFilter: 'blur(4px)',
                  marginBottom: '20px'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Dashboard
              </Link>

              <h1 style={{ 
                color: '#fff', 
                margin: 0, 
                fontSize: '28px', 
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/>
                </svg>
                Modul Pinjaman
              </h1>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#bfdbfe', fontWeight: '500' }}>
                Kelola pengajuan dan cicilan pinjaman koperasi
              </p>
            </div>

            {/* Bagian Kanan: Tombol Aksi Utama (Putih Teks Biru) */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {isAnggota && (
                <Link href="/dashboard/pinjaman/ajukan" className="fintech-btn-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Ajukan Pinjaman
                </Link>
              )}
              {isBendahara && (
                <Link href="/dashboard/pinjaman/existing" className="fintech-btn-header" style={{ color: '#475569' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                  </svg>
                  Input Pinjaman Existing
                </Link>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main style={{ maxWidth: '1100px', margin: '-70px auto 0 auto', padding: '0 20px', position: 'relative', zIndex: 20 }}>
        
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

        {/* Statistik (hanya admin) */}
        {isAdmin && (
          <div className="stats-grid">
            <div className="card-fintech" style={{ padding: '20px' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Pinjaman</p>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#0f2d6b' }}>{stats.total}</p>
            </div>
            <div className="card-fintech" style={{ padding: '20px' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Aktif</p>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#059669' }}>{stats.aktif}</p>
            </div>
            <div className="card-fintech" style={{ padding: '20px' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending</p>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#d97706' }}>{stats.pending}</p>
            </div>
            <div className="card-fintech" style={{ padding: '20px' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Outstanding</p>
              <p style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#2563eb', marginTop: '6px' }}>{formatRupiah(stats.totalOutstanding)}</p>
            </div>
          </div>
        )}

        {/* Filter Status */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
          {[
            { label: 'Semua', value: '' },
            { label: 'Pending', value: 'PENDING_L1' },
            { label: 'Aktif', value: 'ACTIVE' },
            { label: 'Disetujui', value: 'APPROVED' },
            { label: 'Lunas', value: 'LUNAS' },
            { label: 'Ditolak', value: 'REJECTED' },
          ].map((f) => {
            const isActive = filterStatus === f.value || (!filterStatus && f.value === '');
            return (
              <Link
                key={f.value}
                href={f.value ? `/dashboard/pinjaman?status=${f.value}` : '/dashboard/pinjaman'}
                className={`filter-pill ${isActive ? 'active' : ''}`}
              >
                {f.label}
              </Link>
            )
          })}
        </div>

        {/* Tabel Data */}
        <div className="card-fintech" style={{ padding: 0, overflow: 'hidden' }}>
          {pinjaman.length === 0 ? (
            <div style={{ padding: '64px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <svg style={{ margin: '0 auto 16px auto', display: 'block', color: '#cbd5e1' }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
              </svg>
              <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#475569' }}>Belum ada data pinjaman</p>
              {isAnggota && (
                <Link href="/dashboard/pinjaman/ajukan" style={{ color: '#2563eb', fontSize: '14px', textDecoration: 'none', fontWeight: '500' }}>
                  Ajukan pinjaman pertama Anda →
                </Link>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="fintech-table">
                <thead>
                  <tr>
                    {isAdmin && <th>Anggota</th>}
                    <th>Nominal</th>
                    <th>Tenor</th>
                    <th className="hide-on-mobile">Cicilan/Bln</th>
                    <th>Status</th>
                    <th className="hide-on-mobile">Tgl Pengajuan</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {pinjaman.map((p) => {
                    const statusInfo = STATUS_LABEL[p.status] ?? { label: p.status, style: { backgroundColor: '#f3f4f6', color: '#4b5563' } }
                    return (
                      <tr key={p.id}>
                        {isAdmin && (
                          <td>
                            <p style={{ margin: 0, fontWeight: '600', color: '#0f2d6b' }}>{p.user_nama}</p>
                            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>{p.user_nik}</p>
                          </td>
                        )}
                        <td style={{ fontWeight: '700', color: '#1e293b' }}>
                          {formatRupiah(p.nominal)}
                        </td>
                        <td style={{ color: '#64748b' }}>{p.tenor_bulan} bln</td>
                        <td className="hide-on-mobile" style={{ color: '#64748b' }}>{formatRupiah(p.cicilan_per_bulan)}</td>
                        <td>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            ...statusInfo.style
                          }}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="hide-on-mobile" style={{ color: '#94a3b8', fontSize: '13px' }}>
                          {new Date(p.tanggal_pengajuan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Link
                            href={`/dashboard/pinjaman/${p.id}`}
                            style={{
                              background: '#eff6ff',
                              color: '#2563eb',
                              padding: '6px 16px',
                              borderRadius: '20px',
                              textDecoration: 'none',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'inline-block'
                            }}
                          >
                            Detail
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
