"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// =====================================================================
// SCHEMAS
// =====================================================================

const SetoranSchema = z.object({
  user_id: z.string().uuid("User tidak valid"),
  jumlah: z.coerce.number().min(1000, "Minimal setoran Rp 1.000"),
  jenis: z.enum([
    "SIMPANAN_POKOK",
    "SIMPANAN_WAJIB",
    "SIMPANAN_SUKARELA",
  ]),
  keterangan: z.string().optional().or(z.literal("")),
  tanggal: z.string().optional().or(z.literal("")),
});

const PenarikanSchema = z.object({
  jumlah: z.coerce
    .number()
    .min(10000, "Minimal penarikan Rp 10.000"),
  keterangan: z.string().optional().or(z.literal("")),
});

// =====================================================================
// GET SEMUA SALDO SIMPANAN (untuk Bendahara/Admin)
// =====================================================================

export async function getAllSaldoSimpanan(search?: string) {
  await requireRole(["SUPERADMIN", "SEKRETARIS", "BENDAHARA", "KETUA"]);
  const supabase = createServiceClient();

  let query = supabase
    .from("users")
    .select(
      `id, nik, nama, simpanan_bulanan, is_active,
       saldo_simpanan(total_saldo)`
    )
    .eq("is_active", true)
    .order("nama", { ascending: true });

  if (search) {
    query = query.or(`nik.ilike.%${search}%,nama.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return { success: false, error: error.message, data: [] };
  }

  return { success: true, data: data || [] };
}

// =====================================================================
// GET SALDO SIMPANAN PER ANGGOTA
// =====================================================================

export async function getSaldoByUserId(userId: string) {
  await requireRole(["SUPERADMIN", "SEKRETARIS", "BENDAHARA", "KETUA", "ANGGOTA"]);
  const supabase = createServiceClient();

  // Ambil saldo
  const { data: saldo, error: saldoError } = await supabase
    .from("saldo_simpanan")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (saldoError) {
    return { success: false, error: saldoError.message, data: null };
  }

  // Ambil data user
  const { data: user } = await supabase
    .from("users")
    .select("id, nik, nama, simpanan_bulanan")
    .eq("id", userId)
    .single();

  return { success: true, data: { saldo, user } };
}

// =====================================================================
// GET RIWAYAT MUTASI SIMPANAN
// =====================================================================

export async function getRiwayatSimpanan(
  userId: string,
  limit: number = 20
) {
  await requireRole(["SUPERADMIN", "SEKRETARIS", "BENDAHARA", "KETUA", "ANGGOTA"]);
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("simpanan")
    .select(
      `id, jenis, jumlah, keterangan, tanggal, created_at,
       users!simpanan_created_by_fkey(nama)`
    )
    .eq("user_id", userId)
    .order("tanggal", { ascending: false })
    .limit(limit);

  if (error) {
    // Coba tanpa join kalau ada error FK
    const { data: data2, error: error2 } = await supabase
      .from("simpanan")
      .select("id, jenis, jumlah, keterangan, tanggal, created_at")
      .eq("user_id", userId)
      .order("tanggal", { ascending: false })
      .limit(limit);

    if (error2) {
      return { success: false, error: error2.message, data: [] };
    }

    return { success: true, data: data2 || [] };
  }

  return { success: true, data: data || [] };
}

// =====================================================================
// INPUT SETORAN SIMPANAN (by Bendahara/Admin)
// =====================================================================

export async function inputSetoran(formData: FormData) {
  const currentUser = await requireRole(["SUPERADMIN", "BENDAHARA"]);
  const supabase = createServiceClient();

  const raw = {
    user_id: (formData.get("user_id") as string)?.trim() || "",
    jumlah: (formData.get("jumlah") as string) || "0",
    jenis: (formData.get("jenis") as string)?.trim() || "SIMPANAN_WAJIB",
    keterangan: (formData.get("keterangan") as string)?.trim() || "",
    tanggal: (formData.get("tanggal") as string)?.trim() || "",
  };

  const parsed = SetoranSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0].message,
    };
  }

  const data = parsed.data;
  const tanggalFinal =
    data.tanggal || new Date().toISOString().split("T")[0];

  // Cek user exists
  const { data: user } = await supabase
    .from("users")
    .select("id, nama, nik")
    .eq("id", data.user_id)
    .single();

  if (!user) {
    return { success: false, error: "Anggota tidak ditemukan" };
  }

  // Insert mutasi simpanan
  const { error: insertError } = await supabase
    .from("simpanan")
    .insert({
      user_id: data.user_id,
      jenis: data.jenis,
      jumlah: data.jumlah,
      tipe: "KREDIT",
      keterangan:
        data.keterangan ||
        `Setoran ${data.jenis.replace(/_/g, " ").toLowerCase()}`,
      tanggal: tanggalFinal,
      created_by: currentUser.id,
    });

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  // Update saldo di tabel saldo_simpanan
  const { data: saldoNow } = await supabase
    .from("saldo_simpanan")
    .select("total_saldo")
    .eq("user_id", data.user_id)
    .single();

  const saldoBaru = Number(saldoNow?.total_saldo || 0) + data.jumlah;

  const { error: updateError } = await supabase
    .from("saldo_simpanan")
    .upsert({
      user_id: data.user_id,
      total_saldo: saldoBaru,
      updated_at: new Date().toISOString(),
    });

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  revalidatePath("/dashboard/simpanan");
  revalidatePath(`/dashboard/simpanan/${data.user_id}`);

  return {
    success: true,
    message: `✅ Setoran Rp ${data.jumlah.toLocaleString("id-ID")} untuk ${user.nama} berhasil dicatat!`,
  };
}

// =====================================================================
// INPUT SETORAN BULANAN MASSAL (Tanggal 25 / by Bendahara)
// =====================================================================

export async function inputSetoranBulananMassal(
  bulan: number,
  tahun: number
) {
  const currentUser = await requireRole(["SUPERADMIN", "BENDAHARA"]);
  const supabase = createServiceClient();

  // Ambil semua anggota aktif yang punya simpanan bulanan
  const { data: anggotaList, error } = await supabase
    .from("users")
    .select("id, nama, nik, simpanan_bulanan")
    .eq("is_active", true)
    .gt("simpanan_bulanan", 0);

  if (error || !anggotaList) {
    return { success: false, error: "Gagal ambil data anggota" };
  }

  const tanggal = `${tahun}-${String(bulan).padStart(2, "0")}-25`;
  const namaBulan = new Date(tahun, bulan - 1).toLocaleString("id-ID", {
    month: "long",
    year: "numeric",
  });

  let berhasil = 0;
  let gagal = 0;

  for (const anggota of anggotaList) {
    // Cek apakah bulan ini sudah di-input
    const { data: existing } = await supabase
      .from("simpanan")
      .select("id")
      .eq("user_id", anggota.id)
      .eq("jenis", "SIMPANAN_WAJIB")
      .eq("tanggal", tanggal)
      .maybeSingle();

    if (existing) {
      continue; // Skip kalau sudah ada
    }

    // Insert setoran bulanan
    const { error: insertError } = await supabase
      .from("simpanan")
      .insert({
        user_id: anggota.id,
        jenis: "SIMPANAN_WAJIB",
        jumlah: anggota.simpanan_bulanan,
        tipe: "KREDIT",
        keterangan: `Simpanan wajib bulanan ${namaBulan}`,
        tanggal,
        created_by: currentUser.id,
      });

    if (insertError) {
      gagal++;
      continue;
    }

    // Update saldo
    const { data: saldoNow } = await supabase
      .from("saldo_simpanan")
      .select("total_saldo")
      .eq("user_id", anggota.id)
      .single();

    await supabase.from("saldo_simpanan").upsert({
      user_id: anggota.id,
      total_saldo:
        Number(saldoNow?.total_saldo || 0) +
        Number(anggota.simpanan_bulanan),
      updated_at: new Date().toISOString(),
    });

    berhasil++;
  }

  revalidatePath("/dashboard/simpanan");

  return {
    success: true,
    message: `✅ Setoran bulanan ${namaBulan} selesai! ${berhasil} anggota berhasil, ${gagal} gagal.`,
    berhasil,
    gagal,
  };
}
// =====================================================================
// PENGAJUAN PENARIKAN (by Anggota)
// =====================================================================

export async function ajukanPenarikan(formData: FormData) {
  const currentUser = await requireRole([
    "ANGGOTA",
    "SEKRETARIS",
    "BENDAHARA",
    "KETUA",
    "SUPERADMIN",
  ]);
  const supabase = createServiceClient();

  const raw = {
    jumlah: (formData.get("jumlah") as string) || "0",
    keterangan: (formData.get("keterangan") as string)?.trim() || "",
  };

  const parsed = PenarikanSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0].message,
    };
  }

  // Cek saldo mencukupi
  const { data: saldo } = await supabase
    .from("saldo_simpanan")
    .select("total_saldo")
    .eq("user_id", currentUser.id)
    .single();

  if (!saldo || Number(saldo.total_saldo) < parsed.data.jumlah) {
    return {
      success: false,
      error: `Saldo tidak mencukupi. Saldo Anda: Rp ${Number(saldo?.total_saldo || 0).toLocaleString("id-ID")}`,
    };
  }

  // Insert pengajuan penarikan
  const { error } = await supabase
    .from("penarikan_simpanan")
    .insert({
      user_id: currentUser.id,
      jumlah: parsed.data.jumlah,
      keterangan:
        parsed.data.keterangan || "Pengajuan penarikan simpanan",
      status: "PENDING",
      tanggal_pengajuan: new Date().toISOString().split("T")[0],
    });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/simpanan");

  return {
    success: true,
    message: `✅ Pengajuan penarikan Rp ${parsed.data.jumlah.toLocaleString("id-ID")} berhasil diajukan! Menunggu persetujuan Bendahara.`,
  };
}

// =====================================================================
// APPROVE / REJECT PENARIKAN (by Bendahara)
// =====================================================================

export async function updateStatusPenarikan(
  penarikanId: string,
  status: "APPROVED" | "REJECTED",
  catatan?: string
) {
  const currentUser = await requireRole([
    "SUPERADMIN",
    "BENDAHARA",
  ]);
  const supabase = createServiceClient();

  // Ambil data penarikan
  const { data: penarikan } = await supabase
    .from("penarikan_simpanan")
    .select("*")
    .eq("id", penarikanId)
    .single();

  if (!penarikan) {
    return { success: false, error: "Data penarikan tidak ditemukan" };
  }

  if (penarikan.status !== "PENDING") {
    return {
      success: false,
      error: "Penarikan ini sudah diproses sebelumnya",
    };
  }

  // Update status
  const { error: updateError } = await supabase
    .from("penarikan_simpanan")
    .update({
      status,
      catatan_bendahara: catatan || null,
      tanggal_diproses: new Date().toISOString().split("T")[0],
      diproses_oleh: currentUser.id,
    })
    .eq("id", penarikanId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Kalau APPROVED, kurangi saldo
  if (status === "APPROVED") {
    const { data: saldo } = await supabase
      .from("saldo_simpanan")
      .select("total_saldo")
      .eq("user_id", penarikan.user_id)
      .single();

    const saldoBaru =
      Number(saldo?.total_saldo || 0) - Number(penarikan.jumlah);

    if (saldoBaru < 0) {
      return {
        success: false,
        error: "Saldo tidak mencukupi untuk disetujui",
      };
    }

    // Update saldo
    await supabase.from("saldo_simpanan").update({
      total_saldo: saldoBaru,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", penarikan.user_id);

    // Insert mutasi debit
    await supabase.from("simpanan").insert({
      user_id: penarikan.user_id,
      jenis: "SIMPANAN_SUKARELA",
      jumlah: penarikan.jumlah,
      tipe: "DEBIT",
      keterangan: `Penarikan simpanan - disetujui`,
      tanggal: new Date().toISOString().split("T")[0],
      created_by: currentUser.id,
    });
  }

  revalidatePath("/dashboard/simpanan");
  revalidatePath("/dashboard/simpanan/penarikan");

  return {
    success: true,
    message:
      status === "APPROVED"
        ? "✅ Penarikan disetujui dan saldo telah dikurangi"
        : "❌ Penarikan ditolak",
  };
}

// =====================================================================
// GET LIST PENARIKAN (by Bendahara)
// =====================================================================

export async function getListPenarikan(status?: string) {
  await requireRole(["SUPERADMIN", "BENDAHARA", "KETUA"]);
  const supabase = createServiceClient();

  let query = supabase
    .from("penarikan_simpanan")
    .select(
      `id, jumlah, keterangan, status, tanggal_pengajuan,
       tanggal_diproses, catatan_bendahara,
       users!penarikan_simpanan_user_id_fkey(id, nik, nama, no_rekening, nama_bank)`
    )
    .order("tanggal_pengajuan", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return { success: false, error: error.message, data: [] };
  }

  return { success: true, data: data || [] };
}
