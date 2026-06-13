"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  Palette, ArrowLeft, Heart, MessageCircle, Plus, X,
  Image, Video, PenLine, Scissors, Ellipsis, Upload, Loader2, Trash2,
} from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { createCreation, deleteCreation } from "@/lib/actions";

const typeIcons: Record<string, React.ElementType> = {
  art: Image, writing: PenLine, edits: Video, crafts: Scissors,
};

export default function CreationsClient({ creations }: { creations: any[] }) {
  const t = useTranslations("creations");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { data: session } = useSession();
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  async function handleUpload(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("files", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.files?.[0]?.url || "";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setUploading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const file = fileRef.current?.files?.[0];

    try {
      let imageUrl = "";
      if (file) {
        imageUrl = await handleUpload(file);
      }
      formData.append("imageUrl", imageUrl);

      await createCreation(formData);
      form.reset();
      setPreviewUrl("");
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || "Failed to create");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange() {
    const file = fileRef.current?.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  const filtered = filter === "all" ? creations : creations.filter((c) => c.type === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          {tc("back")}
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-3">
              {t("title")}
            </h1>
            <p className="text-text-secondary text-lg">{t("desc")}</p>
          </div>
          {session && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-5 py-2.5 bg-accent hover:bg-primary-dark text-white font-semibold rounded-xl shadow-md shadow-accent/20 transition-all flex items-center gap-2"
            >
              {showForm ? <X size={18} /> : <Plus size={18} />}
              <span className="hidden sm:inline">{showForm ? tc("cancel") : t("upload")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Upload Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded-2xl border border-border shadow-sm">
          {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-xl text-error text-sm">{error}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                {locale === "zh" || locale === "zht" || locale === "yue" ? "作品标题" : locale === "th" ? "ชื่อผลงาน" : "Title"}
              </label>
              <input
                type="text" name="title" required
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                {t("filter")}
              </label>
              <select
                name="type" required
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
              >
                <option value="art">{t("art")}</option>
                <option value="writing">{t("writing")}</option>
                <option value="edits">{locale === "zh" || locale === "zht" || locale === "yue" ? "剪辑" : locale === "th" ? "ตัดต่อ" : "Edits"}</option>
                <option value="crafts">{t("craft")}</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-text-primary mb-1.5">
              {locale === "zh" || locale === "zht" || locale === "yue" ? "描述" : locale === "th" ? "คำอธิบาย" : "Description"}
            </label>
            <textarea
              name="description" rows={3}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-text-primary mb-1.5">
              {locale === "zh" || locale === "zht" || locale === "yue" ? "上传图片（可选）" : locale === "th" ? "อัปโหลดรูป (ไม่จำเป็น)" : "Upload Image (optional)"}
            </label>
            <input
              ref={fileRef}
              type="file" accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary-dark hover:file:bg-primary/50 transition-colors"
            />
            {previewUrl && (
              <img src={previewUrl} alt="Preview" className="mt-2 max-h-32 rounded-xl object-cover" />
            )}
          </div>
          <button
            type="submit" disabled={uploading}
            className="px-6 py-2.5 bg-accent hover:bg-primary-dark text-white font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {t("upload")}
          </button>
        </form>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {["all", "art", "writing", "edits", "crafts"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              filter === type
                ? "bg-accent text-white shadow-sm"
                : "bg-white border border-border hover:border-primary-light text-text-secondary"
            }`}
          >
            {type === "all"
              ? locale === "zh" || locale === "zht" || locale === "yue" ? "全部" : locale === "th" ? "ทั้งหมด" : "All"
              : t(type as any)}
          </button>
        ))}
      </div>

      {/* Creations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((creation: any) => {
          const Icon = typeIcons[creation.type] || Image;
          return (
            <div
              key={creation.id}
              className="bg-white rounded-2xl border border-border hover:border-primary-light shadow-sm card-hover overflow-hidden"
            >
              {creation.imageUrl ? (
                <img
                  src={creation.imageUrl}
                  alt={creation.title}
                  className="h-48 w-full object-cover"
                />
              ) : (
                <div className="h-48 bg-gradient-to-br from-primary-light via-secondary-light to-primary flex items-center justify-center">
                  <Icon size={48} className="text-primary-dark/50" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">
                    {creation.author?.username?.[0] || creation.author?.name?.[0] || "?"}
                  </div>
                  <span className="text-xs text-text-muted">
                    {creation.author?.username || creation.author?.name || "Anonymous"}
                  </span>
                  <span className="text-xs text-text-muted">·</span>
                  <span className="text-xs text-text-muted">{timeAgo(creation.createdAt)}</span>
                </div>
                <h3 className="font-bold text-text-primary mb-2">{creation.title}</h3>
                <p className="text-sm text-text-secondary line-clamp-2 mb-4">{creation.description}</p>
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1"><Heart size={14} /> {creation.likeCount}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={14} /> {creation.commentCount}</span>
                  <span className="px-2 py-0.5 bg-primary-light text-primary-dark rounded-full font-medium">
                    {t(creation.type)}
                  </span>
                  {session && (session.user as any)?.id === creation.userId && (
                    <button onClick={async (e) => {
                      e.preventDefault();
                      if (!confirm(locale === "zh" || locale === "zht" || locale === "yue" ? "确认删除？" : "Delete?")) return;
                      const fd = new FormData(); fd.append("creationId", creation.id);
                      try { await deleteCreation(fd); } catch {}
                    }} className="ml-auto p-1.5 text-text-muted hover:text-error rounded-lg hover:bg-error/10 transition-colors" title={locale === "zh" || locale === "zht" || locale === "yue" ? "删除" : "Delete"}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
