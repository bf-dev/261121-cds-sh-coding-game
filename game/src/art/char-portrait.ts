// 320 x 320 battle portraits for the human characters: a big round chibi head on small
// shoulders, drawn on a 160 x 160 grid (2 px pixels) from the same spec as the walking
// sprite, on a soft pastel card.

import { mk, type Ctx } from "./px";
import { tones, px, rbox, sbox, ell, sell, sellTop, poly, line, outline, scaleUp, mix, type Tones } from "./char-draw";
import type { HumanSpec, Acc } from "./char-human";

const has = (s: HumanSpec, a: Acc) => !!s.acc && s.acc.includes(a);

const CX = 80;
const HY = 68; // head centre
const RX = 43;
const RY = 42;
const INK = "#3a2530";
const PASTEL = ["#ffe1ea", "#dff0ff", "#e2f6df", "#fff1cf", "#ece3ff", "#ffe6d2", "#d9f4f0"];

function hairBehind(g: Ctx, s: HumanSpec, H: Tones): void {
  const st = s.hairStyle;
  if (st === "long") {
    sbox(g, CX - RX - 6, HY - 30, RX * 2 + 12, 118, H, 30, 4, 3);
    for (let i = 0; i < 6; i++) px(g, CX - 45 + i * 18, HY + 24, 2, 56, H.d1);
  } else if (st === "bob") sell(g, CX, HY + 6, RX + 9, RY + 6, H.b, 3);
  else if (st === "curly") {
    for (let i = 0; i < 12; i++) {
      const a = Math.PI + (i / 11) * Math.PI;
      ell(g, CX + Math.cos(a) * (RX + 4), HY - 4 + Math.sin(a) * (RY + 2), 11, 11, i % 2 ? H.b : H.d1);
    }
    ell(g, CX - RX - 3, HY + 8, 9, 12, H.d1);
    ell(g, CX + RX + 3, HY + 8, 9, 12, H.d1);
  } else if (st === "pony") {
    sbox(g, CX + RX - 2, HY - 14, 18, 62, H, 8, 8, 3);
    px(g, CX + RX, HY - 8, 12, 5, tones(s.accColor ?? "#d9477a").b);
  } else if (st === "bun") {
    ell(g, CX, HY - RY - 8, 17, 13, H.b);
    ell(g, CX - 5, HY - RY - 12, 8, 4, H.l1);
    px(g, CX - 12, HY - RY + 2, 24, 2, H.d2);
  }
}

function shoulders(g: Ctx, s: HumanSpec, T: Tones, SH: Tones, S: Tones, A: Tones): void {
  const wide = 54 + (s.build ?? 0) * 2 - (s.child ? 8 : 0);
  const top = 124;
  const shoulderT = s.top === "vest" ? SH : T;
  ell(g, CX, top + 44, wide, 44, shoulderT.d1, 0, 159);
  ell(g, CX - 4, top + 44, wide - 5, 43, shoulderT.b, 0, 159);
  ell(g, CX - 20, top + 44, wide - 26, 42, shoulderT.l1, top + 2, top + 5);
  const V = (w: number, d: number, c: string) => poly(g, [[CX - w, top - 2], [CX + w, top - 2], [CX, top + d]], c);
  // neck
  px(g, CX - 11, HY + 30, 22, 26, S.d1);
  ell(g, CX, top + 2, 11, 6, S.d1);
  switch (s.top) {
    case "hoodie":
      ell(g, CX, top + 2, 38, 15, T.d1, top - 14, 159);
      ell(g, CX, top + 4, 30, 14, T.d2, top + 8, 159);
      ell(g, CX, top, 26, 13, T.b, top + 8, 159);
      ell(g, CX, top - 2, 18, 9, S.d1);
      px(g, CX - 10, top + 12, 2, 22, "#f1efe8");
      px(g, CX + 8, top + 12, 2, 22, "#f1efe8");
      px(g, CX - 11, top + 34, 4, 3, "#c9c9d2");
      px(g, CX + 7, top + 34, 4, 3, "#c9c9d2");
      break;
    case "cardigan":
      V(26, 60, T.d2);
      V(23, 56, SH.b);
      V(9, 12, S.d1);
      poly(g, [[CX - 16, top - 4], [CX - 3, top + 8], [CX - 10, top + 14]], SH.l2);
      poly(g, [[CX + 16, top - 4], [CX + 3, top + 8], [CX + 10, top + 14]], SH.l1);
      px(g, CX + 12, top + 30, 4, 4, T.l2);
      break;
    case "shirt":
    case "polo":
      V(10, 14, S.d1);
      poly(g, [[CX - 20, top - 5], [CX - 2, top + 12], [CX - 12, top + 22], [CX - 24, top + 2]], T.l2);
      poly(g, [[CX + 20, top - 5], [CX + 2, top + 12], [CX + 12, top + 22], [CX + 24, top + 2]], T.l1);
      px(g, CX - 1, top + 14, 2, 30, T.d1);
      for (let i = 0; i < 2; i++) px(g, CX - 2, top + 20 + i * 10, 4, 3, T.l2);
      if (s.check) {
        // grid lines clipped to the shoulder shape
        const half = (yy: number) => (yy >= top + 44 ? wide - 6 : Math.round((wide - 6) * Math.sqrt(Math.max(0, 1 - ((yy - top - 44) / 43) ** 2))));
        for (let yy = top + 24; yy < 159; yy += 2) for (let xx = -60; xx <= 60; xx += 10) if (Math.abs(xx) > 3 && Math.abs(xx) < half(yy)) px(g, CX + xx, yy, 1, 2, s.check);
        for (let yy = top + 26; yy < 159; yy += 9) px(g, CX - half(yy), yy, half(yy) * 2, 1, s.check);
      }
      if (s.trim) {
        line(g, CX - 24, top + 2, CX - 12, top + 22, s.trim, 3);
        line(g, CX + 24, top + 2, CX + 12, top + 22, s.trim, 3);
      }
      if (s.tie) tie(g, s.tie, top);
      break;
    case "blazer":
    case "suit":
    case "coat":
    case "uniform": {
      const sh = s.top === "uniform" ? tones("#dfe6ee") : SH;
      V(22, 44, sh.b);
      poly(g, [[CX + 4, top], [CX + 22, top - 2], [CX, top + 44]], sh.d1);
      V(9, 12, S.d1);
      poly(g, [[CX - 15, top - 5], [CX - 2, top + 9], [CX - 10, top + 16], [CX - 19, top + 1]], sh.l2);
      poly(g, [[CX + 15, top - 5], [CX + 2, top + 9], [CX + 10, top + 16], [CX + 19, top + 1]], sh.l1);
      // lapels
      poly(g, [[CX - 24, top - 4], [CX - 14, top + 2], [CX - 1, top + 44], [CX - 10, top + 44], [CX - 30, top + 16]], T.l1);
      poly(g, [[CX + 24, top - 4], [CX + 14, top + 2], [CX + 1, top + 44], [CX + 10, top + 44], [CX + 30, top + 16]], T.d1);
      line(g, CX - 30, top + 16, CX - 18, top + 14, T.d2, 2);
      line(g, CX + 30, top + 16, CX + 18, top + 14, T.d2, 2);
      if (s.tie || s.top === "uniform") tie(g, s.tie ?? "#1a1e2a", top);
      if (s.top === "coat") px(g, CX + 34, top + 24, 3, 12, "#3b5a8c");
      if (s.top === "uniform") {
        px(g, CX - 50, top + 16, 18, 4, "#e8c34a");
        px(g, CX + 32, top + 16, 18, 4, "#c99f2f");
        sbox(g, CX - 38, top + 22, 9, 10, tones("#e8c34a"), 2, 4, 1);
      }
      break;
    }
    case "sweater":
      ell(g, CX, top, 22, 10, T.l1);
      ell(g, CX, top - 2, 17, 8, S.d1);
      poly(g, [[CX - 17, top - 6], [CX - 5, top + 3], [CX - 14, top + 6]], SH.l2);
      poly(g, [[CX + 17, top - 6], [CX + 5, top + 3], [CX + 14, top + 6]], SH.l1);
      for (let i = 0; i < 9; i++) px(g, CX - 20 + i * 5, top + 8, 2, 3, T.d1);
      break;
    case "vest":
      poly(g, [[CX - 30, top + 4], [CX + 30, top + 4], [CX + 34, 160], [CX - 34, 160]], T.b);
      poly(g, [[CX + 18, top + 4], [CX + 30, top + 4], [CX + 34, 160], [CX + 22, 160]], T.d1);
      V(20, 34, SH.b);
      V(9, 12, S.d1);
      poly(g, [[CX - 15, top - 5], [CX - 2, top + 9], [CX - 10, top + 16], [CX - 19, top + 1]], SH.l2);
      poly(g, [[CX + 15, top - 5], [CX + 2, top + 9], [CX + 10, top + 16], [CX + 19, top + 1]], SH.l1);
      if (s.tie) tie(g, s.tie, top);
      break;
  }
  if (has(s, "backpack")) {
    sbox(g, CX - 40, top + 6, 9, 40, A, 3, 0);
    sbox(g, CX + 31, top + 6, 9, 40, A, 3, 0);
  }
  if (has(s, "lanyard")) {
    line(g, CX - 16, top + 2, CX - 3, top + 36, "#1e7a55", 3);
    line(g, CX + 14, top + 2, CX + 1, top + 36, "#16624a", 3);
    for (let i = 0; i < 4; i++) px(g, CX - 14 + i * 3, top + 8 + i * 8, 2, 2, "#f6f6f0");
  }
  if (has(s, "scarf")) {
    ell(g, CX, top - 2, 30, 13, A.d1);
    ell(g, CX - 2, top - 4, 28, 11, A.b);
    for (let i = 0; i < 6; i++) px(g, CX - 24 + i * 9, top - 10, 3, 14, A.l1);
    sbox(g, CX + 6, top + 4, 16, 34, A, 2, 0);
    px(g, CX + 6, top + 30, 16, 3, A.l2);
  }
}

function tie(g: Ctx, c: string, top: number): void {
  const T = tones(c);
  poly(g, [[CX - 5, top + 6], [CX + 5, top + 6], [CX + 3, top + 14], [CX - 3, top + 14]], T.b);
  poly(g, [[CX - 3, top + 14], [CX + 3, top + 14], [CX + 7, top + 38], [CX - 7, top + 38]], T.b);
  poly(g, [[CX + 1, top + 14], [CX + 3, top + 14], [CX + 7, top + 38], [CX + 3, top + 38]], T.d1);
  px(g, CX - 2, top + 8, 2, 4, T.l1);
}

function hairFront(g: Ctx, s: HumanSpec, H: Tones, S: Tones): void {
  const st = s.hairStyle;
  if (st === "bald" || st === "receding") {
    // side tufts and a shine
    for (const sgn of [-1, 1]) {
      ell(g, CX + sgn * (RX - 2), HY - 2, 5, 13, sgn < 0 ? H.b : H.d1);
    }
    ell(g, CX - 10, HY - 30, 12, 5, S.l2);
    if (st === "receding") {
      for (let dx = -RX; dx <= RX; dx++) {
        const t = sellTop(HY, RX + 1, RY + 3, dx);
        const b = HY - 34 + Math.round(Math.abs(dx) * 0.28) - (Math.abs(dx) > 26 ? -14 : 0);
        if (b > t) px(g, CX + dx, t, 1, b - t, dx > 14 ? H.d1 : H.b);
      }
    }
    return;
  }
  const extra = st === "curly" ? 5 : st === "bob" || st === "long" ? 4 : 2;
  const rx = RX + extra;
  for (let dx = -rx; dx <= rx; dx++) {
    const t = sellTop(HY - 2, rx, RY + 5, dx) - (st === "spiky" ? ((dx + 100) % 12 < 6 ? ((dx + 100) % 12) : 12 - ((dx + 100) % 12)) : 0);
    const a = Math.abs(dx);
    let b: number;
    switch (st) {
      case "short":
        b = HY - 22 + ((dx + 100) % 10 < 5 ? 3 : 0);
        break;
      case "spiky":
        b = HY - 24 + ((dx + 100) % 12 < 6 ? ((dx + 100) % 12) : 12 - ((dx + 100) % 12));
        break;
      case "crew":
        b = HY - 28;
        break;
      case "curly":
        b = HY - 22 + Math.round(Math.sin(dx * 0.55) * 3);
        break;
      case "bob":
        b = HY - 14 + (a % 9 === 0 ? -2 : 0);
        break;
      case "long":
        b = s.fringe ? HY - 21 + ((dx + 100) % 9 < 2 ? -5 : (dx + 100) % 9 < 5 ? 2 : 0) : HY - 34 + Math.round(a * 0.75);
        break;
      default: // side, bun, pony: swept from the right temple
        b = HY - 12 - Math.round((dx + rx) * 0.24);
    }
    // sides hang lower
    const sideFrom = RX - (st === "bob" || st === "long" ? 9 : 5);
    if (a > sideFrom) b = Math.max(b, st === "long" ? HY + 60 : st === "bob" ? HY + 34 : st === "curly" ? HY + 12 : st === "crew" ? HY - 12 : HY - 2);
    if (b > t) {
      px(g, CX + dx, t, 1, b - t, dx > rx * 0.45 ? H.d1 : H.b);
      if (a <= sideFrom) px(g, CX + dx, b - 2, 1, 2, H.d1);
    }
  }
  // gloss
  for (let dx = -20; dx <= 4; dx++) {
    const t = sellTop(HY - 2, rx, RY + 5, dx);
    px(g, CX + dx, t + 7 + Math.round(Math.abs(dx + 8) * 0.25), 1, 3, H.l1);
  }
  px(g, CX - 14, HY - RY + 8, 10, 2, H.l2);
  if (st === "curly") for (let i = 0; i < 9; i++) ell(g, CX - rx + 4 + i * 10, HY - RY - 2 + (i % 2) * 3, 7, 7, i % 2 ? H.b : H.l1);
  if (st === "side" || st === "bun" || st === "pony") line(g, CX + 14, HY - RY - 2, CX + 20, HY - 18, H.d2, 2);
}

function face(g: Ctx, s: HumanSpec, S: Tones, H: Tones): void {
  const fx = CX;
  const ey = HY + 9; // eyes sit low on the face: that is what makes it cute
  const eo = 19;
  const light = s.hair === "#e8e8ee" || s.hair === "#c9c9d2" || s.hair === "#8f8f9b";
  const browC = light ? "#8a8a96" : H.d2;
  const blush = mix(S.b, "#ff6f8a", 0.5);
  // beard under everything else on the face
  if (s.beard === "full") {
    sell(g, CX, HY + 1, RX - 1, RY - 1, H.b, 2.6, HY + 22, HY + RY);
    ell(g, fx, HY + 31, 14, 7, S.b);
  } else if (s.beard === "goatee") ell(g, fx, HY + 36, 9, 6, H.b);
  else if (s.beard === "stubble") {
    for (let j = 0; j < 16; j += 2)
      for (let i = -30; i < 30; i += 2) {
        const y = HY + 24 + j;
        if ((i + j) % 4 === 0 && Math.abs(i) < sellHalf(y) - 3 && !(Math.abs(i) < 12 && j < 10)) px(g, CX + i, y, 2, 2, mix(S.b, H.b, 0.3));
      }
  }
  // big rosy cheeks
  ell(g, fx - 31, ey + 14, 9, 5, blush);
  ell(g, fx + 31, ey + 14, 9, 5, blush);
  px(g, fx - 35, ey + 12, 3, 1, "#ffffff");
  px(g, fx + 27, ey + 12, 3, 1, "#ffffff");
  // glasses frames sit behind the eyes
  if (s.glasses) {
    const c = s.glassesColor ?? "#20202a";
    const lens = mix(S.b, "#e2f2ff", 0.45);
    for (const sgn of [-1, 1]) {
      const ex = fx + sgn * eo;
      if (s.glasses === "round") {
        ell(g, ex, ey + 1, 16, 16, c);
        ell(g, ex, ey + 1, 14, 14, lens);
      } else {
        rbox(g, ex - 16, ey - 14, 32, 30, c, 6);
        rbox(g, ex - 14, ey - 12, 28, 26, lens, 5);
      }
    }
    px(g, fx - 4, ey - 1, 8, 2, c);
    if (s.hairStyle !== "long" && s.hairStyle !== "bob") {
      px(g, CX - RX + 2, ey - 2, RX - eo - 18, 2, c);
      px(g, fx + eo + 16, ey - 2, RX - eo - 18, 2, c);
    }
  }
  for (const sgn of [-1, 1]) {
    const ex = fx + sgn * eo;
    // tall shiny eye: dark, warm brown at the bottom, two highlights
    ell(g, ex, ey + 1, 8, 11, INK);
    ell(g, ex, ey + 5, 6, 6, "#7a4a34");
    ell(g, ex, ey + 2, 4, 6, "#1c1118");
    px(g, ex - 6, ey - 7, 5, 6, "#ffffff");
    px(g, ex - 5, ey - 8, 3, 1, "#ffffff");
    px(g, ex + 2, ey + 6, 3, 3, "#ffffff");
    px(g, ex - 8, ey - 10, 16, 2, INK); // lash line
    px(g, ex + sgn * 8 - 1, ey - 9, 3, 2, INK);
    // a short soft brow
    px(g, ex - 6, ey - 21, 12, 2, browC);
    px(g, ex + sgn * 6 - 1, ey - 20, 3, 2, browC);
    if (s.senior) {
      px(g, ex - 7, ey + 15, 12, 1, S.d1);
      px(g, ex + sgn * 12, ey + 4, 3, 1, S.d1);
    }
  }
  if (s.senior) px(g, fx - 12, HY - 18, 24, 1, S.d1);
  // button nose
  px(g, fx - 1, ey + 14, 3, 2, S.d1);
  // a small happy smile
  const my = HY + 31;
  if (s.beard === "moustache" || s.beard === "full") ell(g, fx, my - 4, 11, 3, H.d1);
  if (!s.senior && !s.beard) {
    ell(g, fx, my - 2, 7, 6, "#8a3b3b", my - 1, 1e9);
    ell(g, fx, my + 2, 4, 3, "#f08a8a", my + 1, 1e9);
    px(g, fx - 8, my - 2, 16, 2, "#8a3b3b");
  } else {
    px(g, fx - 6, my, 12, 2, "#8a3b3b");
    px(g, fx - 8, my - 2, 2, 2, "#8a3b3b");
    px(g, fx + 6, my - 2, 2, 2, "#8a3b3b");
  }
}

function sellHalf(y: number): number {
  const j = Math.abs(y - HY);
  return Math.round(RX * Math.pow(Math.max(0, 1 - Math.pow(j / (RY + 0.5), 2.6)), 1 / 2.6));
}

/** a soft pastel card behind the character, picked from the spec so each one keeps its own colour */
export function pastelCard(c: HTMLCanvasElement, seed: string): HTMLCanvasElement {
  let n = 0;
  for (const ch of seed) n = (n * 31 + ch.charCodeAt(0)) >>> 0;
  const base = PASTEL[n % PASTEL.length];
  const [o, g] = mk(c.width, c.height);
  g.fillStyle = base;
  g.fillRect(0, 0, c.width, c.height);
  // big soft dots
  g.fillStyle = mix(base, "#ffffff", 0.55);
  for (let j = 0; j < 6; j++) for (let i = 0; i < 6; i++) ell(g, 12 + i * 30 + (j % 2) * 15, 10 + j * 28, 5, 5, mix(base, "#ffffff", 0.55));
  g.drawImage(c, 0, 0);
  return o;
}

export function humanPortrait(s: HumanSpec): HTMLCanvasElement {
  const [c, g] = mk(160, 160);
  const S = tones(s.skin);
  const H = tones(s.hair);
  const T = tones(s.topColor);
  const SH = tones(s.shirt ?? "#f1efe8");
  const A = tones(s.accColor ?? "#c9553a");
  hairBehind(g, s, H);
  shoulders(g, s, T, SH, S, A);
  // ears
  ell(g, CX - RX, HY + 10, 6, 8, S.b);
  ell(g, CX + RX, HY + 10, 6, 8, S.d1);
  px(g, CX - RX - 2, HY + 8, 3, 5, S.d1);
  // head
  sell(g, CX, HY, RX, RY, S.d1);
  sell(g, CX - 2, HY - 1, RX - 2, RY - 1, S.b);
  face(g, s, S, H);
  hairFront(g, s, H, S);
  if (has(s, "cap")) {
    sell(g, CX, HY - 22, RX + 5, 26, T.b, 2.6, 0, HY - 20);
    sell(g, CX - 6, HY - 24, RX - 6, 22, T.l1, 2.6, HY - 44, HY - 40);
    px(g, CX - RX - 5, HY - 22, RX * 2 + 10, 6, "#15161c");
    rbox(g, CX - RX - 8, HY - 16, RX * 2 + 16, 7, "#1f2028", 0, 4);
    sbox(g, CX - 7, HY - 38, 14, 13, tones("#e8c34a"), 3, 5, 2);
  }
  outline(c);
  return scaleUp(pastelCard(c, s.hair + s.topColor + s.skin + (s.glassesColor ?? "")), 2);
}
