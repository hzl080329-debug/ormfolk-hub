import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL || "";
  // Vercel Postgres uses pgbouncer — Prisma needs this flag to disable prepared statements
  if (url && url.includes("sslmode=require") && !url.includes("pgbouncer=true")) {
    return new PrismaClient({
      datasources: { db: { url: url + "&pgbouncer=true" } },
    });
  }
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
