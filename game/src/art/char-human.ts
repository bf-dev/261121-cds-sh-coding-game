// Parametric human sprite, 64 x 128, feet at the bottom centre.
// One generator draws the student, the 14 teachers, the guard and the visitors.

import { mk, type Ctx } from "./px";
import { tones, px, rbox, sbox, limb, ell, poly, line, outline, flipH, mix, type Tones } from "./char-draw";

export type HairStyle = "short" | "side" | "crew" | "spiky" | "curly" | "bob" | "long" | "bun" | "pony" | "bald" | "receding";
export type TopKind = "hoodie" | "cardigan" | "shirt" | "blazer" | "suit" | "sweater" | "polo" | "vest" | "coat" | "uniform";
export type Acc = "lanyard" | "coffee" | "laptop" | "tote" | "backpack" | "scarf" | "cane" | "book" | "cap";

export interface HumanSpec {
  skin: string;
  hair: string;
  hairStyle: HairStyle;
  top: TopKind;
  topColor: string;
  shirt?: string;
  tie?: string;
  bottom: "trousers" | "jeans" | "skirt" | "shorts";
  bottomColor: string;
  shoes: string;
  glasses?: "round" | "square";
  glassesColor?: string;
  /** collar edge colour on a polo */
  trim?: string;
  /** a wispy fringe over the forehead (long hair) */
  fringe?: boolean;
  /** line colour of a checked shirt */
  check?: string;
  beard?: "full" | "moustache" | "goatee" | "stubble";
  acc?: Acc[];
  accColor?: string;
  /** figure height in px, 84 (child) to 124 */
  height?: number;
  /** extra torso width in px */
  build?: number;
  senior?: boolean;
  child?: boolean;
}

interface Geo {
  cx: number;
  hipY: number;
  torsoTop: number;
  torsoH: number;
  torsoW: number;
  headTop: number;
  headH: number;
  headW: number;
  shoeTop: number;
  step: number;
  eyeY: number;
}

interface Pal {
  skin: Tones;
  hair: Tones;
  top: Tones;
  sleeve: Tones;
  shirt: Tones;
  bottom: Tones;
  shoes: Tones;
  acc: Tones;
}

const has = (s: HumanSpec, a: Acc) => !!s.acc && s.acc.includes(a);

function geo(s: HumanSpec, f: number): Geo {
  const H = s.height ?? 118;
  const headH = s.child ? 26 : 28;
  const headW = s.child ? 26 : 28;
  const rest = H - headH - 3 - 6;
  const legH = Math.round(rest * (s.child ? 0.47 : 0.53));
  const torsoH = rest - legH;
  const step = f === 1 ? 1 : f === 3 ? -1 : 0;
  const bob = step ? 2 : 0;
  const shoeTop = 122;
  const hipY = shoeTop - legH + bob;
  const torsoTop = hipY - torsoH;
  const headTop = torsoTop - 3 - headH + 1;
  return { cx: 32, hipY, torsoTop, torsoH, torsoW: (s.child ? 24 : 30) + (s.build ?? 0), headTop, headH, headW, shoeTop, step, eyeY: headTop + Math.round(headH * 0.52) };
}

function pal(s: HumanSpec): Pal {
  const shirt = tones(s.shirt ?? "#f1efe8");
  const top = tones(s.topColor);
  return {
    skin: tones(s.skin),
    hair: tones(s.hair),
    top,
    sleeve: s.top === "vest" ? shirt : top,
    shirt,
    bottom: tones(s.bottomColor),
    shoes: tones(s.shoes),
    acc: tones(s.accColor ?? "#c9553a"),
  };
}

const dark = (t: Tones): Tones => ({ d2: t.d2, d1: t.d2, b: t.d1, l1: t.d1, l2: t.b });

// ---------- legs ----------

function legsFront(g: Ctx, s: HumanSpec, G: Geo, P: Pal, back: boolean): void {
  const { cx, hipY, shoeTop, step } = G;
  for (const sgn of [-1, 1]) {
    const lifted = (step === 1 && sgn === -1) || (step === -1 && sgn === 1);
    const lw = s.child ? 10 : 12;
    const lx = sgn < 0 ? cx - lw - 1 : cx + 1;
    const bottom = shoeTop - (lifted ? 4 : 0);
    if (s.bottom === "trousers" || s.bottom === "jeans") {
      sbox(g, lx, hipY, lw, bottom - hipY, P.bottom, 0, 0);
      if (s.bottom === "jeans") px(g, lx + (sgn < 0 ? lw - 3 : 2), hipY + 6, 1, bottom - hipY - 8, P.bottom.l1);
      else px(g, lx + (lw >> 1), hipY + 8, 1, bottom - hipY - 9, P.bottom.l1);
    } else {
      const cut = s.bottom === "shorts" ? 14 : 0;
      if (cut) sbox(g, lx, hipY, lw, cut, P.bottom, 0, 0);
      sbox(g, lx + 1, hipY + cut, lw - 2, bottom - hipY - cut, s.bottom === "skirt" ? tones("#3a3440") : P.skin, 0, 0);
      if (s.bottom === "shorts") px(g, lx + 1, bottom - 5, lw - 2, 5, "#f1efe8");
    }
    const sh = lifted ? 5 : 6;
    sbox(g, lx - (sgn < 0 ? 1 : 0), bottom, lw + 1, sh, P.shoes, 2, 0, 1);
    if (!back) px(g, lx + (sgn < 0 ? 0 : 1), bottom + sh - 2, lw, 2, P.shoes.d2);
    else px(g, lx + (sgn < 0 ? 0 : 1), bottom + sh - 1, lw, 1, P.shoes.d2);
  }
  // seat joins the legs
  if (s.bottom !== "skirt") px(g, cx - 1, hipY, 2, 7, P.bottom.d1);
  if (s.bottom === "skirt") {
    const y0 = hipY - 2;
    poly(g, [[cx - 14, y0], [cx + 14, y0], [cx + 17, y0 + 20], [cx - 17, y0 + 20]], P.bottom.b);
    poly(g, [[cx + 10, y0], [cx + 14, y0], [cx + 17, y0 + 20], [cx + 12, y0 + 20]], P.bottom.d1);
    px(g, cx - 16, y0 + 18, 32, 2, P.bottom.d1);
    px(g, cx - 5, y0 + 2, 1, 16, P.bottom.d1);
    px(g, cx + 3, y0 + 2, 1, 16, P.bottom.d1);
    px(g, cx - 13, y0 + 1, 2, 14, P.bottom.l1);
  }
}

function legsSide(g: Ctx, s: HumanSpec, G: Geo, P: Pal): void {
  const { cx, hipY, shoeTop, step } = G;
  const lw = s.child ? 10 : 12;
  const draw = (off: number, far: boolean) => {
    const T = far ? dark(P.bottom) : P.bottom;
    const S = far ? dark(P.skin) : P.skin;
    const SH = far ? dark(P.shoes) : P.shoes;
    const x0 = cx - 6;
    const x1 = x0 + off;
    const lift = off < 0 ? 2 : 0; // trailing heel comes up
    const bottom = shoeTop - lift;
    if (s.bottom === "trousers" || s.bottom === "jeans") limb(g, x0, hipY, x1, bottom, lw, T);
    else {
      const cut = s.bottom === "shorts" ? 14 : 0;
      const xm = x0 + (off * cut) / Math.max(1, bottom - hipY);
      if (cut) limb(g, x0, hipY, xm, hipY + cut, lw, T);
      limb(g, xm + 1, hipY + cut, x1 + 1, bottom, lw - 2, s.bottom === "skirt" ? (far ? dark(tones("#3a3440")) : tones("#3a3440")) : S);
    }
    sbox(g, x1 - 1, bottom, lw + 4, 6, SH, 2, 0, 1);
    px(g, x1 - 1, bottom + 4, lw + 4, 2, SH.d2);
  };
  if (step === 0) {
    draw(2, true);
    draw(-1, false);
  }
  else {
    draw(step * 7, true);
    draw(-step * 7, false);
  }
  if (s.bottom === "skirt") {
    const y0 = hipY - 2;
    poly(g, [[cx - 10, y0], [cx + 10, y0], [cx + 13, y0 + 20], [cx - 13, y0 + 20]], P.bottom.b);
    px(g, cx - 12, y0 + 18, 24, 2, P.bottom.d1);
    px(g, cx + 7, y0 + 2, 2, 16, P.bottom.d1);
  }
}

// ---------- torso ----------

function torsoFront(g: Ctx, s: HumanSpec, G: Geo, P: Pal, back: boolean): void {
  const { cx, torsoTop: y, torsoH, torsoW, step } = G;
  const x = cx - (torsoW >> 1);
  const long = s.top === "coat" ? 12 : 0;
  const h = torsoH + 2 + long;
  if (long) sbox(g, x - 1, y + torsoH - 2, torsoW + 2, long + 4, P.top, 0, 0);
  sbox(g, x, y, torsoW, torsoH + 2, P.top, 3, 0);
  const T = P.top;
  if (!back) {
    const V = (wide: number, deep: number, col: string) => poly(g, [[cx - wide, y], [cx + wide, y], [cx, y + deep]], col);
    switch (s.top) {
      case "hoodie":
        rbox(g, cx - 9, y - 2, 18, 6, T.d1, 2);
        px(g, cx - 5, y, 10, 3, P.skin.d1);
        px(g, cx - 4, y + 5, 1, 9, "#f1efe8");
        px(g, cx + 3, y + 5, 1, 9, "#f1efe8");
        px(g, x + 5, y + torsoH - 12, torsoW - 10, 1, T.d1);
        px(g, x + 5, y + torsoH - 12, 1, 9, T.d1);
        px(g, x + torsoW - 6, y + torsoH - 12, 1, 9, T.d1);
        px(g, x + 2, y + torsoH - 2, torsoW - 4, 2, T.d2);
        break;
      case "cardigan":
        px(g, cx - 5, y, 10, h, P.shirt.b);
        px(g, cx - 5, y, 1, h, T.d2);
        px(g, cx + 4, y, 1, h, T.d2);
        px(g, cx - 3, y, 2, 3, P.shirt.l2);
        px(g, cx + 1, y, 2, 3, P.shirt.l2);
        for (let i = 0; i < 3; i++) px(g, cx + 6, y + 14 + i * 8, 2, 2, T.l2);
        break;
      case "shirt":
      case "polo":
        poly(g, [[cx - 7, y - 1], [cx, y + 5], [cx - 1, y + 7], [cx - 8, y + 2]], P.top.l2);
        poly(g, [[cx + 7, y - 1], [cx, y + 5], [cx + 1, y + 7], [cx + 8, y + 2]], P.top.l1);
        px(g, cx - 2, y, 4, 4, P.skin.d1);
        px(g, cx, y + 6, 1, s.top === "polo" ? 9 : h - 8, T.d1);
        if (s.top === "polo") for (let i = 0; i < 3; i++) px(g, cx - 1, y + 7 + i * 3, 1, 1, T.l2);
        else {
          px(g, x + 5, y + 12, 6, 1, T.d1);
          px(g, x + 5, y + 12, 1, 6, T.d1);
          if (s.tie) px(g, cx - 1, y + 4, 3, 16, s.tie);
        }
        if (s.check) {
          for (let xx = x + 4; xx < x + torsoW - 3; xx += 4) if (Math.abs(xx - cx) > 1) px(g, xx, y + 9, 1, h - 11, s.check);
          for (let yy = y + 11; yy < y + h - 3; yy += 5) px(g, x + 3, yy, torsoW - 6, 1, s.check);
        }
        if (s.trim) {
          line(g, cx - 8, y + 2, cx - 1, y + 7, s.trim, 1);
          line(g, cx + 8, y + 2, cx + 1, y + 7, s.trim, 1);
        }
        px(g, x + 2, y + torsoH - 1, torsoW - 4, 2, "#2a2530");
        break;
      case "blazer":
      case "suit":
      case "coat":
        V(8, 20, T.d2);
        V(6, 17, P.shirt.b);
        if (s.tie) {
          px(g, cx - 2, y + 2, 4, 3, s.tie);
          poly(g, [[cx - 1, y + 5], [cx + 1, y + 5], [cx + 2, y + 15], [cx, y + 17], [cx - 2, y + 15]], s.tie);
        } else px(g, cx - 2, y, 4, 4, P.skin.d1);
        px(g, cx, y + 18, 1, h - 20, T.d2);
        px(g, cx + 2, y + 24, 2, 2, T.l2);
        px(g, x + 4, y + 16, 5, 1, s.top === "coat" ? T.d1 : P.shirt.l1);
        if (s.top === "coat") {
          px(g, x + 4, y + 30, 6, 1, T.d1);
          px(g, x + torsoW - 10, y + 30, 6, 1, T.d1);
          px(g, x + torsoW - 9, y + 12, 1, 5, "#3b5a8c");
        }
        break;
      case "sweater":
        rbox(g, cx - 7, y - 1, 14, 5, T.l1, 2);
        px(g, cx - 4, y, 8, 3, P.skin.d1);
        px(g, cx - 6, y + 1, 3, 2, P.shirt.l2);
        px(g, cx + 3, y + 1, 3, 2, P.shirt.l2);
        px(g, x + 2, y + torsoH - 2, torsoW - 4, 1, T.d2);
        px(g, x + 2, y + torsoH, torsoW - 4, 1, T.d2);
        break;
      case "vest":
        px(g, x, y + 2, 3, 12, P.shirt.b);
        px(g, x + torsoW - 3, y + 2, 3, 12, P.shirt.d1);
        V(7, 15, P.shirt.b);
        px(g, cx - 3, y, 2, 3, P.shirt.l2);
        px(g, cx + 1, y, 2, 3, P.shirt.l2);
        if (s.tie) px(g, cx - 1, y + 2, 2, 11, s.tie);
        for (let i = 0; i < 4; i++) px(g, x + 3, y + 18 + i * 5, torsoW - 6, 1, T.d1);
        break;
      case "uniform":
        V(5, 10, "#dfe6ee");
        px(g, cx - 1, y + 1, 2, 8, "#1a1e2a");
        px(g, x + 4, y + 10, 4, 4, "#e8c34a");
        px(g, x + 5, y + 11, 2, 2, "#fff6c8");
        px(g, x + torsoW - 10, y + 12, 6, 1, T.l2);
        px(g, x + 1, y + 1, 6, 2, "#e8c34a");
        px(g, x + torsoW - 7, y + 1, 6, 2, "#c99f2f");
        px(g, x + 1, y + torsoH - 3, torsoW - 2, 4, "#15161c");
        px(g, cx - 2, y + torsoH - 3, 4, 4, "#c9c9d2");
        px(g, cx, y + 12, 1, torsoH - 16, T.d2);
        break;
    }
  } else {
    // back view: collar or hood, centre seam
    if (s.top === "hoodie") {
      rbox(g, cx - 10, y - 3, 20, 13, T.d1, 4, 6);
      rbox(g, cx - 8, y - 2, 16, 10, T.b, 3, 5);
    } else if (s.top !== "sweater") px(g, cx - 7, y - 1, 14, 3, s.top === "blazer" || s.top === "suit" || s.top === "coat" || s.top === "uniform" ? T.d1 : T.l1);
    if (s.top === "blazer" || s.top === "suit" || s.top === "coat") px(g, cx, y + 6, 1, h - 8, T.d1);
    if (s.top === "uniform") px(g, x + 1, y + torsoH - 3, torsoW - 2, 4, "#15161c");
  }
  // arms
  const len = torsoH - 4;
  for (const sgn of [-1, 1]) {
    const fwd = (step === 1 && sgn === 1) || (step === -1 && sgn === -1);
    const bk = (step === 1 && sgn === -1) || (step === -1 && sgn === 1);
    const l = len + (fwd ? 2 : bk ? -3 : 0);
    const aw = s.child ? 7 : 8;
    const ax = sgn < 0 ? x - aw + 1 : x + torsoW - 1;
    const short = s.top === "polo" ? 13 : l;
    sbox(g, ax, y + 2, aw, Math.min(short, l), P.sleeve, 2, 0);
    if (short < l) sbox(g, ax + 1, y + 2 + short, aw - 2, l - short, P.skin, 0, 0, 1);
    else if (s.top === "hoodie" || s.top === "sweater") px(g, ax, y + l, aw, 2, P.sleeve.d2);
    else if (s.top === "blazer" || s.top === "suit") px(g, ax, y + l, aw, 2, P.shirt.l1);
    sbox(g, ax + 1, y + 2 + l, aw - 2, 5, P.skin, 0, 2, 1);
    px(g, sgn < 0 ? ax + aw - 1 : ax, y + 5, 1, l - 5, P.sleeve.d2);
  }
}

function torsoSide(g: Ctx, s: HumanSpec, G: Geo, P: Pal): void {
  const { cx, torsoTop: y, torsoH, step } = G;
  const w = 20 + ((s.build ?? 0) >> 1) - (s.child ? 3 : 0);
  const x = cx - 10;
  const T = P.top;
  if (has(s, "backpack")) {
    sbox(g, x - 9, y + 3, 11, Math.min(28, torsoH - 4), P.acc, 3);
    px(g, x - 7, y + 14, 6, 1, P.acc.d2);
    px(g, x - 7, y + 15, 6, 6, P.acc.d1);
  }
  if (s.top === "coat") sbox(g, x - 1, y + torsoH - 2, w + 2, 16, T, 0, 0);
  sbox(g, x, y, w, torsoH + 2, T, 4, 0);
  if (s.top === "hoodie") rbox(g, x - 3, y - 2, 10, 9, T.d1, 3);
  if (s.top === "cardigan" || s.top === "blazer" || s.top === "suit" || s.top === "coat" || s.top === "vest") {
    px(g, x + w - 3, y + 1, 3, torsoH, P.shirt.b);
    px(g, x + w - 4, y + 1, 1, torsoH, T.d2);
    if (s.tie) px(g, x + w - 2, y + 2, 2, 13, s.tie);
  }
  if (s.top === "uniform") {
    px(g, x, y + torsoH - 3, w, 4, "#15161c");
    px(g, x + w - 6, y + 10, 3, 3, "#e8c34a");
  }
  if (s.top === "shirt" || s.top === "polo") {
    px(g, x + w - 5, y - 1, 5, 3, T.l2);
    px(g, x, y + torsoH - 1, w, 2, "#2a2530");
  }
  if (has(s, "backpack")) px(g, x + 4, y + 1, 3, 12, P.acc.d1);
  if (has(s, "lanyard")) {
    px(g, x + w - 3, y + 1, 1, 14, "#1e7a55");
    px(g, x + w - 4, y + 15, 3, 5, "#f6f6f0");
  }
  if (has(s, "laptop")) {
    sbox(g, x + 3, y + 16, 13, 10, tones("#b9bcc6"), 1);
    px(g, x + 8, y + 20, 3, 2, "#eceef2");
  }
  // near arm swings against the near leg
  const len = torsoH - 4;
  const sw = has(s, "laptop") ? 0 : step * 6;
  const ax = cx - 4;
  const short = s.top === "polo" ? 13 : len;
  const xm = ax + (sw * short) / len;
  limb(g, ax, y + 3, xm, y + 3 + short, 7, P.sleeve);
  if (short < len) limb(g, xm + 1, y + 3 + short, ax + sw + 1, y + 3 + len, 5, P.skin);
  rbox(g, ax, y + 2, 7, 3, P.sleeve.l1, 2, 0);
  sbox(g, ax + sw + 1, y + 2 + len, 5, 5, P.skin, 0, 2, 1);
  const hx = ax + sw + 1;
  const hy = y + 2 + len;
  if (has(s, "coffee")) {
    sbox(g, hx + 3, hy - 6, 6, 9, tones("#f1efe8"), 0, 1, 1);
    px(g, hx + 3, hy - 6, 6, 2, "#6a4630");
    px(g, hx + 3, hy - 2, 6, 3, "#b98a5a");
  }
  if (has(s, "tote")) {
    px(g, hx + 2, hy - 2, 1, 6, P.acc.d2);
    sbox(g, hx - 4, hy + 4, 13, 15, P.acc, 1);
    px(g, hx - 1, hy + 9, 7, 5, P.acc.l2);
  }
  if (has(s, "book")) sbox(g, hx - 2, hy - 8, 9, 12, P.acc, 1);
  if (has(s, "cane")) {
    px(g, hx + 4, hy, 2, 122 - hy + 5, "#5a3d2b");
    px(g, hx + 1, hy - 1, 5, 2, "#5a3d2b");
  }
}

// ---------- head ----------

function hairCapFront(g: Ctx, s: HumanSpec, G: Geo, P: Pal, back: boolean): void {
  const { cx, headTop: y, headW: w, headH: hh } = G;
  const x = cx - (w >> 1);
  const H = P.hair;
  const st = s.hairStyle;
  if (back) {
    if (st === "bald" || st === "receding") {
      px(g, x + 6, y + 2, 6, 2, P.skin.l2);
      rbox(g, x - 1, y + 13, w + 2, hh - 18, H.b, 2, 5);
      px(g, x + 1, y + 13, w - 2, 1, H.l1);
      return;
    }
    const down = st === "long" ? hh + 12 : st === "bob" ? hh + 1 : st === "curly" ? hh - 2 : hh - 5;
    const wide = st === "curly" ? 3 : st === "bob" || st === "long" ? 2 : 1;
    sbox(g, x - wide, y - 3, w + wide * 2, down + 3, H, 8, st === "long" ? 2 : 5);
    px(g, x + 5, y, 8, 2, H.l2);
    px(g, x + 4, y + 3, 4, 1, H.l1);
    for (let i = 0; i < 5; i++) px(g, x + 2 + i * 6, y + 8 + (i % 2) * 3, 1, down - 13, H.d1);
    if (st === "pony") {
      px(g, cx - 3, y + 8, 6, 3, P.acc.b);
      sbox(g, cx - 4, y + 11, 8, hh + 6, H, 2, 4);
    }
    if (st === "bun") {
      ell(g, cx, y - 5, 8, 6, H.b);
      ell(g, cx - 2, y - 7, 3, 2, H.l1);
    }
    if (st === "curly") for (let i = 0; i < 7; i++) ell(g, x - 2 + i * 5.5, y - 2 + (i % 2), 4, 4, i % 2 ? H.b : H.l1);
    if (st === "spiky") for (let i = 0; i < 6; i++) poly(g, [[x + i * 5, y - 2], [x + 3 + i * 5, y - 7 + (i % 2) * 2], [x + 6 + i * 5, y - 2]], H.b);
    return;
  }
  // front
  if (st === "bald" || st === "receding") {
    px(g, x - 1, y + 7, 3, 8, H.b);
    px(g, x + w - 2, y + 7, 3, 8, H.d1);
    px(g, x + 6, y + 2, 6, 2, P.skin.l2);
    if (st === "receding") {
      rbox(g, x + 1, y - 2, w - 2, 5, H.b, 4, 0);
      px(g, x + 8, y + 2, w - 16, 2, P.skin.b);
    }
    return;
  }
  const wide = st === "curly" ? 3 : st === "bob" || st === "long" ? 2 : 1;
  const capH = st === "crew" ? 7 : 10;
  sbox(g, x - wide, y - 3, w + wide * 2, capH + 1, H, 7, 0);
  px(g, x + 5, y - 1, 7, 2, H.l2);
  // sideburns / side hair
  const side = st === "long" ? hh + 12 : st === "bob" ? hh + 1 : st === "curly" ? 16 : st === "crew" ? 9 : 13;
  const sw2 = st === "long" || st === "bob" ? 4 : st === "curly" ? 4 : 2;
  px(g, x - wide, y + 4, sw2 + wide - 1, side - 4, H.b);
  px(g, x + w - sw2 + 1, y + 4, sw2 + wide - 1, side - 4, H.d1);
  // fringe
  switch (st) {
    case "short":
      px(g, x + 2, y + 7, w - 4, 2, H.b);
      for (let i = 0; i < 6; i++) px(g, x + 3 + i * 4, y + 9, 2, 1 + (i % 2), H.b);
      break;
    case "side":
    case "bun":
    case "pony":
      for (let i = 0; i < w - 2; i++) px(g, x + 1 + i, y + 6, 1, Math.max(0, Math.round(6 - i * 0.3)), H.b);
      px(g, x + 18, y + 2, 1, 5, H.d1);
      break;
    case "crew":
      px(g, x + 2, y + 4, w - 4, 2, H.d1);
      break;
    case "spiky":
      for (let i = 0; i < 7; i++) {
        poly(g, [[x - 1 + i * 4, y - 2], [x + 2 + i * 4, y - 7 + (i % 2) * 2], [x + 5 + i * 4, y - 2]], i % 2 ? H.b : H.l1);
        px(g, x + 2 + i * 4, y + 7, 2, 2 + (i % 2) * 2, H.b);
      }
      break;
    case "curly":
      for (let i = 0; i < 8; i++) ell(g, x - 3 + i * 5, y - 2 + (i % 2), 4, 4, i % 2 ? H.b : H.l1);
      for (let i = 0; i < 7; i++) ell(g, x - 1 + i * 5, y + 7, 3, 3, i % 2 ? H.d1 : H.b);
      break;
    case "bob":
      px(g, x + 2, y + 7, w - 4, 4, H.b);
      px(g, x + 2, y + 10, w - 4, 1, H.d1);
      break;
    case "long":
      if (s.fringe) {
        px(g, x + 2, y + 7, w - 4, 2, H.b);
        for (let i = 0; i < 8; i++) px(g, x + 2 + i * 3, y + 9, 2, 1 + (i % 3 === 1 ? 1 : 0), H.b);
      } else for (let i = 0; i < w - 2; i++) px(g, x + 1 + i, y + 6, 1, Math.round(Math.abs(i - (w - 2) / 2) * 0.55), H.b);
      break;
  }
  if (st === "bun") {
    ell(g, cx, y - 6, 7, 5, H.b);
    ell(g, cx - 2, y - 8, 3, 2, H.l1);
  }
  if (st === "pony") sbox(g, x + w, y + 6, 5, 16, H, 2, 3, 1);
}

function faceFront(g: Ctx, s: HumanSpec, G: Geo, P: Pal): void {
  const { cx, eyeY: e, headTop, headH, headW } = G;
  const S = P.skin;
  const browC = s.hair === "#e8e8ee" || s.hair === "#c9c9d2" ? "#8a8a96" : P.hair.d2;
  if (s.beard === "full") {
    rbox(g, cx - (headW >> 1) + 1, e + 5, headW - 2, headTop + headH - e - 5, P.hair.b, 0, 7);
    px(g, cx - 4, e + 6, 8, 2, P.hair.d1);
  } else if (s.beard === "goatee") rbox(g, cx - 4, e + 10, 8, headTop + headH - e - 10, P.hair.b, 0, 3);
  else if (s.beard === "stubble") {
    for (let j = 0; j < 6; j++) for (let i = 0; i < headW - 6; i++) if ((i + j) % 2 === 0) px(g, cx - (headW >> 1) + 3 + i, e + 7 + j, 1, 1, mix(S.b, P.hair.b, 0.35));
  }
  // blush
  px(g, cx - 12, e + 4, 3, 2, mix(S.b, "#ff6f6f", 0.32));
  px(g, cx + 9, e + 4, 3, 2, mix(S.b, "#ff6f6f", 0.32));
  // eyes
  for (const ex of [cx - 8, cx + 5]) {
    px(g, ex, e - 1, 3, 5, "#fbfbf6");
    px(g, ex, e, 3, 4, "#2a1d24");
    px(g, ex, e, 1, 1, "#ffffff");
    px(g, ex - 1, e - 4, 5, 1, browC);
  }
  if (s.senior) {
    px(g, cx - 9, e + 6, 4, 1, S.d1);
    px(g, cx + 5, e + 6, 4, 1, S.d1);
  }
  px(g, cx - 1, e + 5, 2, 2, S.d1);
  // mouth
  if (s.beard === "moustache" || s.beard === "full") rbox(g, cx - 5, e + 7, 10, 3, P.hair.d1, 1);
  px(g, cx - 3, e + 10, 6, 1, "#9a4444");
  px(g, cx - 4, e + 9, 1, 1, "#9a4444");
  px(g, cx + 3, e + 9, 1, 1, "#9a4444");
  if (s.glasses) {
    const c = s.glassesColor ?? "#20202a";
    for (const ex of [cx - 10, cx + 3]) {
      px(g, ex, e - 2, 7, 1, c);
      px(g, ex, e + 5, 7, 1, c);
      px(g, ex, e - 2, 1, 8, c);
      px(g, ex + 6, e - 2, 1, 8, c);
      if (s.glasses === "round") {
        px(g, ex, e - 2, 1, 1, S.b);
        px(g, ex + 6, e - 2, 1, 1, S.b);
        px(g, ex, e + 5, 1, 1, S.b);
        px(g, ex + 6, e + 5, 1, 1, S.b);
      }
      px(g, ex + 4, e - 1, 1, 1, "#dff1ff");
    }
    px(g, cx - 3, e, 6, 1, c);
  }
}

function headFront(g: Ctx, s: HumanSpec, G: Geo, P: Pal, back: boolean): void {
  const { cx, headTop: y, headW: w, headH: h, torsoTop } = G;
  const x = cx - (w >> 1);
  const S = P.skin;
  const st = s.hairStyle;
  // hair that hangs behind the head
  if (!back && (st === "long" || st === "bob")) sbox(g, x - 3, y + 2, w + 6, st === "long" ? h + 10 : h, P.hair, 6, 2);
  px(g, cx - 4, torsoTop - 3, 8, 5, S.d1);
  if (has(s, "scarf")) {
    rbox(g, cx - 9, torsoTop - 3, 18, 7, P.acc.b, 2);
    px(g, cx - 9, torsoTop + 1, 18, 1, P.acc.d1);
    if (!back) {
      sbox(g, cx + 2, torsoTop + 3, 6, 14, P.acc, 0, 1, 1);
      px(g, cx + 2, torsoTop + 13, 6, 1, P.acc.l2);
    }
  }
  px(g, x - 2, y + 11, 3, 6, S.b);
  px(g, x + w - 1, y + 11, 3, 6, S.d1);
  sbox(g, x, y, w, h, S, 7, 8);
  if (!back) {
    px(g, x + w - 3, y + 6, 1, h - 12, S.d1);
    faceFront(g, s, G, P);
  }
  hairCapFront(g, s, G, P, back);
  if (has(s, "cap")) {
    sbox(g, x - 1, y - 4, w + 2, 9, P.top, 5, 0);
    px(g, x - 1, y + 4, w + 2, 2, "#15161c");
    if (!back) {
      rbox(g, x - 2, y + 6, w + 4, 3, "#15161c", 0, 2);
      px(g, cx - 2, y - 2, 4, 4, "#e8c34a");
    }
  }
}

function headSide(g: Ctx, s: HumanSpec, G: Geo, P: Pal): void {
  const { cx, headTop: y, headH: h, torsoTop, eyeY: e } = G;
  const w = 26;
  const x = cx - 12;
  const S = P.skin;
  const H = P.hair;
  const st = s.hairStyle;
  if (st === "long") sbox(g, x - 3, y + 2, 14, h + 10, H, 5, 2);
  if (st === "pony") sbox(g, x - 7, y + 6, 7, 22, H, 3, 3, 1);
  px(g, cx - 3, torsoTop - 3, 8, 5, S.d1);
  if (has(s, "scarf")) {
    rbox(g, cx - 8, torsoTop - 3, 17, 7, P.acc.b, 2);
    sbox(g, cx - 9, torsoTop + 2, 6, 13, P.acc, 0, 1, 1);
  }
  sbox(g, x, y, w, h, S, 7, 8);
  px(g, x + w, e + 2, 2, 4, S.b); // nose
  px(g, x + w, e + 5, 1, 1, S.d1);
  const bald = st === "bald" || st === "receding";
  if (s.beard === "full") {
    rbox(g, x + 9, e + 5, w - 8, y + h - e - 5, H.b, 0, 6);
    px(g, x + w - 6, e + 6, 6, 2, H.d1);
  } else if (s.beard === "goatee") rbox(g, x + w - 7, e + 10, 7, y + h - e - 10, H.b, 0, 3);
  else if (s.beard === "moustache") px(g, x + w - 6, e + 7, 6, 2, H.d1);
  // hair: cap and the back of the head
  if (!bald) {
    const capH = st === "crew" ? 7 : 10;
    const wide = st === "curly" ? 3 : st === "bob" || st === "long" ? 2 : 1;
    const down = st === "long" ? h + 12 : st === "bob" ? h + 1 : st === "curly" ? h - 3 : h - 6;
    sbox(g, x - wide, y - 3, 13 + wide, down + 3, H, 8, st === "long" ? 2 : 5);
    sbox(g, x - wide, y - 3, w + wide + 1, capH, H, 7, 0);
    px(g, x + 5, y - 1, 8, 2, H.l2);
    px(g, x + 12, y + 6, 10, st === "crew" ? 0 : st === "bob" ? 5 : 3, H.b);
    px(g, x + 12, y + 6, 3, st === "crew" ? 4 : 9, H.b);
    if (st === "bun") ell(g, x + 2, y - 4, 7, 5, H.b);
    if (st === "curly") for (let i = 0; i < 7; i++) ell(g, x - 2 + i * 5, y - 2 + (i % 2), 4, 4, i % 2 ? H.b : H.l1);
    if (st === "spiky") for (let i = 0; i < 7; i++) poly(g, [[x - 1 + i * 4, y - 2], [x + 3 + i * 4, y - 7 + (i % 2) * 2], [x + 5 + i * 4, y - 2]], i % 2 ? H.b : H.l1);
  } else {
    rbox(g, x - 1, y + 12, 11, h - 18, H.b, 2, 5);
    px(g, x + 6, y + 2, 6, 2, S.l2);
    if (st === "receding") rbox(g, x, y - 2, 16, 5, H.b, 4, 0);
  }
  // ear, eye, brow, mouth
  px(g, cx - 1, y + 12, 4, 6, S.b);
  px(g, cx, y + 14, 2, 3, S.d1);
  px(g, x + w - 6, e - 1, 3, 5, "#fbfbf6");
  px(g, x + w - 5, e, 2, 4, "#2a1d24");
  px(g, x + w - 7, e - 4, 5, 1, H.d2);
  px(g, x + w - 9, e + 4, 3, 2, mix(S.b, "#ff6f6f", 0.32));
  px(g, x + w - 5, e + 10, 4, 1, "#9a4444");
  if (s.glasses) {
    const c = s.glassesColor ?? "#20202a";
    px(g, x + w - 8, e - 2, 7, 1, c);
    px(g, x + w - 8, e + 5, 7, 1, c);
    px(g, x + w - 8, e - 2, 1, 8, c);
    px(g, x + w - 2, e - 2, 1, 8, c);
    px(g, cx + 1, e, x + w - 8 - cx - 1, 1, c);
  }
  if (has(s, "cap")) {
    sbox(g, x - 1, y - 4, w + 2, 9, P.top, 5, 0);
    px(g, x - 1, y + 4, w + 2, 2, "#15161c");
    rbox(g, x + w - 6, y + 5, 12, 3, "#15161c", 0, 2);
    px(g, x + w - 5, y - 2, 4, 4, "#e8c34a");
  }
}

// ---------- accessories for the front / back views ----------

function accFront(g: Ctx, s: HumanSpec, G: Geo, P: Pal, back: boolean): void {
  const { cx, torsoTop: y, torsoH, torsoW, step } = G;
  const x = cx - (torsoW >> 1);
  const len = torsoH - 4;
  const handY = (sgn: number) => y + 2 + len + ((step === 1 && sgn === 1) || (step === -1 && sgn === -1) ? 2 : (step === 1 && sgn === -1) || (step === -1 && sgn === 1) ? -3 : 0);
  if (has(s, "backpack")) {
    if (back) {
      sbox(g, cx - 12, y + 2, 24, Math.min(30, torsoH - 2), P.acc, 4);
      px(g, cx - 7, y + 14, 14, 1, P.acc.d2);
      sbox(g, cx - 7, y + 15, 14, 9, dark(P.acc), 1, 2, 1);
      px(g, cx - 2, y + 2, 4, 2, P.acc.d2);
      px(g, cx - 6, y + 5, 4, 1, P.acc.l2);
    } else {
      px(g, x + 3, y, 3, 20, P.acc.b);
      px(g, x + torsoW - 6, y, 3, 20, P.acc.d1);
      px(g, x + 3, y + 18, 3, 2, P.acc.d2);
      px(g, x + torsoW - 6, y + 18, 3, 2, P.acc.d2);
    }
  }
  if (back) return;
  if (has(s, "lanyard")) {
    line(g, cx - 5, y, cx - 1, y + 16, "#1e7a55");
    line(g, cx + 4, y, cx, y + 16, "#1e7a55");
    px(g, cx - 3, y + 16, 6, 7, "#f6f6f0");
    px(g, cx - 2, y + 18, 4, 2, "#1e7a55");
    px(g, cx - 2, y + 21, 3, 1, "#8a8a96");
  }
  if (has(s, "coffee")) {
    const hx = x + torsoW + 1;
    const hy = handY(1);
    sbox(g, hx - 1, hy - 5, 7, 9, tones("#f1efe8"), 0, 1, 1);
    px(g, hx - 1, hy - 5, 7, 2, "#6a4630");
    px(g, hx - 1, hy - 1, 7, 3, "#b98a5a");
  }
  if (has(s, "laptop")) {
    sbox(g, x - 6, y + 16, 15, 11, tones("#b9bcc6"), 1);
    px(g, x - 1, y + 20, 4, 3, "#eceef2");
    px(g, x - 6, y + 25, 15, 2, "#7d808c");
    sbox(g, x - 4, y + 22, 5, 5, P.skin, 1, 1, 1);
  }
  if (has(s, "book")) {
    sbox(g, x + torsoW - 6, y + 18, 11, 13, P.acc, 1);
    px(g, x + torsoW - 5, y + 19, 1, 11, "#f1efe8");
    px(g, x + torsoW - 2, y + 22, 5, 2, P.acc.l2);
  }
  if (has(s, "tote")) {
    const hx = x - 7;
    const hy = handY(-1);
    px(g, hx + 3, hy + 3, 1, 5, P.acc.d2);
    px(g, hx + 7, hy + 3, 1, 5, P.acc.d2);
    sbox(g, hx - 1, hy + 8, 13, 15, P.acc, 1);
    px(g, hx + 2, hy + 12, 7, 5, P.acc.l2);
    px(g, hx + 4, hy + 13, 3, 3, "#1e7a55");
  }
  if (has(s, "cane")) {
    const hx = x + torsoW + 2;
    const hy = handY(1);
    px(g, hx + 1, hy + 2, 2, 127 - hy - 2, "#5a3d2b");
    px(g, hx - 2, hy + 1, 5, 2, "#5a3d2b");
    px(g, hx + 1, hy + 2, 1, 127 - hy - 2, "#8a6444");
  }
}

// ---------- assembly ----------

function frame(s: HumanSpec, dir: "down" | "up" | "right", f: number): HTMLCanvasElement {
  const [c, g] = mk(64, 128);
  const G = geo(s, f);
  const P = pal(s);
  if (dir === "right") {
    legsSide(g, s, G, P);
    torsoSide(g, s, G, P);
    headSide(g, s, G, P);
  } else {
    const back = dir === "up";
    legsFront(g, s, G, P, back);
    torsoFront(g, s, G, P, back);
    headFront(g, s, G, P, back);
    accFront(g, s, G, P, back);
  }
  outline(c);
  return c;
}

export function humanFrames(s: HumanSpec): Record<"down" | "up" | "left" | "right", HTMLCanvasElement[]> {
  const right = [0, 1, 2, 3].map((f) => frame(s, "right", f));
  return {
    down: [0, 1, 2, 3].map((f) => frame(s, "down", f)),
    up: [0, 1, 2, 3].map((f) => frame(s, "up", f)),
    right,
    left: right.map(flipH),
  };
}
