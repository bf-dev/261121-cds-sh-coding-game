import { TILE, type GameMap, type Prop, type Trigger } from "../engine/types";
import { mk, rect, frame, hash, dither, speckle, ellipse, text, block, FONT, type Ctx } from "../art/px";
import { drawCrest } from "./grandhall-crest";
import { logoFull } from "../art/logo";

// The grand hall, from buildings/grand-hall/: a raked auditorium facing one end stage,
// walnut panel walls, light oak stage, one huge LED wall. The camera looks toward the stage.

const COLS = 33;
const ROWS = 18;
const W = COLS * TILE;
const H = ROWS * TILE;
const WALL_ROWS = 5;
const WALL_H = WALL_ROWS * TILE;
const STAGE_Y = WALL_H;
const STAGE_ROWS = 3;
const STAGE_BOTTOM = STAGE_Y + STAGE_ROWS * TILE;

/** the lit area of the LED wall, world px */
export const LED_RECT = { x: 416, y: 48, w: 1280, h: 250 };

const MONO = `"DejaVu Sans Mono", "JetBrains Mono", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace`;

let ledLines: string[] = [];
/** text shown on the hall's LED wall (the battle writes its code here) */
export function setLedText(lines: string[]): void {
  ledLines = lines.filter((l) => l != null).slice(0, 4);
}
export function getLedText(): string[] {
  return ledLines;
}

// ---------------------------------------------------------------- LED wall

let idleCanvas: HTMLCanvasElement | null = null;
let idleFontsReady = false;
let codeCanvas: HTMLCanvasElement | null = null;
let tickerCanvas: HTMLCanvasElement | null = null;
let frameCanvas: HTMLCanvasElement | null = null;
let codeKey = "";
/** height of the scrolling code ticker along the bottom of the wall */
const TICKER_H = 66;

function buildIdle(w: number, h: number): HTMLCanvasElement {
  const [c, g] = mk(w, h);
  const teal = ["#083744", "#0b4a59", "#0f6170", "#157b86", "#1f979a", "#34b3ad", "#55cabd"];
  for (let x = 0; x < w; x += 8) {
    const wave = Math.sin(x / 90) * 1.4 + Math.sin(x / 23) * 0.8;
    const i = Math.max(0, Math.min(teal.length - 1, Math.round(2.6 + wave + (hash(x, 3, 11) - 0.5) * 2.2)));
    rect(g, x, 0, 8, h, teal[i]);
    if (hash(x, 9, 4) < 0.3) rect(g, x + 2, 0, 2, h, teal[Math.min(teal.length - 1, i + 1)]);
  }
  // darker toward the floor, like the streaked event slide
  for (let s = 0; s < 6; s++) {
    g.fillStyle = `rgba(4,26,34,${0.1 + s * 0.07})`;
    for (let y = h - 96 + s * 16; y < h - 96 + (s + 1) * 16; y += 4) for (let x = (y / 4) % 2 ? 0 : 4; x < w; x += 8) g.fillRect(x, y, 4, 4);
  }
  // the official HKU logo, in colour and unaltered, on a white plate at the left (Koki, BUGS.md #7),
  // with the hall name under it, so whoever stands centre stage hides nothing
  const logo = logoFull(84);
  const px0 = 40;
  const py0 = 22;
  const pw = logo.width + 48;
  const ph = logo.height + 32;
  rect(g, px0 + 5, py0 + 6, pw, ph, "rgba(4,26,34,0.4)");
  g.fillStyle = "#ffffff";
  g.beginPath();
  g.roundRect(px0, py0, pw, ph, 12);
  g.fill();
  g.imageSmoothingEnabled = true;
  g.drawImage(logo, px0 + 24, py0 + 16);
  g.imageSmoothingEnabled = false;
  const ty = py0 + ph + 14;
  text(g, "Grand Hall", px0 + 4, ty + 3, 50, "#06323c");
  text(g, "Grand Hall", px0 + 2, ty, 50, "#f4fffb");
  text(g, "HKU School of Computing and Data Science", 28, h - 32, 19, "#c6f3ea");
  // right: the final exam card
  text(g, "FINAL CHALLENGE", w - 36, 26, 30, "#06323c", { align: "right" });
  text(g, "FINAL CHALLENGE", w - 38, 23, 30, "#f4fffb", { align: "right" });
  const rows = ["for i in range(3): damage -= 2", "if damage > 5: damage -= 5", "while damage > 9: damage -= 4"];
  g.font = `700 24px ${MONO}`;
  g.textAlign = "right";
  g.textBaseline = "top";
  rows.forEach((r, i) => {
    g.fillStyle = "#06323c";
    g.fillText(r, w - 36, 78 + i * 34 + 2);
    g.fillStyle = i === 0 ? "#ffe9a8" : "#c6f3ea";
    g.fillText(r, w - 38, 78 + i * 34);
  });
  text(g, "香港大学 计算与数据科学学院", w - 38, h - 34, 20, "#c6f3ea", { align: "right" });
  return c;
}

const KEYWORDS = /^(for|if|in|range|else|elif|while|def|return|and|or|not|break|pass|repeat|times)$/;

/** draws one line of code with simple syntax colours, returns the x after the last glyph */
function codeLine(g: Ctx, line: string, x: number, y: number, size: number): number {
  g.font = `700 ${size}px ${MONO}`;
  g.textBaseline = "top";
  g.textAlign = "left";
  const hashAt = line.indexOf("#");
  const code = hashAt >= 0 ? line.slice(0, hashAt) : line;
  const comment = hashAt >= 0 ? line.slice(hashAt) : "";
  const off = Math.max(2, Math.round(size / 18));
  for (const tok of code.split(/(\s+|[A-Za-z_]+|\d+(?:\.\d+)?)/).filter(Boolean)) {
    let col = "#eafff6";
    if (KEYWORDS.test(tok)) col = "#ffb454";
    else if (/^\d/.test(tok)) col = "#7fe0ff";
    else if (/^[A-Za-z_]+$/.test(tok)) col = "#b8ffcf";
    else if (/[-+*/<>=×÷]/.test(tok)) col = "#ff8fa3";
    g.fillStyle = "#03090d";
    g.fillText(tok, x + off, y + off);
    g.fillStyle = col;
    g.fillText(tok, x, y);
    x += g.measureText(tok).width;
  }
  if (comment) {
    g.fillStyle = "#03090d";
    g.fillText(comment, x + off, y + off);
    g.fillStyle = "#63c08c";
    g.fillText(comment, x, y);
    x += g.measureText(comment).width;
  }
  return x;
}

/** the static block: all lines, as large as fits above the ticker */
function buildCode(lines: string[], w: number, h: number): HTMLCanvasElement {
  const [c, g] = mk(w, h);
  rect(g, 0, 0, w, h, "#06131c");
  for (let y = 0; y < h; y += 4) rect(g, 0, y, w, 1, "#0a1c28");
  for (let x = 0; x < w; x += 64) rect(g, x, 0, 1, h, "#0b2230");
  const n = Math.max(1, lines.length);
  const usable = h - TICKER_H - 8;
  let size = Math.floor(Math.min(72, (usable - 12) / (n * 1.2)));
  const fits = (sz: number): boolean => {
    g.font = `700 ${sz}px ${MONO}`;
    return lines.every((l) => g.measureText(l).width <= w - 96);
  };
  while (size > 14 && !fits(size)) size -= 2;
  const lh = Math.round(size * 1.2);
  const top = Math.max(8, Math.round((usable - lh * n) / 2) + 4);
  lines.forEach((line, i) => {
    g.font = `700 ${size}px ${MONO}`;
    const lw = g.measureText(line).width;
    codeLine(g, line, Math.round(Math.max(48, (w - lw) / 2)), top + i * lh + Math.round((lh - size) / 2), size);
  });
  // ticker bed
  rect(g, 0, h - TICKER_H, w, TICKER_H, "#04202a");
  rect(g, 0, h - TICKER_H, w, 3, "#38c9b4");
  rect(g, 0, h - TICKER_H + 3, w, 1, "#0d5a58");
  return c;
}

/** all lines on one long strip; it scrolls along the bottom of the wall, behind whoever is on stage */
function buildTicker(lines: string[]): HTMLCanvasElement {
  const size = 44;
  const [probe, pg] = mk(8, 8);
  void probe;
  pg.font = `700 ${size}px ${MONO}`;
  const gap = 110;
  const total = lines.reduce((a, l) => a + pg.measureText(l).width + gap, 0);
  const [c, g] = mk(Math.max(64, Math.ceil(total)), TICKER_H - 4);
  let x = 0;
  lines.forEach((line, i) => {
    const end = codeLine(g, line, x + 40, 9, size);
    // separator diamond
    const dx = end + (gap - 40) / 2 + 12;
    for (let j = -9; j <= 9; j++) rect(g, dx - (9 - Math.abs(j)), 31 + j, (9 - Math.abs(j)) * 2 + 1, 1, i % 2 ? "#ffb454" : "#38c9b4");
    x = end + gap - 40;
  });
  return c;
}

/**
 * Paints the LED wall content into any rectangle. The hall map calls it every frame;
 * the battle screen can reuse it as the boss backdrop.
 */
export function drawLed(ctx: Ctx, x: number, y: number, w: number, h: number, timeMs: number): void {
  const lw = LED_RECT.w;
  const lh = LED_RECT.h;
  const prev = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  if (ledLines.length) {
    const key = ledLines.join("\n");
    if (!codeCanvas || !tickerCanvas || key !== codeKey) {
      codeCanvas = buildCode(ledLines, lw, lh);
      tickerCanvas = buildTicker(ledLines);
      codeKey = key;
    }
    if (!frameCanvas) frameCanvas = mk(lw, lh)[0];
    const fg = frameCanvas.getContext("2d")!;
    fg.imageSmoothingEnabled = false;
    fg.drawImage(codeCanvas, 0, 0);
    // scroll the ticker in whole 2 px steps; repeat it across the wall
    const tw = tickerCanvas.width;
    const off = (Math.floor(timeMs / 12) * 2) % tw;
    for (let tx = -off; tx < lw; tx += tw) fg.drawImage(tickerCanvas, tx, lh - TICKER_H + 5);
    // slow scan line over the static block
    const sy = Math.floor(((timeMs / 28) % (lh + 60)) / 4) * 4 - 30;
    if (sy > 0 && sy < lh - TICKER_H - 12) {
      fg.fillStyle = "rgba(160,255,220,0.07)";
      fg.fillRect(0, sy, lw, 12);
    }
    ctx.drawImage(frameCanvas, 0, 0, lw, lh, x, y, w, h);
  } else {
    if (!idleCanvas || (!idleFontsReady && document.fonts && document.fonts.status === "loaded")) {
      idleCanvas = buildIdle(lw, lh);
      idleFontsReady = !document.fonts || document.fonts.status === "loaded";
    }
    ctx.drawImage(idleCanvas, 0, 0, lw, lh, x, y, w, h);
    // a soft band of light sweeping across, in hard 8 px steps
    const sx = Math.floor(((timeMs / 14) % (lw + 400)) / 8) * 8 - 200;
    for (let k = 0; k < 3; k++) {
      const bx = Math.max(0, sx + k * 24);
      const bw = Math.min(lw, sx + 160 - k * 24) - bx;
      if (bw > 0) {
        ctx.fillStyle = "rgba(210,255,246,0.06)";
        ctx.fillRect(x + (bx * w) / lw, y, (bw * w) / lw, h);
      }
    }
    // twinkles
    const tick = Math.floor(timeMs / 380);
    for (let i = 0; i < 26; i++) {
      if (hash(i, tick, 5) < 0.35) {
        const px = Math.floor(hash(i, 1, 21) * (lw - 8));
        const py = Math.floor(hash(i, 2, 22) * (lh - 8));
        ctx.fillStyle = "#eafffb";
        ctx.fillRect(x + (px * w) / lw, y + (py * h) / lh, Math.max(2, (4 * w) / lw), Math.max(2, (4 * h) / lh));
      }
    }
  }
  ctx.imageSmoothingEnabled = prev;
}

// ---------------------------------------------------------------- materials

const WALNUT = ["#241812", "#2c1e17", "#33241b", "#3a291f", "#412e23", "#483327", "#50392c", "#5a4133"];
const OAK = ["#7d5a45", "#8c6750", "#9a735b", "#a67c62", "#ae8267", "#b98d70", "#c4987a", "#cfa687", "#dab696"];
const CARPET = ["#5f5d5e", "#6b6969", "#777475", "#838080", "#8f8c8b", "#9a9796", "#a5a2a1"];

function walnut(g: Ctx, x: number, y: number, w: number, h: number, seed: number, lift = 0): void {
  const pw = 32;
  for (let px = x; px < x + w; px += pw) {
    const ww = Math.min(pw, x + w - px);
    const i = Math.max(0, Math.min(WALNUT.length - 1, 2 + lift + Math.floor(hash(px, seed, 3) * 3)));
    rect(g, px, y, ww, h, WALNUT[i]);
    for (let k = 0; k < 5; k++) {
      const gx = px + 3 + Math.floor(hash(px, k, seed + 9) * (ww - 6));
      const gy = y + Math.floor(hash(px, k, seed + 17) * h * 0.6);
      const gl = Math.floor(h * (0.25 + hash(px, k, seed + 31) * 0.5));
      rect(g, gx, gy, 1, Math.min(gl, y + h - gy), WALNUT[Math.max(0, i - 1)]);
      if (k % 2 === 0) rect(g, gx + 2, gy + 6, 1, Math.min(gl, y + h - gy - 6), WALNUT[Math.min(WALNUT.length - 1, i + 1)]);
    }
    rect(g, px, y, 1, h, WALNUT[0]);
    rect(g, px + 1, y, 1, h, WALNUT[Math.min(WALNUT.length - 1, i + 2)]);
  }
}

function carpet(g: Ctx, x: number, y: number, w: number, h: number, dim: number): void {
  for (let j = 0; j < h; j += 8) {
    for (let i = 0; i < w; i += 16) {
      const ox = ((j / 8) & 1) * 8;
      const r = hash(Math.floor((x + i + ox) / 16), Math.floor((y + j) / 8), 77);
      const big = hash(Math.floor((x + i) / 96), Math.floor((y + j) / 64), 5);
      const idx = Math.max(0, Math.min(CARPET.length - 1, Math.round(3 - dim + (r - 0.5) * 1.1 + (big - 0.5) * 0.8)));
      rect(g, x + i, y + j, Math.min(16, w - i), Math.min(8, h - j), CARPET[idx]);
    }
  }
  speckle(g, x, y, w, h, ["#a9a6a4", "#6b6969"], 0.02, 3, 2);
}

function seat(g: Ctx, x: number, y: number, dim: number, aisle: -1 | 0 | 1): void {
  const fab = ["#6d6b66", "#7c7a74", "#8b8983", "#9a9891"];
  const shell = ["#8f8d84", "#a5a399", "#b8b6ac", "#c7c7bd", "#d6d6cd", "#e3e3dc"];
  const d = (i: number, arr: string[]): string => arr[Math.max(0, Math.min(arr.length - 1, i - dim))];
  // floor shadow
  rect(g, x + 2, y + 54, 60, 10, "rgba(18,16,18,0.55)");
  rect(g, x + 6, y + 2, 52, 4, "rgba(18,16,18,0.35)");
  // seat cushion, seen from above
  rect(g, x + 9, y + 5, 46, 14, d(1, fab));
  rect(g, x + 9, y + 5, 46, 3, d(3, fab));
  rect(g, x + 11, y + 12, 42, 1, d(0, fab));
  // armrests
  rect(g, x + 3, y + 6, 6, 30, "#2e2d2e");
  rect(g, x + 55, y + 6, 6, 30, "#2e2d2e");
  rect(g, x + 3, y + 6, 6, 2, "#4d4c4c");
  rect(g, x + 55, y + 6, 6, 2, "#4d4c4c");
  // top of the backrest (fabric)
  rect(g, x + 6, y + 19, 52, 8, d(2, fab));
  rect(g, x + 6, y + 19, 52, 2, d(3, fab));
  rect(g, x + 8, y + 17, 48, 2, d(3, fab));
  // back shell, the pale face toward us
  rect(g, x + 6, y + 27, 52, 28, d(3, shell));
  rect(g, x + 6, y + 27, 52, 3, d(5, shell));
  rect(g, x + 6, y + 30, 3, 25, d(4, shell));
  rect(g, x + 53, y + 30, 5, 25, d(1, shell));
  rect(g, x + 9, y + 47, 44, 8, d(2, shell));
  rect(g, x + 9, y + 52, 44, 3, d(1, shell));
  rect(g, x + 12, y + 36, 40, 1, d(2, shell));
  // rounded top corners of the shell and of the fabric pad
  rect(g, x + 6, y + 17, 3, 3, "#3a393a");
  rect(g, x + 55, y + 17, 3, 3, "#3a393a");
  rect(g, x + 6, y + 27, 2, 2, d(2, fab));
  rect(g, x + 56, y + 27, 2, 2, d(2, fab));
  rect(g, x + 14, y + 31, 2, 14, d(4, shell));
  // foot
  rect(g, x + 20, y + 55, 24, 5, "#262526");
  if (aisle !== 0) {
    // fold-down tablet arm on the aisle seat
    const tx = aisle < 0 ? x + 44 : x + 4;
    rect(g, tx, y + 8, 16, 10, d(4, shell));
    rect(g, tx, y + 8, 16, 2, d(5, shell));
    rect(g, tx + 1, y + 17, 14, 1, d(1, shell));
  }
}

/** someone watching from a seat: head and shoulders above the backrest, seen from behind */
function spectator(g: Ctx, x: number, y: number, seed: number): void {
  const tops = ["#3b5b8c", "#8c3b3b", "#e9e6de", "#2f6b52", "#5a5a66", "#c9a233", "#7a4a8c", "#1f2a44", "#d98a9a"];
  const hairs = ["#17120f", "#231a14", "#3a2a1c", "#0f0f12", "#5a5a5a", "#6b4a2a"];
  const top = tops[Math.floor(hash(seed, 1, 7) * tops.length)];
  const hair = hairs[Math.floor(hash(seed, 2, 7) * hairs.length)];
  const lean = Math.floor(hash(seed, 3, 7) * 5) - 2;
  rect(g, x + 11 + lean, y + 9, 42, 13, top);
  rect(g, x + 11 + lean, y + 9, 42, 2, "rgba(255,255,255,0.25)");
  rect(g, x + 9 + lean, y + 13, 4, 9, top);
  rect(g, x + 51 + lean, y + 13, 4, 9, top);
  rect(g, x + 26 + lean, y + 4, 12, 7, "#d9a886");
  ellipse(g, x + 32 + lean, y - 3, 12, 11, hair);
  rect(g, x + 24 + lean, y - 11, 7, 3, "rgba(255,255,255,0.18)");
  if (hash(seed, 4, 7) < 0.3) rect(g, x + 20 + lean, y + 2, 24, 9, hair); // long hair
}

function speaker(g: Ctx, x: number, y: number): void {
  // rig lines up to the ceiling
  rect(g, x + 14, 14, 2, y - 14, "#16161a");
  rect(g, x + 48, 14, 2, y - 14, "#16161a");
  rect(g, x + 8, y - 12, 48, 12, "#1f1f24");
  rect(g, x + 8, y - 12, 48, 2, "#3a3a42");
  // shadow on the wall
  rect(g, x + 10, y + 8, 60, 168, "rgba(10,6,4,0.35)");
  for (let i = 0; i < 4; i++) {
    const by = y + i * 42;
    const lean = i; // the array curves in toward the audience
    rect(g, x + lean, by, 62 - lean, 40, "#111114");
    rect(g, x + lean, by, 62 - lean, 2, "#3b3b44");
    rect(g, x + lean, by + 38, 62 - lean, 2, "#050506");
    rect(g, x + lean + 3, by + 5, 56 - lean, 30, "#1b1b20");
    for (let k = 0; k < 7; k++) rect(g, x + lean + 5 + k * 8, by + 7, 2, 26, "#2c2c33");
    rect(g, x + lean + 3, by + 5, 2, 30, "#34343c");
  }
}

function sideScreen(g: Ctx, x: number, y: number): void {
  rect(g, x + 6, y + 6, 96, 156, "rgba(10,6,4,0.35)");
  rect(g, x, y, 96, 156, "#232223");
  frame(g, x, y, 96, 156, "#4b4b49", 2);
  const teal = ["#0b4a59", "#0f6170", "#157b86", "#1f979a"];
  for (let i = 0; i < 88; i += 8) rect(g, x + 4 + i, y + 4, 8, 148, teal[Math.floor(hash(i, x, 8) * teal.length)]);
  drawCrest(g, x + 22, y + 34, 52);
  text(g, "HKU", x + 48, y + 106, 18, "#f4fffb", { align: "center" });
}

function exitSign(g: Ctx, x: number, y: number): void {
  rect(g, x - 2, y - 2, 56, 24, "rgba(60,255,150,0.18)");
  rect(g, x, y, 52, 20, "#0f7a44");
  frame(g, x, y, 52, 20, "#0a4a2a", 1);
  rect(g, x + 4, y + 4, 10, 12, "#e9fff2");
  rect(g, x + 7, y + 6, 4, 4, "#0f7a44");
  text(g, "EXIT", x + 34, y + 4, 12, "#e9fff2", { align: "center" });
}

function door(g: Ctx, x: number, y: number, w: number, h: number): void {
  rect(g, x - 4, y - 4, w + 8, h + 4, "#1b120d");
  walnut(g, x, y, w / 2 - 1, h, 91, 1);
  walnut(g, x + w / 2 + 1, y, w / 2 - 1, h, 92, 1);
  rect(g, x + w / 2 - 1, y, 2, h, "#120b08");
  rect(g, x + w / 2 - 10, y + h / 2 - 14, 4, 28, "#b9b3a6");
  rect(g, x + w / 2 + 6, y + h / 2 - 14, 4, 28, "#b9b3a6");
  rect(g, x + w / 2 - 10, y + h / 2 - 14, 4, 3, "#e8e4da");
  rect(g, x + w / 2 + 6, y + h / 2 - 14, 4, 3, "#e8e4da");
  rect(g, x, y + h - 10, w, 10, "#2b2b2c"); // kick plate
}

function titleSign(): HTMLCanvasElement {
  const [c, g] = mk(420, 56);
  rect(g, 0, 44, 420, 12, "#151618");
  rect(g, 0, 44, 420, 2, "#3a3d41");
  const glow = (t: string, x: number, y: number, size: number, col: string): void => {
    text(g, t, x + 2, y + 2, size, "#0d3b3a", { align: "center" });
    text(g, t, x, y, size, col, { align: "center" });
  };
  rect(g, 6, 2, 408, 42, "rgba(12,40,44,0.6)");
  glow("CODE CLIMB", 210, 5, 30, "#f4fffb");
  rect(g, 14, 38, 392, 3, "#38c9b4");
  rect(g, 14, 38, 392, 1, "#c8fff2");
  return c;
}

function lecternSprite(): HTMLCanvasElement {
  const [c, g] = mk(72, 124);
  // gooseneck mic
  rect(g, 44, 4, 2, 26, "#1c1c20");
  rect(g, 38, 2, 8, 4, "#1c1c20");
  rect(g, 36, 1, 4, 6, "#3a3a42");
  // timber top, sloped toward the speaker
  rect(g, 2, 26, 68, 6, "#9c7654");
  rect(g, 2, 26, 68, 2, "#b98d68");
  rect(g, 4, 32, 64, 10, "#846246");
  rect(g, 4, 40, 64, 2, "#5e4430");
  // white body
  rect(g, 8, 42, 56, 78, "#eeece6");
  rect(g, 8, 42, 4, 78, "#fbfaf6");
  rect(g, 56, 42, 8, 78, "#cfccc3");
  rect(g, 8, 42, 56, 3, "#bdbab0");
  rect(g, 8, 114, 56, 6, "#b3b0a6");
  rect(g, 6, 120, 60, 4, "#6d6a63");
  drawCrest(g, 22, 56, 28);
  rect(g, 20, 96, 32, 2, "#c9c6bc");
  return c;
}

// ---------------------------------------------------------------- the map

export function buildGrandHall(): GameMap {
  const [ground, g] = mk(W, H);
  const solid = new Uint8Array(COLS * ROWS);
  const props: Prop[] = [];
  const triggers: Trigger[] = [];

  // ---- floor: grey loop-pile carpet, dimmer toward the back of the house
  for (let ty = 0; ty < ROWS; ty++) carpet(g, 0, ty * TILE, W, TILE, ty > 15 ? 2 : ty > 12 ? 1 : 0);

  // ---- back wall behind the stage: walnut panels
  walnut(g, TILE, 16, W - 2 * TILE, WALL_H - 16, 1);
  rect(g, TILE, 150, W - 2 * TILE, 2, WALNUT[0]); // horizontal joint
  rect(g, TILE, 152, W - 2 * TILE, 1, WALNUT[6]);
  for (let s = 0; s < 4; s++) dither(g, TILE, 16 + s * 6, W - 2 * TILE, 6, "rgba(0,0,0,0)", "rgba(12,7,5,0.6)", 0.8 - s * 0.2, 2);
  // ceiling edge with the lighting bar and white profile spots
  rect(g, 0, 0, W, 16, "#2a1f1c");
  rect(g, 0, 12, W, 4, "#473532");
  rect(g, 200, 5, W - 400, 3, "#0d0d0f");
  for (let x = 300; x < W - 260; x += 188) {
    rect(g, x, 2, 22, 16, "#e9e7e1");
    rect(g, x, 2, 22, 3, "#ffffff");
    rect(g, x + 4, 18, 14, 6, "#c9c6bd");
    rect(g, x + 6, 22, 10, 4, "#fff6c9");
    rect(g, x - 4, 8, 4, 12, "#bdbab0");
    rect(g, x + 22, 8, 4, 12, "#bdbab0");
  }

  // ---- LED wall: near-black surround, thin bezel
  const L = LED_RECT;
  rect(g, L.x - 6, L.y - 6 + 8, L.w + 20, L.h + 12, "rgba(10,6,4,0.4)");
  rect(g, L.x - 14, L.y - 14, L.w + 28, L.h + 28, "#232223");
  frame(g, L.x - 14, L.y - 14, L.w + 28, L.h + 28, "#4b4b49", 3);
  frame(g, L.x - 3, L.y - 3, L.w + 6, L.h + 6, "#0b0b0c", 3);
  rect(g, L.x, L.y, L.w, L.h, "#06131c");

  // ---- speakers, side screens, doors with EXIT signs (mirrored)
  speaker(g, L.x - 14 - 78, 52);
  speaker(g, L.x + L.w + 14 + 16, 52);
  sideScreen(g, 212, 58);
  sideScreen(g, W - 212 - 96, 58);
  door(g, 80, 168, 112, 152);
  door(g, W - 80 - 112, 168, 112, 152);
  exitSign(g, 110, 136);
  exitSign(g, W - 110 - 52, 136);
  // small control panel and a wall camera beside the stage
  rect(g, 318, 246, 22, 30, "#d8d6cf");
  rect(g, 321, 250, 16, 10, "#1d2a3a");
  rect(g, 323, 264, 4, 4, "#3fd07a");
  rect(g, 330, 264, 4, 4, "#e2574c");
  rect(g, W - 232, 30, 16, 10, "#e9e7e1");
  rect(g, W - 228, 40, 8, 6, "#1c1c20");
  rect(g, 216, 30, 16, 10, "#e9e7e1");
  rect(g, 220, 40, 8, 6, "#1c1c20");
  // wall base
  rect(g, TILE, WALL_H - 8, W - 2 * TILE, 8, "#1a110c");

  // ---- stage: light oak boards, lit from above
  const sx0 = TILE;
  const sw = W - 2 * TILE;
  for (let y = STAGE_Y; y < STAGE_BOTTOM; y += 16) {
    const row = (y - STAGE_Y) / 16;
    let x = sx0 - Math.floor(hash(row, 1, 40) * 120);
    while (x < sx0 + sw) {
      const len = 150 + Math.floor(hash(x, row, 41) * 140);
      const cx = Math.max(sx0, x);
      const cw = Math.min(sx0 + sw, x + len) - cx;
      // brightness: pools of light under each spot, falling off to the wings
      const mid = cx + cw / 2;
      const centre = 1 - Math.min(1, Math.abs(mid - W / 2) / (W * 0.52));
      const pool = Math.max(0, Math.cos(((mid - 300) / 188) * Math.PI * 2)) * 0.8;
      const idx = Math.max(0, Math.min(OAK.length - 1, Math.round(1.5 + centre * 4 + pool + (hash(x, row, 42) - 0.5) * 1.6)));
      rect(g, cx, y, cw, 16, OAK[idx]);
      rect(g, cx, y + 15, cw, 1, OAK[Math.max(0, idx - 2)]);
      rect(g, cx, y, cw, 1, OAK[Math.min(OAK.length - 1, idx + 1)]);
      if (x > sx0) rect(g, x, y, 1, 16, OAK[Math.max(0, idx - 2)]);
      for (let k = 0; k < 3; k++) {
        const gx = cx + Math.floor(hash(x, row, 50 + k) * Math.max(1, cw - 30));
        rect(g, gx, y + 4 + k * 4, 18 + Math.floor(hash(gx, k, 3) * 20), 1, OAK[Math.max(0, idx - 1)]);
      }
      x += len;
    }
  }
  // shadow of the back wall and the LED glow strip on the boards
  for (let s = 0; s < 4; s++) dither(g, sx0, STAGE_Y + s * 6, sw, 6, "rgba(0,0,0,0)", "rgba(30,16,8,0.7)", 0.75 - s * 0.2, 2);
  // stage front: oak nosing, near-black face, shadow on the carpet
  rect(g, sx0, STAGE_BOTTOM - 4, sw, 4, OAK[7]);
  rect(g, sx0, STAGE_BOTTOM, sw, 6, OAK[1]);
  rect(g, sx0, STAGE_BOTTOM + 6, sw, 30, "#232223");
  rect(g, sx0, STAGE_BOTTOM + 6, sw, 2, "#3a3839");
  for (let x = sx0 + 40; x < sx0 + sw; x += 96) rect(g, x, STAGE_BOTTOM + 8, 1, 28, "#151415");
  for (let s = 0; s < 4; s++) dither(g, sx0, STAGE_BOTTOM + 36 + s * 6, sw, 6, "rgba(0,0,0,0)", "rgba(14,12,14,0.8)", 0.8 - s * 0.2, 2);
  // steps at both ends of the stage front
  const steps = (x: number): void => {
    rect(g, x, STAGE_BOTTOM, 2 * TILE, TILE, "#1d1c1d");
    for (let i = 0; i < 3; i++) {
      const y = STAGE_BOTTOM + i * 21;
      rect(g, x + i * 3, y, 2 * TILE - i * 6, 15, OAK[6 - i]);
      rect(g, x + i * 3, y, 2 * TILE - i * 6, 2, OAK[8 - i]);
      rect(g, x + i * 3, y + 15, 2 * TILE - i * 6, 6, OAK[1]);
      rect(g, x + i * 3, y + 19, 2 * TILE - i * 6, 2, "#232223");
    }
    rect(g, x, STAGE_BOTTOM + 62, 2 * TILE, 2, "#3a3839");
  };
  steps(TILE);
  steps(W - 3 * TILE);

  // ---- seating: two blocks, centre aisle, a cross aisle halfway
  const leftBlock = { a: 3, b: 14 };
  const rightBlock = { a: 18, b: 29 };
  const seatRows = [10, 11, 12, 14, 15];
  for (const ty of seatRows) {
    const dim = ty >= 14 ? 1 : 0;
    for (const blk of [leftBlock, rightBlock]) {
      // dark edge band of the carpet under the seats
      rect(g, blk.a * TILE - 4, ty * TILE, (blk.b - blk.a + 1) * TILE + 8, TILE, "#4f4e4f");
      for (let tx = blk.a; tx <= blk.b; tx++) {
        const aisle = blk === leftBlock ? (tx === blk.b ? -1 : 0) : tx === blk.a ? 1 : 0;
        seat(g, tx * TILE, ty * TILE, dim, aisle as -1 | 0 | 1);
        if (hash(tx, ty, 99) < 0.36) spectator(g, tx * TILE, ty * TILE, tx * 31 + ty * 7);
        solid[ty * COLS + tx] = 1;
      }
    }
    // aisle step edge and warm step lights
    for (const ax of [15 * TILE, 1 * TILE, 30 * TILE]) {
      const aw = ax === 15 * TILE ? 3 * TILE : 2 * TILE;
      rect(g, ax, ty * TILE + 60, aw, 2, "#4f4e4f");
      rect(g, ax, ty * TILE + 62, aw, 2, "#b9b6b4");
      rect(g, ax + 2, ty * TILE + 56, 6, 3, "#ffe7a3");
      rect(g, ax + aw - 8, ty * TILE + 56, 6, 3, "#ffe7a3");
    }
  }
  // pools from the ceiling downlights along the aisles
  for (const ty of [9, 13, 16]) {
    for (let x = 2 * TILE; x < W - TILE; x += 3 * TILE + 16) {
      for (let r = 3; r >= 1; r--) {
        g.fillStyle = "rgba(255,244,214,0.05)";
        for (let j = -r * 10; j <= r * 10; j += 2) {
          const half = Math.round(r * 26 * Math.sqrt(Math.max(0, 1 - (j * j) / (r * r * 100))));
          g.fillRect(x - half, ty * TILE + 34 + j, half * 2, 2);
        }
      }
    }
  }

  // ---- side walls and the rear wall (seen from above)
  const wallTop = (x: number, y: number, w: number, h: number): void => {
    rect(g, x, y, w, h, "#1d130e");
    walnut(g, x + 6, y, w - 12, h, 55, -2);
    rect(g, x, y, w, 2, "#0f0906");
  };
  wallTop(0, 0, TILE, H);
  wallTop(W - TILE, 0, TILE, H);
  rect(g, TILE - 6, 16, 6, H, "#3a291f");
  rect(g, W - TILE, 16, 6, H, "#3a291f");
  rect(g, 0, (ROWS - 1) * TILE, W, TILE, "#1d130e");
  walnut(g, 0, (ROWS - 1) * TILE + 8, W, TILE - 8, 66, -1);
  rect(g, 0, (ROWS - 1) * TILE, W, 8, "#453126");
  // rear double doors, open to the foyer
  const dx = 15 * TILE;
  rect(g, dx - 6, (ROWS - 1) * TILE, 3 * TILE + 12, TILE, "#120b08");
  rect(g, dx, (ROWS - 1) * TILE, 3 * TILE, TILE, "#8a8786");
  carpet(g, dx, (ROWS - 1) * TILE, 3 * TILE, TILE, 3);
  for (let k = 0; k < 4; k++) rect(g, dx, (ROWS - 1) * TILE + 16 + k * 12, 3 * TILE, 48 - k * 12, "rgba(8,6,6,0.3)");
  rect(g, dx - 6, (ROWS - 1) * TILE, 6, TILE, "#5a4133");
  rect(g, dx + 3 * TILE, (ROWS - 1) * TILE, 6, TILE, "#5a4133");
  exitSign(g, dx + 3 * TILE + 20, (ROWS - 1) * TILE + 22);
  exitSign(g, dx - 72, (ROWS - 1) * TILE + 22);

  // ---- collision
  block(solid, COLS, 0, 0, COLS, WALL_ROWS);
  block(solid, COLS, 0, 0, 1, ROWS);
  block(solid, COLS, COLS - 1, 0, 1, ROWS);
  block(solid, COLS, 0, ROWS - 1, COLS, 1);
  block(solid, COLS, 3, 8, COLS - 6, 1); // stage front; the steps at each end stay open

  // ---- the lit sign on the stage floor, with the game's own title where the event sign stood
  const sign = titleSign();
  const signX = 24 * TILE + 32;
  ellipse(g, signX, 8 * TILE - 10, 210, 9, "rgba(40,22,10,0.4)");
  for (let r = 0; r < 3; r++) {
    g.fillStyle = "rgba(190,255,240,0.07)";
    g.fillRect(signX - 220 - r * 16, 8 * TILE - 70 + r * 4, 440 + r * 32, 20 - r * 4);
  }
  props.push({ sprite: sign, x: Math.round(signX - sign.width / 2), y: 8 * TILE - 6 - sign.height, sortY: 8 * TILE - 8 });
  block(solid, COLS, 21, 7, 7, 1);

  // ---- lectern, stage left (the audience's left)
  const lec = lecternSprite();
  const lecX = 4 * TILE - 4;
  const lecY = 7 * TILE - lec.height - 4;
  ellipse(g, 4 * TILE + 34, 7 * TILE - 6, 36, 8, "rgba(40,22,10,0.45)");
  props.push({ sprite: lec, x: lecX, y: lecY, sortY: 7 * TILE - 6 });
  block(solid, COLS, 4, 6, 1, 1);

  triggers.push({
    id: "lectern",
    tx: 4,
    ty: 7,
    w: 2,
    h: 1,
    en: "Lectern",
    zh: "讲台",
    action: {
      type: "info",
      title: "The lectern",
      titleZh: "讲台",
      text: "A white lectern with a light timber top, a gooseneck mic and the HKU crest on its front. Speakers at HKU events stand here, stage left.",
    },
  });
  triggers.push({
    id: "led-wall",
    tx: 7,
    ty: 5,
    w: 5,
    h: 1,
    en: "LED wall",
    zh: "LED 大屏",
    action: {
      type: "info",
      title: "The LED wall",
      titleZh: "LED 大屏",
      text: "One huge LED wall fills the back of the stage from side wall to side wall. In the boss battle your code and Leo's shield are written on it.",
    },
  });
  triggers.push({
    id: "hall-exit",
    tx: 15,
    ty: ROWS - 2,
    w: 3,
    h: 1,
    en: "Back to CDS-1 14/F",
    zh: "回一号楼 14 层",
    action: { type: "goto", map: "cds1-14", spawn: "lift" },
  });

  // ---- animated layers
  const glow = (ctx: Ctx): void => {
    // light of the LED wall spilling on the stage boards
    const col = ledLines.length ? "120,255,210" : "90,230,220";
    for (let s = 0; s < 5; s++) {
      ctx.fillStyle = `rgba(${col},${0.1 - s * 0.018})`;
      ctx.fillRect(L.x - 40 + s * 24, STAGE_Y + s * 14, L.w + 80 - s * 48, 14);
    }
  };

  // stage light: soft cones from the profile spots, drawn over the performers
  const [beams, bg] = mk(W, STAGE_BOTTOM);
  for (let x = 311; x < W - 260; x += 188) {
    for (let y = 26; y < STAGE_BOTTOM; y += 2) {
      const half = 6 + Math.round(((y - 26) / (STAGE_BOTTOM - 26)) * 88);
      bg.fillStyle = y % 4 === 0 ? "rgba(255,246,214,0.05)" : "rgba(255,246,214,0.03)";
      bg.fillRect(x - half, y, half * 2, 2);
    }
  }

  return {
    id: "hall",
    name: "Grand Hall",
    nameZh: "大礼堂",
    cols: COLS,
    rows: ROWS,
    ground,
    solid,
    props,
    npcs: [{ id: "leo", char: "leo", tx: 16, ty: 5, dir: "down", name: "Leo the HKU lion", nameZh: "港大狮子 Leo", action: { type: "boss" } }],
    triggers,
    spawns: { entry: { tx: 16, ty: ROWS - 2, dir: "up" }, stage: { tx: 14, ty: 5, dir: "right" } },
    drawUnder: (ctx, timeMs) => {
      drawLed(ctx, L.x, L.y, L.w, L.h, timeMs);
      glow(ctx);
    },
    drawOver: (ctx) => {
      ctx.drawImage(beams, 0, 0);
    },
    tint: "rgba(22,12,8,0.16)",
  };
}

void FONT;
