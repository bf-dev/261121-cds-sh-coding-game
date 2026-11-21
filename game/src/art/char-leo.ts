// Leo, the HKU lion mascot from the lawn (buildings/outside/ §3.8): a cartoon lion with a
// spiky yellow mane, cream muzzle, green jacket over a white shirt and brown shorts.
// Standing version for the grand hall stage. Sprite 128 x 160, portrait 320 x 320.

import type { CharSheet } from "../engine/types";
import { mk, type Ctx } from "./px";
import { tones, px, rbox, sbox, ell, sell, poly, line, outline, flipH, scaleUp } from "./char-draw";

const FUR = tones("#f4d78e");
const MANE = tones("#e8b93a");
const MUZZLE = tones("#fbf2dc");
const JACKET = tones("#5c9a7b");
const SHIRT = tones("#f6f4ec");
const SHORTS = tones("#77584a");
const NOSE = "#c7806f";
const INK = "#2a1d24";

function mane(g: Ctx, cx: number, cy: number, rIn: number, rOut: number, n: number, phase: number, a: string, b: string): void {
  for (let i = 0; i < n; i++) {
    const t = phase + (i / n) * Math.PI * 2;
    const half = (Math.PI / n) * 1.25;
    const r = rOut * (i % 2 ? 0.94 : 1);
    poly(g, [[cx + Math.cos(t - half) * rIn, cy + Math.sin(t - half) * rIn], [cx + Math.cos(t) * r, cy + Math.sin(t) * r], [cx + Math.cos(t + half) * rIn, cy + Math.sin(t + half) * rIn]], i % 2 ? a : b);
  }
}

function tail(g: Ctx, x: number, y: number, dir: number, sway: number): void {
  const pts: Array<[number, number]> = [[x, y], [x + dir * 12, y + 4], [x + dir * 20, y - 6 + sway], [x + dir * 22, y - 20 + sway]];
  for (let i = 0; i + 1 < pts.length; i++) line(g, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], FUR.b, 5);
  for (let i = 0; i + 1 < pts.length; i++) line(g, pts[i][0] + 3, pts[i][1] + 3, pts[i + 1][0] + 3, pts[i + 1][1] + 3, FUR.d1, 2);
  const tx = x + dir * 24;
  const ty = y - 26 + sway;
  ell(g, tx, ty, 8, 10, MANE.b);
  poly(g, [[tx - 6, ty - 6], [tx + 1, ty - 18], [tx + 6, ty - 6]], MANE.b);
  ell(g, tx - 2, ty - 2, 4, 5, MANE.l1);
}

function body(g: Ctx, f: number, back: boolean, turn: number): number {
  const cx = 64;
  const step = f === 1 ? 1 : f === 3 ? -1 : 0;
  const bob = step ? 2 : 0;
  const sway = f === 1 ? 2 : f === 3 ? -2 : 0;
  // tail behind
  if (back) tail(g, cx + 4, 128 + bob, 1, sway);
  else tail(g, turn ? cx - 22 : cx + 24, 128 + bob, turn ? -1 : 1, sway);
  // legs and paws
  for (const sgn of [-1, 1]) {
    const lifted = (step === 1 && sgn === -1) || (step === -1 && sgn === 1);
    const lx = sgn < 0 ? cx - 24 : cx + 4;
    const fy = 150 - (lifted ? 4 : 0);
    sbox(g, lx, 130 + bob, 20, fy - 130 - bob + 2, FUR, 0, 0);
    ell(g, lx + 10 + (back ? 0 : sgn * 2), fy + 3, 14, 6, FUR.b);
    ell(g, lx + 8 + (back ? 0 : sgn * 2), fy + 1, 9, 3, FUR.l1);
    if (!back) {
      px(g, lx + 5 + sgn * 2, fy + 3, 1, 4, FUR.d1);
      px(g, lx + 10 + sgn * 2, fy + 4, 1, 4, FUR.d1);
      px(g, lx + 15 + sgn * 2, fy + 3, 1, 4, FUR.d1);
    }
  }
  // shorts
  sbox(g, cx - 27, 116 + bob, 54, 20, SHORTS, 0, 3);
  px(g, cx - 1, 124 + bob, 2, 12, SHORTS.d2);
  px(g, cx - 27, 133 + bob, 54, 2, SHORTS.d2);
  // jacket
  const y = 84 + bob;
  sbox(g, cx - 30, y, 60, 38, JACKET, 8, 2);
  if (!back) {
    poly(g, [[cx - 12 + turn, y], [cx + 12 + turn, y], [cx + 8 + turn, y + 38], [cx - 8 + turn, y + 38]], SHIRT.b);
    px(g, cx - 1 + turn, y + 12, 2, 26, SHIRT.d1);
    for (let i = 0; i < 3; i++) px(g, cx - 1 + turn, y + 16 + i * 7, 2, 2, "#c9c9d2");
    poly(g, [[cx - 14 + turn, y], [cx - 6 + turn, y + 14], [cx - 9 + turn, y + 38], [cx - 13 + turn, y + 38]], JACKET.d1);
    poly(g, [[cx + 14 + turn, y], [cx + 6 + turn, y + 14], [cx + 9 + turn, y + 38], [cx + 13 + turn, y + 38]], JACKET.d2);
    // crest badge on the chest
    sbox(g, cx + 14 + turn, y + 14, 8, 9, tones("#f1e3b0"), 1, 3, 1);
    px(g, cx + 16 + turn, y + 16, 4, 2, "#b3363c");
    px(g, cx + 16 + turn, y + 19, 4, 2, "#1e7a55");
    px(g, cx - 26, y + 26, 10, 1, JACKET.d2);
  } else {
    px(g, cx, y + 8, 1, 30, JACKET.d1);
    px(g, cx - 18, y + 2, 36, 3, JACKET.l1);
  }
  px(g, cx - 28, y + 35, 56, 3, JACKET.d2);
  // arms
  for (const sgn of [-1, 1]) {
    const sw = step * sgn * 3;
    const ax = sgn < 0 ? cx - 42 : cx + 26;
    sbox(g, ax, y + 4, 16, 24 + sw, JACKET, 6, 0);
    sbox(g, ax, y + 24 + sw, 16, 6, SHIRT, 0, 0);
    ell(g, ax + 8, y + 37 + sw, 10, 9, FUR.b);
    ell(g, ax + 6, y + 34 + sw, 5, 4, FUR.l1);
    if (!back) {
      px(g, ax + 4, y + 40 + sw, 1, 5, FUR.d1);
      px(g, ax + 9, y + 41 + sw, 1, 5, FUR.d1);
    }
  }
  return bob;
}

function head(g: Ctx, cx: number, cy: number, back: boolean, turn: number, k = 1): void {
  const R = (v: number) => Math.round(v * k);
  // mane: two rings of spikes over a disc
  mane(g, cx, cy, R(30), R(47), 13, -Math.PI / 2, MANE.d1, MANE.b);
  ell(g, cx, cy, R(38), R(37), MANE.b);
  mane(g, cx, cy, R(26), R(41), 13, -Math.PI / 2 + Math.PI / 13, MANE.l1, MANE.b);
  if (back) {
    ell(g, cx, cy + R(2), R(30), R(29), MANE.b);
    mane(g, cx, cy + R(2), R(12), R(30), 9, -Math.PI / 2, MANE.l1, MANE.d1);
    ell(g, cx, cy + R(2), R(14), R(13), MANE.l1);
    ell(g, cx - R(4), cy - R(2), R(6), R(5), MANE.l2);
    return;
  }
  const fx = cx + turn;
  // ears
  for (const sgn of [-1, 1]) {
    ell(g, fx + sgn * R(24), cy - R(24), R(9), R(9), FUR.b);
    ell(g, fx + sgn * R(24), cy - R(23), R(5), R(5), "#eab79a");
  }
  // face
  sell(g, fx, cy + R(4), R(29), R(27), FUR.d1, 2.4);
  sell(g, fx - R(2), cy + R(3), R(27), R(26), FUR.b, 2.4);
  ell(g, fx - R(10), cy - R(12), R(10), R(5), FUR.l1);
  // fringe of mane over the forehead
  mane(g, fx, cy - R(26), R(4), R(13), 5, Math.PI * 0.22, MANE.b, MANE.l1);
  // muzzle
  ell(g, fx + (turn >> 1), cy + R(15), R(15), R(11), MUZZLE.b);
  ell(g, fx + (turn >> 1) - R(3), cy + R(13), R(9), R(6), MUZZLE.l2);
  // nose
  rbox(g, fx + (turn >> 1) - R(6), cy + R(5), R(12), R(8), NOSE, R(3), R(4));
  px(g, fx + (turn >> 1) - R(4), cy + R(6), R(4), R(2), "#e3a999");
  // mouth: a friendly smile
  px(g, fx + (turn >> 1) - 1, cy + R(13), 2, R(5), INK);
  line(g, fx + (turn >> 1) - R(8), cy + R(16), fx + (turn >> 1) - R(4), cy + R(19), INK, Math.max(1, R(1)));
  line(g, fx + (turn >> 1) - R(4), cy + R(19), fx + (turn >> 1), cy + R(18), INK, Math.max(1, R(1)));
  line(g, fx + (turn >> 1), cy + R(18), fx + (turn >> 1) + R(4), cy + R(19), INK, Math.max(1, R(1)));
  line(g, fx + (turn >> 1) + R(4), cy + R(19), fx + (turn >> 1) + R(8), cy + R(16), INK, Math.max(1, R(1)));
  // eyes and brows
  for (const sgn of [-1, 1]) {
    const ex = fx + sgn * R(12) + (turn >> 2);
    ell(g, ex, cy - R(1), R(4), R(6), INK);
    px(g, ex - R(2), cy - R(5), R(3), R(3), "#ffffff");
    px(g, ex + R(1), cy + R(1), R(1), R(2), "#8a6a5a");
    line(g, ex - sgn * R(5), cy - R(10), ex + sgn * R(5), cy - R(12), "#a8741f", Math.max(2, R(2)));
    ell(g, fx + sgn * R(20), cy + R(10), R(5), R(3), "#f2b08f");
  }
  // whisker dots
  for (const sgn of [-1, 1]) for (let i = 0; i < 2; i++) px(g, fx + (turn >> 1) + sgn * R(9) - 1, cy + R(11) + i * R(4), Math.max(1, R(1)), Math.max(1, R(1)), "#c9a57a");
}

function frame(dir: "down" | "up" | "right", f: number): HTMLCanvasElement {
  const [c, g] = mk(128, 160);
  const back = dir === "up";
  const turn = dir === "right" ? 8 : 0;
  const bob = body(g, f, back, turn);
  head(g, 64, 50 + bob, back, turn);
  outline(c);
  return c;
}

function portrait(): HTMLCanvasElement {
  const [c, g] = mk(160, 160);
  // shoulders: jacket, shirt, crest
  ell(g, 80, 172, 74, 44, JACKET.d1, 0, 159);
  ell(g, 76, 172, 70, 43, JACKET.b, 0, 159);
  poly(g, [[58, 128], [102, 128], [92, 160], [68, 160]], SHIRT.b);
  poly(g, [[52, 130], [66, 138], [70, 160], [56, 160]], JACKET.d1);
  poly(g, [[108, 130], [94, 138], [90, 160], [104, 160]], JACKET.d2);
  px(g, 79, 144, 3, 16, SHIRT.d1);
  sbox(g, 114, 142, 12, 14, tones("#f1e3b0"), 2, 4, 1);
  px(g, 117, 145, 6, 3, "#b3363c");
  px(g, 117, 150, 6, 3, "#1e7a55");
  head(g, 80, 72, false, 4, 1.5);
  outline(c);
  return scaleUp(c, 2);
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
