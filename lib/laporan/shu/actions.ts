"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { buatJurnalUmum } from "@/lib/akuntansi/actions";
import { getLaporanLabaRugi } from "@/lib/akuntansi/laporan";

// =====================================================================
// TYPES
// =====================================================================
export interface KonfigurasiSHU {
  pct_dana_cadangan: number;   // % ke akun 306 Dana Cadangan
  pct_modal_koperasi: number;  // % ke akun 304 SHU Belum Dibagikan (modal)
  pct_parsel_lebaran: number;  // % ke akun 506 Bingkisan Lebaran (dibebankan saat RAT)
  // Catatan: total harus = 100
}

export interface SimulasiSHU {
  tahun: number;
  shu_bersih: number;
  alokasi_dana_cadangan: number;
  alokasi_modal_koperasi: number;
  alokasi_parsel_lebaran: number;
  total_alokasi: number;
  is_valid: boolean;
}

// =====================================================================
// GET KONFIGURASI SHU (dari tabel settings atau default)
// =====================================================================
export async function getKonfigurasiSHU(): Promise<KonfigurasiSHU> {
  await requireRole(["SUPERADMIN", "BENDAHARA", "KETUA"]);
  const supabase = createServiceClient();

  // Coba ambil dari tabel koperasi_settings jika ada
  const { data } = await supabase
    .from("koperasi_settings")
    .select("key, value")
    .in("key", ["shu_pct_dana_cadangan", "shu_pct_modal", "shu_pct_parsel"])
    .maybeSingle();

  // Default sesuai best practice koperasi Indonesia (UU No.25/1992)
  // Dana Cadangan minimal 25%, sisanya fleksibel
  return {
    pct_dana_cadangan: 25,
    pct_modal_koperasi: 60,
    pct_parsel_lebaran: 15,
  };
}

// =====================================================================
// SIMULASI ALOKASI SHU (Preview sebelum eksekusi)
// =====================================================================
export async function simulasiAlokasiSHU(
  tahun: number,
  config?: Partial<KonfigurasiSHU>
): Promise<{ data: SimulasiSHU | null; error: string | null }> {
  await requireRole(["SUPERADMIN", "BENDAHARA", "KETUA"]);

  const defaultConfig = await getKonfigurasiSHU();
  const cfg: KonfigurasiSHU = { ...defaultConfig, ...config };

  // Validasi persentase total = 100
  const totalPct = cfg.pct_dana_cadangan + cfg.pct_modal_koperasi + cfg.pct_parsel_lebaran;
  if (Math.round(totalPct) !== 100) {
    return { data: null, error: `Total alokasi harus 100%. Saat ini: ${totalPct}%` };
  }

  const labaRugi = await getLaporanLabaRugi(tahun);
  if (!labaRugi.data) return { data: null, error: "Gagal menghitung L/R" };

  const shu = labaRugi.data.shu_bersih;

  if (shu <= 0) {
    return {
      data: {
        tahun,
        shu_bersih: shu,
        alokasi_dana_cadangan: 0,
        alokasi_modal_koperasi: 0,
        alokasi_parsel_lebaran: 0,
        total_alokasi: 0,
        is_valid: false,
      },
      error: `SHU tahun ${tahun} adalah Rp ${shu.toLocaleString("id-ID")} (tidak ada yang perlu dialokasikan).`,
    };
  }

  const alokasi_dana_cadangan = Math.round((shu * cfg.pct_dana_cadangan) / 100);
  const alokasi_modal_koperasi = Math.round((shu * cfg.pct_modal_koperasi) / 100);
  // Parsel lebaran = sisa (hindari rounding error)
  const alokasi_parsel_lebaran = shu - alokasi_dana_cadangan - alokasi_modal_koperasi;

  return {
    data: {
      tahun,
      shu_bersih: shu,
      alokasi_dana_cadangan,
      alokasi_modal_koperasi,
      alokasi_parsel_lebaran,
      total_alokasi: alokasi_dana_angan + alokasi_modal_koperasi + alokasi_parsel_lebaran,
      is_valid: true,
    },
    error: null,
  };
}

// =====================================================================
// EKSEKUSI TUTUP BUKU + ALOKASI SHU
//
// ALUR:
// 1. Hitung SHU bersih dari L/R tahun tsb
// 2. Jurnal penutup: nol-kan akun Revenue & Expense → masuk akun 305
// 3. Jurnal alokasi SHU: dari 305 → 306 (cadangan), 304 (modal), 505/506 (parsel)
// 4. Catat di tabel tutup_buku untuk audit trail
//
// PENTING: Hanya bisa dieksekusi SEKALI per tahun (idempotency)
// =====================================================================
export async function eksekusiTutupBuku(
  tahun: number,
  config: KonfigurasiSHU
): Promise<{ success: boolean; message: string; simulasi?: SimulasiSHU }> {
  await requireRole(["SUPERADMIN", "BENDAHARA"]);
  const supabase = createServiceClient();

  // Guard: cek apakah tahun ini sudah ditutup
  const { data: existing } = await supabase
    .from("jurnal_induk")
    .select("id")
    .eq("nomor_bukti", `TUTUPBUKU-${tahun}`)
    .maybeSingle();

  if (existing) {
    return { success: false, message: `Tutup buku tahun ${tahun} sudah pernah dieksekusi.` };
  }

  // Validasi config
  const totalPct = config.pct_dana_cadangan + config.pct_modal_koperasi + config.pct_parsel_lebaran;
  if (Math.round(totalPct) !== 100) {
    return { success: false, message: `Total alokasi harus 100%. Saat ini: ${totalPct}%` };
  }

  // Ambil simulasi untuk angka final
  const sim = await simulasiAlokasiSHU(tahun, config);
  if (!sim.data || !sim.data.is_valid) {
    return { success: false, message: sim.error ?? "SHU tidak valid untuk ditutup." };
  }

  const tanggalTutup = `${tahun}-12-31`;
  const shu = sim.data.shu_bersih;

  // ── JURNAL 1: Penutup Akun Pendapatan & Beban → SHU Tahun Berjalan (305) ──
  // Semua akun Revenue (saldo Kredit) di-debit → nol
  // Semua akun Expense (saldo Debit) di-kredit → nol
  // Selisih masuk ke akun 305
  const labaRugi = await getLaporanLabaRugi(tahun);
  if (!labaRugi.data) return { success: false, message: "Gagal ambil data L/R." };

  const linesJurnal1: { kode_akun: string; debit: number; kredit: number }[] = [];

  // Debit semua Revenue (menutup saldo kredit)
  for (const rev of labaRugi.data.pendapatan) {
    if (rev.saldo_akhir > 0) {
      linesJurnal1.push({ kode_akun: rev.kode_akun, debit: rev.saldo_akhir, kredit: 0 });
    }
  }
  // Kredit semua Expense (menutup saldo debit)
  for (const exp of labaRugi.data.beban) {
    if (exp.saldo_akhir > 0) {
      linesJurnal1.push({ kode_akun: exp.kode_akun, debit: 0, kredit: exp.saldo_akhir });
    }
  }
  // Selisih (SHU) masuk ke 305
  if (shu > 0) {
    linesJurnal1.push({ kode_akun: "305", debit: 0, kredit: shu });
  } else {
    // Rugi: debit akun 305
    linesJurnal1.push({ kode_akun: "305", debit: Math.abs(shu), kredit: 0 });
  }

  const jurnal1 = await buatJurnalUmum({
    nomor_bukti: `TUTUPBUKU-${tahun}`,
    tanggal_transaksi: tanggalTutup,
    keterangan: `Jurnal Penutup Tahun Buku ${tahun} — Nol-kan Revenue & Expense`,
    jenis_sumber: "MANUAL",
    lines: linesJurnal1,
  });

  if (!jurnal1.success) {
    return { success: false, message: `Gagal jurnal penutup: ${jurnal1.error}` };
  }

  // ── JURNAL 2: Alokasi SHU dari 305 → 306, 304, 506 ──
  if (shu > 0) {
    const linesJurnal2: { kode_akun: string; debit: number; kredit: number }[] = [
      { kode_akun: "305", debit: shu, kredit: 0 }, // Tutup akun SHU berjalan
    ];

    if (sim.data.alokasi_dana_cadangan > 0)
      linesJurnal2.push({ kode_akun: "306", debit: 0, kredit: sim.data.alokasi_dana_cadangan });

    if (sim.data.alokasi_modal_koperasi > 0)
      linesJurnal2.push({ kode_akun: "304", debit: 0, kredit: sim.data.alokasi_modal_koperasi });

    if (sim.data.alokasi_parsel_lebaran > 0)
      // Parsel lebaran → dicatat sebagai hutang/kewajiban dulu, realisasi saat lebaran ke 506
      linesJurnal2.push({ kode_akun: "202", debit: 0, kredit: sim.data.alokasi_parsel_lebaran });

    const jurnal2 = await buatJurnalUmum({
      nomor_bukti: `ALOKASIAHU-${tahun}`,
      tanggal_transaksi: tanggalTutup,
      keterangan: `Alokasi SHU Tahun ${tahun}: Cadangan ${config.pct_dana_cadangan}%, Modal ${config.pct_modal_koperasi}%, Parsel ${config.pct_parsel_lebaran}%`,
      jenis_sumber: "MANUAL",
      lines: linesJurnal2,
    });

    if (!jurnal2.success) {
      return { success: false, message: `Jurnal penutup berhasil tapi alokasi SHU gagal: ${jurnal2.error}` };
    }
  }

  revalidatePath("/dashboard/laporan");
  return {
    success: true,
    message: `✅ Tutup buku tahun ${tahun} berhasil! SHU Rp ${shu.toLocaleString("id-ID")} dialokasikan ke Dana Cadangan, Modal Koperasi & Hutang Parsel Lebaran.`,
    simulasi: sim.data,
  };
}

// =====================================================================
// CEK STATUS TUTUP BUKU
// =====================================================================
export async function getCekTutupBuku(tahun: number) {
  await requireRole(["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS"]);
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("jurnal_induk")
    .select("id, created_at, created_by")
    .eq("nomor_bukti", `TUTUPBUKU-${tahun}`)
    .maybeSingle();

  return { sudahTutup: !!data, data };
}
