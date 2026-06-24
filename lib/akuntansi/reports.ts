"use server";
import { createServiceClient } from "@/lib/supabase/server";

// =====================================================================
// GET LAPORAN LABA RUGI (INCOME STATEMENT)
// =====================================================================
export async function getLaporanLabaRugi(periodeBulan: string, periodeTahun: string) {
  const supabase = createServiceClient();
  
  // Ambil semua detail jurnal pada periode tersebut
  const { data: jurnalDetails } = await supabase
    .from('jurnal_detail')
    .select(`
      debit, kredit,
      akun:kode_akun (kode_akun, nama_akun, tipe_akun)
    `)
    // Filter berdasarkan kepala 4 (Pendapatan) dan 5 (Beban)
    .ilike('kode_akun', '4%') // Pendapatan
    .or(`kode_akun.ilike.5%`); // Beban

  let totalPendapatan = 0;
  let totalBeban = 0;

  jurnalDetails?.forEach((baris: any) => {
    if (baris.akun.kode_akun.startsWith('4')) {
      // Saldo Normal Pendapatan = Kredit - Debit
      totalPendapatan += (baris.kredit - baris.debit);
    } else if (baris.akun.kode_akun.startsWith('5')) {
      // Saldo Normal Beban = Debit - Kredit
      totalBeban += (baris.debit - baris.kredit);
    }
  });

  const labaBersih = totalPendapatan - totalBeban;

  return { totalPendapatan, totalBeban, labaBersih };
}

// =====================================================================
// GET NERACA (BALANCE SHEET)
// =====================================================================
// Logika yang sama diterapkan untuk Aset (Kepala 1), Kewajiban (Kepala 2), Modal (Kepala 3).
// Ingat Rumus Neraca: TOTAL ASET = TOTAL KEWAJIBAN + TOTAL MODAL + LABA BERSIH TAHUN BERJALAN.
