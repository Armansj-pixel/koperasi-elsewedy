import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type CurrentUser = {
  id: string;
  authId: string;
  nik: string;
  nama: string;
  email: string;
  role: "ANGGOTA" | "SEKRETARIS" | "BENDAHARA" | "KETUA" | "SUPERADMIN";
  mustChangePassword: boolean;
  isActive: boolean;
};

/**
 * Get current logged-in user dari Supabase Auth + database users
 * Pakai di Server Components & Server Actions
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

  const dbUserId = authUser.user_metadata?.db_user_id;
  if (!dbUserId) {
    return null;
  }

  // Ambil data user lengkap dari tabel users
  const serviceClient = createServiceClient();
  const { data: dbUser, error } = await serviceClient
    .from("users")
    .select("id, nik, nama, email, role, must_change_password, is_active")
    .eq("id", dbUserId)
    .single();

  if (error || !dbUser) {
    return null;
  }

  return {
    id: dbUser.id,
    authId: authUser.id,
    nik: dbUser.nik,
    nama: dbUser.nama,
    email: dbUser.email,
    role: dbUser.role,
    mustChangePassword: dbUser.must_change_password,
    isActive: dbUser.is_active,
  };
}

/**
 * Require user to be logged in
 * Redirect ke /login kalau belum auth
 */
export async function requireAuth(): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.isActive) {
    redirect("/login?error=inactive");
  }

  return user;
}

/**
 * Require user to have changed password
 * Redirect ke /change-password kalau masih default
 */
export async function requirePasswordChanged(): Promise<CurrentUser> {
  const user = await requireAuth();

  if (user.mustChangePassword) {
    redirect("/change-password");
  }

  return user;
}

/**
 * Require specific role(s)
 * Redirect ke /dashboard kalau role tidak match
 */
export async function requireRole(
  allowedRoles: CurrentUser["role"][]
): Promise<CurrentUser> {
  const user = await requirePasswordChanged();

  if (!allowedRoles.includes(user.role)) {
    redirect("/dashboard?error=forbidden");
  }

  return user;
}
