"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Search as SearchIcon, ArrowLeft, Heart, MessageCircle, ChevronRight, Loader2 } from "lucide-react";
import { searchAll } from "@/lib/actions";
import { timeAgo } from "@/lib/utils";

export default function SearchPage() {
  const t = useTranslations("common");
  const locale = useLocale();
  const isZh = locale === "zh";
  const isTC = locale === "zht" || locale === "yue";
  const isTh = locale === "th";
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [tab, setTab] = useState("all");

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); setSearched(false); return; }
    setLoading(true); setSearched(true);
    const r = await searchAll(q);
    setResults(r); setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 400);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link href={`/${locale}`} className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors mb-6">
        <ArrowLeft size={16} /> {t("back")}
      </Link>
      <div className="relative mb-8">
        <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder={isTh ? "ค้นหา..." : isZh ? "搜索..." : "Search..."}
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border bg-white text-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-light transition-all" autoFocus />
      </div>
      {loading && <div className="text-center py-8"><Loader2 size={24} className="animate-spin mx-auto text-accent" /></div>}

      {results && (
        <>
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {[
              { k: "all", label: isTh ? "ทั้งหมด" : isTC ? "全部" : isZh ? "全部" : "All", count: (results.posts?.length||0)+(results.comments?.length||0)+(results.creations?.length||0)+(results.gallery?.length||0) },
              { k: "posts", label: isTh ? "โพสต์" : isTC ? "貼文" : isZh ? "帖子" : "Posts", count: results.posts?.length||0 },
              { k: "comments", label: isTh ? "ความคิดเห็น" : isTC ? "留言" : isZh ? "评论" : "Comments", count: results.comments?.length||0 },
              { k: "creations", label: isTh ? "ผลงาน" : isTC ? "創作" : isZh ? "创作" : "Creations", count: results.creations?.length||0 },
              { k: "gallery", label: isTh ? "แกลเลอรี่" : isTC ? "圖庫" : isZh ? "图库" : "Gallery", count: results.gallery?.length||0 },
            ].map(({ k, label, count }) => (
              <button key={k} onClick={() => setTab(k)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${tab===k?"bg-accent text-white":"bg-white border text-text-secondary"}`}>
                {label} ({count})
              </button>
            ))}
          </div>

          {searched && !loading && (results.posts?.length||0)+(results.comments?.length||0)+(results.creations?.length||0)+(results.gallery?.length||0) === 0 && (
            <p className="text-center text-text-muted py-8">{isTh ? "ไม่พบผลลัพธ์" : isTC ? "無結果" : isZh ? "无结果" : "No results"}</p>
          )}

          {/* Posts */}
          {(tab === "all" || tab === "posts") && results.posts?.map((p: any) => (
            <Link key={"p"+p.id} href={`/${locale}/forum/${p.id}`}
              className="block p-4 bg-white rounded-xl border mb-2 hover:border-accent/30">
              <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
                <span>{p.author?.username}</span>
                {p.category && <span className="text-accent">{(p.category as any).nameEn}</span>}
                <span>{timeAgo(p.createdAt)}</span>
                <span className="text-[10px] px-1 bg-primary-light rounded">📝 {isTh?"โพสต์":isTC?"貼文":isZh?"帖子":"Post"}</span>
              </div>
              <h3 className="font-bold text-sm">{p.title}</h3>
              <p className="text-xs text-text-secondary line-clamp-1">{p.content}</p>
            </Link>
          ))}

          {/* Comments */}
          {(tab === "all" || tab === "comments") && results.comments?.map((c: any) => (
            <Link key={"c"+c.id} href={`/${locale}/forum/${c.postId}`}
              className="block p-4 bg-white rounded-xl border mb-2 hover:border-accent/30">
              <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
                <span>{c.author?.username}</span>
                <span>{timeAgo(c.createdAt)}</span>
                <span className="text-[10px] px-1 bg-primary-light rounded">💬 {isTh?"ความคิดเห็น":isTC?"留言":isZh?"评论":"Comment"}</span>
              </div>
              <p className="text-sm text-text-secondary line-clamp-2">"{c.content}"</p>
              {c.postTitle && <p className="text-xs text-text-muted mt-1">{isTh?"จาก：":isZh?"来自：":"in: "}{c.postTitle}</p>}
            </Link>
          ))}

          {/* Creations */}
          {(tab === "all" || tab === "creations") && results.creations?.map((c: any) => (
            <div key={"cr"+c.id} className="block p-4 bg-white rounded-xl border mb-2">
              <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
                <span>{c.author?.username}</span>
                <span>{timeAgo(c.createdAt)}</span>
                <span className="text-[10px] px-1 bg-primary-light rounded">🎨 {isTh?"ผลงาน":isTC?"創作":isZh?"创作":"Creation"}</span>
              </div>
              <h3 className="font-bold text-sm">{c.title}</h3>
              <p className="text-xs text-text-secondary line-clamp-1">{c.description}</p>
            </div>
          ))}

          {/* Gallery */}
          {(tab === "all" || tab === "gallery") && results.gallery?.map((g: any) => (
            <Link key={"g"+g.id} href={`/${locale}/gallery`}
              className="inline-block mr-2 mb-2 w-24 h-24 rounded-lg overflow-hidden border">
              <img src={g.url} alt={g.caption||""} className="w-full h-full object-cover" />
            </Link>
          ))}
        </>
      )}
    </div>
  );
}
