import React from "react";
import { requireRole } from "@/lib/auth/session";
import { getAnggotaById } from "@/lib/anggota/actions";
import { EditAnggotaForm } from "./EditAnggotaForm";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function EditAnggotaPage({
  params,
}: {
  params: { id: string };
}) {
  await requireRole(["SUPERADMIN", "SEKRETARIS"]);

  const { data: anggota, error } = await getAnggotaById(params.id);

  if (error || !anggota) {
    redirect("/dashboard/anggota");
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      {/* Global fonts & box-sizing */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Header */}
      <header className="relative bg-gradient-to-r from-blue-900 via-blue-700 to-blue-600 overflow-hidden px-5 sm:px-8 py-8 md:py-12 rounded-b-3xl shadow-lg">
        {/* Ambient circles */}
        <div aria-hidden="true" className="pointer-events-none absolute rounded-full bg-white/10 w-[150px] h-[150px] top-[-40px] left-[-40px]" />
        <div aria-hidden="true" className="pointer-events-none absolute rounded-full bg-white/5 w-[200px] h-[200px] bottom-[-20px] right-[-60px]" />

        <div className="max-w-4xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Back button */}
          <Link
            href={`/dashboard/anggota/${params.id}`}
            className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-shadow shadow-sm focus:outline-none focus:ring-2 focus:ring-white"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Detail Anggota
          </Link>

          {/* Page title */}
          <h1 className="text-white font-extrabold text-xl sm:text-2xl flex items-center gap-3">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Anggota - {anggota.nama}
          </h1>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto mt-[-50px] px-5 sm:px-8 relative z-20">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 md:p-10">
          {/* Warning alert */}
          <div className="flex items-start gap-4 mb-8 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-yellow-800">
            <svg
              className="flex-shrink-0 w-5 h-5 mt-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p className="text-sm leading-relaxed">
              <strong className="font-semibold">Perhatian:</strong> NIK tidak dapat diubah setelah didaftarkan. Hubungi Super Admin jika NIK perlu diperbaiki.
            </p>
          </div>

          {/* EditAnggotaForm */}
          <EditAnggotaForm anggota={anggota} />
        </div>
      </main>
    </div>
  );
}
