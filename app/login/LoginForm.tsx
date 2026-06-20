"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/lib/auth/actions";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [nikFocused, setNikFocused] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (!result.success) {
      setError(result.error || "Login gagal. Periksa kembali NIK dan kata sandi Anda.");
      setLoading(false);
      return;
    }

    router.push(result.redirectTo || "/dashboard");
    router.refresh();
  }

  return (
    <>
      <style>{`
        /* ── Field Group ── */
        .lf-fields { display: flex; flex-direction: column; gap: 16px; }
        .lf-group  { display: flex; flex-direction: column; gap: 7px; }

        .lf-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          letter-spacing: .02em;
        }
        .lf-label-required { color: #ef4444; font-size: 11px; }

        /* ── Input Wrapper ── */
        .lf-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .lf-input-icon {
          position: absolute;
          left: 13px;
          color: #94a3b8;
          pointer-events: none;
          transition: color .2s;
          display: flex;
          align-items: center;
          z-index: 1;
        }
        .lf-input-wrapper.is-focused .lf-input-icon { color: #2563eb; }

        /* ── Input ── */
        .lf-input {
          width: 100%;
          padding: 12px 14px 12px 42px;
          font-size: 14px;
          font-weight: 500;
          font-family: inherit;
          color: #0f172a;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          outline: none;
          transition: border-color .2s, box-shadow .2s, background .2s;
          -webkit-appearance: none;
          appearance: none;
        }
        .lf-input:focus {
          border-color: #2563eb;
          background: #fff;
          box-shadow: 0 0 0 3.5px rgba(37,99,235,.1);
        }
        .lf-input::placeholder  { color: #c1ccd8; font-weight: 400; }
        .lf-input:disabled      { opacity: .55; cursor: not-allowed; background: #f1f5f9; }
        .lf-input.has-error     { border-color: #f87171; background: #fff5f5; }
        .lf-input.has-error:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 3.5px rgba(239,68,68,.1);
        }
        .lf-input.has-pw { padding-right: 46px; }

        /* ── Eye Toggle ── */
        .lf-eye-btn {
          position: absolute;
          right: 11px;
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          padding: 5px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color .2s, background .2s;
          line-height: 1;
        }
        .lf-eye-btn:hover { color: #475569; background: #f1f5f9; }

        /* ── Error Alert ── */
        .lf-error {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #fef2f2;
          border: 1.5px solid #fecaca;
          border-radius: 12px;
          padding: 12px 14px;
          animation: lf-fadeIn .25s ease;
        }
        .lf-error p {
          font-size: 12.5px;
          color: #dc2626;
          font-weight: 500;
          margin: 0;
          line-height: 1.55;
        }

        /* ── Submit Button ── */
        .lf-btn {
          width: 100%;
          padding: 13px 20px;
          font-size: 14px;
          font-weight: 700;
          font-family: inherit;
          color: #fff;
          background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          letter-spacing: .02em;
          transition: transform .2s ease, box-shadow .2s ease, opacity .2s ease;
          box-shadow: 0 4px 18px rgba(37,99,235,.38);
          position: relative;
          overflow: hidden;
          margin-top: 4px;
        }
        .lf-btn::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,.15) 0%, transparent 60%);
          pointer-events: none;
        }
        .lf-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(37,99,235,.52);
        }
        .lf-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 4px 18px rgba(37,99,235,.38);
        }
        .lf-btn:disabled { opacity: .7; cursor: not-allowed; }

        /* ── Spinner ── */
        .lf-spin {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: lf-spin .7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes lf-spin { to { transform: rotate(360deg); } }
        @keyframes lf-fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <form onSubmit={handleSubmit} noValidate>
        <div className="lf-fields">

          {/* ── Error Alert ── */}
          {error && (
            <div className="lf-error" role="alert" aria-live="assertive">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#dc2626" strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p>{error}</p>
            </div>
          )}

          {/* ── NIK Field ── */}
          <div className="lf-group">
            <label htmlFor="nik" className="lf-label">
              NIK / Nomor Induk Karyawan
              <span className="lf-label-required" aria-hidden="true">*</span>
            </label>
            <div className={`lf-input-wrapper ${nikFocused ? "is-focused" : ""}`}>
              <span className="lf-input-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                id="nik"
                name="nik"
                type="text"
                inputMode="numeric"
                autoComplete="username"
                placeholder="Masukkan NIK Anda"
                required
                disabled={loading}
                onFocus={() => setNikFocused(true)}
                onBlur={() => setNikFocused(false)}
                className={`lf-input${error ? " has-error" : ""}`}
                aria-required="true"
                aria-label="NIK atau Nomor Induk Karyawan"
              />
            </div>
          </div>

          {/* ── Password Field ── */}
          <div className="lf-group">
            <label htmlFor="password" className="lf-label">
              Kata Sandi
              <span className="lf-label-required" aria-hidden="true">*</span>
            </label>
            <div className={`lf-input-wrapper ${pwFocused ? "is-focused" : ""}`}>
              <span className="lf-input-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Masukkan kata sandi Anda"
                required
                disabled={loading}
                onFocus={() => setPwFocused(true)}
                onBlur={() => setPwFocused(false)}
                className={`lf-input has-pw${error ? " has-error" : ""}`}
                aria-required="true"
                aria-label="Kata sandi"
              />
              <button
                type="button"
                className="lf-eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showPassword ? (
                  /* Eye-off icon */
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  /* Eye icon */
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* ── Submit Button ── */}
          <button
            type="submit"
            className="lf-btn"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="lf-spin" aria-hidden="true" />
                <span>Memverifikasi akun…</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10,17 15,12 10,7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                <span>Masuk ke Sistem</span>
              </>
            )}
          </button>

        </div>
      </form>
    </>
  );
}
