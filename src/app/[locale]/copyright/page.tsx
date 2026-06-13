"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowLeft, Shield, AlertTriangle, Send, Loader2 } from "lucide-react";
import { submitCopyrightReport } from "@/lib/actions";

export default function CopyrightPage() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ contentType: "post", contentId: "", originalWork: "", description: "" });

  const isZh = locale === "zh" || locale === "zht" || locale === "yue";
  const isTh = locale === "th";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) { setMsg(isZh ? "请先登录" : "Please sign in first"); return; }
    setLoading(true); setMsg("");
    const fd = new FormData();
    fd.append("contentType", form.contentType);
    fd.append("contentId", form.contentId);
    fd.append("originalWork", form.originalWork);
    fd.append("description", form.description);
    try {
      await submitCopyrightReport(fd);
      setMsg(isZh ? "✅ 版权举报已提交，我们将在48小时内处理。" : isTh ? "✅ ส่งรายงานลิขสิทธิ์แล้ว" : "✅ Report submitted. We'll review it within 48 hours.");
      setForm({ contentType: "post", contentId: "", originalWork: "", description: "" });
    } catch (err: any) { setMsg(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link href={`/${locale}`} className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors mb-6 no-underline">
        <ArrowLeft size={16} /> {isZh ? "返回" : "Back"}
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center"><AlertTriangle size={20} className="text-warning" /></div>
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary">DMCA / {isZh ? "版权举报" : isTh ? "รายงานลิขสิทธิ์" : "Copyright Report"}</h1>
          <p className="text-sm text-text-muted mt-1">{isZh ? "如果你认为有内容侵犯了你的版权，请填写此表单。" : "If you believe content on our site infringes your copyright, please submit this form."}</p>
        </div>
      </div>

      {msg && <div className={`mb-6 p-4 rounded-xl text-sm ${msg.startsWith("✅") ? "bg-success/10 border border-success/30 text-success" : "bg-error/10 border border-error/30 text-error"}`}>{msg}</div>}

      <div className="bg-white rounded-2xl border p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">{isZh ? "内容类型" : "Content Type"}</label>
            <select value={form.contentType} onChange={e => setForm({ ...form, contentType: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm">
              <option value="post">{isZh ? "帖子" : "Post"}</option>
              <option value="comment">{isZh ? "评论" : "Comment"}</option>
              <option value="creation">{isZh ? "创作" : "Creation"}</option>
              <option value="gallery">{isZh ? "图库" : "Gallery"}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">{isZh ? "内容链接/ID" : "Content Link / ID"}</label>
            <input type="text" value={form.contentId} onChange={e => setForm({ ...form, contentId: e.target.value })} placeholder={isZh ? "请粘贴侵权内容的链接或ID" : "Paste the URL or ID of the infringing content"} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">{isZh ? "你的原创作品链接" : "Link to Your Original Work"}</label>
            <input type="text" value={form.originalWork} onChange={e => setForm({ ...form, originalWork: e.target.value })} placeholder={isZh ? "请提供你原创作品的链接以证明所有权" : "Provide a link to your original work to prove ownership"} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">{isZh ? "补充说明（选填）" : "Additional Notes (optional)"}</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder={isZh ? "任何有助于我们判断的额外信息..." : "Any additional information that helps..."} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none" />
          </div>
          <button type="submit" disabled={loading || !session} className="flex items-center gap-2 px-5 py-3 bg-warning/80 hover:bg-warning text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {isZh ? "提交举报" : isTh ? "ส่งรายงาน" : "Submit Report"}
          </button>
          {!session && <p className="text-xs text-text-muted">{isZh ? "请先登录后再提交。" : "Please sign in to submit."}</p>}
        </form>
      </div>

      <div className="mt-6 bg-background rounded-2xl border p-6">
        <h2 className="text-sm font-bold text-text-primary mb-2">{isZh ? "DMCA 政策说明" : "DMCA Policy"}</h2>
        <p className="text-xs text-text-muted leading-relaxed">
          {isZh
            ? "ORMFOLK Hub 尊重知识产权。根据 DMCA（数字千年版权法），如果你认为网站上的内容侵犯了你的版权，你可以提交举报通知。我们会在收到有效举报后及时删除侵权内容。虚假举报可能导致法律责任。"
            : isTh
            ? "ORMFOLK Hub เคารพทรัพย์สินทางปัญญา ตาม DMCA หากคุณเชื่อว่าเนื้อหาบนเว็บไซต์ละเมิดลิขสิทธิ์ของคุณ คุณสามารถส่งรายงานได้"
            : "ORMFOLK Hub respects intellectual property rights. Under the DMCA, if you believe content on our site infringes your copyright, you may submit a takedown notice. We will promptly remove infringing content upon receiving a valid notice. False claims may result in legal liability."}
        </p>
      </div>
    </div>
  );
}
