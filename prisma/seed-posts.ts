import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding posts and users...");

  // Create demo users
  const password = await bcrypt.hash("demo123456", 12);

  const user1 = await prisma.user.upsert({
    where: { email: "purplehearts@ormfolk.com" },
    update: {},
    create: {
      email: "purplehearts@ormfolk.com",
      password,
      username: "PurpleHearts",
      name: "PurpleHearts",
      role: "user",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "thaifan@ormfolk.com" },
    update: {},
    create: {
      email: "thaifan@ormfolk.com",
      password,
      username: "ThaiFan_Nong",
      name: "ThaiFan_Nong",
      role: "user",
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: "folkie_cn@ormfolk.com" },
    update: {},
    create: {
      email: "folkie_cn@ormfolk.com",
      password,
      username: "Folkie_CN",
      name: "Folkie_CN",
      role: "user",
    },
  });

  console.log("✅ Created 3 demo users (password: demo123456)");

  // Get categories
  const catCP = await prisma.forumCategory.findUnique({ where: { slug: "cp-moments" } });
  const catApple = await prisma.forumCategory.findUnique({ where: { slug: "apple-my-love" } });
  const catNew = await prisma.forumCategory.findUnique({ where: { slug: "new-fans" } });
  const catCrush = await prisma.forumCategory.findUnique({ where: { slug: "crush-series" } });
  const catFanWorks = await prisma.forumCategory.findUnique({ where: { slug: "creations" } });

  if (!catCP || !catApple || !catNew || !catCrush || !catFanWorks) {
    console.error("Categories not found! Run main seed first.");
    process.exit(1);
  }

  // Create posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: "My favorite Kris/Karn scene analysis 🔍",
        content: "I've been rewatching Apple My Love and I think the hospital scene in episode 3 is underrated. The way Kris sketches Karn's eyes without knowing who she is... the yearning is so pure. Here's my detailed analysis:\n\n1. The sketchbook is a metaphor for how Kris is trying to hold onto something she can't quite grasp\n2. The hospital setting represents healing - both physical and emotional\n3. The camera work in this scene is stunning, with the soft focus representing Kris's still-recovering vision\n\nWhat do you all think? What's your favorite scene?",
        categoryId: catApple.id,
        userId: user1.id,
        likeCount: 234,
        commentCount: 56,
        viewCount: 1567,
      },
    }),
    prisma.post.create({
      data: {
        title: "Crush pilot trailer reaction thread! 🦋",
        content: "Did everyone see the pilot trailer for Crush? The chemistry is INSANE! I can't stop rewatching. Cold CEO × sunshine assistant is such a perfect dynamic for OrmFolk.\n\nWhat are your thoughts? Will you be watching when it airs?",
        categoryId: catCrush.id,
        userId: user1.id,
        likeCount: 189,
        commentCount: 47,
        viewCount: 2340,
      },
    }),
    prisma.post.create({
      data: {
        title: "Hello from China! Just discovered OrmFolk 💜",
        content: "I just finished Apple My Love and I'm OBSESSED! Can anyone recommend more content? Interviews, behind the scenes, anything! I need more OrmFolk in my life!\n\nAlso, where can I watch more of their shows? Is there a recommended watch order?",
        categoryId: catNew.id,
        userId: user3.id,
        likeCount: 56,
        commentCount: 34,
        viewCount: 890,
      },
    }),
    prisma.post.create({
      data: {
        title: "Karn fanart I made in watercolor 🎨",
        content: "Spent 8 hours on this watercolor piece of Karn from the Apple My Love poster. Hope you all like it! I tried to capture the softness in her eyes and the lavender tones from the series color palette.\n\nI used Winsor & Newton watercolors on cold press paper. The lavender background was achieved by mixing ultramarine and rose madder.",
        categoryId: catFanWorks.id,
        userId: user1.id,
        likeCount: 567,
        commentCount: 89,
        viewCount: 3456,
      },
    }),
    prisma.post.create({
      data: {
        title: "Apple My Love hidden details thread 🔍",
        content: "On my 4th rewatch and I keep finding new details! Did anyone notice in episode 1:\n\n- The song playing in the coffee shop is the same one that plays during the finale kiss\n- Kris's sketchbook has apple motifs on the cover\n- There's a photo of the hospital garden in the background of episode 5 that was foreshadowed in episode 2\n\nThe writers really put thought into every detail. This is why I love GL series - when they're done right, they're truly art.",
        categoryId: catApple.id,
        userId: user2.id,
        likeCount: 312,
        commentCount: 78,
        viewCount: 2100,
      },
    }),
  ]);

  console.log(`✅ Created ${posts.length} posts`);

  // Create comments on post 1
  const post1 = posts[0];
  await Promise.all([
    prisma.comment.create({
      data: {
        content: "I totally agree! The chemistry between them is absolutely incredible. I've been a fan since day one! 💜",
        postId: post1.id,
        userId: user3.id,
        likeCount: 23,
      },
    }),
    prisma.comment.create({
      data: {
        content: "ชอบมากเลยค่ะ! OrmFolk คือที่สุด! รอดูซีรีส์ใหม่ไม่ไหวแล้ววว 🥹",
        postId: post1.id,
        userId: user2.id,
        likeCount: 18,
      },
    }),
    prisma.comment.create({
      data: {
        content: "从中国发来贺电！OrmFolk 太甜了，希望新剧快点来！🌸 The hospital scene is my favorite too!",
        postId: post1.id,
        userId: user3.id,
        likeCount: 31,
      },
    }),
  ]);

  console.log("✅ Created comments");

  // Create fan creations
  await Promise.all([
    prisma.creation.create({
      data: {
        title: "Karn & Kris - Apple of My Eye",
        description: "Digital illustration of the iconic dream sequence from Apple My Love. Created in Procreate with custom lavender-pink color palette.",
        type: "art",
        userId: user1.id,
        likeCount: 423,
        commentCount: 34,
      },
    }),
    prisma.creation.create({
      data: {
        title: "OrmFolk | You Are In Love (FMV)",
        description: "An FMV tribute to OrmFolk's journey so far, featuring scenes from Apple My Love and BTS moments. Music: Taylor Swift - You Are In Love.",
        type: "video",
        userId: user2.id,
        likeCount: 892,
        commentCount: 67,
      },
    }),
    prisma.creation.create({
      data: {
        title: "Through Your Eyes - A Kris/Karn Fanfic",
        description: "A post-canon fanfiction exploring what happens after the Apple My Love finale. Chapter 1: The Morning After.",
        type: "writing",
        userId: user3.id,
        likeCount: 267,
        commentCount: 45,
      },
    }),
    prisma.creation.create({
      data: {
        title: "Handmade OrmFolk Bracelets",
        description: "Made matching purple and pink bracelets inspired by the OrmFolk colors! Each bracelet has a small apple charm.",
        type: "craft",
        userId: user1.id,
        likeCount: 156,
        commentCount: 12,
      },
    }),
  ]);

  console.log("✅ Created fan creations");
  console.log("\n🌱 Posts seed completed!");
  console.log("Demo accounts (password: demo123456):");
  console.log("  - purplehearts@ormfolk.com (PurpleHearts)");
  console.log("  - thaifan@ormfolk.com (ThaiFan_Nong)");
  console.log("  - folkie_cn@ormfolk.com (Folkie_CN)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
