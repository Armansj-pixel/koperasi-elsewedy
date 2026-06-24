import type { Metadata, Viewport } from "next"; // <-- Tambahkan Viewport
import { Inter } from "next/font/google";
import "./globals.css"; // <-- Ini wajib ada dan path-nya harus benar
import PwaRegistration from "@/components/PwaRegistration"; // <-- IMPORT KOMPONEN PWA

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Koperasi Elsewedy",
  description: "PWA Koperasi Jasa Karyawan",
  manifest: "/manifest.json", // <-- TAMBAHKAN MANIFEST
};

// <-- TAMBAHKAN VIEWPORT UNTUK TEMA WARNA & SKALA LAYAR TAB/HP
export const viewport: Viewport = {
  themeColor: "#1e3a8a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        {/* <-- TAMBAHKAN META TAG INI AGAR IPAD / IOS MENGENALI PWA */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.className}>
        <PwaRegistration /> {/* <-- JALANKAN REGISTRASI SERVICE WORKER DI SINI */}
        {children}
      </body>
    </html>
  );
}
