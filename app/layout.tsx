import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "À deux — Un espace à deux pour partager vos souvenirs",
  description: "À deux est un espace privé et moderne permettant à deux personnes de construire ensemble un journal de leurs souvenirs. Petits mots, photos, vidéos, humeurs et bien plus encore.",
  keywords: "couple, souvenirs, journal, privé, moments",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-slate-950 text-slate-950 dark:text-slate-50 transition-colors">
        {children}
      </body>
    </html>
  );
}
