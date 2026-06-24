"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";

// =====================================================================
// TYPES
// =====================================================================

export interface AkunSaldo {
  id: string;
  kode_akun: string;
  nama_akun: string;
  tipe_akun: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
  saldo_normal: "DEBIT" | "KREDIT";
  total_debit: number;
  total_kredit: number;
  saldo_akhir: number;
}

export interface LaporanLabaRugi {
  periode_label: string;
  pendapatan: AkunSaldo[];
  total_pendapatan: number;
  beban: AkunSaldo[];
  total_beban: number;
  shu_bersih: number;
}

export interface NerацaItem {
  kode_akun: string;
  nama_akun: string;
  saldo_akhir: number;
}

export interface LaporanNeraca {
  per_tanggal: string;
  aset: {
    lancar: NerацaItem[];
    total_aset: number;
  };
  kewajiban: {
    items: NerацaItem[];
    total_kewajiban: number;
  };
  ekuitas: {
    items: NerацaItem[];
    shu_berjalan: number;
    total_ekuitas: number;
  };
  total_kewajiban_ekuitas: number;
  is_balanced: boolean;
}

export interface DashboardStats {
  total_aset: number;
  total_kas_bank: number;
  total_piutang: number;
  total_simpanan_pokok: number;
  total_simpanan_wajib: number;
  total_simpanan_sukarela: number;
  total_outstanding_pinjaman: number;
  total_pinjaman_aktif: number;
  shu_tahun_berjalan: number;
  periode_label: string;
}

// =====================================================================
// HELPER: Ambil saldo semua akun untuk periode tertentu
// =====================================================================
async function getSaldoAkun(
  supabase: any,
  startDate: string,
  endDate: string
): Promise<AkunSaldo[]> {
  const { data: accounts } = await supabase
    .from("akun_perkiraan")
    .select("id, kode_akun, nama_akun, tipe_akun, saldo_normal")
    .order("kode_akun", { ascending: true });

  if (!accounts) return [];

  const { data: indukList } = await supabase
    .from("jurnal_induk")
    .select("id")
    .gte("tanggal_transaksi", startDate)
    .lte("tanggal_transaksi", endDate);

  const indukIds = indukList?.map((i: any) => i.id) ?? [];
  let rincian: { akun_id: string; debit: number; kredit: number }[] = [];

  // Proteksi: Hanya panggil rincian jika ada induk (mencegah error .in array kosong di Supabase)
  if (indukIds.length > 0) {
    const { data } = await supabase
      .from("jurnal_rincian")
      .select("akun_id, debit, kredit")
      .in("jurnal_induk_id", indukIds);
    rincian = data ?? [];
  }

  return accounts.map((akun: any) => {
    const trxs = rincian.filter((r) => r.akun_id === akun.id);
    // Proteksi fallback ke 0 jika database mengembalikan nilai null/undefined
    const totalDebit = trxs.reduce((s: number, t: any) => s + Number(t.debit || 0), 0);
    const totalKredit = trxs.reduce((s: number, t: any) => s + Number(t.kredit || 0), 0);
    
    const saldo_akhir =
      akun.saldo_normal === "DEBIT"
        ? totalDebit - totalKredit
        : totalKredit - totalDebit;

    return {
      ...akun,
      total_debit: totalDebit,
      total_kredit: totalKredit,
      saldo_akhir,
    };
  });
}

// =====================================================================
// GET LAPORAN LABA RUGI
// =====================================================================
export async function getLaporanLabaRugi(
  tahun: number,
  startDate?: string,
  endDate?: string
): Promise<{ data: LaporanLabaRugi | null; error: string | null }> {
  await requireRole(["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS"]);
  const supabase = createServiceClient();

  // Pastikan tahun adalah angka valid (fallback ke tahun berjalan jika NaN)
  const safeTahun = isNaN(tahun) ? new Date().getFullYear() : tahun;
  const start = startDate ?? `${safeTahun}-01-01`;
  const end = endDate ?? `${safeTahun}-12-31`;

  const akunSaldo = await getSaldoAkun(supabase, start, end);

  const pendapatan = akunSaldo.filter((a) => a.tipe_akun === "REVENUE" && a.saldo_akhir !== 0);
  const beban = akunSaldo.filter((a) => a.tipe_akun === "EXPENSE" && a.saldo_akhir !== 0);

  const total_pendapatan = pendapatan.reduce((s, a) => s + a.saldo_akhir, 0);
  const total_beban = beban.reduce((s, a) => s + a.saldo_akhir, 0);
  const shu_bersih = total_pendapatan - total_beban;

  // Proteksi Try-Catch agar Invalid Date tidak membuat server crash (Error 500)
  let bulanStartLabel = start;
  let bulanEndLabel = end;
  try {
    bulanStartLabel = new Date(start).toLocaleString("id-ID", { month: "long", year: "numeric" });
    bulanEndLabel = new Date(end).toLocaleString("id-ID", { month: "long", year: "numeric" });
  } catch (error) {
    console.error("Kesalahan format tanggal Laba Rugi:", error);
  }

  const periode_label = start === `${safeTahun}-01-01` && end === `${safeTahun}-12-31`
    ? `Tahun ${safeTahun}`
    : `${bulanStartLabel} s.d. ${bulanEndLabel}`;

  return {
    data: { periode_label, pendapatan, total_pendapatan, beban, total_beban, shu_bersih },
    error: null,
  };
}

// =====================================================================
// GET NERACA (BALANCE SHEET)
// =====================================================================
export async function getLaporanNeraca(
  perTanggal: string
): Promise<{ data: LaporanNeraca | null; error: string | null }> {
  await requireRole(["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS"]);
  const supabase = createServiceClient();

  // Validasi keamanan tanggal (Mencegah input string kosong/salah dari URL param)
  let validDate = new Date(perTanggal);
  if (isNaN(validDate.getTime())) {
    validDate = new Date(); // Paksa ke tanggal hari ini jika invalid
  }
  const safePerTanggal = validDate.toISOString().split("T")[0];
  const tahunIni = validDate.getFullYear();

  const akunSaldo = await getSaldoAkun(supabase, "1900-01-01", safePerTanggal);
  const labaRugi = await getLaporanLabaRugi(tahunIni, `${tahunIni}-01-01`, safePerTanggal);
  const shu_berjalan = labaRugi.data?.shu_bersih ?? 0;

  const aset = akunSaldo
    .filter((a) => a.tipe_akun === "ASSET" && a.saldo_akhir !== 0)
    .map((a) => ({ kode_akun: a.kode_akun, nama_akun: a.nama_akun, saldo_akhir: a.saldo_akhir }));

  const kewajiban = akunSaldo
    .filter((a) => a.tipe_akun === "LIABILITY" && a.saldo_akhir !== 0)
    .map((a) => ({ kode_akun: a.kode_akun, nama_akun: a.nama_akun, saldo_akhir: a.saldo_akhir }));

  const ekuitas = akunSaldo
    .filter((a) => a.tipe_akun === "EQUITY" && a.saldo_akhir !== 0)
    .map((a) => ({ kode_akun: a.kode_akun, nama_akun: a.nama_akun, saldo_akhir: a.saldo_akhir }));

  const total_aset = aset.reduce((s, a) => s + a.saldo_akhir, 0);
  const total_kewajiban = kewajiban.reduce((s, a) => s + a.saldo_akhir, 0);
  const total_ekuitas_coa = ekuitas.reduce((s, a) => s + a.saldo_akhir, 0);
  const total_ekuitas = total_ekuitas_coa + shu_berjalan;
  const total_kewajiban_ekuitas = total_kewajiban + total_ekuitas;
  const is_balanced = Math.round(total_aset) === Math.round(total_kewajiban_ekuitas);

  return {
    data: {
      per_tanggal: safePerTanggal,
      aset: { lancar: aset, total_aset },
      kewajiban: { items: kewajiban, total_kewajiban },
      ekuitas: { items: ekuitas, shu_berjalan, total_ekuitas },
      total_kewajiban_ekuitas,
      is_balanced,
    },
    error: null,
  };
}

// =====================================================================
// GET DASHBOARD STATS
// =====================================================================
export async function getDashboardStats(
  tahun: number
): Promise<{ data: DashboardStats | null; error: string | null }> {
  await requireRole(["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS"]);
  const supabase = createServiceClient();

  const safeTahun = isNaN(tahun) ? new Date().getFullYear() : tahun;
  const perTanggal = `${safeTahun}-12-31`;
  
  const akunSaldo = await getSaldoAkun(supabase, "1900-01-01", perTanggal);
  const labaRugi = await getLaporanLabaRugi(safeTahun);

  const cari = (kode: string) =>
    akunSaldo.find((a) => a.kode_akun === kode)?.saldo_akhir ?? 0;

  const total_kas_bank =
    cari("101") + cari("102-MND") + cari("102-MAY") + cari("102-BRIS");

  const total_piutang = cari("111") + cari("112") + cari("114");

  const total_aset = akunSaldo
    .filter((a) => a.tipe_akun === "ASSET")
    .reduce((s, a) => s + a.saldo_akhir, 0);

  const { data: pinjamanAktif } = await supabase
    .from("pinjaman")
    .select("id, cicilan_per_bulan")
    .eq("status", "ACTIVE");

  const { data: unpaid } = await supabase
    .from("cicilan_pinjaman")
    .select("pinjaman_id")
    .in("status", ["SCHEDULED", "OVERDUE"]);

  const countMap: Record<number, number> = {};
  unpaid?.forEach((c: any) => {
    countMap[c.pinjaman_id] = (countMap[c.pinjaman_id] || 0) + 1;
  });

  const total_outstanding_pinjaman = (pinjamanAktif ?? []).reduce(
    (s: number, p: any) => s + (countMap[p.id] || 0) * Number(p.cicilan_per_bulan || 0),
    0
  );

  return {
    data: {
      total_aset,
      total_kas_bank,
      total_piutang,
      total_simpanan_pokok: cari("302"),
      total_simpanan_wajib: cari("303"),
      total_simpanan_sukarela: cari("201"),
      total_outstanding_pinjaman,
      total_pinjaman_aktif: pinjamanAktif?.length ?? 0,
      shu_tahun_berjalan: labaRugi.data?.shu_bersih ?? 0,
      periode_label: `Per 31 Desember ${safeTahun}`,
    },
    error: null,
  };
}
