'use server'

import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'

// ─── GET: Ambil Detail Kalkulasi Resign Anggota ────────────────────────────────
export async function getKalkulasiResign(userId: string) {
  const supabase = await createClient()

  // 1. Ambil Profil User
  const { data: user } = await supabase
    .from('users')
    .select('id, nama, nik, is_active')
    .eq('id', userId)
    .single()

  if (!user) return { error: "Pengguna tidak ditemukan" }

  // 2. Ambil Total Simpanan
  const { data: simpanan } = await supabase
    .from('saldo_simpanan')
    .select('simpanan_pokok, simpanan_wajib, simpanan_sukarela')
    .eq('user_id', userId)
    .single()

  const totalSimpanan = 
    (simpanan?.simpanan_pokok || 0) + 
    (simpanan?.simpanan_wajib || 0) + 
    (simpanan?.simpanan_sukarela || 0)

  // 3. Ambil Total Hutang Pinjaman Aktif
  const { data: pinjamanAktif } = await supabase
    .from('pinjaman')
    .select('id, nomor_kontrak, sisa_pokok')
    .eq('user_id', userId)
    .eq('status', 'ACTIVE')

  const totalHutangPinjaman = pinjamanAktif?.reduce((sum, p) => sum + (p.sisa_pokok || 0), 0) || 0

  // 4. Kalkulasi Net Settlement (Clearance)
  const netKembalian = totalSimpanan - totalHutangPinjaman

  return {
    user,
    simpanan: simpanan || { simpanan_pokok: 0, simpanan_wajib: 0, simpanan_sukarela: 0 },
    pinjamanAktif: pinjamanAktif || [],
    totalSimpanan,
    totalHutangPinjaman,
    netKembalian
  }
}

// ─── ACTION: Eksekusi Tutup Keanggotaan ───────────────────────────────────────
export async function eksekusiTutupKeanggotaan(formData: FormData) {
  const session = await requireRole(['BENDAHARA', 'SUPERADMIN', 'SEKRETARIS'])
  const supabase = await createClient()

  const userId = formData.get('user_id') as string
  const catatan = formData.get('catatan') as string

  if (!userId) return { success: false, error: "ID Anggota tidak valid." }

  const kalkulasi = await getKalkulasiResign(userId)
  if (kalkulasi.error) return { success: false, error: kalkulasi.error }

  // 1. Ubah status anggota menjadi Inaktif (Resign)
  const { error: userError } = await supabase
    .from('users')
    .update({ 
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (userError) return { success: false, error: "Gagal menonaktifkan pengguna." }

  // 2. Kosongkan Saldo Simpanan (Karena sudah dicairkan / dikonversi jadi pelunasan)
  await supabase
    .from('saldo_simpanan')
    .update({
      simpanan_pokok: 0,
      simpanan_wajib: 0,
      simpanan_sukarela: 0,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)

  // 3. LUNASKAN paksa semua pinjaman aktif (Karena sudah dipotong dari simpanan)
  if (kalkulasi.pinjamanAktif && kalkulasi.pinjamanAktif.length > 0) {
    const pinjamanIds = kalkulasi.pinjamanAktif.map(p => p.id)

    // Lunas cicilan yang belum dibayar
    await supabase
      .from('cicilan_pinjaman')
      .update({
        status: 'PAID',
        tanggal_pembayaran: new Date().toISOString().split('T')[0]
      })
      .in('pinjaman_id', pinjamanIds)
      .in('status', ['SCHEDULED', 'OVERDUE'])

    // Tutup status pinjaman induk
    await supabase
      .from('pinjaman')
      .update({
        status: 'LUNAS',
        tanggal_lunas: new Date().toISOString().split('T')[0],
        catatan_l3: `[AUTO-SETTLEMENT RESIGN] ${catatan}`,
        updated_at: new Date().toISOString()
      })
      .in('id', pinjamanIds)
  }

  // Catatan: Di masa depan (Modul Akuntansi), fungsi ini akan men-trigger 
  // jurnal pembalikan saldo simpanan dan pelunasan piutang anggota ke General Ledger.

  revalidatePath('/dashboard')
  return { success: true, message: `Keanggotaan ${kalkulasi.user?.nama} berhasil ditutup dan diselesaikan.` }
}
