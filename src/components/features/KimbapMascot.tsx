"use client";

import { useState, useEffect } from "react";

// Kimbap sprite states — official assets from Ormfolk/kimbap/mascot/
const SPRITE_MAP: Record<string, string> = {
  idle: "/kimbap/Normal.png",
  happy: "/kimbap/Happy.png",
  sleepy: "/kimbap/sleepy.png",
  alert: "/kimbap/Alert.png",
  celebrate: "/kimbap/Celebrate.png",
  peek: "/kimbap/Peek.png",
};

// Sticker pack for use in posts/comments
const STICKER_PACK: string[] = [
  "/kimbap/Hi.png",
  "/kimbap/Love.png",
  "/kimbap/Yay.png",
  "/kimbap/Thinking.png",
  "/kimbap/Hungry.png",
  "/kimbap/Thank%20you.png",
  "/kimbap/Welcome%20back.png",
  "/kimbap/Jump.png",
  "/kimbap/Walk%201.png",
  "/kimbap/Walk%202.png",
  "/kimbap/Walk%203.png",
  "/kimbap/Walk%204.png",
  "/kimbap/Back%20view.png",
];

type Mood = "idle" | "happy" | "sleepy" | "alert" | "celebrate" | "peek";

const PHRASES = {
  zh: {
    idle: ["喵…", "嗯？", "在呢。", "今天也很安静。"],
    happy: ["喵~", "好开心。", "尾巴不自觉地摇了…"],
    sleepy: ["呼…", "zzz…", "好困…"],
    alert: ["…嗯？", "有新消息。", "你看到了吗？"],
    celebrate: ["太好了。", "为你开心。", "了不起呢。"],
  },
  en: {
    idle: ["Meow…", "Mm?", "I'm here.", "It's quiet today."],
    happy: ["Mrrp~", "That makes me happy.", "Today is a soft day."],
    sleepy: ["Purr…", "zzz…", "So sleepy…"],
    alert: ["…Mm?", "There's something new.", "Did you see that?"],
    celebrate: ["Wonderful.", "Happy for you.", "That's amazing."],
  },
  th: {
    idle: ["เหมียว…", "หืม?", "อยู่ตรงนี้", "วันนี้เงียบจัง"],
    happy: ["เหมียว~", "ดีใจจัง", "วันนี้เป็นวันที่นุ่มนวล"],
    sleepy: ["ฟี้…", "zzz…", "ง่วงจัง…"],
    alert: ["…หืม?", "มีอะไรใหม่", "เห็นนั่นไหม?"],
    celebrate: ["ยอดเยี่ยม", "ดีใจด้วยนะ", "สุดยอดเลย"],
  },
};

export default function KimbapMascot() {
  const [mood, setMood] = useState<Mood>("idle");
  const [bubble, setBubble] = useState("");
  const [showBubble, setShowBubble] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [pos, setPos] = useState({ x: 16, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [spriteError, setSpriteError] = useState<Record<string, boolean>>({});

  const spriteSrc = SPRITE_MAP[mood];

  // Client-side init
  useEffect(() => {
    if (localStorage.getItem("hide-kimbap") === "true") setHidden(true);
    setMounted(true);
  }, []);

  // Night mode: auto sleepy
  useEffect(() => {
    const check = () => {
      const h = new Date().getHours();
      if (h >= 23 || h < 6) { setMood("sleepy"); return true; }
      return false;
    };
    if (check()) return;
    const t = setInterval(() => { if (check()) clearInterval(t); }, 60000);
    return () => clearInterval(t);
  }, []);

  // Global events
  useEffect(() => {
    const celebrate = () => { setMood("celebrate"); setBubble("✨"); setShowBubble(true); setTimeout(() => { setShowBubble(false); setMood("idle"); }, 4000); };
    const alert = () => { setMood("alert"); setBubble("New announcement!"); setShowBubble(true); setTimeout(() => setShowBubble(false), 4000); };
    const peek = () => { setMood("peek"); setTimeout(() => setMood("idle"), 3000); };
    window.addEventListener("kimbap:celebrate", celebrate);
    window.addEventListener("kimbap:alert", alert);
    window.addEventListener("kimbap:peek", peek);
    return () => {
      window.removeEventListener("kimbap:celebrate", celebrate);
      window.removeEventListener("kimbap:alert", alert);
      window.removeEventListener("kimbap:peek", peek);
    };
  }, []);

  // Pick random phrase for current locale
  function pick(m: Mood): string {
    // Try to detect locale from html lang
    const lang = document.documentElement.lang || "en";
    const locale = lang.startsWith("zh") ? "zh" : lang.startsWith("th") ? "th" : "en";
    const arr = PHRASES[locale]?.[m] || PHRASES.en[m] || PHRASES.en.idle;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function handleClick() {
    if (dragging) return;
    const moods: Mood[] = ["happy", "celebrate", "alert", "idle"];
    const next = moods[Math.floor(Math.random() * moods.length)];
    setMood(next);
    setBubble(pick(next));
    setShowBubble(true);
    setTimeout(() => { setShowBubble(false); setMood("idle"); }, 4000);
  }

  // Drag — uses left + bottom positioning
  function onPointerDown(e: React.PointerEvent) {
    setDragging(true);
    setDragStart({ x: e.clientX - pos.x, y: pos.y + e.clientY });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    setPos({
      x: Math.max(4, Math.min(window.innerWidth - 96, e.clientX - dragStart.x)),
      y: Math.max(4, Math.min(window.innerHeight - 150, dragStart.y - e.clientY)),
    });
  }
  function onPointerUp() { setDragging(false); }

  function hideMascot() {
    setHidden(true);
    localStorage.setItem("hide-kimbap", "true");
  }

  if (hidden) return null;

  return (
    <>
      <style>{`
        @keyframes kb-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes kb-bounce { 0%,100%{transform:translateY(0) scale(1)} 40%{transform:translateY(-10px) scale(1.06)} 70%{transform:translateY(-3px) scale(1.02)} }
        @keyframes kb-shake { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-2deg)} 75%{transform:rotate(2deg)} }
        @keyframes kb-peek { 0%{transform:translateY(20px)} 50%{transform:translateY(0)} 100%{transform:translateY(20px)} }
        @keyframes kb-bubble-in { from{opacity:0;transform:translateX(-50%) translateY(4px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes kb-sparkle { 0%,100%{opacity:0;transform:scale(0)} 50%{opacity:1;transform:scale(1)} }
        @keyframes kb-zzz { 0%{opacity:.8;transform:translateY(0) scale(.7)} 100%{opacity:0;transform:translateY(-14px) scale(1)} }
        .kimbap-img { image-rendering: pixelated; image-rendering: crisp-edges; }
        .kimbap-sheet { image-rendering: pixelated; image-rendering: crisp-edges; }
      `}</style>

      <div
        className="fixed z-50 select-none"
        style={{
          left: pos.x, bottom: pos.y,
          transition: dragging ? "none" : "transform 0.4s ease",
          animation: mood === "celebrate" ? "kb-bounce 0.5s ease-in-out infinite"
            : mood === "alert" ? "kb-shake 0.6s ease-in-out infinite"
            : mood === "peek" ? "kb-peek 2s ease-in-out infinite"
            : "kb-float 3s ease-in-out infinite",
          willChange: "transform",
          transform: "translateZ(0)",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleClick}
      >
        {/* Speech bubble */}
        {showBubble && (
          <div style={{
            position: "absolute", bottom: 108, left: "50%", transform: "translateX(-50%)",
            background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)",
            padding: "6px 12px", borderRadius: 12,
            fontSize: 11, fontWeight: 500, color: "#4A6080",
            whiteSpace: "nowrap",
            boxShadow: "0 1px 10px rgba(0,0,0,0.06)",
            border: "1px solid rgba(200,180,220,0.25)",
            animation: "kb-bubble-in 0.25s ease",
            zIndex: 10,
          }}>{bubble}</div>
        )}

        {/* Close button */}
        {hovered && (
          <button onClick={(e) => { e.stopPropagation(); hideMascot(); }}
            style={{
              position: "absolute", top: -4, right: -4, zIndex: 20,
              width: 18, height: 18, borderRadius: "50%",
              background: "white", border: "1px solid #e0d5e8", color: "#b0a0c0",
              fontSize: 11, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>×</button>
        )}

        {/* Mood effects */}
        {mood === "sleepy" && (
          <span style={{
            position: "absolute", top: -4, right: -8,
            color: "#B0C8E8", fontSize: 14, fontWeight: 700,
            animation: "kb-zzz 2s ease-in-out infinite",
          }}>Zz</span>
        )}
        {mood === "celebrate" && (
          <>
            <span style={{ position: "absolute", top: -8, left: -4, animation: "kb-sparkle 1s ease-in-out infinite", animationDelay: "0s" }}>✨</span>
            <span style={{ position: "absolute", top: -14, right: 0, fontSize: 11, animation: "kb-sparkle 1s ease-in-out infinite", animationDelay: "0.4s", color: "#C9B6F5" }}>✦</span>
          </>
        )}
        {mood === "alert" && (
          <div style={{
            position: "absolute", top: -6, right: -6,
            width: 20, height: 16, borderRadius: 6,
            background: "#FF9090", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 800, color: "white",
            boxShadow: "0 2px 6px rgba(255,144,144,0.4)",
          }}>!</div>
        )}

        {/* Sprite image */}
        <div style={{
          width: 80, height: 96,
          borderRadius: 12,
          overflow: "hidden",
          background: "#FDFBF7",
          boxShadow: "0 2px 12px rgba(180,160,200,0.2)",
          border: "2px solid #e8e0f0",
          transition: "transform 0.25s, box-shadow 0.25s",
          transform: hovered ? "scale(1.08) translateZ(0)" : "scale(1) translateZ(0)",
          willChange: "transform",
        }}>
          <img
            src={spriteError[mood] ? "/kimbap/Normal.png" : spriteSrc}
            alt="Kimbap"
            className="kimbap-img"
            style={{
              width: "100%", height: "100%", objectFit: "contain",
              pointerEvents: "none",
              imageRendering: "pixelated",
            }}
            draggable={false}
            onError={() => setSpriteError(prev => ({ ...prev, [mood]: true }))}
          />
        </div>

        {/* Name */}
        <div className="text-center mt-0.5">
          <span style={{ fontSize: 8, color: "#b8a8cc", fontWeight: 600, letterSpacing: 1.5 }}>KIMBAP</span>
        </div>
      </div>
    </>
  );
}

// Export sticker pack for use in posts/comments
export { STICKER_PACK };
