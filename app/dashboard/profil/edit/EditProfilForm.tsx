"use client";

import React, { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { updateProfilSaya } from "@/lib/profil/actions";

interface EditProfilFormProps {
  nama: string;
  email: string;
  noHp: string;
  fotoProfil: string | null;
}

function getInisial(nama: string) {
  return nama
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Kompres + resize gambar di canvas sebelum diubah ke base64, supaya ukuran
// data yang dikirim ke server actions tidak membengkak (target maks ~400x400px, JPEG kualitas 0.8)
function compressImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_SIZE = 400;
        let { width, height } = img;

        if (width > height && width > MAX_SIZE) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas tidak didukung"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = () => reject(new Error("Gagal memuat gambar"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });
}

export default function EditProfilForm({ nama, email, noHp, fotoProfil }: EditProfilFormProps) {
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(fotoProfil);
  const [fotoValue, setFotoValue] = useState<string>("");
  const [fotoError, setFotoError] = useState<string>("");
  const [namaValue, setNamaValue] = useState(nama);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFotoError("");

    if (!file.type.startsWith("image/")) {
      setFotoError("File harus berupa gambar");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setFotoError("Ukuran file maksimal 8MB sebelum dikompres");
      return;
    }

    try {
      const compressed = await compressImageToBase64(file);
      setPreview(compressed);
      setFotoValue(compressed);
    } catch {
      setFotoError("Gagal memproses gambar, coba file lain");
    }
  }

  function handleRemoveFoto() {
    setPreview(null);
    setFotoValue("__REMOVE__");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("foto_profil", fotoValue);
    startTransition(() => updateProfilSaya(formData));
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Upload Foto */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "28px" }}>
        <div
          style={{
            width: "96px",
            height: "96px",
            borderRadius: "50%",
            background: preview ? "transparent" : "#eff6ff",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            marginBottom: "12px",
            position: "relative",
          }}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Preview foto profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ color: "#2563eb", fontSize: "28px", fontWeight: "700" }}>{getInisial(namaValue || "?")}</span>
          )}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: "600",
              background: "#eff6ff",
              color: "#2563eb",
              border: "1px solid #dbeafe",
              borderRadius: "20px",
              cursor: "pointer",
            }}
          >
            {preview ? "Ganti Foto" : "Unggah Foto"}
          </button>
          {preview && (
            <button
              type="button"
              onClick={handleRemoveFoto}
              style={{
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: "600",
                background: "#fff",
                color: "#dc2626",
                border: "1px solid #fecaca",
                borderRadius: "20px",
                cursor: "pointer",
              }}
            >
              Hapus
            </button>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
        {fotoError && <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "8px" }}>{fotoError}</div>}
        <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px" }}>JPG atau PNG, maksimal 8MB</div>
      </div>

      {/* Nama */}
      <div style={{ marginBottom: "18px" }}>
        <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
          Nama Lengkap <span style={{ color: "#dc2626" }}>*</span>
        </label>
        <input
          type="text"
          name="nama"
          value={namaValue}
          onChange={(e) => setNamaValue(e.target.value)}
          className="fintech-input"
          required
        />
      </div>

      {/* Email */}
      <div style={{ marginBottom: "18px" }}>
        <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
          Email
        </label>
        <input type="email" name="email" defaultValue={email} placeholder="nama@gmail.com" className="fintech-input" />
      </div>

      {/* No HP */}
      <div style={{ marginBottom: "28px" }}>
        <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
          No HP / WhatsApp
        </label>
        <input
          type="tel"
          name="no_hp"
          defaultValue={noHp}
          placeholder="08xxxxxxxxxx"
          className="fintech-input"
        />
      </div>

      {/* Submit */}
      <div style={{ display: "flex", gap: "12px" }}>
        <Link
          href="/dashboard/profil"
          style={{
            flex: 1,
            textAlign: "center",
            padding: "14px 0",
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#475569",
            textDecoration: "none",
          }}
        >
          Batal
        </Link>
        <button
          type="submit"
          disabled={isPending}
          style={{
            flex: 1,
            padding: "14px 0",
            background: isPending ? "#94a3b8" : "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: isPending ? "not-allowed" : "pointer",
            boxShadow: isPending ? "none" : "0 4px 12px rgba(37,99,235,0.25)",
          }}
        >
          {isPending ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
}
