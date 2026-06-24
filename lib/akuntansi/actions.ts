"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// =====================================================================
// HELPER: GENERATE NOMOR BUKTI SEQUENTIAL (AUDIT READY)
// Format: PREFIX-YYYYMM-0001
// =====================================================================
export async function generateNomorBukti(prefix: string, tanggal: string) {
  const supabase = createServiceClient();
  const dateObj = new Date(tanggal);
  const yyyymm = `${dateObj.getFullYear()}${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
  const searchPrefix = `${prefix}-${yyyymm}-`;

  const { data } = await supabase
    .from('jurnal_induk')
    .select('nomor_bukti')
    .like('nomor_bukti', `${searchPrefix}%`)
    .order('nomor_bukti', { ascending: false })
    .limit(1);

  let seq = 1;
  if (data && data.length > 0) {
    const lastSeqStr = data[0].nomor_bukti.split('-').pop();
    seq = parseInt(lastSeqStr || '0') + 1;
  }
  return `${searchPrefix}${String(seq).padStart(4, '0')}`;
}

// =====================================================================
// CORE ENGINE: BUAT JURNAL UMUM (ATOMIC & IDEMPOTENT)
// =====================================================================
interface JurnalLineInput {
  kode_akun: string; 
  debit: number;
  kredit: number;
  user_id?: string;  
}

interface BuatJurnalInput {
  nomor_bukti?: string;      
  prefix_bukti?: string;     // Gunakan ini untuk auto-generate nomor bukti
  tanggal_transaksi: string; 
  keterangan: string;
  jenis_sumber: string;      // Fleksibel untuk berbagai jenis modul
  id_sumber?: string;        
  lines: JurnalLineInput[];
}

export async function buatJurnalUmum(input: BuatJurnalInput) {
  const session = await requireRole(["BENDAHARA", "SUPERADMIN", "SEKRETARIS"]);
  const supabase = createServiceClient();

  const { prefix_bukti, tanggal_transaksi, keterangan, jenis_sumber, id_sumber, lines } = input;

  // 1. Validasi Keamanan: Hitung total Balance
  let totalDebit = 0;
  let totalKredit = 0;

  for (const line of lines) {
    totalDebit += line.debit;
    totalKredit += line.kredit;
  }

  if (Math.round(totalDebit) !== Math.round(totalKredit)) {
    return { success: false, error: `Jurnal Unbalanced! Debit: ${totalDebit}, Kredit: ${totalKredit}` };
  }

  try {
    // 2. Tentukan Nomor Bukti (Auto Generate jika ada prefix)
    let finalNomorBukti = input.nomor_bukti;
    if (prefix_bukti) {
      finalNomorBukti = await generateNomorBukti(prefix_bukti, tanggal_transaksi);
    }

    if (!finalNomorBukti) return { success: false, error: "Nomor bukti atau prefix harus diisi." };

    // 3. Cek Idempotency (Cegah Jurnal Ganda jika diklik 2x)
    const { data: exist } = await supabase
      .from("jurnal_induk")
      .select("id")
      .eq("nomor_bukti", finalNomorBukti)
      .maybeSingle();

    if (exist) {
      return { success: true, jurnalIndukId: exist.id, message: "Jurnal sudah ada (Idempotent)." };
    }

    // 4. Map Kode Akun ke ID Akun
    const { data: listAkun } = await supabase.from("akun_perkiraan").select("id, kode_akun");
    if (!listAkun) return { success: false, error: "Gagal mengambil Chart of Accounts." };
    const akunMap = new Map(listAkun.map((a) => [a.kode_akun, a.id]));

    const formattedLines = lines.map((line) => {
      const akunId = akunMap.get(line.kode_akun);
      if (!akunId) throw new Error(`Kode akun '${line.kode_akun}' tidak valid.`);
      return {
        akun_id: akunId,
        debit: line.debit,
        kredit: line.kredit,
        user_id: line.user_id || null,
      };
    });

    // 5. Atomic Insert menggunakan Stored Procedure (Data tidak akan bocor/korup)
    const { data: rpcData, error: rpcError } = await supabase.rpc('insert_jurnal_atomic', {
      p_nomor_bukti: finalNomorBukti,
      p_tanggal: tanggal_transaksi,
      p_keterangan: keterangan,
      p_jenis_sumber: jenis_sumber,
      p_id_sumber: id_sumber || null,
      p_created_by: session.id,
      p_lines: formattedLines
    });

    if (rpcError) throw new Error(`Database Error: ${rpcError.message}`);

    revalidatePath("/dashboard/akuntansi");
    return { success: true, jurnalIndukId: rpcData };

  } catch (err: any) {
    return { success: false, error: err.message || "Terjadi kesalahan sistem akuntansi." };
  }
}

// =====================================================================
// AMBIL DATA DAFTAR COA
// =====================================================================
export async function getChartOfAccounts() {
  await requireRole(["BENDAHARA", "SUPERADMIN", "SEKRETARIS", "KETUA"]);
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("akun_perkiraan").select("*").order("kode_akun", { ascending: true });
  return { data: data || [], error: error?.message || null };
}

// =====================================================================
// 1. ACTION: TOP-UP KAS KECIL (TARIK TUNAI DARI BANK)
// =====================================================================
const TopUpSchema = z.object({
  nominal: z.coerce.number().min(1000, "Minimal tarik tunai Rp 1.000"),
  sumber_bank: z.string().min(1, "Sumber bank wajib dipilih"),
  tanggal: z.string(),
  keterangan: z.string().optional()
});

export async function topUpKasKecil(formData: FormData) {
  const session = await requireRole(["BENDAHARA", "SUPERADMIN"]);
  
  const raw = {
    nominal: formData.get("nominal"),
    sumber_bank: formData.get("sumber_bank") as string || "102-MND",
    tanggal: (formData.get("tanggal") as string) || new Date().toISOString().split("T")[0],
    keterangan: formData.get("keterangan") as string || "Tarik tunai untuk pengisian Kas Kecil"
  };

  const parsed = TopUpSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const { nominal, sumber_bank, tanggal, keterangan } = parsed.data;

  const result = await buatJurnalUmum({
    prefix_bukti: `CASHTOPUP`, 
    tanggal_transaksi: tanggal,
    keterangan: keterangan || "Tarik tunai untuk pengisian Kas Kecil", 
    jenis_sumber: 'MANUAL',
    lines: [
      { kode_akun: '101', debit: nominal, kredit: 0 },         
      { kode_akun: sumber_bank, debit: 0, kredit: nominal }    
    ]
  });

  return result;
}

// =====================================================================
// 2. ACTION: PENGELUARAN BIAYA OPERASIONAL
// =====================================================================
const PengeluaranSchema = z.object({
  nominal: z.coerce.number().min(500, "Minimal pengeluaran Rp 500"),
  akun_biaya: z.string().min(1, "Jenis biaya wajib dipilih"),
  sumber_dana: z.enum(['101', '102-MND', '102-MAY', '102-BRIS']),
  tanggal: z.string(),
  keterangan: z.string().min(3, "Keterangan pengeluaran wajib diisi")
});

export async function catatPengeluaranOperasional(formData: FormData) {
  const session = await requireRole(["BENDAHARA", "SUPERADMIN"]);
  
  const raw = {
    nominal: formData.get("nominal"),
    akun_biaya: formData.get("akun_biaya") as string,
    sumber_dana: formData.get("sumber_dana") as string || "101",
    tanggal: (formData.get("tanggal") as string) || new Date().toISOString().split("T")[0],
    keterangan: formData.get("keterangan") as string
  };

  const parsed = PengeluaranSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const { nominal, akun_biaya, sumber_dana, tanggal, keterangan } = parsed.data;

  const result = await buatJurnalUmum({
    prefix_bukti: `EXP`, 
    tanggal_transaksi: tanggal,
    keterangan: keterangan,
    jenis_sumber: 'MANUAL',
    lines: [
      { kode_akun: akun_biaya, debit: nominal, kredit: 0 },      
      { kode_akun: sumber_dana, debit: 0, kredit: nominal }      
    ]
  });

  return result;
}

// =====================================================================
// 3. ACTION: CATAT PEMASUKAN / PENDAPATAN LAINNYA
// =====================================================================
const PendapatanSchema = z.object({
  nominal: z.coerce.number().min(500, "Minimal pendapatan Rp 500"),
  akun_pendapatan: z.string().min(1, "Jenis pendapatan wajib dipilih"),
  tujuan_dana: z.enum(['101', '102-MND', '102-MAY', '102-BRIS']),
  tanggal: z.string(),
  keterangan: z.string().min(3, "Keterangan pendapatan wajib diisi")
});

export async function catatPendapatanLain(formData: FormData) {
  const session = await requireRole(["BENDAHARA", "SUPERADMIN"]);
  
  const raw = {
    nominal: formData.get("nominal"),
    akun_pendapatan: formData.get("akun_pendapatan") as string,
    tujuan_dana: formData.get("tujuan_dana") as string || "102-MND",
    tanggal: (formData.get("tanggal") as string) || new Date().toISOString().split("T")[0],
    keterangan: formData.get("keterangan") as string
  };

  const parsed = PendapatanSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const { nominal, akun_pendapatan, tujuan_dana, tanggal, keterangan } = parsed.data;

  const result = await buatJurnalUmum({
    prefix_bukti: `INC`, 
    tanggal_transaksi: tanggal,
    keterangan: keterangan,
    jenis_sumber: 'MANUAL',
    lines: [
      { kode_akun: tujuan_dana, debit: nominal, kredit: 0 },         
      { kode_akun: akun_pendapatan, debit: 0, kredit: nominal }      
    ]
  });

  return result;
}

// =====================================================================
// GET LAPORAN JURNAL UMUM
// =====================================================================
export async function getJurnalUmum(limit = 100) {
  await requireRole(["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS"]);
  const supabase = createServiceClient();
  
  const { data, error } = await supabase
    .from("jurnal_induk")
    .select(`
      id, nomor_bukti, tanggal_transaksi, keterangan, jenis_sumber, created_at,
      jurnal_rincian (
        id, debit, kredit,
        akun_perkiraan ( kode_akun, nama_akun )
      )
    `)
    .order("tanggal_transaksi", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  return { data: data || [], error: error?.message };
}

// =====================================================================
// GET NERACA SALDO (TRIAL BALANCE) DENGAN FILTER PERIODE
// =====================================================================
export async function getNeracaSaldo(startDate?: string, endDate?: string) {
  await requireRole(["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS"]);
  const supabase = createServiceClient();

  const { data: accounts } = await supabase
    .from("akun_perkiraan")
    .select("*")
    .order("kode_akun", { ascending: true });
  
  if (!accounts) return { data: [] };

  // Tarik rincian jurnal beserta tanggal dari jurnal induk
  let query = supabase.from("jurnal_rincian").select("akun_id, debit, kredit, jurnal_induk!inner(tanggal_transaksi)");

  // Terapkan cut-off filter periode jika ada
  if (startDate) query = query.gte("jurnal_induk.tanggal_transaksi", startDate);
  if (endDate) query = query.lte("jurnal_induk.tanggal_transaksi", endDate);

  const { data: rincian } = await query;

  const neraca = accounts.map(akun => {
    const trxs = rincian?.filter(r => r.akun_id === akun.id) || [];
    const totalDebit = trxs.reduce((sum, t) => sum + Number(t.debit), 0);
    const totalKredit = trxs.reduce((sum, t) => sum + Number(t.kredit), 0);
    
    let saldo_akhir = 0;
    if (akun.saldo_normal === 'DEBIT') {
      saldo_akhir = totalDebit - totalKredit;
    } else {
      saldo_akhir = totalKredit - totalDebit;
    }

    return {
      ...akun,
      total_debit: totalDebit,
      total_kredit: totalKredit,
      saldo_akhir
    };
  });

  const activeNeraca = neraca.filter(n => n.total_debit > 0 || n.total_kredit > 0 || n.saldo_akhir !== 0);

  return { data: activeNeraca };
}
