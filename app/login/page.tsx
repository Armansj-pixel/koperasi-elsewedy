import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .lp-body { font-family: 'Inter', sans-serif; }

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
          width: 160px; /* Anda bisa menyesuaikan ukuran logo di sini */
          height: auto;
          border-radius: 16px; /* Memberikan sudut membulat pada background putih logo */
          margin-bottom: 20px;
          box-shadow: 0 8px 32px rgba(37,99,235,.25);
          transition: transform .3s;
        }
        .lp-logo-img:hover { transform: translateY(-4px); }

        /* card top stripe */
        .lp-card { position: relative; overflow: hidden; }
        .lp-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #2563eb, #6366f1, #2563eb);
        }

        /* inputs */
        .lp-input {
          width: 100%;
          padding: 12px 14px 12px 40px;
          font-family: 'Inter', sans-serif;
          font-size: 14px; font-weight: 500;
          color: #0f172a;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          outline: none;
          transition: border-color .2s, box-shadow .2s, background .2s;
        }
        .lp-input:focus {
          border-color: #2563eb;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(37,99,235,.12);
        }
        .lp-input::placeholder { color: #cbd5e1; }

        /* submit button */
        .lp-btn {
          width: 100%;
          padding: 13px;
          font-family: 'Inter', sans-serif;
          font-size: 14px; font-weight: 700;
          color: #fff;
          background: linear-gradient(135deg, #1d4ed8, #2563eb);
          border: none; border-radius: 12px;
          cursor: pointer;
          letter-spacing: .02em;
          box-shadow: 0 4px 16px rgba(37,99,235,.35);
          transition: opacity .2s, transform .15s, box-shadow .2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .lp-btn:hover {
          opacity: .92;
          transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(37,99,235,.45);
        }
        .lp-btn:active { transform: translateY(0); }
        .lp-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }

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

      <main
        className="lp-body min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden"
        style={{ background: '#0b1629', fontFamily: "'Inter', sans-serif" }}
      >
        {/* ── BACKGROUND ORBS ── */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="lp-orb" style={{ width: 380, height: 380, background: '#2563eb', opacity: .22, top: -120, left: -120 }} />
          <div className="lp-orb" style={{ width: 340, height: 340, background: '#4f46e5', opacity: .20, top: '40%', right: -120 }} />
          <div className="lp-orb" style={{ width: 300, height: 300, background: '#0ea5e9', opacity: .14, bottom: -100, left: '40%' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(11,22,41,.92) 0%, rgba(15,30,65,.85) 50%, rgba(11,22,41,.92) 100%)' }} />
        </div>

        {/* ── CONTENT ── */}
        <div className="w-full max-w-sm relative z-10 flex flex-col items-center">

          {/* LOGO */}
          <div style={{ textAlign: 'center', marginBottom: 28, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Ganti '/logo.jpg' dengan path yang sesuai jika Anda menggunakan folder assets */}
            <img src="/logo.jpg" alt="Logo Koperasi" className="lp-logo-img" />
            
            {/* Jika Anda merasa teks di dalam logo sudah cukup jelas, Anda bisa menghapus elemen <h1> dan <p> di bawah ini */}
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-.03em', marginBottom: 6 }}>
              Koperasi Karyawan
            </h1>
            <p style={{ fontSize: 12, fontWeight: 500, color: 'rgba(147,197,253,.75)', letterSpacing: '.04em' }}>
              PT Elsewedy Electric Indonesia
            </p>
          </div>

          {/* CARD */}
          <div
            className="lp-card"
            style={{
              width: '100%',
              background: '#fff',
              borderRadius: 28,
              padding: '32px 28px 28px',
              boxShadow: '0 24px 64px rgba(10,20,50,.45), 0 0 0 1px rgba(255,255,255,.07)',
            }}
          >
            {/* Heading */}
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: '-.02em', marginBottom: 6 }}>
                Selamat Datang 👋
              </h2>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.55 }}>
                Masuk menggunakan NIK dan kata sandi Anda untuk mengakses sistem koperasi.
              </p>
            </div>

            <LoginForm />

            {/* HELP */}
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
              <div className="lp-help">
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>💡</span>
                <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6, fontWeight: 500 }}>
                  Lupa password atau tidak bisa login? Silakan hubungi{' '}
                  <strong style={{ color: '#1d4ed8' }}>Pengurus Koperasi</strong> atau{' '}
                  <strong style={{ color: '#1d4ed8' }}>Super Admin</strong> untuk bantuan.
                </p>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <p style={{ fontSize: 10, color: 'rgba(147,197,253,.45)', fontWeight: 500 }}>
              © {new Date().getFullYear()} Koperasi Jasa Karyawan PT Elsewedy Electric Indonesia
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 }}>
              <div style={{ position: 'relative', width: 8, height: 8 }}>
                <div className="lp-ping-ring" />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', position: 'relative', zIndex: 1 }} />
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(147,197,253,.35)' }}>
                System PWA v1.0 · Secured
              </span>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
