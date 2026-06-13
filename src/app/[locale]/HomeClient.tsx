"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Heart, Clock, MessageCircle, Palette, Calendar, MapPin, Globe,
  PenLine, Users, FileText, Sparkles, ArrowRight, ChevronRight, Star, Search, Image, Trophy, BookOpen, Megaphone, Upload,
} from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { toTraditional } from "@/lib/s2t";
import ActorCards from "@/components/features/ActorCards";

// QR codes (locked — loaded from site settings)
const LINE_QRS: Record<string, string> = {
  line_qr_1: "/uploads/1780316012273-fj4c5.png",
  line_qr_2: "/uploads/1780316016888-pzcorfa.jpg",
  line_qr_3: "/uploads/1780316019090-axkwz8.jpg",
};
function QRImage({ qrKey }: { qrKey: string; locale: string }) {
  const src = LINE_QRS[qrKey];
  return src
    ? <img src={src} alt="QR Code" className="w-full h-full object-contain p-2 cursor-pointer hover:scale-105 transition-transform" onClick={() => window.open(src, '_blank')} />
    : <span className="text-xs text-text-muted">QR</span>;
}
import EventCountdown from "@/components/features/EventCountdown";

type Props = { data: any };

export default function HomeClient({ data }: Props) {
  const t = useTranslations("home");
  const tn = useTranslations("nav");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { data: session } = useSession();
  const isZh = locale === "zh" || locale === "zht" || locale === "yue";
  const isTC = locale === "zht" || locale === "yue";
  const levelBadge = (level: number) => {
    if (!level || level < 2) return null;
    if (level <= 3) return <span className="px-1 py-0 bg-blue-50 text-blue-600 text-[10px] rounded font-bold ml-1">Lv{level}</span>;
    if (level <= 6) return <span className="px-1 py-0 bg-yellow-50 text-yellow-700 text-[10px] rounded font-bold ml-1">Lv{level}</span>;
    if (level <= 9) return <span className="px-1 py-0 bg-purple-50 text-purple-600 text-[10px] rounded font-bold ml-1">Lv{level}</span>;
    return <span className="px-1 py-0 bg-amber-50 text-amber-700 text-[10px] rounded font-bold ml-1">Lv{level}</span>;
  };
  const isTh = locale === "th";
  const initialXP = (session?.user as any)?.xp || 0;
  const initialLevel = (session?.user as any)?.level || 1;
  const [userXP, setUserXP] = useState(initialXP);
  const [userLevel, setUserLevel] = useState(initialLevel);

  // Sync from session when it loads/changes
  useEffect(() => {
    const u = session?.user as any;
    if (u) {
      setUserXP(u.xp || 0);
      setUserLevel(u.level || 1);
    }
  }, [session]);

  const xpForNext = [0, 10, 30, 60, 100, 160, 240, 350, 500, 700, 1000, 1500, 2200, 3200, 4500, 6200, 8500, 11500, 15500, 21000];
  const currentLevelXP = xpForNext[Math.min(userLevel - 1, xpForNext.length - 1)] || 0;
  const nextLevelXP = xpForNext[userLevel] || xpForNext[xpForNext.length - 1];
  const xpProgress = userLevel >= xpForNext.length ? 100 : Math.min(100, Math.round(((userXP - currentLevelXP) / (nextLevelXP - currentLevelXP || 1)) * 100));

  const { forumPosts, creations, events, stats, announcements } = data;
  const [announcementsDisplay, setAnnouncementsDisplay] = useState(announcements);
  // Convert Simplified → Traditional for zht/yue
  useEffect(() => {
    if (locale === "zht" || locale === "yue") {
      Promise.all(announcements.map(async (a: any) => ({
        ...a,
        titleZh: a.titleZh ? await toTraditional(a.titleZh) : a.titleZh,
        contentZh: a.contentZh ? await toTraditional(a.contentZh) : a.contentZh,
      }))).then(setAnnouncementsDisplay);
    } else {
      setAnnouncementsDisplay(announcements);
    }
  }, [locale, announcements]);
  const featuredCreation = creations[0];
  const latestPosts = forumPosts.slice(0, 3);
  const upcomingEvents = events.slice(0, 2);
  

  const modules = [
    { href: "/timeline", icon: Clock, color: "from-primary to-primary-dark", bgColor: "bg-primary-light", label: tn("timeline"), desc: { en: "Explore the journey of Ormsin & Folk", zh: "回顾 Ormsin 与 Folk 的成长之路", zht: "回顧 Ormsin 與 Folk 的成長之路", yue: "回顧 Ormsin 同 Folk 嘅成長之路", th: "สำรวจเส้นทางของออมสินและโฟล์ค" } },
    { href: "/forum", icon: MessageCircle, color: "from-secondary-dark to-accent", bgColor: "bg-secondary-light", label: tn("forum"), desc: { en: "Discuss, share, and connect with fans", zh: "与全球粉丝讨论分享", zht: "與全球粉絲討論分享", yue: "同全球粉絲討論分享", th: "พูดคุย แบ่งปัน เชื่อมต่อกับแฟนๆ" } },
    { href: "/creations", icon: Palette, color: "from-accent to-primary-dark", bgColor: "bg-primary-light", label: tn("creations"), desc: { en: "Showcase your fan art and creativity", zh: "展示你的创作才华", zht: "展示你的創作才華", yue: "展示你嘅創作才華", th: "แสดงผลงานสร้างสรรค์ของคุณ" } },
    { href: "/calendar", icon: Calendar, color: "from-secondary to-accent", bgColor: "bg-secondary-light", label: tn("calendar"), desc: { en: "Never miss a single moment", zh: "不错过每个重要时刻", zht: "不錯過每個重要時刻", yue: "唔好錯過每個重要時刻", th: "ไม่พลาดทุกช่วงเวลาสำคัญ" } },
    { href: "/map", icon: MapPin, color: "from-primary-dark to-accent", bgColor: "bg-primary-light", label: tn("map"), desc: { en: "See where fans are worldwide", zh: "看看世界各地的同好", zht: "看看世界各地的同好", yue: "睇吓世界各地嘅同好", th: "ดูว่าแฟนๆ อยู่ที่ไหนบ้าง" } },
    { href: "/wall", icon: PenLine, color: "from-secondary-dark to-secondary", bgColor: "bg-secondary-light", label: tn("wall"), desc: { en: "Share stories and blessings", zh: "分享故事与祝福", zht: "分享故事與祝福", yue: "分享故事同祝福", th: "แบ่งปันเรื่องราวและคำอวยพร" } },
    { href: "/gallery", icon: Image, color: "from-primary to-primary-dark", bgColor: "bg-primary-light", label: isTh ? "อัลบั้ม" : isZh ? "相册" : "Albums", desc: { en: "Preserving every precious moment", zh: "记录每一个值得珍藏的瞬间", zht: "記錄每一個值得珍藏的瞬間", yue: "記錄每一個值得珍藏嘅瞬間", th: "บันทึกทุกช่วงเวลาอันมีค่า" } },
    { href: "/leaderboard", icon: Trophy, color: "from-secondary to-accent", bgColor: "bg-secondary-light", label: isTh ? "อันดับ" : isTC ? "排行榜" : isZh ? "排行榜" : "Top", desc: { en: "See top users and posts", zh: "查看活跃用户和热帖", zht: "查看活躍用戶和熱帖", yue: "查看活躍用戶同熱門貼文", th: "ดูผู้ใช้ยอดนิยมและโพสต์" } },
    { href: "/guide", icon: BookOpen, color: "from-primary to-secondary", bgColor: "bg-primary-light", label: isTh ? "คู่มือ" : isTC ? "新粉指南" : isZh ? "新粉指南" : "Guide", desc: { en: "Everything new fans need", zh: "新人入坑必看指南", zht: "新人入坑必看指南", yue: "新人入坑必睇指南", th: "คู่มือแฟนใหม่" } },
    { href: "/search", icon: Search, color: "from-accent to-primary-dark", bgColor: "bg-primary-light", label: isTh ? "ค้นหา" : isTC ? "搜尋" : isZh ? "搜索" : "Search", desc: { en: "Find posts and content", zh: "搜索帖子和内容", zht: "搜尋貼文和內容", yue: "搜尋貼文同內容", th: "ค้นหาโพสต์และเนื้อหา" } },
  ];

  function getLocalized(obj: any, field: string, loc: string): string {
    const key = `${field}_${loc}`;
    if (typeof key === "string" && obj[key]) return obj[key];
    // For DB data: titleEn, titleZh, titleTh or nameEn, nameZh, nameTh
    const capitalized = field.charAt(0).toUpperCase() + field.slice(1);
    const langKey = `${field}${capitalized === "Title" ? "En" : "En"}`;
    const key2 = `${field}${loc === "en" ? "En" : (loc === "zh" || loc === "zht" || loc === "yue") ? "Zh" : "Th"}`;
    if (obj[key2]) return obj[key2];
    return obj[field]?.en ?? obj[field] ?? obj.titleEn ?? obj.nameEn ?? "";
  }

  function getDesc(obj: any, loc: string): string {
    return obj.desc?.[loc] ?? obj.desc?.en ?? obj.descriptionEn ?? "";
  }

  function getTitle(obj: any, loc: string): string {
    const key = `title${loc === "en" ? "En" : (loc === "zh" || loc === "zht" || loc === "yue") ? "Zh" : "Th"}`;
    return obj[key] ?? obj.titleEn ?? obj.title ?? "";
  }

  function getDescription(obj: any, loc: string): string {
    const key = `description${loc === "en" ? "En" : (loc === "zh" || loc === "zht" || loc === "yue") ? "Zh" : "Th"}`;
    return obj[key] ?? obj.descriptionEn ?? obj.description ?? "";
  }

  return (
    <div>
      {/* ========== HERO SECTION ========== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-light via-secondary-light to-background">
        <div className="absolute top-10 left-10 w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-float" />
        <div className="absolute top-20 right-16 w-32 h-32 bg-secondary/20 rounded-full blur-2xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-10 left-1/4 w-20 h-20 bg-accent/15 rounded-full blur-xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-secondary-dark/20 rounded-full blur-xl animate-float" style={{ animationDelay: "1.5s" }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-primary-light mb-6">
              <span className="text-sm">🏳️‍🌈</span>
              <span className="text-xs font-semibold text-accent uppercase tracking-wide">
                #Ormfolk
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              <span className="rainbow-text">{t("hero_title")}</span>
            </h1>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-6 leading-relaxed" style={{ color: "#4A6A80" }}>
              {t("hero_desc")}
            </p>
            {/* Pride Month — remove after June */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rainbow/5 rounded-full text-xs text-text-muted mb-8">
              🏳️‍🌈 {isTh ? "สุขสันต์เดือนไพรด์!" : isTC ? "驕傲月快樂！" : isZh ? "骄傲月快乐！" : "Happy Pride Month!"} 🏳️‍🌈
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {session ? (
                <>
                  <Link
                    href={`/${locale}/forum`}
                    className="px-8 py-3.5 bg-accent hover:bg-primary-dark text-white font-semibold rounded-2xl shadow-lg shadow-accent/25 transition-all hover:shadow-xl hover:shadow-accent/30 flex items-center gap-2 animate-pulse-glow"
                  >
                    <MessageCircle size={18} />
                    {isTh ? "เข้าร่วมสนทนา" : isTC ? "參與討論" : isZh ? "参与讨论" : "Join Discussion"}
                  </Link>
                  <Link
                    href={`/${locale}/forum/new`}
                    className="px-8 py-3.5 bg-white hover:bg-background text-text-primary font-semibold rounded-2xl border border-border shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                  >
                    <PenLine size={18} />
                    {isTh ? "เขียนโพสต์" : isTC ? "發佈帖子" : isZh ? "发布帖子" : "Write a Post"}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={`/${locale}/login?mode=signup`}
                    className="px-8 py-3.5 bg-accent hover:bg-primary-dark text-white font-semibold rounded-2xl shadow-lg shadow-accent/25 transition-all hover:shadow-xl hover:shadow-accent/30 flex items-center gap-2 animate-pulse-glow"
                  >
                    <Heart size={18} fill="white" />
                    {t("join_btn")}
                  </Link>
                  <Link
                    href={`/${locale}/timeline`}
                    className="px-8 py-3.5 bg-white hover:bg-background text-text-primary font-semibold rounded-2xl border border-border shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                  >
                    {t("explore_btn")}
                    <ArrowRight size={18} />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========== LINE QR CODES ========== */}
      {session && (
        <section className="bg-white border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="text-center mb-6">
              <h3 className="text-lg font-extrabold text-text-primary">
                {isTh ? "เข้าร่วมกลุ่ม LINE" : isTC ? "加入 LINE 粉絲群" : isZh ? "加入 LINE 粉丝群" : "Join LINE Fan Groups"}
              </h3>
              <p className="text-sm text-text-muted mt-1">
                {isTh ? "สแกนเพื่อเข้าร่วม" : isTC ? "掃碼加入 OrmFolk 粉絲社群" : isZh ? "扫码加入 OrmFolk 粉丝社区" : "Scan to join the OrmFolk community"}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
              {[
                { key: "line_qr_1", label: isTh ? "ทั่วไป" : isTC ? "綜合群" : isZh ? "综合群" : "General" },
                { key: "line_qr_2", label: isTh ? "ออมสิน" : isTC ? "Ormsin 群" : isZh ? "Ormsin 群" : "Ormsin" },
                { key: "line_qr_3", label: isTh ? "โฟล์ค" : isTC ? "Folk 群" : isZh ? "Folk 群" : "Folk" },
              ].map((qr) => (
                <div key={qr.key} className="text-center">
                  <div className="w-40 h-40 mx-auto rounded-2xl bg-background border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                    <QRImage qrKey={qr.key} locale={locale} />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-text-primary">{qr.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== STATS BAR ========== */}
      <section className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {session && (
            <div className="mb-4 p-4 bg-white rounded-2xl border border-border shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center text-white text-xl font-extrabold shadow-sm">
                  {(session.user?.name || "?")[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-text-primary">{session.user?.name}</span>
                    <span className="px-2 py-0.5 bg-accent/15 text-accent text-xs rounded-full font-bold">Lv{userLevel}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                    <span>⭐ {userXP} XP</span>
                  </div>
                  <div className="w-48 h-1.5 bg-border rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-secondary to-accent rounded-full transition-all" style={{width: xpProgress+'%'}} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, value: (stats?.members || 0).toLocaleString(), label: isTh ? "สมาชิก" : isTC ? "成員" : isZh ? "成员" : "Members", color: "text-primary-dark" },
              { icon: FileText, value: (stats?.posts || 0).toLocaleString(), label: isTh ? "โพสต์" : isTC ? "貼文" : isZh ? "帖子" : "Posts", color: "text-secondary-dark" },
              { icon: Palette, value: (stats?.creationsCount || 0).toLocaleString(), label: isTh ? "ผลงาน" : isTC ? "創作" : isZh ? "创作" : "Creations", color: "text-accent" },
              { icon: MessageCircle, value: (stats?.comments || 0).toLocaleString(), label: isTh ? "ความคิดเห็น" : isTC ? "評論" : isZh ? "评论" : "Comments", color: "text-secondary-dark" },
              { icon: MapPin, value: (stats?.countries || 0).toLocaleString(), label: isTh ? "ประเทศ" : isTC ? "國家" : isZh ? "国家" : "Countries", color: "text-primary" },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-background hover:bg-primary-light/30 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <stat.icon size={20} className={stat.color} />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-text-primary">{stat.value}</div>
                  <div className="text-xs text-text-muted">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== EVENT COUNTDOWN ========== */}
      {events.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
          <EventCountdown event={events[0]} />
        </section>
      )}

      {/* ========== MODULE GRID ========== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-3">
            {isTC ? "探索社群" : isZh ? "探索社区" : locale === "th" ? "สำรวจชุมชน" : "Explore the Community"}
          </h2>
          <p className="text-text-muted">
            {isTC ? "一切從這裡開始" : isZh ? "一切从这里开始" : locale === "th" ? "ทุกอย่างเริ่มต้นที่นี่" : "Everything starts here"}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((mod, i) => (
            <Link
              key={i}
              href={`/${locale}${mod.href}`}
              className="group relative p-6 bg-white rounded-2xl border border-border hover:border-primary-light shadow-sm card-hover"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md transition-shadow`}>
                <mod.icon size={22} className="text-white" />
              </div>
              <h3 className="font-bold text-lg text-text-primary mb-1">{mod.label}</h3>
              <p className="text-sm text-text-muted mb-4">{mod.desc[locale as keyof typeof mod.desc] ?? mod.desc.en}</p>
              <div className="flex items-center gap-1 text-sm font-semibold text-accent">
                {isTC ? "進入" : isZh ? "进入" : locale === "th" ? "เข้าไป" : "Explore"}
                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========== ACTOR PROFILES ========== */}
      <ActorCards />

      {/* ========== ANNOUNCEMENTS ========== */}
      {announcements && announcements.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone size={20} className="text-accent" />
            <h2 className="text-xl font-extrabold text-text-primary">
              {isTC ? "公告" : isZh ? "公告" : locale === "th" ? "ประกาศ" : "Announcements"}
            </h2>
          </div>
          <div className="grid gap-3">
            {announcementsDisplay.map((a: any) => (
              <AnnouncementCard key={a.id} announcement={a} locale={locale} isZh={isZh} isTC={isTC} />
            ))}
          </div>
        </section>
      )}

      {/* ========== LATEST + FEATURED ========== */}
      <section className="bg-white border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Latest Forum Posts */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold text-text-primary flex items-center gap-2">
                  <MessageCircle size={20} className="text-accent" />
                  {t("latest_updates")}
                </h2>
                <Link href={`/${locale}/forum`} className="text-sm font-semibold text-accent hover:text-primary-dark flex items-center gap-1 transition-colors">
                  {tc("more")}
                  <ChevronRight size={16} />
                </Link>
              </div>
              <div className="space-y-3">
                {latestPosts.map((post: any) => (
                  <Link
                    key={post.id}
                    href={`/${locale}/forum/${post.id}`}
                    className="block p-5 bg-background hover:bg-primary-light/20 rounded-2xl border border-border hover:border-primary-light transition-all"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">
                        {post.author?.username?.[0] || post.author?.name?.[0] || "?"}
                      </div>
                      <span className="text-xs text-text-muted">{post.author?.username || post.author?.name || "Anonymous"}</span>
                      {post.author?.level > 0 && levelBadge(post.author.level)}
                      <span className="text-xs text-text-muted">·</span>
                      <span className="text-xs text-text-muted">{timeAgo(post.createdAt)}</span>
                    </div>
                    <h3 className="font-semibold text-text-primary mb-1 line-clamp-1">{post.title}</h3>
                    <p className="text-sm text-text-secondary line-clamp-2 mb-3">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs text-text-muted">
                      <span className="flex items-center gap-1"><Heart size={12} className="text-red-400" fill="currentColor" /> {post.likeCount}</span>
                      <span className="flex items-center gap-1"><MessageCircle size={12} /> {post.commentCount}</span>
                      <span>{post.viewCount.toLocaleString()} views</span>
                    </div>
                  </Link>
                ))}
                {latestPosts.length === 0 && (
                  <div className="p-8 text-center text-text-muted">
                    {isTC ? "暫無帖子，成為第一個發帖的人吧！" : isZh ? "暂无帖子，成为第一个发帖的人吧！" : locale === "th" ? "ยังไม่มีโพสต์ เป็นคนแรกที่โพสต์!" : "No posts yet. Be the first to post!"}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Featured + Events */}
            <div className="space-y-8">
              {/* Featured Creation */}
              {featuredCreation && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
                      <Star size={18} className="text-secondary-dark" fill="currentColor" />
                      {t("featured_creation")}
                    </h2>
                  </div>
                  <Link
                    href={`/${locale}/creations`}
                    className="block p-5 bg-gradient-to-br from-secondary-light/50 to-primary-light/30 rounded-2xl border border-secondary-light hover:border-secondary transition-all card-hover"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white text-xs font-bold">
                        {featuredCreation.author?.username?.[0] || featuredCreation.author?.name?.[0] || "?"}
                      </div>
                      <span className="text-xs text-text-muted">{featuredCreation.author?.username || featuredCreation.author?.name || "Anonymous"}</span>
                    </div>
                    <h3 className="font-semibold text-text-primary mb-2">{featuredCreation.title}</h3>
                    <p className="text-sm text-text-secondary line-clamp-2 mb-3">{featuredCreation.description}</p>
                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      <span className="flex items-center gap-1"><Heart size={12} className="text-red-400" fill="currentColor" /> {featuredCreation.likeCount}</span>
                      <span className="flex items-center gap-1"><MessageCircle size={12} /> {featuredCreation.commentCount}</span>
                    </div>
                  </Link>
                </div>
              )}

              {/* Upcoming Events */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
                    <Calendar size={18} className="text-accent" />
                    {t("upcoming_events")}
                  </h2>
                  <Link href={`/${locale}/calendar`} className="text-sm font-semibold text-accent hover:text-primary-dark flex items-center gap-1 transition-colors">
                    {tc("more")}
                    <ChevronRight size={16} />
                  </Link>
                </div>
                <div className="space-y-3">
                  {upcomingEvents.map((event: any) => (
                    <div key={event.id} className="p-4 bg-background rounded-xl border border-border hover:border-primary-light transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary-light flex flex-col items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-accent">
                            {new Date(event.date).toLocaleString("en", { month: "short" })}
                          </span>
                          <span className="text-lg font-extrabold text-primary-dark">
                            {new Date(event.date).getDate()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-text-primary">{getTitle(event, locale)}</h4>
                          <p className="text-xs text-text-muted mt-0.5">{event.location}</p>
                          {event.type === "online" && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full font-medium">
                              {isTC ? "線上" : isZh ? "线上" : locale === "th" ? "ออนไลน์" : "Online"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}

// Extracted component so hooks work per-card
function AnnouncementCard({ announcement: a, locale, isZh, isTC }: { announcement: any; locale: string; isZh: boolean; isTC: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const hasTranslation = isZh || locale === "th";
  const annTitle = isZh ? (a.titleZh || a.title) : locale === "th" ? (a.titleTh || a.title) : a.title;
  const annContent = isZh ? (a.contentZh || a.content) : locale === "th" ? (a.contentTh || a.content) : a.content;
  const annTitleEn = hasTranslation ? a.title : "";
  const annContentEn = hasTranslation ? a.content : "";

  return (
    <div className={`p-4 rounded-2xl border ${a.pinned ? "bg-accent/5 border-accent/30" : "bg-white border-border"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {a.pinned && <span className="px-1.5 py-0.5 bg-accent text-white text-[10px] rounded-full font-bold">{isTC ? "置頂" : isZh ? "置顶" : "PIN"}</span>}
            {a.category && <span className="text-[10px] px-1.5 py-0.5 bg-primary-light rounded-full">{a.category}</span>}
            <h3 className="font-bold text-text-primary">{showOriginal && hasTranslation ? annTitleEn : annTitle}</h3>
          </div>
          <p className={`text-sm text-text-secondary ${expanded ? "whitespace-pre-wrap" : "line-clamp-2"}`}>
            {showOriginal && hasTranslation ? annContentEn : annContent}
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            <button onClick={() => setExpanded(!expanded)} className="text-xs text-accent hover:underline font-medium">
              {expanded
                ? (locale === "zh" || locale === "zht" || locale === "yue" ? "收起 ▲" : locale === "th" ? "ย่อ ▲" : "Collapse ▲")
                : (locale === "zh" || locale === "zht" || locale === "yue" ? "展开阅读全文 ▼" : locale === "th" ? "อ่านเพิ่มเติม ▼" : "Read more ▼")
              }
            </button>
            {hasTranslation && (
              <button onClick={() => setShowOriginal(!showOriginal)} className="text-xs text-text-muted hover:text-accent">
                {showOriginal
                  ? (locale === "zh" || locale === "zht" || locale === "yue" ? "查看翻译" : locale === "th" ? "ดูคำแปล" : "Show Translation")
                  : (locale === "zh" || locale === "zht" || locale === "yue" ? "查看原文" : locale === "th" ? "ดูต้นฉบับ" : "View Original")
                }
              </button>
            )}
          </div>
        </div>
        <span className="text-xs text-text-muted whitespace-nowrap shrink-0">{new Date(a.createdAt).toLocaleDateString()}</span>
      </div>
  </div>
  );
}
