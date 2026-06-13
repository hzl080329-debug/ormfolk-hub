import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import SessionProvider from "@/components/auth/SessionProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MusicPlayer from "@/components/features/MusicPlayer";
import AnnouncementPopup from "@/components/features/AnnouncementPopup";
import KimbapMascot from "@/components/features/KimbapMascot";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "zh" | "zht" | "yue" | "th")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <SessionProvider>
        <div className="min-h-dvh flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <MusicPlayer />
          <AnnouncementPopup />
          <KimbapMascot />
        </div>
      </SessionProvider>
    </NextIntlClientProvider>
  );
}
