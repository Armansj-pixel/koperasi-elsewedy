import { requireAuth } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "./ChangePasswordForm";

export default async function ChangePasswordPage() {
  const user = await requireAuth();

  // Kalau sudah ganti password, redirect ke dashboard
  if (!user.mustChangePassword) {
    redirect("/dashboard");
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
        }

        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: linear-gradient(135deg, #0f2d6b 0%, #1e40af 100%);
          position: relative;
          overflow: hidden;
        }

        /* Elemen dekoratif background */
        .auth-container::before,
        .auth-container::after {
          content: '';
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .auth-container::before {
          top: -100px;
          left: -100px;
          width: 400px;
          height: 400px;
          background: rgba(255, 255, 255, 0.05);
        }

        .auth-container::after {
          bottom: -150px;
          right: -100px;
          width: 500px;
          height: 500px;
          background: rgba(255, 255, 255, 0.03);
        }

        .auth-wrapper {
          width: 100%;
          max-width: 480px;
          position: relative;
          z-index: 10;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 16px 20px;
          margin-bottom: 24px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          color: #fff;
        }

        .form-card {
          background: #fff;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 480px) {
          .form-card {
            padding: 24px;
          }
        }
      `}} />

      <main className="auth-container">
        <div className="auth-wrapper">
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: 'rgba(255, 255, 255, 0.15)', 
              backdropFilter: 'blur(10px)', 
              border: '1px solid rgba(255, 255, 255, 0.3)',
              marginBottom: '16px' 
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', margin: '0 0 8px 0' }}>
              Ganti Password
            </h1>
            <p style={{ fontSize: '14px', color: '#bfdbfe', margin: 0, fontWeight: '500' }}>
              Login pertama - wajib ganti password default
            </p>
          </div>

          {/* Welcome Card */}
          <div className="glass-card">
            <div style={{ 
              flexShrink: 0, 
              padding: '10px', 
              background: 'rgba(255,255,255,0.2)', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M8 11l3 3 5-5"/>
              </svg>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', fontWeight: '600', fontSize: '16px' }}>
                Halo, {user.nama}!
              </p>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.9, lineHeight: '1.5' }}>
                Demi keamanan akun Anda, silakan ganti password default ke
                password yang lebih kuat.
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div className="form-card">
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f2d6b', margin: '0 0 6px 0' }}>
              Buat Password Baru
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 24px 0', lineHeight: '1.5' }}>
              Password harus minimal 8 karakter, mengandung huruf besar dan angka
            </p>

            {/* Pastikan file ChangePasswordForm.tsx juga diubah tailwind-nya jika diperlukan */}
            <ChangePasswordForm />

            {/* Tips Section */}
            <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ 
                background: '#fffbeb', 
                border: '1px solid #fde68a', 
                borderRadius: '12px', 
                padding: '16px' 
              }}>
                <p style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '13px', 
                  color: '#92400e', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  fontWeight: '700' 
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/>
                    <path d="M9 18h6"/>
                    <path d="M10 22h4"/>
                  </svg>
                  Tips Password Aman:
                </p>
                <ul style={{ 
                  margin: 0, 
                  paddingLeft: '20px', 
                  fontSize: '12px', 
                  color: '#b45309', 
                  lineHeight: '1.7',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <li>Minimal 8 karakter</li>
                  <li>Kombinasi huruf besar (A-Z) & angka (0-9)</li>
                  <li>Hindari tanggal lahir atau NIK</li>
                  <li>Jangan beritahu password Anda ke siapapun</li>
                </ul>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </>
  );
}
