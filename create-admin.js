const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  const hash = await bcrypt.hash("lfesk0329", 12);
  const user = await prisma.user.upsert({
    where: { email: "hzl080329@gmail.com" },
    update: { password: hash, role: "superadmin" },
    create: { email: "hzl080329@gmail.com", password: hash, username: "admin", name: "Admin", role: "superadmin" }
  });
  console.log('superadmin ready:', user.email, user.role);
  await prisma.$disconnect();
}
main();
