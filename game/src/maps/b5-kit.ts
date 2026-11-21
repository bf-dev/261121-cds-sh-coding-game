// Materials and furniture for Building 5, drawn from buildings/b5/ keyframes.
import { mk, rect, frame, hash, dither, speckle, ellipse, text, type Ctx } from "../art/px";
import type { Prop } from "../engine/types";

export const R = {
  honeyOak: ["#9f6f53", "#ad7b5e", "#ba8768", "#c89373", "#d19e7e", "#dbab8c", "#e5ba9d"],
  paleWood: ["#a8835d", "#b48f68", "#c09b73", "#cba77f", "#d5b38c", "#dfbf9a", "#e8cba9"],
  walnut: ["#241812", "#2c1e17", "#33241b", "#3d2a20", "#4e342b", "#5c4034", "#6b4c3e", "#7a5a49"],
  cream: ["#c9c3b5", "#d4cfc2", "#ded9ce", "#e7e3d9", "#efece4", "#f6f4ee", "#fbfaf6"],
  marble: ["#a79c8c", "#b5aa9a", "#c2b8a8", "#cec5b6", "#d9d1c4", "#e3dcd0", "#ece6dc"],
  plaster: ["#a89889", "#b5a598", "#c4b5a7", "#d2c4b6", "#e0d4c7", "#ece3d8", "#f5efe6"],
  carpet: ["#6b6a64", "#77766f", "#83827a", "#8f9089", "#9aa19c", "#a7aca7"],
  rubber: ["#6d5f55", "#7a6b60", "#87776b", "#948377", "#a08f82"],
  turf: ["#456334", "#55773f", "#65874a", "#77a155", "#88bb60", "#94d56b"],
  sport: ["#aeb2b3", "#babebf", "#c6c9ca", "#d1d4d5", "#dcdfe0"],
  stone: ["#bdbab2", "#c9c6bf", "#d4d1ca", "#dedbd5", "#e8e6e0", "#f0eee9"],
  leaf: ["#234a2a", "#2f6336", "#3d7d43", "#4f9850", "#69b463", "#8ccb7a"],
  glass: ["#5b7383", "#70929b", "#8fb3bd", "#b3d2d9", "#d6ebef"],
};

const pick = (ramp: string[], i: number): string => ramp[Math.max(0, Math.min(ramp.length - 1, Math.round(i)))];

/** stepped pixel line, t px thick */
export function pline(g: Ctx, x0: number, y0: number, x1: number, y1: number, color: string, t = 2): void {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) / Math.max(1, t);
  g.fillStyle = color;
  for (let i = 0; i <= n; i++) {
    const k = n === 0 ? 0 : i / n;
    g.fillRect(Math.round((x0 + (x1 - x0) * k) / t) * t, Math.round((y0 + (y1 - y0) * k) / t) * t, t, t);
  }
}

/** plank floor, boards running left to right */
export function planks(g: Ctx, x: number, y: number, w: number, h: number, ramp: string[], seed = 1, ph = 16, mid = 3): void {
  for (let j = 0; j < h; j += ph) {
    const row = Math.floor((y + j) / ph);
    let px = x - Math.floor(hash(row, seed, 40) * 110);
    while (px < x + w) {
      const len = 120 + Math.floor(hash(px, row, seed + 1) * 130);
      const cx = Math.max(x, px);
      const cw = Math.min(x + w, px + len) - cx;
      const idx = mid + (hash(px, row, seed + 2) - 0.5) * 2.6;
      const hh = Math.min(ph, h - j);
      rect(g, cx, y + j, cw, hh, pick(ramp, idx));
      rect(g, cx, y + j + hh - 1, cw, 1, pick(ramp, idx - 2));
      rect(g, cx, y + j, cw, 1, pick(ramp, idx + 1));
      if (px > x) rect(g, px, y + j, 1, hh, pick(ramp, idx - 2));
      for (let k = 0; k < 2; k++) {
        const gx = cx + Math.floor(hash(px, row, seed + 5 + k) * Math.max(1, cw - 30));
        rect(g, gx, y + j + 5 + k * 5, 14 + Math.floor(hash(gx, k, 3) * 22), 1, pick(ramp, idx - 1));
      }
      px += len;
    }
  }
}

/** large polished stone tiles with soft reflections */
export function stone(g: Ctx, x: number, y: number, w: number, h: number, ramp: string[], size = 64, seed = 2): void {
  for (let j = 0; j < h; j += size) {
    for (let i = 0; i < w; i += size) {
      const idx = ramp.length - 3 + (hash(Math.floor((x + i) / size), Math.floor((y + j) / size), seed) - 0.5) * 1.6;
      const tw = Math.min(size, w - i);
      const th = Math.min(size, h - j);
      rect(g, x + i, y + j, tw, th, pick(ramp, idx));
      rect(g, x + i, y + j, tw, 1, pick(ramp, idx - 2));
      rect(g, x + i, y + j, 1, th, pick(ramp, idx - 2));
      rect(g, x + i + 1, y + j + 1, tw - 1, 1, pick(ramp, idx + 1));
    }
  }
  speckle(g, x, y, w, h, [ramp[1], ramp[ramp.length - 1]], 0.012, seed + 4, 2);
  // window reflections: long pale streaks
  for (let k = 0; k < Math.floor((w * h) / 90000); k++) {
    const sx = x + Math.floor(hash(k, seed, 61) * (w - 80));
    const sy = y + Math.floor(hash(k, seed, 62) * (h - 12));
    dither(g, sx, sy, 60 + Math.floor(hash(k, seed, 63) * 60), 6, "rgba(0,0,0,0)", "rgba(255,255,255,0.5)", 0.5, 2);
  }
}

/** the lobby's inlaid dark-line lattice of hexagons and diamonds */
export function lattice(g: Ctx, x: number, y: number, w: number, h: number): void {
  const c = "#424c4e";
  const s = 96;
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  for (let j = -s; j < h + s; j += s) {
    for (let i = -s; i < w + s; i += s) {
      const ox = x + i + (Math.round(j / s) & 1 ? s / 2 : 0);
      const oy = y + j;
      const cx = ox + s / 2;
      const cy = oy + s / 2;
      // hexagon
      const hx = 30;
      const hy = 36;
      pline(g, cx - hx, cy - hy / 2, cx, cy - hy, c, 3);
      pline(g, cx, cy - hy, cx + hx, cy - hy / 2, c, 3);
      pline(g, cx + hx, cy - hy / 2, cx + hx, cy + hy / 2, c, 3);
      pline(g, cx + hx, cy + hy / 2, cx, cy + hy, c, 3);
      pline(g, cx, cy + hy, cx - hx, cy + hy / 2, c, 3);
      pline(g, cx - hx, cy + hy / 2, cx - hx, cy - hy / 2, c, 3);
      // diamond inside
      pline(g, cx - 15, cy, cx, cy - 18, c, 3);
      pline(g, cx, cy - 18, cx + 15, cy, c, 3);
      pline(g, cx + 15, cy, cx, cy + 18, c, 3);
      pline(g, cx, cy + 18, cx - 15, cy, c, 3);
      // links to the neighbours
      pline(g, cx + hx, cy, cx + s - hx, cy, c, 3);
    }
  }
  g.restore();
  frame(g, x, y, w, h, c, 4);
  frame(g, x + 10, y + 10, w - 20, h - 20, c, 2);
}

export function carpet(g: Ctx, x: number, y: number, w: number, h: number, ramp = R.carpet, seed = 7): void {
  for (let j = 0; j < h; j += 8) {
    for (let i = 0; i < w; i += 16) {
      const r = hash(Math.floor((x + i) / 16), Math.floor((y + j) / 8), seed);
      const big = hash(Math.floor((x + i) / 128), Math.floor((y + j) / 96), seed + 1);
      rect(g, x + i, y + j, Math.min(16, w - i), Math.min(8, h - j), pick(ramp, 3 + (r - 0.5) * 1.6 + (big - 0.5) * 1.2));
    }
  }
  speckle(g, x, y, w, h, [ramp[0], ramp[ramp.length - 1]], 0.03, seed + 2, 2);
}

/** soft dithered dark band, e.g. ambient occlusion at a wall base. dir 1 = fades downward */
export function ao(g: Ctx, x: number, y: number, w: number, h: number, alpha = 0.5, dir: 1 | -1 = 1): void {
  const steps = 4;
  const sh = h / steps;
  for (let s = 0; s < steps; s++) {
    const yy = dir === 1 ? y + s * sh : y + h - (s + 1) * sh;
    dither(g, x, Math.round(yy), w, Math.ceil(sh), "rgba(0,0,0,0)", `rgba(24,18,16,${alpha})`, 0.85 - s * 0.22, 2);
  }
}

export function lightPool(g: Ctx, cx: number, cy: number, rx: number, ry: number, color = "255,236,190", alpha = 0.07): void {
  for (let r = 3; r >= 1; r--) {
    g.fillStyle = `rgba(${color},${alpha})`;
    const ry2 = (ry * r) / 3;
    const rx2 = (rx * r) / 3;
    for (let j = -ry2; j <= ry2; j += 2) {
      const half = Math.round(rx2 * Math.sqrt(Math.max(0, 1 - (j * j) / (ry2 * ry2 || 1))));
      g.fillRect(Math.round(cx - half), Math.round(cy + j), half * 2, 2);
    }
  }
}

/** flat painted wall with a ceiling shadow and a dark skirting gap */
export function wall(g: Ctx, x: number, y: number, w: number, h: number, base: string, hi: string, lo: string): void {
  rect(g, x, y, w, h, base);
  dither(g, x, y, w, 14, base, lo, 0.6, 2);
  dither(g, x, y + 14, w, 10, base, lo, 0.25, 2);
  dither(g, x, y + h - 60, w, 30, base, hi, 0.35, 2);
  rect(g, x, y + h - 8, w, 8, "#26221f");
  rect(g, x, y + h - 10, w, 2, lo);
}

/** backlit beige marble panels with a warm cove at the ceiling */
export function marbleWall(g: Ctx, x: number, y: number, w: number, h: number, seed = 3): void {
  for (let px = x; px < x + w; px += 64) {
    const ww = Math.min(64, x + w - px);
    const i = 3 + Math.floor(hash(px, seed, 3) * 2);
    rect(g, px, y, ww, h, R.marble[i]);
    for (let k = 0; k < 4; k++) {
      const vx = px + 6 + Math.floor(hash(px, k, seed + 9) * (ww - 16));
      const vy = y + 20 + Math.floor(hash(px, k, seed + 10) * (h - 60));
      pline(g, vx, vy, vx + 10 + Math.floor(hash(px, k, seed + 11) * 26), vy + 14 + Math.floor(hash(px, k, seed + 12) * 30), R.marble[i - 1], 1);
      if (k % 2) pline(g, vx + 4, vy + 6, vx - 8, vy + 30, R.marble[i + 1], 1);
    }
    rect(g, px, y, 1, h, R.marble[1]);
    rect(g, px + 1, y, 1, h, R.marble[6]);
  }
  rect(g, x, y + Math.round(h * 0.52), w, 1, R.marble[1]);
  // warm cove strip
  rect(g, x, y, w, 6, "#ffd9a0");
  dither(g, x, y + 6, w, 10, "#f3cf9c", R.marble[5], 0.5, 2);
  dither(g, x, y + 16, w, 12, R.marble[5], R.marble[4], 0.5, 2);
  rect(g, x, y + h - 6, w, 6, "#6f6a62");
  rect(g, x, y + h - 8, w, 2, R.marble[1]);
}

export function walnutWall(g: Ctx, x: number, y: number, w: number, h: number, seed = 5, lift = 0): void {
  for (let px = x; px < x + w; px += 32) {
    const ww = Math.min(32, x + w - px);
    const i = 3 + lift + Math.floor(hash(px, seed, 3) * 2);
    rect(g, px, y, ww, h, pick(R.walnut, i));
    for (let k = 0; k < 4; k++) {
      const gx = px + 3 + Math.floor(hash(px, k, seed + 9) * (ww - 6));
      const gy = y + Math.floor(hash(px, k, seed + 17) * h * 0.6);
      rect(g, gx, gy, 1, Math.min(Math.floor(h * 0.5), y + h - gy), pick(R.walnut, i - 1));
    }
    rect(g, px, y, 1, h, R.walnut[0]);
    rect(g, px + 1, y, 1, h, pick(R.walnut, i + 2));
  }
}

/** green EXIT sign */
export function exitSign(g: Ctx, x: number, y: number): void {
  rect(g, x, y, 44, 18, "#0f7a44");
  frame(g, x, y, 44, 18, "#0a4a2a", 1);
  rect(g, x + 3, y + 3, 9, 12, "#e9fff2");
  text(g, "EXIT", x + 28, y + 3, 11, "#e9fff2", { align: "center" });
}

/** black-framed glass with the frosted HKU / Est. 1911 band; translucent, used as a prop in front of rooms */
export function glassPartition(w: number, h: number, label: string[]): HTMLCanvasElement {
  const [c, g] = mk(w, h);
  rect(g, 0, 0, w, h, "rgba(176,208,222,0.16)");
  for (let k = 0; k < Math.floor(w / 70); k++) {
    const sx = Math.floor(hash(k, w, 3) * (w - 30));
    for (let j = 0; j < h; j += 2) rect(g, sx + Math.floor(j / 3), j, 10, 1, "rgba(255,255,255,0.10)");
  }
  // frosted band at door-handle height
  const by = Math.round(h * 0.42);
  rect(g, 0, by, w, 26, "rgba(236,244,246,0.5)");
  rect(g, 0, by + 4, w, 2, "rgba(255,255,255,0.55)");
  rect(g, 0, by + 20, w, 2, "rgba(255,255,255,0.55)");
  let i = 0;
  for (let x = 48; x < w - 40; x += 148) {
    text(g, label[i % label.length], x, by + 4, 17, "rgba(255,255,255,0.95)", { align: "center" });
    i++;
  }
  for (let x = 0; x < w; x += 96) rect(g, x, 0, 5, h, "#17181a");
  rect(g, w - 5, 0, 5, h, "#17181a");
  rect(g, 0, 0, w, 6, "#17181a");
  rect(g, 0, h - 6, w, 6, "#17181a");
  rect(g, 0, 6, w, 1, "#3a3d41");
  return c;
}

// ------------------------------------------------------------------ furniture

export function chair(seat: string, wood: string, back: "up" | "down" = "up"): HTMLCanvasElement {
  const [c, g] = mk(40, 60);
  const dk = "#2d221c";
  if (back === "up") {
    rect(g, 6, 2, 28, 26, wood);
    rect(g, 6, 2, 28, 3, "#ffffff55");
    rect(g, 10, 8, 20, 14, "rgba(0,0,0,0.18)");
    rect(g, 4, 28, 32, 14, seat);
    rect(g, 4, 28, 32, 3, "#ffffff40");
    rect(g, 4, 42, 32, 4, "rgba(0,0,0,0.3)");
    rect(g, 6, 46, 4, 12, dk);
    rect(g, 30, 46, 4, 12, dk);
  } else {
    rect(g, 4, 10, 32, 14, seat);
    rect(g, 4, 10, 32, 3, "#ffffff40");
    rect(g, 6, 22, 28, 26, wood);
    rect(g, 6, 22, 28, 3, "#ffffff55");
    rect(g, 6, 44, 28, 4, "rgba(0,0,0,0.25)");
    rect(g, 6, 48, 4, 10, dk);
    rect(g, 30, 48, 4, 10, dk);
  }
  return c;
}

export function roundTable(top = "#f4f2ec", w = 56): HTMLCanvasElement {
  const [c, g] = mk(w + 4, 56);
  ellipse(g, w / 2 + 2, 50, w / 3, 5, "rgba(20,24,40,0.25)");
  rect(g, w / 2 - 1, 22, 6, 26, "#d9d6cf");
  rect(g, w / 2 + 3, 22, 2, 26, "#a9a6a0");
  ellipse(g, w / 2 + 2, 48, 12, 4, "#c9c6bf");
  ellipse(g, w / 2 + 2, 18, w / 2, 12, "#b9b6ae");
  ellipse(g, w / 2 + 2, 15, w / 2, 12, top);
  ellipse(g, w / 2 - 6, 12, w / 5, 3, "#ffffff");
  return c;
}

export function armchair(col: string, dark: string, light: string): HTMLCanvasElement {
  const [c, g] = mk(64, 68);
  ellipse(g, 32, 60, 28, 6, "rgba(20,24,40,0.28)");
  rect(g, 8, 8, 48, 30, dark);
  rect(g, 10, 6, 44, 6, col);
  rect(g, 12, 4, 40, 4, light);
  rect(g, 4, 22, 12, 32, col);
  rect(g, 48, 22, 12, 32, col);
  rect(g, 4, 22, 12, 4, light);
  rect(g, 48, 22, 12, 4, light);
  rect(g, 14, 30, 36, 20, col);
  rect(g, 14, 30, 36, 5, light);
  rect(g, 8, 50, 48, 8, dark);
  rect(g, 10, 58, 4, 6, "#2a2422");
  rect(g, 50, 58, 4, 6, "#2a2422");
  return c;
}

export function sofa(col: string, dark: string, light: string, w = 150): HTMLCanvasElement {
  const [c, g] = mk(w, 74);
  ellipse(g, w / 2, 66, w / 2 - 6, 6, "rgba(20,24,40,0.28)");
  rect(g, 6, 6, w - 12, 34, dark);
  rect(g, 8, 4, w - 16, 8, col);
  rect(g, 10, 2, w - 20, 4, light);
  rect(g, 2, 24, 14, 36, col);
  rect(g, w - 16, 24, 14, 36, col);
  rect(g, 2, 24, 14, 4, light);
  rect(g, w - 16, 24, 14, 4, light);
  const n = Math.max(2, Math.round((w - 32) / 60));
  const cw = (w - 32) / n;
  for (let i = 0; i < n; i++) {
    rect(g, 16 + i * cw, 32, cw - 2, 22, col);
    rect(g, 16 + i * cw, 32, cw - 2, 5, light);
  }
  rect(g, 6, 54, w - 12, 10, dark);
  return c;
}

export function pouf(col: string, dark: string, light: string, r = 20): HTMLCanvasElement {
  const [c, g] = mk(r * 2 + 4, r + 26);
  ellipse(g, r + 2, r + 20, r, 5, "rgba(20,24,40,0.28)");
  rect(g, 2, r * 0.6, r * 2, 16, dark);
  ellipse(g, r + 2, r * 0.6 + 16, r, r * 0.45, dark);
  ellipse(g, r + 2, r * 0.6, r, r * 0.5, col);
  ellipse(g, r - 3, r * 0.6 - 3, r * 0.5, r * 0.18, light);
  return c;
}

export function plant(tall = 110, potCol = "#f2f0ea"): HTMLCanvasElement {
  const [c, g] = mk(72, tall);
  ellipse(g, 36, tall - 6, 22, 5, "rgba(20,24,40,0.28)");
  rect(g, 22, tall - 34, 28, 28, potCol);
  rect(g, 22, tall - 34, 28, 4, "#ffffff");
  rect(g, 44, tall - 30, 6, 24, "#c9c6bf");
  rect(g, 24, tall - 8, 24, 3, "#a9a6a0");
  rect(g, 34, tall - 60, 4, 28, "#5a4030");
  const top = tall - 40;
  for (let k = 0; k < 26; k++) {
    const a = hash(k, tall, 5) * Math.PI * 2;
    const rr = hash(k, tall, 6) * 26;
    const bx = 36 + Math.cos(a) * rr;
    const by = top * 0.5 + Math.sin(a) * rr * (top / 60) * 0.9;
    const s = 8 + Math.floor(hash(k, tall, 7) * 8);
    const sh = Math.floor(1 + hash(k, tall, 8) * 4 + (by < top * 0.45 ? 1 : 0));
    ellipse(g, bx, Math.max(s, by), s, s * 0.7, pick(R.leaf, sh));
  }
  for (let k = 0; k < 16; k++) rect(g, 14 + hash(k, 2, tall) * 44, 6 + hash(k, 3, tall) * (top - 10), 3, 2, R.leaf[5]);
  return c;
}

export function piano(): HTMLCanvasElement {
  const [c, g] = mk(190, 170);
  ellipse(g, 96, 158, 84, 9, "rgba(20,24,40,0.35)");
  // raised lid
  for (let j = 0; j < 62; j++) {
    const w = 60 + Math.round(j * 1.3);
    rect(g, 150 - w, 6 + j, w + 10, 1, j < 3 ? "#5b5b66" : j % 9 === 0 ? "#2c2c35" : "#1b1b22");
  }
  rect(g, 154, 30, 3, 44, "#8a7a4a"); // prop stick
  // body
  for (let j = 0; j < 58; j++) {
    const cut = j < 26 ? Math.round((26 - j) * 1.6) : 0;
    rect(g, 18 + cut, 66 + j, 150 - cut, 1, j < 4 ? "#40404b" : "#101014");
  }
  rect(g, 30, 78, 126, 22, "#7a5a2a"); // soundboard glimpse
  for (let k = 0; k < 14; k++) rect(g, 34 + k * 9, 78, 1, 22, "#d6b25a");
  rect(g, 18, 118, 150, 6, "#2a2a33");
  // keyboard
  rect(g, 22, 124, 142, 12, "#f6f4ee");
  for (let k = 0; k < 36; k++) rect(g, 22 + k * 4, 124, 1, 12, "#b9b6ae");
  for (let k = 0; k < 28; k++) if (k % 7 !== 2 && k % 7 !== 6) rect(g, 25 + k * 5, 124, 3, 7, "#0b0b0e");
  rect(g, 18, 136, 150, 8, "#0b0b0e");
  rect(g, 18, 136, 150, 2, "#3a3a44");
  // legs
  rect(g, 26, 144, 8, 14, "#0b0b0e");
  rect(g, 152, 144, 8, 14, "#0b0b0e");
  rect(g, 88, 144, 8, 10, "#0b0b0e");
  // highlight sweep on the gloss
  for (let j = 0; j < 24; j++) rect(g, 60 + j, 70 + j * 2, 14, 1, "rgba(255,255,255,0.10)");
  return c;
}

export function pianoBench(): HTMLCanvasElement {
  const [c, g] = mk(70, 40);
  ellipse(g, 35, 34, 30, 5, "rgba(20,24,40,0.3)");
  rect(g, 6, 6, 58, 14, "#1b1b22");
  rect(g, 6, 6, 58, 3, "#4a4a55");
  rect(g, 8, 20, 4, 14, "#0b0b0e");
  rect(g, 58, 20, 4, 14, "#0b0b0e");
  return c;
}

export function poolTable(): HTMLCanvasElement {
  const [c, g] = mk(176, 124);
  ellipse(g, 88, 114, 82, 8, "rgba(20,24,40,0.3)");
  rect(g, 4, 6, 168, 74, "#4a2f22");
  rect(g, 4, 6, 168, 4, "#7a5a49");
  rect(g, 14, 16, 148, 54, "#1f8f4a");
  dither(g, 14, 16, 148, 54, "#229a50", "#2bb35f", 0.35, 2);
  rect(g, 14, 16, 148, 3, "#16703a");
  for (const [px, py] of [[10, 12], [84, 10], [158, 12], [10, 66], [84, 68], [158, 66]] as const) ellipse(g, px + 4, py + 4, 6, 5, "#0d0d0f");
  // balls
  const balls = ["#f6f4ee", "#e63946", "#ffd23f", "#1e4fa0", "#7b4bd6", "#111"];
  balls.forEach((b, i) => {
    const bx = i === 0 ? 46 : 112 + (i % 3) * 9;
    const by = i === 0 ? 44 : 34 + Math.floor(i / 3) * 10 + (i % 2) * 5;
    ellipse(g, bx, by, 4, 4, b);
    rect(g, bx - 2, by - 2, 2, 2, "#ffffff");
  });
  // cue
  pline(g, 30, 60, 84, 46, "#d9b98a", 2);
  // side and legs
  rect(g, 4, 80, 168, 16, "#3a241a");
  rect(g, 4, 80, 168, 2, "#5c4034");
  rect(g, 10, 96, 12, 18, "#2c1e17");
  rect(g, 154, 96, 12, 18, "#2c1e17");
  rect(g, 80, 96, 12, 14, "#2c1e17");
  return c;
}

export function ttTable(): HTMLCanvasElement {
  const [c, g] = mk(150, 96);
  ellipse(g, 75, 88, 66, 6, "rgba(20,24,40,0.28)");
  rect(g, 6, 14, 138, 48, "#2c4fb0");
  rect(g, 6, 14, 138, 3, "#5878d6");
  frame(g, 6, 14, 138, 48, "#f4f6ff", 2);
  rect(g, 6, 37, 138, 2, "#f4f6ff");
  rect(g, 6, 62, 138, 5, "#1b2f73");
  // net
  rect(g, 73, 6, 4, 60, "#16181c");
  for (let j = 8; j < 62; j += 4) rect(g, 74, j, 2, 2, "#e8e8e8");
  // paddles and ball
  ellipse(g, 34, 46, 7, 6, "#d0312d");
  rect(g, 40, 50, 8, 3, "#c9a26e");
  ellipse(g, 118, 28, 3, 3, "#ffa52a");
  // legs
  rect(g, 18, 67, 4, 20, "#7d8187");
  rect(g, 128, 67, 4, 20, "#7d8187");
  rect(g, 60, 67, 4, 18, "#7d8187");
  rect(g, 86, 67, 4, 18, "#7d8187");
  return c;
}

/** treadmill seen from behind, the runner faces the windows */
export function treadmill(): HTMLCanvasElement {
  const [c, g] = mk(60, 128);
  ellipse(g, 30, 120, 26, 6, "rgba(20,24,40,0.3)");
  // console
  rect(g, 10, 4, 40, 22, "#1a1b1f");
  rect(g, 14, 8, 32, 12, "#3ad6c6");
  rect(g, 16, 10, 12, 3, "#e9fffb");
  rect(g, 16, 15, 20, 2, "#0f6f68");
  // uprights and rails
  rect(g, 8, 20, 5, 64, "#2a2b30");
  rect(g, 47, 20, 5, 64, "#2a2b30");
  rect(g, 4, 34, 6, 30, "#3b3d44");
  rect(g, 50, 34, 6, 30, "#3b3d44");
  // deck
  rect(g, 8, 60, 44, 56, "#232428");
  rect(g, 13, 62, 34, 50, "#3a3b40");
  for (let j = 64; j < 112; j += 6) rect(g, 13, j, 34, 1, "#2a2b30");
  rect(g, 8, 114, 44, 5, "#111214");
  rect(g, 8, 60, 44, 2, "#55575e");
  return c;
}

export function dumbbellRack(): HTMLCanvasElement {
  const [c, g] = mk(128, 92);
  ellipse(g, 64, 84, 58, 6, "rgba(20,24,40,0.3)");
  rect(g, 6, 20, 6, 62, "#1a1b1f");
  rect(g, 116, 20, 6, 62, "#1a1b1f");
  for (let r = 0; r < 3; r++) {
    const y = 22 + r * 20;
    rect(g, 6, y + 10, 116, 5, "#2a2b30");
    rect(g, 6, y + 10, 116, 1, "#55575e");
    for (let k = 0; k < 5; k++) {
      const x = 14 + k * 22;
      const s = 6 + r * 2;
      rect(g, x, y + 10 - s, 5, s, "#3b3d44");
      rect(g, x + 11, y + 10 - s, 5, s, "#3b3d44");
      rect(g, x + 5, y + 10 - s / 2 - 1, 6, 3, "#b9bcc2");
      rect(g, x, y + 10 - s, 5, 1, "#70737b");
    }
  }
  return c;
}

export function bench(): HTMLCanvasElement {
  const [c, g] = mk(96, 52);
  ellipse(g, 48, 46, 42, 5, "rgba(20,24,40,0.3)");
  rect(g, 8, 10, 80, 16, "#17181b");
  rect(g, 8, 10, 80, 3, "#3b3d44");
  rect(g, 8, 26, 80, 4, "#0b0b0d");
  rect(g, 14, 30, 5, 16, "#55575e");
  rect(g, 77, 30, 5, 16, "#55575e");
  rect(g, 10, 44, 14, 3, "#2a2b30");
  rect(g, 72, 44, 14, 3, "#2a2b30");
  return c;
}

/** glass-door drinks fridge, lit, with rows of cans */
export function fridge(): HTMLCanvasElement {
  const [c, g] = mk(84, 168);
  ellipse(g, 42, 162, 38, 5, "rgba(20,24,40,0.3)");
  rect(g, 2, 2, 80, 158, "#1c1d21");
  rect(g, 2, 2, 80, 3, "#4a4c54");
  rect(g, 6, 6, 72, 22, "#0f3e9a");
  text(g, "DRINKS", 42, 8, 11, "#ffffff", { align: "center" });
  text(g, "饮料", 42, 18, 9, "#ffe36e", { align: "center" });
  rect(g, 8, 32, 68, 116, "#dff5ff");
  dither(g, 8, 32, 68, 116, "#dff5ff", "#bfe6f6", 0.3, 2);
  const cans = ["#1b3fa6", "#c8ccd4", "#e63946", "#1b3fa6", "#ffd23f", "#2ec4b6", "#1b3fa6", "#c8ccd4"];
  for (let r = 0; r < 5; r++) {
    const y = 36 + r * 22;
    rect(g, 8, y + 18, 68, 3, "#8fa3ad");
    for (let k = 0; k < 7; k++) {
      const col = cans[(k + r * 3) % cans.length];
      rect(g, 11 + k * 9, y + 4, 7, 14, col);
      rect(g, 11 + k * 9, y + 4, 7, 2, "#e8eaee");
      rect(g, 12 + k * 9, y + 9, 5, 3, r % 2 ? "#ffd23f" : "#e63946");
    }
  }
  // door frame, handle, glass shine
  frame(g, 6, 30, 72, 120, "#0b0b0d", 2);
  rect(g, 70, 70, 4, 36, "#b9bcc2");
  for (let j = 0; j < 60; j++) rect(g, 14 + Math.floor(j / 4), 40 + j, 6, 1, "rgba(255,255,255,0.25)");
  rect(g, 6, 150, 72, 8, "#2a2b30");
  for (let k = 0; k < 8; k++) rect(g, 10 + k * 8, 152, 5, 1, "#0b0b0d");
  return c;
}

/** cafe counter with a coffee machine, a cake dome and a snack basket */
export function cafeCounter(): HTMLCanvasElement {
  const [c, g] = mk(232, 112);
  ellipse(g, 116, 104, 110, 6, "rgba(20,24,40,0.3)");
  // top
  rect(g, 2, 36, 228, 14, "#f4f2ec");
  rect(g, 2, 36, 228, 3, "#ffffff");
  rect(g, 2, 48, 228, 3, "#b9b6ae");
  // front: red-wood slats
  rect(g, 6, 51, 220, 50, "#8f4a34");
  for (let x = 6; x < 226; x += 10) {
    rect(g, x, 51, 1, 50, "#5f2c1e");
    rect(g, x + 1, 51, 2, 50, "#a85d44");
  }
  rect(g, 6, 97, 220, 5, "#3d1f16");
  // coffee machine
  rect(g, 14, 6, 50, 30, "#c9ccd2");
  rect(g, 14, 6, 50, 4, "#f2f4f7");
  rect(g, 20, 14, 18, 8, "#1c1d21");
  rect(g, 44, 14, 6, 6, "#e63946");
  rect(g, 26, 26, 6, 10, "#70737b");
  rect(g, 44, 26, 6, 10, "#70737b");
  // cups
  rect(g, 72, 26, 10, 10, "#ffffff");
  rect(g, 86, 26, 10, 10, "#ffffff");
  rect(g, 72, 26, 10, 2, "#c9a26e");
  rect(g, 86, 26, 10, 2, "#c9a26e");
  // cake dome
  ellipse(g, 128, 22, 18, 14, "rgba(220,240,250,0.75)");
  rect(g, 118, 22, 20, 8, "#f6c1c8");
  rect(g, 118, 22, 20, 2, "#fff3f4");
  rect(g, 108, 34, 40, 3, "#d9d6cf");
  // snack basket
  rect(g, 164, 22, 54, 14, "#b98d55");
  for (let x = 164; x < 218; x += 6) rect(g, x, 22, 1, 14, "#8a6537");
  const snacks = ["#e63946", "#ffd23f", "#2ec4b6", "#ff7a2f", "#7b4bd6"];
  snacks.forEach((s, i) => rect(g, 167 + i * 10, 14, 8, 10, s));
  return c;
}

export function floorStand(en: string, zh: string): HTMLCanvasElement {
  const [c, g] = mk(64, 96);
  ellipse(g, 32, 90, 22, 4, "rgba(20,24,40,0.3)");
  rect(g, 6, 4, 52, 62, "#17181a");
  rect(g, 6, 4, 52, 2, "#44464b");
  const words = en.split(" ");
  const half = Math.ceil(words.length / 2);
  text(g, words.slice(0, half).join(" "), 32, 12, 10, "#ffffff", { align: "center" });
  text(g, words.slice(half).join(" "), 32, 24, 10, "#ffffff", { align: "center" });
  text(g, zh, 32, 40, 8, "#e9e9e9", { align: "center" });
  rect(g, 28, 54, 8, 6, "#c21a24");
  rect(g, 30, 66, 4, 20, "#2a2b30");
  rect(g, 18, 86, 28, 4, "#17181a");
  return c;
}

/** tall dark glass directory panel with dense white lines of text */
export function directoryPanel(g: Ctx, x: number, y: number, w: number, h: number): void {
  rect(g, x, y, w, h, "#1b2226");
  frame(g, x, y, w, h, "#0c0f11", 2);
  for (let j = 0; j < h - 20; j++) rect(g, x + 4 + Math.floor(j / 5), y + 6 + j, 6, 1, "rgba(255,255,255,0.05)");
  text(g, "B5", x + w / 2, y + 8, 14, "#ffffff", { align: "center" });
  for (let r = 0; r < Math.floor((h - 44) / 7); r++) {
    const yy = y + 30 + r * 7;
    rect(g, x + 8, yy, 6, 3, "#e9eef0");
    rect(g, x + 18, yy, 10 + Math.floor(hash(r, 1, 9) * (w - 44)), 2, "#dfe6e9");
    if (r % 3 === 0) rect(g, x + 18, yy + 3, 8 + Math.floor(hash(r, 2, 9) * (w - 50)), 1, "#8fa0a8");
  }
}

/** crystal chandelier, three tiers */
export function chandelier(): HTMLCanvasElement {
  const [c, g] = mk(92, 96);
  rect(g, 45, 0, 2, 18, "#8a7a4a");
  for (let t = 0; t < 3; t++) {
    const r = 18 + t * 13;
    const y = 20 + t * 22;
    ellipse(g, 46, y, r, 6, "#c9a84a");
    ellipse(g, 46, y - 1, r - 2, 4, "#fff3c4");
    for (let k = 0; k <= r * 2; k += 5) {
      const x = 46 - r + k;
      const len = 8 + Math.floor(hash(k, t, 4) * 8);
      rect(g, x, y + 3, 2, len, "#eaf6ff");
      rect(g, x, y + 3 + len, 2, 3, "#ffffff");
      rect(g, x, y + 5, 1, 3, "#9fd0ee");
    }
    rect(g, 46 - r, y - 6, 3, 5, "#fffbe0");
    rect(g, 46 + r - 3, y - 6, 3, 5, "#fffbe0");
  }
  ellipse(g, 46, 88, 6, 6, "#eaf6ff");
  rect(g, 44, 84, 2, 2, "#ffffff");
  return c;
}

// ------------------------------------------------------------------ murals and views

/** the pop-art Shanghai skyline mural by the piano */
export function muralSkyline(g: Ctx, x: number, y: number, w: number, h: number, night = true): void {
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  rect(g, x, y, w, h, night ? "#1d2a74" : "#bfe9f2");
  if (night) {
    for (let k = 0; k < 70; k++) rect(g, x + hash(k, 1, 3) * w, y + hash(k, 2, 3) * h * 0.55, 2, 2, k % 5 ? "#ffffff" : "#ffe36e");
  }
  // clouds
  for (let k = 0; k < 4; k++) {
    const cx = x + w * (0.12 + k * 0.26);
    const cy = y + 18 + (k % 2) * 16;
    ellipse(g, cx, cy, 30, 9, night ? "#f6efe0" : "#ffffff");
    ellipse(g, cx + 20, cy + 5, 22, 7, night ? "#f6efe0" : "#ffffff");
    ellipse(g, cx - 16, cy + 6, 16, 6, night ? "#e9c9d6" : "#ffe1ec");
  }
  // green mountains with stripes
  for (let k = 0; k < 3; k++) {
    const cx = x + w * (0.3 + k * 0.27);
    ellipse(g, cx, y + h, 84, h * 0.62, "#1f8f4a");
    for (let s = 1; s < 5; s++) ellipse(g, cx, y + h, 84 - s * 16, h * 0.62 - s * 14, s % 2 ? "#2bb35f" : "#1f8f4a");
  }
  // yellow looping road
  for (let t = 0; t < w; t += 2) {
    const yy = y + h * 0.78 + Math.sin(t / 46) * h * 0.12;
    rect(g, x + t, yy, 2, 10, "#ffd23f");
    if (t % 24 < 10) rect(g, x + t, yy + 4, 2, 2, "#ffffff");
  }
  // blocks of colourful buildings
  const cols = ["#ff5fa2", "#ffd23f", "#2ec4b6", "#ff7a2f", "#7b4bd6", "#e63946", "#3aa0ff", "#f6f4ee"];
  for (let k = 0; k < Math.floor(w / 34); k++) {
    const bx = x + 6 + k * 34 + Math.floor(hash(k, 4, 6) * 8);
    const bh = 30 + Math.floor(hash(k, 5, 6) * h * 0.42);
    const bw = 18 + Math.floor(hash(k, 6, 6) * 12);
    const col = cols[Math.floor(hash(k, 7, 6) * cols.length)];
    rect(g, bx, y + h - bh, bw, bh, col);
    rect(g, bx, y + h - bh, bw, 3, "#ffffff");
    rect(g, bx + bw - 4, y + h - bh, 4, bh, "rgba(0,0,0,0.18)");
    for (let wy = y + h - bh + 8; wy < y + h - 8; wy += 9) for (let wx = bx + 3; wx < bx + bw - 6; wx += 6) rect(g, wx, wy, 3, 4, night ? "#1d2a74" : "#2a3a8a");
  }
  // pink Oriental Pearl Tower
  const tx = x + Math.round(w * 0.16);
  rect(g, tx - 2, y + 10, 4, h - 20, "#ff5fa2");
  rect(g, tx - 1, y + 2, 2, 12, "#ffd1e3");
  ellipse(g, tx, y + h * 0.34, 13, 13, "#ff5fa2");
  ellipse(g, tx - 4, y + h * 0.34 - 4, 4, 4, "#ffd1e3");
  ellipse(g, tx, y + h * 0.62, 18, 18, "#ff3f8e");
  ellipse(g, tx - 6, y + h * 0.62 - 6, 5, 5, "#ffd1e3");
  pline(g, tx - 16, y + h, tx - 2, y + h * 0.62, "#ff5fa2", 3);
  pline(g, tx + 16, y + h, tx + 2, y + h * 0.62, "#ff5fa2", 3);
  // a second, smaller pink tower
  const t2 = x + Math.round(w * 0.74);
  rect(g, t2 - 1, y + 30, 3, h - 40, "#ff8fbf");
  ellipse(g, t2, y + h * 0.45, 9, 9, "#ff8fbf");
  // the little HKU gate
  const gx = x + Math.round(w * 0.5) - 34;
  const gy = y + h - 62;
  rect(g, gx, gy, 68, 54, "#f6f4ee");
  rect(g, gx - 4, gy - 6, 76, 8, "#c21a24");
  rect(g, gx + 22, gy + 26, 24, 28, night ? "#1d2a74" : "#2a3a8a");
  ellipse(g, gx + 34, gy + 26, 12, 8, night ? "#1d2a74" : "#2a3a8a");
  text(g, "HKU", gx + 34, gy + 2, 13, "#1d2a74", { align: "center" });
  text(g, "1911", gx + 34, gy + 13, 10, "#c21a24", { align: "center" });
  g.restore();
  frame(g, x - 2, y - 2, w + 4, h + 4, "#17181a", 2);
}

/** the gym windows: canal, highway, green banks and a low skyline */
export function canalView(g: Ctx, x: number, y: number, w: number, h: number): void {
  const sky = ["#8fc4ea", "#a6d2f0", "#bfe0f5", "#d8ecf8"];
  const bh = Math.round(h * 0.42);
  for (let i = 0; i < 4; i++) dither(g, x, y + Math.round((bh * i) / 4), w, Math.ceil(bh / 4), sky[i], sky[Math.min(3, i + 1)], 0.5, 2);
  // skyline
  for (let k = 0; k < Math.floor(w / 26); k++) {
    const bx = x + k * 26 + Math.floor(hash(k, 1, 12) * 8);
    const hh = 10 + Math.floor(hash(k, 2, 12) * 34);
    rect(g, bx, y + bh - hh, 16 + Math.floor(hash(k, 3, 12) * 10), hh, hash(k, 4, 12) < 0.5 ? "#9db3c6" : "#b9c8d6");
    if (hh > 24) for (let wy = y + bh - hh + 4; wy < y + bh - 3; wy += 5) rect(g, bx + 3, wy, 10, 1, "#7f97ad");
  }
  // far bank, highway, near bank, canal
  rect(g, x, y + bh, w, 10, "#5e8a48");
  for (let k = 0; k < w; k += 18) ellipse(g, x + k + 8, y + bh + 2, 10, 6, hash(k, 2, 8) < 0.5 ? "#4f9850" : "#3d7d43");
  rect(g, x, y + bh + 10, w, 10, "#7d8187");
  for (let k = 0; k < w; k += 20) rect(g, x + k, y + bh + 14, 8, 1, "#e8e8e8");
  for (let k = 0; k < 6; k++) rect(g, x + Math.floor(hash(k, 9, 2) * (w - 12)), y + bh + 11 + (k % 2) * 4, 9, 4, ["#e63946", "#f6f4ee", "#1e4fa0", "#ffd23f"][k % 4]);
  rect(g, x, y + bh + 20, w, 8, "#69b463");
  const wy = y + bh + 28;
  const water = ["#3f8f99", "#52a3ab", "#6bb7bd", "#8fd0d2"];
  rect(g, x, wy, w, h - (wy - y), water[1]);
  for (let j = 0; j < h - (wy - y); j += 4) for (let i = 0; i < w; i += 6) if (hash(x + i, j, 14) < 0.3) rect(g, x + i, wy + j, 8, 2, water[hash(i, j, 15) < 0.5 ? 0 : 3]);
  // mullions
  for (let mx = x; mx <= x + w; mx += 96) rect(g, Math.min(mx, x + w - 5), y, 5, h, "#3c3a32");
  rect(g, x, y, w, 5, "#3c3a32");
  rect(g, x, y + h - 6, w, 6, "#26221f");
  // cartoon fish decals on the glass
  for (let k = 0; k < Math.floor(w / 200); k++) {
    const fx = x + 60 + k * 200;
    const fy = y + h - 34;
    ellipse(g, fx, fy, 12, 7, "#ffb347");
    rect(g, fx + 10, fy - 6, 6, 12, "#ff7a2f");
    rect(g, fx - 6, fy - 2, 2, 2, "#17181a");
  }
}

/** courtyard seen through the lobby glass */
export function courtyardGlass(g: Ctx, x: number, y: number, w: number, h: number): void {
  rect(g, x, y, w, h, "#70929b");
  dither(g, x, y, w, h * 0.4, "#b3d2d9", "#8fb3bd", 0.5, 2);
  rect(g, x, y + h * 0.55, w, h * 0.45, "#5e7a46");
  for (let k = 0; k < w; k += 22) ellipse(g, x + k + 10, y + h * 0.55, 14, 10, hash(k, 3, 5) < 0.5 ? "#4f9850" : "#3d7d43");
  for (let k = 0; k < Math.floor(w / 150); k++) {
    const tx = x + 70 + k * 150;
    rect(g, tx, y + h * 0.3, 4, h * 0.4, "#5a4030");
    ellipse(g, tx + 2, y + h * 0.28, 24, 22, "#3d7d43");
    ellipse(g, tx - 6, y + h * 0.22, 14, 12, "#69b463");
  }
  for (let mx = x; mx <= x + w; mx += 64) rect(g, Math.min(mx, x + w - 4), y, 4, h, "#3c3a32");
  rect(g, x, y, w, 4, "#3c3a32");
  rect(g, x, y + Math.round(h * 0.42), w, 3, "#3c3a32");
  rect(g, x, y + h - 6, w, 6, "#26221f");
  for (let j = 0; j < h; j += 2) rect(g, x + 20 + Math.floor(j / 2), y + j, 12, 1, "rgba(255,255,255,0.12)");
}

// ------------------------------------------------------------------ placing

export interface Stage {
  g: Ctx;
  props: Prop[];
  solid: Uint8Array;
  cols: number;
}

/** stand a sprite with its foot line centred at (cx, footY). Tall things become y-sorted props. */
export function place(s: Stage, sprite: HTMLCanvasElement, cx: number, footY: number, asProp?: boolean): void {
  const x = Math.round(cx - sprite.width / 2);
  const y = Math.round(footY - sprite.height);
  if (asProp ?? sprite.height > 70) s.props.push({ sprite, x, y, sortY: footY - 4 });
  else s.g.drawImage(sprite, x, y);
}
