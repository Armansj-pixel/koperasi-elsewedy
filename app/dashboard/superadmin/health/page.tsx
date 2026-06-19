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
    const interval = setInterval(fetchHealth, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="noc-wrapper min-h-screen w-full p-3 md:p-6 flex flex-col relative overflow-hidden selection:bg-[#00ff41] selection:text-black">
      
      {/* 🚀 CYBERPUNK HUD GLOBAL CSS & FONTS */}
      <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
        /* Memaksa background Next.js yang putih menjadi hitam pekat NOC */
        html, body, main {
            background-color: #030a05 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100%;
            height: 100%;
        }
        
        .noc-wrapper {
            background-color: #030a05;
            background-image: 
                linear-gradient(rgba(0, 255, 65, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 255, 65, 0.03) 1px, transparent 1px);
            background-size: 30px 30px;
            color: #00ff41;
            font-family: 'Rajdhani', sans-serif;
        }
        
        .font-mono-tech { font-family: 'Share Tech Mono', monospace; }

        .cyber-panel {
            background: rgba(3, 15, 8, 0.85);
            border: 1px solid rgba(0, 255, 65, 0.3);
            position: relative;
            box-shadow: inset 0 0 20px rgba(0, 255, 65, 0.05);
            backdrop-filter: blur(4px);
        }
        .cyber-panel::before, .cyber-panel::after {
            content: ''; position: absolute; width: 10px; height: 10px; border: 2px solid #00ff41;
        }
        .cyber-panel::before { top: -1px; left: -1px; border-right: none; border-bottom: none; }
        .cyber-panel::after { bottom: -1px; right: -1px; border-left: none; border-top: none; }

        .glow-text { text-shadow: 0 0 8px #00ff41; }
        .glow-text-cyan { color: #0ff; text-shadow: 0 0 8px #0ff; }

        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        .scanline-effect {
            position: absolute; top: 0; left: 0; width: 100%; height: 5px;
            background: rgba(0, 255, 65, 0.3);
            box-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
            animation: scanline 6s linear infinite; pointer-events: none; z-index: 50;
        }

        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .cursor-blink { animation: blink 1s step-end infinite; }

        .noc-wrapper ::-webkit-scrollbar { width: 4px; height: 4px; }
        .noc-wrapper ::-webkit-scrollbar-track { background: #030a05; }
        .noc-wrapper ::-webkit-scrollbar-thumb { background: #00ff41; }

        .led-bar { height: 8px; width: 100%; background: #111; display: flex; gap: 2px; }
        .led-segment { flex: 1; background: #111; transition: background 0.3s; }
        .led-segment.active { background: #00ff41; box-shadow: 0 0 5px #00ff41; }
        .led-segment.active-warn { background: #fa0; box-shadow: 0 0 5px #fa0; }
        
        .alert-row { border-left: 2px solid transparent; transition: all 0.3s; }
        .alert-row:hover { border-left-color: #0ff; background: rgba(0, 255, 255, 0.05); }
      `}} />

      <div className="scanline-effect"></div>

      {/* HEADER / TOP BAR - DIOPTIMALKAN UNTUK SEMUA LAYAR */}
      <header className="flex flex-col lg:flex-row justify-between items-center mb-6 cyber-panel p-4 uppercase text-center lg:text-left gap-4 w-full">
        <div>
          <h1 className="text-3xl font-bold tracking-widest glow-text">ELSEWEDY <span className="text-white">N.O.C</span></h1>
          <p className="font-mono-tech text-[10px] md:text-xs tracking-[0.2em] text-emerald-600/80">KOPERASI CORE // NETWORK OPERATIONS CENTER</p>
        </div>
        
        <div className="flex flex-wrap justify-center lg:justify-end gap-4 md:gap-6 font-mono-tech text-[10px] md:text-sm">
          <div className="text-center lg:text-right">
            <div className="text-emerald-700">SYSTEM STATUS</div>
            <div className="text-lg md:text-xl glow-text">
                {data ? 'ONLINE' : 'CONNECTING'} <i className="inline-block w-1.5 h-1.5 bg-[#00ff41] rounded-full cursor-blink align-middle ml-1"></i>
            </div>
          </div>
          <div className="text-center lg:text-right border-l border-emerald-900 pl-4 md:pl-6">
            <div className="text-emerald-700">API GATEWAY</div>
            <div className="text-lg md:text-xl glow-text-cyan">SECURED</div>
          </div>
          <div className="text-center lg:text-right border-l border-emerald-900 pl-4 md:pl-6">
            <div className="text-emerald-700">UPTIME</div>
            <div className="text-lg md:text-xl text-white">99.998%</div>
          </div>
        </div>
      </header>

      {/* MAIN GRID - SUSUNAN RESPONSIF (1 Kolom HP -> 2 Kolom Tablet -> 3 Kolom Laptop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 flex-grow z-10 w-full">
        
        {/* PANEL KIRI: METRICS RESOURCES */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="cyber-panel p-4 flex-grow flex flex-col">
            <h2 className="text-[10px] md:text-xs tracking-widest border-b border-emerald-900/50 pb-2 mb-4 font-bold uppercase glow-text text-white">Service Endpoints</h2>
            
            <div className="flex-grow flex flex-col justify-center space-y-4 font-mono-tech">
              <div>
                <div className="flex justify-between text-[10px] text-emerald-500 mb-1"><span>DB_SUPABASE</span> <span>{data?.metrics.db_latency || '--ms'}</span></div>
                <div className="led-bar">
                  <div className="led-segment active"></div><div className="led-segment active"></div><div className="led-segment active"></div>
                  <div className="led-segment active"></div><div className="led-segment active"></div><div className="led-segment"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-emerald-500 mb-1"><span>VERCEL_EDGE</span> <span>8ms</span></div>
                <div className="led-bar">
                  <div className="led-segment active"></div><div className="led-segment active"></div><div className="led-segment active"></div>
                  <div className="led-segment active"></div><div className="led-segment active"></div><div className="led-segment active"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-emerald-500 mb-1"><span>SMTP_GATEWAY</span> <span className="text-orange-500">145ms</span></div>
                <div className="led-bar">
                  <div className="led-segment active-warn"></div><div className="led-segment active-warn"></div><div className="led-segment active-warn"></div>
                  <div className="led-segment"></div><div className="led-segment"></div><div className="led-segment"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="cyber-panel p-4 font-mono-tech">
            <h2 className="text-[10px] md:text-xs tracking-widest border-b border-emerald-900/50 pb-2 mb-3 font-bold uppercase glow-text text-white">Infrastructure</h2>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="border border-emerald-900/50 p-2 bg-emerald-950/20">
                <div className="text-[9px] text-emerald-600">MEM_HEAP</div>
                <div className="text-xl mt-1 glow-text-cyan truncate">{data?.metrics.memory || '--'}</div>
              </div>
              <div className="border border-emerald-900/50 p-2 bg-emerald-950/20">
                <div className="text-[9px] text-emerald-600">SYS_UPTIME</div>
                <div className="text-xl mt-1 glow-text truncate">{data?.metrics.uptime || '--'}</div>
              </div>
              <div className="border border-emerald-900/50 p-2 bg-emerald-950/20">
                <div className="text-[9px] text-emerald-600">DB_STORAGE</div>
                <div className="text-xl mt-1 glow-text-cyan">45<span className="text-[10px] text-emerald-700">%</span></div>
              </div>
              <div className="border border-emerald-900/50 p-2 bg-emerald-950/20">
                <div className="text-[9px] text-emerald-600">DISK_IO</div>
                <div className="text-xl mt-1 text-white font-bold">ACTIVE</div>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL TENGAH: REAL TERMINAL AUDIT LOG (Penuh di Tablet/Mobile) */}
        <div className="md:col-span-2 lg:col-span-6 flex flex-col gap-4">
          <div className="cyber-panel flex-grow p-1 flex flex-col h-[350px] lg:h-auto">
            <div className="bg-emerald-900/30 border-b border-emerald-900/50 p-2 flex justify-between items-center font-mono-tech text-[10px]">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              </div>
              <span className="text-emerald-500 truncate ml-2">root@elsewedy-sys:~ # tail -f /var/log/audit.log</span>
            </div>
            
            <div className="p-3 font-mono-tech text-[10px] md:text-xs overflow-y-auto flex-grow flex flex-col justify-end space-y-1.5 break-words bg-black/40">
              <div className="text-emerald-800">[SYS] Initializing secure telemetry connection... OK</div>
              <div className="text-emerald-800 border-b border-emerald-900/30 pb-1 mb-1">---------------------------------------------------</div>
              
              {loading && !data && (
                <div className="text-yellow-400 animate-pulse">[LOAD] FETCHING SECURE AUDIT TRAILS FROM SUPABASE...</div>
              )}

              {data && data.audit_logs.map((log) => (
                <div key={log.id} className="text-gray-400">
                  <span className="text-cyan-500">[{new Date(log.created_at).toLocaleTimeString('id-ID')}]</span>{' '}
                  <span className={log.status === 'SUCCESS' ? 'text-purple-400' : 'text-yellow-500'}>
                    {log.status === 'SUCCESS' ? 'EXEC' : 'WARN'}
                  </span>{' '}
                  User <span className="text-white font-semibold">{log.user?.nama || 'SYSTEM'}</span> action:{' '}
                  <span className="text-emerald-400">{log.action}</span>
                </div>
              ))}

              <div className="text-gray-400 mt-2">
                <span className="text-emerald-500">root@elsewedy-sys:~ #</span> <span className="cursor-blink bg-emerald-500 text-black px-1 font-bold">_</span>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL KANAN: TRAFFIC MATRIX GRAPH & ALERTS */}
        <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-4">
          <div className="cyber-panel p-4 border-l-2 border-l-cyan-500 flex flex-col">
            <h2 className="text-[10px] md:text-xs tracking-widest border-b border-emerald-900/50 pb-2 mb-2 font-bold uppercase glow-text-cyan text-cyan-400">Network Traffic</h2>
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
              <div className="mt-2 h-12 w-full flex items-end gap-1 opacity-80 pointer-events-none">
                <div className="flex-1 bg-cyan-900 h-[30%]"></div>
                <div className="flex-1 bg-cyan-700 h-[45%]"></div>
                <div className="flex-1 bg-cyan-500 h-[75%] shadow-[0_0_10px_#0ff]"></div>
                <div className="flex-1 bg-cyan-600 h-[60%]"></div>
                <div className="flex-1 bg-cyan-400 h-[100%] shadow-[0_0_15px_#0ff]"></div>
                <div className="flex-1 bg-cyan-800 h-[50%]"></div>
                <div className="flex-1 bg-cyan-900 h-[20%]"></div>
              </div>
            </div>
          </div>

          <div className="cyber-panel p-4 border-l-2 border-l-yellow-500 flex-grow flex flex-col">
            <h2 className="text-[10px] md:text-xs tracking-widest border-b border-emerald-900/50 pb-2 mb-2 font-bold uppercase glow-text-yellow text-yellow-400">Threat Console</h2>
            <div className="overflow-y-auto flex-grow space-y-2 font-mono-tech text-[10px] md:text-xs mt-2">
              <div className="alert-row p-2 flex justify-between items-center bg-red-950/20 border-l-2 border-red-600">
                <div className="flex gap-2 items-center">
                  <span className="bg-red-600 text-white px-1 py-0.5 rounded text-[8px] font-bold">P1</span>
                  <span className="text-red-400 font-semibold truncate">DB Query Latency Exceeded</span>
                </div>
              </div>
              <div className="alert-row p-2 flex justify-between items-center bg-yellow-950/20 border-l-2 border-yellow-500">
                <div className="flex gap-2 items-center">
                  <span className="bg-yellow-500 text-black px-1 py-0.5 rounded text-[8px] font-bold">P2</span>
                  <span className="text-yellow-400 truncate">High API Endpoint Traffic</span>
                </div>
              </div>
            </div>
            <button 
              onClick={fetchHealth}
              className="mt-4 w-full border border-emerald-500/50 bg-emerald-900/20 hover:bg-emerald-500 hover:text-black text-emerald-500 font-mono-tech py-2 text-[10px] font-bold tracking-widest transition-all duration-300">
              [ FORCE SECURITY RESYNC ]
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
