const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  const hash = await bcrypt.hash("susu@2024", 12);
  const user = await prisma.user.upsert({
    where: { email: "ofsusu51630@gmail.com" },
    update: { password: hash, role: "admin" },
    create: { email: "ofsusu51630@gmail.com", password: hash, username: "susu", name: "Susu", role: "admin" }
  });
  console.log('Done! Email: ofsusu51630@gmail.com / Password: susu@2024');
  await prisma.$disconnect();
}
main();
