"use client";

import { useState, useRef } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Upload, Trash2, Globe, Lock, Send, X, Loader2 } from "lucide-react";
import { uploadSticker, submitStickerPublic, deleteSticker } from "@/lib/actions";

interface Sticker {
  id: string;
  url: string;
  filename: string;
  privacyMode: string;
  reviewStatus: string;
  createdAt: string;
}

export default function StickersClient({
  communityStickers,
  myStickers,
  isLoggedIn,
}: {
  communityStickers: Sticker[];
  myStickers: Sticker[];
  isLoggedIn: boolean;
}) {
  const locale = useLocale();
  const isZh = locale === "zh";
  const isTC = locale === "zht" || locale === "yue";
  const isTh = locale === "th";

  const [tab, setTab] = useState<"my" | "community">(isLoggedIn ? "my" : "community");
  const [myList, setMyList] = useState<Sticker[]>(myStickers);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const t = (en: string, zh: string, tc: string, th: string) =>
    isTh ? th : isTC ? tc : isZh ? zh : en;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMsg(t("Only images allowed", "仅支持图片格式", "僅支援圖片格式", "รองรับเฉพาะรูปภาพ"));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMsg(t("Max 10MB per sticker", "每个贴纸最大 10MB", "每個貼紙最大 10MB", "สูงสุด 10MB ต่อสติกเกอร์"));
      return;
    }

    setUploading(true);
    setMsg("");
    try {
      const uploadFd = new FormData();
      uploadFd.append("files", file);
      const res = await fetch("/api/upload", { method: "POST", body: uploadFd });
      const data = await res.json();
      if (!data.files?.length) throw new Error("Upload failed");

      const fd = new FormData();
      fd.set("url", data.files[0].url);
      fd.set("filename", file.name);
      const sticker = await uploadSticker(fd);
      setMyList(prev => [sticker, ...prev]);
      setMsg(t("Sticker uploaded!", "贴纸上传成功！", "貼紙上傳成功！", "อัปโหลดสติกเกอร์แล้ว!"));
    } catch (err: any) {
      setMsg(err.message || "Upload failed");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmitPublic(stickerId: string) {
    const fd = new FormData();
    fd.set("stickerId", stickerId);
    await submitStickerPublic(fd);
    setMyList(prev => prev.map(s => s.id === stickerId ? { ...s, privacyMode: "public", reviewStatus: "pending" } : s));
    setMsg(t("Submitted for review!", "已提交审核！", "已提交審核！", "ส่งตรวจสอบแล้ว!"));
  }

  async function handleDelete(stickerId: string) {
    const fd = new FormData();
    fd.set("stickerId", stickerId);
    await deleteSticker(fd);
    setMyList(prev => prev.filter(s => s.id !== stickerId));
    setMsg(t("Deleted", "已删除", "已刪除", "ลบแล้ว"));
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <Link href={`/${locale}`} className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors mb-6">
        <ArrowLeft size={16} />
        {isTh ? "กลับ" : isTC ? "返回" : isZh ? "返回" : "Back"}
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-text-primary">
          {t("🎨 Sticker Library", "🎨 贴纸库", "🎨 貼紙庫", "🎨 คลังสติกเกอร์")}
        </h1>
      </div>

      {/* Upload area */}
      {isLoggedIn && (
        <div className="mb-6 border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-accent hover:bg-accent/5 transition-colors cursor-pointer"
          onClick={() => fileRef.current?.click()}>
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={28} className="animate-spin text-accent" />
              <span className="text-sm text-text-muted">{t("Uploading...", "上传中...", "上傳中...", "กำลังอัปโหลด...")}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Upload size={22} className="text-accent" />
              </div>
              <span className="text-sm font-medium text-accent">
                {t("Upload photo or GIF sticker", "上传照片或 GIF 贴纸", "上傳照片或 GIF 貼紙", "อัปโหลดรูปภาพหรือสติกเกอร์ GIF")}
              </span>
              <span className="text-xs text-text-muted">
                {t("JPG, PNG, GIF, WebP — max 10MB", "JPG、PNG、GIF、WebP — 最大 10MB", "JPG、PNG、GIF、WebP — 最大 10MB", "JPG, PNG, GIF, WebP — สูงสุด 10MB")}
              </span>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </div>
      )}

      {msg && (
        <div className="mb-4 px-4 py-2 bg-accent/10 text-accent text-sm rounded-xl">{msg}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {isLoggedIn && (
          <button onClick={() => setTab("my")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === "my" ? "bg-accent text-white" : "bg-white text-text-secondary border border-border hover:bg-primary-light/50"}`}>
            {t("My Stickers", "我的贴纸", "我的貼紙", "สติกเกอร์ของฉัน")}
          </button>
        )}
        <button onClick={() => setTab("community")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === "community" ? "bg-accent text-white" : "bg-white text-text-secondary border border-border hover:bg-primary-light/50"}`}>
          {t("Community Stickers", "社区贴纸", "社群貼紙", "สติกเกอร์ชุมชน")}
        </button>
      </div>

      {/* My Stickers */}
      {tab === "my" && (
        <div>
          {myList.length === 0 ? (
            <div className="text-center py-16 text-text-muted">
              <p className="text-lg mb-2">{t("No stickers yet", "还没有贴纸", "還沒有貼紙", "ยังไม่มีสติกเกอร์")}</p>
              <p className="text-sm">{t("Upload your first sticker above!", "点击上方按钮上传第一个贴纸！", "點擊上方按鈕上傳第一個貼紙！", "อัปโหลดสติกเกอร์แรกของคุณ!")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {myList.map(s => (
                <div key={s.id} className="relative group bg-white rounded-xl border border-border p-2 hover:shadow-md transition-all">
                  <img src={s.url} alt={s.filename} className="w-full aspect-square object-contain rounded-lg" />
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {s.privacyMode === "private" && (
                      <button onClick={() => handleSubmitPublic(s.id)} className="p-1 bg-green-500 text-white rounded-lg" title="Submit to community">
                        <Globe size={12} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(s.id)} className="p-1 bg-red-500 text-white rounded-lg" title="Delete">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="mt-1">
                    {s.reviewStatus === "pending" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700">
                        {t("Pending", "审核中", "審核中", "รอตรวจ")}
                      </span>
                    )}
                    {s.privacyMode === "public" && s.reviewStatus === "approved" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                        <Globe size={10} className="inline mr-0.5" />Public
                      </span>
                    )}
                    {s.privacyMode === "private" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                        <Lock size={10} className="inline mr-0.5" />Private
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Community Stickers */}
      {tab === "community" && (
        <div>
          <div className="mb-4 p-3 bg-accent/5 rounded-xl text-sm text-text-secondary">
            💡 {t(
              "Click any sticker to copy it, then paste in your post or comment. It will show as an image!",
              "点击任意贴纸复制，然后在帖子或评论中粘贴即可显示为图片！",
              "點擊任意貼紙複製，然後在帖子或評論中貼上即可顯示為圖片！",
              "คลิกสติกเกอร์เพื่อคัดลอก แล้ววางในโพสต์หรือความคิดเห็น มันจะแสดงเป็นรูปภาพ!"
            )}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {communityStickers.length === 0 ? (
              <div className="col-span-full text-center py-16 text-text-muted">
                <p className="text-lg mb-2">{t("No community stickers yet", "还没有社区贴纸", "還沒有社群貼紙", "ยังไม่มีสติกเกอร์ชุมชน")}</p>
                <p className="text-sm">{t("Be the first to share!", "成为第一个分享的人吧！", "成為第一個分享的人吧！", "เป็นคนแรกที่แชร์!")}</p>
              </div>
            ) : (
              communityStickers.map(s => (
                <div key={s.id} className="bg-white rounded-xl border border-border p-2 hover:shadow-md hover:border-accent transition-all cursor-pointer group"
                  onClick={() => { navigator.clipboard.writeText(`![sticker](${s.url})`); setMsg(t("Copied! Paste in editor", "已复制！在编辑器中粘贴", "已複製！在編輯器中貼上", "คัดลอกแล้ว! วางในตัวแก้ไข")); }}>
                  <img src={s.url} alt={s.filename} className="w-full aspect-square object-contain rounded-lg group-hover:scale-105 transition-transform" loading="lazy" />
                  <div className="text-[10px] text-text-muted text-center mt-1 truncate">{s.filename}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
