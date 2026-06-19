import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { getRekapBulanan } from '@/lib/laporan/actions'
import RekapBulananDocument from '@/lib/laporan/RekapBulananDocument'
import { requireRole } from '@/lib/auth/session'

export async function GET(request: NextRequest) {
  try {
    await requireRole(['SEKRETARIS', 'BENDAHARA', 'KETUA', 'SUPERADMIN'])

    const searchParams = request.nextUrl.searchParams
    const periode = searchParams.get('periode')

    if (!periode || !/^\d{4}-\d{2}$/.test(periode)) {
      return NextResponse.json({ error: 'Parameter periode wajib diisi dengan format YYYY-MM' }, { status: 400 })
    }

    const { data: rekap, error } = await getRekapBulanan(periode)

    if (!rekap || error) {
      return NextResponse.json({ error: error ?? 'Gagal mengambil data rekap' }, { status: 500 })
    }

    // 🔥 PERBAIKAN: Menambahkan "as any" agar lolos sensor TypeScript
    const buffer = await renderToBuffer(
      React.createElement(RekapBulananDocument, { rekap }) as any
    )

    const filename = `Rekap-Potongan-Gaji-${rekap.periode}.pdf`

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Gagal membuat laporan' }, { status: 500 })
  }
}
