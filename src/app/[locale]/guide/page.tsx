"use client";

import { useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Heart, BookOpen, Compass, MessageCircle, Calendar, MapPin, Image, Trophy, PenLine, Sparkles, Music, Mail } from "lucide-react";

const guide = {
  en: {
    title: "New Fan Guide & Site Manual",
    intro: "Welcome to ORMFOLK Hub! Here's everything you need to know 💜",
    about: {
      title: "About Ormsin & Folk",
      text: "Ormsin (Supitcha Limsommut, 1995) and Folk (Sutima Kokiatwanit, 2000) are Thai actresses who formed the beloved GL couple OrmFolk through Apple My Love (2024). Ormsin loves sunflowers and skateboarding; Folk loves cats, the seaside, and matcha. Fandom name: SUSU 💜",
    },
    site: {
      title: "Website Features",
      items: [
        { icon: "🏠", title: "Homepage", desc: "Activity feed, announcements, featured posts, event countdown, actor profiles, music player" },
        { icon: "📋", title: "Timeline", desc: "Ormsin & Folk's career timeline — dramas, events, awards, social moments" },
        { icon: "💬", title: "Forum", desc: "Community discussions with categories. Post, comment, like, bookmark, and use emoji reactions" },
        { icon: "🖼️", title: "Photo Gallery", desc: "Browse & download fan photos. Filter by Ormsin / Folk / OrmFolk / Vlog / MV" },
        { icon: "🎨", title: "Fan Creations", desc: "Upload & showcase your fanart, edits, wallpapers, fanfic, translations, and memes" },
        { icon: "📅", title: "Events Calendar", desc: "Birthdays, lives, fan meetings, brand events, and new releases with countdown" },
        { icon: "🗺️", title: "Fan Map", desc: "See where fans are around the world (country/city only, no exact location)" },
        { icon: "👤", title: "Profile", desc: "Your avatar, bio, country badge, posts, creations, and growth level" },
        { icon: "🏆", title: "Leaderboard", desc: "Top users by XP, hottest posts, and check-in champions" },
        { icon: "🎵", title: "Music Player", desc: "Bottom bar player — listen to OrmFolk songs while browsing" },
        { icon: "💌", title: "Contact", desc: "Reach out for bugs, suggestions, collabs, or just to say hi!" },
      ],
    },
    levels: {
      title: "Levels & XP",
      text: "Earn XP by posting (+10), commenting (+5), uploading creations (+10), and receiving likes (+1). Level up from Lv1 to Lv10!",
    },
    start: {
      title: "Getting Started",
      steps: [
        "Create an account with email or Google",
        "Set your country and avatar in Profile",
        "Browse the forum and join discussions",
        "Upload your fan creations",
        "Add yourself to the Fan Map",
      ],
    },
  },
  zh: {
    title: "新粉指南 & 网站说明",
    intro: "欢迎来到 ORMFOLK Hub！这里是你需要知道的一切 💜",
    about: {
      title: "关于 Ormsin & Folk",
      text: "Ormsin（Supitcha Limsommut，1995年生）和 Folk（Sutima Kokiatwanit，2000年生）是泰国演员，通过《Apple My Love》（致亲爱的你，2024）组成深受喜爱的 OrmFolk CP。Ormsin 喜欢向日葵和滑板；Folk 喜欢猫、海边和抹茶。粉丝名：SUSU 💜",
    },
    site: {
      title: "网站功能介绍",
      items: [
        { icon: "🏠", title: "首页", desc: "动态、公告、精选帖子、活动倒计时、演员资料卡、音乐播放器" },
        { icon: "📋", title: "时间线", desc: "OrmFolk 的事业时间线 — 剧目、活动、奖项、社交时刻" },
        { icon: "💬", title: "论坛", desc: "分区社区讨论，发帖/评论/回复/点赞/收藏/表情反应" },
        { icon: "🖼️", title: "图片广场", desc: "浏览下载粉丝图片，可按 Ormsin/Folk/双人/Vlog/MV 筛选" },
        { icon: "🎨", title: "粉丝创作", desc: "上传展示你的 fanart、剪辑、壁纸、同人文、翻译、表情包" },
        { icon: "📅", title: "活动日历", desc: "生日、直播、粉丝见面会、品牌活动、新作品上线 + 倒计时" },
        { icon: "🗺️", title: "粉丝地图", desc: "查看全球粉丝分布（仅显示国家/城市，不显示具体位置）" },
        { icon: "👤", title: "个人主页", desc: "头像、简介、国家徽章、帖子、创作、成长等级" },
        { icon: "🏆", title: "排行榜", desc: "经验排行、热帖、签到达人" },
        { icon: "🎵", title: "音乐播放器", desc: "底部播放器 — 边浏览边听 OrmFolk 歌曲" },
        { icon: "💌", title: "联系我们", desc: "反馈 Bug、提建议、申请合作，或只是打个招呼！" },
      ],
    },
    levels: {
      title: "等级与经验",
      text: "发帖 +10 XP、评论 +5 XP、上传创作 +10 XP、被点赞 +1 XP。从 Lv1 升级到 Lv10！",
    },
    start: {
      title: "快速开始",
      steps: [
        "用邮箱或 Google 注册账号",
        "在个人主页设置国家和头像",
        "浏览论坛并参与讨论",
        "上传你的粉丝创作",
        "在地图上标记你的位置",
      ],
    },
  },
};

export default function GuidePage() {
  const locale = useLocale();
  const t = (guide as any)[locale] || guide.en || guide.zh;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <Link href={`/${locale}`} className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors mb-6">
        <ArrowLeft size={16} /> {locale === "th" ? "กลับ" : locale === "zht" || locale === "yue" ? "返回" : "Back"}
      </Link>

      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4">
          <BookOpen size={28} className="text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-4">{t.title}</h1>
        <p className="text-text-secondary max-w-xl mx-auto">{t.intro}</p>
      </div>

      {/* About */}
      <section className="mb-10 p-6 bg-white rounded-2xl border border-border">
        <h2 className="text-xl font-extrabold text-text-primary mb-3 flex items-center gap-2">
          <Heart size={20} className="text-accent" fill="currentColor" /> {t.about.title}
        </h2>
        <p className="text-text-secondary leading-relaxed">{t.about.text}</p>
      </section>

      {/* Site Features */}
      <section className="mb-10">
        <h2 className="text-xl font-extrabold text-text-primary mb-6 flex items-center gap-2">
          <Compass size={20} className="text-accent" /> {t.site.title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {t.site.items.map((item: any, i: number) => (
            <div key={i} className="p-4 bg-white rounded-xl border border-border hover:border-accent/30 transition-colors">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h3 className="font-semibold text-text-primary text-sm">{item.title}</h3>
                  <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Levels */}
      <section className="mb-10 p-6 bg-white rounded-2xl border border-border">
        <h2 className="text-xl font-extrabold text-text-primary mb-3 flex items-center gap-2">
          <Sparkles size={20} className="text-accent" /> {t.levels.title}
        </h2>
        <p className="text-text-secondary leading-relaxed">{t.levels.text}</p>
      </section>

      {/* Getting Started */}
      <section className="mb-10 p-6 bg-white rounded-2xl border border-border">
        <h2 className="text-xl font-extrabold text-text-primary mb-4 flex items-center gap-2">
          <Compass size={20} className="text-accent" /> {t.start.title}
        </h2>
        <ol className="space-y-3">
          {t.start.steps.map((step: string, i: number) => (
            <li key={i} className="flex items-center gap-3 text-text-secondary">
              <span className="w-7 h-7 rounded-full bg-accent/10 text-accent font-bold text-sm flex items-center justify-center shrink-0">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      {/* Contact */}
      <div className="text-center">
        <Link href={`/${locale}/contact`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent/80 transition-colors">
          <Mail size={18} /> {locale === "th" ? "💌 ติดต่อเรา" : locale === "zht" || locale === "yue" ? "💌 聯絡我們" : "💌 Contact & Feedback"}
        </Link>
      </div>
    </div>
  );
}
