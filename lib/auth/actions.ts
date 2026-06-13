"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export type LoginResult = {
  success: boolean;
  error?: string;
  mustChangePassword?: boolean;
  redirectTo?: string;
};

/**
 * Login dengan NIK + Password
 * Strategi: NIK di-convert ke virtual email (nik@koperasi.local)
 * untuk leverage Supabase Auth, tapi user tetap input NIK saja
 */
export async function loginAction(
  formData: FormData
): Promise<LoginResult> {
  const nik = (formData.get("nik") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();

  // Validasi input
  if (!nik || !password) {
    return { success: false, error: "NIK dan password wajib diisi" };
  }

  if (!/^\d{6,20}$/.test(nik)) {
    return { success: false, error: "Format NIK tidak valid (6-20 digit angka)" };
  }

  try {
    const serviceClient = createServiceClient();

    // 1. Cari user di tabel users berdasarkan NIK
    const { data: user, error: userError } = await serviceClient
      .from("users")
      .select("id, nik, nama, email, password_hash, role, must_change_password, is_active")
      .eq("nik", nik)
      .single();

    if (userError || !user) {
      return { success: false, error: "NIK tidak terdaftar" };
    }

    // 2. Cek apakah akun aktif
    if (!user.is_active) {
      return {
        success: false,
        error: "Akun tidak aktif. Hubungi admin koperasi.",
      };
    }

    // 3. Verifikasi password dengan bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return { success: false, error: "Password salah" };
    }

    // 4. Login berhasil - buat session via Supabase Auth
    const supabase = createClient();

    // Sign in dengan virtual email
    const virtualEmail = `${nik}@koperasi.local`;

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: virtualEmail,
      password: password,
    });

    // Kalau auth user belum ada di Supabase Auth, buat dulu
    if (authError && authError.message.includes("Invalid login")) {
      // Create auth user via service client
      const { error: createError } = await serviceClient.auth.admin.createUser({
        email: virtualEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          nik: user.nik,
          nama: user.nama,
          role: user.role,
          db_user_id: user.id,
        },
      });

      if (createError) {
        return {
          success: false,
          error: "Gagal membuat session: " + createError.message,
        };
      }

      // Coba sign in lagi
      const retry = await supabase.auth.signInWithPassword({
        email: virtualEmail,
        password: password,
      });

      if (retry.error) {
        return { success: false, error: "Login gagal: " + retry.error.message };
      }
    } else if (authError) {
      return { success: false, error: "Login gagal: " + authError.message };
    }

    // 5. Update last_login_at
    await serviceClient
      .from("users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", user.id);

    // 6. Tentukan redirect berdasarkan must_change_password
    const redirectTo = user.must_change_password ? "/change-password" : "/dashboard";

    return {
      success: true,
      mustChangePassword: user.must_change_password,
      redirectTo,
    };
  } catch (error: any) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "Terjadi kesalahan sistem. Silakan coba lagi.",
    };
  }
}

/**
 * Logout
 */
export async function logoutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

/**
 * Change Password (untuk first login)
 */
export async function changePasswordAction(formData: FormData) {
  const newPassword = (formData.get("newPassword") as string)?.trim();
  const confirmPassword = (formData.get("confirmPassword") as string)?.trim();

  if (!newPassword || !confirmPassword) {
    return { success: false, error: "Semua field wajib diisi" };
  }

  if (newPassword.length < 8) {
    return { success: false, error: "Password minimal 8 karakter" };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "Konfirmasi password tidak cocok" };
  }

  // Cek strength password
  if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return {
      success: false,
      error: "Password harus mengandung huruf besar dan angka",
    };
  }

  try {
    const supabase = createClient();
    const serviceClient = createServiceClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Session expired. Silakan login ulang." };
    }

    const dbUserId = user.user_metadata?.db_user_id;
    if (!dbUserId) {
      return { success: false, error: "Data user tidak lengkap" };
    }

    // Hash password baru
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password di tabel users
    const { error: updateError } = await serviceClient
      .from("users")
      .update({
        password_hash: passwordHash,
        must_change_password: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", dbUserId);

    if (updateError) {
      return {
        success: false,
        error: "Gagal update password: " + updateError.message,
      };
    }

    // Update password di Supabase Auth juga
    const { error: authUpdateError } = await serviceClient.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (authUpdateError) {
      console.error("Auth update error:", authUpdateError);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Change password error:", error);
    return {
      success: false,
      error: "Terjadi kesalahan sistem.",
    };
  }
}
