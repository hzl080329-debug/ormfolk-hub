"use client";

import { useLocale } from "next-intl";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowLeft, Users, FileText, MessageCircle, Palette, Image, Globe, TrendingUp } from "lucide-react";
import { getCommunityStats } from "@/lib/actions";

export default function StatsPage() {
  const locale = useLocale();
  const isZh = locale === "zh" || locale === "zht" || locale === "yue";
  const isTh = locale === "th";
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    getCommunityStats().then(setStats).catch(() => {});
  }, []);

  const cards = [
    { icon: Users, color: "text-blue-500", bg: "bg-blue-50", label: isZh ? "注册用户" : isTh ? "ผู้ใช้" : "Users", value: stats?.totalUsers },
    { icon: FileText, color: "text-green-500", bg: "bg-green-50", label: isZh ? "帖子" : isTh ? "โพสต์" : "Posts", value: stats?.totalPosts },
    { icon: MessageCircle, color: "text-purple-500", bg: "bg-purple-50", label: isZh ? "评论" : isTh ? "ความคิดเห็น" : "Comments", value: stats?.totalComments },
    { icon: Palette, color: "text-pink-500", bg: "bg-pink-50", label: isZh ? "创作" : isTh ? "ผลงาน" : "Creations", value: stats?.totalCreations },
    { icon: Image, color: "text-orange-500", bg: "bg-orange-50", label: isZh ? "图库" : isTh ? "แกลเลอรี่" : "Gallery", value: stats?.totalGallery },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <Link href={`/${locale}`} className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors mb-6 no-underline">
        <ArrowLeft size={16} /> {isZh ? "返回" : "Back"}
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary-dark flex items-center justify-center">
          <TrendingUp size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary">
            {isZh ? "社区数据" : isTh ? "สถิติชุมชน" : "Community Statistics"}
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {isZh ? "ORMFOLK Hub 社区实时数据概览" : isTh ? "ภาพรวมข้อมูลเรียลไทม์ของชุมชน ORMFOLK Hub" : "Real-time overview of the ORMFOLK Hub community"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map(({ icon: Icon, color, bg, label, value }) => (
          <div key={label} className={`${bg} rounded-2xl p-6 text-center hover:scale-[1.02] transition-transform`}>
            <Icon size={28} className={`${color} mx-auto mb-2`} />
            <div className="text-3xl font-extrabold text-text-primary">{value ?? "—"}</div>
            <div className="text-xs text-text-muted font-medium mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-2xl border p-6 text-center">
        <p className="text-text-muted text-sm">
          {isZh ? "💜 数据每小时更新一次" : isTh ? "💜 ข้อมูลอัปเดตทุกชั่วโมง" : "💜 Stats are updated hourly"}
        </p>
      </div>
    </div>
  );
}
