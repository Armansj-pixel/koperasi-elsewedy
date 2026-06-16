'use client'

import { useState, useTransition } from 'react'
import { inputPinjamanExisting } from '@/lib/pinjaman/actions'

interface Anggota {
  id: string
  nama: string
  nik: string
}

interface PinjamanExistingFormProps {
  anggotaList: Anggota[]
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export default function PinjamanExistingForm({ anggotaList }: PinjamanExistingFormProps) {
  const [isPending, startTransition] = useTransition()
  const [nominal, setNominal] = useState(0)
  const [tenor, setTenor] = useState(12)
  const [cicilanTerbayar, setCicilanTerbayar] = useState(0)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<Anggota | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  const biayaAdmin = Math.round(nominal * 0.04)
  const totalDiterima = nominal - biayaAdmin
  const cicilanPerBulan = tenor > 0 ? Math.round(nominal / tenor) : 0
  const sisaCicilan = Math.max(0, tenor - cicilanTerbayar)

  const filtered = anggotaList.filter(
    (a) =>
      a.nama.toLowerCase().includes(search.toLowerCase()) ||
      a.nik.includes(search)
  ).slice(0, 8)

  function handleNominalChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '')
    setNominal(parseInt(raw) || 0)
  }

  function handleTenorChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value);
    if (isNaN(val)) {
      setTenor(0);
    } else if (val > 12) {
      setTenor(12);
    } else {
      setTenor(val);
    }
  }

  function handleCicilanTerbayarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value);
    if (isNaN(val)) {
      setCicilanTerbayar(0);
    } else {
      setCicilanTerbayar(Math.min(val, tenor));
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    // Validasi Limit
    if (nominal > 15000000) {
      alert('Maksimal pinjaman adalah Rp 15.000.000')
      return
    }
    if (tenor < 1 || tenor > 12) {
      alert('Tenor pinjaman harus antara 1 hingga 12 bulan')
      return
    }

    const formData = new FormData(e.currentTarget)
    startTransition(() => inputPinjamanExisting(formData))
  }

  const isOverLimit = nominal > 15000000
  const isTenorInvalid = tenor < 1 || tenor > 12

  return (
    <>
      {/* --- Scoped Styles --- */}
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

        .fintech-dropdown-item {
          width: 100%;
          text-align: left;
          padding: 12px 16px;
          font-size: 14px;
          border: none;
          background: none;
          cursor: pointer;
          transition: background-color 0.2s ease;
          border-bottom: 1px solid #f1f5f9;
        }
        
        .fintech-dropdown-item:last-child {
          border-bottom: none;
        }

        .fintech-dropdown-item:hover {
          background-color: #eff6ff;
        }

        .fintech-btn-primary {
          flex: 1;
          background-color: #1e293b;
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
          background-color: #0f172a;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
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

        /* Layout Grid */
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        @media (max-width: 640px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
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
        
        {/* Pilih Anggota */}
        <div style={{ position: 'relative' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
            Anggota <span style={{ color: '#ef4444' }}>*</span>
          </label>
          
          {selectedUser ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: '1px solid #bbf7d0', borderRadius: '8px', background: '#f0fdf4' }}>
              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  {selectedUser.nama}
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#15803d', fontFamily: 'monospace' }}>NIK: {selectedUser.nik}</p>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedUser(null); setSearch('') }}
                style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Ganti Anggota
              </button>
              <input type="hidden" name="user_id" value={selectedUser.id} />
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setShowDropdown(true) }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Cari nama atau NIK anggota..."
                className="fintech-input"
              />
              {showDropdown && search.length > 0 && (
                <div style={{ position: 'absolute', zIndex: 10, width: '100%', marginTop: '4px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxHeight: '200px', overflowY: 'auto' }}>
                  {filtered.length === 0 ? (
                    <p style={{ padding: '12px 16px', margin: 0, fontSize: '14px', color: '#94a3b8' }}>Anggota tidak ditemukan</p>
                  ) : (
                    filtered.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => { setSelectedUser(a); setShowDropdown(false); setSearch('') }}
                        className="fintech-dropdown-item"
                      >
                        <span style={{ fontWeight: '600', color: '#1e293b' }}>{a.nama}</span>
                        <span style={{ color: '#94a3b8', marginLeft: '8px', fontSize: '12px', fontFamily: 'monospace' }}>· {a.nik}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Nominal & Tenor Grid */}
        <div className="form-grid">
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
                value={nominal > 0 ? nominal.toLocaleString('id-ID') : ''}
                onChange={handleNominalChange}
                placeholder="0"
                className={`fintech-input fintech-input-prefix ${isOverLimit ? 'error' : ''}`}
              />
              <input type="hidden" name="nominal" value={nominal} />
            </div>
            {isOverLimit && (
              <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Maksimal Rp 15.000.000
              </p>
            )}
          </div>

          {/* Tenor */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
              Tenor (bulan) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                value={tenor > 0 ? tenor : ''}
                onChange={handleTenorChange}
                onBlur={() => { if (tenor < 1) setTenor(1) }}
                name="tenor_bulan"
                min={1} max={12}
                placeholder="1 - 12"
                className={`fintech-input fintech-input-suffix ${isTenorInvalid ? 'error' : ''}`}
              />
              <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '14px', fontWeight: '500', pointerEvents: 'none' }}>
                bulan
              </span>
            </div>
          </div>
        </div>

        <div className="form-grid">
          {/* Cicilan terbayar */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
              Cicilan Sudah Terbayar <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                value={cicilanTerbayar > 0 ? cicilanTerbayar : ''}
                onChange={handleCicilanTerbayarChange}
                onBlur={() => { if (isNaN(cicilanTerbayar)) setCicilanTerbayar(0) }}
                name="cicilan_terbayar"
                min={0}
                max={tenor}
                placeholder="0"
                className="fintech-input fintech-input-suffix"
              />
              <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '14px', fontWeight: '500', pointerEvents: 'none' }}>
                bulan
              </span>
            </div>
            <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              Sisa cicilan: <strong>{sisaCicilan} bulan</strong>
            </p>
          </div>

          {/* Tanggal pencairan */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
              Tanggal Pencairan Asli <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="date"
              name="tanggal_pencairan"
              className="fintech-input"
              required
            />
          </div>
        </div>

        {/* Ringkasan */}
        {nominal > 0 && tenor > 0 && !isOverLimit && !isTenorInvalid && (
          <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '20px', border: '1px solid #bfdbfe' }}>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '700', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              Ringkasan Pinjaman Existing
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
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Cicilan / bulan</span>
                <span style={{ fontWeight: '700', color: '#1e293b' }}>{formatRupiah(cicilanPerBulan)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #93c5fd', paddingTop: '10px', fontWeight: '700', color: '#1e3a8a' }}>
                <span>Total Sisa Cicilan ({sisaCicilan} bln)</span>
                <span>{formatRupiah(sisaCicilan * cicilanPerBulan)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Catatan */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
            Catatan Migrasi <span style={{ color: '#9ca3af', fontWeight: '400' }}>(opsional)</span>
          </label>
          <textarea
            name="catatan"
            rows={2}
            placeholder="Contoh: Data migrasi dari Excel lama"
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
            disabled={isPending || !selectedUser || nominal === 0 || isOverLimit || isTenorInvalid}
            className="fintech-btn-primary"
          >
            {isPending ? (
              <>
                <span className="spinner-icon"></span>
                Menyimpan...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Simpan Data Existing
              </>
            )}
          </button>
        </div>
      </form>
    </>
  )
}
