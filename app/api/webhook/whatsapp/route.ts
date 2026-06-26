// app/api/webhook/whatsapp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handlePesanMasuk } from "@/lib/notification/whatsapp";

export async function POST(req: NextRequest) {
  try {
    // Log semua headers untuk debug
    const headersObj: Record<string, string> = {};
    req.headers.forEach((value, key) => { headersObj[key] = value; });
    console.log("[Webhook WA] Headers:", JSON.stringify(headersObj));

    // Log raw body untuk debug format payload api.co.id
    const rawBody = await req.text();
    console.log("[Webhook WA] Raw Body:", rawBody);

    // Parse body
    let jsonBody: any = {};
    try { jsonBody = JSON.parse(rawBody); } catch { jsonBody = {}; }

    // Log struktur lengkap
    console.log("[Webhook WA] Parsed:", JSON.stringify(jsonBody, null, 2));

    // Verifikasi secret
    const secret = headersObj["x-webhook-secret"]
                ?? headersObj["x-hub-signature-256"]
                ?? headersObj["authorization"]
                ?? "";
    const expectedSecret = process.env.APICODE_WEBHOOK_SECRET ?? "";

    if (expectedSecret && !secret.includes(expectedSecret)) {
      console.warn("[Webhook WA] Unauthorized");
      return NextResponse.json({ ok: false, reason: "Unauthorized" }, { status: 401 });
    }

    // Coba berbagai kemungkinan field nama sender & message
    // dari berbagai format payload WhatsApp Cloud API
    const sender =
      jsonBody.sender ??
      jsonBody.from ??
      jsonBody.pengirim ??
      jsonBody?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from ??
      jsonBody?.messages?.[0]?.from ??
      "";

    const message =
      jsonBody.message ??
      jsonBody.text ??
      jsonBody.pesan ??
      jsonBody?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body ??
      jsonBody?.messages?.[0]?.text?.body ??
      jsonBody?.messages?.[0]?.text ??
      "";

    console.log("[Webhook WA] Extracted:", { sender, message });

    // Jika masih kosong, return 200 saja (jangan 400)
    // supaya api.co.id tidak anggap webhook gagal
    if (!sender || !message) {
      console.log("[Webhook WA] No sender/message — mungkin event lain (status update, dll)");
      return NextResponse.json({ ok: true, note: "No message to process" });
    }

    await handlePesanMasuk({ noHp: sender, pesan: message });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[Webhook WA] Error:", err.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
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
