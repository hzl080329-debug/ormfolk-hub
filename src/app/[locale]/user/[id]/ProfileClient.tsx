"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft, Heart, MessageCircle, FileText, Palette, PenLine, CalendarDays, MapPin, Clock, Shield, Settings, Save, X, Users, UserPlus, UserCheck } from "lucide-react";
import { timeAgo, countryFlag, countryName } from "@/lib/utils";
import { updateProfile } from "@/lib/actions";
import { useState } from "react";

const countries = [
  "", "China", "Thailand", "Japan", "South Korea", "Hong Kong, China", "Singapore",
  "Malaysia", "Indonesia", "Philippines", "Vietnam", "India", "USA", "UK", "France", "Germany", "Brazil", "Australia", "__other__"
];

import { toggleFollow } from "@/lib/actions";

export default function ProfileClient({ profile, isFollowing: initialFollow }: { profile: any; isFollowing: boolean }) {
  const t = useTranslations("profile");
  const locale = useLocale();
  const { data: session, update } = useSession();

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-4">Profile unavailable</h1>
        <p className="text-text-muted">Please try again later.</p>
      </div>
    );
  }

  const isOwner = session?.user?.id === profile.id;
  const [editing, setEditing] = useState(false);
  const isCustomCountry = profile.country && !countries.includes(profile.country);
  const [editData, setEditData] = useState({
    country: isCustomCountry ? "__other__" : (profile.country || ""),
    city: profile.city || "",
    bio: profile.bio || "",
    title: (session?.user as any)?.title || "",
    name: profile.name || "",
  });
  const [avatarPreview, setAvatarPreview] = useState(profile.image || "");
  const [customCountry, setCustomCountry] = useState(isCustomCountry ? profile.country : "");
  const [saving, setSaving] = useState(false);
  const [following, setFollowing] = useState(initialFollow);

  async function handleFollow() {
    const fd = new FormData(); fd.append("userId", profile.id);
    const r = await toggleFollow(fd);
    if (r?.following !== undefined) setFollowing(r.following);
  }

  async function handleSave() {
    setSaving(true);
    const fd = new FormData();
    fd.append("country", editData.country === "__other__" ? customCountry : editData.country);
    fd.append("city", editData.city);
    fd.append("bio", editData.bio);
    fd.append("title", editData.title);
    fd.append("name", editData.name);
    if (avatarPreview && avatarPreview !== profile.image) {
      fd.append("image", avatarPreview);
    }
    await updateProfile(fd);
    await update(); // refresh session to get new avatar/name
    setSaving(false);
    setEditing(false);
  }

  const joinDate = new Date(profile.joinedAt).toLocaleDateString(
    locale === "th" ? "th" : locale === "zh" || locale === "zht" || locale === "yue" ? "zh-CN" : "en",
    { year: "numeric", month: "long" }
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <Link href={`/${locale}`} className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors mb-6">
        <ArrowLeft size={16} />
        {locale === "zh" || locale === "zht" || locale === "yue" ? "返回" : locale === "th" ? "กลับ" : "Back"}
      </Link>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex items-start gap-5">
          {profile.image ? (
            <img src={profile.image} className="w-20 h-20 rounded-2xl object-cover shadow-md shrink-0" alt="" />
          ) : (
            <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center text-white text-3xl font-extrabold shadow-md shrink-0">
              {(profile.name || profile.username)?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-extrabold text-text-primary">
                {countryFlag(profile.country)} {profile.name || profile.username}
              </h1>
              {profile.role === "admin" && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full font-medium">
                  <Shield size={12} /> Admin
                </span>
              )}
            </div>
            {profile.bio && (
              <p className="text-text-secondary text-sm mb-3">{profile.bio}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
              <span className="flex items-center gap-1"><CalendarDays size={12} /> {t("joined")} {joinDate}</span>
              {profile.city && (
                <span className="flex items-center gap-1"><MapPin size={12} /> {profile.city}{profile.country ? `, ${countryName(profile.country, locale)}` : ""}</span>
              )}
              {profile.country && !profile.city && (
                <span className="flex items-center gap-1"><MapPin size={12} /> {countryName(profile.country, locale)}</span>
              )}
              {profile.title && (
                <span className="text-accent font-medium">{profile.title}</span>
              )}
              {isOwner ? (
                <span className="text-accent font-medium">
                  {locale === "zh" || locale === "zht" || locale === "yue" ? "（你的主页）" : locale === "th" ? "(โปรไฟล์ของคุณ)" : "(Your profile)"}
                </span>
              ) : session && (
                <button onClick={handleFollow}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                    following ? "bg-primary-light text-primary-dark" : "bg-accent text-white hover:bg-primary-dark"
                  }`}>
                  {following ? <UserCheck size={14} /> : <UserPlus size={14} />}
                  {following ? (locale === "zh" || locale === "zht" || locale === "yue" ? "已关注" : "Following") : (locale === "zh" || locale === "zht" || locale === "yue" ? "关注" : "Follow")}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mt-6 pt-6 border-t border-border">
          {[
            { icon: FileText, label: t("my_posts"), value: profile.stats.posts, color: "text-primary-dark" },
            { icon: Palette, label: t("my_creations"), value: profile.stats.creations, color: "text-secondary-dark" },
            { icon: PenLine, label: locale === "zh" || locale === "zht" || locale === "yue" ? "留言" : locale === "th" ? "ข้อความ" : "Messages", value: profile.stats.messages, color: "text-accent" },
            { icon: Heart, label: locale === "zh" || locale === "zht" || locale === "yue" ? "点赞" : locale === "th" ? "ถูกใจ" : "Likes", value: profile.stats.likes, color: "text-secondary-dark" },
            { icon: Users, label: locale === "zh" || locale === "zht" || locale === "yue" ? "粉丝" : locale === "th" ? "ผู้ติดตาม" : "Followers", value: profile.stats.followers || 0, color: "text-accent" },
            { icon: Users, label: locale === "zh" || locale === "zht" || locale === "yue" ? "关注" : locale === "th" ? "กำลังติดตาม" : "Following", value: profile.stats.following || 0, color: "text-primary-dark" },
          ].map((stat, i) => (
            <div key={i} className="text-center p-3 bg-background rounded-xl">
              <stat.icon size={16} className={`${stat.color} mx-auto mb-1`} />
              <div className="text-lg font-extrabold text-text-primary">{stat.value}</div>
              <div className="text-xs text-text-muted">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* XP Progress */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-text-primary">Lv.{profile.level || 1}</span>
            <span className="text-xs text-text-muted">{profile.xp || 0} XP</span>
          </div>
          <div className="w-full bg-background rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-accent to-primary-dark rounded-full transition-all" style={{ width: `${Math.min(100, ((profile.xp || 0) / ([0,10,30,60,100,160,240,350,500,700,1000][Math.min((profile.level||1), 10)] || 1000)) * 100)}%` }} />
          </div>
        </div>

        {/* Achievements */}
        {profile.achievements?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <h3 className="text-xs font-semibold text-text-muted mb-2 uppercase tracking-wide">
              {locale === "zh" || locale === "zht" || locale === "yue" ? "成就" : "Achievements"}
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.achievements.map((a: string) => {
                const badges: Record<string, string> = {
                  first_post: "🎉", ten_posts: "📝", hundred_likes: "❤️", week_streak: "🔥", level5: "⭐", level10: "👑",
                };
                return <span key={a} className="px-2.5 py-1 bg-background rounded-full text-sm">{badges[a] || "🏆"} {a.replace(/_/g, " ")}</span>;
              })}
            </div>
          </div>
        )}

        {/* Gallery photos */}
        {profile.galleryItems?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <h3 className="text-xs font-semibold text-text-muted mb-2 uppercase tracking-wide">
              {locale === "zh" || locale === "zht" || locale === "yue" ? "图库" : "Gallery"}
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {profile.galleryItems.slice(0, 8).map((g: any) => (
                <Link key={g.id} href={`/${locale}/gallery`} className="aspect-square rounded-lg overflow-hidden border bg-background hover:opacity-80 transition-opacity">
                  <img src={g.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Edit button */}
        {isOwner && (
          <div className="mt-4 pt-4 border-t border-border">
            {!editing ? (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-background hover:bg-primary-light/30 rounded-xl text-sm font-medium text-text-secondary hover:text-accent transition-colors">
                <Settings size={14} /> {locale === "zh" || locale === "zht" || locale === "yue" ? "编辑资料" : locale === "th" ? "แก้ไขโปรไฟล์" : "Edit Profile"}
              </button>
            ) : (
              <div className="space-y-3 bg-background p-4 rounded-xl">
                <div>
                  <label className="text-xs font-semibold text-text-primary mb-1 block">{locale === "zh" || locale === "zht" || locale === "yue" ? "头像" : locale === "th" ? "รูปโปรไฟล์" : "Avatar"}</label>
                  <input type="file" accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const fd2 = new FormData(); fd2.append("file", file);
                      const r = await fetch("/api/upload", { method: "POST", body: fd2 });
                      if (r.ok) { const d = await r.json(); setAvatarPreview(d.url); }
                    }
                  }} className="w-full text-xs text-text-secondary file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-light file:text-primary-dark" />
                  {avatarPreview && <img src={avatarPreview} className="mt-2 w-16 h-16 rounded-2xl object-cover" />}
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-primary mb-1 block">{locale === "zh" || locale === "zht" || locale === "yue" ? "昵称" : locale === "th" ? "ชื่อเล่น" : "Nickname"}</label>
                  <input value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-light" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-text-primary mb-1 block">{locale === "zh" || locale === "zht" || locale === "yue" ? "国家" : "Country"}</label>
                    <select value={editData.country} onChange={e => setEditData({...editData, country: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-light">
                      <option value="">-</option>
                      {countries.filter(Boolean).map(c => <option key={c} value={c}>{c === "__other__" ? (locale === "zh" || locale === "zht" || locale === "yue" ? "🌍 其他" : "🌍 Other") : c}</option>)}
                    </select>
                    {editData.country === "__other__" && (
                      <input value={customCountry} onChange={e => setCustomCountry(e.target.value)}
                        placeholder={locale === "zh" || locale === "zht" || locale === "yue" ? "输入国家..." : "Type country..."}
                        className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-light" />
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text-primary mb-1 block">{locale === "zh" || locale === "zht" || locale === "yue" ? "城市" : "City"}</label>
                    <input value={editData.city} onChange={e => setEditData({...editData, city: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-light" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-primary mb-1 block">{locale === "zh" || locale === "zht" || locale === "yue" ? "头衔" : "Title"}</label>
                  <input value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})}
                    placeholder={locale === "zh" || locale === "zht" || locale === "yue" ? "例：OrmFolk 真爱粉" : "e.g. OrmFolk Stan"}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-light" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-primary mb-1 block">Bio</label>
                  <textarea value={editData.bio} onChange={e => setEditData({...editData, bio: e.target.value})} rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary-light" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-1 px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors">
                    <Save size={14} /> {locale === "zh" || locale === "zht" || locale === "yue" ? "保存" : "Save"}
                  </button>
                  <button onClick={() => setEditing(false)}
                    className="flex items-center gap-1 px-4 py-2 bg-white text-text-secondary text-sm rounded-lg border border-border hover:bg-background">
                    <X size={14} /> {locale === "zh" || locale === "zht" || locale === "yue" ? "取消" : "Cancel"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Posts */}
      <div className="mb-8">
        <h2 className="text-xl font-extrabold text-text-primary mb-4 flex items-center gap-2">
          <FileText size={20} className="text-accent" />
          {t("my_posts")} ({profile.posts.length})
        </h2>
        {profile.posts.length > 0 ? (
          <div className="space-y-3">
            {profile.posts.map((post: any) => (
              <Link key={post.id} href={`/${locale}/forum/${post.id}`}
                className="block p-4 bg-white rounded-xl border border-border hover:border-primary-light shadow-sm card-hover">
                <h3 className="font-semibold text-text-primary mb-1">{post.title}</h3>
                <p className="text-sm text-text-secondary line-clamp-1 mb-2">{post.content}</p>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1"><Heart size={12} /> {post.likeCount}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={12} /> {post.commentCount}</span>
                  <span>{timeAgo(post.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted py-8 text-center bg-white rounded-xl border border-border">
            {locale === "zh" || locale === "zht" || locale === "yue" ? "还没有帖子" : locale === "th" ? "ยังไม่มีโพสต์" : "No posts yet"}
          </p>
        )}
      </div>

      {/* Creations */}
      <div className="mb-8">
        <h2 className="text-xl font-extrabold text-text-primary mb-4 flex items-center gap-2">
          <Palette size={20} className="text-accent" />
          {t("my_creations")} ({profile.creations.length})
        </h2>
        {profile.creations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile.creations.map((c: any) => (
              <div key={c.id} className="bg-white rounded-xl border border-border shadow-sm p-4 hover:shadow-md transition-all">
                <h3 className="font-semibold text-text-primary mb-1">{c.title}</h3>
                <p className="text-sm text-text-secondary line-clamp-2 mb-2">{c.description}</p>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1"><Heart size={12} /> {c.likeCount}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={12} /> {c.commentCount}</span>
                  <span className="px-2 py-0.5 bg-primary-light text-primary-dark rounded-full">{c.type}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted py-8 text-center bg-white rounded-xl border border-border">
            {locale === "zh" || locale === "zht" || locale === "yue" ? "还没有创作" : locale === "th" ? "ยังไม่มีผลงาน" : "No creations yet"}
          </p>
        )}
      </div>

      {/* Wall Messages */}
      <div>
        <h2 className="text-xl font-extrabold text-text-primary mb-4 flex items-center gap-2">
          <PenLine size={20} className="text-accent" />
          {locale === "zh" || locale === "zht" || locale === "yue" ? "留言" : locale === "th" ? "ข้อความ" : "Wall Messages"} ({profile.wallMessages.length})
        </h2>
        {profile.wallMessages.length > 0 ? (
          <div className="space-y-3">
            {profile.wallMessages.map((m: any) => (
              <div key={m.id} className="p-4 bg-white rounded-xl border border-border shadow-sm">
                <p className="text-sm text-text-primary italic mb-2">&ldquo;{m.content}&rdquo;</p>
                <span className="text-xs text-text-muted">{timeAgo(m.createdAt)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted py-8 text-center bg-white rounded-xl border border-border">
            {locale === "zh" || locale === "zht" || locale === "yue" ? "还没有留言" : locale === "th" ? "ยังไม่มีข้อความ" : "No messages yet"}
          </p>
        )}
      </div>
    </div>
  );
}
