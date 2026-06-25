// lib/notification/whatsapp.ts
// Wrapper Fonnte API — siap migrasi ke provider lain (api.co.id, dll)
// cukup ganti PROVIDER_CONFIG tanpa ubah kode di actions

// =====================================================================
// CONFIG — ganti ke api.co.id nanti cukup di sini
// =====================================================================
const FONNTE_URL = "https://api.fonnte.com/send";
const TOKEN = process.env.FONNTE_TOKEN ?? "";

// =====================================================================
// HELPER: Normalisasi nomor HP ke format 628xxxxxxxxxx
// =====================================================================
function normalizePhone(noHp: string): string {
  if (!noHp) return "";
  const cleaned = noHp.replace(/\D/g, "");
  if (cleaned.startsWith("0")) return "62" + cleaned.slice(1);
  if (cleaned.startsWith("62")) return cleaned;
  if (cleaned.startsWith("8")) return "62" + cleaned;
  return cleaned;
}

// =====================================================================
// HELPER: Format Rupiah
// =====================================================================
function fRp(n: number): string {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

// =====================================================================
// HELPER: Format Tanggal
// =====================================================================
function fTgl(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// =====================================================================
// CORE: Kirim pesan WA via Fonnte
// Delay opsional untuk cegah spam detection saat kirim massal
// =====================================================================
async function kirimWA(
  noHp: string,
  pesan: string,
  delayMs = 0
): Promise<{ success: boolean; error?: string }> {
  if (!TOKEN) {
    console.warn("[WA] FONNTE_TOKEN tidak ditemukan di .env");
    return { success: false, error: "Token tidak dikonfigurasi" };
  }

  const target = normalizePhone(noHp);
  if (!target) {
    return { success: false, error: "Nomor HP tidak valid" };
  }

  if (delayMs > 0) {
    await new Promise((r) => setTimeout(r, delayMs));
  }

  try {
    const res = await fetch(FONNTE_URL, {
      method: "POST",
      headers: {
        Authorization: TOKEN,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        target,
        message: pesan,
        countryCode: "62",
      }).toString(),
    });

    const json = await res.json();

    if (!res.ok || json.status === false) {
      console.error("[WA] Gagal kirim ke", target, json);
      return { success: false, error: json.reason ?? "Gagal kirim pesan" };
    }

    return { success: true };
  } catch (err: any) {
    console.error("[WA] Error:", err.message);
    return { success: false, error: err.message };
  }
}

// =====================================================================
// KIRIM MASSAL dengan delay per pesan (cegah ban)
// =====================================================================
export async function kirimWAMassal(
  targets: { noHp: string; pesan: string }[],
  delayPerPesanMs = 2500
): Promise<{ berhasil: number; gagal: number }> {
  let berhasil = 0;
  let gagal = 0;

  for (const t of targets) {
    const result = await kirimWA(t.noHp, t.pesan, delayPerPesanMs);
    if (result.success) berhasil++;
    else gagal++;
  }

  return { berhasil, gagal };
}

// =====================================================================
// TEMPLATES NOTIFIKASI
// =====================================================================

// ── 1. PENCAIRAN PINJAMAN ─────────────────────────────────────────────
export async function notifPencairanPinjaman(params: {
  noHp: string;
  nama: string;
  nomorKontrak: string;
  nominalPokok: number;
  nominalDiterima: number;
  biayaAdmin: number;
  cicilanPerBulan: number;
  tenorBulan: number;
  tanggalCair: string;
}) {
  const pesan = `
🏦 *KOPERASI JASA KARYAWAN PT. ELSEWEDY ELECTRIC INDONESIA*
━━━━━━━━━━━━━━━━━━━━
*NOTIFIKASI PENCAIRAN PINJAMAN*

Yth. Bapak/Ibu *${params.nama}*,

Pinjaman Anda telah berhasil dicairkan dengan rincian sebagai berikut:

📋 No. Kontrak   : ${params.nomorKontrak}
💰 Plafon         : ${fRp(params.nominalPokok)}
🏷️ Biaya Admin   : ${fRp(params.biayaAdmin)} (4%)
✅ Dana Diterima  : ${fRp(params.nominalDiterima)}
📅 Tanggal Cair  : ${fTgl(params.tanggalCair)}

📆 *Jadwal Angsuran:*
Cicilan/bulan : ${fRp(params.cicilanPerBulan)}
Tenor         : ${params.tenorBulan} bulan
Jatuh Tempo   : Setiap tanggal 25

Harap mempersiapkan dana angsuran sebelum tanggal pemotongan gaji.

Terima kasih atas kepercayaan Anda.
_Koperasi Jasa Karyawan PT. Elsewedy Electric Indonesia_
`.trim();

  return kirimWA(params.noHp, pesan);
}

// ── 2. NOTIFIKASI ANGSURAN TERPOTONG (MANUAL) ────────────────────────
export async function notifAngsuranManual(params: {
  noHp: string;
  nama: string;
  nomorKontrak: string;
  nominalBayar: number;
  tanggalBayar: string;
  sisaCicilan: number;
  sisaPokok: number;
}) {
  const lunas = params.sisaCicilan === 0;
  const pesan = `
🏦 *KOPERASI JASA KARYAWAN PT. ELSEWEDY ELECTRIC INDONESIA*
━━━━━━━━━━━━━━━━━━━━
*KONFIRMASI PEMBAYARAN ANGSURAN*

Yth. Bapak/Ibu *${params.nama}*,

Pembayaran angsuran pinjaman Anda telah kami terima.

📋 No. Kontrak    : ${params.nomorKontrak}
💳 Jumlah Bayar   : ${fRp(params.nominalBayar)}
📅 Tanggal Bayar  : ${fTgl(params.tanggalBayar)}

${lunas
  ? `🎉 *Selamat! Pinjaman Anda telah LUNAS.*\nTerima kasih atas kepercayaan dan ketepatan waktu pembayaran Anda.`
  : `📊 Sisa Angsuran  : ${params.sisaCicilan}x lagi\n💰 Sisa Pokok     : ${fRp(params.sisaPokok)}`
}

Terima kasih.
_Koperasi Jasa Karyawan PT. Elsewedy Electric Indonesia_
`.trim();

  return kirimWA(params.noHp, pesan);
}

// ── 3. NOTIFIKASI PAYROLL MASSAL ANGSURAN ────────────────────────────
export function templatePayrollAngsuran(params: {
  nama: string;
  nomorKontrak: string;
  nominalBayar: number;
  periode: string; // "2026-06"
  sisaCicilan: number;
  sisaPokok: number;
}): string {
  const [tahun, bulan] = params.periode.split("-");
  const namaBulan = new Date(Number(tahun), Number(bulan) - 1).toLocaleString("id-ID", { month: "long", year: "numeric" });
  const lunas = params.sisaCicilan === 0;

  return `
🏦 *KOPERASI JASA KARYAWAN PT. ELSEWEDY ELECTRIC INDONESIA*
━━━━━━━━━━━━━━━━━━━━
*PEMOTONGAN GAJI — ANGSURAN PINJAMAN*
Periode: ${namaBulan}

Yth. Bapak/Ibu *${params.nama}*,

Angsuran pinjaman Anda telah dipotong melalui payroll bulan ini.

📋 No. Kontrak   : ${params.nomorKontrak}
💳 Jumlah Potong : ${fRp(params.nominalBayar)}

${lunas
  ? `🎉 *Pinjaman Anda telah LUNAS bulan ini!*`
  : `📊 Sisa Angsuran : ${params.sisaCicilan}x lagi\n💰 Sisa Pokok    : ${fRp(params.sisaPokok)}`
}

_Koperasi Jasa Karyawan PT. Elsewedy Electric Indonesia_
`.trim();
}

// ── 4. NOTIFIKASI PAYROLL MASSAL SIMPANAN ────────────────────────────
export function templatePayrollSimpanan(params: {
  nama: string;
  periode: string;
  wajib: number;
  sukarela: number;
  totalPotongan: number;
}): string {
  const [tahun, bulan] = params.periode.split("-");
  const namaBulan = new Date(Number(tahun), Number(bulan) - 1).toLocaleString("id-ID", { month: "long", year: "numeric" });

  return `
🏦 *KOPERASI JASA KARYAWAN PT. ELSEWEDY ELECTRIC INDONESIA*
━━━━━━━━━━━━━━━━━━━━
*PEMOTONGAN GAJI — SIMPANAN*
Periode: ${namaBulan}

Yth. Bapak/Ibu *${params.nama}*,

Simpanan bulanan Anda telah dipotong melalui payroll.

💰 Simpanan Wajib    : ${fRp(params.wajib)}
💰 Simpanan Sukarela : ${fRp(params.sukarela)}
━━━━━━━━━━━━━━━━━━━━
💳 Total Potongan    : ${fRp(params.totalPotongan)}

Ketik *SALDO* untuk cek saldo simpanan terkini.

_Koperasi Jasa Karyawan PT. Elsewedy Electric Indonesia_
`.trim();
}

// ── 5. NOTIFIKASI SETORAN MANUAL ─────────────────────────────────────
export async function notifSetoranManual(params: {
  noHp: string;
  nama: string;
  jenisSimpanan: string;
  nominal: number;
  tanggal: string;
  saldoBaru?: number;
}) {
  const labelJenis: Record<string, string> = {
    SIMPANAN_POKOK: "Simpanan Pokok",
    SIMPANAN_WAJIB: "Simpanan Wajib",
    SIMPANAN_SUKARELA: "Simpanan Sukarela",
  };

  const pesan = `
🏦 *KOPERASI JASA KARYAWAN PT. ELSEWEDY ELECTRIC INDONESIA*
━━━━━━━━━━━━━━━━━━━━
*KONFIRMASI SETORAN SIMPANAN*

Yth. Bapak/Ibu *${params.nama}*,

Setoran simpanan Anda telah berhasil dicatat.

🏷️ Jenis       : ${labelJenis[params.jenisSimpanan] ?? params.jenisSimpanan}
💰 Nominal     : ${fRp(params.nominal)}
📅 Tanggal     : ${fTgl(params.tanggal)}
${params.saldoBaru !== undefined ? `💳 Total Saldo : ${fRp(params.saldoBaru)}` : ""}

Ketik *SALDO* untuk cek saldo simpanan lengkap.

Terima kasih.
_Koperasi Jasa Karyawan PT. Elsewedy Electric Indonesia_
`.trim();

  return kirimWA(params.noHp, pesan);
}

// ── 6. NOTIFIKASI PENARIKAN DIAJUKAN ─────────────────────────────────
export async function notifPenarikanDiajukan(params: {
  noHp: string;
  nama: string;
  nominal: number;
}) {
  const pesan = `
🏦 *KOPERASI JASA KARYAWAN PT. ELSEWEDY ELECTRIC INDONESIA*
━━━━━━━━━━━━━━━━━━━━
*PENGAJUAN PENARIKAN DITERIMA*

Yth. Bapak/Ibu *${params.nama}*,

Pengajuan penarikan simpanan sukarela Anda telah kami terima dan sedang dalam proses persetujuan.

💰 Nominal : ${fRp(params.nominal)}
⏳ Status  : Menunggu Persetujuan Bendahara

Anda akan mendapat notifikasi kembali setelah diproses.

_Koperasi Jasa Karyawan PT. Elsewedy Electric Indonesia_
`.trim();

  return kirimWA(params.noHp, pesan);
}

// ── 7. NOTIFIKASI PENARIKAN DISETUJUI ────────────────────────────────
export async function notifPenarikanDisetujui(params: {
  noHp: string;
  nama: string;
  nominal: number;
  tanggal: string;
  saldoSisa: number;
}) {
  const pesan = `
🏦 *KOPERASI JASA KARYAWAN PT. ELSEWEDY ELECTRIC INDONESIA*
━━━━━━━━━━━━━━━━━━━━
*PENARIKAN SIMPANAN DISETUJUI* ✅

Yth. Bapak/Ibu *${params.nama}*,

Penarikan simpanan sukarela Anda telah disetujui dan sedang diproses pencairan.

💰 Nominal Cair  : ${fRp(params.nominal)}
📅 Tanggal       : ${fTgl(params.tanggal)}
💳 Saldo Tersisa : ${fRp(params.saldoSisa)}

Dana akan segera ditransfer ke rekening terdaftar Anda.

Terima kasih.
_Koperasi Jasa Karyawan PT. Elsewedy Electric Indonesia_
`.trim();

  return kirimWA(params.noHp, pesan);
}

// ── 8. NOTIFIKASI PENARIKAN DITOLAK ──────────────────────────────────
export async function notifPenarikanDitolak(params: {
  noHp: string;
  nama: string;
  nominal: number;
  alasan?: string;
}) {
  const pesan = `
🏦 *KOPERASI JASA KARYAWAN PT. ELSEWEDY ELECTRIC INDONESIA*
━━━━━━━━━━━━━━━━━━━━
*PENARIKAN SIMPANAN DITOLAK* ❌

Yth. Bapak/Ibu *${params.nama}*,

Mohon maaf, pengajuan penarikan simpanan Anda tidak dapat diproses.

💰 Nominal    : ${fRp(params.nominal)}
📝 Keterangan : ${params.alasan ?? "Tidak memenuhi syarat penarikan"}

Untuk informasi lebih lanjut, silakan hubungi Bendahara Koperasi.

_Koperasi Jasa Karyawan PT. Elsewedy Electric Indonesia_
`.trim();

  return kirimWA(params.noHp, pesan);
}

// ── 9. NOTIFIKASI STATUS APPROVAL PINJAMAN ───────────────────────────
export async function notifStatusPinjaman(params: {
  noHp: string;
  nama: string;
  nomorKontrak: string;
  status: "PENDING_L2" | "PENDING_L3" | "APPROVED" | "REJECTED";
  catatan?: string;
}) {
  const statusLabel: Record<string, string> = {
    PENDING_L2: "✅ Disetujui Sekretaris — Menunggu Bendahara",
    PENDING_L3: "✅ Disetujui Bendahara — Menunggu Ketua",
    APPROVED:   "✅ *DISETUJUI PENUH* — Menunggu Pencairan",
    REJECTED:   "❌ *DITOLAK*",
  };

  const pesan = `
🏦 *KOPERASI JASA KARYAWAN PT. ELSEWEDY ELECTRIC INDONESIA*
━━━━━━━━━━━━━━━━━━━━
*UPDATE STATUS PINJAMAN*

Yth. Bapak/Ibu *${params.nama}*,

Terdapat pembaruan status pengajuan pinjaman Anda.

📋 No. Kontrak : ${params.nomorKontrak}
📊 Status       : ${statusLabel[params.status] ?? params.status}
${params.catatan ? `📝 Catatan      : ${params.catatan}` : ""}

${params.status === "APPROVED"
  ? "Pinjaman Anda telah disetujui penuh. Pencairan akan dilakukan oleh Bendahara dalam waktu dekat."
  : params.status === "REJECTED"
  ? "Untuk informasi lebih lanjut, silakan hubungi pengurus koperasi."
  : "Pengajuan Anda sedang dalam proses persetujuan tahap berikutnya."
}

_Koperasi Jasa Karyawan PT. Elsewedy Electric Indonesia_
`.trim();

  return kirimWA(params.noHp, pesan);
}

// ── 10. NOTIFIKASI PINJAMAN LUNAS ────────────────────────────────────
export async function notifPinjamanLunas(params: {
  noHp: string;
  nama: string;
  nomorKontrak: string;
  tanggalLunas: string;
}) {
  const pesan = `
🏦 *KOPERASI JASA KARYAWAN PT. ELSEWEDY ELECTRIC INDONESIA*
━━━━━━━━━━━━━━━━━━━━
🎉 *PINJAMAN LUNAS*

Yth. Bapak/Ibu *${params.nama}*,

Selamat! Pinjaman Anda telah dinyatakan *LUNAS*.

📋 No. Kontrak   : ${params.nomorKontrak}
📅 Tanggal Lunas : ${fTgl(params.tanggalLunas)}

Terima kasih atas kepercayaan dan ketepatan waktu pembayaran Anda selama ini. Anda dapat mengajukan pinjaman baru kapan saja sesuai kebutuhan.

_Koperasi Jasa Karyawan PT. Elsewedy Electric Indonesia_
`.trim();

  return kirimWA(params.noHp, pesan);
}

// =====================================================================
// SELF-SERVICE: Handler pesan masuk dari anggota
// Dipakai di webhook endpoint: app/api/webhook/whatsapp/route.ts
// =====================================================================

import { createServiceClient } from "@/lib/supabase/server";

export async function handlePesanMasuk(params: {
  noHp: string;      // Nomor pengirim (dari Fonnte webhook)
  pesan: string;     // Isi pesan masuk
}): Promise<void> {
  const { noHp, pesan } = params;
  const cmd = pesan.trim().toUpperCase();

  // Cari user berdasarkan no_hp
  const supabase = createServiceClient();
  const noHpNormal = normalizePhone(noHp);

  const { data: user } = await supabase
    .from("users")
    .select("id, nama, no_hp")
    .or(`no_hp.eq.${noHpNormal},no_hp.eq.0${noHpNormal.slice(2)}`)
    .maybeSingle();

  if (!user) {
    await kirimWA(noHp, `
🏦 *KOPERASI JASA KARYAWAN PT. ELSEWEDY ELECTRIC INDONESIA*
━━━━━━━━━━━━━━━━━━━━
Maaf, nomor Anda tidak terdaftar sebagai anggota koperasi.

Hubungi Sekretaris untuk informasi lebih lanjut.
`.trim());
    return;
  }

  // ── CMD: SALDO ──────────────────────────────────────────────────────
  if (cmd === "SALDO" || cmd === "CEK SALDO") {
    const { data: saldo } = await supabase
      .from("saldo_simpanan")
      .select("saldo_pokok, saldo_wajib, saldo_sukarela, total_saldo")
      .eq("user_id", user.id)
      .maybeSingle();

    const balasanSaldo = `
🏦 *KOPERASI JASA KARYAWAN PT. ELSEWEDY ELECTRIC INDONESIA*
━━━━━━━━━━━━━━━━━━━━
*INFORMASI SALDO SIMPANAN*

Yth. Bapak/Ibu *${user.nama}*,

💰 Simpanan Pokok    : ${fRp(saldo?.saldo_pokok ?? 0)}
💰 Simpanan Wajib    : ${fRp(saldo?.saldo_wajib ?? 0)}
💰 Simpanan Sukarela : ${fRp(saldo?.saldo_sukarela ?? 0)}
━━━━━━━━━━━━━━━━━━━━
💳 *Total Saldo      : ${fRp(saldo?.total_saldo ?? 0)}*

_Data per ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}_

Ketik *PINJAMAN* untuk cek info pinjaman aktif.
_Koperasi Jasa Karyawan PT. Elsewedy Electric Indonesia_
`.trim();

    await kirimWA(noHp, balasanSaldo);
    return;
  }

  // ── CMD: PINJAMAN ───────────────────────────────────────────────────
  if (cmd === "PINJAMAN" || cmd === "CEK PINJAMAN") {
        const { data: pinjaman } = await supabase
      .from("pinjaman")
      .select("id, nomor_kontrak, nominal_pokok, cicilan_per_bulan, tenor_bulan, status, tanggal_cair")
      .eq("user_id", user.id)
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();


    if (!pinjaman) {
      await kirimWA(noHp, `
🏦 *KOPERASI JASA KARYAWAN PT. ELSEWEDY ELECTRIC INDONESIA*
━━━━━━━━━━━━━━━━━━━━
Yth. Bapak/Ibu *${user.nama}*,

Anda saat ini tidak memiliki pinjaman aktif.

Ketik *SALDO* untuk cek saldo simpanan.
_Koperasi Jasa Karyawan PT. Elsewedy Electric Indonesia_
`.trim());
      return;
    }

    // Hitung sisa cicilan
    const { data: sisaData } = await supabase
      .from("cicilan_pinjaman")
      .select("nominal_cicilan")
      .eq("pinjaman_id", pinjaman.id)
      .in("status", ["SCHEDULED", "OVERDUE"]);

    const sisaKali = sisaData?.length ?? 0;
    const sisaPokok = sisaData?.reduce((s, c) => s + Number(c.nominal_cicilan), 0) ?? 0;

    const balasanPinjaman = `
🏦 *KOPERASI JASA KARYAWAN PT. ELSEWEDY ELECTRIC INDONESIA*
━━━━━━━━━━━━━━━━━━━━
*INFORMASI PINJAMAN AKTIF*

Yth. Bapak/Ibu *${user.nama}*,

📋 No. Kontrak    : ${pinjaman.nomor_kontrak}
💰 Plafon          : ${fRp(pinjaman.nominal_pokok)}
📅 Tanggal Cair   : ${fTgl(pinjaman.tanggal_cair ?? "")}
💳 Cicilan/Bulan  : ${fRp(pinjaman.cicilan_per_bulan)}
📊 Sisa Angsuran  : ${sisaKali}x lagi
💰 Sisa Pokok     : ${fRp(sisaPokok)}

Jatuh tempo setiap tanggal 25.

Ketik *SALDO* untuk cek saldo simpanan.
_Koperasi Jasa Karyawan PT. Elsewedy Electric Indonesia_
`.trim();

    await kirimWA(noHp, balasanPinjaman);
    return;
  }

  // ── CMD: SLIP [BULAN] ───────────────────────────────────────────────
  // Contoh: "SLIP 06 2026" atau "SLIP JUNI 2026"
  if (cmd.startsWith("SLIP")) {
    const parts = pesan.trim().split(/\s+/);
    // Ambil bulan & tahun dari pesan, default ke bulan ini
    const now = new Date();
    const bulan = parts[1] ? parseInt(parts[1]) : now.getMonth() + 1;
    const tahun = parts[2] ? parseInt(parts[2]) : now.getFullYear();
    const periode = `${tahun}-${String(bulan).padStart(2, "0")}`;
    const namaBulan = new Date(tahun, bulan - 1).toLocaleString("id-ID", { month: "long", year: "numeric" });

    const { data: saldo } = await supabase
      .from("saldo_simpanan")
      .select("total_saldo")
      .eq("user_id", user.id)
      .maybeSingle();

    const { data: pinjaman } = await supabase
      .from("pinjaman")
      .select("id, nomor_kontrak, cicilan_per_bulan")
      .eq("user_id", user.id)
      .eq("status", "ACTIVE")
      .maybeSingle();

    const [year, month] = periode.split("-").map(Number);
    const startDate = `${periode}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

    let cicilanBulanIni = 0;
    if (pinjaman) {
      const { data: cicilan } = await supabase
        .from("cicilan_pinjaman")
        .select("nominal_cicilan")
        .eq("pinjaman_id", pinjaman.id)
        .gte("tanggal_jatuh_tempo", startDate)
        .lte("tanggal_jatuh_tempo", endDate)
        .maybeSingle();
      cicilanBulanIni = Number(cicilan?.nominal_cicilan ?? 0);
    }

    const { data: userDetail } = await supabase
      .from("users")
      .select("simpanan_wajib_bulanan, simpanan_sukarela_bulanan")
      .eq("id", user.id)
      .single();

    const wajib = Number(userDetail?.simpanan_wajib_bulanan ?? 0);
    const sukarela = Number(userDetail?.simpanan_sukarela_bulanan ?? 0);
    const totalPotongan = wajib + sukarela + cicilanBulanIni;

    const balasanSlip = `
🏦 *KOPERASI JASA KARYAWAN PT. ELSEWEDY ELECTRIC INDONESIA*
━━━━━━━━━━━━━━━━━━━━
*SLIP POTONGAN GAJI*
Periode: ${namaBulan}

Yth. Bapak/Ibu *${user.nama}*,

💰 Simpanan Wajib    : ${fRp(wajib)}
💰 Simpanan Sukarela : ${fRp(sukarela)}
💳 Angsuran Pinjaman : ${fRp(cicilanBulanIni)}
━━━━━━━━━━━━━━━━━━━━
💳 *Total Potongan   : ${fRp(totalPotongan)}*

💰 Total Saldo Simpanan : ${fRp(saldo?.total_saldo ?? 0)}

_Data per ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}_
_Koperasi Jasa Karyawan PT. Elsewedy Electric Indonesia_
`.trim();

    await kirimWA(noHp, balasanSlip);
    return;
  }

  // ── DEFAULT: Menu Bantuan ───────────────────────────────────────────
  await kirimWA(noHp, `
🏦 *KOPERASI JASA KARYAWAN PT. ELSEWEDY ELECTRIC INDONESIA*
━━━━━━━━━━━━━━━━━━━━
Yth. Bapak/Ibu *${user.nama}*,

Berikut layanan self-service yang tersedia:

1️⃣ Ketik *SALDO*
   Cek saldo simpanan (pokok, wajib, sukarela)

2️⃣ Ketik *PINJAMAN*
   Cek info pinjaman aktif & sisa angsuran

3️⃣ Ketik *SLIP 06 2026*
   Slip potongan gaji bulan tertentu
   _(ganti 06 = bulan, 2026 = tahun)_

━━━━━━━━━━━━━━━━━━━━
Untuk bantuan lebih lanjut hubungi pengurus koperasi.
_Koperasi Jasa Karyawan PT. Elsewedy Electric Indonesia_
`.trim());
}
