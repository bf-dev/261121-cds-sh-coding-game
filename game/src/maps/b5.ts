import { TILE, type GameMap, type NpcDef, type Prop, type Trigger } from "../engine/types";
import { mk, rect, frame, hash, dither, ellipse, text, block, type Ctx } from "../art/px";
import { drawCrest } from "./grandhall-crest";
import * as K from "./b5-kit";
import { drawCrestIn } from "../art/logo";
import { buildB5Study, buildB5CoCreation, buildB5Commons, liftDoors } from "./b5-upper";

// Building 5, from buildings/b5/: the reward building north of CDS-1.
// b5-1 = 1/F marble lift lobby with the University Galleria behind the walnut arch.
// b5-2 = the amenity floor at the top of the white feature stair (gym, games, lounge). No cafe.
//        A second flight of the same stair goes on to 3/F and stops there.
// b5-3 .. b5-5 = study and meeting floors, in b5-upper.ts. The study stair joins 3/F and 4/F.
// The lift serves 1/F to 5/F (Insung, 2026-11-21).

const T = TILE;

/** the floors the Building 5 lift serves, with the names on the real signage */
export const B5_FLOORS: { floor: number; name: string; nameZh: string }[] = [
  { floor: 1, name: "University Galleria", nameZh: "大学长廊" },
  { floor: 2, name: "Gym and Game Hub", nameZh: "健身房 · 电玩区" },
  { floor: 3, name: "Study stair", nameZh: "阶梯自习区" },
  { floor: 4, name: "Co-creation Space", nameZh: "共创空间" },
  { floor: 5, name: "Learning Commons", nameZh: "学习共享空间" },
];

export function buildB5(level: number): GameMap {
  switch (level) {
    case 2:
      return buildAmenity();
    case 3:
      return buildB5Study();
    case 4:
      return buildB5CoCreation();
    case 5:
      return buildB5Commons();
    default:
      return buildLobby();
  }
}

function wallTop(g: Ctx, x: number, y: number, w: number, h: number): void {
  rect(g, x, y, w, h, "#d9d1c4");
  rect(g, x, y, w, 3, "#f5efe6");
  rect(g, x, y + h - 4, w, 4, "#8f8577");
  rect(g, x, y, 3, h, "#ece6dc");
  rect(g, x + w - 3, y, 3, h, "#a79c8c");
}

// =====================================================================================
// 1/F
// =====================================================================================

function featureStair(): HTMLCanvasElement {
  const W = 340;
  const H = 560;
  const [c, g] = mk(W, H);
  const N = 16;
  const pitch = 32;
  const cx = (i: number): number => 236 - Math.round(118 * Math.sin((i / (N - 1)) * (Math.PI / 2)));
  const half = (i: number): number => 84 - i;
  // shadow under the ribbon
  for (let i = 0; i < N; i++) rect(g, cx(i) - half(i) + 10, H - 30 - i * pitch + 10, half(i) * 2 + 8, pitch, "rgba(30,34,46,0.16)");
  for (let i = N - 1; i >= 0; i--) {
    const y = H - 44 - i * pitch;
    const x0 = cx(i) - half(i);
    const w = half(i) * 2;
    const lit = Math.min(6, 3 + Math.floor(i / 4));
    // cheek (the plaster ribbon), tread, riser
    rect(g, x0 - 10, y - 2, w + 20, pitch + 4, "#e9e6de");
    rect(g, x0, y, w, 24, K.R.cream[lit]);
    rect(g, x0, y, w, 2, "#ffffff");
    rect(g, x0, y + 24, w, 8, "#bdb8ab");
    rect(g, x0, y + 30, w, 2, "#8f8b80");
    rect(g, x0 - 10, y - 2, 4, pitch + 4, "#fbfaf6");
    rect(g, x0 + w + 6, y - 2, 4, pitch + 4, "#c9c3b5");
    // warm LED strip under the cheek
    rect(g, x0 - 12, y + pitch, 4, 3, "#ffd9a0");
    rect(g, x0 + w + 8, y + pitch, 4, 3, "#ffd9a0");
  }
  // solid white plaster balustrade, both sides, following the curve (videos 103135 and 103514, 0:00 to 0:14)
  for (const side of [-1, 1]) {
    let px = 0;
    let py = 0;
    for (let i = 0; i < N; i++) {
      const x = cx(i) + side * (half(i) + 6);
      const y = H - 44 - i * pitch;
      const bx = side < 0 ? x - 10 : x - 2;
      rect(g, bx, y - 38, 12, pitch + 40, side < 0 ? "#f6f4ee" : "#e4e0d6");
      rect(g, bx, y - 38, 3, pitch + 40, side < 0 ? "#ffffff" : "#f1eee6");
      rect(g, bx + 10, y - 38, 2, pitch + 40, side < 0 ? "#d6d1c5" : "#bdb8ab");
      if (i > 0) K.pline(g, px, py - 40, x, y - 40, "#ffffff", 5);
      px = x;
      py = y;
    }
  }
  return c;
}

function archFrame(): HTMLCanvasElement {
  // outer 176 x 196, opening 128 wide with a round head
  const W = 176;
  const H = 196;
  const [c, g] = mk(W, H);
  const springY = 72; // where the round head starts
  for (let y = 0; y < H; y++) {
    let halfOpen = 64;
    if (y < springY) {
      const d = (springY - y) / (springY - 10);
      halfOpen = d >= 1 ? 0 : Math.round(64 * Math.sqrt(1 - d * d));
    }
    const left = W / 2 - halfOpen;
    const right = W / 2 + halfOpen;
    // walnut frame
    for (let x = 0; x < W; x += 4) {
      if (x + 4 <= left || x >= right) {
        const edge = Math.min(Math.abs(x - left), Math.abs(x - right)) < 8;
        rect(g, x, y, 4, 1, edge ? K.R.walnut[6] : K.R.walnut[3 + (hash(x, 3, 2) < 0.5 ? 0 : 1)]);
      }
    }
    if (halfOpen > 0) {
      rect(g, left - 4, y, 4, 1, K.R.walnut[1]);
      rect(g, right, y, 4, 1, K.R.walnut[7]);
    }
  }
  for (let x = 6; x < W; x += 22) rect(g, x, 0, 1, H, K.R.walnut[1]);
  rect(g, 0, 0, W, 4, K.R.walnut[7]);
  rect(g, 0, 0, 3, H, K.R.walnut[6]);
  rect(g, W - 3, 0, 3, H, K.R.walnut[1]);
  return c;
}

function pier(exit: boolean): HTMLCanvasElement {
  const [c, g] = mk(72, 178);
  ellipse(g, 36, 170, 30, 6, "rgba(20,24,40,0.28)");
  rect(g, 10, 6, 52, 162, K.R.plaster[5]);
  rect(g, 10, 6, 8, 162, K.R.plaster[6]);
  rect(g, 52, 6, 10, 162, K.R.plaster[3]);
  rect(g, 4, 0, 64, 10, K.R.walnut[4]);
  rect(g, 4, 0, 64, 2, K.R.walnut[7]);
  rect(g, 8, 156, 56, 12, K.R.walnut[4]);
  rect(g, 8, 156, 56, 2, K.R.walnut[6]);
  // white and brass sconce with warm uplight
  rect(g, 28, 60, 16, 22, "#fbfaf6");
  rect(g, 28, 82, 16, 4, "#c9a84a");
  rect(g, 34, 86, 4, 8, "#c9a84a");
  dither(g, 20, 20, 32, 40, "rgba(0,0,0,0)", "rgba(255,226,168,0.8)", 0.45, 2);
  if (exit) K.exitSign(g, 14, 120);
  return c;
}

function receptionDesk(): HTMLCanvasElement {
  const [c, g] = mk(236, 116);
  ellipse(g, 118, 108, 112, 6, "rgba(20,24,40,0.3)");
  // monitor and a small plant on the top
  rect(g, 150, 10, 44, 28, "#17181a");
  rect(g, 153, 13, 38, 20, "#7fd0e0");
  rect(g, 156, 16, 20, 2, "#e9fffb");
  rect(g, 156, 21, 28, 2, "#3a8fa3");
  rect(g, 168, 38, 8, 6, "#3a3d41");
  ellipse(g, 44, 28, 12, 10, K.R.leaf[3]);
  ellipse(g, 38, 24, 7, 6, K.R.leaf[5]);
  rect(g, 38, 34, 12, 10, "#f2f0ea");
  // cream stone top
  rect(g, 2, 42, 232, 12, K.R.cream[5]);
  rect(g, 2, 42, 232, 3, "#ffffff");
  rect(g, 2, 52, 232, 3, K.R.cream[0]);
  // timber-framed front
  rect(g, 6, 55, 224, 48, K.R.walnut[5]);
  for (let x = 6; x < 230; x += 56) {
    rect(g, x, 55, 4, 48, K.R.walnut[2]);
    rect(g, x + 4, 55, 2, 48, K.R.walnut[7]);
    rect(g, x + 10, 61, 40, 36, K.R.walnut[4]);
    rect(g, x + 10, 61, 40, 2, K.R.walnut[6]);
  }
  rect(g, 6, 99, 224, 5, K.R.walnut[1]);
  rect(g, 96, 60, 44, 40, K.R.cream[5]);
  drawCrest(g, 106, 62, 24);
  text(g, "HKU", 118, 90, 9, "#3d2a20", { align: "center" });
  // warm strip under the top
  rect(g, 6, 55, 224, 2, "#ffd9a0");
  return c;
}

function hoursTotem(): HTMLCanvasElement {
  const [c, g] = mk(92, 168);
  ellipse(g, 46, 160, 36, 6, "rgba(20,24,40,0.3)");
  rect(g, 8, 4, 76, 152, "#17181a");
  rect(g, 8, 4, 76, 3, "#44464b");
  rect(g, 12, 10, 68, 122, "#0f2f4a");
  dither(g, 12, 10, 68, 50, "#134a6e", "#0f2f4a", 0.5, 2);
  text(g, "BUILDING 5", 46, 16, 11, "#ffffff", { align: "center" });
  text(g, "& SPORTS COURT", 46, 29, 8, "#ffffff", { align: "center" });
  text(g, "ARE NOW OPEN", 46, 40, 9, "#ffd23f", { align: "center" });
  text(g, "五号楼开放", 46, 54, 11, "#bfe9f2", { align: "center" });
  rect(g, 20, 72, 52, 1, "#3a8fa3");
  text(g, "08:00-22:00", 46, 78, 12, "#ffffff", { align: "center" });
  text(g, "7 Days a Week", 46, 96, 8, "#bfe9f2", { align: "center" });
  text(g, "Sports · Study", 46, 108, 8, "#bfe9f2", { align: "center" });
  text(g, "Co-Creation", 46, 118, 8, "#bfe9f2", { align: "center" });
  drawCrest(g, 38, 136, 16);
  rect(g, 4, 154, 84, 6, "#2a2b30");
  return c;
}

function longTable(g: Ctx, tx: number, ty: number, len: number, solid: Uint8Array, cols: number): void {
  const x = tx * T;
  const y = ty * T;
  const h = len * T;
  // chairs along both sides: bentwood with woven cane seats
  for (let j = 10; j < h - 34; j += 42) {
    for (const cx of [x + 4, x + 96]) {
      rect(g, cx + 2, y + j + 26, 26, 4, "rgba(30,20,14,0.3)");
      rect(g, cx, y + j, 28, 26, "#8f705a");
      rect(g, cx, y + j, 28, 3, "#b08d74");
      rect(g, cx + 4, y + j + 5, 20, 16, "#d8bf95");
      for (let k = 0; k < 4; k++) rect(g, cx + 4, y + j + 7 + k * 4, 20, 1, "#b79a6c");
      rect(g, cx === x + 4 ? cx : cx + 24, y + j, 4, 26, "#6e523f");
    }
  }
  rect(g, x + 36, y + h - 4, 64, 8, "rgba(30,20,14,0.35)");
  rect(g, x + 34, y + 2, 60, h - 14, K.R.walnut[4]);
  for (let j = 2; j < h - 14; j += 3) if (hash(tx, j, 8) < 0.4) rect(g, x + 36 + Math.floor(hash(j, tx, 3) * 30), y + j, 22, 1, K.R.walnut[hash(j, 1, tx) < 0.5 ? 3 : 5]);
  rect(g, x + 34, y + 2, 60, 3, K.R.walnut[7]);
  rect(g, x + 34, y + 2, 3, h - 14, K.R.walnut[6]);
  rect(g, x + 91, y + 2, 3, h - 14, K.R.walnut[2]);
  rect(g, x + 34, y + h - 12, 60, 8, K.R.walnut[1]);
  dither(g, x + 46, y + 20, 36, h - 60, "rgba(0,0,0,0)", "rgba(255,236,200,0.5)", 0.18, 2);
  block(solid, cols, tx, ty, 2, len);
}

function buildLobby(): GameMap {
  const COLS = 36;
  const ROWS = 22;
  const W = COLS * T;
  const H = ROWS * T;
  const [ground, g] = mk(W, H);
  const solid = new Uint8Array(COLS * ROWS);
  const props: Prop[] = [];
  const triggers: Trigger[] = [];
  const st: K.Stage = { g, props, solid, cols: COLS };

  const GX0 = T; // galleria x range: cols 1..22
  const GX1 = 23 * T;
  const DIV_TOP = 10 * T;
  const FACE_Y = DIV_TOP + 32;
  const FACE_H = 160;
  const LOBBY_Y = 13 * T;

  // ------------------------------------------------ University Galleria
  K.planks(g, GX0, 3 * T, GX1 - GX0, 7 * T, K.R.honeyOak, 11);
  // end wall: plaster vault ends over three walnut bays
  rect(g, GX0, 0, GX1 - GX0, 192, K.R.plaster[5]);
  dither(g, GX0, 0, GX1 - GX0, 20, K.R.plaster[5], K.R.plaster[3], 0.5, 2);
  const bay = (x: number, w: number, top: number): void => {
    const spring = top + Math.round(w * 0.2);
    for (let y = top; y < 192; y++) {
      let half = w / 2;
      if (y < spring) {
        const d = (spring - y) / (spring - top);
        half = Math.round((w / 2) * Math.sqrt(Math.max(0, 1 - d * d)));
      }
      if (half <= 0) continue;
      const cx = x + w / 2;
      rect(g, cx - half, y, half * 2, 1, K.R.walnut[3]);
      rect(g, cx - half, y, Math.min(8, half), 1, K.R.walnut[6]);
      rect(g, cx + half - Math.min(8, half), y, Math.min(8, half), 1, K.R.walnut[5]);
    }
    for (let px = x + 12; px < x + w - 12; px += 32) {
      rect(g, px, spring, 1, 192 - spring, K.R.walnut[1]);
      rect(g, px + 1, spring, 1, 192 - spring, K.R.walnut[5]);
      for (let k = 0; k < 3; k++) rect(g, px + 6 + Math.floor(hash(px, k, 2) * 20), spring + Math.floor(hash(px, k, 3) * 60), 1, 50, K.R.walnut[2]);
    }
    rect(g, x, 184, w, 8, K.R.walnut[0]);
  };
  bay(GX0 + 32, 5 * T + 32, 30);
  bay(7 * T + 16, 10 * T - 32, 10);
  bay(17 * T + 16, 5 * T + 32, 30);
  // the lit rose emblem
  const ex = 12 * T;
  K.lightPool(g, ex, 92, 110, 70, "255,226,168", 0.1);
  ellipse(g, ex, 92, 38, 38, "#c9a84a");
  ellipse(g, ex, 92, 34, 34, "#fff3c4");
  ellipse(g, ex, 92, 28, 28, "#c21a24");
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    ellipse(g, ex + Math.cos(a) * 16, 92 + Math.sin(a) * 16, 7, 7, k % 2 ? "#f6c1c8" : "#fff3c4");
  }
  ellipse(g, ex, 92, 9, 9, "#d9b441");
  drawCrest(g, ex - 9, 82, 18);
  // two lit niches and sconces
  for (const nx of [ex - 210, ex + 170]) {
    rect(g, nx, 70, 40, 90, "#ffe2a8");
    ellipse(g, nx + 20, 70, 20, 16, "#ffe2a8");
    dither(g, nx, 110, 40, 50, "#ffe2a8", "#e9b96a", 0.5, 2);
    rect(g, nx + 12, 120, 16, 34, "#f6f4ee");
    ellipse(g, nx + 20, 118, 10, 8, "#3d7d43");
    frame(g, nx - 3, 54, 46, 108, K.R.walnut[6], 3);
  }
  for (const sx of [3 * T + 20, 20 * T - 4]) {
    dither(g, sx - 14, 60, 44, 50, "rgba(0,0,0,0)", "rgba(255,226,168,0.8)", 0.4, 2);
    rect(g, sx, 108, 16, 22, "#fbfaf6");
    rect(g, sx, 130, 16, 4, "#c9a84a");
  }
  // teal service cabinet on the left
  rect(g, 2 * T - 20, 128, 84, 60, "#2f7f7a");
  rect(g, 2 * T - 20, 128, 84, 4, "#57a8a2");
  rect(g, 2 * T + 21, 132, 2, 56, "#1f5a56");
  rect(g, 2 * T + 12, 152, 4, 10, "#d9b441");
  rect(g, 2 * T + 28, 152, 4, 10, "#d9b441");
  K.ao(g, GX0, 192, GX1 - GX0, 22, 0.5);
  // low platform with the head table and six chairs
  const px0 = 8 * T;
  const pw = 8 * T;
  rect(g, px0, 3 * T, pw, 2 * T - 6, K.R.honeyOak[5]);
  K.planks(g, px0 + 4, 3 * T, pw - 8, 2 * T - 14, K.R.honeyOak, 31, 16, 4.5);
  rect(g, px0, 5 * T - 14, pw, 8, K.R.honeyOak[1]);
  rect(g, px0, 5 * T - 6, pw, 4, "rgba(30,20,14,0.3)");
  for (let k = 0; k < 6; k++) {
    const cxk = 9 * T + 26 + k * 60;
    rect(g, cxk, 3 * T - 6, 30, 30, "#8f705a");
    rect(g, cxk, 3 * T - 6, 30, 4, "#b08d74");
    rect(g, cxk + 4, 3 * T + 2, 22, 18, "#6e523f");
  }
  rect(g, 9 * T + 8, 3 * T + 22, 6 * T - 16, 30, K.R.walnut[4]);
  rect(g, 9 * T + 8, 3 * T + 22, 6 * T - 16, 3, K.R.walnut[7]);
  rect(g, 9 * T + 8, 3 * T + 52, 6 * T - 16, 10, K.R.walnut[1]);
  for (let k = 0; k < 6; k++) {
    ellipse(g, 9 * T + 41 + k * 60, 3 * T + 36, 10, 6, "#f6f4ee");
    rect(g, 9 * T + 54 + k * 60, 3 * T + 30, 4, 8, "#eaf6ff");
  }
  block(solid, COLS, 9, 3, 6, 1);
  // long refectory tables in three naves
  for (const tx of [3, 9, 13, 19]) longTable(g, tx, 5, 4, solid, COLS);
  // piers between the naves
  for (const [tx, ty] of [[6, 4], [6, 8], [17, 4], [17, 8]] as const) {
    K.place(st, pier(tx === 6 && ty === 8), tx * T + 32, ty * T + 60, true);
    block(solid, COLS, tx, ty, 1, 1);
  }
  // chandeliers down the centreline, with pools of warm light
  const ch = K.chandelier();
  for (const ty of [5, 8]) {
    K.lightPool(g, 12 * T, ty * T + 40, 170, 80, "255,236,190", 0.07);
    props.push({ sprite: ch, x: 12 * T - ch.width / 2, y: ty * T - 110, sortY: 99999 });
  }

  // ------------------------------------------------ courtyard behind the glass
  const CX0 = 24 * T;
  const CW = 11 * T;
  for (let j = 0; j < DIV_TOP; j += 32)
    for (let i = 0; i < CW + 64; i += 64) {
      const v = hash(i, j, 21);
      rect(g, CX0 + i + ((j / 32) & 1 ? 32 : 0) - 32, j, 64, 32, v < 0.33 ? "#a6a6a1" : v < 0.66 ? "#b0b0ab" : "#babab5");
      rect(g, CX0 + i + ((j / 32) & 1 ? 32 : 0) - 32, j, 64, 1, "#8f8f8a");
    }
  rect(g, CX0 - 32, 0, 32, DIV_TOP, "#b0b0ab");
  const hedge = (x: number, y: number, w: number, h: number): void => {
    rect(g, x + 6, y + 8, w, h, "rgba(20,24,40,0.25)");
    rect(g, x, y, w, h, "#3d7d43");
    for (let j = 0; j < h; j += 4) for (let i = 0; i < w; i += 4) if (hash(x + i, y + j, 9) < 0.45) rect(g, x + i, y + j, 4, 4, K.R.leaf[1 + Math.floor(hash(i, j, x) * 4)]);
    rect(g, x, y, w, 4, K.R.leaf[5]);
    rect(g, x, y + h - 6, w, 6, K.R.leaf[0]);
  };
  hedge(CX0 + 16, 16, CW - 32, 56);
  hedge(CX0 + 16, 16, 56, DIV_TOP - 96);
  hedge(CX0 + CW - 72, 16, 56, DIV_TOP - 96);
  rect(g, CX0 + 140, 150, CW - 280, 330, "#69b463");
  dither(g, CX0 + 140, 150, CW - 280, 330, "#69b463", "#4f9850", 0.3, 4);
  frame(g, CX0 + 140, 150, CW - 280, 330, "#8f8f8a", 4);
  const tree = (cx: number, cy: number, r: number): void => {
    ellipse(g, cx + 12, cy + 18, r, r * 0.8, "rgba(20,24,40,0.25)");
    ellipse(g, cx, cy, r, r * 0.9, K.R.leaf[1]);
    for (let k = 0; k < 18; k++) {
      const a = hash(k, cx, 5) * Math.PI * 2;
      const rr = hash(k, cx, 6) * r * 0.7;
      ellipse(g, cx + Math.cos(a) * rr - 4, cy + Math.sin(a) * rr * 0.8 - 5, r * 0.3, r * 0.26, K.R.leaf[2 + Math.floor(hash(k, cy, 7) * 4)]);
    }
  };
  tree(CX0 + 230, 250, 56);
  tree(CX0 + 470, 380, 62);
  tree(CX0 + 360, 190, 40);
  wallTop(g, 23 * T, 0, T, DIV_TOP);
  wallTop(g, 0, 0, T, H);
  wallTop(g, W - T, 0, T, H);

  // ------------------------------------------------ lobby floor
  K.stone(g, T, LOBBY_Y, W - 2 * T, 8 * T, K.R.cream, 64, 5);
  K.lattice(g, 9 * T, 14 * T + 16, 22 * T, 5 * T + 32);
  K.lightPool(g, 29 * T + 32, LOBBY_Y + 70, 330, 90, "214,240,250", 0.09);

  // ------------------------------------------------ the dividing wall, seen from the lobby
  wallTop(g, T, DIV_TOP, W - 2 * T, 32);
  K.marbleWall(g, T, FACE_Y, 22 * T, FACE_H, 3);
  // passage under the arch: oak in shadow
  K.planks(g, 11 * T, DIV_TOP, 2 * T, 3 * T, K.R.honeyOak, 11, 16, 2);
  rect(g, 11 * T, DIV_TOP, 2 * T, 3 * T, "rgba(40,24,16,0.5)");
  rect(g, 11 * T, DIV_TOP, 2 * T, T, "rgba(40,24,16,0.25)");
  K.ao(g, 11 * T, DIV_TOP, 2 * T, 40, 0.6);
  const arch = archFrame();
  props.push({ sprite: arch, x: 12 * T - arch.width / 2, y: LOBBY_Y - arch.height, sortY: LOBBY_Y });
  // directory glass panel
  K.directoryPanel(g, 13 * T + 40, FACE_Y + 12, 72, 140);
  // lift 1
  const lx = 15 * T + 6;
  rect(g, lx - 6, FACE_Y + 26, 128, 134, "#8d9296");
  rect(g, lx, FACE_Y + 32, 116, 122, "#b8bcc0");
  for (let x = lx; x < lx + 116; x += 4) rect(g, x, FACE_Y + 32, 1, 122, hash(x, 2, 4) < 0.5 ? "#c9cdd1" : "#a9adb1");
  rect(g, lx + 57, FACE_Y + 32, 2, 122, "#5d6266");
  rect(g, lx, FACE_Y + 32, 116, 2, "#e3e6e9");
  text(g, "1", lx + 58, FACE_Y + 6, 18, "#3d4144", { align: "center" });
  rect(g, lx + 126, FACE_Y + 78, 10, 22, "#2a2d30");
  rect(g, lx + 129, FACE_Y + 82, 4, 4, "#ffd23f");
  rect(g, lx + 129, FACE_Y + 90, 4, 4, "#8d9296");
  // white marble pier engraved 05 / B2
  const pxx = 17 * T + 8;
  rect(g, pxx, FACE_Y - 6, 52, FACE_H + 6, "#e9eceb");
  rect(g, pxx, FACE_Y - 6, 4, FACE_H + 6, "#f8faf9");
  rect(g, pxx + 46, FACE_Y - 6, 6, FACE_H + 6, "#bdc6c4");
  K.pline(g, pxx + 12, FACE_Y + 30, pxx + 30, FACE_Y + 60, "#cfd6d4", 1);
  for (const [s, yy] of [["05", 34], ["B2", 84]] as const) {
    // silver outline numerals
    for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1]] as const) text(g, s, pxx + 24 + ox, FACE_Y + yy + oy, 27, "#7d898c", { align: "center" });
    text(g, s, pxx + 24, FACE_Y + yy, 27, "#e3e8e7", { align: "center" });
  }
  rect(g, pxx + 22, FACE_Y + 70, 6, 3, "#9aa3a5");
  rect(g, pxx + 34, FACE_Y + 10, 10, 12, "#c21a24");
  K.exitSign(g, pxx + 4, FACE_Y + 128);
  // picture wall: five dark framed artworks
  const art = ["#c8793a", "#2f7f7a", "#7b4bd6", "#c21a24", "#d9b441"];
  for (let k = 0; k < 5; k++) {
    const ax = 18 * T + 24 + k * 60;
    rect(g, ax + 3, FACE_Y + 49, 44, 62, "rgba(60,50,40,0.3)");
    rect(g, ax, FACE_Y + 46, 44, 62, "#1c1d21");
    rect(g, ax + 4, FACE_Y + 50, 36, 54, "#f1ede2");
    rect(g, ax + 8, FACE_Y + 56, 28, 40, art[k]);
    ellipse(g, ax + 22, FACE_Y + 74, 8, 10, "rgba(255,255,255,0.45)");
    rect(g, ax + 10, FACE_Y + 86, 24, 6, "rgba(0,0,0,0.25)");
  }
  // dome camera
  ellipse(g, 21 * T + 20, FACE_Y + 26, 7, 5, "#e9e9e9");
  ellipse(g, 21 * T + 20, FACE_Y + 28, 4, 3, "#1c1d21");
  // pier before the glass
  rect(g, 23 * T, FACE_Y - 6, T, FACE_H + 6, "#d9d1c4");
  rect(g, 23 * T, FACE_Y - 6, 5, FACE_H + 6, "#ece6dc");
  K.exitSign(g, 23 * T + 10, FACE_Y + 22);
  // courtyard glass and its doors
  K.courtyardGlass(g, 24 * T, FACE_Y, 11 * T, FACE_H);
  frame(g, 28 * T + 4, FACE_Y + 30, 120, FACE_H - 30, "#26221f", 4);
  rect(g, 28 * T + 62, FACE_Y + 30, 4, FACE_H - 30, "#26221f");
  rect(g, 28 * T + 50, FACE_Y + 90, 4, 24, "#d9d6cf");
  rect(g, 28 * T + 74, FACE_Y + 90, 4, 24, "#d9d6cf");
  K.exitSign(g, 28 * T + 42, FACE_Y + 8);
  K.ao(g, T, LOBBY_Y, W - 2 * T, 20, 0.35);

  // ------------------------------------------------ entrance wall (south), seen from inside
  const SY = 21 * T;
  rect(g, 0, SY, W, T, "#b0b0ab");
  for (let x = 0; x < W; x += 64) rect(g, x, SY + 34, 1, 30, "#8f8f8a");
  rect(g, T, SY + 4, W - 2 * T, 26, "rgba(143,179,189,0.8)");
  rect(g, T, SY + 12, W - 2 * T, 8, "rgba(236,244,246,0.75)");
  for (let x = T + 30; x < W - T - 60; x += 128) text(g, x % 256 < 128 ? "HKU" : "Est. 1911", x, SY + 11, 9, "#6d8792");
  for (let x = T; x < W - T; x += 64) rect(g, x, SY, 4, 32, "#3c3a32");
  rect(g, T, SY, W - 2 * T, 5, "#3c3a32");
  rect(g, T, SY + 28, W - 2 * T, 4, "#26221f");
  // the open sliding doors and the mat
  K.stone(g, 17 * T, SY, 2 * T, T, K.R.cream, 64, 5);
  rect(g, 17 * T + 6, SY - 24, 2 * T - 12, 22, "#4a4c50");
  for (let x = 17 * T + 8; x < 19 * T - 8; x += 6) rect(g, x, SY - 24, 2, 22, "#35373a");
  rect(g, 17 * T - 6, SY, 6, 32, "#26221f");
  rect(g, 19 * T, SY, 6, 32, "#26221f");
  dither(g, 17 * T, SY + 24, 2 * T, 40, "rgba(0,0,0,0)", "rgba(255,255,255,0.7)", 0.4, 2);

  // ------------------------------------------------ feature stair, floor stands, table, plants
  const stair = featureStair();
  props.push({ sprite: stair, x: 2 * T - 36, y: 18 * T - stair.height + 20, sortY: 18 * T - 4 });
  block(solid, COLS, 2, 13, 5, 5);
  K.place(st, K.floorStand("Mind Your Step", "请小心台阶"), 7 * T + 32, 18 * T + 40);
  K.place(st, K.floorStand("Mind Your Head", "请小心碰头"), 1 * T + 36, 18 * T + 50);
  block(solid, COLS, 7, 18, 1, 1);
  block(solid, COLS, 1, 18, 1, 1);
  // tall oval pedestal table: maroon base, white top
  const [ot, og] = mk(72, 150);
  ellipse(og, 36, 142, 30, 6, "rgba(20,24,40,0.3)");
  rect(og, 20, 40, 32, 100, "#5c1f22");
  rect(og, 20, 40, 6, 100, "#7a2d30");
  rect(og, 46, 40, 6, 100, "#3d1416");
  ellipse(og, 36, 138, 16, 5, "#3d1416");
  ellipse(og, 36, 42, 35, 16, "#b9b6ae");
  ellipse(og, 36, 38, 35, 16, "#fbfaf6");
  ellipse(og, 36, 38, 29, 12, "#f1efe8");
  ellipse(og, 26, 33, 14, 4, "#ffffff");
  K.place(st, ot, 20 * T + 32, 17 * T + 56, true);
  block(solid, COLS, 20, 16, 1, 2);
  K.place(st, receptionDesk(), 27 * T, 18 * T + 56, true);
  block(solid, COLS, 25, 18, 4, 1);
  K.place(st, hoursTotem(), 14 * T + 32, 20 * T + 44, true);
  block(solid, COLS, 14, 20, 1, 1);
  K.lightPool(g, 27 * T, 18 * T, 240, 110, "255,226,168", 0.06);
  const pl = K.plant(124);
  for (const [tx, ty] of [[9, 13], [34, 13], [34, 20], [1, 20]] as const) {
    K.place(st, pl, tx * T + 32, ty * T + 58, true);
    block(solid, COLS, tx, ty, 1, 1);
  }

  // ------------------------------------------------ collision
  block(solid, COLS, 0, 0, COLS, 3); // galleria end wall and the courtyard top
  block(solid, COLS, 0, 0, 1, ROWS);
  block(solid, COLS, COLS - 1, 0, 1, ROWS);
  block(solid, COLS, 23, 0, 13, 13); // courtyard, not reachable
  block(solid, COLS, 0, 10, COLS, 3); // dividing wall
  block(solid, COLS, 11, 10, 2, 3, 0); // the arch
  block(solid, COLS, 0, ROWS - 1, COLS, 1);
  block(solid, COLS, 17, ROWS - 1, 2, 1, 0); // the door

  const info = (id: string, tx: number, ty: number, w: number, h: number, en: string, zh: string, textEn: string): void => {
    triggers.push({ id, tx, ty, w, h, en, zh, action: { type: "info", title: en, titleZh: zh, text: textEn } });
  };
  triggers.push({ id: "exit", tx: 17, ty: 21, w: 2, h: 1, en: "Exit", zh: "出口", auto: true, action: { type: "goto", map: "outside", spawn: "b5-door" } });
  triggers.push({ id: "up", tx: 4, ty: 18, w: 3, h: 1, en: "Stairs to 2/F", zh: "上二楼", action: { type: "goto", map: "b5-2", spawn: "stair" } });
  triggers.push({ id: "lift", tx: 15, ty: 13, w: 2, h: 1, en: "Lift", zh: "电梯", action: { type: "lift", building: "b5" } });
  info("pillar", 17, 13, 1, 1, "Pier 05 / B2", "05 / B2 石柱", "The white marble pier by lift 1 is engraved 05 over B2. 05 is Building 5. Nobody on the team knows yet what B2 stands for.");
  info("directory", 13, 13, 2, 1, "Directory panel", "楼层索引", "A tall dark glass panel beside lift 1, covered in small white lines of text: the building directory.");
  info("hours", 13, 19, 3, 1, "Opening hours", "开放时间", "Building 5 and the sports court are now open: your new space for sports, study and co-creation. 08:00 to 22:00, seven days a week, except public holidays.");
  info("reception", 25, 19, 4, 1, "Reception", "前台", "Building 5 is the student amenity centre, north of CDS-1. It opened on 30 August 2026 with a fitness room, music and dance rooms, a game hub and study spaces.");
  info("pictures", 19, 13, 3, 1, "Picture wall", "画廊墙", "Backlit beige marble with a row of dark framed artworks at eye level, under a warm cove of light.");
  info("oval-table", 19, 16, 3, 2, "Oval table", "椭圆高桌", "One tall oval pedestal table, maroon base and white top, standing alone on the inlaid lattice floor.");
  info("mind-your-head", 6, 19, 3, 1, "Feature stair", "旋转楼梯", "A white feature stair with a solid white plaster balustrade curves up to 2/F, turning over a small landing on the way. A second curved flight goes on from 2/F to 3/F, where the stair stops. The signs say Mind Your Step and Mind Your Head.");
  info("courtyard", 27, 13, 4, 1, "Courtyard", "庭院", "Full-height glass looks onto a paved courtyard with clipped hedges and trees.");
  info("high-table", 11, 4, 2, 1, "University Galleria", "大学长廊", "Three vaulted naves, crystal chandeliers and very long walnut tables. This hall is home to HKU's High Table Dinner tradition.");

  const npcs: NpcDef[] = [
    { id: "b5-visitor-1", char: "visitor1", tx: 24, ty: 16, dir: "left", name: "Visitor", nameZh: "访客" },
    { id: "b5-visitor-2", char: "visitor2", tx: 16, ty: 6, dir: "left", name: "Visitor", nameZh: "访客" },
    { id: "b5-guard", char: "guard", tx: 27, ty: 17, dir: "down", name: "Receptionist", nameZh: "前台" },
  ];

  return {
    id: "b5-1",
    name: "Building 5 1/F",
    nameZh: "五号楼 1 层",
    cols: COLS,
    rows: ROWS,
    ground,
    solid,
    props,
    npcs,
    triggers,
    spawns: { door: { tx: 17, ty: 20, dir: "up" }, stair: { tx: 5, ty: 19, dir: "down" }, lift: { tx: 15, ty: 13, dir: "down" } },
    labels: [
      { x: 12 * T, y: LOBBY_Y - arch.height - 6, en: "University Galleria", zh: "大学长廊" },
      { x: 5 * T, y: 13 * T - 40, en: "Stairs to 2/F", zh: "上二楼" },
      { x: 16 * T, y: LOBBY_Y - 150, en: "Lift", zh: "电梯" },
    ],
  };
}

// =====================================================================================
// 2/F amenity floor
// =====================================================================================

function hammock(): HTMLCanvasElement {
  const [c, g] = mk(170, 150);
  ellipse(g, 85, 142, 60, 6, "rgba(20,24,40,0.25)");
  rect(g, 8, 0, 3, 150, "#8a8d93");
  rect(g, 159, 0, 3, 150, "#8a8d93");
  rect(g, 2, 144, 16, 5, "#55575e");
  rect(g, 152, 144, 16, 5, "#55575e");
  for (let x = 12; x < 158; x += 2) {
    const t = (x - 12) / 146;
    const y = 44 + Math.round(Math.sin(t * Math.PI) * 48);
    rect(g, x, y, 2, 16, x % 12 < 6 ? "#c8323a" : "#a9262e");
    rect(g, x, y, 2, 3, "#ef6a70");
    rect(g, x, y + 14, 2, 2, "#7a1a20");
  }
  K.pline(g, 10, 30, 22, 52, "#d9d6cf", 2);
  K.pline(g, 160, 30, 148, 52, "#d9d6cf", 2);
  return c;
}

/** the web of ropes and nets with plush shapes that hangs over the chill zone */
function ropeNet(w: number, h: number): HTMLCanvasElement {
  const [c, g] = mk(w, h);
  const rope = "rgba(238,228,205,0.85)";
  for (let x = 0; x <= w; x += 36) {
    K.pline(g, x, 0, x + 18, h * 0.5, rope, 2);
    K.pline(g, x + 18, h * 0.5, x, h, rope, 2);
    K.pline(g, x + 36, 0, x + 18, h * 0.5, rope, 2);
    K.pline(g, x + 18, h * 0.5, x + 36, h, rope, 2);
  }
  rect(g, 0, 0, w, 3, "#c9bd9f");
  rect(g, 0, h - 3, w, 3, "#c9bd9f");
  const plush = ["#ffd23f", "#2ec4b6", "#e63946", "#7b4bd6", "#ff7a2f", "#3aa0ff", "#f6c1c8"];
  for (let k = 0; k < Math.floor(w / 46); k++) {
    const px = 24 + k * 46 + Math.floor(hash(k, w, 3) * 10);
    const py = 14 + Math.floor(hash(k, w, 4) * (h - 34));
    const col = plush[k % plush.length];
    if (k % 3 === 0) {
      ellipse(g, px, py, 11, 9, col);
      ellipse(g, px - 3, py - 3, 4, 3, "rgba(255,255,255,0.6)");
    } else if (k % 3 === 1) {
      rect(g, px - 9, py - 7, 18, 14, col);
      rect(g, px - 9, py - 7, 18, 3, "rgba(255,255,255,0.5)");
    } else {
      for (let j = 0; j < 14; j++) rect(g, px - j / 1.6, py - 7 + j, (j / 1.6) * 2, 1, col);
    }
  }
  return c;
}

function buildAmenity(): GameMap {
  const COLS = 40;
  const ROWS = 24;
  const W = COLS * T;
  const H = ROWS * T;
  const [ground, g] = mk(W, H);
  const solid = new Uint8Array(COLS * ROWS);
  const props: Prop[] = [];
  const triggers: Trigger[] = [];
  const st: K.Stage = { g, props, solid, cols: COLS };
  const WH = 192;

  // ------------------------------------------------ floors
  K.carpet(g, T, 9 * T, W - 2 * T, 14 * T); // base: grey carpet
  K.stone(g, T, WH, 12 * T, 6 * T, K.R.stone, 64, 8); // stair head and piano
  K.stone(g, T, 9 * T, W - 2 * T, 2 * T, K.R.stone, 64, 9); // glass corridor
  K.stone(g, 13 * T, 8 * T, 26 * T, T, K.R.stone, 64, 9);
  K.planks(g, 14 * T, WH, 5 * T, 6 * T - 64, K.R.paleWood, 21); // pool room
  rect(g, 20 * T, WH, 6 * T, 6 * T - 64, K.R.sport[3]); // table tennis room
  for (let j = 0; j < 5 * T; j += 4) for (let i = 0; i < 6 * T; i += 4) if (hash(i, j, 44) < 0.12) rect(g, 20 * T + i, WH + j, 4, 4, K.R.sport[hash(i, j, 45) < 0.5 ? 2 : 4]);
  // white court circle
  for (let a = 0; a < 360; a += 1.5) {
    const r = (a * Math.PI) / 180;
    rect(g, 23 * T + Math.round(Math.cos(r) * 130), 5 * T + 40 + Math.round(Math.sin(r) * 78), 4, 4, "#f4f6f7");
  }
  // gym: rubber floor and the turf strip
  rect(g, 27 * T, WH, 12 * T, 5 * T, K.R.rubber[2]);
  for (let j = 0; j < 5 * T; j += 4) for (let i = 0; i < 12 * T; i += 4) if (hash(i, j, 46) < 0.2) rect(g, 27 * T + i, WH + j, 4, 4, K.R.rubber[Math.floor(hash(i, j, 47) * 5)]);
  rect(g, 27 * T, 7 * T, 12 * T, T, K.R.turf[2]);
  for (let j = 0; j < T; j += 2) for (let i = 0; i < 12 * T; i += 2) if (hash(i, j, 48) < 0.35) rect(g, 27 * T + i, 7 * T + j, 2, 3, K.R.turf[Math.floor(hash(i, j, 49) * 6)]);
  for (let x = 27 * T + 60; x < 39 * T; x += 128) rect(g, x, 7 * T + 4, 3, T - 8, "#e9f5e2");
  rect(g, 27 * T, 7 * T, 12 * T, 3, "#e9f5e2");
  // in front of the auditorium: pale wood
  K.planks(g, 21 * T, 15 * T, 7 * T, 6 * T, K.R.paleWood, 23);
  // chill zone: raised wooden bench platform
  rect(g, 14 * T - 8, 15 * T, 6 * T + 16, 2 * T + 10, "rgba(30,22,14,0.3)");
  K.planks(g, 14 * T - 12, 15 * T - 4, 6 * T + 16, 2 * T, K.R.paleWood, 25, 16, 4.5);
  rect(g, 14 * T - 12, 17 * T - 4, 6 * T + 16, 10, K.R.paleWood[0]);
  // the curving wood path laid over the carpet like a road
  const [pathC, pg] = mk(W, H);
  K.planks(pg, 0, 0, W, H, K.R.paleWood, 27, 16, 3.5);
  const pathSpan = (y: number): [number, number] | null => {
    if (y >= 11 * T && y < 21 * T) return [12 * T, 13 * T + 40];
    if (y >= 21 * T && y < 23 * T - 20) {
      const d = y - 21 * T;
      const R0 = 108;
      const inset = d < R0 ? 0 : 0;
      const cut = d > 108 - R0 ? Math.max(0, R0 - Math.round(Math.sqrt(Math.max(0, R0 * R0 - Math.pow(d - 0, 2))))) : 0;
      return [12 * T + Math.min(R0, cut) + inset, W - T];
    }
    return null;
  };
  for (let y = 11 * T; y < 23 * T; y++) {
    const sp = pathSpan(y);
    if (!sp) continue;
    g.drawImage(pathC, sp[0], y, sp[1] - sp[0], 1, sp[0], y, sp[1] - sp[0], 1);
    rect(g, sp[0], y, 3, 1, K.R.paleWood[0]);
    if (y < 21 * T) rect(g, sp[1] - 3, y, 3, 1, K.R.paleWood[0]);
  }
  rect(g, 13 * T + 40, 21 * T, W - T - (13 * T + 40), 3, K.R.paleWood[0]);
  rect(g, 12 * T + 108, 23 * T - 23, W - T - (12 * T + 108), 3, K.R.paleWood[0]);

  // ------------------------------------------------ north wall
  // stair head wall with the stencilled wayfinding column
  K.wall(g, T, 0, 4 * T, WH, "#e9e6de", "#f6f4ee", "#b9b6ae");
  const wf = ["← MEN'S SHOWERS", "男淋浴间", "MUSIC ROOM 1", "音乐室1", "DANCE ROOM", "舞蹈室", "→ TOILET", "洗手间"];
  rect(g, T + 14, 14, 3 * T - 22, 164, "#3a3d41");
  rect(g, T + 14, 14, 3 * T - 22, 3, "#55585d");
  wf.forEach((s, i) => text(g, s, T + 26, 24 + i * 19 + (i % 2 ? -2 : 0), i % 2 ? 13 : 12, i % 2 ? "#cfd3d6" : "#f4f2ec"));
  // big stencilled floor number beside it
  text(g, "2", 4 * T + 34, 34, 84, "#d9d6cf", { align: "center" });
  text(g, "2", 4 * T + 32, 32, 84, "#3a3d41", { align: "center" });
  text(g, "二层", 4 * T + 32, 126, 18, "#3a3d41", { align: "center" });
  // the pop-art skyline mural
  K.wall(g, 5 * T, 0, 8 * T, WH, "#e9e6de", "#f6f4ee", "#b9b6ae");
  K.muralSkyline(g, 5 * T + 24, 12, 8 * T - 48, WH - 26, true);
  // pool room wall: skyline decal and a pale cubby shelf
  K.wall(g, 13 * T, 0, 7 * T, WH, "#ece8dc", "#f8f5ec", "#bdb8a8");
  K.muralSkyline(g, 14 * T + 12, 16, 150, 84, false);
  text(g, "Est. 1911", 17 * T + 60, 40, 18, "#b9b3a0", { align: "center" });
  for (let r = 0; r < 2; r++)
    for (let k = 0; k < 9; k++) {
      const sx = 14 * T + 10 + k * 33;
      const sy = 112 + r * 34;
      rect(g, sx, sy, 33, 34, "#d2ae87");
      rect(g, sx + 3, sy + 3, 27, 28, "#9a7650");
      rect(g, sx + 3, sy + 3, 27, 5, "#7d5d3d");
      if (hash(k, r, 71) < 0.5) rect(g, sx + 7, sy + 16, 8 + Math.floor(hash(k, r, 72) * 12), 15, ["#e63946", "#2ec4b6", "#ffd23f", "#f4f2ec"][Math.floor(hash(k, r, 73) * 4)]);
    }
  rect(g, 14 * T + 10, 110, 297, 3, "#e8cba9");
  // table tennis wall: bright yellow, GAME HUB plate
  rect(g, 20 * T, 0, 6 * T, WH, "#f2c62f");
  dither(g, 20 * T, 0, 6 * T, 30, "#f2c62f", "#c99c1a", 0.5, 2);
  dither(g, 20 * T, WH - 70, 6 * T, 40, "#f2c62f", "#ffdc5c", 0.4, 2);
  rect(g, 20 * T, 0, 6 * T, 14, "#6e4a2a");
  for (let x = 20 * T; x < 26 * T; x += 10) rect(g, x, 0, 2, 14, "#3d2816");
  K.pline(g, 20 * T + 30, 8, 22 * T, 2, "#ffffff", 2);
  K.pline(g, 22 * T, 2, 24 * T + 10, 10, "#ffffff", 2);
  rect(g, 20 * T, WH - 8, 6 * T, 8, "#26221f");
  rect(g, 21 * T + 30, 62, 200, 62, "#6b4a33");
  frame(g, 21 * T + 30, 62, 200, 62, "#4a3222", 3);
  rect(g, 21 * T + 44, 82, 36, 22, "#f4f2ec");
  rect(g, 21 * T + 50, 88, 10, 3, "#6b4a33");
  rect(g, 21 * T + 53, 85, 3, 10, "#6b4a33");
  rect(g, 21 * T + 68, 86, 4, 4, "#6b4a33");
  rect(g, 21 * T + 72, 92, 4, 4, "#6b4a33");
  text(g, "GAME HUB", 21 * T + 150, 70, 22, "#f4f2ec", { align: "center" });
  text(g, "电玩区", 21 * T + 150, 96, 18, "#f4f2ec", { align: "center" });
  // gym: maroon ceiling edge with yellow LED lines, canal windows, Est. 1911 logo wall
  rect(g, 27 * T, 0, 12 * T, 30, "#22110e");
  for (let x = 27 * T + 20; x < 39 * T - 120; x += 190) {
    K.pline(g, x, 22, x + 60, 6, "#ffcf4a", 2);
    K.pline(g, x + 60, 6, x + 150, 6, "#ffcf4a", 2);
    K.pline(g, x + 150, 6, x + 170, 20, "#ffcf4a", 2);
  }
  K.canalView(g, 27 * T, 30, 9 * T, WH - 30);
  rect(g, 36 * T, 30, 3 * T, WH - 30, "#f1e7a8");
  rect(g, 36 * T, 30, 3 * T, 60, "#78b9c2");
  dither(g, 36 * T, 84, 3 * T, 12, "#78b9c2", "#f1e7a8", 0.5, 2);
  text(g, "Est. 1911", 37 * T + 32, 100, 26, "#1e4fa0", { align: "center" });
  text(g, "HKU 香港大学", 37 * T + 32, 132, 14, "#2f7f7a", { align: "center" });
  drawCrest(g, 37 * T + 14, 36, 36);
  rect(g, 36 * T, WH - 8, 3 * T, 8, "#26221f");
  K.ao(g, T, WH, W - 2 * T, 18, 0.4);

  // ------------------------------------------------ stairwell down to 1/F
  const sx0 = T + 8;
  rect(g, sx0 - 4, WH - 4, 3 * T - 8, 3 * T + 4, "#3a3d41");
  for (let i = 0; i < 9; i++) {
    const y = WH + 3 * T - 22 - i * 20;
    const shadeI = Math.max(0, 6 - i);
    rect(g, sx0 + i * 2, y, 3 * T - 16 - i * 4, 16, K.R.cream[shadeI]);
    rect(g, sx0 + i * 2, y, 3 * T - 16 - i * 4, 2, K.R.cream[Math.min(6, shadeI + 1)]);
    rect(g, sx0 + i * 2, y + 16, 3 * T - 16 - i * 4, 4, "#8f8b80");
  }
  for (let k = 0; k < 5; k++) rect(g, sx0, WH, 3 * T - 16, 100 - k * 20, "rgba(20,22,28,0.22)");
  // glass balustrade with walnut rail round three sides
  rect(g, T, WH - 8, 4, 3 * T + 8, "#7a5a49");
  rect(g, 4 * T - 6, WH - 8, 4, 3 * T + 8, "#7a5a49");
  rect(g, T + 4, WH - 8, 8, 3 * T + 8, "rgba(190,220,232,0.4)");
  rect(g, 4 * T - 14, WH - 8, 8, 3 * T + 8, "rgba(190,220,232,0.4)");
  block(solid, COLS, 1, 3, 3, 3);
  // the second flight of the curved stair, on up to 3/F where it stops (Koki, 2026-11-21)
  for (let i = 0; i < 10; i++) {
    const y = 6 * T - 14 - i * 12;
    const dx = Math.round(12 * Math.sin((i / 9) * (Math.PI / 2)));
    const shadeI = Math.min(6, 1 + Math.floor(i / 2));
    rect(g, 4 * T + 6 + dx, y, T - 24, 12, K.R.cream[shadeI]);
    rect(g, 4 * T + 6 + dx, y + 10, T - 24, 2, "#8f8b80");
    rect(g, 4 * T + 2 + dx, y, 4, 12, "#f6f4ee");
    rect(g, 4 * T + T - 18 + dx, y, 4, 12, "#f6f4ee");
  }
  block(solid, COLS, 4, 4, 1, 2);

  // ------------------------------------------------ piano corner
  // white patterned rug
  for (let j = 0; j < 190; j += 2) {
    const d = (j - 95) / 95;
    const half = Math.round(250 * Math.sqrt(Math.max(0, 1 - d * d)));
    rect(g, 8 * T + 32 - half, 4 * T + j - 10, half * 2, 2, "#f1efe8");
  }
  for (let k = 0; k < 220; k++) {
    const a = hash(k, 1, 91) * Math.PI * 2;
    const rr = Math.sqrt(hash(k, 2, 91));
    rect(g, 8 * T + 32 + Math.cos(a) * rr * 236, 4 * T + 85 + Math.sin(a) * rr * 86, 6, 2, k % 2 ? "#cfd3d6" : "#b9c4cc");
  }
  const pn = K.piano();
  K.place(st, pn, 8 * T + 40, 6 * T - 8, true);
  block(solid, COLS, 7, 4, 3, 2);
  K.place(st, K.pianoBench(), 8 * T + 30, 6 * T + 44);
  block(solid, COLS, 8, 6, 1, 1);
  K.place(st, K.armchair("#c9a233", "#8f7220", "#e2bf55"), 5 * T + 32, 5 * T + 60, true);
  K.place(st, K.armchair("#d9692a", "#9b4517", "#f08a4b"), 11 * T + 32, 5 * T + 60, true);
  K.place(st, K.armchair("#5f6f7f", "#3f4b57", "#8494a3"), 11 * T + 32, 7 * T + 60, true);
  K.place(st, K.roundTable("#f4f2ec", 40), 10 * T + 32, 7 * T + 50);
  block(solid, COLS, 5, 5, 1, 1);
  block(solid, COLS, 11, 5, 1, 1);
  block(solid, COLS, 11, 7, 1, 1);
  block(solid, COLS, 10, 7, 1, 1);

  // ------------------------------------------------ room partitions
  for (const px of [13, 19, 26]) {
    rect(g, px * T + 22, WH, 20, 5 * T + 64, "rgba(176,208,222,0.45)");
    rect(g, px * T + 29, WH, 6, 5 * T + 64, "#17181a");
    rect(g, px * T + 35, WH, 6, 5 * T + 64, "rgba(20,24,40,0.15)");
    block(solid, COLS, px, 3, 1, 5);
    rect(g, px * T + 20, 0, 24, WH, "#17181a");
    rect(g, px * T + 20, 0, 3, WH, "#3a3d41");
  }
  // threshold strip under the glass line
  rect(g, 13 * T, 8 * T + 52, 26 * T, 8, "#17181a");
  rect(g, 13 * T, 8 * T + 50, 26 * T, 2, "#3a3d41");
  const glassRun = (c0: number, c1: number): void => {
    const sprite = K.glassPartition((c1 - c0 + 1) * T, 156, ["HKU", "Est. 1911"]);
    props.push({ sprite, x: c0 * T, y: 9 * T - 4 - 156, sortY: 9 * T - 6 });
    block(solid, COLS, c0, 8, c1 - c0 + 1, 1);
  };
  glassRun(13, 15);
  glassRun(17, 21);
  glassRun(24, 30);
  glassRun(33, 38);
  const doorHead = (c0: number, n: number): void => {
    const [c, dg] = mk(n * T, 156);
    rect(dg, 0, 0, n * T, 8, "#17181a");
    rect(dg, 0, 8, n * T, 1, "#3a3d41");
    props.push({ sprite: c, x: c0 * T, y: 9 * T - 4 - 156, sortY: 9 * T - 6 });
  };
  doorHead(16, 1);
  doorHead(22, 2);
  doorHead(31, 2);

  // ------------------------------------------------ pool room
  K.place(st, K.poolTable(), 16 * T + 32, 6 * T - 6, true);
  block(solid, COLS, 15, 4, 3, 2);
  K.place(st, K.roundTable("#f4f2ec", 44), 14 * T + 36, 7 * T + 40);
  K.place(st, K.chair("#f2c62f", "#e0b21f"), 18 * T + 32, 7 * T + 50);
  K.place(st, K.chair("#b9bcc2", "#a5a8ae"), 18 * T + 30, 3 * T + 62);
  block(solid, COLS, 14, 7, 1, 1);
  block(solid, COLS, 18, 7, 1, 1);
  block(solid, COLS, 18, 3, 1, 1);

  // ------------------------------------------------ table tennis room
  const tt = K.ttTable();
  K.place(st, tt, 21 * T + 32, 5 * T + 20, true);
  block(solid, COLS, 20, 4, 3, 1);
  K.place(st, tt, 24 * T + 32, 7 * T + 16, true);
  block(solid, COLS, 23, 6, 3, 1);

  // ------------------------------------------------ gym
  const tm = K.treadmill();
  for (const tx of [28, 30, 32]) {
    K.place(st, tm, tx * T + 32, 5 * T - 6, true);
    block(solid, COLS, tx, 3, 1, 2);
  }
  K.place(st, K.dumbbellRack(), 36 * T, 5 * T - 8, true);
  block(solid, COLS, 35, 3, 2, 2);
  K.place(st, K.bench(), 35 * T, 6 * T + 56);
  block(solid, COLS, 34, 6, 2, 1);
  // kettlebells on the turf
  for (let k = 0; k < 4; k++) {
    ellipse(g, 37 * T + 10 + k * 22, 7 * T + 40, 8, 7, ["#e63946", "#1e4fa0", "#ffd23f", "#17181a"][k]);
    frame(g, 37 * T + 5 + k * 22, 7 * T + 24, 10, 10, "#2a2b30", 2);
  }
  K.place(st, K.plant(116), 38 * T + 30, 3 * T + 58, true);
  block(solid, COLS, 38, 3, 1, 1);

  // ------------------------------------------------ glass corridor: white planter boxes, a teal bench
  const planterBox = (tx: number, n: number): void => {
    const [c, pg] = mk(n * T - 8, 84);
    rect(pg, 4, 76, n * T - 16, 8, "rgba(20,24,40,0.25)");
    rect(pg, 0, 36, n * T - 8, 42, "#f2f0ea");
    rect(pg, 0, 36, n * T - 8, 4, "#ffffff");
    rect(pg, n * T - 16, 40, 8, 38, "#c9c6bf");
    rect(pg, 0, 74, n * T - 8, 4, "#a9a6a0");
    for (let k = 0; k < n * 9; k++) {
      const bx = 8 + hash(k, tx, 31) * (n * T - 30);
      const by = 14 + hash(k, tx, 32) * 22;
      ellipse(pg, bx, by, 9 + hash(k, tx, 33) * 5, 8, K.R.leaf[1 + Math.floor(hash(k, tx, 34) * 5)]);
    }
    for (let k = 0; k < n * 4; k++) rect(pg, 8 + hash(k, tx, 35) * (n * T - 30), 8 + hash(k, tx, 36) * 20, 3, 3, k % 2 ? "#f6c1c8" : "#ffe36e");
    props.push({ sprite: c, x: tx * T + 4, y: 11 * T - 6 - 84, sortY: 11 * T - 8 });
    block(solid, COLS, tx, 10, n, 1);
  };
  planterBox(15, 2);
  planterBox(24, 2);
  planterBox(30, 2);
  planterBox(35, 2);
  // long teal bench cushions
  for (const bx of [19, 20, 21]) {
    rect(g, bx * T + 2, 10 * T + 50, T - 2, 8, "rgba(20,24,40,0.25)");
    rect(g, bx * T, 10 * T + 22, T, 30, "#3f8f8a");
    rect(g, bx * T, 10 * T + 22, T, 6, "#62b3ad");
    rect(g, bx * T, 10 * T + 46, T, 6, "#2a6a66");
    rect(g, bx * T + T - 2, 10 * T + 22, 2, 30, "#2a6a66");
    block(solid, COLS, bx, 10, 1, 1);
  }

  // ------------------------------------------------ the core: chill mural and the auditorium
  const CX = 14 * T;
  const CW = 14 * T;
  const CY = 11 * T;
  const CFACE = CY + 80;
  const CFH = 176;
  rect(g, CX, CY, CW, 80, "#2a2b30");
  for (let x = CX; x < CX + CW; x += 12) rect(g, x, CY, 6, 80, "#34363c");
  rect(g, CX, CY, CW, 4, "#55575e");
  rect(g, CX, CY + 74, CW, 6, "#17181a");
  K.wall(g, CX, CFACE, CW, CFH, "#e6e2d8", "#f4f1e9", "#b3aea2");
  K.muralSkyline(g, CX + 16, CFACE + 12, 5 * T - 28, CFH - 30, false);
  // strand-board panel with the crest pressed into it, straight left of the auditorium doors
  // (video 103514, 0:20 to 0:26: crest panel, then the glass doors, then the wayfinding pier)
  const ox = CX + 5 * T;
  const ow = 2 * T + 12;
  rect(g, ox, CFACE + 4, ow, CFH - 8, "#c79a5c");
  for (let j = 0; j < CFH - 8; j += 3)
    for (let i = 0; i < ow; i += 4) {
      const hv = hash(i, j, 311);
      if (hv < 0.55) rect(g, ox + i, CFACE + 4 + j, 3 + Math.floor(hash(i, j, 312) * 5), 2, hv < 0.2 ? "#a97c44" : hv < 0.4 ? "#d8b072" : "#b98a4e");
    }
  rect(g, ox, CFACE + 4, 3, CFH - 8, "#8f6a3a");
  rect(g, ox + ow - 3, CFACE + 4, 3, CFH - 8, "#8f6a3a");
  drawCrestIn(g, ox + 14, CFACE + 22, ow - 28, CFH - 60, "#7a5528");
  rect(g, ox + 10, CFACE + CFH - 30, 26, 12, "#1d7a3a");
  rect(g, ox + 14, CFACE + CFH - 27, 8, 6, "#d9f5e0");
  // the small performance hall behind glass: white chairs with olive seats facing a dark wall
  // with one huge black circle, under a red-orange slatted ceiling
  const kx = CX + 7 * T + 16;
  const kw = 7 * T - 32;
  rect(g, kx, CFACE + 8, kw, CFH - 16, "#3a3d41");
  rect(g, kx, CFACE + 8, kw, 26, "#c4512a");
  for (let x = kx; x < kx + kw; x += 8) rect(g, x, CFACE + 8, 3, 26, "#8f3518");
  rect(g, kx, CFACE + 34, 120, CFH - 42, "#2a2b30");
  ellipse(g, kx + 60, CFACE + 96, 44, 44, "#0e0f11");
  ellipse(g, kx + 54, CFACE + 90, 30, 30, "#17181a");
  rect(g, kx + 120, CFACE + 120, kw - 120, CFH - 128, "#8f9089");
  for (let r = 0; r < 3; r++)
    for (let k = 0; k < 8; k++) {
      const ax = kx + 134 + k * 34 + r * 6;
      const ay = CFACE + 84 + r * 26;
      rect(g, ax, ay, 22, 14, "#f6f4ee");
      rect(g, ax, ay, 22, 3, "#ffffff");
      rect(g, ax + 2, ay + 14, 18, 7, "#7f8a4a");
      rect(g, ax + 2, ay + 21, 2, 6, "#c9c6bf");
      rect(g, ax + 18, ay + 21, 2, 6, "#c9c6bf");
    }
  rect(g, kx, CFACE + 8, kw, CFH - 16, "rgba(176,208,222,0.2)");
  for (let x = kx; x < kx + kw; x += 96) rect(g, x, CFACE + 8, 5, CFH - 16, "#17181a");
  rect(g, kx + kw - 5, CFACE + 8, 5, CFH - 16, "#17181a");
  rect(g, kx, CFACE + 8, kw, 5, "#17181a");
  rect(g, kx, CFACE + CFH - 13, kw, 5, "#17181a");
  rect(g, kx + 130, CFACE + 46, kw - 140, 24, "rgba(236,244,246,0.5)");
  text(g, "MUSIC ROOM 音乐室", kx + 130 + (kw - 140) / 2, CFACE + 50, 15, "rgba(255,255,255,0.95)", { align: "center" });
  K.ao(g, CX, CFACE + CFH, CW, 18, 0.4);
  block(solid, COLS, 14, 11, 14, 4);
  // ------------------------------------------------ chill zone: poufs, beanbag, hammocks, the rope net
  const poufs: Array<[number, number, string, string, string]> = [
    [14, 18, "#e2b93b", "#a8861f", "#f6d76a"],
    [16, 19, "#4fa3a5", "#2f7375", "#7fc4c5"],
    [18, 18, "#9a9c9f", "#6d6f73", "#c2c4c7"],
    [15, 20, "#d9692a", "#9b4517", "#f08a4b"],
    [19, 20, "#e2b93b", "#a8861f", "#f6d76a"],
  ];
  for (const [tx, ty, c1, c2, c3] of poufs) {
    K.place(st, K.pouf(c1, c2, c3, 22), tx * T + 32, ty * T + 54);
    block(solid, COLS, tx, ty, 1, 1);
  }
  // rainbow beanbag
  const [bb, bg] = mk(84, 62);
  ellipse(bg, 42, 54, 36, 6, "rgba(20,24,40,0.28)");
  ellipse(bg, 42, 30, 38, 24, "#f4f2ec");
  ["#e63946", "#ff7a2f", "#ffd23f", "#2ec4b6", "#3aa0ff", "#7b4bd6"].forEach((c, i) => ellipse(bg, 20 + i * 9, 24 + (i % 2) * 10, 8, 7, c));
  ellipse(bg, 34, 16, 12, 5, "rgba(255,255,255,0.6)");
  K.place(st, bb, 17 * T + 32, 21 * T - 2);
  block(solid, COLS, 17, 20, 1, 1);
  const hm = hammock();
  K.place(st, hm, 15 * T + 20, 17 * T - 12, true);
  K.place(st, hm, 17 * T + 52, 17 * T - 12, true);
  block(solid, COLS, 14, 16, 1, 1);
  block(solid, COLS, 16, 16, 2, 1);
  block(solid, COLS, 19, 16, 1, 1);
  const net = ropeNet(5 * T - 8, 84);
  props.push({ sprite: net, x: CX - 4, y: CFACE - 40, sortY: 99999 });
  K.place(st, K.plant(120), 20 * T + 34, 16 * T - 4, true);
  block(solid, COLS, 20, 15, 1, 1);

  // ------------------------------------------------ seats outside the auditorium
  K.place(st, K.armchair("#5f6f7f", "#3f4b57", "#8494a3"), 22 * T + 32, 18 * T + 56, true);
  K.place(st, K.roundTable("#f4f2ec", 44), 23 * T + 32, 18 * T + 52);
  K.place(st, K.armchair("#c9a233", "#8f7220", "#e2bf55"), 24 * T + 32, 18 * T + 56, true);
  block(solid, COLS, 22, 18, 3, 1);
  K.place(st, K.plant(120), 27 * T + 30, 16 * T - 4, true);
  block(solid, COLS, 27, 15, 1, 1);

  // ------------------------------------------------ lift lobby and the music wing
  const LX = 2 * T;
  const LW = 9 * T;
  const LY = 11 * T;
  rect(g, LX, LY, LW, 40, "#2a2b30");
  for (let x = LX; x < LX + LW; x += 12) rect(g, x, LY, 6, 40, "#34363c");
  rect(g, LX, LY, LW, 4, "#55575e");
  K.wall(g, LX, LY + 40, LW, 152, "#e9e6de", "#f6f4ee", "#b9b6ae");
  liftDoors(g, 3 * T, LY + 40 + 152 - 116, 116, "2");
  // plywood directory
  rect(g, 6 * T - 6, LY + 52, 126, 96, "#cfa56c");
  for (let k = 0; k < 90; k++) rect(g, 6 * T - 4 + hash(k, 1, 62) * 114, LY + 54 + hash(k, 2, 62) * 90, 6, 2, hash(k, 3, 62) < 0.5 ? "#b98b52" : "#e0bd88");
  ["TOILET 洗手间", "PIANO ROOM 钢琴房", "MUSIC ROOM 2 音乐室2", "MULTIPURPOSE ROOM", "多功能室"].forEach((s, i) => text(g, s, 6 * T, LY + 60 + i * 17, 10, "#33291d"));
  // two light oak doors with brass plates; one carries a Closed note
  for (const [dx, note] of [[8 * T + 8, false], [9 * T + 40, true]] as const) {
    rect(g, dx - 4, LY + 62, 64, 130, "#8f8b80");
    rect(g, dx, LY + 66, 56, 126, "#d5b38c");
    rect(g, dx, LY + 66, 5, 126, "#e8cba9");
    rect(g, dx + 50, LY + 66, 6, 126, "#a8835d");
    rect(g, dx + 20, LY + 80, 16, 8, "#c9a233");
    rect(g, dx + 44, LY + 130, 4, 14, "#3a3d41");
    if (note) {
      rect(g, dx + 14, LY + 100, 28, 22, "#fbfaf6");
      text(g, "Closed", dx + 28, LY + 105, 8, "#3a3d41", { align: "center" });
    }
  }
  K.exitSign(g, LX + 10, LY + 50);
  K.ao(g, LX, LY + 192, LW, 18, 0.4);
  block(solid, COLS, 2, 11, 9, 3);
  // teal benches and plants along the lobby
  for (const bx of [6, 7, 8]) {
    rect(g, bx * T + 2, 17 * T + 50, T - 2, 8, "rgba(20,24,40,0.25)");
    rect(g, bx * T, 17 * T + 22, T, 30, "#3f8f8a");
    rect(g, bx * T, 17 * T + 22, T, 6, "#62b3ad");
    rect(g, bx * T, 17 * T + 46, T, 6, "#2a6a66");
    block(solid, COLS, bx, 17, 1, 1);
  }
  const pl = K.plant(124);
  K.place(st, pl, 1 * T + 34, 20 * T + 56, true);
  K.place(st, pl, 11 * T + 30, 20 * T + 56, true);
  block(solid, COLS, 1, 20, 1, 1);
  block(solid, COLS, 11, 20, 1, 1);
  K.place(st, pl, 1 * T + 34, 14 * T + 56, true);
  block(solid, COLS, 1, 14, 1, 1);

  // ------------------------------------------------ lounge
  // rugs under the two seating groups
  const rug = (x: number, y: number, w: number, h: number, a: string, b: string): void => {
    rect(g, x, y, w, h, a);
    dither(g, x + 8, y + 8, w - 16, h - 16, a, b, 0.5, 4);
    frame(g, x + 4, y + 4, w - 8, h - 8, b, 2);
    for (let i = x; i < x + w; i += 6) {
      rect(g, i, y - 3, 2, 3, b);
      rect(g, i, y + h, 2, 3, b);
    }
  };
  rug(30 * T - 20, 13 * T + 14, 6 * T + 40, 2 * T - 20, "#b9a98a", "#a39274");
  rug(30 * T - 20, 18 * T + 14, 7 * T + 40, 2 * T - 10, "#8fa9a6", "#7a9592");
  K.place(st, K.sofa("#2f7a52", "#1f5a3b", "#4f9c72", 156), 31 * T, 13 * T + 4, true);
  block(solid, COLS, 30, 12, 2, 1);
  K.place(st, K.armchair("#d9692a", "#9b4517", "#f08a4b"), 33 * T + 32, 13 * T + 4, true);
  K.place(st, K.armchair("#4fa3a5", "#2f7375", "#7fc4c5"), 35 * T + 32, 13 * T + 4, true);
  block(solid, COLS, 33, 12, 1, 1);
  block(solid, COLS, 35, 12, 1, 1);
  K.place(st, K.roundTable("#e8cba9", 48), 32 * T + 32, 14 * T + 50);
  block(solid, COLS, 32, 14, 1, 1);
  K.place(st, K.sofa("#a3312b", "#74201c", "#c9544c", 156), 31 * T, 18 * T + 4, true);
  block(solid, COLS, 30, 17, 2, 1);
  K.place(st, K.armchair("#7a5238", "#553724", "#9c7152"), 34 * T + 32, 18 * T + 4, true);
  K.place(st, K.armchair("#4fa3a5", "#2f7375", "#7fc4c5"), 36 * T + 32, 18 * T + 4, true);
  block(solid, COLS, 34, 17, 1, 1);
  block(solid, COLS, 36, 17, 1, 1);
  K.place(st, K.roundTable("#f4f2ec", 48), 35 * T + 32, 19 * T + 50);
  block(solid, COLS, 35, 19, 1, 1);
  for (const [tx, ty] of [[38, 11], [29, 20], [38, 20]] as const) {
    K.place(st, pl, tx * T + 32, ty * T + 58, true);
    block(solid, COLS, tx, ty, 1, 1);
  }
  // a floor lamp and a low shelf of board games
  const [lamp, lg] = mk(48, 150);
  ellipse(lg, 24, 144, 14, 4, "rgba(20,24,40,0.3)");
  rect(lg, 22, 44, 3, 98, "#2a2b30");
  rect(lg, 14, 140, 20, 4, "#17181a");
  for (let j = 0; j < 40; j++) rect(lg, 24 - 8 - j * 0.3, 6 + j, 16 + j * 0.6, 1, j < 3 ? "#fff6d8" : "#f1d9a0");
  rect(lg, 10, 44, 28, 3, "#d9b96a");
  K.place(st, lamp, 37 * T + 32, 13 * T, true);
  block(solid, COLS, 37, 12, 1, 1);
  K.lightPool(g, 37 * T + 32, 13 * T + 20, 120, 60, "255,236,190", 0.08);
  const [shelf, sg] = mk(3 * T - 8, 100);
  ellipse(sg, 92, 94, 86, 5, "rgba(20,24,40,0.3)");
  rect(sg, 0, 8, 3 * T - 8, 84, "#cba77f");
  rect(sg, 0, 8, 3 * T - 8, 4, "#e8cba9");
  for (let r = 0; r < 2; r++) {
    rect(sg, 6, 16 + r * 38, 3 * T - 20, 32, "#8f6d48");
    for (let k = 0; k < 8; k++) {
      const col = ["#e63946", "#2ec4b6", "#ffd23f", "#7b4bd6", "#f4f2ec", "#ff7a2f"][Math.floor(hash(k, r, 55) * 6)];
      rect(sg, 10 + k * 21, 20 + r * 38 + (k % 3) * 3, 17, 28 - (k % 3) * 3, col);
      rect(sg, 10 + k * 21, 20 + r * 38 + (k % 3) * 3, 17, 3, "rgba(255,255,255,0.45)");
    }
  }
  K.place(st, shelf, 37 * T + 16, 16 * T - 12, true);
  block(solid, COLS, 36, 15, 3, 1);
  K.lightPool(g, 33 * T, 15 * T, 260, 120, "255,236,190", 0.05);
  K.lightPool(g, 24 * T + 32, 19 * T + 32, 220, 120, "255,236,190", 0.05);

  // ------------------------------------------------ outer walls, seen from above
  wallTop(g, 0, 0, T, H);
  wallTop(g, W - T, 0, T, H);
  wallTop(g, 0, H - T, W, T);
  block(solid, COLS, 0, 0, COLS, 3);
  block(solid, COLS, 0, 0, 1, ROWS);
  block(solid, COLS, COLS - 1, 0, 1, ROWS);
  block(solid, COLS, 0, ROWS - 1, COLS, 1);

  // ------------------------------------------------ triggers
  const info = (id: string, tx: number, ty: number, w: number, h: number, en: string, zh: string, textEn: string): void => {
    triggers.push({ id, tx, ty, w, h, en, zh, action: { type: "info", title: en, titleZh: zh, text: textEn } });
  };
  triggers.push({ id: "down", tx: 1, ty: 6, w: 3, h: 1, en: "Stairs to 1/F", zh: "下一楼", action: { type: "goto", map: "b5-1", spawn: "stair" } });
  triggers.push({ id: "up3", tx: 4, ty: 6, w: 1, h: 1, en: "Stairs to 3/F", zh: "上三楼", action: { type: "goto", map: "b5-3", spawn: "stair-low" } });
  triggers.push({ id: "gym", tx: 28, ty: 5, w: 5, h: 1, en: "Gym: train", zh: "健身房：锻炼", action: { type: "powerup", kind: "gym" } });
  triggers.push({ id: "lift", tx: 3, ty: 14, w: 2, h: 1, en: "Lift", zh: "电梯", action: { type: "lift", building: "b5" } });
  info("auditorium", 22, 15, 5, 1, "Music Room", "音乐室", "The music room: a long narrow room behind glass, rows of white chairs with olive-green seats facing a dark wall with one huge black circle cut into it.");
  info("crest-panel", 19, 15, 2, 1, "Crest panel", "校徽木板", "A wall of pressed strand board with the HKU crest stamped into it, shield, lion and open book, and Sapientia et Virtus on the ribbon. The glass doors of the Music Room are straight beside it.");
  info("music", 6, 14, 5, 1, "Music wing", "音乐区", "The directory lists the piano room, music room 2 and the multipurpose room. One oak door carries a Closed note.");
  info("piano", 7, 6, 3, 1, "Grand piano and mural", "三角钢琴与壁画", "A glossy black concert grand stands at the top of the stair, in front of a pop-art mural of the Shanghai skyline. Look for the little HKU gate with 1911 painted into it.");
  info("wayfinding", 4, 3, 1, 1, "Wayfinding", "指示牌", "Stencilled on the wall: Men's Showers 男淋浴间, Music Room 1 音乐室1, Dance Room 舞蹈室, and Toilet 洗手间 to the right.");
  info("pool", 15, 6, 3, 1, "Multipurpose Room", "多功能室", "The multipurpose room: a green-baize pool table on a dark wood body, behind black-framed glass with a frosted HKU and Est. 1911 band.");
  info("tabletennis", 20, 5, 3, 1, "Game Hub", "电玩区", "Two blue table tennis tables on a pale sports floor with a white court circle, under a bright yellow wall. The plate reads GAME HUB 电玩区.");
  info("chill", 14, 17, 6, 1, "Chill zone", "休闲区", "A web of ropes and nets with plush shapes hangs above a second street mural, with hammocks, a rainbow beanbag and dozens of round poufs below.");
  info("lounge", 30, 13, 6, 1, "Lounge", "休息区", "Orange and teal armchairs, a green velvet sofa and red booth benches. The real lounge looks out over the canal and its green banks.");

  const npcs: NpcDef[] = [
    { id: "b5-visitor-3", char: "visitor3", tx: 10, ty: 6, dir: "left", name: "Pianist", nameZh: "钢琴手" },
    { id: "b5-visitor-4", char: "visitor4", tx: 34, ty: 5, dir: "up", name: "Gym regular", nameZh: "健身达人" },
    { id: "b5-visitor-1b", char: "visitor1", tx: 24, ty: 21, dir: "up", name: "Student", nameZh: "同学" },
  ];

  return {
    id: "b5-2",
    name: "Building 5 2/F",
    nameZh: "五号楼 2 层",
    cols: COLS,
    rows: ROWS,
    ground,
    solid,
    props,
    npcs,
    triggers,
    spawns: { stair: { tx: 2, ty: 7, dir: "down" }, "stair-up": { tx: 5, ty: 6, dir: "down" }, lift: { tx: 3, ty: 14, dir: "down" } },
    labels: [
      { x: 4 * T + 40, y: 7 * T + 30, en: "Stairs to 3/F", zh: "上三楼" },
      { x: 32 * T, y: 9 * T - 92, en: "Gym", zh: "健身房" },
      { x: 16 * T + 32, y: 9 * T - 92, en: "Multipurpose Room", zh: "多功能室" },
      { x: 23 * T, y: 9 * T - 92, en: "Game Hub", zh: "电玩区" },
      { x: 4 * T, y: 11 * T - 6, en: "Lift", zh: "电梯" },
      { x: 24 * T + 32, y: 11 * T - 6, en: "Music Room", zh: "音乐室" },
    ],
  };
}
