import { TILE } from "../engine/types";
import { logoMono } from "../art/logo";
import { mk, rect, hash, speckle, rampV, text, frame, ellipse, type Ctx } from "../art/px";

const T = TILE;
const GLASS = ["#86a5bf", "#6f8fab", "#5d7d99", "#4d6a85", "#3e566e", "#33475b", "#2c3540", "#232b35", "#1a2027"];
const FIN = ["#f4f6f6", "#dfe2e2", "#cdd1d3", "#b9bec2", "#8b9095"];
const BRONZE = ["#b8966a", "#a5835a", "#8a6a44", "#5e472c"];
export const BASE = 224; // height of the tower's lobby level in px

function roofTop(g: Ctx, W: number, RH: number, tone: string, edge: string): void {
  rect(g, 0, 0, W, RH, tone);
  speckle(g, 0, 0, W, RH, ["#dfe2e4", "#b9bdc1", "#c4c8cc"], 0.08, 41, 2);
  for (let x = 96; x < W; x += 128) rect(g, x, 14, 1, RH - 28, "#b4b8bc");
  for (let y = 70; y < RH - 20; y += 90) rect(g, 14, y, W - 28, 1, "#b4b8bc");
  frame(g, 0, 0, W, RH, edge, 12);
  frame(g, 12, 12, W - 24, RH - 24, "#a2a7ab", 3);
  rect(g, 0, RH - 5, W, 5, "#9a9fa3");
  rect(g, 0, 0, W, 3, "#f6f7f7");
}

function plant(g: Ctx, x: number, y: number, w: number, h: number): void {
  rect(g, x + 6, y + 8, w, h, "rgba(30,34,50,0.25)");
  rect(g, x, y, w, h, "#b7bcc0");
  rect(g, x, y, w, h - 14, "#d5d9db");
  rect(g, x, y + h - 14, w, 2, "#8b9095");
  for (let i = 8; i < w - 16; i += 22) {
    rect(g, x + i, y + 8, 14, 8, "#7d8388");
    rect(g, x + i, y + 8, 14, 2, "#555b60");
  }
  for (let i = 6; i < w - 6; i += 6) rect(g, x + i, y + h - 10, 2, 7, "#8f959a");
}

/** rooftop plant: louvred enclosure with cooling fans, stair bulkhead, solar array, walkway pads */
function roofGear(g: Ctx, W: number, RH: number, seed: number): void {
  const ex = Math.round(W * 0.3), ey = Math.round(RH * 0.16), ew = Math.round(W * 0.42), eh = Math.round(RH * 0.5);
  rect(g, ex + 8, ey + 10, ew, eh, "rgba(30,34,50,0.22)");
  rect(g, ex, ey, ew, eh, "#aab0b5");
  rect(g, ex + 8, ey + 8, ew - 16, eh - 26, "#8d9499");
  for (let x = ex; x < ex + ew; x += 6) rect(g, x, ey + eh - 16, 3, 16, "#c4c9cd");
  rect(g, ex, ey, ew, 3, "#dfe3e5");
  rect(g, ex, ey + eh - 18, ew, 2, "#70777c");
  for (let i = 0, x = ex + 20; x + 54 < ex + ew - 10; x += 66, i++) {
    rect(g, x, ey + 16, 54, 54, "#c9cdd1");
    rect(g, x, ey + 66, 54, 4, "#7d8388");
    ellipse(g, x + 27, ey + 42, 21, 21, "#4a5158");
    ellipse(g, x + 27, ey + 42, 17, 17, hash(i, seed, 44) < 0.5 ? "#6a7178" : "#5d646b");
    rect(g, x + 8, ey + 41, 38, 3, "#8d9499");
    rect(g, x + 26, ey + 23, 3, 38, "#8d9499");
    ellipse(g, x + 27, ey + 42, 4, 4, "#c9cdd1");
  }
  // solar array
  for (let j = 0; j < 3; j++) for (let i = 0; i < 5; i++) {
    const x = 34 + i * 40, y = 36 + j * 34;
    rect(g, x + 3, y + 4, 36, 28, "rgba(30,34,50,0.2)");
    rect(g, x, y, 36, 28, "#27405e");
    rect(g, x + 2, y + 2, 32, 11, "#3b5f8a");
    rect(g, x + 2, y + 15, 32, 11, "#335478");
    rect(g, x + 17, y, 1, 28, "#9fb4c9");
    rect(g, x, y, 36, 1, "#9fb4c9");
  }
  // stair bulkhead with a door, and walkway pads
  const bx = Math.round(W * 0.8), by = Math.round(RH * 0.18);
  rect(g, bx + 6, by + 8, 96, 84, "rgba(30,34,50,0.22)");
  rect(g, bx, by, 96, 52, "#e2e5e7");
  rect(g, bx, by + 52, 96, 32, "#b7bcc0");
  rect(g, bx + 36, by + 56, 22, 28, "#6a7178");
  rect(g, bx, by + 50, 96, 2, "#8b9095");
  for (let x = 40; x < W - 60; x += 46) rect(g, x, RH - 34, 36, 12, (x / 46) & 1 ? "#bfc3c7" : "#b3b8bc");
  for (let x = 20; x < W - 20; x += 24) rect(g, x, 16, 2, 6, "#8b9095");
  rect(g, 20, 16, W - 40, 2, "#8b9095");
}

/** One of the two slabs. main = CDS1 (white fins, the school entrance); otherwise the darker facing tower. */
export function towerSprite(o: { w: number; roof: number; face: number; door: number; main: boolean }): HTMLCanvasElement {
  const W = o.w * T, RH = o.roof * T, FH = o.face * T;
  const [c, g] = mk(W, RH + FH);
  roofTop(g, W, RH, "#cdd1d5", "#e6e9eb");
  roofGear(g, W, RH, o.main ? 1 : 2);

  const storeys = Math.floor((FH - BASE) / 32);
  const top = RH + (FH - BASE - storeys * 32);
  rect(g, 0, RH, W, top - RH + 2, FIN[1]);
  for (let s = 0; s < storeys; s++) {
    const y = top + s * 32;
    const gi = Math.min(8, 1 + Math.floor((s / storeys) * 5));
    const phase = (((s / 3) | 0) % 2) * 8;
    for (let x = 0; x < W; x += 16) {
      const bay = x >> 4;
      const refl = (x + s * 19) % 230 < 46 ? -1 : 0;
      const r = hash(bay, s, 51);
      const corner = x < 32 || x >= W - 32;
      let gl = GLASS[Math.max(0, Math.min(8, gi + refl + (r < 0.2 ? 1 : r > 0.85 ? -1 : 0) + (corner ? 2 : 0) + (o.main ? 0 : 1)))];
      if (r > 0.94 && !corner) gl = "#d8c9a0"; // a lit office
      rect(g, x, y, 16, 32, gl);
      rect(g, x, y + 20, 16, 1, GLASS[Math.min(8, gi + 2)]);
      const wide = hash(bay >> 2, (s / 3) | 0, 52) < 0.22;
      if (corner) rect(g, x + 15, y, 1, 32, "#3d4852");
      else if (o.main) {
        if (!(wide && bay % 2)) {
          rect(g, x + phase, y, 7, 32, FIN[1]);
          rect(g, x + phase, y, 1, 32, FIN[0]);
          rect(g, x + phase + 5, y, 2, 32, FIN[3]);
        } else rect(g, x + 8, y, 1, 32, "#4a5560");
      } else {
        rect(g, x + 7, y, 1, 32, "#46525e");
        if (bay % 2 === ((s / 3) | 0) % 2) rect(g, x + phase, y, 4, 32, FIN[2]), rect(g, x + phase + 3, y, 1, 32, FIN[4]);
        if (bay % 4 === 0) rect(g, x, y, 2, 32, BRONZE[2]);
      }
    }
    const strong = s % 3 === 0;
    rect(g, 0, y, W, strong ? 6 : 3, strong ? "#d5d9db" : "#bfc4c7");
    rect(g, 0, y + (strong ? 6 : 3), W, 1, FIN[4]);
  }
  rect(g, 0, RH, W, 8, "#eef0f1");
  rect(g, 0, RH + 8, W, 2, FIN[4]);

  // lobby level: recessed glass behind white columns
  const y0 = RH + FH - BASE;
  rampV(g, 0, y0, W, BASE, ["#1f2730", "#2c3540", "#3f4a52", "#5a5f5a", "#8d8468", "#b89e72"], 2);
  for (let x = 0; x < W; x += 64) {
    if (hash(x, 3, 53) < 0.35) rect(g, x + 6, y0 + 96, 52, 124, "rgba(240,214,160,0.22)");
    rect(g, x, y0, 3, BASE, BRONZE[2]);
    rect(g, x, y0, 1, BASE, BRONZE[0]);
  }
  rect(g, 0, y0 + 84, W, 3, BRONZE[2]);
  rect(g, 0, y0, W, 16, "#161b21");
  rect(g, 0, y0, W, 10, "#d5d9db");
  rect(g, 0, y0 + 10, W, 2, FIN[4]);
  for (let x = 0; x < W; x += 64) {
    rect(g, x + 4, y0 + 160, 59, 2, "rgba(255,255,255,0.55)");
    rect(g, x + 4, y0 + 172, 59, 2, "rgba(255,255,255,0.55)");
    text(g, (x >> 6) % 2 ? "Est. 1911" : "HKU", x + 33, y0 + 162, 9, "#f4f6f6", { align: "center" });
  }
  for (let x = 0; x <= W; x += 256) {
    const cx = Math.min(W - 20, Math.max(0, x - 10));
    rect(g, cx, y0 + 12, 20, BASE - 12, FIN[1]);
    rect(g, cx, y0 + 12, 3, BASE - 12, FIN[0]);
    rect(g, cx + 14, y0 + 12, 6, BASE - 12, FIN[3]);
  }
  rect(g, 0, RH + FH - 5, W, 5, "#5b5f63");

  const cxd = (o.door + 1) * T;
  if (o.main) {
    rect(g, cxd - 230, y0 + 14, 460, 66, "rgba(20,28,36,0.55)");
    for (const [s, yy] of [["香 港 大 学", 20], ["计 算 与 数 据 科 学 学 院", 48]] as [string, number][]) {
      text(g, s, cxd + 1, y0 + yy + 2, 21, "#12171c", { align: "center" });
      text(g, s, cxd, y0 + yy, 21, "#eef1f2", { align: "center" });
    }
    // deep flat canopy with a glazed top
    rect(g, cxd - 236, y0 + 80, 472, 14, "#eef0f1");
    for (let x = cxd - 230; x < cxd + 226; x += 38) rect(g, x, y0 + 82, 34, 10, (x / 38) & 1 ? "#cfe4ee" : "#b9d6e4");
    rect(g, cxd - 236, y0 + 94, 472, 8, "#c9cdd0");
    rect(g, cxd - 236, y0 + 102, 472, 3, "#7d8388");
    rect(g, cxd - 228, y0 + 105, 456, 12, "rgba(10,14,20,0.5)");
  } else rect(g, cxd - 80, y0 + 100, 160, 10, "#2b2d2c");
  // doors: revolving drum in the middle, a swing door each side
  const dy = y0 + 118, dh = BASE - 118 - 5;
  rect(g, cxd - 120, dy, 240, dh, "#c9b287");
  rampV(g, cxd - 120, dy, 240, dh, ["#8f9aa0", "#c4bfa6", "#ead7a8", "#f3e4bb"], 2);
  for (const sx of [-118, 62]) {
    frame(g, cxd + sx, dy, 56, dh, "#c0c6ca", 3);
    rect(g, cxd + sx + 27, dy, 2, dh, "#8b9095");
    rect(g, cxd + sx + 20, dy + 50, 3, 26, "#eef0f1");
    rect(g, cxd + sx + 33, dy + 50, 3, 26, "#eef0f1");
  }
  if (o.main) {
    const shades = ["#7f97a6", "#a9c2cf", "#d6e6ec", "#f1f6f4", "#f6ecc9", "#f1f6f4", "#c2d6df", "#8fa9b8", "#6c8494"];
    for (let i = 0; i < 9; i++) rect(g, cxd - 54 + i * 12, dy - 6, 12, dh + 6, shades[i]);
    rect(g, cxd - 56, dy - 12, 112, 10, BRONZE[2]);
    rect(g, cxd - 56, dy - 12, 112, 2, BRONZE[0]);
    rect(g, cxd - 56, dy - 6, 3, dh + 6, BRONZE[3]);
    rect(g, cxd + 53, dy - 6, 3, dh + 6, BRONZE[3]);
    rect(g, cxd - 1, dy - 2, 3, dh + 2, "#5e6a72");
    rect(g, cxd - 30, dy - 2, 2, dh + 2, "#9fb0ba");
    rect(g, cxd + 28, dy - 2, 2, dh + 2, "#9fb0ba");
    rect(g, cxd - 54, RH + FH - 9, 108, 4, "#3a3d40");
  } else rect(g, cxd - 2, dy, 4, dh, "#8b9095");
  return c;
}

/** Building 5: low block, green roof, dark-framed glass with angled white panels, warm timber lobby */
export function b5Sprite(o: { w: number; roof: number; face: number; door: number }): HTMLCanvasElement {
  const W = o.w * T, RH = o.roof * T, FH = o.face * T, G = 116;
  const [c, g] = mk(W, RH + FH);
  roofTop(g, W, RH, "#d2d6d8", "#e9ebec");
  rect(g, 30, 28, W - 60, RH - 62, "#7aa54a");
  speckle(g, 30, 28, W - 60, RH - 62, ["#8fbf55", "#6f9440", "#54702f", "#a6d268", "#d9c96a", "#e9a9b8"], 0.3, 61, 2);
  rect(g, W * 0.45, 28, 26, RH - 62, "#d9dad5");
  rect(g, 30, RH * 0.5, W - 60, 14, "#d9dad5");
  plant(g, W * 0.7, 44, 130, 50);
  const y1 = RH, UH = FH - G, sh = UH / 3;
  for (let s = 0; s < 3; s++)
    for (let x = 0; x < W; x += 64) {
      const y = y1 + s * sh;
      const r = hash(x, s, 62);
      rect(g, x, y, 64, sh, GLASS[3 + s + (r < 0.3 ? 1 : 0)]);
      rect(g, x + 4, y + 6, 26, sh - 8, GLASS[5 + (r > 0.7 ? 1 : 0)]);
      // angled white panel inside each bay
      for (let i = 0; i < 18; i++) rect(g, x + 30 + i, y + 6 + ((i / 3) | 0), 1, sh - 8 - ((i / 3) | 0), i < 9 ? FIN[1] : FIN[3]);
      rect(g, x + 50, y + 8, 10, sh - 10, "#1f262d");
      frame(g, x, y, 64, sh + 1, "#3a3f44", 3);
      rect(g, x, y, 64, 1, "#6a7178");
      if (s === 0) for (let i = 4; i < 60; i += 5) rect(g, x + i, y + 4, 2, 14, BRONZE[1]);
    }
  rect(g, 0, RH, W, 6, "#eef0f1");
  rect(g, 0, y1 + UH - 2, W, 10, "#b7b0a2");
  rect(g, 0, y1 + UH + 8, W, 10, "#1b2026");
  // ground floor: full-height glass, frit band, warm lobby at the door
  const y0 = RH + FH - G + 18, GH = G - 18;
  rampV(g, 0, y0, W, GH, ["#3e566e", "#4d6a85", "#5f7f8f", "#7f958f"], 2);
  const cxd = (o.door + 1) * T;
  rampV(g, cxd - 160, y0, 320, GH, ["#b58a5c", "#e0b074", "#f1cf96", "#f8e2b4"], 2);
  for (let i = -150; i < 150; i += 30) rect(g, cxd + i, y0 + 4, 2, 30, "#fff3d0");
  for (let x = 0; x < W; x += 64) {
    if (Math.abs(x + 32 - cxd) > 160 && hash(x, 9, 63) < 0.5) for (let i = 6; i < 60; i += 6) rect(g, x + i, y0, 3, GH, "rgba(230,235,235,0.35)");
    rect(g, x, y0, 3, GH, "#3a3f44");
    rect(g, x + 4, y0 + 56, 59, 2, "rgba(255,255,255,0.6)");
    rect(g, x + 4, y0 + 66, 59, 2, "rgba(255,255,255,0.6)");
    text(g, (x >> 6) % 2 ? "Est. 1911" : "HKU", x + 33, y0 + 56, 9, "#ffffff", { align: "center" });
  }
  frame(g, cxd - 62, y0 + 6, 124, GH - 6, "#2b2d2c", 4);
  rect(g, cxd - 2, y0 + 6, 4, GH - 6, "#2b2d2c");
  rect(g, cxd - 16, y0 + 44, 3, 24, "#d9dad5");
  rect(g, cxd + 13, y0 + 44, 3, 24, "#d9dad5");
  rect(g, cxd - 170, y0 - 4, 340, 10, "#2b2d2c");
  rect(g, cxd - 170, y0 - 4, 340, 2, "#4a4d4c");
  rect(g, 0, RH + FH - 4, W, 4, "#5b5f63");
  return c;
}

/** The white glass-box auditorium at the head of the axis, with the HKU logo band */
export function auditoriumSprite(o: { w: number; roof: number; face: number }): HTMLCanvasElement {
  const W = o.w * T, RH = o.roof * T, FH = o.face * T;
  const [c, g] = mk(W, RH + FH);
  roofTop(g, W, RH, "#e3e5e4", "#f4f5f4");
  plant(g, W * 0.36, 40, 300, 84);
  rect(g, 0, RH, W, FH, "#e6e7e4");
  const gx = 22, gy = RH + 70, gw = W - 44, gh = FH - 70 - 26;
  rampV(g, gx, gy, gw, gh, ["#8fa7b5", "#7d95a4", "#5f7684", "#4a5c66", "#3d4c55"], 2);
  for (let x = gx; x < gx + gw; x += 48) {
    if (hash(x, 1, 71) < 0.4) rect(g, x + 3, gy, 20, gh, "rgba(210,228,238,0.22)");
    rect(g, x, gy, 3, gh, "#eeefec");
  }
  rect(g, gx, gy + gh * 0.45, gw, 3, "#eeefec");
  rect(g, gx, gy, gw, 8, "rgba(20,26,32,0.45)");
  // logo band: crest, 香港大學, THE UNIVERSITY OF HONG KONG
  rect(g, gx, RH + 18, gw, 46, "#2a2c2b");
  rect(g, gx, RH + 18, gw, 2, "#4b4d4c");
  const lg = logoMono(38, "#e4e6e2"); // the official one-colour logo: crest, 香港大學, THE UNIVERSITY OF HONG KONG
  g.drawImage(lg, gx + 16, RH + 22); // left end of the band, as on the real facade
  for (const dx of [-66, 2]) {
    frame(g, W / 2 + dx, RH + FH - 130, 64, 106, "#eeefec", 4);
    rect(g, W / 2 + dx + 4, RH + FH - 126, 56, 100, "#9db4bf");
    rect(g, W / 2 + dx + 30, RH + FH - 126, 3, 100, "#eeefec");
  }
  rect(g, 0, RH + FH - 26, W, 26, "#cfd0cb");
  rect(g, 0, RH + FH - 26, W, 3, "#f1f2ef");
  rect(g, 0, RH + FH - 5, W, 5, "#a9aaa4");
  return c;
}
