import { getBeritaList, hapusBerita } from '@/lib/berita/actions'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function BeritaPage() {
  // 1. Ambil Data User
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // 2. Cek Role di Tabel Users
  const { data: userData } = await supabase
    .from('users') 
    .select('role')
    .eq('id', user?.id)
    .single()

  // 3. LOGIKA KUNCI: Ambil role dari DB, jika kosong ambil dari metadata Auth.
  // Lalu wajibkan JADI HURUF BESAR SEMUA (.toUpperCase())
  const rawRole = userData?.role || user?.user_metadata?.role || 'ANGGOTA'
  const role = rawRole.toUpperCase()

  const isAdmin = role === 'SEKRETARIS' || role === 'SUPERADMIN'

  // 4. Ambil data berita
  const { data: semuaBerita } = await getBeritaList()

  // 5. Filter data: Anggota hanya boleh lihat yang PUBLISHED
  const beritaTampil = isAdmin 
    ? semuaBerita 
    : semuaBerita.filter((b: any) => b.status === 'PUBLISHED')

  // ==========================================
  // TAMPILAN UNTUK SEKRETARIS & SUPERADMIN
  // (Di sinilah tombol Tambah/Edit/Hapus berada)
  // ==========================================
  if (isAdmin) {
    return (
      <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#0f2d6b" }}>Kelola Berita</h1>
            <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>Login sebagai: <strong>{role}</strong></p>
          </div>
          <Link 
            href="/dashboard/berita/tambah" 
            style={{ padding: "10px 20px", background: "#0f2d6b", color: "#fff", borderRadius: "6px", textDecoration: "none", fontWeight: "600" }}
          >
            + Tambah Berita
          </Link>
        </div>

        <div className="card-fintech" style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f9fafb", textAlign: "left" }}>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "16px" }}>Judul</th>
                <th style={{ padding: "16px" }}>Kategori</th>
                <th style={{ padding: "16px" }}>Status</th>
                <th style={{ padding: "16px" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {beritaTampil.map((berita: any) => (
                <tr key={berita.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "16px" }}>
                    <strong>{berita.judul}</strong>
                    {berita.is_pinned && <span style={{ marginLeft: "8px" }} title="Sematkan">📌</span>}
                  </td>
                  <td style={{ padding: "16px", fontSize: "14px" }}>{berita.kategori}</td>
                  <td style={{ padding: "16px" }}>
                    <span style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "600", background: berita.status === 'PUBLISHED' ? "#d1fae5" : "#fee2e2", color: berita.status === 'PUBLISHED' ? "#065f46" : "#991b1b" }}>
                      {berita.status}
                    </span>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <Link href={`/dashboard/berita/${berita.id}/edit`} style={{ color: "#2563eb", fontWeight: "600", textDecoration: "none" }}>Edit</Link>
                      <form action={async () => { "use server"; await hapusBerita(berita.id) }}>
                        <button type="submit" style={{ color: "#dc2626", fontWeight: "600", border: "none", background: "none", cursor: "pointer", padding: 0 }}>Hapus</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {beritaTampil.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: "24px", textAlign: "center", color: "#6b7280" }}>Belum ada berita yang dibuat.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // ==========================================
  // TAMPILAN UNTUK ANGGOTA (GRID KARTU BERITA)
  // (Mode Read-Only, tidak ada tombol manajemen)
  // ==========================================
  return (
    <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#111827", marginBottom: "8px" }}>Pusat Informasi</h1>
      <p style={{ color: "#6b7280", marginBottom: "32px" }}>Kabar dan pengumuman terbaru dari Koperasi.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
        {beritaTampil.map((berita: any) => (
          <Link href={`/dashboard/berita/${berita.slug}`} key={berita.id} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ 
              background: "#fff", 
              borderRadius: "12px", 
              overflow: "hidden", 
              border: "1px solid #e5e7eb", 
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
              transition: "transform 0.2s",
              height: "100%",
              display: "flex",
              flexDirection: "column"
            }}>
              {/* Gambar Cover (Jika ada) */}
              <div style={{ height: "160px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {berita.cover_image_url ? (
                  <img src={berita.cover_image_url} alt={berita.judul} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: "40px" }}>📰</span>
                )}
              </div>
              
              <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#2563eb", textTransform: "uppercase" }}>{berita.kategori.replace('_', ' ')}</span>
                  {berita.is_pinned && <span style={{ fontSize: "12px", color: "#b45309", fontWeight: "600" }}>📌 Pinned</span>}
                </div>
                
                <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", marginBottom: "8px", lineHeight: "1.4" }}>
                  {berita.judul}
                </h2>
                
                <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px", flex: 1 }}>
                  {berita.excerpt ? berita.excerpt : "Klik untuk membaca selengkapnya..."}
                </p>

                <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "auto" }}>
                  {new Date(berita.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
          </Link>
        ))}

        {beritaTampil.length === 0 && (
          <p style={{ color: "#6b7280", gridColumn: "1 / -1", textAlign: "center", padding: "40px 0" }}>Belum ada pengumuman terbaru.</p>
        )}
      </div>
    </div>
  )
}
