import { NextResponse } from "next/server";
import { notifPinjamanLunas } from "@/lib/notification/whatsapp";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const noHp = url.searchParams.get("phone");

  if (!noHp) {
    return NextResponse.json({ error: "Masukkan parameter ?phone=08xxxxx" });
  }

  // Tes kirim template notifikasi lunas
  const result = await notifPinjamanLunas({
    noHp: noHp,
    nama: "Arman Penguji",
    nomorKontrak: "CTR-TEST-001",
    tanggalLunas: new Date().toISOString(),
  });

  return NextResponse.json({ result });
}
