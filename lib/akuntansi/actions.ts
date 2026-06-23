"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

interface JurnalLineInput {
  kode_akun: string; // Contoh: '111', '102-MND'
  debit: number;
  kredit: number;
  user_id?: string;  // Sub-ledger opsional per anggota koperasi
}

interface BuatJurnalInput {
  nomor_bukti: string;      // Contoh: 'PINJ-20260601', 'PAY-BULANAN'
  tanggal_transaksi: string; // Format: 'YYYY-MM-DD'
  keterangan: string;
  jenis_sumber: 'PINJAMAN_CAIR' | 'PAYROLL_MASSAL' | 'MANUAL' | 'RESIGN' | 'SIMPANAN_MANUAL';
  id_sumber?: string;        // ID baris pinjaman/simpanan terkait
  lines: JurnalLineInput[];
}

/**
 * CORE ENGINE: Fungsi Global Pembuat Jurnal Umum Double-Entry
 */
export async function buatJurnalUmum(input: BuatJurnalInput) {
  // Hanya pengurus keuangan dan superadmin yang bisa memicu jurnal
  const session = await requireRole(["BENDAHARA", "SUPERADMIN", "SEKRETARIS"]);
  const supabase = createServiceClient();

  const { nomor_bukti, tanggal_transaksi, keterangan, jenis_sumber, id_sumber, lines } = input;

  // 1. Validasi Keamanan: Hitung total Balance
  let totalDebit = 0;
  let totalKredit = 0;

  for (const line of lines) {
    totalDebit += line.debit;
    totalKredit += line.kredit;
  }

  if (Math.round(totalDebit) !== Math.round(totalKredit)) {
    return {
      success: false,
      error: `Jurnal tidak seimbang (Unbalanced)! Total Debit: Rp ${totalDebit.toLocaleString()}, Total Kredit: Rp ${totalKredit.toLocaleString()}`,
    };
  }

  try {
    // 2. Ambil semua data akun perkiraan untuk mencocokkan kode_akun -> akun_id
    const { data: listAkun, error: akunError } = await supabase
      .from("akun_perkiraan")
      .select("id, kode_akun");

    if (akunError || !listAkun) {
      return { success: false, error: "Gagal mengambil master Chart of Accounts." };
    }

    const akunMap = new Map(listAkun.map((a) => [a.kode_akun, a.id]));

    // 3. Masukkan ke tabel induk (jurnal_induk)
    const { data: induk, error: headerError } = await supabase
      .from("jurnal_induk")
      .insert({
        nomor_bukti,
        tanggal_transaksi,
        keterangan,
        jenis_sumber,
        id_sumber,
        created_by: session.id,
      })
      .select("id")
      .single();

    if (headerError || !induk) {
      // Jika nomor bukti duplikat atau gagal insert
      return { success: false, error: `Gagal mencatat induk jurnal: ${headerError?.message}` };
    }

    // 4. Siapkan data baris rincian (jurnal_rincian)
    const rincianRows = lines.map((line) => {
      const akunId = akunMap.get(line.kode_akun);
      if (!akunId) {
        throw new Error(`Kode akun '${line.kode_akun}' tidak ditemukan di master perkiraan.`);
      }

      return {
        jurnal_induk_id: induk.id,
        akun_id: akunId,
        debit: line.debit,
        kredit: line.kredit,
        user_id: line.user_id || null,
      };
    });

    // 5. Masukkan rincian secara massal (bulk insert)
    const { error: linesError } = await supabase
      .from("jurnal_rincian")
      .insert(rincianRows);

    if (linesError) {
      // Rollback manual dengan menghapus header jika lines gagal (opsional karena di sub-query)
      await supabase.from("jurnal_induk").delete().eq("id", induk.id);
      return { success: false, error: `Gagal mencatat rincian jurnal: ${linesError.message}` };
    }

    revalidatePath("/dashboard/akuntansi");
    return { success: true, jurnalIndukId: induk.id };

  } catch (err: any) {
    return { success: false, error: err.message || "Terjadi kesalahan sistem akuntansi." };
  }
}

/**
 * AMBIL DATA DAFTAR COA (Untuk Dropdown Form Manual dll)
 */
export async function getChartOfAccounts() {
  await requireRole(["BENDAHARA", "SUPERADMIN", "SEKRETARIS", "KETUA"]);
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("akun_perkiraan")
    .select("*")
    .order("kode_akun", { ascending: true });

  return { data: data || [], error: error?.message || null };
}
// ==// =====================================================================
// 1. ACTION: TOP-UP KAS KECIL (TARIK TUNAI DARI BANK)
// =====================================================================

const TopUpSchema = z.object({
  nominal: z.coerce.number().min(1000, "Minimal tarik tunai Rp 1.000"),
  sumber_bank: z.string().min(1, "Sumber bank wajib dipilih"), // Contoh: '102-MND'
  tanggal: z.string(),
  keterangan: z.string().optional() // TypeScript menganggap ini bisa 'undefined'
});

export async function topUpKasKecil(formData: FormData) {
  const session = await requireRole(["BENDAHARA", "SUPERADMIN"]);
  
  const raw = {
    nominal: formData.get("nominal"),
    sumber_bank: formData.get("sumber_bank") as string || "102-MND",
    tanggal: (formData.get("tanggal") as string) || new Date().toISOString().split("T")[0],
    keterangan: formData.get("keterangan") as string || "Tarik tunai untuk pengisian Kas Kecil"
  };

  const parsed = TopUpSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const { nominal, sumber_bank, tanggal, keterangan } = parsed.data;

  // Panggil Core Engine Jurnal
  const result = await buatJurnalUmum({
    nomor_bukti: `CASHTOPUP-${Date.now()}`,
    tanggal_transaksi: tanggal,
    // PERBAIKAN DI SINI: Kita beri nilai default jika keterangan undefined
    keterangan: keterangan || "Tarik tunai untuk pengisian Kas Kecil", 
    jenis_sumber: 'MANUAL',
    lines: [
      { kode_akun: '101', debit: nominal, kredit: 0 },         // Kas Tunai Bertambah
      { kode_akun: sumber_bank, debit: 0, kredit: nominal }    // Saldo Bank Berkurang
    ]
  });

  return result;
}


// =====================================================================
// 2. ACTION: PENGELUARAN BIAYA OPERASIONAL
// =====================================================================

const PengeluaranSchema = z.object({
  nominal: z.coerce.number().min(500, "Minimal pengeluaran Rp 500"),
  akun_biaya: z.string().min(1, "Jenis biaya wajib dipilih"), // Contoh: '501', '504', '505'
  sumber_dana: z.enum(['101', '102-MND', '102-MAY', '102-BRIS']), // Pakai kas tunai atau transfer bank?
  tanggal: z.string(),
  keterangan: z.string().min(3, "Keterangan pengeluaran wajib diisi")
});

export async function catatPengeluaranOperasional(formData: FormData) {
  const session = await requireRole(["BENDAHARA", "SUPERADMIN"]);
  
  const raw = {
    nominal: formData.get("nominal"),
    akun_biaya: formData.get("akun_biaya") as string,
    sumber_dana: formData.get("sumber_dana") as string || "101", // Default pakai uang laci (Kas Tunai)
    tanggal: (formData.get("tanggal") as string) || new Date().toISOString().split("T")[0],
    keterangan: formData.get("keterangan") as string
  };

  const parsed = PengeluaranSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const { nominal, akun_biaya, sumber_dana, tanggal, keterangan } = parsed.data;

  // Panggil Core Engine Jurnal
  const result = await buatJurnalUmum({
    nomor_bukti: `EXP-${Date.now()}`,
    tanggal_transaksi: tanggal,
    keterangan: keterangan,
    jenis_sumber: 'MANUAL',
    lines: [
      { kode_akun: akun_biaya, debit: nominal, kredit: 0 },      // Biaya Bertambah (Debit)
      { kode_akun: sumber_dana, debit: 0, kredit: nominal }      // Harta Berkurang (Kredit)
    ]
  });

  return result;
}
