"use client";

import { useTranslations, useLocale } from "next-intl";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, MapPin, Heart } from "lucide-react";
import { countryName } from "@/lib/utils";

const FanMapClient = dynamic(() => import("./FanMapClient"), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-primary-light/30 rounded-2xl animate-pulse flex items-center justify-center">
      <span className="text-text-muted">Loading map...</span>
    </div>
  ),
});

export default function MapClient({ locations, totalFans, countriesCount }: { locations: any[]; totalFans: number; countriesCount: number }) {
  const t = useTranslations("map");
  const tc = useTranslations("common");
  const locale = useLocale();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <Link href={`/${locale}`} className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors mb-4">
        <ArrowLeft size={16} /> {tc("back")}
      </Link>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-3">{t("title")}</h1>
      <p className="text-text-secondary text-lg mb-8">{t("desc")}</p>

      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-2 px-5 py-3 bg-white rounded-2xl border border-border shadow-sm">
          <Heart size={20} className="text-secondary-dark" fill="#F5C518" />
          <div><div className="text-2xl font-extrabold text-text-primary">{totalFans}</div><div className="text-xs text-text-muted">{t("total_fans")}</div></div>
        </div>
        <div className="flex items-center gap-2 px-5 py-3 bg-white rounded-2xl border border-border shadow-sm">
          <MapPin size={20} className="text-accent" />
          <div><div className="text-2xl font-extrabold text-text-primary">{countriesCount}</div><div className="text-xs text-text-muted">{locale === "zh" || locale === "zht" || locale === "yue" ? "国家/地区" : "Countries"}</div></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden h-[500px]">
        <FanMapClient locations={locations} />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-extrabold text-text-primary mb-4 flex items-center gap-2">
          <MapPin size={18} className="text-accent" />
          {locale === "zh" || locale === "zht" || locale === "yue" ? "粉丝所在城市" : locale === "th" ? "เมืองที่มีแฟนๆ อยู่" : "Cities with Fans"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {locations.map((loc: any) => (
            <div key={loc.id} className="p-3 bg-white rounded-xl border border-border hover:border-primary-light text-center card-hover">
              <div className="text-sm font-semibold text-text-primary">
                {[loc.city, countryName(loc.country, locale)].filter(Boolean).join(", ") || countryName(loc.country, locale)}
              </div>
              <div className="text-xs text-text-muted">{loc.count} {loc.count > 1 ? (locale === "zh" || locale === "zht" || locale === "yue" ? "位粉丝" : "fans") : (locale === "zh" || locale === "zht" || locale === "yue" ? "位粉丝" : "fan")}</div>
            </div>
          ))}
          {locations.length === 0 && (
            <div className="col-span-full text-center text-text-muted py-8">
              {locale === "zh" || locale === "zht" || locale === "yue" ? "还没有粉丝标记位置，去注册并选择国家吧！" : locale === "th" ? "ยังไม่มีแฟนๆ บนแผนที่" : "No fans on the map yet!"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
