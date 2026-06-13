/**
 * Translation Service — unified translation for all content types.
 *
 * Supported languages:
 *   zh  = Simplified Chinese (简体中文)
 *   zht = Traditional Chinese (繁體中文)
 *   yue = Cantonese / Yue (粵語)
 *   th  = Thai (ไทย)
 *   en  = English
 */

// ============================================================
// Language detection
// ============================================================

/** Detect the most likely language of a text. */
export function detectLanguage(text: string): "zh" | "zht" | "yue" | "th" | "en" {
  if (!text) return "en";
  // Strong Thai signal — Thai script
  if (/[฀-๿]/.test(text)) return "th";
  // Cantonese / Yue markers (colloquial words) — check before generic hanzi
  if (/[嘅咁哋冇佢係喺嘢啲嚟吓乜喔咋嗰叻啱冧俾]/.test(text)) return "yue";
  // Chinese hanzi — check traditional vs simplified
  if (/[一-鿿]/.test(text)) {
    // Traditional-only characters signal
    if (/[臺體國會機對發學實關麵裡麼]/.test(text)) {
      return countTraditional(text) > countSimplified(text) ? "zht" : "zh";
    }
    return "zh";
  }
  return "en";
}

function countTraditional(text: string): number {
  const trad = /[臺體國會機對發學實關麵裡麼衛藝藥]/.source;
  let count = 0;
  for (const ch of text) {
    if (/[臺體國會機對發學實關麵裡麼衛藝藥]/.test(ch)) count++;
  }
  return count;
}

function countSimplified(text: string): number {
  const simp = /[台体国会机对发学实关面里么卫艺药]/.source;
  let count = 0;
  for (const ch of text) {
    if (/[台体国会机对发学实关面里么卫艺药]/.test(ch)) count++;
  }
  return count;
}

// ============================================================
// Translation API (MyMemory — free tier)
// ============================================================

const LANG_CODE_MAP: Record<string, string> = {
  en: "en-GB", zh: "zh-CN", zht: "zh-TW", yue: "zh-CN", th: "th-TH",
};

const DISPLAY_NAMES: Record<string, string> = {
  en: "English", zh: "简体中文", zht: "繁體中文", yue: "粵語", th: "ไทย",
};

const DISPLAY_NAMES_LOCALIZED: Record<string, Record<string, string>> = {
  zh: { en: "English", zh: "简体中文", zht: "繁體中文", yue: "粵語", th: "泰语" },
  zht: { en: "English", zh: "簡體中文", zht: "繁體中文", yue: "粵語", th: "泰語" },
  yue: { en: "English", zh: "簡體中文", zht: "繁體中文", yue: "粵語", th: "泰文" },
  th: { en: "อังกฤษ", zh: "จีนตัวย่อ", zht: "จีนตัวเต็ม", yue: "กวางตุ้ง", th: "ไทย" },
  en: { en: "English", zh: "Simplified Chinese", zht: "Traditional Chinese", yue: "Cantonese", th: "Thai" },
};

export function getLanguageDisplayName(lang: string, inLang: string = "en"): string {
  return DISPLAY_NAMES_LOCALIZED[inLang]?.[lang] || DISPLAY_NAMES[lang] || lang;
}

/**
 * Translate text from one language to another.
 * Results are cached in-memory for the process lifetime (simple dedup).
 */
const cache = new Map<string, string>();

export async function translateText(text: string, from: string, to: string): Promise<string> {
  if (!text || from === to) return text;
  const cacheKey = `${from}:${to}:${text.slice(0, 100)}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  const fromLang = LANG_CODE_MAP[from] || from;
  const toLang = LANG_CODE_MAP[to] || to;

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`,
      { signal: AbortSignal.timeout(8000) }
    );
    const data = await res.json();
    const result = data.responseData?.translatedText || text;
    if (result !== text) cache.set(cacheKey, result);
    return result;
  } catch {
    return text;
  }
}

// ============================================================
// Multi-language auto translation
// ============================================================

export type Translations = {
  en: string;
  zh: string;
  zht: string;
  yue: string;
  th: string;
};

/**
 * Auto-translate text to all 5 supported languages.
 * The source language is preserved as-is; all others are translated.
 */
export async function autoTranslateAll(text: string): Promise<Translations> {
  const src = detectLanguage(text);
  const result: Translations = { en: text, zh: text, zht: text, yue: text, th: text };

  const targets = (["en", "zh", "zht", "yue", "th"] as const).filter(l => l !== src);

  // Translate from source to each target (parallel)
  const translations = await Promise.all(
    targets.map(async (target) => {
      const translated = await translateText(text, src, target);
      return { lang: target, text: translated !== text ? translated : text };
    })
  );

  for (const { lang, text: translated } of translations) {
    result[lang] = translated;
  }

  // Set source language text as-is
  result[src] = text;

  return result;
}

/**
 * More efficient — only translate to the 3 main languages (en, zh, th)
 * plus zht/yue derived from zh. Used for posts/announcements.
 */
export async function autoTranslate3(text: string): Promise<{ en: string; zh: string; th: string }> {
  const src = detectLanguage(text);
  if (src === "zh" || src === "zht" || src === "yue") {
    const [en, th] = await Promise.all([
      translateText(text, "zh", "en"),
      translateText(text, "zh", "th"),
    ]);
    return { zh: text, en: en !== text ? en : text, th: th !== text ? th : text };
  }
  if (src === "th") {
    const [en, zh] = await Promise.all([
      translateText(text, "th", "en"),
      translateText(text, "th", "zh"),
    ]);
    return { th: text, en: en !== text ? en : text, zh: zh !== text ? zh : text };
  }
  // English source
  const [zh, th] = await Promise.all([
    translateText(text, "en", "zh"),
    translateText(text, "en", "th"),
  ]);
  return { en: text, zh: zh !== text ? zh : text, th: th !== text ? th : text };
}

// ============================================================
// Translation cache (DB-based for content)
// ============================================================

/**
 * Get or create a translation for a cached text field.
 * Checks the `translations` JSON field for a cached version first.
 */
export async function getOrCreateTranslation(
  originalText: string,
  originalLang: string,
  targetLang: string,
  cacheJson?: string | null
): Promise<{ text: string; fromCache: boolean }> {
  if (!originalText) return { text: "", fromCache: true };
  if (originalLang === targetLang) return { text: originalText, fromCache: true };

  // Try cache first
  if (cacheJson) {
    try {
      const c = JSON.parse(cacheJson);
      if (c[targetLang]) return { text: c[targetLang], fromCache: true };
    } catch {}
  }

  const translated = await translateText(originalText, originalLang, targetLang);
  return { text: translated !== originalText ? translated : originalText, fromCache: false };
}

/**
 * Get content to display based on user's locale.
 * Returns the best available version + metadata.
 */
export function getLocalizedContent(
  translations: Partial<Translations> | null | undefined,
  originalLang: string,
  targetLocale: string
): { text: string; isTranslated: boolean; sourceLang: string } {
  // Map locale to translation key
  const key = targetLocale === "zh" ? "zh"
    : targetLocale === "zht" ? "zht"
    : targetLocale === "yue" ? "yue"
    : targetLocale === "th" ? "th"
    : "en";

  if (!translations) {
    return { text: "", isTranslated: false, sourceLang: originalLang };
  }

  const translated = (translations as any)[key];
  if (translated && key !== originalLang) {
    return { text: translated, isTranslated: true, sourceLang: originalLang };
  }

  return { text: (translations as any)[originalLang] || "", isTranslated: false, sourceLang: originalLang };
}

// ============================================================
// Translation badge helpers
// ============================================================

/**
 * Generate text for the "auto-translated" indicator.
 */
export function getTranslationIndicator(fromLang: string, toLang: string, interfaceLang: string): string {
  const fromName = getLanguageDisplayName(fromLang, interfaceLang);
  const toName = getLanguageDisplayName(toLang, interfaceLang);
  const templates: Record<string, string> = {
    zh: `已由${fromName}自动翻译为${toName}`,
    zht: `已由${fromName}自動翻譯為${toName}`,
    yue: `已由${fromName}自動翻譯為${toName}`,
    th: `แปลจาก${fromName}เป็น${toName}โดยอัตโนมัติ`,
    en: `Auto-translated from ${fromName} to ${toName}`,
  };
  return templates[interfaceLang] || templates.en;
}
