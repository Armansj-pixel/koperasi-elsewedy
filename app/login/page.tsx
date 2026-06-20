import { LoginForm } from "./LoginForm";

export default function LoginPage() {
return (
<>
<style>{`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

*, *::before, *::after { box-sizing: border-box; }  

    html, body {  
      margin: 0; padding: 0;  
      width: 100%; height: 100%;  
      background-color: #060d1a;  
    }  

    .lp-body {  
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;  
      min-height: 100vh;  
      width: 100vw;  
      display: flex;  
      align-items: center;  
      justify-content: center;  
      padding: 24px 16px;  
      background: #060d1a;  
      position: relative;  
      overflow: hidden;  
    }  

    /* Subtle dot-grid background */  
    .lp-grid {  
      position: absolute;  
      inset: 0;  
      background-image:  
        radial-gradient(rgba(37,99,235,.15) 1px, transparent 1px);  
      background-size: 28px 28px;  
      z-index: 0;  
      mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);  
    }  

    /* Ambient orb glows */  
    .lp-orb {  
      position: absolute;  
      border-radius: 50%;  
      filter: blur(110px);  
      pointer-events: none;  
      z-index: 0;  
    }  

    /* Main layout container */  
    .lp-container {  
      width: 100%;  
      max-width: 460px;  
      position: relative;  
      z-index: 10;  
      display: flex;  
      flex-direction: column;  
      align-items: center;  
    }  

    /* ── Logo Section ── */  
    .lp-logo-wrapper {  
      display: flex;  
      flex-direction: column;  
      align-items: center;  
      gap: 12px;  
      margin-bottom: 28px;  
    }  

    .lp-logo-img {  
      display: block;  
      width: 200px;  
      max-width: 100%;  
      height: auto;  
      border-radius: 16px;  
      box-shadow:  
        0 0 0 1px rgba(255,255,255,.08),  
        0 12px 40px rgba(37,99,235,.35),  
        0 0 80px rgba(37,99,235,.15);  
      transition: transform .35s ease, box-shadow .35s ease;  
    }  
    .lp-logo-img:hover {  
      transform: translateY(-5px) scale(1.02);  
      box-shadow:  
        0 0 0 1px rgba(255,255,255,.14),  
        0 20px 56px rgba(37,99,235,.45),  
        0 0 100px rgba(37,99,235,.22);  
    }  

    .lp-logo-badge {  
      display: inline-flex;  
      align-items: center;  
      gap: 5px;  
      padding: 4px 12px;  
      background: rgba(37,99,235,.12);  
      border: 1px solid rgba(37,99,235,.3);  
      border-radius: 100px;  
      font-size: 10px;  
      font-weight: 700;  
      letter-spacing: .1em;  
      text-transform: uppercase;  
      color: rgba(147,197,253,.85);  
    }  

    /* ── Card ── */  
    .lp-card {  
      width: 100%;  
      background: rgba(255,255,255,.98);  
      border-radius: 24px;  
      overflow: hidden;  
      box-shadow:  
        0 0 0 1px rgba(255,255,255,.06),  
        0 40px 100px rgba(0,0,0,.55),  
        0 8px 24px rgba(0,0,0,.25);  
    }  

    .lp-card-accent {  
      height: 3px;  
      background: linear-gradient(90deg, #1d4ed8 0%, #6366f1 50%, #0ea5e9 100%);  
    }  

    .lp-card-body {  
      padding: 32px 32px 28px;  
    }  

    /* ── Heading ── */  
    .lp-heading { margin-bottom: 26px; }  

    .lp-heading-tag {  
      display: inline-flex;  
      align-items: center;  
      gap: 5px;  
      padding: 3px 10px;  
      background: #eff6ff;  
      border: 1px solid #bfdbfe;  
      border-radius: 100px;  
      font-size: 10px;  
      font-weight: 700;  
      letter-spacing: .08em;  
      text-transform: uppercase;  
      color: #2563eb;  
      margin-bottom: 14px;  
    }  

    .lp-heading h2 {  
      font-size: 24px;  
      font-weight: 800;  
      color: #0f172a;  
      letter-spacing: -.03em;  
      line-height: 1.25;  
      margin: 0 0 8px;  
    }  

    .lp-heading p {  
      font-size: 13px;  
      color: #64748b;  
      line-height: 1.65;  
      margin: 0;  
    }  

    /* ── Divider ── */  
    .lp-divider {  
      height: 1px;  
      background: linear-gradient(90deg, transparent, #e2e8f0, transparent);  
      margin: 24px 0;  
    }  

    /* ── Help Box ── */  
    .lp-help {  
      display: flex;  
      align-items: flex-start;  
      gap: 10px;  
      background: #f8fafc;  
      border: 1px solid #e2e8f0;  
      border-radius: 12px;  
      padding: 12px 14px;  
      transition: background .2s, border-color .2s;  
    }  
    .lp-help:hover { background: #eff6ff; border-color: #bfdbfe; }  
    .lp-help p {  
      font-size: 11.5px;  
      color: #64748b;  
      line-height: 1.65;  
      font-weight: 500;  
      margin: 0;  
    }  
    .lp-help strong { color: #2563eb; }  

    /* ── Footer ── */  
    .lp-footer {  
      margin-top: 28px;  
      display: flex;  
      flex-direction: column;  
      align-items: center;  
      gap: 10px;  
    }  

    .lp-footer-copy {  
      font-size: 10.5px;  
      color: rgba(147,197,253,.5);  
      font-weight: 500;  
      margin: 0;  
      text-align: center;  
      line-height: 1.6;  
    }  

    .lp-footer-status {  
      display: inline-flex;  
      align-items: center;  
      gap: 7px;  
      padding: 4px 12px;  
      background: rgba(255,255,255,.04);  
      border: 1px solid rgba(255,255,255,.07);  
      border-radius: 100px;  
    }  

    .lp-status-dot { position: relative; width: 8px; height: 8px; flex-shrink: 0; }  
    .lp-ping-ring {  
      position: absolute; inset: 0; border-radius: 50%;  
      background: #4ade80; opacity: .5;  
      animation: lp-ping 2s ease-out infinite;  
    }  
    .lp-status-core {  
      width: 8px; height: 8px; border-radius: 50%;  
      background: #22c55e;  
      position: relative; z-index: 1;  
    }  
    @keyframes lp-ping {  
      0%   { transform: scale(1); opacity: .5; }  
      70%  { transform: scale(2.4); opacity: 0; }  
      100% { opacity: 0; }  
    }  

    .lp-footer-label {  
      font-size: 9.5px;  
      font-weight: 700;  
      letter-spacing: .12em;  
      text-transform: uppercase;  
      color: rgba(147,197,253,.4);  
    }  

    /* ── Responsive ── */  
    @media (max-width: 480px) {  
      .lp-body { padding: 16px 12px; }  
      .lp-card-body { padding: 24px 20px 20px; }  
      .lp-logo-img { width: 160px; }  
      .lp-logo-wrapper { margin-bottom: 20px; }  
      .lp-heading h2 { font-size: 20px; }  
    }  
    @media (min-width: 768px) {  
      .lp-container { max-width: 460px; }  
    }  
    @media (min-width: 1280px) {  
      .lp-logo-img { width: 220px; }  
      .lp-heading h2 { font-size: 26px; }  
    }  
  `}</style>  

  <main className="lp-body">  

    {/* ── Background Layer ── */}  
    <div className="lp-grid" aria-hidden="true" />  
    <div aria-hidden="true">  
      <div className="lp-orb" style={{ width: 520, height: 520, background: 'radial-gradient(circle, #1d4ed8, transparent)', opacity: .18, top: -240, left: -220 }} />  
      <div className="lp-orb" style={{ width: 420, height: 420, background: 'radial-gradient(circle, #4f46e5, transparent)', opacity: .15, top: '30%', right: -180 }} />  
      <div className="lp-orb" style={{ width: 360, height: 360, background: 'radial-gradient(circle, #0ea5e9, transparent)', opacity: .12, bottom: -130, left: '30%' }} />  
    </div>  

    {/* ── Main Content ── */}  
    <div className="lp-container">  

      {/* Logo */}  
      <div className="lp-logo-wrapper">  
        <img src="/logo.jpg" alt="Logo Koperasi Jasa Karyawan PT Elsewedy" className="lp-logo-img" />  
        <span className="lp-logo-badge">🏦 Portal Anggota Koperasi</span>  
      </div>  

      {/* Card */}  
      <div className="lp-card">  
        <div className="lp-card-accent" />  
        <div className="lp-card-body">  

          {/* Heading */}  
          <div className="lp-heading">  
            <div className="lp-heading-tag">🔐 Sistem Informasi Koperasi</div>  
            <h2>Selamat Datang 👋</h2>  
            <p>Masuk menggunakan <strong style={{ color: '#0f172a' }}>NIK</strong> dan <strong style={{ color: '#0f172a' }}>kata sandi</strong> Anda untuk mengakses sistem koperasi.</p>  
          </div>

{/* Form Component */}
<LoginForm />

{/* Help Section */}  
          <div className="lp-divider" />  
          <div className="lp-help">  
            <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>  
            <p>  
              Lupa password atau tidak bisa login? Silakan hubungi{' '}  
              <strong>Pengurus Koperasi</strong> atau{' '}  
              <strong>Super Admin</strong> untuk mendapatkan bantuan.  
            </p>  
          </div>  

        </div>  
      </div>  

      {/* Footer */}  
      <div className="lp-footer">  
        <p className="lp-footer-copy">  
          © {new Date().getFullYear()} Koperasi Jasa Karyawan<br />  
          PT Elsewedy Electric Indonesia  
        </p>  
        <div className="lp-footer-status">  
          <div className="lp-status-dot">  
            <div className="lp-ping-ring" />  
            <div className="lp-status-core" />  
          </div>  
          <span className="lp-footer-label">System Online · PWA v1.0 · Secured</span>  
        </div>  
      </div>  

    </div>  
  </main>  
</>

);
}
