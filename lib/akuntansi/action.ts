"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

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
