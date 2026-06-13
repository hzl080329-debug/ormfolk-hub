// Kimbap Pixel Art — based on real cat photo analysis
// Colors extracted from actual Kimbap photo:
//   Fur: #FDFBF7 cream-white
//   Ear: #E8D4DE warm pink (from photo: left ear ~#e4d9ed, right ~#edd8cd)
//   Eye: #8BA8C8 blue-grey
//   Nose: #F0A8B8 pink
//   Paw: #FAD4D8 soft pink
//   Collar accent: #C9B6F5 lavender (OrmFolk Hub brand)

import sharp from "sharp";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "kimbap");
mkdirSync(OUT, { recursive: true });

// ── Palette (matching real Kimbap features) ──
const C = {
  T: null,              // transparent
  W: "#FDFBF7",         // cream-white fur (main body)
  w: "#F5EFE6",         // cream shadow (belly, shading)
  d: "#EBE3D5",         // cream dark (deep shadow)
  P: "#E8D4DE",         // pink inner ear (from real photo)
  p: "#F0A8B8",         // nose pink
  E: "#B0C5DD",         // eye blue-grey (light iris)
  e: "#8BA8C8",         // eye blue-grey (mid iris)
  O: "#4A6080",         // eye pupil (dark)
  H: "#FFFFFF",         // eye highlight
  N: "#F0A8B8",         // nose
  M: "#D0A0A8",         // mouth
  L: "#C9B6F5",         // lavender collar/tag (brand)
  l: "#B39DDB",         // lavender dark
  G: "#F5E070",         // gold tag
  g: "#D4C050",         // gold dark
  S: "#FFE880",         // star
  Z: "#B8C8E8",         // zzz
  R: "#FF9090",         // alert
  K: "#E8DDD0",         // subtle outline
};

// ── Grid helpers (64x64 canvas) ──
const SIZE = 64;
function grid() { return Array.from({length: SIZE}, () => Array(SIZE).fill(null)); }
function set(g,x,y,c) { if(x>=0&&x<SIZE&&y>=0&&y<SIZE) g[y][x]=c; }
function circle(g,cx,cy,r,c) {
  for(let y=Math.max(0,cy-r);y<=Math.min(SIZE-1,cy+r);y++)
    for(let x=Math.max(0,cx-r);x<=Math.min(SIZE-1,cx+r);x++)
      if((x-cx)**2+(y-cy)**2<=r**2) g[y][x]=c;
}
function ellipse(g,cx,cy,rx,ry,c) {
  for(let y=Math.max(0,cy-ry);y<=Math.min(SIZE-1,cy+ry);y++)
    for(let x=Math.max(0,cx-rx);x<=Math.min(SIZE-1,cx+rx);x++)
      if((x-cx)**2/rx**2+(y-cy)**2/ry**2<=1) g[y][x]=c;
}
function rect(g,x1,y1,x2,y2,c) {
  for(let y=Math.max(0,y1);y<=Math.min(SIZE-1,y2);y++)
    for(let x=Math.max(0,x1);x<=Math.min(SIZE-1,x2);x++)
      g[y][x]=c;
}
function fill(g,c) { for(let y=0;y<SIZE;y++) for(let x=0;x<SIZE;x++) g[y][x]=c; }

// ── Draw base Kimbap cat (sitting, forward-facing) ──
function drawBaseCat() {
  const g = grid();

  // Tail — behind body, curling right
  for (let i=0; i<20; i++) {
    const tx = 48 + Math.floor(Math.sin(i*0.35)*6);
    const ty = 42 + Math.floor(Math.cos(i*0.3)*4) + i*0.3;
    set(g, tx, ty, 'w');
    if (i>15) set(g, tx, ty+1, 'W');
  }
  // Tail tip
  for (let i=18; i<21; i++) {
    const tx = 47 + Math.floor(Math.sin(i*0.35)*5);
    const ty = 40 + Math.floor(Math.cos(i*0.3)*3) + i*0.3;
    set(g, tx, ty, 'W');
  }

  // Body — chunky sitting pose
  ellipse(g, 32, 44, 18, 16, 'W');
  ellipse(g, 32, 46, 17, 15, 'W');
  // Body shading (bottom darker)
  ellipse(g, 32, 50, 14, 8, 'w');

  // Back paws — peeking out from sides
  ellipse(g, 20, 54, 7, 4, 'W');
  ellipse(g, 44, 54, 7, 4, 'W');
  // Paw pads
  set(g, 19, 55, 'P'); set(g, 20, 55, 'P'); set(g, 21, 55, 'P');
  set(g, 43, 55, 'P'); set(g, 44, 55, 'P'); set(g, 45, 55, 'P');

  // Front paws
  ellipse(g, 24, 52, 6, 4, 'W');
  ellipse(g, 40, 52, 6, 4, 'W');
  set(g, 23, 53, 'P'); set(g, 24, 54, 'P'); set(g, 25, 53, 'P');
  set(g, 39, 53, 'P'); set(g, 40, 54, 'P'); set(g, 41, 53, 'P');

  // Head — ROUND face (key feature of real Kimbap)
  circle(g, 32, 24, 16, 'W');
  circle(g, 32, 24, 15, 'W');
  // Slight cheek fluff
  set(g, 16, 26, 'W'); set(g, 48, 26, 'W');
  set(g, 15, 28, 'W'); set(g, 49, 28, 'W');
  // Head bottom shadow
  for (let y=30; y<38; y++)
    for (let x=20; x<44; x++)
      if (g[y][x]==='W' && y>32) g[y][x] = 'w';

  // Ears — triangle with pink inner (from real photo)
  // Left ear
  for (let y=8; y<18; y++) {
    for (let x=16; x<26; x++) {
      if (x >= 16+(y-8)*0.6 && x <= 25-(y-8)*0.6) {
        if (y<14 && x>=18 && x<=23) g[y][x] = 'P'; // pink inner
        else g[y][x] = 'W'; // outer
      }
    }
  }
  // Right ear
  for (let y=8; y<18; y++) {
    for (let x=38; x<48; x++) {
      if (x >= 38+(y-8)*0.6 && x <= 47-(y-8)*0.6) {
        if (y<14 && x>=41 && x<=46) g[y][x] = 'P'; // pink inner
        else g[y][x] = 'W'; // outer
      }
    }
  }

  // Forehead fluff
  for (let x=26; x<=38; x+=3) {
    set(g, x, 10, 'W');
    set(g, x+1, 9, 'W');
  }

  // Eyes — LARGE blue-grey (key feature of real Kimbap)
  // Left eye
  ellipse(g, 25, 24, 5, 6, 'E');  // blue iris
  ellipse(g, 25, 24, 4, 5, 'e');  // darker blue
  ellipse(g, 25, 23, 2, 3, 'O');  // pupil
  set(g, 26, 21, 'H');            // highlight
  set(g, 28, 24, 'H');            // small highlight
  // Right eye
  ellipse(g, 39, 24, 5, 6, 'E');
  ellipse(g, 39, 24, 4, 5, 'e');
  ellipse(g, 39, 23, 2, 3, 'O');
  set(g, 40, 21, 'H');
  set(g, 42, 24, 'H');

  // Nose — small pink triangle (from real photo)
  set(g, 31, 30, 'p'); set(g, 32, 29, 'p'); set(g, 33, 30, 'p');
  set(g, 31, 31, 'p'); set(g, 32, 31, 'p'); set(g, 33, 31, 'p');

  // Mouth — gentle curve (innocent expression)
  set(g, 30, 33, 'M'); set(g, 31, 34, 'M');
  set(g, 32, 34, 'M'); set(g, 33, 34, 'M');
  set(g, 34, 33, 'M');

  // Blush — subtle pink on cheeks
  for (let y=27; y<=29; y++) {
    set(g, 18, y, 'P'); set(g, 19, y, 'P');
    set(g, 45, y, 'P'); set(g, 46, y, 'P');
  }

  // Whiskers — fine lines
  for (let i=0; i<4; i++) {
    set(g, 12+i, 28, 'w');
    set(g, 12+i, 30, 'w');
    set(g, 48+i, 28, 'w');
    set(g, 48+i, 30, 'w');
  }

  // Lavender collar tag (OrmFolk Hub brand)
  for (let x=24; x<=40; x++) {
    set(g, x, 38, 'L');
  }
  circle(g, 32, 42, 3, 'G');
  circle(g, 32, 42, 2, 'g');
  // Heart on tag
  set(g, 31, 41, 'L'); set(g, 33, 41, 'L');
  set(g, 32, 42, 'L');

  return g;
}

// ── Variant: closed eyes ──
function closeEyes(g) {
  for (let y=20; y<30; y++)
    for (let x=19; x<45; x++)
      if (['E','e','O','H'].includes(g[y]?.[x])) g[y][x] = y>21&&y<25?'W':'W';
  // Draw closed eye arcs
  for (let x=20; x<=28; x++) set(g, x, 25, 'e');
  for (let x=36; x<=44; x++) set(g, x, 25, 'e');
}

// ── Variant: happy closed eyes (^_^) ──
function happyEyes(g) {
  for (let y=20; y<30; y++)
    for (let x=19; x<45; x++)
      if (['E','e','O','H'].includes(g[y]?.[x])) g[y][x] = 'W';
  // Happy eye arcs ^ ^
  for (let x=20; x<=24; x++) set(g, x, 24-(x-20), 'e');
  for (let x=24; x<=28; x++) set(g, x, 24-(28-x), 'e');
  for (let x=36; x<=40; x++) set(g, x, 24-(x-36), 'e');
  for (let x=40; x<=44; x++) set(g, x, 24-(44-x), 'e');
}

// ── Generate all sprites ──

// 1. IDLE
const idle = drawBaseCat();

// 2. HAPPY
const happy = drawBaseCat();
happyEyes(happy);
// Smile
for (let x=28; x<=36; x++) set(happy, x, 33, 'M');
set(happy, 28, 34, 'M'); set(happy, 36, 34, 'M');
// Hearts
const heartPixels = (g,px,py) => {
  set(g,px,py,'P'); set(g,px+2,py,'P');
  set(g,px-1,py+1,'P'); set(g,px+1,py+1,'P'); set(g,px+3,py+1,'P');
  set(g,px,py+2,'P'); set(g,px+2,py+2,'P');
  set(g,px+1,py+3,'P');
};
heartPixels(happy, 8, 6);
heartPixels(happy, 52, 10);

// 3. SLEEPY — curled up
const sleepy = grid();
ellipse(sleepy, 32, 40, 20, 16, 'W');
ellipse(sleepy, 32, 42, 18, 14, 'W');
ellipse(sleepy, 32, 46, 14, 8, 'w');
// Head curled into body
circle(sleepy, 22, 30, 12, 'W');
// Ears
for (let y=18; y<26; y++)
  for (let x=10; x<18; x++)
    if (x>=10+(y-18)*0.5 && x<=17-(y-18)*0.5)
      sleepy[y][x] = y<22 && x>=12 && x<=15 ? 'P' : 'W';
for (let y=18; y<26; y++)
  for (let x=28; x<36; x++)
    if (x>=28+(y-18)*0.5 && x<=35-(y-18)*0.5)
      sleepy[y][x] = y<22 && x>=30 && x<=33 ? 'P' : 'W';
// Closed eyes
for (let x=15; x<=21; x++) set(sleepy, x, 30, 'e');
for (let x=26; x<=32; x++) set(sleepy, x, 30, 'e');
// Nose
set(sleepy, 21, 33, 'p'); set(sleepy, 22, 33, 'p');
set(sleepy, 21, 34, 'p'); set(sleepy, 22, 34, 'p');
// Zzz
const zPixels = (g,sx,sy) => {
  rect(g,sx,sy,sx+4,sy+1,'Z');
  rect(g,sx+4,sy-1,sx+4,sy+5,'Z');
  rect(g,sx,sy+4,sx+4,sy+5,'Z');
};
zPixels(sleepy, 28, 14);
zPixels(sleepy, 34, 8);

// 4. ALERT
const alert = drawBaseCat();
// Alert sign
rect(alert, 48, 2, 58, 14, 'R');
rect(alert, 50, 4, 56, 12, 'W');
set(alert, 52, 5, 'R'); set(alert, 53, 5, 'R'); set(alert, 54, 5, 'R');
set(alert, 52, 6, 'R'); set(alert, 53, 6, 'R');
set(alert, 53, 7, 'R');
set(alert, 53, 8, 'R'); set(alert, 53, 9, 'R'); set(alert, 53, 10, 'R');
// Raised paw (pointing at sign)
rect(alert, 42, 20, 47, 24, 'W');
set(alert, 44, 24, 'P'); set(alert, 45, 24, 'P');

// 5. CELEBRATE
const celebrate = drawBaseCat();
happyEyes(celebrate);
// Raised paws
rect(celebrate, 10, 16, 16, 22, 'W');
rect(celebrate, 48, 16, 54, 22, 'W');
set(celebrate, 13, 16, 'P'); set(celebrate, 51, 16, 'P');
// Stars
const star = (g,sx,sy,c) => {
  set(g,sx,sy,c); set(g,sx+1,sy-1,c); set(g,sx+2,sy,c);
  set(g,sx,sy+1,c); set(g,sx+2,sy+1,c); set(g,sx+1,sy+2,c);
};
star(celebrate, 4, 8, 'S'); star(celebrate, 55, 4, 'S');
star(celebrate, 8, 2, 'S'); star(celebrate, 54, 12, 'S');
star(celebrate, 30, 4, 'S');

// 6. PEEK — peeking from bottom edge
const peek = grid();
circle(peek, 32, 54, 12, 'W');
circle(peek, 32, 54, 11, 'W');
// Ears behind edge
for (let y=42; y<50; y++)
  for (let x=18; x<26; x++)
    if (x>=18+(y-42)*0.5 && x<=25-(y-42)*0.5)
      peek[y][x] = y<46 && x>=20 && x<=23 ? 'P' : 'W';
for (let y=42; y<50; y++)
  for (let x=38; x<46; x++)
    if (x>=38+(y-42)*0.5 && x<=45-(y-42)*0.5)
      peek[y][x] = y<46 && x>=40 && x<=43 ? 'P' : 'W';
// Eyes
ellipse(peek, 26, 53, 4, 5, 'E');
ellipse(peek, 26, 53, 3, 4, 'e');
ellipse(peek, 26, 52, 2, 2, 'O');
set(peek, 27, 51, 'H');
ellipse(peek, 38, 53, 4, 5, 'E');
ellipse(peek, 38, 53, 3, 4, 'e');
ellipse(peek, 38, 52, 2, 2, 'O');
set(peek, 39, 51, 'H');
// Paws on edge
rect(peek, 14, 58, 22, 62, 'W');
rect(peek, 42, 58, 50, 62, 'W');
// Nose
set(peek, 31, 56, 'p'); set(peek, 32, 56, 'p'); set(peek, 33, 56, 'p');

// 7. WALK cycle (4 frames)
function makeWalk(phase) {
  const g = grid();
  // Body — horizontal
  ellipse(g, 30, 38, 14, 10, 'W');
  ellipse(g, 30, 40, 13, 9, 'W');
  // Head — front
  circle(g, 18, 28, 11, 'W');
  // Ears
  for (let y=18; y<25; y++)
    for (let x=8; x<16; x++)
      if (x>=8+(y-18)*0.5 && x<=15-(y-18)*0.5)
        g[y][x] = y<22 && x>=10 && x<=13 ? 'P' : 'W';
  for (let y=18; y<25; y++)
    for (let x=22; x<30; x++)
      if (x>=22+(y-18)*0.5 && x<=29-(y-18)*0.5)
        g[y][x] = y<22 && x>=24 && x<=27 ? 'P' : 'W';
  // Eye (side view)
  set(g, 14, 27, 'E'); set(g, 14, 28, 'E');
  set(g, 13, 27, 'O');
  set(g, 15, 26, 'H');
  // Nose
  set(g, 10, 30, 'p');
  // Tail — bobbing
  const tailOff = Math.sin(phase * Math.PI/2) * 3;
  for (let i=0; i<14; i++) {
    set(g, 43+i, Math.floor(32+tailOff+Math.sin(i*0.4)*2), 'w');
  }
  // Legs — alternating
  const l1 = phase%2===0 ? 0 : 3;
  const l2 = phase%2===0 ? 3 : 0;
  rect(g, 22+l1, 46, 27+l1, 50, 'W');
  rect(g, 35-l2, 46, 40-l2, 50, 'W');
  // Collar
  for (let x=14; x<=22; x++) set(g, x, 34, 'L');
  return g;
}
const walk1 = makeWalk(0);
const walk2 = makeWalk(1);
const walk3 = makeWalk(2);
const walk4 = makeWalk(3);

// 8. JUMP
const jump = grid();
circle(jump, 32, 28, 13, 'W');
circle(jump, 32, 28, 12, 'W');
// Ears
for (let y=18;y<24;y++) for(let x=20;x<27;x++) if(x>=20+(y-18)*0.4 && x<=26-(y-18)*0.4) jump[y][x]=y<21&&x>=21&&x<=24?'P':'W';
for (let y=18;y<24;y++) for(let x=37;x<44;x++) if(x>=37+(y-18)*0.4 && x<=43-(y-18)*0.4) jump[y][x]=y<21&&x>=39&&x<=42?'P':'W';
// Happy eyes
happyEyes(jump);
// Paws spread
rect(jump, 10, 32, 16, 36, 'W');
rect(jump, 48, 32, 54, 36, 'W');
// Tail up
for (let i=0; i<10; i++) set(jump, 48+i, 24-i, 'w');
// Smile
for (let x=28; x<=36; x++) set(jump, x, 35, 'M');
set(jump, 28, 36, 'M'); set(jump, 36, 36, 'M');
// Blush
set(jump, 18, 30, 'P'); set(jump, 46, 30, 'P');

// ── Render to SVG ──
function gridToSVG(g, scale=1) {
  let rects = '';
  const w = g[0].length, h = g.length;
  for (let y=0; y<h; y++)
    for (let x=0; x<w; x++) {
      const c = g[y][x];
      if (c && C[c]) rects += `<rect x="${x*scale}" y="${y*scale}" width="${scale}" height="${scale}" fill="${C[c]}" shape-rendering="crispEdges"/>`;
    }
  return rects;
}
function gridToSVGFile(g, scale) {
  const w = g[0].length*scale, h = g.length*scale;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${gridToSVG(g,scale)}</svg>`;
}

// ── Character sheet ──
function genSheet() {
  const SW=1600, SH=2000;
  const SS=2; // sprite display scale on sheet
  const sprites = [
    ['Idle',idle,80,420],['Happy',happy,430,420],['Sleepy',sleepy,780,420],['Alert',alert,1130,420],
    ['Celebrate',celebrate,80,660],['Peek',peek,430,660],['Jump',jump,780,660],
    ['Walk 1',walk1,80,900],['Walk 2',walk2,280,900],['Walk 3',walk3,480,900],['Walk 4',walk4,680,900],
  ];

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SW}" height="${SH}" viewBox="0 0 ${SW} ${SH}">
<defs><style>
  text{font-family:Nunito,sans-serif}
  .tt{font-size:42px;font-weight:800;fill:#4A6080}
  .st{font-size:20px;fill:#8BA8C8}
  .lb{font-size:14px;fill:#5A6A80;font-weight:600}
  .hd{font-size:24px;fill:#4A6080;font-weight:700}
</style></defs>
<rect width="${SW}" height="${SH}" fill="#FFFFFF"/>
<rect x="0" y="0" width="${SW}" height="8" fill="#C9B6F5"/>

<!-- Hero -->
<g transform="translate(${SW/2-192},40)">${gridToSVG(idle,6)}</g>
<text x="${SW/2}" y="500" text-anchor="middle" class="tt">Kimbap</text>
<text x="${SW/2}" y="530" text-anchor="middle" class="st">OrmFolk Hub Mascot</text>

<!-- Palette -->
<text x="80" y="380" class="hd">🎨 Color Palette</text>
${[
  ['W','#FDFBF7','Fur'],['w','#F5EFE6','Shadow'],['P','#E8D4DE','Ear'],['p','#F0A8B8','Nose'],
  ['E','#B0C5DD','Eye'],['e','#8BA8C8','Pupil'],['L','#C9B6F5','Brand'],['G','#F5E070','Tag'],
].map(([k,hex,label],i)=>{
  const cx=80+i*90;
  return `<rect x="${cx}" y="395" width="48" height="48" rx="8" fill="${hex}" stroke="#ddd"/><text x="${cx+24}" y="462" text-anchor="middle" font-size="11" fill="#888">${label}</text>`;
}).join('')}

<!-- Sprites -->
<text x="80" y="560" class="hd">Sprite States (64×64)</text>
${sprites.map(s=>{
  const sw=SIZE*SS+32, sh=SIZE*SS+40;
  return `<g transform="translate(${s[2]},${s[3]})">
    <rect x="0" y="0" width="${sw}" height="${sh}" rx="12" fill="#FAFAFA" stroke="#E8DDD0" stroke-width="1"/>
    <g transform="translate(${(sw-SIZE*SS)/2},8)">${gridToSVG(s[1],SS)}</g>
    <text x="${sw/2}" y="${sh-12}" text-anchor="middle" class="lb">${s[0]}</text>
  </g>`;
}).join('')}

<!-- Footer -->
<rect x="0" y="${SH-50}" width="${SW}" height="50" fill="#FDFBF7"/>
<text x="${SW/2}" y="${SH-22}" text-anchor="middle" font-size="13" fill="#B0A090">OrmFolk Hub · Kimbap Character Sheet · 64px pixel art</text>
</svg>`;
  return svg;
}

// ── Main ──
async function main() {
  const scale = 4; // 64*4 = 256px output
  const sprites = [
    ['idle', idle], ['happy', happy], ['sleepy', sleepy], ['alert', alert],
    ['celebrate', celebrate], ['peek', peek], ['jump', jump],
    ['walk1', walk1], ['walk2', walk2], ['walk3', walk3], ['walk4', walk4],
  ];

  for (const [name, g] of sprites) {
    const svg = gridToSVGFile(g, scale);
    writeFileSync(join(OUT, `${name}.svg`), svg);
    await sharp(Buffer.from(svg)).png().toFile(join(OUT, `${name}.png`));
    console.log(`✅ ${name}.png (256×256)`);
  }

  // Sheet
  const sheetSVG = genSheet();
  writeFileSync(join(OUT, 'kimbap-sheet.svg'), sheetSVG);
  await sharp(Buffer.from(sheetSVG)).png().toFile(join(OUT, 'kimbap-sheet.png'));
  console.log('✅ kimbap-sheet.png');
  console.log(`\n🎨 Done! ${OUT}/`);
}

main().catch(e => { console.error(e); process.exit(1); });
