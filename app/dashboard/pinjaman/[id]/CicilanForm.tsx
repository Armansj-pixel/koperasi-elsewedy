"use client";

import React, { useTransition } from "react";
import { cairkanPinjaman, bayarCicilan } from "@/lib/pinjaman/actions";
import type { CicilanPinjaman } from "@/lib/pinjaman/actions";

// ─── Form Pencairan ────────────────────────────────────────────────────────────

interface CairanFormProps {
  pinjamanId: number;
}

export function CairanForm({ pinjamanId }: CairanFormProps) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => cairkanPinjaman(formData));
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="card-fintech" style={{ borderColor: "#e9d5ff" }}>
      <div style={{ fontWeight: "700", fontSize: "15px", color: "#0f2d6b", marginBottom: "2px" }}>
        Pencairan Pinjaman
      </div>
      <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "16px" }}>
        Jadwal cicilan akan dibuat otomatis dan pinjaman menjadi Aktif.
      </div>
      <form onSubmit={handleSubmit}>
        <input type="hidden" name="pinjaman_id" value={pinjamanId} />
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
            Tanggal Pencairan <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            type="date"
            name="tanggal_pencairan"
            defaultValue={today}
            max={today}
            className="fintech-input"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          style={{
            width: "100%",
            padding: "13px 0",
            background: "#9333ea",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: isPending ? "not-allowed" : "pointer",
            opacity: isPending ? 0.6 : 1,
            boxShadow: "0 4px 12px rgba(147,51,234,0.25)",
          }}
        >
          {isPending ? "Memproses..." : "💰 Cairkan Pinjaman"}
        </button>
      </form>
    </div>
  );
}

// ─── Form Bayar Cicilan ────────────────────────────────────────────────────────

interface BayarCicilanFormProps {
  cicilan: CicilanPinjaman[];
  pinjamanId: number;
  userRole: string;
}

function formatRupiah(n: number) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

function formatTanggal(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_CICILAN: Record<string, { label: string; color: string }> = {
  SCHEDULED: { label: "Belum Bayar", color: "#94a3b8" },
  PAID: { label: "Lunas", color: "#16a34a" },
  OVERDUE: { label: "Jatuh Tempo", color: "#dc2626" },
  WAIVED: { label: "Dihapuskan", color: "#94a3b8" },
};

export function BayarCicilanForm({ cicilan, pinjamanId, userRole }: BayarCicilanFormProps) {
  const [isPending, startTransition] = useTransition();
  const canInput = ["BENDAHARA", "SUPERADMIN"].includes(userRole);

  const today = new Date().toISOString().split("T")[0];
  const totalBayar = cicilan.filter((c) => c.status === "PAID").length;
  const totalCicilan = cicilan.length;

  function handleBayar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => bayarCicilan(formData));
  }

  return (
    <div className="card-fintech" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: "700", fontSize: "15px", color: "#0f2d6b" }}>Jadwal Cicilan</div>
        <div style={{ fontSize: "12px", color: "#94a3b8" }}>{totalBayar}/{totalCicilan} terbayar</div>
      </div>

      <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ width: "100%", background: "#f1f5f9", borderRadius: "20px", height: "8px" }}>
          <div
            style={{
              background: "#16a34a",
              height: "8px",
              borderRadius: "20px",
              width: `${totalCicilan > 0 ? (totalBayar / totalCicilan) * 100 : 0}%`,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      <div style={{ maxHeight: "420px", overflowY: "auto" }}>
        {cicilan.map((c) => {
          const statusInfo = STATUS_CICILAN[c.status] ?? { label: c.status, color: "#64748b" };
          const isOverdue = c.status === "SCHEDULED" && new Date(c.tanggal_jatuh_tempo) < new Date();
          const isPaid = c.status === "PAID";

          return (
            <div
              key={c.id}
              style={{
                padding: "14px 24px",
                borderBottom: "1px solid #f1f5f9",
                background: isOverdue ? "#fef2f2" : "transparent",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "700",
                      background: isPaid ? "#dcfce7" : isOverdue ? "#fee2e2" : "#f1f5f9",
                      color: isPaid ? "#16a34a" : isOverdue ? "#dc2626" : "#94a3b8",
                    }}
                  >
                    {isPaid ? "✓" : c.nomor_cicilan}
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>
                      {formatRupiah(c.nominal_cicilan)}
                    </div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                      {formatTanggal(c.tanggal_jatuh_tempo)}
                      {c.tanggal_pembayaran && ` · Bayar ${formatTanggal(c.tanggal_pembayaran)}`}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: isOverdue ? "#dc2626" : statusInfo.color }}>
                    {isOverdue ? "Jatuh Tempo!" : statusInfo.label}
                  </span>

                  {canInput && (c.status === "SCHEDULED" || isOverdue) && (
                    <form onSubmit={handleBayar}>
                      <input type="hidden" name="cicilan_id" value={c.id} />
                      <input type="hidden" name="pinjaman_id" value={pinjamanId} />
                      <input type="hidden" name="tanggal_pembayaran" value={today} />
                      <button
                        type="submit"
                        disabled={isPending}
                        style={{
                          padding: "6px 14px",
                          background: "#16a34a",
                          color: "#fff",
                          border: "none",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: isPending ? "not-allowed" : "pointer",
                          opacity: isPending ? 0.6 : 1,
                        }}
                      >
                        {isPending ? "..." : "Bayar"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {cicilan.length === 0 && (
          <div style={{ padding: "40px 0", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>
            Jadwal cicilan belum dibuat
          </div>
        )}
      </div>
    </div>
  );
}
