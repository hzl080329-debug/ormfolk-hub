"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ArrowLeft, Users, FileText, Inbox, Shield, Trash2, Check, X, Plus, Save, Calendar, Clock, Image, Upload, Loader2, Megaphone, Pin, Folders, Star, Play, Pencil, ChevronUp, ChevronDown, MessageSquare } from "lucide-react";
import { deletePost, deleteWallMessage, approveSubmission, rejectSubmission, addOrEditEvent, deleteEvent, addOrEditTimeline, deleteTimeline, addGalleryItems, deleteGalleryItem, createAnnouncement, editAnnouncement, deleteAnnouncement, addOrEditCategory, deleteCategory, translateText, setUserRole, addBannedWord, removeBannedWord, penalizeUser, reviewPost, updateWelcomeMessage, reviewCopyrightReport, restorePost, updateAnnouncementTranslation, retranslateContent, updatePostTranslation, batchDeleteGalleryItems, batchUpdateGalleryItems, toggleGalleryFeatured, setSiteSetting, getSiteSetting, addDrama, editDrama, deleteDrama, addEpisode, editEpisode, deleteEpisode, reorderEpisode, updateFeedbackStatus } from "@/lib/actions";

export default function AdminClient({ data }: { data: any }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const isZh = locale === "zh" || locale === "zht" || locale === "yue";
  const { users, posts, wallMessages, submissions, events, timelineEntries, galleryItems, announcements, categories, bannedWords, reviewQueue, adminLogs, drafts, copyrightReports, welcomeMsg, deletedPosts, stats, translatableContent, dramas, feedbacks } = data;
  const [tab, setTab] = useState("posts");
  const [editAnnounce, setEditAnnounce] = useState<any>(null);
  const [showCatForm, setShowCatForm] = useState(false);
  const [editCat, setEditCat] = useState<any>(null);
  const { data: session } = useSession();
  const isSuperAdmin = (session?.user as any)?.role === "superadmin";

  // Save scroll position to survive server re-renders
  useEffect(() => {
    const saved = sessionStorage.getItem("adm-scroll");
    if (saved) { requestAnimationFrame(() => { window.scrollTo(0, +saved); sessionStorage.removeItem("adm-scroll"); }); }
    const save = () => sessionStorage.setItem("adm-scroll", String(window.scrollY));
    window.addEventListener("scroll", save, { passive: true });
    return () => window.removeEventListener("scroll", save);
  }, [data]);

  // Batch gallery selection
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchCategory, setBatchCategory] = useState("");
  const [batchTag, setBatchTag] = useState("");
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchMsg, setBatchMsg] = useState("");
  const [adminCatFilter, setAdminCatFilter] = useState("all");
  const dragRef = useRef({ active: false, lastId: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [selectedFileLabel, setSelectedFileLabel] = useState("");
  const [siteLogo, setSiteLogo] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editEvent, setEditEvent] = useState<any>(null);
  const [showTimelineForm, setShowTimelineForm] = useState(false);
  const [editTimeline, setEditTimeline] = useState<any>(null);
  const [showAnnounceForm, setShowAnnounceForm] = useState(false);
  const [showDramaForm, setShowDramaForm] = useState(false);
  const [editingDrama, setEditingDrama] = useState<any>(null);
  const [showEpForm, setShowEpForm] = useState(false);
  const [epDramaId, setEpDramaId] = useState("");
  const [editingEp, setEditingEp] = useState<any>(null);
  const [sectionCount, setSectionCount] = useState(4);

  useEffect(() => {
    getSiteSetting("site_logo").then(v => { if (v) setSiteLogo(v); }).catch(() => {});
  }, []);

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function clearSelection() { setSelected(new Set()); setSelectMode(false); }

  function handleGridMouseDown(e: React.MouseEvent) {
    if (!selectMode) return;
    dragRef.current.active = true;
    dragRef.current.lastId = "";
    const el = (e.target as HTMLElement).closest("[data-gid]") as HTMLElement | null;
    if (el) {
      const id = el.dataset.gid!;
      toggleSelect(id);
      dragRef.current.lastId = id;
    }
  }
  function handleGridMouseMove(e: React.MouseEvent) {
    if (!dragRef.current.active) return;
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-gid]") as HTMLElement | null;
    if (el) {
      const id = el.dataset.gid!;
      if (id !== dragRef.current.lastId) {
        setSelected(prev => { const next = new Set(prev); next.add(id); return next; });
        dragRef.current.lastId = id;
      }
    }
  }
  function handleGridMouseUp() {
    dragRef.current.active = false;
    dragRef.current.lastId = "";
  }

  const tabs = [
    { key: "posts", icon: FileText, label: locale === "zh" || locale === "zht" || locale === "yue" ? "帖子" : "Posts", count: posts.length },
    { key: "photos", icon: Image, label: locale === "zh" || locale === "zht" || locale === "yue" ? "图库" : "Photos", count: galleryItems.length },
    { key: "users", icon: Users, label: locale === "zh" || locale === "zht" || locale === "yue" ? "用户" : "Users", count: users.length },
    { key: "announce", icon: Megaphone, label: locale === "zh" || locale === "zht" || locale === "yue" ? "公告" : "Announce", count: announcements.length },
    { key: "categories", icon: Folders, label: locale === "zh" || locale === "zht" || locale === "yue" ? "分区" : "Cats", count: categories.length },
    { key: "review", icon: Inbox, label: locale === "zh" || locale === "zht" || locale === "yue" ? "审核" : "Review", count: reviewQueue.length },
    { key: "banned", icon: Shield, label: locale === "zh" || locale === "zht" || locale === "yue" ? "屏蔽词" : "Banned", count: bannedWords.length },
    { key: "dramas", icon: Play, label: locale === "zh" || locale === "zht" || locale === "yue" ? "剧集" : "Dramas", count: data.dramas?.length || 0 },
    { key: "feedback", icon: MessageSquare, label: locale === "zh" || locale === "zht" || locale === "yue" ? "反馈" : "Feedback", count: feedbacks?.length || 0 },
    { key: "site", icon: Image, label: locale === "zh" || locale === "zht" || locale === "yue" ? "站点" : "Site" },
  ];

  async function handleDelete(name: string, action: (fd: FormData) => Promise<void>, id: string) {
    if (!confirm(locale === "zh" || locale === "zht" || locale === "yue" ? "确认删除？" : locale === "th" ? "ยืนยันการลบ?" : "Delete?")) return;
    setDeleting(id);
    try { const fd = new FormData(); fd.append("id", id); fd.append("postId", id); fd.append("messageId", id); await action(fd); } catch {}
    setDeleting(null);
  }

  function catLabel(cat: string | undefined) {
    if (!cat) return "";
    const map: Record<string, string> = {
      memory: "📸",
      official: "📷",
      event_photo: "🎉",
      drama_still: "🎬",
      daily: "☀️",
      fanart: "🎨",
      kimbap: "🐱",
    };
    return map[cat] || cat;
  }

  async function handleTranslate(sourceText: string, fromLang: string, targetFields: { lang: string; elementId: string }[]) {
    if (!sourceText.trim()) return;
    for (const { lang, elementId } of targetFields) {
      const el = document.getElementById(elementId) as HTMLInputElement | HTMLTextAreaElement;
      if (!el) continue;
      el.placeholder = locale === "zh" || locale === "zht" || locale === "yue" ? "翻译中..." : locale === "th" ? "กำลังแปล..." : "Translating...";
      const result = await translateText(sourceText, fromLang, lang);
      if (result && result !== sourceText) el.value = result;
      el.placeholder = "";
    }
  }

  function EventForm({ event }: { event?: any }) {
    const isEdit = !!event;
    return (
      <form action={async (fd: FormData) => { if (isEdit) fd.append("id", event.id); await addOrEditEvent(fd); setShowEventForm(false); setEditEvent(null); }}
        className="bg-background p-4 rounded-xl space-y-3 mb-4">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs text-text-muted font-medium">{locale === "zh" || locale === "zht" || locale === "yue" ? "标题" : locale === "th" ? "หัวข้อ" : "Titles"}</span>
            <button type="button" onClick={() => {
              const en = (document.getElementById('ev-titleEn') as HTMLInputElement)?.value;
              const zh = (document.getElementById('ev-titleZh') as HTMLInputElement)?.value;
              const th = (document.getElementById('ev-titleTh') as HTMLInputElement)?.value;
              if (en) handleTranslate(en, 'en', [{lang:'zh',elementId:'ev-titleZh'},{lang:'th',elementId:'ev-titleTh'}]);
              else if (zh) handleTranslate(zh, 'zh', [{lang:'en',elementId:'ev-titleEn'},{lang:'th',elementId:'ev-titleTh'}]);
              else if (th) handleTranslate(th, 'th', [{lang:'en',elementId:'ev-titleEn'},{lang:'zh',elementId:'ev-titleZh'}]);
            }} className="text-[11px] px-2 py-1 bg-accent text-white rounded-lg hover:bg-accent/80 font-medium">🔄 {locale === "zh" || locale === "zht" || locale === "yue" ? "自动翻译" : "Auto Translate"}</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input id="ev-titleEn" name="titleEn" defaultValue={event?.titleEn} placeholder="Title EN" className="px-3 py-2 rounded-lg border text-sm" required />
            <input id="ev-titleZh" name="titleZh" defaultValue={event?.titleZh} placeholder="Title 中文" className="px-3 py-2 rounded-lg border text-sm" />
            <input id="ev-titleTh" name="titleTh" defaultValue={event?.titleTh} placeholder="Title ไทย" className="px-3 py-2 rounded-lg border text-sm" />
            <input name="date" type="date" defaultValue={event?.date} className="px-3 py-2 rounded-lg border text-sm" required />
            <input name="location" defaultValue={event?.location} placeholder={locale === "zh" || locale === "zht" || locale === "yue" ? "地点" : "Location"} className="px-3 py-2 rounded-lg border text-sm" />
            <select name="type" defaultValue={event?.type || "online"} className="px-3 py-2 rounded-lg border text-sm">
              <option value="online">{locale === "zh" || locale === "zht" || locale === "yue" ? "线上" : "Online"}</option><option value="offline">{locale === "zh" || locale === "zht" || locale === "yue" ? "线下" : "Offline"}</option>
            </select>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs text-text-muted font-medium">{locale === "zh" || locale === "zht" || locale === "yue" ? "描述" : locale === "th" ? "คำอธิบาย" : "Descriptions"}</span>
            <button type="button" onClick={() => {
              const en = (document.getElementById('ev-descEn') as HTMLInputElement)?.value;
              const zh = (document.getElementById('ev-descZh') as HTMLInputElement)?.value;
              const th = (document.getElementById('ev-descTh') as HTMLInputElement)?.value;
              if (en) handleTranslate(en, 'en', [{lang:'zh',elementId:'ev-descZh'},{lang:'th',elementId:'ev-descTh'}]);
              else if (zh) handleTranslate(zh, 'zh', [{lang:'en',elementId:'ev-descEn'},{lang:'th',elementId:'ev-descTh'}]);
              else if (th) handleTranslate(th, 'th', [{lang:'en',elementId:'ev-descEn'},{lang:'zh',elementId:'ev-descZh'}]);
            }} className="text-[11px] px-2 py-1 bg-accent text-white rounded-lg hover:bg-accent/80 font-medium">🔄 {locale === "zh" || locale === "zht" || locale === "yue" ? "自动翻译" : "Auto Translate"}</button>
          </div>
          <input id="ev-descEn" name="descriptionEn" defaultValue={event?.descriptionEn} placeholder="Description EN" className="w-full px-3 py-2 rounded-lg border text-sm" />
          <input id="ev-descZh" name="descriptionZh" defaultValue={event?.descriptionZh} placeholder="Description 中文" className="w-full px-3 py-2 rounded-lg border text-sm mt-2" />
          <input id="ev-descTh" name="descriptionTh" defaultValue={event?.descriptionTh} placeholder="Description ไทย" className="w-full px-3 py-2 rounded-lg border text-sm mt-2" />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="flex items-center gap-1 px-4 py-2 bg-accent text-white text-sm rounded-lg"><Save size={14} />{isEdit ? (locale === "zh" || locale === "zht" || locale === "yue" ? "更新" : locale === "th" ? "อัปเดต" : "Update") : (locale === "zh" || locale === "zht" || locale === "yue" ? "添加" : locale === "th" ? "เพิ่ม" : "Add")}</button>
          <button type="button" onClick={() => { setShowEventForm(false); setEditEvent(null); }} className="px-4 py-2 bg-white border text-sm rounded-lg">{locale === "zh" || locale === "zht" || locale === "yue" ? "取消" : locale === "th" ? "ยกเลิก" : "Cancel"}</button>
        </div>
      </form>
    );
  }

  function TimelineForm({ entry }: { entry?: any }) {
    const isEdit = !!entry;
    return (
      <form action={async (fd: FormData) => { if (isEdit) fd.append("id", entry.id); await addOrEditTimeline(fd); setShowTimelineForm(false); setEditTimeline(null); }}
        className="bg-background p-4 rounded-xl space-y-3 mb-4">
        <div className="grid grid-cols-3 gap-3">
          <input name="year" type="number" defaultValue={entry?.year} placeholder={locale === "zh" || locale === "zht" || locale === "yue" ? "年份" : "Year"} className="px-3 py-2 rounded-lg border text-sm" required />
          <input name="month" type="number" defaultValue={entry?.month || ""} placeholder={locale === "zh" || locale === "zht" || locale === "yue" ? "月份" : "Month"} className="px-3 py-2 rounded-lg border text-sm" />
          <input name="day" type="number" defaultValue={entry?.day || ""} placeholder={locale === "zh" || locale === "zht" || locale === "yue" ? "日期" : "Day"} className="px-3 py-2 rounded-lg border text-sm" />
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs text-text-muted font-medium">{locale === "zh" || locale === "zht" || locale === "yue" ? "标题" : locale === "th" ? "หัวข้อ" : "Titles"}</span>
            <button type="button" onClick={() => {
              const en = (document.getElementById('tl-titleEn') as HTMLInputElement)?.value;
              const zh = (document.getElementById('tl-titleZh') as HTMLInputElement)?.value;
              const th = (document.getElementById('tl-titleTh') as HTMLInputElement)?.value;
              if (en) handleTranslate(en, 'en', [{lang:'zh',elementId:'tl-titleZh'},{lang:'th',elementId:'tl-titleTh'}]);
              else if (zh) handleTranslate(zh, 'zh', [{lang:'en',elementId:'tl-titleEn'},{lang:'th',elementId:'tl-titleTh'}]);
              else if (th) handleTranslate(th, 'th', [{lang:'en',elementId:'tl-titleEn'},{lang:'zh',elementId:'tl-titleZh'}]);
            }} className="text-[11px] px-2 py-1 bg-accent text-white rounded-lg hover:bg-accent/80 font-medium">🔄 {locale === "zh" || locale === "zht" || locale === "yue" ? "自动翻译" : "Auto Translate"}</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input id="tl-titleEn" name="titleEn" defaultValue={entry?.titleEn} placeholder="Title EN" className="px-3 py-2 rounded-lg border text-sm" required />
            <input id="tl-titleZh" name="titleZh" defaultValue={entry?.titleZh} placeholder="Title 中文" className="px-3 py-2 rounded-lg border text-sm" />
            <input id="tl-titleTh" name="titleTh" defaultValue={entry?.titleTh} placeholder="Title ไทย" className="px-3 py-2 rounded-lg border text-sm" />
            <select name="type" defaultValue={entry?.type || "drama"} className="px-3 py-2 rounded-lg border text-sm">
              <option value="drama">{locale === "zh" || locale === "zht" || locale === "yue" ? "影视" : "Drama"}</option><option value="event">{locale === "zh" || locale === "zht" || locale === "yue" ? "活动" : "Event"}</option><option value="award">{locale === "zh" || locale === "zht" || locale === "yue" ? "奖项" : "Award"}</option><option value="social">{locale === "zh" || locale === "zht" || locale === "yue" ? "社交" : "Social"}</option>
            </select>
            <select name="actor" defaultValue={entry?.actor || "both"} className="px-3 py-2 rounded-lg border text-sm">
              <option value="orm">Ormsin</option><option value="folk">Folk</option><option value="both">OrmFolk</option>
            </select>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs text-text-muted font-medium">{locale === "zh" || locale === "zht" || locale === "yue" ? "描述" : locale === "th" ? "คำอธิบาย" : "Descriptions"}</span>
            <button type="button" onClick={() => {
              const en = (document.getElementById('tl-descEn') as HTMLInputElement)?.value;
              const zh = (document.getElementById('tl-descZh') as HTMLInputElement)?.value;
              const th = (document.getElementById('tl-descTh') as HTMLInputElement)?.value;
              if (en) handleTranslate(en, 'en', [{lang:'zh',elementId:'tl-descZh'},{lang:'th',elementId:'tl-descTh'}]);
              else if (zh) handleTranslate(zh, 'zh', [{lang:'en',elementId:'tl-descEn'},{lang:'th',elementId:'tl-descTh'}]);
              else if (th) handleTranslate(th, 'th', [{lang:'en',elementId:'tl-descEn'},{lang:'zh',elementId:'tl-descZh'}]);
            }} className="text-[11px] px-2 py-1 bg-accent text-white rounded-lg hover:bg-accent/80 font-medium">🔄 {locale === "zh" || locale === "zht" || locale === "yue" ? "自动翻译" : "Auto Translate"}</button>
          </div>
          <input id="tl-descEn" name="descriptionEn" defaultValue={entry?.descriptionEn} placeholder="Description EN" className="w-full px-3 py-2 rounded-lg border text-sm" />
          <input id="tl-descZh" name="descriptionZh" defaultValue={entry?.descriptionZh} placeholder="Description 中文" className="w-full px-3 py-2 rounded-lg border text-sm mt-2" />
          <input id="tl-descTh" name="descriptionTh" defaultValue={entry?.descriptionTh} placeholder="Description ไทย" className="w-full px-3 py-2 rounded-lg border text-sm mt-2" />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="flex items-center gap-1 px-4 py-2 bg-accent text-white text-sm rounded-lg"><Save size={14} />{isEdit ? (locale === "zh" || locale === "zht" || locale === "yue" ? "更新" : locale === "th" ? "อัปเดต" : "Update") : (locale === "zh" || locale === "zht" || locale === "yue" ? "添加" : locale === "th" ? "เพิ่ม" : "Add")}</button>
          <button type="button" onClick={() => { setShowTimelineForm(false); setEditTimeline(null); }} className="px-4 py-2 bg-white border text-sm rounded-lg">{locale === "zh" || locale === "zht" || locale === "yue" ? "取消" : locale === "th" ? "ยกเลิก" : "Cancel"}</button>
        </div>
      </form>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <Link href={`/${locale}`} className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors mb-4"><ArrowLeft size={16} /> {locale === "zh" || locale === "zht" || locale === "yue" ? "返回" : locale === "th" ? "กลับ" : "Back"}</Link>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-dark to-accent flex items-center justify-center"><Shield size={20} className="text-white" /></div>
        <div className="flex-1"><h1 className="text-3xl font-extrabold text-text-primary">{t("admin")}</h1></div>
        <a href="/api/admin/backup" className="flex items-center gap-1.5 px-4 py-2 bg-background border border-border text-text-secondary text-sm rounded-xl hover:bg-white transition-colors">
          📦 {locale === "zh" || locale === "zht" || locale === "yue" ? "导出数据库" : locale === "th" ? "สำรองข้อมูล" : "Backup Data"}
        </a>
      </div>

      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map(({ key, icon: Icon, label, count }) => (
          <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${tab === key ? "bg-accent text-white shadow-sm" : "bg-white border text-text-secondary"}`}>
            <Icon size={16} /> {label} <span className={`px-1.5 py-0.5 rounded-full text-xs ${tab === key ? "bg-white/20" : "bg-primary-light text-primary-dark"}`}>{count}</span>
          </button>
        ))}
      </div>

      {tab === "posts" && (
        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="p-4 border-b bg-background font-bold">{locale === "zh" || locale === "zht" || locale === "yue" ? "帖子" : "Posts"}</div>
          {posts.map((p: any) => (
            <div key={p.id} className="p-4 flex items-center justify-between hover:bg-background/50 border-b last:border-0">
              <div><Link href={`/${locale}/forum/${p.id}`} className="text-sm font-semibold hover:text-accent">{p.title}</Link><div className="text-xs text-text-muted">{p.author?.username} · {new Date(p.createdAt).toLocaleDateString()}</div></div>
              <button onClick={() => handleDelete("post", deletePost, p.id)} className="p-2 text-text-muted hover:text-error rounded-lg"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}

      {tab === "events" && (
        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="p-4 border-b bg-background flex items-center justify-between">
            <span className="font-bold">{locale === "zh" || locale === "zht" || locale === "yue" ? "活动" : "Events"}</span>
            <button onClick={() => { setEditEvent(null); setShowEventForm(true); }} className="flex items-center gap-1 px-3 py-1.5 bg-accent text-white text-xs rounded-lg"><Plus size={14} /> {locale === "zh" || locale === "zht" || locale === "yue" ? "新增" : "Add"}</button>
          </div>
          {showEventForm && !editEvent && <div className="p-4"><EventForm /></div>}
          {events.map((e: any) => (
            <div key={e.id} className="border-b last:border-0">
              {editEvent?.id === e.id ? (
                <div className="p-4"><EventForm event={e} /></div>
              ) : (
                <div className="p-4 flex items-center justify-between hover:bg-background/50">
                  <div>
                    <div className="text-sm font-semibold">{e.titleEn}</div>
                    <div className="text-xs text-text-muted">{e.date} · {e.location} · {e.type}</div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditEvent(e); setShowEventForm(true); }} className="px-2 py-1 text-xs text-accent hover:bg-accent/10 rounded">{locale === "zh" || locale === "zht" || locale === "yue" ? "编辑" : "Edit"}</button>
                    <button onClick={() => handleDelete("event", deleteEvent, e.id)} className="p-1 text-text-muted hover:text-error"><Trash2 size={14} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "timeline" && (
        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="p-4 border-b bg-background flex items-center justify-between">
            <span className="font-bold">{locale === "zh" || locale === "zht" || locale === "yue" ? "时间线" : "Timeline"}</span>
            <button onClick={() => { setEditTimeline(null); setShowTimelineForm(true); }} className="flex items-center gap-1 px-3 py-1.5 bg-accent text-white text-xs rounded-lg"><Plus size={14} /> {locale === "zh" || locale === "zht" || locale === "yue" ? "新增" : "Add"}</button>
          </div>
          {showTimelineForm && !editTimeline && <div className="p-4"><TimelineForm /></div>}
          {timelineEntries.map((t: any) => (
            <div key={t.id} className="border-b last:border-0">
              {editTimeline?.id === t.id ? (
                <div className="p-4"><TimelineForm entry={t} /></div>
              ) : (
                <div className="p-4 flex items-center justify-between hover:bg-background/50">
                  <div>
                    <div className="text-sm font-semibold">{t.titleEn}</div>
                    <div className="text-xs text-text-muted">{t.year}-{t.month}-{t.day} · {t.type} · {t.actor}</div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditTimeline(t); setShowTimelineForm(true); }} className="px-2 py-1 text-xs text-accent hover:bg-accent/10 rounded">{locale === "zh" || locale === "zht" || locale === "yue" ? "编辑" : "Edit"}</button>
                    <button onClick={() => handleDelete("timeline", deleteTimeline, t.id)} className="p-1 text-text-muted hover:text-error"><Trash2 size={14} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "users" && (
        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="p-4 border-b bg-background font-bold">{locale === "zh" || locale === "zht" || locale === "yue" ? "用户" : "Users"}</div>
          {users.map((u: any) => (
            <div key={u.id} className="p-4 flex items-center justify-between border-b last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">{u.username?.[0]}</div>
                <div><div className="text-sm font-semibold">{u.username}</div><div className="text-xs text-text-muted">{u.email}</div></div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === "founder" ? "bg-yellow-100 text-yellow-800" : u.role === "superadmin" ? "bg-purple-100 text-purple-700" : u.role === "admin" ? "bg-accent/10 text-accent" : u.role === "moderator" ? "bg-blue-100 text-blue-700" : u.role === "verified" ? "bg-green-100 text-green-700" : "bg-primary-light"}`}>{u.role}</span>
                {isSuperAdmin && u.role !== "superadmin" && u.role !== "founder" && (
                  <div className="flex gap-1">
                    {u.role === "user" && (
                      <form action={async (fd: FormData) => { fd.append("userId", u.id); fd.append("role", "verified"); await setUserRole(fd); }}>
                        <button className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">{locale === "zh" || locale === "zht" || locale === "yue" ? "认证" : "Verify"}</button>
                      </form>
                    )}
                    {(u.role === "user" || u.role === "verified") && (
                      <form action={async (fd: FormData) => { fd.append("userId", u.id); fd.append("role", "moderator"); await setUserRole(fd); }}>
                        <button className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">Mod</button>
                      </form>
                    )}
                    {(u.role === "user" || u.role === "verified" || u.role === "moderator") && (
                      <form action={async (fd: FormData) => { fd.append("userId", u.id); fd.append("role", "admin"); await setUserRole(fd); }}>
                        <button className="px-2 py-1 text-xs bg-accent text-white rounded hover:bg-accent/80">{locale === "zh" || locale === "zht" || locale === "yue" ? "升管理" : "Admin"}</button>
                      </form>
                    )}
                    {(u.role !== "user") && (
                      <form action={async (fd: FormData) => { fd.append("userId", u.id); fd.append("role", "user"); await setUserRole(fd); }}>
                        <button className="px-2 py-1 text-xs bg-error/10 text-error rounded hover:bg-error/20">{locale === "zh" || locale === "zht" || locale === "yue" ? "降用户" : "Demote"}</button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "photos" && (
        <div className="space-y-6">
          {/* Bulk upload area */}
          <div className="bg-white rounded-2xl border p-6">
            <h3 className="font-bold text-lg mb-1">{locale === "zh" || locale === "zht" || locale === "yue" ? "批量上传照片" : "Bulk Upload Photos"}</h3>
            <p className="text-sm text-text-muted mb-4">{locale === "zh" || locale === "zht" || locale === "yue" ? "支持图片/视频/文件，单文件最大 500MB" : "Supports images, videos, files — max 500MB each"}</p>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent transition-colors cursor-pointer"
                onClick={() => { if (fileInputRef.current) { fileInputRef.current.value = ""; fileInputRef.current.click(); } }}>
                <Upload size={32} className="mx-auto text-text-muted mb-2" />
                <p className="text-sm font-medium text-accent">{selectedFileLabel || (locale === "zh" || locale === "zht" || locale === "yue" ? "点击选择照片" : "Click to select photos")}</p>
                <p className="text-xs text-text-muted mt-1">{locale === "zh" || locale === "zht" || locale === "yue" ? "可一次选择多张图片/视频" : "Select multiple images/videos"}</p>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple
                onChange={(e) => { const n = e.target.files?.length || 0; setSelectedFileLabel(n > 0 ? `${n} ${locale === "zh" || locale === "zht" || locale === "yue" ? "个文件已选择" : locale === "th" ? "ไฟล์ที่เลือก" : "file(s) selected"}` : ""); }}
                className="hidden" />
              <div className="flex flex-wrap items-end gap-3">
                <select id="upload-cat" className="px-3 py-2 rounded-lg border text-sm">
                  <option value="photo">🖼️ Photo</option>
                  <option value="video">🎬 Video</option>
                  <option value="official">📷 Official</option>
                  <option value="memory">📸 Memory</option>
                  <option value="fanart">🎨 Fanart</option>
                  <option value="gif">GIF</option>
                </select>
                <select id="upload-tag" className="px-3 py-2 rounded-lg border text-sm">
                  <option value="both">🏳️‍🌈 OrmFolk</option>
                  <option value="orm">🌟 Ormsin</option>
                  <option value="folk">🦋 Folk</option>
                  <option value="bemine">💜 Be Mine</option>
                  <option value="lovebound">💚 Love Bound</option>
                  <option value="apple">🍎 Apple</option>
                  <option value="crush">💥 Crush</option>
                  <option value="ladysbodyguard">🛡️ Bodyguard</option>
                  <option value="kimbap">🍙 Kimbap</option>
                  <option value="vlog">🎬 Vlog</option>
                  <option value="mv">🎵 MV</option>
                  <option value="livestream">🔴 LIVE</option>
                </select>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={async () => {
                    const fi = fileInputRef.current;
                    if (!fi?.files?.length) { setUploadMsg(locale === "zh" ? "请先选择文件" : "Please select files first"); return; }
                    setUploading(true); setUploadMsg("");
                    const tag = (document.getElementById("upload-tag") as HTMLSelectElement)?.value;
                    const cat = (document.getElementById("upload-cat") as HTMLSelectElement)?.value || "photo";
                    const fd = new FormData();
                    for (const f of Array.from(fi.files)) fd.append("files", f);
                    try {
                      const res = await fetch("/api/upload", { method: "POST", body: fd });
                      const data = await res.json();
                      if (data.error) throw new Error(data.error);
                      let msg = "";
                      if (data.files?.length > 0) {
                        const urls = data.files.map((f: any) => f.url);
                        const aFd = new FormData();
                        aFd.append("urls", JSON.stringify(urls));
                        aFd.append("captions", JSON.stringify(urls.map(() => "")));
                        aFd.append("category", cat);
                        if (tag) aFd.append("tag", tag);
                        await addGalleryItems(aFd);
                        msg = `✅ ${data.files.length} ${locale === "zh" || locale === "zht" || locale === "yue" ? "张已上传" : locale === "th" ? "รูปอัปโหลดแล้ว" : "uploaded"}`;
                        fi.value = ""; setSelectedFileLabel("");
                        setTimeout(() => setUploadMsg(""), 4000);
                      }
                      if (data.errors?.length > 0) msg += ` ⚠️ ${data.errors.length} failed`;
                      setUploadMsg(msg || (locale === "zh" || locale === "zht" || locale === "yue" ? "没有文件被选中" : "No files selected"));
                    } catch (err: any) {
                      setUploadMsg((locale === "zh" ? "上传失败" : "Upload failed") + ": " + (err?.message || ""));
                    }
                    setUploading(false);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl disabled:opacity-50">
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {uploading ? (locale === "zh" || locale === "zht" || locale === "yue" ? "上传中..." : "Uploading...") : (locale === "zh" || locale === "zht" || locale === "yue" ? "上传到图库" : "Upload to Gallery")}
                </button>
                {uploadMsg && <span className="text-sm font-medium text-accent">{uploadMsg}</span>}
              </div>

              {/* YouTube link upload */}
              <div className="flex items-end gap-3 pt-4 border-t border-border">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-text-muted mb-1">{locale === "zh" || locale === "zht" || locale === "yue" ? "或粘贴 YouTube 链接" : "Or paste YouTube link"}</label>
                  <input id="yt-link" type="text" placeholder="https://www.youtube.com/watch?v=..." className="w-full px-3 py-2 rounded-lg border text-sm" />
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const ytUrl = (document.getElementById("yt-link") as HTMLInputElement)?.value?.trim();
                    if (!ytUrl) { setUploadMsg(locale === "zh" ? "请输入 YouTube 链接" : "Please enter a YouTube link"); return; }
                    setUploading(true); setUploadMsg("");
                    const tag = (document.getElementById("upload-tag") as HTMLSelectElement)?.value;
                    const cat = (document.getElementById("upload-cat") as HTMLSelectElement)?.value || "photo";
                    try {
                      const aFd = new FormData();
                      aFd.append("urls", JSON.stringify([ytUrl]));
                      aFd.append("captions", JSON.stringify([""]));
                      aFd.append("category", cat);
                      aFd.append("videoUrls", JSON.stringify([ytUrl]));
                      aFd.append("tag", tag || "");
                      await addGalleryItems(aFd);
                      (document.getElementById("yt-link") as HTMLInputElement).value = "";
                      setUploadMsg("✅ YouTube video added!");
                      setTimeout(() => setUploadMsg(""), 4000);
                    } catch (err: any) {
                      setUploadMsg((locale === "zh" ? "添加失败" : "Failed") + ": " + (err?.message || ""));
                    }
                    setUploading(false);
                  }}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shrink-0">
                  ▶ {locale === "zh" || locale === "zht" || locale === "yue" ? "添加视频" : "Add Video"}
                </button>
              </div>
            </div>
          </div>

          {/* Gallery grid */}
          <div className="bg-white rounded-2xl border overflow-hidden">
            <div className="p-4 border-b bg-background font-bold flex items-center justify-between flex-wrap gap-2">
              <span>{locale === "zh" || locale === "zht" || locale === "yue" ? `图库 (${galleryItems.length} 张)` : locale === "th" ? `แกลเลอรี่ (${galleryItems.length} รูป)` : `Gallery (${galleryItems.length} photos)`}</span>
            </div>

            {/* Category filter tabs — same as user gallery */}
            <div className="p-3 border-b flex items-center gap-1.5 overflow-x-auto">
              {[
                { key: "all", emoji: "", label: locale === "zh" || locale === "zht" || locale === "yue" ? "全部" : "All" },
                { key: "official", emoji: "📷", label: locale === "zh" || locale === "zht" || locale === "yue" ? "官方" : "Official" },
                { key: "drama_still", emoji: "🎬", label: locale === "zh" || locale === "zht" || locale === "yue" ? "剧照" : "Drama" },
                { key: "daily", emoji: "☀️", label: locale === "zh" || locale === "zht" || locale === "yue" ? "日常" : "Daily" },
                { key: "fanart", emoji: "🎨", label: locale === "zh" || locale === "zht" || locale === "yue" ? "创作" : "Fanart" },
                { key: "kimbap", emoji: "🐱", label: "Kimbap" },
                { key: "memory", emoji: "📸", label: locale === "zh" || locale === "zht" || locale === "yue" ? "回忆" : "Memory" },
              ].map(({ key, emoji, label }) => {
                const count = key === "all" ? galleryItems.length : galleryItems.filter((i: any) => i.category === key).length;
                return (
                  <button key={key} onClick={() => setAdminCatFilter(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${adminCatFilter === key ? "bg-accent text-white" : "bg-background border text-text-secondary hover:border-accent"}`}>
                    {emoji} {label} ({count})
                  </button>
                );
              })}
              <div className="flex items-center gap-2">
                {!selectMode ? (
                  <button onClick={() => setSelectMode(true)} className="flex items-center gap-1 px-3 py-1.5 bg-background border text-xs rounded-lg hover:bg-white">
                    <Check size={12} /> {locale === "zh" || locale === "zht" || locale === "yue" ? "批量选择" : locale === "th" ? "เลือกหลายรายการ" : "Batch Select"}
                  </button>
                ) : (
                  <button onClick={clearSelection} className="flex items-center gap-1 px-3 py-1.5 bg-background border text-xs rounded-lg hover:bg-white">
                    <X size={12} /> {locale === "zh" || locale === "zht" || locale === "yue" ? "退出选择" : "Cancel Select"}
                  </button>
                )}
                {selectMode && (
                  <>
                    <button onClick={() => setSelected(new Set(galleryItems.map((i: any) => i.id)))} className="flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent text-xs rounded-lg hover:bg-accent/20">
                      {locale === "zh" || locale === "zht" || locale === "yue" ? "全选" : "Select All"}
                    </button>
                    {selected.size > 0 && (
                      <span className="text-xs text-accent font-medium">
                        {selected.size} {locale === "zh" || locale === "zht" || locale === "yue" ? "已选" : "selected"}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Batch action bar */}
            {selectMode && selected.size > 0 && (
              <div className="p-3 bg-accent/5 border-b flex items-center gap-3 flex-wrap">
                {/* Change category */}
                <select value={batchCategory} onChange={e => setBatchCategory(e.target.value)} className="px-2 py-1.5 rounded-lg border text-xs">
                  <option value="">{locale === "zh" || locale === "zht" || locale === "yue" ? "— 改分类 —" : "— Change Category —"}</option>
                  <option value="memory">📸 {locale === "zh" || locale === "zht" || locale === "yue" ? "回忆相册" : "Memory"}</option>
                  <option value="official">📷 {locale === "zh" || locale === "zht" || locale === "yue" ? "官方照片" : "Official"}</option>
                  <option value="drama_still">🎬 {locale === "zh" || locale === "zht" || locale === "yue" ? "剧照" : "Drama"}</option>
                  <option value="daily">☀️ {locale === "zh" || locale === "zht" || locale === "yue" ? "日常" : "Daily"}</option>
                  <option value="fanart">🎨 Fanart</option>
                  <option value="kimbap">🐱 Kimbap</option>
                </select>
                {/* Change actor tag */}
                <select value={batchTag} onChange={e => setBatchTag(e.target.value)} className="px-2 py-1.5 rounded-lg border text-xs">
                  <option value="">{locale === "zh" || locale === "zht" || locale === "yue" ? "— 改标签 —" : "— Change Tag —"}</option>
                  <option value="both">🏳️‍🌈 OrmFolk</option>
                  <option value="orm">🌟 Ormsin</option>
                  <option value="folk">🦋 Folk</option>
                  <option value="bemine">💜 Be Mine</option>
                  <option value="lovebound">💚 Love Bound</option>
                  <option value="apple">🍎 Apple</option>
                  <option value="crush">💥 Crush</option>
                  <option value="ladysbodyguard">🛡️ Bodyguard</option>
                  <option value="kimbap">🍙 Kimbap</option>
                  <option value="vlog">🎬 Vlog</option>
                  <option value="mv">🎵 MV</option>
                  <option value="livestream">🔴 LIVE</option>
                </select>
                {/* Apply button */}
                <button disabled={batchLoading} onClick={async () => {
                  if (!batchCategory && !batchTag) return;
                  setBatchLoading(true); setBatchMsg("");
                  try {
                    await batchUpdateGalleryItems([...selected], { category: batchCategory || undefined, tag: batchTag || undefined });
                    setBatchMsg(`✅ ${locale === "zh" || locale === "zht" || locale === "yue" ? "分类已更新" : locale === "th" ? "อัปเดตหมวดหมู่แล้ว" : "Category updated"}`);
                    setBatchCategory(""); setBatchTag(""); clearSelection();
                    setTimeout(() => setBatchMsg(""), 3000);
                  } catch (err: any) { setBatchMsg(`❌ ${err.message || "Failed"}`); }
                  setBatchLoading(false);
                }} className="px-3 py-1.5 bg-accent text-white text-xs rounded-lg font-medium disabled:opacity-50">
                  {batchLoading ? <Loader2 size={12} className="animate-spin inline" /> : null} {locale === "zh" || locale === "zht" || locale === "yue" ? "应用" : "Apply"}
                </button>
                {/* Toggle featured */}
                <button disabled={batchLoading} onClick={async () => {
                  setBatchLoading(true); setBatchMsg("");
                  try {
                    await batchUpdateGalleryItems([...selected], { featured: true });
                    setBatchMsg(`⭐ ${locale === "zh" || locale === "zht" || locale === "yue" ? "已设为精选" : locale === "th" ? "ตั้งเป็นแนะนำแล้ว" : "Featured!"}`);
                    clearSelection();
                    setTimeout(() => setBatchMsg(""), 3000);
                  } catch (err: any) { setBatchMsg(`❌ ${err.message || "Failed"}`); }
                  setBatchLoading(false);
                }} className="px-3 py-1.5 bg-warning/10 text-warning text-xs rounded-lg disabled:opacity-50">
                  {batchLoading ? <Loader2 size={12} className="animate-spin inline" /> : "⭐"} {locale === "zh" || locale === "zht" || locale === "yue" ? "设为精选" : "Feature"}
                </button>
                {/* Delete */}
                <button disabled={batchLoading} onClick={async () => {
                  if (!confirm(locale === "zh" || locale === "zht" || locale === "yue" ? `确认删除 ${selected.size} 张照片？此操作不可撤销。` : `Delete ${selected.size} photos? This cannot be undone.`)) return;
                  setBatchLoading(true); setBatchMsg("");
                  try {
                    await batchDeleteGalleryItems([...selected]);
                    setBatchMsg(`🗑️ ${locale === "zh" || locale === "zht" || locale === "yue" ? `已删除 ${selected.size} 张` : locale === "th" ? `ลบ ${selected.size} รูปแล้ว` : `Deleted ${selected.size} photos`}`);
                    clearSelection();
                    setTimeout(() => setBatchMsg(""), 3000);
                  } catch (err: any) { setBatchMsg(`❌ ${err.message || "Failed"}`); }
                  setBatchLoading(false);
                }} className="px-3 py-1.5 bg-error/10 text-error text-xs rounded-lg font-medium disabled:opacity-50">
                  {batchLoading ? <Loader2 size={12} className="animate-spin inline" /> : "🗑️"} {locale === "zh" || locale === "zht" || locale === "yue" ? `删除 ${selected.size} 张` : `Delete ${selected.size}`}
                </button>
                {batchMsg && <span className="text-xs font-medium text-accent">{batchMsg}</span>}
              </div>
            )}

            {(() => {
              const filteredItems = adminCatFilter === "all" ? galleryItems : galleryItems.filter((i: any) => i.category === adminCatFilter || (adminCatFilter === "official" && i.category === "event_photo"));
              if (filteredItems.length === 0) return (
                <div className="p-12 text-center text-text-muted">{locale === "zh" || locale === "zht" || locale === "yue" ? "还没有上传任何照片" : "No photos uploaded yet"}</div>
              );
              return (
              <div
                className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3"
                onMouseDown={handleGridMouseDown}
                onMouseMove={handleGridMouseMove}
                onMouseUp={handleGridMouseUp}
                onMouseLeave={handleGridMouseUp}>
                {filteredItems.map((item: any) => {
                  const isSelected = selected.has(item.id);
                  return (
                  <div key={item.id}
                    className={`group relative aspect-square rounded-lg overflow-hidden bg-background border cursor-pointer transition-all select-none ${isSelected ? "ring-2 ring-accent ring-offset-2 scale-[0.95]" : "hover:shadow-md"}`}
                    onClick={() => selectMode ? toggleSelect(item.id) : null}
                    data-gid={item.id}>
                    {item.url && /\.(mp4|webm|mov)$/i.test(item.url) ? (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 relative flex items-center justify-center">
                        <video src={`${item.url}#t=0.5`} className="absolute inset-0 w-full h-full object-cover opacity-60" muted playsInline preload="metadata" />
                        <Play size={28} fill="white" className="text-white/80 relative z-10" />
                      </div>
                    ) : (
                      <img src={item.url} alt={item.caption || ""} className="w-full h-full object-cover" />
                    )}
                    {/* Checkbox overlay */}
                    {selectMode && (
                      <div className={`absolute top-2 left-2 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? "bg-accent border-accent text-white" : "bg-white/80 border-white"}`}>
                        {isSelected && <Check size={14} />}
                      </div>
                    )}
                    {/* Hover actions (only when not in select mode) */}
                    {!selectMode && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2">
                        <button onClick={async (e) => { e.stopPropagation(); const fd = new FormData(); fd.append("id", item.id); await toggleGalleryFeatured(fd); }}
                          className="opacity-0 group-hover:opacity-100 p-2 bg-white/90 rounded-full text-warning hover:bg-white transition-all" title="Featured">
                          <Star size={14} fill={item.featured ? "currentColor" : "none"} />
                        </button>
                        <button onClick={async (e) => { e.stopPropagation(); if (!confirm(locale === "zh" || locale === "zht" || locale === "yue" ? "确认删除？" : "Delete?")) return; const fd = new FormData(); fd.append("id", item.id); await deleteGalleryItem(fd); }}
                          className="opacity-0 group-hover:opacity-100 p-2 bg-white/90 rounded-full text-error hover:bg-white transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                    {/* Info overlay — show category + tag */}
                    <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/50 text-white text-[10px] truncate">
                      {item.caption || `${catLabel(item.category)}${item.tag && item.tag !== "both" ? " · " + item.tag : ""}`}
                    </div>
                    {item.featured && <div className="absolute top-2 right-2"><Star size={14} className="text-warning fill-warning drop-shadow" /></div>}
                  </div>
                  );
                })}
              </div>
            );
            })()}
          </div>
        </div>
      )}

      {tab === "announce" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{locale === "zh" || locale === "zht" || locale === "yue" ? "发布公告" : "Post Announcement"}</h3>
              {!showAnnounceForm && (
                <button onClick={() => { setShowAnnounceForm(true); setEditAnnounce(null); }} className="flex items-center gap-1 px-3 py-1.5 bg-accent text-white text-xs rounded-lg"><Plus size={14} /> {locale === "zh" || locale === "zht" || locale === "yue" ? "新建" : "New"}</button>
              )}
            </div>
            {showAnnounceForm && (
              <form action={async (fd: FormData) => {
                fd.append("locale", locale);
                if (editAnnounce) { fd.append("id", editAnnounce.id); await editAnnouncement(fd); }
                else { await createAnnouncement(fd); }
                setShowAnnounceForm(false); setEditAnnounce(null);
              }} className="space-y-3">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs text-text-muted font-medium">{locale === "zh" || locale === "zht" || locale === "yue" ? "标题（英文）" : "Title (English)"}</span>
                  </div>
                  <input name="title" defaultValue={editAnnounce?.title || ""} placeholder={locale === "zh" || locale === "zht" || locale === "yue" ? "公告标题（必填）" : "Announcement title (required)"} className="w-full px-3 py-2 rounded-lg border text-sm" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs text-text-muted">{locale === "zh" || locale === "zht" || locale === "yue" ? "中文标题" : "Chinese Title"}</span>
                      <button type="button" onClick={() => {
                        const en = (document.querySelector('[name="title"]') as HTMLInputElement)?.value;
                        if (en) handleTranslate(en, 'en', [{lang:'zh',elementId:'ann-titleZh'}]);
                      }} className="text-[10px] px-1.5 py-0.5 bg-accent/10 text-accent rounded hover:bg-accent/20">🔄</button>
                    </div>
                    <input id="ann-titleZh" name="titleZh" defaultValue={editAnnounce?.titleZh || ""} placeholder={locale === "zh" || locale === "zht" || locale === "yue" ? "中文标题" : "Title ZH"} className="w-full px-3 py-2 rounded-lg border text-sm" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs text-text-muted">{locale === "zh" || locale === "zht" || locale === "yue" ? "泰文标题" : "Thai Title"}</span>
                      <button type="button" onClick={() => {
                        const en = (document.querySelector('[name="title"]') as HTMLInputElement)?.value;
                        if (en) handleTranslate(en, 'en', [{lang:'th',elementId:'ann-titleTh'}]);
                      }} className="text-[10px] px-1.5 py-0.5 bg-accent/10 text-accent rounded hover:bg-accent/20">🔄</button>
                    </div>
                    <input id="ann-titleTh" name="titleTh" defaultValue={editAnnounce?.titleTh || ""} placeholder={locale === "zh" || locale === "zht" || locale === "yue" ? "泰文标题" : "Title TH"} className="w-full px-3 py-2 rounded-lg border text-sm" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs text-text-muted font-medium">{locale === "zh" || locale === "zht" || locale === "yue" ? "内容（英文）" : "Content (English)"}</span>
                  </div>
                  <textarea name="content" defaultValue={editAnnounce?.content || ""} placeholder={locale === "zh" || locale === "zht" || locale === "yue" ? "公告内容..." : "Announcement content..."} className="w-full px-3 py-2 rounded-lg border text-sm" rows={6} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs text-text-muted">{locale === "zh" || locale === "zht" || locale === "yue" ? "中文内容" : "Chinese Content"}</span>
                      <button type="button" onClick={() => {
                        const en = (document.querySelector('[name="content"]') as HTMLInputElement)?.value;
                        if (en) handleTranslate(en, 'en', [{lang:'zh',elementId:'ann-contentZh'}]);
                      }} className="text-[10px] px-1.5 py-0.5 bg-accent/10 text-accent rounded hover:bg-accent/20">🔄</button>
                    </div>
                    <textarea id="ann-contentZh" name="contentZh" defaultValue={editAnnounce?.contentZh || ""} placeholder={locale === "zh" || locale === "zht" || locale === "yue" ? "中文内容" : "Content ZH"} className="w-full px-3 py-2 rounded-lg border text-sm" rows={4} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs text-text-muted">{locale === "zh" || locale === "zht" || locale === "yue" ? "泰文内容" : "Thai Content"}</span>
                      <button type="button" onClick={() => {
                        const en = (document.querySelector('[name="content"]') as HTMLInputElement)?.value;
                        if (en) handleTranslate(en, 'en', [{lang:'th',elementId:'ann-contentTh'}]);
                      }} className="text-[10px] px-1.5 py-0.5 bg-accent/10 text-accent rounded hover:bg-accent/20">🔄</button>
                    </div>
                    <textarea id="ann-contentTh" name="contentTh" defaultValue={editAnnounce?.contentTh || ""} placeholder={locale === "zh" || locale === "zht" || locale === "yue" ? "泰文内容" : "Content TH"} className="w-full px-3 py-2 rounded-lg border text-sm" rows={4} />
                  </div>
                </div>
                <select name="category" defaultValue={editAnnounce?.category || "announcement"} className="px-3 py-2 rounded-lg border text-sm">
                  <option value="announcement">📢 {locale === "zh" || locale === "zht" || locale === "yue" ? "社区公告" : "Announcement"}</option>
                  <option value="event">🎉 {locale === "zh" || locale === "zht" || locale === "yue" ? "活动通知" : "Event"}</option>
                  <option value="birthday">🎂 {locale === "zh" || locale === "zht" || locale === "yue" ? "生日应援" : "Birthday Project"}</option>
                  <option value="update">🔧 {locale === "zh" || locale === "zht" || locale === "yue" ? "网站更新" : "Website Update"}</option>
                </select>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="pinned" value="true" defaultChecked={editAnnounce?.pinned} />
                  <Pin size={14} /> {locale === "zh" || locale === "zht" || locale === "yue" ? "置顶此公告" : "Pin this announcement"}
                </label>
                <div className="flex gap-2">
                  <button type="submit" className="flex items-center gap-1 px-4 py-2 bg-accent text-white text-sm rounded-lg"><Save size={14} />{editAnnounce ? (locale === "zh" || locale === "zht" || locale === "yue" ? "更新" : "Update") : (locale === "zh" || locale === "zht" || locale === "yue" ? "发布" : "Post")}</button>
                  <button type="button" onClick={() => { setShowAnnounceForm(false); setEditAnnounce(null); }} className="px-4 py-2 bg-white border text-sm rounded-lg">{locale === "zh" || locale === "zht" || locale === "yue" ? "取消" : "Cancel"}</button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-white rounded-2xl border overflow-hidden">
            <div className="p-4 border-b bg-background font-bold">{locale === "zh" || locale === "zht" || locale === "yue" ? `公告列表 (${announcements.length})` : locale === "th" ? `ประกาศ (${announcements.length})` : `Announcements (${announcements.length})`}</div>
            {announcements.length === 0 ? (
              <div className="p-12 text-center text-text-muted">{locale === "zh" || locale === "zht" || locale === "yue" ? "还没有发布公告" : "No announcements yet"}</div>
            ) : (
              announcements.map((a: any) => (
                <div key={a.id} className={`p-4 border-b last:border-0 ${a.pinned ? "bg-accent/5" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {a.pinned && <span className="px-1.5 py-0.5 bg-accent text-white text-[10px] rounded-full font-bold">PIN</span>}
                        <span className="text-[10px] px-1.5 py-0.5 bg-primary-light rounded-full">{a.category || "announcement"}</span>
                        <h4 className="font-semibold text-text-primary">{a.title}</h4>
                      </div>
                      <p className="text-sm text-text-secondary mb-1 whitespace-pre-wrap">{a.content}</p>
                      <span className="text-xs text-text-muted">{a.author?.username} · {new Date(a.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-1 shrink-0 ml-3">
                      <button onClick={() => { setEditAnnounce(a); setShowAnnounceForm(true); }} className="px-2 py-1 text-xs text-accent hover:bg-accent/10 rounded">{locale === "zh" || locale === "zht" || locale === "yue" ? "编辑" : "Edit"}</button>
                      <button onClick={() => { if (!confirm(locale === "zh" || locale === "zht" || locale === "yue" ? "确认删除此公告？" : "Delete this announcement?")) return; const fd = new FormData(); fd.append("id", a.id); deleteAnnouncement(fd); }} className="p-1 text-text-muted hover:text-error"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === "categories" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{locale === "zh" || locale === "zht" || locale === "yue" ? "管理论坛分区" : "Manage Categories"}</h3>
              {!showCatForm && (
                <button onClick={() => { setShowCatForm(true); setEditCat(null); }} className="flex items-center gap-1 px-3 py-1.5 bg-accent text-white text-xs rounded-lg"><Plus size={14} /> {locale === "zh" || locale === "zht" || locale === "yue" ? "新建分区" : "New Category"}</button>
              )}
            </div>
            {showCatForm && (
              <form action={async (fd: FormData) => {
                if (editCat) fd.append("id", editCat.id);
                await addOrEditCategory(fd);
                setShowCatForm(false); setEditCat(null);
              }} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input name="slug" defaultValue={editCat?.slug || ""} placeholder="slug" className="px-3 py-2 rounded-lg border text-sm" required />
                  <select name="parentId" defaultValue={editCat?.parentId || ""} className="px-3 py-2 rounded-lg border text-sm">
                    <option value="">{locale === "zh" || locale === "zht" || locale === "yue" ? "— 主分区（无父级）—" : "— Main Category (no parent) —"}</option>
                    {categories.filter((c: any) => !c.parentId).map((c: any) => (
                      <option key={c.id} value={c.id}>{c.nameEn}</option>
                    ))}
                  </select>
                  <input name="nameEn" defaultValue={editCat?.nameEn || ""} placeholder="Name EN" className="px-3 py-2 rounded-lg border text-sm" required />
                  <input name="nameZh" defaultValue={editCat?.nameZh || ""} placeholder="Name 中文" className="px-3 py-2 rounded-lg border text-sm" />
                  <input name="nameTh" defaultValue={editCat?.nameTh || ""} placeholder="Name ไทย" className="px-3 py-2 rounded-lg border text-sm" />
                  <input name="sortOrder" type="number" defaultValue={editCat?.sortOrder || 0} placeholder={locale === "zh" || locale === "zht" || locale === "yue" ? "排序" : "Sort"} className="px-3 py-2 rounded-lg border text-sm" />
                </div>
                <input name="descriptionEn" defaultValue={editCat?.descriptionEn || ""} placeholder={locale === "zh" || locale === "zht" || locale === "yue" ? "描述 EN（选填）" : "Description EN (optional)"} className="w-full px-3 py-2 rounded-lg border text-sm" />
                <div className="flex gap-2">
                  <button type="submit" className="flex items-center gap-1 px-4 py-2 bg-accent text-white text-sm rounded-lg"><Save size={14} />{editCat ? (locale === "zh" || locale === "zht" || locale === "yue" ? "更新" : "Update") : (locale === "zh" || locale === "zht" || locale === "yue" ? "创建" : "Create")}</button>
                  <button type="button" onClick={() => { setShowCatForm(false); setEditCat(null); }} className="px-4 py-2 bg-white border text-sm rounded-lg">{locale === "zh" || locale === "zht" || locale === "yue" ? "取消" : "Cancel"}</button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-white rounded-2xl border overflow-hidden">
            <div className="p-4 border-b bg-background font-bold">{locale === "zh" || locale === "zht" || locale === "yue" ? "分区列表" : "Categories"}</div>
            {categories.length === 0 ? (
              <div className="p-12 text-center text-text-muted">{locale === "zh" || locale === "zht" || locale === "yue" ? "还没有创建分区" : "No categories yet"}</div>
            ) : (
              (() => {
                const parents = categories.filter((c: any) => !c.parentId);
                const getChildren = (parentId: string) => categories.filter((c: any) => c.parentId === parentId);
                const validParentIds = new Set(parents.map((p: any) => p.id));
                const orphans = categories.filter((c: any) => c.parentId && !validParentIds.has(c.parentId));

                if (parents.length === 0 && orphans.length === 0) {
                  // All categories are children of something — show flat
                  return categories.map((cat: any) => (
                    <div key={cat.id} className="p-4 flex items-center justify-between border-b hover:bg-background/30">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{cat.nameEn}</span>
                          <span className="text-xs text-text-muted">/{cat.slug}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditCat(cat); setShowCatForm(true); }} className="px-2 py-1 text-xs text-accent hover:bg-accent/10 rounded">{locale === "zh" || locale === "zht" || locale === "yue" ? "编辑" : "Edit"}</button>
                        <button onClick={() => { if (!confirm("Delete?")) return; const fd = new FormData(); fd.append("id", cat.id); deleteCategory(fd); }} className="p-1 text-text-muted hover:text-error"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ));
                }

                return (
                  <div>
                    {parents.map((parent: any) => (
                      <div key={parent.id}>
                        <div className="p-4 flex items-center justify-between border-b hover:bg-background/30">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-text-primary">{parent.nameEn}</span>
                              {parent.nameZh && <span className="text-xs text-text-muted">{parent.nameZh}</span>}
                              <span className="text-xs text-text-muted">/{parent.slug}</span>
                              <span className="text-[10px] px-1.5 py-0.5 bg-accent/10 text-accent rounded-full">{locale === "zh" || locale === "zht" || locale === "yue" ? "主" : "Main"}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => { setEditCat(parent); setShowCatForm(true); }} className="px-2 py-1 text-xs text-accent hover:bg-accent/10 rounded">{locale === "zh" || locale === "zht" || locale === "yue" ? "编辑" : "Edit"}</button>
                            <button onClick={() => { if (!confirm(locale === "zh" || locale === "zht" || locale === "yue" ? "确认删除此分区？" : "Delete this category?")) return; const fd = new FormData(); fd.append("id", parent.id); deleteCategory(fd); }} className="p-1 text-text-muted hover:text-error"><Trash2 size={14} /></button>
                          </div>
                        </div>
                        {/* Children */}
                        {getChildren(parent.id).map((child: any) => (
                          <div key={child.id} className="pl-10 pr-4 py-3 flex items-center justify-between border-b bg-background/30 hover:bg-background/50">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-text-muted">└</span>
                              <span className="text-sm font-medium text-text-secondary">{child.nameEn}</span>
                              {child.nameZh && <span className="text-xs text-text-muted">{child.nameZh}</span>}
                              <span className="text-xs text-text-muted">/{child.slug}</span>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => { setEditCat(child); setShowCatForm(true); }} className="px-2 py-1 text-xs text-accent hover:bg-accent/10 rounded">{locale === "zh" || locale === "zht" || locale === "yue" ? "编辑" : "Edit"}</button>
                              <button onClick={() => { if (!confirm(locale === "zh" || locale === "zht" || locale === "yue" ? "确认删除此子分区？" : "Delete this sub-category?")) return; const fd = new FormData(); fd.append("id", child.id); deleteCategory(fd); }} className="p-1 text-text-muted hover:text-error"><Trash2 size={14} /></button>
                            </div>
                          </div>
                        ))}
                        {getChildren(parent.id).length === 0 && (
                          <div className="pl-10 py-2 text-xs text-text-muted border-b bg-background/20">{locale === "zh" || locale === "zht" || locale === "yue" ? "（无子分区）" : "(no sub-categories)"}</div>
                        )}
                      </div>
                    ))}
                    {/* Orphan children (parent deleted) */}
                    {orphans.map((cat: any) => (
                      <div key={cat.id} className="p-4 flex items-center justify-between border-b bg-warning/5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-warning">⚠</span>
                            <span className="text-sm font-semibold">{cat.nameEn}</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-warning/10 text-warning rounded-full">{locale === "zh" || locale === "zht" || locale === "yue" ? "父分区已删除" : "Orphan"}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => { setEditCat(cat); setShowCatForm(true); }} className="px-2 py-1 text-xs text-accent hover:bg-accent/10 rounded">{locale === "zh" || locale === "zht" || locale === "yue" ? "编辑" : "Edit"}</button>
                          <button onClick={() => { if (!confirm("Delete?")) return; const fd = new FormData(); fd.append("id", cat.id); deleteCategory(fd); }} className="p-1 text-text-muted hover:text-error"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}

      {tab === "banned" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border p-6">
            <h3 className="font-bold text-lg mb-4">{locale === "zh" || locale === "zht" || locale === "yue" ? "添加屏蔽词" : "Add Banned Word"}</h3>
            <form action={async (fd: FormData) => { await addBannedWord(fd); }} className="flex items-end gap-3">
              <div className="flex-1">
                <input name="word" placeholder={locale === "zh" || locale === "zht" || locale === "yue" ? "输入要屏蔽的词..." : "Enter word to ban..."} className="w-full px-3 py-2 rounded-lg border text-sm" required />
              </div>
              <select name="category" className="px-3 py-2 rounded-lg border text-sm">
                <option value="instant_block">{locale === "zh" || locale === "zht" || locale === "yue" ? "🚫 直接拦截" : "🚫 Instant Block"}</option>
                <option value="review">{locale === "zh" || locale === "zht" || locale === "yue" ? "🔍 审核队列" : "🔍 Review Queue"}</option>
                <option value="harassment">{locale === "zh" || locale === "zht" || locale === "yue" ? "⚠️ 辱骂骚扰" : "⚠️ Harassment"}</option>
              </select>
              <select name="lang" className="px-3 py-2 rounded-lg border text-sm">
                <option value="all">{locale === "zh" || locale === "zht" || locale === "yue" ? "所有语言" : "All"}</option>
                <option value="en">EN</option>
                <option value="zh">ZH</option>
                <option value="th">TH</option>
              </select>
              <button type="submit" className="px-4 py-2 bg-error/80 text-white text-sm rounded-lg hover:bg-error">+ {locale === "zh" || locale === "zht" || locale === "yue" ? "添加" : "Add"}</button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border overflow-hidden">
            <div className="p-4 border-b bg-background font-bold">{locale === "zh" || locale === "zht" || locale === "yue" ? `屏蔽词列表 (${bannedWords.length})` : `Banned Words (${bannedWords.length})`}</div>
            {bannedWords.length === 0 ? (
              <div className="p-12 text-center text-text-muted">{locale === "zh" || locale === "zht" || locale === "yue" ? "还没有添加屏蔽词" : "No banned words yet"}</div>
            ) : (
              bannedWords.map((b: any) => (
                <div key={b.id} className="p-3 flex items-center justify-between border-b last:border-0 hover:bg-background/50">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-error">{b.word}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-primary-light rounded-full">{b.lang}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-warning/10 text-warning">{b.category || "instant_block"}</span>
                  </div>
                  <form action={async (fd: FormData) => { fd.append("id", b.id); await removeBannedWord(fd); }}>
                    <button className="p-1 text-text-muted hover:text-error"><Trash2 size={14} /></button>
                  </form>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === "review" && (
        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="p-4 border-b bg-background font-bold">{locale === "zh" || locale === "zht" || locale === "yue" ? `待审核 (${reviewQueue.length})` : `Review Queue (${reviewQueue.length})`}</div>
          {reviewQueue.length === 0 ? (
            <div className="p-12 text-center text-text-muted">{locale === "zh" || locale === "zht" || locale === "yue" ? "没有待审核内容" : "Nothing to review"}</div>
          ) : (
            reviewQueue.map((p: any) => (
              <div key={p.id} className="p-4 border-b last:border-0 hover:bg-background/50">
                <div className="mb-2">
                  <span className="text-sm font-semibold">{p.title}</span>
                  <span className="ml-2 text-xs text-text-muted">{p.author?.username} · {p.category?.nameEn}</span>
                </div>
                <p className="text-xs text-text-secondary line-clamp-2 mb-3">{p.content}</p>
                <div className="flex gap-2">
                  <form action={async (fd: FormData) => { fd.append("postId", p.id); fd.append("action", "approve"); await reviewPost(fd); }}>
                    <button className="px-3 py-1 bg-success/10 text-success text-xs rounded-lg">✅ {locale === "zh" || locale === "zht" || locale === "yue" ? "通过" : "Approve"}</button>
                  </form>
                  <form action={async (fd: FormData) => { fd.append("postId", p.id); fd.append("action", "reject"); await reviewPost(fd); }}>
                    <button className="px-3 py-1 bg-error/10 text-error text-xs rounded-lg">❌ {locale === "zh" || locale === "zht" || locale === "yue" ? "拒绝" : "Reject"}</button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "dramas" && (
        <div className="space-y-6">
          {/* Drama list */}
          <div className="bg-white rounded-2xl border overflow-hidden">
            <div className="p-4 border-b bg-background flex items-center justify-between">
              <span className="font-bold">{locale === "zh" || locale === "zht" || locale === "yue" ? "剧集管理" : "Dramas"}</span>
              <button onClick={() => { setEditingDrama(null); setShowDramaForm(true); }} className="flex items-center gap-1 px-3 py-1.5 bg-accent text-white text-xs rounded-lg"><Plus size={14} /> {locale === "zh" || locale === "zht" || locale === "yue" ? "新增剧集" : "Add Drama"}</button>
            </div>
            {showDramaForm && (
              <div className="p-4 border-b bg-background/30">
                <form action={async (fd: FormData) => {
                  if (editingDrama) { fd.append("id", editingDrama.id); await editDrama(fd); }
                  else { await addDrama(fd); }
                  setShowDramaForm(false); setEditingDrama(null);
                }} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input name="title" defaultValue={editingDrama?.title || ""} placeholder="Title EN" className="px-3 py-2 rounded-lg border text-sm" required />
                    <input name="titleZh" defaultValue={editingDrama?.titleZh || ""} placeholder="Title 中文" className="px-3 py-2 rounded-lg border text-sm" />
                    <input name="titleTh" defaultValue={editingDrama?.titleTh || ""} placeholder="Title ไทย" className="px-3 py-2 rounded-lg border text-sm" />
                    <input name="coverImage" defaultValue={editingDrama?.coverImage || ""} placeholder="Cover Image URL" className="px-3 py-2 rounded-lg border text-sm" />
                    <input name="sortOrder" type="number" defaultValue={editingDrama?.sortOrder || 0} placeholder="Sort Order" className="px-3 py-2 rounded-lg border text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input name="description" defaultValue={editingDrama?.description || ""} placeholder="Description EN" className="px-3 py-2 rounded-lg border text-sm" />
                    <input name="descriptionZh" defaultValue={editingDrama?.descriptionZh || ""} placeholder="Description 中文" className="px-3 py-2 rounded-lg border text-sm" />
                    <input name="descriptionTh" defaultValue={editingDrama?.descriptionTh || ""} placeholder="Description ไทย" className="px-3 py-2 rounded-lg border text-sm" />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex items-center gap-1 px-4 py-2 bg-accent text-white text-sm rounded-lg"><Save size={14} />{editingDrama ? (locale === "zh" || locale === "zht" || locale === "yue" ? "更新" : "Update") : (locale === "zh" || locale === "zht" || locale === "yue" ? "创建" : "Create")}</button>
                    <button type="button" onClick={() => { setShowDramaForm(false); setEditingDrama(null); }} className="px-4 py-2 bg-white border text-sm rounded-lg">{locale === "zh" || locale === "zht" || locale === "yue" ? "取消" : "Cancel"}</button>
                  </div>
                </form>
              </div>
            )}
            {(!dramas || dramas.length === 0) ? (
              <div className="p-12 text-center text-text-muted">{locale === "zh" || locale === "zht" || locale === "yue" ? "还没有剧集" : "No dramas yet"}</div>
            ) : (
              dramas.map((d: any) => (
                <div key={d.id} className="border-b last:border-0">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 rounded bg-background overflow-hidden flex items-center justify-center text-xs text-text-muted">
                        {d.coverImage ? <img src={d.coverImage} alt="" className="w-full h-full object-cover" /> : "🎬"}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{d.title}</div>
                        <div className="text-xs text-text-muted">{d.episodes?.length || 0} {locale === "zh" || locale === "zht" || locale === "yue" ? "集" : "eps"}</div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEpDramaId(d.id); setEditingEp(null); setSectionCount(4); setShowEpForm(true); }}
                        className="px-2 py-1 text-xs text-green-600 hover:bg-green-50 rounded">{locale === "zh" || locale === "zht" || locale === "yue" ? "+集" : "+Ep"}</button>
                      <button onClick={() => { setEditingDrama(d); setShowDramaForm(true); }}
                        className="px-2 py-1 text-xs text-accent hover:bg-accent/10 rounded">{locale === "zh" || locale === "zht" || locale === "yue" ? "编辑" : "Edit"}</button>
                      <button onClick={() => { if (!confirm("Delete?")) return; const fd = new FormData(); fd.append("id", d.id); deleteDrama(fd); }}
                        className="p-1 text-text-muted hover:text-error"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  {/* Episode list under this drama */}
                  {d.episodes?.length > 0 && (
                    <div className="pl-12 pr-4 pb-2 space-y-1">
                      {d.episodes.map((ep: any) => {
                        const langs = (ep.language || "").split(",").filter(Boolean);
                        const langLabel: Record<string, string> = { zh: "中字", en: "英字", th: "泰字", ko: "韓字", ja: "日字" };
                        const langColor: Record<string, string> = { zh: "bg-red-50 text-red-600", en: "bg-blue-50 text-blue-600", th: "bg-green-50 text-green-600", ko: "bg-violet-50 text-violet-600", ja: "bg-pink-50 text-pink-600" };
                        return (
                          <div key={ep.id} className="flex items-center justify-between py-1.5 px-3 bg-background/50 rounded text-xs">
                            <span className="flex items-center gap-1 flex-wrap">
                              <span>{ep.title} {ep.duration ? `(${ep.duration})` : ""}</span>
                              {langs.length === 0 ? <span className="text-[10px] px-1 py-0.5 rounded bg-gray-100 text-gray-600">生肉</span> : langs.map((l: string) => (
                                <span key={l} className={`text-[10px] px-1 py-0.5 rounded ${langColor[l] || "bg-gray-100 text-gray-600"}`}>{langLabel[l] || l}</span>
                              ))}
                            </span>
                            <div className="flex gap-1">
                              <form action={async (fd: FormData) => { fd.append("id", ep.id); fd.append("direction", "up"); await reorderEpisode(fd); }}>
                                <button className="p-0.5 text-text-muted hover:text-accent"><ChevronUp size={12} /></button>
                              </form>
                              <form action={async (fd: FormData) => { fd.append("id", ep.id); fd.append("direction", "down"); await reorderEpisode(fd); }}>
                                <button className="p-0.5 text-text-muted hover:text-accent"><ChevronDown size={12} /></button>
                              </form>
                              <button onClick={() => { setEditingEp(ep); const existing = (ep.videoUrl || "").split("\n").filter(Boolean); setSectionCount(Math.max(4, existing.length)); setShowEpForm(true); }}
                                className="p-0.5 text-text-muted hover:text-accent"><Pencil size={12} /></button>
                              <button onClick={() => { if (!confirm("Delete episode?")) return; const fd = new FormData(); fd.append("id", ep.id); deleteEpisode(fd); }}
                                className="p-0.5 text-text-muted hover:text-error"><Trash2 size={12} /></button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Add/Edit Episode form */}
          {showEpForm && (
            <div className="bg-white rounded-2xl border p-6">
              <h3 className="font-bold text-lg mb-4">{editingEp ? (locale === "zh" || locale === "zht" || locale === "yue" ? "编辑剧集" : "Edit Episode") : (locale === "zh" || locale === "zht" || locale === "yue" ? "添加剧集" : "Add Episode")}</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setUploading(true);
                const fd = new FormData(e.currentTarget);
                if (editingEp) { fd.append("id", editingEp.id); }
                else { fd.append("dramaId", epDramaId); }
                // Collect all section URLs dynamically
                const sectionInputs = e.currentTarget.querySelectorAll('[name^="sectionUrl"]');
                const sectionUrls = Array.from(sectionInputs).map((el: any) => el.value.trim()).filter(Boolean);
                const fileInput = e.currentTarget.querySelector('input[type=file]') as HTMLInputElement;
                if (fileInput?.files?.length) {
                  const ufd = new FormData();
                  for (const f of Array.from(fileInput.files)) ufd.append("files", f);
                  try {
                    const res = await fetch("/api/upload", { method: "POST", body: ufd });
                    const data = await res.json();
                    if (data.files?.length) {
                      const uploadedUrls = data.files.map((f: any) => f.url);
                      fd.set("videoUrl", [...uploadedUrls, ...sectionUrls].join("\n"));
                    } else {
                      fd.set("videoUrl", sectionUrls.join("\n"));
                    }
                  } catch {
                    fd.set("videoUrl", sectionUrls.join("\n"));
                  }
                } else {
                  fd.set("videoUrl", sectionUrls.join("\n"));
                }
                if (editingEp) await editEpisode(fd); else await addEpisode(fd);
                setUploading(false);
                setShowEpForm(false); setEditingEp(null);
              }} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input name="episodeNum" type="number" defaultValue={editingEp?.episodeNum || ""} placeholder={locale === "zh" || locale === "zht" || locale === "yue" ? "集数" : "Episode #"} className="px-3 py-2 rounded-lg border text-sm" required />
                  <input name="duration" defaultValue={editingEp?.duration || ""} placeholder={locale === "zh" || locale === "zht" || locale === "yue" ? "时长 (如 45:00)" : "Duration (e.g. 45:00)"} className="px-3 py-2 rounded-lg border text-sm" />
                  <input name="title" defaultValue={editingEp?.title || ""} placeholder="Title EN" className="px-3 py-2 rounded-lg border text-sm" required />
                  <input name="titleZh" defaultValue={editingEp?.titleZh || ""} placeholder="Title 中文" className="px-3 py-2 rounded-lg border text-sm" />
                  <input name="titleTh" defaultValue={editingEp?.titleTh || ""} placeholder="Title ไทย" className="px-3 py-2 rounded-lg border text-sm" />
                </div>
                {/* Language checkboxes */}
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">{locale === "zh" || locale === "zht" || locale === "yue" ? "字幕语言（可多选）" : "Subtitles (multi-select)"}</label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { v: "zh", l: isZh ? "🇨🇳 中字" : "CN Sub" },
                      { v: "en", l: isZh ? "🇬🇧 英字" : "EN Sub" },
                      { v: "th", l: isZh ? "🇹🇭 泰字" : "TH Sub" },
                      { v: "ko", l: isZh ? "🇰🇷 韓字" : "KR Sub" },
                      { v: "ja", l: isZh ? "🇯🇵 日字" : "JP Sub" },
                    ].map(({ v, l }) => {
                      const checked = editingEp ? (editingEp.language || "").split(",").includes(v) : false;
                      return (
                        <label key={v} className="flex items-center gap-1 text-sm cursor-pointer">
                          <input type="checkbox" name="language" value={v} defaultChecked={checked} className="accent-accent" /> {l}
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-2">{isZh ? "视频链接（可添加多个Section）" : locale === "th" ? "ลิงก์วิดีโอ (เพิ่มส่วนได้)" : "Video Links (add as many sections as needed)"}</label>
                  <p className="text-xs text-text-muted mb-3">{isZh ? "留空的部分不会显示在播放器" : locale === "th" ? "ส่วนที่เว้นว่างจะไม่แสดง" : "Empty sections won't appear in the player"}</p>
                  {Array.from({ length: sectionCount }, (_, i) => {
                    const existingUrls = (editingEp?.videoUrl || "").split("\n").filter(Boolean);
                    return (
                      <div key={i} className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-text-muted w-16 shrink-0">
                          {isZh ? `第${i+1}部分` : locale === "th" ? `ส่วน ${i+1}` : `Part ${i+1}`}
                        </span>
                        <input
                          name={`sectionUrl${i}`}
                          defaultValue={existingUrls[i] || ""}
                          placeholder={isZh ? `粘贴第${i+1}部分链接...` : `Paste Part ${i+1} URL...`}
                          className="flex-1 px-3 py-2 rounded-lg border text-sm"
                        />
                        {sectionCount > 1 && (
                          <button type="button" onClick={() => setSectionCount(c => c - 1)}
                            className="p-1 text-text-muted hover:text-error shrink-0" title={isZh ? "移除此部分" : "Remove"}>
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                  <button type="button" onClick={() => setSectionCount(c => c + 1)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-background border text-xs rounded-lg hover:bg-white transition-colors">
                    <Plus size={12} /> {isZh ? "添加Section" : locale === "th" ? "เพิ่มส่วน" : "Add Section"}
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">{isZh ? "或上传视频文件（会填入Section链接中）" : "Or upload video files (appended to sections)"}</label>
                  <input type="file" accept="video/*" multiple className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary-dark" />
                </div>
                <input name="description" defaultValue={editingEp?.description || ""} placeholder="Description (optional)" className="w-full px-3 py-2 rounded-lg border text-sm" />
                <div className="flex gap-2">
                  <button type="submit" disabled={uploading} className="flex items-center gap-1 px-4 py-2 bg-accent text-white text-sm rounded-lg disabled:opacity-50">
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : (editingEp ? <Save size={14} /> : <Plus size={14} />)}
                    {uploading ? (isZh ? "上传中..." : "Uploading...") : editingEp ? (isZh ? "保存" : "Save") : "Add Episode"}
                  </button>
                  <button type="button" onClick={() => { setShowEpForm(false); setEditingEp(null); }} className="px-4 py-2 bg-white border text-sm rounded-lg">{isZh ? "取消" : "Cancel"}</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {tab === "feedback" && (
        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="p-4 border-b bg-background font-bold">{isZh ? `意见反馈 (${feedbacks?.length || 0})` : locale === "th" ? `ข้อเสนอแนะ (${feedbacks?.length || 0})` : `Feedback (${feedbacks?.length || 0})`}</div>
          {(!feedbacks || feedbacks.length === 0) ? (
            <div className="p-12 text-center text-text-muted">{isZh ? "还没有反馈" : locale === "th" ? "ยังไม่มีข้อเสนอแนะ" : "No feedback yet"}</div>
          ) : (
            feedbacks.map((f: any) => {
              const typeLabel: Record<string, string> = { bug: "🐛 Bug", feature: "💡 Feature", content: "📝 Content", translation: "🌐 Translation", collaboration: "🤝 Collaboration", general: "💬 General" };
              const statusLabel: Record<string, string> = { pending: isZh ? "待处理" : "Pending", read: isZh ? "已读" : "Read", replied: isZh ? "已回复" : "Replied", resolved: isZh ? "已解决" : "Resolved" };
              const statusColor: Record<string, string> = { pending: "bg-warning/10 text-warning", read: "bg-blue-50 text-blue-600", replied: "bg-accent/10 text-accent", resolved: "bg-green-50 text-green-600" };
              return (
                <div key={f.id} className="p-4 border-b last:border-0 hover:bg-background/50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary-light">{typeLabel[f.type] || f.type}</span>
                        <span className="font-semibold text-sm">{f.subject}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusColor[f.status] || ""}`}>{statusLabel[f.status] || f.status}</span>
                      </div>
                      <p className="text-xs text-text-secondary whitespace-pre-wrap mb-1">{f.message}</p>
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        {f.user && <span>👤 {f.user.username}</span>}
                        {f.contact && <span>📧 {f.contact}</span>}
                        <span>{new Date(f.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0 ml-3">
                      {f.status !== "read" && (
                        <form action={async (fd: FormData) => { fd.append("feedbackId", f.id); fd.append("status", "read"); await updateFeedbackStatus(fd); }}>
                          <button className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100">{isZh ? "标记已读" : "Read"}</button>
                        </form>
                      )}
                      {f.status !== "resolved" && (
                        <form action={async (fd: FormData) => { fd.append("feedbackId", f.id); fd.append("status", "resolved"); await updateFeedbackStatus(fd); }}>
                          <button className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100">✓ {isZh ? "解决" : "Resolve"}</button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === "site" && (
        <div className="bg-white rounded-2xl border p-6 space-y-6">
          <h3 className="font-bold text-lg">{locale === "zh" || locale === "zht" || locale === "yue" ? "站点设置" : "Site Settings"}</h3>
          <div>
            <p className="text-sm font-medium mb-2">{locale === "zh" || locale === "zht" || locale === "yue" ? "网站 Logo" : "Site Logo"}</p>
            <p className="text-xs text-text-muted mb-3">{locale === "zh" || locale === "zht" || locale === "yue" ? "上传图片作为网站左上角 Logo" : "Upload an image to use as the site logo in the header"}</p>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const input = form.querySelector('input[type=file]') as HTMLInputElement;
              if (!input?.files?.length) return;
              setUploading(true);
              setUploadMsg("");
              const fd = new FormData();
              fd.append('file', input.files[0]);
              try {
                const res = await fetch('/api/upload', { method: 'POST', body: fd });
                const data = await res.json();
                const logoUrl = data.files?.[0]?.url;
                if (logoUrl) {
                  await setSiteSetting('site_logo', logoUrl);
                  setSiteLogo(logoUrl);
                  setUploadMsg(locale === 'zh' || locale === 'zht' || locale === 'yue' ? '✅ Logo 已更新！' : '✅ Logo updated!');
                } else {
                  setUploadMsg(locale === 'zh' || locale === 'zht' || locale === 'yue' ? '上传失败' : 'Upload failed');
                }
              } catch (err: any) {
                setUploadMsg('Error: ' + (err.message || 'upload failed'));
              }
              setUploading(false);
            }}>
              <input type="file" accept="image/*" className="mb-2 text-sm" />
              <button type="submit" disabled={uploading} className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-xl disabled:opacity-50">
                {uploading ? (locale === "zh" || locale === "zht" || locale === "yue" ? "上传中..." : "Uploading...") : (locale === "zh" || locale === "zht" || locale === "yue" ? "上传并设为 Logo" : "Upload as Logo")}
              </button>
              {uploadMsg && <span className="ml-3 text-sm text-accent">{uploadMsg}</span>}
            </form>
            {siteLogo && (
              <div className="mt-4">
                <p className="text-xs text-text-muted mb-2">{locale === "zh" || locale === "zht" || locale === "yue" ? "当前 Logo：" : "Current logo:"}</p>
                <img src={siteLogo} alt="Site Logo" className="w-16 h-16 object-contain rounded-xl border" />
              </div>
            )}
          </div>

          {/* Welcome message — merged from old welcome tab */}
          {welcomeMsg !== undefined && (
            <div>
              <h3 className="font-bold text-lg mb-4">{locale === "zh" || locale === "zht" || locale === "yue" ? "欢迎消息" : "Welcome Message"}</h3>
              <form action={async (fd: FormData) => { await updateWelcomeMessage(fd); }} className="space-y-3">
                <textarea name="contentEn" defaultValue={welcomeMsg?.contentEn || ""} placeholder="English" className="w-full px-3 py-2 rounded-lg border text-sm" rows={3} required />
                <div className="grid grid-cols-2 gap-2">
                  <textarea name="contentZh" defaultValue={welcomeMsg?.contentZh || ""} placeholder="简体中文" className="w-full px-3 py-2 rounded-lg border text-sm" rows={3} />
                  <textarea name="contentZht" defaultValue={welcomeMsg?.contentZht || ""} placeholder="繁體中文" className="w-full px-3 py-2 rounded-lg border text-sm" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <textarea name="contentYue" defaultValue={welcomeMsg?.contentYue || ""} placeholder="粵語" className="w-full px-3 py-2 rounded-lg border text-sm" rows={3} />
                  <textarea name="contentTh" defaultValue={welcomeMsg?.contentTh || ""} placeholder="ไทย" className="w-full px-3 py-2 rounded-lg border text-sm" rows={3} />
                </div>
                <button type="submit" className="flex items-center gap-1 px-4 py-2 bg-accent text-white text-sm rounded-lg"><Save size={14} />{locale === "zh" || locale === "zht" || locale === "yue" ? "保存" : "Save"}</button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
