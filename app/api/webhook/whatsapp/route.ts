// app/api/webhook/whatsapp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handlePesanMasuk } from "@/lib/notification/whatsapp";

export async function POST(req: NextRequest) {
  try {
    // Verifikasi secret dari api.co.id
    // api.co.id mengirim secret di header x-hub-signature atau x-webhook-secret
    const secret = req.headers.get("x-hub-signature-256")
                ?? req.headers.get("x-webhook-secret")
                ?? req.headers.get("authorization")
                ?? "";

    const expectedSecret = process.env.APICODE_WEBHOOK_SECRET ?? "";

    if (expectedSecret && !secret.includes(expectedSecret)) {
      console.warn("[Webhook WA] Unauthorized — secret tidak cocok");
      return NextResponse.json({ ok: false, reason: "Unauthorized" }, { status: 401 });
    }

    const jsonBody = await req.json().catch(() => ({}));

    // api.co.id format pesan masuk
    const sender  = jsonBody.sender  ?? jsonBody.from    ?? jsonBody.pengirim ?? "";
    const message = jsonBody.message ?? jsonBody.text    ?? jsonBody.pesan    ?? "";

    console.log("[Webhook WA] Received:", { sender, message });

    if (!sender || !message) {
      return NextResponse.json({ ok: false, reason: "Missing sender or message" }, { status: 400 });
    }

    // Await agar Vercel tidak kill function sebelum selesai
    await handlePesanMasuk({ noHp: sender, pesan: message });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[Webhook WA] Error:", err.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// api.co.id kadang GET untuk verifikasi webhook aktif
export async function GET(req: NextRequest) {
  // Beberapa provider pakai challenge verification
  const url = new URL(req.url);
  const challenge = url.searchParams.get("hub.challenge") 
                 ?? url.searchParams.get("challenge");

  if (challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({
    ok: true,
    service: "KJK PT. Elsewedy Electric Indonesia — WA Webhook",
  });
}
