"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { auth } from "./auth";
import { cookies } from "next/headers";

// XP & Level system (based on posts, comments, creations)
const XP_PER_LEVEL = [0, 10, 30, 60, 100, 160, 240, 350, 500, 700, 1000, 1500, 2200, 3200, 4500, 6200, 8500, 11500, 15500, 21000];

async function addXP(userId: string, amount: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;
  const newXP = user.xp + amount;
  let newLevel = user.level;
  for (let i = newLevel; i < XP_PER_LEVEL.length; i++) {
    if (newXP >= XP_PER_LEVEL[i]) newLevel = i + 1;
    else break;
  }
  await prisma.user.update({ where: { id: userId }, data: { xp: newXP, level: newLevel } });
}

// ============================================================
// Forum Posts
// ============================================================

export async function createPost(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("You must be logged in to post");

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const categoryId = formData.get("categoryId") as string;
  const eventId = (formData.get("eventId") as string) || null;
  const tagsStr = (formData.get("tags") as string) || "";
  const imageUrlsRaw = (formData.get("imageUrlsRaw") as string) || "";
  const isSpoiler = formData.get("isSpoiler") === "true";
  const spoilerTitle = (formData.get("spoilerTitle") as string) || null;

  if (!title || !content || !categoryId) throw new Error("Missing required fields");

  // Parse image URLs
  const imageUrls = imageUrlsRaw ? imageUrlsRaw.split("\n").map(u => u.trim()).filter(Boolean).slice(0, 10) : [];

  checkRateLimit(session.user.id, "post", 5, 60000); // max 5 posts per minute
  const reviewStatus = await moderateContent(title, content);

  // Process tags: split by comma, trim, filter empty, lowercase
  const tagNames = tagsStr.split(",").map(t => t.trim().toLowerCase()).filter(Boolean).slice(0, 5);

  // Auto-translate: only if post language differs from user's page language
  const userLocale = (formData.get("locale") as string) || "en";
  const srcLang = await detectLang(title);
  const shouldTranslate = srcLang !== (userLocale === "zh" || userLocale === "zht" || userLocale === "yue" ? "zh" : userLocale === "th" ? "th" : "en");

  let finalTitle = title, finalContent = content, titleZh: string|null = null, contentZh: string|null = null, titleTh: string|null = null, contentTh: string|null = null;
  if (shouldTranslate) {
    const [titleTrans, contentTrans] = await Promise.all([autoTranslate(title), autoTranslate(content)]);
    finalTitle = titleTrans.en;
    finalContent = contentTrans.en;
    titleZh = titleTrans.zh;
    contentZh = contentTrans.zh;
    titleTh = titleTrans.th;
    contentTh = contentTrans.th;
  } else if (srcLang === "zh") {
    titleZh = title; contentZh = content;
  } else if (srcLang === "th") {
    titleTh = title; contentTh = content;
  }

  const post = await prisma.post.create({
    data: {
      title: finalTitle,
      content: finalContent,
      titleZh,
      contentZh,
      titleTh,
      contentTh,
      originalLang: srcLang,
      reviewStatus,
      categoryId,
      eventId,
      isSpoiler,
      spoilerTitle: spoilerTitle || null,
      imageUrls: JSON.stringify(imageUrls),
      userId: session.user.id,
      tags: {
        create: await Promise.all(tagNames.map(async (name) => {
          const tag = await prisma.tag.upsert({
            where: { name },
            create: { name },
            update: {},
          });
          return { tagId: tag.id };
        })),
      },
    },
  });

  revalidatePath("/[locale]/forum");
  await addXP(session.user.id, 10);
  return post;
}

export async function trackPostView(postId: string) {
  const cookieName = `pv_${postId}`;
  const cookieStore = await cookies();
  if (cookieStore.has(cookieName)) return { counted: false };
  cookieStore.set(cookieName, "1", { maxAge: 1800, path: "/", httpOnly: true, sameSite: "lax" });
  await prisma.post.update({ where: { id: postId }, data: { viewCount: { increment: 1 } } });
  return { counted: true };
}

// ============================================================
// Comments
// ============================================================

export async function createComment(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("You must be logged in to comment");

  const content = formData.get("content") as string;
  const postId = formData.get("postId") as string;

  if (!content || !postId) throw new Error("Missing required fields");

  checkRateLimit(session.user.id, "comment", 10, 60000);
  await moderateContent(content);

  // Detect language & pre-translate
  const srcLang = await detectLang(content);
  const translations = JSON.stringify(await autoTranslate(content));

  const comment = await prisma.comment.create({
    data: {
      content,
      originalLang: srcLang,
      translations,
      postId,
      userId: session.user.id,
    },
  });

  // Update post comment count
  await prisma.post.update({
    where: { id: postId },
    data: { commentCount: { increment: 1 } },
  });

  revalidatePath(`/[locale]/forum/${postId}`);
  await addXP(session.user.id, 5);
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { userId: true, title: true } });
  if (post && post.userId !== session.user.id) {
    await createNotification(post.userId, "comment", `Someone commented on your post`, `/${postId}`);
  }
  await checkAchievements(session.user.id);
  return comment;
}

// ============================================================
// Wall Messages
// ============================================================

export async function createWallMessage(formData: FormData) {
  const content = formData.get("content") as string;
  const type = (formData.get("type") as string) || "story";
  const anonymous = formData.get("anonymous") === "true";

  if (!content) throw new Error("Message cannot be empty"); await moderateContent(content);

  const session = await auth();
  const srcLang = await detectLang(content);
  const translations = JSON.stringify(await autoTranslate(content));

  const message = await prisma.wallMessage.create({
    data: {
      content,
      originalLang: srcLang,
      translations,
      type,
      userId: anonymous ? null : session?.user?.id || null,
      username: anonymous
        ? "Anonymous"
        : session?.user?.name || "Anonymous",
    },
  });

  revalidatePath("/[locale]/wall");
  return message;
}

// ============================================================
// Likes
// ============================================================

export async function toggleLike(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("You must be logged in to like");

  const postId = formData.get("postId") as string;
  const creationId = formData.get("creationId") as string;
  const commentId = formData.get("commentId") as string;

  if (!postId && !creationId && !commentId) throw new Error("Missing target");

  // Comment likes: use Like model with commentId for proper toggle
  if (commentId) {
    const existing = await prisma.like.findFirst({
      where: { userId: session.user.id, commentId },
    });
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      await prisma.comment.update({ where: { id: commentId }, data: { likeCount: { decrement: 1 } } });
      return { liked: false };
    } else {
      await prisma.like.create({ data: { userId: session.user.id, commentId } });
      await prisma.comment.update({ where: { id: commentId }, data: { likeCount: { increment: 1 } } });
      return { liked: true };
    }
  }

  const userId = session.user.id;

  // Check existing like
  const existing = await prisma.like.findFirst({
    where: {
      userId,
      ...(postId ? { postId } : { creationId }),
    },
  });

  if (existing) {
    // Unlike
    await prisma.like.delete({ where: { id: existing.id } });
    if (postId) {
      await prisma.post.update({ where: { id: postId }, data: { likeCount: { decrement: 1 } } });
    }
    if (creationId) {
      await prisma.creation.update({ where: { id: creationId }, data: { likeCount: { decrement: 1 } } });
    }
  } else {
    // Like
    await prisma.like.create({
      data: { userId, postId: postId || null, creationId: creationId || null },
    });
    if (postId) {
      await prisma.post.update({ where: { id: postId }, data: { likeCount: { increment: 1 } } });
      // +1 XP for post author when their post gets liked
      const post = await prisma.post.findUnique({ where: { id: postId }, select: { userId: true } });
      if (post && post.userId !== userId) {
        await addXP(post.userId, 1);
      }
    }
    if (creationId) {
      await prisma.creation.update({ where: { id: creationId }, data: { likeCount: { increment: 1 } } });
      const creation = await prisma.creation.findUnique({ where: { id: creationId }, select: { userId: true } });
      if (creation && creation.userId !== userId) {
        await addXP(creation.userId, 1);
      }
    }
  }

  return { liked: !existing };
}

// ============================================================
// Creations
// ============================================================

export async function createCreation(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("You must be logged in to upload");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const type = formData.get("type") as string;
  const imageUrl = (formData.get("imageUrl") as string) || "";

  if (!title || !type) throw new Error("Title and type are required"); await moderateContent(title, description);

  // Auto-translate title + description
  const srcLang = await detectLang(title);
  const [titleTrans, descTrans] = await Promise.all([
    autoTranslate(title),
    autoTranslate(description || ""),
  ]);

  const creation = await prisma.creation.create({
    data: {
      title,
      titleZh: titleTrans.zh !== title ? titleTrans.zh : null,
      titleTh: titleTrans.th !== title ? titleTrans.th : null,
      description: description || "",
      descriptionZh: descTrans.zh !== (description || "") ? descTrans.zh : null,
      descriptionTh: descTrans.th !== (description || "") ? descTrans.th : null,
      originalLang: srcLang,
      type,
      imageUrl,
      userId: session.user.id,
    },
  });

  revalidatePath("/[locale]/creations");
  await addXP(session.user.id, 10);
  return creation;
}

export async function deleteCreation(formData: FormData) {
  const session = await requireAuth();
  const creationId = formData.get("creationId") as string;
  if (!creationId) throw new Error("Missing creation ID");
  const creation = await prisma.creation.findUnique({ where: { id: creationId } });
  if (!creation) throw new Error("Not found");
  const isAdmin = (session.user as any).role === "admin" || (session.user as any).role === "superadmin" || (session.user as any).role === "founder";
  if (creation.userId !== session.user.id && !isAdmin) throw new Error("Not authorized");
  await prisma.creation.update({ where: { id: creationId }, data: { deletedAt: new Date() } });
  revalidatePath("/[locale]/creations");
}

// ============================================================
// Drama & Episodes
// ============================================================

export async function addDrama(formData: FormData) {
  await requireAdmin();
  const title = formData.get("title") as string;
  const titleZh = (formData.get("titleZh") as string) || null;
  const titleTh = (formData.get("titleTh") as string) || null;
  const description = (formData.get("description") as string) || "";
  const descriptionZh = (formData.get("descriptionZh") as string) || null;
  const descriptionTh = (formData.get("descriptionTh") as string) || null;
  const coverImage = (formData.get("coverImage") as string) || "";
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0");
  if (!title) throw new Error("Title required");
  await prisma.drama.create({ data: { title, titleZh, titleTh, description, descriptionZh, descriptionTh, coverImage, sortOrder } });
  revalidatePath("/[locale]/dramas");
  revalidatePath("/[locale]/admin");
}

export async function editDrama(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) throw new Error("ID required");
  const data: any = {};
  for (const f of ["title","titleZh","titleTh","description","descriptionZh","descriptionTh","coverImage"]) {
    const val = formData.get(f) as string;
    if (val !== null && val !== undefined) data[f] = val;
  }
  if (formData.has("sortOrder")) data.sortOrder = parseInt((formData.get("sortOrder") as string) || "0");
  await prisma.drama.update({ where: { id }, data });
  revalidatePath("/[locale]/dramas");
  revalidatePath("/[locale]/admin");
}

export async function deleteDrama(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) throw new Error("ID required");
  await prisma.drama.delete({ where: { id } });
  revalidatePath("/[locale]/dramas");
  revalidatePath("/[locale]/admin");
}

export async function addEpisode(formData: FormData) {
  await requireAdmin();
  const dramaId = formData.get("dramaId") as string;
  const title = formData.get("title") as string;
  const titleZh = (formData.get("titleZh") as string) || null;
  const titleTh = (formData.get("titleTh") as string) || null;
  const description = (formData.get("description") as string) || "";
  const videoUrl = formData.get("videoUrl") as string;
  const episodeNum = parseInt((formData.get("episodeNum") as string) || "0");
  const duration = (formData.get("duration") as string) || "";
  const language = (formData.get("language") as string) || "zh";
  if (!dramaId || !title || !videoUrl) throw new Error("Drama, title, and video URL required");
  // Join checkbox values into comma-separated string
  const languages = formData.getAll("language").filter(Boolean).join(",") || "";
  await prisma.dramaEpisode.create({ data: { dramaId, episodeNum, title, titleZh, titleTh, description, videoUrl, duration, language: languages } });
  revalidatePath("/[locale]/dramas");
  revalidatePath("/[locale]/admin");
}

export async function editEpisode(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) throw new Error("ID required");
  const data: any = {};
  for (const f of ["title","titleZh","titleTh","description","videoUrl","duration","episodeNum"]) {
    const val = formData.get(f) as string;
    if (val !== null && val !== undefined) data[f] = f === "episodeNum" ? parseInt(val, 10) || 1 : val;
  }
  const languages = formData.getAll("language").filter(Boolean).join(",");
  if (languages) data.language = languages;
  await prisma.dramaEpisode.update({ where: { id }, data });
  revalidatePath("/[locale]/dramas");
  revalidatePath("/[locale]/admin");
}

export async function deleteEpisode(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) throw new Error("ID required");
  await prisma.dramaEpisode.delete({ where: { id } });
  revalidatePath("/[locale]/dramas");
  revalidatePath("/[locale]/admin");
}

export async function reorderEpisode(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const direction = formData.get("direction") as string; // "up" or "down"
  if (!id || !direction) throw new Error("ID and direction required");

  const ep = await prisma.dramaEpisode.findUnique({ where: { id } });
  if (!ep) throw new Error("Episode not found");

  const sibling = await prisma.dramaEpisode.findFirst({
    where: { dramaId: ep.dramaId, episodeNum: direction === "up" ? { lt: ep.episodeNum } : { gt: ep.episodeNum } },
    orderBy: { episodeNum: direction === "up" ? "desc" : "asc" },
  });
  if (!sibling) return; // already at top/bottom

  // Swap episodeNum
  await prisma.$transaction([
    prisma.dramaEpisode.update({ where: { id: ep.id }, data: { episodeNum: sibling.episodeNum } }),
    prisma.dramaEpisode.update({ where: { id: sibling.id }, data: { episodeNum: ep.episodeNum } }),
  ]);
  revalidatePath("/[locale]/dramas");
  revalidatePath("/[locale]/admin");
}

// ============================================================
// Edit & Delete Posts
// ============================================================

export async function editPost(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not logged in");

  const postId = formData.get("postId") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  if (!postId || !title || !content) throw new Error("Missing fields");

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.userId !== session.user.id) throw new Error("Not your post");

  await prisma.post.update({ where: { id: postId }, data: { title, content } });
  revalidatePath(`/[locale]/forum/${postId}`);
}

export async function deleteOwnPost(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not logged in");

  const postId = formData.get("postId") as string;
  if (!postId) throw new Error("Missing post ID");

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.userId !== session.user.id) {
    // Also allow admin to delete
    if ((session.user as any).role !== "admin") throw new Error("Not your post");
  }

  await prisma.post.delete({ where: { id: postId } });
  revalidatePath("/[locale]/forum");
}

// ============================================================
// Reply to Comment
// ============================================================

export async function replyToComment(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Must be logged in");

  const content = formData.get("content") as string;
  const postId = formData.get("postId") as string;
  const parentId = formData.get("parentId") as string;
  if (!content || !postId || !parentId) throw new Error("Missing fields"); await moderateContent(content);

  await prisma.comment.create({
    data: { content, postId, userId: session.user.id, parentId },
  });

  await prisma.post.update({
    where: { id: postId },
    data: { commentCount: { increment: 1 } },
  });

  revalidatePath(`/[locale]/forum/${postId}`);
}

// ============================================================
// Search (posts + comments + creations + gallery)
// ============================================================

export async function searchAll(query: string) {
  if (!query || query.length < 2) return { posts: [], comments: [], creations: [], gallery: [] };

  const [posts, comments, creations, gallery] = await Promise.all([
    prisma.post.findMany({
      where: { OR: [{ title: { contains: query } }, { content: { contains: query } }], deletedAt: null },
      include: { author: true, category: true, tags: { include: { tag: true } } },
      orderBy: { createdAt: "desc" }, take: 10,
    }),
    prisma.comment.findMany({
      where: { content: { contains: query }, deletedAt: null },
      include: { author: true, post: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" }, take: 10,
    }),
    prisma.creation.findMany({
      where: { OR: [{ title: { contains: query } }, { description: { contains: query } }], deletedAt: null },
      include: { author: true },
      orderBy: { createdAt: "desc" }, take: 10,
    }),
    prisma.galleryItem.findMany({
      where: { caption: { contains: query } },
      orderBy: { createdAt: "desc" }, take: 10,
    }),
  ]);

  return {
    posts: posts.map(p => ({
      id: p.id, title: p.title, content: p.content.substring(0, 150),
      likeCount: p.likeCount, commentCount: p.commentCount,
      createdAt: p.createdAt.toISOString(),
      author: p.author ? { id: p.author.id, username: p.author.username } : null,
      category: p.category ? { nameEn: p.category.nameEn, nameZh: p.category.nameZh } : null,
      tags: p.tags.map(pt => pt.tag.name),
    })),
    comments: comments.map(c => ({
      id: c.id, content: c.content.substring(0, 150), postId: c.postId,
      postTitle: c.post?.title, createdAt: c.createdAt.toISOString(),
      author: c.author ? { username: c.author.username } : null,
    })),
    creations: creations.map(c => ({
      id: c.id, title: c.title, description: c.description?.substring(0, 150),
      type: c.type, likeCount: c.likeCount, createdAt: c.createdAt.toISOString(),
      author: c.author ? { username: c.author.username } : null,
    })),
    gallery: gallery.map(g => ({
      id: g.id, url: g.url, caption: g.caption, createdAt: g.createdAt.toISOString(),
    })),
  };
}

// Keep old function for backward compat
export async function searchPosts(query: string) {
  const result = await searchAll(query);
  return result.posts;
}

// ============================================================
// Bookmarks
// ============================================================

export async function toggleBookmark(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Must be logged in");

  const postId = formData.get("postId") as string;
  if (!postId) throw new Error("Missing post ID");

  const existing = await prisma.bookmark.findUnique({
    where: { userId_postId: { userId: session.user.id, postId } },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return { bookmarked: false };
  } else {
    await prisma.bookmark.create({ data: { userId: session.user.id, postId } });
    return { bookmarked: true };
  }
}

// ============================================================
// Reports
// ============================================================

export async function toggleDownvote(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Must be logged in");
  const postId = formData.get("postId") as string;
  const commentId = formData.get("commentId") as string;
  const userId = session.user.id;

  const existing = await prisma.dislike.findFirst({
    where: { userId, ...(postId ? { postId } : { commentId }) },
  });

  if (existing) {
    await prisma.dislike.delete({ where: { id: existing.id } });
    if (postId) await prisma.post.update({ where: { id: postId }, data: { dislikeCount: { decrement: 1 } } });
    else if (commentId) await prisma.comment.update({ where: { id: commentId }, data: { dislikeCount: { decrement: 1 } } });
  } else {
    await prisma.dislike.create({ data: { userId, postId: postId || null, commentId: commentId || null } });
    if (postId) await prisma.post.update({ where: { id: postId }, data: { dislikeCount: { increment: 1 } } });
    else if (commentId) await prisma.comment.update({ where: { id: commentId }, data: { dislikeCount: { increment: 1 } } });
  }
}

export async function addReaction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Must be logged in");
  const postId = (formData.get("postId") as string) || null;
  const commentId = (formData.get("commentId") as string) || null;
  const emoji = formData.get("emoji") as string;
  if (!emoji) throw new Error("Missing emoji");
  try {
    await prisma.reaction.create({ data: { userId: session.user.id, postId, commentId, emoji } });
  } catch { /* already exists */ }
}

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Must be logged in");
  const country = formData.get("country") as string;
  const city = formData.get("city") as string;
  const bio = formData.get("bio") as string;
  const title = formData.get("title") as string;
  const name = formData.get("name") as string;
  const image = formData.get("image") as string;
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      country: country || null,
      city: city || null,
      bio: bio || null,
      title: title || "",
      name: name || undefined,
      image: image || undefined,
    },
  });
  revalidatePath("/[locale]/user/[id]");
}

export async function updateTitle(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Must be logged in");
  const title = formData.get("title") as string;
  await prisma.user.update({ where: { id: session.user.id }, data: { title } });
  revalidatePath("/[locale]/user/[id]");
}

export async function createNotification(userId: string, type: string, message: string, link: string = "") {
  await prisma.notification.create({ data: { userId, type, message, link } });
}

export async function markNotificationsRead() {
  const session = await auth();
  if (!session?.user?.id) return;
  await prisma.notification.updateMany({ where: { userId: session.user.id, read: false }, data: { read: true } });
}

export async function checkAchievements(userId: string) {
  const posts = await prisma.post.count({ where: { userId } });
  const totalLikes = await prisma.post.aggregate({ where: { userId }, _sum: { likeCount: true } });
  const likes = totalLikes._sum.likeCount || 0;
  const checkIns = await prisma.checkIn.count({ where: { userId } });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const achievements: string[] = [];
  if (posts >= 1) achievements.push("first_post");
  if (posts >= 10) achievements.push("ten_posts");
  if (likes >= 100) achievements.push("hundred_likes");
  if (checkIns >= 7) achievements.push("week_streak");
  if ((user?.level || 1) >= 5) achievements.push("level5");
  if ((user?.level || 1) >= 10) achievements.push("level10");
  for (const type of achievements) {
    try {
      await prisma.achievement.create({ data: { userId, type } });
      const labels: Record<string,string> = {first_post:"First Post 🎉",ten_posts:"10 Posts 📝",hundred_likes:"100 Likes ❤️",week_streak:"7-Day Streak 🔥",level5:"Level 5 ⭐",level10:"Level 10 👑"};
      await createNotification(userId, "achievement", labels[type] || type, "/user/"+userId);
    } catch {}
  }
}

export async function toggleFollow(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Must be logged in");
  const targetId = formData.get("userId") as string;
  if (!targetId || targetId === session.user.id) throw new Error("Cannot follow yourself");
  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: session.user.id, followingId: targetId } },
  });
  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return { following: false };
  }
  await prisma.follow.create({ data: { followerId: session.user.id, followingId: targetId } });
  await createNotification(targetId, "follow", `${session.user.name} followed you`, `/user/${session.user.id}`);
  revalidatePath("/[locale]/user/[id]");
  return { following: true };
}

export async function checkIn(formData?: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Must be logged in");
  // Use timezone from form data (client's timezone)
  const tz = (formData?.get("timezone") as string) || "Asia/Shanghai";
  const now = new Date();
  const today = new Date(now.toLocaleString("en-US", { timeZone: tz })).toISOString().split("T")[0];
  try {
    await prisma.checkIn.create({ data: { userId: session.user.id, date: today } });
    const count = await prisma.checkIn.count({ where: { date: today } });
    // Re-read stats for client update
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const checkIns = await prisma.checkIn.findMany({ where: { userId: session.user.id }, orderBy: { date: "desc" } });
    let streak = 0;
    const td = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(td); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      if (checkIns.some(c => c.date === ds)) streak++; else break;
    }
    return { success: true, position: count, date: today, xp: user?.xp, level: user?.level, streak, totalCheckIns: checkIns.length };
  } catch { return { already: true }; }
}

export async function submitReport(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Must be logged in");

  const postId = (formData.get("postId") as string) || null;
  const commentId = (formData.get("commentId") as string) || null;
  const reason = formData.get("reason") as string;

  if (!reason) throw new Error("Reason required");
  if (!postId && !commentId) throw new Error("Target required");

  await prisma.report.create({
    data: {
      reporterId: session.user.id,
      postId: postId || null,
      commentId: commentId || null,
      reason,
    },
  });

  revalidatePath("/[locale]/forum");
}

// ============================================================
// Admin Actions
// ============================================================

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not logged in");
  const role = (session.user as any).role;
  if (role !== "admin" && role !== "superadmin") throw new Error("Admin only");
  return session;
}

async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not logged in");
  if ((session.user as any).role !== "superadmin") throw new Error("Super admin only");
  return session;
}

function isSuperAdmin(session: any): boolean {
  return session?.user?.role === "superadmin";
}

export async function deletePost(formData: FormData) {
  await requireAdmin();
  const postId = formData.get("postId") as string;
  if (!postId) throw new Error("Missing post ID");
  await prisma.post.delete({ where: { id: postId } });
  revalidatePath("/[locale]/forum");
  revalidatePath("/[locale]/admin");
}

export async function deleteComment(formData: FormData) {
  await requireAdmin();
  const commentId = formData.get("commentId") as string;
  if (!commentId) throw new Error("Missing comment ID");
  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath("/[locale]/forum");
}

export async function deleteWallMessage(formData: FormData) {
  await requireAdmin();
  const messageId = formData.get("messageId") as string;
  if (!messageId) throw new Error("Missing message ID");
  await prisma.wallMessage.delete({ where: { id: messageId } });
  revalidatePath("/[locale]/wall");
  revalidatePath("/[locale]/admin");
}

export async function approveSubmission(formData: FormData) {
  await requireAdmin();
  const submissionId = formData.get("submissionId") as string;
  if (!submissionId) throw new Error("Missing submission ID");
  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: "approved" },
  });
  revalidatePath("/[locale]/admin");
}

export async function togglePin(formData: FormData) {
  await requireAdmin();
  const postId = formData.get("postId") as string;
  if (!postId) throw new Error("Missing post ID");
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new Error("Post not found");
  await prisma.post.update({ where: { id: postId }, data: { pinned: !post.pinned } });
  revalidatePath("/[locale]/forum");
  revalidatePath("/[locale]/admin");
}

export async function toggleEssence(formData: FormData) {
  await requireAdmin();
  const postId = formData.get("postId") as string;
  if (!postId) throw new Error("Missing post ID");
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new Error("Post not found");
  await prisma.post.update({ where: { id: postId }, data: { essence: !post.essence } });
  revalidatePath("/[locale]/forum");
  revalidatePath("/[locale]/admin");
}

export async function addOrEditEvent(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const titleEn = formData.get("titleEn") as string;
  const titleZh = formData.get("titleZh") as string;
  const titleTh = formData.get("titleTh") as string;
  const descriptionEn = formData.get("descriptionEn") as string;
  const descriptionZh = formData.get("descriptionZh") as string;
  const descriptionTh = formData.get("descriptionTh") as string;
  const date = formData.get("date") as string;
  const location = formData.get("location") as string;
  const type = formData.get("type") as string;
  if (!titleEn || !date) throw new Error("Title and date required");
  const data = { titleEn, titleZh, titleTh, descriptionEn, descriptionZh, descriptionTh, date, location, type };
  if (id) { await prisma.event.update({ where: { id }, data }); }
  else { await prisma.event.create({ data }); }
  revalidatePath("/[locale]/admin");
}

export async function deleteEvent(formData: FormData) {
  await requireAdmin();
  await prisma.event.delete({ where: { id: formData.get("id") as string } });
  revalidatePath("/[locale]/admin");
}

export async function addOrEditTimeline(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const year = parseInt(formData.get("year") as string);
  const month = parseInt(formData.get("month") as string) || 0;
  const day = parseInt(formData.get("day") as string) || 0;
  const titleEn = formData.get("titleEn") as string;
  const titleZh = formData.get("titleZh") as string;
  const titleTh = formData.get("titleTh") as string;
  const descriptionEn = formData.get("descriptionEn") as string;
  const descriptionZh = formData.get("descriptionZh") as string;
  const descriptionTh = formData.get("descriptionTh") as string;
  const type = formData.get("type") as string;
  const actor = formData.get("actor") as string;
  if (!titleEn || !year) throw new Error("Required");
  const data = { year, month, day, titleEn, titleZh, titleTh, descriptionEn, descriptionZh, descriptionTh, type, actor };
  if (id) { await prisma.timelineEntry.update({ where: { id }, data }); }
  else { await prisma.timelineEntry.create({ data }); }
  revalidatePath("/[locale]/admin");
}

export async function deleteTimeline(formData: FormData) {
  await requireAdmin();
  await prisma.timelineEntry.delete({ where: { id: formData.get("id") as string } });
  revalidatePath("/[locale]/admin");
}

export async function rejectSubmission(formData: FormData) {
  await requireAdmin();
  const submissionId = formData.get("submissionId") as string;
  if (!submissionId) throw new Error("Missing submission ID");
  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: "rejected" },
  });
  revalidatePath("/[locale]/admin");
}

// Gallery actions
export async function addGalleryItems(formData: FormData) {
  const session = await requireAuth();
  const urlsStr = formData.get("urls") as string;
  const captionsStr = formData.get("captions") as string;
  if (!urlsStr) throw new Error("No URLs provided");

  const urls: string[] = JSON.parse(urlsStr);
  const captions: string[] = captionsStr ? JSON.parse(captionsStr) : [];
  const tag = (formData.get("tag") as string) || "both";
  const category = (formData.get("category") as string) || "photo";
  const featured = formData.get("featured") === "true";
  const tagsStr = (formData.get("tags") as string) || "";
  const tagNames = tagsStr.split(",").map(t => t.trim().toLowerCase()).filter(Boolean).slice(0, 10);
  const videoUrlsStr = formData.get("videoUrls") as string;
  const videoUrls: string[] = videoUrlsStr ? JSON.parse(videoUrlsStr) : [];

  for (let i = 0; i < urls.length; i++) {
    const item = await prisma.galleryItem.create({
      data: {
        url: urls[i],
        caption: captions[i] || null,
        tag,
        category,
        featured,
        reviewStatus: (category === "fanart") ? "pending" : "approved",
        videoUrl: videoUrls[i] || null,
        userId: session.user.id,
      },
    });
    // Use unified Tag system
    for (const t of tagNames) {
      const gtag = await prisma.tag.upsert({ where: { name: t }, create: { name: t }, update: {} });
      await prisma.galleryTagLink.create({ data: { galleryItemId: item.id, tagId: gtag.id } }).catch(() => {});
    }
  }

  revalidatePath("/[locale]/admin");
  revalidatePath("/[locale]/gallery");
  // Award XP for gallery uploads
  if (urls.length > 0) {
    await addXP(session.user.id, urls.length * 3);
  }
}

export async function deleteGalleryItem(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) throw new Error("Missing gallery item ID");
  await prisma.galleryItem.delete({ where: { id } });
  revalidatePath("/[locale]/admin");
  revalidatePath("/[locale]/gallery");
}

export async function toggleGalleryFeatured(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const item = await prisma.galleryItem.findUnique({ where: { id } });
  if (!item) throw new Error("Not found");
  await prisma.galleryItem.update({ where: { id }, data: { featured: !item.featured } });
  revalidatePath("/[locale]/admin");
  revalidatePath("/[locale]/gallery");
}

export async function reviewGalleryItem(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const action = formData.get("action") as string;
  await prisma.galleryItem.update({
    where: { id },
    data: { reviewStatus: action === "approve" ? "approved" : "rejected" },
  });
  revalidatePath("/[locale]/admin");
  revalidatePath("/[locale]/gallery");
}

// Get pending gallery items for review
export async function getPendingGalleryItems() {
  await requireAdmin();
  return prisma.galleryItem.findMany({
    where: { reviewStatus: "pending" },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { username: true } } },
    take: 20,
  });
}

// Batch delete gallery items
export async function batchDeleteGalleryItems(ids: string[]) {
  await requireAdmin();
  await prisma.galleryItem.deleteMany({ where: { id: { in: ids } } });
  revalidatePath("/[locale]/admin");
  revalidatePath("/[locale]/gallery");
}

// Batch update gallery items (category, tag, featured)
export async function batchUpdateGalleryItems(ids: string[], data: { category?: string; tag?: string; featured?: boolean }) {
  await requireAdmin();
  const updateData: any = {};
  if (data.category) updateData.category = data.category;
  if (data.tag) updateData.tag = data.tag;
  if (data.featured !== undefined) updateData.featured = data.featured;
  await prisma.galleryItem.updateMany({ where: { id: { in: ids } }, data: updateData });
  revalidatePath("/[locale]/admin");
  revalidatePath("/[locale]/gallery");
}

// Announcement actions
export async function createAnnouncement(formData: FormData) {
  await requireAdmin();
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const pinned = formData.get("pinned") === "true";
  const category = (formData.get("category") as string) || "announcement";
  if (!title || !content) throw new Error("Title and content required"); await moderateContent(title, content);

  // Always translate announcements to all languages
  const srcLang = await detectLang(title);
  const manualZhTitle = (formData.get("titleZh") as string) || null;
  const manualThTitle = (formData.get("titleTh") as string) || null;
  const manualZhContent = (formData.get("contentZh") as string) || null;
  const manualThContent = (formData.get("contentTh") as string) || null;

  // If admin manually provided translations, use those; otherwise auto-translate
  let finalTitle = title, finalContent = content;
  let titleZh = manualZhTitle, contentZh = manualZhContent;
  let titleTh = manualThTitle, contentTh = manualThContent;

  // Auto-translate if any language is missing
  if (!titleZh || !contentZh || !titleTh || !contentTh) {
    const [titleTrans, contentTrans] = await Promise.all([autoTranslate(title), autoTranslate(content)]);
    if (srcLang === "zh") {
      finalTitle = titleTrans.en;
      finalContent = contentTrans.en;
      if (!titleZh) titleZh = title;
      if (!contentZh) contentZh = content;
      if (!titleTh) titleTh = titleTrans.th;
      if (!contentTh) contentTh = contentTrans.th;
    } else if (srcLang === "th") {
      finalTitle = titleTrans.en;
      finalContent = contentTrans.en;
      if (!titleTh) titleTh = title;
      if (!contentTh) contentTh = content;
      if (!titleZh) titleZh = titleTrans.zh;
      if (!contentZh) contentZh = contentTrans.zh;
    } else {
      // English source
      if (!titleZh) titleZh = titleTrans.zh;
      if (!contentZh) contentZh = contentTrans.zh;
      if (!titleTh) titleTh = titleTrans.th;
      if (!contentTh) contentTh = contentTrans.th;
    }
  }

  const session = await auth();
  await prisma.announcement.create({
    data: { title: finalTitle, content: finalContent, titleZh, contentZh, titleTh, contentTh, originalLang: srcLang, pinned, category, userId: session!.user.id },
  });
  revalidatePath("/[locale]");
  revalidatePath("/[locale]/admin");
}

export async function editAnnouncement(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const pinned = formData.get("pinned") === "true";
  const category = (formData.get("category") as string) || "announcement";
  if (!id || !title || !content) throw new Error("Missing fields");

  await prisma.announcement.update({
    where: { id },
    data: { title, content, pinned, category },
  });
  revalidatePath("/[locale]");
  revalidatePath("/[locale]/admin");
}

export async function deleteAnnouncement(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) throw new Error("Missing announcement ID");
  await prisma.announcement.delete({ where: { id } });
  revalidatePath("/[locale]");
  revalidatePath("/[locale]/admin");
}

// Category actions
export async function addOrEditCategory(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string | null;
  const slug = (formData.get("slug") as string).toLowerCase().replace(/\s+/g, "-");
  const nameEn = formData.get("nameEn") as string;
  const nameZh = formData.get("nameZh") as string;
  const nameTh = formData.get("nameTh") as string;
  const descriptionEn = (formData.get("descriptionEn") as string) || "";
  const descriptionZh = (formData.get("descriptionZh") as string) || "";
  const descriptionTh = (formData.get("descriptionTh") as string) || "";
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0");
  const parentId = (formData.get("parentId") as string) || null;

  if (!slug || !nameEn) throw new Error("Slug and English name required");

  if (id) {
    // Check slug conflict with other categories
    const existing = await prisma.forumCategory.findUnique({ where: { slug } });
    if (existing && existing.id !== id) {
      throw new Error(`Slug "${slug}" is already used by another category`);
    }
    await prisma.forumCategory.update({
      where: { id },
      data: { slug, nameEn, nameZh, nameTh, descriptionEn, descriptionZh, descriptionTh, sortOrder, parentId },
    });
  } else {
    await prisma.forumCategory.create({
      data: { slug, nameEn, nameZh, nameTh, descriptionEn, descriptionZh, descriptionTh, sortOrder, parentId },
    });
  }
  revalidatePath("/[locale]/forum");
  revalidatePath("/[locale]/admin");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) throw new Error("Missing category ID");
  await prisma.forumCategory.delete({ where: { id } });
  revalidatePath("/[locale]/forum");
  revalidatePath("/[locale]/admin");
}

// Translation — thin async wrappers for "use server" compatibility
import { translateText as _translateText, detectLanguage as _detectLanguage, autoTranslate3 as _autoTranslate3 } from "./translation";

export async function translateText(text: string, from: string, to: string) {
  return _translateText(text, from, to);
}

export async function detectLang(text: string): Promise<"zh" | "zht" | "yue" | "th" | "en"> {
  return _detectLanguage(text);
}

export async function autoTranslate(text: string): Promise<{ en: string; zh: string; th: string }> {
  return _autoTranslate3(text);
}

// Gallery comments
export async function createGalleryComment(formData: FormData) {
  const session = await requireAuth();
  const galleryItemId = formData.get("galleryItemId") as string;
  const content = formData.get("content") as string;
  if (!galleryItemId || !content) throw new Error("Missing fields");

  await prisma.comment.create({
    data: { content, galleryItemId, userId: session.user.id },
  });
  revalidatePath("/[locale]/gallery");
}

export async function getGalleryComments(galleryItemId: string) {
  return prisma.comment.findMany({
    where: { galleryItemId },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { id: true, username: true, image: true } } },
  });
}

// Rate limiting
const rateLimitMap = new Map<string, { count: number; reset: number }>();
function checkRateLimit(userId: string, action: string, max: number, windowMs: number): void {
  const key = `${userId}:${action}`;
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.reset) { rateLimitMap.set(key, { count: 1, reset: now + windowMs }); return; }
  if (entry.count >= max) throw new Error(`Slow down! Please wait before ${action} again.`);
  entry.count++;
}

// Content moderation
async function moderateContent(...texts: (string | null | undefined)[]): Promise<"approved" | "pending"> {
  const combined = texts.filter(Boolean).join(" ").toLowerCase();
  if (!combined) return "approved";
  const words = await prisma.bannedWord.findMany();
  for (const w of words) {
    if (w.category !== "review" && combined.includes(w.word.toLowerCase())) {
      throw new Error("您的内容违反社区规范，无法发布。");
    }
  }
  for (const w of words) {
    if (w.category === "review" && combined.includes(w.word.toLowerCase())) {
      return "pending";
    }
  }
  return "approved";
}

// Admin log
async function logAdmin(adminId: string, action: string, targetId?: string, detail?: string) {
  try { await prisma.adminLog.create({ data: { adminId, action, targetId, detail } }); } catch {}
}

export async function penalizeUser(formData: FormData) {
  await requireAdmin();
  const userId = formData.get("userId") as string;
  const action = formData.get("action") as string;
  const session = await auth();
  if (action === "warn") { await prisma.user.update({ where: { id: userId }, data: { warningCount: { increment: 1 } } }); }
  else if (action === "mute24h") { await prisma.user.update({ where: { id: userId }, data: { mutedUntil: new Date(Date.now() + 86400000) } }); }
  else if (action === "mute7d") { await prisma.user.update({ where: { id: userId }, data: { mutedUntil: new Date(Date.now() + 604800000) } }); }
  else if (action === "ban") { await prisma.user.update({ where: { id: userId }, data: { banned: true } }); }
  else if (action === "unban") { await prisma.user.update({ where: { id: userId }, data: { banned: false, warningCount: 0, mutedUntil: null } }); }
  await logAdmin(session!.user.id, action, userId);
  revalidatePath("/[locale]/admin");
}

export async function reviewPost(formData: FormData) {
  await requireAdmin();
  const postId = formData.get("postId") as string;
  const action = formData.get("action") as string;
  const session = await auth();
  await prisma.post.update({ where: { id: postId }, data: { reviewStatus: action === "approve" ? "approved" : "rejected" } });
  await logAdmin(session!.user.id, action === "approve" ? "approve_post" : "reject_post", postId);
  revalidatePath("/[locale]/admin");
}

export async function addBannedWord(formData: FormData) {
  await requireAdmin();
  const word = formData.get("word") as string;
  const lang = (formData.get("lang") as string) || "all";
  const category = (formData.get("category") as string) || "instant_block";
  if (!word) throw new Error("Word required");
  const session = await auth();
  await prisma.bannedWord.create({ data: { word: word.toLowerCase(), lang, category } });
  await logAdmin(session!.user.id, "add_banned_word", undefined, `${word} (${category})`);
  revalidatePath("/[locale]/admin");
}

export async function removeBannedWord(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const session = await auth();
  await prisma.bannedWord.delete({ where: { id } });
  await logAdmin(session!.user.id, "remove_banned_word", id);
  revalidatePath("/[locale]/admin");
}

// Site Settings (for actor images, etc)
export async function setSiteSetting(key: string, value: string) {
  await requireAdmin();
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  revalidatePath("/[locale]/admin");
}

export async function getSiteSetting(key: string): Promise<string | null> {
  const setting = await prisma.siteSetting.findUnique({ where: { key } });
  return setting?.value || null;
}

// Superadmin: promote/demote users
export async function setUserRole(formData: FormData) {
  await requireSuperAdmin();
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as string;
  if (!userId || !role) throw new Error("Missing fields");
  if (!["user", "verified", "moderator", "admin"].includes(role)) throw new Error("Invalid role");
  await prisma.user.update({ where: { id: userId }, data: { role } });
  await logAdmin((await auth())!.user.id, "set_role", userId, role);
  revalidatePath("/[locale]/admin");
}

// ============================================================
// Drafts
// ============================================================

export async function saveDraft(formData: FormData) {
  const session = await requireAuth();
  const title = (formData.get("title") as string) || "";
  const content = (formData.get("content") as string) || "";
  const categoryId = (formData.get("categoryId") as string) || null;
  const eventId = (formData.get("eventId") as string) || null;
  const tags = (formData.get("tags") as string) || "";

  // Upsert: one draft per user (or find by id if editing existing draft)
  const draftId = (formData.get("draftId") as string) || null;
  if (draftId) {
    const draft = await prisma.draft.findUnique({ where: { id: draftId } });
    if (!draft || draft.userId !== session.user.id) throw new Error("Not your draft");
    await prisma.draft.update({ where: { id: draftId }, data: { title, content, categoryId, eventId, tags } });
    return { id: draftId };
  }
  const draft = await prisma.draft.create({
    data: { title, content, categoryId, eventId, tags, userId: session.user.id },
  });
  revalidatePath("/[locale]/forum/new");
  return { id: draft.id };
}

export async function getDrafts() {
  const session = await auth();
  if (!session?.user?.id) return [];
  return prisma.draft.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });
}

export async function deleteDraft(formData: FormData) {
  const session = await requireAuth();
  const draftId = formData.get("draftId") as string;
  const draft = await prisma.draft.findUnique({ where: { id: draftId } });
  if (!draft || draft.userId !== session.user.id) throw new Error("Not your draft");
  await prisma.draft.delete({ where: { id: draftId } });
  revalidatePath("/[locale]/forum/new");
}

// ============================================================
// Soft Delete & Edit History
// ============================================================

export async function softDeletePost(formData: FormData) {
  const session = await requireAuth();
  const postId = formData.get("postId") as string;
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new Error("Post not found");
  const isAdmin = (session.user as any).role === "admin" || (session.user as any).role === "superadmin" || (session.user as any).role === "founder";
  if (post.userId !== session.user.id && !isAdmin) throw new Error("Not authorized");
  await prisma.post.update({ where: { id: postId }, data: { deletedAt: new Date() } });
  revalidatePath("/[locale]/forum");
}

export async function restorePost(formData: FormData) {
  await requireAdmin();
  const postId = formData.get("postId") as string;
  await prisma.post.update({ where: { id: postId }, data: { deletedAt: null } });
  revalidatePath("/[locale]/forum");
}

export async function softDeleteComment(formData: FormData) {
  const session = await requireAuth();
  const commentId = formData.get("commentId") as string;
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new Error("Not found");
  const isAdmin = (session.user as any).role === "admin" || (session.user as any).role === "superadmin" || (session.user as any).role === "founder";
  if (comment.userId !== session.user.id && !isAdmin) throw new Error("Not authorized");
  await prisma.comment.update({ where: { id: commentId }, data: { deletedAt: new Date() } });
  if (comment.postId) {
    await prisma.post.update({ where: { id: comment.postId }, data: { commentCount: { decrement: 1 } } });
  }
  revalidatePath("/[locale]/forum");
}

export async function editComment(formData: FormData) {
  const session = await requireAuth();
  const commentId = formData.get("commentId") as string;
  const content = formData.get("content") as string;
  if (!commentId || !content) throw new Error("Missing fields");
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new Error("Not found");
  if (comment.userId !== session.user.id) throw new Error("Not authorized");
  await prisma.comment.update({ where: { id: commentId }, data: { content } });
  revalidatePath("/[locale]/forum");
}

export async function saveEditHistory(postId: string, oldTitle: string, oldContent: string) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return;
  let history: any[] = [];
  try { history = JSON.parse(post.editHistory || "[]"); } catch {}
  history.push({ title: oldTitle, content: oldContent, timestamp: new Date().toISOString() });
  // Keep last 20 versions
  if (history.length > 20) history = history.slice(-20);
  await prisma.post.update({ where: { id: postId }, data: { editHistory: JSON.stringify(history) } });
}

// ============================================================
// Spoiler Tags
// ============================================================

export async function toggleSpoiler(formData: FormData) {
  const session = await requireAuth();
  const postId = (formData.get("postId") as string) || null;
  const commentId = (formData.get("commentId") as string) || null;
  const isSpoiler = formData.get("isSpoiler") === "true";

  if (postId) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.userId !== session.user.id) throw new Error("Not authorized");
    await prisma.post.update({ where: { id: postId }, data: { isSpoiler } });
  } else if (commentId) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment || comment.userId !== session.user.id) throw new Error("Not authorized");
    await prisma.comment.update({ where: { id: commentId }, data: { isSpoiler } });
  }
  revalidatePath("/[locale]/forum");
}

// ============================================================
// Privacy Settings & 2FA & Minor Mode
// ============================================================

export async function updatePrivacySettings(formData: FormData) {
  const session = await requireAuth();
  const privacyLevel = formData.get("privacyLevel") as string;
  const locationHidden = formData.get("locationHidden") === "true";
  if (privacyLevel && !["public", "followers", "private"].includes(privacyLevel)) throw new Error("Invalid privacy level");
  const data: any = {};
  if (privacyLevel) data.privacyLevel = privacyLevel;
  if (formData.get("locationHidden") !== null) data.locationHidden = locationHidden;
  await prisma.user.update({ where: { id: session.user.id }, data });
  revalidatePath("/[locale]/settings");
}

export async function toggleMinorMode(formData: FormData) {
  const session = await requireAuth();
  const enabled = formData.get("minorMode") === "true";
  await prisma.user.update({ where: { id: session.user.id }, data: { minorMode: enabled } });
  revalidatePath("/[locale]/settings");
}

export async function setup2FA() {
  const session = await requireAuth();
  const { authenticator } = await import("otplib");
  const secret = authenticator.generateSecret();
  await prisma.user.update({ where: { id: session.user.id }, data: { twoFactorSecret: secret } });
  const otpauth = authenticator.keyuri(session.user.email || "user", "ORMFOLK+Hub", secret);
  return { secret, otpauth };
}

export async function verify2FA(formData: FormData) {
  const session = await requireAuth();
  const code = formData.get("code") as string;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.twoFactorSecret) throw new Error("2FA not set up");

  const { authenticator } = await import("otplib");
  const isValid = authenticator.verify({ secret: user.twoFactorSecret, token: code });
  if (!isValid) throw new Error("Invalid verification code");

  await prisma.user.update({ where: { id: session.user.id }, data: { twoFactorEnabled: true } });
  return { verified: true };
}

export async function verify2FALogin(email: string, code: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.twoFactorEnabled || !user?.twoFactorSecret) return true; // 2FA not enabled, skip
  const { authenticator } = await import("otplib");
  return authenticator.verify({ secret: user.twoFactorSecret, token: code });
}

export async function disable2FA() {
  const session = await requireAuth();
  await prisma.user.update({ where: { id: session.user.id }, data: { twoFactorEnabled: false, twoFactorSecret: null } });
  revalidatePath("/[locale]/settings");
}

// ============================================================
// Copyright / DMCA Reports
// ============================================================

export async function submitCopyrightReport(formData: FormData) {
  const session = await requireAuth();
  const contentType = formData.get("contentType") as string;
  const contentId = formData.get("contentId") as string;
  const originalWork = formData.get("originalWork") as string;
  const description = formData.get("description") as string;
  if (!contentType || !contentId || !originalWork) throw new Error("Missing fields");
  await prisma.copyrightReport.create({
    data: { reporterId: session.user.id, contentType, contentId, originalWork, description: description || "" },
  });
  revalidatePath("/[locale]/copyright");
}

export async function reviewCopyrightReport(formData: FormData) {
  await requireAdmin();
  const reportId = formData.get("reportId") as string;
  const status = formData.get("status") as string; // "reviewed" | "resolved" | "dismissed"
  await prisma.copyrightReport.update({
    where: { id: reportId },
    data: { status, reviewedAt: new Date() },
  });
  revalidatePath("/[locale]/admin");
}

// ============================================================
// Welcome Message
// ============================================================

export async function getWelcomeMessage(): Promise<any | null> {
  const msg = await prisma.welcomeMessage.findFirst({ where: { isActive: true }, orderBy: { updatedAt: "desc" } });
  return msg;
}

export async function updateWelcomeMessage(formData: FormData) {
  await requireAdmin();
  const contentEn = formData.get("contentEn") as string;
  const contentZh = (formData.get("contentZh") as string) || "";
  const contentZht = (formData.get("contentZht") as string) || "";
  const contentYue = (formData.get("contentYue") as string) || "";
  const contentTh = (formData.get("contentTh") as string) || "";
  if (!contentEn) throw new Error("English content required");
  const existing = await prisma.welcomeMessage.findFirst({ where: { isActive: true } });
  if (existing) {
    await prisma.welcomeMessage.update({ where: { id: existing.id }, data: { contentEn, contentZh, contentZht, contentYue, contentTh } });
  } else {
    await prisma.welcomeMessage.create({ data: { contentEn, contentZh, contentZht, contentYue, contentTh } });
  }
  revalidatePath("/[locale]");
  revalidatePath("/[locale]/admin");
}

export async function hasReceivedWelcome(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { welcomeSent: true } });
  return user?.welcomeSent || false;
}

export async function markWelcomeSent(userId: string) {
  await prisma.user.update({ where: { id: userId }, data: { welcomeSent: true } });
}

// ============================================================
// Community Statistics
// ============================================================

export async function getCommunityStats() {
  const [totalUsers, totalPosts, totalComments, totalCreations, totalGallery] = await Promise.all([
    prisma.user.count(),
    prisma.post.count({ where: { deletedAt: null } }),
    prisma.comment.count({ where: { deletedAt: null } }),
    prisma.creation.count({ where: { deletedAt: null } }),
    prisma.galleryItem.count(),
  ]);
  return {
    totalUsers, totalPosts, totalComments, totalCreations, totalGallery,
  };
}

// ============================================================
// Helper: require auth
// ============================================================

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("You must be logged in");
  return session;
}

// ============================================================
// Expanded editPost with history
// ============================================================

export async function editPostWithHistory(formData: FormData) {
  const session = await requireAuth();
  const postId = formData.get("postId") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const categoryId = (formData.get("categoryId") as string) || undefined;
  if (!postId || !title || !content) throw new Error("Missing fields");
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.userId !== session.user.id) throw new Error("Not your post");
  // Save current to history
  await saveEditHistory(postId, post.title, post.content);
  const updateData: any = { title, content };
  if (categoryId) updateData.categoryId = categoryId;
  await prisma.post.update({ where: { id: postId }, data: updateData });
  revalidatePath(`/[locale]/forum/${postId}`);
}

// ============================================================
// Reaction expansion: add to creations and gallery
// ============================================================

export async function addReactionToCreation(formData: FormData) {
  const session = await requireAuth();
  const creationId = formData.get("creationId") as string;
  const emoji = formData.get("emoji") as string;
  if (!creationId || !emoji) throw new Error("Missing fields");
  const existing = await prisma.reaction.findFirst({
    where: { userId: session.user.id, creationId, emoji },
  });
  if (!existing) {
    await prisma.reaction.create({ data: { userId: session.user.id, creationId, emoji } });
  }
}

export async function getReactions(targetId: string, type: "post" | "comment" | "creation") {
  return prisma.reaction.findMany({
    where: type === "post" ? { postId: targetId } : type === "creation" ? { creationId: targetId } : { commentId: targetId },
    select: { emoji: true, userId: true },
  });
}

// Bulk action: load reactions for many posts
export async function getPostReactions(postIds: string[]) {
  const reactions = await prisma.reaction.findMany({
    where: { postId: { in: postIds } },
    select: { postId: true, emoji: true },
  });
  const map: Record<string, Record<string, number>> = {};
  for (const r of reactions) {
    if (!r.postId) continue;
    if (!map[r.postId]) map[r.postId] = {};
    map[r.postId][r.emoji] = (map[r.postId][r.emoji] || 0) + 1;
  }
  return map;
}

// Translation caching for comments/wall messages — uses unified service
import { getOrCreateTranslation } from "./translation";

export async function getTranslatedText(
  originalText: string, originalLang: string, targetLang: string, cacheJson?: string | null
): Promise<string> {
  const result = await getOrCreateTranslation(originalText, originalLang, targetLang, cacheJson);
  return result.text;
}

export async function translateAndCacheComment(commentId: string, targetLang: string): Promise<string> {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return "";
  if ((comment.originalLang || "en") === targetLang) return comment.content;

  const result = await getOrCreateTranslation(
    comment.content, comment.originalLang || "en", targetLang, comment.translations
  );

  if (!result.fromCache && result.text !== comment.content) {
    const cache: Record<string, string> = {};
    try { Object.assign(cache, JSON.parse(comment.translations || "{}")); } catch {}
    cache[targetLang] = result.text;
    await prisma.comment.update({ where: { id: commentId }, data: { translations: JSON.stringify(cache) } });
  }

  return result.text;
}

// ============================================================
// Admin Translation Editor
// ============================================================

// Update announcement translations manually
export async function updateAnnouncementTranslation(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const titleZh = formData.get("titleZh") as string;
  const titleTh = formData.get("titleTh") as string;
  const contentZh = formData.get("contentZh") as string;
  const contentTh = formData.get("contentTh") as string;
  if (!id) throw new Error("Missing announcement ID");

  await prisma.announcement.update({
    where: { id },
    data: {
      titleZh: titleZh || null,
      titleTh: titleTh || null,
      contentZh: contentZh || null,
      contentTh: contentTh || null,
    },
  });
  revalidatePath("/[locale]/admin");
}

// Update post translations manually
export async function updatePostTranslation(formData: FormData) {
  await requireAdmin();
  const postId = formData.get("postId") as string;
  const titleZh = formData.get("titleZh") as string;
  const titleTh = formData.get("titleTh") as string;
  const contentZh = formData.get("contentZh") as string;
  const contentTh = formData.get("contentTh") as string;
  if (!postId) throw new Error("Missing post ID");

  await prisma.post.update({
    where: { id: postId },
    data: {
      titleZh: titleZh || null,
      titleTh: titleTh || null,
      contentZh: contentZh || null,
      contentTh: contentTh || null,
    },
  });
  revalidatePath("/[locale]/admin");
}

// Get all translatable content for admin review
export async function getTranslatableContent() {
  await requireAdmin();
  const [announcements, posts, events, timeline] = await Promise.all([
    prisma.announcement.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.post.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 20, include: { author: { select: { username: true } } } }),
    prisma.event.findMany({ orderBy: { date: "asc" }, take: 20 }),
    prisma.timelineEntry.findMany({ orderBy: [{ year: "desc" }, { month: "desc" }], take: 20 }),
  ]);
  return { announcements, posts, events, timeline };
}

// Invalidate and re-translate content
export async function retranslateContent(formData: FormData) {
  await requireAdmin();
  const type = formData.get("type") as string; // "announcement" | "post" | "event" | "timeline"
  const id = formData.get("id") as string;
  if (!type || !id) throw new Error("Missing fields");

  if (type === "announcement") {
    const item = await prisma.announcement.findUnique({ where: { id } });
    if (!item) throw new Error("Not found");
    const [titleTrans, contentTrans] = await Promise.all([autoTranslate(item.title), autoTranslate(item.content)]);
    await prisma.announcement.update({
      where: { id },
      data: { titleZh: titleTrans.zh, contentZh: contentTrans.zh, titleTh: titleTrans.th, contentTh: contentTrans.th },
    });
  } else if (type === "post") {
    const item = await prisma.post.findUnique({ where: { id } });
    if (!item) throw new Error("Not found");
    const [titleTrans, contentTrans] = await Promise.all([autoTranslate(item.title), autoTranslate(item.content)]);
    await prisma.post.update({
      where: { id },
      data: { titleZh: titleTrans.zh, contentZh: contentTrans.zh, titleTh: titleTrans.th, contentTh: contentTrans.th },
    });
  } else if (type === "event") {
    const item = await prisma.event.findUnique({ where: { id } });
    if (!item) throw new Error("Not found");
    const [titleTrans, descTrans] = await Promise.all([
      autoTranslate(item.titleEn), autoTranslate(item.descriptionEn),
    ]);
    await prisma.event.update({
      where: { id },
      data: { titleZh: titleTrans.zh, descriptionZh: descTrans.zh, titleTh: titleTrans.th, descriptionTh: descTrans.th },
    });
  } else if (type === "timeline") {
    const item = await prisma.timelineEntry.findUnique({ where: { id } });
    if (!item) throw new Error("Not found");
    const [titleTrans, descTrans] = await Promise.all([
      autoTranslate(item.titleEn), autoTranslate(item.descriptionEn),
    ]);
    await prisma.timelineEntry.update({
      where: { id },
      data: { titleZh: titleTrans.zh, descriptionZh: descTrans.zh, titleTh: titleTrans.th, descriptionTh: descTrans.th },
    });
  }
  revalidatePath("/[locale]/admin");
}

// ============================================================
// Unified Tag System
// ============================================================

export async function getAllTags() {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { posts: true, creations: true, galleryItems: true } } },
    orderBy: { name: "asc" },
  });
  return tags.map(t => ({
    id: t.id, name: t.name,
    count: t._count.posts + t._count.creations + t._count.galleryItems,
  }));
}

export async function addTagToPost(postId: string, tagName: string) {
  const tag = await prisma.tag.upsert({ where: { name: tagName.toLowerCase().trim() }, create: { name: tagName.toLowerCase().trim() }, update: {} });
  await prisma.postTag.create({ data: { postId, tagId: tag.id } }).catch(() => {});
}

export async function addTagToCreation(creationId: string, tagName: string) {
  const tag = await prisma.tag.upsert({ where: { name: tagName.toLowerCase().trim() }, create: { name: tagName.toLowerCase().trim() }, update: {} });
  await prisma.creationTag.create({ data: { creationId, tagId: tag.id } }).catch(() => {});
}

export async function addTagToGalleryItem(galleryItemId: string, tagName: string) {
  const tag = await prisma.tag.upsert({ where: { name: tagName.toLowerCase().trim() }, create: { name: tagName.toLowerCase().trim() }, update: {} });
  await prisma.galleryTagLink.create({ data: { galleryItemId, tagId: tag.id } }).catch(() => {});
}

// ============================================================
// Sticker System
// ============================================================

export async function uploadSticker(formData: FormData) {
  const session = await requireAuth();
  const url = formData.get("url") as string;
  const filename = formData.get("filename") as string;
  if (!url || !filename) throw new Error("Missing fields");
  const isAdmin = (session.user as any).role === "admin" || (session.user as any).role === "superadmin" || (session.user as any).role === "moderator";
  // Admins get auto-approved public; normal users get private (no review needed)
  const sticker = await prisma.sticker.create({
    data: {
      userId: session.user.id, url, filename,
      privacyMode: isAdmin ? "public" : "private",
      reviewStatus: isAdmin ? "approved" : "approved",
    },
  });
  revalidatePath("/[locale]/stickers");
  return sticker;
}

export async function submitStickerPublic(formData: FormData) {
  const session = await requireAuth();
  const stickerId = formData.get("stickerId") as string;
  const sticker = await prisma.sticker.findUnique({ where: { id: stickerId } });
  if (!sticker || sticker.userId !== session.user.id) throw new Error("Not authorized");
  await prisma.sticker.update({ where: { id: stickerId }, data: { privacyMode: "public", reviewStatus: "pending" } });
  revalidatePath("/[locale]/stickers");
}

export async function getMyStickers() {
  const session = await auth();
  if (!session?.user?.id) return [];
  return prisma.sticker.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" } });
}

export async function getCommunityStickers() {
  return prisma.sticker.findMany({
    where: { privacyMode: "public", reviewStatus: "approved" },
    orderBy: { createdAt: "desc" }, take: 100,
  });
}

export async function deleteSticker(formData: FormData) {
  const session = await requireAuth();
  const stickerId = formData.get("stickerId") as string;
  const sticker = await prisma.sticker.findUnique({ where: { id: stickerId } });
  if (!sticker) throw new Error("Not found");
  const isAdmin = (session.user as any).role === "admin" || (session.user as any).role === "superadmin";
  if (sticker.userId !== session.user.id && !isAdmin) throw new Error("Not authorized");
  await prisma.sticker.delete({ where: { id: stickerId } });
  revalidatePath("/[locale]/stickers");
}

export async function adminReviewSticker(formData: FormData) {
  await requireAdmin();
  const stickerId = formData.get("stickerId") as string;
  const action = formData.get("action") as string;
  await prisma.sticker.update({
    where: { id: stickerId },
    data: { reviewStatus: action === "approve" ? "approved" : "rejected" },
  });
  revalidatePath("/[locale]/admin");
}

export async function getAllStickers() {
  await requireAdmin();
  return prisma.sticker.findMany({
    include: { user: { select: { username: true } } },
    orderBy: { createdAt: "desc" }, take: 200,
  });
}

// ============================================================
// Feedback System
// ============================================================

export async function submitFeedback(formData: FormData) {
  const type = formData.get("type") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;
  const contact = (formData.get("contact") as string) || "";
  if (!type || !subject || !message) throw new Error("Missing fields");
  const session = await auth();
  await prisma.feedback.create({
    data: { userId: session?.user?.id || null, type, subject, message, contact },
  });
  revalidatePath("/[locale]/contact");
}

export async function getFeedbacks() {
  await requireAdmin();
  return prisma.feedback.findMany({
    include: { user: { select: { username: true, email: true } } },
    orderBy: { createdAt: "desc" }, take: 100,
  });
}

export async function updateFeedbackStatus(formData: FormData) {
  await requireAdmin();
  const feedbackId = formData.get("feedbackId") as string;
  const status = formData.get("status") as string;
  await prisma.feedback.update({ where: { id: feedbackId }, data: { status } });
  revalidatePath("/[locale]/admin");
}

// ============================================================
// Enhanced Reports V2 (supports gallery + stickers)
// ============================================================

export async function submitReportV2(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Must be logged in");
  const postId = (formData.get("postId") as string) || null;
  const commentId = (formData.get("commentId") as string) || null;
  const galleryItemId = (formData.get("galleryItemId") as string) || null;
  const stickerId = (formData.get("stickerId") as string) || null;
  const reason = formData.get("reason") as string;
  if (!reason) throw new Error("Reason required");
  if (!postId && !commentId && !galleryItemId && !stickerId) throw new Error("Target required");
  await prisma.report.create({
    data: { reporterId: session.user.id, postId, commentId, galleryItemId, stickerId, reason },
  });
}

export async function getAllReports() {
  await requireAdmin();
  return prisma.report.findMany({
    include: {
      reporter: { select: { username: true } },
      post: { select: { id: true, title: true } },
      comment: { select: { id: true, content: true } },
      galleryItem: { select: { id: true, url: true } },
      sticker: { select: { id: true, url: true } },
    },
    orderBy: { createdAt: "desc" }, take: 100,
  });
}

export async function resolveReport(formData: FormData) {
  await requireAdmin();
  const reportId = formData.get("reportId") as string;
  const status = formData.get("status") as string;
  await prisma.report.update({ where: { id: reportId }, data: { status } });
  revalidatePath("/[locale]/admin");
}
