import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let profile: any = null;
  let isFollowing = false;

  try {
    const { prisma } = await import("@/lib/prisma");
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

    const session = await auth();
    if (session?.user?.id && session.user.id !== id) {
      try {
        const follow = await prisma.follow.findUnique({
          where: { followerId_followingId: { followerId: session.user.id, followingId: id } },
        });
        isFollowing = !!follow;
      } catch {}
    }

    profile = {
      id: user.id,
      username: user.username,
      name: user.name,
      bio: user.bio,
      title: user.title,
      image: user.image,
      city: user.city,
      country: user.country,
      role: user.role,
      joinedAt: user.joinedAt?.toISOString?.() || user.joinedAt,
      stats: {
        posts: user._count.posts,
        creations: user._count.creations,
        messages: user._count.wallMessages,
        likes: user._count.likes,
        followers: user._count.followers,
        following: user._count.following,
      },
      posts: (user.posts || []).map((p: any) => ({ ...p, createdAt: p.createdAt?.toISOString?.() || p.createdAt, category: p.category ? { slug: p.category.slug } : null })),
      creations: (user.creations || []).map((c: any) => ({ ...c, createdAt: c.createdAt?.toISOString?.() || c.createdAt })),
      wallMessages: (user.wallMessages || []).map((m: any) => ({ ...m, createdAt: m.createdAt?.toISOString?.() || m.createdAt })),
      xp: user.xp,
      level: user.level,
      achievements: (user.achievements || []).map((a: any) => a.type),
      galleryItems: (user.galleryItems || []).map((g: any) => ({ id: g.id, url: g.url, tag: g.tag, category: g.category })),
    };
  } catch (e) {
    console.error("Profile load failed:", e);
    return <ProfileClient profile={null} isFollowing={false} />;
  }

  return <ProfileClient profile={profile} isFollowing={isFollowing} />;
}
