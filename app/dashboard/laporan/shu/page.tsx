// app/dashboard/laporan/shu/page.tsx
// Server component — fetch data, pass ke SHUClient

import { requireRole } from "@/lib/auth/session";
import { getLaporanLabaRugi } from "@/lib/akuntansi/laporan";
import { getCekTutupBuku, getKonfigurasiSHU, eksekusiTutupBuku } from "./actions";
import SHUClient from "./SHUClient"; // Pindahkan shu-client.tsx ke sini

const TAHUN_INI = new Date().getFullYear();

// Server Action wrapper — bisa dipassing sebagai prop ke Client Component
async function handleEksekusi(config: {
  pct_dana_cadangan: number;
  pct_modal_koperasi: number;
  pct_parsel_lebaran: number;
}) {
  "use server";
  return eksekusiTutupBuku(new Date().getFullYear(), config);
}

export default async function SHUPage({
  searchParams,
}: {
  searchParams: { tahun?: string };
}) {
  await requireRole(["SUPERADMIN", "BENDAHARA"]);

  const tahun = parseInt(searchParams.tahun ?? String(TAHUN_INI));

  const [labaRugi, tutupBuku, config] = await Promise.all([
    getLaporanLabaRugi(tahun),
    getCekTutupBuku(tahun),
    getKonfigurasiSHU(),
  ]);

  const shuBersih = labaRugi.data?.shu_bersih ?? 0;

  return (
    <SHUClient
      tahun={tahun}
      sudahTutup={tutupBuku.sudahTutup}
      shuBersih={shuBersih}
      defaultConfig={config}
      onEksekusi={handleEksekusi}
    />
  );
}
