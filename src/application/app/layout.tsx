import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Radar 112 | Centro de operações",
  description: "Acompanhamento em direto de ocorrências da Proteção Civil.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-PT">
      <body>{children}</body>
    </html>
  );
}
