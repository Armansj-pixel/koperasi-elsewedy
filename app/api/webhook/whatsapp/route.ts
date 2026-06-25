// app/api/webhook/whatsapp/route.ts
// Endpoint ini didaftarkan di dashboard Fonnte sebagai Webhook URL
// URL: https://domain-kamu.vercel.app/api/webhook/whatsapp

import { NextRequest, NextResponse } from "next/server";
import { handlePesanMasuk } from "@/lib/notification/whatsapp";

// Fonnte mengirim POST saat ada pesan masuk
export async function POST(req: NextRequest) {
  try {
    const body = await req.formData().catch(() => null);
    const jsonBody = body ? null : await req.json().catch(() => null);

    // Fonnte bisa kirim sebagai form-data atau JSON tergantung setting
    let sender = "";
    let message = "";

    if (body) {
      sender = body.get("sender")?.toString() ?? "";
      message = body.get("message")?.toString() ?? "";
    } else if (jsonBody) {
      sender = jsonBody.sender ?? jsonBody.from ?? "";
      message = jsonBody.message ?? jsonBody.text ?? "";
    }

    if (!sender || !message) {
      return NextResponse.json({ ok: false, reason: "Missing sender or message" }, { status: 400 });
    }

    // Proses pesan secara async — tidak block response ke Fonnte
    // Fonnte butuh response cepat (< 5 detik) untuk tidak retry
    handlePesanMasuk({ noHp: sender, pesan: message }).catch((err) => {
      console.error("[Webhook WA] Error handle pesan:", err);
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[Webhook WA] Error:", err.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// Fonnte kadang kirim GET untuk verifikasi webhook
export async function GET() {
  return NextResponse.json({ ok: true, service: "Koperasi Jasa Karyawan PT. Elsewedy Electric Indonesia WA Webhook" });
}
