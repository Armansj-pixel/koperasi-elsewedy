import Link from "next/link";
import { ViewSwitcher } from "./ViewSwitcher";
import { getViewMode } from "@/lib/auth/view-mode";

export default async function Sidebar({ isPersonalMode }: { isPersonalMode: boolean }) {
  const currentMode = await getViewMode() as "ADMIN" | "PERSONAL";

  return (
    <aside style={{ width: "260px", backgroundColor: "#fff", borderRight: "1px solid #e2e8f0", padding: "20px", display: "flex", flexDirection: "column" }}>
      <div style={{ marginBottom: "30px", fontWeight: "700", fontSize: "18px", color: "#0f2d6b" }}>
        Koperasi Elsewedy
      </div>

      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
        <Link href="/dashboard" style={{ padding: "10px", textDecoration: "none", color: "#334155" }}>Dashboard</Link>
        
        {/* Menu Simpanan (Tampil untuk semua) */}
        <Link href="/dashboard/simpanan" style={{ padding: "10px", textDecoration: "none", color: "#334155" }}>Simpanan</Link>

        {/* Menu Khusus Admin (Hanya tampil jika TIDAK di Personal Mode) */}
        {!isPersonalMode && (
          <>
            <Link href="/dashboard/anggota" style={{ padding: "10px", textDecoration: "none", color: "#334155" }}>Data Anggota</Link>
            <Link href="/dashboard/laporan" style={{ padding: "10px", textDecoration: "none", color: "#334155" }}>Laporan Keuangan</Link>
            <Link href="/dashboard/settings" style={{ padding: "10px", textDecoration: "none", color: "#334155" }}>Pengaturan</Link>
          </>
        )}
      </nav>

      {/* Tombol Switch Mode */}
      <div style={{ marginTop: "auto", paddingTop: "20px", borderTop: "1px solid #f1f5f9" }}>
        <ViewSwitcher currentMode={currentMode} />
      </div>
    </aside>
  );
}
