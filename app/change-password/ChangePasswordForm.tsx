"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { changePasswordAction } from "@/lib/auth/actions";

export function ChangePasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // Password strength indicator
  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (pwd.length >= 12) score++;
    return score;
  };

  const strength = getStrength(newPassword);
  const strengthLabels = ["Sangat Lemah", "Lemah", "Sedang", "Kuat", "Sangat Kuat", "Maksimal"];
  const strengthColors = ["#ef4444", "#f97316", "#eab308", "#3b82f6", "#10b981", "#059669"];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await changePasswordAction(formData);

    if (!result.success) {
      setError(result.error || "Gagal mengganti password");
      setLoading(false);
      return;
    }

    setSuccess(true);

    // Tunggu 1.5 detik untuk show success message, lalu redirect
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1500);
  }

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div style={{ 
          display: "inline-flex", alignItems: "center", justifyContent: "center", 
          width: "72px", height: "72px", borderRadius: "50%", 
          background: "linear-gradient(135deg, #dcfce7, #bbf7d0)", 
          color: "#16a34a", marginBottom: "20px",
          boxShadow: "0 8px 16px rgba(22,163,74,0.15)"
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: "0 0 8px 0", letterSpacing: "-.01em" }}>
          Password Berhasil Diubah!
        </h3>
        <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 20px 0", fontWeight: "500" }}>
          Mengarahkan Anda ke halaman Dashboard...
        </p>
        <div style={{
          display: "inline-block", width: "24px", height: "24px",
          border: "3px solid #bfdbfe", borderTopColor: "#2563eb",
          borderRadius: "50%", animation: "kop-spin 1s linear infinite"
        }}></div>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .kop-label {
          display: block; font-size: 13px; font-weight: 700; color: #1e293b;
          margin-bottom: 8px; letter-spacing: -.01em;
        }

        .kop-input-wrapper { position: relative; }
        
        .kop-input {
          width: 100%; padding: 14px 44px; border-radius: 12px;
          border: 1.5px solid #e2e8f0; font-size: 14px; font-weight: 600;
          color: #0f172a; background: #fff; transition: all 0.2s ease;
          font-family: inherit; letter-spacing: 1px;
        }

        .kop-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59,130,246,.15); }
        .kop-input::placeholder { color: #94a3b8; font-weight: 400; letter-spacing: normal; }
        .kop-input:disabled { background: #f8fafc; color: #94a3b8; cursor: not-allowed; border-color: #f1f5f9; }

        .kop-input-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: #94a3b8; display: flex; pointer-events: none;
        }

        .kop-btn-toggle {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: #94a3b8; cursor: pointer;
          padding: 4px; display: flex; align-items: center; justify-content: center;
          transition: color 0.2s; border-radius: 6px;
        }
        .kop-btn-toggle:hover:not(:disabled) { color: #475569; background: #f1f5f9; }

        .kop-btn-submit {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, #1d4ed8, #1e40af); color: #fff; 
          border: none; padding: 16px; border-radius: 14px; font-size: 14px; font-weight: 800; 
          cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; font-family: inherit;
          box-shadow: 0 4px 12px rgba(29,78,216,.2); margin-top: 8px;
        }
        .kop-btn-submit:hover:not(:disabled) { box-shadow: 0 8px 20px rgba(29,78,216,.3); transform: translateY(-2px); }
        .kop-btn-submit:active:not(:disabled) { transform: scale(0.97); }
        .kop-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; background: #94a3b8; box-shadow: none; transform: none; }

        .kop-spin {
          width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,.3);
          border-top-color: currentColor; border-radius: 50%; animation: kop-spin .7s linear infinite;
        }
        @keyframes kop-spin { to { transform: rotate(360deg); } }
      `}} />

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* Error Alert */}
        {error && (
          <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", color: "#b91c1c", padding: "14px 16px", borderRadius: "12px", display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "13px", fontWeight: "600" }}>
            <svg style={{ flexShrink: 0, marginTop: "1px" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>{error}</span>
          </div>
        )}

        {/* New Password */}
        <div>
          <label htmlFor="newPassword" className="kop-label">
            Password Baru
          </label>
          <div className="kop-input-wrapper">
            <span className="kop-input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
            </span>
            <input
              id="newPassword"
              name="newPassword"
              type={showNew ? "text" : "password"}
              placeholder="Min. 8 karakter"
              required
              disabled={loading}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="kop-input"
              autoComplete="new-password"
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              disabled={loading}
              className="kop-btn-toggle"
              tabIndex={-1}
            >
              {showNew ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>

          {/* Password Strength Bar */}
          {newPassword && (
            <div style={{ marginTop: "12px", background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: "6px", flex: 1, borderRadius: "6px", transition: "all 0.3s ease",
                      backgroundColor: i < strength ? strengthColors[strength - 1] : "#e2e8f0",
                    }}
                  />
                ))}
              </div>
              <p style={{ fontSize: "12px", fontWeight: "700", margin: 0, color: strengthColors[strength - 1] || "#64748b" }}>
                Kekuatan: {newPassword ? strengthLabels[strength] || "Sangat Lemah" : ""}
              </p>
            </div>
          )}

          {/* Validation Hints */}
          <div style={{ marginTop: "14px", display: "flex", flexWrap: "wrap", gap: "14px", fontSize: "12px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", color: newPassword.length >= 8 ? "#15803d" : "#94a3b8", fontWeight: newPassword.length >= 8 ? "700" : "500", background: newPassword.length >= 8 ? "#dcfce7" : "transparent", padding: "4px 8px", borderRadius: "6px" }}>
              {newPassword.length >= 8 ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
              )}
              8+ Karakter
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", color: /[A-Z]/.test(newPassword) ? "#15803d" : "#94a3b8", fontWeight: /[A-Z]/.test(newPassword) ? "700" : "500", background: /[A-Z]/.test(newPassword) ? "#dcfce7" : "transparent", padding: "4px 8px", borderRadius: "6px" }}>
              {/[A-Z]/.test(newPassword) ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
              )}
              Huruf Besar
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", color: /[0-9]/.test(newPassword) ? "#15803d" : "#94a3b8", fontWeight: /[0-9]/.test(newPassword) ? "700" : "500", background: /[0-9]/.test(newPassword) ? "#dcfce7" : "transparent", padding: "4px 8px", borderRadius: "6px" }}>
              {/[0-9]/.test(newPassword) ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
              )}
              Angka
            </span>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="kop-label">
            Konfirmasi Password Baru
          </label>
          <div className="kop-input-wrapper">
            <span className="kop-input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Ketik ulang password baru..."
              required
              disabled={loading}
              className="kop-input"
              autoComplete="new-password"
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              disabled={loading}
              className="kop-btn-toggle"
              tabIndex={-1}
            >
              {showConfirm ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || strength < 3}
          className="kop-btn-submit"
        >
          {loading ? (
            <>
              <span className="kop-spin"></span>
              <span>Memproses Keamanan...</span>
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span>Simpan & Lanjutkan ke Dashboard</span>
            </>
          )}
        </button>
      </form>
    </>
  );
}
