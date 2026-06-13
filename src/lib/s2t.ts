"use client";
// Lightweight Simplified → Traditional Chinese converter hook

let converter: ((text: string) => string) | null = null;
let loading = false;
const waiting: ((c: (text: string) => string) => void)[] = [];

async function init() {
  if (converter) return;
  if (loading) return new Promise<void>((resolve) => waiting.push(() => resolve()));
  loading = true;
  try {
    const mod = await import("opencc-js");
    converter = mod.SimplifiedToTraditional({});
  } catch {
    converter = (t: string) => t; // passthrough on error
  }
  loading = false;
  waiting.forEach((cb) => cb(converter!));
  waiting.length = 0;
}

export async function toTraditional(text: string): Promise<string> {
  await init();
  return converter?.(text) || text;
}
