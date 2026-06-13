"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import {
  Heart, MessageCircle, Eye, ArrowLeft, Send, Loader2, Trash2, Pencil, Bookmark, BookmarkCheck, Reply, Flag, ThumbsDown,
} from "lucide-react";
import { createComment, toggleLike, editPostWithHistory, deleteOwnPost, softDeletePost, replyToComment, toggleBookmark, submitReport, togglePin, toggleEssence, toggleDownvote, addReaction, trackPostView, editComment, softDeleteComment } from "@/lib/actions";
import StickerPicker from "@/components/features/StickerPicker";
import { timeAgo, countryFlag } from "@/lib/utils";
import { toTraditional } from "@/lib/s2t";

export default function PostDetailClient({ post: initialPost, categories }: { post: any; categories?: any[] }) {
  const t = useTranslations("forum");
  const locale = useLocale();
  const { data: session } = useSession();
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(initialPost.title);
  const [editContent, setEditContent] = useState(initialPost.content);
  const [editCategoryId, setEditCategoryId] = useState(initialPost.category?.id || "");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [bookmarked, setBookmarked] = useState(initialPost.isBookmarked || false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [revealSpoiler, setRevealSpoiler] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [commentSort, setCommentSort] = useState<"newest" | "hot">("newest");

  const [viewCount, setViewCount] = useState(initialPost.viewCount);
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  // Track real view (cookie-based dedup, 30 min cooldown)
  useEffect(() => {
    trackPostView(initialPost.id).then((result) => {
      if (result?.counted) setViewCount(prev => prev + 1);
    }).catch(() => {});
  }, [initialPost.id]);

  // Multi-image parsing
  let images: string[] = [];
  try { images = JSON.parse((initialPost as any).imageUrls || "[]"); } catch {}
  const editHistory: any[] = (() => { try { return JSON.parse((initialPost as any).editHistory || "[]"); } catch { return []; } })();

  const isZhLocale = locale === "zh" || locale === "zht" || locale === "yue";
  const isThLocale = locale === "th";

  const levelBadge = (level: number) => {
    if (!level || level < 1) return null;
    const colors: Record<number, string> = {
      1: "bg-gray-100 text-gray-600", 2: "bg-blue-50 text-blue-600", 3: "bg-green-50 text-green-600",
      4: "bg-yellow-50 text-yellow-700", 5: "bg-orange-50 text-orange-600", 6: "bg-pink-50 text-pink-600",
      7: "bg-purple-50 text-purple-600", 8: "bg-red-50 text-red-600", 9: "bg-indigo-50 text-indigo-600",
      10: "bg-amber-50 text-amber-700", 11: "bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800",
    };
    const color = level > 11 ? "bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800 font-bold" : (colors[level] || "bg-gray-100 text-gray-600");
    return <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${color}`}>Lv{level}</span>;
  };

  // Render post content with markdown images and URLs
  function renderContent(text: string): string {
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    // Markdown images: ![alt](url)
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="inline-block max-w-[200px] max-h-[200px] rounded-lg my-1" loading="lazy" />');
    // Markdown links: [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer" class="text-accent underline">$1</a>');
    // Bare URLs
    html = html.replace(/(https?:\/\/[^\s<>"]+\.(jpg|jpeg|png|gif|webp)(\?[^\s<>"]*)?)/gi, '<img src="$1" alt="" class="inline-block max-w-[200px] max-h-[200px] rounded-lg my-1" loading="lazy" />');
    return html;
  }

  function getLocalized(field: string): string | null {
    if (showOriginal) return (initialPost as any)[field];
    if (isZhLocale && (initialPost as any)[`${field}Zh`]) return (initialPost as any)[`${field}Zh`];
    if (isThLocale && (initialPost as any)[`${field}Th`]) return (initialPost as any)[`${field}Th`];
    return (initialPost as any)[field];
  }

  const [displayTitle, setDisplayTitle] = useState(getLocalized("title") || initialPost.title);
  const [displayContent, setDisplayContent] = useState(getLocalized("content") || initialPost.content);
  const hasTranslation = (isZhLocale && (initialPost as any).titleZh) || (isThLocale && (initialPost as any).titleTh);
  const postOriginalLang = (initialPost as any).originalLang || "en";
  const isTranslated = hasTranslation && !showOriginal;
  const langNames: Record<string, string> = {
    en: "English", zh: "简体中文", zht: "繁體中文", yue: "粵語", th: "ไทย",
  };

  // Convert to Traditional for zht/yue
  useEffect(() => {
    if (locale === "zht" || locale === "yue") {
      Promise.all([
        toTraditional(displayTitle),
        toTraditional(displayContent),
      ]).then(([t, c]) => { setDisplayTitle(t); setDisplayContent(c); });
    }
  }, [locale]);
  const [post, setPost] = useState(initialPost);
  const [reporting, setReporting] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");

  async function handleReport(targetId: string, isComment: boolean) {
    if (!reportReason.trim()) return;
    setSubmitting(true);
    const fd = new FormData();
    if (isComment) fd.append("commentId", targetId); else fd.append("postId", targetId);
    fd.append("reason", reportReason);
    try { await submitReport(fd); setReporting(null); setReportReason(""); alert(locale === "zh" || locale === "zht" || locale === "yue" ? "举报已提交" : "Report submitted"); }
    catch (err: any) { setError(err.message); }
    finally { setSubmitting(false); }
  }

  const isOwner = session?.user?.id === post.author?.id;
  const isAdmin = (session?.user as any)?.role === "admin";
  const canDelete = isOwner || isAdmin;

  const catName = post.category
    ? post.category[`name${locale === "en" ? "En" : (locale === "zh" || locale === "zht" || locale === "yue") ? "Zh" : "Th"}`] || post.category.nameEn
    : "";

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    setError(""); setSubmitting(true);
    const fd = new FormData();
    fd.append("content", comment); fd.append("postId", post.id);
    try { await createComment(fd); setComment(""); }
    catch (err: any) { setError(err.message); }
    finally { setSubmitting(false); }
  }

  async function handleReply(parentId: string) {
    if (!replyText.trim()) return;
    setError(""); setSubmitting(true);
    const fd = new FormData();
    fd.append("content", replyText); fd.append("postId", post.id); fd.append("parentId", parentId);
    try { await replyToComment(fd); setReplyTo(null); setReplyText(""); }
    catch (err: any) { setError(err.message); }
    finally { setSubmitting(false); }
  }

  const [likeCount, setLikeCount] = useState(initialPost.likeCount);
  const [liked, setLiked] = useState(false);

  const [commentLikes, setCommentLikes] = useState<Record<string, number>>({});
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});

  async function handleCommentLike(commentId: string) {
    const prevLiked = likedComments[commentId] || false;
    const currentCount = commentLikes[commentId] ?? (post.comments?.find((c:any) => c.id === commentId)?.likeCount || 0);

    setLikedComments(prev => ({ ...prev, [commentId]: !prevLiked }));
    setCommentLikes(prev => ({ ...prev, [commentId]: prevLiked ? currentCount - 1 : currentCount + 1 }));

    const fd = new FormData(); fd.append("commentId", commentId);
    try { await toggleLike(fd); router.refresh(); } catch {
      setLikedComments(prev => ({ ...prev, [commentId]: prevLiked }));
      setCommentLikes(prev => ({ ...prev, [commentId]: currentCount }));
    }
  }

  async function handleLike() {
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    const fd = new FormData(); fd.append("postId", post.id);
    try { await toggleLike(fd); } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    }
  }

  async function handleBookmark() {
    const fd = new FormData(); fd.append("postId", post.id);
    try { const r = await toggleBookmark(fd); if (r) setBookmarked(r.bookmarked); } catch {}
  }

  async function handleEdit() {
    setError(""); setSubmitting(true);
    const fd = new FormData();
    fd.append("postId", post.id); fd.append("title", editTitle); fd.append("content", editContent);
    if (editCategoryId && editCategoryId !== post.category?.id) fd.append("categoryId", editCategoryId);
    try { await editPostWithHistory(fd); setEditing(false); setPost({ ...post, title: editTitle, content: editContent }); }
    catch (err: any) { setError(err.message); }
    finally { setSubmitting(false); }
  }

  async function handleDelete() {
    if (!confirm(locale === "zh" || locale === "zht" || locale === "yue" ? "确定删除？" : "Delete this post?")) return;
    setSubmitting(true);
    const fd = new FormData(); fd.append("postId", post.id);
    try { await deleteOwnPost(fd); router.push(`/forum`); }
    catch (err: any) { setError(err.message); setSubmitting(false); }
  }

  // Build threaded comments with sort
  const allRootComments = post.comments?.filter((c: any) => !c.parentId) || [];
  const topComments = commentSort === "hot"
    ? [...allRootComments].sort((a, b) => b.likeCount - a.likeCount)
    : allRootComments;
  const replies = (parentId: string) => post.comments?.filter((c: any) => c.parentId === parentId) || [];
  const relatedPosts = initialPost.relatedPosts || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <Link href={`/${locale}/forum`} className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors mb-6">
        <ArrowLeft size={16} /> {locale === "zh" || locale === "zht" || locale === "yue" ? "返回论坛" : locale === "th" ? "กลับฟอรั่ม" : "Back to Forum"}
      </Link>

      {/* Post */}
      <article className="bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-8 mb-6">
        {catName && <span className="inline-block px-3 py-1 bg-primary-light text-primary-dark text-xs rounded-full font-medium mb-4">{catName}</span>}
        {(initialPost as any).event && (
          <Link href={`/${locale}/calendar`} className="inline-block ml-2 px-3 py-1 bg-accent/10 text-accent text-xs rounded-full font-medium mb-4 hover:bg-accent/20">
            📅 {(initialPost as any).event.titleEn} ({(initialPost as any).event.date})
          </Link>
        )}

        {/* Edit mode */}
        {editing ? (
          <div className="space-y-4 mb-4">
            <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-border bg-background font-bold text-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-light" />
            {categories && categories.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">{isZhLocale ? "分区" : isThLocale ? "หมวดหมู่" : "Category"}</label>
                <select value={editCategoryId} onChange={e => setEditCategoryId(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
                  {categories.map((cat: any) => (
                    <optgroup key={cat.id} label={cat[`name${locale === "en" ? "En" : isZhLocale ? "Zh" : "Th"}`] || cat.nameEn}>
                      <option value={cat.id}>{cat.nameEn} — {cat.nameZh || cat.nameTh || ""}</option>
                      {cat.children?.map((ch: any) => (
                        <option key={ch.id} value={ch.id}>└ {ch.nameEn} — {ch.nameZh || ch.nameTh || ""}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}
            <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={8}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-primary-light" />
            <div className="flex gap-2">
              <button onClick={handleEdit} disabled={submitting}
                className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-xl">{locale === "zh" || locale === "zht" || locale === "yue" ? "保存" : "Save"}</button>
              <button onClick={() => setEditing(false)}
                className="px-4 py-2 bg-background text-text-secondary text-sm rounded-xl">{locale === "zh" || locale === "zht" || locale === "yue" ? "取消" : "Cancel"}</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2 mb-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">{displayTitle}</h1>
              {hasTranslation && (
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <button onClick={() => setShowOriginal(!showOriginal)}
                    className="text-xs px-2 py-1 rounded-lg border border-border hover:bg-background text-text-muted">
                    {showOriginal
                      ? (isZhLocale ? "查看翻译" : isThLocale ? "ดูคำแปล" : "Show Translation")
                      : (isZhLocale ? "查看原文" : isThLocale ? "ดูต้นฉบับ" : "View Original")}
                  </button>
                  {isTranslated && (
                    <span className="text-[10px] text-text-muted italic">
                      {isZhLocale
                        ? `已自动翻译（原文：${langNames[postOriginalLang] || postOriginalLang}）`
                        : isThLocale
                        ? `แปลอัตโนมัติ (ต้นฉบับ: ${langNames[postOriginalLang] || postOriginalLang})`
                        : `Auto-translated from ${langNames[postOriginalLang] || postOriginalLang}`}
                    </span>
                  )}
                </div>
              )}
            </div>
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.tags.map((tag: string) => (
                <Link key={tag} href={`/${locale}/forum?tag=${encodeURIComponent(tag)}`}
                  className="px-2.5 py-0.5 bg-primary-light/50 hover:bg-primary-light text-primary-dark text-xs rounded-full font-medium transition-colors">
                  #{tag}
                </Link>
              ))}
            </div>
          )}
            <div className="flex items-center gap-3 mb-6">
              <Link href={`/${locale}/user/${post.author?.id}`} className="flex items-center gap-2 hover:opacity-80">
                <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-bold">
                  {post.author?.username?.[0] || "?"}
                </div>
                <div>
                  <div className="font-semibold text-sm text-text-primary hover:text-accent">
                    {post.author?.username || post.author?.name}
                    {post.author?.level > 0 && <span className="ml-1">{levelBadge(post.author.level)}</span>}
                  </div>
                  <div className="text-xs text-text-muted">{timeAgo(post.createdAt)}</div>
                </div>
              </Link>
            </div>
            {/* Translation label with source language */}
            {hasTranslation && !showOriginal && (
              <p className="text-[11px] text-text-muted mb-3">
                🌐 {locale === "zh" || locale === "zht" || locale === "yue"
                  ? `已由${(initialPost as any).originalLang === "zh" ? "中文" : (initialPost as any).originalLang === "th" ? "泰语" : (initialPost as any).originalLang === "en" ? "英语" : "自动"}翻译`
                  : locale === "th"
                  ? `แปลจาก${(initialPost as any).originalLang === "zh" ? "ภาษาจีน" : (initialPost as any).originalLang === "en" ? "ภาษาอังกฤษ" : (initialPost as any).originalLang === "th" ? "ภาษาไทย" : "อัตโนมัติ"}`
                  : `Translated from ${(initialPost as any).originalLang === "zh" ? "Chinese" : (initialPost as any).originalLang === "th" ? "Thai" : (initialPost as any).originalLang === "en" ? "English" : "auto"}`
                }
                {" "}<button onClick={() => setShowOriginal(true)} className="text-accent hover:underline font-medium">{locale === "zh" || locale === "zht" || locale === "yue" ? "查看原文" : locale === "th" ? "ดูต้นฉบับ" : "View Original"}</button>
              </p>
            )}
            {/* Accuracy disclaimer */}
            {hasTranslation && !showOriginal && (
              <p className="text-[10px] text-text-muted/60 mb-3">
                ⚠️ {locale === "zh" || locale === "zht" || locale === "yue" ? "自动翻译可能不完全准确，请以原文为准。" : locale === "th" ? "การแปลอัตโนมัติอาจไม่ถูกต้องสมบูรณ์ กรุณาอ้างอิงจากต้นฉบับ" : "Auto-translation may not be 100% accurate. Please refer to the original."}
              </p>
            )}
            {/* Spoiler wrapper */}
            {(initialPost as any).isSpoiler && !revealSpoiler ? (
              <div className="my-4 p-6 bg-warning/5 rounded-xl border border-warning/30 text-center cursor-pointer hover:bg-warning/10 transition-colors" onClick={() => setRevealSpoiler(true)}>
                <span className="text-3xl">⚠️</span>
                <p className="text-sm font-semibold text-warning mt-2">{(initialPost as any).spoilerTitle || (locale === "zh" || locale === "zht" || locale === "yue" ? "⚠️ 此内容含有剧透" : locale === "th" ? "⚠️ มีสปอยล์" : "⚠️ This post contains spoilers")}</p>
                <p className="text-xs text-text-muted mt-1">{locale === "zh" || locale === "zht" || locale === "yue" ? "点击以查看内容" : locale === "th" ? "คลิกเพื่อดูเนื้อหา" : "Click to reveal content"}</p>
              </div>
            ) : (
              <>
                <div className="prose max-w-none text-text-secondary leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: renderContent(displayContent) }} />
                {/* Multi-image gallery */}
                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {images.map((url: string, i: number) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer" className="block aspect-square rounded-xl overflow-hidden border bg-background hover:scale-[1.02] transition-transform">
                        <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                      </a>
                    ))}
                  </div>
                )}
              </>
            )}
            {/* Edit history */}
            {editHistory.length > 0 && (
              <div className="mt-3">
                <button onClick={() => setShowHistory(!showHistory)} className="text-xs text-text-muted hover:text-accent">
                  📝 {locale === "zh" || locale === "zht" || locale === "yue" ? `编辑记录 (${editHistory.length})` : locale === "th" ? `ประวัติการแก้ไข (${editHistory.length})` : `Edit History (${editHistory.length})`}
                </button>
                {showHistory && (
                  <div className="mt-2 p-3 bg-background rounded-xl border text-xs space-y-2 max-h-40 overflow-y-auto">
                    {editHistory.slice().reverse().map((h: any, i: number) => (
                      <div key={i} className="border-b border-border pb-2 last:border-0 last:pb-0">
                        <div className="text-text-muted">{new Date(h.timestamp).toLocaleString()}</div>
                        <div className="font-medium text-text-primary">{h.title}</div>
                        <div className="text-text-secondary line-clamp-2">{h.content}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-4 mt-6 pt-6 border-t border-border flex-wrap">
          <button onClick={handleLike}
            className={`flex items-center gap-1.5 transition-colors font-medium text-sm ${liked ? "text-secondary-dark" : "text-text-muted hover:text-secondary-dark"}`}>
            <Heart size={18} className={liked ? "text-red-400" : ""} fill={liked ? "currentColor" : "none"} /> {likeCount}
          </button>
          {/* Emoji reactions */}
          {session && ["👍","😂","🔥","💯","😍","😢"].map(emoji => (
            <button key={emoji} onClick={async ()=>{const fd=new FormData();fd.append("postId",post.id);fd.append("emoji",emoji);await addReaction(fd);}}
              className="text-sm hover:scale-125 transition-transform">{emoji}</button>
          ))}
          <button onClick={async ()=>{const fd=new FormData();fd.append("postId",post.id);await toggleDownvote(fd);}}
            className="flex items-center gap-1 text-text-muted hover:text-error text-sm">
            <ThumbsDown size={16} /> {post.dislikeCount || 0}
          </button>
          <span className="flex items-center gap-1.5 text-text-muted text-sm"><MessageCircle size={18} /> {post.commentCount}</span>
          <span className="flex items-center gap-1.5 text-text-muted text-sm"><Eye size={18} /> {viewCount.toLocaleString()}</span>
          <form action={handleBookmark}>
            <button className={`flex items-center gap-1.5 transition-colors font-medium text-sm ${bookmarked ? "text-accent" : "text-text-muted hover:text-accent"}`}>
              {bookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            </button>
          </form>
          {isOwner && !editing && (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-text-muted hover:text-primary-dark text-sm">
              <Pencil size={16} />
            </button>
          )}
          {isAdmin && (
            <>
              <form action={async (fd: FormData) => { fd.append("postId", post.id); await togglePin(fd); }}>
                <button className="flex items-center gap-1 text-text-muted hover:text-accent text-sm">
                  📌 {post.pinned ? locale === "zh" || locale === "zht" || locale === "yue" ? "取消置顶" : "Unpin" : locale === "zh" || locale === "zht" || locale === "yue" ? "置顶" : "Pin"}
                </button>
              </form>
              <form action={async (fd: FormData) => { fd.append("postId", post.id); await toggleEssence(fd); }}>
                <button className={`flex items-center gap-1 text-sm ${post.essence ? "text-warning" : "text-text-muted hover:text-warning"}`}>
                  ✨ {post.essence ? locale === "zh" || locale === "zht" || locale === "yue" ? "取消精华" : "Un-essence" : locale === "zh" || locale === "zht" || locale === "yue" ? "精华" : "Essence"}
                </button>
              </form>
            </>
          )}
          {canDelete && !editing && (
            <button onClick={handleDelete} className="flex items-center gap-1 text-text-muted hover:text-error text-sm">
              <Trash2 size={16} />
            </button>
          )}
          {session && !isOwner && (
            <button onClick={() => setReporting(reporting === post.id ? null : post.id)}
              className="flex items-center gap-1 text-text-muted hover:text-error text-sm">
              <Flag size={14} /> {locale === "zh" || locale === "zht" || locale === "yue" ? "举报" : "Report"}
            </button>
          )}
        </div>

        {/* Report form */}
        {reporting === post.id && (
          <div className="mt-3 p-3 bg-error/5 rounded-xl border border-error/20">
            <input value={reportReason} onChange={e => setReportReason(e.target.value)}
              placeholder={locale === "zh" || locale === "zht" || locale === "yue" ? "举报原因..." : locale === "th" ? "เหตุผล..." : "Reason..."}
              className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-1 focus:ring-error/50 mb-2" />
            <div className="flex gap-2">
              <button onClick={() => handleReport(post.id, false)} disabled={!reportReason.trim() || submitting}
                className="px-3 py-1.5 bg-error text-white text-xs font-semibold rounded-lg disabled:opacity-50">{locale === "zh" || locale === "zht" || locale === "yue" ? "提交举报" : "Submit"}</button>
              <button onClick={() => { setReporting(null); setReportReason(""); }}
                className="px-3 py-1.5 bg-background text-text-muted text-xs rounded-lg">{locale === "zh" || locale === "zht" || locale === "yue" ? "取消" : "Cancel"}</button>
            </div>
          </div>
        )}
      </article>

      {/* Comments */}
      <section className="bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-text-primary">
            {locale === "zh" || locale === "zht" || locale === "yue" ? "评论" : locale === "th" ? "ความคิดเห็น" : "Comments"} ({post.commentCount})
          </h2>
          <div className="flex gap-1 text-xs">
            <button onClick={() => setCommentSort("newest")} className={`px-2.5 py-1 rounded-lg transition-colors ${commentSort === "newest" ? "bg-accent text-white" : "bg-background text-text-muted"}`}>
              {locale === "zh" || locale === "zht" || locale === "yue" ? "最新" : "Newest"}
            </button>
            <button onClick={() => setCommentSort("hot")} className={`px-2.5 py-1 rounded-lg transition-colors ${commentSort === "hot" ? "bg-accent text-white" : "bg-background text-text-muted"}`}>
              🔥 {locale === "zh" || locale === "zht" || locale === "yue" ? "最热" : "Hot"}
            </button>
          </div>
        </div>

        {error && <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-xl text-error text-sm">{error}</div>}

        {/* Comment form */}
        {session ? (
          <form onSubmit={handleComment} className="mb-6 pb-6 border-b border-border">
            <textarea ref={commentRef} value={comment} onChange={e => setComment(e.target.value)}
              placeholder={locale === "zh" || locale === "zht" || locale === "yue" ? "写下评论..." : "Write a comment..."}
              className="w-full p-3 rounded-xl border border-border bg-background text-text-primary text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-light" rows={3} />
            <div className="flex justify-between items-center mt-2">
              <StickerPicker
                label={isZhLocale ? "贴纸" : isThLocale ? "สติกเกอร์" : "Sticker"}
                onSelect={(url) => {
                  const ta = commentRef.current;
                  if (!ta) return;
                  const start = ta.selectionStart;
                  const end = ta.selectionEnd;
                  const before = ta.value.substring(0, start);
                  const after = ta.value.substring(end);
                  const stickerText = `![sticker](${url})`;
                  ta.value = before + stickerText + after;
                  ta.selectionStart = ta.selectionEnd = start + stickerText.length;
                  ta.focus();
                  setComment(ta.value);
                }}
              />
              <button type="submit" disabled={submitting || !comment.trim()}
                className="px-4 py-2 bg-accent hover:bg-primary-dark text-white text-sm font-semibold rounded-xl disabled:opacity-50 flex items-center gap-1.5">
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {locale === "zh" || locale === "zht" || locale === "yue" ? "评论" : "Comment"}
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-6 pb-6 border-b border-border text-center">
            <p className="text-sm text-text-muted">
              <Link href={`/${locale}/login`} className="text-accent font-semibold hover:underline">
                {locale === "zh" || locale === "zht" || locale === "yue" ? "登录" : "Sign in"}
              </Link>
              {locale === "zh" || locale === "zht" || locale === "yue" ? " 后参与评论" : " to leave a comment"}
            </p>
          </div>
        )}

        {/* Threaded comments */}
        <div className="space-y-4">
          {topComments.map((c: any) => (
            <div key={c.id}>
              <div className="pb-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Link href={`/${locale}/user/${c.author?.id}`} className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold hover:opacity-80">
                    {c.author?.username?.[0] || c.author?.name?.[0] || "?"}
                  </Link>
                  <Link href={`/${locale}/user/${c.author?.id}`} className="font-semibold text-sm text-text-primary hover:text-accent">
                    {c.author?.username || c.author?.name || "?"}
                  </Link>
                  {c.author?.level > 0 && levelBadge(c.author.level)}
                  {c.author?.id === post.author?.id && (
                    <span className="px-1 py-0 bg-accent/10 text-accent text-[10px] rounded font-bold">OP</span>
                  )}
                  <span className="text-xs text-text-muted">{timeAgo(c.createdAt)}</span>
                </div>
                {editingCommentId === c.id ? (
                  <div className="ml-9 mt-1 space-y-2">
                    <textarea value={editingCommentText} onChange={e => setEditingCommentText(e.target.value)}
                      className="w-full p-2 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary-light" rows={2} />
                    <div className="flex gap-2">
                      <button onClick={async () => {
                        const fd = new FormData(); fd.append("commentId", c.id); fd.append("content", editingCommentText);
                        try { await editComment(fd); setEditingCommentId(null); } catch {}
                      }} className="px-3 py-1 bg-accent text-white text-xs font-semibold rounded-lg">Save</button>
                      <button onClick={() => setEditingCommentId(null)} className="px-3 py-1 bg-background text-text-muted text-xs rounded-lg">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary ml-9" dangerouslySetInnerHTML={{ __html: renderContent(c.content) }} />
                )}
                <div className="ml-9 mt-1.5 flex items-center gap-3">
                  <button onClick={() => handleCommentLike(c.id)}
                    className={`flex items-center gap-1 text-xs transition-colors ${likedComments[c.id] ? "text-secondary-dark" : "text-text-muted hover:text-secondary-dark"}`}>
                    <Heart size={11} className={likedComments[c.id] ? "text-red-400" : ""} fill={likedComments[c.id] ? "currentColor" : "none"} /> {commentLikes[c.id] ?? c.likeCount}
                  </button>
                  {session && (
                    <button onClick={() => { setReplyTo(c.id); setReplyText(""); }}
                      className="flex items-center gap-1 text-xs text-text-muted hover:text-accent">
                      <Reply size={11} /> {locale === "zh" || locale === "zht" || locale === "yue" ? "回复" : "Reply"}
                    </button>
                  )}
                  {/* Edit / Delete — only for comment author */}
                  {session && session.user?.id === c.author?.id && (
                    <>
                      <button onClick={() => { setEditingCommentId(c.id); setEditingCommentText(c.content); }}
                        className="flex items-center gap-1 text-xs text-text-muted hover:text-accent">
                        <Pencil size={11} />
                      </button>
                      <button onClick={async () => {
                        if (!confirm(locale === "zh" || locale === "zht" || locale === "yue" ? "删除此评论？" : "Delete this comment?")) return;
                        setDeletingCommentId(c.id);
                        const fd = new FormData(); fd.append("commentId", c.id);
                        try { await softDeleteComment(fd); } catch {}
                        setDeletingCommentId(null);
                      }} className="flex items-center gap-1 text-xs text-text-muted hover:text-error">
                        {deletingCommentId === c.id ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                      </button>
                    </>
                  )}
                  {session && session.user?.id !== c.author?.id && (
                    <button onClick={() => setReporting(reporting === c.id ? null : c.id)}
                      className="flex items-center gap-1 text-xs text-text-muted hover:text-error">
                      <Flag size={10} />
                    </button>
                  )}
                  {/* Report form for comment */}
                  {reporting === c.id && (
                    <div className="mt-2 p-3 bg-error/5 rounded-lg border border-error/20">
                      <input value={reportReason} onChange={e => setReportReason(e.target.value)}
                        placeholder={locale === "zh" || locale === "zht" || locale === "yue" ? "举报原因..." : "Reason..."}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-white text-xs focus:outline-none focus:ring-1 focus:ring-error/50 mb-2" />
                      <div className="flex gap-2">
                        <button onClick={() => handleReport(c.id, true)} disabled={!reportReason.trim() || submitting}
                          className="px-3 py-1 bg-error text-white text-xs font-semibold rounded-lg disabled:opacity-50">Submit</button>
                        <button onClick={() => { setReporting(null); setReportReason(""); }}
                          className="px-3 py-1 bg-background text-text-muted text-xs rounded-lg">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reply form */}
                {replyTo === c.id && (
                  <div className="ml-9 mt-2">
                    <textarea ref={replyRef} value={replyText} onChange={e => setReplyText(e.target.value)}
                      placeholder={locale === "zh" || locale === "zht" || locale === "yue" ? "回复..." : "Reply..."}
                      className="w-full p-2 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary-light" rows={2} />
                    <div className="flex gap-2 mt-1.5 items-center">
                      <StickerPicker
                        label=""
                        onSelect={(url) => {
                          const ta = replyRef.current;
                          if (!ta) return;
                          const start = ta.selectionStart;
                          const end = ta.selectionEnd;
                          const before = ta.value.substring(0, start);
                          const after = ta.value.substring(end);
                          const stickerText = `![sticker](${url})`;
                          ta.value = before + stickerText + after;
                          ta.selectionStart = ta.selectionEnd = start + stickerText.length;
                          ta.focus();
                          setReplyText(ta.value);
                        }}
                      />
                      <button onClick={() => handleReply(c.id)} disabled={!replyText.trim() || submitting}
                        className="px-3 py-1 bg-accent text-white text-xs font-semibold rounded-lg disabled:opacity-50">Reply</button>
                      <button onClick={() => setReplyTo(null)} className="px-3 py-1 bg-background text-text-muted text-xs rounded-lg">Cancel</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Child replies */}
              {replies(c.id).map((r: any) => (
                <div key={r.id} className="ml-9 pl-4 border-l-2 border-primary-light pb-3 mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">
                      {r.author?.username?.[0] || r.author?.name?.[0] || "?"}
                    </div>
                    <span className="font-semibold text-xs text-text-primary">{r.author?.username || r.author?.name || "?"}</span>
                    <span className="text-xs text-text-muted">{timeAgo(r.createdAt)}</span>
                  </div>
                  <p className="text-sm text-text-secondary">{r.content}</p>
                </div>
              ))}
            </div>
          ))}
          {post.comments?.length === 0 && (
            <p className="text-center text-text-muted text-sm py-4">
              {locale === "zh" || locale === "zht" || locale === "yue" ? "还没有评论" : locale === "th" ? "ยังไม่มีความคิดเห็น" : "No comments yet"}
            </p>
          )}
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-extrabold text-text-primary mb-4">
            {locale === "zh" || locale === "zht" || locale === "yue" ? "相关帖子" : locale === "th" ? "โพสต์ที่เกี่ยวข้อง" : "Related Posts"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedPosts.map((rp: any) => (
              <Link key={rp.id} href={`/${locale}/forum/${rp.id}`}
                className="block p-4 bg-white rounded-xl border hover:border-accent/30 transition-colors">
                <h3 className="font-semibold text-sm text-text-primary mb-2 line-clamp-1">{rp.title}</h3>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1"><Heart size={11} /> {rp.likeCount}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={11} /> {rp.commentCount}</span>
                  <span>{timeAgo(rp.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
