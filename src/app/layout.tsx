import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Improve font loading performance
});

export const metadata: Metadata = {
  title: {
    default: "Hakukone - Tekoälypohjainen työnhakukone",
    template: "%s | Hakukone",
  },
  description:
    "Luo ammattimaisia ansioluetteloita ja työhakemuksia tekoälyn avulla. AI-powered job application engine.",
  keywords: [
    "resume builder",
    "CV",
    "cover letter",
    "job application",
    "AI",
    "ansioluettelo",
  ],
  authors: [{ name: "matiasdni" }],
  creator: "Hakukone",
  openGraph: {
    type: "website",
    locale: "fi_FI",
    alternateLocale: "en_US",
    siteName: "Hakukone",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e293b", // slate-800
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fi" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <div className="flex min-h-screen bg-slate-100">
          <Sidebar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
