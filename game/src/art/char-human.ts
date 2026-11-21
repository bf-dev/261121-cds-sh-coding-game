// Parametric chibi human sprite, 64 x 128, feet at the bottom centre: a big round head
// (about half the figure), a short body, stubby arms and legs, big shiny eyes.
// One generator draws the student, the 14 teachers, the guard and the visitors.

import { mk, type Ctx } from "./px";
import { tones, px, rbox, sbox, limb, ell, sell, sellTop, poly, line, outline, flipH, mix, type Tones } from "./char-draw";

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
  /** head centre */
  cy: number;
  shoeTop: number;
  step: number;
  /** top row of the eyes */
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
const INK = "#3a2530";
const N = 2.8; // squareness of the head

function geo(s: HumanSpec, f: number): Geo {
  const H = s.height ?? 118;
  const headH = s.child ? 36 : 42;
  const headW = s.child ? 40 : 46;
  const torsoH = s.child ? 19 : 25;
  const legH = s.child ? 9 : Math.max(11, Math.min(18, 15 + Math.round((H - 118) * 0.4)));
  const step = f === 1 ? 1 : f === 3 ? -1 : 0;
  const bob = step ? 2 : 0; // a small bounce on every step
  const shoeTop = 122;
  const hipY = shoeTop - legH + bob;
  const torsoTop = hipY - torsoH;
  const headTop = torsoTop + 3 - headH;
  return { cx: 32, hipY, torsoTop, torsoH, torsoW: (s.child ? 22 : 26) + (s.build ?? 0), headTop, headH, headW, cy: headTop + (headH >> 1), shoeTop, step, eyeY: headTop + Math.round(headH * 0.5) };
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

function legsFront(g: Ctx, s: HumanSpec, G: Geo, P: Pal): void {
  const { cx, hipY, shoeTop, step } = G;
  const lw = s.child ? 9 : 11;
  const pants = s.bottom === "trousers" || s.bottom === "jeans";
  for (const sgn of [-1, 1]) {
    const lifted = (step === 1 && sgn === -1) || (step === -1 && sgn === 1);
    const lx = sgn < 0 ? cx - lw : cx;
    const bottom = shoeTop - (lifted ? 3 : 0);
    const lh = bottom - hipY;
    if (pants) {
      sbox(g, lx, hipY, lw, lh, P.bottom, 0, 0);
      if (s.bottom === "jeans") px(g, lx + (sgn < 0 ? lw - 4 : 3), hipY + 3, 1, lh - 4, P.bottom.l1);
    } else {
      const cut = s.bottom === "shorts" ? Math.min(6, lh - 3) : 0;
      if (cut) sbox(g, lx, hipY, lw, cut, P.bottom, 0, 0);
      sbox(g, lx + 1, hipY + cut, lw - 2, lh - cut, s.bottom === "skirt" ? tones("#3a3440") : P.skin, 0, 0);
      if (s.bottom === "shorts") px(g, lx + 1, bottom - 3, lw - 2, 3, "#f1efe8");
    }
    // round little shoes
    sbox(g, lx - (sgn < 0 ? 1 : 0), bottom, lw + 1, 6, P.shoes, 3, 1, 1);
    px(g, lx + (sgn < 0 ? 0 : 1), bottom + 5, lw - 1, 1, P.shoes.d2);
    px(g, lx + (sgn < 0 ? 1 : 2), bottom + 1, 3, 1, P.shoes.l2);
  }
  if (pants) px(g, cx - 1, hipY + 3, 2, shoeTop - hipY - 5, P.bottom.d2);
  if (s.bottom === "skirt") {
    const y0 = hipY - 2;
    poly(g, [[cx - 12, y0], [cx + 12, y0], [cx + 15, y0 + 11], [cx - 15, y0 + 11]], P.bottom.b);
    poly(g, [[cx + 8, y0], [cx + 12, y0], [cx + 15, y0 + 11], [cx + 10, y0 + 11]], P.bottom.d1);
    px(g, cx - 14, y0 + 10, 28, 1, P.bottom.d1);
  }
}

function legsSide(g: Ctx, s: HumanSpec, G: Geo, P: Pal): void {
  const { cx, hipY, shoeTop, step } = G;
  const lw = s.child ? 9 : 11;
  const draw = (off: number, far: boolean) => {
    const T = far ? dark(P.bottom) : P.bottom;
    const S = far ? dark(P.skin) : P.skin;
    const SH = far ? dark(P.shoes) : P.shoes;
    const x0 = cx - 5;
    const x1 = x0 + off;
    const lift = off < 0 ? 2 : 0; // trailing heel comes up
    const bottom = shoeTop - lift;
    if (s.bottom === "trousers" || s.bottom === "jeans") limb(g, x0, hipY, x1, bottom, lw, T);
    else {
      const cut = s.bottom === "shorts" ? Math.min(6, bottom - hipY - 3) : 0;
      const xm = x0 + (off * cut) / Math.max(1, bottom - hipY);
      if (cut) limb(g, x0, hipY, xm, hipY + cut, lw, T);
      limb(g, xm + 1, hipY + cut, x1 + 1, bottom, lw - 2, s.bottom === "skirt" ? (far ? dark(tones("#3a3440")) : tones("#3a3440")) : S);
    }
    sbox(g, x1 - 1, bottom, lw + 4, 6, SH, 3, 1, 1);
    px(g, x1, bottom + 5, lw + 2, 1, SH.d2);
  };
  if (step === 0) {
    draw(1, true);
    draw(-1, false);
  } else {
    draw(step * 5, true);
    draw(-step * 5, false);
  }
  if (s.bottom === "skirt") {
    const y0 = hipY - 2;
    poly(g, [[cx - 9, y0], [cx + 9, y0], [cx + 12, y0 + 11], [cx - 12, y0 + 11]], P.bottom.b);
    px(g, cx - 11, y0 + 10, 22, 1, P.bottom.d1);
  }
}

// ---------- torso ----------

function torsoFront(g: Ctx, s: HumanSpec, G: Geo, P: Pal, back: boolean): void {
  const { cx, torsoTop: y, torsoH, torsoW, step } = G;
  const x = cx - (torsoW >> 1);
  const n = y + 3; // first row under the chin
  const long = s.top === "coat" ? 6 : 0;
  const h = torsoH + 1 + long;
  const T = P.top;
  if (long) sbox(g, x - 1, y + torsoH - 2, torsoW + 2, long + 3, T, 0, 2);
  sbox(g, x, y, torsoW, torsoH + 1, T, 5, 2);
  if (!back) {
    const V = (wide: number, deep: number, col: string) => poly(g, [[cx - wide, n], [cx + wide, n], [cx, n + deep]], col);
    switch (s.top) {
      case "hoodie":
        rbox(g, cx - 10, n - 1, 20, 5, T.d1, 2);
        px(g, cx - 4, n + 4, 1, 6, "#f1efe8");
        px(g, cx + 3, n + 4, 1, 6, "#f1efe8");
        rbox(g, x + 5, y + torsoH - 9, torsoW - 10, 6, T.d1, 2);
        rbox(g, x + 6, y + torsoH - 8, torsoW - 12, 5, T.l1, 2);
        px(g, x + 2, y + torsoH - 1, torsoW - 4, 2, T.d2);
        break;
      case "cardigan":
        px(g, cx - 4, n, 8, h - 3, P.shirt.b);
        px(g, cx - 5, n, 1, h - 3, T.d2);
        px(g, cx + 4, n, 1, h - 3, T.d2);
        px(g, cx - 3, n, 2, 2, P.shirt.l2);
        px(g, cx + 1, n, 2, 2, P.shirt.l2);
        for (let i = 0; i < 3; i++) px(g, cx + 6, n + 5 + i * 5, 2, 2, T.l2);
        break;
      case "shirt":
      case "polo":
        poly(g, [[cx - 7, n - 1], [cx, n + 4], [cx - 1, n + 6], [cx - 8, n + 2]], T.l2);
        poly(g, [[cx + 7, n - 1], [cx, n + 4], [cx + 1, n + 6], [cx + 8, n + 2]], T.l1);
        px(g, cx, n + 5, 1, s.top === "polo" ? 7 : h - 9, T.d1);
        if (s.top === "polo") for (let i = 0; i < 2; i++) px(g, cx - 1, n + 6 + i * 3, 1, 1, T.l2);
        else {
          px(g, x + 4, n + 8, 4, 1, T.d1);
          px(g, x + 4, n + 8, 1, 4, T.d1);
          if (s.tie) px(g, cx - 1, n + 3, 3, 12, s.tie);
        }
        if (s.check) {
          for (let xx = x + 3; xx < x + torsoW - 2; xx += 4) if (Math.abs(xx - cx) > 1) px(g, xx, n + 7, 1, h - 11, s.check);
          for (let yy = n + 9; yy < y + h - 2; yy += 4) px(g, x + 2, yy, torsoW - 4, 1, s.check);
        }
        if (s.trim) {
          line(g, cx - 8, n + 2, cx - 1, n + 6, s.trim, 1);
          line(g, cx + 8, n + 2, cx + 1, n + 6, s.trim, 1);
        }
        px(g, x + 2, y + torsoH - 1, torsoW - 4, 2, "#2a2530");
        break;
      case "blazer":
      case "suit":
      case "coat":
        V(8, 14, T.d2);
        V(6, 11, P.shirt.b);
        if (s.tie) {
          px(g, cx - 2, n, 4, 3, s.tie);
          poly(g, [[cx - 1, n + 3], [cx + 1, n + 3], [cx + 2, n + 9], [cx, n + 11], [cx - 2, n + 9]], s.tie);
        }
        px(g, cx, n + 12, 1, h - 15, T.d2);
        px(g, cx + 2, n + 15, 2, 2, T.l2);
        px(g, x + 3, n + 9, 4, 1, s.top === "coat" ? T.d1 : P.shirt.l1);
        if (s.top === "coat") {
          px(g, x + 3, y + h - 6, 5, 1, T.d1);
          px(g, x + torsoW - 8, y + h - 6, 5, 1, T.d1);
        }
        break;
      case "sweater":
        rbox(g, cx - 8, n - 1, 16, 4, T.l1, 2);
        px(g, cx - 5, n, 3, 2, P.shirt.l2);
        px(g, cx + 2, n, 3, 2, P.shirt.l2);
        px(g, x + 2, y + torsoH - 2, torsoW - 4, 1, T.d2);
        break;
      case "vest":
        V(6, 10, P.shirt.b);
        if (s.tie) px(g, cx - 1, n + 1, 2, 8, s.tie);
        for (let i = 0; i < 3; i++) px(g, x + 3, n + 11 + i * 3, torsoW - 6, 1, T.d1);
        break;
      case "uniform":
        V(5, 8, "#dfe6ee");
        px(g, cx - 1, n, 2, 7, "#1a1e2a");
        px(g, x + 3, n + 6, 4, 4, "#e8c34a");
        px(g, x + 4, n + 7, 2, 2, "#fff6c8");
        px(g, x + 1, y + 3, 5, 2, "#e8c34a");
        px(g, x + torsoW - 6, y + 3, 5, 2, "#c99f2f");
        px(g, x + 1, y + torsoH - 3, torsoW - 2, 3, "#15161c");
        px(g, cx - 2, y + torsoH - 3, 4, 3, "#c9c9d2");
        break;
    }
  } else {
    if (s.top === "hoodie") {
      rbox(g, cx - 10, n - 2, 20, 10, T.d1, 3, 6);
      rbox(g, cx - 8, n - 1, 16, 7, T.l1, 2, 5);
    }
    if (s.top === "blazer" || s.top === "suit" || s.top === "coat") px(g, cx, n + 3, 1, h - 6, T.d1);
    if (s.top === "uniform") px(g, x + 1, y + torsoH - 3, torsoW - 2, 3, "#15161c");
  }
  // stubby arms with mitten hands
  const len = torsoH - 8;
  for (const sgn of [-1, 1]) {
    const fwd = (step === 1 && sgn === 1) || (step === -1 && sgn === -1);
    const bk = (step === 1 && sgn === -1) || (step === -1 && sgn === 1);
    const l = len + (fwd ? 2 : bk ? -2 : 0);
    const aw = s.child ? 6 : 7;
    const ax = sgn < 0 ? x - aw + 2 : x + torsoW - 2;
    const short = s.top === "polo" ? 8 : l;
    sbox(g, ax, y + 4, aw, Math.min(short, l), P.sleeve, 3, 0);
    if (short < l) sbox(g, ax + 1, y + 4 + short, aw - 2, l - short, P.skin, 0, 0, 1);
    else if (s.top === "hoodie" || s.top === "sweater") px(g, ax, y + 2 + l, aw, 2, P.sleeve.d2);
    else if (s.top === "blazer" || s.top === "suit") px(g, ax, y + 3 + l, aw, 1, P.shirt.l1);
    sbox(g, ax, y + 4 + l, aw, 5, P.skin, 1, 3, 1);
    px(g, sgn < 0 ? ax + aw - 1 : ax, y + 8, 1, Math.min(short, l) - 5, P.sleeve.d2);
  }
}

function torsoSide(g: Ctx, s: HumanSpec, G: Geo, P: Pal): void {
  const { cx, torsoTop: y, torsoH, step } = G;
  const w = (s.child ? 15 : 18) + ((s.build ?? 0) >> 1);
  const x = cx - 9;
  const T = P.top;
  if (has(s, "backpack")) {
    sbox(g, x - 8, y + 4, 10, Math.min(18, torsoH - 5), P.acc, 3);
    px(g, x - 6, y + 12, 6, 1, P.acc.d2);
    px(g, x - 6, y + 13, 6, 4, P.acc.d1);
  }
  if (s.top === "coat") sbox(g, x - 1, y + torsoH - 2, w + 2, 8, T, 0, 2);
  sbox(g, x, y, w, torsoH + 1, T, 5, 2);
  if (s.top === "hoodie") rbox(g, x - 3, y + 2, 9, 8, T.d1, 3);
  if (s.top === "cardigan" || s.top === "blazer" || s.top === "suit" || s.top === "coat" || s.top === "vest") {
    px(g, x + w - 3, y + 4, 3, torsoH - 4, P.shirt.b);
    px(g, x + w - 4, y + 4, 1, torsoH - 4, T.d2);
    if (s.tie) px(g, x + w - 2, y + 4, 2, 9, s.tie);
  }
  if (s.top === "uniform") {
    px(g, x, y + torsoH - 3, w, 3, "#15161c");
    px(g, x + w - 6, y + 9, 3, 3, "#e8c34a");
  }
  if (s.top === "shirt" || s.top === "polo") px(g, x, y + torsoH - 1, w, 2, "#2a2530");
  if (has(s, "backpack")) px(g, x + 3, y + 3, 3, 10, P.acc.d1);
  if (has(s, "lanyard")) {
    px(g, x + w - 3, y + 4, 1, 9, "#1e7a55");
    px(g, x + w - 4, y + 13, 3, 4, "#f6f6f0");
  }
  if (has(s, "laptop")) {
    sbox(g, x + 3, y + 10, 12, 9, tones("#b9bcc6"), 1);
    px(g, x + 8, y + 13, 3, 2, "#eceef2");
  }
  // near arm swings against the near leg
  const len = torsoH - 8;
  const sw = has(s, "laptop") ? 0 : step * 4;
  const ax = cx - 4;
  const short = s.top === "polo" ? 8 : len;
  const xm = ax + (sw * short) / len;
  limb(g, ax, y + 5, xm, y + 5 + short, 7, P.sleeve);
  if (short < len) limb(g, xm + 1, y + 5 + short, ax + sw + 1, y + 5 + len, 5, P.skin);
  rbox(g, ax, y + 4, 7, 3, P.sleeve.l1, 2, 0);
  sbox(g, ax + sw, y + 4 + len, 7, 5, P.skin, 1, 3, 1);
  const hx = ax + sw + 1;
  const hy = y + 4 + len;
  if (has(s, "coffee")) {
    sbox(g, hx + 3, hy - 5, 6, 8, tones("#f1efe8"), 0, 1, 1);
    px(g, hx + 3, hy - 5, 6, 2, "#6a4630");
    px(g, hx + 3, hy - 1, 6, 2, "#b98a5a");
  }
  if (has(s, "tote")) {
    px(g, hx + 2, hy + 2, 1, 4, P.acc.d2);
    sbox(g, hx - 4, hy + 5, 12, 11, P.acc, 1);
    px(g, hx - 1, hy + 8, 6, 4, P.acc.l2);
  }
  if (has(s, "book")) sbox(g, hx - 2, hy - 7, 9, 10, P.acc, 1);
  if (has(s, "cane")) {
    px(g, hx + 4, hy, 2, 127 - hy, "#5a3d2b");
    px(g, hx + 1, hy - 1, 5, 2, "#5a3d2b");
  }
}

// ---------- head ----------

/** the fringe: bottom row of the hair at column dx, for the front view */
function fringe(s: HumanSpec, y: number, dx: number, hrx: number): number {
  const m = dx + 100;
  const a = Math.abs(dx);
  switch (s.hairStyle) {
    case "short":
      return y + 12 + (m % 6 < 3 ? 2 : 0);
    case "spiky":
      return y + 10 + (m % 8 < 4 ? m % 8 : 8 - (m % 8));
    case "crew":
      return y + 9;
    case "curly":
      return y + 12 + Math.round(Math.sin(dx * 0.9) * 2);
    case "bob":
      return y + 14;
    case "long":
      return s.fringe ? y + 13 + (m % 5 < 2 ? 2 : 0) : y + 5 + Math.round(a * 0.5);
    default: // side, bun, pony: swept across from one temple
      return y + 16 - Math.round((dx + hrx) * 0.24);
  }
}

function hairFront(g: Ctx, s: HumanSpec, G: Geo, P: Pal): void {
  const { cx, headTop: y, headW, headH, cy } = G;
  const rx = headW >> 1;
  const ry = headH >> 1;
  const H = P.hair;
  const st = s.hairStyle;
  if (st === "bald" || st === "receding") {
    px(g, cx - rx - 1, y + ry - 6, 3, 10, H.b);
    px(g, cx + rx - 2, y + ry - 6, 3, 10, H.d1);
    px(g, cx - 9, y + 4, 8, 2, P.skin.l2);
    if (st === "receding") rbox(g, cx - rx + 4, y - 2, headW - 8, 6, H.b, 5, 0);
    return;
  }
  const wide = st === "curly" || st === "bob" || st === "long" ? 3 : 2;
  const hrx = rx + wide;
  const hry = ry + 2;
  const hcy = cy - 2;
  const sideFrom = rx - 4;
  const side = st === "long" ? headH + 5 : st === "bob" ? headH - 4 : st === "curly" ? 24 : st === "crew" ? 15 : 20;
  for (let dx = -hrx; dx < hrx; dx++) {
    const a = Math.abs(dx);
    let t = sellTop(hcy, hrx, hry, dx, N);
    if (st === "spiky" && a < hrx - 4) t -= (dx + 100) % 8 < 4 ? (dx + 100) % 8 : 8 - ((dx + 100) % 8);
    let b = fringe(s, y, dx, hrx);
    if (a > sideFrom) b = Math.max(b, y + side);
    if (b > t) {
      px(g, cx + dx, t, 1, b - t, dx > hrx * 0.5 ? H.d1 : H.b);
      if (a <= sideFrom) px(g, cx + dx, b - 1, 1, 1, H.d1);
    }
  }
  // gloss
  for (let dx = -15; dx <= -3; dx++) px(g, cx + dx, sellTop(hcy, hrx, hry, dx, N) + 3 + Math.round(Math.abs(dx + 9) * 0.4), 1, 2, H.l2);
  if (st === "side" || st === "bun" || st === "pony") line(g, cx + 10, y - 2, cx + 13, y + 5, H.d2, 1);
  if (st === "curly") for (let i = 0; i < 9; i++) ell(g, cx - hrx + 3 + i * 6, y - 2 + (i % 2) * 2, 4, 4, i % 2 ? H.b : H.l1);
  if (st === "bun") {
    ell(g, cx, y - 8, 8, 6, H.b);
    ell(g, cx - 2, y - 10, 3, 2, H.l1);
  }
  if (st === "pony") {
    sbox(g, cx + rx + 1, y + 12, 6, 20, H, 3, 3, 1);
    px(g, cx + rx, y + 12, 6, 3, P.acc.b);
  }
}

function hairBack(g: Ctx, s: HumanSpec, G: Geo, P: Pal): void {
  const { cx, headTop: y, headW, headH, cy } = G;
  const rx = headW >> 1;
  const ry = headH >> 1;
  const H = P.hair;
  const st = s.hairStyle;
  if (st === "bald" || st === "receding") {
    rbox(g, cx - rx - 1, y + ry, headW + 2, ry - 7, H.b, 2, 6);
    px(g, cx - 9, y + 4, 8, 2, P.skin.l2);
    return;
  }
  const wide = st === "curly" || st === "bob" || st === "long" ? 3 : 2;
  const hrx = rx + wide;
  const hry = ry + 2;
  const hcy = cy - 2;
  const down = st === "long" ? headH + 5 : st === "bob" ? headH - 3 : st === "curly" ? headH - 6 : headH - 9;
  if (st === "long") sbox(g, cx - hrx, y + ry, hrx * 2, down - ry, H, 0, 4);
  sell(g, cx, hcy, hrx, hry, H.d1, N, -1e9, y + down);
  sell(g, cx - 2, hcy - 1, hrx - 2, hry - 1, H.b, N, -1e9, y + down - 2);
  for (let i = 0; i < 5; i++) px(g, cx - hrx + 6 + i * 9, y + 12 + (i % 2) * 3, 1, down - 20, H.d1);
  px(g, cx - 13, y + 2, 10, 2, H.l2);
  if (st === "spiky") for (let i = 0; i < 6; i++) poly(g, [[cx - hrx + 5 + i * 7, y - 1], [cx - hrx + 8 + i * 7, y - 7 + (i % 2) * 2], [cx - hrx + 12 + i * 7, y - 1]], H.b);
  if (st === "curly") for (let i = 0; i < 9; i++) ell(g, cx - hrx + 3 + i * 6, y - 2 + (i % 2) * 2, 4, 4, i % 2 ? H.b : H.l1);
  if (st === "pony") {
    px(g, cx - 3, y + 12, 6, 3, P.acc.b);
    sbox(g, cx - 4, y + 15, 8, headH - 2, H, 2, 4);
  }
  if (st === "bun") {
    ell(g, cx, y - 6, 9, 7, H.b);
    ell(g, cx - 2, y - 9, 3, 2, H.l1);
  }
}

/** one big shiny eye */
function eye(g: Ctx, x: number, y: number, w: number, h: number): void {
  rbox(g, x, y, w, h, INK, 2);
  px(g, x + 1, y + h - 3, w - 2, 2, "#6b4636");
  px(g, x + 1, y + 1, 2, 3, "#ffffff");
  px(g, x + w - 2, y + h - 3, 1, 1, "#ffffff");
}

function faceFront(g: Ctx, s: HumanSpec, G: Geo, P: Pal): void {
  const { cx, eyeY: e, headTop, headH, headW } = G;
  const S = P.skin;
  const ew = s.child ? 5 : 6;
  const eh = s.child ? 7 : 8;
  const eo = s.child ? 6 : 7;
  const light = s.hair === "#e8e8ee" || s.hair === "#c9c9d2" || s.hair === "#8f8f9b";
  const browC = light ? "#8a8a96" : P.hair.d2;
  const blush = mix(S.b, "#ff7286", 0.5);
  if (s.beard === "full") sell(g, cx, headTop + (headH >> 1), (headW >> 1) - 1, (headH >> 1) - 1, P.hair.b, N, e + eh + 2, 1e9);
  else if (s.beard === "goatee") rbox(g, cx - 4, e + eh + 6, 8, 5, P.hair.b, 0, 3);
  else if (s.beard === "stubble") for (let j = 0; j < 6; j++) for (let i = -10; i < 10; i++) if ((i + j) % 2 === 0) px(g, cx + i, e + eh + 3 + j, 1, 1, mix(S.b, P.hair.b, 0.3));
  // rosy cheeks
  rbox(g, cx - eo - ew - 5, e + eh, 6, 3, blush, 1);
  rbox(g, cx + eo + ew - 1, e + eh, 6, 3, blush, 1);
  for (const ex of [cx - eo - ew, cx + eo]) {
    eye(g, ex, e, ew, eh);
    px(g, ex, e - 4, ew, 1, browC);
  }
  if (s.senior) {
    px(g, cx - eo - ew, e + eh + 1, ew, 1, S.d1);
    px(g, cx + eo, e + eh + 1, ew, 1, S.d1);
  }
  // a small smile
  const my = e + eh + 4;
  if (s.beard === "moustache" || s.beard === "full") rbox(g, cx - 5, my - 3, 10, 3, P.hair.d1, 1);
  px(g, cx - 2, my + 1, 4, 1, "#b0504e");
  px(g, cx - 3, my, 1, 1, "#b0504e");
  px(g, cx + 2, my, 1, 1, "#b0504e");
  if (s.glasses) {
    const c = s.glassesColor ?? "#20202a";
    for (const ex of [cx - eo - ew - 2, cx + eo - 2]) {
      const w = ew + 4;
      const h = eh + 4;
      px(g, ex, e - 2, w, 1, c);
      px(g, ex, e - 3 + h, w, 1, c);
      px(g, ex, e - 2, 1, h, c);
      px(g, ex + w - 1, e - 2, 1, h, c);
      if (s.glasses === "round") {
        for (const [qx, qy] of [[ex, e - 2], [ex + w - 1, e - 2], [ex, e - 3 + h], [ex + w - 1, e - 3 + h]]) px(g, qx, qy, 1, 1, S.b);
      }
      px(g, ex + w - 3, e - 1, 1, 2, "#e8f6ff");
    }
    px(g, cx - eo + 1, e + 1, eo * 2 - 2, 1, c);
    px(g, cx - (headW >> 1), e + 1, (headW >> 1) - eo - ew - 2, 1, c);
    px(g, cx + eo + ew + 2, e + 1, (headW >> 1) - eo - ew - 2, 1, c);
  }
}

function capFront(g: Ctx, G: Geo, P: Pal, back: boolean): void {
  const { cx, headTop: y, headW, headH, cy } = G;
  const hrx = (headW >> 1) + 2;
  sell(g, cx, cy - 2, hrx, (headH >> 1) + 3, P.top.b, N, -1e9, y + 8);
  sell(g, cx - 6, cy - 3, hrx - 9, (headH >> 1), P.top.l1, N, y - 1, y + 1);
  px(g, cx - hrx, y + 7, hrx * 2, 3, "#15161c");
  if (!back) {
    rbox(g, cx - hrx - 1, y + 10, hrx * 2 + 2, 4, "#1f2028", 0, 3);
    rbox(g, cx - 3, y - 1, 6, 6, "#e8c34a", 2);
  }
}

function headFront(g: Ctx, s: HumanSpec, G: Geo, P: Pal, back: boolean): void {
  const { cx, headTop: y, headW: w, headH: h, cy, torsoTop, eyeY: e } = G;
  const rx = w >> 1;
  const ry = h >> 1;
  const S = P.skin;
  const st = s.hairStyle;
  // hair that hangs behind the head
  if (!back && (st === "long" || st === "bob")) sbox(g, cx - rx - 3, y + 4, w + 6, st === "long" ? h + 4 : h - 3, P.hair, 8, 3);
  if (has(s, "scarf")) {
    rbox(g, cx - 11, torsoTop + 1, 22, 6, P.acc.b, 2);
    px(g, cx - 11, torsoTop + 5, 22, 1, P.acc.d1);
    if (!back) {
      sbox(g, cx + 3, torsoTop + 6, 6, 10, P.acc, 0, 1, 1);
      px(g, cx + 3, torsoTop + 13, 6, 1, P.acc.l2);
    }
  }
  // ears
  px(g, cx - rx - 2, e + 1, 4, 6, S.b);
  px(g, cx + rx - 2, e + 1, 4, 6, S.d1);
  sell(g, cx, cy, rx, ry, S.d1, N);
  sell(g, cx - 1, cy - 1, rx - 1, ry - 1, S.b, N);
  if (back) hairBack(g, s, G, P);
  else {
    faceFront(g, s, G, P);
    hairFront(g, s, G, P);
  }
  if (has(s, "cap")) capFront(g, G, P, back);
}

function headSide(g: Ctx, s: HumanSpec, G: Geo, P: Pal): void {
  const { headTop: y, headW, headH: h, cy, torsoTop, eyeY: e } = G;
  const cx = G.cx + 1;
  const rx = (headW >> 1) - 2;
  const ry = h >> 1;
  const S = P.skin;
  const H = P.hair;
  const st = s.hairStyle;
  const ew = s.child ? 4 : 5;
  const eh = s.child ? 7 : 8;
  if (st === "long") sbox(g, cx - rx - 3, y + 4, 16, h + 4, H, 6, 3);
  if (st === "pony") {
    sbox(g, cx - rx - 8, y + 12, 9, 22, H, 3, 4, 1);
    px(g, cx - rx - 3, y + 12, 4, 4, P.acc.b);
  }
  if (has(s, "scarf")) {
    rbox(g, cx - 10, torsoTop + 1, 20, 6, P.acc.b, 2);
    sbox(g, cx - 11, torsoTop + 5, 6, 10, P.acc, 0, 1, 1);
  }
  sell(g, cx, cy, rx, ry, S.d1, N);
  sell(g, cx + 1, cy - 1, rx - 1, ry - 1, S.b, N);
  px(g, cx + rx, e + 4, 2, 3, S.b); // a button nose
  const bald = st === "bald" || st === "receding";
  if (s.beard === "full") sell(g, cx + 4, cy, rx - 5, ry - 1, H.b, N, e + eh + 2, 1e9);
  else if (s.beard === "goatee") rbox(g, cx + rx - 9, e + eh + 6, 7, 5, H.b, 0, 3);
  else if (s.beard === "moustache") px(g, cx + rx - 8, e + eh + 1, 7, 2, H.d1);
  if (!bald) {
    const wide = st === "curly" || st === "bob" || st === "long" ? 3 : 2;
    const hrx = rx + wide;
    const hry = ry + 2;
    const hcy = cy - 2;
    const down = st === "long" ? h + 5 : st === "bob" ? h - 3 : st === "curly" ? h - 6 : h - 9;
    for (let dx = -hrx; dx < hrx; dx++) {
      let t = sellTop(hcy, hrx, hry, dx, N);
      if (st === "spiky" && Math.abs(dx) < hrx - 4) t -= (dx + 100) % 8 < 4 ? (dx + 100) % 8 : 8 - ((dx + 100) % 8);
      let b: number;
      if (dx < -4) b = st === "long" ? y + down : Math.min(y + down, 2 * hcy - sellTop(hcy, hrx, hry, dx, N));
      else if (dx < 1) b = y + (st === "crew" ? 14 : st === "bob" || st === "long" ? 26 : 18);
      else b = Math.min(fringe(s, y, dx - 10, hrx), y + 15);
      if (b > t) px(g, cx + dx, t, 1, b - t, dx < -hrx * 0.45 ? H.d1 : H.b);
    }
    for (let dx = -6; dx <= 6; dx++) px(g, cx + dx, sellTop(hcy, hrx, hry, dx, N) + 3 + Math.round(Math.abs(dx) * 0.3), 1, 2, H.l2);
    if (st === "bun") ell(g, cx - 8, y - 6, 8, 6, H.b);
    if (st === "curly") for (let i = 0; i < 8; i++) ell(g, cx - hrx + 3 + i * 6, y - 2 + (i % 2) * 2, 4, 4, i % 2 ? H.b : H.l1);
  } else {
    rbox(g, cx - rx - 1, y + ry, 13, ry - 7, H.b, 2, 6);
    px(g, cx - 2, y + 4, 8, 2, S.l2);
    if (st === "receding") rbox(g, cx - rx + 2, y - 2, 18, 6, H.b, 5, 0);
  }
  // ear, eye, brow, cheek, smile
  px(g, cx - 5, e + 1, 4, 6, S.b);
  px(g, cx - 4, e + 3, 2, 3, S.d1);
  const ex = cx + rx - ew - 4;
  eye(g, ex, e, ew, eh);
  px(g, ex - 1, e - 4, ew + 1, 1, st === "bun" && s.senior ? "#8a8a96" : H.d2);
  rbox(g, ex - 6, e + eh, 5, 3, mix(S.b, "#ff7286", 0.5), 1);
  px(g, ex + 1, e + eh + 5, 4, 1, "#b0504e");
  px(g, ex, e + eh + 4, 1, 1, "#b0504e");
  if (s.glasses) {
    const c = s.glassesColor ?? "#20202a";
    const w = ew + 4;
    const gh = eh + 4;
    px(g, ex - 2, e - 2, w, 1, c);
    px(g, ex - 2, e - 3 + gh, w, 1, c);
    px(g, ex - 2, e - 2, 1, gh, c);
    px(g, ex + w - 3, e - 2, 1, gh, c);
    px(g, cx - 2, e + 1, ex - cx, 1, c);
  }
  if (has(s, "cap")) {
    const hrx = rx + 2;
    sell(g, cx, cy - 2, hrx, ry + 3, P.top.b, N, -1e9, y + 8);
    px(g, cx - hrx, y + 7, hrx * 2, 3, "#15161c");
    rbox(g, cx + hrx - 8, y + 10, 14, 4, "#1f2028", 0, 3);
    rbox(g, cx + hrx - 9, y, 5, 5, "#e8c34a", 2);
  }
}

// ---------- accessories for the front / back views ----------

function accFront(g: Ctx, s: HumanSpec, G: Geo, P: Pal, back: boolean): void {
  const { cx, torsoTop: y, torsoH, torsoW, step } = G;
  const x = cx - (torsoW >> 1);
  const len = torsoH - 8;
  const handY = (sgn: number) => y + 4 + len + ((step === 1 && sgn === 1) || (step === -1 && sgn === -1) ? 2 : (step === 1 && sgn === -1) || (step === -1 && sgn === 1) ? -2 : 0);
  if (has(s, "backpack")) {
    if (back) {
      sbox(g, cx - 10, y + 5, 20, Math.min(19, torsoH - 4), P.acc, 4);
      px(g, cx - 6, y + 13, 12, 1, P.acc.d2);
      sbox(g, cx - 6, y + 14, 12, 7, dark(P.acc), 1, 2, 1);
      px(g, cx - 5, y + 8, 4, 1, P.acc.l2);
    } else {
      px(g, x + 3, y + 3, 3, 13, P.acc.b);
      px(g, x + torsoW - 6, y + 3, 3, 13, P.acc.d1);
      px(g, x + 3, y + 14, 3, 2, P.acc.d2);
      px(g, x + torsoW - 6, y + 14, 3, 2, P.acc.d2);
    }
  }
  if (back) return;
  if (has(s, "lanyard")) {
    line(g, cx - 5, y + 3, cx - 1, y + 13, "#1e7a55");
    line(g, cx + 4, y + 3, cx, y + 13, "#1e7a55");
    px(g, cx - 3, y + 13, 6, 6, "#f6f6f0");
    px(g, cx - 2, y + 15, 4, 2, "#1e7a55");
  }
  if (has(s, "coffee")) {
    const hx = x + torsoW + 2;
    const hy = handY(1);
    sbox(g, hx - 1, hy - 5, 7, 8, tones("#f1efe8"), 0, 1, 1);
    px(g, hx - 1, hy - 5, 7, 2, "#6a4630");
    px(g, hx - 1, hy - 1, 7, 2, "#b98a5a");
  }
  if (has(s, "laptop")) {
    sbox(g, x - 5, y + 10, 14, 10, tones("#b9bcc6"), 1);
    px(g, x, y + 14, 4, 2, "#eceef2");
    sbox(g, x - 3, y + 16, 5, 5, P.skin, 1, 1, 1);
  }
  if (has(s, "book")) {
    sbox(g, x + torsoW - 6, y + 10, 10, 11, P.acc, 1);
    px(g, x + torsoW - 5, y + 11, 1, 9, "#f1efe8");
  }
  if (has(s, "tote")) {
    const hx = x - 7;
    const hy = handY(-1);
    px(g, hx + 3, hy + 3, 1, 4, P.acc.d2);
    px(g, hx + 7, hy + 3, 1, 4, P.acc.d2);
    sbox(g, hx - 1, hy + 6, 12, 11, P.acc, 1);
    px(g, hx + 2, hy + 9, 6, 4, P.acc.l2);
    px(g, hx + 4, hy + 10, 2, 2, "#1e7a55");
  }
  if (has(s, "cane")) {
    const hx = x + torsoW + 3;
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
    legsFront(g, s, G, P);
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
