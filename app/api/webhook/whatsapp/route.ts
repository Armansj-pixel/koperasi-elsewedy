import { NextRequest, NextResponse } from "next/server";
import { handlePesanMasuk } from "@/lib/notification/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const jsonBody = await req.json().catch(() => ({}));
    
    const sender = jsonBody.sender || jsonBody.pengirim || jsonBody.from || "";
    const message = jsonBody.message || jsonBody.pesan || jsonBody.text_message || "";

    console.log("[Webhook WA] Received:", { sender, message });

    if (!sender || !message) {
      return NextResponse.json({ ok: false, reason: "Missing sender or message" }, { status: 400 });
    }

    // --- PERUBAHAN PENTING ADA DI BARIS INI ---
    // Tambahkan "await" agar Vercel tidak mematikan server sebelum Fonnte membalas
    await handlePesanMasuk({ noHp: sender, pesan: message });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[Webhook WA] Error:", err.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "Koperasi Jasa Karyawan PT. Elsewedy Electric Indonesia WA Webhook" });
}
