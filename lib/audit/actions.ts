'use server'

// ═══════════════════════════════════════════════════════════════
// lib/audit/actions.ts
// Helper audit trail — dipanggil dari semua modul
// Menggunakan Supabase RPC insert_audit (SECURITY DEFINER)
// ═══════════════════════════════════════════════════════════════

import { createServiceClient } from '@/lib/supabase/server'

export type AuditModul = 'PINJAMAN' | 'SIMPANAN' | 'KAS'

export type AuditAksi =
  // PINJAMAN
  | 'AJUKAN_PINJAMAN'
  | 'APPROVE_L1' | 'APPROVE_L2' | 'APPROVE_L3'
  | 'REJECT_PINJAMAN'
  | 'CAIRKAN_PINJAMAN'
  | 'BAYAR_CICILAN'
  | 'PELUNASAN_SEKALIGUS'
  | 'POTONG_CICILAN_MASSAL'
  | 'INPUT_PINJAMAN_EXISTING'
  // SIMPANAN
  | 'SETORAN_MANUAL'
  | 'SETORAN_MASSAL_PAYROLL'
  | 'AJUKAN_PENARIKAN'
  | 'APPROVE_PENARIKAN'
  | 'REJECT_PENARIKAN'
  // KAS
  | 'TOPUP_KAS_KECIL'
  | 'CATAT_PENGELUARAN'
  | 'CATAT_PENDAPATAN'
  | 'BUAT_JURNAL_MANUAL'

interface AuditPayload {
  userId:     string
  userNama:   string
  userRole:   string
  modul:      AuditModul
  aksi:       AuditAksi
  keterangan: string
  entityType?: string
  entityId?:   string
  nilaiLama?:  Record<string, unknown>
  nilaiBaru?:  Record<string, unknown>
  nominal?:    number
}

/**
 * Catat satu entri audit trail.
 * Fire-and-forget — tidak throw, hanya log error ke console
 * supaya kegagalan audit tidak mengganggu transaksi utama.
 */
export async function catatAudit(payload: AuditPayload): Promise<void> {
  try {
    const supabase = createServiceClient()
    const { error } = await supabase.rpc('insert_audit', {
      p_user_id:     payload.userId,
      p_user_nama:   payload.userNama,
      p_user_role:   payload.userRole,
      p_modul:       payload.modul,
      p_aksi:        payload.aksi,
      p_keterangan:  payload.keterangan,
      p_entity_type: payload.entityType ?? null,
      p_entity_id:   payload.entityId   ?? null,
      p_nilai_lama:  payload.nilaiLama  ?? null,
      p_nilai_baru:  payload.nilaiBaru  ?? null,
      p_nominal:     payload.nominal    ?? null,
    })
    if (error) {
      console.error('[AUDIT] Gagal catat audit:', error.message)
    }
  } catch (err) {
    console.error('[AUDIT] Exception:', err)
  }
}

// ── Shorthand per modul ──────────────────────────────────────────

export async function auditPinjaman(
  session: { id: string; nama: string; role: string },
  aksi: AuditAksi,
  keterangan: string,
  opts?: { entityId?: string; nilaiLama?: Record<string, unknown>; nilaiBaru?: Record<string, unknown>; nominal?: number }
) {
  return catatAudit({
    userId:     session.id,
    userNama:   session.nama,
    userRole:   session.role,
    modul:      'PINJAMAN',
    aksi,
    keterangan,
    entityType: 'pinjaman',
    entityId:   opts?.entityId,
    nilaiLama:  opts?.nilaiLama,
    nilaiBaru:  opts?.nilaiBaru,
    nominal:    opts?.nominal,
  })
}

export async function auditSimpanan(
  session: { id: string; nama: string; role: string },
  aksi: AuditAksi,
  keterangan: string,
  opts?: { entityId?: string; nilaiLama?: Record<string, unknown>; nilaiBaru?: Record<string, unknown>; nominal?: number }
) {
  return catatAudit({
    userId:     session.id,
    userNama:   session.nama,
    userRole:   session.role,
    modul:      'SIMPANAN',
    aksi,
    keterangan,
    entityType: 'simpanan',
    entityId:   opts?.entityId,
    nilaiLama:  opts?.nilaiLama,
    nilaiBaru:  opts?.nilaiBaru,
    nominal:    opts?.nominal,
  })
}

export async function auditKas(
  session: { id: string; nama: string; role: string },
  aksi: AuditAksi,
  keterangan: string,
  opts?: { entityId?: string; nilaiLama?: Record<string, unknown>; nilaiBaru?: Record<string, unknown>; nominal?: number }
) {
  return catatAudit({
    userId:     session.id,
    userNama:   session.nama,
    userRole:   session.role,
    modul:      'KAS',
    aksi,
    keterangan,
    entityType: 'jurnal_induk',
    entityId:   opts?.entityId,
    nilaiLama:  opts?.nilaiLama,
    nilaiBaru:  opts?.nilaiBaru,
    nominal:    opts?.nominal,
  })
}
