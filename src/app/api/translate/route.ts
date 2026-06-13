import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Language mapping for MyMemory
const LANG_MAP: Record<string, string> = {
  en: "en-GB",
  zh: "zh-CN",
  zht: "zh-TW",
  yue: "zh-CN",
  th: "th-TH",
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { text, from, to } = await request.json();
    if (!text || !from || !to) {
      return NextResponse.json({ error: "Missing text, from, or to" }, { status: 400 });
    }

    const fromLang = LANG_MAP[from] || from;
    const toLang = LANG_MAP[to] || to;

    // MyMemory free translation API (no key needed, 1000 chars/day limit for anonymous)
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`,
      { signal: AbortSignal.timeout(8000) }
    );
    const data = await res.json();

    if (data.responseStatus === 200 || data.responseStatus === 403) {
      return NextResponse.json({
        translatedText: data.responseData?.translatedText || text,
        match: data.responseData?.match || "",
      });
    }

    return NextResponse.json({ error: data.responseDetails || "Translation failed" }, { status: 500 });
  } catch (error: any) {
    console.error("Translate error:", error);
    return NextResponse.json({ error: error.message || "Translation failed" }, { status: 500 });
  }
}
