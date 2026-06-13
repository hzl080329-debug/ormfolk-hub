"use client";

import { useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Play, Clock } from "lucide-react";

export default function DramasClient({ dramas }: { dramas: any[] }) {
  const locale = useLocale();
  const isZh = locale === "zh" || locale === "zht" || locale === "yue";
  const isTh = locale === "th";

  const t = (en: string, zh: string, th: string) => isTh ? th : isZh ? zh : en;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <Link href={`/${locale}`} className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors mb-6">
        <ArrowLeft size={16} /> {isTh ? "กลับ" : isZh ? "返回" : "Back"}
      </Link>

      <h1 className="text-3xl font-extrabold text-text-primary mb-2">
        {t("🎬 Dramas", "🎬 剧集", "🎬 ซีรีส์")}
      </h1>
      <p className="text-text-muted mb-8">
        {t("Watch full episodes", "观看完整剧集", "ดูตอนเต็ม")}
      </p>

      {dramas.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          <p className="text-lg">{t("No dramas yet", "暂无剧集", "ยังไม่มีซีรีส์")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dramas.map((d: any) => {
            const title = locale === "th" && d.titleTh ? d.titleTh
              : isZh && d.titleZh ? d.titleZh : d.title;
            return (
              <Link key={d.id} href={`/${locale}/dramas/${d.id}`}
                className="bg-white rounded-2xl border border-border hover:border-primary-light shadow-sm card-hover overflow-hidden group">
                <div className="h-48 bg-gradient-to-br from-primary-light via-secondary-light to-primary flex items-center justify-center relative">
                  {d.coverImage ? (
                    <img src={d.coverImage} alt={title} className="w-full h-full object-cover" />
                  ) : (
                    <Play size={48} className="text-primary-dark/50 group-hover:scale-110 transition-transform" />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      <Play size={24} className="text-accent ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-text-primary mb-1">{title}</h3>
                  <p className="text-xs text-text-muted line-clamp-2 mb-3">
                    {locale === "th" && d.descriptionTh ? d.descriptionTh
                      : isZh && d.descriptionZh ? d.descriptionZh : d.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1"><Play size={12} /> {d.episodeCount} {t("episodes", "集", "ตอน")}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {t("Updated", "更新于", "อัปเดต")} {new Date(d.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
