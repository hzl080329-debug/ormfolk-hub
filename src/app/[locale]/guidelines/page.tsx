"use client";

import { useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Heart, Shield, Ban, AlertTriangle } from "lucide-react";

const rules = [
  { icon: "🤝", title: { en: "Respect all users and fans", zh: "尊重所有用户与粉丝", zht: "尊重所有用戶與粉絲", yue: "尊重所有用戶同粉絲", th: "เคารพผู้ใช้และแฟนคลับทุกคน" } },
  { icon: "🚫", title: { en: "No personal attacks", zh: "禁止人身攻击", zht: "禁止人身攻擊", yue: "禁止人身攻擊", th: "ห้ามโจมตีส่วนบุคคล" } },
  { icon: "🛡️", title: { en: "No harassment, bullying, or threats", zh: "禁止骚扰、霸凌或威胁他人", zht: "禁止騷擾、霸凌或威脅他人", yue: "禁止騷擾、欺凌或威脅他人", th: "ห้ามคุกคาม กลั่นแกล้ง หรือข่มขู่" } },
  { icon: "🔒", title: { en: "No sharing of private/sasaeng info", zh: "禁止发布任何私生信息", zht: "禁止發布任何私生信息", yue: "禁止發布任何私生信息", th: "ห้ามเผยแพร่ข้อมูลส่วนตัว" } },
  { icon: "🔐", title: { en: "No exposing others' private data", zh: "禁止公开他人隐私资料", zht: "禁止公開他人隱私資料", yue: "禁止公開他人私隱資料", th: "ห้ามเปิดเผยข้อมูลส่วนตัวของผู้อื่น" } },
  { icon: "📵", title: { en: "No scams, spam, or malicious ads", zh: "禁止诈骗、引流和垃圾广告", zht: "禁止詐騙、引流和垃圾廣告", yue: "禁止詐騙、引流同垃圾廣告", th: "ห้ามหลอกลวง สแปม และโฆษณา" } },
  { icon: "⚠️", title: { en: "No adult, violent, or illegal content", zh: "禁止色情、暴力及违法内容", zht: "禁止色情、暴力及違法內容", yue: "禁止色情、暴力及違法內容", th: "ห้ามเนื้อหาลามก รุนแรง หรือผิดกฎหมาย" } },
  { icon: "🔥", title: { en: "No trolling or flame-baiting", zh: "禁止恶意引战", zht: "禁止惡意引戰", yue: "禁止惡意引戰", th: "ห้ามยั่วยุหรือก่อกวน" } },
  { icon: "🌍", title: { en: "No politics, religion, or regional disputes", zh: "禁止发布政治、宗教及地区争议内容", zht: "禁止發布政治、宗教及地區爭議內容", yue: "禁止發布政治、宗教同地區爭議內容", th: "ห้ามเนื้อหาการเมือง ศาสนา หรือข้อพิพาทภูมิภาค" } },
  { icon: "💜", title: { en: "Respect artists, staff, and fellow fans", zh: "尊重艺人、工作人员及其他粉丝", zht: "尊重藝人、工作人員及其他粉絲", yue: "尊重藝人、工作人員同其他粉絲", th: "เคารพศิลปิน ทีมงาน และแฟนคลับ" } },
  { icon: "🗣️", title: { en: "Respect different views — discuss rationally", zh: "尊重不同观点，理性讨论", zht: "尊重不同觀點，理性討論", yue: "尊重唔同觀點，理性討論", th: "เคารพความคิดเห็นที่แตกต่าง อภิปรายอย่างมีเหตุผล" } },
  { icon: "🏡", title: { en: "Maintain a friendly & inclusive community", zh: "维护友善、包容的社区环境", zht: "維護友善、包容的社群環境", yue: "維持有善、包容嘅社群環境", th: "รักษาชุมชนที่เป็นมิตรและเปิดกว้าง" } },
];

const reportCategories: Record<string, string[]> = {
  en: ["Harassment", "Hate Speech", "Spam", "Adult Content", "Privacy Leak", "False Info", "Trolling", "Other"],
  zh: ["骚扰", "仇恨言论", "垃圾信息", "色情内容", "隐私泄露", "虚假信息", "引战", "其他"],
  zht: ["騷擾", "仇恨言論", "垃圾資訊", "色情內容", "隱私洩露", "虛假資訊", "引戰", "其他"],
  yue: ["騷擾", "仇恨言論", "垃圾訊息", "色情內容", "私隱洩露", "虛假資訊", "引戰", "其他"],
  th: ["คุกคาม", "คำพูดสร้างความเกลียดชัง", "สแปม", "เนื้อหาลามก", "ข้อมูลส่วนตัวรั่วไหล", "ข้อมูลเท็จ", "ยั่วยุ", "อื่นๆ"],
};

const tText = {
  intro1: {
    en: "To build a friendly, safe, positive, and international fan community,",
    zh: "为打造友善、安全、积极、国际化的粉丝社群，",
    zht: "為打造友善、安全、積極、國際化的粉絲社群，",
    yue: "為咗打造有善、安全、正面、國際化嘅粉絲社群，",
    th: "เพื่อสร้างชุมชนแฟนคลับที่เป็นมิตร ปลอดภัย และเป็นสากล",
  },
  intro2: {
    en: "please follow these guidelines:",
    zh: "请所有用户遵守以下守则：",
    zht: "請所有用戶遵守以下守則：",
    yue: "請所有用戶遵守以下守則：",
    th: "โปรดปฏิบัติตามกฎต่อไปนี้:",
  },
  encouraged: {
    en: "We encourage:",
    zh: "我们鼓励：",
    zht: "我們鼓勵：",
    yue: "我哋鼓勵：",
    th: "เราสนับสนุน:",
  },
  discouraged: {
    en: "We do NOT encourage:",
    zh: "我们不鼓励：",
    zht: "我們不鼓勵：",
    yue: "我哋唔鼓勵：",
    th: "เราไม่สนับสนุน:",
  },
  reportingTitle: {
    en: "Reporting System",
    zh: "举报系统",
    zht: "檢舉系統",
    yue: "舉報系統",
    th: "ระบบรายงาน",
  },
  reportingDesc: {
    en: "All posts, comments, photos, videos, and users can be reported. Please use the report feature to notify admins of any violations.",
    zh: "所有帖子、评论、图片、视频及用户均支持举报。如发现违规内容，请使用举报功能通知管理员。",
    zht: "所有帖子、評論、圖片、視頻及用戶均支援檢舉。如發現違規內容，請使用檢舉功能通知管理員。",
    yue: "所有帖子、評論、圖片、影片同用戶都可以舉報。如果發現違規內容，請用舉報功能通知管理員。",
    th: "สามารถรายงานโพสต์ ความคิดเห็น รูปภาพ วิดีโอ และผู้ใช้ได้ทั้งหมด หากพบเนื้อหาที่ละเมิดกฎ กรุณาใช้ฟังก์ชันรายงานเพื่อแจ้งผู้ดูแล",
  },
  penaltiesTitle: {
    en: "Penalties",
    zh: "违规处罚",
    zht: "違規處罰",
    yue: "違規處罰",
    th: "บทลงโทษ",
  },
};

const encouraged = [
  { en: "Share your creations", zh: "分享你的创作", zht: "分享你的創作", yue: "分享你嘅創作", th: "แบ่งปันผลงานของคุณ" },
  { en: "Share memories & photos", zh: "分享回忆与照片", zht: "分享回憶與照片", yue: "分享回憶同相片", th: "แบ่งปันความทรงจำและรูปภาพ" },
  { en: "Share event info", zh: "分享活动资讯", zht: "分享活動資訊", yue: "分享活動資訊", th: "แบ่งปันข้อมูลกิจกรรม" },
  { en: "Make friends", zh: "结交朋友", zht: "結交朋友", yue: "結識朋友", th: "สร้างเพื่อนใหม่" },
  { en: "Join community events", zh: "参与社区活动", zht: "參與社群活動", yue: "參與社群活動", th: "เข้าร่วมกิจกรรมชุมชน" },
];

const discouraged = [
  { en: "Fan-war tribalism", zh: "饭圈对立", zht: "飯圈對立", yue: "飯圈對立", th: "สงครามแฟนคลับ" },
  { en: "Malicious comparisons", zh: "恶意比较", zht: "惡意比較", yue: "惡意比較", th: "การเปรียบเทียบที่มุ่งร้าย" },
  { en: "Personal attacks", zh: "人身攻击", zht: "人身攻擊", yue: "人身攻擊", th: "การโจมตีส่วนบุคคล" },
  { en: "Trolling & flame-baiting", zh: "引战行为", zht: "引戰行為", yue: "引戰行為", th: "การยั่วยุ" },
];

const penalties = [
  { level: "1st", penalty: { en: "Warning", zh: "警告", zht: "警告", yue: "警告", th: "ตักเตือน" }, color: "bg-yellow-50 text-yellow-700" },
  { level: "2nd", penalty: { en: "Mute 24h", zh: "禁言24小时", zht: "禁言24小時", yue: "禁言24小時", th: "ระงับ 24 ชม." }, color: "bg-orange-50 text-orange-700" },
  { level: "3rd", penalty: { en: "Mute 7 days", zh: "禁言7天", zht: "禁言7天", yue: "禁言7日", th: "ระงับ 7 วัน" }, color: "bg-red-50 text-red-700" },
  { level: "4th", penalty: { en: "Permanent Ban", zh: "永久封禁", zht: "永久封禁", yue: "永久封鎖", th: "แบนถาวร" }, color: "bg-red-100 text-red-800 font-bold" },
];

export default function GuidelinesPage() {
  const locale = useLocale();
  const isTC = locale === "zht" || locale === "yue";
  const isZh = locale === "zh" || isTC;
  const t = (obj: any) => obj[locale] || obj.en;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link href={`/${locale}`} className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors mb-6">
        <ArrowLeft size={16} /> {isZh ? "返回" : locale === "th" ? "กลับ" : "Back"}
      </Link>

      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4">
          <Shield size={28} className="text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-4">
          {locale === "zh" ? "社区守则" : isTC ? "社群守則" : locale === "th" ? "กฎชุมชน" : "Community Guidelines"}
        </h1>
        <p className="text-text-secondary max-w-xl mx-auto">
          {t(tText.intro1)}
          <br />
          {t(tText.intro2)}
        </p>
      </div>

      <div className="space-y-3 mb-10">
        {rules.map((rule, i) => (
          <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-border">
            <span className="text-2xl shrink-0">{rule.icon}</span>
            <div className="flex-1">
              <span className="font-semibold text-text-primary">{i + 1}. {t(rule.title)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 mb-10">
        <div className="p-5 bg-green-50 rounded-2xl border border-green-100">
          <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
            <Heart size={18} /> {t(tText.encouraged)}
          </h3>
          <ul className="text-sm text-green-700 space-y-1">
            {encouraged.map((item, i) => (
              <li key={i}>✅ {t(item)}</li>
            ))}
          </ul>
        </div>

        <div className="p-5 bg-red-50 rounded-2xl border border-red-100">
          <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2">
            <Ban size={18} /> {t(tText.discouraged)}
          </h3>
          <ul className="text-sm text-red-700 space-y-1">
            {discouraged.map((item, i) => (
              <li key={i}>❌ {t(item)}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="p-5 bg-white rounded-2xl border border-border mb-6">
        <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2">
          <AlertTriangle size={18} className="text-warning" />
          {t(tText.reportingTitle)}
        </h3>
        <p className="text-sm text-text-secondary mb-3">
          {t(tText.reportingDesc)}
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          {(reportCategories[locale] || reportCategories.en).map((r: string) => (
            <span key={r} className="px-2 py-1 bg-background rounded-full text-text-muted">{r}</span>
          ))}
        </div>
      </div>

      <div className="p-5 bg-white rounded-2xl border border-border">
        <h3 className="font-bold text-text-primary mb-3">
          {t(tText.penaltiesTitle)}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
          {penalties.map((p) => (
            <div key={p.level} className={`p-3 rounded-xl ${p.color}`}>
              <div className="text-xs opacity-70">{p.level}</div>
              <div className="font-semibold">{t(p.penalty)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
