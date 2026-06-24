"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { buatJurnalUmum } from "@/lib/akuntansi/actions";

// =====================================================================
// SCHEMAS
// =====================================================================

const SetoranSchema = z.object({
  user_id: z.string().uuid("User tidak valid"),
  nominal: z.coerce.number().min(1000, "Minimal setoran Rp 1.000"),
  jenis_simpanan: z.enum(["SIMPANAN_POKOK", "SIMPANAN_WAJIB", "SIMPANAN_SUKARELA"]),
  sumber_dana: z.enum(["101", "102-MND", "102-MAY", "102-BRIS"]).default("102-MND"),
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
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// =====================================================================
// HELPER: Update saldo simpanan (Keranjang Terpisah)
// =====================================================================
async function updateSaldo(
  supabase: any,
  userId: string,
  nominalMutasi: number,
  jenisTransaksi: "SIMPANAN_POKOK" | "SIMPANAN_WAJIB" | "SIMPANAN_SUKARELA" | "PENARIKAN"
) {
  const { data: existing } = await supabase
    .from("saldo_simpanan").select("*").eq("user_id", userId).maybeSingle();

  let pokok = Number(existing?.saldo_pokok || 0);
  let wajib = Number(existing?.saldo_wajib || 0);
  let sukarela = Number(existing?.saldo_sukarela || 0);

  if (jenisTransaksi === "SIMPANAN_POKOK") pokok += nominalMutasi;
  else if (jenisTransaksi === "SIMPANAN_WAJIB") wajib += nominalMutasi;
  else if (jenisTransaksi === "SIMPANAN_SUKARELA") sukarela += nominalMutasi;
  else if (jenisTransaksi === "PENARIKAN") sukarela -= nominalMutasi; // Hanya dari keranjang sukarela

  const total = pokok + wajib + sukarela;

  if (existing) {
    return supabase.from("saldo_simpanan").update({
      total_saldo: total, saldo_pokok: pokok,
      saldo_wajib: wajib, saldo_sukarela: sukarela,
      last_updated: new Date().toISOString(),
    }).eq("user_id", userId);
  } else {
    return supabase.from("saldo_simpanan").insert({
      user_id: userId, total_saldo: total,
      saldo_pokok: pokok, saldo_wajib: wajib,
      saldo_sukarela: sukarela, last_updated: new Date().toISOString(),
    });
  }
}

// =====================================================================
// GET: Semua Saldo Simpanan
// =====================================================================
export async function getAllSaldoSimpanan(search?: string) {
  await requireRole(["SUPERADMIN", "SEKRETARIS", "BENDAHARA", "KETUA"]);
  const supabase = createServiceClient();

  let query = supabase
    .from("users")
    .select("id, nik, nama, simpanan_wajib_bulanan, simpanan_sukarela_bulanan, is_active")
    .eq("is_active", true)
    .order("nama", { ascending: true });

  if (search) query = query.or(`nik.ilike.%${search}%,nama.ilike.%${search}%`);

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
      saldo_simpanan: [{
        total_saldo: saldo?.total_saldo || 0,
        saldo_pokok: saldo?.saldo_pokok || 0,
        saldo_wajib: saldo?.saldo_wajib || 0,
        saldo_sukarela: saldo?.saldo_sukarela || 0,
      }],
    };
  });

  return { success: true, data };
}

// =====================================================================
// GET: Saldo per Anggota
// =====================================================================
export async function getSaldoByUserId(userId: string) {
  await requireRole(["SUPERADMIN", "SEKRETARIS", "BENDAHARA", "KETUA", "ANGGOTA"]);
  const supabase = createServiceClient();

  const { data: saldo, error: saldoError } = await supabase
    .from("saldo_simpanan").select("*").eq("user_id", userId).single();
  if (saldoError) return { success: false, error: saldoError.message, data: null };

  const { data: user } = await supabase
    .from("users")
    .select("id, nik, nama, simpanan_wajib_bulanan, simpanan_sukarela_bulanan")
    .eq("id", userId).single();

  return { success: true, data: { saldo, user } };
}

// =====================================================================
// GET: Riwayat Mutasi Simpanan
// =====================================================================
export async function getRiwayatSimpanan(userId: string, limit = 20) {
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
// ACTION: Input Setoran Manual + JURNAL AKUNTANSI
// Perbaikan: sumber_dana dinamis (tidak lagi hard-code 102-MND)
// =====================================================================
export async function inputSetoran(formData: FormData) {
  const currentUser = await requireRole(["SUPERADMIN", "BENDAHARA"]);
  const supabase = createServiceClient();

  const raw = {
    user_id: (formData.get("user_id") as string)?.trim() || "",
    nominal: (formData.get("jumlah") as string) || "0",
    jenis_simpanan: (formData.get("jenis") as string)?.trim() || "SIMPANAN_WAJIB",
    sumber_dana: (formData.get("sumber_dana") as string)?.trim() || "102-MND",
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

  const { data: user } = await supabase
    .from("users").select("id, nama, nik").eq("id", data.user_id).single();
  if (!user) return { success: false, error: "Anggota tidak ditemukan" };

  // 1. Insert riwayat simpanan
  const { data: insertedRiwayat, error: insertError } = await supabase
    .from("simpanan").insert({
      user_id: data.user_id,
      jenis: "SETORAN",
      nominal: data.nominal,
      periode: periodeFinal,
      tanggal: tanggalFinal,
      status: "APPROVED",
      keterangan: data.keterangan || keteranganLabel[data.jenis_simpanan],
      created_by: currentUser.id,
    }).select("id").single();

  if (insertError) return { success: false, error: insertError.message };

  // 2. Update saldo keranjang
  const { error: saldoError } = await updateSaldo(
    supabase, data.user_id, data.nominal,
    data.jenis_simpanan as "SIMPANAN_POKOK" | "SIMPANAN_WAJIB" | "SIMPANAN_SUKARELA"
  );
  if (saldoError) return { success: false, error: saldoError.message };

  // 3. Jurnal akuntansi
  // Akun kredit sesuai jenis simpanan:
  //   SIMPANAN_POKOK   → 302 (Ekuitas - Simpanan Pokok)
  //   SIMPANAN_WAJIB   → 303 (Ekuitas - Simpanan Wajib)
  //   SIMPANAN_SUKARELA → 201 (Kewajiban - Simpanan Sukarela, bisa ditarik sewaktu-waktu)
  const akunKredit =
    data.jenis_simpanan === "SIMPANAN_POKOK" ? "302" :
    data.jenis_simpanan === "SIMPANAN_WAJIB" ? "303" : "201";

  await buatJurnalUmum({
    prefix_bukti: "DEP",
    tanggal_transaksi: tanggalFinal,
    keterangan: data.keterangan || `Setoran ${keteranganLabel[data.jenis_simpanan]} a/n ${user.nama}`,
    jenis_sumber: "SIMPANAN_MANUAL",
    id_sumber: insertedRiwayat?.id?.toString() || "",
    lines: [
      { kode_akun: data.sumber_dana, debit: data.nominal, kredit: 0, user_id: data.user_id }, // Kas/Bank sesuai pilihan
      { kode_akun: akunKredit, debit: 0, kredit: data.nominal, user_id: data.user_id },
    ],
  });

  revalidatePath("/dashboard/simpanan");
  revalidatePath(`/dashboard/simpanan/${data.user_id}`);
  revalidatePath("/dashboard/anggota");

  return {
    success: true,
    message: `✅ Setoran Rp ${data.nominal.toLocaleString("id-ID")} untuk ${user.nama} berhasil dicatat & Dijurnal!`,
  };
}

// =====================================================================
// ACTION: Setoran Bulanan Massal (Payroll) + JURNAL
// Perbaikan: idempotency jurnal via nomor_bukti fixed per periode
// =====================================================================
export async function inputSetoranBulananMassal(bulan: number, tahun: number) {
  const currentUser = await requireRole(["SUPERADMIN", "BENDAHARA"]);
  const supabase = createServiceClient();

  const tanggal = `${tahun}-${String(bulan).padStart(2, "0")}-25`;
  const periode = `${tahun}-${String(bulan).padStart(2, "0")}`;
  const namaBulan = new Date(tahun, bulan - 1).toLocaleString("id-ID", { month: "long", year: "numeric" });
  const nomorBuktiPayroll = `PRSIMP-${tahun}${String(bulan).padStart(2, "0")}`;

  // Idempotency: cegah eksekusi ganda periode yang sama
  const { data: existJurnal } = await supabase
    .from("jurnal_induk").select("id").eq("nomor_bukti", nomorBuktiPayroll).maybeSingle();
  if (existJurnal) {
    return { success: false, error: `Payroll Simpanan periode ${periode} sudah dieksekusi sebelumnya.` };
  }

  const { data: anggotaList, error } = await supabase
    .from("users")
    .select("id, nama, nik, simpanan_wajib_bulanan, simpanan_sukarela_bulanan")
    .eq("is_active", true);

  if (error || !anggotaList) return { success: false, error: "Gagal ambil data anggota" };

  let berhasilWajib = 0;
  let berhasilSukarela = 0;
  let dilewati = 0;
  let gagal = 0;
  let totalWajibTerkumpul = 0;
  let totalSukarelaTerkumpul = 0;

  for (const anggota of anggotaList) {
    const wajib = Number(anggota.simpanan_wajib_bulanan || 0);
    const sukarela = Number(anggota.simpanan_sukarela_bulanan || 0);
    if (wajib === 0 && sukarela === 0) continue;

    // Proses Simpanan Wajib
    if (wajib > 0) {
      const { data: existWajib } = await supabase
        .from("simpanan").select("id")
        .eq("user_id", anggota.id).eq("jenis", "SETORAN").eq("periode", periode)
        .ilike("keterangan", "%Wajib Bulanan%").maybeSingle();

      if (existWajib) {
        dilewati++;
      } else {
        const { error: errWajib } = await supabase.from("simpanan").insert({
          user_id: anggota.id, jenis: "SETORAN", nominal: wajib,
          periode, tanggal, status: "APPROVED",
          keterangan: `Simpanan Wajib Bulanan ${namaBulan}`,
          created_by: currentUser.id,
        });
        if (!errWajib) {
          await updateSaldo(supabase, anggota.id, wajib, "SIMPANAN_WAJIB");
          berhasilWajib++;
          totalWajibTerkumpul += wajib;
        } else {
          gagal++;
        }
      }
    }

    // Proses Simpanan Sukarela
    if (sukarela > 0) {
      const { data: existSukarela } = await supabase
        .from("simpanan").select("id")
        .eq("user_id", anggota.id).eq("jenis", "SETORAN").eq("periode", periode)
        .ilike("keterangan", "%Sukarela Bulanan%").maybeSingle();

      if (!existSukarela) {
        const { error: errSukarela } = await supabase.from("simpanan").insert({
          user_id: anggota.id, jenis: "SETORAN", nominal: sukarela,
          periode, tanggal, status: "APPROVED",
          keterangan: `Simpanan Sukarela Bulanan ${namaBulan}`,
          created_by: currentUser.id,
        });
        if (!errSukarela) {
          await updateSaldo(supabase, anggota.id, sukarela, "SIMPANAN_SUKARELA");
          berhasilSukarela++;
          totalSukarelaTerkumpul += sukarela;
        } else {
          gagal++;
        }
      }
    }
  }

  // Jurnal massal satu entri per periode (idempotent via nomor_bukti fixed)
  const totalPayrollSimpanan = totalWajibTerkumpul + totalSukarelaTerkumpul;

  if (totalPayrollSimpanan > 0) {
    const lines: { kode_akun: string; debit: number; kredit: number }[] = [
      { kode_akun: "102-MND", debit: totalPayrollSimpanan, kredit: 0 },
    ];
    if (totalWajibTerkumpul > 0)
      lines.push({ kode_akun: "303", debit: 0, kredit: totalWajibTerkumpul });
    if (totalSukarelaTerkumpul > 0)
      lines.push({ kode_akun: "201", debit: 0, kredit: totalSukarelaTerkumpul });

    await buatJurnalUmum({
      nomor_bukti: nomorBuktiPayroll,
      tanggal_transaksi: tanggal,
      keterangan: `Pemotongan Massal Payroll Simpanan ${namaBulan}`,
      jenis_sumber: "PAYROLL_MASSAL",
      id_sumber: periode,
      lines,
    });
  }

  revalidatePath("/dashboard/simpanan");
  revalidatePath("/dashboard/anggota");

  return {
    success: true,
    message: `✅ Payroll ${namaBulan} selesai & Jurnal Tercatat! Wajib: ${berhasilWajib}, Sukarela: ${berhasilSukarela}${gagal > 0 ? `, Gagal: ${gagal}` : ''}.`,
  };
}

// =====================================================================
// ACTION: Pengajuan Penarikan
// =====================================================================
export async function ajukanPenarikan(formData: FormData) {
  const currentUser = await requireRole(["ANGGOTA", "SEKRETARIS", "BENDAHARA", "KETUA", "SUPERADMIN"]);

  if (currentUser.role === "ANGGOTA") {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    const currentMinute = now.getHours() * 60 + now.getMinutes();
    if (now.getDay() === 5 && currentMinute >= 9 * 60 && currentMinute < 15 * 60) {
      return { success: false, error: "Gagal: Sedang dalam masa cut-off mingguan (Jumat 09:00 - 15:00 WIB)." };
    }
  }

  const supabase = createServiceClient();
  const parsed = PenarikanSchema.safeParse({
    nominal: (formData.get("nominal") as string) || "0",
    catatan: (formData.get("catatan") as string)?.trim() || "",
  });
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const { data: saldo } = await supabase
    .from("saldo_simpanan").select("saldo_sukarela").eq("user_id", currentUser.id).single();

  if (!saldo || Number(saldo.saldo_sukarela) < parsed.data.nominal) {
    return {
      success: false,
      error: `Penarikan Ditolak. Saldo Sukarela yang bisa ditarik: Rp ${Number(saldo?.saldo_sukarela || 0).toLocaleString("id-ID")}`,
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
  return {
    success: true,
    message: `✅ Pengajuan penarikan Rp ${parsed.data.nominal.toLocaleString("id-ID")} berhasil dikirim.`,
  };
}

// =====================================================================
// ACTION: Approve / Reject Penarikan + JURNAL AKUNTANSI
// Perbaikan: nomor bukti sequential via prefix_bukti
// =====================================================================
export async function updateStatusPenarikan(
  penarikanId: string,
  status: "APPROVED" | "REJECTED",
  catatan?: string
) {
  const currentUser = await requireRole(["SUPERADMIN", "BENDAHARA"]);
  const supabase = createServiceClient();

  const { data: penarikan } = await supabase
    .from("penarikan_simpanan").select("*").eq("id", penarikanId).single();
  if (!penarikan) return { success: false, error: "Data tidak ditemukan" };
  if (penarikan.status !== "PENDING") return { success: false, error: "Sudah diproses sebelumnya" };

  const updateData: any = {
    status,
    approved_by: currentUser.id,
    approved_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  if (status === "REJECTED") updateData.rejected_reason = catatan || "Ditolak oleh Bendahara";
  else updateData.catatan = catatan || null;

  const { error: updateError } = await supabase
    .from("penarikan_simpanan").update(updateData).eq("id", penarikanId);
  if (updateError) return { success: false, error: updateError.message };

  if (status === "APPROVED") {
    const tanggalHariIni = new Date().toISOString().split("T")[0];

    // 1. Potong saldo sukarela
    const { error: saldoError } = await updateSaldo(
      supabase, penarikan.user_id, Number(penarikan.nominal), "PENARIKAN"
    );
    if (saldoError) return { success: false, error: "Gagal mengurangi saldo sukarela." };

    // 2. Catat riwayat ke tabel simpanan
    await supabase.from("simpanan").insert({
      user_id: penarikan.user_id,
      jenis: "PENARIKAN",
      nominal: penarikan.nominal,
      periode: formatPeriode(tanggalHariIni),
      tanggal: tanggalHariIni,
      status: "APPROVED",
      keterangan: "Penarikan simpanan sukarela (Dicairkan)",
      created_by: currentUser.id,
      referensi_id: penarikanId,
    });

    // 3. Jurnal akuntansi — nomor bukti sequential via prefix
    await buatJurnalUmum({
      prefix_bukti: "WD",
      tanggal_transaksi: tanggalHariIni,
      keterangan: catatan || "Pencairan Penarikan Simpanan Sukarela",
      jenis_sumber: "MANUAL",
      id_sumber: penarikanId,
      lines: [
        { kode_akun: "201", debit: Number(penarikan.nominal), kredit: 0, user_id: penarikan.user_id }, // Kewajiban berkurang
        { kode_akun: "102-MND", debit: 0, kredit: Number(penarikan.nominal), user_id: penarikan.user_id }, // Kas keluar
      ],
    });
  }

  revalidatePath("/dashboard/simpanan");
  revalidatePath("/dashboard/simpanan/penarikan");
  return {
    success: true,
    message: status === "APPROVED" ? "✅ Penarikan dicairkan & Dijurnal" : "❌ Penarikan ditolak",
  };
}

// =====================================================================
// GET: List Penarikan
// =====================================================================
export async function getListPenarikan(status?: string) {
  await requireRole(["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS"]);
  const supabase = createServiceClient();

  let query = supabase
    .from("penarikan_simpanan")
    .select(`
      id, nominal, catatan, status, tanggal_pengajuan,
      tanggal_pencairan, rejected_reason, approved_at,
      users!penarikan_simpanan_user_id_fkey(id, nik, nama, no_rekening, nama_bank)
    `)
    .order("tanggal_pengajuan", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return { success: false, error: error.message, data: [] };
  return { success: true, data: data || [] };
}
