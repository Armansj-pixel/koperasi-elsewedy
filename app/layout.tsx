import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Koperasi Karyawan Elsewedy",
  description: "PWA Koperasi PT Elsewedy Electric Indonesia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
