"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function Footer() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const currentYear = new Date().getFullYear();

  const labels: Record<string, Record<string, string>> = {
    explore: { en: "Explore", zh: "探索", zht: "探索", yue: "探索", th: "สำรวจ" },
    info: { en: "Info", zh: "信息", zht: "資訊", yue: "資訊", th: "ข้อมูล" },
    tagline: { en: "A global fan community for Ormsin & Folk.", zh: "Ormsin & Folk 的全球粉丝社区。", zht: "Ormsin & Folk 的全球粉絲社群。", yue: "Ormsin & Folk 嘅全球粉絲社群。", th: "ชุมชนแฟนคลับระดับโลกสำหรับ Ormsin & Folk" },
    madeWith: { en: "Made with 💜 by fans, for fans.", zh: "用 💜 由粉丝为粉丝打造。", zht: "用 💜 由粉絲為粉絲打造。", yue: "用 💜 由粉絲為粉絲打造。", th: "ทำด้วย 💜 โดยแฟนๆ เพื่อแฟนๆ" },
    disclaimer: { en: "This is a fan-made community. Not affiliated with any agency.", zh: "粉丝自制社区，与任何经纪公司无关。", zht: "粉絲自製社群，與任何經紀公司無關。", yue: "粉絲自製社群，同任何經理人公司無關。", th: "ชุมชนที่สร้างโดยแฟนๆ ไม่เกี่ยวข้องกับต้นสังกัดใดๆ" },
    forum: { en: "Forum", zh: "论坛", zht: "論壇", yue: "論壇", th: "ฟอรั่ม" },
    creations: { en: "Creations", zh: "创作区", zht: "創作區", yue: "創作區", th: "ผลงาน" },
    gallery: { en: "Gallery", zh: "图库", zht: "圖庫", yue: "圖庫", th: "แกลเลอรี่" },
    events: { en: "Events", zh: "活动日历", zht: "活動日曆", yue: "活動日曆", th: "กิจกรรม" },
    timeline: { en: "Timeline", zh: "时间线", zht: "時間線", yue: "時間線", th: "ไทม์ไลน์" },
    wall: { en: "Message Wall", zh: "留言墙", zht: "留言牆", yue: "留言牆", th: "กระดานข้อความ" },
    map: { en: "Fan Map", zh: "粉丝地图", zht: "粉絲地圖", yue: "粉絲地圖", th: "แผนที่แฟน" },
    contact: { en: "💌 Contact & Feedback", zh: "💌 联系与反馈", zht: "💌 聯絡與回饋", yue: "💌 聯絡同回饋", th: "💌 ติดต่อและข้อเสนอแนะ" },
    guidelines: { en: "📜 Guidelines", zh: "📜 社区守则", zht: "📜 社群守則", yue: "📜 社群守則", th: "📜 กฎชุมชน" },
    faq: { en: "❓ FAQ", zh: "❓ 常见问题", zht: "❓ 常見問題", yue: "❓ 常見問題", th: "❓ คำถามที่พบบ่อย" },
    terms: { en: "📄 Terms", zh: "📄 服务条款", zht: "📄 服務條款", yue: "📄 服務條款", th: "📄 ข้อกำหนด" },
    privacy: { en: "🔒 Privacy", zh: "🔒 隐私政策", zht: "🔒 隱私政策", yue: "🔒 隱私政策", th: "🔒 ความเป็นส่วนตัว" },
    settings: { en: "⚙️ Settings", zh: "⚙️ 设置", zht: "⚙️ 設定", yue: "⚙️ 設定", th: "⚙️ ตั้งค่า" },
    dmca: { en: "© DMCA", zh: "© DMCA", zht: "© DMCA", yue: "© DMCA", th: "© DMCA" },
  };

  const t2 = (key: string) => labels[key]?.[locale] || labels[key]?.en || key;

  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <Heart size={14} className="text-white" fill="white" />
              </div>
              <span className="font-extrabold text-lg">
                ORMFOLK <span className="text-accent">Hub</span>
              </span>
            </div>
            <p className="text-sm text-text-muted">{t2("tagline")}</p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-semibold text-sm text-text-primary mb-3">{t2("explore")}</h4>
            <div className="flex flex-col gap-2">
              <Link href="/forum" className="text-sm text-text-muted hover:text-accent transition-colors">{t2("forum")}</Link>
              <Link href="/creations" className="text-sm text-text-muted hover:text-accent transition-colors">{t2("creations")}</Link>
              <Link href="/gallery" className="text-sm text-text-muted hover:text-accent transition-colors">{t2("gallery")}</Link>
              <Link href="/calendar" className="text-sm text-text-muted hover:text-accent transition-colors">{t2("events")}</Link>
              <Link href="/timeline" className="text-sm text-text-muted hover:text-accent transition-colors">{t2("timeline")}</Link>
              <Link href="/wall" className="text-sm text-text-muted hover:text-accent transition-colors">{t2("wall")}</Link>
              <Link href="/map" className="text-sm text-text-muted hover:text-accent transition-colors">{t2("map")}</Link>
            </div>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-semibold text-sm text-text-primary mb-3">{t2("info")}</h4>
            <div className="flex flex-col gap-2">
              <Link href="/contact" className="text-sm text-text-muted hover:text-accent transition-colors">{t2("contact")}</Link>
              <Link href="/guidelines" className="text-sm text-text-muted hover:text-accent transition-colors">{t2("guidelines")}</Link>
              <Link href="/faq" className="text-sm text-text-muted hover:text-accent transition-colors">{t2("faq")}</Link>
              <Link href="/terms" className="text-sm text-text-muted hover:text-accent transition-colors">{t2("terms")}</Link>
              <Link href="/privacy" className="text-sm text-text-muted hover:text-accent transition-colors">{t2("privacy")}</Link>
              <Link href="/settings" className="text-sm text-text-muted hover:text-accent transition-colors">{t2("settings")}</Link>
              <Link href="/copyright" className="text-sm text-text-muted hover:text-accent transition-colors">{t2("dmca")}</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted">
            © {currentYear} ORMFOLK Hub — {t2("madeWith")}
          </p>
          <p className="text-xs text-text-muted">{t2("disclaimer")}</p>
        </div>
      </div>
    </footer>
  );
}
