"use client";

import { useEffect } from "react";

export default function PwaRegistration() {
  useEffect(() => {
    // Mengecek apakah browser mendukung Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then(
          (registration) => {
            console.log("PWA Service Worker berhasil didaftarkan:", registration.scope);
          },
          (err) => {
            console.error("PWA Service Worker gagal didaftarkan:", err);
          }
        );
      });
    }
  }, []);

  return null; // Komponen ini tidak menampilkan UI apa-apa
}
