"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Clock, Film, Award, CalendarDays, Video, Users, MapPin, ArrowLeft, Pencil, Trash2, Save, X, Languages } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { addOrEditTimeline, deleteTimeline, translateText } from "@/lib/actions";
import { toTraditional } from "@/lib/s2t";

const typeIcons: Record<string, React.ElementType> = {
  drama: Film,
  event: CalendarDays,
  award: Award,
  social: Video,
};

export default function TimelineClient({ items }: { items: any[] }) {
  const t = useTranslations("timeline");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { data: session } = useSession();
  const isAdmin = ["admin", "superadmin", "founder", "moderator"].includes((session?.user as any)?.role);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  function getLocalized(obj: any, field: string): string {
    // Try exact locale match first, then fall back to closest language
    const langSuffix = locale === "en" ? "En" : (locale === "zh" || locale === "zht" || locale === "yue") ? "Zh" : "Th";
    const key = `${field}${langSuffix}`;
    if (obj[key]) return obj[key];
    // Fallback: try English, then raw field
    return obj[`${field}En`] || obj[field]?.en || "";
  }

  // Group by year
  const grouped = items.reduce((acc: Record<string, any[]>, item) => {
    const year = item.year.toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(item);
    return acc;
  }, {});

  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

  // Convert Chinese text to Traditional for zht/yue
  const [displayItems, setDisplayItems] = useState(items);
  useEffect(() => {
    if (locale === "zht" || locale === "yue") {
      Promise.all(items.map(async (item: any) => ({
        ...item,
        titleZh: item.titleZh ? await toTraditional(item.titleZh) : item.titleZh,
        descriptionZh: item.descriptionZh ? await toTraditional(item.descriptionZh) : item.descriptionZh,
      }))).then(setDisplayItems);
    } else {
      setDisplayItems(items);
    }
  }, [locale, items]);

  const displayGrouped = displayItems.reduce((acc: Record<string, any[]>, item) => {
    const year = item.year.toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(item);
    return acc;
  }, {});
  const displayYears = Object.keys(displayGrouped).sort((a, b) => Number(b) - Number(a));

  async function handleTranslate(sourceText: string, fromLang: string, targetFields: { lang: string; elementId: string }[]) {
    if (!sourceText.trim()) return;
    for (const { lang, elementId } of targetFields) {
      const el = document.getElementById(elementId) as HTMLInputElement | HTMLTextAreaElement;
      if (!el) continue;
      el.placeholder = "Translating...";
      const result = await translateText(sourceText, fromLang, lang);
      if (result && result !== sourceText) {
        el.value = result;
        // Also update editForm state so React doesn't overwrite
        const fieldName = el.name;
        if (fieldName) setEditForm((prev: any) => ({ ...prev, [fieldName]: result }));
      }
      el.placeholder = "";
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          {tc("back")}
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-3">
          {t("title")}
        </h1>
        <p className="text-text-secondary text-lg">{t("desc")}</p>
      </div>

      {isAdmin && (
        <div className="mb-6">
          {!showAddForm ? (
            <button onClick={() => setShowAddForm(true)} className="flex items-center gap-1 px-4 py-2 bg-accent text-white text-sm rounded-xl font-medium">
              <Pencil size={14} /> {locale === "zh" || locale === "zht" || locale === "yue" ? "新增条目" : locale === "th" ? "เพิ่มรายการ" : "Add Entry"}
            </button>
          ) : (
            <div className="bg-white rounded-2xl border p-5">
              <h3 className="font-bold text-lg mb-3">{locale === "zh" || locale === "zht" || locale === "yue" ? "新增时间线条目" : locale === "th" ? "เพิ่มรายการไทม์ไลน์" : "Add Timeline Entry"}</h3>
              <form action={async (fd: FormData) => { await addOrEditTimeline(fd); setShowAddForm(false); }} className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <input name="year" type="number" placeholder="Year" className="px-3 py-2 rounded-lg border text-sm" required />
                  <input name="month" type="number" placeholder="Month" className="px-3 py-2 rounded-lg border text-sm" />
                  <input name="day" type="number" placeholder="Day" className="px-3 py-2 rounded-lg border text-sm" />
                </div>
                <input name="titleEn" placeholder="Title EN" className="w-full px-3 py-2 rounded-lg border text-sm" required />
                <input name="titleZh" placeholder="Title 中文" className="w-full px-3 py-2 rounded-lg border text-sm" />
                <input name="titleTh" placeholder="Title ไทย" className="w-full px-3 py-2 rounded-lg border text-sm" />
                <textarea name="descriptionEn" placeholder="Description EN" className="w-full px-3 py-2 rounded-lg border text-sm" rows={2} />
                <textarea name="descriptionZh" placeholder="Description 中文" className="w-full px-3 py-2 rounded-lg border text-sm" rows={2} />
                <textarea name="descriptionTh" placeholder="Description ไทย" className="w-full px-3 py-2 rounded-lg border text-sm" rows={2} />
                <div className="flex gap-2">
                  <select name="type" defaultValue="drama" className="px-3 py-2 rounded-lg border text-sm"><option value="drama">Drama</option><option value="event">Event</option><option value="award">Award</option><option value="social">Social</option></select>
                  <select name="actor" defaultValue="both" className="px-3 py-2 rounded-lg border text-sm"><option value="orm">Ormsin</option><option value="folk">Folk</option><option value="both">Both</option></select>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex items-center gap-1 px-4 py-2 bg-accent text-white text-sm rounded-lg"><Save size={14} />{locale === "zh" || locale === "zht" || locale === "yue" ? "添加" : "Add"}</button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-white border text-sm rounded-lg"><X size={14} />{locale === "zh" || locale === "zht" || locale === "yue" ? "取消" : "Cancel"}</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-primary-light hidden sm:block" />

        {displayYears.map((year) => (
          <div key={year} className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative z-10 w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-accent/30 shrink-0">
                {year.slice(-2)}
              </div>
              <h2 className="text-2xl font-extrabold text-text-primary">{year}</h2>
            </div>

            <div className="sm:ml-14 space-y-4">
              {displayGrouped[year]
                .sort((a, b) => (b.month * 100 + b.day) - (a.month * 100 + a.day))
                .map((item) => {
                  const Icon = typeIcons[item.type] || Clock;
                  const hasMonth = item.month > 0;
                  const hasDay = item.day > 0;
                  const typeLabel = t(item.type as any) || (item.type === "event" ? (locale === "zh" || locale === "zht" || locale === "yue" ? "活动" : locale === "th" ? "กิจกรรม" : "Event") : item.type);
                  const isOnlineEvent = item.eventType === "online";
                  const title = getLocalized(item, "title");
                  const description = getLocalized(item, "description");

                  return (
                    <div
                      key={item.id}
                      className="relative p-5 bg-white rounded-2xl border border-border hover:border-primary-light shadow-sm card-hover"
                    >
                      <div className="hidden sm:block absolute -left-[3.25rem] top-6 w-3 h-3 rounded-full bg-primary border-2 border-white" />

                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                          item.type === "drama" ? "from-primary to-primary-dark" :
                          item.type === "event" ? "from-secondary to-accent" :
                          item.type === "award" ? "from-secondary-dark to-accent" :
                          "from-primary-light to-primary"
                        } flex items-center justify-center shrink-0`}>
                          <Icon size={18} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {hasDay ? (
                              <span className="text-xs text-text-muted font-medium">
                                {new Date(item.year, item.month - 1, item.day).toLocaleDateString(
                                  locale === "th" ? "th" : locale === "zh" || locale === "zht" || locale === "yue" ? "zh-CN" : "en",
                                  { month: "short", day: "numeric" },
                                )}
                              </span>
                            ) : hasMonth ? (
                              <span className="text-xs text-text-muted font-medium">
                                {new Date(item.year, item.month - 1, 1).toLocaleDateString(
                                  locale === "th" ? "th" : locale === "zh" || locale === "zht" || locale === "yue" ? "zh-CN" : "en",
                                  { year: "numeric", month: "long" },
                                )}
                              </span>
                            ) : (
                              <span className="text-xs text-text-muted font-medium">{item.year}</span>
                            )}
                            <span className="px-2 py-0.5 bg-primary-light text-primary-dark text-xs rounded-full font-medium">
                              {typeLabel}
                            </span>
                            {item.source === "event" && (
                              <span className="px-2 py-0.5 bg-secondary-light text-secondary-dark text-xs rounded-full font-medium">
                                {isOnlineEvent ? (
                                  <>
                                    <Video size={10} className="inline mr-0.5" />
                                    {locale === "zh" || locale === "zht" || locale === "yue" ? "线上" : locale === "th" ? "ออนไลน์" : "Online"}
                                  </>
                                ) : (
                                  <>
                                    <Users size={10} className="inline mr-0.5" />
                                    {locale === "zh" || locale === "zht" || locale === "yue" ? "线下" : locale === "th" ? "ออฟไลน์" : "Offline"}
                                  </>
                                )}
                              </span>
                            )}
                            {item.actor && (
                              <span className="px-2 py-0.5 bg-secondary-light text-secondary-dark text-xs rounded-full font-medium">
                                {item.actor === "orm" ? "Ormsin" : item.actor === "folk" ? "Folk" : "OrmFolk"}
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-lg text-text-primary mb-1">
                            {title}
                          </h3>
                          <p className="text-sm text-text-secondary leading-relaxed">
                            {description}
                          </p>
                          {item.location && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-text-muted">
                              <MapPin size={12} /> {item.location}
                            </div>
                          )}
                          {isAdmin && (
                            <div className="flex gap-1 mt-2">
                              <button onClick={() => { setEditingId(item.id); setEditForm({...item}); }}
                                className="flex items-center gap-1 px-2 py-1 text-xs text-accent hover:bg-accent/10 rounded"><Pencil size={12} /> Edit</button>
                              <form onSubmit={async (e) => { e.preventDefault(); if (!confirm(locale === "zh" || locale === "zht" || locale === "yue" ? "确认删除此条目？" : "Delete this entry?")) return; const fd = new FormData(e.currentTarget); fd.append("id", item.id); await deleteTimeline(fd); }}>
                                <button className="flex items-center gap-1 px-2 py-1 text-xs text-error hover:bg-error/10 rounded"><Trash2 size={12} /> Del</button>
                              </form>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Admin inline edit modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setEditingId(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-extrabold text-lg mb-4">Edit Timeline</h3>
            <form action={async (fd: FormData) => { fd.append("id", editingId); await addOrEditTimeline(fd); setEditingId(null); }} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <input name="year" type="number" defaultValue={editForm.year} className="px-3 py-2 rounded-lg border text-sm" required />
                <input name="month" type="number" defaultValue={editForm.month || ""} placeholder="Month" className="px-3 py-2 rounded-lg border text-sm" />
                <input name="day" type="number" defaultValue={editForm.day || ""} placeholder="Day" className="px-3 py-2 rounded-lg border text-sm" />
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-xs text-text-muted">Titles</span>
                  <button type="button" onClick={() => {
                    const en = (document.getElementById('tle-titleEn') as HTMLInputElement)?.value;
                    const zh = (document.getElementById('tle-titleZh') as HTMLInputElement)?.value;
                    const th = (document.getElementById('tle-titleTh') as HTMLInputElement)?.value;
                    if (en) handleTranslate(en, 'en', [{lang:'zh',elementId:'tle-titleZh'},{lang:'th',elementId:'tle-titleTh'}]);
                    else if (zh) handleTranslate(zh, 'zh', [{lang:'en',elementId:'tle-titleEn'},{lang:'th',elementId:'tle-titleTh'}]);
                    else if (th) handleTranslate(th, 'th', [{lang:'en',elementId:'tle-titleEn'},{lang:'zh',elementId:'tle-titleZh'}]);
                  }} className="text-[11px] px-2 py-1 bg-accent text-white rounded-lg hover:bg-accent/80 font-medium">🔄 Auto Translate</button>
                </div>
                <input id="tle-titleEn" name="titleEn" defaultValue={editForm.titleEn} placeholder="Title EN" className="w-full px-3 py-2 rounded-lg border text-sm" required />
                <input id="tle-titleZh" name="titleZh" defaultValue={editForm.titleZh} placeholder="Title 中文" className="w-full px-3 py-2 rounded-lg border text-sm mt-2" />
                <input id="tle-titleTh" name="titleTh" defaultValue={editForm.titleTh} placeholder="Title ไทย" className="w-full px-3 py-2 rounded-lg border text-sm mt-2" />
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-xs text-text-muted">Descriptions</span>
                  <button type="button" onClick={() => {
                    const en = (document.getElementById('tle-descEn') as HTMLTextAreaElement)?.value;
                    const zh = (document.getElementById('tle-descZh') as HTMLTextAreaElement)?.value;
                    const th = (document.getElementById('tle-descTh') as HTMLTextAreaElement)?.value;
                    if (en) handleTranslate(en, 'en', [{lang:'zh',elementId:'tle-descZh'},{lang:'th',elementId:'tle-descTh'}]);
                    else if (zh) handleTranslate(zh, 'zh', [{lang:'en',elementId:'tle-descEn'},{lang:'th',elementId:'tle-descTh'}]);
                    else if (th) handleTranslate(th, 'th', [{lang:'en',elementId:'tle-descEn'},{lang:'zh',elementId:'tle-descZh'}]);
                  }} className="text-[11px] px-2 py-1 bg-accent text-white rounded-lg hover:bg-accent/80 font-medium">🔄 Auto Translate</button>
                </div>
                <textarea id="tle-descEn" name="descriptionEn" defaultValue={editForm.descriptionEn} placeholder="Description EN" className="w-full px-3 py-2 rounded-lg border text-sm" rows={2} />
                <textarea id="tle-descZh" name="descriptionZh" defaultValue={editForm.descriptionZh} placeholder="Description 中文" className="w-full px-3 py-2 rounded-lg border text-sm mt-2" rows={2} />
                <textarea id="tle-descTh" name="descriptionTh" defaultValue={editForm.descriptionTh} placeholder="Description ไทย" className="w-full px-3 py-2 rounded-lg border text-sm mt-2" rows={2} />
              </div>
              <div className="flex gap-2">
                <select name="type" defaultValue={editForm.type} className="px-3 py-2 rounded-lg border text-sm"><option value="drama">Drama</option><option value="event">Event</option><option value="award">Award</option><option value="social">Social</option></select>
                <select name="actor" defaultValue={editForm.actor} className="px-3 py-2 rounded-lg border text-sm"><option value="orm">Ormsin</option><option value="folk">Folk</option><option value="both">Both</option></select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex items-center gap-1 px-4 py-2 bg-accent text-white text-sm rounded-lg"><Save size={14} />Save</button>
                <button type="button" onClick={() => setEditingId(null)} className="flex items-center gap-1 px-4 py-2 bg-white border text-sm rounded-lg"><X size={14} />Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
