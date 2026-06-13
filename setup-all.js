const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // 1. Superadmin
  const hash = await bcrypt.hash("lfesk0329", 12);
  await prisma.user.upsert({
    where: { email: "hzl080329@gmail.com" },
    update: { password: hash, role: "superadmin" },
    create: { email: "hzl080329@gmail.com", password: hash, username: "admin", name: "Admin", role: "superadmin" }
  });
  console.log('✅ superadmin ready');

  // 2. Forum categories
  const cats = [
    { slug: "discussions", nameEn: "Discussions", nameZh: "討論", nameTh: "พูดคุย", desc: "OrmFolk general discussion", sort: 0 },
    { slug: "news", nameEn: "News", nameZh: "新聞", nameTh: "ข่าวสาร", desc: "Latest OrmFolk news", sort: 1 },
    { slug: "fan-projects", nameEn: "Fan Projects", nameZh: "粉絲企劃", nameTh: "โปรเจกต์แฟน", desc: "Fan projects & events", sort: 2 },
    { slug: "stories", nameEn: "Fan Stories", nameZh: "同人創作", nameTh: "เรื่องแต่ง", desc: "Fan fiction & stories", sort: 3 },
    { slug: "blessings", nameEn: "Blessings", nameZh: "祝福牆", nameTh: "กำแพงคำอวยพร", desc: "Blessings for OrmFolk", sort: 4 },
    { slug: "questions", nameEn: "Q&A", nameZh: "問答", nameTh: "ถามตอบ", desc: "Ask & answer", sort: 5 },
  ];
  for (const c of cats) {
    await prisma.forumCategory.upsert({
      where: { slug: c.slug },
      update: {},
      create: { slug: c.slug, nameEn: c.nameEn, nameZh: c.nameZh, nameTh: c.nameTh, descriptionEn: c.desc, descriptionZh: c.desc, descriptionTh: c.desc, sortOrder: c.sort }
    });
  }
  console.log('✅ forum categories');

  // 3. Welcome message
  const wm = await prisma.welcomeMessage.findFirst();
  if (!wm) {
    await prisma.welcomeMessage.create({ data: { contentEn: "Welcome to ORMFOLK Hub! 💜", contentZh: "歡迎來到 ORMFOLK Hub！💜", contentZht: "歡迎來到 ORMFOLK Hub！💜", contentYue: "歡迎嚟到 ORMFOLK Hub！💜", contentTh: "ยินดีต้อนรับสู่ ORMFOLK Hub! 💜", isActive: true } });
  }
  console.log('✅ welcome message');

  // 4. Verify
  const userCount = await prisma.user.count();
  const catCount = await prisma.forumCategory.count();
  console.log(`\n🎉 ALL DONE! Users: ${userCount}, Categories: ${catCount}`);
  await prisma.$disconnect();
}
main();
