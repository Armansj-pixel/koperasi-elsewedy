"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function MemberModeSync({ currentView, isPengurus }: { currentView?: string, isPengurus: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Jika user bukan pengurus, komponen ini tidak perlu bekerja.
    if (!isPengurus) return;

    // Ambil state localStorage
    const isMemberMode = localStorage.getItem("kop_member_mode") === "true";
    const hasPersonalView = currentView === "personal";

    // Kondisi 1: Tombol Member aktif, tapi URL belum diubah
    if (isMemberMode && !hasPersonalView) {
      const params = new URLSearchParams(searchParams);
      params.set("view", "personal");
      router.replace(`${pathname}?${params.toString()}`);
    } 
    // Kondisi 2: Tombol Member mati, tapi URL masih menyangkut di "personal"
    else if (!isMemberMode && hasPersonalView) {
      const params = new URLSearchParams(searchParams);
      params.delete("view");
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [isPengurus, currentView, pathname, router, searchParams]);

  return null; // Komponen siluman (invisible)
}
