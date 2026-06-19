import { getBeritaDetail, updateBerita } from '@/lib/berita/actions'
import { requireRole } from '@/lib/auth/session'
import { notFound } from 'next/navigation'

export default async function EditBeritaPage({ params }: { params: { id: string } }) {
  // 1. Proteksi akses
  await requireRole(['SEKRETARIS', 'SUPERADMIN'])

  // 2. Ambil data berita berdasarkan ID
  const { data: berita, error } = await getBeritaDetail(Number(params.id))
  if (error || !berita) notFound()

  // 3. Bind id ke fungsi update agar saat form disubmit, ia tahu mana yang di-update
  const updateBeritaWithId = updateBerita.bind(null, berita.id)

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px" }}>
      <header style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#0f2d6b" }}>Edit Berita</h1>
      </header>

      <form action={updateBeritaWithId} className="card-fintech" style={{ background: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
        
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Judul Berita</label>
          <input name="judul" defaultValue={berita.judul} className="fintech-input" required style={{ width: "100%", padding: "8px" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Kategori</label>
            <select name="kategori" defaultValue={berita.kategori} className="fintech-input" style={{ width: "100%", padding: "8px" }}>
              <option value="PENGUMUMAN">Pengumuman</option>
              <option value="BERITA_UMUM">Berita Umum</option>
              <option value="SHU">Info SHU</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Status</label>
            <select name="status" defaultValue={berita.status} className="fintech-input" style={{ width: "100%", padding: "8px" }}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Ringkasan (Excerpt)</label>
          <input name="excerpt" defaultValue={berita.excerpt || ''} className="fintech-input" style={{ width: "100%", padding: "8px" }} />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Isi Berita</label>
          <textarea name="konten" defaultValue={berita.konten} rows={12} className="fintech-input" required style={{ width: "100%", padding: "8px" }} />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>URL Gambar Cover</label>
          <input name="cover_image_url" defaultValue={berita.cover_image_url || ''} type="url" className="fintech-input" style={{ width: "100%", padding: "8px" }} />
        </div>

        <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
          <input type="checkbox" name="is_pinned" defaultChecked={berita.is_pinned} id="is_pinned" style={{ width: "18px", height: "18px" }} />
          <label htmlFor="is_pinned" style={{ fontWeight: "600", cursor: "pointer" }}>Sematkan di Halaman Utama</label>
        </div>

        <button 
          type="submit"
          style={{ width: "100%", padding: "12px", background: "#0f2d6b", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}
        >
          Simpan Perubahan
        </button>
      </form>
    </div>
  )
}
