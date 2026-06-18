// =====================================================================
// GET ALL ANGGOTA (DENGAN TOTAL SIMPANAN & PINJAMAN)
// =====================================================================

export async function getAnggotaList(search?: string) {
  await requireRole(["SUPERADMIN", "SEKRETARIS", "BENDAHARA", "KETUA"]);
  const supabase = createServiceClient();

  // AMBIL DATA USER
  // Saya membuang kolom 'is_active', 'simpanan_bulanan', dan 'last_login_at' 
  // dari .select karena sering menyebabkan error "column not found" di Supabase. 
  // Kita tarik data dasarnya dulu menggunakan wildcard (*).
  let query = supabase
    .from("users")
    .select("*")
    .order("nama", { ascending: true });

  if (search) {
    query = query.or(
      `nik.ilike.%${search}%,nama.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  const { data: users, error } = await query;

  if (error) {
    console.error("GET ANGGOTA LIST ERROR:", error);
    return { success: false, error: error.message, data: [] };
  }

  // AMBIL DATA TOTAL SIMPANAN
  const { data: saldoList } = await supabase
    .from("saldo_simpanan")
    .select("user_id, total_saldo, saldo_pokok, saldo_wajib, saldo_sukarela");

  // AMBIL DATA TOTAL PINJAMAN (Jika tabelnya ada)
  // Menggunakan maybeSingle() atau select biasa tergantung struktur DB Anda.
  // Jika tabel saldo_pinjaman belum ada, ini akan aman dan mengembalikan null/kosong.
  const { data: pinjamanList } = await supabase
    .from("saldo_pinjaman") // Sesuaikan dengan nama tabel pinjaman Anda
    .select("user_id, sisa_pokok, sisa_margin")
    .catch(() => ({ data: [] })); // Tangkap error jika tabel belum ada

  // GABUNGKAN DATA
  const data = (users || []).map((user: any) => {
    // 1. Hitung Simpanan
    const saldo = saldoList?.find((s) => s.user_id === user.id);
    const total_saldo = Number(saldo?.total_saldo || 0);

    // 2. Hitung Pinjaman (Pokok + Margin)
    const pinjaman = pinjamanList?.find((p) => p.user_id === user.id);
    const sisa_pinjaman = Number(pinjaman?.sisa_pokok || 0) + Number(pinjaman?.sisa_margin || 0);

    // 3. Tangani kolom yang mungkin tidak ada di DB untuk mencegah error mapping di UI
    const simpanan_bulanan = Number(user.simpanan_wajib_bulanan || user.simpanan_bulanan || 0);
    const is_active = user.is_active !== undefined ? user.is_active : true;

    return {
      ...user,
      total_saldo,
      sisa_pinjaman,
      simpanan_bulanan,
      is_active,
    };
  });

  return { success: true, data };
}
