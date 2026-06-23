import React from "react";
import { requireRole } from "@/lib/auth/session";
import { getChartOfAccounts } from "@/lib/akuntansi/actions";
import Link from "next/link";
import KasForm from "./KasForm";

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  .kop-shell { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
  .kop-header { background: linear-gradient(150deg, #0f766e 0%, #0d9488 40%, #14b8a6 75%, #2dd4bf 100%); padding: 30px 20px 100px; position: relative; overflow: hidden; }
  .kop-orb { position: absolute; border-radius: 50%; pointer-events: none; }
  .kop-btn-nav { display: inline-flex; align-items: center; gap: 6px; background: rgba(255, 255, 255, 0.2); color: #fff; padding: 8px 14px; border-radius: 20px; text-decoration: none; font-size: 13px; font-weight: 600; backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.3); transition: transform 0.2s, background 0.2s; }
  .kop-btn-nav:hover { background: rgba(255, 255, 255, 0.3); }
  .kop-content-wrapper { padding: 0 16px 40px; margin-top: -70px; position: relative; z-index: 20; }
  @media (min-width: 768px) { .kop-header { padding: 40px 32px 100px; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; } .kop-content-wrapper { padding: 0 32px 40px; margin-top: -70px; } }
`;

export default async function KasPengeluaranPage() {
  await requireRole(["SUPERADMIN", "BENDAHARA"]);

  const { data: coaList } = await getChartOfAccounts();
  
  // Pisahkan akun biaya dan pendapatan
  const expenseAccounts = coaList.filter(a => a.kode_akun.startsWith("5"));
  const revenueAccounts = coaList.filter(a => a.kode_akun.startsWith("4"));

  return (
    <main className="kop-shell bg-slate-100 min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div className="w-full max-w-5xl mx-auto bg-slate-100 min-h-screen relative sm:shadow-xl sm:border-x sm:border-slate-200">
        <header className="kop-header">
          <div className="kop-orb" style={{ width: 280, height: 280, top: -100, right: -100, background: 'radial-gradient(circle, rgba(255,255,255,.15) 0%, transparent 70%)' }} />
          <div className="kop-orb" style={{ width: 200, height: 200, bottom: -40, left: -40, background: 'radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 70%)' }} />
          
          <div style={{ position: "relative", zIndex: 10, maxWidth: "800px", margin: "0 auto" }}>
            <Link href="/dashboard" className="kop-btn-nav" style={{ marginBottom: "20px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Kembali ke Dashboard
            </Link>
            <h1 style={{ color: "#fff", margin: 0, fontSize: "28px", fontWeight: "900", letterSpacing: "-.02em" }}>
              Kas, Pemasukan & Pengeluaran
            </h1>
            <p style={{ color: "rgba(255,255,255,0.9)", margin: "4px 0 0 0", fontSize: "14px", fontWeight: "500" }}>
              Kelola pencatatan biaya, pemasukan lainnya, dan uang laci koperasi.
            </p>
          </div>
        </header>

        <div className="kop-content-wrapper">
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <KasForm expenseAccounts={expenseAccounts} revenueAccounts={revenueAccounts} />
          </div>
        </div>
      </div>
    </main>
  );
}
