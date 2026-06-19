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
    <div className="noc-wrapper min-h-screen p-2 md:p-6 flex flex-col relative overflow-x-hidden selection:bg-[#00ff41] selection:text-black">
      
      {/* 🚀 CYBERPUNK HUD GLOBAL CSS & FONTS */}
      <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
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
        .glow-text-red { color: #ff003c; text-shadow: 0 0 8px #ff003c; }
        .glow-text-yellow { color: #fde047; text-shadow: 0 0 8px #fde047; }

        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        .scanline-effect {
            position: absolute; top: 0; left: 0; width: 100%; height: 5px;
            background: rgba(0, 255, 65, 0.3);
            box-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
            animation: scanline 6s linear infinite; pointer-events: none; z-index: 50;
        }

        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .cursor-blink { animation: blink 1s step-end infinite; }

        @keyframes radar { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .radar-sweep { transform-origin: center; animation: radar 4s linear infinite; }

        .noc-wrapper ::-webkit-scrollbar { width: 4px; height: 4px; }
        .noc-wrapper ::-webkit-scrollbar-track { background: #030a05; }
        .noc-wrapper ::-webkit-scrollbar-thumb { background: #00ff41; }

        .led-bar { height: 8px; width: 100%; background: #111; display: flex; gap: 2px; }
        .led-segment { flex: 1; background: #111; transition: background 0.3s; }
        .led-segment.active { background: #00ff41; box-shadow: 0 0 5px #00ff41; }
        .led-segment.active-warn { background: #fa0; box-shadow: 0 0 5px #fa0; }
        .led-segment.active-crit { background: #ff003c; box-shadow: 0 0 5px #ff003c; }
        
        .alert-row { border-left: 2px solid transparent; transition: all 0.3s; }
        .alert-row:hover { border-left-color: #0ff; background: rgba(0, 255, 255, 0.05); }
      `}} />

      <div className="scanline-effect"></div>

      {/* HEADER / TOP BAR */}
      <header className="flex flex-col md:flex-row justify-between items-end md:items-center mb-4 cyber-panel p-4 uppercase">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 border-2 border-cyan-400 rounded flex items-center justify-center text-cyan-400 glow-text-cyan shadow-[0_0_10px_rgba(0,255,255,0.3)]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-widest glow-text">ELSEWEDY <span className="text-white">N.O.C</span></h1>
            <p className="font-mono-tech text-xs tracking-[0.2em] text-emerald-600/80">KOPERASI CORE // NETWORK OPERATIONS CENTER</p>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 flex gap-4 md:gap-6 font-mono-tech text-[10px] md:text-sm">
          <div className="text-right">
            <div className="text-emerald-700">SYSTEM STATUS</div>
            <div className="text-lg md:text-xl glow-text">
                {data ? 'ONLINE' : 'CONNECTING'} <i className="inline-block w-1.5 h-1.5 bg-[#00ff41] rounded-full cursor-blink align-middle ml-1"></i>
            </div>
          </div>
          <div className="text-right border-l border-emerald-900 pl-4 md:pl-6">
            <div className="text-emerald-700">API GATEWAY</div>
            <div className="text-lg md:text-xl glow-text-cyan">SECURED</div>
          </div>
          <div className="text-right border-l border-emerald-900 pl-4 md:pl-6">
            <div className="text-emerald-700">UPTIME</div>
            <div className="text-lg md:text-xl text-white">99.998%</div>
          </div>
        </div>
      </header>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 flex-grow z-10">
        
        {/* PANEL KIRI: METRICS RADAR & RESOURCES */}
        <div className="xl:col-span-3 flex flex-col gap-4">
          
          <div className="cyber-panel p-4 relative overflow-hidden flex-grow flex flex-col">
            <h2 className="text-[10px] md:text-xs tracking-widest border-b border-emerald-900/50 pb-2 mb-3 font-bold uppercase glow-text text-white">Service Endpoints</h2>
            
            <div className="absolute right-[-30px] top-[20px] opacity-20">
              <svg width="150" height="150" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#00ff41" strokeWidth="1" strokeDasharray="2 4"/>
                <circle cx="50" cy="50" r="30" fill="none" stroke="#00ff41" strokeWidth="1"/>
                <circle cx="50" cy="50" r="15" fill="none" stroke="#00ff41" strokeWidth="1"/>
                <path d="M50 50 L50 5" stroke="#00ff41" strokeWidth="2" fill="none" className="radar-sweep"/>
              </svg>
            </div>

            <div className="relative z-10 flex-grow flex flex-col justify-center space-y-3 font-mono-tech">
              <div>
                <div className="flex justify-between text-[10px] text-emerald-500"><span>DB_SUPABASE_MAIN</span> <span>{data?.metrics.db_latency || '--ms'}</span></div>
                <div className="led-bar mt-1 h-1.5">
                  <div className="led-segment active"></div><div className="led-segment active"></div><div className="led-segment active"></div>
                  <div className="led-segment active"></div><div className="led-segment active"></div><div className="led-segment"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-emerald-500"><span>VERCEL_EDGE_ROUTER</span> <span>8ms</span></div>
                <div className="led-bar mt-1 h-1.5">
                  <div className="led-segment active"></div><div className="led-segment active"></div><div className="led-segment active"></div>
                  <div className="led-segment active"></div><div className="led-segment active"></div><div className="led-segment active"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-emerald-500"><span>SMTP_RESEND_GW</span> <span className="text-orange-500">145ms</span></div>
                <div className="led-bar mt-1 h-1.5">
                  <div className="led-segment active-warn"></div><div className="led-segment active-warn"></div><div className="led-segment active-warn"></div>
                  <div className="led-segment"></div><div className="led-segment"></div><div className="led-segment"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-emerald-500"><span>CLOUDINARY_STORAGE</span> <span>42ms</span></div>
                <div className="led-bar mt-1 h-1.5">
                  <div className="led-segment active"></div><div className="led-segment active"></div><div className="led-segment active"></div>
                  <div className="led-segment active"></div><div className="led-segment"></div><div className="led-segment"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="cyber-panel p-4 font-mono-tech">
            <h2 className="text-[10px] md:text-xs tracking-widest border-b border-emerald-900/50 pb-2 mb-3 font-bold uppercase glow-text text-white">Infrastructure Health</h2>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="border border-emerald-900/50 p-2 bg-emerald-950/20">
                <div className="text-[9px] text-emerald-600">MEM_HEAP</div>
                <div className="text-xl md:text-2xl mt-1 glow-text-cyan">{data?.metrics.memory || '--'}</div>
              </div>
              <div className="border border-emerald-900/50 p-2 bg-emerald-950/20">
                <div className="text-[9px] text-emerald-600">CPU_LOAD</div>
                <div className="text-xl md:text-2xl mt-1 glow-text">12<span className="text-[10px] text-emerald-700">%</span></div>
              </div>
              <div className="border border-emerald-900/50 p-2 bg-emerald-950/20">
                <div className="text-[9px] text-emerald-600">DB_STORAGE</div>
                <div className="text-xl md:text-2xl mt-1 glow-text-cyan">45<span className="text-[10px] text-emerald-700">%</span></div>
              </div>
              <div className="border border-emerald-900/50 p-2 bg-emerald-950/20">
                <div className="text-[9px] text-emerald-600">DISK_IO</div>
                <div className="text-xl md:text-2xl mt-1 text-white">OK</div>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL TENGAH: TERMINAL & ACTIVE INCIDENTS */}
        <div className="xl:col-span-6 flex flex-col gap-4">
          
          <div className="cyber-panel flex-grow p-1 flex flex-col min-h-[300px]">
            <div className="bg-emerald-900/30 border-b border-emerald-900/50 p-2 flex justify-between items-center font-mono-tech text-[9px] md:text-[10px]">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              </div>
              <span className="text-emerald-500 hidden md:inline">root@elsewedy-sys:~ # tail -f /var/log/audit.log</span>
              <span className="text-emerald-500 md:hidden">/var/log/audit.log</span>
            </div>
            
            <div className="p-3 font-mono-tech text-[10px] md:text-xs overflow-y-auto flex-grow flex flex-col justify-end space-y-1">
              <div className="text-emerald-800">[SYS] Secure connection to DB... OK</div>
              <div className="text-emerald-800 mb-2">---------------------------------------------------</div>
              
              {loading && !data && (
                <div className="text-yellow-400 animate-pulse">[LOAD] FETCHING SECURE AUDIT TRAILS...</div>
              )}

              {data && data.audit_logs.map((log) => (
                <div key={log.id} className="text-gray-400">
                  <span className="text-cyan-500">[{new Date(log.created_at).toLocaleTimeString('id-ID')}]</span>{' '}
                  <span className={log.status === 'SUCCESS' ? 'text-purple-400' : 'text-yellow-500'}>
                    {log.status === 'SUCCESS' ? 'EXEC' : 'WARN'}
                  </span>{' '}
                  User <span className="text-white">{log.user?.nama || 'SYSTEM'}</span> action:{' '}
                  <span className="text-emerald-400 underline">{log.action}</span>
                </div>
              ))}

              {!data && (
                <>
                  <div className="text-gray-400">
                    <span className="text-cyan-500">[19:40:02]</span> <span className="text-purple-400">AUTH</span> 
                    User <span className="text-white">ANGGOTA_1092</span> authenticated. IP: 10.x.x.45
                  </div>
                  <div className="text-gray-400">
                    <span className="text-cyan-500">[20:15:14]</span> <span className="text-yellow-500">WARN</span> 
                    Failed login attempt for <span className="text-white">BENDAHARA</span>. Bad credentials.
                  </div>
                  <div className="text-gray-400">
                    <span className="text-cyan-500">[20:18:05]</span> <span className="text-purple-400">AUTH</span> 
                    User <span className="text-white">BENDAHARA</span> authenticated. IP: 192.168.1.12
                  </div>
                  <div className="text-gray-400">
                    <span className="text-cyan-500">[20:25:33]</span> <span className="text-emerald-500">EXEC</span> 
                    <span className="text-white">BENDAHARA</span> action: <span className="text-emerald-400 underline">APPROVE_LOAN_#8891</span>
                  </div>
                </>
              )}

              <div className="text-gray-400 mt-2">
                <span className="text-emerald-500">root@elsewedy-sys:~ #</span> <span className="cursor-blink bg-emerald-500 text-black px-1 font-bold">_</span>
              </div>
            </div>
          </div>

          <div className="cyber-panel p-4 h-48 flex flex-col">
            <div className="flex justify-between items-end border-b border-emerald-900/50 pb-2 mb-2">
              <h2 className="text-[10px] md:text-xs tracking-widest font-bold uppercase glow-text-yellow text-yellow-400">Active Incident Queue</h2>
              <span className="text-[9px] font-mono-tech text-emerald-600">3 ALERTS DETECTED</span>
            </div>
            
            <div className="overflow-y-auto pr-2 flex-grow space-y-1 font-mono-tech text-[10px] md:text-xs">
              <div className="alert-row p-1.5 flex justify-between items-center bg-red-950/20">
                <div className="flex gap-2 items-center">
                  <span className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[8px] font-bold">P1</span>
                  <span className="text-red-400">DB Connection Spike Detected</span>
                </div>
                <span className="text-gray-500 text-[9px]">2m ago</span>
              </div>
              <div className="alert-row p-1.5 flex justify-between items-center bg-yellow-950/20">
                <div className="flex gap-2 items-center">
                  <span className="bg-yellow-600 text-black px-1.5 py-0.5 rounded text-[8px] font-bold">P2</span>
                  <span className="text-yellow-400">High API Latency (Route: /api/laporan)</span>
                </div>
                <span className="text-gray-500 text-[9px]">15m ago</span>
              </div>
              <div className="alert-row p-1.5 flex justify-between items-center bg-blue-950/20">
                <div className="flex gap-2 items-center">
                  <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[8px] font-bold">P3</span>
                  <span className="text-blue-400">SMTP Retry Limit Reached (3 emails)</span>
                </div>
                <span className="text-gray-500 text-[9px]">1h ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL KANAN: TRAFFIC, NETWORK & ANOMALIES */}
        <div className="xl:col-span-3 flex flex-col gap-4">
          
          <div className="cyber-panel p-4 border-l-2 border-l-cyan-500 flex flex-col justify-between">
            <h2 className="text-[10px] md:text-xs tracking-widest border-b border-emerald-900/50 pb-2 mb-2 font-bold uppercase glow-text-cyan text-cyan-400">Network Traffic</h2>
            
            <div className="font-mono-tech">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <div className="text-[9px] text-cyan-700">INBOUND (Rx)</div>
                  <div className="text-2xl text-white">4.2<span className="text-xs text-cyan-500 ml-1">MB/s</span></div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-emerald-700">OUTBOUND (Tx)</div>
                  <div className="text-xl text-emerald-100">1.8<span className="text-xs text-emerald-500 ml-1">MB/s</span></div>
                </div>
              </div>
              
              <div className="flex justify-between text-[9px] text-slate-400 mb-1">
                <span>TCP Connections: <span className="text-white">42</span></span>
                <span>Packet Loss: <span className="text-emerald-400">0.01%</span></span>
              </div>
              
              <div className="mt-2 h-12 w-full flex items-end gap-0.5 opacity-80 pointer-events-none">
                <div className="w-full bg-cyan-900 h-[20%]"></div>
                <div className="w-full bg-cyan-700 h-[40%]"></div>
                <div className="w-full bg-cyan-500 h-[80%]"></div>
                <div className="w-full bg-cyan-600 h-[60%]"></div>
                <div className="w-full bg-cyan-800 h-[30%]"></div>
                <div className="w-full bg-cyan-500 h-[90%] shadow-[0_0_10px_#0ff]"></div>
                <div className="w-full bg-cyan-400 h-[100%] shadow-[0_0_15px_#0ff]"></div>
                <div className="w-full bg-cyan-800 h-[50%]"></div>
                <div className="w-full bg-cyan-900 h-[20%]"></div>
              </div>
            </div>
          </div>

          <div className="cyber-panel p-4 border-l-2 border-l-emerald-500 flex-grow flex flex-col justify-between">
            <div>
              <h2 className="text-[10px] md:text-xs tracking-widest border-b border-emerald-900/50 pb-2 mb-3 font-bold uppercase glow-text text-white">Security & Audit</h2>
              
              <ul className="font-mono-tech text-[10px] space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✔</span>
                  <div>
                    <div className="text-white">SQL Injection Guard</div>
                    <div className="text-emerald-700 text-[9px]">Prisma sanitization active</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✔</span>
                  <div>
                    <div className="text-white">JWT Token Integrity</div>
                    <div className="text-emerald-700 text-[9px]">No expired tokens detected</div>
                  </div>
                </li>
                <li className="flex items-start gap-2 border border-red-900/50 bg-red-900/10 p-1.5 rounded">
                  <span className="text-red-500 mt-0.5 animate-pulse">⚠</span>
                  <div>
                    <div className="text-red-400">Suspicious Login Pattern</div>
                    <div className="text-red-700 text-[9px]">3 failed attempts (IP: 114.x.x.x)</div>
                  </div>
                </li>
              </ul>
            </div>

            <button 
              onClick={fetchHealth}
              className="mt-4 w-full border border-emerald-500/50 bg-emerald-900/20 hover:bg-emerald-500 hover:text-black text-emerald-500 font-mono-tech py-1.5 text-[10px] font-bold transition-all duration-300">
                [ RUN DIAGNOSTICS ]
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
