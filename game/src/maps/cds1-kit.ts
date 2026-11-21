// Builder and floor textures shared by every CDS-1 floor (see buildings/cds1/README.md).
import { TILE, type Dir, type GameMap, type MapLabel, type NpcDef, type Prop, type Trigger } from "../engine/types";
import { mk, rect, hash, shade, type Ctx } from "../art/px";
import { professor } from "../data/professors";

export const T = TILE;
/** the back wall is drawn this many tiles tall */
export const WALL_H = 3;
export const WALL_PX = WALL_H * T;
/** interior walls are drawn lower than the back wall so the rooms behind them stay readable */
export const FACE = 112;

export class Floor {
  ground: HTMLCanvasElement;
  g: Ctx;
  solid: Uint8Array;
  props: Prop[] = [];
  npcs: NpcDef[] = [];
  triggers: Trigger[] = [];
  spawns: Record<string, { tx: number; ty: number; dir: Dir }> = {};
  labels: MapLabel[] = [];

  constructor(public cols: number, public rows: number) {
    [this.ground, this.g] = mk(cols * T, rows * T);
    this.solid = new Uint8Array(cols * rows);
    this.block(0, 0, cols, WALL_H);
    this.block(0, 0, 1, rows);
    this.block(cols - 1, 0, 1, rows);
    this.block(0, rows - 1, cols, 1);
  }

  block(tx: number, ty: number, w = 1, h = 1, v = 1): void {
    for (let j = ty; j < ty + h; j++)
      for (let i = tx; i < tx + w; i++) if (i >= 0 && j >= 0 && i < this.cols && j < this.rows) this.solid[j * this.cols + i] = v;
  }

  /**
   * Stand a sprite on the floor: its bottom edge sits on the bottom of tile row `ty`, its left edge at tile `tx`.
   * `sw` x `sh` tiles (counted up from row ty) become solid. dx / dy nudge the sprite in px.
   */
  put(sprite: HTMLCanvasElement, tx: number, ty: number, sw = 0, sh = 1, dx = 0, dy = 0, fade = false): void {
    const y = (ty + 1) * T - sprite.height + dy;
    this.props.push({ sprite, x: Math.round(tx * T + dx), y: Math.round(y), sortY: (ty + 1) * T + dy - 2, fade });
    if (sw > 0) this.block(Math.floor(tx), ty - sh + 1, sw, sh);
  }

  /**
   * A solid interior block (lift and service core, a room seen from outside), w x h tiles, h >= 2:
   * its roof seen from above and, on its southern FACE px, its south wall. Like the back wall, it is
   * drawn inside its own tiles, so nothing walkable is hidden behind it. `paint` decorates the face,
   * `round` rounds the corners like the timber-clad cores on the upper floors.
   */
  mass(tx: number, ty: number, w: number, h: number, finish: "timber" | "white" | "glass" = "timber", paint?: (g: Ctx, W: number, top: number) => void, round = false): void {
    const W = w * T;
    const capH = h * T - FACE;
    const [c, g] = mk(W, h * T);
    const base = finish === "timber" ? "#C9A879" : finish === "glass" ? "#aab4b8" : "#EFEDE6";
    if (finish === "glass") {
      // a glass wall: only its top rail from above, and a see-through pane
      rect(g, 0, capH - 10, W, 10, "#3a3d42");
      rect(g, 0, capH - 10, W, 3, "#8d9092");
      rect(g, 0, capH, W, FACE, "rgba(170,188,196,0.5)");
      rect(g, 0, capH, W, 30, "rgba(215,228,232,0.35)");
      for (let i = 0; i < W; i += 64) rect(g, i, capH, 2, FACE, "#5a6064");
      rect(g, W - 2, capH, 2, FACE, "#5a6064");
      for (let j = 0; j < 3; j++) for (let i = 6; i < W - 6; i += 5) rect(g, i, capH + FACE - 26 + j * 6, 3, 2, "rgba(255,255,255,0.7)");
      rect(g, 0, capH + FACE - 6, W, 6, "#5a6064");
    } else {
      rect(g, 0, 0, W, capH, "#3a3a3e");
      rect(g, 3, 3, W - 6, capH - 3, "#d9d5cc");
      rect(g, 3, 3, W - 6, 4, "#f3f1ec");
      if (capH > 80) {
        rect(g, 16, 18, W - 32, capH - 30, "#cdc9bf");
        rect(g, 16, 18, W - 32, 2, "#b9b5ac");
        for (let x = 16 + 96; x < W - 32; x += 96) rect(g, x, 18, 1, capH - 30, "#bdb9ae");
      }
      rect(g, 0, capH, W, FACE, base);
      if (finish === "timber") {
        for (let i = 0; i < W; i += 32) {
          const t = shade(base, (hash(tx * 64 + i, ty, 51) - 0.5) * 0.12);
          rect(g, i, capH, Math.min(32, W - i), FACE, t);
          rect(g, i, capH, 1, FACE, shade(base, -0.2));
        }
      }
      rect(g, 0, capH, W, 3, "#8d8a82");
      rect(g, 0, capH + FACE - 6, W, 6, shade(base, -0.3));
    }
    if (round) {
      // curved ends: the face darkens toward both edges, the roof corners are cut
      for (let k = 0; k < 28; k += 4) {
        const a = 0.22 * (1 - k / 28);
        rect(g, k, capH, 4, FACE, `rgba(60,40,20,${a})`);
        rect(g, W - k - 4, capH, 4, FACE, `rgba(60,40,20,${a})`);
      }
      const R = 26;
      for (let j = 0; j < R; j++) {
        const cut = Math.round(R - Math.sqrt(R * R - (R - j) * (R - j)));
        g.clearRect(0, j, cut, 1);
        g.clearRect(W - cut, j, cut, 1);
        g.clearRect(0, h * T - 1 - j, Math.round(cut / 2), 1);
        g.clearRect(W - Math.round(cut / 2), h * T - 1 - j, Math.round(cut / 2), 1);
      }
    }
    paint?.(g, W, capH);
    this.props.push({ sprite: c, x: tx * T, y: ty * T, sortY: (ty + h) * T - 2 });
    this.block(tx, ty, w, h);
    ao(this.g, tx * T, (ty + h) * T, W, 12);
  }

  /** a thin wall running north to south in tile column tx, rows ty0 to ty1, seen from above */
  vwall(tx: number, ty0: number, ty1: number): void {
    const g = this.g;
    const x = tx * T;
    const y = ty0 * T;
    const h = (ty1 - ty0 + 1) * T;
    rect(g, x, y, T, h, "#3a3a3e");
    rect(g, x + 12, y, T - 24, h - 4, "#d9d5cc");
    rect(g, x + 12, y, 4, h - 4, "#f3f1ec");
    for (let j = y + 64; j < y + h; j += 128) rect(g, x + 12, j, T - 24, 2, "#b9b5ac");
    this.block(tx, ty0, 1, ty1 - ty0 + 1);
  }

  info(id: string, tx: number, ty: number, w: number, h: number, title: string, titleZh: string, textStr: string): void {
    this.triggers.push({ id, tx, ty, w, h, en: title, zh: titleZh, action: { type: "info", title, titleZh, text: textStr } });
  }

  /** lift doors start at tile tx on the back wall and are w tiles wide in total */
  lift(tx: number, w: number): void {
    this.triggers.push({ id: "lift", tx, ty: WALL_H - 1, w, h: 2, en: "Lift", zh: "电梯", action: { type: "lift" } });
    this.spawns.lift = { tx: tx + Math.floor(w / 2), ty: WALL_H + 1, dir: "down" };
  }

  prof(floor: number, tx: number, ty: number): void {
    const p = professor(floor);
    this.npcs.push({ id: `prof${floor}`, char: `prof${floor}`, tx, ty, dir: "down", name: p.name, nameZh: p.nameZh, action: { type: "battle", floor } });
    this.block(tx, ty, 1, 1, 0);
  }

  /** the floor's lab: where the new block is collected once the professor is beaten */
  lab(tx: number, ty: number, w: number, h: number, labelY = ty + 0.7): void {
    this.triggers.push({ id: "lab", tx, ty, w, h, en: "Lab: the guide's question", zh: "实验室：向导的小问题", action: { type: "lab" } });
    this.label(tx + w / 2, labelY, "Lab", "实验室");
  }

  npc(id: string, char: string, tx: number, ty: number, dir: Dir, name: string, nameZh: string): void {
    this.npcs.push({ id, char, tx, ty, dir, name, nameZh });
  }

  label(tx: number, ty: number, en: string, zh: string): void {
    this.labels.push({ x: tx * T, y: ty * T, en, zh });
  }

  finish(id: string, name: string, nameZh: string): GameMap {
    drawEdges(this);
    return { id, name, nameZh, cols: this.cols, rows: this.rows, ground: this.ground, solid: this.solid, props: this.props, npcs: this.npcs, triggers: this.triggers, spawns: this.spawns, labels: this.labels };
  }
}

/** side walls and the south wall, seen from above as a pale cap with a dark inner line */
function drawEdges(f: Floor): void {
  const g = f.g;
  const W = f.cols * T;
  const H = f.rows * T;
  const cap = "#d9d5cc";
  const side = (x: number, inner: number): void => {
    rect(g, x, WALL_PX, T, H - WALL_PX, "#3a3a3e");
    rect(g, x + (inner > 0 ? 0 : 20), WALL_PX, T - 20, H - WALL_PX, cap);
    rect(g, x + (inner > 0 ? T - 24 : 20), WALL_PX, 4, H - WALL_PX, "#f3f1ec");
    for (let y = WALL_PX; y < H; y += 128) rect(g, x + (inner > 0 ? 0 : 20), y, T - 20, 2, "#b9b5ac");
  };
  side(0, 1);
  side(W - T, -1);
  // south wall cap; door tiles (non-solid tiles in the last row) stay open
  for (let tx = 0; tx < f.cols; tx++) {
    if (!f.solid[(f.rows - 1) * f.cols + tx]) continue;
    const x = tx * T;
    rect(g, x, H - T, T, T, "#3a3a3e");
    rect(g, x, H - T + 20, T, T - 20, cap);
    rect(g, x, H - T + 20, T, 4, "#f3f1ec");
    if (tx % 2 === 0) rect(g, x, H - T + 24, 2, T - 24, "#b9b5ac");
  }
}

// ---------- floor textures (px rectangles) ----------

const tiles = new Map<string, HTMLCanvasElement>();
/** 256 px repeating speckle tile, built once per colour set */
function noiseFill(g: Ctx, x: number, y: number, w: number, h: number, base: string | null, a: string, b: string, pa: number, pb: number, seed: number): void {
  const key = `${base}|${a}|${b}|${pa}|${pb}|${seed}`;
  let t = tiles.get(key);
  if (!t) {
    const [c, tg] = mk(256, 256);
    if (base) rect(tg, 0, 0, 256, 256, base);
    for (let j = 0; j < 256; j += 2)
      for (let i = 0; i < 256; i += 2) {
        const r = hash(i, j, seed);
        if (r < pa) rect(tg, i, j, 2, 2, a);
        else if (r > 1 - pb) rect(tg, i, j, 2, 2, b);
      }
    tiles.set(key, (t = c));
  }
  g.fillStyle = g.createPattern(t, "repeat")!;
  g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

/** polished cream stone: big slabs, grey veining, soft reflections */
export function stoneFloor(g: Ctx, x: number, y: number, w: number, h: number, base = "#E8E1CE"): void {
  const hi = shade(base, 0.35);
  const lo = shade(base, -0.07);
  const vein = shade(base, -0.16);
  noiseFill(g, x, y, w, h, base, lo, hi, 0.05, 0.03, 3);
  for (let sy = Math.floor(y / 128) * 128; sy < y + h; sy += 128)
    for (let sx = Math.floor(x / 128) * 128; sx < x + w; sx += 128) {
      // one wandering vein per slab
      let vx = sx + hash(sx, sy, 5) * 100;
      let vy = sy + 8;
      for (let k = 0; k < 26; k++) {
        if (vx >= x && vx < x + w - 2 && vy >= y && vy < y + h - 2) rect(g, vx, vy, 2, 2, vein);
        vx += hash(sx + k, sy, 6) < 0.5 ? 4 : -2;
        vy += 4;
      }
      // reflection streak
      const rx = sx + 30 + hash(sx, sy, 8) * 50;
      for (let k = 0; k < 5; k++) {
        const yy = sy + 30 + k * 12;
        if (rx >= x && rx + 24 <= x + w && yy >= y && yy < y + h) rect(g, rx - k * 4, yy, 24, 2, hi);
      }
    }
  const joint = shade(base, -0.2);
  for (let sx = Math.ceil(x / 128) * 128; sx < x + w; sx += 128) rect(g, sx, y, 2, h, joint);
  for (let sy = Math.ceil(y / 128) * 128; sy < y + h; sy += 128) rect(g, x, sy, w, 2, joint);
}

/** timber planks running left to right, staggered joints, grain */
export function timberFloor(g: Ctx, x: number, y: number, w: number, h: number, base = "#B08A62"): void {
  const tones = [shade(base, -0.07), shade(base, -0.03), base, base, shade(base, 0.04), shade(base, 0.08)];
  const dark = shade(base, -0.2);
  for (let j = 0; j < h; j += 16) {
    const row = Math.floor((y + j) / 16);
    let i = -Math.floor(hash(row, 1, 2) * 120);
    while (i < w) {
      const len = 96 + Math.floor(hash(row, i, 4) * 5) * 32;
      const x0 = Math.max(0, i);
      const x1 = Math.min(w, i + len);
      const tone = tones[Math.floor(hash(row, i, 9) * tones.length)];
      const hh = Math.min(16, h - j);
      rect(g, x + x0, y + j, x1 - x0, hh, tone);
      for (let k = x0; k < x1 - 12; k += 6) {
        const r = hash(row, k, 11);
        if (r < 0.3) rect(g, x + k, y + j + 3 + Math.floor(r * 30), 10 + Math.floor(r * 40) > x1 - k ? x1 - k : 10 + Math.floor(r * 40), 1, shade(tone, -0.1));
      }
      rect(g, x + x0, y + j + hh - 1, x1 - x0, 1, dark);
      if (i + len < w) rect(g, x + x1 - 1, y + j, 1, hh, dark);
      i += len;
    }
  }
}

/** the blue geometric carpet of every student space: interlocking pale shapes on navy */
export function carpet(g: Ctx, x: number, y: number, w: number, h: number, navy = "#3E4A63", pale = "#9FAFBE"): void {
  rect(g, x, y, w, h, navy);
  pale = mixHex(pale, navy, 0.22);
  const mid = shade(navy, 0.22);
  const deep = shade(navy, -0.18);
  for (let j = 0; j < h; j += 16)
    for (let i = 0; i < w; i += 16) {
      const cx = Math.floor((x + i) / 16);
      const cy = Math.floor((y + j) / 16);
      const big = hash(cx >> 1, cy >> 1, 21);
      const small = hash(cx, cy, 22);
      const dir = hash(cx >> 2, cy >> 2, 23);
      const ww = Math.min(16, w - i);
      const hh = Math.min(16, h - j);
      let c: string | null = null;
      if (big < 0.26 && small < 0.8) c = pale;
      else if (big > 0.86 && small < 0.7) c = mid;
      else if (big > 0.6 && big < 0.68) c = deep;
      else if (small < 0.07) c = pale;
      if (!c) continue;
      if (small > 0.6 && ww === 16 && hh === 16) {
        // stepped half cell, gives the zigzag edges
        if (dir < 0.5) rect(g, x + i, y + j, 8, 16, c);
        else rect(g, x + i, y + j + 8, 16, 8, c);
      } else rect(g, x + i, y + j, ww, hh, c);
    }
  noiseFill(g, x, y, w, h, null, "rgba(20,24,40,0.18)", "rgba(255,255,255,0.06)", 0.06, 0.04, 24);
}

/** grey vinyl / stone of the service corridors */
export function vinyl(g: Ctx, x: number, y: number, w: number, h: number, base = "#8E8D88"): void {
  noiseFill(g, x, y, w, h, base, shade(base, 0.08), shade(base, -0.08), 0.1, 0.1, 31);
  for (let sx = Math.ceil(x / 128) * 128; sx < x + w; sx += 128) rect(g, sx, y, 1, h, shade(base, -0.16));
  for (let sy = Math.ceil(y / 128) * 128; sy < y + h; sy += 128) rect(g, x, sy, w, 1, shade(base, -0.16));
}

/** the cafe floor: white tiles with red diamond tiles scattered in arcs around (cx, cy) */
export function cafeFloor(g: Ctx, x: number, y: number, w: number, h: number, cx: number, cy: number): void {
  stoneFloor(g, x, y, w, h, "#F0EEE8");
  for (let ring = 1; ring < 9; ring++) {
    const r = ring * 56;
    const n = Math.floor((2 * Math.PI * r) / 60);
    for (let k = 0; k < n; k++) {
      if (hash(ring, k, 41) < 0.35) continue;
      const a = (k / n) * Math.PI * 2 + ring * 0.3;
      const px = Math.round(cx + Math.cos(a) * r);
      const py = Math.round(cy + Math.sin(a) * r * 0.62);
      if (px < x + 10 || py < y + 10 || px > x + w - 10 || py > y + h - 10) continue;
      for (let d = 0; d < 7; d++) {
        const half = d < 4 ? d * 3 + 2 : (6 - d) * 3 + 2;
        rect(g, px - half, py - 7 + d * 2, half * 2, 2, d < 3 ? "#B8433A" : "#A8332B");
      }
    }
  }
}

/** soft dithered shadow strip on the floor under a wall or a big object */
export function ao(g: Ctx, x: number, y: number, w: number, h = 12): void {
  rect(g, x, y, w, Math.ceil(h / 3), "rgba(20,22,34,0.22)");
  for (let j = Math.ceil(h / 3); j < h; j += 2)
    for (let i = (j >> 1) & 1 ? 0 : 2; i < w; i += 4) rect(g, x + i, y + j, 2, 2, "rgba(20,22,34,0.2)");
}

function mixHex(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (sh: number): number => Math.round(((pa >> sh) & 255) * (1 - t) + ((pb >> sh) & 255) * t);
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`;
}

/** daylight falling through a window band onto the floor: slanted pale bars, dithered at the far end */
export function sunPatch(g: Ctx, x: number, w: number, len = 150, y = WALL_PX + 4): void {
  for (let bx = x + 8; bx < x + w - 40; bx += 64) {
    for (let j = 0; j < len; j += 2) {
      const fadeOut = j / len;
      for (let i = 0; i < 46; i += 2) {
        if (fadeOut > 0.45 && hash(bx + i, j, 77) < (fadeOut - 0.45) * 1.9) continue;
        rect(g, bx + i + Math.floor(j * 0.35), y + j, 2, 2, "rgba(255,250,225,0.2)");
      }
    }
  }
}

/** flat rug with a border, under a seating group */
export function rug(g: Ctx, x: number, y: number, w: number, h: number, color: string): void {
  rect(g, x + 4, y + 6, w, h, "rgba(20,22,34,0.16)");
  rect(g, x, y, w, h, shade(color, -0.18));
  rect(g, x + 4, y + 4, w - 8, h - 8, color);
  for (let j = 8; j < h - 8; j += 4) for (let i = 8 + ((j >> 2) & 1) * 4; i < w - 8; i += 8) rect(g, x + i, y + j, 2, 2, shade(color, hash(i, j, 79) < 0.5 ? 0.12 : -0.1));
  rect(g, x + 10, y + 10, w - 20, 2, shade(color, 0.2));
  rect(g, x + 10, y + h - 12, w - 20, 2, shade(color, 0.2));
}
