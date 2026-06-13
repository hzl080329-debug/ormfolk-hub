"use client";
import { useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const content: Record<string, { title: string; lastUpdated: string; sections: { title: string; body: string }[] }> = {
  "zh": {
    title: "隐私政策",
    lastUpdated: "最后更新：2026年6月",
    sections: [
      { title: "1. 我们收集的信息", body: "我们收集您的电子邮箱、用户名、国家/地区（选填）、城市（选填）以及您在网站上发布的任何内容。我们绝不会出售您的数据。" },
      { title: "2. 信息使用方式", body: "我们使用您的数据来提供社区服务——展示您的个人资料、帖子、评论和社区活动。邮箱用于账户验证、密码重置和重要通知。" },
      { title: "3. Cookies", body: "我们使用必要的 Cookies 来进行身份验证（会话管理）。我们不使用任何追踪型 Cookies 或广告 Cookies。" },
      { title: "4. 数据共享", body: "我们不会与第三方共享您的数据。您的邮箱和密码对任何其他用户不可见。我们不会将您的个人信息用于商业目的。" },
      { title: "5. 您的权利", body: "您可以随时删除您的账户以及所有相关数据。您可以导出您的个人数据。如需删除数据，请通过 hzl080329@gmail.com 联系我们。" },
      { title: "6. 数据安全", body: "密码通过加密哈希存储。我们采取合理措施保护您的数据安全，但无法保证绝对安全。建议您使用强密码并启用两步验证。" },
      { title: "7. 未成年用户", body: "如果您未满18岁，建议在家长或监护人指导下使用本网站。您可以在设置中开启未成年保护模式来过滤敏感内容。" },
      { title: "8. 联系我们", body: "如对隐私政策有任何疑问，请联系：\n电子邮箱：hzl080329@gmail.com\nLINE ID：hzl-08" },
    ],
  },
  "zht": {
    title: "隱私政策",
    lastUpdated: "最後更新：2026年6月",
    sections: [
      { title: "1. 我們收集的資訊", body: "我們收集您的電子郵箱、用戶名稱、國家/地區（選填）、城市（選填）以及您在網站上發布的任何內容。我們絕不會出售您的資料。" },
      { title: "2. 資訊使用方式", body: "我們使用您的資料來提供社群服務——展示您的個人資料、帖子、評論和社群活動。郵箱用於帳戶驗證、密碼重置和重要通知。" },
      { title: "3. Cookies", body: "我們使用必要的 Cookies 來進行身份驗證（會話管理）。我們不使用任何追蹤型 Cookies 或廣告 Cookies。" },
      { title: "4. 資料共享", body: "我們不會與第三方共享您的資料。您的郵箱和密碼對任何其他用戶不可見。我們不會將您的個人資訊用於商業目的。" },
      { title: "5. 您的權利", body: "您可以隨時刪除您的帳戶以及所有相關資料。您可以匯出您的個人資料。如需刪除資料，請通過 hzl080329@gmail.com 聯繫我們。" },
      { title: "6. 資料安全", body: "密碼通過加密雜湊存儲。我們採取合理措施保護您的資料安全，但無法保證絕對安全。建議您使用強密碼並啟用兩步驗證。" },
      { title: "7. 未成年用戶", body: "如果您未滿18歲，建議在家長或監護人指導下使用本網站。您可以在設定中開啟未成年保護模式來過濾敏感內容。" },
      { title: "8. 聯繫我們", body: "如對隱私政策有任何疑問，請聯繫：\n電子郵箱：hzl080329@gmail.com\nLINE ID：hzl-08" },
    ],
  },
  "yue": {
    title: "私隱政策",
    lastUpdated: "最後更新：2026年6月",
    sections: [
      { title: "1. 我哋收集嘅資訊", body: "我哋收集你嘅電郵、用戶名、國家/地區（可選）、城市（可選）同埋你喺網站上發布嘅任何內容。我哋絕對唔會出售你嘅資料。" },
      { title: "2. 資訊使用方式", body: "我哋用你嘅資料嚟提供社群服務——顯示你嘅個人資料、帖子、評論同社群活動。電郵用嚟驗證帳戶、重置密碼同重要通知。" },
      { title: "3. Cookies", body: "我哋用必要嘅 Cookies 嚟做身份驗證（會話管理）。我哋唔用任何追蹤型 Cookies 或者廣告 Cookies。" },
      { title: "4. 資料共享", body: "我哋唔會同第三方共享你嘅資料。你嘅電郵同密碼對任何其他用戶都係不可見嘅。我哋唔會將你嘅個人資訊用喺商業目的。" },
      { title: "5. 你嘅權利", body: "你可以隨時刪除你嘅帳戶同埋所有相關資料。你可以匯出你嘅個人資料。如果需要刪除資料，請通過 hzl080329@gmail.com 聯絡我哋。" },
      { title: "6. 資料安全", body: "密碼通過加密雜湊儲存。我哋採取合理措施保護你嘅資料安全，但冇辦法保證絕對安全。建議你用強密碼同啟用兩步驗證。" },
      { title: "7. 未成年用戶", body: "如果你未滿18歲，建議喺家長或者監護人指導底下用呢個網站。你可以喺設定度開未成年保護模式嚟過濾敏感內容。" },
      { title: "8. 聯絡我哋", body: "如果對私隱政策有任何疑問，請聯絡：\n電郵：hzl080329@gmail.com\nLINE ID：hzl-08" },
    ],
  },
  th: {
    title: "นโยบายความเป็นส่วนตัว",
    lastUpdated: "อัปเดตล่าสุด: มิถุนายน 2026",
    sections: [
      { title: "1. ข้อมูลที่เราเก็บรวบรวม", body: "เราเก็บรวบรวมอีเมล ชื่อผู้ใช้ ประเทศ (ไม่บังคับ) เมือง (ไม่บังคับ) และเนื้อหาใดๆ ที่คุณโพสต์บนเว็บไซต์ เราไม่ขายข้อมูลของคุณโดยเด็ดขาด" },
      { title: "2. วิธีที่เราใช้ข้อมูล", body: "เราใช้ข้อมูลของคุณเพื่อให้บริการชุมชน — แสดงโปรไฟล์ โพสต์ ความคิดเห็น และกิจกรรมชุมชนของคุณ อีเมลใช้สำหรับการยืนยันบัญชี รีเซ็ตรหัสผ่าน และประกาศสำคัญ" },
      { title: "3. คุกกี้", body: "เราใช้คุกกี้ที่จำเป็นสำหรับการยืนยันตัวตน (การจัดการเซสชัน) เราไม่ใช้คุกกี้ติดตามหรือคุกกี้โฆษณาใดๆ" },
      { title: "4. การแบ่งปันข้อมูล", body: "เราไม่แบ่งปันข้อมูลของคุณกับบุคคลภายนอก อีเมลและรหัสผ่านของคุณจะไม่ปรากฏแก่ผู้ใช้รายอื่น เราไม่ใช้ข้อมูลส่วนตัวของคุณเพื่อวัตถุประสงค์ทางการค้า" },
      { title: "5. สิทธิ์ของคุณ", body: "คุณสามารถลบบัญชีและข้อมูลที่เกี่ยวข้องทั้งหมดได้ตลอดเวลา คุณสามารถส่งออกข้อมูลส่วนตัวของคุณได้ หากต้องการลบข้อมูล กรุณาติดต่อเราที่ hzl080329@gmail.com" },
      { title: "6. ความปลอดภัยของข้อมูล", body: "รหัสผ่านถูกเก็บในรูปแบบแฮชที่เข้ารหัส เราใช้มาตรการที่เหมาะสมเพื่อปกป้องข้อมูลของคุณ แต่ไม่สามารถรับประกันความปลอดภัยได้อย่างสมบูรณ์ แนะนำให้ใช้รหัสผ่านที่แข็งแกร่งและเปิดใช้การยืนยันสองขั้นตอน" },
      { title: "7. ผู้ใช้ที่ยังไม่บรรลุนิติภาวะ", body: "หากคุณอายุต่ำกว่า 18 ปี แนะนำให้ใช้เว็บไซต์ภายใต้การดูแลของผู้ปกครอง คุณสามารถเปิดโหมดคุ้มครองเยาวชนในการตั้งค่าเพื่อกรองเนื้อหาที่ละเอียดอ่อน" },
      { title: "8. ติดต่อเรา", body: "หากมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัว กรุณาติดต่อ:\nอีเมล: hzl080329@gmail.com\nLINE ID: hzl-08" },
    ],
  },
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: June 2026",
    sections: [
      { title: "1. Data We Collect", body: "We collect your email, username, country (optional), city (optional), and any content you post on the site. We do NOT sell your data." },
      { title: "2. How We Use Data", body: "We use your data to provide the community service — display your profile, posts, comments, and community activity. Email is used for account verification, password reset, and important notifications." },
      { title: "3. Cookies", body: "We use essential cookies for authentication (session management). We do not use any tracking cookies or advertising cookies." },
      { title: "4. Data Sharing", body: "We do not share your data with third parties. Your email and password are never visible to other users. We do not use your personal information for commercial purposes." },
      { title: "5. Your Rights", body: "You can delete your account and all associated data at any time. You can export your personal data. To request data deletion, contact us at hzl080329@gmail.com." },
      { title: "6. Data Security", body: "Passwords are stored as encrypted hashes. We take reasonable measures to protect your data but cannot guarantee absolute security. We recommend using a strong password and enabling two-factor authentication." },
      { title: "7. Minor Users", body: "If you are under 18, we recommend using the site under parental guidance. You can enable Minor Protection Mode in settings to filter sensitive content." },
      { title: "8. Contact", body: "For any questions about this Privacy Policy, contact:\nEmail: hzl080329@gmail.com\nLINE ID: hzl-08" },
    ],
  },
};

export default function PrivacyPage() {
  const locale = useLocale();
  const t = content[locale] || content.en;
  const isZh = locale === "zh" || locale === "zht" || locale === "yue";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link href={`/${locale}`} className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent mb-6 no-underline"><ArrowLeft size={16} /> {isZh ? "返回" : locale === "th" ? "กลับ" : "Back"}</Link>
      <h1 className="text-3xl font-extrabold mb-2">{t.title}</h1>
      <p className="text-sm text-text-muted mb-8"><em>{t.lastUpdated}</em></p>
      {t.sections.map((s, i) => (
        <div key={i} className="mb-6">
          <h2 className="text-lg font-bold mb-2">{s.title}</h2>
          <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">{s.body}</p>
        </div>
      ))}
    </div>
  );
}
