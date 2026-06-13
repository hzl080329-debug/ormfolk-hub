import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const cats = [
  { slug: "discussions", nameEn: "Discussions", nameZh: "讨论区", nameTh: "พูดคุย", descriptionEn: "General discussions about OrmFolk.", descriptionZh: "关于 OrmFolk 的综合讨论。", descriptionTh: "พูดคุยทั่วไปเกี่ยวกับ OrmFolk", sortOrder: 1 },
  { slug: "news", nameEn: "News & Updates", nameZh: "新闻动态", nameTh: "ข่าวสาร", descriptionEn: "Latest news and updates about OrmFolk.", descriptionZh: "OrmFolk 最新新闻与动态。", descriptionTh: "ข่าวสารและอัปเดตล่าสุดเกี่ยวกับ OrmFolk", sortOrder: 2 },
  { slug: "questions", nameEn: "Questions", nameZh: "问答求助", nameTh: "คำถาม", descriptionEn: "Ask questions and help fellow fans.", descriptionZh: "提问求助，帮助同好。", descriptionTh: "ถามคำถามและช่วยเหลือเพื่อนแฟนๆ", sortOrder: 3 },
  { slug: "fan-projects", nameEn: "Fan Projects", nameZh: "粉丝企划", nameTh: "โปรเจกต์แฟน", descriptionEn: "Organize and share fan projects and events.", descriptionZh: "组织与分享粉丝企划和活动。", descriptionTh: "จัดระเบียบและแบ่งปันโปรเจกต์แฟนและกิจกรรม", sortOrder: 4 },
  { slug: "stories", nameEn: "Stories", nameZh: "故事分享", nameTh: "เรื่องราว", descriptionEn: "Share your personal OrmFolk stories.", descriptionZh: "分享你与 OrmFolk 的个人故事。", descriptionTh: "แบ่งปันเรื่องราวส่วนตัวเกี่ยวกับ OrmFolk", sortOrder: 5 },
  { slug: "blessings", nameEn: "Blessings", nameZh: "祝福专区", nameTh: "คำอวยพร", descriptionEn: "Send blessings and well-wishes to OrmFolk.", descriptionZh: "为 OrmFolk 送上祝福与心愿。", descriptionTh: "ส่งคำอวยพรและความปรารถนาดีถึง OrmFolk", sortOrder: 6 },
];

const newSlugs = cats.map(c => c.slug);

// 1. Create clean V1 categories (ignore if slug exists)
for (const c of cats) {
  const existing = await prisma.forumCategory.findUnique({ where: { slug: c.slug } });
  if (!existing) {
    await prisma.forumCategory.create({ data: c });
  }
}
console.log("Ensured 6 clean categories exist");

// 2. Get Discussions ID, move all posts to it
const disc = await prisma.forumCategory.findUnique({ where: { slug: "discussions" } });
if (disc) {
  // Use raw SQL to bypass Prisma validation
  await prisma.$executeRawUnsafe(`UPDATE Post SET categoryId = ?`, disc.id);
  console.log("Moved all posts to Discussions");
}

// 3. Delete old categories (not the new 6)
await prisma.forumCategory.deleteMany({
  where: { slug: { notIn: newSlugs } },
});
console.log("Deleted old junk categories");

// 4. Update draft categoryIds to Discussions
await prisma.draft.updateMany({ data: { categoryId: disc?.id } });

await prisma.$disconnect();
console.log("Done!");
