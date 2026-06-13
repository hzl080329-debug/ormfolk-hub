import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_ID !== "your-google-client-id"
      ? [Google({
          clientId: process.env.AUTH_GOOGLE_ID,
          clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
        })]
      : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      const userId = user?.id || token.id;
      // Load check-in stats on login AND on session update
      if (user || trigger === "update") {
        if (user) {
          token.id = user.id;
          token.role = (user as any).role || user.role || "user";
          token.xp = (user as any).xp || 0;
          token.level = (user as any).level || 1;
          token.country = (user as any).country || "";
          token.image = (user as any).image || (user as any).picture || "";
        }
        // Load check-in stats (always refresh on update)
        try {
          const today = new Date().toISOString().split("T")[0];
          const checkIns = await prisma.checkIn.findMany({
            where: { userId: userId as string },
            orderBy: { date: "desc" },
          });
          token.totalCheckIns = checkIns.length;
          token.checkedToday = checkIns.some(c => c.date === today);
          // Calculate streak
          let streak = 0;
          const todayDate = new Date();
          for (let i = 0; i < 365; i++) {
            const d = new Date(todayDate); d.setDate(d.getDate() - i);
            const ds = d.toISOString().split("T")[0];
            if (checkIns.some(c => c.date === ds)) streak++;
            else break;
          }
          token.checkInStreak = streak;
        } catch { token.totalCheckIns = 0; token.checkedToday = false; token.checkInStreak = 0; }
      }
      // Always refresh xp/level (they change frequently via server actions)
      if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({ where: { id: token.id as string } });
          if (dbUser) {
            token.xp = dbUser.xp;
            token.level = dbUser.level;
            token.country = dbUser.country || "";
            token.image = dbUser.image || "";
          }
        } catch {}
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = (token.role as string) || "user";
        (session.user as any).xp = token.xp;
        (session.user as any).level = token.level;
        (session.user as any).country = token.country;
        (session.user as any).totalCheckIns = token.totalCheckIns;
        (session.user as any).checkedToday = token.checkedToday;
        (session.user as any).checkInStreak = token.checkInStreak;
        if (token.image) session.user.image = token.image as string;
      }
      return session;
    },
  },
});
