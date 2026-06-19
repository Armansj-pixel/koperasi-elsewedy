'use server'

import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ─── Proteksi Role: Hanya untuk Sekretaris & SuperAdmin ─────────────────────────

const ALLOWED_ROLES = ['SEKRETARIS', 'SUPERADMIN']

export async function simpanBerita(formData: FormData) {
  await requireRole(ALLOWED_ROLES)
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const judul = formData.get('judul') as string
  const slug = `${judul.toLowerCase().replace(/ /g, '-')}-${Date.now()}`
  
  const data = {
    judul: judul,
    slug: slug,
    konten: formData.get('konten'),
    excerpt: formData.get('excerpt'),
    kategori: formData.get('kategori'),
    status: formData.get('status'),
    cover_image_url: formData.get('cover_image_url'),
    is_pinned: formData.get('is_pinned') === 'on',
    author_id: user.id,
    updated_at: new Date().toISOString()
  }

  const { error } = await supabase.from('berita').insert(data)
  
  if (error) {
    return { error: 'Gagal menyimpan berita: ' + error.message }
  }

  revalidatePath('/dashboard/berita')
  redirect('/dashboard/berita')
}

export async function updateBerita(id: number, formData: FormData) {
  await requireRole(ALLOWED_ROLES)
  
  const supabase = await createClient()

  const data = {
    judul: formData.get('judul'),
    konten: formData.get('konten'),
    excerpt: formData.get('excerpt'),
    kategori: formData.get('kategori'),
    status: formData.get('status'),
    cover_image_url: formData.get('cover_image_url'),
    is_pinned: formData.get('is_pinned') === 'on',
    updated_at: new Date().toISOString()
  }

  const { error } = await supabase
    .from('berita')
    .update(data)
    .eq('id', id)

  if (error) {
    return { error: 'Gagal mengupdate berita: ' + error.message }
  }

  revalidatePath('/dashboard/berita')
  revalidatePath(`/dashboard/berita/${id}/edit`)
  redirect('/dashboard/berita')
}

export async function hapusBerita(id: number) {
  await requireRole(ALLOWED_ROLES)
  
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('berita')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: 'Gagal menghapus berita: ' + error.message }
  }

  revalidatePath('/dashboard/berita')
  return { success: true }
}

// ─── Utility: Fetch Berita (Bisa diakses semua role) ──────────────────────────

export async function getBeritaList() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('berita')
    .select('*')
    .order('created_at', { ascending: false })

  return { data: data ?? [], error }
}

export async function getBeritaDetail(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('berita')
    .select('*')
    .eq('id', id)
    .single()

  return { data, error }
}
