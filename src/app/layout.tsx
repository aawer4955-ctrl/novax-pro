import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";

export const metadata: Metadata = {
  title: "NovaX Pro | Digital Asset Platform Demo",
  description: "Commercial-grade digital asset trading platform demo built with Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#050814] text-white">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
