"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useRouter } from "@/i18n/navigation";
import {
  MessageCircle, Plus, ArrowLeft, ChevronRight, Heart, Eye, Flame, Clock, Pin, Sparkles,
} from "lucide-react";
import { timeAgo } from "@/lib/utils";

export default function ForumClient({ data }: { data: any }) {
  const t = useTranslations("forum");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { categories, latestPosts, sort } = data;

  function getName(obj: any): string {
    return obj[`name${locale === "en" ? "En" : (locale === "zh" || locale === "zht" || locale === "yue") ? "Zh" : "Th"}`] || obj.nameEn || "";
  }

  const levelBadge = (level: number) => (
    <span className="px-1.5 py-0.5 bg-accent/15 text-accent text-xs rounded font-bold">Lv{level}</span>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <Link href={`/${locale}`} className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors mb-4">
          <ArrowLeft size={16} /> {tc("back")}
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-3">{t("title")}</h1>
            <p className="text-text-secondary text-lg">{t("desc")}</p>
          </div>
          <Link href={`/${locale}/forum/new`}
            className="px-5 py-2.5 bg-accent hover:bg-primary-dark text-white font-semibold rounded-xl shadow-md shadow-accent/20 transition-all flex items-center gap-2">
            <Plus size={18} /> <span className="hidden sm:inline">{t("new_post")}</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Categories */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-extrabold text-text-primary mb-4 flex items-center gap-2">
            <MessageCircle size={20} className="text-accent" /> {t("categories")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {categories.map((cat: any) => (
              <div key={cat.id} className="p-5 bg-white rounded-2xl border border-border shadow-sm">
                <Link href={`/${locale}/forum/categories/${cat.slug}`} className="block hover:text-accent transition-colors">
                  <h3 className="font-bold text-lg text-text-primary mb-1">{getName(cat)}</h3>
                </Link>
                {cat.children && cat.children.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {cat.children.map((child: any) => (
                      <Link key={child.id} href={`/${locale}/forum/categories/${child.slug}`}
                        className="flex items-center justify-between text-sm text-text-muted hover:text-accent transition-colors py-0.5">
                        <span className="flex items-center gap-1">
                          <ChevronRight size={12} /> {getName(child)}
                        </span>
                        <span className="text-xs">{child.postCount} {locale === "zh" || locale === "zht" || locale === "yue" ? "帖" : ""}</span>
                      </Link>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
                  <span className="text-xs text-text-muted">{cat.postCount} {locale === "zh" || locale === "zht" || locale === "yue" ? "帖" : "posts"}</span>
                  <Link href={`/${locale}/forum/categories/${cat.slug}`} className="text-xs text-primary hover:text-accent">{locale === "zh" || locale === "zht" || locale === "yue" ? "查看全部" : "View all"} →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest/Hot Posts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold text-text-primary flex items-center gap-2">
              <MessageCircle size={20} className="text-accent" />
              {sort === "hot" ? (locale === "zh" || locale === "zht" || locale === "yue" ? "热门" : "Hot") : t("latest")}
            </h2>
            <div className="flex items-center gap-1 bg-background rounded-xl p-1 border border-border">
              <button
                onClick={() => router.replace(`/forum?sort=latest` as any)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sort !== "hot" ? "bg-white text-accent shadow-sm" : "text-text-muted hover:text-text-primary"}`}>
                <Clock size={13} /> {locale === "zh" || locale === "zht" || locale === "yue" ? "最新" : "New"}
              </button>
              <button
                onClick={() => router.replace(`/forum?sort=hot` as any)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sort === "hot" ? "bg-white text-accent shadow-sm" : "text-text-muted hover:text-text-primary"}`}>
                <Flame size={13} /> {locale === "zh" || locale === "zht" || locale === "yue" ? "热门" : "Hot"}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {latestPosts.map((post: any) => (
              <Link key={post.id} href={`/${locale}/forum/${post.id}`}
                className="block p-4 bg-white rounded-xl border border-border hover:border-primary-light shadow-sm card-hover">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <div className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">
                    {post.author?.username?.[0] || "?"}
                  </div>
                  <span className="text-xs text-text-muted">{post.author?.username || "?"}</span>
                  {post.author?.level && levelBadge(post.author.level)}
                  {post.pinned && <span className="text-xs text-accent"><Pin size={10} className="inline" /> {locale === "zh" || locale === "zht" || locale === "yue" ? "置顶" : "Pinned"}</span>}
                  {post.essence && <span className="flex items-center gap-0.5 text-xs text-warning"><Sparkles size={10} /> {locale === "zh" || locale === "zht" || locale === "yue" ? "精" : "Essence"}</span>}
                  <span className="text-xs text-text-muted">·</span>
                  <span className="text-xs text-text-muted">{timeAgo(post.createdAt)}</span>
                </div>
                <h4 className="font-semibold text-sm text-text-primary mb-1 line-clamp-2">{post.title}</h4>
                {post.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {post.tags.slice(0, 3).map((t: string) => (
                      <span key={t} className="text-xs text-accent">#{t}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-3 text-xs text-text-muted mt-2">
                  <span className="flex items-center gap-1"><Heart size={12} className="text-red-400" fill="currentColor" /> {post.likeCount}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={12} /> {post.commentCount}</span>
                  <span className="flex items-center gap-1"><Eye size={12} /> {post.viewCount}</span>
                </div>
              </Link>
            ))}
            {latestPosts.length === 0 && (
              <p className="text-center text-text-muted text-sm py-4">
                {locale === "zh" || locale === "zht" || locale === "yue" ? "暂无帖子" : locale === "th" ? "ยังไม่มีโพสต์" : "No posts yet"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
