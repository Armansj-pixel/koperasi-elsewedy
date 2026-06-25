import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Skip middleware untuk setup & API routes tertentu (TERMASUK WEBHOOK WA)
  const skipPaths = [
    "/api/setup",
    "/api/test-connection",
    "/api/sync-auth-user",
    "/api/webhook", // <-- INI PINTU MASUK UNTUK FONNTE
    "/api/test-wa", // <-- (Opsional) jika Anda masih pakai API tester tadi
  ];

  const shouldSkip = skipPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (shouldSkip) {
    return; // Langsung lolos, tidak perlu cek sesi login
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
