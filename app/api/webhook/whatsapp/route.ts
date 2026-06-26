// app/api/webhook/whatsapp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handlePesanMasuk } from "@/lib/notification/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let jsonBody: any = {};
    try { jsonBody = JSON.parse(rawBody); } catch { jsonBody = {}; }

    // ── Verifikasi Signature dari api.co.id ──────────────────────────
    // Secret dikirim di header x-webhook-signature
    const signature = req.headers.get("x-webhook-signature") ?? "";
    const expectedSecret = process.env.APICODE_WEBHOOK_SECRET ?? "";

    if (expectedSecret && signature !== expectedSecret) {
      console.warn("[Webhook WA] Unauthorized — signature tidak cocok");
      return NextResponse.json({ ok: false, reason: "Unauthorized" }, { status: 401 });
    }

    // ── Skip event non-pesan (test, status update, dll) ──────────────
    const eventType = jsonBody.event_type ?? jsonBody.type ?? "";

    if (eventType === "test") {
      console.log("[Webhook WA] Test event diterima — OK");
      return NextResponse.json({ ok: true, note: "Test event received" });
    }

    // ── Ekstrak sender & message ──────────────────────────────────────
    // Format pesan masuk WA via api.co.id (Official Cloud API)
    // Struktur mengikuti Meta WhatsApp Cloud API webhook format
    const sender =
      jsonBody.sender ??
      jsonBody.from ??
      jsonBody?.data?.from ??
      jsonBody?.data?.sender ??
      jsonBody?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from ??
      jsonBody?.messages?.[0]?.from ??
      "";

    const message =
      jsonBody.message ??
      jsonBody.text ??
      jsonBody?.data?.message ??
      jsonBody?.data?.text ??
      jsonBody?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body ??
      jsonBody?.messages?.[0]?.text?.body ??
      jsonBody?.messages?.[0]?.text ??
      "";

    console.log("[Webhook WA] Event:", eventType, "| Sender:", sender, "| Message:", message);

    if (!sender || !message) {
      console.log("[Webhook WA] Bukan pesan teks — dilewati:", JSON.stringify(jsonBody));
      return NextResponse.json({ ok: true, note: "Non-message event skipped" });
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
