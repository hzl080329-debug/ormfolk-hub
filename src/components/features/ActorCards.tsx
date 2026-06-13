"use client";

import { useLocale } from "next-intl";
import { Heart, ExternalLink, Globe, Link2, AtSign, Upload, Pencil } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

const communityLinks = [
  { label: { en: "OrmFolk Super Topic (Weibo)", zh: "OrmFolk 微博超话", th: "OrmFolk ซูเปอร์ทอปิก" }, url: "https://weibo.com/p/10080840ef81eb3fec564a9d23617226f87395", icon: Globe },
  { label: { en: "Apple My Love Official IG", zh: "Apple My Love 官方 IG", th: "Apple My Love IG ทางการ" }, url: "https://www.instagram.com/applemyloveofficial/", icon: AtSign },
  { label: { en: "Douban Group", zh: "豆瓣 ormfolk幸福基地", th: "กลุ่ม Douban OrmFolk" }, url: "https://www.douban.com/group/745376/", icon: Globe },
];

const actors = [
  {
    id: "ormsin",
    name: "Supitcha Limsommut",
    nameZh: "素芘察·琳索姆（林阐娇）",
    nameTh: "สุพิชชา ลิ้มสมมุติ",
    nickname: "Ormsin",
    nicknameTh: "ออมสิน",
    birthdate: "1995-05-30",
    birthplace: "程逸府, Thailand（中泰混血）",
    height: "166cm",
    weight: "45kg",
    bloodType: "O",
    zodiac: { en: "Gemini", zh: "双子座", th: "เมถุน" },
    shoeSize: "40",
    education: { en: "Chiang Mai University, Faculty of Medicine (Physical Therapy)", zh: "清迈大学医学院 物理治疗科学学士", th: "มหาวิทยาลัยเชียงใหม่ คณะแพทยศาสตร์ (กายภาพบำบัด)" },
    agency: "KONGTHUP ARTIST",
    hobbies: { en: "Anime, skateboarding, singing, listening to music", zh: "看动漫、滑板、唱歌、听歌", th: "ดูอนิเมะ สเก็ตบอร์ด ร้องเพลง ฟังเพลง" },
    favoriteFlower: { en: "Sunflower", zh: "向日葵", th: "ทานตะวัน" },
    favoriteColor: { en: "Rainbow, Yellow", zh: "彩虹、黄色", th: "สายรุ้ง สีเหลือง" },
    habit: { en: "Forgetful, loves going out", zh: "健忘、喜欢出门", th: "ขี้ลืม ชอบออกไปข้างนอก" },
    favoriteDrink: { en: "Coffee, cocoa, milk tea", zh: "咖啡、可可、奶茶", th: "กาแฟ โกโก้ ชานม" },
    favoriteFood: { en: "Chocolate, salmon, beef, cheese, glass noodle salad (not spicy), mint-flavored food", zh: "巧克力、三文鱼、牛肉、芝士、凉拌粉丝（不辣）、薄荷味食物", th: "ช็อกโกแลต แซลมอน เนื้อวัว ชีส ยำวุ้นเส้น(ไม่เผ็ด) อาหารรสมินต์" },
    dislikeFood: { en: "Durian, animal organs", zh: "榴莲、动物内脏", th: "ทุเรียน เครื่องในสัตว์" },
    favoriteAnimal: { en: "Cats, dogs", zh: "猫、狗", th: "แมว สุนัข" },
    dislikeAnimal: { en: "Mice, cockroaches", zh: "老鼠、蟑螂", th: "หนู แมลงสาบ" },
    works: [
      { year: 2020, title: { en: "En of Love: This is Love Story", zh: "《爱情攻心计》", th: "En of Love" }, role: "Yiwaa" },
      { year: 2022, title: { en: "Love Mechanics", zh: "《爱情力学》", th: "Love Mechanics" }, role: "Yiwaa" },
      { year: 2022, title: { en: "The Tuxedo", zh: "《裁定终生》", th: "The Tuxedo" }, role: "Chanjao" },
      { year: 2023, title: { en: "Be Mine", zh: "《Be Mine》", th: "Be Mine" }, role: "Tawan" },
      { year: 2023, title: { en: "La Pluie", zh: "《那场雨爱上你》", th: "La Pluie" }, role: "Dream" },
      { year: 2024, title: { en: "Apple My Love", zh: "《致亲爱的你》", th: "Apple My Love" }, role: "Kris" },
    ],
    bio: { en: "", zh: "", th: "" },
    socialLinks: [
      { platform: "Instagram", url: "https://www.instagram.com/orm_supitcha/", icon: AtSign },
      { platform: "Twitter/X", url: "https://twitter.com/orm_supitcha", icon: Link2 },
      { platform: "微博", url: "https://weibo.com/u/7952595017", icon: Globe },
    ],
    color: "rainbow-bg",
    bgLight: "bg-secondary-light",
    imageKey: "ormsin_image",
    image: "",
  },
  {
    id: "folk",
    name: "Sutima Kokiatwanit (Korkiatvanich)",
    nameZh: "素缇玛·格洁万尼（高素洁）",
    nameTh: "สุธิมา ก่อเกียรติวนิช",
    nickname: "Folk",
    nicknameTh: "โฟล์ค",
    birthdate: "2000-05-16",
    birthplace: "春武里府, Thailand（中泰混血）",
    height: "155cm",
    weight: "40kg",
    bloodType: "A",
    zodiac: { en: "Taurus", zh: "金牛座", th: "พฤษภ" },
    shoeSize: "36.5",
    education: { en: "Bangkok University, Communication Arts", zh: "曼谷大学 传播艺术学士", th: "มหาวิทยาลัยกรุงเทพ นิเทศศาสตร์" },
    agency: "KONGTHUP ARTIST",
    hobbies: { en: "Petting cats, listening to music", zh: "撸猫、听歌", th: "เล่นกับแมว ฟังเพลง" },
    favoriteColor: { en: "Sky blue", zh: "天蓝", th: "สีฟ้า" },
    favoritePlace: { en: "The seaside", zh: "海边", th: "ทะเล" },
    favoriteDrink: { en: "Cocoa, green tea/matcha, coffee (low sugar)", zh: "可可、绿茶/抹茶、咖啡（少糖）", th: "โกโก้ ชาเขียว/มัทฉะ กาแฟ(หวานน้อย)" },
    favoriteFood: { en: "Daifuku, macarons, noodles", zh: "大福、马卡龙、面条", th: "ไดฟูกุ มาการอง บะหมี่" },
    dislikeFood: { en: "Five-spice eggs, food with tendons", zh: "五香卤蛋、有筋的食物", th: "ไข่พะโล้ อาหารที่มีเอ็น" },
    favoriteAnimal: { en: "Cats", zh: "猫", th: "แมว" },
    dislikeAnimal: { en: "Geckos, cockroaches", zh: "壁虎、蟑螂", th: "จิ้งจก แมลงสาบ" },
    habit: { en: "Focused on her own things; quiet alone but talkative with close ones; eats little, likes sleeping on days off", zh: "专注自己的事；喜欢独处但与亲近的人话很多；吃得少，休息时喜欢睡觉", th: "จดจ่อกับสิ่งที่ทำ ชอบอยู่เงียบๆ คนเดียวแต่พูดเก่งกับคนสนิท ทานน้อย ชอบนอนในวันหยุด" },
    works: [
      { year: 2023, title: { en: "Be Mine", zh: "《Be Mine》", th: "Be Mine" }, role: "Winnie" },
      { year: 2024, title: { en: "Apple My Love", zh: "《致亲爱的你》", th: "Apple My Love" }, role: "Karn" },
    ],
    bio: {
      en: "", zh: "", th: "",
    },
    socialLinks: [
      { platform: "Instagram", url: "https://www.instagram.com/ffolky/", icon: AtSign },
      { platform: "Twitter/X", url: "https://twitter.com/folk_sutima", icon: Link2 },
      { platform: "微博", url: "https://weibo.com/u/7952816069", icon: Globe },
    ],
    color: "from-primary to-primary-dark",
    bgLight: "bg-primary-light",
    imageKey: "folk_image",
    image: "",
  },
];


export default function ActorCards() {
  const locale = useLocale();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";
  const [actorImages, setActorImages] = useState<Record<string, string>>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  useEffect(() => {
    Promise.all(actors.map(async (a) => {
      try {
        const res = await fetch(`/api/settings?key=${a.imageKey}`);
        const data = await res.json();
        if (data.value) setActorImages(prev => ({ ...prev, [a.id]: data.value }));
      } catch {}
    }));
  }, []);

  async function handleActorImageUpload(actorId: string, imageKey: string, file: File) {
    setUploadingKey(actorId);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        // Save image URL to site settings
        await fetch("/api/actor-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: imageKey, url: data.url }),
        });
        setActorImages(prev => ({ ...prev, [actorId]: data.url }));
      } else if (data.error) {
        alert(data.error);
      }
    } catch (e: any) {
      alert("Upload failed: " + (e.message || "unknown"));
    }
    setUploadingKey(null);
  }

  function getAge(birthdate: string) {
    const birth = new Date(birthdate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  }

  function getLocalized(obj: any): string {
    return obj[locale] || obj.en || "";
  }

  return (
    <section className="bg-white border-t border-border py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary-dark mb-4 shadow-sm">
            <Heart size={24} className="text-white" fill="white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-2">
            {locale === "zh" || locale === "zht" || locale === "yue" ? "认识 ORMFOLK" : locale === "th" ? "รู้จัก ORMFOLK" : "Meet ORMFOLK"}
          </h2>
          <p className="text-text-muted">
            {locale === "zh" || locale === "zht" || locale === "yue" ? "Ormsin 与 Folk 的个人档案" : locale === "th" ? "ประวัติของออมสินและโฟล์ค" : "Profiles of Ormsin & Folk"}
          </p>
        </div>

        {/* Actor Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {actors.map((actor) => (
            <div
              key={actor.id}
              className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-all"
            >
              {/* Card header with gradient */}
              <div className={`h-24 ${actor.color === "rainbow-bg" ? "rainbow-bg" : `bg-gradient-to-r ${actor.color}`} relative`}>
                <div className="absolute -bottom-10 left-6">
                  <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center text-3xl overflow-hidden">
                    {actorImages[actor.id] ? (
                      <img src={actorImages[actor.id]} alt={actor.nickname} className="w-full h-full object-cover" />
                    ) : (
                      actor.id === "ormsin" ? "🌟" : "🦋"
                    )}
                  </div>
                </div>
                {/* Admin upload button */}
                {isAdmin && (
                  <div className="absolute top-2 right-2">
                    <label className={`flex items-center gap-1 px-2 py-1 bg-white/80 rounded-lg text-xs cursor-pointer hover:bg-white ${uploadingKey === actor.id ? "opacity-50" : ""}`}>
                      {uploadingKey === actor.id ? "..." : <><Pencil size={10} /> Photo</>}
                      <input id={`actor-upload-${actor.id}`} type="file" accept="image/*" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleActorImageUpload(actor.id, actor.imageKey, f); }} />
                    </label>
                  </div>
                )}
              </div>

              {/* Card body */}
              <div className="pt-12 px-6 pb-6">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-extrabold text-text-primary">{actor.nickname}</h3>
                  <span className="text-sm text-text-muted">{actor.nicknameTh}</span>
                </div>
                <p className="text-xs text-text-muted mb-3">
                  {actor.name}
                  {actor.nameZh && <span className="ml-1">· {actor.nameZh}</span>}
                  <br />{actor.nameTh}
                </p>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-4 text-xs">
                  <div className="flex gap-1">
                    <span className="text-text-muted shrink-0">🎂</span>
                    <span className="text-text-primary font-medium">{actor.birthdate} ({getAge(actor.birthdate)}{locale === "zh" || locale === "zht" || locale === "yue" ? "岁" : locale === "th" ? "ปี" : "y"})</span>
                  </div>
                  {actor.zodiac && (
                    <div className="flex gap-1">
                      <span className="text-text-muted shrink-0">⭐</span>
                      <span className="text-text-primary">{getLocalized(actor.zodiac)}</span>
                    </div>
                  )}
                  {actor.height && (
                    <div className="flex gap-1">
                      <span className="text-text-muted shrink-0">📏</span>
                      <span className="text-text-primary">{actor.height}</span>
                    </div>
                  )}
                  {actor.weight && (
                    <div className="flex gap-1">
                      <span className="text-text-muted shrink-0">⚖️</span>
                      <span className="text-text-primary">{actor.weight}</span>
                    </div>
                  )}
                  {actor.bloodType && (
                    <div className="flex gap-1">
                      <span className="text-text-muted shrink-0">🩸</span>
                      <span className="text-text-primary">{actor.bloodType}{locale === "zh" || locale === "zht" || locale === "yue" ? "型" : locale === "th" ? " กรุ๊ป" : " type"}</span>
                    </div>
                  )}
                  {actor.shoeSize && (
                    <div className="flex gap-1">
                      <span className="text-text-muted shrink-0">👟</span>
                      <span className="text-text-primary">{actor.shoeSize}{locale === "zh" || locale === "zht" || locale === "yue" ? "码" : ""}</span>
                    </div>
                  )}
                  <div className="flex gap-1 col-span-2">
                    <span className="text-text-muted shrink-0">📍</span>
                    <span className="text-text-primary">{actor.birthplace}</span>
                  </div>
                  {actor.education && (
                    <div className="flex gap-1 col-span-2">
                      <span className="text-text-muted shrink-0">🎓</span>
                      <span className="text-text-primary text-xs leading-snug">{getLocalized(actor.education)}</span>
                    </div>
                  )}
                  {actor.agency && (
                    <div className="flex gap-1 col-span-2">
                      <span className="text-text-muted shrink-0">🏢</span>
                      <span className="text-text-primary">{actor.agency}</span>
                    </div>
                  )}
                </div>

                {/* Hobbies & Favorites */}
                {(actor.hobbies || actor.favoriteFlower || actor.favoriteColor || actor.habit || actor.favoriteDrink || actor.favoriteFood) && (
                  <div className="mb-3 p-3 bg-background rounded-xl space-y-1">
                    {actor.hobbies && (
                      <div className="text-xs"><span className="text-text-muted">{locale === "zh" || locale === "zht" || locale === "yue" ? "爱好：" : locale === "th" ? "งานอดิเรก: " : "Hobbies: "}</span><span className="text-text-primary">{getLocalized(actor.hobbies)}</span></div>
                    )}
                    {actor.favoriteFlower && (
                      <div className="text-xs"><span className="text-text-muted">{locale === "zh" || locale === "zht" || locale === "yue" ? "喜欢的花：" : locale === "th" ? "🌸: " : "🌸: "}</span><span className="text-text-primary">{getLocalized(actor.favoriteFlower)}</span></div>
                    )}
                    {actor.favoriteColor && (
                      <div className="text-xs"><span className="text-text-muted">{locale === "zh" || locale === "zht" || locale === "yue" ? "喜欢的颜色：" : locale === "th" ? "🎨: " : "🎨: "}</span><span className="text-text-primary">{getLocalized(actor.favoriteColor)}</span></div>
                    )}
                    {actor.favoriteDrink && (
                      <div className="text-xs"><span className="text-text-muted">{locale === "zh" || locale === "zht" || locale === "yue" ? "喜欢的饮品：" : locale === "th" ? "🥤: " : "🥤: "}</span><span className="text-text-primary">{getLocalized(actor.favoriteDrink)}</span></div>
                    )}
                    {actor.favoriteFood && (
                      <div className="text-xs"><span className="text-text-muted">{locale === "zh" || locale === "zht" || locale === "yue" ? "喜欢的食物：" : locale === "th" ? "🍽️: " : "🍽️: "}</span><span className="text-text-primary">{getLocalized(actor.favoriteFood)}</span></div>
                    )}
                    {actor.dislikeFood && (
                      <div className="text-xs"><span className="text-text-muted">{locale === "zh" || locale === "zht" || locale === "yue" ? "不喜欢的食物：" : locale === "th" ? "🚫🍽️: " : "🚫: "}</span><span className="text-text-primary">{getLocalized(actor.dislikeFood)}</span></div>
                    )}
                    {actor.favoriteAnimal && (
                      <div className="text-xs"><span className="text-text-muted">{locale === "zh" || locale === "zht" || locale === "yue" ? "喜欢的动物：" : locale === "th" ? "🐾: " : "🐾: "}</span><span className="text-text-primary">{getLocalized(actor.favoriteAnimal)}</span></div>
                    )}
                    {actor.dislikeAnimal && (
                      <div className="text-xs"><span className="text-text-muted">{locale === "zh" || locale === "zht" || locale === "yue" ? "不喜欢的动物：" : locale === "th" ? "🚫🐾: " : "🚫: "}</span><span className="text-text-primary">{getLocalized(actor.dislikeAnimal)}</span></div>
                    )}
                    {actor.habit && (
                      <div className="text-xs"><span className="text-text-muted">{locale === "zh" || locale === "zht" || locale === "yue" ? "习惯：" : locale === "th" ? "📝: " : "📝: "}</span><span className="text-text-primary">{getLocalized(actor.habit)}</span></div>
                    )}
                  </div>
                )}

                {/* Works */}
                {actor.works && actor.works.length > 0 && (
                  <div className="mb-3 p-3 bg-background rounded-xl">
                    <div className="text-xs font-semibold text-text-primary mb-2">
                      {locale === "zh" || locale === "zht" || locale === "yue" ? "📺 代表作品" : locale === "th" ? "📺 ผลงาน" : "📺 Works"}
                    </div>
                    <div className="space-y-1.5">
                      {actor.works.map((w: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-text-primary font-medium">{getLocalized(w.title)}</span>
                          <span className="text-text-muted">{w.role} · {w.year}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bio */}
                <p className="text-sm text-text-secondary leading-relaxed mb-4">
                  {getLocalized(actor.bio)}
                </p>

                {/* Social links */}
                <div className="flex items-center gap-2 pt-3 border-t border-border">
                  <span className="text-xs text-text-muted mr-1">
                    {locale === "zh" || locale === "zht" || locale === "yue" ? "关注" : locale === "th" ? "ติดตาม" : "Follow"}:
                  </span>
                  {actor.socialLinks.map((link) => (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 bg-background hover:bg-primary-light/50 rounded-lg text-xs font-medium text-text-secondary hover:text-accent transition-colors"
                    >
                      <link.icon size={14} />
                      {link.platform}
                      <ExternalLink size={10} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      {/* Community links */}
      <div className="text-center">
        <h3 className="text-lg font-extrabold text-text-primary mb-4">
          {locale === "zh" || locale === "zht" || locale === "yue" ? "加入 ORMFOLK 粉丝社区" : locale === "th" ? "เข้าร่วมชุมชนแฟนคลับ ORMFOLK" : "Join the ORMFOLK Fan Community"}
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {communityLinks.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-primary-light/20 rounded-xl border border-border hover:border-primary-light shadow-sm transition-all text-sm font-semibold text-text-primary"
            >
              <link.icon size={16} className="text-accent" />
              {getLocalized(link.label)}
              <ExternalLink size={12} className="text-text-muted" />
            </a>
          ))}
        </div>
        <p className="text-xs text-text-muted mt-4">
          #Ormfolk
        </p>
      </div>
      </div>
    </section>
  );
}
