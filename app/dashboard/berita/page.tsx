import { getBeritaList, hapusBerita } from '@/lib/berita/actions'
import { requireRole } from '@/lib/auth/session'
import Link from 'next/link'

export default async function DaftarBeritaPage() {
  // Pastikan yang akses hanya Admin/Sekretaris
  await requireRole(['SEKRETARIS', 'SUPERADMIN'])
  
  const { data: beritaList } = await getBeritaList()

  return (
    <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#0f2d6b" }}>Kelola Berita</h1>
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
              <th style={{ padding: "16px" }}>Semat</th>
              <th style={{ padding: "16px" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {beritaList.map((berita: any) => (
              <tr key={berita.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "16px" }}>{berita.judul}</td>
                <td style={{ padding: "16px" }}>{berita.kategori}</td>
                <td style={{ padding: "16px" }}>
                  <span style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "12px", background: berita.status === 'PUBLISHED' ? "#d1fae5" : "#fee2e2" }}>
                    {berita.status}
                  </span>
                </td>
                <td style={{ padding: "16px" }}>{berita.is_pinned ? "✅" : "-"}</td>
                <td style={{ padding: "16px" }}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <Link href={`/dashboard/berita/${berita.id}/edit`} style={{ color: "#2563eb", fontWeight: "600" }}>Edit</Link>
                    <form action={async () => { "use server"; await hapusBerita(berita.id) }}>
                      <button type="submit" style={{ color: "#dc2626", fontWeight: "600", border: "none", background: "none", cursor: "pointer" }}>Hapus</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
