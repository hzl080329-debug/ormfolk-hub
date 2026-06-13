const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const u = await prisma.user.findUnique({ where: { email: "hzl080329@gmail.com" } });
  console.log(u ? { email: u.email, username: u.username, role: u.role, hasPassword: !!u.password } : 'NOT FOUND');
  await prisma.$disconnect();
}
main();
