import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      posts: { orderBy: { createdAt: "desc" }, take: 10, include: { category: true } },
      creations: { orderBy: { createdAt: "desc" }, take: 10 },
      wallMessages: { orderBy: { createdAt: "desc" }, take: 10 },
      _count: { select: { posts: true, creations: true, wallMessages: true, likes: true, followers: true, following: true } },
      achievements: true,
      galleryItems: { orderBy: { createdAt: "desc" }, take: 8 },
    },
  });

  if (!user) notFound();

  // Check if current user is following this user
  let isFollowing = false;
  const session = await auth();
  if (session?.user?.id && session.user.id !== id) {
    const follow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: session.user.id, followingId: id } },
    });
    isFollowing = !!follow;
  }

  const serialized = {
    id: user.id,
    username: user.username,
    name: user.name,
    bio: user.bio,
    title: user.title,
    image: user.image,
    city: user.city,
    country: user.country,
    role: user.role,
    joinedAt: user.joinedAt.toISOString(),
    stats: {
      posts: user._count.posts,
      creations: user._count.creations,
      messages: user._count.wallMessages,
      likes: user._count.likes,
      followers: user._count.followers,
      following: user._count.following,
    },
    posts: user.posts.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      category: p.category ? { slug: p.category.slug } : null,
    })),
    creations: user.creations.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })),
    wallMessages: user.wallMessages.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    })),
    xp: user.xp,
    level: user.level,
    achievements: user.achievements.map(a => a.type),
    galleryItems: user.galleryItems.map(g => ({ id: g.id, url: g.url, tag: g.tag, category: g.category })),
  };

  return <ProfileClient profile={serialized} isFollowing={isFollowing} />;
}
