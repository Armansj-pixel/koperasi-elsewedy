"use client";

import { useState } from "react";
import { switchViewMode } from "@/lib/auth/view-mode";
import { useRouter } from "next/navigation";

export function ViewSwitcher({ currentMode }: { currentMode: "ADMIN" | "PERSONAL" }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSwitch = async () => {
    setLoading(true);
    const nextMode = currentMode === "ADMIN" ? "PERSONAL" : "ADMIN";
    await switchViewMode(nextMode);
    // Refresh halaman agar sidebar langsung ter-update
    window.location.reload();
  };

  return (
    <button
      onClick={handleSwitch}
      disabled={loading}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 16px",
        borderRadius: "20px",
        background: currentMode === "ADMIN" ? "#f8fafc" : "#2563eb",
        color: currentMode === "ADMIN" ? "#1e293b" : "#fff",
        border: "1px solid #e2e8f0",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: "600",
        transition: "all 0.2s"
      }}
    >
      {loading ? "..." : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5M9 4L4 9"/>
          </svg>
          {currentMode === "ADMIN" ? "Beralih ke Mode Anggota" : "Beralih ke Mode Pengurus"}
        </>
      )}
    </button>
  );
}
