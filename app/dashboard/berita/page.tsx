import { getBeritaList, hapusBerita } from '@/lib/berita/actions'
import Link from 'next/link'

export default async function DaftarBeritaPage() {
  const { data: beritaList } = await getBeritaList()

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h1>Manajemen Berita</h1>
        <Link href="/dashboard/berita/tambah" className="btn-primary">Tambah Berita</Link>
      </div>

      <table className="fintech-table" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Judul</th>
            <th>Kategori</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {beritaList.map((berita: any) => (
            <tr key={berita.id}>
              <td>{berita.judul}</td>
              <td>{berita.kategori}</td>
              <td>{berita.status}</td>
              <td>
                <Link href={`/dashboard/berita/${berita.id}/edit`}>Edit</Link>
                {/* Tambahkan tombol hapus dengan form action di sini */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
