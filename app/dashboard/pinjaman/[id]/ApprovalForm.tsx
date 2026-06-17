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
    <div className="card-fintech" style={{ borderColor: "#dbeafe" }}>
      <div style={{ fontWeight: "700", fontSize: "15px", color: "#0f2d6b", marginBottom: "2px" }}>
        Aksi Persetujuan
      </div>
      <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "16px" }}>
        {userRole} · Level {level} — tinjau detail di atas sebelum memutuskan
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
          Catatan{" "}
          {action === "reject" ? (
            <span style={{ color: "#dc2626" }}>*</span>
          ) : (
            <span style={{ color: "#94a3b8", fontWeight: "400" }}>(opsional)</span>
          )}
        </label>
        <textarea
          rows={3}
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder={action === "reject" ? "Tuliskan alasan penolakan..." : "Catatan tambahan..."}
          className="fintech-input"
          style={{ resize: "vertical" }}
        />
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={() => handleSubmit("reject")}
          disabled={isPending}
          style={{
            flex: 1,
            padding: "12px 0",
            background: "#fff",
            border: "1px solid #fecaca",
            color: "#dc2626",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: isPending ? "not-allowed" : "pointer",
            opacity: isPending ? 0.6 : 1,
          }}
        >
          {isPending && action === "reject" ? "Memproses..." : "✗ Tolak"}
        </button>
        <button
          onClick={() => handleSubmit("approve")}
          disabled={isPending}
          style={{
            flex: 1,
            padding: "12px 0",
            background: "#16a34a",
            border: "none",
            color: "#fff",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: isPending ? "not-allowed" : "pointer",
            opacity: isPending ? 0.6 : 1,
            boxShadow: "0 4px 12px rgba(22,163,74,0.25)",
          }}
        >
          {isPending && action === "approve" ? "Memproses..." : "✓ Setujui"}
        </button>
      </div>
    </div>
  );
}
