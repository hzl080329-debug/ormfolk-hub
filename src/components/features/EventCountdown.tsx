"use client";

import { useLocale } from "next-intl";
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownProps { event: { titleEn:string; titleZh:string; titleTh:string; date:string }; }

export default function EventCountdown({ event }: CountdownProps) {
  const locale = useLocale();
  const [timeLeft, setTimeLeft] = useState("");
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    function update() {
      const now = new Date().getTime();
      const target = new Date(event.date).getTime();
      const diff = target - now;
      if (diff <= 0) { setIsPast(true); setTimeLeft(""); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${d}d ${h}h ${m}m`);
      setIsPast(false);
    }
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, [event.date]);

  if (isPast) return null;

  const title = locale === "zh" ? event.titleZh : locale === "th" ? event.titleTh : event.titleEn;

  return (
    <div className="bg-gradient-to-r from-secondary-light to-primary-light rounded-2xl p-4 border border-primary-light/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center">
            <Clock size={18} />
          </div>
          <div>
            <div className="text-xs text-text-muted">{locale === "zh" || locale === "zht" || locale === "yue" ? "倒计时" : locale === "th" ? "นับถอยหลัง" : "Countdown"}</div>
            <div className="font-bold text-text-primary">{title}</div>
          </div>
        </div>
        <div className="text-2xl font-extrabold text-accent">{timeLeft}</div>
      </div>
    </div>
  );
}
