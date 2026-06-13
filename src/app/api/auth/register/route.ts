import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, password, username, country, city, verificationCode } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Verify email code (optional for dev, can be enforced later)
    if (verificationCode) {
      const record = await prisma.verificationCode.findFirst({
        where: { email, code: verificationCode, type: "register", used: false, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
      });
      if (!record) return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
      await prisma.verificationCode.update({ where: { id: record.id }, data: { used: true } });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 },
      );
    }

    // Check username uniqueness
    if (username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUsername) {
        return NextResponse.json(
          { error: "This username is already taken" },
          { status: 409 },
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // First user becomes admin
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? "admin" : "user";

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username: username || email.split("@")[0],
        name: username || email.split("@")[0],
        role,
        title: "susu",
        country: country || null,
        city: city || null,
      },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 },
    );
  }
}
