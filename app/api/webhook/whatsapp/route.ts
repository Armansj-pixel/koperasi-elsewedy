// app/api/webhook/whatsapp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handlePesanMasuk } from "@/lib/notification/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let jsonBody: any = {};
    try { jsonBody = JSON.parse(rawBody); } catch { jsonBody = {}; }

    // ── Verifikasi Signature dari api.co.id ──────────────────────────
    const signature = req.headers.get("x-webhook-signature") ?? "";
    const expectedSecret = process.env.APICODE_WEBHOOK_SECRET ?? "";

    if (expectedSecret && signature !== expectedSecret) {
      console.warn("[Webhook WA] Unauthorized — signature tidak cocok");
      return NextResponse.json({ ok: false, reason: "Unauthorized" }, { status: 401 });
    }

    // ── Skip event non-pesan ─────────────────────────────────────────
    const eventType = jsonBody.event_type ?? "";

    if (eventType === "test") {
      return NextResponse.json({ ok: true, note: "Test event received" });
    }

    // ── Ekstrak sender & message ──────────────────────────────────────
    // Format dikonfirmasi dari log:
    // data.customer_phone = nomor pengirim
    // data.content        = isi pesan
    // data.direction      = "inbound" / "outbound"
    // data.message_type   = "text" / "image" / dll
    const sender      = jsonBody?.data?.customer_phone ?? jsonBody?.data?.raw?.from ?? "";
    const message     = jsonBody?.data?.content        ?? jsonBody?.data?.raw?.text?.body ?? "";
    const direction   = jsonBody?.data?.direction      ?? "";
    const messageType = jsonBody?.data?.message_type   ?? "";

    // Hanya proses pesan teks masuk dari anggota
    if (direction === "outbound") {
      return NextResponse.json({ ok: true, note: "Outbound skipped" });
    }

    if (messageType !== "text") {
      console.log("[Webhook WA] Non-text dilewati:", messageType);
      return NextResponse.json({ ok: true, note: "Non-text skipped" });
    }

    if (!sender || !message) {
      console.log("[Webhook WA] Sender/message kosong:", { sender, message });
      return NextResponse.json({ ok: true, note: "Empty message skipped" });
    }

    console.log("[Webhook WA] Proses pesan dari:", sender, "→", message);
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
