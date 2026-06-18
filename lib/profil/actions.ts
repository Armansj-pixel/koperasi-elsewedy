'use server'

import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProfilUser {
  id: string
  nik: string
  nama: string
  email: string | null
  no_hp: string | null
  no_rekening: string | null
  nama_bank: string | null
  foto_profil: string | null
  role: string
  simpanan_wajib_bulanan: number
  simpanan_sukarela_bulanan: number
  tanggal_bergabung: string
  is_active: boolean
  last_login_at: string | null
}

const MAX_FOTO_BASE64_LENGTH = Math.ceil((2 * 1024 * 1024 * 4) / 3) + 100 

// ─── GET: Profil Saya ─────────────────────────────────────────────────────────

export async function getProfilSaya() {
  const session = await requireRole(['ANGGOTA', 'SEKRETARIS', 'BENDAHARA', 'KETUA', 'SUPERADMIN'])
  const supabase = await createClient()

  // PERBAIKAN TS: Gunakan (session as any) untuk bypass strict typing TypeScript
  const targetId = (session as any).db_user_id || session.id

  const { data, error } = await supabase
    .from('users')
    .select(
      'id, nik, nama, email, no_hp, no_rekening, nama_bank, foto_profil, role, simpanan_wajib_bulanan, simpanan_sukarela_bulanan, tanggal_bergabung, is_active, last_login_at'
    )
    .eq('id', targetId)
    .maybeSingle()

  if (error || !data) {
    return { data: null, error: error?.message ?? 'Profil tidak ditemukan di database.' }
  }

  return { data: data as ProfilUser, error: null }
}

// ─── ACTION: Update Profil (nama, email, no_hp, foto) ─────────────────────────

const UpdateProfilSchema = z.object({
  nama: z.string().min(3, 'Nama minimal 3 karakter').max(100),
  email: z
    .string()
    .email('Format email tidak valid')
    .optional()
    .or(z.literal('')),
  no_hp: z
    .string()
    .min(9, 'Nomor HP minimal 9 digit')
    .max(15, 'Nomor HP maksimal 15 digit')
    .regex(/^[0-9+]+$/, 'Nomor HP hanya boleh angka')
    .optional()
    .or(z.literal('')),
})

export async function updateProfilSaya(formData: FormData) {
  const session = await requireRole(['ANGGOTA', 'SEKRETARIS', 'BENDAHARA', 'KETUA', 'SUPERADMIN'])
  
  // PERBAIKAN TS: Gunakan (session as any) untuk bypass strict typing TypeScript
  const targetId = (session as any).db_user_id || session.id

  const nama = (formData.get('nama') as string) ?? ''
  const email = (formData.get('email') as string) ?? ''
  const no_hp = (formData.get('no_hp') as string) ?? ''
  const fotoBase64 = (formData.get('foto_profil') as string) ?? ''

  const parsed = UpdateProfilSchema.safeParse({ nama, email, no_hp })

  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? 'Validasi gagal'
    redirect(`/dashboard/profil/edit?error=${encodeURIComponent(msg)}`)
  }

  if (fotoBase64 && fotoBase64.startsWith('data:image') && fotoBase64.length > MAX_FOTO_BASE64_LENGTH) {
    redirect(`/dashboard/profil/edit?error=${encodeURIComponent('Ukuran foto terlalu besar, maksimal 2MB')}`)
  }

  const supabase = await createClient()

  const updateData: Record<string, unknown> = {
    nama: parsed.data.nama.trim(),
    email: parsed.data.email?.trim() || null,
    no_hp: parsed.data.no_hp?.trim() || null,
    updated_at: new Date().toISOString(),
  }

  if (fotoBase64 && fotoBase64.startsWith('data:image')) {
    updateData.foto_profil = fotoBase64
  } else if (fotoBase64 === '__REMOVE__') {
    updateData.foto_profil = null
  }

  const { error } = await supabase.from('users').update(updateData).eq('id', targetId)

  if (error) {
    redirect(`/dashboard/profil/edit?error=${encodeURIComponent('Gagal menyimpan profil: ' + error.message)}`)
  }

  revalidatePath('/dashboard/profil')
  revalidatePath('/dashboard/profil/edit')
  redirect('/dashboard/profil?success=' + encodeURIComponent('Profil berhasil diperbarui'))
}
