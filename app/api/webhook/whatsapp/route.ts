// app/api/webhook/whatsapp/route.ts
// Verifikasi signature menggunakan HMAC-SHA256 sesuai dokumentasi api.co.id

import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { handlePesanMasuk } from "@/lib/notification/whatsapp";

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;
  try {
    const expected = createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");
    return timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Baca raw body SEBELUM parse (signature dihitung dari raw bytes)
    const rawBody = await req.text();
    let jsonBody: any = {};
    try { jsonBody = JSON.parse(rawBody); } catch { jsonBody = {}; }

    // ── Verifikasi HMAC-SHA256 ────────────────────────────────────────
    const signature = req.headers.get("x-webhook-signature") ?? "";
    const secret = process.env.APICODE_WEBHOOK_SECRET ?? "";

    if (secret && !verifySignature(rawBody, signature, secret)) {
      console.warn("[Webhook WA] Signature tidak valid — request ditolak");
      return NextResponse.json({ ok: false, reason: "Invalid signature" }, { status: 403 });
    }

    // ── Skip event non-pesan ─────────────────────────────────────────
    const eventType = jsonBody.event_type ?? "";

    if (eventType === "test") {
      console.log("[Webhook WA] Test event — OK");
      return NextResponse.json({ ok: true });
    }

    if (eventType !== "message.received") {
      console.log("[Webhook WA] Skip event:", eventType);
      return NextResponse.json({ ok: true });
    }

    // ── Ekstrak data pesan ────────────────────────────────────────────
    // Format dikonfirmasi dari log: data.customer_phone & data.content
    const sender      = jsonBody?.data?.customer_phone ?? "";
    const message     = jsonBody?.data?.content        ?? "";
    const direction   = jsonBody?.data?.direction      ?? "";
    const messageType = jsonBody?.data?.message_type   ?? "";

    // Hanya proses pesan teks masuk
    if (direction !== "inbound") {
      return NextResponse.json({ ok: true, note: "Outbound skipped" });
    }

    if (messageType !== "text") {
      console.log("[Webhook WA] Non-text dilewati:", messageType);
      return NextResponse.json({ ok: true, note: "Non-text skipped" });
    }

    if (!sender || !message) {
      return NextResponse.json({ ok: true, note: "Empty message" });
    }

    console.log("[Webhook WA] Pesan dari:", sender, "→", message);

    // Proses self-service
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
