import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: { "User-Agent": "ORMFOLK-Hub-LinkPreview/1.0" },
    });
    const html = await res.text();

    // Extract OG tags
    const getMeta = (prop: string) => {
      const match = html.match(new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i"));
      if (match) return match[1];
      const match2 = html.match(new RegExp(`<meta[^>]+name=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i"));
      return match2 ? match2[1] : null;
    };

    const title = getMeta("og:title") || html.match(/<title[^>]*>([^<]+)<\/title>/)?.[1]?.trim() || url;
    const description = getMeta("og:description") || getMeta("description");
    const image = getMeta("og:image");

    return NextResponse.json({ title, description, image });
  } catch {
    return NextResponse.json({ title: url, description: null, image: null });
  }
}
