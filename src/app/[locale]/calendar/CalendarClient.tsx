"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Calendar as CalendarIcon, ArrowLeft, MapPin, Video, Users, Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { addOrEditEvent, deleteEvent, translateText } from "@/lib/actions";

export default function CalendarClient({ events: initialEvents }: { events: any[] }) {
  const t = useTranslations("calendar");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  function getLocalized(obj: any, field: string): string {
    const langSuffix = locale === "en" ? "En" : (locale === "zh" || locale === "zht" || locale === "yue") ? "Zh" : "Th";
    const key = `${field}${langSuffix}`;
    return obj[key] || obj[`${field}En`] || "";
  }

  const grouped = initialEvents.reduce((acc: Record<string, any[]>, event) => {
    const m = new Date(event.date).toLocaleString(locale === "th" ? "th" : locale === "zh" || locale === "zht" || locale === "yue" ? "zh-CN" : "en", { year: "numeric", month: "long" });
    if (!acc[m]) acc[m] = [];
    acc[m].push(event);
    return acc;
  }, {});

  async function handleTranslate(sourceText: string, fromLang: string, targetFields: { lang: string; elementId: string }[]) {
    if (!sourceText.trim()) return;
    for (const { lang, elementId } of targetFields) {
      const el = document.getElementById(elementId) as HTMLInputElement | HTMLTextAreaElement;
      if (!el) continue;
      el.placeholder = "Translating...";
      const result = await translateText(sourceText, fromLang, lang);
      if (result && result !== sourceText) el.value = result;
      el.placeholder = "";
    }
  }

  function EventForm({ event, onDone }: { event?: any; onDone: () => void }) {
    const isEdit = !!event;
    return (
      <form action={async (fd: FormData) => { if (isEdit) fd.append("id", event.id); await addOrEditEvent(fd); onDone(); }}
        className="bg-background p-4 rounded-xl space-y-3 mb-4">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs text-text-muted font-medium">Titles</span>
            <button type="button" onClick={() => {
              const en = (document.getElementById('cal-titleEn') as HTMLInputElement)?.value;
              const zh = (document.getElementById('cal-titleZh') as HTMLInputElement)?.value;
              const th = (document.getElementById('cal-titleTh') as HTMLInputElement)?.value;
              if (en) handleTranslate(en, 'en', [{lang:'zh',elementId:'cal-titleZh'},{lang:'th',elementId:'cal-titleTh'}]);
              else if (zh) handleTranslate(zh, 'zh', [{lang:'en',elementId:'cal-titleEn'},{lang:'th',elementId:'cal-titleTh'}]);
              else if (th) handleTranslate(th, 'th', [{lang:'en',elementId:'cal-titleEn'},{lang:'zh',elementId:'cal-titleZh'}]);
            }} className="text-[11px] px-2 py-1 bg-accent text-white rounded-lg hover:bg-accent/80 font-medium">🔄 Auto Translate</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input id="cal-titleEn" name="titleEn" defaultValue={event?.titleEn} placeholder="Title EN" className="px-3 py-2 rounded-lg border text-sm" required />
            <input id="cal-titleZh" name="titleZh" defaultValue={event?.titleZh} placeholder="Title 中文" className="px-3 py-2 rounded-lg border text-sm" />
            <input id="cal-titleTh" name="titleTh" defaultValue={event?.titleTh} placeholder="Title ไทย" className="px-3 py-2 rounded-lg border text-sm" />
            <input name="date" type="date" defaultValue={event?.date} className="px-3 py-2 rounded-lg border text-sm" required />
            <input name="location" defaultValue={event?.location} placeholder="Location" className="px-3 py-2 rounded-lg border text-sm" />
            <select name="type" defaultValue={event?.type || "online"} className="px-3 py-2 rounded-lg border text-sm"><option value="online">Online</option><option value="offline">Offline</option></select>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs text-text-muted font-medium">Descriptions</span>
            <button type="button" onClick={() => {
              const en = (document.getElementById('cal-descEn') as HTMLTextAreaElement)?.value;
              const zh = (document.getElementById('cal-descZh') as HTMLTextAreaElement)?.value;
              const th = (document.getElementById('cal-descTh') as HTMLTextAreaElement)?.value;
              if (en) handleTranslate(en, 'en', [{lang:'zh',elementId:'cal-descZh'},{lang:'th',elementId:'cal-descTh'}]);
              else if (zh) handleTranslate(zh, 'zh', [{lang:'en',elementId:'cal-descEn'},{lang:'th',elementId:'cal-descTh'}]);
              else if (th) handleTranslate(th, 'th', [{lang:'en',elementId:'cal-descEn'},{lang:'zh',elementId:'cal-descZh'}]);
            }} className="text-[11px] px-2 py-1 bg-accent text-white rounded-lg hover:bg-accent/80 font-medium">🔄 Auto Translate</button>
          </div>
          <textarea id="cal-descEn" name="descriptionEn" defaultValue={event?.descriptionEn} placeholder="Description EN" className="w-full px-3 py-2 rounded-lg border text-sm" rows={2} />
          <textarea id="cal-descZh" name="descriptionZh" defaultValue={event?.descriptionZh} placeholder="Description 中文" className="w-full px-3 py-2 rounded-lg border text-sm mt-2" rows={2} />
          <textarea id="cal-descTh" name="descriptionTh" defaultValue={event?.descriptionTh} placeholder="Description ไทย" className="w-full px-3 py-2 rounded-lg border text-sm mt-2" rows={2} />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="flex items-center gap-1 px-4 py-2 bg-accent text-white text-sm rounded-lg"><Save size={14} />{isEdit ? "Update" : "Add"}</button>
          <button type="button" onClick={onDone} className="flex items-center gap-1 px-4 py-2 bg-white border text-sm rounded-lg"><X size={14} />Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <Link href={`/${locale}`} className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors mb-4"><ArrowLeft size={16} /> {tc("back")}</Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-3">{t("title")}</h1>
            <p className="text-text-secondary text-lg">{t("desc")}</p>
          </div>
          {isAdmin && (
            <button onClick={() => { setShowAdd(!showAdd); setEditingId(null); }}
              className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-xl flex items-center gap-2"><Plus size={16} /> {t("add_event")}</button>
          )}
        </div>
      </div>

      {showAdd && !editingId && <EventForm onDone={() => setShowAdd(false)} />}

      <div className="space-y-10">
        {Object.entries(grouped).map(([month, monthEvents]) => (
          <div key={month}>
            <h2 className="text-xl font-extrabold text-text-primary mb-4 flex items-center gap-2"><CalendarIcon size={20} className="text-accent" />{month}</h2>
            <div className="space-y-4">
              {monthEvents.map((event: any) => (
                <div key={event.id} className="p-5 bg-white rounded-2xl border border-border hover:border-primary-light shadow-sm card-hover">
                  {editingId === event.id ? (
                    <EventForm event={event} onDone={() => setEditingId(null)} />
                  ) : (
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-light to-secondary-light flex flex-col items-center justify-center shrink-0 shadow-sm">
                        <span className="text-lg font-extrabold text-accent">{new Date(event.date).getDate()}</span>
                        <span className="text-xs font-semibold text-text-muted">{new Date(event.date).toLocaleString(locale === "th" ? "th" : locale === "zh" || locale === "zht" || locale === "yue" ? "zh-CN" : "en", { month: "short" })}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-lg text-text-primary">{getLocalized(event, "title")}</h3>
                          {event.type === "online" ? <span className="flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full"><Video size={12} />{t("online")}</span>
                            : <span className="flex items-center gap-1 px-2 py-0.5 bg-secondary-light text-secondary-dark text-xs rounded-full"><Users size={12} />{t("offline")}</span>}
                        </div>
                        <p className="text-sm text-text-secondary mb-2">{getLocalized(event, "description")}</p>
                        <div className="flex items-center gap-1 text-xs text-text-muted"><MapPin size={12} />{event.location}</div>
                        {isAdmin && (
                          <div className="flex gap-1 mt-2">
                            <button onClick={() => { setEditingId(event.id); setEditForm(event); setShowAdd(false); }}
                              className="flex items-center gap-1 px-2 py-1 text-xs text-accent hover:bg-accent/10 rounded"><Pencil size={12} />Edit</button>
                            <form onSubmit={async (e) => { e.preventDefault(); if (!confirm(locale === "zh" || locale === "zht" || locale === "yue" ? "确认删除此活动？" : "Delete this event?")) return; const fd = new FormData(e.currentTarget); fd.append("id", event.id); await deleteEvent(fd); }}>
                              <button className="flex items-center gap-1 px-2 py-1 text-xs text-error hover:bg-error/10 rounded"><Trash2 size={12} />Del</button>
                            </form>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
