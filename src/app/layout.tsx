import type { Metadata } from "next";
import { Nunito, Noto_Sans_SC, Noto_Sans_Thai } from "next/font/google";
import ThemeInit from "@/components/layout/ThemeInit";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-zh",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-th",
  subsets: ["thai"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: { default: "ORMFOLK Hub", template: "%s | ORMFOLK Hub" },
  description: "A global fan community for OrmFolk — Ormsin Supitcha × Folk Sutima. Connect, create, and celebrate together. #AppleMyLove #CrushTheSeries",
  keywords: ["ORMFOLK", "Ormsin", "Folk", "Supitcha Limsommut", "Sutima Kokiatwanit", "Apple My Love", "Crush The Series", "Thai GL", "fan community", "forum"],
  authors: [{ name: "ORMFOLK Hub", url: "https://ormfolk-hub.vercel.app" }],
  creator: "ORMFOLK Hub",
  metadataBase: new URL("https://ormfolk-hub.vercel.app"),
  openGraph: {
    type: "website",
    siteName: "ORMFOLK Hub",
    title: "ORMFOLK Hub — Fan Community",
    description: "A global fan community for Ormsin & Folk. Photos, forums, timeline, events, and more.",
    locale: "en_US",
    alternateLocale: ["zh_CN", "th_TH"],
  },
  twitter: {
    card: "summary_large_image",
    title: "ORMFOLK Hub",
    description: "A global fan community for Ormsin & Folk.",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.png" },
  alternates: {
    languages: {
      "en": "/en",
      "zh": "/zh",
      "th": "/th",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${nunito.variable} ${notoSansSC.variable} ${notoSansThai.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full bg-background text-text-primary font-sans antialiased" suppressHydrationWarning>
        <ThemeInit />
        {children}
      </body>
    </html>
  );
}
