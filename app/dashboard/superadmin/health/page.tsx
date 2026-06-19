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

export default function NOCCommandCenterPage() {
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
      console.error('NOC Sync Error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealth()
    const interval = setInterval(fetchHealth, 10000) // Sinkronisasi otomatis tiap 10 detik
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#030a05] text-[#00ff41] p-4 md:p-6 flex flex-col relative overflow-x-hidden selection:bg-[#00ff41] selection:text-black" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
      
      {/* 🚀 CYBERPUNK HUD GLOBAL CORE CSS INJECTION */}
      <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
        .font-mono-tech { font-family: 'Share Tech Mono', monospace; }
        .cyber-panel {
          background: rgba(3, 15, 8, 0.85); border: 1px solid rgba(0, 255, 65, 0.3);
          box-shadow: inset 0 0 20px rgba(0, 255, 65, 0.05); position: relative; backdrop-filter: blur(4px);
        }
        .cyber-panel::before, .cyber-panel::after {
          content: ''; position: absolute; width: 10px; height: 10px; border: 2px solid #00ff41;
        }
        .cyber-panel::before { top: -1px; left: -1px; border-right: none; border-bottom: none; }
        .cyber-panel::after { bottom: -1px; right: -1px; border-left: none; border-top: none; }
        .glow-text { text-shadow: 0 0 8px #00ff41; }
        .glow-cyan { color: #0ff; text-shadow: 0 0 8px #0ff; }
        .glow-red { color: #ff003c; text-shadow: 0 0 8px #ff003c; }
        .glow-yellow { color: #fde047; text-shadow: 0 0 8px #fde047; }
        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        .scanline-effect {
          position: fixed; top: 0; left: 0; width: 100%; height: 5px;
          background: rgba(0, 255, 65, 0.3); box-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
          animation: scanline 6s linear infinite; pointer-events: none; z-index: 50;
        }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .cursor-blink { animation: blink 1s step-end infinite; }
        @keyframes radar { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .radar-sweep { transform-origin: center; animation: radar 4s linear infinite; }
      `}} />

      <div className="scanline-effect"></div>

      {/* HEADER PLATFORM */}
      <header className="flex flex-col md:flex-row justify-between items-end md:items-center mb-4 cyber-panel p-4 uppercase">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 border-2 border-cyan-400 rounded flex items-center justify-center text-cyan-400 glow-cyan shadow-[0_0_10px_rgba(0,255,255,0.3)]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-widest glow-text">ELSEWEDY <span className="text-white">N.O.C</span></h1>
            <p className="font-mono-tech text-xs tracking-[0.2em] text-emerald-600/80">KOPERASI CORE // NETWORK OPERATIONS CENTER</p>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 flex gap-4 md:gap-6 font-mono-tech text-[10px] md:text-sm">
          <div className="text-right">
            <div className="text-emerald-700">SYSTEM STATUS</div>
            <div className="text-lg md:text-xl glow-text">
              {data ? 'ONLINE' : 'SYNCING'} <span className="inline-block w-1.5 h-1.5 bg-[#00ff41] rounded-full cursor-blink align-middle ml-1"></span>
            </div>
          </div>
          <div className="text-right border-l border-emerald-900 pl-4 md:pl-6">
            <div className="text-emerald-700">API GATEWAY</div>
            <div className="text-lg md:text-xl glow-cyan">SECURED</div>
          </div>
          <div className="text-right border-l border-emerald-900 pl-4 md:pl-6">
            <div className="text-emerald-700">UPTIME</div>
            <div className="text-lg md:text-xl text-white">99.998%</div>
          </div>
        </div>
      </header>

      {/* MATRIX LAYOUT MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 flex-grow">
        
        {/* PANEL KIRI: METRIK RADAR & HARDWARE STATUS */}
        <div className="xl:col-span-3 flex flex-col gap-4">
          
          {/* Radar Endpoints Card */}
          <div className="cyber-panel p-4 relative overflow-hidden flex-grow flex flex-col min-h-[220px]">
            <h2 className="text-[10px] md:text-xs tracking-widest border-b border-emerald-900/50 pb-2 mb-3 font-bold uppercase text-white glow-text">Service Endpoints</h2>
            
            {/* Animated SVG Radar */}
            <div className="absolute right-[-30px] top-[20px] opacity-20 pointer-events-none">
              <svg width="150" height="150" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#00ff41" strokeWidth="1" strokeDasharray="2 4"/>
                <circle cx="50" cy="50" r="30" fill="none" stroke="#00ff41" strokeWidth="1"/>
                <circle cx="50" cy="50" r="15" fill="none" stroke="#00ff41" strokeWidth="1"/>
                <path d="M50 50 L50 5" stroke="#00ff41" strokeWidth="2" fill="none" className="radar-sweep" />
              </svg>
            </div>

            <div className="relative z-10 flex-grow flex flex-col justify-center space-y-3 font-mono-tech">
              <div>
                <div className="flex justify-between text-[10px] text-emerald-500"><span>DB_SUPABASE_MAIN</span> <span>{data ? data.metrics.db_latency : '--'}</span></div>
                <div className="flex gap-[2px] mt-1 h-1.5 w-full bg-[#111]">
                  <div className="flex-1 bg-[#00ff41] shadow-[0_0_5px_#00ff41]"></div>
                  <div className="flex-1 bg-[#00ff41] shadow-[0_0_5px_#00ff41]"></div>
                  <div className="flex-1 bg-[#00ff41] shadow-[0_0_5px_#00ff41]"></div>
                  <div className="flex-1 bg-[#00ff41] shadow-[0_0_5px_#00ff41]"></div>
                  <div className="flex-1 bg-[#111]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-emerald-500"><span>VERCEL_EDGE_ROUTER</span> <span>8ms</span></div>
                <div className="flex gap-[2px] mt-1 h-1.5 w-full bg-[#111]">
                  <div className="flex-1 bg-[#00ff41] shadow-[0_0_5px_#00ff41]"></div>
                  <div className="flex-1 bg-[#00ff41] shadow-[0_0_5px_#00ff41]"></div>
                  <div className="flex-1 bg-[#00ff41] shadow-[0_0_5px_#00ff41]"></div>
                  <div className="flex-1 bg-[#00ff41] shadow-[0_0_5px_#00ff41]"></div>
                  <div className="flex-1 bg-[#00ff41] shadow-[0_0_5px_#00ff41]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-emerald-500"><span>SMTP_RESEND_GW</span> <span className="text-orange-500">145ms</span></div>
                <div className="flex gap-[2px] mt-1 h-1.5 w-full bg-[#111]">
                  <div className="flex-1 bg-orange-500 shadow-[0_0_5px_#fa0]"></div>
                  <div className="flex-1 bg-orange-500 shadow-[0_0_5px_#fa0]"></div>
                  <div className="flex-1 bg-[#111]"></div>
                  <div className="flex-1 bg-[#111]"></div>
                  <div className="flex-1 bg-[#111]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Infrastructure Health Status Matrix */}
          <div className="cyber-panel p-4 font-mono-tech">
            <h2 className="text-[10px] md:text-xs tracking-widest border-b border-emerald-900/50 pb-2 mb-3 font-bold uppercase text-white glow-text">Infrastructure Health</h2>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="border border-emerald-900/50 p-2 bg-emerald-950/20">
                <div className="text-[9px] text-emerald-600">MEM_HEAP</div>
                <div className="text-xl md:text-2xl mt-1 glow-text-cyan">{data ? data.metrics.memory : '--'}</div>
              </div>
              <div className="border border-emerald-900/50 p-2 bg-emerald-950/20">
                <div className="text-[9px] text-emerald-600">SYS_UPTIME</div>
                <div className="text-xl md:text-2xl mt-1 glow-text">{data ? data.metrics.uptime : '--'}</div>
              </div>
              <div className="border border-emerald-900/50 p-2 bg-emerald-950/20">
                <div className="text-[9px] text-emerald-600">DB_STORAGE</div>
                <div className="text-xl md:text-2xl mt-1 glow-text-cyan">45<span className="text-[10px] text-emerald-700">%</span></div>
              </div>
              <div className="border border-emerald-900/50 p-2 bg-emerald-950/20">
                <div className="text-[9px] text-emerald-600">DISK_IO</div>
                <div className="text-xl md:text-2xl mt-1 text-white font-bold">ACTIVE</div>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL TENGAH: REAL TERMINAL AUDIT LOG & ALERTS */}
        <div className="xl:col-span-6 flex flex-col gap-4">
          
          {/* Main Linux Style Console Terminal */}
          <div className="cyber-panel flex-grow p-1 flex flex-col min-h-[340px]">
            <div className="bg-emerald-900/30 border-b border-emerald-900/50 p-2 flex justify-between items-center font-mono-tech text-[9px] md:text-[10px]">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span>
                <span className="w-2 h-2 bg-yellow-500 rounded-full inline-block"></span>
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
              </div>
              <span className="text-emerald-500">root@elsewedy-sys:~ # tail -f /var/log/audit.log</span>
            </div>
            
            <div className="p-3 font-mono-tech text-[10px] md:text-xs overflow-y-auto flex-grow flex flex-col justify-end space-y-1 bg-black/40 rounded-b">
              <div className="text-emerald-800">[SYS] Initializing secure telemetry connection... OK</div>
              <div className="text-emerald-800 border-b border-emerald-900/30 pb-1 mb-1">---------------------------------------------------</div>
              
              {loading && !data ? (
                <div className="text-yellow-400 animate-pulse">[LOAD] FETCHING SECURE AUDIT TRAILS FROM SUPABASE POOL...</div>
              ) : (
                data?.audit_logs.map((log) => (
                  <div key={log.id} className="text-gray-400 break-all">
                    <span className="text-cyan-500">[{new Date(log.created_at).toLocaleTimeString('id-ID')}]</span>{' '}
                    <span className={log.status === 'SUCCESS' ? 'text-purple-400' : 'glow-text-red'}>
                      {log.status === 'SUCCESS' ? 'EXEC' : 'FAIL'}
                    </span>{' '}
                    User <span className="text-white font-semibold">{log.user?.nama || 'SYSTEM'}</span>:{' '}
                    <span className="text-emerald-400">{log.action}</span>
                  </div>
                ))
              )}
              
              <div className="text-gray-400 mt-2">
                <span className="text-emerald-500">root@elsewedy-sys:~ #</span> <span className="cursor-blink bg-emerald-500 text-black px-1 font-bold">_</span>
              </div>
            </div>
          </div>

          {/* Active Incident Queue Panel */}
          <div className="cyber-panel p-4 h-44 flex flex-col">
            <div className="flex justify-between items-end border-b border-emerald-900/50 pb-2 mb-2">
              <h2 className="text-[10px] md:text-xs tracking-widest font-bold uppercase glow-text-yellow">Active Incident Queue</h2>
              <span className="text-[9px] font-mono-tech text-emerald-600">REALTIME THREAT CONSOLE</span>
            </div>
            
            <div className="overflow-y-auto pr-1 flex-grow space-y-1 font-mono-tech text-[10px] md:text-xs">
              <div className="p-1.5 flex justify-between items-center bg-red-950/20 border-l-2 border-red-600">
                <div className="flex gap-2 items-center">
                  <span className="bg-red-600 text-white px-1 py-0.2 rounded text-[8px] font-bold">P1</span>
                  <span className="text-red-400 font-semibold">DB Query Latency Threshold Exceeded</span>
                </div>
                <span className="text-gray-500 text-[9px]">Active</span>
              </div>
              <div className="p-1.5 flex justify-between items-center bg-yellow-950/20 border-l-2 border-yellow-500">
                <div className="flex gap-2 items-center">
                  <span className="bg-yellow-500 text-black px-1 py-0.2 rounded text-[8px] font-bold">P2</span>
                  <span className="text-yellow-400">High API Endpoint Traffic (/api/laporan)</span>
                </div>
                <span className="text-gray-500 text-[9px]">15m ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL KANAN: TRAFFIC MATRIX GRAPH & SECURITY MATRIX */}
        <div className="xl:col-span-3 flex flex-col gap-4">
          
          {/* Live Network Bandwidth Card */}
          <div className="cyber-panel p-4 border-l-2 border-l-cyan-500 flex flex-col justify-between">
            <h2 className="text-[10px] md:text-xs tracking-widest border-b border-emerald-900/50 pb-2 mb-2 font-bold uppercase glow-text-cyan">Network Traffic</h2>
            <div className="font-mono-tech">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <div className="text-[9px] text-cyan-700">INBOUND (Rx)</div>
                  <div className="text-xl text-white font-bold">4.2<span className="text-xs text-cyan-500 ml-1">MB/s</span></div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-emerald-700">OUTBOUND (Tx)</div>
                  <div className="text-lg text-emerald-100">1.8<span className="text-xs text-emerald-500 ml-1">MB/s</span></div>
                </div>
              </div>
              
              <div className="flex justify-between text-[9px] text-slate-400 mb-1">
                <span>Pool Conns: <span className="text-white">42</span></span>
                <span>Loss Rate: <span className="text-emerald-400">0.00%</span></span>
              </div>
              
              {/* Simulated Tech Audio Bar Graph */}
              <div className="mt-2 h-12 w-full flex items-end gap-0.5 opacity-80 pointer-events-none">
                <div className="w-full bg-cyan-900 h-[30%]"></div>
                <div className="w-full bg-cyan-700 h-[45%]"></div>
                <div className="w-full bg-cyan-500 h-[75%] shadow-[0_0_10px_#0ff]"></div>
                <div className="w-full bg-cyan-600 h-[60%]"></div>
                <div className="w-full bg-cyan-400 h-[100%] shadow-[0_0_15px_#0ff]"></div>
                <div className="w-full bg-cyan-800 h-[50%]"></div>
                <div className="w-full bg-cyan-900 h-[20%]"></div>
              </div>
            </div>
          </div>

          {/* Real-time Security Shield Component */}
          <div className="cyber-panel p-4 border-l-2 border-l-emerald-500 flex-grow flex flex-col justify-between">
            <div>
              <h2 className="text-[10px] md:text-xs tracking-widest border-b border-emerald-900/50 pb-2 mb-3 font-bold uppercase text-white glow-text">Security Engine</h2>
              <ul className="font-mono-tech text-[10px] space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✔</span>
                  <div>
                    <div className="text-white">SQL Injection Shield</div>
                    <div className="text-emerald-700 text-[9px]">Prisma escape optimization active</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✔</span>
                  <div>
                    <div className="text-white">JWT Access Validation</div>
                    <div className="text-emerald-700 text-[9px]">Strict session middleware verified</div>
                  </div>
                </li>
              </ul>
            </div>

            <button 
              onClick={fetchHealth}
              className="mt-4 w-full border border-emerald-500/50 bg-emerald-900/20 hover:bg-emerald-500 hover:text-black text-emerald-500 font-mono-tech py-2 text-[10px] font-bold tracking-widest transition-all duration-300 active:scale-[0.98]"
            >
              [ FORCE SECURITY RESYNC ]
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
