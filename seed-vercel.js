const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cats = [
    { slug: "discussions", nameEn: "Discussions", nameZh: "讨论", nameTh: "พูดคุย", descEn: "General discussions about OrmFolk", descZh: "关于OrmFolk的一般讨论", descTh: "พูดคุยทั่วไปเกี่ยวกับออมโฟล์ค", sort: 0 },
    { slug: "news", nameEn: "News & Updates", nameZh: "新闻更新", nameTh: "ข่าวสาร", descEn: "Latest OrmFolk news", descZh: "最新的OrmFolk新闻", descTh: "ข่าวสารล่าสุดของออมโฟล์ค", sort: 1 },
    { slug: "fan-projects", nameEn: "Fan Projects", nameZh: "粉丝企划", nameTh: "โปรเจกต์แฟน", descEn: "Organize fan projects", descZh: "组织粉丝企划活动", descTh: "จัดโปรเจกต์ของแฟนๆ", sort: 2 },
    { slug: "stories", nameEn: "Fan Stories", nameZh: "同人创作", nameTh: "เรื่องแต่ง", descEn: "Share your fan fiction", descZh: "分享你的同人创作", descTh: "แบ่งปันเรื่องแต่งของคุณ", sort: 3 },
    { slug: "blessings", nameEn: "Blessings Wall", nameZh: "祝福墙", nameTh: "กำแพงคำอวยพร", descEn: "Leave blessings for OrmFolk", descZh: "为OrmFolk留下祝福", descTh: "ฝากคำอวยพรให้ออมโฟล์ค", sort: 4 },
    { slug: "questions", nameEn: "Q&A", nameZh: "问答", nameTh: "ถามตอบ", descEn: "Ask questions about OrmFolk", descZh: "关于OrmFolk的问答", descTh: "ถามตอบเกี่ยวกับออมโฟล์ค", sort: 5 },
  ];
  for (const c of cats) {
    await prisma.forumCategory.upsert({ where: { slug: c.slug }, update: {}, create: { slug: c.slug, nameEn: c.nameEn, nameZh: c.nameZh, nameTh: c.nameTh, descriptionEn: c.descEn, descriptionZh: c.descZh, descriptionTh: c.descTh, sortOrder: c.sort } });
    console.log('Done: ' + c.slug);
  }
  const wm = await prisma.welcomeMessage.findFirst();
  if (!wm) {
    await prisma.welcomeMessage.create({ data: { contentEn: "Welcome to ORMFOLK Hub! 💜", contentZh: "欢迎来到 ORMFOLK Hub！💜", contentTh: "ยินดีต้อนรับสู่ ORMFOLK Hub! 💜", isActive: true } });
    console.log('Created welcome message');
  }
  console.log('All done!');
  await prisma.$disconnect();
}
main();
