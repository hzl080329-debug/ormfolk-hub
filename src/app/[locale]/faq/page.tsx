"use client";
import { useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const faqs = [
  { q: { en: "How do I create a post?", zh: "如何发帖？", zht: "如何發帖？", yue: "點樣出帖？", th: "จะสร้างโพสต์อย่างไร?" }, a: { en: "Go to Forum → click 'New Post' → select a category → write your title and content → click Post!", zh: "前往论坛 → 点击「发帖」→ 选择分区 → 写标题和内容 → 点击发布！", zht: "前往論壇 → 點擊「發帖」→ 選擇分區 → 寫標題和內容 → 點擊發布！", yue: "去論壇 → 撳「出帖」→ 揀分區 → 寫標題同內容 → 撳發布！", th: "ไปที่ฟอรั่ม → คลิก 'โพสต์ใหม่' → เลือกหมวดหมู่ → เขียนหัวข้อและเนื้อหา → คลิกโพสต์!" } },
  { q: { en: "How do I upload photos?", zh: "如何上传照片？", zht: "如何上傳照片？", yue: "點樣上載相？", th: "จะอัปโหลดรูปภาพอย่างไร?" }, a: { en: "Admins can upload via Admin → Photos. All users can view them in the Gallery!", zh: "管理员可通过 Admin → 图库上传。所有用户可在图片广场查看！", zht: "管理員可通過 Admin → 圖庫上傳。所有用戶可在圖片廣場查看！", yue: "管理員可以通過 Admin → 圖庫上載。所有用戶都可以喺圖片廣場睇到！", th: "แอดมินสามารถอัปโหลดผ่าน Admin → Photos ผู้ใช้ทุกคนสามารถดูได้ในแกลเลอรี่!" } },
  { q: { en: "How do I change my avatar?", zh: "如何修改头像？", zht: "如何修改頭像？", yue: "點樣換頭像？", th: "จะเปลี่ยนรูปโปรไฟล์อย่างไร?" }, a: { en: "Go to your Profile → Edit Profile → Upload a new avatar.", zh: "前往个人主页 → 编辑资料 → 上传新头像。", zht: "前往個人主頁 → 編輯資料 → 上傳新頭像。", yue: "去你嘅個人主頁 → 編輯資料 → 上載新頭像。", th: "ไปที่โปรไฟล์ → แก้ไขโปรไฟล์ → อัปโหลดรูปใหม่" } },
  { q: { en: "How do I report something?", zh: "如何举报内容？", zht: "如何檢舉內容？", yue: "點樣舉報內容？", th: "จะรายงานเนื้อหาได้อย่างไร?" }, a: { en: "Click the Report button on any post or comment. Admins will review it.", zh: "点击帖子或评论的举报按钮。管理员会审核。", zht: "點擊帖子或評論的檢舉按鈕。管理員會審核。", yue: "撳帖子或者評論嘅舉報掣。管理員會審核。", th: "คลิกปุ่มรายงานบนโพสต์หรือความคิดเห็น แอดมินจะตรวจสอบ" } },
  { q: { en: "What is XP and how do I level up?", zh: "什么是经验值？如何升级？", zht: "什麼是經驗值？如何升級？", yue: "咩係經驗值？點樣升級？", th: "XP คืออะไร และจะเลเวลอัพได้อย่างไร?" }, a: { en: "Earn XP by posting (+10), commenting (+5), and uploading creations (+10). Level up from Lv1 to Lv10!", zh: "发帖 +10 XP、评论 +5 XP、上传创作 +10 XP。从 Lv1 升到 Lv10！", zht: "發帖 +10 XP、評論 +5 XP、上傳創作 +10 XP。從 Lv1 升到 Lv10！", yue: "出帖 +10 XP、留言 +5 XP、上載創作 +10 XP。由 Lv1 升到 Lv10！", th: "รับ XP โดยการโพสต์ (+10) แสดงความคิดเห็น (+5) และอัปโหลดผลงาน (+10) เลเวลอัพจาก Lv1 ถึง Lv10!" } },
  { q: { en: "How do I change my language?", zh: "如何切换语言？", zht: "如何切換語言？", yue: "點樣轉語言？", th: "จะเปลี่ยนภาษาได้อย่างไร?" }, a: { en: "Use the language switcher in the header — choose EN / 中文 / ไทย.", zh: "使用顶部的语言切换器，选择 EN / 中文 / ไทย。", zht: "使用頂部的語言切換器，選擇 EN / 中文 / ไทย。", yue: "用頂部嘅語言切換器，揀 EN / 中文 / ไทย。", th: "ใช้ตัวเปลี่ยนภาษาที่ด้านบน เลือก EN / 中文 / ไทย" } },
  { q: { en: "How do I contact the admin?", zh: "如何联系管理员？", zht: "如何聯繫管理員？", yue: "點樣聯絡管理員？", th: "จะติดต่อแอดมินได้อย่างไร?" }, a: { en: "Visit the Contact page — email hzl080329@gmail.com or add LINE: hzl-08.", zh: "访问联系页面 — 邮箱 hzl080329@gmail.com 或 LINE: hzl-08。", zht: "訪問聯繫頁面 — 郵箱 hzl080329@gmail.com 或 LINE: hzl-08。", yue: "去聯絡頁面 — 電郵 hzl080329@gmail.com 或者 LINE: hzl-08。", th: "ไปที่หน้าติดต่อ — อีเมล hzl080329@gmail.com หรือ LINE: hzl-08" } },
  { q: { en: "I forgot my password!", zh: "我忘记密码了！", zht: "我忘記密碼了！", yue: "我唔記得密碼！", th: "ฉันลืมรหัสผ่าน!" }, a: { en: "Click 'Forgot Password' on the login page. Enter your email and follow the steps.", zh: "在登录页点击「忘记密码」。输入邮箱并按步骤操作。", zht: "在登錄頁點擊「忘記密碼」。輸入郵箱並按步驟操作。", yue: "喺登錄頁撳「唔記得密碼」。入電郵跟住步驟做。", th: "คลิก 'ลืมรหัสผ่าน' ในหน้าเข้าสู่ระบบ กรอกอีเมลและทำตามขั้นตอน" } },
];

export default function FAQPage() {
  const locale = useLocale();
  const [open, setOpen] = useState<number | null>(null);
  const t = (obj: any) => obj[locale] || obj.en;
  const isZh = locale === "zh" || locale === "zht" || locale === "yue";
  const isTC = locale === "zht" || locale === "yue";
  const isTh = locale === "th";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link href={`/${locale}`} className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent mb-6"><ArrowLeft size={16} /> {isTh ? "กลับ" : isZh ? "返回" : "Back"}</Link>
      <div className="text-center mb-10">
        <HelpCircle size={40} className="mx-auto text-accent mb-4" />
        <h1 className="text-3xl font-extrabold mb-4">{isTh ? "คำถามที่พบบ่อย" : isTC ? "常見問題" : isZh ? "常见问题" : "FAQ"}</h1>
        <p className="text-text-muted">{isTh ? "ไม่พบคำตอบ? ติดต่อเราได้ที่หน้าติดต่อ!" : isTC ? "搵唔到答案？去聯絡頁面話畀我哋知！" : isZh ? "找不到答案？去联系页面告诉我们！" : "Can't find your answer? Reach out on the Contact page!"}</p>
      </div>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white rounded-xl border overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full p-4 flex items-center justify-between text-left hover:bg-background/50">
              <span className="font-semibold text-sm">{t(faq.q)}</span>
              {open === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {open === i && <div className="px-4 pb-4 text-sm text-text-secondary">{t(faq.a)}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
