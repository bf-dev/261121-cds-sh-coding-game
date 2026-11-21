import { TILE } from "../engine/types";
import { mk, rect, hash, speckle, text, type Ctx } from "../art/px";
import { COLS, ROWS, L } from "./outside-layout";

const T = TILE;
const PAVE = ["#d3d6db", "#cacdd4", "#c1c5cc", "#b8bcc5", "#aeb3bd", "#a2a7b2", "#9499a5", "#868b97", "#787d89"];
const TURF = ["#a6d268", "#9bc95f", "#8fbf55", "#84b34f", "#7aa54a", "#6f9440", "#628536", "#54702f"];
const KERB = ["#eeeeea", "#e6e6e2", "#d9dad7", "#cfd0ce", "#bcbdb9", "#a9aaa4"];
const ASPH = ["#555856", "#4a4d4b", "#424543", "#3a3d3b", "#303331", "#262827"];
const HEDGE = ["#7c9c52", "#6c8c47", "#5f7f3e", "#55753a", "#4c6b34", "#3f5a2a", "#33481f", "#283a18"];
const YEL = ["#f5d75a", "#f0c93c", "#e8c53a", "#c9a12a"];

function dark(g: Ctx, x: number, y: number, w: number, h: number, a = 0.18): void {
  g.fillStyle = `rgba(22,26,44,${a})`;
  g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function paving(g: Ctx, x0: number, y0: number, w: number, h: number): void {
  for (let y = y0; y < y0 + h; y += 32) {
    const row = (y / 32) | 0;
    const band = row % 5 === 2; // darker band course
    const big = row % 10 >= 8; // large square slabs
    const sw = band ? 48 : big ? 128 : 64;
    const off = (row * 37) % sw;
    for (let x = x0 - off; x < x0 + w; x += sw) {
      const r = hash(x, y, 3);
      const c = band ? PAVE[5 + ((r * 4) | 0)] : PAVE[(r * r * 5) | 0];
      const xx = Math.max(x, x0);
      const ww = Math.min(x + sw, x0 + w) - xx;
      if (ww <= 0) continue;
      rect(g, xx, y, ww, 32, c);
      rect(g, xx, y, ww, 1, "#dfe1e5");
      rect(g, xx, y + 31, ww, 1, "#8f939a");
      if (x >= x0) rect(g, x, y, 1, 32, "#8f939a");
    }
  }
  speckle(g, x0, y0, w, h, ["#e2e4e8", "#9da2ad", "#8a8f9b", "#eceef0", "#a9aeb8"], 0.06, 5, 2);
}

function inset(j: number, h: number, r: number): number {
  const d = j < r ? r - j : j > h - r ? j - (h - r) : 0;
  return d > 0 ? Math.round(r - Math.sqrt(Math.max(0, r * r - d * d))) : 0;
}

/** turf with mowing stripes, blades and a rounded granite kerb */
export function lawn(g: Ctx, x: number, y: number, w: number, h: number, r = 44): void {
  for (let j = 0; j < h; j += 2) {
    const i = inset(j, h, r);
    rect(g, x + i, y + j, w - 2 * i, 2, j > h - 8 ? KERB[4] : j < 4 ? KERB[0] : KERB[2]);
  }
  const k = 12;
  for (let j = k; j < h - k; j += 2) {
    const i = k + inset(j - k, h - 2 * k, r - k);
    const xs = x + i;
    const xe = x + w - i;
    rect(g, xs - 2, y + j, 2, 2, KERB[5]);
    rect(g, xe, y + j, 2, 2, KERB[0]);
    for (let sx = Math.floor(xs / 64) * 64; sx < xe; sx += 64) {
      const a = Math.max(sx, xs);
      const b = Math.min(sx + 64, xe);
      const stripe = (sx / 64) & 1;
      rect(g, a, y + j, b - a, 2, j < k + 6 ? TURF[5] : stripe ? TURF[2] : TURF[3]);
      for (let px = a; px < b; px += 2) {
        const rr = hash(px, y + j, 11);
        if (rr < 0.22) {
          g.fillStyle = TURF[rr < 0.05 ? 0 : rr < 0.11 ? 1 : rr < 0.17 ? 4 : 5];
          g.fillRect(px, y + j, 2, rr < 0.03 ? 4 : 2);
        }
      }
    }
  }
}

/** clipped hedge bed seen from the 3/4 view: bumpy lit top, dark south face */
export function hedge(g: Ctx, x: number, y: number, w: number, h: number): void {
  dark(g, x - 4, y + h - 4, w + 6, 8, 0.2);
  rect(g, x, y, w, h, HEDGE[4]);
  rect(g, x, y + h - 14, w, 14, HEDGE[6]);
  rect(g, x, y + h - 4, w, 4, HEDGE[7]);
  rect(g, x, y, w, 3, HEDGE[1]);
  for (let j = 0; j < h - 14; j += 2)
    for (let i = 0; i < w; i += 2) {
      const r = hash(x + i, y + j, 21);
      if (r < 0.3) {
        g.fillStyle = HEDGE[r < 0.05 ? 0 : r < 0.12 ? 1 : r < 0.2 ? 2 : 5];
        g.fillRect(x + i, y + j, 2, 2);
      }
    }
  for (let i = 0; i < w; i += 2) if (hash(x + i, y, 22) < 0.3) rect(g, x + i, y + h - 12 + ((hash(i, y, 5) * 6) | 0), 2, 2, HEDGE[4]);
}

function asphalt(g: Ctx, x: number, y: number, w: number, h: number): void {
  rect(g, x, y, w, h, ASPH[3]);
  speckle(g, x, y, w, h, [ASPH[0], ASPH[1], ASPH[2], ASPH[4], ASPH[5], "#6a6d6b"], 0.3, 9, 2);
}

function line(g: Ctx, pts: [number, number][], color: string, w = 5): void {
  g.fillStyle = color;
  for (let i = 0; i + 1 < pts.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * T;
    for (let s = 0; s <= n; s += 2) g.fillRect(Math.round((x0 + ((x1 - x0) * s) / n) * T), Math.round((y0 + ((y1 - y0) * s) / n) * T), w, w);
  }
}

function court(g: Ctx): void {
  const c = L.court;
  const cx = c.cx * T, cy = c.cy * T, rx = c.rx * T, ry = c.ry * T, WH = c.wall;
  const fcy = cy + WH / 2, fry = ry - WH / 2;
  const FLOOR = ["#ddd8c6", "#d3cebb", "#cbc6b2", "#c2bda9"];
  for (let y = Math.floor(cy - ry * 1.32); y < cy + ry * 1.3; y += 2)
    for (let x = Math.floor(cx - rx * 1.26); x < cx + rx * 1.26; x += 2) {
      const dx = (x - cx) / rx, dy = (y - cy) / ry;
      const r = Math.hypot(dx, dy);
      if (r > 1.26) continue;
      const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
      let col: string | null = null;
      if (r > 1) {
        if (r < 1.035) col = KERB[1];
        else if (r < 1.055) col = KERB[4];
        else if (ang < -8 && ang > -172 && r < 1.22) {
          const h = hash(x, y, 31);
          col = r > 1.2 ? HEDGE[7] : h < 0.08 ? HEDGE[0] : h < 0.2 ? HEDGE[2] : h < 0.32 ? HEDGE[6] : HEDGE[4];
        }
      } else if (r > 0.965) col = (x >> 1) % 20 === 0 ? "#b6bcc0" : dy < 0 ? "#a9c4c0" : "#8fa9a4"; // glass rail on the rim
      else {
        const r2 = Math.hypot(dx, (y - WH - cy) / ry);
        if (r2 > 1) {
          const wy = y - (cy - ry * Math.sqrt(Math.max(0, 1 - dx * dx)));
          if (wy < 6) col = "#f0f0ea";
          else if (wy < WH * 0.52) col = x % 56 < 2 ? "#b9b9ae" : wy < 12 ? "#e2e2d8" : dx > 0.3 ? "#d0d0c5" : "#d9d9cf";
          else if (wy > WH - 4) col = "#3d4144";
          else if (((x / 80) | 0) % 3 === 1) col = x % 40 < 2 ? "#4b5a5c" : wy % 20 < 2 ? "#5b7273" : hash(x >> 3, wy >> 3, 4) < 0.3 ? "#9db8b3" : "#7f9c99";
          else col = wy % 6 < 2 ? "#8b9093" : "#6b7073";
        } else {
          const fdy = (y - fcy) / fry;
          const rf = Math.hypot(dx, fdy);
          const fa = (Math.atan2(fdy, dx) * 180) / Math.PI;
          if (rf > 0.68 && fa > 96 && fa < 176) {
            const idx = Math.floor(fa / 2.6);
            col = rf < 0.705 || rf > 0.985 ? "#aeab9c" : idx % 2 ? "#ebe8dc" : "#c9c5b4";
            if (rf > 0.9 && idx % 2 === 0) col = "#bcb8a7";
          } else if ((rf > 0.3 && rf < 0.33) || (rf > 0.56 && rf < 0.59) || (rf > 0.82 && rf < 0.85) || rf < 0.05) col = "#6a6a62";
          else {
            const sx = (x / 44) | 0, sy = (y / 22) | 0;
            col = x % 44 < 2 || y % 22 < 2 ? "#b3ae9b" : FLOOR[(hash(sx, sy, 8) * 4) | 0];
            if (dy > 0 && r > 0.86) col = "#aaa693"; // rim shadow on the near side
          }
        }
      }
      if (col) {
        g.fillStyle = col;
        g.fillRect(x, y, 2, 2);
      }
    }
  // blue floor drain disc at the centre, as in the reference map
  rect(g, cx - 10, fcy - 5, 20, 10, "#55585a");
}

export function drawGround(): HTMLCanvasElement {
  const [c, g] = mk(COLS * T, ROWS * T);
  paving(g, 0, 0, COLS * T, ROWS * T);

  // green edges west and east, Jidian Road in the south, service road in the east
  hedge(g, 0, 0, 2 * T - 8, L.south * T - 40);
  hedge(g, 66 * T + 8, 0, 2 * T - 8, L.south * T - 40);
  asphalt(g, 0, L.south * T, COLS * T, 3 * T);
  rect(g, 0, L.south * T - 10, COLS * T, 10, KERB[3]);
  rect(g, 0, L.south * T - 10, COLS * T, 3, KERB[0]);
  for (let x = 12; x < COLS * T; x += 96) rect(g, x, L.south * T + 92, 52, 6, "#e7e8e4");
  for (let i = 0; i < 9; i++) rect(g, 28 * T + i * 28, L.south * T + 14, 16, 3 * T - 28, "#eeeeea");
  text(g, "集电路  Jidian Road", 8 * T, L.south * T + 120, 30, "#6a6d6b");
  const R = L.road;
  asphalt(g, R.x * T, 0, R.w * T, L.south * T + 8);
  rect(g, R.x * T - 8, 0, 8, L.south * T - 10, KERB[3]);
  rect(g, R.x * T - 8, 0, 3, L.south * T - 10, KERB[0]);
  rect(g, (R.x + R.w) * T, 0, 8, L.south * T - 10, KERB[4]);
  for (let y = 20; y < L.south * T - 80; y += 110) rect(g, (R.x + 2) * T - 3, y, 6, 56, "#d9dad6");

  // step theatre below the auditorium box
  const A = L.aud;
  for (let y = 7 * T, i = 0; y < 10 * T; y += 16, i++) {
    rect(g, (A.x + 1) * T, y, (A.w - 2) * T, 16, i % 2 ? "#dcddd8" : "#d2d3cd");
    rect(g, (A.x + 1) * T, y + 11, (A.w - 2) * T, 3, "#b4b5af");
    rect(g, (A.x + 1) * T, y + 14, (A.w - 2) * T, 2, "#7f817c");
    for (let x = (A.x + 1) * T + ((i * 53) % 90); x < (A.x + A.w - 1) * T; x += 90) rect(g, x, y, 1, 11, "#b4b5af");
  }
  hedge(g, A.x * T + 6, 7 * T, T - 12, 3 * T - 8);
  hedge(g, (A.x + A.w - 1) * T + 6, 7 * T, T - 12, 3 * T - 8);

  // shadows: west of each tower, under the footbridge, at wall bases
  for (const b of [L.cds1, L.cds2]) {
    for (let i = 0; i < 6; i++) dark(g, b.x * T - 90 + i * 15, (b.y + b.roof) * T + 80 + i * 22, 90 - i * 15, b.face * T - 80 - i * 22, 0.11);
    dark(g, b.x * T, (b.y + b.roof + b.face) * T, b.w * T, 10, 0.2);
    dark(g, b.x * T, (b.y + b.roof + b.face) * T + 10, b.w * T, 10, 0.08);
  }
  for (const b of [L.aud, L.b5]) dark(g, b.x * T, (b.y + b.roof + b.face) * T, b.w * T, 12, 0.16);
  const B = L.bridge;
  dark(g, B.x * T, B.row * T - 8, B.w * T, 2 * T + 8, 0.2);
  dark(g, B.x * T + 12, (B.row + 2) * T, B.w * T - 24, 10, 0.1);

  court(g);

  // lawns
  const W = L.lawn;
  lawn(g, W.x * T, W.y * T, W.w * T, W.h * T, 90);
  lawn(g, L.sign.x * T - 20, L.sign.y * T - 6, L.sign.w * T + 40, L.sign.h * T, 50);
  lawn(g, 4 * T, 27 * T, 12 * T, 4 * T, 60);
  lawn(g, 4 * T, 34 * T, 12 * T, 5 * T, 60);

  // planting beds: either side of the CDS1 door, B5 frontage, tower base
  const d = L.cds1;
  hedge(g, d.x * T + 8, 25 * T + 4, (d.door - d.x - 1) * T - 8, 46);
  hedge(g, (d.door + 3) * T, 25 * T + 4, (d.x + d.w - d.door - 3) * T - 8, 46);
  hedge(g, L.b5.x * T + 8, 7 * T + 4, (L.b5.door - L.b5.x - 1) * T - 8, 40);
  hedge(g, (L.b5.door + 3) * T, 7 * T + 4, (L.b5.x + L.b5.w - L.b5.door - 3) * T - 8, 40);
  hedge(g, L.cds2.x * T + 8, 25 * T + 4, 6 * T, 44);
  hedge(g, (L.cds2.x + 9) * T, 25 * T + 4, 7 * T - 8, 44);
  hedge(g, 58 * T + 6, 10 * T, 3 * T, 15 * T - 20); // bed between CDS1 and the service road

  // locker plinths (concrete, gravel edge)
  for (const py of [30, 35]) {
    rect(g, 51 * T + 32, py * T - 10, 9 * T, 2 * T + 30, "#b9b7ad");
    rect(g, 51 * T + 32, py * T - 10, 9 * T, 3, "#d2d0c6");
    rect(g, 51 * T + 32, py * T + 2 * T + 14, 9 * T, 6, "#8f8d84");
    speckle(g, 51 * T + 32, py * T - 10, 9 * T, 2 * T + 24, ["#c9c7bd", "#a7a59b", "#d6d4ca"], 0.12, 13, 2);
  }

  // yellow lane lines, white chevron and bars
  for (const o of [0, 0.16]) {
    line(g, [[41.2 + o, 7.2], [41.2 + o, 24.6], [41 + o, 26], [40.5 + o, 27.2], [40.35 + o, 28.6], [40.35 + o, 39.8]], YEL[2]);
    line(g, [[47 + o * 0.5, 29.3 + o], [61.7, 29.3 + o]], YEL[2]);
  }
  line(g, [[41.3, 26], [42.4, 26.6], [43.6, 29.2], [47, 29.3]], YEL[1]);
  line(g, [[18.6, 10.6], [41.2, 10.6]], YEL[2]);
  line(g, [[18.5, 26.4], [20.3, 27.4], [20.5, 29], [20.5, 39.8]], YEL[2]);
  line(g, [[40.9, 25.7], [41.6, 26.5], [42.3, 25.7]], "#e7e8e4", 7);
  for (let i = 0; i < 4; i++) rect(g, (47.3 + i * 1.5) * T, 28.55 * T, 56, 8, "#e7e8e4");
  // light spill from the two lobbies
  g.fillStyle = "rgba(255,226,170,0.16)";
  g.fillRect(d.door * T - 40, 25 * T, 2 * T + 80, 60);
  g.fillRect(L.b5.door * T - 30, 7 * T, 2 * T + 60, 50);
  return c;
}
