"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";

export default function NotificationBell() {
  const locale = useLocale();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const isZh = locale === "zh" || locale === "zht" || locale === "yue";

  useEffect(() => {
    if (!session) return;
    fetch("/api/notifications")
      .then(r => r.json())
      .then(d => { setNotifications(d.notifications || []); setUnreadCount(d.unread || 0); })
      .catch(() => {});
  }, [session, open]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function markRead() {
    if (unreadCount === 0) return;
    await fetch("/api/notifications", { method: "POST" });
    setUnreadCount(0);
  }

  if (!session) return null;

  return (
    <div ref={ref} className="relative">
      <button onClick={() => { setOpen(!open); if (!open) markRead(); }}
        className="relative p-2 rounded-lg hover:bg-primary-light/50 text-text-muted transition-colors">
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-border z-50 overflow-hidden">
          <div className="p-3 border-b font-bold text-sm text-text-primary flex items-center justify-between">
            <span>{isZh ? "通知" : "Notifications"}</span>
            {unreadCount > 0 && (
              <button onClick={markRead} className="text-xs text-accent hover:underline">
                {isZh ? "全部已读" : "Mark all read"}
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-text-muted text-sm">
                {isZh ? "暂无通知" : "No notifications yet"}
              </div>
            ) : (
              notifications.map((n: any) => (
                <Link key={n.id} href={n.link || "#"} onClick={() => setOpen(false)}
                  className={`block p-3 border-b border-border/50 hover:bg-background transition-colors ${!n.read ? "bg-accent/5" : ""}`}>
                  <div className="flex items-start gap-2">
                    <span className="text-lg shrink-0 mt-0.5">
                      {n.type === "like" ? "❤️" : n.type === "comment" ? "💬" : n.type === "follow" ? "👤" : n.type === "achievement" ? "🏆" : n.type === "levelup" ? "⭐" : "📢"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary">{n.message}</p>
                      <span className="text-xs text-text-muted">{timeAgo(n.createdAt)}</span>
                    </div>
                    {!n.read && <span className="w-2 h-2 bg-accent rounded-full shrink-0 mt-1.5" />}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
