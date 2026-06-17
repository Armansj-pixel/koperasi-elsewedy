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
  nominal: z.coerce.number().min(1000, "Minimal setoran Rp 1.000"),
  jenis_simpanan: z.enum([
    "SIMPANAN_POKOK",
    "SIMPANAN_WAJIB",
    "SIMPANAN_SUKARELA",
  ]),
  keterangan: z.string().optional().or(z.literal("")),
  tanggal: z.string().optional().or(z.literal("")),
});

const PenarikanSchema = z.object({
  nominal: z.coerce.number().min(10000, "Minimal penarikan Rp 10.000"),
  catatan: z.string().optional().or(z.literal("")),
});

// =====================================================================
// HELPER: Format periode "YYYY-MM"
// =====================================================================

function formatPeriode(tanggal: string): string {
  const d = new Date(tanggal);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

// =====================================================================
// HELPER: Update saldo (Keranjang Terpisah)
// =====================================================================

async function updateSaldo(
  supabase: any,
  userId: string,
  nominalMutasi: number,
  jenisTransaksi: "SIMPANAN_POKOK" | "SIMPANAN_WAJIB" | "SIMPANAN_SUKARELA" | "PENARIKAN"
) {
  const { data: existing } = await supabase
    .from("saldo_simpanan")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  // Ambil saldo saat ini (jika belum ada, anggap 0)
  let pokok = Number(existing?.saldo_pokok || 0);
  let wajib = Number(existing?.saldo_wajib || 0);
  let sukarela = Number(existing?.saldo_sukarela || 0);

  // Alokasikan dana sesuai jenis transaksi
  if (jenisTransaksi === "SIMPANAN_POKOK") {
    pokok += nominalMutasi;
  } else if (jenisTransaksi === "SIMPANAN_WAJIB") {
    wajib += nominalMutasi;
  } else if (jenisTransaksi === "SIMPANAN_SUKARELA") {
    sukarela += nominalMutasi;
  } else if (jenisTransaksi === "PENARIKAN") {
    sukarela -= nominalMutasi; // Penarikan HANYA memotong keranjang sukarela
  }

  // Hitung ulang Grand Total
  const total = pokok + wajib + sukarela;

  if (existing) {
    return await supabase
      .from("saldo_simpanan")
      .update({
        total_saldo: total,
        saldo_pokok: pokok,
        saldo_wajib: wajib,
        saldo_sukarela: sukarela,
        last_updated: new Date().toISOString(),
      })
      .eq("user_id", userId);
  } else {
    return await supabase.from("saldo_simpanan").insert({
      user_id: userId,
      total_saldo: total,
      saldo_pokok: pokok,
      saldo_wajib: wajib,
      saldo_sukarela: sukarela,
      last_updated: new Date().toISOString(),
    });
  }
}

// =====================================================================
// GET SEMUA SALDO SIMPANAN
// =====================================================================

export async function getAllSaldoSimpanan(search?: string) {
  await requireRole(["SUPERADMIN", "SEKRETARIS", "BENDAHARA", "KETUA"]);
  const supabase = createServiceClient();

  // PERHATIAN: Di query ini kita sesuaikan untuk menarik data wajib dan sukarela jika diperlukan untuk tampilan
  let query = supabase
    .from("users")
    .select("id, nik, nama, simpanan_wajib_bulanan, simpanan_sukarela_bulanan, is_active")
    .eq("is_active", true)
    .order("nama", { ascending: true });

  if (search) {
    query = query.or(`nik.ilike.%${search}%,nama.ilike.%${search}%`);
  }

  const { data: users, error } = await query;

  if (error) return { success: false, error: error.message, data: [] };

  const { data: saldoList } = await supabase
    .from("saldo_simpanan")
    .select("user_id, total_saldo, saldo_pokok, saldo_wajib, saldo_sukarela");

  const data = (users || []).map((user: any) => {
    const saldo = saldoList?.find((s) => s.user_id === user.id);
    return {
      ...user,
      total_saldo: Number(saldo?.total_saldo || 0),
      saldo_simpanan: [
        {
          total_saldo: saldo?.total_saldo || 0,
          saldo_pokok: saldo?.saldo_pokok || 0,
          saldo_wajib: saldo?.saldo_wajib || 0,
          saldo_sukarela: saldo?.saldo_sukarela || 0,
        },
      ],
    };
  });

  return { success: true, data };
}

// =====================================================================
// GET SALDO PER ANGGOTA
// =====================================================================

export async function getSaldoByUserId(userId: string) {
  await requireRole(["SUPERADMIN", "SEKRETARIS", "BENDAHARA", "KETUA", "ANGGOTA"]);
  const supabase = createServiceClient();

  const { data: saldo, error: saldoError } = await supabase
    .from("saldo_simpanan")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (saldoError) return { success: false, error: saldoError.message, data: null };

  const { data: user } = await supabase
    .from("users")
    .select("id, nik, nama, simpanan_wajib_bulanan, simpanan_sukarela_bulanan")
    .eq("id", userId)
    .single();

  return { success: true, data: { saldo, user } };
}

// =====================================================================
// GET RIWAYAT MUTASI SIMPANAN
// =====================================================================

export async function getRiwayatSimpanan(userId: string, limit: number = 20) {
  await requireRole(["SUPERADMIN", "SEKRETARIS", "BENDAHARA", "KETUA", "ANGGOTA"]);
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("simpanan")
    .select("id, jenis, nominal, periode, keterangan, tanggal, status, created_at")
    .eq("user_id", userId)
    .order("tanggal", { ascending: false })
    .limit(limit);

  if (error) return { success: false, error: error.message, data: [] };

  return { success: true, data: data || [] };
}

// =====================================================================
// INPUT SETORAN SIMPANAN (MANUAL)
// =====================================================================

export async function inputSetoran(formData: FormData) {
  const currentUser = await requireRole(["SUPERADMIN", "BENDAHARA"]);
  const supabase = createServiceClient();

  const raw = {
    user_id: (formData.get("user_id") as string)?.trim() || "",
    nominal: (formData.get("jumlah") as string) || "0",
    jenis_simpanan: (formData.get("jenis") as string)?.trim() || "SIMPANAN_WAJIB",
    keterangan: (formData.get("keterangan") as string)?.trim() || "",
    tanggal: (formData.get("tanggal") as string)?.trim() || "",
  };

  const parsed = SetoranSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const data = parsed.data;
  const tanggalFinal = data.tanggal || new Date().toISOString().split("T")[0];
  const periodeFinal = formatPeriode(tanggalFinal);

  const keteranganLabel: Record<string, string> = {
    SIMPANAN_POKOK: "Simpanan pokok",
    SIMPANAN_WAJIB: "Simpanan wajib bulanan",
    SIMPANAN_SUKARELA: "Simpanan sukarela",
  };

  const { data: user } = await supabase.from("users").select("id, nama, nik").eq("id", data.user_id).single();
  if (!user) return { success: false, error: "Anggota tidak ditemukan" };

  const { error: insertError } = await supabase.from("simpanan").insert({
    user_id: data.user_id,
    jenis: "SETORAN",
    nominal: data.nominal,
    periode: periodeFinal,
    tanggal: tanggalFinal,
    status: "APPROVED",
    keterangan: data.keterangan || keteranganLabel[data.jenis_simpanan],
    created_by: currentUser.id,
  });

  if (insertError) return { success: false, error: insertError.message };

  const { error: saldoError } = await updateSaldo(
    supabase, 
    data.user_id, 
    data.nominal, 
    data.jenis_simpanan as "SIMPANAN_POKOK" | "SIMPANAN_WAJIB" | "SIMPANAN_SUKARELA"
  );

  if (saldoError) return { success: false, error: saldoError.message };

  revalidatePath("/dashboard/simpanan");
  revalidatePath(`/dashboard/simpanan/${data.user_id}`);
  revalidatePath("/dashboard/anggota");

  return { success: true, message: `✅ Setoran Rp ${data.nominal.toLocaleString("id-ID")} untuk ${user.nama} berhasil dicatat!` };
}

// =====================================================================
// SETORAN BULANAN MASSAL (POTONG GAJI - WAJIB & SUKARELA)
// =====================================================================

export async function inputSetoranBulananMassal(bulan: number, tahun: number) {
  const currentUser = await requireRole(["SUPERADMIN", "BENDAHARA"]);
  const supabase = createServiceClient();

  // 1. Ambil data anggota beserta settingan potongan wajib & sukarelanya
  const { data: anggotaList, error } = await supabase
    .from("users")
    .select("id, nama, nik, simpanan_wajib_bulanan, simpanan_sukarela_bulanan")
    .eq("is_active", true);

  if (error || !anggotaList) return { success: false, error: "Gagal ambil data anggota" };

  const tanggal = `${tahun}-${String(bulan).padStart(2, "0")}-25`; // Asumsi potong gaji tgl 25
  const periode = `${tahun}-${String(bulan).padStart(2, "0")}`;
  const namaBulan = new Date(tahun, bulan - 1).toLocaleString("id-ID", { month: "long", year: "numeric" });

  let berhasilWajib = 0;
  let berhasilSukarela = 0;
  let dilewati = 0;
  let gagal = 0;

  for (const anggota of anggotaList) {
    const wajib = Number(anggota.simpanan_wajib_bulanan || 0);
    const sukarela = Number(anggota.simpanan_sukarela_bulanan || 0);

    if (wajib === 0 && sukarela === 0) continue; // Skip jika tidak ada potongan

    // --- PROSES POTONGAN SIMPANAN WAJIB ---
    if (wajib > 0) {
      const { data: existWajib } = await supabase
        .from("simpanan")
        .select("id")
        .eq("user_id", anggota.id)
        .eq("jenis", "SETORAN")
        .eq("periode", periode)
        .ilike("keterangan", "%Wajib Bulanan%")
        .maybeSingle();

      if (existWajib) {
        dilewati++;
      } else {
        const { error: errWajib } = await supabase.from("simpanan").insert({
          user_id: anggota.id,
          jenis: "SETORAN",
          nominal: wajib,
          periode,
          tanggal,
          status: "APPROVED",
          keterangan: `Simpanan Wajib Bulanan ${namaBulan}`,
          created_by: currentUser.id,
        });

        if (!errWajib) {
          await updateSaldo(supabase, anggota.id, wajib, "SIMPANAN_WAJIB");
          berhasilWajib++;
        } else {
          gagal++;
        }
      }
    }

    // --- PROSES POTONGAN SIMPANAN SUKARELA ---
    if (sukarela > 0) {
      const { data: existSukarela } = await supabase
        .from("simpanan")
        .select("id")
        .eq("user_id", anggota.id)
        .eq("jenis", "SETORAN")
        .eq("periode", periode)
        .ilike("keterangan", "%Sukarela Bulanan%")
        .maybeSingle();

      if (existSukarela) {
        // Jika sudah ada, lewati diam-diam (sudah dihitung di variabel 'dilewati' saat ngecek wajib)
      } else {
        const { error: errSukarela } = await supabase.from("simpanan").insert({
          user_id: anggota.id,
          jenis: "SETORAN",
          nominal: sukarela,
          periode,
          tanggal,
          status: "APPROVED",
          keterangan: `Simpanan Sukarela Bulanan ${namaBulan}`,
          created_by: currentUser.id,
        });

        if (!errSukarela) {
          await updateSaldo(supabase, anggota.id, sukarela, "SIMPANAN_SUKARELA");
          berhasilSukarela++;
        } else {
          gagal++;
        }
      }
    }
  }

  revalidatePath("/dashboard/simpanan");
  revalidatePath("/dashboard/anggota");

  return { 
    success: true, 
    message: `✅ Payroll ${namaBulan} selesai! Wajib: ${berhasilWajib}, Sukarela: ${berhasilSukarela}. Dilewati: ${dilewati}, Gagal: ${gagal}.` 
  };
}

// =====================================================================
// PENGAJUAN PENARIKAN (HANYA CEK SALDO SUKARELA)
// =====================================================================

export async function ajukanPenarikan(formData: FormData) {
  const currentUser = await requireRole(["ANGGOTA", "SEKRETARIS", "BENDAHARA", "KETUA", "SUPERADMIN"]);

  if (currentUser.role === "ANGGOTA") {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    const currentMinute = (now.getHours() * 60) + now.getMinutes();
    if (now.getDay() === 4 && currentMinute >= (9 * 60) && currentMinute < (15 * 60)) {
      return { success: false, error: "Gagal: Sedang dalam masa cut-off mingguan (Kamis 09:00 - 15:00 WIB)." };
    }
  }

  const supabase = createServiceClient();
  const raw = {
    nominal: (formData.get("nominal") as string) || "0",
    catatan: (formData.get("catatan") as string)?.trim() || "",
  };

  const parsed = PenarikanSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const { data: saldo } = await supabase.from("saldo_simpanan").select("saldo_sukarela").eq("user_id", currentUser.id).single();

  if (!saldo || Number(saldo.saldo_sukarela) < parsed.data.nominal) {
    return {
      success: false,
      error: `Penarikan Ditolak. Saldo Sukarela yang bisa ditarik hanya: Rp ${Number(saldo?.saldo_sukarela || 0).toLocaleString("id-ID")}`,
    };
  }

  const { error } = await supabase.from("penarikan_simpanan").insert({
    user_id: currentUser.id,
    nominal: parsed.data.nominal,
    catatan: parsed.data.catatan || "Pengajuan penarikan simpanan",
    status: "PENDING",
    tanggal_pengajuan: new Date().toISOString(),
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/dashboard/simpanan");
  return { success: true, message: `✅ Pengajuan penarikan Rp ${parsed.data.nominal.toLocaleString("id-ID")} berhasil dikirim.` };
}

// =====================================================================
// APPROVE / REJECT PENARIKAN
// =====================================================================

export async function updateStatusPenarikan(penarikanId: string, status: "APPROVED" | "REJECTED", catatan?: string) {
  const currentUser = await requireRole(["SUPERADMIN", "BENDAHARA"]);
  const supabase = createServiceClient();

  const { data: penarikan } = await supabase.from("penarikan_simpanan").select("*").eq("id", penarikanId).single();
  if (!penarikan) return { success: false, error: "Data tidak ditemukan" };
  if (penarikan.status !== "PENDING") return { success: false, error: "Sudah diproses sebelumnya" };

  const updateData: any = { status, approved_by: currentUser.id, approved_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  if (status === "REJECTED") updateData.rejected_reason = catatan || "Ditolak oleh Bendahara";
  else updateData.catatan = catatan || null;

  const { error: updateError } = await supabase.from("penarikan_simpanan").update(updateData).eq("id", penarikanId);
  if (updateError) return { success: false, error: updateError.message };

  if (status === "APPROVED") {
    const { error: saldoError } = await updateSaldo(supabase, penarikan.user_id, Number(penarikan.nominal), "PENARIKAN");
    if (saldoError) return { success: false, error: "Gagal mengurangi saldo sukarela." };

    await supabase.from("simpanan").insert({
      user_id: penarikan.user_id,
      jenis: "PENARIKAN",
      nominal: penarikan.nominal,
      periode: formatPeriode(new Date().toISOString().split("T")[0]),
      tanggal: new Date().toISOString().split("T")[0],
      status: "APPROVED",
      keterangan: "Penarikan simpanan (Dicairkan)",
      created_by: currentUser.id,
      referensi_id: penarikanId,
    });
  }

  revalidatePath("/dashboard/simpanan");
  revalidatePath("/dashboard/simpanan/penarikan");
  return { success: true, message: status === "APPROVED" ? "✅ Penarikan dicairkan" : "❌ Penarikan ditolak" };
}

// =====================================================================
// GET LIST PENARIKAN
// =====================================================================

export async function getListPenarikan(status?: string) {
  await requireRole(["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS"]);
  const supabase = createServiceClient();

  let query = supabase.from("penarikan_simpanan").select(`id, nominal, catatan, status, tanggal_pengajuan, tanggal_pencairan, rejected_reason, approved_at, users!penarikan_simpanan_user_id_fkey(id, nik, nama, no_rekening, nama_bank)`).order("tanggal_pengajuan", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return { success: false, error: error.message, data: [] };
  return { success: true, data: data || [] };
}
