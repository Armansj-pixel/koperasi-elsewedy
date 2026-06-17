import { getViewMode } from "@/lib/auth/view-mode";
import { requireRole } from "@/lib/auth/session";
import Sidebar from "@/components/Sidebar"; // Asumsi Anda punya komponen Sidebar

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 1. Ambil session user
  const user = await requireRole(["ANGGOTA", "BENDAHARA", "SEKRETARIS", "KETUA", "SUPERADMIN"]);
  
  // 2. Ambil view mode (Admin/Personal)
  const viewMode = await getViewMode();
  
  // 3. Tentukan apakah dia pengurus
  const isPengurus = ["BENDAHARA", "SEKRETARIS", "KETUA", "SUPERADMIN"].includes(user.role);
  
  // 4. Mode Personal hanya aktif jika dia Pengurus DAN memilih mode 'PERSONAL'
  const isPersonalMode = isPengurus && viewMode === "PERSONAL";

  return (
    <div className="flex h-screen">
      {/* Kirim status mode ke Sidebar */}
      <Sidebar isPersonalMode={isPersonalMode} />
      
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
