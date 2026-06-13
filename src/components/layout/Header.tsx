"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, Sparkles, User, Shield, LogOut, Search } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationBell from "../features/NotificationBell";
import ThemeToggle from "../features/ThemeToggle";
import { countryFlag } from "@/lib/utils";

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin" || (session?.user as any)?.role === "superadmin";
  const isSuperAdmin = (session?.user as any)?.role === "superadmin";
  const [siteLogo, setSiteLogo] = useState("");

  useEffect(() => {
    fetch("/api/settings?key=site_logo")
      .then(r => r.json())
      .then(d => { if (d?.value) setSiteLogo(d.value); })
      .catch(() => {});
  }, []);

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/forum", label: t("forum") },
    { href: "/creations", label: t("creations") },
    { href: "/gallery", label: t("gallery") },
    { href: "/calendar", label: t("events") },
    { href: "/dramas", label: t("dramas") },
    { href: "/timeline", label: t("timeline") },
    { href: "/stickers", label: t("stickers") },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border">
      {/* Pride Month stripe — remove after June */}
      <div className="pride-stripe" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 shrink-0 group"
        >
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow flex items-center justify-center bg-[#FDFBF7]">
            <img src={siteLogo || "/kimbap/Normal.png"} alt="Logo" className="w-full h-full object-contain p-0.5" width={36} height={36} style={siteLogo ? { maxWidth: 36, maxHeight: 36 } : { imageRendering: "pixelated", maxWidth: 36, maxHeight: 36 }} />
          </div>
          <span className="font-extrabold text-lg text-text-primary hidden sm:block">
            ORMFOLK <span className="text-accent">Hub</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={`/${locale}${link.href === "/" ? "" : link.href}`}
              className="px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-primary-light/50 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          {/* Action icons */}
          <div className="hidden sm:flex items-center gap-1">
            <ThemeToggle />
            <NotificationBell />
            <Link href={`/${locale}/search`} className="p-2 rounded-lg hover:bg-primary-light/50 text-text-muted" title={locale==="zh"?"搜索":"Search"}>
              <Search size={16} />
            </Link>
          </div>

          {/* Desktop: logged in */}
          {session ? (
            <div className="hidden lg:flex items-center gap-2">
              {isAdmin && (
                <Link
                  href={`/${locale}/admin`}
                  className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-xl transition-colors ${isSuperAdmin ? "text-purple-600 hover:bg-purple-50" : "text-accent hover:bg-primary-light/50"}`}
                >
                  <Shield size={15} />
                  {t("admin")}{isSuperAdmin ? " 👑" : ""}
                </Link>
              )}
              <Link
                href={`/${locale}/user/${(session.user as any).id}`}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-primary-light/50 rounded-xl transition-colors"
              >
                {session.user?.image ? (
                  <img src={session.user.image} className="w-5 h-5 rounded-full object-cover" alt="" width={20} height={20} style={{ maxWidth: 20, maxHeight: 20 }} />
                ) : (
                  <User size={15} />
                )}
                {countryFlag((session.user as any)?.country)} {session.user?.name || t("profile")}
              </Link>
              <button
                onClick={() => signOut()}
                className="px-3 py-2 text-sm font-medium text-text-muted hover:text-error transition-colors"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href={`/${locale}/login`}
                className="px-4 py-2 text-sm font-semibold text-accent hover:bg-primary-light/50 rounded-xl transition-colors"
              >
                {t("login")}
              </Link>
              <Link
                href={`/${locale}/login?mode=signup`}
                className="px-4 py-2 text-sm font-semibold text-white bg-accent hover:bg-primary-dark rounded-xl transition-colors shadow-sm flex items-center gap-1"
              >
                <Sparkles size={14} />
                {t("signup")}
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-primary-light/50 text-text-secondary"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="lg:hidden border-t border-border bg-white">
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={`/${locale}${link.href === "/" ? "" : link.href}`}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-primary-light/50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-border pt-2 mt-1">
              {session ? (
                <div className="flex flex-col gap-1">
                  {isAdmin && (
                    <Link
                      href={`/${locale}/admin`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-accent hover:bg-primary-light/50"
                    >
                      <Shield size={16} /> {t("admin")}
                    </Link>
                  )}
                  <div className="px-4 py-2.5 text-sm text-text-muted">
                    <User size={16} className="inline mr-2" />
                    {session.user?.name || "User"}
                  </div>
                  <button
                    onClick={() => { signOut(); setMenuOpen(false); }}
                    className="px-4 py-2.5 text-sm font-medium text-text-muted hover:text-error text-left"
                  >
                    <LogOut size={16} className="inline mr-2" />
                    {t("logout")}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href={`/${locale}/login`}
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-accent bg-primary-light/30 rounded-xl"
                  >
                    {t("login")}
                  </Link>
                  <Link
                    href={`/${locale}/login?mode=signup`}
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-white bg-accent rounded-xl"
                  >
                    {t("signup")}
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
