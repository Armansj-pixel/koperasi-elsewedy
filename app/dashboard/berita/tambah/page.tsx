import { buatBerita } from '@/lib/berita/actions'
import { requireRole } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

export default async function TambahBeritaPage() {
  // Hanya Sekretaris dan SuperAdmin yang boleh akses
  await requireRole(['SEKRETARIS', 'SUPERADMIN'])

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px" }}>
      <header style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#0f2d6b" }}>Tambah Berita Baru</h1>
        <p style={{ color: "#666" }}>Bagikan informasi terbaru kepada seluruh anggota koperasi.</p>
      </header>

      <form action={buatBerita} className="card-fintech" style={{ background: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
        {/* Judul */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Judul Berita</label>
          <input name="judul" className="fintech-input" required style={{ width: "100%", padding: "8px" }} />
        </div>

        {/* Row Kategori & Status */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Kategori</label>
            <select name="kategori" className="fintech-input" style={{ width: "100%", padding: "8px" }}>
              <option value="PENGUMUMAN">Pengumuman</option>
              <option value="BERITA_UMUM">Berita Umum</option>
              <option value="SHU">Info SHU</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Status</label>
            <select name="status" className="fintech-input" style={{ width: "100%", padding: "8px" }}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
        </div>

        {/* Excerpt */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Ringkasan Singkat (Excerpt)</label>
          <input name="excerpt" className="fintech-input" style={{ width: "100%", padding: "8px" }} />
        </div>

        {/* Konten */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Isi Berita</label>
          <textarea name="konten" rows={12} className="fintech-input" required style={{ width: "100%", padding: "8px" }} />
        </div>

        {/* Cover Image URL */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>URL Gambar Cover</label>
          <input name="cover_image_url" type="url" placeholder="https://..." className="fintech-input" style={{ width: "100%", padding: "8px" }} />
        </div>

        {/* Checkbox Pinned */}
        <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
          <input type="checkbox" name="is_pinned" id="is_pinned" style={{ width: "18px", height: "18px" }} />
          <label htmlFor="is_pinned" style={{ fontWeight: "600", cursor: "pointer" }}>Sematkan di Halaman Utama (Pinned)</label>
        </div>

        {/* Button */}
        <button 
          type="submit"
          style={{ 
            width: "100%", 
            padding: "12px", 
            background: "#0f2d6b", 
            color: "#fff", 
            border: "none", 
            borderRadius: "6px",
            fontWeight: "600", 
            cursor: "pointer" 
          }}
        >
          Simpan Berita
        </button>
      </form>
    </div>
  )
}
