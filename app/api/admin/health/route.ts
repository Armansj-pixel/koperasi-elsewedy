import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireRole } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export async function GET() {
  const prisma = new PrismaClient()
  try {
    await requireRole(['SUPERADMIN'])
    const startTime = Date.now()

    // 🔥 PERBAIKAN: created_at diubah menjadi createdAt untuk Prisma
    const [dbCheck, logs] = await Promise.all([
      prisma.$queryRawUnsafe('SELECT 1'),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }, 
        include: { user: { select: { nama: true } } }
      })
    ])

    const dbLatency = Date.now() - startTime
    const memory = process.memoryUsage()

    // Format ulang data agar frontend NOC kita tidak ikut error
    const formattedLogs = logs.map((log: any) => ({
      ...log,
      created_at: log.createdAt || log.created_at
    }))

    return NextResponse.json({
      status: 'HEALTHY',
      timestamp: new Date().toISOString(),
      metrics: {
        db_latency: `${dbLatency}ms`,
        uptime: `${Math.round(process.uptime())}s`,
        memory: `${Math.round(memory.heapUsed / 1024 / 1024)}MB`
      },
      audit_logs: formattedLogs
    })
  } catch (error: any) {
    return NextResponse.json({ status: 'ERROR', message: error.message }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
