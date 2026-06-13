"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Image, X, Download, Play, MessageCircle, Send, Camera, Star, Palette, Film, Archive, Heart, Video, ImageIcon } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { createGalleryComment, getGalleryComments } from "@/lib/actions";

const CATEGORIES = [
  { key: "all", icon: Image, label: { en: "All", zh: "全部", zht: "全部", yue: "全部", th: "ทั้งหมด" } },
  { key: "mv", icon: Video, label: { en: "MV", zh: "MV", zht: "MV", yue: "MV", th: "MV" } },
  { key: "vlog", icon: Film, label: { en: "Vlog", zh: "Vlog", zht: "Vlog", yue: "Vlog", th: "Vlog" } },
  { key: "live", icon: Video, label: { en: "LIVE", zh: "直播", zht: "直播", yue: "直播", th: "ไลฟ์" } },
  { key: "gif", icon: ImageIcon, label: { en: "GIFs", zh: "GIF", zht: "GIF", yue: "GIF", th: "GIF" } },
  { key: "official", icon: Star, label: { en: "Official", zh: "官方", zht: "官方", yue: "官方", th: "ทางการ" } },
  { key: "memory", icon: Archive, label: { en: "Memories", zh: "回忆", zht: "回憶", yue: "回憶", th: "ความทรงจำ" } },
  { key: "fanart", icon: Palette, label: { en: "Fanart", zh: "饭绘", zht: "飯繪", yue: "飯繪", th: "แฟนอาร์ต" } },
];

const DRAMA_SERIES = [
  { key: "all", label: { en: "All Dramas", zh: "全部剧集", zht: "全部劇集", yue: "全部劇集", th: "ทั้งหมด" } },
  { key: "bemine", icon: "💜", label: { en: "Be Mine", zh: "Be Mine", zht: "Be Mine", yue: "Be Mine", th: "Be Mine" } },
  { key: "lovebound", icon: "💚", label: { en: "Love Bound", zh: "Love Bound", zht: "Love Bound", yue: "Love Bound", th: "Love Bound" } },
  { key: "apple", icon: "🍎", label: { en: "Apple My Love", zh: "Apple", zht: "Apple", yue: "Apple", th: "Apple" } },
  { key: "crush", icon: "💥", label: { en: "Crush The Series", zh: "Crush", zht: "Crush", yue: "Crush", th: "Crush" } },
  { key: "ladysbodyguard", icon: "🛡️", label: { en: "My Lady's Bodyguard", zh: "Bodyguard", zht: "Bodyguard", yue: "Bodyguard", th: "Bodyguard" } },
  { key: "kimbap", icon: "🍙", label: { en: "Kimbap", zh: "Kimbap", zht: "Kimbap", yue: "Kimbap", th: "Kimbap" } },
];

const DRAMA_TAG_KEYS = new Set(DRAMA_SERIES.filter(d => d.key !== "all").map(d => d.key));

const CAT_LABEL_MAP: Record<string, Record<string, string>> = {
  photo: { en: "Photo", zh: "照片", zht: "照片", yue: "相片", th: "รูปภาพ" },
  video: { en: "Video", zh: "视频", zht: "影片", yue: "影片", th: "วิดีโอ" },
  gif: { en: "GIF", zh: "GIF", zht: "GIF", yue: "GIF", th: "GIF" },
  mv: { en: "MV", zh: "MV", zht: "MV", yue: "MV", th: "MV" },
  vlog: { en: "Vlog", zh: "Vlog", zht: "Vlog", yue: "Vlog", th: "Vlog" },
  live: { en: "LIVE", zh: "直播", zht: "直播", yue: "直播", th: "ไลฟ์" },
  official: { en: "Official", zh: "官方", zht: "官方", yue: "官方", th: "ทางการ" },
  event_photo: { en: "Event", zh: "活动", zht: "活動", yue: "活動", th: "กิจกรรม" },
  memory: { en: "Memory", zh: "回忆", zht: "回憶", yue: "回憶", th: "ความทรงจำ" },
  fanart: { en: "Fanart", zh: "饭绘", zht: "飯繪", yue: "飯繪", th: "แฟนอาร์ต" },
  drama_still: { en: "Drama", zh: "剧照", zht: "劇照", yue: "劇照", th: "ภาพซีรีส์" },
  daily: { en: "Daily", zh: "日常", zht: "日常", yue: "日常", th: "ทั่วไป" },
  kimbap: { en: "Kimbap", zh: "Kimbap", zht: "Kimbap", yue: "Kimbap", th: "Kimbap" },
};

const TAG_EMOJI: Record<string, string> = {
  orm: "🌟", folk: "🦋", both: "🏳️‍🌈",
  vlog: "🎬", mv: "🎵", livestream: "🔴",
  bemine: "💜", lovebound: "💚", apple: "🍎", crush: "💥", ladysbodyguard: "🛡️", kimbap: "🍙",
};
const TAG_NAME: Record<string, string> = {
  orm: "Ormsin", folk: "Folk", both: "OrmFolk",
  vlog: "Vlog", mv: "MV", livestream: "LIVE",
  bemine: "Be Mine", lovebound: "Love Bound", apple: "Apple", crush: "Crush", ladysbodyguard: "Bodyguard", kimbap: "Kimbap",
};

function isVideoFile(url: string): boolean { return /\.(mp4|webm|mov|avi|mkv)$/i.test(url); }
function getYoutubeId(url: string): string { const m = url.match(/(?:youtu\.be\/|watch\?v=|\/embed\/)([a-zA-Z0-9_-]{11})/); return m?.[1] || url; }
function getBvid(url: string): string { const m = url.match(/BV[a-zA-Z0-9]{10}/); return m?.[0] || url; }

export default function GalleryClient({ items, allTags }: { items: any[]; allTags: string[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const { data: session } = useSession();
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [lightboxId, setLightboxId] = useState<string | null>(null);
  const [lightboxComments, setLightboxComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [actorFilter, setActorFilter] = useState<string>("all");
  const [dramaFilter, setDramaFilter] = useState<string>("all");
  const [mediaFilter, setMediaFilter] = useState<"all" | "photo" | "video">("all");

  const isZh = locale === "zh" || locale === "zht" || locale === "yue";
  const isTh = locale === "th";

  const filtered = items.filter((item: any) => {
    const matchCat = category === "all" ||
      item.category === category ||
      (category === "official" && item.category === "event_photo") ||
      (category === "mv" && item.tag === "mv") ||
      (category === "vlog" && item.tag === "vlog") ||
      (category === "live" && (item.tag === "livestream" || item.category === "live")) ||
      (category === "memory" && (item.category === "memory" || item.category === "daily")) ||
      (category === "gif" && (item.category === "gif" || item.url?.toLowerCase().endsWith(".gif")));
    const matchActor = actorFilter === "all" || item.tag === actorFilter || (actorFilter === "both" && (!item.tag || item.tag === "both"));
    const matchDrama = dramaFilter === "all" || item.tag === dramaFilter;
    const matchMedia = mediaFilter === "all" || (mediaFilter === "video" ? !!item.videoUrl : !item.videoUrl);
    return matchCat && matchMedia && matchDrama && matchActor;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <Link href={`/${locale}`} className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors mb-4">
        <ArrowLeft size={16} />
        {isZh ? "返回" : isTh ? "กลับ" : "Back"}
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-3">
          {isZh ? "相册" : isTh ? "อัลบั้ม" : "Albums"}
        </h1>
        <p className="text-text-secondary text-lg">
          {isZh ? "记录每一个值得珍藏的瞬间" : isTh ? "บันทึกทุกช่วงเวลาที่ควรค่าแก่การเก็บรักษา" : "Preserving every precious moment worth keeping"}
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-1.5 mb-8 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button key={cat.key} onClick={() => setCategory(cat.key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              category === cat.key ? "bg-accent text-white shadow-sm" : "bg-white border text-text-secondary hover:border-accent"
            }`}>
            <cat.icon size={15} />
            {cat.label[locale as keyof typeof cat.label.en] || cat.label.en}
          </button>
        ))}
      </div>

      {/* Actor tag filter */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-text-muted shrink-0">{isZh ? "人物：" : isTh ? "บุคคล:" : "Actor:"}</span>
        <div className="flex flex-wrap gap-1.5">
          {([
            { key: "all", label: { en: "All", zh: "全部", zht: "全部", yue: "全部", th: "ทั้งหมด" }, emoji: "" },
            { key: "both", label: { en: "OrmFolk", zh: "OrmFolk", zht: "OrmFolk", yue: "OrmFolk", th: "OrmFolk" }, emoji: "🏳️‍🌈" },
            { key: "orm", label: { en: "Ormsin", zh: "Ormsin", zht: "Ormsin", yue: "Ormsin", th: "ออมสิน" }, emoji: "🌟" },
            { key: "folk", label: { en: "Folk", zh: "Folk", zht: "Folk", yue: "Folk", th: "โฟล์ค" }, emoji: "🦋" },
          ]).map(({ key, label, emoji }) => (
            <button key={key} onClick={() => setActorFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${actorFilter === key ? "bg-accent text-white" : "bg-white border text-text-secondary hover:border-accent"}`}>
              {emoji} {label[locale as keyof typeof label.en] || label.en}
            </button>
          ))}
        </div>
      </div>

      {/* Media type filter */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-text-muted">{isZh ? "类型：" : isTh ? "ประเภท:" : "Type:"}</span>
        <div className="flex bg-background border rounded-lg p-0.5">
          {([
            { key: "all", icon: ImageIcon, label: { en: "All", zh: "全部", zht: "全部", yue: "全部", th: "ทั้งหมด" } },
            { key: "photo", icon: Camera, label: { en: "Photos", zh: "照片", zht: "照片", yue: "相片", th: "รูปภาพ" } },
            { key: "video", icon: Video, label: { en: "Videos", zh: "视频", zht: "視頻", yue: "影片", th: "วิดีโอ" } },
          ] as const).map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => setMediaFilter(key)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${mediaFilter === key ? "bg-accent text-white shadow-sm" : "text-text-secondary hover:text-text-primary"}`}>
              <Icon size={13} /> {label[locale as keyof typeof label.en] || label.en}
            </button>
          ))}
        </div>
      </div>

      {/* Drama series sub-filter */}
      {(
        <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
          <span className="text-xs text-text-muted shrink-0">🎬</span>
          {DRAMA_SERIES.map((d) => (
            <button key={d.key} onClick={() => setDramaFilter(d.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${dramaFilter === d.key ? "bg-accent text-white" : "bg-white border text-text-secondary hover:border-accent"}`}>
              {d.icon} {d.label[locale as keyof typeof d.label.en] || d.label.en}
            </button>
          ))}
        </div>
      )}

      {/* Gallery grid */}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Archive size={48} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-muted">
            {isZh ? "这里还没有回忆，快来添加第一个吧！" : isTh ? "ยังไม่มีความทรงจำที่นี่" : "No memories here yet — be the first to add one!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item: any) => (
            <div
              key={item.id}
              className={`group relative aspect-square rounded-xl overflow-hidden bg-background border cursor-pointer transition-all hover:shadow-lg ${item.featured ? "ring-2 ring-accent ring-offset-2" : ""}`}
              onClick={() => {
                const url = item.videoUrl || item.url;
                setLightbox(url);
                setLightboxId(item.id);
                getGalleryComments(item.id).then(setLightboxComments).catch(() => {});
              }}
            >
              {item.videoUrl || isVideoFile(item.url) ? (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 relative flex items-center justify-center">
                  {isVideoFile(item.url) ? (
                    <video src={`${item.url}#t=0.5`} className="absolute inset-0 w-full h-full object-cover" muted playsInline preload="metadata" />
                  ) : (
                    <img src={item.url} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                  )}
                  {/* Always-visible play button */}
                  <div className="relative z-10 w-14 h-14 rounded-full bg-accent/90 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-accent transition-all">
                    <Play size={24} fill="white" className="text-white ml-0.5" />
                  </div>
                  {/* Video indicator */}
                  <span className="absolute bottom-2 left-2 z-10 text-[10px] text-white bg-black/55 px-1.5 py-0.5 rounded-full font-medium">
                    {item.url.split('.').pop()?.toUpperCase()}
                  </span>
                </div>
              ) : (
                <img src={item.url} alt={item.caption || ""} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <a href={item.url} download target="_blank" rel="noreferrer"
                className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                onClick={(e) => e.stopPropagation()}>
                <Download size={14} />
              </a>
              {/* Category badge — always visible */}
              {item.category && (
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/55 backdrop-blur-sm text-white text-[11px] rounded-full font-semibold shadow-sm">
                  {CAT_LABEL_MAP[item.category]?.[isZh ? "zh" : isTh ? "th" : "en"] || item.category}
                </div>
              )}
              {/* Actor/Drama tag — hide if same as category to avoid duplicate */}
              {item.tag && TAG_EMOJI[item.tag] && item.tag !== item.category && (
                <div className={`absolute ${item.category ? "top-8" : "top-2"} left-2 px-1.5 py-0.5 bg-black/55 backdrop-blur-sm text-white text-[11px] rounded-full font-semibold shadow-sm`}>
                  {TAG_EMOJI[item.tag]} {TAG_NAME[item.tag] || item.tag}
                </div>
              )}
              {/* Featured */}
              {item.featured && (
                <div className="absolute top-2 right-8 px-1.5 py-0.5 bg-accent text-white text-[10px] rounded-full font-bold flex items-center gap-1">
                  <Star size={9} />
                </div>
              )}
              {item.user && (
                <div className="absolute bottom-2 left-2 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.user.username}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox (same as before) */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => { setLightbox(null); setLightboxId(null); setLightboxComments([]); }}>
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            {!lightbox.includes("youtube") && !lightbox.includes("bilibili") && (
              <a href={lightbox} download target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors" onClick={(e) => e.stopPropagation()}>
                <Download size={20} />
              </a>
            )}
            <button onClick={() => { setLightbox(null); setLightboxId(null); setLightboxComments([]); }} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="flex gap-4 max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex-1 flex items-center justify-center">
              {lightbox.includes("youtube") || lightbox.includes("bilibili") ? (
                <iframe src={lightbox.includes("youtube") ? `https://www.youtube.com/embed/${getYoutubeId(lightbox)}?autoplay=1` : `https://player.bilibili.com/player.html?bvid=${getBvid(lightbox)}&autoplay=1&danmaku=0`} className="w-full aspect-video rounded-xl" allow="autoplay; fullscreen" />
              ) : isVideoFile(lightbox) ? (
                <video src={lightbox} controls autoPlay className="max-w-full max-h-[85vh] rounded-xl" />
              ) : (
                <img src={lightbox} alt="" className="max-w-full max-h-[85vh] rounded-xl object-contain" />
              )}
            </div>
            <div className="w-72 shrink-0 bg-white rounded-xl p-4 flex flex-col max-h-[85vh] overflow-hidden">
              <h3 className="font-bold text-sm text-text-primary mb-3 flex items-center gap-1.5">
                <MessageCircle size={14} /> {isZh ? "评论" : isTh ? "ความคิดเห็น" : "Comments"} ({lightboxComments.length})
              </h3>
              <div className="flex-1 overflow-y-auto space-y-2 mb-3">
                {lightboxComments.length === 0 ? (
                  <p className="text-xs text-text-muted text-center py-4">{isZh ? "暂无评论" : "No comments yet"}</p>
                ) : (
                  lightboxComments.map((c: any) => (
                    <div key={c.id} className="text-xs">
                      <span className="font-semibold text-text-primary">{c.author?.username || "?"}</span>
                      <span className="text-text-secondary ml-1">{c.content}</span>
                    </div>
                  ))
                )}
              </div>
              {session && (
                <form onSubmit={async (e) => { e.preventDefault(); if (!commentText.trim() || !lightboxId) return; const fd = new FormData(); fd.append("galleryItemId", lightboxId); fd.append("content", commentText); await createGalleryComment(fd); setCommentText(""); getGalleryComments(lightboxId).then(setLightboxComments); }} className="flex gap-2">
                  <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder={isZh ? "说点什么..." : "Say something..."} className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-border" />
                  <button type="submit" className="p-1.5 bg-accent text-white rounded-lg"><Send size={12} /></button>
                </form>
              )}
              {!session && (
                <Link href={`/${locale}/login`} className="text-xs text-accent text-center hover:underline">
                  {isZh ? "登录后评论" : "Login to comment"}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
