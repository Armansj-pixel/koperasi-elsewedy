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
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <div style={{ 
          display: "inline-flex", 
          alignItems: "center", 
          justifyContent: "center", 
          width: "64px", 
          height: "64px", 
          borderRadius: "50%", 
          backgroundColor: "#dcfce7", 
          color: "#16a34a", 
          marginBottom: "16px" 
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", margin: "0 0 8px 0" }}>
          Password Berhasil Diubah!
        </h3>
        <p style={{ fontSize: "14px", color: "#475569", margin: "0 0 16px 0" }}>
          Mengarahkan ke dashboard...
        </p>
        <div style={{
          display: "inline-block",
          width: "24px",
          height: "24px",
          border: "3px solid #bfdbfe",
          borderTopColor: "#2563eb",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .fintech-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 14px;
          transition: all 0.2s ease;
          background-color: #fff;
          color: #1e293b;
        }

        .fintech-input-prefix {
          padding-left: 42px;
        }
        
        .fintech-input-suffix {
          padding-right: 48px;
        }

        .fintech-input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,.12);
        }

        .fintech-input:disabled {
          background-color: #f8fafc;
          color: #94a3b8;
          cursor: not-allowed;
        }

        .fintech-btn-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .fintech-btn-toggle:hover:not(:disabled) {
          color: #475569;
        }

        .fintech-btn-primary {
          width: 100%;
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
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
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

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* Error Alert */}
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "12px 16px", borderRadius: "8px", display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "14px", fontWeight: "500" }}>
            <svg style={{ flexShrink: 0, marginTop: "2px" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>{error}</span>
          </div>
        )}

        {/* New Password */}
        <div>
          <label
            htmlFor="newPassword"
            style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "8px" }}
          >
            Password Baru
          </label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", display: "flex" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
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
              className="fintech-input fintech-input-prefix fintech-input-suffix"
              autoComplete="new-password"
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              disabled={loading}
              className="fintech-btn-toggle"
            >
              {showNew ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>

          {/* Password Strength Bar */}
          {newPassword && (
            <div style={{ marginTop: "12px" }}>
              <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: "6px",
                      flex: 1,
                      borderRadius: "4px",
                      transition: "all 0.3s ease",
                      backgroundColor: i < strength ? strengthColors[strength - 1] : "#e2e8f0",
                    }}
                  />
                ))}
              </div>
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  margin: 0,
                  color: strengthColors[strength - 1] || "#64748b"
                }}
              >
                {newPassword ? strengthLabels[strength] || "Sangat Lemah" : ""}
              </p>
            </div>
          )}

          {/* Validation Hints */}
          <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "12px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px", color: newPassword.length >= 8 ? "#16a34a" : "#94a3b8", fontWeight: newPassword.length >= 8 ? "600" : "400" }}>
              {newPassword.length >= 8 ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
              )}
              8+ karakter
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px", color: /[A-Z]/.test(newPassword) ? "#16a34a" : "#94a3b8", fontWeight: /[A-Z]/.test(newPassword) ? "600" : "400" }}>
              {/[A-Z]/.test(newPassword) ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
              )}
              Huruf besar
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px", color: /[0-9]/.test(newPassword) ? "#16a34a" : "#94a3b8", fontWeight: /[0-9]/.test(newPassword) ? "600" : "400" }}>
              {/[0-9]/.test(newPassword) ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
              )}
              Angka
            </span>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "8px" }}
          >
            Konfirmasi Password Baru
          </label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", display: "flex" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Ketik ulang password baru"
              required
              disabled={loading}
              className="fintech-input fintech-input-prefix fintech-input-suffix"
              autoComplete="new-password"
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              disabled={loading}
              className="fintech-btn-toggle"
            >
              {showConfirm ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || strength < 3}
          className="fintech-btn-primary"
        >
          {loading ? (
            <>
              <span className="spinner-icon"></span>
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span>Ganti Password Sekarang</span>
            </>
          )}
        </button>
      </form>
    </>
  );
}
