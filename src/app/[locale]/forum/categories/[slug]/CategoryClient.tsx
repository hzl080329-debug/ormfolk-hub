"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Heart, MessageCircle, Eye } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export default function CategoryClient({ category }: { category: any }) {
  const t = useTranslations("forum");
  const tc = useTranslations("common");
  const locale = useLocale();

  function getName(obj: any): string {
    return obj[`name${locale === "en" ? "En" : (locale === "zh" || locale === "zht" || locale === "yue") ? "Zh" : "Th"}`] || obj.nameEn || "";
  }
  function getDesc(obj: any): string {
    return obj[`description${locale === "en" ? "En" : (locale === "zh" || locale === "zht" || locale === "yue") ? "Zh" : "Th"}`] || obj.descriptionEn || "";
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <Link
        href={`/${locale}/forum`}
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        {tc("back")}
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-text-primary mb-2">{getName(category)}</h1>
        <p className="text-text-secondary">{getDesc(category)}</p>
        <p className="text-sm text-text-muted mt-2">
          {category.postCount} {locale === "zh" || locale === "zht" || locale === "yue" ? "帖子" : locale === "th" ? "โพสต์" : "posts"}
        </p>
      </div>

      {category.posts.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-border text-center">
          <p className="text-text-muted">
            {locale === "zh" || locale === "zht" || locale === "yue" ? "这个分区还没有帖子" : locale === "th" ? "ยังไม่มีโพสต์ในหมวดนี้" : "No posts in this category yet"}
          </p>
          <Link
            href={`/${locale}/forum/new`}
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-accent hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors"
          >
            {t("new_post")}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {category.posts.map((post: any) => (
            <Link
              key={post.id}
              href={`/${locale}/forum/${post.id}`}
              className="block p-5 bg-white rounded-2xl border border-border hover:border-primary-light shadow-sm card-hover"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">
                  {post.author?.username?.[0] || post.author?.name?.[0] || "?"}
                </div>
                <span className="text-xs text-text-muted">{post.author?.username || post.author?.name || "?"}</span>
                <span className="text-xs text-text-muted">·</span>
                <span className="text-xs text-text-muted">{timeAgo(post.createdAt)}</span>
              </div>
              <h3 className="font-semibold text-text-primary mb-1">{post.title}</h3>
              <p className="text-sm text-text-secondary line-clamp-2 mb-3">{post.content}</p>
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1"><Heart size={12} /> {post.likeCount}</span>
                <span className="flex items-center gap-1"><MessageCircle size={12} /> {post.commentCount}</span>
                <span className="flex items-center gap-1"><Eye size={12} /> {post.viewCount.toLocaleString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
