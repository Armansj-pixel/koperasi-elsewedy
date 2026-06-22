"use client";

import React, { useState, useTransition } from "react";
import { approvePinjaman } from "@/lib/pinjaman/actions";

interface ApprovalFormProps {
  pinjamanId: number;
  currentStatus: string;
  userRole: string;
}

const ROLE_LEVEL: Record<string, string> = {
  SEKRETARIS: "L1",
  BENDAHARA: "L2",
  KETUA: "L3",
};

export default function ApprovalForm({ pinjamanId, currentStatus, userRole }: ApprovalFormProps) {
  const [isPending, startTransition] = useTransition();
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [catatan, setCatatan] = useState("");

  const level = ROLE_LEVEL[userRole];

  const STATUS_CAN_APPROVE: Record<string, string> = {
    SEKRETARIS: "PENDING_L1",
    BENDAHARA: "PENDING_L2",
    KETUA: "PENDING_L3",
  };

  const canApprove = STATUS_CAN_APPROVE[userRole] === currentStatus;

  if (!canApprove) return null;

  function handleSubmit(selectedAction: "approve" | "reject") {
    if (selectedAction === "reject" && !catatan.trim()) {
      alert("Alasan penolakan wajib diisi");
      return;
    }
    setAction(selectedAction);

    const formData = new FormData();
    formData.set("pinjaman_id", String(pinjamanId));
    formData.set("action", selectedAction);
    formData.set("catatan", catatan);

    startTransition(() => approvePinjaman(formData));
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .kop-label {
          display: block; font-size: 13px; font-weight: 700; color: #1e293b;
          margin-bottom: 8px; letter-spacing: -.01em;
        }
        .kop-input {
          width: 100%; padding: 14px 16px; border-radius: 12px;
          border: 1.5px solid #e2e8f0; font-size: 14px; font-weight: 500;
          color: #0f172a; background: #fff; transition: all 0.2s ease;
          font-family: inherit;
        }
        .kop-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59,130,246,.15); }
        .kop-input::placeholder { color: #94a3b8; font-weight: 400; }

        .kop-btn-approve {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, #16a34a, #15803d); color: #fff; 
          border: none; padding: 14px; border-radius: 12px; font-size: 14px; font-weight: 800; 
          cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; font-family: inherit;
          box-shadow: 0 4px 12px rgba(22,163,74,.2);
        }
        .kop-btn-approve:hover:not(:disabled) { box-shadow: 0 6px 16px rgba(22,163,74,.3); transform: translateY(-2px); }
        .kop-btn-approve:active:not(:disabled) { transform: scale(0.97); }
        .kop-btn-approve:disabled { opacity: 0.7; cursor: not-allowed; transform: none; box-shadow: none; }

        .kop-btn-reject {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
          background: #fef2f2; color: #dc2626; border: 1.5px solid #fca5a5; 
          padding: 14px; border-radius: 12px; font-size: 14px; font-weight: 800; 
          cursor: pointer; transition: all 0.15s; font-family: inherit;
        }
        .kop-btn-reject:hover:not(:disabled) { background: #fee2e2; border-color: #f87171; transform: translateY(-2px); }
        .kop-btn-reject:active:not(:disabled) { transform: scale(0.97); }
        .kop-btn-reject:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .kop-spin {
          width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,.3);
          border-top-color: currentColor; border-radius: 50%; animation: kop-spin .7s linear infinite;
        }
        @keyframes kop-spin { to { transform: rotate(360deg); } }
      `}} />

      <div className="kop-card" style={{ padding: "24px", border: "1.5px solid #bfdbfe", background: "linear-gradient(to bottom, #eff6ff, #fff)", margin: "0 24px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#dbeafe", color: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <div style={{ fontWeight: "800", fontSize: "16px", color: "#0f172a", letterSpacing: "-.01em" }}>
              Panel Verifikasi
            </div>
          </div>
        </div>
        
        <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px", marginLeft: "40px", fontWeight: "500" }}>
          Otoritas: <strong style={{ color: "#1e293b" }}>{userRole}</strong> (Level {level}) — Tinjau rincian di atas sebelum memberikan keputusan.
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label className="kop-label">
            Catatan Keputusan{" "}
            {action === "reject" ? (
              <span style={{ color: "#dc2626" }}>*</span>
            ) : (
              <span style={{ color: "#94a3b8", fontWeight: "500" }}>(opsional)</span>
            )}
          </label>
          <textarea
            rows={3}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder={action === "reject" ? "Tuliskan alasan penolakan wajib diisi..." : "Tambahkan catatan internal (opsional)..."}
            className="kop-input"
            style={{ resize: "vertical" }}
            disabled={isPending}
          />
        </div>

        <div style={{ display: "flex", gap: "14px" }}>
          <button
            onClick={() => handleSubmit("reject")}
            disabled={isPending}
            className="kop-btn-reject"
          >
            {isPending && action === "reject" ? (
              <><span className="kop-spin" style={{ borderTopColor: "#dc2626" }}></span> Memproses...</>
            ) : (
              <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Tolak Pengajuan</>
            )}
          </button>
          <button
            onClick={() => handleSubmit("approve")}
            disabled={isPending}
            className="kop-btn-approve"
          >
            {isPending && action === "approve" ? (
              <><span className="kop-spin" style={{ borderTopColor: "#fff" }}></span> Memproses...</>
            ) : (
              <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Setujui Pengajuan</>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
