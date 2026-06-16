import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PinjamanExistingForm from './PinjamanExistingForm'
import Link from 'next/link'

export default async function PinjamanExistingPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const session = await getCurrentUser()
  if (!session) redirect('/login')

  if (!['BENDAHARA', 'SUPERADMIN'].includes(session.role)) {
    redirect('/dashboard/pinjaman')
  }

  const supabase = await createClient()
  const { data: anggota } = await supabase
    .from('users')
    .select('id, nama, nik')
    .eq('is_active', true)
    .eq('role', 'ANGGOTA')
    .order('nama')

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
          height: 190px;
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
      `}} />

      {/* --- Header Area --- */}
      <header className="fintech-header">
        <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          
          {/* Tombol Back: Transparan Putih */}
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
            Kembali ke Pinjaman
          </Link>

          {/* Judul Halaman */}
          <div style={{ marginTop: '24px' }}>
            <h1 style={{ 
              color: '#fff', 
              margin: '0 0 4px 0', 
              fontSize: '24px', 
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
              </svg>
              Pinjaman Existing
            </h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#bfdbfe', fontWeight: '500' }}>
              Input data pinjaman yang sudah berjalan (migrasi dari Excel)
            </p>
          </div>
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main style={{ maxWidth: '600px', margin: '-40px auto 0 auto', padding: '0 20px', position: 'relative', zIndex: 20 }}>
        
        {/* Error Alert */}
        {searchParams.error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', fontWeight: '500' }}>
            <svg style={{ flexShrink: 0, marginTop: '2px' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>{searchParams.error}</span>
          </div>
        )}

        {/* Warning Banner */}
        <div style={{ 
          background: '#fffbeb', 
          border: '1px solid #fde68a', 
          borderRadius: '12px', 
          padding: '16px', 
          marginBottom: '20px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}>
          <div style={{ color: '#d97706', marginTop: '2px', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '700', color: '#92400e' }}>
              Fitur Migrasi Data
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: '#b45309', lineHeight: '1.5' }}>
              Data yang diinput akan langsung berstatus <strong style={{ fontWeight: '700' }}>AKTIF</strong> tanpa melalui proses approval. Pastikan data sudah diverifikasi dari sumber Excel.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="card-fintech">
          <PinjamanExistingForm anggotaList={anggota ?? []} />
        </div>

      </main>
    </div>
  )
}
