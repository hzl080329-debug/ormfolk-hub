// Kimbap Pixel Art Generator — creates SVG sprites + converts to PNG via sharp
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const OUT = join(import.meta.dirname, "..", "public", "kimbap");
mkdirSync(OUT, { recursive: true });

// ── Color palette ──
const C = {
  T: null,              // transparent
  W: "#FDFBF7",         // cream white
  w: "#F5EFE6",         // cream shadow
  d: "#EBE3D8",         // cream dark
  P: "#FAD4D8",         // pink (ears, blush, paws)
  p: "#F0B8C0",         // pink darker
  E: "#B5C8E0",         // eye blue light
  e: "#8BA8C8",         // eye blue
  O: "#4A6080",         // eye pupil
  H: "#FFFFFF",         // highlight
  N: "#F0A8B8",         // nose pink
  M: "#D0A8B0",         // mouth
  L: "#C9B6F5",         // lavender collar
  l: "#B39DDB",         // lavender dark
  G: "#F5E070",         // gold tag
  g: "#D4C050",         // gold dark
  S: "#FFE880",         // star yellow
  Z: "#C0D0F0",         // zzz blue
  R: "#FFB0B0",         // alert red
  K: "#E8DDD0",         // outline
};

// ── Helper: draw a shape onto a 32x32 grid ──
function grid(w=32, h=32) {
  return Array.from({length:h}, () => Array(w).fill(null));
}
function set(g, x, y, c) { if (x>=0 && x<g[0].length && y>=0 && y<g.length) g[y][x] = c; }
function circle(g, cx, cy, r, c) {
  for (let y=Math.max(0,cy-r); y<=Math.min(g.length-1,cy+r); y++)
    for (let x=Math.max(0,cx-r); x<=Math.min(g[0].length-1,cx+r); x++)
      if ((x-cx)**2 + (y-cy)**2 <= r**2) g[y][x] = c;
}
function ellipse(g, cx, cy, rx, ry, c) {
  for (let y=Math.max(0,cy-ry); y<=Math.min(g.length-1,cy+ry); y++)
    for (let x=Math.max(0,cx-rx); x<=Math.min(g[0].length-1,cx+rx); x++)
      if ((x-cx)**2/rx**2 + (y-cy)**2/ry**2 <= 1) g[y][x] = c;
}
function fill(g, c) { for (let y=0; y<g.length; y++) for (let x=0; x<g[0].length; x++) g[y][x] = c; }
function rect(g, x1, y1, x2, y2, c) {
  for (let y=Math.max(0,y1); y<=Math.min(g.length-1,y2); y++)
    for (let x=Math.max(0,x1); x<=Math.min(g[0].length-1,x2); x++)
      g[y][x] = c;
}
function tri(g, x1,y1,x2,y2,x3,y3, c) {
  for (let y=0; y<g.length; y++)
    for (let x=0; x<g[0].length; x++) {
      const d1 = (x-x2)*(y1-y2) - (x1-x2)*(y-y2);
      const d2 = (x-x3)*(y2-y3) - (x2-x3)*(y-y3);
      const d3 = (x-x1)*(y3-y1) - (x3-x1)*(y-y1);
      const hasNeg = (d1<0)||(d2<0)||(d3<0);
      const hasPos = (d1>0)||(d2>0)||(d3>0);
      if (!(hasNeg && hasPos)) g[y][x] = c;
    }
}

// ── Draw Kimbap base (sitting cat) onto grid ──
// Returns {head,body} grids that can be composed for different poses
function drawCatBase() {
  const g = grid(32, 32);

  // Tail (behind body)
  for (let i=0; i<12; i++) {
    const tx = 2 + Math.floor(i*0.8);
    const ty = 18 + Math.floor(Math.sin(i*0.6)*3);
    set(g, tx, ty, 'w');
    set(g, tx, ty+1, 'w');
  }

  // Body (sitting, chunky)
  ellipse(g, 16, 23, 9, 8, 'W');
  ellipse(g, 16, 24, 8, 8, 'W');
  // body shadow
  ellipse(g, 16, 26, 7, 5, 'w');

  // Back paws
  ellipse(g, 9, 28, 5, 3, 'W');
  ellipse(g, 23, 28, 5, 3, 'W');
  // Paw pads
  set(g, 8, 28, 'P'); set(g, 9, 29, 'P'); set(g, 10, 28, 'P');
  set(g, 22, 28, 'P'); set(g, 23, 29, 'P'); set(g, 24, 28, 'P');

  // Front paws
  ellipse(g, 9, 26, 4, 3, 'W');
  ellipse(g, 23, 26, 4, 3, 'W');
  set(g, 8, 26, 'P'); set(g, 9, 27, 'P');
  set(g, 23, 26, 'P'); set(g, 24, 27, 'P');

  // Head (round)
  circle(g, 16, 12, 10, 'W');
  circle(g, 16, 12, 9, 'W');
  // Head shadow bottom
  for (let y=15; y<=20; y++)
    for (let x=8; x<=24; x++)
      if (g[y][x]==='W' && y>=17) g[y][x] = 'w';

  // Ears
  tri(g, 6,8, 2,0, 12,5, 'W');
  tri(g, 7,7, 4,1, 11,5, 'P');
  tri(g, 26,8, 30,0, 20,5, 'W');
  tri(g, 25,7, 28,1, 21,5, 'P');

  // Forehead fluff
  for (let x=12; x<=20; x+=2) {
    set(g, x, 3, 'W');
    set(g, x+1, 4, 'W');
  }

  // Eyes
  ellipse(g, 11, 12, 3, 3, 'E');
  ellipse(g, 11, 12, 2, 3, 'e');
  ellipse(g, 11, 11, 1, 2, 'O');
  set(g, 12, 10, 'H');
  ellipse(g, 21, 12, 3, 3, 'E');
  ellipse(g, 21, 12, 2, 3, 'e');
  ellipse(g, 21, 11, 1, 2, 'O');
  set(g, 22, 10, 'H');

  // Nose
  set(g, 15, 16, 'N');
  set(g, 16, 16, 'N');
  set(g, 17, 16, 'N');
  set(g, 16, 17, 'N');

  // Mouth
  set(g, 14, 18, 'M');
  set(g, 15, 19, 'M');
  set(g, 16, 19, 'M');
  set(g, 17, 19, 'M');
  set(g, 18, 18, 'M');

  // Blush
  set(g, 6, 15, 'P'); set(g, 7, 15, 'P');
  set(g, 25, 15, 'P'); set(g, 26, 15, 'P');

  // Whiskers
  set(g, 2, 13, 'w'); set(g, 3, 14, 'w');
  set(g, 2, 15, 'w'); set(g, 3, 15, 'w');
  set(g, 29, 13, 'w'); set(g, 30, 14, 'w');
  set(g, 29, 15, 'w'); set(g, 30, 15, 'w');

  // Collar
  for (let x=8; x<=24; x++) {
    const cy = 20 + Math.floor(Math.sin((x-8)/17*Math.PI)*2);
    set(g, x, cy, 'L');
  }
  // Tag
  circle(g, 16, 23, 2, 'G');
  circle(g, 16, 23, 1, 'g');

  return g;
}

// ── Draw closed eyes on a cat ──
function closeEyes(g) {
  // Erase eyes
  for (let y=10; y<=14; y++)
    for (let x=8; x<=24; x++)
      if (['E','e','O','H'].includes(g[y]?.[x])) g[y][x] = 'W';
  // Draw closed eye lines
  for (let x=9; x<=13; x++) set(g, x, 12, 'e');
  for (let x=19; x<=23; x++) set(g, x, 12, 'e');
}

// ── Happy mouth override ──
function happyMouth(g) {
  for (let y=18; y<=19; y++) for (let x=13; x<=19; x++) if (g[y]?.[x]==='M') g[y][x] = 'W';
  set(g, 14, 18, 'M'); set(g, 15, 19, 'M'); set(g, 16, 20, 'M'); set(g, 17, 19, 'M'); set(g, 18, 18, 'M');
}

// ── Sleepy mouth override ──
function sleepyMouth(g) {
  for (let y=18; y<=19; y++) for (let x=13; x<=19; x++) if (g[y]?.[x]==='M') g[y][x] = 'W';
  set(g, 15, 17, 'M'); set(g, 16, 17, 'M'); set(g, 17, 17, 'M');
}

// ── Convert grid to SVG string ──
function gridToSVG(g, scale=1) {
  const w = g[0].length, h = g.length;
  let rects = '';
  for (let y=0; y<h; y++)
    for (let x=0; x<w; x++) {
      const c = g[y][x];
      if (c && C[c]) rects += `<rect x="${x*scale}" y="${y*scale}" width="${scale}" height="${scale}" fill="${C[c]}" shape-rendering="crispEdges"/>`;
    }
  return rects;
}

function gridToFullSVG(g, scale=8) {
  const w = g[0].length * scale, h = g.length * scale;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${gridToSVG(g, scale)}</svg>`;
}

// ── Generate all sprites ──

// 1. Idle (normal)
const idle = drawCatBase();

// 2. Happy
const happy = drawCatBase();
happyMouth(happy);
// hearts
set(happy, 2, 2, 'P'); set(happy, 3, 1, 'P'); set(happy, 4, 2, 'P'); set(happy, 3, 3, 'P');
set(happy, 28, 4, 'P'); set(happy, 29, 3, 'P'); set(happy, 30, 4, 'P'); set(happy, 29, 5, 'P');

// 3. Sleepy (curled up)
const sleepy = grid(32,32);
// curled body
circle(sleepy, 14, 20, 10, 'W');
circle(sleepy, 14, 20, 9, 'W');
// darker underbelly
ellipse(sleepy, 14, 23, 7, 5, 'w');
// ears on curled body
tri(sleepy, 5,14, 2,8, 10,14, 'W');
tri(sleepy, 6,13, 4,9, 9,14, 'P');
tri(sleepy, 23,14, 26,8, 18,14, 'W');
tri(sleepy, 22,13, 24,9, 19,14, 'P');
// closed eyes
for (let x=10; x<=14; x++) set(sleepy, x, 17, 'e');
for (let x=17; x<=21; x++) set(sleepy, x, 17, 'e');
// nose
set(sleepy, 14, 19, 'N'); set(sleepy, 15, 19, 'N');
// sleepy mouth
set(sleepy, 14, 20, 'M'); set(sleepy, 15, 20, 'M');
// blush
set(sleepy, 7, 18, 'P'); set(sleepy, 22, 18, 'P');
// tail curl
for (let i=0; i<8; i++) {
  const tx = 24 + Math.floor(Math.sin(i*0.5)*3);
  const ty = 20 + Math.floor(Math.cos(i*0.5)*4);
  set(sleepy, tx, ty, 'w');
}
// ZZZ
set(sleepy, 24, 10, 'Z'); set(sleepy, 25, 10, 'Z');
set(sleepy, 26, 8, 'Z'); set(sleepy, 27, 8, 'Z'); set(sleepy, 27, 9, 'Z');
set(sleepy, 28, 5, 'Z'); set(sleepy, 29, 5, 'Z'); set(sleepy, 29, 6, 'Z'); set(sleepy, 29, 7, 'Z');

// 4. Alert (holding sign)
const alert = drawCatBase();
// alert sign
rect(alert, 24, 1, 30, 7, 'R');
set(alert, 26, 2, 'W'); set(alert, 27, 2, 'W');
set(alert, 26, 3, 'W'); set(alert, 27, 3, 'W');
set(alert, 27, 4, 'W');
set(alert, 27, 5, 'W');
// alert paw raised
rect(alert, 22, 21, 25, 24, 'W');
set(alert, 23, 24, 'P'); set(alert, 24, 24, 'P');

// 5. Celebrate (paws up, stars)
const celebrate = drawCatBase();
happyMouth(celebrate);
// raised paws
rect(celebrate, 3, 14, 7, 18, 'W');
rect(celebrate, 3, 14, 6, 17, 'W');
set(celebrate, 4, 14, 'P'); set(celebrate, 5, 15, 'P');
rect(celebrate, 25, 14, 29, 18, 'W');
set(celebrate, 27, 14, 'P'); set(celebrate, 28, 15, 'P');
// stars
const stars = [[2,8],[30,6],[18,1],[10,1],[26,10]];
for (const [sx,sy] of stars) {
  set(celebrate, sx, sy, 'S'); set(celebrate, sx+1, sy, 'S');
  set(celebrate, sx, sy+1, 'S');
}

// 6. Peek (bottom edge peeking)
const peek = grid(32,32);
circle(peek, 16, 28, 8, 'W');
circle(peek, 16, 28, 7, 'W');
for (let x=10; x<=14; x++) set(peek, x, 27, 'E');
for (let x=11; x<=13; x++) set(peek, x, 27, 'e');
set(peek, 12, 26, 'O');
for (let x=18; x<=22; x++) set(peek, x, 27, 'E');
for (let x=19; x<=21; x++) set(peek, x, 27, 'e');
set(peek, 20, 26, 'O');
set(peek, 15, 30, 'N'); set(peek, 16, 30, 'N'); set(peek, 17, 30, 'N');
// paws on edge
rect(peek, 5, 29, 9, 31, 'W');
rect(peek, 23, 29, 27, 31, 'W');
set(peek, 7, 30, 'P'); set(peek, 25, 30, 'P');
// ears peeking
tri(peek, 8,22, 4,18, 12,22, 'W');
tri(peek, 9,21, 6,19, 11,22, 'P');
tri(peek, 24,22, 28,18, 20,22, 'W');
tri(peek, 23,21, 26,19, 21,22, 'P');

// 7. Walk cycle (4 frames) — simplified side view
function makeWalk(offset) {
  const g = grid(32,32);
  // body (horizontal)
  ellipse(g, 16, 22, 10, 7, 'W');
  ellipse(g, 16, 23, 9, 6, 'W');
  // head (front)
  circle(g, 8, 16, 7, 'W');
  // ear
  tri(g, 4,12, 1,6, 8,12, 'W');
  tri(g, 5,11, 3,7, 7,12, 'P');
  // eye
  set(g, 5, 15, 'e'); set(g, 6, 15, 'E');
  set(g, 5, 14, 'O'); set(g, 6, 15, 'H');
  // nose
  set(g, 2, 17, 'N');
  // tail
  const tailY = 18 + Math.sin(offset*1.5)*2;
  for (let i=0; i<8; i++) {
    set(g, 24+i, Math.floor(tailY + Math.sin(i*0.4)*2), 'w');
  }
  // legs
  const legOff = offset % 2;
  rect(g, 8+legOff*2, 26, 11+legOff*2, 29, 'W');
  rect(g, 18-legOff*2, 26, 21-legOff*2, 29, 'W');
  rect(g, 8+(1-legOff)*2, 26, 11+(1-legOff)*2, 28, 'W');
  rect(g, 18-(1-legOff)*2, 26, 21-(1-legOff)*2, 28, 'W');
  return g;
}

const walk1 = makeWalk(0);
const walk2 = makeWalk(1);
const walk3 = makeWalk(2);
const walk4 = makeWalk(3);

// 8. Jump
const jump = grid(32,32);
// body airborne
circle(jump, 16, 14, 9, 'W');
circle(jump, 16, 14, 8, 'W');
// ears
tri(jump, 7,9, 3,2, 12,7, 'W');
tri(jump, 8,8, 5,3, 11,7, 'P');
tri(jump, 25,9, 29,2, 20,7, 'W');
tri(jump, 24,8, 27,3, 21,7, 'P');
// eyes happy
for (let x=10; x<=13; x++) set(jump, x, 13, 'e');
for (let x=19; x<=22; x++) set(jump, x, 13, 'e');
set(jump, 11, 13, 'H'); set(jump, 20, 13, 'H');
// nose
set(jump, 15, 16, 'N'); set(jump, 16, 16, 'N');
// happy mouth
set(jump, 14, 18, 'M'); set(jump, 15, 19, 'M'); set(jump, 16, 20, 'M'); set(jump, 17, 19, 'M'); set(jump, 18, 18, 'M');
// paws spread
rect(jump, 4, 18, 8, 21, 'W');
rect(jump, 24, 18, 28, 21, 'W');
// tail
for (let i=0; i<6; i++) { set(jump, 26+i, 10-i, 'w'); }
// blush
set(jump, 6, 16, 'P'); set(jump, 26, 16, 'P');

// ── Character sheet layout SVG ──
const SHEET_W = 1200, SHEET_H = 1800;
const sprites = [
  { name: 'Idle', g: idle, x: 80, y: 450 },
  { name: 'Happy', g: happy, x: 350, y: 450 },
  { name: 'Sleepy', g: sleepy, x: 620, y: 450 },
  { name: 'Alert', g: alert, x: 890, y: 450 },
  { name: 'Celebrate', g: celebrate, x: 80, y: 720 },
  { name: 'Peek', g: peek, x: 350, y: 720 },
  { name: 'Walk 1', g: walk1, x: 80, y: 1000 },
  { name: 'Walk 2', g: walk2, x: 260, y: 1000 },
  { name: 'Walk 3', g: walk3, x: 440, y: 1000 },
  { name: 'Walk 4', g: walk4, x: 620, y: 1000 },
  { name: 'Jump', g: jump, x: 800, y: 1000 },
];

const stickerDefs = [
  { name: 'Hi!', emoji: '👋' },
  { name: 'Love', emoji: '💜' },
  { name: 'Yay!', emoji: '🎉' },
  { name: 'Thinking', emoji: '🤔' },
  { name: 'Hungry', emoji: '🍙' },
  { name: 'Thank You', emoji: '🙏' },
  { name: 'Welcome', emoji: '💌' },
];

function genSheetSVG() {
  const SCALE = 6; // 32*6 = 192px per sprite on sheet
  let html = `<svg xmlns="http://www.w3.org/2000/svg" width="${SHEET_W}" height="${SHEET_H}" viewBox="0 0 ${SHEET_W} ${SHEET_H}">
  <defs>
    <style>
      text { font-family: 'Nunito', sans-serif; }
      .title { font-size: 36px; font-weight: 800; fill: #4A6080; }
      .subtitle { font-size: 18px; fill: #8BA8C8; }
      .label { font-size: 13px; fill: #6A7A90; font-weight: 600; text-align: center; }
      .heading { font-size: 22px; fill: #4A6080; font-weight: 700; }
      .body { font-size: 14px; fill: #5A6A80; }
    </style>
  </defs>
  <rect width="${SHEET_W}" height="${SHEET_H}" fill="#FFFFFF"/>

  <!-- Header bar -->
  <rect x="0" y="0" width="${SHEET_W}" height="8" fill="#C9B6F5"/>

  <!-- Hero illustration: large Kimbap -->
  <g transform="translate(${SHEET_W/2 - 128}, 40)">${gridToSVG(idle, 8)}</g>

  <!-- Title -->
  <text x="${SHEET_W/2}" y="340" text-anchor="middle" class="title">Kimbap</text>
  <text x="${SHEET_W/2}" y="368" text-anchor="middle" class="subtitle">OrmFolk Hub Mascot</text>

  <!-- Color swatches -->
  <text x="80" y="410" class="heading">Color Palette</text>
  ${['W','w','P','E','e','L','G','S'].map((k,i) => {
    const cx = 80 + i*45;
    return `<rect x="${cx}" y="420" width="32" height="32" rx="6" fill="${C[k]}" stroke="#E0E0E0" stroke-width="1"/><text x="${cx+16}" y="466" text-anchor="middle" class="label">${C[k]}</text>`;
  }).join('')}

  <!-- Profile card -->
  <rect x="750" y="395" width="370" height="120" rx="12" fill="#FDFBF7" stroke="#E8E0D5" stroke-width="1.5"/>
  <text x="770" y="420" class="heading">Profile</text>
  ${['Name: Kimbap','Type: Community Cat','Favorite: Ormsin &amp; Folk','Food: Treats','Personality: Gentle, Curious, Sleepy'].map((l,i) =>
    `<text x="770" y="${442+i*18}" class="body">${l}</text>`
  ).join('')}

  <!-- Main sprites -->
  <text x="80" y="440" class="heading">Sprite States</text>
  ${sprites.map(s => {
    const sw = 192, sh = 192;
    return `<g transform="translate(${s.x},${s.y})">
      <rect x="0" y="0" width="${sw}" height="${sh}" rx="12" fill="#FAFAFA" stroke="#E8E0D5" stroke-width="1"/>
      <g transform="translate(${(sw - 32*SCALE)/2}, ${(sh - 32*SCALE)/2})">${gridToSVG(s.g, SCALE)}</g>
      <text x="${sw/2}" y="${sh-8}" text-anchor="middle" class="label">${s.name}</text>
    </g>`;
  }).join('')}

  <!-- Sticker set -->
  <text x="80" y="1260" class="heading">Sticker Set</text>
  ${stickerDefs.map((st,i) => {
    const sx = 80 + (i%4)*270;
    const sy = 1280 + Math.floor(i/4)*160;
    return `<g transform="translate(${sx},${sy})">
      <rect x="0" y="0" width="250" height="140" rx="12" fill="#FAFAFA" stroke="#E8E0D5" stroke-width="1"/>
      <g transform="translate(93, 10)">${gridToSVG(idle, 2)}</g>
      <text x="40" y="80" font-size="32">${st.emoji}</text>
      <text x="125" y="110" text-anchor="middle" class="label">${st.name}</text>
    </g>`;
  }).join('')}

  <!-- Footer -->
  <rect x="0" y="${SHEET_H-50}" width="${SHEET_W}" height="50" fill="#FDFBF7"/>
  <text x="${SHEET_W/2}" y="${SHEET_H-20}" text-anchor="middle" font-size="12" fill="#B0A090">OrmFolk Hub — Kimbap Mascot Sheet</text>
</svg>`;
  return html;
}

// ── Generate all SVGs and convert to PNG ──
async function main() {
  const SCALE = 8; // 32*8 = 256px

  // Save individual sprite SVGs
  const spriteList = [
    { name: 'normal', g: idle },
    { name: 'happy', g: happy },
    { name: 'sleepy', g: sleepy },
    { name: 'alert', g: alert },
    { name: 'celebrate', g: celebrate },
    { name: 'peek', g: peek },
    { name: 'walk1', g: walk1 },
    { name: 'walk2', g: walk2 },
    { name: 'walk3', g: walk3 },
    { name: 'walk4', g: walk4 },
    { name: 'jump', g: jump },
  ];

  // Generate individual PNGs
  for (const {name, g} of spriteList) {
    const svg = gridToFullSVG(g, SCALE);
    const svgPath = join(OUT, `${name}.svg`);
    writeFileSync(svgPath, svg);
    await sharp(Buffer.from(svg)).png().toFile(join(OUT, `${name}.png`));
    console.log(`✅ ${name}.png (256x256)`);
  }

  // Generate character sheet
  const sheetSvg = genSheetSVG();
  const sheetPath = join(OUT, 'kimbap-sheet.svg');
  writeFileSync(sheetPath, sheetSvg);
  await sharp(Buffer.from(sheetSvg)).png().toFile(join(OUT, 'kimbap-sheet.png'));
  console.log('✅ kimbap-sheet.png');

  console.log(`\n🎨 All assets generated in: ${OUT}`);
}

main().catch(e => { console.error(e); process.exit(1); });
