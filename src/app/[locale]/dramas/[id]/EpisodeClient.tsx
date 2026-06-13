"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Play, Clock } from "lucide-react";

export default function EpisodeClient({ drama }: { drama: any }) {
  const locale = useLocale();
  const isZh = locale === "zh" || locale === "zht" || locale === "yue";
  const isTh = locale === "th";

  const [selectedEpId, setSelectedEpId] = useState(drama.episodes[0]?.id || "");
  const [currentSection, setCurrentSection] = useState(0);

  const selectedEp = drama.episodes.find((ep: any) => ep.id === selectedEpId);
  const epUrls: string[] = (selectedEp?.videoUrl || "").split("\n").filter(Boolean);
  const currentUrl = epUrls[currentSection] || "";

  const title = locale === "th" && drama.titleTh ? drama.titleTh
    : isZh && drama.titleZh ? drama.titleZh : drama.title;

  const langLabel: Record<string, string> = { zh: "中字", en: "英字", th: "泰字", ko: "韓字", ja: "日字" };
  const langColor: Record<string, string> = { zh: "bg-red-50 text-red-600", en: "bg-blue-50 text-blue-600", th: "bg-green-50 text-green-600", ko: "bg-violet-50 text-violet-600", ja: "bg-pink-50 text-pink-600" };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <Link href={`/${locale}/dramas`} className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors mb-6">
        <ArrowLeft size={16} /> {isTh ? "กลับ" : isZh ? "返回剧集" : "Back to Dramas"}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video player */}
        <div className="lg:col-span-2">
          {/* Section tabs */}
          {epUrls.length > 1 && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {epUrls.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSection(i)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    i === currentSection ? "bg-accent text-white" : "bg-white border border-border text-text-secondary hover:border-accent"
                  }`}
                >
                  {isTh ? `ส่วน ${i+1}` : isZh ? `第${i+1}部分` : `Part ${i+1}`}
                </button>
              ))}
            </div>
          )}

          {currentUrl ? (
            <div className="bg-black rounded-2xl overflow-hidden aspect-video">
              {currentUrl.includes("youtube.com") || currentUrl.includes("youtu.be") ? (
                <iframe
                  src={currentUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title="Player"
                />
              ) : (
                <video src={currentUrl} controls className="w-full h-full" playsInline>
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          ) : (
            <div className="bg-background rounded-2xl aspect-video flex items-center justify-center border">
              <div className="text-center text-text-muted">
                <Play size={48} className="mx-auto mb-2 opacity-50" />
                <p>{isTh ? "เลือกตอนเพื่อเริ่มดู" : isZh ? "选择一集开始观看" : "Select an episode to watch"}</p>
              </div>
            </div>
          )}

          <h1 className="text-2xl font-extrabold text-text-primary mt-4 mb-1">{title}</h1>
          {selectedEp && (
            <div className="flex items-center gap-3 flex-wrap mb-2">
              {selectedEp.duration && (
                <span className="flex items-center gap-1 text-xs text-text-muted">
                  <Clock size={12} /> {selectedEp.duration}
                </span>
              )}
              {(() => {
                const langs = (selectedEp.language || "").split(",").filter(Boolean);
                return langs.length > 0 ? (
                  <div className="flex gap-1">
                    {langs.map((l: string) => (
                      <span key={l} className={`text-[10px] px-1.5 py-0.5 rounded ${langColor[l] || "bg-gray-100 text-gray-600"}`}>{langLabel[l] || l}</span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">生肉</span>
                );
              })()}
            </div>
          )}
          <p className="text-sm text-text-muted">
            {locale === "th" && drama.descriptionTh ? drama.descriptionTh
              : isZh && drama.descriptionZh ? drama.descriptionZh : drama.description}
          </p>
        </div>

        {/* Episode list sidebar */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-bold text-text-primary mb-3">
            {isTh ? "รายชื่อตอน" : isZh ? "剧集列表" : "Episodes"} ({drama.episodes.length})
          </h2>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {drama.episodes.map((ep: any) => {
              const epTitle = locale === "th" && ep.titleTh ? ep.titleTh
                : isZh && ep.titleZh ? ep.titleZh : ep.title;
              const isActive = ep.id === selectedEpId;
              const epLangs = (ep.language || "").split(",").filter(Boolean);
              return (
                <button
                  key={ep.id}
                  onClick={() => { setSelectedEpId(ep.id); setCurrentSection(0); }}
                  className={`w-full text-left p-3 rounded-xl border transition-colors flex items-start gap-3 ${
                    isActive ? "bg-accent/10 border-accent" : "bg-white border-border hover:border-primary-light"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? "bg-accent text-white" : "bg-background text-text-muted"
                  }`}>
                    <Play size={14} fill={isActive ? "currentColor" : "none"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-text-primary truncate">{epTitle}</div>
                    <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                      {ep.duration && <span className="flex items-center gap-1"><Clock size={10} /> {ep.duration}</span>}
                      {epLangs.map((l: string) => (
                        <span key={l} className={`text-[10px] px-1 py-0 rounded ${langColor[l] || ""}`}>{langLabel[l] || l}</span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
