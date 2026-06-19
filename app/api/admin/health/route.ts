import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client' // 🔥 KITA PANGGIL LANGSUNG DARI SUMBERNYA
import { requireRole } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Buat koneksi sementara khusus untuk health check ini
  const prisma = new PrismaClient()
  
  try {
    await requireRole(['SUPERADMIN'])

    const startTime = Date.now()
    
    // 1. Cek Database
    let dbStatus = 'OFFLINE'
    let dbLatency = 0
    try {
      const dbStart = Date.now()
      // Melakukan "ping" ringan ke Supabase
      await prisma.$queryRawUnsafe('SELECT 1')
      dbLatency = Date.now() - dbStart
      dbStatus = 'HEALTHY'
    } catch (error) {
      dbStatus = 'UNHEALTHY'
    } finally {
      // Wajib ditutup setelah selesai agar tidak membebani server
      await prisma.$disconnect()
    }

    // 2. Cek Estimasi Memori Node.js (Vercel)
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
    // Pastikan koneksi tetap ditutup jika user ternyata bukan SuperAdmin
    await prisma.$disconnect()
    return NextResponse.json({ 
      status: 'ERROR', 
      message: error?.message ?? 'Unauthorized' 
    }, { status: 401 })
  }
}
