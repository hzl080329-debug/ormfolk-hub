/**
 * Unified Translation Service for ORMFOLK Hub
 *
 * Features:
 * - detectLanguage(text) → ISO code
 * - translateText(text, from, to) → translated text
 * - getOrCreateTranslation(contentType, contentId, targetLang) → cached translation
 * - invalidateTranslationCache(contentType, contentId)
 * - getTranslationLabel(fromLang, toLang, uiLang) → human-readable label
 */

import { prisma } from "./prisma";

// Language detection: check for CJK, Thai, or default to English
export function detectLanguage(text: string): "zh" | "th" | "en" {
  if (!text) return "en";
  // Chinese characters (includes Simplified and Traditional)
  if (/[一-鿿㐀-䶿]/.test(text)) return "zh";
  // Thai characters
  if (/[฀-๿]/.test(text)) return "th";
  return "en";
}

// Map internal codes to MyMemory API language pairs
const LANG_MAP: Record<string, string> = {
  en: "en-GB", zh: "zh-CN", zht: "zh-TW", yue: "zh-CN", th: "th-TH",
};

// Translate text using MyMemory free API
export async function translateText(text: string, from: string, to: string): Promise<string> {
  if (!text || from === to) return text;

  const fromLang = LANG_MAP[from] || from;
  const toLang = LANG_MAP[to] || to;

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`,
      { signal: AbortSignal.timeout(8000) }
    );
    const data = await res.json();
    if (data.responseStatus === 200) {
      return data.responseData?.translatedText || text;
    }
    console.error("MyMemory error:", data);
    return text;
  } catch (e: any) {
    console.error("Translate error:", e.message);
    return text;
  }
}

// Auto-translate to all 5 languages
export async function autoTranslateAll(text: string): Promise<{ en: string; zh: string; th: string }> {
  const src = detectLanguage(text);
  if (src === "zh") {
    const [en, th] = await Promise.all([translateText(text, "zh", "en"), translateText(text, "zh", "th")]);
    return { zh: text, en: en !== text ? en : text, th: th !== text ? th : text };
  }
  if (src === "th") {
    const [en, zh] = await Promise.all([translateText(text, "th", "en"), translateText(text, "th", "zh")]);
    return { th: text, en: en !== text ? en : text, zh: zh !== text ? zh : text };
  }
  const [zh, th] = await Promise.all([translateText(text, "en", "zh"), translateText(text, "en", "th")]);
  return { en: text, zh: zh !== text ? zh : text, th: th !== text ? th : text };
}

// Get or create a cached translation for comments
export async function getOrCreateCommentTranslation(commentId: string, targetLang: string): Promise<string> {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return "";
  const originalLang = comment.originalLang || "en";
  if (originalLang === targetLang) return comment.content;

  // Check cache
  let cache: Record<string, string> = {};
  try { cache = JSON.parse(comment.translations || "{}"); } catch {}
  if (cache[targetLang]) return cache[targetLang];

  // Translate and cache
  const translated = await translateText(comment.content, originalLang, targetLang);
  if (translated && translated !== comment.content) {
    cache[targetLang] = translated;
    await prisma.comment.update({
      where: { id: commentId },
      data: { translations: JSON.stringify(cache) },
    });
    return translated;
  }
  return comment.content;
}

// Invalidate translation cache when content is edited
export async function invalidateCommentTranslationCache(commentId: string) {
  await prisma.comment.update({
    where: { id: commentId },
    data: { translations: "{}" },
  });
}

// Invalidate post translation cache
export async function invalidatePostTranslationCache(postId: string) {
  await prisma.post.update({
    where: { id: postId },
    data: { titleZh: null, contentZh: null, titleTh: null, contentTh: null },
  });
}

// Get human-readable translation label
export function getTranslationLabel(fromLang: string, toLang: string, uiLang: string): string {
  const langNames: Record<string, Record<string, string>> = {
    en: { en: "English", zh: "英语", th: "ภาษาอังกฤษ" },
    zh: { en: "Chinese", zh: "中文", th: "ภาษาจีน" },
    th: { en: "Thai", zh: "泰语", th: "ภาษาไทย" },
  };

  const fromName = langNames[fromLang]?.[uiLang] || fromLang;
  const toName = langNames[toLang]?.[uiLang] || toLang;

  if (uiLang === "zh" || uiLang === "zht" || uiLang === "yue") {
    return `已由${fromName}自动翻译为${toName}`;
  }
  if (uiLang === "th") {
    return `แปลจาก${fromName}เป็น${toName}โดยอัตโนมัติ`;
  }
  return `Auto-translated from ${fromName} to ${toName}`;
}

// Get accuracy disclaimer
export function getAccuracyDisclaimer(uiLang: string): string {
  if (uiLang === "zh" || uiLang === "zht" || uiLang === "yue") {
    return "自动翻译可能不完全准确，请以原文为准。";
  }
  if (uiLang === "th") {
    return "การแปลอัตโนมัติอาจไม่ถูกต้องสมบูรณ์ กรุณาอ้างอิงจากต้นฉบับ";
  }
  return "Auto-translation may not be 100% accurate. Please refer to the original.";
}
