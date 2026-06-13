"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { ArrowLeft, Send, Loader2, Save, Trash2, EyeOff, Upload, X } from "lucide-react";
import { createPost, saveDraft, getDrafts, deleteDraft } from "@/lib/actions";
import StickerPicker from "@/components/features/StickerPicker";

export default function NewPostClient({ categories, events }: { categories: any[]; events: any[] }) {
  const t = useTranslations("forum");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { data: session } = useSession();
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState<any[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [spoilerTitle, setSpoilerTitle] = useState("");
  const [imageUrls, setImageUrls] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Load drafts
  useEffect(() => {
    if (session) getDrafts().then(setDrafts).catch(() => {});
  }, [session]);

  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const doAutoSave = useCallback(async () => {
    if (!session || !formRef.current) return;
    const fd = new FormData(formRef.current);
    fd.append("locale", locale);
    if (currentDraftId) fd.append("draftId", currentDraftId);
    setSavingDraft(true);
    try {
      const result = await saveDraft(fd);
      if (result?.id) setCurrentDraftId(result.id);
      // Refresh draft list
      getDrafts().then(setDrafts).catch(() => {});
    } catch {}
    setSavingDraft(false);
  }, [session, locale, currentDraftId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!formRef.current) return;
    const handleChange = () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(doAutoSave, 30000);
    };
    const form = formRef.current;
    form.addEventListener("input", handleChange);
    return () => { form.removeEventListener("input", handleChange); clearTimeout(autoSaveTimer.current!); };
  }, [doAutoSave]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPosting(true);

    const formData = new FormData(e.currentTarget);
    formData.append("locale", locale);
    if (isSpoiler) { formData.append("isSpoiler", "true"); formData.append("spoilerTitle", spoilerTitle); }
    // Combine uploaded photos + pasted URLs
    const allUrls = [...uploadedPhotos, ...imageUrls.split("\n").map(u => u.trim()).filter(Boolean)].slice(0, 10);
    if (allUrls.length > 0) formData.append("imageUrlsRaw", allUrls.join("\n"));

    try {
      const post = await createPost(formData);
      // Delete draft if exists
      if (currentDraftId) {
        const dfd = new FormData(); dfd.append("draftId", currentDraftId);
        deleteDraft(dfd).catch(() => {});
      }
      router.push(`/forum/${post.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create post");
      setPosting(false);
    }
  }

  async function loadDraft(draft: any) {
    setCurrentDraftId(draft.id);
    setShowDrafts(false);
    // Fill form fields
    const form = formRef.current;
    if (!form) return;
    (form.querySelector('[name="title"]') as HTMLInputElement).value = draft.title || "";
    (form.querySelector('[name="content"]') as HTMLTextAreaElement).value = draft.content || "";
    if (draft.tags) (form.querySelector('[name="tags"]') as HTMLInputElement).value = draft.tags;
    if (draft.categoryId) (form.querySelector('[name="categoryId"]') as HTMLSelectElement).value = draft.categoryId;
    if (draft.eventId) (form.querySelector('[name="eventId"]') as HTMLSelectElement).value = draft.eventId;
  }

  async function handleDeleteDraft(draftId: string) {
    const fd = new FormData(); fd.append("draftId", draftId);
    await deleteDraft(fd);
    getDrafts().then(setDrafts).catch(() => {});
    if (currentDraftId === draftId) {
      setCurrentDraftId(null);
      formRef.current?.reset();
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingPhotos(true);
    const fd = new FormData();
    for (const f of Array.from(files)) fd.append("files", f);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.files?.length > 0) {
        const urls = data.files.map((f: any) => f.url);
        setUploadedPhotos(prev => [...prev, ...urls].slice(0, 10));
      }
    } catch (err: any) {
      setError(isZh ? "图片上传失败：" + err.message : "Photo upload failed: " + err.message);
    }
    setUploadingPhotos(false);
    // Reset input so same file can be re-selected
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  function removePhoto(url: string) {
    setUploadedPhotos(prev => prev.filter(u => u !== url));
  }

  const isZh = locale === "zh" || locale === "zht" || locale === "yue";
  const isTh = locale === "th";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link
        href={`/${locale}/forum`}
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        {tc("back")}
      </Link>

      <h1 className="text-3xl font-extrabold text-text-primary mb-8">
        {t("new_post")}
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-xl text-error text-sm">
          {error}
        </div>
      )}

      {/* Drafts */}
      {drafts.length > 0 && (
        <div className="mb-4">
          <button onClick={() => setShowDrafts(!showDrafts)} className="flex items-center gap-2 text-sm text-text-muted hover:text-accent">
            <Save size={14} /> {isZh ? "草稿" : isTh ? "ฉบับร่าง" : "Drafts"} ({drafts.length})
            {savingDraft && <span className="text-xs text-text-muted animate-pulse">{isZh ? "自动保存中..." : "Auto-saving..."}</span>}
          </button>
          {showDrafts && (
            <div className="mt-2 bg-white rounded-xl border p-3 space-y-2">
              {drafts.map((d: any) => (
                <div key={d.id} className="flex items-center justify-between p-2 hover:bg-background rounded-lg">
                  <button onClick={() => loadDraft(d)} className="text-left flex-1">
                    <div className="text-sm font-medium text-text-primary truncate">{d.title || isZh ? "(无标题)" : "(untitled)"}</div>
                    <div className="text-xs text-text-muted">{new Date(d.updatedAt).toLocaleString()}</div>
                  </button>
                  <button onClick={() => handleDeleteDraft(d.id)} className="p-1 text-text-muted hover:text-error"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1.5">
            {t("categories")}
          </label>
          <select
            name="categoryId"
            required
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
          >
            <option value="">{isZh ? "选择分区..." : isTh ? "เลือกหมวดหมู่..." : "Select category..."}</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>
                {cat[`name${locale === "en" ? "En" : isZh ? "Zh" : "Th"}`] || cat.nameEn}
              </option>
            ))}
          </select>
        </div>

        {events.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">
              📅 {isZh ? "关联活动（可选）" : isTh ? "เชื่อมโยงกิจกรรม" : "Link to Event (optional)"}
            </label>
            <select name="eventId" className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-light transition-all">
              <option value="">{isZh ? "— 不关联 —" : isTh ? "— ไม่เชื่อมโยง —" : "— None —"}</option>
              {events.map((e: any) => (
                <option key={e.id} value={e.id}>{e.titleEn} ({e.date})</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1.5">
            {isZh ? "标题" : isTh ? "หัวข้อ" : "Title"}
          </label>
          <input
            type="text"
            name="title"
            required
            placeholder={isZh ? "输入帖子标题..." : isTh ? "ใส่หัวข้อ..." : "Enter post title..."}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1.5">
            {isZh ? "标签（逗号分隔，最多5个）" : isTh ? "แท็ก (คั่นด้วยคอมม่า)" : "Tags (comma separated, max 5)"}
          </label>
          <input
            type="text" name="tags"
            placeholder={isZh ? "例：糖点, 剧照, 2025" : isTh ? "เช่น: โมเมนต์, ภาพ, 2025" : "e.g. sweet, bts, 2025"}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-semibold text-text-primary">
              {isZh ? "内容" : isTh ? "เนื้อหา" : "Content"}
            </label>
            <StickerPicker
              label=""
              onSelect={(url) => {
                const ta = contentRef.current;
                if (!ta) return;
                const start = ta.selectionStart;
                const end = ta.selectionEnd;
                const before = ta.value.substring(0, start);
                const after = ta.value.substring(end);
                const stickerText = `![sticker](${url})`;
                ta.value = before + stickerText + after;
                ta.selectionStart = ta.selectionEnd = start + stickerText.length;
                ta.focus();
                // Trigger React change event
                ta.dispatchEvent(new Event("input", { bubbles: true }));
              }}
            />
          </div>
          <textarea
            ref={contentRef}
            name="content"
            required
            rows={8}
            placeholder={isZh ? "写下你想说的..." : isTh ? "เขียนสิ่งที่คุณต้องการแชร์..." : "Write your thoughts..."}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
          />
        </div>

        {/* Spoiler toggle */}
        <div className="p-4 bg-background rounded-xl">
          <label className="flex items-center gap-2 cursor-pointer mb-2">
            <input type="checkbox" checked={isSpoiler} onChange={e => setIsSpoiler(e.target.checked)} className="w-4 h-4 rounded accent-accent" />
            <EyeOff size={16} className="text-text-muted" />
            <span className="text-sm font-semibold text-text-primary">{isZh ? "含剧透内容" : isTh ? "มีสปอยล์" : "Contains Spoilers"}</span>
          </label>
          {isSpoiler && (
            <input type="text" value={spoilerTitle} onChange={e => setSpoilerTitle(e.target.value)}
              placeholder={isZh ? "剧透标题（可选）如：EP12 大结局剧透" : "Spoiler title (optional) e.g. EP12 Finale Spoiler"}
              className="w-full px-3 py-2 rounded-lg border text-sm mt-2" />
          )}
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1.5">
            🖼️ {isZh ? "上传照片（最多10张）" : isTh ? "อัปโหลดรูปภาพ (สูงสุด 10 รูป)" : "Upload Photos (max 10)"}
          </label>

          {/* Upload button */}
          <div
            onClick={() => photoInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors"
          >
            {uploadingPhotos ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 size={28} className="animate-spin text-accent" />
                <span className="text-sm text-text-muted">{isZh ? "上传中..." : isTh ? "กำลังอัปโหลด..." : "Uploading..."}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Upload size={22} className="text-accent" />
                </div>
                <span className="text-sm font-medium text-accent">{isZh ? "点击选择照片" : isTh ? "คลิกเลือกภาพถ่าย" : "Click to select photos"}</span>
                <span className="text-xs text-text-muted">{isZh ? "支持 JPG/PNG/GIF/WebP" : isTh ? "รองรับ JPG/PNG/GIF/WebP" : "Supports JPG/PNG/GIF/WebP"}</span>
              </div>
            )}
          </div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="hidden"
          />

          {/* Photo previews */}
          {uploadedPhotos.length > 0 && (
            <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {uploadedPhotos.map((url, i) => (
                <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-background border">
                  <img src={url} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(url)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                  <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-0.5">
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* URL paste — secondary option */}
          <details className="mt-3">
            <summary className="text-xs text-text-muted cursor-pointer hover:text-accent">
              {isZh ? "或粘贴图片链接（每行一个）" : isTh ? "หรือวางลิงก์รูปภาพ" : "Or paste image URLs (one per line)"}
            </summary>
            <textarea
              name="imageUrlsRaw"
              value={imageUrls}
              onChange={e => setImageUrls(e.target.value)}
              rows={2}
              placeholder="https://example.com/photo.jpg"
              className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-white text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary-light transition-all text-sm"
            />
          </details>
        </div>

        <button
          type="submit"
          disabled={posting}
          className="w-full py-3 bg-accent hover:bg-primary-dark text-white font-semibold rounded-xl shadow-md shadow-accent/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {posting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          {t("new_post")}
        </button>
      </form>
    </div>
  );
}
