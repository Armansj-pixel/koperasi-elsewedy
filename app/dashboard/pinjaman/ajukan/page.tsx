'use client'

import { useState, useTransition } from 'react'
import { ajukanPinjaman } from '@/lib/pinjaman/actions'

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export default function AjukanPinjamanForm() {
  const [isPending, startTransition] = useTransition()
  const [nominal, setNominal] = useState(0)
  const [tenor, setTenor] = useState(12) // Default 12 bulan

  const biayaAdmin = Math.round(nominal * 0.04)
  const totalDiterima = nominal - biayaAdmin
  const cicilanPerBulan = tenor > 0 ? Math.round(nominal / tenor) : 0

  function handleNominalChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '')
    setNominal(parseInt(raw) || 0)
  }

  function handleTenorChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value);
    if (isNaN(val)) {
      setTenor(0); // Biarkan kosong sementara saat user menghapus angka
    } else if (val > 12) {
      setTenor(12); // Batasi maksimal 12
    } else {
      setTenor(val);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Validasi ganda sebelum submit
    if (nominal > 15000000) {
      alert('Maksimal pinjaman adalah Rp 15.000.000')
      return
    }
    if (tenor < 1 || tenor > 12) {
      alert('Tenor pinjaman harus antara 1 hingga 12 bulan')
      return
    }

    const formData = new FormData(e.currentTarget)
    startTransition(() => ajukanPinjaman(formData))
  }

  // Cek apakah input tidak valid
  const isOverLimit = nominal > 15000000
  const isTenorInvalid = tenor < 1 || tenor > 12

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .fintech-input, .fintech-textarea {
          width: 100%;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          font-size: 14px;
          transition: all 0.2s ease;
          background-color: #fff;
          color: #1e293b;
        }

        .fintech-input-prefix {
          padding-left: 40px;
        }
        
        .fintech-input-suffix {
          padding-right: 60px;
        }

        .fintech-input:focus, .fintech-textarea:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,.12);
        }
        
        .fintech-input.error {
          border-color: #ef4444;
        }
        
        .fintech-input.error:focus {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
        }

        .fintech-btn-primary {
          flex: 1;
          background-color: #2563eb;
          color: #fff;
          border: none;
          font-weight: 600;
          padding: 14px;
          border-radius: 8px;
          text-align: center;
          font-size: 14px;
          transition: all 0.2s ease;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        
        .fintech-btn-primary:hover:not(:disabled) {
          background-color: #1d4ed8;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }

        .fintech-btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .fintech-btn-outline {
          flex: 1;
          background-color: #fff;
          color: #475569;
          border: 1px solid #cbd5e1;
          font-weight: 600;
          padding: 14px;
          border-radius: 8px;
          text-align: center;
          font-size: 14px;
          text-decoration: none;
          transition: all 0.2s ease;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
        }

        .fintech-btn-outline:hover {
          background-color: #f8fafc;
          border-color: #94a3b8;
          color: #1e293b;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .spinner-icon {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
      `}} />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Nominal */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
            Nominal Pinjaman <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: isOverLimit ? '#ef4444' : '#64748b', fontSize: '14px', fontWeight: '600', transition: 'color 0.2s' }}>
              Rp
            </span>
            <input
              type="text"
              name="nominal"
              value={nominal > 0 ? nominal.toLocaleString('id-ID') : ''}
              onChange={handleNominalChange}
              placeholder="0"
              className={`fintech-input fintech-input-prefix ${isOverLimit ? 'error' : ''}`}
              required
            />
            <input type="hidden" name="nominal" value={nominal} />
          </div>
          
          <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: isOverLimit ? '#ef4444' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: isOverLimit ? '600' : '400' }}>
            {isOverLimit ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            )}
            Min: Rp 100.000 — Maks: Rp 15.000.000
          </p>

          {/* Shortcut nominal */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
            {[1000000, 2000000, 5000000, 10000000, 15000000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setNominal(v)}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#475569',
                  background: '#fff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#60a5fa';
                  e.currentTarget.style.color = '#2563eb';
                  e.currentTarget.style.background = '#eff6ff';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.color = '#475569';
                  e.currentTarget.style.background = '#fff';
                }}
              >
                {formatRupiah(v)}
              </button>
            ))}
          </div>
        </div>

        {/* Tenor (Bebas Input) */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
            Tenor <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div style={{ position: 'relative', maxWidth: '200px' }}>
            <input
              type="number"
              name="tenor_bulan"
              min="1"
              max="12"
              value={tenor > 0 ? tenor : ''}
              onChange={handleTenorChange}
              onBlur={() => {
                if (tenor < 1) setTenor(1);
              }}
              placeholder="1 - 12"
              className={`fintech-input fintech-input-suffix ${isTenorInvalid ? 'error' : ''}`}
              required
            />
            <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '14px', fontWeight: '500', pointerEvents: 'none' }}>
              bulan
            </span>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            Bebas masukkan antara 1 hingga 12 bulan
          </p>
        </div>

        {/* Ringkasan Kalkulasi */}
        {nominal > 0 && !isOverLimit && !isTenorInvalid && (
          <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '20px', border: '1px solid #bfdbfe' }}>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '700', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              Rincian Pinjaman
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Nominal pinjaman</span>
                <span style={{ fontWeight: '600', color: '#1e293b' }}>{formatRupiah(nominal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                <span>Biaya admin (4%)</span>
                <span style={{ fontWeight: '600' }}>- {formatRupiah(biayaAdmin)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #93c5fd', paddingTop: '10px', fontWeight: '600', color: '#1e3a8a' }}>
                <span>Dana yang diterima</span>
                <span>{formatRupiah(totalDiterima)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #93c5fd', paddingTop: '10px', fontWeight: '800', fontSize: '16px', color: '#1d4ed8' }}>
                <span>Cicilan / bulan</span>
                <span>{formatRupiah(cicilanPerBulan)}</span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b', textAlign: 'right' }}>
                Tenor {tenor} bulan × {formatRupiah(cicilanPerBulan)} = {formatRupiah(cicilanPerBulan * tenor)}
              </p>
            </div>
          </div>
        )}

        {/* Catatan */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
            Catatan / Keperluan <span style={{ color: '#9ca3af', fontWeight: '400' }}>(opsional)</span>
          </label>
          <textarea
            name="catatan_pengaju"
            rows={3}
            placeholder="Contoh: Keperluan renovasi rumah, biaya pendidikan, dll."
            className="fintech-textarea"
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
          <a
            href="/dashboard/pinjaman"
            className="fintech-btn-outline"
          >
            Batal
          </a>
          <button
            type="submit"
            disabled={isPending || nominal < 100000 || isOverLimit || isTenorInvalid}
            className="fintech-btn-primary"
          >
            {isPending ? (
              <>
                <span className="spinner-icon"></span>
                Mengirim...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                Ajukan Pinjaman
              </>
            )}
          </button>
        </div>
      </form>
    </>
  )
}
