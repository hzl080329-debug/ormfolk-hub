"use client";
import { useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const content: Record<string, { title: string; lastUpdated: string; sections: { title: string; body: string }[] }> = {
  "zh": {
    title: "服务条款",
    lastUpdated: "最后更新：2026年6月",
    sections: [
      { title: "1. 接受条款", body: "使用 ORMFOLK Hub 即表示您同意本服务条款。如果您不同意，请勿使用本网站。" },
      { title: "2. 用户行为规范", body: "用户必须遵守我们的社区守则。严格禁止骚扰、垃圾信息、违法内容以及侵犯他人隐私的行为。违规者将根据违规次数受到警告、禁言或永久封禁处罚。" },
      { title: "3. 内容所有权", body: "您保留对所发布内容的所有权。发布内容即表示您授予我们在网站上展示该内容的许可。我们保留删除违反政策内容的权利。" },
      { title: "4. 账户安全", body: "您对账户安全负有责任。我们保留暂停或终止违反条款账户的权利。请勿与他人共享账户密码。" },
      { title: "5. 版权与 DMCA", body: "ORMFOLK Hub 尊重知识产权。如果您认为网站上的内容侵犯了您的版权，请发送 DMCA 通知至 hzl080329@gmail.com。我们将在收到有效通知后及时处理。" },
      { title: "6. 免责声明", body: "ORMFOLK Hub 是由粉丝创建、为粉丝服务的社区网站，与任何经纪公司或艺人均无关联。使用本网站的风险由您自行承担。我们不保证网站服务不会中断。" },
      { title: "7. 隐私保护", body: "我们重视您的隐私。请参阅我们的隐私政策了解详情。我们不会出售您的个人数据。" },
      { title: "8. 条款修改", body: "我们保留随时修改本条款的权利。重大变更将通过网站公告通知。继续使用本网站即表示您接受修改后的条款。" },
      { title: "9. 联系方式", body: "如有任何问题，请通过以下方式联系我们：\n电子邮箱：hzl080329@gmail.com\nLINE ID：hzl-08" },
    ],
  },
  "zht": {
    title: "服務條款",
    lastUpdated: "最後更新：2026年6月",
    sections: [
      { title: "1. 接受條款", body: "使用 ORMFOLK Hub 即表示您同意本服務條款。如果您不同意，請勿使用本網站。" },
      { title: "2. 用戶行為規範", body: "用戶必須遵守我們的社群守則。嚴格禁止騷擾、垃圾資訊、違法內容以及侵犯他人隱私的行為。違規者將根據違規次數受到警告、禁言或永久封禁處罰。" },
      { title: "3. 內容所有權", body: "您保留對所發布內容的所有權。發布內容即表示您授予我們在網站上展示該內容的許可。我們保留刪除違反政策內容的權利。" },
      { title: "4. 帳戶安全", body: "您對帳戶安全負有責任。我們保留暫停或終止違反條款帳戶的權利。請勿與他人共享帳戶密碼。" },
      { title: "5. 版權與 DMCA", body: "ORMFOLK Hub 尊重知識產權。如果您認為網站上的內容侵犯了您的版權，請發送 DMCA 通知至 hzl080329@gmail.com。我們將在收到有效通知後及時處理。" },
      { title: "6. 免責聲明", body: "ORMFOLK Hub 是由粉絲創建、為粉絲服務的社群網站，與任何經紀公司或藝人均無關聯。使用本網站的風險由您自行承擔。我們不保證網站服務不會中斷。" },
      { title: "7. 隱私保護", body: "我們重視您的隱私。請參閱我們的隱私政策了解詳情。我們不會出售您的個人資料。" },
      { title: "8. 條款修改", body: "我們保留隨時修改本條款的權利。重大變更將通過網站公告通知。繼續使用本網站即表示您接受修改後的條款。" },
      { title: "9. 聯繫方式", body: "如有任何問題，請通過以下方式聯繫我們：\n電子郵箱：hzl080329@gmail.com\nLINE ID：hzl-08" },
    ],
  },
  "yue": {
    title: "服務條款",
    lastUpdated: "最後更新：2026年6月",
    sections: [
      { title: "1. 接受條款", body: "用 ORMFOLK Hub 即係表示你同意呢份服務條款。如果你唔同意，請唔好用呢個網站。" },
      { title: "2. 用戶行為規範", body: "用戶一定要跟返我哋嘅社群守則。嚴格禁止騷擾、垃圾訊息、違法內容同埋侵犯他人私隱嘅行為。犯規嘅會根據犯規次數收到警告、禁言或者永久封鎖。" },
      { title: "3. 內容所有權", body: "你保留返你所發布內容嘅所有權。發布內容即係表示你授權我哋喺網站上展示嗰個內容。我哋保留刪除違反政策內容嘅權利。" },
      { title: "4. 帳戶安全", body: "你要對自己帳戶嘅安全負責。我哋保留暫停或者終止違反條款帳戶嘅權利。唔好同其他人共享帳戶密碼。" },
      { title: "5. 版權同 DMCA", body: "ORMFOLK Hub 尊重知識產權。如果你覺得網站上嘅內容侵犯咗你嘅版權，請發送 DMCA 通知去 hzl080329@gmail.com。我哋會喺收到有效通知之後盡快處理。" },
      { title: "6. 免責聲明", body: "ORMFOLK Hub 係由粉絲創建、為粉絲服務嘅社群網站，同任何經理人公司或者藝人都冇關聯。用呢個網站嘅風險你要自己承擔。我哋唔保證網站服務唔會中斷。" },
      { title: "7. 私隱保護", body: "我哋重視你嘅私隱。請參閱我哋嘅私隱政策了解詳情。我哋唔會出售你嘅個人資料。" },
      { title: "8. 條款修改", body: "我哋保留隨時修改呢份條款嘅權利。重大變更會通過網站公告通知。繼續用呢個網站即係表示你接受修改咗嘅條款。" },
      { title: "9. 聯絡方法", body: "如果有任何問題，請通過以下方式聯絡我哋：\n電郵：hzl080329@gmail.com\nLINE ID：hzl-08" },
    ],
  },
  th: {
    title: "ข้อกำหนดในการให้บริการ",
    lastUpdated: "อัปเดตล่าสุด: มิถุนายน 2026",
    sections: [
      { title: "1. การยอมรับข้อกำหนด", body: "การใช้ ORMFOLK Hub ถือว่าคุณยอมรับข้อกำหนดในการให้บริการนี้ หากคุณไม่เห็นด้วย กรุณาอย่าใช้เว็บไซต์นี้" },
      { title: "2. การปฏิบัติตัวของผู้ใช้", body: "ผู้ใช้ต้องปฏิบัติตามกฎชุมชนของเรา ห้ามคุกคาม สแปม เนื้อหาผิดกฎหมาย และการละเมิดความเป็นส่วนตัวโดยเด็ดขาด ผู้ฝ่าฝืนจะได้รับการตักเตือน ระงับการใช้งาน หรือแบนถาวรตามจำนวนครั้งที่ฝ่าฝืน" },
      { title: "3. ความเป็นเจ้าของเนื้อหา", body: "คุณยังคงเป็นเจ้าของเนื้อหาที่คุณโพสต์ การโพสต์เนื้อหาถือว่าคุณอนุญาตให้เราแสดงเนื้อหานั้นบนเว็บไซต์ เราขอสงวนสิทธิ์ในการลบเนื้อหาที่ละเมิดนโยบายของเรา" },
      { title: "4. ความปลอดภัยของบัญชี", body: "คุณมีหน้าที่รับผิดชอบความปลอดภัยของบัญชีของคุณ เราขอสงวนสิทธิ์ในการระงับหรือยุติบัญชีที่ละเมิดข้อกำหนด อย่าแชร์รหัสผ่านบัญชีกับผู้อื่น" },
      { title: "5. ลิขสิทธิ์และ DMCA", body: "ORMFOLK Hub เคารพทรัพย์สินทางปัญญา หากคุณเชื่อว่าเนื้อหาบนเว็บไซต์ละเมิดลิขสิทธิ์ของคุณ กรุณาส่งคำร้อง DMCA ไปที่ hzl080329@gmail.com เราจะดำเนินการโดยเร็วเมื่อได้รับคำร้องที่ถูกต้อง" },
      { title: "6. ข้อจำกัดความรับผิดชอบ", body: "ORMFOLK Hub เป็นชุมชนที่สร้างโดยแฟนๆ เพื่อแฟนๆ ไม่เกี่ยวข้องกับต้นสังกัดหรือศิลปินใดๆ การใช้เว็บไซต์นี้เป็นความเสี่ยงของคุณเอง เราไม่รับประกันว่าบริการจะไม่หยุดชะงัก" },
      { title: "7. การคุ้มครองความเป็นส่วนตัว", body: "เราให้ความสำคัญกับความเป็นส่วนตัวของคุณ กรุณาอ่านนโยบายความเป็นส่วนตัวของเราสำหรับรายละเอียดเพิ่มเติม เราไม่ขายข้อมูลส่วนตัวของคุณ" },
      { title: "8. การแก้ไขข้อกำหนด", body: "เราขอสงวนสิทธิ์ในการแก้ไขข้อกำหนดนี้เมื่อใดก็ได้ การเปลี่ยนแปลงที่สำคัญจะแจ้งผ่านประกาศบนเว็บไซต์ การใช้เว็บไซต์ต่อไปถือว่าคุณยอมรับข้อกำหนดที่แก้ไขแล้ว" },
      { title: "9. ติดต่อ", body: "หากมีคำถามใดๆ กรุณาติดต่อเราผ่านช่องทางต่อไปนี้:\nอีเมล: hzl080329@gmail.com\nLINE ID: hzl-08" },
    ],
  },
  en: {
    title: "Terms of Service",
    lastUpdated: "Last updated: June 2026",
    sections: [
      { title: "1. Acceptance", body: "By using ORMFOLK Hub, you agree to these Terms of Service. If you disagree, please do not use the site." },
      { title: "2. User Conduct", body: "Users must follow our Community Guidelines. Harassment, spam, illegal content, and privacy violations are strictly prohibited. Violators will receive warnings, mutes, or permanent bans depending on the number of violations." },
      { title: "3. Content Ownership", body: "You retain ownership of your posted content. By posting, you grant us a license to display it on the site. We reserve the right to remove content that violates our policies." },
      { title: "4. Account Security", body: "You are responsible for your account security. We reserve the right to suspend or terminate accounts that violate our terms. Do not share your account password with others." },
      { title: "5. Copyright & DMCA", body: "ORMFOLK Hub respects intellectual property rights. If you believe content on our site infringes your copyright, please send a DMCA notice to hzl080329@gmail.com. We will respond promptly upon receiving a valid notice." },
      { title: "6. Disclaimer", body: "ORMFOLK Hub is a fan-made community for fans, not affiliated with any agency or artist. Use the site at your own risk. We do not guarantee uninterrupted service." },
      { title: "7. Privacy", body: "We value your privacy. Please see our Privacy Policy for details. We do not sell your personal data." },
      { title: "8. Changes to Terms", body: "We reserve the right to modify these terms at any time. Significant changes will be announced on the site. Continued use of the site constitutes acceptance of the modified terms." },
      { title: "9. Contact", body: "For any questions, please contact us at:\nEmail: hzl080329@gmail.com\nLINE ID: hzl-08" },
    ],
  },
};

export default function TermsPage() {
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
