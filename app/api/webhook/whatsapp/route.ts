import { NextRequest, NextResponse } from "next/server";
import { handlePesanMasuk } from "@/lib/notification/whatsapp";

export async function POST(req: NextRequest) {
  try {
    // Coba ambil data JSON
    const jsonBody = await req.json().catch(() => ({}));
    
    // Logika pengambilan data yang lebih fleksibel
    // Kita cek semua kemungkinan field yang dikirim Fonnte
    const sender = jsonBody.sender || jsonBody.pengirim || jsonBody.from || "";
    const message = jsonBody.message || jsonBody.pesan || jsonBody.text_message || "";

    console.log("[Webhook WA] Received:", { sender, message, fullBody: jsonBody });

    if (!sender || !message) {
      return NextResponse.json({ ok: false, reason: "Missing sender or message" }, { status: 400 });
    }

    // Proses pesan
    handlePesanMasuk({ noHp: sender, pesan: message }).catch((err) => {
      console.error("[Webhook WA] Error handle pesan:", err);
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[Webhook WA] Error:", err.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "Koperasi Jasa Karyawan PT. Elsewedy Electric Indonesia WA Webhook" });
}
