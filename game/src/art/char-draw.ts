// Drawing primitives for the character sprites: hard pixels only, shaded boxes,
// slanted limbs, superellipse heads, and an automatic dark outline pass.

import { mk, shade, type Ctx } from "./px";

export const OUTLINE = "#231b2c";

export function mix(a: string, b: string, t: number): string {
  const x = parseInt(a.slice(1), 16);
  const y = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((x >> s) & 255) * (1 - t) + ((y >> s) & 255) * t);
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`;
}

/** five tones of one material: shadows lean violet, lights lean warm */
export interface Tones {
  d2: string;
  d1: string;
  b: string;
  l1: string;
  l2: string;
}

export function tones(base: string): Tones {
  return {
    d2: mix(shade(base, -0.46), "#1d1440", 0.22),
    d1: mix(shade(base, -0.22), "#2b2060", 0.1),
    b: base,
    l1: mix(shade(base, 0.17), "#fff3c8", 0.1),
    l2: mix(shade(base, 0.36), "#fff3c8", 0.16),
  };
}

export function px(g: Ctx, x: number, y: number, w: number, h: number, color: string): void {
  if (w <= 0 || h <= 0) return;
  g.fillStyle = color;
  g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function cornerInset(j: number, h: number, rt: number, rb: number): number {
  if (j < rt) return Math.ceil(rt - Math.sqrt(Math.max(0, rt * rt - (rt - j - 0.5) ** 2)) - 0.25);
  const k = h - 1 - j;
  if (k < rb) return Math.ceil(rb - Math.sqrt(Math.max(0, rb * rb - (rb - k - 0.5) ** 2)) - 0.25);
  return 0;
}

/** flat rounded box, rt/rb = corner radius at the top / bottom */
export function rbox(g: Ctx, x: number, y: number, w: number, h: number, color: string, rt = 0, rb = rt): void {
  x = Math.round(x);
  y = Math.round(y);
  w = Math.round(w);
  h = Math.round(h);
  g.fillStyle = color;
  for (let j = 0; j < h; j++) {
    const i = cornerInset(j, h, rt, rb);
    if (w - 2 * i > 0) g.fillRect(x + i, y + j, w - 2 * i, 1);
  }
}

/** rounded box shaded with a lit left edge, shaded right edge and shaded foot */
export function sbox(g: Ctx, x: number, y: number, w: number, h: number, t: Tones, rt = 0, rb = rt, edge = 2): void {
  x = Math.round(x);
  y = Math.round(y);
  w = Math.round(w);
  h = Math.round(h);
  if (w <= 0 || h <= 0) return;
  for (let j = 0; j < h; j++) {
    const i = cornerInset(j, h, rt, rb);
    const sw = w - 2 * i;
    if (sw <= 0) continue;
    g.fillStyle = j >= h - edge && h > 6 ? t.d1 : t.b;
    g.fillRect(x + i, y + j, sw, 1);
    if (sw > edge * 3) {
      g.fillStyle = t.l1;
      g.fillRect(x + i, y + j, edge, 1);
      g.fillStyle = t.d1;
      g.fillRect(x + i + sw - edge, y + j, edge, 1);
    }
  }
}

/** a limb of width w running from (x0,y0) to (x1,y1), x = left edge */
export function limb(g: Ctx, x0: number, y0: number, x1: number, y1: number, w: number, t: Tones): void {
  const n = Math.max(1, Math.round(y1 - y0));
  for (let j = 0; j < n; j++) {
    const x = Math.round(x0 + ((x1 - x0) * j) / n);
    const y = Math.round(y0) + j;
    g.fillStyle = t.b;
    g.fillRect(x, y, w, 1);
    g.fillStyle = t.l1;
    g.fillRect(x, y, 2, 1);
    g.fillStyle = t.d1;
    g.fillRect(x + w - 2, y, 2, 1);
  }
}

/** hard-edged ellipse, optionally clipped to rows yMin..yMax */
export function ell(g: Ctx, cx: number, cy: number, rx: number, ry: number, color: string, yMin = -1e9, yMax = 1e9): void {
  sell(g, cx, cy, rx, ry, color, 2, yMin, yMax);
}

/** superellipse (n > 2 = squarer); the cute head shape */
export function sell(g: Ctx, cx: number, cy: number, rx: number, ry: number, color: string, n = 2.6, yMin = -1e9, yMax = 1e9): void {
  g.fillStyle = color;
  cx = Math.round(cx);
  cy = Math.round(cy);
  for (let j = -ry; j <= ry; j++) {
    const y = cy + j;
    if (y < yMin || y > yMax) continue;
    const half = Math.round(rx * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(j) / (ry + 0.5), n)), 1 / n));
    if (half > 0) g.fillRect(cx - half, y, half * 2, 1);
  }
}

/** top y of a superellipse at column offset dx (for hair caps drawn column by column) */
export function sellTop(cy: number, rx: number, ry: number, dx: number, n = 2.6): number {
  const a = Math.abs(dx) / (rx + 0.5);
  if (a >= 1) return cy;
  return Math.round(cy - ry * Math.pow(1 - Math.pow(a, n), 1 / n));
}

/** scanline polygon fill without anti-aliasing */
export function poly(g: Ctx, pts: Array<[number, number]>, color: string): void {
  g.fillStyle = color;
  let y0 = Infinity,
    y1 = -Infinity;
  for (const p of pts) {
    y0 = Math.min(y0, p[1]);
    y1 = Math.max(y1, p[1]);
  }
  for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
    const yc = y + 0.5;
    const xs: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      if (a[1] <= yc !== b[1] <= yc) xs.push(a[0] + ((yc - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
    }
    xs.sort((p, q) => p - q);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const xa = Math.round(xs[i]);
      const xb = Math.round(xs[i + 1]);
      if (xb > xa) g.fillRect(xa, y, xb - xa, 1);
    }
  }
}

/** thick pixel line */
export function line(g: Ctx, x0: number, y0: number, x1: number, y1: number, color: string, t = 1): void {
  g.fillStyle = color;
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= n; i++) g.fillRect(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), t, t);
}

/** paint a dark 1 px outline around everything already drawn */
export function outline(c: HTMLCanvasElement, color = OUTLINE): void {
  const g = c.getContext("2d")!;
  const w = c.width,
    h = c.height;
  const d = g.getImageData(0, 0, w, h).data;
  const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 40;
  g.fillStyle = color;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (solid(x, y)) continue;
      if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) g.fillRect(x, y, 1, 1);
    }
}

export function flipH(c: HTMLCanvasElement): HTMLCanvasElement {
  const [o, g] = mk(c.width, c.height);
  g.translate(c.width, 0);
  g.scale(-1, 1);
  g.drawImage(c, 0, 0);
  return o;
}

export function scaleUp(c: HTMLCanvasElement, k: number): HTMLCanvasElement {
  const [o, g] = mk(c.width * k, c.height * k);
  g.imageSmoothingEnabled = false;
  g.drawImage(c, 0, 0, c.width * k, c.height * k);
  return o;
}
