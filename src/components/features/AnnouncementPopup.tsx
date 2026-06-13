"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { X, Megaphone } from "lucide-react";

export default function AnnouncementPopup() {
  const locale = useLocale();
  const [announcement, setAnnouncement] = useState<any>(null);
  const [show, setShow] = useState(false);
  const isZh = locale === "zh" || locale === "zht" || locale === "yue";
  const isTh = locale === "th";

  useEffect(() => {
    const dismissed = sessionStorage.getItem("popup-dismissed");
    if (dismissed) return;

    fetch("/api/announcement-popup")
      .then((r) => r.json())
      .then((data) => {
        if (data?.id) {
          setAnnouncement(data);
          setShow(true);
        }
      })
      .catch(() => {});
  }, []);

  if (!show || !announcement) return null;

  const title = isTh && announcement.titleTh ? announcement.titleTh
    : isZh && announcement.titleZh ? announcement.titleZh
    : announcement.title;

  const content = isTh && announcement.contentTh ? announcement.contentTh
    : isZh && announcement.contentZh ? announcement.contentZh
    : announcement.content;

  function dismiss() {
    setShow(false);
    sessionStorage.setItem("popup-dismissed", "true");
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative">
        <button onClick={dismiss} className="absolute top-3 right-3 p-1 rounded-full hover:bg-background text-text-muted">
          <X size={18} />
        </button>
        <div className="flex items-center gap-2 mb-4">
          <Megaphone size={20} className="text-accent" />
          <span className="text-xs font-semibold text-accent uppercase">
            {isTh ? "ประกาศ" : isZh ? "公告" : "Announcement"}
          </span>
        </div>
        <h2 className="text-xl font-extrabold text-text-primary mb-3">{title}</h2>
        <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap mb-6">{content}</div>
        <button onClick={dismiss}
          className="w-full py-2.5 bg-accent text-white font-semibold rounded-xl hover:bg-accent/80 transition-colors">
          {isTh ? "รับทราบ" : isZh ? "知道了" : "Got it!"} 💜
        </button>
        <p className="text-center text-xs text-text-muted mt-3">
          {isTh ? "คุณสามารถดูประกาศทั้งหมดได้ที่หน้าแรก" : isZh ? "你可以在首页查看所有公告" : "You can view all announcements on the homepage"}
        </p>
      </div>
    </div>
  );
}
