import { requireAuth } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "./ChangePasswordForm";

// ── CSS STYLES ──
const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }

  .kop-auth-bg {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 20px;
    background: linear-gradient(150deg, #0a1e4a 0%, #0f2d6b 40%, #1a4db3 75%, #2563eb 100%);
    position: relative;
    overflow: hidden;
  }

  .kop-orb { position: absolute; border-radius: 50%; pointer-events: none; }

  .kop-auth-wrapper {
    width: 100%;
    max-width: 460px;
    position: relative;
    z-index: 10;
  }

  .kop-glass-panel {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: 20px 24px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    color: #fff;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  }

  .kop-auth-card {
    background: #fff;
    border-radius: 24px;
    padding: 36px 32px;
    box-shadow: 0 24px 48px rgba(10, 30, 74, 0.25);
  }

  @media (max-width: 480px) {
    .kop-auth-card { padding: 32px 24px; }
    .kop-glass-panel { padding: 16px 20px; flex-direction: column; text-align: center; }
  }
`;

export default async function ChangePasswordPage() {
  const user = await requireAuth();

  // Kalau sudah ganti password, redirect ke dashboard
  if (!user.mustChangePassword) {
    redirect("/dashboard");
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <main className="kop-auth-bg">
        {/* Dekorasi Background */}
        <div className="kop-orb" style={{ width: 400, height: 400, top: -150, left: -100, background: 'radial-gradient(circle, rgba(255,255,255,.08) 0%, transparent 70%)' }} />
        <div className="kop-orb" style={{ width: 500, height: 500, bottom: -200, right: -150, background: 'radial-gradient(circle, rgba(96,165,250,.15) 0%, transparent 70%)' }} />

        <div className="kop-auth-wrapper">
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', 
              width: '72px', height: '72px', borderRadius: '24px', 
              background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)', 
              border: '1.5px solid rgba(255, 255, 255, 0.3)', marginBottom: '20px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#fff', margin: '0 0 8px 0', letterSpacing: '-.02em' }}>
              Keamanan Akun
            </h1>
            <p style={{ fontSize: '15px', color: '#bfdbfe', margin: 0, fontWeight: '500' }}>
              Wajib mengganti password default Anda.
            </p>
          </div>

          {/* Welcome Card (Glassmorphism) */}
          <div className="kop-glass-panel">
            <div style={{ 
              flexShrink: 0, width: '48px', height: '48px',
              background: 'linear-gradient(135deg, #34d399, #10b981)', 
              borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M8 11l3 3 5-5"/>
              </svg>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', fontWeight: '800', fontSize: '16px', letterSpacing: '-.01em' }}>
                Halo, {user.nama}! 👋
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.5', fontWeight: '500' }}>
                Ini adalah login pertama Anda. Silakan amankan akun Anda dengan membuat kata sandi baru.
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div className="kop-auth-card">
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-.01em' }}>
              Buat Password Baru
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 24px 0', lineHeight: '1.5', fontWeight: '500' }}>
              Password akan digunakan untuk masuk ke sistem Koperasi Elsewedy.
            </p>

            {/* Form Input Di Sini */}
            <ChangePasswordForm />

            {/* Tips Section */}
            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '16px', padding: '16px' }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#b45309', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  Aturan Kata Sandi:
                </p>
                <ul style={{ margin: 0, paddingLeft: '22px', fontSize: '12px', color: '#92400e', lineHeight: '1.7', fontWeight: '600', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>Minimal <strong style={{ color: '#b45309' }}>8 karakter</strong></li>
                  <li>Kombinasi huruf besar (A-Z) dan angka (0-9)</li>
                  <li>Hindari menggunakan tanggal lahir atau NIK</li>
                </ul>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </>
  );
}
