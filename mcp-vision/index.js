#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import sharp from "sharp";
import { pipeline, env, RawImage } from "@xenova/transformers";

// Use HF mirror for China access
env.remoteHost = "https://hf-mirror.com";
env.remotePathTemplate = "{model}/resolve/{revision}/";

// Lazy-loaded caption pipeline (model downloads once, then cached)
let captionPipeline = null;
async function getCaptionPipeline() {
  if (!captionPipeline) {
    console.error("Loading image captioning model (first run downloads ~350MB)...");
    captionPipeline = await pipeline("image-to-text", "Xenova/vit-gpt2-image-captioning");
    console.error("Model loaded.");
  }
  return captionPipeline;
}
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const server = new McpServer({
  name: "mcp-vision",
  version: "1.0.0",
});

// ── Color utils ──
function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, "0")).join("");
}
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) / 6
      : max === g ? ((b - r) / d + 2) / 6
      : ((r - g) / d + 4) / 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function colorName(r, g, b) {
  const brightness = (r + g + b) / 3;
  const saturation = Math.max(r, g, b) - Math.min(r, g, b);
  const warmth = r - b;

  if (brightness > 240) return "pure white";
  if (brightness > 220 && saturation < 20) return "near white";
  if (brightness > 200 && saturation < 30) return warmth > 10 ? "warm white / cream" : "cool white";
  if (brightness > 180 && warmth > 15 && saturation < 40) return "cream";
  if (brightness > 160 && warmth > 10 && saturation < 30) return "light beige";
  if (brightness < 40) return "near black";
  if (brightness < 70) return "very dark";
  if (brightness < 100) return "dark";
  if (warmth > 30 && saturation > 40) return "warm brown/orange";
  if (warmth > 15 && saturation > 20) return "warm beige/tan";
  if (warmth < -20 && saturation < 30) return "cool grey";
  if (saturation < 15) return "grey";
  if (r > g && r > b) return "reddish/warm pink";
  if (g > r && g > b) return "greenish";
  if (b > r && b > g) return "bluish/cool";
  return "neutral mid-tone";
}

// ── Region analysis ──
function analyzeRegion(buf, imgW, imgH, x0, y0, x1, y1) {
  const channels = buf.length / (imgW * imgH);
  let r = 0, g = 0, b = 0, n = 0;
  const sx = Math.max(0, Math.floor(x0 * imgW));
  const sy = Math.max(0, Math.floor(y0 * imgH));
  const ex = Math.min(imgW, Math.floor(x1 * imgW));
  const ey = Math.min(imgH, Math.floor(y1 * imgH));

  let minBright = 999, maxBright = -1;

  for (let y = sy; y < ey; y++) {
    for (let x = sx; x < ex; x++) {
      const i = (y * imgW + x) * channels;
      const pr = buf[i], pg = buf[i + 1], pb = buf[i + 2];
      r += pr; g += pg; b += pb; n++;
      const bright = (pr + pg + pb) / 3;
      if (bright < minBright) minBright = bright;
      if (bright > maxBright) maxBright = bright;
    }
  }

  if (n === 0) return null;
  r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
  return {
    avg: { r, g, b, hex: rgbToHex(r, g, b), name: colorName(r, g, b) },
    brightness: { min: Math.round(minBright), max: Math.round(maxBright) },
    hsl: rgbToHsl(r, g, b),
  };
}

// ── Detect if image contains a subject vs background ──
function detectSubject(regions) {
  // Find the region with the most distinctive color (different from background edges)
  const corners = [regions.topLeft, regions.topRight, regions.bottomLeft, regions.bottomRight].filter(Boolean);
  const center = regions.center;

  if (!center || corners.length < 4) return "unknown";

  const cornerAvg = corners.reduce((s, c) => ({
    r: s.r + c.avg.r / 4, g: s.g + c.avg.g / 4, b: s.b + c.avg.b / 4,
  }), { r: 0, g: 0, b: 0 });

  const diff = Math.abs(center.avg.r - cornerAvg.r)
    + Math.abs(center.avg.g - cornerAvg.g)
    + Math.abs(center.avg.b - cornerAvg.b);

  if (diff > 60) return "Subject is distinct from background edges";
  if (diff > 25) return "Subject blends somewhat with background";
  return "Subject may fill the frame or blend with background";
}

// ── Main tool ──
server.tool(
  "describe_image",
  "Analyze an image file and return detailed visual information: colors, brightness, composition, and likely subject description.",
  {
    path: z.string().describe("Absolute path to the image file (jpg, png, webp, heic, etc.)"),
  },
  async ({ path }) => {
    const absPath = resolve(path);
    if (!existsSync(absPath)) {
      return { content: [{ type: "text", text: `❌ File not found: ${absPath}` }] };
    }

    try {
      const meta = await sharp(absPath).metadata();
      const { width, height, format, space, hasAlpha, channels } = meta;

      // Downscale for analysis
      const analyzeW = Math.min(width, 200);
      const analyzeH = Math.round(height * (analyzeW / width));
      const raw = await sharp(absPath).resize(analyzeW, analyzeH).raw().toBuffer();
      const ch = raw.length / (analyzeW * analyzeH);

      // Define regions
      const regions = {
        topLeft: analyzeRegion(raw, analyzeW, analyzeH, 0.05, 0.05, 0.35, 0.35),
        topRight: analyzeRegion(raw, analyzeW, analyzeH, 0.65, 0.05, 0.95, 0.35),
        bottomLeft: analyzeRegion(raw, analyzeW, analyzeH, 0.05, 0.65, 0.35, 0.95),
        bottomRight: analyzeRegion(raw, analyzeW, analyzeH, 0.65, 0.65, 0.95, 0.95),
        center: analyzeRegion(raw, analyzeW, analyzeH, 0.30, 0.30, 0.70, 0.70),
        topCenter: analyzeRegion(raw, analyzeW, analyzeH, 0.30, 0.05, 0.70, 0.35),
        midCenter: analyzeRegion(raw, analyzeW, analyzeH, 0.30, 0.35, 0.70, 0.65),
        bottomCenter: analyzeRegion(raw, analyzeW, analyzeH, 0.30, 0.65, 0.70, 0.95),
      };

      // Overall stats
      let totalR = 0, totalG = 0, totalB = 0, totalN = 0;
      for (let i = 0; i < raw.length; i += ch) {
        totalR += raw[i]; totalG += raw[i + 1]; totalB += raw[i + 2]; totalN++;
      }
      totalR = Math.round(totalR / totalN);
      totalG = Math.round(totalG / totalN);
      totalB = Math.round(totalB / totalN);

      const subject = detectSubject(regions);
      const overallName = colorName(totalR, totalG, totalB);

      // Build response
      let text = `## 🖼️ Image Analysis: ${absPath.split("/").pop()}\n\n`;
      text += `**Format:** ${format} | **Size:** ${width}×${height} | **Space:** ${space} | **Alpha:** ${hasAlpha ? "yes" : "no"}\n\n`;

      text += `### Overall\n- **Average color:** ${rgbToHex(totalR, totalG, totalB)} — ${overallName}\n`;
      text += `- **Brightness:** ${Math.round((totalR + totalG + totalB) / 3)}/255\n`;
      text += `- **Warmth:** ${totalR > totalB ? "warm" : "cool"} (R−B = ${totalR - totalB})\n`;
      text += `- **Subject detection:** ${subject}\n\n`;

      text += `### Color by Region\n`;
      text += `| Region | Avg Color | Name | Brightness |\n`;
      text += `|--------|-----------|------|------------|\n`;

      for (const [name, r] of Object.entries(regions)) {
        if (!r) continue;
        text += `| ${name} | ${r.avg.hex} | ${r.avg.name} | ${Math.round((r.avg.r + r.avg.g + r.avg.b) / 3)} |\n`;
      }

      text += `\n### Interpretation\n`;
      const centerBright = regions.center ? (regions.center.avg.r + regions.center.avg.g + regions.center.avg.b) / 3 : 0;
      const edgesBright = [regions.topLeft, regions.topRight, regions.bottomLeft, regions.bottomRight]
        .filter(Boolean)
        .reduce((s, r) => s + (r.avg.r + r.avg.g + r.avg.b) / 3, 0) / 4;

      if (centerBright > 200) text += "- Center is very bright → likely a light-colored subject or highlight\n";
      if (centerBright < 80) text += "- Center is very dark → subject may be dark or in shadow\n";
      if (edgesBright > centerBright + 30) text += "- Edges brighter than center → subject is darker than background\n";
      if (centerBright > edgesBright + 30) text += "- Center brighter than edges → light subject against darker background\n";
      if (Math.abs(totalR - totalB) > 20) text += `- ${totalR > totalB ? "Warm" : "Cool"} tone dominates the image\n`;
      if (totalR > 180 && totalG > 160 && totalB > 140) text += "- Likely contains white, cream, or light-colored elements\n";

      return { content: [{ type: "text", text }] };
    } catch (e) {
      return { content: [{ type: "text", text: `❌ Error analyzing image: ${e.message}` }] };
    }
  }
);

// ── Palette extraction tool ──
server.tool(
  "extract_palette",
  "Extract the dominant color palette from an image. Returns top colors with hex codes.",
  {
    path: z.string().describe("Absolute path to the image file"),
  },
  async ({ path }) => {
    const absPath = resolve(path);
    if (!existsSync(absPath)) {
      return { content: [{ type: "text", text: `❌ File not found: ${absPath}` }] };
    }

    try {
      // Resize small for palette analysis
      const raw = await sharp(absPath).resize(100, 100, { fit: "inside" }).raw().toBuffer();
      const { width, height } = await sharp(absPath).resize(100, 100, { fit: "inside" }).metadata();

      // Build color histogram (quantized)
      const hist = new Map();
      for (let i = 0; i < raw.length; i += 3) {
        const r = Math.round(raw[i] / 32) * 32;
        const g = Math.round(raw[i + 1] / 32) * 32;
        const b = Math.round(raw[i + 2] / 32) * 32;
        const key = `${r},${g},${b}`;
        hist.set(key, (hist.get(key) || 0) + 1);
      }

      const sorted = [...hist.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([key, count]) => {
          const [r, g, b] = key.split(",").map(Number);
          return {
            hex: rgbToHex(r, g, b),
            rgb: `rgb(${r},${g},${b})`,
            name: colorName(r, g, b),
            percent: ((count / (width * height)) * 100).toFixed(1),
          };
        });

      let text = `## 🎨 Color Palette\n\n`;
      for (const c of sorted) {
        text += `- \`${c.hex}\` ${c.rgb} — **${c.name}** (${c.percent}%)\n`;
      }

      return { content: [{ type: "text", text }] };
    } catch (e) {
      return { content: [{ type: "text", text: `❌ Error: ${e.message}` }] };
    }
  }
);

// ── AI Image Caption tool ──
server.tool(
  "ai_describe",
  "Use AI vision model to generate a natural language description of an image. Tells you what the image contains — objects, animals, people, scene, colors, and overall impression.",
  {
    path: z.string().describe("Absolute path to the image file"),
  },
  async ({ path }) => {
    const absPath = resolve(path);
    if (!existsSync(absPath)) {
      return { content: [{ type: "text", text: `❌ File not found: ${absPath}` }] };
    }
    try {
      const captioner = await getCaptionPipeline();

      // Read image using RawImage helper
      const image = await RawImage.read(absPath);
      const result = await captioner(image, { max_new_tokens: 50 });

      const captions = Array.isArray(result) ? result : [result];
      const text = captions.map(c => c.generated_text || c.text || JSON.stringify(c)).join("\n");

      return { content: [{ type: "text", text: `## 🤖 AI Description\n\n${text}\n\n_Model: vit-gpt2-image-captioning (local)_` }] };
    } catch (e) {
      return { content: [{ type: "text", text: `❌ AI caption error: ${e.message}` }] };
    }
  }
);

// ── Start server ──
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("mcp-vision server running on stdio");
