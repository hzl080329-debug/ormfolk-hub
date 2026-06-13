"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Heart, PenLine, ArrowLeft, Loader2 } from "lucide-react";
import { createWallMessage } from "@/lib/actions";

const pastelColors = [
  "from-primary-light to-white",
  "from-secondary-light to-white",
  "from-primary/10 to-secondary/10",
  "from-secondary/10 to-primary-light/30",
  "from-white to-secondary-light/50",
];

export default function WallClient({ messages }: { messages: any[] }) {
  const t = useTranslations("wall");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { data: session } = useSession();
  const [showForm, setShowForm] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPosting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      await createWallMessage(formData);
      form.reset();
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || "Failed to post");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
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
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-2.5 bg-accent hover:bg-primary-dark text-white font-semibold rounded-xl shadow-md shadow-accent/20 transition-all flex items-center gap-2"
          >
            <PenLine size={18} />
            <span className="hidden sm:inline">{t("write_message")}</span>
          </button>
        </div>
      </div>

      {/* Write form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded-2xl border border-border shadow-sm">
          {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-xl text-error text-sm">
              {error}
            </div>
          )}
          <textarea
            name="content"
            required
            placeholder={
              locale === "zh"
                ? "写下你的故事或祝福..."
                : locale === "th"
                ? "เขียนเรื่องราวหรือคำอวยพรของคุณ..."
                : "Write your story or blessing..."
            }
            className="w-full h-32 p-4 rounded-xl border border-border bg-background text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary-light mb-4"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
              <input type="checkbox" name="anonymous" value="true" className="rounded accent-accent" />
              {t("anonymous")}
            </label>
            <div className="flex items-center gap-3">
              <select name="type" className="p-2 rounded-xl border border-border bg-background text-sm text-text-secondary">
                <option value="story">{t("my_story")}</option>
                <option value="blessing">{t("blessing")}</option>
              </select>
              <button
                type="submit"
                disabled={posting}
                className="px-6 py-2 bg-accent hover:bg-primary-dark text-white font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-60"
              >
                {posting ? <Loader2 size={16} className="animate-spin" /> : locale === "zh" || locale === "zht" || locale === "yue" ? "发布" : locale === "th" ? "โพสต์" : "Post"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Message cards */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {messages.map((msg: any, i: number) => (
          <div
            key={msg.id}
            className={`break-inside-avoid p-5 rounded-2xl bg-gradient-to-br ${pastelColors[i % pastelColors.length]} border border-border shadow-sm hover:shadow-md transition-all`}
          >
            <p className="text-text-primary text-sm leading-relaxed mb-4 italic">
              &ldquo;{msg.content}&rdquo;
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">
                  {msg.username?.[0] || "?"}
                </div>
                <div>
                  <div className="text-xs font-semibold text-text-primary">{msg.username}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                {msg.type === "blessing" && <span>🙏</span>}
                {msg.type === "story" && <span>💜</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
