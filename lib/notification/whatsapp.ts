// lib/notification/whatsapp.ts
const FONNTE_URL = "https://api.fonnte.com/send";
const TOKEN = process.env.FONNTE_TOKEN ?? "";

function normalizePhone(noHp: string): string {
  if (!noHp) return "";
  const cleaned = noHp.replace(/\D/g, "");
  if (cleaned.startsWith("0")) return "62" + cleaned.slice(1);
  if (cleaned.startsWith("62")) return cleaned;
  if (cleaned.startsWith("8")) return "62" + cleaned;
  return cleaned;
}

function fRp(n: number): string {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

function fTgl(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// Fungsi utama kirim pesan dengan tambahan log untuk debugging
async function kirimWA(
  noHp: string,
  pesan: string,
  delayMs = 0
): Promise<{ success: boolean; error?: string }> {
  if (!TOKEN) {
    console.error("[WA ERROR] FONNTE_TOKEN tidak ditemukan di environment variables!");
    return { success: false, error: "Token tidak dikonfigurasi" };
  }

  const target = normalizePhone(noHp);
  if (!target) return { success: false, error: "Nomor HP tidak valid" };

  if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));

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
    console.log(`[WA DEBUG] Hasil kirim ke ${target}:`, json);

    if (!res.ok || json.status === false) {
      return { success: false, error: json.reason ?? "Gagal kirim pesan" };
    }

    return { success: true };
  } catch (err: any) {
    console.error("[WA ERROR] Exception:", err.message);
    return { success: false, error: err.message };
  }
}

// Handler pesan masuk yang sudah diperbaiki untuk menangani duplikat user
import { createServiceClient } from "@/lib/supabase/server";

export async function handlePesanMasuk(params: {
  noHp: string;
  pesan: string;
}): Promise<void> {
  const { noHp, pesan } = params;
  const cmd = pesan.trim().toUpperCase();
  const supabase = createServiceClient();
  const noHpNormal = normalizePhone(noHp);

  // Cari user dengan logika menghindari error jika ada data ganda
  const { data: users } = await supabase
    .from("users")
    .select("id, nama, no_hp")
    .or(`no_hp.eq.${noHpNormal},no_hp.eq.0${noHpNormal.slice(2)}`);

  const user = users && users.length > 0 ? users[0] : null;

  if (!user) {
    await kirimWA(noHp, `🏦 *KOPERASI JASA KARYAWAN PT. ELSEWEDY ELECTRIC INDONESIA*\n━━━━━━━━━━━━━━━━━━━━\nMaaf, nomor Anda tidak terdaftar.`);
    return;
  }

  // --- CMD SALDO ---
  if (cmd === "SALDO" || cmd === "CEK SALDO") {
    const { data: saldo } = await supabase
      .from("saldo_simpanan")
      .select("saldo_pokok, saldo_wajib, saldo_sukarela, total_saldo")
      .eq("user_id", user.id)
      .maybeSingle();

    const balasanSaldo = `🏦 *KOPERASI JASA KARYAWAN PT. ELSEWEDY ELECTRIC INDONESIA*\n━━━━━━━━━━━━━━━━━━━━\n*INFORMASI SALDO*\n\nYth. ${user.nama},\n\n💰 Pokok: ${fRp(saldo?.saldo_pokok ?? 0)}\n💰 Wajib: ${fRp(saldo?.saldo_wajib ?? 0)}\n💰 Sukarela: ${fRp(saldo?.saldo_sukarela ?? 0)}\n━━━━━━━━━━━━━━━━━━━━\n💳 *Total: ${fRp(saldo?.total_saldo ?? 0)}*`.trim();

    await kirimWA(noHp, balasanSaldo);
  } 
  // --- Tambahkan menu lain di sini ---
}
