"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";

// =====================================================================
// SCHEMAS
// =====================================================================

const AnggotaSchema = z.object({
  nik: z.string().min(6).max(20).regex(/^\d+$/, "NIK harus berupa angka"),
  nama: z.string().min(3).max(100),
  email: z.string().email(),
  no_hp: z.string().optional(),
  no_rekening: z.string().optional(),
  nama_bank: z.string().optional(),
  role: z.enum(["ANGGOTA", "SEKRETARIS", "BENDAHARA", "KETUA", "SUPERADMIN"]),
  simpanan_bulanan: z.coerce.number().min(0).default(0),
  tanggal_bergabung: z.string().optional(),
});
// =====================================================================
// GET ALL ANGGOTA
// =====================================================================

export async function getAnggotaList(search?: string) {
  const user = await requireRole(["SUPERADMIN", "SEKRETARIS", "BENDAHARA", "KETUA"]);
  const supabase = createServiceClient();

  let query = supabase
    .from("users")
    .select("id, nik, nama, email, no_hp, role, simpanan_bulanan, tanggal_bergabung, is_active, last_login_at, created_at")
    .order("nama", { ascending: true });

  if (search) {
    query = query.or(`nik.ilike.%${search}%,nama.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return { success: false, error: error.message, data: [] };
  }

  return { success: true, data: data || [] };
}

// =====================================================================
// GET ANGGOTA BY ID
// =====================================================================

export async function getAnggotaById(id: string) {
  await requireRole(["SUPERADMIN", "SEKRETARIS", "BENDAHARA", "KETUA"]);
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("users")
    .select("*, saldo_simpanan(total_saldo)")
    .eq("id", id)
    .single();

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data };
}// =====================================================================
// TAMBAH ANGGOTA BARU
// =====================================================================

export async function tambahAnggota(formData: FormData) {
  await requireRole(["SUPERADMIN", "SEKRETARIS"]);
  const supabase = createServiceClient();

  const raw = {
    nik: formData.get("nik") as string,
    nama: formData.get("nama") as string,
    email: formData.get("email") as string,
    no_hp: formData.get("no_hp") as string,
    no_rekening: formData.get("no_rekening") as string,
    nama_bank: formData.get("nama_bank") as string,
    role: formData.get("role") as string,
    simpanan_bulanan: formData.get("simpanan_bulanan") as string,
    tanggal_bergabung: formData.get("tanggal_bergabung") as string,
  };

  // Validasi
  const parsed = AnggotaSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0].message,
    };
  }

  const data = parsed.data;

  // Cek NIK duplikat
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("nik", data.nik)
    .single();

  if (existing) {
    return { success: false, error: "NIK sudah terdaftar" };
  }

  // Password default = 4 digit terakhir NIK
  const defaultPassword = data.nik.slice(-4);
  const passwordHash = await bcrypt.hash(defaultPassword, 10);
  const virtualEmail = `${data.nik}@koperasi.local`;

  // Insert ke tabel users
  const { data: newUser, error: insertError } = await supabase
    .from("users")
    .insert({
      nik: data.nik,
      nama: data.nama,
      email: virtualEmail,
      no_hp: data.no_hp || null,
      no_rekening: data.no_rekening || null,
      nama_bank: data.nama_bank || null,
      password_hash: passwordHash,
      must_change_password: true,
      role: data.role,
      simpanan_bulanan: data.simpanan_bulanan,
      tanggal_bergabung: data.tanggal_bergabung || new Date().toISOString().split("T")[0],
      is_active: true,
    })
    .select("id, nik, nama")
    .single();

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  // Auto-create saldo_simpanan
  await supabase
    .from("saldo_simpanan")
    .insert({ user_id: newUser.id, total_saldo: 0 });

  // Auto-create Supabase Auth user
  const { error: authError } = await supabase.auth.admin.createUser({
    email: virtualEmail,
    password: defaultPassword,
    email_confirm: true,
    user_metadata: {
      nik: data.nik,
      nama: data.nama,
      role: data.role,
      db_user_id: newUser.id,
    },
  });

  if (authError) {
    console.error("Auth user creation error:", authError);
  }

  revalidatePath("/dashboard/anggota");

  return {
    success: true,
    message: `Anggota ${data.nama} berhasil ditambahkan. Password default: ${defaultPassword}`,
    data: newUser,
  };
}

// =====================================================================
// EDIT ANGGOTA
// =====================================================================

export async function editAnggota(id: string, formData: FormData) {
  await requireRole(["SUPERADMIN", "SEKRETARIS"]);
  const supabase = createServiceClient();

  const raw = {
    nik: formData.get("nik") as string,
    nama: formData.get("nama") as string,
    email: formData.get("email") as string,
    no_hp: formData.get("no_hp") as string,
    no_rekening: formData.get("no_rekening") as string,
    nama_bank: formData.get("nama_bank") as string,
    role: formData.get("role") as string,
    simpanan_bulanan: formData.get("simpanan_bulanan") as string,
    tanggal_bergabung: formData.get("tanggal_bergabung") as string,
  };

  const parsed = AnggotaSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const data = parsed.data;

  const { error } = await supabase
    .from("users")
    .update({
      nama: data.nama,
      no_hp: data.no_hp || null,
      no_rekening: data.no_rekening || null,
      nama_bank: data.nama_bank || null,
      role: data.role,
      simpanan_bulanan: data.simpanan_bulanan,
      tanggal_bergabung: data.tanggal_bergabung,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/anggota");
  revalidatePath(`/dashboard/anggota/${id}`);

  return { success: true, message: "Data anggota berhasil diupdate" };
}
// =====================================================================
// TOGGLE AKTIF / NONAKTIF
// =====================================================================

export async function toggleAnggotaStatus(id: string, isActive: boolean) {
  await requireRole(["SUPERADMIN"]);
  const supabase = createServiceClient();

  const { error } = await supabase
    .from("users")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/anggota");

  return {
    success: true,
    message: `Anggota berhasil ${isActive ? "diaktifkan" : "dinonaktifkan"}`,
  };
}

// =====================================================================
// RESET PASSWORD ANGGOTA
// =====================================================================

export async function resetPasswordAnggota(id: string) {
  await requireRole(["SUPERADMIN"]);
  const supabase = createServiceClient();

  // Ambil NIK user
  const { data: user } = await supabase
    .from("users")
    .select("id, nik, nama")
    .eq("id", id)
    .single();

  if (!user) {
    return { success: false, error: "Anggota tidak ditemukan" };
  }

  // Password baru = 4 digit terakhir NIK
  const newPassword = user.nik.slice(-4);
  const passwordHash = await bcrypt.hash(newPassword, 10);
  const virtualEmail = `${user.nik}@koperasi.local`;

  // Update di tabel users
  await supabase
    .from("users")
    .update({
      password_hash: passwordHash,
      must_change_password: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  // Update di Supabase Auth
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const authUser = authUsers?.users.find((u) => u.email === virtualEmail);

  if (authUser) {
    await supabase.auth.admin.updateUserById(authUser.id, {
      password: newPassword,
    });
  }

  revalidatePath("/dashboard/anggota");

  return {
    success: true,
    message: `Password ${user.nama} berhasil direset ke: ${newPassword}`,
  };
}


