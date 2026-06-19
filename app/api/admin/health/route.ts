import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireRole } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export async function GET() {
  const prisma = new PrismaClient()
  try {
    await requireRole(['SUPERADMIN'])
    const startTime = Date.now()

    // 1. Cek Database & Ambil Audit Log Terbaru secara paralel
    const [dbCheck, logs] = await Promise.all([
      prisma.$queryRawUnsafe('SELECT 1'),
      prisma.audit_log.findMany({
        take: 10,
        orderBy: { created_at: 'desc' },
        include: { user: { select: { nama: true } } }
      })
    ])

    const dbLatency = Date.now() - startTime

    // 2. Resource Server Info
    const memory = process.memoryUsage()

    return NextResponse.json({
      status: 'HEALTHY',
      timestamp: new Date().toISOString(),
      metrics: {
        db_latency: `${dbLatency}ms`,
        uptime: `${Math.round(process.uptime())}s`,
        memory: `${Math.round(memory.heapUsed / 1024 / 1024)}MB`
      },
      audit_logs: logs
    })
  } catch (error: any) {
    return NextResponse.json({ status: 'ERROR', message: error.message }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
