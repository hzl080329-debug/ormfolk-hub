"use client";

import { useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Mail, MessageCircle, Heart, ExternalLink, Send } from "lucide-react";
import { useState, useRef } from "react";
import { submitFeedback } from "@/lib/actions";

export default function ContactClient() {
  const locale = useLocale();
  const isZh = locale === "zh";
  const isTC = locale === "zht" || locale === "yue";
  const isTh = locale === "th";

  const [feedbackType, setFeedbackType] = useState("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const title = isTC ? "💌 聯絡與回饋"
    : isZh ? "💌 联系与反馈"
    : isTh ? "💌 ติดต่อ & ข้อเสนอแนะ"
    : "💌 Contact & Feedback";

  const intro = isTC
    ? "如果你發現 Bug、想提出功能建議、投稿作品、申請合作、幫助翻譯，或者只是想分享你的想法，都歡迎聯繫我。"
    : isZh
    ? "如果你发现 Bug、想提出功能建议、投稿作品、申请合作、帮助翻译，或者只是想分享你的想法，都欢迎联系我。"
    : isTh
    ? "หากคุณพบข้อผิดพลาด ต้องการเสนอฟีเจอร์ ส่งผลงาน ขอความร่วมมือ ช่วยแปล หรือแค่อยากแบ่งปันความคิดเห็น ติดต่อเราได้เลย"
    : "If you find a bug, want to suggest a feature, submit your work, apply for collaboration, help with translations, or just share your thoughts — you're always welcome to reach out.";

  const note = isTC
    ? "這個網站是由一位粉絲獨立維護的項目，我會盡量回覆所有消息。如果回覆比較慢，請見諒。💜"
    : isZh
    ? "这个网站是由一位粉丝独立维护的项目，我会尽量回复所有消息。如果回复比较慢，请见谅。💜"
    : isTh
    ? "เว็บไซต์นี้ดูแลโดยแฟนคลับเพียงคนเดียว ฉันจะพยายามตอบกลับทุกข้อความ หากตอบช้าต้องขออภัยด้วยนะ 💜"
    : "This site is independently maintained by a single fan. I'll try my best to reply to every message. If the response is a bit slow, please bear with me. 💜";

  const feedbackTypes = [
    { value: "bug", label: isTh ? "🐛 รายงานบั๊ก" : isTC ? "🐛 Bug 回報" : isZh ? "🐛 Bug 报告" : "🐛 Bug Report" },
    { value: "feature", label: isTh ? "💡 ขอฟีเจอร์" : isTC ? "💡 功能建議" : isZh ? "💡 功能建议" : "💡 Feature Request" },
    { value: "content", label: isTh ? "📝 แนะนำเนื้อหา" : isTC ? "📝 內容建議" : isZh ? "📝 内容建议" : "📝 Content Suggestion" },
    { value: "translation", label: isTh ? "🌐 ช่วยแปล" : isTC ? "🌐 翻譯幫助" : isZh ? "🌐 翻译帮助" : "🌐 Translation Help" },
    { value: "collaboration", label: isTh ? "🤝 ร่วมงาน" : isTC ? "🤝 合作" : isZh ? "🤝 合作" : "🤝 Collaboration" },
    { value: "general", label: isTh ? "💬 ทั่วไป" : isTC ? "💬 一般回饋" : isZh ? "💬 一般反馈" : "💬 General Feedback" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    setError("");
    try {
      const fd = new FormData();
      fd.set("type", feedbackType);
      fd.set("subject", subject);
      fd.set("message", message);
      fd.set("contact", contact);
      await submitFeedback(fd);
      setSent(true);
      setSubject("");
      setMessage("");
      setContact("");
    } catch (err: any) {
      setError(err.message || "Failed to send");
    }
    setSending(false);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link href={`/${locale}`} className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors mb-6">
        <ArrowLeft size={16} />
        {isTh ? "กลับ" : isTC ? "返回" : isZh ? "返回" : "Back"}
      </Link>

      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-light to-accent/20 mb-4">
          <Heart size={28} className="text-accent" fill="currentColor" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-4">{title}</h1>
        <p className="text-text-secondary leading-relaxed max-w-xl mx-auto">{intro}</p>
        <p className="text-sm text-text-muted mt-3">{note}</p>
      </div>

      {/* Contact Cards */}
      <div className="grid gap-4 mb-10">
        <a
          href="mailto:hzl080329@gmail.com"
          className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-border hover:border-accent/30 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
            <Mail size={22} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-text-primary">
              {isTC ? "📧 電子郵件" : isZh ? "📧 电子邮箱" : isTh ? "📧 อีเมล" : "📧 Email"}
            </div>
            <div className="text-sm text-accent truncate">hzl080329@gmail.com</div>
          </div>
          <ExternalLink size={16} className="text-text-muted shrink-0" />
        </a>

        <div className="p-5 bg-white rounded-2xl border border-border">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <MessageCircle size={22} className="text-green-500" />
            </div>
            <div>
              <div className="font-semibold text-text-primary">💬 LINE</div>
              <div className="text-sm text-text-secondary">hzl-08</div>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-40 h-40 rounded-xl bg-background border border-border overflow-hidden">
              <img src="/uploads/1780328276049-fnnv19.JPG" alt="LINE QR" className="w-full h-full object-contain p-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Form */}
      <div className="bg-white rounded-2xl border border-border p-6 sm:p-8">
        <h2 className="text-xl font-bold text-text-primary mb-6">
          {isTh ? "📬 ส่งข้อเสนอแนะ" : isTC ? "📬 發送回饋" : isZh ? "📬 发送反馈" : "📬 Send Feedback"}
        </h2>

        {sent ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">💜</div>
            <p className="text-lg font-semibold text-text-primary mb-2">
              {isTh ? "ขอบคุณสำหรับข้อเสนอแนะ!" : isTC ? "感謝你的回饋！" : isZh ? "感谢你的反馈！" : "Thank you for your feedback!"}
            </p>
            <p className="text-text-muted">
              {isTh ? "เราจะตอบกลับเร็วๆ นี้" : isTC ? "我們會盡快回覆。" : isZh ? "我们会尽快回复。" : "We'll get back to you soon."}
            </p>
            <button onClick={() => setSent(false)} className="mt-4 text-accent text-sm font-medium hover:underline">
              {isTh ? "ส่งอีกครั้ง" : isTC ? "再發一次" : isZh ? "再发一次" : "Send another"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {isTh ? "ประเภท" : isTC ? "回饋類型" : isZh ? "反馈类型" : "Feedback Type"}
              </label>
              <select
                value={feedbackType}
                onChange={e => setFeedbackType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 text-sm"
              >
                {feedbackTypes.map(ft => (
                  <option key={ft.value} value={ft.value}>{ft.label}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {isTh ? "หัวข้อ" : isTC ? "主題" : isZh ? "主题" : "Subject"}
              </label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 text-sm"
                placeholder={isTh ? "หัวข้อข้อเสนอแนะของคุณ" : isTC ? "你的回饋主題" : isZh ? "你的反馈主题" : "What's this about?"}
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {isTh ? "ข้อความ" : isTC ? "你的留言" : isZh ? "你的留言" : "Your Message"}
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 text-sm resize-none"
                placeholder={isTh ? "เขียนข้อความของคุณที่นี่..." : isTC ? "在這裡寫下你的想法..." : isZh ? "在这里写下你的想法..." : "Tell us what's on your mind..."}
              />
            </div>

            {/* Contact (optional) */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {isTh ? "ช่องทางติดต่อ (ไม่จำเป็น)" : isTC ? "聯絡方式（可選）" : isZh ? "联系方式（可选）" : "Contact (optional)"}
              </label>
              <input
                type="text"
                value={contact}
                onChange={e => setContact(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 text-sm"
                placeholder={isTh ? "อีเมลหรือโซเชียลมีเดีย" : isTC ? "電郵或社群帳號" : isZh ? "邮箱或社交账号" : "Email or social media handle"}
              />
            </div>

            {error && <p className="text-error text-sm">{error}</p>}

            <button
              type="submit"
              disabled={sending || !subject.trim() || !message.trim()}
              className="w-full py-3 px-6 bg-accent text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send size={16} />
              {sending
                ? (isTh ? "กำลังส่ง..." : isTC ? "發送中..." : isZh ? "发送中..." : "Sending...")
                : (isTh ? "ส่งข้อเสนอแนะ" : isTC ? "發送回饋" : isZh ? "发送反馈" : "Send Feedback")}
            </button>
          </form>
        )}
      </div>

      <div className="text-center text-xs text-text-muted mt-8">
        <Heart size={12} className="inline text-accent" fill="currentColor" />{" "}
        {isTC
          ? "感謝你成為 ORMFOLK 社群的一部分"
          : isZh
          ? "感谢你成为 ORMFOLK 社群的一部分"
          : isTh
          ? "ขอบคุณที่เป็นส่วนหนึ่งของชุมชน ORMFOLK"
          : "Thank you for being part of the ORMFOLK community"}{" "}
        <Heart size={12} className="inline text-accent" fill="currentColor" />
      </div>
    </div>
  );
}
