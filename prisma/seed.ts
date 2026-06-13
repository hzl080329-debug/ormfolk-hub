import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // --- Timeline Events ---
  const timeline = [
    { year: 2020, month: 3, day: 14, titleEn: "First Acting Role", titleZh: "首次出演", titleTh: "บทบาทการแสดงครั้งแรก", descriptionEn: "Ormsin made her acting debut in 'En of Love: This is Love Story' as Yiwaa.", descriptionZh: "Ormsin 在《En of Love: This is Love Story》中饰演 Yiwaa，首次亮相。", descriptionTh: "ออมสินเริ่มต้นการแสดงครั้งแรกในเรื่อง 'En of Love: This is Love Story' รับบทเป็น ยี่หวา", type: "drama", actor: "orm" },
    { year: 2022, month: 6, day: 18, titleEn: "Love Mechanics", titleZh: "《爱情力学》播出", titleTh: "Love Mechanics ออกอากาศ", descriptionEn: "Ormsin reprised her role as Yiwaa in the full series 'Love Mechanics'.", descriptionZh: "Ormsin 在完整剧集《Love Mechanics》中再次饰演 Yiwaa。", descriptionTh: "ออมสินกลับมารับบทยี่หวาอีกครั้งในซีรีส์เต็มรูปแบบ 'Love Mechanics'", type: "drama", actor: "orm" },
    { year: 2023, month: 4, day: 5, titleEn: "La Pluie", titleZh: "《那场雨爱上你》", titleTh: "La Pluie ฝนตกครั้งนั้น", descriptionEn: "Ormsin appeared in 'La Pluie' as Dream.", descriptionZh: "Ormsin 在《那场雨爱上你》中饰演 Dream。", descriptionTh: "ออมสินปรากฏตัวในซีรีส์ 'La Pluie' รับบทเป็น ดรีม", type: "drama", actor: "orm" },
    { year: 2024, month: 10, day: 12, titleEn: "Apple My Love Premiere!", titleZh: "《Apple My Love》首播！", titleTh: "Apple My Love เริ่มออกอากาศ!", descriptionEn: "The GL series 'Apple My Love' premiered. Ormsin and Folk star as Kris and Karn, forming the beloved OrmFolk CP.", descriptionZh: "GL 剧《Apple My Love》首播。Ormsin 和 Folk 分别饰演 Kris 和 Karn，组成备受喜爱的 OrmFolk CP。", descriptionTh: "ซีรีส์ GL 'Apple My Love' เริ่มออกอากาศ ออมสินและโฟล์คกลายเป็นคู่จิ้น OrmFolk", type: "drama", actor: "both" },
    { year: 2024, month: 11, day: 16, titleEn: "Apple My Love Finale", titleZh: "《Apple My Love》大结局", titleTh: "Apple My Love ตอนจบ", descriptionEn: "The 6-episode series concluded with an emotional finale.", descriptionZh: "这部 6 集剧集以感人的结局收官。", descriptionTh: "ซีรีส์ 6 ตอนจบลงด้วยตอนจบที่ซาบซึ้ง", type: "event", actor: "both" },
    { year: 2025, month: 1, day: 20, titleEn: "Newcomer GL Acting Award", titleZh: "获得新人 GL 演员奖", titleTh: "รางวัลนักแสดง GL หน้าใหม่", descriptionEn: "Ormsin and Folk won the Newcomer GL Acting Award at Thailand's Pikanesuan Awards.", descriptionZh: "Ormsin 和 Folk 在泰国 Pikanesuan Awards 获得新人 GL 演员奖。", descriptionTh: "ออมสินและโฟล์คได้รับรางวัลนักแสดง GL หน้าใหม่", type: "award", actor: "both" },
    { year: 2025, month: 5, day: 15, titleEn: "Crush The Series Announced", titleZh: "《Crush》新剧公布", titleTh: "ประกาศซีรีส์ Crush", descriptionEn: "OrmFolk confirmed to star in new GL series 'Crush'.", descriptionZh: "OrmFolk 确认出演新 GL 剧《Crush》。", descriptionTh: "OrmFolk ยืนยันนำแสดงในซีรีส์ GL เรื่องใหม่ 'Crush'", type: "drama", actor: "both" },
    { year: 2025, month: 6, day: 1, titleEn: "ORMFOLK Hub Launches", titleZh: "ORMFOLK Hub 上线", titleTh: "ORMFOLK Hub เปิดตัว", descriptionEn: "The global ORMFOLK fan community website officially launches!", descriptionZh: "全球 ORMFOLK 粉丝社区网站正式上线！", descriptionTh: "เว็บไซต์ชุมชนแฟนคลับ ORMFOLK ระดับโลกเปิดตัวอย่างเป็นทางการ!", type: "event", actor: "both" },
  ];
  for (const t of timeline) { await prisma.timelineEntry.create({ data: t }); }
  console.log("✅ Timeline events:", timeline.length);

  // --- Forum Categories (V1: 6 categories) ---
  const existingCats = await prisma.forumCategory.count();
  if (existingCats === 0) {
    const categories = [
      { slug: "discussions", nameEn: "Discussions", nameZh: "讨论区", nameTh: "พูดคุย", descriptionEn: "General discussions about OrmFolk.", descriptionZh: "关于 OrmFolk 的综合讨论。", descriptionTh: "พูดคุยทั่วไปเกี่ยวกับ OrmFolk", sortOrder: 1 },
      { slug: "news", nameEn: "News & Updates", nameZh: "新闻动态", nameTh: "ข่าวสาร", descriptionEn: "Latest news and updates about OrmFolk.", descriptionZh: "OrmFolk 最新新闻与动态。", descriptionTh: "ข่าวสารและอัปเดตล่าสุดเกี่ยวกับ OrmFolk", sortOrder: 2 },
      { slug: "questions", nameEn: "Questions", nameZh: "问答求助", nameTh: "คำถาม", descriptionEn: "Ask questions and help fellow fans.", descriptionZh: "提问求助，帮助同好。", descriptionTh: "ถามคำถามและช่วยเหลือเพื่อนแฟนๆ", sortOrder: 3 },
      { slug: "fan-projects", nameEn: "Fan Projects", nameZh: "粉丝企划", nameTh: "โปรเจกต์แฟน", descriptionEn: "Organize and share fan projects and events.", descriptionZh: "组织与分享粉丝企划和活动。", descriptionTh: "จัดระเบียบและแบ่งปันโปรเจกต์แฟนและกิจกรรม", sortOrder: 4 },
      { slug: "stories", nameEn: "Stories", nameZh: "故事分享", nameTh: "เรื่องราว", descriptionEn: "Share your personal OrmFolk stories.", descriptionZh: "分享你与 OrmFolk 的个人故事。", descriptionTh: "แบ่งปันเรื่องราวส่วนตัวเกี่ยวกับ OrmFolk", sortOrder: 5 },
      { slug: "blessings", nameEn: "Blessings", nameZh: "祝福专区", nameTh: "คำอวยพร", descriptionEn: "Send blessings and well-wishes to OrmFolk.", descriptionZh: "为 OrmFolk 送上祝福与心愿。", descriptionTh: "ส่งคำอวยพรและความปรารถนาดีถึง OrmFolk", sortOrder: 6 },
    ];
    for (const c of categories) { await prisma.forumCategory.create({ data: c }); }
    console.log("✅ Forum categories:", categories.length);
  } else {
    console.log("⏭️  Forum categories already exist, skipping");
  }

  // --- Events ---
  const existingEvents = await prisma.event.count();
  if (existingEvents === 0) {
    const events = [
      { titleEn: "Crush Pilot Release", titleZh: "《Crush》试播集发布", titleTh: "ปล่อย Pilot Crush", descriptionEn: "The official pilot episode drops!", descriptionZh: "Crush 系列官方试播集发布！", descriptionTh: "ตอน Pilot ของ Crush The Series ปล่อยแล้ว!", date: "2025-06-15", location: "YouTube / GagaOOLala", type: "online" },
      { titleEn: "Orm Birthday Fan Meet", titleZh: "Ormsin 生日粉丝见面会", titleTh: "งานแฟนมีตติ้งวันเกิดออมสิน", descriptionEn: "Celebrate Ormsin's birthday with fans worldwide!", descriptionZh: "与全球粉丝一起庆祝 Ormsin 的生日！", descriptionTh: "ฉลองวันเกิดออมสินกับแฟนๆ ทั่วโลก!", date: "2025-05-30", location: "Bangkok, Thailand", type: "offline" },
      { titleEn: "Apple My Love 1st Anniversary", titleZh: "Apple My Love 一周年", titleTh: "ครบรอบ 1 ปี Apple My Love", descriptionEn: "One year since the premiere!", descriptionZh: "首播一周年！", descriptionTh: "ครบ 1 ปีวันออกอากาศ!", date: "2025-10-12", location: "Online", type: "online" },
    ];
    for (const e of events) { await prisma.event.create({ data: e }); }
    console.log("✅ Events:", events.length);
  } else {
    console.log("⏭️  Events already exist, skipping");
  }

  // --- Wall Messages ---
  const existingWall = await prisma.wallMessage.count();
  if (existingWall === 0) {
    const messages = [
      { content: "I started watching Apple My Love during a really tough time in my life. Kris and Karn's story gave me so much comfort. OrmFolk, you mean the world to me. 💜", type: "story", username: "DreamyPurple" },
      { content: "Sending love and blessings to Orm and Folk! May your careers continue to shine bright. 🙏✨", type: "blessing", username: "Anonymous" },
      { content: "ไม่เคยคิดว่าจะมีซีรีส์ที่ทำให้รู้สึกอบอุ่นขนาดนี้ ขอบคุณพี่ออมและพี่โฟล์คที่สร้างโมเมนต์ดีๆ ให้พวกเรา รักนะคะ ❤️", type: "story", username: "ThaiFan_Nong" },
      { content: "From Japan with love! Arigatou for bringing such a beautiful love story to the screen. OrmFolk best GL couple! 💕", type: "blessing", username: "Folkie_JP" },
    ];
    for (const m of messages) { await prisma.wallMessage.create({ data: m }); }
    console.log("✅ Wall messages:", messages.length);
  } else {
    console.log("⏭️  Wall messages already exist, skipping");
  }

  console.log("\n🌱 Seed completed successfully!");
}

main()
  .catch((e) => { console.error("Seed error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
