"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/lib/auth/actions";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (!result.success) {
      setError(result.error || "Login gagal");
      setLoading(false);
      return;
    }

    router.push(result.redirectTo || "/dashboard");
    router.refresh();
  }

  const inputBase: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px 12px 40px",
    fontSize: 14,
    fontWeight: 500,
    fontFamily: "inherit",
    color: "#0f172a",
    background: "#f8fafc",
    border: "1.5px solid #e2e8f0",
    borderRadius: 12,
    outline: "none",
    transition: "border-color .2s, box-shadow .2s, background .2s",
  };

  return (
    <>
      <style>{`
        .lf-input:focus {
          border-color: #2563eb !important;
          background: #fff !important;
          box-shadow: 0 0 0 3px rgba(37,99,235,.12) !important;
        }
        .lf-input::placeholder { color: #cbd5e1; }
        .lf-input:disabled { opacity: .55; cursor: not-allowed; }

        .lf-btn:hover:not(:disabled) {
          opacity: .92;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(37,99,235,.45) !important;
        }
        .lf-btn:active:not(:disabled) { transform: translateY(0); }
        .lf-btn:disabled { opacity: .6; cursor: not-allowed; }

        .lf-eye:hover { color: #475569; }

        .lf-spin {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,.3);
          border-top-color: white;
          border-radius: 50%;
          animation: lf-spin .7s linear infinite;
          display: inline-block;
        }
        @keyframes lf-spin { to { transform: rotate(360deg); } }
      `}</style>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── ERROR ALERT ── */}
        {error && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            background: "#fff1f2",
            border: "1.5px solid #fecdd3",
            borderRadius: 12,
            padding: "12px 14px",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span style={{ fontSize: 13, color: "#be123c", fontWeight: 500, lineHeight: 1.5 }}>{error}</span>
          </div>
        )}

        {/* ── NIK FIELD ── */}
        <div>
          <label htmlFor="nik" style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#334155", letterSpacing: ".04em", textTransform: "uppercase", marginBottom: 7 }}>
            NIK Karyawan
          </label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", color: "#94a3b8" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </span>
            <input
              id="nik"
              name="nik"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Masukkan NIK karyawan"
              required
              disabled={loading}
              autoComplete="username"
              className="lf-input"
              style={inputBase}
            />
          </div>
        </div>

        {/* ── PASSWORD FIELD ── */}
        <div>
          <label htmlFor="password" style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#334155", letterSpacing: ".04em", textTransform: "uppercase", marginBottom: 7 }}>
            Kata Sandi
          </label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", color: "#94a3b8" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </span>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              disabled={loading}
              autoComplete="current-password"
              className="lf-input"
              style={{ ...inputBase, paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="lf-eye"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center", padding: 0, transition: "color .2s" }}
            >
              {showPassword ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>

          {/* hint */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>
              Default: 4 digit terakhir NIK Anda
            </p>
          </div>
        </div>

        {/* ── SUBMIT ── */}
        <button
          type="submit"
          disabled={loading}
          className="lf-btn"
          style={{
            width: "100%",
            padding: "13px 16px",
            fontFamily: "inherit",
            fontSize: 14,
            fontWeight: 700,
            color: "#fff",
            background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
            border: "none",
            borderRadius: 12,
            cursor: "pointer",
            letterSpacing: ".02em",
            boxShadow: "0 4px 16px rgba(37,99,235,.35)",
            transition: "opacity .2s, transform .15s, box-shadow .2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: 4,
          }}
        >
          {loading ? (
            <>
              <span className="lf-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              <span>Masuk ke Sistem</span>
            </>
          )}
        </button>

      </form>
    </>
  );
}
