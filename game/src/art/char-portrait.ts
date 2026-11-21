// 320 x 320 battle portraits for the human characters: head and shoulders, drawn on a
// 160 x 160 grid (2 px pixels) from the same spec as the walking sprite.

import { mk, type Ctx } from "./px";
import { tones, px, rbox, sbox, ell, sell, sellTop, poly, line, outline, scaleUp, mix, type Tones } from "./char-draw";
import type { HumanSpec, Acc } from "./char-human";

const has = (s: HumanSpec, a: Acc) => !!s.acc && s.acc.includes(a);

const CX = 80;
const HY = 70; // head centre
const RX = 37;
const RY = 41;

function hairBehind(g: Ctx, s: HumanSpec, H: Tones): void {
  const st = s.hairStyle;
  if (st === "long") {
    sbox(g, CX - 46, HY - 30, 92, 118, H, 30, 4, 3);
    for (let i = 0; i < 6; i++) px(g, CX - 42 + i * 16, HY + 20, 2, 60, H.d1);
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
  const wide = 66 + (s.build ?? 0) * 2 - (s.child ? 12 : 0);
  const top = 122;
  const shoulderT = s.top === "vest" ? SH : T;
  ell(g, CX, top + 44, wide, 44, shoulderT.d1, 0, 159);
  ell(g, CX - 4, top + 44, wide - 5, 43, shoulderT.b, 0, 159);
  ell(g, CX - 20, top + 44, wide - 26, 42, shoulderT.l1, top + 2, top + 5);
  const V = (w: number, d: number, c: string) => poly(g, [[CX - w, top - 2], [CX + w, top - 2], [CX, top + d]], c);
  // neck
  px(g, CX - 13, HY + 28, 26, 24, S.d1);
  ell(g, CX, top + 2, 13, 7, S.d1);
  px(g, CX - 13, HY + 28, 26, 6, S.d2);
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
        for (let yy = top + 24; yy < 159; yy += 2) for (let xx = -64; xx <= 64; xx += 10) if (Math.abs(xx) > 3 && Math.abs(xx) < half(yy)) px(g, CX + xx, yy, 1, 2, s.check);
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
        px(g, CX - 62, top + 14, 22, 5, "#e8c34a");
        px(g, CX + 40, top + 14, 22, 5, "#c99f2f");
        sbox(g, CX - 44, top + 22, 10, 11, tones("#e8c34a"), 2, 4, 1);
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
    sbox(g, CX - 46, top + 4, 10, 40, A, 3, 0);
    sbox(g, CX + 36, top + 4, 10, 40, A, 3, 0);
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
  const fx = CX + 3;
  const ey = HY + 5;
  const light = s.hair === "#e8e8ee" || s.hair === "#c9c9d2" || s.hair === "#8f8f9b";
  const browC = light ? "#7d7d8a" : H.d2;
  const blush = mix(S.b, "#ff6a6a", 0.3);
  // beard under everything else on the face
  if (s.beard === "full") {
    sell(g, CX, HY + 1, RX - 1, RY - 1, H.b, 2.6, HY + 14, HY + RY);
    sell(g, CX + 4, HY + 1, RX - 5, RY - 3, H.l1, 2.6, HY + 22, HY + 26);
    ell(g, fx, HY + 25, 15, 8, S.b);
    for (let i = 0; i < 7; i++) px(g, CX - 24 + i * 8, HY + 26 + (i % 2) * 4, 2, 6, H.d1);
  } else if (s.beard === "goatee") ell(g, fx, HY + 34, 10, 8, H.b);
  else if (s.beard === "stubble") {
    for (let j = 0; j < 22; j += 2)
      for (let i = -30; i < 30; i += 2) {
        const y = HY + 16 + j;
        if ((i + j) % 4 === 0 && Math.abs(i) < sellHalf(y) - 3 && !(Math.abs(i - 3) < 12 && j < 12 && j > 2)) px(g, CX + i, y, 2, 2, mix(S.b, H.b, 0.3));
      }
  }
  ell(g, fx - 25, ey + 13, 7, 4, blush);
  ell(g, fx + 23, ey + 13, 7, 4, blush);
  // glasses frames sit behind the eyes
  if (s.glasses) {
    const c = s.glassesColor ?? "#20202a";
    const lens = mix(S.b, "#d6ecff", 0.35);
    for (const sgn of [-1, 1]) {
      const ex = fx + sgn * 16;
      if (s.glasses === "round") {
        ell(g, ex, ey, 13, 12, c);
        ell(g, ex, ey, 11, 10, lens);
      } else {
        rbox(g, ex - 12, ey - 10, 24, 21, c, 3);
        rbox(g, ex - 10, ey - 8, 20, 17, lens, 2);
      }
      line(g, ex - 7, ey - 6, ex - 3, ey - 9, "#ffffff", 2);
    }
    px(g, fx - 4, ey - 2, 8, 2, c);
    if (s.hairStyle !== "long" && s.hairStyle !== "bob") px(g, CX - RX + 2, ey - 3, fx - 16 - 13 - (CX - RX + 2), 2, c);
    if (s.hairStyle !== "long" && s.hairStyle !== "bob") px(g, fx + 16 + 13, ey - 3, CX + RX - 6 - (fx + 16 + 13), 2, c);
  }
  for (const sgn of [-1, 1]) {
    const ex = fx + sgn * 16;
    ell(g, ex, ey, 7, 6, "#fbfbf6");
    ell(g, ex + 1, ey + 1, 4, 5, "#4a2f22");
    ell(g, ex + 1, ey + 1, 2, 3, "#140d12");
    px(g, ex - 2, ey - 3, 3, 3, "#ffffff");
    px(g, ex - 7, ey - 6, 14, 2, "#2a1d24"); // lash line
    px(g, ex - 6, ey + 6, 12, 1, S.d1);
    // brow, slightly arched
    px(g, ex - 9, ey - 15, 18, 3, browC);
    px(g, ex + sgn * 7 - 1, ey - 13, 4, 2, browC);
    if (s.senior) {
      px(g, ex - 7, ey + 9, 12, 1, S.d1);
      px(g, ex + sgn * 10, ey + 2, 3, 1, S.d1);
    }
  }
  if (s.senior) {
    px(g, fx - 14, HY - 18, 28, 1, S.d1);
    px(g, fx - 10, HY - 23, 20, 1, S.d1);
    px(g, fx - 14, ey + 18, 1, 8, S.d1);
    px(g, fx + 14, ey + 18, 1, 8, S.d1);
  }
  // nose
  px(g, fx + 2, ey + 6, 2, 10, S.d1);
  px(g, fx - 4, ey + 15, 9, 2, S.d1);
  px(g, fx - 2, ey + 12, 3, 2, S.l1);
  // mouth
  const my = HY + 27;
  if (s.beard === "moustache" || s.beard === "full") {
    ell(g, fx, my - 5, 13, 4, H.d1);
    px(g, fx - 1, my - 8, 2, 4, s.beard === "full" ? H.b : S.b);
  }
  px(g, fx - 9, my, 18, 2, "#8a3b3b");
  px(g, fx - 11, my - 2, 2, 2, "#8a3b3b");
  px(g, fx + 9, my - 2, 2, 2, "#8a3b3b");
  if (!s.senior && !s.beard) {
    px(g, fx - 7, my + 2, 14, 3, "#fbfbf6");
    px(g, fx - 7, my + 5, 14, 1, "#8a3b3b");
  } else px(g, fx - 5, my + 4, 10, 1, S.d1);
}

function sellHalf(y: number): number {
  const j = Math.abs(y - HY);
  return Math.round(RX * Math.pow(Math.max(0, 1 - Math.pow(j / (RY + 0.5), 2.6)), 1 / 2.6));
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
  ell(g, CX - RX, HY + 6, 6, 9, S.b);
  ell(g, CX + RX, HY + 6, 6, 9, S.d1);
  px(g, CX - RX - 2, HY + 4, 3, 5, S.d1);
  // head
  sell(g, CX, HY, RX, RY, S.d1);
  sell(g, CX - 3, HY - 1, RX - 3, RY - 1, S.b);
  ell(g, CX - 12, HY - 22, 14, 6, S.l1);
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
  return scaleUp(c, 2);
}
