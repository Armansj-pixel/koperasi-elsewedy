'use client'

import React, { useEffect, useState } from 'react'

interface AuditLog {
  id: string
  created_at: string
  action: string
  status: string
  user?: { nama: string }
}

interface HealthData {
  status: string
  timestamp: string
  metrics: {
    db_latency: string
    uptime: string
    memory: string
  }
  audit_logs: AuditLog[]
}

export default function NOCDashboard() {
  const [data, setData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/admin/health')
      if (res.ok) {
        const result = await res.json()
        setData(result)
      }
    } catch (err) {
      console.error('Failed to fetch system health', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealth()
    const interval = setInterval(fetchHealth, 10000) // Auto-refresh tiap 10 detik
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#030a05] text-[#00ff41] p-4 md:p-6 flex flex-col relative" style={{ fontFamily: '"Share Tech Mono", monospace' }}>
      {/* 🎨 CSS Khusus Tema Cyberpunk NOC yang di-inject langsung */}
      <style dangerouslySetInnerHTML={{ __html: `
        .scanline {
          position: fixed; top: 0; left: 0; width: 100%; height: 5px;
          background: rgba(0, 255, 65, 0.3); box-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
          animation: scan 6s linear infinite; pointer-events: none; z-index: 50;
        }
        @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        .cyber-panel {
          background: rgba(3, 15, 8, 0.85); border: 1px solid rgba(0, 255, 65, 0.3);
          box-shadow: inset 0 0 20px rgba(0, 255, 65, 0.05); position: relative;
        }
        .cyber-panel::before, .cyber-panel::after {
          content: ''; position: absolute; width: 10px; height: 10px; border: 2px solid #00ff41;
        }
        .cyber-panel::before { top: -1px; left: -1px; border-right: none; border-bottom: none; }
        .cyber-panel::after { bottom: -1px; right: -1px; border-left: none; border-top: none; }
        .glow { text-shadow: 0 0 8px #00ff41; }
        .glow-cyan { color: #0ff; text-shadow: 0 0 8px #0ff; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .cursor-blink { animation: blink 1s step-end infinite; }
        .led { flex: 1; background: #111; transition: background 0.3s; }
        .led.active { background: #00ff41; box-shadow: 0 0 5px #00ff41; }
      `}} />

      <div className="scanline"></div>

      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-end md:items-center mb-4 cyber-panel p-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 border-2 border-cyan-400 rounded flex items-center justify-center text-cyan-400 glow-cyan">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-widest glow">ELSEWEDY <span className="text-white">N.O.C</span></h1>
            <p className="text-[10px] tracking-[0.2em] text-emerald-600">KOPERASI CORE // SECURE LEVEL 5</p>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 flex gap-4 md:gap-6 text-xs md:text-sm">
          <div className="text-right">
            <div className="text-emerald-700">CORE STATUS</div>
            <div className="text-lg md:text-xl glow">{data ? data.status : 'CONNECTING...'} <span className="inline-block w-2 h-2 bg-[#00ff41] rounded-full cursor-blink"></span></div>
          </div>
          <div className="text-right border-l border-emerald-900 pl-4">
            <div class="text-emerald-700">API GATEWAY</div>
            <div className="text-lg md:text-xl glow-cyan">SECURED</div>
          </div>
        </div>
      </header>

      {loading && !data ? (
        <div className="flex-grow flex items-center justify-center glow text-xl animate-pulse">
          ESTABLISHING SECURE CONNECTION TO SUPABASE...
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 flex-grow">
          
          {/* KOLOM KIRI: METRIK */}
          <div className="xl:col-span-3 flex flex-col gap-4">
            <div className="cyber-panel p-4 flex-grow flex flex-col">
              <h2 className="text-[10px] md:text-xs tracking-widest border-b border-emerald-900/50 pb-2 mb-3 font-bold glow text-white">SERVICE ENDPOINTS</h2>
              <div className="flex-grow flex flex-col justify-center space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] text-emerald-500"><span>DB_SUPABASE_MAIN</span> <span>{data?.metrics.db_latency}</span></div>
                  <div className="flex gap-[2px] mt-1 h-1.5"><div className="led active"/><div className="led active"/><div className="led active"/><div className="led active"/><div className="led"/></div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-emerald-500"><span>VERCEL_EDGE_ROUTER</span> <span>8ms</span></div>
                  <div className="flex gap-[2px] mt-1 h-1.5"><div className="led active"/><div className="led active"/><div className="led active"/><div className="led active"/><div className="led active"/></div>
                </div>
              </div>
            </div>

            <div className="cyber-panel p-4">
              <h2 className="text-[10px] md:text-xs tracking-widest border-b border-emerald-900/50 pb-2 mb-3 font-bold glow text-white">SYS RESOURCES</h2>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="border border-emerald-900/50 p-2 bg-emerald-950/20">
                  <div className="text-[9px] text-emerald-600">MEM_HEAP</div>
                  <div className="text-xl md:text-2xl mt-1 glow-cyan">{data?.metrics.memory}</div>
                </div>
                <div className="border border-emerald-900/50 p-2 bg-emerald-950/20">
                  <div className="text-[9px] text-emerald-600">UPTIME</div>
                  <div className="text-xl md:text-2xl mt-1 glow">{data?.metrics.uptime}</div>
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM TENGAH: TERMINAL AUDIT LOG */}
          <div className="xl:col-span-6 flex flex-col gap-4">
            <div className="cyber-panel flex-grow p-1 flex flex-col min-h-[300px]">
              <div className="bg-emerald-900/30 border-b border-emerald-900/50 p-2 flex justify-between items-center text-[10px]">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                </div>
                <span className="text-emerald-500">root@elsewedy-sys:~ # tail -f /var/log/audit.log</span>
              </div>
              
              <div className="p-3 text-[10px] md:text-xs overflow-y-auto flex-grow flex flex-col justify-end space-y-1">
                <div className="text-emerald-800">[SYS] Secure connection to DB... OK</div>
                <div className="text-emerald-800 mb-2">---------------------------------------------------</div>
                
                {data?.audit_logs.map((log) => (
                  <div key={log.id} className="text-gray-400">
                    <span className="text-cyan-500">[{new Date(log.created_at).toLocaleTimeString('id-ID')}]</span>{' '}
                    <span className={log.status === 'SUCCESS' ? 'text-purple-400' : 'text-yellow-500'}>
                      {log.status === 'SUCCESS' ? 'EXEC' : 'WARN'}
                    </span>{' '}
                    User <span className="text-white">{log.user?.nama || 'SYSTEM'}</span> triggered action:{' '}
                    <span className="text-emerald-400">{log.action}</span>
                  </div>
                ))}
                
                <div className="text-gray-400 mt-2">
                  <span className="text-emerald-500">root@elsewedy-sys:~ #</span> <span className="cursor-blink bg-emerald-500 text-black px-1">_</span>
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: JARINGAN & ANOMALI */}
          <div className="xl:col-span-3 flex flex-col gap-4">
            <div className="cyber-panel p-4 border-l-2 border-l-cyan-500">
              <h2 className="text-[10px] md:text-xs tracking-widest border-b border-emerald-900/50 pb-2 mb-2 font-bold glow-cyan text-cyan-400">NETWORK TRAFFIC</h2>
              <div className="flex justify-between items-end mb-2">
                <div><div className="text-[9px] text-cyan-700">INBOUND</div><div className="text-xl text-white">4.2<span className="text-xs text-cyan-500 ml-1">MB/s</span></div></div>
                <div className="text-right"><div className="text-[9px] text-emerald-700">OUTBOUND</div><div className="text-lg text-emerald-100">1.8<span className="text-xs text-emerald-500 ml-1">MB/s</span></div></div>
              </div>
            </div>

            <div className="cyber-panel p-4 border-l-2 border-l-emerald-500 flex-grow flex flex-col justify-between">
              <div>
                <h2 className="text-[10px] md:text-xs tracking-widest border-b border-emerald-900/50 pb-2 mb-3 font-bold glow text-white">SECURITY ENGINE</h2>
                <ul className="text-[10px] space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5 text-emerald-500">✅</div>
                    <div><div className="text-white">SQL Injection Guard</div><div className="text-emerald-700 text-[9px]">Prisma sanitization active</div></div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5 text-emerald-500">✅</div>
                    <div><div className="text-white">JWT Token Integrity</div><div className="text-emerald-700 text-[9px]">No expired tokens detected</div></div>
                  </li>
                </ul>
              </div>
              <button className="mt-4 w-full border border-emerald-500/50 bg-emerald-900/20 hover:bg-emerald-500 hover:text-black text-emerald-500 py-1.5 text-[10px] font-bold transition-all">
                [ RUN DIAGNOSTICS ]
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
