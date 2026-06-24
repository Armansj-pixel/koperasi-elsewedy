import { createServiceClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";

// =====================================================================
// ENGINE: MENGHITUNG SALDO BUKU BESAR BERDASARKAN PREFIX KODE AKUN
// =====================================================================
async function getLaporanKeuangan() {
  const supabase = createServiceClient();

  // Ambil semua detail jurnal beserta metadata akunnya
  const { data: jurnalData } = await supabase
    .from("jurnal_detail")
    .select(`
      debit, 
      kredit,
      akun:kode_akun (kode_akun, nama_akun)
    `);

  // Struktur penampung saldo per akun
  const saldoAkun: Record<string, { kode: string; nama: string; saldo: number }> = {};

  jurnalData?.forEach((baris: any) => {
    if (!baris.akun) return;
    const kode = baris.akun.kode_akun;
    
    if (!saldoAkun[kode]) {
      saldoAkun[kode] = { kode, nama: baris.akun.nama_akun, saldo: 0 };
    }

    // Aturan Saldo Normal Akuntansi:
    // Harta (1) & Beban (5) bertambah di Debit
    if (kode.startsWith("1") || kode.startsWith("5")) {
      saldoAkun[kode].saldo += (baris.debit - baris.kredit);
    } 
    // Kewajiban (2), Modal (3), Pendapatan (4) bertambah di Kredit
    else if (kode.startsWith("2") || kode.startsWith("3") || kode.startsWith("4")) {
      saldoAkun[kode].saldo += (baris.kredit - baris.debit);
    }
  });

  // Mengelompokkan berdasarkan Laporan
  const aset = Object.values(saldoAkun).filter(a => a.kode.startsWith("1"));
  const kewajiban = Object.values(saldoAkun).filter(a => a.kode.startsWith("2"));
  const modal = Object.values(saldoAkun).filter(a => a.kode.startsWith("3"));
  const pendapatan = Object.values(saldoAkun).filter(a => a.kode.startsWith("4"));
  const beban = Object.values(saldoAkun).filter(a => a.kode.startsWith("5"));

  // Kalkulasi Total
  const totalPendapatan = pendapatan.reduce((sum, a) => sum + a.saldo, 0);
  const totalBeban = beban.reduce((sum, a) => sum + a.saldo, 0);
  const labaBersih = totalPendapatan - totalBeban; // INI YANG AKAN JADI SHU

  const totalAset = aset.reduce((sum, a) => sum + a.saldo, 0);
  const totalKewajiban = kewajiban.reduce((sum, a) => sum + a.saldo, 0);
  const totalModal = modal.reduce((sum, a) => sum + a.saldo, 0);

  return { 
    aset, kewajiban, modal, pendapatan, beban, 
    totalPendapatan, totalBeban, labaBersih, 
    totalAset, totalKewajiban, totalModal 
  };
}

// =====================================================================
// KOMPONEN UI: LAPORAN KEUANGAN DETAIL (SERVER COMPONENT)
// =====================================================================
export default async function LaporanKeuanganPage() {
  await requireRole(["SUPERADMIN", "BENDAHARA", "KETUA"]);
  const laporan = await getLaporanKeuangan();

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(angka);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-slate-800">Laporan Keuangan Detail</h1>
        <p className="text-slate-500">Neraca & Laba Rugi Koperasi Karyawan Elsewedy (Real-time)</p>
      </div>

      {/* ========================================== */}
      {/* 1. LAPORAN LABA RUGI (INCOME STATEMENT)    */}
      {/* ========================================== */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-blue-900 text-white p-4">
          <h2 className="text-xl font-bold">Laporan Laba Rugi</h2>
        </div>
        
        <div className="p-0">
          <table className="w-full text-left border-collapse">
            <tbody>
              {/* PENDAPATAN */}
              <tr className="bg-slate-50 font-semibold text-slate-700 border-b"><td colSpan={2} className="p-3">PENDAPATAN (4)</td></tr>
              {laporan.pendapatan.map(akun => (
                <tr key={akun.kode} className="border-b hover:bg-slate-50">
                  <td className="p-3 pl-8 text-sm">{akun.kode} - {akun.nama}</td>
                  <td className="p-3 text-right text-sm font-medium">{formatRupiah(akun.saldo)}</td>
                </tr>
              ))}
              <tr className="font-bold text-blue-700 bg-blue-50 border-b">
                <td className="p-3 pl-8">Total Pendapatan</td>
                <td className="p-3 text-right">{formatRupiah(laporan.totalPendapatan)}</td>
              </tr>

              {/* BEBAN */}
              <tr className="bg-slate-50 font-semibold text-slate-700 border-b"><td colSpan={2} className="p-3">BEBAN / BIAYA (5)</td></tr>
              {laporan.beban.map(akun => (
                <tr key={akun.kode} className="border-b hover:bg-slate-50">
                  <td className="p-3 pl-8 text-sm">{akun.kode} - {akun.nama}</td>
                  <td className="p-3 text-right text-sm font-medium text-red-600">({formatRupiah(akun.saldo)})</td>
                </tr>
              ))}
              <tr className="font-bold text-red-700 bg-red-50 border-b">
                <td className="p-3 pl-8">Total Beban</td>
                <td className="p-3 text-right">({formatRupiah(laporan.totalBeban)})</td>
              </tr>

              {/* LABA BERSIH (SHU) */}
              <tr className="bg-green-100 font-extrabold text-green-800 text-lg">
                <td className="p-4">LABA BERSIH (Proyeksi SHU)</td>
                <td className="p-4 text-right">{formatRupiah(laporan.labaBersih)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================== */}
      {/* 2. NERACA (BALANCE SHEET)                  */}
      {/* ========================================== */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 text-white p-4">
          <h2 className="text-xl font-bold">Neraca (Balance Sheet)</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* KOLOM KIRI: ASET */}
          <div className="border-r border-slate-200">
            <table className="w-full text-left">
              <tbody>
                <tr className="bg-slate-50 font-semibold text-slate-700 border-b"><td colSpan={2} className="p-3">AKTIVA / ASET (1)</td></tr>
                {laporan.aset.map(akun => (
                  <tr key={akun.kode} className="border-b hover:bg-slate-50">
                    <td className="p-3 pl-6 text-sm">{akun.kode} - {akun.nama}</td>
                    <td className="p-3 text-right text-sm font-medium">{formatRupiah(akun.saldo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* KOLOM KANAN: KEWAJIBAN & MODAL */}
          <div>
            <table className="w-full text-left">
              <tbody>
                {/* KEWAJIBAN */}
                <tr className="bg-slate-50 font-semibold text-slate-700 border-b"><td colSpan={2} className="p-3">PASIVA / KEWAJIBAN (2)</td></tr>
                {laporan.kewajiban.map(akun => (
                  <tr key={akun.kode} className="border-b hover:bg-slate-50">
                    <td className="p-3 pl-6 text-sm">{akun.kode} - {akun.nama}</td>
                    <td className="p-3 text-right text-sm font-medium">{formatRupiah(akun.saldo)}</td>
                  </tr>
                ))}
                
                {/* MODAL */}
                <tr className="bg-slate-50 font-semibold text-slate-700 border-y"><td colSpan={2} className="p-3 mt-4">EKUITAS / MODAL (3)</td></tr>
                {laporan.modal.map(akun => (
                  <tr key={akun.kode} className="border-b hover:bg-slate-50">
                    <td className="p-3 pl-6 text-sm">{akun.kode} - {akun.nama}</td>
                    <td className="p-3 text-right text-sm font-medium">{formatRupiah(akun.saldo)}</td>
                  </tr>
                ))}
                
                {/* LABA TAHUN BERJALAN DITAMBAHKAN KE MODAL AGAR BALANCE */}
                <tr className="border-b bg-green-50">
                  <td className="p-3 pl-6 text-sm font-bold text-green-700">Laba Tahun Berjalan (SHU)</td>
                  <td className="p-3 text-right text-sm font-bold text-green-700">{formatRupiah(laporan.labaBersih)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER TOTAL NERACA (VALIDASI BALANCE) */}
        <div className="grid grid-cols-1 md:grid-cols-2 bg-slate-100 font-extrabold text-slate-800 border-t-2 border-slate-300">
          <div className="p-4 flex justify-between border-r border-slate-300">
            <span>TOTAL AKTIVA</span>
            <span>{formatRupiah(laporan.totalAset)}</span>
          </div>
          <div className="p-4 flex justify-between">
            <span>TOTAL PASIVA + EKUITAS</span>
            <span>{formatRupiah(laporan.totalKewajiban + laporan.totalModal + laporan.labaBersih)}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
