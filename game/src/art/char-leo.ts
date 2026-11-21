// Leo, the HKU lion mascot from the lawn (buildings/outside/ §3.8): a cartoon lion with a
// yellow mane, cream muzzle, green jacket over a white shirt and brown shorts.
// Chibi version for the Grand Hall stage: a big fluffy head on a small round body.
// Sprite 128 x 160, portrait 320 x 320.

import type { CharSheet } from "../engine/types";
import { mk, type Ctx } from "./px";
import { tones, px, rbox, sbox, ell, sell, poly, line, outline, flipH, scaleUp } from "./char-draw";
import { pastelCard } from "./char-portrait";

const FUR = tones("#f8dc98");
const MANE = tones("#eeb63a");
const MUZZLE = tones("#fff6e2");
const JACKET = tones("#2f8f66"); // HKU green
const SHIRT = tones("#f6f4ec");
const SHORTS = tones("#8a6450");
const NOSE = "#e08a86";
const INK = "#3a2530";
const BLUSH = "#ff9f9f";

/** a fluffy ring: round tufts instead of spikes */
function fluff(g: Ctx, cx: number, cy: number, dist: number, r: number, n: number, phase: number, a: string, b: string): void {
  for (let i = 0; i < n; i++) {
    const t = phase + (i / n) * Math.PI * 2;
    ell(g, cx + Math.cos(t) * dist, cy + Math.sin(t) * dist, r, r, i % 2 ? a : b);
  }
}

function tail(g: Ctx, x: number, y: number, dir: number, sway: number): void {
  const pts: Array<[number, number]> = [[x, y], [x + dir * 10, y + 3], [x + dir * 17, y - 5 + sway], [x + dir * 19, y - 15 + sway]];
  for (let i = 0; i + 1 < pts.length; i++) line(g, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], FUR.b, 5);
  const tx = x + dir * 21;
  const ty = y - 21 + sway;
  ell(g, tx, ty, 8, 8, MANE.b);
  ell(g, tx - 2, ty - 2, 4, 4, MANE.l1);
}

function body(g: Ctx, f: number, back: boolean, turn: number): number {
  const cx = 64;
  const step = f === 1 ? 1 : f === 3 ? -1 : 0;
  const bob = step ? 2 : 0;
  const sway = f === 1 ? 2 : f === 3 ? -2 : 0;
  if (back) tail(g, cx + 4, 134 + bob, 1, sway);
  else tail(g, turn ? cx - 18 : cx + 20, 134 + bob, turn ? -1 : 1, sway);
  // short legs and round paws
  for (const sgn of [-1, 1]) {
    const lifted = (step === 1 && sgn === -1) || (step === -1 && sgn === 1);
    const lx = sgn < 0 ? cx - 20 : cx + 2;
    const fy = 149 - (lifted ? 4 : 0);
    sbox(g, lx, 136 + bob, 18, fy - 136 - bob + 2, FUR, 0, 0);
    ell(g, lx + 9 + (back ? 0 : sgn * 2), fy + 2, 13, 7, FUR.b);
    ell(g, lx + 7 + (back ? 0 : sgn * 2), fy, 8, 3, FUR.l1);
    if (!back) {
      px(g, lx + 5 + sgn * 2, fy + 4, 1, 3, FUR.d1);
      px(g, lx + 12 + sgn * 2, fy + 4, 1, 3, FUR.d1);
    }
  }
  // shorts
  sbox(g, cx - 23, 126 + bob, 46, 14, SHORTS, 0, 4);
  px(g, cx - 1, 132 + bob, 2, 8, SHORTS.d2);
  // jacket
  const y = 98 + bob;
  sbox(g, cx - 25, y, 50, 32, JACKET, 10, 3);
  if (!back) {
    poly(g, [[cx - 11 + turn, y], [cx + 11 + turn, y], [cx + 7 + turn, y + 32], [cx - 7 + turn, y + 32]], SHIRT.b);
    px(g, cx - 1 + turn, y + 14, 2, 18, SHIRT.d1);
    for (let i = 0; i < 2; i++) px(g, cx - 1 + turn, y + 17 + i * 7, 2, 2, "#c9c9d2");
    poly(g, [[cx - 13 + turn, y], [cx - 6 + turn, y + 14], [cx - 8 + turn, y + 32], [cx - 12 + turn, y + 32]], JACKET.d1);
    poly(g, [[cx + 13 + turn, y], [cx + 6 + turn, y + 14], [cx + 8 + turn, y + 32], [cx + 12 + turn, y + 32]], JACKET.d2);
    // crest badge on the chest
    sbox(g, cx + 12 + turn, y + 15, 8, 9, tones("#f1e3b0"), 1, 3, 1);
    px(g, cx + 14 + turn, y + 17, 4, 2, "#b3363c");
    px(g, cx + 14 + turn, y + 20, 4, 2, "#1e7a55");
  } else px(g, cx, y + 10, 1, 22, JACKET.d1);
  px(g, cx - 23, y + 30, 46, 2, JACKET.d2);
  // stubby arms with round paws
  for (const sgn of [-1, 1]) {
    const sw = step * sgn * 3;
    const ax = sgn < 0 ? cx - 36 : cx + 22;
    sbox(g, ax, y + 6, 14, 15 + sw, JACKET, 6, 0);
    px(g, ax, y + 19 + sw, 14, 3, SHIRT.b);
    ell(g, ax + 7, y + 28 + sw, 9, 8, FUR.b);
    ell(g, ax + 5, y + 25 + sw, 5, 3, FUR.l1);
    if (!back) {
      px(g, ax + 4, y + 31 + sw, 1, 4, FUR.d1);
      px(g, ax + 9, y + 31 + sw, 1, 4, FUR.d1);
    }
  }
  return bob;
}

function head(g: Ctx, cx: number, cy: number, back: boolean, turn: number, k = 1): void {
  const R = (v: number) => Math.round(v * k);
  // mane: two rings of round tufts over a disc
  fluff(g, cx, cy, R(34), R(13), 12, -Math.PI / 2, MANE.d1, MANE.b);
  ell(g, cx, cy, R(38), R(37), MANE.b);
  fluff(g, cx, cy, R(29), R(11), 12, -Math.PI / 2 + Math.PI / 12, MANE.l1, MANE.b);
  if (back) {
    ell(g, cx, cy + R(2), R(30), R(29), MANE.b);
    fluff(g, cx, cy + R(2), R(17), R(8), 8, 0, MANE.l1, MANE.d1);
    ell(g, cx, cy + R(2), R(14), R(13), MANE.l1);
    ell(g, cx - R(4), cy - R(2), R(6), R(5), MANE.l2);
    return;
  }
  const fx = cx + turn;
  const mx = fx + (turn >> 1);
  // round ears
  for (const sgn of [-1, 1]) {
    ell(g, fx + sgn * R(25), cy - R(25), R(10), R(10), FUR.b);
    ell(g, fx + sgn * R(25), cy - R(24), R(6), R(6), "#f4b9a6");
  }
  // face
  sell(g, fx, cy + R(4), R(31), R(28), FUR.d1, 2.5);
  sell(g, fx - R(1), cy + R(3), R(30), R(27), FUR.b, 2.5);
  ell(g, fx - R(11), cy - R(13), R(10), R(4), FUR.l1);
  // a little tuft of mane on the forehead
  for (const [dx, dy, r] of [[-7, -25, 7], [0, -28, 8], [7, -25, 7]]) ell(g, fx + R(dx), cy + R(dy), R(r), R(r), dx === 0 ? MANE.l1 : MANE.b);
  // muzzle
  ell(g, mx, cy + R(17), R(14), R(10), MUZZLE.b);
  ell(g, mx - R(3), cy + R(15), R(8), R(5), MUZZLE.l2);
  // tiny nose
  rbox(g, mx - R(4), cy + R(10), R(8), R(5), NOSE, R(2), R(3));
  px(g, mx - R(2), cy + R(11), R(3), Math.max(1, R(1)), "#f5b8b0");
  // small "w" smile
  const t = Math.max(1, R(1));
  px(g, mx - (t >> 1), cy + R(15), t, R(3), INK);
  line(g, mx - R(6), cy + R(17), mx - R(3), cy + R(19), INK, t);
  line(g, mx - R(3), cy + R(19), mx, cy + R(18), INK, t);
  line(g, mx, cy + R(18), mx + R(3), cy + R(19), INK, t);
  line(g, mx + R(3), cy + R(19), mx + R(6), cy + R(17), INK, t);
  // big shiny eyes, soft brows, round cheeks
  for (const sgn of [-1, 1]) {
    const ex = fx + sgn * R(14) + (turn >> 2);
    ell(g, ex, cy + R(1), R(6), R(8), INK);
    ell(g, ex, cy + R(4), R(4), R(4), "#7a4a34");
    ell(g, ex, cy + R(2), R(3), R(4), "#1c1118");
    px(g, ex - R(4), cy - R(5), R(4), R(4), "#ffffff");
    px(g, ex + R(1), cy + R(4), R(2), R(2), "#ffffff");
    line(g, ex - sgn * R(4), cy - R(14), ex + sgn * R(4), cy - R(13), "#b9801f", Math.max(2, R(2)));
    ell(g, fx + sgn * R(23), cy + R(12), R(6), R(4), BLUSH);
  }
}

function frame(dir: "down" | "up" | "right", f: number): HTMLCanvasElement {
  const [c, g] = mk(128, 160);
  const back = dir === "up";
  const turn = dir === "right" ? 10 : 0;
  const bob = body(g, f, back, turn);
  head(g, 64, 55 + bob, back, turn);
  outline(c);
  return c;
}

function portrait(): HTMLCanvasElement {
  const [c, g] = mk(160, 160);
  // small shoulders: jacket, shirt, crest
  ell(g, 80, 176, 62, 40, JACKET.d1, 0, 159);
  ell(g, 77, 176, 59, 39, JACKET.b, 0, 159);
  poly(g, [[62, 136], [98, 136], [90, 160], [70, 160]], SHIRT.b);
  px(g, 79, 148, 3, 12, SHIRT.d1);
  sbox(g, 108, 146, 11, 12, tones("#f1e3b0"), 2, 4, 1);
  px(g, 111, 149, 5, 3, "#b3363c");
  px(g, 111, 153, 5, 3, "#1e7a55");
  head(g, 80, 76, false, 0, 1.45);
  outline(c);
  return scaleUp(pastelCard(c, "leo-the-hku-lion"), 2);
}

export function leoSheet(): CharSheet {
  const right = [0, 1, 2, 3].map((f) => frame("right", f));
  return {
    frames: {
      down: [0, 1, 2, 3].map((f) => frame("down", f)),
      up: [0, 1, 2, 3].map((f) => frame("up", f)),
      right,
      left: right.map(flipH),
    },
    portrait: portrait(),
    w: 128,
    h: 160,
  };
}
