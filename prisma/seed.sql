-- =====================================================================
-- INITIAL DATA: SETTING SISTEM
-- =====================================================================

INSERT INTO setting (key, value, type, description) VALUES
  ('koperasi_nama', 'Koperasi Karyawan PT Elsewedy Electric Indonesia', 'string', 'Nama koperasi'),
  ('limit_pinjaman_max', '15000000', 'number', 'Limit maksimal pinjaman'),
  ('tenor_pinjaman_max', '12', 'number', 'Tenor maksimal pinjaman (bulan)'),
  ('biaya_admin_persen', '4', 'number', 'Biaya admin pinjaman (%)'),
  ('topup_min_sisa_cicilan', '3', 'number', 'Minimum sisa cicilan untuk top-up'),
  ('tanggal_potong_gaji', '25', 'number', 'Tanggal auto-potong gaji'),
  ('hari_pencairan_simpanan', 'Kamis', 'string', 'Hari pencairan penarikan simpanan'),
  ('email_smtp_from', 'koperasi@elsewedy.co.id', 'string', 'Email pengirim'),
  ('email_smtp_host', 'smtp.gmail.com', 'string', 'SMTP host'),
  ('email_hr_recipient', 'hr@elsewedy.co.id', 'string', 'Email HR untuk report');

-- =====================================================================
-- CHART OF ACCOUNTS (COA) STANDAR KOPERASI - SAK ETAP
-- =====================================================================

-- 1xxx ASET
INSERT INTO chart_of_accounts (kode_akun, nama_akun, tipe, sub_tipe, saldo_normal, is_header) VALUES
  ('1000', 'ASET', 'ASET', 'ASET_LANCAR', 'debit', true),
  ('1100', 'Aset Lancar', 'ASET', 'ASET_LANCAR', 'debit', true),
  ('1101', 'Kas Tunai', 'ASET', 'ASET_LANCAR', 'debit', false),
  ('1102', 'Bank BCA', 'ASET', 'ASET_LANCAR', 'debit', false),
  ('1103', 'Bank Mandiri', 'ASET', 'ASET_LANCAR', 'debit', false),
  ('1104', 'Bank BRI', 'ASET', 'ASET_LANCAR', 'debit', false),
  ('1110', 'Piutang Pinjaman Anggota', 'ASET', 'ASET_LANCAR', 'debit', false),
  ('1120', 'Piutang Lain-lain', 'ASET', 'ASET_LANCAR', 'debit', false),
  ('1200', 'Aset Tetap', 'ASET', 'ASET_TETAP', 'debit', true),
  ('1201', 'Peralatan Kantor', 'ASET', 'ASET_TETAP', 'debit', false),
  ('1202', 'Akumulasi Penyusutan Peralatan', 'ASET', 'ASET_TETAP', 'kredit', false),
  ('1203', 'Komputer & Laptop', 'ASET', 'ASET_TETAP', 'debit', false),
  ('1204', 'Akumulasi Penyusutan Komputer', 'ASET', 'ASET_TETAP', 'kredit', false);

-- 2xxx KEWAJIBAN
INSERT INTO chart_of_accounts (kode_akun, nama_akun, tipe, sub_tipe, saldo_normal, is_header) VALUES
  ('2000', 'KEWAJIBAN', 'KEWAJIBAN', 'KEWAJIBAN_LANCAR', 'kredit', true),
  ('2100', 'Kewajiban Lancar', 'KEWAJIBAN', 'KEWAJIBAN_LANCAR', 'kredit', true),
  ('2101', 'Simpanan Anggota', 'KEWAJIBAN', 'KEWAJIBAN_LANCAR', 'kredit', false),
  ('2102', 'Hutang Operasional', 'KEWAJIBAN', 'KEWAJIBAN_LANCAR', 'kredit', false),
  ('2103', 'Hutang Pajak', 'KEWAJIBAN', 'KEWAJIBAN_LANCAR', 'kredit', false),
  ('2104', 'SHU Belum Dibagi', 'KEWAJIBAN', 'KEWAJIBAN_LANCAR', 'kredit', false);

-- 3xxx MODAL
INSERT INTO chart_of_accounts (kode_akun, nama_akun, tipe, sub_tipe, saldo_normal, is_header) VALUES
  ('3000', 'MODAL', 'MODAL', 'MODAL_DASAR', 'kredit', true),
  ('3101', 'Simpanan Pokok', 'MODAL', 'MODAL_DASAR', 'kredit', false),
  ('3102', 'Simpanan Wajib', 'MODAL', 'MODAL_DASAR', 'kredit', false),
  ('3201', 'Cadangan Umum', 'MODAL', 'CADANGAN', 'kredit', false),
  ('3202', 'Cadangan Risiko', 'MODAL', 'CADANGAN', 'kredit', false),
  ('3301', 'SHU Tahun Berjalan', 'MODAL', 'SHU_BERJALAN', 'kredit', false),
  ('3302', 'SHU Tidak Dibagi', 'MODAL', 'SHU_TIDAK_DIBAGI', 'kredit', false);

-- 4xxx PENDAPATAN
INSERT INTO chart_of_accounts (kode_akun, nama_akun, tipe, sub_tipe, saldo_normal, is_header) VALUES
  ('4000', 'PENDAPATAN', 'PENDAPATAN', 'PENDAPATAN_OPERASIONAL', 'kredit', true),
  ('4101', 'Pendapatan Biaya Admin Pinjaman 4%', 'PENDAPATAN', 'PENDAPATAN_OPERASIONAL', 'kredit', false),
  ('4102', 'Pendapatan Denda Keterlambatan', 'PENDAPATAN', 'PENDAPATAN_OPERASIONAL', 'kredit', false),
  ('4103', 'Pendapatan Bunga Bank', 'PENDAPATAN', 'PENDAPATAN_OPERASIONAL', 'kredit', false),
  ('4201', 'Pendapatan Lain-lain', 'PENDAPATAN', 'PENDAPATAN_LAIN', 'kredit', false);

-- 5xxx BEBAN
INSERT INTO chart_of_accounts (kode_akun, nama_akun, tipe, sub_tipe, saldo_normal, is_header) VALUES
  ('5000', 'BEBAN', 'BEBAN', 'BEBAN_OPERASIONAL', 'debit', true),
  ('5101', 'Beban ATK', 'BEBAN', 'BEBAN_OPERASIONAL', 'debit', false),
  ('5102', 'Beban Konsumsi Rapat', 'BEBAN', 'BEBAN_OPERASIONAL', 'debit', false),
  ('5103', 'Beban Transportasi', 'BEBAN', 'BEBAN_OPERASIONAL', 'debit', false),
  ('5104', 'Beban Fotocopy', 'BEBAN', 'BEBAN_OPERASIONAL', 'debit', false),
  ('5105', 'Beban Sumbangan & Sosial', 'BEBAN', 'BEBAN_OPERASIONAL', 'debit', false),
  ('5201', 'Beban Penyusutan Peralatan', 'BEBAN', 'BEBAN_ADMIN', 'debit', false),
  ('5202', 'Beban Penyusutan Komputer', 'BEBAN', 'BEBAN_ADMIN', 'debit', false),
  ('5301', 'Beban Honor Pengurus', 'BEBAN', 'BEBAN_OPERASIONAL', 'debit', false),
  ('5401', 'Beban Lain-lain', 'BEBAN', 'BEBAN_LAIN', 'debit', false);

-- =====================================================================
-- KATEGORI PENDAPATAN BEBAN
-- =====================================================================

INSERT INTO kategori_pendapatan_beban (kode, nama, tipe) VALUES
  ('PEND-001', 'Biaya Admin Pinjaman 4%', 'pendapatan'),
  ('PEND-002', 'Denda Keterlambatan', 'pendapatan'),
  ('PEND-003', 'Bunga Bank', 'pendapatan'),
  ('PEND-004', 'Lain-lain', 'pendapatan'),
  ('BEBAN-001', 'Operasional ATK', 'beban'),
  ('BEBAN-002', 'Konsumsi Rapat', 'beban'),
  ('BEBAN-003', 'Transportasi', 'beban'),
  ('BEBAN-004', 'Honor Pengurus', 'beban'),
  ('BEBAN-005', 'Penyusutan', 'beban'),
  ('BEBAN-006', 'Sumbangan Sosial', 'beban'),
  ('BEBAN-007', 'Lain-lain', 'beban');

-- =====================================================================
-- KATEGORI ASET TETAP
-- =====================================================================

INSERT INTO kategori_aset (kode, nama, umur_ekonomis, tarif_penyusutan) VALUES
  ('AST-001', 'Komputer & Laptop', 48, 25.00),         -- 4 tahun
  ('AST-002', 'Peralatan Kantor', 60, 20.00),          -- 5 tahun
  ('AST-003', 'Furniture', 96, 12.50),                 -- 8 tahun
  ('AST-004', 'Kendaraan', 120, 10.00);                -- 10 tahun

-- =====================================================================
-- REKENING KAS DEFAULT
-- =====================================================================

INSERT INTO rekening_kas (nama, jenis_rekening, saldo_awal, saldo_berjalan, is_primary) VALUES
  ('Kas Tunai Operasional', 'tunai', 5000000, 5000000, true),
  ('Bank BCA Operasional', 'bank', 0, 0, false);
