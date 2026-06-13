// Mock data for development - will be replaced with database queries

export type Actor = {
  id: string;
  name: string;
  nameTh: string;
  nickname: string;
  birthdate: string;
  birthplace: string;
  bio: { en: string; zh: string; th: string };
  imageUrl: string;
  socialLinks: { platform: string; url: string }[];
};

export type TimelineEntry = {
  id: string;
  year: number;
  month: number;
  day: number;
  title: { en: string; zh: string; th: string };
  description: { en: string; zh: string; th: string };
  type: "drama" | "event" | "award" | "social";
  imageUrl: string;
  actor: "orm" | "folk" | "both";
};

export type ForumPost = {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  categoryId: string;
  title: string;
  content: string;
  createdAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
};

export type ForumCategory = {
  id: string;
  slug: string;
  name: { en: string; zh: string; th: string };
  description: { en: string; zh: string; th: string };
  postCount: number;
};

export type Creation = {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  title: string;
  description: string;
  type: "art" | "video" | "writing" | "craft" | "other";
  imageUrl: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
};

export type Event = {
  id: string;
  title: { en: string; zh: string; th: string };
  description: { en: string; zh: string; th: string };
  date: string;
  location: string;
  type: "online" | "offline";
  imageUrl: string;
};

export type WallMessage = {
  id: string;
  userId: string | null;
  username: string;
  content: string;
  type: "story" | "blessing";
  createdAt: string;
};

export type FanLocation = {
  id: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  displayName: string;
};

// --- Actors ---
export const actors: Actor[] = [
  {
    id: "ormsin",
    name: "Supitcha Limsommut",
    nameTh: "สุพิชชา ลิ้มสมมุติ",
    nickname: "Ormsin (ออมสิน)",
    birthdate: "1995-05-30",
    birthplace: "Uttaradit, Thailand",
    bio: {
      en: "Ormsin Supitcha Limsommut is a Thai actress and singer under KONGTHUP ARTIST. She began her career with supporting roles in Thai BL series before breaking into the GL genre as the lead in Apple My Love.",
      zh: "Ormsin Supitcha Limsommut 是泰国演员兼歌手，隶属 KONGTHUP ARTIST。她从泰剧配角起步，后在 GL 剧《Apple My Love》中担任主演而广受关注。",
      th: "ออมสิน สุพิชชา ลิ้มสมมุติ เป็นนักแสดงและนักร้องชาวไทย สังกัด KONGTHUP ARTIST เธอเริ่มต้นอาชีพด้วยบทสมทบในซีรีส์ BL ก่อนจะก้าวสู่การเป็นนักแสดงนำในซีรีส์ GL เรื่อง Apple My Love",
    },
    imageUrl: "/images/ormsin.jpg",
    socialLinks: [
      { platform: "Instagram", url: "https://www.instagram.com/orm_supitcha/" },
      { platform: "Twitter/X", url: "https://twitter.com/orm_supitcha" },
      { platform: "微博", url: "https://weibo.com/u/7952595017" },
    ],
  },
  {
    id: "folk",
    name: "Sutima Kokiatwanit",
    nameTh: "สุธิมา ก่อเกียรติวนิช",
    nickname: "Folk (โฟล์ค)",
    birthdate: "2000-05-16",
    birthplace: "Thailand",
    bio: {
      en: "Folk Sutima Kokiatwanit is a Thai actress known for her lead role as Karn in Apple My Love, where she formed the beloved OrmFolk CP with Ormsin Supitcha. She also starred in Be Mine: Prologue Day (2023), Doctor's Mine (2025), and Your Apple (2025).",
      zh: "Folk Sutima Kokiatwanit 是泰国演员，在《Apple My Love》中饰演 Karn 一角，与 Ormsin 组成了深受粉丝喜爱的 OrmFolk CP。她还出演了《Be Mine: Prologue Day》(2023)、《Doctor's Mine》(2025) 和《Your Apple》(2025)。",
      th: "โฟล์ค สุธิมา ก่อเกียรติวนิช เป็นนักแสดงชาวไทย รู้จักกันดีในบท กานต์ จากซีรีส์ Apple My Love ที่เธอจับคู่กับออมสิน กลายเป็นคู่จิ้น OrmFolk ที่แฟนๆ หลงรัก เธอยังแสดงใน Be Mine: Prologue Day (2023), Doctor's Mine (2025) และ Your Apple (2025)",
    },
    imageUrl: "/images/folk.jpg",
    socialLinks: [
      { platform: "Instagram", url: "https://www.instagram.com/ffolky/" },
      { platform: "Twitter/X", url: "https://twitter.com/folk_sutima" },
      { platform: "微博", url: "https://weibo.com/u/7952816069" },
    ],
  },
];

// --- Timeline ---
export const timelineEntries: TimelineEntry[] = [
  {
    id: "t1",
    year: 2020, month: 3, day: 14,
    title: { en: "First Acting Role", zh: "首次出演", th: "บทบาทการแสดงครั้งแรก" },
    description: {
      en: "Ormsin made her acting debut in 'En of Love: This is Love Story' as Yiwaa.",
      zh: "Ormsin 在《En of Love: This is Love Story》中饰演 Yiwaa，首次亮相。",
      th: "ออมสินเริ่มต้นการแสดงครั้งแรกในเรื่อง 'En of Love: This is Love Story' รับบทเป็น ยี่หวา",
    },
    type: "drama", imageUrl: "", actor: "orm",
  },
  {
    id: "t2",
    year: 2022, month: 6, day: 18,
    title: { en: "Love Mechanics", zh: "《爱情力学》播出", th: "Love Mechanics ออกอากาศ" },
    description: {
      en: "Ormsin reprised her role as Yiwaa in the full series 'Love Mechanics'.",
      zh: "Ormsin 在完整剧集《Love Mechanics》中再次饰演 Yiwaa。",
      th: "ออมสินกลับมารับบทยี่หวาอีกครั้งในซีรีส์เต็มรูปแบบ 'Love Mechanics'",
    },
    type: "drama", imageUrl: "", actor: "orm",
  },
  {
    id: "t3",
    year: 2023, month: 4, day: 5,
    title: { en: "La Pluie", zh: "《那场雨爱上你》", th: "La Pluie ฝนตกครั้งนั้น" },
    description: {
      en: "Ormsin appeared in 'La Pluie' (That Rain, I Fell in Love) as Dream.",
      zh: "Ormsin 在《那场雨爱上你》中饰演 Dream。",
      th: "ออมสินปรากฏตัวในซีรีส์ 'La Pluie' (ฝนตกครั้งนั้นฉันรักเธอ) รับบทเป็น ดรีม",
    },
    type: "drama", imageUrl: "", actor: "orm",
  },
  {
    id: "t4",
    year: 2024, month: 10, day: 12,
    title: { en: "Apple My Love Premiere!", zh: "《Apple My Love》首播！", th: "Apple My Love เริ่มออกอากาศ!" },
    description: {
      en: "The GL series 'Apple My Love' premiered on GagaOOLala and YouTube. Ormsin and Folk star as Karn and Kris, forming the beloved OrmFolk CP.",
      zh: "GL 剧《Apple My Love》在 GagaOOLala 和 YouTube 首播。Ormsin 和 Folk 分别饰演 Karn 和 Kris，组成备受喜爱的 OrmFolk CP。",
      th: "ซีรีส์ GL 'Apple My Love' เริ่มออกอากาศทาง GagaOOLala และ YouTube ออมสินรับบทเป็น กานต์ และโฟล์ครับบทเป็น คริส กลายเป็นคู่จิ้น OrmFolk ที่แฟนๆ หลงรัก",
    },
    type: "drama", imageUrl: "", actor: "both",
  },
  {
    id: "t5",
    year: 2024, month: 11, day: 16,
    title: { en: "Apple My Love Finale", zh: "《Apple My Love》大结局", th: "Apple My Love ตอนจบ" },
    description: {
      en: "The 6-episode series concluded with an emotional finale that cemented OrmFolk as a beloved GL couple.",
      zh: "这部 6 集剧集以感人的结局收官，巩固了 OrmFolk 作为备受喜爱的 GL CP 的地位。",
      th: "ซีรีส์ 6 ตอนจบลงด้วยตอนจบที่ซาบซึ้ง ทำให้ OrmFolk กลายเป็นคู่รัก GL ที่แฟนๆ หลงรัก",
    },
    type: "event", imageUrl: "", actor: "both",
  },
  {
    id: "t6",
    year: 2025, month: 1, day: 20,
    title: { en: "Newcomer GL Acting Award", zh: "获得新人 GL 演员奖", th: "รางวัลนักแสดง GL หน้าใหม่" },
    description: {
      en: "Ormsin and Folk won the Newcomer GL Acting Award at Thailand's Pikanesuan Awards for their performances in Apple My Love.",
      zh: "Ormsin 和 Folk 凭借在《Apple My Love》中的表演，在泰国 Pikanesuan Awards 获得新人 GL 演员奖。",
      th: "ออมสินและโฟล์คได้รับรางวัลนักแสดง GL หน้าใหม่จากเวที Pikanesuan Awards จากผลงานใน Apple My Love",
    },
    type: "award", imageUrl: "", actor: "both",
  },
  {
    id: "t7",
    year: 2025, month: 5, day: 15,
    title: { en: "Crush The Series Announced", zh: "《Crush》新剧公布", th: "ประกาศซีรีส์ Crush" },
    description: {
      en: "OrmFolk confirmed to star in new GL series 'Crush' — a cold CEO × sunshine assistant romance.",
      zh: "OrmFolk 确认出演新 GL 剧《Crush》——高冷 CEO × 阳光小帮手的浪漫故事。",
      th: "OrmFolk ยืนยันนำแสดงในซีรีส์ GL เรื่องใหม่ 'Crush' — เรื่องราวโรแมนติกของ CEO สุดเย็นชากับผู้ช่วยสดใส",
    },
    type: "drama", imageUrl: "", actor: "both",
  },
  {
    id: "t8",
    year: 2025, month: 6, day: 1,
    title: { en: "ORMFOLK Hub Launches", zh: "ORMFOLK Hub 上线", th: "ORMFOLK Hub เปิดตัว" },
    description: {
      en: "The global ORMFOLK fan community website officially launches! A home for fans worldwide.",
      zh: "全球 ORMFOLK 粉丝社区网站正式上线！全世界粉丝的家。",
      th: "เว็บไซต์ชุมชนแฟนคลับ ORMFOLK ระดับโลกเปิดตัวอย่างเป็นทางการ! บ้านของแฟนๆ ทั่วโลก",
    },
    type: "event", imageUrl: "", actor: "both",
  },
];

// --- Forum ---
export const forumCategories: ForumCategory[] = [
  { id: "c1", slug: "new-fans", name: { en: "New Fans", zh: "新粉入门", th: "แฟนใหม่" }, description: { en: "Introduce yourself and learn about OrmFolk!", zh: "介绍自己，了解 OrmFolk！", th: "แนะนำตัวและเรียนรู้เกี่ยวกับ OrmFolk!" }, postCount: 128 },
  { id: "c2", slug: "apple-my-love", name: { en: "Apple My Love", zh: "Apple My Love 讨论", th: "Apple My Love" }, description: { en: "Discuss the series that started it all.", zh: "讨论这部开启一切的剧集。", th: "พูดคุยเกี่ยวกับซีรีส์ที่เริ่มต้นทุกอย่าง" }, postCount: 543 },
  { id: "c3", slug: "crush-series", name: { en: "Crush The Series", zh: "Crush 新剧追踪", th: "Crush The Series" }, description: { en: "Follow the latest on the upcoming series!", zh: "追踪新剧最新动态！", th: "ติดตามข่าวสารล่าสุดของซีรีส์ใหม่!" }, postCount: 312 },
  { id: "c4", slug: "cp-moments", name: { en: "OrmFolk Moments", zh: "CP 甜蜜时刻", th: "โมเมนต์ OrmFolk" }, description: { en: "Share and discuss your favorite OrmFolk moments.", zh: "分享讨论 OrmFolk 的甜蜜互动。", th: "แบ่งปันโมเมนต์ OrmFolk ที่คุณชื่นชอบ" }, postCount: 891 },
  { id: "c5", slug: "creations", name: { en: "Fan Works", zh: "创作交流", th: "ผลงานแฟน" }, description: { en: "Share your fan art, videos, and stories.", zh: "分享你的同人作品。", th: "แบ่งปันภาพวาด วิดีโอ และเรื่องราว" }, postCount: 256 },
  { id: "c6", slug: "casual", name: { en: "Casual Chat", zh: "闲聊八卦", th: "พูดคุยทั่วไป" }, description: { en: "Anything and everything else!", zh: "天南地北，随便聊！", th: "คุยเล่นได้ทุกเรื่อง!" }, postCount: 445 },
];

export const forumPosts: ForumPost[] = [
  { id: "p1", userId: "u1", username: "OrmFolkFan_TH", userAvatar: "", categoryId: "c3", title: "Crush pilot trailer reaction thread! 🦋", content: "Did everyone see the pilot trailer for Crush? The chemistry is INSANE! I can't stop rewatching. Cold CEO × sunshine assistant is such a perfect dynamic for OrmFolk. What are your thoughts?", createdAt: "2025-05-28T14:30:00Z", viewCount: 2340, likeCount: 189, commentCount: 47 },
  { id: "p2", userId: "u2", username: "LavenderDreams", userAvatar: "", categoryId: "c4", title: "My favorite Karn/Kris scene analysis", content: "I've been rewatching Apple My Love and I think the hospital scene in episode 3 is underrated. The way Kris sketches Karn's eyes without knowing who she is... the yearning is so pure. Here's my detailed analysis...", createdAt: "2025-05-25T09:15:00Z", viewCount: 1567, likeCount: 234, commentCount: 56 },
  { id: "p3", userId: "u3", username: "Folkie_CN", userAvatar: "", categoryId: "c1", title: "Hello from China! Just discovered OrmFolk 💜", content: "I just finished Apple My Love and I'm OBSESSED! Can anyone recommend more content? Interviews, behind the scenes, anything! I need more OrmFolk in my life!", createdAt: "2025-05-30T18:00:00Z", viewCount: 890, likeCount: 56, commentCount: 34 },
  { id: "p4", userId: "u4", username: "PurpleHearts", userAvatar: "", categoryId: "c5", title: "Karn fanart I made in watercolor 🎨", content: "Spent 8 hours on this watercolor piece of Karn from the Apple My Love poster. Hope you all like it! I tried to capture the softness in her eyes...", createdAt: "2025-05-27T11:20:00Z", viewCount: 3456, likeCount: 567, commentCount: 89 },
  { id: "p5", userId: "u5", username: "MilkFolk", userAvatar: "", categoryId: "c2", title: "Apple My Love hidden details thread 🔍", content: "On my 4th rewatch and I keep finding new details! Did anyone notice in episode 1 that... [SPOILERS]", createdAt: "2025-05-22T16:45:00Z", viewCount: 2100, likeCount: 312, commentCount: 78 },
];

// --- Creations ---
export const creations: Creation[] = [
  { id: "cr1", userId: "u6", username: "ArtByMint", userAvatar: "", title: "Karn & Kris - Apple of My Eye", description: "Digital illustration of the iconic dream sequence from Apple My Love", type: "art", imageUrl: "", createdAt: "2025-05-29T10:00:00Z", likeCount: 423, commentCount: 34 },
  { id: "cr2", userId: "u7", username: "VidEditor_Pang", userAvatar: "", title: "OrmFolk | You Are In Love (FMV)", description: "An FMV tribute to OrmFolk's journey so far, featuring scenes from Apple My Love and BTS moments.", type: "video", imageUrl: "", createdAt: "2025-05-26T08:30:00Z", likeCount: 892, commentCount: 67 },
  { id: "cr3", userId: "u8", username: "LunaWrites", userAvatar: "", title: "Through Your Eyes - A Karn/Kris Fanfic", description: "A post-canon fanfiction exploring what happens after the Apple My Love finale.", type: "writing", imageUrl: "", createdAt: "2025-05-20T15:00:00Z", likeCount: 267, commentCount: 45 },
  { id: "cr4", userId: "u9", username: "CraftyFolk", userAvatar: "", title: "Handmade OrmFolk Bracelets", description: "Made matching purple and pink bracelets inspired by the OrmFolk colors!", type: "craft", imageUrl: "", createdAt: "2025-05-18T12:00:00Z", likeCount: 156, commentCount: 12 },
];

// --- Events ---
export const events: Event[] = [
  { id: "e1", title: { en: "Crush Pilot Release", zh: "《Crush》试播集发布", th: "ปล่อย Pilot Crush" }, description: { en: "The official pilot episode of Crush The Series drops!", zh: "Crush 系列官方试播集发布！", th: "ตอน Pilot ของ Crush The Series ปล่อยอย่างเป็นทางการ!" }, date: "2025-06-15", location: "YouTube / GagaOOLala", type: "online", imageUrl: "" },
  { id: "e2", title: { en: "Orm Birthday Fan Meet", zh: "Ormsin 生日粉丝见面会", th: "งานแฟนมีตติ้งวันเกิดออมสิน" }, description: { en: "Celebrate Ormsin's birthday with fans worldwide!", zh: "与全球粉丝一起庆祝 Ormsin 的生日！", th: "ฉลองวันเกิดออมสินกับแฟนๆ ทั่วโลก!" }, date: "2025-05-30", location: "Bangkok, Thailand", type: "offline", imageUrl: "" },
  { id: "e3", title: { en: "Apple My Love 1st Anniversary", zh: "Apple My Love 一周年", th: "ครบรอบ 1 ปี Apple My Love" }, description: { en: "One year since the premiere! Rewatch party and fan celebration.", zh: "首播一周年！重温派对和粉丝庆祝活动。", th: "ครบ 1 ปีนับตั้งแต่วันออกอากาศ! ปาร์ตี้ดูย้อนหลังและฉลองกับแฟนๆ" }, date: "2025-10-12", location: "Online", type: "online", imageUrl: "" },
];

// --- Wall Messages ---
export const wallMessages: WallMessage[] = [
  { id: "w1", userId: "u10", username: "DreamyPurple", content: "I started watching Apple My Love during a really tough time in my life. Kris and Karn's story gave me so much comfort. OrmFolk, you mean the world to me. 💜", type: "story", createdAt: "2025-05-29T20:00:00Z" },
  { id: "w2", userId: null, username: "Anonymous", content: "Sending love and blessings to Orm and Folk! May your careers continue to shine bright and your friendship stay strong forever. 🙏✨", type: "blessing", createdAt: "2025-05-30T09:00:00Z" },
  { id: "w3", userId: "u12", username: "ThaiFan_Nong", content: "ไม่เคยคิดว่าจะมีซีรีส์ที่ทำให้รู้สึกอบอุ่นขนาดนี้ ขอบคุณพี่ออมและพี่โฟล์คที่สร้างโมเมนต์ดีๆ ให้พวกเรา รักนะคะ ❤️", type: "story", createdAt: "2025-05-28T15:30:00Z" },
  { id: "w4", userId: "u13", username: "Folkie_JP", content: "From Japan with love! Arigatou for bringing such a beautiful love story to the screen. OrmFolk best GL couple! 💕", type: "blessing", createdAt: "2025-05-27T12:00:00Z" },
];

// --- Fan Map Locations ---
export const fanLocations: FanLocation[] = [
  { id: "loc1", city: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018, displayName: "Bangkok, Thailand" },
  { id: "loc2", city: "Shanghai", country: "China", lat: 31.2304, lng: 121.4737, displayName: "Shanghai, China" },
  { id: "loc3", city: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, displayName: "Tokyo, Japan" },
  { id: "loc4", city: "Manila", country: "Philippines", lat: 14.5995, lng: 120.9842, displayName: "Manila, Philippines" },
  { id: "loc5", city: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.9780, displayName: "Seoul, South Korea" },
  { id: "loc6", city: "Jakarta", country: "Indonesia", lat: -6.2088, lng: 106.8456, displayName: "Jakarta, Indonesia" },
  { id: "loc7", city: "New York", country: "USA", lat: 40.7128, lng: -74.0060, displayName: "New York, USA" },
  { id: "loc8", city: "London", country: "UK", lat: 51.5074, lng: -0.1278, displayName: "London, UK" },
  { id: "loc9", city: "Paris", country: "France", lat: 48.8566, lng: 2.3522, displayName: "Paris, France" },
  { id: "loc10", city: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093, displayName: "Sydney, Australia" },
  { id: "loc11", city: "Sao Paulo", country: "Brazil", lat: -23.5505, lng: -46.6333, displayName: "São Paulo, Brazil" },
  { id: "loc12", city: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198, displayName: "Singapore" },
  { id: "loc13", city: "Taipei", country: "Taiwan", lat: 25.0330, lng: 121.5654, displayName: "Taipei, Taiwan" },
  { id: "loc14", city: "Hong Kong", country: "Hong Kong", lat: 22.3193, lng: 114.1694, displayName: "Hong Kong" },
  { id: "loc15", city: "Delhi", country: "India", lat: 28.6139, lng: 77.2090, displayName: "Delhi, India" },
];
