import React from "react";
import { requireRole } from "@/lib/auth/session";
import { getJurnalUmum, getNeracaSaldo } from "@/lib/akuntansi/actions";
import Link from "next/link";

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  .kop-shell { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
  .kop-header { background: linear-gradient(150deg, #1e293b 0%, #0f172a 40%, #020617 100%); padding: 30px 20px 100px; position: relative; overflow: hidden; }
  .kop-orb { position: absolute; border-radius: 50%; pointer-events: none; }
  .kop-btn-nav { display: inline-flex; align-items: center; gap: 6px; background: rgba(255, 255, 255, 0.1); color: #fff; padding: 8px 14px; border-radius: 20px; text-decoration: none; font-size: 13px; font-weight: 600; backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.2); transition: all 0.2s; }
  .kop-btn-nav:hover { background: rgba(255, 255, 255, 0.2); }
  .kop-content-wrapper { padding: 0 16px 40px; margin-top: -70px; position: relative; z-index: 20; }
  .kop-card { background: #fff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.03); overflow: hidden; margin-bottom: 24px; }
  
  .kop-jurnal-row { border-bottom: 1px solid #f1f5f9; padding: 20px; }
  .kop-jurnal-row:last-child { border-bottom: none; }
  .kop-jurnal-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
  .kop-jurnal-line { display: grid; grid-template-columns: 1fr 120px 120px; gap: 16px; padding: 6px 0; font-size: 13px; font-weight: 600; }
  .kop-table { width: 100%; border-collapse: collapse; }
  .kop-table th { background: #f8fafc; padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
  .kop-table td { padding: 14px 16px; font-size: 13px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #f1f5f9; }
  
  @media (min-width: 768px) { .kop-header { padding: 40px 32px 100px; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; } .kop-content-wrapper { padding: 0 32px 40px; margin-top: -70px; } }
`;

function formatRupiah(n: number) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

export default async function AkuntansiPage() {
  await requireRole(["SUPERADMIN", "BENDAHARA", "KETUA", "SEKRETARIS"]);

  const [{ data: jurnal }, { data: neraca }] = await Promise.all([
    getJurnalUmum(50), // Tarik 50 transaksi terbaru
    getNeracaSaldo()
  ]);

  return (
    <main className="kop-shell bg-slate-100 min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div className="w-full max-w-5xl mx-auto bg-slate-100 min-h-screen relative sm:shadow-xl sm:border-x sm:border-slate-200">
        <header className="kop-header">
          <div className="kop-orb" style={{ width: 300, height: 300, top: -100, right: -100, background: 'radial-gradient(circle, rgba(255,255,255,.05) 0%, transparent 70%)' }} />
          
          <div style={{ position: "relative", zIndex: 10 }}>
            <Link href="/dashboard" className="kop-btn-nav" style={{ marginBottom: "20px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Kembali ke Dashboard
            </Link>
            <h1 style={{ color: "#fff", margin: 0, fontSize: "28px", fontWeight: "900", letterSpacing: "-.02em" }}>
              Laporan Akuntansi
            </h1>
            <p style={{ color: "#94a3b8", margin: "4px 0 0 0", fontSize: "14px", fontWeight: "500" }}>
              Jurnal Umum & Neraca Saldo (Trial Balance) Koperasi Elsewedy.
            </p>
          </div>
        </header>

        <div className="kop-content-wrapper">
          
          {/* SECTION 1: NERACA SALDO */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ background: "#cbd5e1", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#0f172a" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            </div>
            <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Neraca Saldo (Trial Balance)</h2>
          </div>

          <div className="kop-card" style={{ overflowX: "auto" }}>
            <table className="kop-table">
              <thead>
                <tr>
                  <th>Kode Akun</th>
                  <th>Nama Akun</th>
                  <th style={{ textAlign: "right" }}>Total Debit</th>
                  <th style={{ textAlign: "right" }}>Total Kredit</th>
                  <th style={{ textAlign: "right", color: "#0f766e" }}>Saldo Akhir</th>
                </tr>
              </thead>
              <tbody>
                {neraca.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>Belum ada data pembukuan.</td></tr>
                ) : (
                  neraca.map(n => (
                    <tr key={n.id}>
                      <td style={{ color: "#3b82f6" }}>{n.kode_akun}</td>
                      <td>{n.nama_akun}</td>
                      <td style={{ textAlign: "right", color: "#64748b" }}>{formatRupiah(n.total_debit)}</td>
                      <td style={{ textAlign: "right", color: "#64748b" }}>{formatRupiah(n.total_kredit)}</td>
                      <td style={{ textAlign: "right", fontWeight: "800", color: n.saldo_akhir < 0 ? "#e11d48" : "#0f766e" }}>
                        {n.saldo_normal === 'DEBIT' ? '(D) ' : '(K) '}
                        {formatRupiah(Math.abs(n.saldo_akhir))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* SECTION 2: JURNAL UMUM */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", marginTop: "40px" }}>
            <div style={{ background: "#cbd5e1", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#0f172a" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Jurnal Umum (Riwayat Transaksi)</h2>
          </div>

          <div className="kop-card">
            {jurnal.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#64748b", fontWeight: 600 }}>Belum ada jurnal transaksi.</div>
            ) : (
              jurnal.map(j => (
                <div key={j.id} className="kop-jurnal-row">
                  <div className="kop-jurnal-header">
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 800, color: "#3b82f6", letterSpacing: ".05em" }}>{j.nomor_bukti}</div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>{j.keterangan}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>{new Date(j.tanggal_transaksi).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      <div style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginTop: "4px", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", display: "inline-block" }}>{j.jenis_sumber}</div>
                    </div>
                  </div>

                  <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "16px", marginTop: "12px", border: "1px solid #f1f5f9" }}>
                    <div className="kop-jurnal-line" style={{ color: "#94a3b8", fontSize: "11px", textTransform: "uppercase", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px", marginBottom: "8px" }}>
                      <div>Nama Akun</div>
                      <div style={{ textAlign: "right" }}>Debit</div>
                      <div style={{ textAlign: "right" }}>Kredit</div>
                    </div>
                    
                    {j.jurnal_rincian?.map((r: any) => {
                      const isDebit = Number(r.debit) > 0;
                      return (
                        <div key={r.id} className="kop-jurnal-line" style={{ color: "#334155" }}>
                          <div style={{ paddingLeft: isDebit ? "0" : "20px" }}>
                            <span style={{ color: "#94a3b8", marginRight: "6px" }}>{r.akun_perkiraan.kode_akun}</span>
                            {r.akun_perkiraan.nama_akun}
                          </div>
                          <div style={{ textAlign: "right", color: isDebit ? "#0f172a" : "#cbd5e1" }}>
                            {isDebit ? formatRupiah(r.debit) : '-'}
                          </div>
                          <div style={{ textAlign: "right", color: !isDebit ? "#0f172a" : "#cbd5e1" }}>
                            {!isDebit ? formatRupiah(r.kredit) : '-'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
