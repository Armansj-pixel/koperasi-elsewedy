import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // Sesuaikan dengan path instance prisma Mas
import { requireRole } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Kunci akses hanya untuk SuperAdmin
    await requireRole(['SUPERADMIN'])

    const startTime = Date.now()
    
    // 1. Cek Database (Supabase via Prisma)
    let dbStatus = 'OFFLINE'
    let dbLatency = 0
    try {
      const dbStart = Date.now()
      await prisma.$queryRaw`SELECT 1`
      dbLatency = Date.now() - dbStart
      dbStatus = 'HEALTHY'
    } catch (error) {
      dbStatus = 'UNHEALTHY'
    }

    // 2. Cek Estimasi Memori Node.js (Vercel Environment)
    const memoryUsage = process.memoryUsage()
    const memoryUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024)
    const memoryTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024)

    // 3. Hitung Total Latensi API
    const totalLatency = Date.now() - startTime

    return NextResponse.json({
      status: 'ONLINE',
      timestamp: new Date().toISOString(),
      latency: `${totalLatency}ms`,
      services: {
        database: {
          name: 'Supabase PostgreSQL',
          status: dbStatus,
          latency: `${dbLatency}ms`
        },
        apiServer: {
          name: 'Vercel Serverless Engine',
          status: 'HEALTHY',
          uptime: `${Math.round(process.uptime())}s`
        }
      },
      environment: {
        nodeVersion: process.version,
        memory: `${memoryUsedMB}MB / ${memoryTotalMB}MB`,
        platform: process.platform
      }
    }, { status: 200 })

  } catch (error: any) {
    return NextResponse.json({ 
      status: 'ERROR', 
      message: error?.message ?? 'Unauthorized' 
    }, { status: 401 })
  }
}
