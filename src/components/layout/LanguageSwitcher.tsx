"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const languageNames: Record<string, string> = {
  en: "English",
  zh: "简体中文",
  zht: "繁體中文",
  yue: "粵語",
  th: "ไทย",
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function switchLanguage(nextLocale: string) {
    router.replace(pathname, { locale: nextLocale });
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-light/50 hover:bg-primary-light text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
      >
        <Globe size={16} />
        <span>{languageNames[locale]}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-border p-1.5 min-w-[120px] z-50">
          {Object.entries(languageNames).map(([code, name]) => (
            <button
              key={code}
              onClick={() => switchLanguage(code)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                code === locale
                  ? "bg-primary-light text-primary-dark font-semibold"
                  : "text-text-secondary hover:bg-background hover:text-text-primary"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
