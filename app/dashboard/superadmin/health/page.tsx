'use client'

import React, { useEffect, useState } from 'react'

interface HealthData {
  status: string
  latency: string
  timestamp: string
  services: {
    database: { name: string; status: string; latency: string }
    apiServer: { name: string; status: string; uptime: string }
  }
  environment: {
    nodeVersion: string
    memory: string
    platform: string
  }
}

export default function SystemHealthPage() {
  const [data, setData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchHealth = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/health')
      if (res.ok) {
        const result = await res.json()
        setData(result)
      }
    } catch (err) {
      console.error('Gagal mengambil status sistem', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealth()
    // Auto-refresh setiap 30 detik
    const interval = setInterval(fetchHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading && !data) {
    return <div className="p-6 text-slate-500">Memeriksa kesehatan sistem...</div>
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b pb-4 border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">System Indicators & Health Check</h1>
          <p className="text-sm text-slate-500">Status real-time ekosistem Koperasi Elsewedy</p>
        </div>
        <button 
          onClick={fetchHealth} 
          className="px-4 py-2 bg-blue-900 text-white font-medium text-sm rounded-lg hover:bg-blue-800 transition shadow"
        >
          🔄 Refresh Status
        </button>
      </div>

      {/* Grid Indikator Utama */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Core System Status */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm font-semibold text-slate-500 uppercase">Status Platform</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-800">{data?.status}</span>
            <span className="inline-flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="text-xs text-slate-400 mt-1">Total Latensi API: {data?.latency}</div>
        </div>

        {/* Database Indicator */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm font-semibold text-slate-500 uppercase">{data?.services.database.name}</div>
          <div className="mt-2 flex items-center gap-2">
            <span className={`text-xl font-bold ${data?.services.database.status === 'HEALTHY' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {data?.services.database.status}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1">Ping Latensi: {data?.services.database.latency}</div>
        </div>

        {/* Memory Info */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm font-semibold text-slate-500 uppercase">Alokasi Memori Node</div>
          <div className="mt-2 text-2xl font-bold text-slate-800">
            {data?.environment.memory.split(' / ')[0]}
          </div>
          <div className="text-xs text-slate-400 mt-1">Batas Maks Serverless: {data?.environment.memory.split(' / ')[1]}</div>
        </div>
      </div>

      {/* Rincian Environment */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 font-semibold text-sm text-slate-700">
          Spesifikasi Runtime Environment
        </div>
        <table className="w-full text-sm text-left text-slate-600">
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="px-5 py-3 font-medium text-slate-500 w-1/3">Platform OS Target</td>
              <td className="px-5 py-3 font-mono">{data?.environment.platform}</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="px-5 py-3 font-medium text-slate-500">Versi Engine Node.js</td>
              <td className="px-5 py-3 font-mono">{data?.environment.nodeVersion}</td>
            </tr>
            <tr>
              <td className="px-5 py-3 font-medium text-slate-500">Waktu Pembaruan Terakhir</td>
              <td className="px-5 py-3 text-slate-500">
                {data ? new Date(data.timestamp).toLocaleString('id-ID') : '-'} WIB
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
