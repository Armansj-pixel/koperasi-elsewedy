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
      setFotoError("File harus berupa gambar (JPG/PNG)");
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
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .kop-label { display: block; font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 8px; letter-spacing: -.01em; }
        .kop-req { color: #dc2626; margin-left: 2px; }
        
        .kop-input-wrapper { position: relative; }
        .kop-input-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; display: flex; pointer-events: none; }
        
        .kop-input {
          width: 100%; padding: 14px 16px 14px 46px; border-radius: 12px;
          border: 1.5px solid #e2e8f0; font-size: 14px; font-weight: 600;
          color: #0f172a; background: #fff; transition: all 0.2s ease;
          font-family: inherit;
        }
        .kop-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59,130,246,.15); }
        .kop-input::placeholder { color: #94a3b8; font-weight: 500; }
        
        .kop-btn-submit { flex: 2; display: flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff; border: none; padding: 16px; border-radius: 14px; font-size: 14px; font-weight: 800; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; font-family: inherit; box-shadow: 0 4px 12px rgba(37,99,235,.2); }
        .kop-btn-submit:hover:not(:disabled) { box-shadow: 0 8px 20px rgba(37,99,235,.3); transform: translateY(-2px); }
        .kop-btn-submit:active:not(:disabled) { transform: scale(0.97); }
        .kop-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; background: #94a3b8; box-shadow: none; transform: none; }
        
        .kop-btn-cancel { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; background: #f1f5f9; color: #475569; border: none; padding: 16px; border-radius: 14px; font-size: 14px; font-weight: 800; cursor: pointer; transition: background 0.15s; font-family: inherit; text-decoration: none; }
        .kop-btn-cancel:hover:not(:disabled) { background: #e2e8f0; }
        
        .kop-spin { width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,.3); border-top-color: white; border-radius: 50%; animation: kop-spin .7s linear infinite; }
        @keyframes kop-spin { to { transform: rotate(360deg); } }
      `}} />

      <form onSubmit={handleSubmit}>
        {/* Upload Foto */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px dashed #e2e8f0" }}>
          <div
            style={{
              width: "110px", height: "110px", borderRadius: "50%",
              background: preview ? "transparent" : "#eff6ff",
              border: preview ? "3px solid #bfdbfe" : "1.5px dashed #93c5fd",
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden", marginBottom: "16px", position: "relative",
              boxShadow: "0 8px 24px rgba(37,99,235,.1)"
            }}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Preview foto profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ color: "#2563eb", fontSize: "36px", fontWeight: "800", letterSpacing: "1px" }}>
                {getInisial(namaValue || "?")}
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: "10px 20px", fontSize: "13px", fontWeight: "700",
                background: "#eff6ff", color: "#1d4ed8", border: "none",
                borderRadius: "20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              {preview ? "Ubah Foto" : "Pilih Foto"}
            </button>
            {preview && (
              <button
                type="button"
                onClick={handleRemoveFoto}
                style={{
                  padding: "10px 20px", fontSize: "13px", fontWeight: "700",
                  background: "#fef2f2", color: "#be123c", border: "none",
                  borderRadius: "20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                Hapus
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
          {fotoError && (
            <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "12px", background: "#fef2f2", padding: "6px 12px", borderRadius: "8px", fontWeight: "600" }}>
              {fotoError}
            </div>
          )}
          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "10px", fontWeight: "500" }}>
            Format JPG/PNG, ukuran maks. 8MB.
          </div>
        </div>

        {/* Nama */}
        <div style={{ marginBottom: "20px" }}>
          <label className="kop-label">
            Nama Lengkap <span className="kop-req">*</span>
          </label>
          <div className="kop-input-wrapper">
            <span className="kop-input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
            <input
              type="text"
              name="nama"
              value={namaValue}
              onChange={(e) => setNamaValue(e.target.value)}
              className="kop-input"
              placeholder="Contoh: Budi Santoso"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div style={{ marginBottom: "20px" }}>
          <label className="kop-label">
            Alamat Email <span style={{ color: "#94a3b8", fontWeight: "500" }}>(Opsional)</span>
          </label>
          <div className="kop-input-wrapper">
            <span className="kop-input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></svg>
            </span>
            <input 
              type="email" 
              name="email" 
              defaultValue={email} 
              placeholder="nama.anda@gmail.com" 
              className="kop-input" 
            />
          </div>
        </div>

        {/* No HP */}
        <div style={{ marginBottom: "32px" }}>
          <label className="kop-label">
            No HP / WhatsApp <span style={{ color: "#94a3b8", fontWeight: "500" }}>(Opsional)</span>
          </label>
          <div className="kop-input-wrapper">
            <span className="kop-input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
            </span>
            <input
              type="tel"
              name="no_hp"
              defaultValue={noHp}
              placeholder="08xxxxxxxxxx"
              className="kop-input"
            />
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: "flex", gap: "14px" }}>
          <Link href="/dashboard/profil" className="kop-btn-cancel">
            Batal
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="kop-btn-submit"
          >
            {isPending ? (
              <><span className="kop-spin"></span> Menyimpan...</>
            ) : (
              <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Simpan Perubahan</>
            )}
          </button>
        </div>
      </form>
    </>
  );
}
