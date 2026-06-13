import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.log("Usage: npx tsx prisma/promote-admin.ts <email>");
    console.log("\nAvailable users:");
    const users = await prisma.user.findMany({ select: { email: true, username: true, role: true } });
    users.forEach((u) => console.log(`  ${u.email} (${u.username}) [${u.role}]`));
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: "admin" },
  });

  console.log(`✅ Promoted ${user.email} (${user.username}) to admin`);
  await prisma.$disconnect();
}

main();
