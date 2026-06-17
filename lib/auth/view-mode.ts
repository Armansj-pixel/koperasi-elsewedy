"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Fungsi untuk berpindah mode tampilan (Admin <-> Personal)
 * Dipanggil dari tombol switcher di Navbar/Header
 */
export async function switchViewMode(mode: "ADMIN" | "PERSONAL") {
  // Simpan pilihan ke cookie dengan durasi 1 hari
  cookies().set("view_mode", mode, { 
    path: "/", 
    httpOnly: true,
    maxAge: 86400, // 24 jam
    sameSite: "lax" 
  });
  
  // Refresh halaman agar sidebar/nav langsung menyesuaikan
  revalidatePath("/", "layout");
}

/**
 * Helper untuk mengambil mode saat ini di server-side
 * Digunakan untuk menentukan menu mana yang ditampilkan di Layout
 */
export async function getViewMode() {
  const cookieStore = cookies();
  return cookieStore.get("view_mode")?.value || "ADMIN";
}
