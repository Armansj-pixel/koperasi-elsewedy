import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { getSlipIndividu } from '@/lib/laporan/actions'
import SlipIndividuDocument from '@/lib/laporan/SlipIndividuDocument'
import { requireRole } from '@/lib/auth/session'

export async function GET(request: NextRequest) {
  try {
    await requireRole(['ANGGOTA', 'SEKRETARIS', 'BENDAHARA', 'KETUA', 'SUPERADMIN'])

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const periode = searchParams.get('periode')

    if (!userId) {
      return NextResponse.json({ error: 'Parameter userId wajib diisi' }, { status: 400 })
    }
    if (!periode || !/^\d{4}-\d{2}$/.test(periode)) {
      return NextResponse.json({ error: 'Parameter periode wajib diisi dengan format YYYY-MM' }, { status: 400 })
    }

    const { data: slip, error } = await getSlipIndividu(userId, periode)

    if (!slip || error) {
      return NextResponse.json({ error: error ?? 'Gagal mengambil data slip' }, { status: 403 })
    }

    // 🔥 PERBAIKAN: Menambahkan "as any" agar lolos sensor TypeScript
    const buffer = await renderToBuffer(
      React.createElement(SlipIndividuDocument, { slip }) as any
    )

    const safeNama = slip.user.nama.replace(/[^a-zA-Z0-9]/g, '-')
    const filename = `Slip-${safeNama}-${slip.periode}.pdf`

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Gagal membuat slip' }, { status: 500 })
  }
}
