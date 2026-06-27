"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// =====================================================================
// HELPER: GENERATE NOMOR BUKTI JURNAL SEQUENTIAL
// Format: PREFIX-YYYYMM-0001
// Sumber: tabel jurnal_induk
// =====================================================================
export async function generateNomorBukti(prefix: string, tanggal: string) {
  const supabase = createServiceClient();
  const dateObj = new Date(tanggal);
  const yyyymm = `${dateObj.getFullYear()}${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
  const searchPrefix = `${prefix}-${yyyymm}-`;

  const { data } = await supabase
    .from("jurnal_induk")
    .select("nomor_bukti")
    .like("nomor_bukti", `${searchPrefix}%`)
    .order("nomor_bukti", { ascending: false })
    .limit(1);

  let seq = 1;
  if (data && data.length > 0) {
    const lastSeqStr = data[0].nomor_bukti.split("-").pop();
    seq = parseInt(lastSeqStr || "0") + 1;
  }
  return `${searchPrefix}${String(seq).padStart(4, "0")}`;
}

// =====================================================================
// HELPER: GENERATE NOMOR KONTRAK PINJAMAN SEQUENTIAL
// Format: CTR-YYYYMM-0001
// Sumber: tabel pinjaman (bukan jurnal_induk)
// =====================================================================
export async function generateNomorKontrak(tanggal: string) {
  const supabase = createServiceClient();
  const dateObj = new Date(tanggal);
  const yyyymm = `${dateObj.getFullYear()}${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
  const searchPrefix = `CTR-${yyyymm}-`;

  const { data } = await supabase
    .from("pinjaman")
    .select("nomor_kontrak")
    .like("nomor_kontrak", `${searchPrefix}%`)
    .order("nomor_kontrak", { ascending: false })
    .limit(1);

  let seq = 1;
  if (data && data.length > 0) {
    const lastSeqStr = data[0].nomor_kontrak.split("-").pop();
    seq = parseInt(lastSeqStr || "0") + 1;
  }
  return `${searchPrefix}${String(seq).padStart(4, "0")}`;
}

// =====================================================================
// CORE ENGINE: BUAT JURNAL UMUM (ATOMIC & IDEMPOTENT)
// =====================================================================
interface JurnalLineInput {
  kode_akun: string;
  debit: number;
  kredit: number;
  user_id?: string;
}

interface BuatJurnalInput {
  nomor_bukti?: string;
  prefix_bukti?: string; // Auto-generate nomor bukti sequential
  tanggal_transaksi: string;
  keterangan: string;
  jenis_sumber: string;
  id_sumber?: string;
  lines: JurnalLineInput[];
}

export async function buatJurnalUmum(input: BuatJurnalInput) {
  const session = await requireRole(["BENDAHARA", "SUPERADMIN", "SEKRETARIS"]);
  const supabase = createServiceClient();

  const { prefix_bukti, tanggal_transaksi, keterangan, jenis_sumber, id_sumber, lines } = input;

  // 1. Validasi Balance
  const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
  const totalKredit = lines.reduce((s, l) => s + l.kredit, 0);

  if (Math.round(totalDebit) !== Math.round(totalKredit)) {
    return {
      success: false,
      error: `Jurnal Unbalanced! Debit: ${totalDebit.toLocaleString("id-ID")}, Kredit: ${totalKredit.toLocaleString("id-ID")}`,
    };
  }

  try {
    // 2. Tentukan Nomor Bukti
    let finalNomorBukti = input.nomor_bukti;
    if (prefix_bukti) {
      finalNomorBukti = await generateNomorBukti(prefix_bukti, tanggal_transaksi);
    }
    if (!finalNomorBukti) return { success: false, error: "Nomor bukti atau prefix_bukti harus diisi." };

    // 3. Idempotency — cegah jurnal ganda
    const { data: exist } = await supabase
      .from("jurnal_induk")
      .select("id")
      .eq("nomor_bukti", finalNomorBukti)
      .maybeSingle();

    if (exist) {
      return { success: true, jurnalIndukId: exist.id, message: "Jurnal sudah ada (Idempotent)." };
    }

    // 4. Map kode_akun → akun_id
    const { data: listAkun } = await supabase.from("akun_perkiraan").select("id, kode_akun");
    if (!listAkun) return { success: false, error: "Gagal mengambil Chart of Accounts." };

    const akunMap = new Map(listAkun.map((a) => [a.kode_akun, a.id]));

    const formattedLines = lines.map((line) => {
      const akunId = akunMap.get(line.kode_akun);
      if (!akunId) throw new Error(`Kode akun '${line.kode_akun}' tidak ditemukan di COA.`);
      return {
        akun_id: akunId,
        debit: line.debit,
        kredit: line.kredit,
        user_id: line.user_id || null,
      };
    });

    // 5. Atomic insert via stored procedure
    const { data: rpcData, error: rpcError } = await supabase.rpc("insert_jurnal_atomic", {
      p_nomor_bukti: finalNomorBukti,
      p_tanggal: tanggal_transaksi,
      p_keterangan: keterangan,
      p_jenis_sumber: jenis_sumber,
      p_id_sumber: id_sumber || null,
      p_created_by: session.id,
      p_lines: formattedLines,
    });

    if (rpcError) throw new Error(`Database Error: ${rpcError.message}`);

    revalidatePath("/dashboard/akuntansi");
    return { success: true, jurnalIndukId: rpcData };
  } catch (err: any) {
    return { success: false, error: err.message || "Terjadi kesalahan sistem akuntansi." };
  }
}

// =====================================================================
// AMBIL DATA COA
// =====================================================================
export async function getChartOfAccounts() {
  await requireRole(["BENDAHARA", "SUPERADMIN", "SEKRETARIS", "KETUA"]);
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("akun_perkiraan")
    .select("*")
    .order("kode_akun", { ascending: true });
  return { data: data || [], error: error?.message || null };
}

// =====================================================================
// ACTION: TOP-UP KAS KECIL (TARIK TUNAI DARI BANK)
// =====================================================================
const TopUpSchema = z.object({
  nominal: z.coerce.number().min(1000, "Minimal tarik tunai Rp 1.000"),
  sumber_bank: z.string().min(1, "Sumber bank wajib dipilih"),
  tanggal: z.string(),
  keterangan: z.string().optional(),
});

export async function topUpKasKecil(formData: FormData) {
  await requireRole(["BENDAHARA", "SUPERADMIN"]);

  const parsed = TopUpSchema.safeParse({
    nominal: formData.get("nominal"),
    sumber_bank: formData.get("sumber_bank") || "102-MND",
    tanggal: formData.get("tanggal") || new Date().toISOString().split("T")[0],
    keterangan: formData.get("keterangan") || "Tarik tunai untuk pengisian Kas Kecil",
  });
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const { nominal, sumber_bank, tanggal, keterangan } = parsed.data;

  return buatJurnalUmum({
    prefix_bukti: "CASHTOPUP",
    tanggal_transaksi: tanggal,
    keterangan: keterangan || "Tarik tunai untuk pengisian Kas Kecil",
    jenis_sumber: "MANUAL",
    lines: [
      { kode_akun: "101", debit: nominal, kredit: 0 },
      { kode_akun: sumber_bank, debit: 0, kredit: nominal },
    ],
  });
}

// =====================================================================
// ACTION: PENGELUARAN BIAYA OPERASIONAL
// =====================================================================
const PengeluaranSchema = z.object({
  nominal: z.coerce.number().min(500, "Minimal pengeluaran Rp 500"),
  akun_biaya: z.string().min(1, "Jenis biaya wajib dipilih"),
  sumber_dana: z.enum(["101", "102-MND", "102-MAY", "102-BRIS"]),
  tanggal: z.string(),
  keterangan: z.string().min(3, "Keterangan pengeluaran wajib diisi"),
});

export async function catatPengeluaranOperasional(formData: FormData) {
  await requireRole(["BENDAHARA", "SUPERADMIN"]);

  const parsed = PengeluaranSchema.safeParse({
    nominal: formData.get("nominal"),
    akun_biaya: formData.get("akun_biaya"),
    sumber_dana: formData.get("sumber_dana") || "101",
    tanggal: formData.get("tanggal") || new Date().toISOString().split("T")[0],
    keterangan: formData.get("keterangan"),
  });
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const { nominal, akun_biaya, sumber_dana, tanggal, keterangan } = parsed.data;

  return buatJurnalUmum({
    prefix_bukti: "EXP",
    tanggal_transaksi: tanggal,
    keterangan,
    jenis_sumber: "MANUAL",
    lines: [
      { kode_akun: akun_biaya, debit: nominal, kredit: 0 },
      { kode_akun: sumber_dana, debit: 0, kredit: nominal },
    ],
  });
}

// =====================================================================
// ACTION: CATAT PEMASUKAN / PENDAPATAN LAINNYA
// =====================================================================
const PendapatanSchema = z.object({
  nominal: z.coerce.number().min(500, "Minimal pendapatan Rp 500"),
  akun_pendapatan: z.string().min(1, "Jenis pendapatan wajib dipilih"),
  tujuan_dana: z.enum(["101", "102-MND", "102-MAY", "102-BRIS"]),
  tanggal: z.string(),
  keterangan: z.string().min(3, "Keterangan pendapatan wajib diisi"),
});

export async function catatPendapatanLain(formData: FormData) {
  await requireRole(["BENDAHARA", "SUPERADMIN"]);

  const parsed = PendapatanSchema.safeParse({
    nominal: formData.get("nominal"),
    akun_pendapatan: formData.get("akun_pendapatan"),
    tujuan_dana: formData.get("tujuan_dana") || "102-MND",
    tanggal: formData.get("tanggal") || new Date().toISOString().split("T")[0],
    keterangan: formData.get("keterangan"),
  });
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const { nominal, akun_pendapatan, tujuan_dana, tanggal, keterangan } = parsed.data;

  return buatJurnalUmum({
    prefix_bukti: "INC",
    tanggal_transaksi: tanggal,
    keterangan,
    jenis_sumber: "MANUAL",
    lines: [
      { kode_akun: tujuan_dana, debit: nominal, kredit: 0 },
      { kode_akun: akun_pendapatan, debit: 0, kredit: nominal },
    ],
  });
}

// =====================================================================
// GET LAPORAN JURNAL UMUM (dengan filter periode opsional)
// =====================================================================
export async function getJurnalUmum(
  limit = 100,
  startDate?: string,
  endDate?: string
) {
  await requireRole(["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS"]);
  const supabase = createServiceClient();

  let query = supabase
    .from("jurnal_induk")
    .select(`
      id, nomor_bukti, tanggal_transaksi, keterangan, jenis_sumber, created_at,
      jurnal_rincian (
        id, debit, kredit,
        akun_perkiraan ( kode_akun, nama_akun )
      )
    `)
    .order("tanggal_transaksi", { ascending: false })
    .order("created_at", { ascending: false });

  if (startDate) query = query.gte("tanggal_transaksi", startDate);
  if (endDate) query = query.lte("tanggal_transaksi", endDate);

  const { data, error } = await query.limit(limit);
  return { data: data || [], error: error?.message };
}

// =====================================================================
// GET NERACA SALDO (TRIAL BALANCE) DENGAN FILTER PERIODE
// =====================================================================
export async function getNeracaSaldo(startDate?: string, endDate?: string) {
  await requireRole(["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS"]);
  const supabase = createServiceClient();

  const { data: accounts } = await supabase
    .from("akun_perkiraan")
    .select("id, kode_akun, nama_akun, tipe_akun, saldo_normal")
    .order("kode_akun", { ascending: true });

  if (!accounts) return { data: [] };

  let indukQuery = supabase
    .from("jurnal_induk")
    .select("id")
    .gte("tanggal_transaksi", startDate ?? "1900-01-01")
    .lte("tanggal_transaksi", endDate ?? "9999-12-31");

  const { data: indukList } = await indukQuery;
  const indukIds = indukList?.map((i) => i.id) ?? [];

  let rincian: { akun_id: string; debit: number; kredit: number }[] = [];

  if (indukIds.length > 0) {
    const { data } = await supabase
      .from("jurnal_rincian")
      .select("akun_id, debit, kredit")
      .in("jurnal_induk_id", indukIds);
    rincian = data ?? [];
  }

  const neraca = accounts.map((akun) => {
    const trxs = rincian.filter((r) => r.akun_id === akun.id);
    const totalDebit = trxs.reduce((s, t) => s + Number(t.debit), 0);
    const totalKredit = trxs.reduce((s, t) => s + Number(t.kredit), 0);

    const saldo_akhir =
      akun.saldo_normal === "DEBIT"
        ? totalDebit - totalKredit
        : totalKredit - totalDebit;

    return { ...akun, total_debit: totalDebit, total_kredit: totalKredit, saldo_akhir };
  });

  return {
    data: neraca.filter((n) => n.total_debit > 0 || n.total_kredit > 0 || n.saldo_akhir !== 0),
  };
}
