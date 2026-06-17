import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <>
      <style>{`
        /* Reset global untuk memastikan tidak ada margin putih di pinggir layar */
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          background-color: #0b1629;
        }

        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        /* Wrapper utama: Mengunci posisi tepat di tengah */
        .lp-body { 
          font-family: 'Inter', sans-serif; 
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          box-sizing: border-box;
          background: #0b1629;
          position: relative;
          overflow: hidden;
        }

        /* Container form: Responsif untuk HP & Desktop */
        .lp-container {
          width: 100%;
          max-width: 440px; /* Ukuran ideal untuk desktop (tidak terlalu kecil/lebar) */
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* orb glow */
        .lp-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
        }

        /* logo image styling */
        .lp-logo-img {
          display: block;
          width: 240px; /* Diperbesar agar teks di dalam logo lebih terbaca */
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin-bottom: 24px;
          box-shadow: 0 8px 32px rgba(37,99,235,.25);
          transition: transform .3s;
        }
        .lp-logo-img:hover { transform: translateY(-4px); }

        /* card style */
        .lp-card { 
          position: relative; 
          overflow: hidden;
          width: 100%;
          background: #fff;
          border-radius: 24px;
          padding: 32px 28px 28px;
          box-shadow: 0 24px 64px rgba(10,20,50,.45), 0 0 0 1px rgba(255,255,255,.07);
          box-sizing: border-box;
        }
        .lp-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, #2563eb, #6366f1, #2563eb);
        }

        /* help box */
        .lp-help {
          display: flex; align-items: flex-start; gap: 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px;
          transition: background .2s, border-color .2s;
        }
        .lp-help:hover { background: #eff6ff; border-color: #bfdbfe; }

        /* ping animation */
        .lp-ping-ring {
          position: absolute; inset: 0; border-radius: 50%;
          background: #4ade80; opacity: .5;
          animation: lp-ping 1.5s ease-out infinite;
        }
        @keyframes lp-ping {
          0%   { transform: scale(1); opacity: .5; }
          70%  { transform: scale(2.2); opacity: 0; }
          100% { opacity: 0; }
        }
      `}</style>

      <main className="lp-body">
        {/* ── BACKGROUND ORBS ── */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="lp-orb" style={{ width: 380, height: 380, background: '#2563eb', opacity: .22, top: -120, left: -120 }} />
          <div className="lp-orb" style={{ width: 340, height: 340, background: '#4f46e5', opacity: .20, top: '40%', right: -120 }} />
          <div className="lp-orb" style={{ width: 300, height: 300, background: '#0ea5e9', opacity: .14, bottom: -100, left: '40%' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(11,22,41,.92) 0%, rgba(15,30,65,.85) 50%, rgba(11,22,41,.92) 100%)' }} />
        </div>

        {/* ── CONTENT ── */}
        <div className="lp-container">

          {/* LOGO */}
          <img src="/logo.jpg" alt="Logo Koperasi" className="lp-logo-img" />

          {/* CARD */}
          <div className="lp-card">
            {/* Heading */}
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-.02em', margin: '0 0 6px 0' }}>
                Selamat Datang 👋
              </h2>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.55, margin: 0 }}>
                Masuk menggunakan NIK dan kata sandi Anda untuk mengakses sistem koperasi.
              </p>
            </div>

            <LoginForm />

            {/* HELP */}
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
              <div className="lp-help">
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>💡</span>
                <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6, fontWeight: 500, margin: 0 }}>
                  Lupa password atau tidak bisa login? Silakan hubungi{' '}
                  <strong style={{ color: '#1d4ed8' }}>Pengurus Koperasi</strong> atau{' '}
                  <strong style={{ color: '#1d4ed8' }}>Super Admin</strong> untuk bantuan.
                </p>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: 'rgba(147,197,253,.6)', fontWeight: 500, margin: 0 }}>
              © {new Date().getFullYear()} Koperasi Jasa Karyawan PT Elsewedy Electric Indonesia
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10 }}>
              <div style={{ position: 'relative', width: 8, height: 8 }}>
                <div className="lp-ping-ring" />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', position: 'relative', zIndex: 1 }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(147,197,253,.4)' }}>
                System PWA v1.0 · Secured
              </span>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
