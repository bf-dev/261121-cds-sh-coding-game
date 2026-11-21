// Small pixel-art helpers shared by every map and sprite. Everything is drawn at
// native size with integer coordinates and no smoothing.

export type Ctx = CanvasRenderingContext2D;

export const FONT = `"SungSans", "CJKSC", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif`;

export function mk(w: number, h: number): [HTMLCanvasElement, Ctx] {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  return [c, ctx];
}

export function rect(ctx: Ctx, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

/** 1 px (or t px) outline rectangle */
export function frame(ctx: Ctx, x: number, y: number, w: number, h: number, color: string, t = 1): void {
  rect(ctx, x, y, w, t, color);
  rect(ctx, x, y + h - t, w, t, color);
  rect(ctx, x, y, t, h, color);
  rect(ctx, x + w - t, y, t, h, color);
}

/** deterministic random in [0,1) from integers, for stable textures */
export function hash(x: number, y: number, seed = 0): number {
  let h = (x * 374761393 + y * 668265263 + seed * 1442695041) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  h = h ^ (h >>> 16);
  return (h >>> 0) / 4294967296;
}

export function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

/** ordered 4x4 dither between two colours; amount 0..1 = share of c2 */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
export function dither(ctx: Ctx, x: number, y: number, w: number, h: number, c1: string, c2: string, amount: number, px = 2): void {
  rect(ctx, x, y, w, h, c1);
  ctx.fillStyle = c2;
  const t = amount * 16;
  for (let j = 0; j < h; j += px) {
    for (let i = 0; i < w; i += px) {
      if (BAYER[(((j / px) | 0) & 3) * 4 + (((i / px) | 0) & 3)] < t) ctx.fillRect(Math.round(x + i), Math.round(y + j), Math.min(px, w - i), Math.min(px, h - j));
    }
  }
}

/** vertical dithered gradient through a ramp of colours (top to bottom), hard pixel steps */
export function rampV(ctx: Ctx, x: number, y: number, w: number, h: number, ramp: string[], px = 2): void {
  const bands = ramp.length - 1;
  if (bands <= 0) return rect(ctx, x, y, w, h, ramp[0]);
  const bh = h / bands;
  for (let b = 0; b < bands; b++) {
    const y0 = Math.round(y + b * bh);
    const y1 = Math.round(y + (b + 1) * bh);
    const steps = 4;
    const sh = (y1 - y0) / steps;
    for (let s = 0; s < steps; s++) {
      dither(ctx, x, Math.round(y0 + s * sh), w, Math.ceil(sh), ramp[b], ramp[b + 1], (s + 0.5) / steps, px);
    }
  }
}

/** speckle noise texture: sprinkles colours from the ramp over an area */
export function speckle(ctx: Ctx, x: number, y: number, w: number, h: number, colors: string[], density: number, seed = 1, px = 2): void {
  for (let j = 0; j < h; j += px) {
    for (let i = 0; i < w; i += px) {
      const r = hash((x + i) | 0, (y + j) | 0, seed);
      if (r < density) {
        ctx.fillStyle = colors[Math.floor(hash((x + i) | 0, (y + j) | 0, seed + 7) * colors.length)];
        ctx.fillRect(Math.round(x + i), Math.round(y + j), px, px);
      }
    }
  }
}

/** hard-edged pixel ellipse (no anti-aliasing) */
export function ellipse(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, color: string): void {
  ctx.fillStyle = color;
  for (let j = -ry; j <= ry; j++) {
    const half = Math.round(rx * Math.sqrt(Math.max(0, 1 - (j * j) / (ry * ry || 1))));
    ctx.fillRect(Math.round(cx - half), Math.round(cy + j), half * 2, 1);
  }
}

/** soft cast shadow: a dithered dark ellipse on the ground */
export function shadow(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, alpha = 0.28): void {
  ctx.fillStyle = `rgba(20,24,40,${alpha})`;
  for (let j = -ry; j <= ry; j++) {
    const half = Math.round(rx * Math.sqrt(Math.max(0, 1 - (j * j) / (ry * ry || 1))));
    ctx.fillRect(Math.round(cx - half), Math.round(cy + j), half * 2, 1);
  }
}

/** crisp text. size in px. align: left | center | right */
export function text(ctx: Ctx, s: string, x: number, y: number, size: number, color: string, opts: { bold?: boolean; align?: CanvasTextAlign; baseline?: CanvasTextBaseline; maxWidth?: number } = {}): void {
  ctx.font = `${opts.bold === false ? 400 : 700} ${size}px ${FONT}`;
  ctx.textAlign = opts.align ?? "left";
  ctx.textBaseline = opts.baseline ?? "top";
  ctx.fillStyle = color;
  if (opts.maxWidth) ctx.fillText(s, Math.round(x), Math.round(y), opts.maxWidth);
  else ctx.fillText(s, Math.round(x), Math.round(y));
}

export function textWidth(ctx: Ctx, s: string, size: number, bold = true): number {
  ctx.font = `${bold ? 700 : 400} ${size}px ${FONT}`;
  return ctx.measureText(s).width;
}

/** the cream bilingual label panel from the reference style: dark border, English over Chinese */
export function labelPanel(en: string, zh: string, size = 18): HTMLCanvasElement {
  const [probe, pctx] = mk(4, 4);
  void probe;
  const w = Math.ceil(Math.max(textWidth(pctx, en, size), zh ? textWidth(pctx, zh, size - 3) : 0)) + 24;
  const h = zh ? size * 2 + 16 : size + 16;
  const [c, ctx] = mk(w + 4, h + 4);
  rect(ctx, 4, 4, w, h, "rgba(30,26,40,0.35)");
  rect(ctx, 0, 0, w, h, "#2a2433");
  rect(ctx, 3, 3, w - 6, h - 6, "#fbf3df");
  rect(ctx, 3, h - 6, w - 6, 3, "#e6d8b8");
  text(ctx, en, w / 2, 7, size, "#2a2433", { align: "center" });
  if (zh) text(ctx, zh, w / 2, 9 + size, size - 3, "#6b5d6e", { align: "center" });
  return c;
}

/** lighten (amt > 0) or darken (amt < 0) a #rrggbb colour, amt in -1..1 */
export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  if (amt >= 0) {
    r += (255 - r) * amt;
    g += (255 - g) * amt;
    b += (255 - b) * amt;
  } else {
    r *= 1 + amt;
    g *= 1 + amt;
    b *= 1 + amt;
  }
  return `#${((1 << 24) | (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)).toString(16).slice(1)}`;
}

/** n-step ramp from dark to light around a base colour */
export function rampOf(base: string, n = 8, spread = 0.45): string[] {
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(shade(base, -spread + (2 * spread * i) / (n - 1)));
  return out;
}

/** mark a tile rectangle solid (or free) in a collision grid */
export function block(solid: Uint8Array, cols: number, tx: number, ty: number, w = 1, h = 1, v = 1): void {
  const rows = solid.length / cols;
  for (let j = ty; j < ty + h; j++) for (let i = tx; i < tx + w; i++) if (i >= 0 && j >= 0 && i < cols && j < rows) solid[j * cols + i] = v;
}
