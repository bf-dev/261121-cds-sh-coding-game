// Building 5, 3/F to 5/F: the study and meeting floors (Insung, 2026-11-21).
// 3/F = foot of the tiered timber study stair, with the sofas under it.
// 4/F = top of the study stair, the co-creation level (rooms 411 to 420).
// 5/F = learning commons (rooms 501 to 531).
// Drawn from buildings/b5/ and the clips 103735 (study stair, 4/F) and 104125 (5/F).

import { TILE, type GameMap, type NpcDef, type Prop, type Trigger } from "../engine/types";
import { mk, rect, frame, hash, dither, ellipse, text, block, type Ctx } from "../art/px";
import { drawCrest } from "./grandhall-crest";
import * as K from "./b5-kit";

const T = TILE;
export const WH = 192;

export interface Floor {
  n: number;
  COLS: number;
  ROWS: number;
  W: number;
  H: number;
  ground: HTMLCanvasElement;
  g: Ctx;
  solid: Uint8Array;
  props: Prop[];
  triggers: Trigger[];
  st: K.Stage;
}

function shell(n: number, COLS = 34, ROWS = 20): Floor {
  const [ground, g] = mk(COLS * T, ROWS * T);
  const solid = new Uint8Array(COLS * ROWS);
  const props: Prop[] = [];
  const triggers: Trigger[] = [];
  return { n, COLS, ROWS, W: COLS * T, H: ROWS * T, ground, g, solid, props, triggers, st: { g, props, solid, cols: COLS } };
}

function info(f: Floor, id: string, tx: number, ty: number, w: number, h: number, en: string, zh: string, textEn: string): void {
  f.triggers.push({ id, tx, ty, w, h, en, zh, action: { type: "info", title: en, titleZh: zh, text: textEn } });
}

function wallTop(g: Ctx, x: number, y: number, w: number, h: number): void {
  rect(g, x, y, w, h, "#d9d1c4");
  rect(g, x, y, w, 3, "#f5efe6");
  rect(g, x, y + h - 4, w, 4, "#8f8577");
  rect(g, x, y, 3, h, "#ece6dc");
  rect(g, x + w - 3, y, 3, h, "#a79c8c");
}

/** brushed steel lift doors with a floor indicator and call panel. (x, y) is the top-left of the 128 px frame. */
export function liftDoors(g: Ctx, x: number, y: number, h: number, floor: string): void {
  rect(g, x - 6, y - 6, 140, h + 6, "#6f7478");
  rect(g, x, y, 128, h, "#8d9296");
  rect(g, x + 6, y + 6, 116, h - 6, "#b8bcc0");
  for (let i = x + 6; i < x + 122; i += 4) rect(g, i, y + 6, 1, h - 6, hash(i, 2, 4) < 0.5 ? "#c9cdd1" : "#a9adb1");
  rect(g, x + 63, y + 6, 2, h - 6, "#5d6266");
  rect(g, x + 6, y + 6, 116, 2, "#e3e6e9");
  rect(g, x + 42, y - 32, 44, 22, "#17181a");
  text(g, floor, x + 64, y - 31, 17, "#ffb13b", { align: "center" });
  rect(g, x + 138, y + 56, 12, 26, "#2a2d30");
  rect(g, x + 142, y + 60, 4, 4, "#ffd23f");
  rect(g, x + 142, y + 70, 4, 4, "#8d9296");
}

/** lift bay on the north wall, cols 1 to 6: lift, stencilled floor number, the lift trigger at (2,3) */
function liftBay(f: Floor, zhFloor: string): void {
  const { g } = f;
  K.wall(g, T, 0, 6 * T, WH, "#e9e6de", "#f6f4ee", "#b9b6ae");
  liftDoors(g, 2 * T, WH - 146, 146, String(f.n));
  text(g, String(f.n), 5 * T + 42, 36, 84, "#d9d6cf", { align: "center" });
  text(g, String(f.n), 5 * T + 40, 34, 84, "#3a3d41", { align: "center" });
  text(g, zhFloor, 5 * T + 40, 128, 18, "#3a3d41", { align: "center" });
  K.exitSign(g, T + 12, 150);
  f.triggers.push({ id: "lift", tx: 2, ty: 3, w: 2, h: 1, en: "Lift", zh: "电梯", action: { type: "lift", building: "b5" } });
}

function finish(f: Floor): void {
  const { g, solid, COLS, ROWS, W, H } = f;
  K.ao(g, T, WH, W - 2 * T, 18, 0.4);
  wallTop(g, 0, 0, T, H);
  wallTop(g, W - T, 0, T, H);
  wallTop(g, 0, H - T, W, T);
  block(solid, COLS, 0, 0, COLS, 3);
  block(solid, COLS, 0, 0, 1, ROWS);
  block(solid, COLS, COLS - 1, 0, 1, ROWS);
  block(solid, COLS, 0, ROWS - 1, COLS, 1);
}

function put(f: Floor, sprite: HTMLCanvasElement, tx: number, ty: number, w = 1, h = 1, dx = 0, dy = 0): void {
  K.place(f.st, sprite, tx * T + (w * T) / 2 + dx, (ty + h) * T - 6 + dy, true);
  block(f.solid, f.COLS, tx, ty, w, h);
}

function rug(g: Ctx, x: number, y: number, w: number, h: number, a: string, b: string): void {
  rect(g, x, y, w, h, a);
  dither(g, x + 8, y + 8, w - 16, h - 16, a, b, 0.5, 4);
  frame(g, x + 4, y + 4, w - 8, h - 8, b, 2);
  for (let i = x; i < x + w; i += 6) {
    rect(g, i, y - 3, 2, 3, b);
    rect(g, i, y + h, 2, 3, b);
  }
}

// ------------------------------------------------------------------ sprites

function tableLamp(): HTMLCanvasElement {
  const [c, g] = mk(26, 40);
  rect(g, 11, 20, 4, 16, "#b98a5a");
  rect(g, 7, 36, 12, 3, "#8f6a43");
  for (let j = 0; j < 20; j++) rect(g, 13 - 5 - j * 0.35, j, 10 + j * 0.7, 1, j < 2 ? "#fffbe8" : "#f6ecd2");
  return c;
}

function coffeeTable(): HTMLCanvasElement {
  const [c, g] = mk(92, 50);
  ellipse(g, 46, 44, 40, 5, "rgba(20,24,40,0.25)");
  rect(g, 4, 10, 84, 22, "#f6f4ee");
  rect(g, 4, 10, 84, 4, "#ffffff");
  rect(g, 4, 30, 84, 4, "#c9c6bf");
  rect(g, 10, 34, 4, 10, "#d9d6cf");
  rect(g, 78, 34, 4, 10, "#d9d6cf");
  g.drawImage(tableLamp(), 58, -14);
  rect(g, 18, 14, 22, 12, "#3a3d41");
  return c;
}

function concreteColumn(label: string): HTMLCanvasElement {
  const [c, g] = mk(64, 190);
  ellipse(g, 32, 182, 28, 6, "rgba(20,24,40,0.3)");
  rect(g, 8, 0, 48, 182, "#9c9c98");
  rect(g, 8, 0, 6, 182, "#b4b4b0");
  rect(g, 46, 0, 10, 182, "#7d7d79");
  for (let k = 0; k < 40; k++) rect(g, 10 + hash(k, 1, 5) * 44, hash(k, 2, 5) * 178, 2, 2, hash(k, 3, 5) < 0.5 ? "#8b8b87" : "#aaaaa6");
  text(g, label, 30, 56, 15, "#f4f2ec", { align: "center" });
  rect(g, 8, 174, 48, 8, "#26221f");
  return c;
}

/** plywood wayfinding pillar with stencilled text, as on 4/F and 5/F */
function plyPillar(lines: string[]): HTMLCanvasElement {
  const w = 150;
  const [c, g] = mk(w, 210);
  ellipse(g, w / 2, 203, w / 2 - 6, 6, "rgba(20,24,40,0.3)");
  rect(g, 4, 0, w - 8, 202, "#cfa56c");
  for (let k = 0; k < 260; k++) rect(g, 6 + hash(k, 1, 61) * (w - 18), hash(k, 2, 61) * 198, 5 + hash(k, 3, 61) * 6, 2, hash(k, 4, 61) < 0.5 ? "#b98b52" : "#e0bd88");
  rect(g, 4, 0, 4, 202, "#e6c794");
  rect(g, w - 10, 0, 6, 202, "#a37a45");
  lines.forEach((s, i) => text(g, s, 14, 16 + i * 17, /[一-鿿]/.test(s) ? 11 : 10, "#33291d"));
  return c;
}

/** dark-red gloss room door with the white HKU / Est. 1911 lettering (4/F) */
function redDoor(g: Ctx, x: number, y: number, h: number): void {
  rect(g, x - 5, y - 5, 66, h + 5, "#17181a");
  rect(g, x, y, 56, h, "#8e1f26");
  rect(g, x, y, 5, h, "#b8323a");
  rect(g, x + 50, y, 6, h, "#6b151b");
  dither(g, x + 8, y + 6, 18, h - 20, "#8e1f26", "#a82a32", 0.35, 2);
  text(g, "HKU", x + 28, y + Math.round(h * 0.36), 13, "#f6f4ee", { align: "center" });
  text(g, "Est. 1911", x + 28, y + Math.round(h * 0.36) + 16, 9, "#f1d4d4", { align: "center" });
  rect(g, x + 45, y + Math.round(h * 0.6), 4, 14, "#d9d6cf");
}

/** self-study room front: tan door in a teal frame beside an etched glass pane (5/F). 112 px wide. */
function studyDoor(g: Ctx, x: number, y: number, h: number, zh: boolean): void {
  rect(g, x, y, 112, h, "#526563");
  rect(g, x, y, 112, 3, "#6d8482");
  rect(g, x + 5, y + 5, 46, h - 5, "#cbaa87");
  rect(g, x + 5, y + 5, 4, h - 5, "#dcc09f");
  rect(g, x + 45, y + 5, 6, h - 5, "#a98a68");
  rect(g, x + 41, y + Math.round(h * 0.55), 4, 12, "#3a3d41");
  rect(g, x + 57, y + 5, 50, h - 5, "#7f9a8c");
  rect(g, x + 57, y + Math.round(h * 0.5), 50, h - Math.round(h * 0.5), "#566a72");
  rect(g, x + 61, y + h - 34, 40, 6, "#c49566");
  rect(g, x + 88, y + h - 50, 8, 16, "#f6ecd2");
  rect(g, x + 57, y + 5, 50, h - 5, "rgba(190,220,232,0.28)");
  for (let j = 0; j < h - 8; j += 2) rect(g, x + 60 + Math.floor(j / 3), y + 6 + j, 8, 1, "rgba(255,255,255,0.12)");
  if (zh) text(g, "明德格物", x + 82, y + 24, 10, "rgba(255,255,255,0.95)", { align: "center" });
  else {
    text(g, "Sapientia", x + 82, y + 18, 9, "rgba(255,255,255,0.95)", { align: "center" });
    text(g, "et Virtus", x + 82, y + 30, 9, "rgba(255,255,255,0.95)", { align: "center" });
  }
}

/** beige felt carrel pod: curved high partition, desk with a lit shelf, white shell chair (5/F) */
function carrel(): HTMLCanvasElement {
  const [c, g] = mk(116, 126);
  ellipse(g, 58, 118, 54, 7, "rgba(20,24,40,0.25)");
  rect(g, 10, 4, 96, 6, "#b3ab9b");
  rect(g, 6, 8, 104, 72, "#a49c8c");
  rect(g, 6, 8, 18, 108, "#958d7d");
  rect(g, 92, 8, 18, 108, "#8b8373");
  rect(g, 6, 8, 3, 108, "#f4f2ec");
  rect(g, 107, 8, 3, 108, "#f4f2ec");
  rect(g, 21, 8, 3, 108, "#f4f2ec");
  rect(g, 92, 8, 3, 108, "#f4f2ec");
  rect(g, 24, 14, 68, 62, "#b8b09f");
  rect(g, 24, 30, 68, 5, "#c49566");
  rect(g, 24, 35, 68, 3, "#fff3c4");
  rect(g, 24, 38, 68, 6, "rgba(255,243,196,0.35)");
  rect(g, 24, 62, 68, 12, "#d5b38c");
  rect(g, 24, 62, 68, 3, "#e8cba9");
  rect(g, 24, 74, 68, 4, "#a8835d");
  rect(g, 44, 80, 28, 22, "#f6f4ee");
  rect(g, 44, 80, 28, 4, "#ffffff");
  rect(g, 44, 98, 28, 4, "#d9d6cf");
  rect(g, 47, 102, 3, 14, "#c9c6bf");
  rect(g, 66, 102, 3, 14, "#c9c6bf");
  return c;
}

/** white open shelf with books (5/F bookshelf corridor) */
function bookshelf(): HTMLCanvasElement {
  const [c, g] = mk(124, 150);
  ellipse(g, 62, 144, 58, 6, "rgba(20,24,40,0.25)");
  rect(g, 2, 2, 120, 140, "#f6f4ee");
  rect(g, 8, 8, 108, 128, "#d7d4cc");
  const cols = ["#b0433a", "#2f6f7a", "#c9a233", "#4d5a66", "#f4f2ec", "#5f8f5a", "#c8793a"];
  for (let r = 0; r < 4; r++) {
    const y = 8 + r * 32;
    rect(g, 8, y + 28, 108, 4, "#f6f4ee");
    let x = 12;
    for (let k = 0; x < 104; k++) {
      const w = 5 + Math.floor(hash(k, r, 66) * 6);
      if (hash(k, r, 67) < 0.78) {
        const hh = 16 + Math.floor(hash(k, r, 68) * 10);
        rect(g, x, y + 28 - hh, w, hh, cols[Math.floor(hash(k, r, 69) * cols.length)]);
        rect(g, x, y + 28 - hh, 1, hh, "rgba(255,255,255,0.35)");
      }
      x += w + 1;
    }
  }
  rect(g, 60, 2, 4, 140, "#f6f4ee");
  return c;
}

/** curtained reading niche: dark green floor-length curtain, low grey armchair, small table (5/F) */
function curtainNiche(): HTMLCanvasElement {
  const [c, g] = mk(128, 160);
  ellipse(g, 64, 153, 58, 6, "rgba(20,24,40,0.25)");
  rect(g, 0, 0, 128, 150, "#e9e6de");
  rect(g, 0, 0, 128, 5, "#526563");
  rect(g, 0, 0, 5, 150, "#526563");
  rect(g, 123, 0, 5, 150, "#3f4f4d");
  for (let x = 5; x < 46; x += 6) {
    rect(g, x, 5, 6, 145, "#3d4a2e");
    rect(g, x, 5, 2, 145, "#536340");
    rect(g, x + 5, 5, 1, 145, "#2a341f");
  }
  rect(g, 60, 92, 50, 44, "#a8a6a0");
  rect(g, 60, 92, 50, 8, "#c2c0ba");
  rect(g, 56, 100, 8, 36, "#8e8c86");
  rect(g, 106, 100, 8, 36, "#8e8c86");
  rect(g, 64, 112, 42, 12, "#bcbab4");
  rect(g, 80, 126, 28, 5, "#f6f4ee");
  rect(g, 92, 131, 4, 16, "#c9c6bf");
  return c;
}

/** beige fabric high-back curved booth with a low dark seat and side table (4/F booths corridor) */
function booth(): HTMLCanvasElement {
  const [c, g] = mk(124, 128);
  ellipse(g, 62, 120, 58, 7, "rgba(20,24,40,0.25)");
  rect(g, 12, 2, 100, 8, "#d9c7ad");
  rect(g, 4, 8, 116, 84, "#cdb99c");
  rect(g, 4, 8, 20, 110, "#bfa98b");
  rect(g, 100, 8, 20, 110, "#b39d80");
  rect(g, 4, 8, 4, 110, "#e3d3bb");
  rect(g, 24, 16, 76, 66, "#dccbb2");
  for (let x = 30; x < 100; x += 14) rect(g, x, 16, 1, 66, "#c4b094");
  rect(g, 26, 78, 72, 24, "#4a4038");
  rect(g, 26, 78, 72, 5, "#665a50");
  rect(g, 26, 100, 72, 12, "#352d27");
  rect(g, 80, 68, 20, 5, "#e8cba9");
  rect(g, 88, 73, 4, 12, "#a8835d");
  return c;
}

/** self-service counter with stools (4/F lounge) */
function counter(): HTMLCanvasElement {
  const [c, g] = mk(190, 112);
  ellipse(g, 95, 104, 88, 7, "rgba(20,24,40,0.25)");
  rect(g, 4, 20, 182, 14, "#f1eee6");
  rect(g, 4, 20, 182, 3, "#ffffff");
  rect(g, 8, 34, 174, 50, "#b99d6f");
  for (let x = 8; x < 182; x += 12) rect(g, x, 34, 1, 50, "#9c855b");
  rect(g, 8, 80, 174, 4, "#8f7850");
  rect(g, 20, 6, 16, 14, "#3a3d41");
  rect(g, 44, 10, 10, 10, "#f6f4ee");
  rect(g, 140, 4, 24, 16, "#8d9296");
  for (const sx of [38, 92, 146]) {
    rect(g, sx - 12, 74, 24, 7, "#2a2b30");
    rect(g, sx - 12, 74, 24, 2, "#55575e");
    rect(g, sx - 2, 81, 4, 20, "#8a8d93");
    rect(g, sx - 9, 100, 18, 3, "#55575e");
  }
  return c;
}

/** the high long timber table with black stools by the windows (video 103514, 1:08 to 1:14) */
function highTable(): HTMLCanvasElement {
  const [c, g] = mk(190, 112);
  ellipse(g, 95, 104, 88, 7, "rgba(20,24,40,0.25)");
  rect(g, 4, 22, 182, 12, "#d1b88b");
  rect(g, 4, 22, 182, 3, "#e6d3ac");
  rect(g, 4, 32, 182, 3, "#9c855b");
  for (const lx of [10, 172]) rect(g, lx, 35, 8, 64, "#aa9165");
  rect(g, 18, 60, 154, 4, "#8f7850");
  rect(g, 30, 14, 18, 8, "#3a3d41");
  rect(g, 120, 12, 14, 10, "#f6f4ee");
  for (const sx of [34, 74, 116, 156]) {
    rect(g, sx - 11, 72, 22, 7, "#2a2b30");
    rect(g, sx - 11, 72, 22, 2, "#55575e");
    rect(g, sx - 2, 79, 4, 22, "#8a8d93");
    rect(g, sx - 9, 100, 18, 3, "#55575e");
  }
  return c;
}

/** a screen of upright timber fins, as around the round-table bay (video 103514, 0:35 to 0:42) */
function finScreen(): HTMLCanvasElement {
  const [c, g] = mk(64, 176);
  ellipse(g, 32, 170, 28, 5, "rgba(20,24,40,0.28)");
  rect(g, 4, 0, 56, 5, "#8f7850");
  for (let i = 0; i < 6; i++) {
    const x = 5 + i * 9;
    rect(g, x, 5, 6, 162, "#c5aa7c");
    rect(g, x, 5, 2, 162, "#dcc69b");
    rect(g, x + 5, 5, 1, 162, "#9c855b");
  }
  rect(g, 4, 164, 56, 6, "#8f7850");
  return c;
}

/** a small grey sofa with scatter cushions, drawn straight onto a stair tier */
function tierSofa(g: Ctx, x: number, y: number, w: number, cushions: string[]): void {
  rect(g, x + 3, y + 40, w, 5, "rgba(40,28,14,0.3)");
  rect(g, x, y + 8, w, 32, "#c9cbc9");
  rect(g, x, y + 8, w, 12, "#dfe1df");
  rect(g, x, y + 4, w, 6, "#eceeec");
  rect(g, x, y + 8, 8, 32, "#b3b5b3");
  rect(g, x + w - 8, y + 8, 8, 32, "#a9aba9");
  rect(g, x + 8, y + 34, w - 16, 6, "#a9aba9");
  cushions.forEach((c, i) => {
    const cx = x + 14 + i * 24;
    rect(g, cx, y + 12, 20, 18, c);
    rect(g, cx, y + 12, 20, 3, "rgba(255,255,255,0.4)");
    rect(g, cx + 6, y + 15, 2, 13, "rgba(255,255,255,0.3)");
    rect(g, cx + 12, y + 15, 2, 13, "rgba(255,255,255,0.3)");
  });
}

function tierCushion(g: Ctx, x: number, y: number, col: string, light: string, dark: string, w = 44): void {
  rect(g, x + 2, y + 16, w, 4, "rgba(40,28,14,0.3)");
  rect(g, x, y, w, 16, col);
  rect(g, x, y, w, 4, light);
  rect(g, x, y + 13, w, 3, dark);
  rect(g, x + w / 2 - 1, y + 4, 2, 9, dark);
}

const OAK = ["#8f7850", "#9c855b", "#aa9165", "#b99d6f", "#c5aa7c", "#d1b88b", "#dcc69b", "#e6d3ac"];
const CUSH: Array<[string, string, string]> = [
  ["#d9a3a0", "#edc3c0", "#b07f7c"],
  ["#6d99a1", "#93b9c0", "#4d757c"],
  ["#c9b23f", "#e2cf6c", "#9a8726"],
  ["#c8793a", "#e39a5e", "#9b5c37"],
];

/** the brick-red louvred screen wall carrying the HKU shield */
function crestScreen(g: Ctx, x: number, y: number, w: number, h: number): void {
  rect(g, x, y, w, 24, "#3a2622");
  rect(g, x, y, w, 3, "#6b4a42");
  rect(g, x, y + 24, w, h - 24, "#593e38");
  for (let i = x; i < x + w; i += 8) {
    rect(g, i, y + 24, 4, h - 24, "#956250");
    rect(g, i, y + 24, 1, h - 24, "#b07a66");
  }
  for (let j = y + 44; j < y + h; j += 20) rect(g, x, j, w, 2, "#3a2622");
  const ch = Math.min(96, h - 34);
  rect(g, x + w / 2 - 44, y + 28, 88, ch + 6, "#4a302b");
  drawCrest(g, Math.round(x + w / 2 - ch * 0.36), y + 32, Math.round(ch * 0.72));
}

/**
 * The tiered timber study stair seen from its foot (3/F). The crest screen is on rows r0..r0+1,
 * seven oak tiers follow, highest at the back. The walking steps are the middle three columns.
 */
function studyStair(f: Floor, c0: number, r0: number): void {
  const { g, solid, COLS } = f;
  const SX = c0 * T;
  const SW = 9 * T;
  crestScreen(g, SX, r0 * T, SW, 2 * T);
  text(g, "Sapientia et Virtus", SX + 100, r0 * T + 62, 13, "#f1dccf", { align: "center" });
  text(g, "明德格物", SX + SW - 100, r0 * T + 60, 16, "#f1dccf", { align: "center" });
  const MX = (c0 + 3) * T;
  for (let i = 0; i < 7; i++) {
    const y = (r0 + 2 + i) * T;
    const lit = 6 - Math.round(i * 0.6);
    rect(g, SX, y, SW, 46, OAK[lit]);
    for (let x = SX; x < SX + SW; x += 96) rect(g, x + ((i * 37) % 60), y, 1, 46, OAK[lit - 1]);
    for (let k = 0; k < 8; k++) rect(g, SX + hash(k, i, 81) * (SW - 40), y + 6 + hash(k, i, 82) * 34, 26, 1, OAK[lit - 1]);
    rect(g, SX, y, SW, 3, OAK[Math.min(7, lit + 1)]);
    rect(g, SX, y + 46, SW, 18, OAK[Math.max(0, lit - 3)]);
    rect(g, SX, y + 46, SW, 2, OAK[Math.max(0, lit - 4)]);
    rect(g, SX, y + 60, SW, 4, "rgba(40,28,14,0.35)");
    // the walking steps in the middle: two risers per tier
    rect(g, MX, y + 22, 3 * T, 4, OAK[Math.max(0, lit - 2)]);
    rect(g, MX, y + 26, 3 * T, 20, OAK[Math.max(0, lit - 1)]);
    rect(g, MX, y + 26, 3 * T, 2, OAK[Math.min(7, lit + 1)]);
    // sofas, cushions, bolsters and small white lap desks on the seating sides
    for (const side of [0, 1]) {
      const bx = side ? MX + 3 * T + 8 : SX + 8;
      if ((i + side) % 3 === 1) {
        tierSofa(g, bx + 6, y + 2, 120, side ? ["#3f8f5a", "#f1efe8", "#b9bcc2"] : ["#c8323a", "#6d99a1", "#f1efe8"]);
        g.drawImage(tableLamp(), bx + 138, y + 4);
        continue;
      }
      for (let k = 0; k < 3; k++) {
        const r = hash(i, k, 83 + side);
        if (r < 0.28) continue;
        const c = CUSH[Math.floor(hash(i, k, 85 + side) * CUSH.length)];
        const cx = bx + k * 58 + Math.floor(hash(i, k, 86) * 8);
        if (r < 0.8) tierCushion(g, cx, y + 14, c[0], c[1], c[2]);
        else {
          rect(g, cx + 2, y + 34, 40, 4, "rgba(40,28,14,0.3)");
          rect(g, cx, y + 16, 40, 18, "#f6f4ee");
          rect(g, cx, y + 16, 40, 3, "#ffffff");
          rect(g, cx + 4, y + 34, 3, 6, "#c9c6bf");
          rect(g, cx + 33, y + 34, 3, 6, "#c9c6bf");
          rect(g, cx + 8, y + 21, 14, 9, "#3a3d41");
        }
      }
    }
  }
  // white steel and glass handrails each side of the steps
  for (const hx of [MX - 4, MX + 3 * T]) {
    rect(g, hx, (r0 + 2) * T - 6, 8, 7 * T, "rgba(190,220,232,0.35)");
    rect(g, hx + 3, (r0 + 2) * T - 10, 3, 7 * T + 4, "#f6f4ee");
    for (let y = (r0 + 2) * T; y < (r0 + 9) * T; y += 64) rect(g, hx + 1, y - 12, 7, 14, "#e2dfd8");
  }
  block(solid, COLS, c0, r0, 9, 2);
  block(solid, COLS, c0, r0 + 2, 3, 7);
  block(solid, COLS, c0 + 6, r0 + 2, 3, 7);
}

/** pale wood study table with a clear acrylic divider down the middle and white shell chairs (5/F open study) */
function studyTable(f: Floor, tx: number, ty: number, len: number): void {
  const { g } = f;
  const x = tx * T + 6;
  const y = ty * T + 14;
  const w = len * T - 12;
  const up = K.chair("#f6f4ee", "#d9d6cf", "up");
  const down = K.chair("#f6f4ee", "#d9d6cf", "down");
  for (let k = 0; k < len; k++) g.drawImage(up, tx * T + k * T + 12, y - 40);
  rect(g, x + 4, y + 40, w, 8, "rgba(20,24,40,0.25)");
  rect(g, x, y, w, 36, "#d5b38c");
  rect(g, x, y, w, 4, "#e8cba9");
  rect(g, x, y + 36, w, 6, "#a8835d");
  rect(g, x + 8, y + 42, 4, 10, "#f6f4ee");
  rect(g, x + w - 12, y + 42, 4, 10, "#f6f4ee");
  rect(g, x + 10, y + 10, w - 20, 10, "rgba(214,235,239,0.55)");
  rect(g, x + 10, y + 10, w - 20, 2, "rgba(255,255,255,0.9)");
  for (let k = 0; k <= len; k++) rect(g, Math.min(x + w - 12, x + 10 + k * ((w - 22) / len)), y + 8, 2, 14, "#f6f4ee");
  for (let k = 0; k < len; k++) f.props.push({ sprite: down, x: tx * T + k * T + 12, y: y + 26, sortY: (ty + 1) * T + 20 });
  block(f.solid, f.COLS, tx, ty, len, 1);
}

function planterBox(f: Floor, tx: number, ty: number, n: number): void {
  const [c, pg] = mk(n * T - 8, 96);
  rect(pg, 4, 88, n * T - 16, 8, "rgba(20,24,40,0.25)");
  rect(pg, 0, 48, n * T - 8, 42, "#f2f0ea");
  rect(pg, 0, 48, n * T - 8, 4, "#ffffff");
  rect(pg, n * T - 16, 52, 8, 38, "#c9c6bf");
  rect(pg, 0, 86, n * T - 8, 4, "#a9a6a0");
  for (let k = 0; k < n * 10; k++) {
    const bx = 8 + hash(k, tx, 31) * (n * T - 30);
    const by = 12 + hash(k, tx, 32) * 34;
    ellipse(pg, bx, by, 8 + hash(k, tx, 33) * 6, 8, K.R.leaf[1 + Math.floor(hash(k, tx, 34) * 5)]);
  }
  f.props.push({ sprite: c, x: tx * T + 4, y: (ty + 1) * T - 6 - 96, sortY: (ty + 1) * T - 8 });
  block(f.solid, f.COLS, tx, ty, n, 1);
}

/** a free-standing room block: dark roof seen from above, then a wall face painted by the caller. Blocks 4 rows. */
function core(f: Floor, c0: number, r0: number, w: number, paint: (x: number, y: number, pw: number, ph: number) => void): void {
  const { g } = f;
  const x = c0 * T;
  const y = r0 * T;
  rect(g, x, y, w * T, 80, "#2a2b30");
  for (let i = x; i < x + w * T; i += 12) rect(g, i, y, 6, 80, "#34363c");
  rect(g, x, y, w * T, 4, "#55575e");
  rect(g, x, y + 74, w * T, 6, "#17181a");
  paint(x, y + 80, w * T, 176);
  K.ao(g, x, y + 256, w * T, 18, 0.4);
  block(f.solid, f.COLS, c0, r0, w, 4);
}

/** glass-fronted meeting room face: table, chairs, TV and whiteboard seen through the glass */
function meetingFace(g: Ctx, x: number, y: number, w: number, h: number, en: string, zh: string): void {
  rect(g, x, y, w, h, "#8aa093");
  rect(g, x, y + Math.round(h * 0.55), w, h - Math.round(h * 0.55), "#5f6f76");
  rect(g, x + 20, y + 22, 96, 54, "#f6f6f2");
  frame(g, x + 20, y + 22, 96, 54, "#c9c6bf", 2);
  rect(g, x + w - 150, y + 26, 84, 48, "#17181a");
  rect(g, x + w - 146, y + 30, 76, 40, "#2c3a4a");
  const tw = Math.min(w - 200, 300);
  const txx = x + (w - tw) / 2;
  ellipse(g, x + w / 2, y + h - 40, tw / 2, 22, "#a8835d");
  ellipse(g, x + w / 2, y + h - 46, tw / 2, 22, "#d5b38c");
  for (let k = 0; k < 5; k++) {
    rect(g, txx + 10 + k * ((tw - 40) / 4), y + h - 84, 20, 22, k % 2 ? "#f6f4ee" : "#b9bcc2");
    rect(g, txx + 10 + k * ((tw - 40) / 4), y + h - 84, 20, 4, "#ffffff");
  }
  rect(g, x, y, w, h, "rgba(190,220,232,0.22)");
  for (let i = x; i < x + w; i += 128) rect(g, i, y, 5, h, "#17181a");
  rect(g, x + w - 5, y, 5, h, "#17181a");
  rect(g, x, y, w, 6, "#17181a");
  rect(g, x, y + h - 6, w, 6, "#17181a");
  rect(g, x, y + Math.round(h * 0.42), w, 24, "rgba(236,244,246,0.5)");
  text(g, `${en}  ${zh}`, x + w / 2, y + Math.round(h * 0.42) + 4, 15, "rgba(255,255,255,0.95)", { align: "center" });
}

// =====================================================================================
// 3/F: the foot of the study stair
// =====================================================================================

export function buildB5Study(): GameMap {
  const f = shell(3);
  const { g, solid, COLS, W, props } = f;
  const pl = K.plant(124);

  // floors: pale wood round the stair, grey carpet in the study wings
  K.planks(g, T, WH, W - 2 * T, 17 * T - WH + T, K.R.paleWood, 31);
  K.carpet(g, T, WH, 8 * T, 9 * T);
  K.carpet(g, 23 * T, WH, 10 * T, 9 * T);

  // north wall
  liftBay(f, "三层");
  K.wall(g, 7 * T, 0, 3 * T, WH, "#e9e6de", "#f6f4ee", "#b9b6ae");
  rect(g, 7 * T + 16, 22, 3 * T - 32, 150, "#3a3d41");
  ["↑ STUDY STAIR", "阶梯自习区", "↑ 4/F CO-CREATION", "共创空间", "MEETING ROOMS", "会议室", "STUDY ROOMS", "自习室"].forEach((s, i) => text(g, s, 7 * T + 26, 32 + i * 17, i % 2 ? 12 : 11, i % 2 ? "#cfd3d6" : "#f4f2ec"));
  // dark wood slat ceiling edge over the stair void
  rect(g, 10 * T, 0, 13 * T, T, "#2b1d17");
  for (let x = 10 * T; x < 23 * T; x += 10) rect(g, x, 0, 5, T, "#a9895d");
  for (let x = 10 * T + 40; x < 23 * T; x += 200) rect(g, x, 26, 120, 5, "#fff6d8");
  rect(g, 10 * T, T, 2 * T, 2 * T, "#7f8a94");
  rect(g, 21 * T, T, 2 * T, 2 * T, "#7f8a94");
  for (const vx of [10 * T, 21 * T]) {
    dither(g, vx, T, 2 * T, 2 * T, "#7f8a94", "#a9c4d2", 0.4, 4);
    rect(g, vx, 3 * T - 10, 2 * T, 10, "rgba(190,220,232,0.6)");
    rect(g, vx, 3 * T - 12, 2 * T, 3, "#f6f4ee");
  }
  studyStair(f, 12, 1);
  // meeting rooms behind glass on the right
  meetingFace(g, 23 * T, 16, 10 * T, WH - 16, "MEETING ROOM", "会议室");
  rect(g, 23 * T, 0, 10 * T, 16, "#17181a");

  // the voids beside the stair: concrete columns, glass balustrades, planters at the foot
  put(f, concreteColumn("3F"), 11, 3);
  put(f, concreteColumn("3F"), 21, 3);
  for (const vx of [11, 21]) {
    rect(g, vx * T + 28, 4 * T, 8, 6 * T, "rgba(190,220,232,0.4)");
    rect(g, vx * T + 31, 4 * T - 4, 3, 6 * T + 4, "#f6f4ee");
    block(solid, COLS, vx, 4, 1, 6);
  }
  planterBox(f, 10, 10, 2);
  planterBox(f, 21, 10, 2);

  // under and around the stair foot: sofas, armchairs, low tables, lamps (Insung, 2026-11-21)
  rug(g, 5 * T - 10, 12 * T + 10, 8 * T + 20, 3 * T - 10, "#b9a98a", "#a39274");
  rug(g, 20 * T - 10, 12 * T + 10, 8 * T + 20, 3 * T - 10, "#8fa9a6", "#7a9592");
  put(f, K.sofa("#c9cbc9", "#a9aba9", "#e4e6e4", 156), 6, 12, 2, 1, 0, 0);
  put(f, K.sofa("#2f7a52", "#1f5a3b", "#4f9c72", 156), 9, 12, 2, 1, 16, 0);
  put(f, coffeeTable(), 8, 14, 1, 1, 0, -8);
  put(f, K.armchair("#c9a233", "#8f7220", "#e2bf55"), 5, 14);
  put(f, K.armchair("#d9692a", "#9b4517", "#f08a4b"), 11, 14);
  put(f, K.sofa("#c9cbc9", "#a9aba9", "#e4e6e4", 156), 21, 12, 2, 1, 0, 0);
  put(f, K.sofa("#a3312b", "#74201c", "#c9544c", 156), 24, 12, 2, 1, 16, 0);
  put(f, coffeeTable(), 23, 14, 1, 1, 0, -8);
  put(f, K.armchair("#4fa3a5", "#2f7375", "#7fc4c5"), 20, 14);
  put(f, K.armchair("#5f6f7f", "#3f4b57", "#8494a3"), 26, 14);
  for (const [tx, ty, c1, c2, c3] of [[14, 13, "#e2b93b", "#a8861f", "#f6d76a"], [18, 13, "#4fa3a5", "#2f7375", "#7fc4c5"], [13, 16, "#d9692a", "#9b4517", "#f08a4b"]] as const) {
    K.place(f.st, K.pouf(c1, c2, c3, 22), tx * T + 32, ty * T + 54);
    block(solid, COLS, tx, ty, 1, 1);
  }
  K.lightPool(g, 9 * T, 14 * T, 280, 130, "255,236,190", 0.07);
  K.lightPool(g, 24 * T, 14 * T, 280, 130, "255,236,190", 0.07);

  // left wing: group study tables
  studyTable(f, 2, 6, 3);
  studyTable(f, 6, 6, 3);
  put(f, pl, 1, 9);
  put(f, pl, 9, 4, 1, 1, 0, -40);
  // right wing: a study table and whiteboard in front of the meeting rooms
  studyTable(f, 24, 6, 4);
  studyTable(f, 29, 6, 3);
  put(f, pl, 32, 9);
  // south: study rooms block
  core(f, 14, 14, 6, (x, y, pw, ph) => {
    K.wall(g, x, y, pw, ph, "#e6e2d8", "#f4f1e9", "#b3aea2");
    studyDoor(g, x + 24, y + 30, ph - 30, false);
    studyDoor(g, x + 24 + 120, y + 30, ph - 30, true);
    studyDoor(g, x + 24 + 240, y + 30, ph - 30, false);
    text(g, "STUDY ROOMS  自习室", x + pw / 2, y + 8, 14, "#526563", { align: "center" });
  });
  put(f, pl, 1, 18, 1, 1);
  put(f, pl, 32, 18, 1, 1);
  put(f, K.floorStand("Mind Your Step", "请小心台阶"), 18, 10, 1, 1, 26, 0);
  // window side past the lounge: the high long table with stools (video 103514, 1:08 to 1:14)
  put(f, highTable(), 4, 16, 3, 1);
  // the bay of round tables and timber chairs between timber fin screens (video 103514, 0:35 to 0:42)
  const fin = finScreen();
  put(f, fin, 21, 16);
  put(f, fin, 30, 16);
  for (const tx of [24, 27]) {
    put(f, K.roundTable("#e8cba9", 52), tx, 16, 1, 1, 0, -4);
    put(f, K.chair("#c5aa7c", "#9c855b"), tx - 1, 16, 1, 1, 10, -2);
    put(f, K.chair("#c5aa7c", "#9c855b"), tx + 1, 16, 1, 1, -10, -2);
  }

  finish(f);

  f.triggers.push({ id: "up", tx: 15, ty: 3, w: 3, h: 1, en: "Study stair up to 4/F", zh: "上四楼", auto: true, action: { type: "goto", map: "b5-4", spawn: "stair" } });
  f.triggers.push({ id: "study", tx: 15, ty: 6, w: 3, h: 3, en: "Study stair: learn a function", zh: "阶梯自习区：学新函数", action: { type: "powerup", kind: "study" } });
  info(f, "stair-sofas", 6, 13, 6, 1, "Sofas under the stair", "楼梯下的沙发", "The study stair starts here on 3/F. At its foot and on its tiers are sofas, cushions, small lamps and white lap desks. People sit on the steps to read and work.");
  info(f, "stair-lounge", 21, 13, 6, 1, "Study stair", "阶梯自习区", "A wide tiered timber staircase used as seats: light oak treads with cushions in dusty pink, teal, mustard and orange. It climbs one floor, to the co-creation level on 4/F.");
  info(f, "meeting", 24, 3, 8, 1, "Meeting rooms", "会议室", "Levels 3, 4 and 5 of Building 5 are study and meeting rooms. This one has an oval table, a screen and a whiteboard behind the glass.");
  info(f, "study-rooms", 14, 18, 6, 1, "Study rooms", "自习室", "Tan doors in teal frames. The glass beside each door is etched Sapientia et Virtus on one pane and 明德格物 on the other: the HKU motto.");
  info(f, "wayfinding", 7, 3, 3, 1, "Wayfinding", "指示牌", "The stair in front of you goes up to 4/F, the co-creation level. The lift serves 1/F to 5/F.");
  info(f, "high-table", 4, 17, 3, 1, "High table", "高桌", "A long high timber table with black stools on the window side, past the sofas. Good for a laptop and a quick group check before class.");
  info(f, "round-tables", 23, 17, 6, 1, "Round tables", "圆桌区", "Round timber tables and chairs in a bay behind screens of upright timber fins, next to the windows. Groups meet here between classes.");

  const npcs: NpcDef[] = [
    { id: "b5-3-reader", char: "visitor2", tx: 8, ty: 13, dir: "down", name: "Student", nameZh: "同学" },
    { id: "b5-3-student", char: "visitor4", tx: 26, ty: 8, dir: "up", name: "Student", nameZh: "同学" },
  ];
  return {
    id: "b5-3",
    name: "Building 5 3/F",
    nameZh: "五号楼 3 层",
    cols: f.COLS,
    rows: f.ROWS,
    ground: f.ground,
    solid,
    props,
    npcs,
    triggers: f.triggers,
    spawns: { lift: { tx: 2, ty: 3, dir: "down" }, "stair-top": { tx: 16, ty: 4, dir: "down" } },
    labels: [
      { x: 16 * T + 32, y: 4 * T + 30, en: "Study stair to 4/F", zh: "阶梯自习区 · 上四楼" },
      { x: 3 * T, y: WH - 150, en: "Lift", zh: "电梯" },
    ],
  };
}

// =====================================================================================
// 4/F: co-creation level, top of the study stair
// =====================================================================================

export function buildB5CoCreation(): GameMap {
  const f = shell(4);
  const { g, solid, COLS, W, props } = f;
  const pl = K.plant(130);

  K.planks(g, T, WH, W - 2 * T, 17 * T - WH + T, K.R.honeyOak, 41);

  // north wall: lift, project rooms 411-414, the crest screen, the Sapientia glass room, 417 to 420
  liftBay(f, "四层");
  K.wall(g, 7 * T, 0, 5 * T, WH, "#d8cfc2", "#ece4d8", "#a99f90");
  for (let k = 0; k < 4; k++) {
    redDoor(g, 7 * T + 14 + k * 78, 50, WH - 50);
    text(g, String(411 + k), 7 * T + 42 + k * 78, 28, 13, "#4a3a30", { align: "center" });
  }
  text(g, "PROJECT ROOM 项目会议室", 9 * T + 32, 8, 12, "#4a3a30", { align: "center" });
  crestScreen(g, 12 * T, 0, 10 * T, WH);
  // glass room etched Sapientia Et Virtus, with a graphic mural behind it
  const gx = 22 * T;
  rect(g, gx, 0, 5 * T, WH, "#59626a");
  for (let j = 0; j < 5; j++)
    for (let i = 0; i < 10; i++) {
      const hx = gx + 10 + i * 32 + (j % 2) * 16;
      ellipse(g, hx, 90 + j * 20, 12, 9, ["#e6ece8", "#9fc3b1", "#f1d9a0", "#c9d3d9"][Math.floor(hash(i, j, 77) * 4)]);
    }
  rect(g, gx, 0, 5 * T, WH, "rgba(120,150,170,0.35)");
  for (const [s, yy] of [["Sapientia", 18], ["Et", 62], ["Virtus", 106]] as const) text(g, s, gx + 20, yy, 44, "rgba(30,34,40,0.78)");
  for (let x = gx; x <= gx + 5 * T; x += 160) rect(g, Math.min(x, gx + 5 * T - 6), 0, 6, WH, "#17181a");
  rect(g, gx, 0, 5 * T, 6, "#17181a");
  rect(g, gx, WH - 6, 5 * T, 6, "#17181a");
  K.wall(g, 27 * T, 0, 6 * T, WH, "#d8cfc2", "#ece4d8", "#a99f90");
  ([[417, 0], [418, 1], [419, 2], [420, 3]] as const).forEach(([n, k]) => {
    redDoor(g, 27 * T + 22 + k * 88, 50, WH - 50);
    text(g, String(n), 27 * T + 50 + k * 88, 28, 13, "#4a3a30", { align: "center" });
  });
  text(g, "CONFERENCE 大会议室 417 · MEETING 会议室 418-420", 30 * T, 8, 11, "#4a3a30", { align: "center" });

  // the stair void: tiers falling away to 3/F, glass balustrade round three sides
  const VX = 12 * T;
  const VY = 11 * T;
  rect(g, VX - 6, VY - 6, 9 * T + 12, 7 * T + 12, "#3a2e22");
  for (let i = 0; i < 7; i++) {
    const y = VY + i * T;
    const lit = Math.max(1, 6 - i);
    rect(g, VX, y, 9 * T, T, OAK[lit]);
    rect(g, VX, y, 9 * T, 3, OAK[Math.min(7, lit + 1)]);
    rect(g, VX, y + T - 10, 9 * T, 10, OAK[Math.max(0, lit - 1)]);
    rect(g, 15 * T, y + 28, 3 * T, 3, OAK[Math.max(0, lit - 1)]);
    for (const side of [0, 1]) {
      const bx = side ? 18 * T + 10 : VX + 10;
      if ((i + side) % 3 === 1) tierSofa(g, bx + 6, y + 6, 120, side ? ["#3f8f5a", "#f1efe8"] : ["#c8323a", "#6d99a1", "#f1efe8"]);
      else for (let k = 0; k < 3; k++) if (hash(i, k, 93 + side) > 0.4) {
        const c = CUSH[Math.floor(hash(i, k, 95 + side) * CUSH.length)];
        tierCushion(g, bx + k * 58, y + 20, c[0], c[1], c[2]);
      }
    }
    rect(g, VX, y, 9 * T, T, `rgba(24,18,12,${(i * 0.085).toFixed(3)})`);
  }
  for (const hx of [15 * T - 4, 18 * T]) {
    rect(g, hx, VY, 8, 7 * T, "rgba(190,220,232,0.35)");
    rect(g, hx + 3, VY - 4, 3, 7 * T, "#f6f4ee");
  }
  const rail = (x: number, y: number, w: number, h: number): void => {
    rect(g, x, y, w, h, "rgba(190,220,232,0.5)");
    if (w > h) rect(g, x, y, w, 3, "#f6f4ee");
    else rect(g, x + Math.floor(w / 2) - 1, y, 3, h, "#f6f4ee");
  };
  rail(VX - 10, VY - 8, 3 * T + 10, 10);
  rail(18 * T, VY - 8, 3 * T + 10, 10);
  rail(VX - 10, VY - 8, 10, 7 * T + 16);
  rail(21 * T, VY - 8, 10, 7 * T + 16);
  rail(VX - 10, 18 * T, 9 * T + 20, 10);
  block(solid, COLS, 12, 11, 9, 7);
  block(solid, COLS, 15, 11, 3, 2, 0);

  // plywood wayfinding pillar, concrete column, the prohibition board
  put(f, plyPillar(["← TOILET 洗手间", "PROJECT ROOM", "项目会议室 411-414", "", "→ CO-CREATION SPACE", "共创空间", "MEETING ROOM", "会议室 418-420", "CONFERENCE ROOM", "大会议室 417"]), 24, 6, 2, 1);
  put(f, concreteColumn("4F"), 22, 8);
  put(f, K.floorStand("Notice", "告示"), 19, 9, 1, 1, 20, 0);

  // lounge, left: grey and mint armchairs, the self-service counter with stools
  rug(g, 2 * T, 12 * T + 10, 8 * T, 3 * T, "#b9a98a", "#a39274");
  put(f, K.armchair("#a8a6a0", "#7f7d77", "#c8c6c0"), 3, 12);
  put(f, K.armchair("#a8a6a0", "#7f7d77", "#c8c6c0"), 5, 12);
  put(f, K.armchair("#8fcdb4", "#5f9c84", "#b5e3d0"), 7, 12);
  put(f, K.roundTable("#f4f2ec", 48), 5, 14, 1, 1, 0, -4);
  put(f, K.armchair("#8fcdb4", "#5f9c84", "#b5e3d0"), 3, 15);
  put(f, K.armchair("#a8a6a0", "#7f7d77", "#c8c6c0"), 7, 15);
  put(f, counter(), 2, 17, 3, 1);
  put(f, pl, 1, 10);
  put(f, pl, 10, 17);
  // booths corridor, right: beige high-back booths on the window side, a maroon column
  const bt = booth();
  for (const tx of [23, 25, 27, 29, 31]) put(f, bt, tx, 16, 2, 2, 0, 0);
  put(f, bt, 30, 11, 2, 2);
  put(f, bt, 27, 11, 2, 2);
  const [mc, mg] = mk(64, 190);
  ellipse(mg, 32, 182, 28, 6, "rgba(20,24,40,0.3)");
  rect(mg, 8, 0, 48, 182, "#7a2d30");
  rect(mg, 8, 0, 6, 182, "#9c4347");
  rect(mg, 46, 0, 10, 182, "#571d20");
  put(f, mc, 24, 12);
  put(f, pl, 32, 9);
  for (const lx of [24, 27, 30]) K.lightPool(g, lx * T + 32, 15 * T, 110, 60, "255,214,120", 0.1);
  K.lightPool(g, 6 * T, 14 * T, 300, 140, "255,236,190", 0.06);

  finish(f);
  f.triggers.push({ id: "down", tx: 15, ty: 12, w: 3, h: 1, en: "Study stair down to 3/F", zh: "下三楼", auto: true, action: { type: "goto", map: "b5-3", spawn: "stair-top" } });
  info(f, "crest-wall", 14, 3, 6, 1, "Crest wall", "校徽墙", "The study stair tops out beside a brick-red louvred screen wall carrying a large HKU shield, under a dark wood slat ceiling with lines of light.");
  info(f, "project-rooms", 7, 3, 5, 1, "Project rooms 411-414", "项目会议室 411-414", "Glass rooms with dark-red gloss doors. Each door carries HKU and Est. 1911 in white.");
  info(f, "sapientia", 22, 3, 5, 1, "Sapientia et Virtus", "明德格物", "A full-height glass room etched with the HKU motto, Sapientia et Virtus: wisdom and virtue. In Chinese it is 明德格物.");
  info(f, "meeting-rooms", 27, 3, 6, 1, "Rooms 417 to 420", "会议室 417-420", "Conference room 417 and meeting rooms 418 to 420, next to the co-creation space.");
  info(f, "pillar", 24, 7, 2, 1, "Wayfinding pillar", "指示柱", "A plywood pillar with stencilled text. Left: toilet, project rooms 411-414. Right: co-creation space, meeting rooms 418-420, conference room 417.");
  info(f, "booths", 26, 13, 6, 1, "Booths", "卡座", "Beige fabric high-back booths line the window side, each with a low dark seat and a side table, under a row of gold ring lights.");
  info(f, "lounge", 3, 13, 5, 1, "Lounge", "休息区", "Grey and mint-green armchairs and a self-service counter with stools. The real windows look out on white and grey high-rise towers.");

  const npcs: NpcDef[] = [
    { id: "b5-4-student", char: "visitor1", tx: 6, ty: 16, dir: "up", name: "Student", nameZh: "同学" },
    { id: "b5-4-visitor", char: "visitor3", tx: 25, ty: 9, dir: "left", name: "Visitor", nameZh: "访客" },
  ];
  return {
    id: "b5-4",
    name: "Building 5 4/F",
    nameZh: "五号楼 4 层",
    cols: f.COLS,
    rows: f.ROWS,
    ground: f.ground,
    solid,
    props,
    npcs,
    triggers: f.triggers,
    spawns: { lift: { tx: 2, ty: 3, dir: "down" }, stair: { tx: 16, ty: 10, dir: "up" } },
    labels: [
      { x: 16 * T + 32, y: 11 * T - 14, en: "Study stair to 3/F", zh: "阶梯自习区 · 下三楼" },
      { x: 3 * T, y: WH - 150, en: "Lift", zh: "电梯" },
    ],
  };
}

// =====================================================================================
// 5/F: learning commons
// =====================================================================================

export function buildB5Commons(): GameMap {
  const f = shell(5);
  const { g, solid, COLS, W, props } = f;
  const pl = K.plant(124);

  K.carpet(g, T, WH, W - 2 * T, 17 * T - WH + T);
  // wood-look strips at the room thresholds
  K.planks(g, 10 * T, WH, 16 * T, 28, K.R.paleWood, 51, 14, 3);
  K.planks(g, 22 * T, 13 * T, 11 * T, 6 * T, K.R.paleWood, 53);

  // north wall: lift, directory sign, self-study rooms 503-517, meeting room
  liftBay(f, "五层");
  K.wall(g, 7 * T, 0, 3 * T, WH, "#eef0ec", "#fbfcfa", "#b9bcb6");
  const dir = ["→ CO-CREATION SPACE", "共创空间 501", "← TOILET 洗手间", "SELF-STUDY ROOM", "自习室 503-517", "↑ LEARNING COMMONS", "学习共享空间 518-522", "SELF-STUDY ROOM", "自习室 523-530", "PRAYER ROOM 祈祷室 531"];
  dir.forEach((s, i) => text(g, s, 7 * T + 12, 16 + i * 16, 10, "#6d7a78"));
  K.wall(g, 10 * T, 0, 16 * T, WH, "#dfe6e2", "#f1f5f2", "#a9b3ae");
  for (let k = 0; k < 8; k++) {
    studyDoor(g, 10 * T + 8 + k * 126, 44, WH - 44, k % 2 === 1);
    text(g, String(503 + k * 2), 10 * T + 36 + k * 126, 24, 12, "#526563", { align: "center" });
  }
  text(g, "SELF-STUDY ROOM 自习室 503-517", 18 * T, 6, 12, "#526563", { align: "center" });
  meetingFace(g, 26 * T, 16, 7 * T, WH - 16, "MEETING ROOM", "会议室");
  rect(g, 26 * T, 0, 7 * T, 16, "#17181a");

  // bookshelf corridor on the left: white shelves, curtained reading niches
  const bs = bookshelf();
  const niche = curtainNiche();
  put(f, bs, 1, 6, 2, 1);
  put(f, niche, 1, 9, 2, 1);
  put(f, bs, 1, 12, 2, 1);
  put(f, niche, 1, 15, 2, 1);
  put(f, bs, 5, 7, 2, 1);
  put(f, bs, 5, 12, 2, 1);
  // a white trolley shelf
  const [tr, tg] = mk(56, 70);
  ellipse(tg, 28, 64, 24, 5, "rgba(20,24,40,0.25)");
  rect(tg, 6, 6, 44, 52, "#f6f4ee");
  rect(tg, 10, 12, 36, 14, "#d7d4cc");
  rect(tg, 10, 32, 36, 14, "#d7d4cc");
  for (let k = 0; k < 5; k++) rect(tg, 12 + k * 7, 14, 5, 12, ["#b0433a", "#2f6f7a", "#c9a233", "#4d5a66", "#5f8f5a"][k]);
  rect(tg, 10, 58, 5, 5, "#3a3d41");
  rect(tg, 41, 58, 5, 5, "#3a3d41");
  put(f, tr, 4, 16);

  // carrel pods in two rows, planters between them
  const cp = carrel();
  for (const tx of [9, 12, 15, 18]) {
    put(f, cp, tx, 6, 2, 1, 0, 0);
    put(f, cp, tx, 9, 2, 1, 0, 0);
  }
  planterBox(f, 11, 7, 1);
  planterBox(f, 17, 10, 1);
  put(f, pl, 21, 6);

  // open study: long tables with acrylic dividers, a sage-green column
  studyTable(f, 9, 13, 5);
  studyTable(f, 9, 16, 5);
  studyTable(f, 15, 13, 5);
  studyTable(f, 15, 16, 5);
  const [sc, sg] = mk(64, 190);
  ellipse(sg, 32, 182, 28, 6, "rgba(20,24,40,0.3)");
  rect(sg, 8, 0, 48, 182, "#9fb8a0");
  rect(sg, 8, 0, 6, 182, "#bdd2bd");
  rect(sg, 46, 0, 10, 182, "#7d967e");
  put(f, sc, 14, 14, 1, 1, 0, 26);

  // self-study rooms 523-530 and the prayer room, as a block on the right
  core(f, 23, 8, 9, (x, y, pw, ph) => {
    K.wall(g, x, y, pw, ph, "#dfe6e2", "#f1f5f2", "#a9b3ae");
    for (let k = 0; k < 4; k++) {
      studyDoor(g, x + 12 + k * 120, y + 34, ph - 34, k % 2 === 1);
      text(g, k < 3 ? String(523 + k * 3) : "531", x + 40 + k * 120, y + 16, 12, "#526563", { align: "center" });
    }
    text(g, "PRAYER ROOM", x + 12 + 3 * 120 + 82, y + 8, 9, "#526563", { align: "center" });
    text(g, "祈祷室", x + 12 + 3 * 120 + 82, y + 19, 10, "#526563", { align: "center" });
  });
  // seats on the wood floor at the far end
  put(f, K.armchair("#a8a6a0", "#7f7d77", "#c8c6c0"), 24, 15);
  put(f, K.roundTable("#f4f2ec", 44), 25, 15, 1, 1, 0, -6);
  put(f, K.armchair("#6f8f5e", "#4c6a3e", "#93b081"), 26, 15);
  put(f, bs, 29, 17, 2, 1);
  put(f, pl, 32, 13);
  put(f, pl, 32, 4);
  K.lightPool(g, 14 * T, 15 * T, 420, 150, "255,255,240", 0.06);
  K.lightPool(g, 14 * T, 8 * T, 380, 130, "206,240,214", 0.06);

  finish(f);
  info(f, "directory", 7, 3, 3, 1, "Directory", "楼层指引", "Co-creation space 501. Self-study rooms 503-517 and 523-530. Learning commons 518-522. Prayer room 531.");
  info(f, "self-study", 12, 3, 10, 1, "Self-study rooms", "自习室", "Tan doors in sage frames. Each room has a long wall desk, a task chair, a small table lamp and a whiteboard. The glass is etched Sapientia et Virtus and 明德格物.");
  info(f, "meeting", 27, 3, 5, 1, "Meeting room", "会议室", "An oval pale wood table with a cable port, white and grey chairs, a flat screen on the end wall and two large whiteboards.");
  info(f, "carrels", 9, 8, 10, 1, "Carrel pods", "独立学习舱", "Beige felt curved partitions with white trim. Inside each: a pale wood desk, a shelf with a light strip under it and a white shell chair. Plants stand between the pods.");
  info(f, "open-study", 9, 14, 11, 2, "Open study", "开放自习区", "Long pale wood tables with clear acrylic dividers down the middle and white shell chairs, beside a sage-green column.");
  info(f, "books", 3, 8, 2, 6, "Bookshelf corridor", "书架走廊", "White open shelves with books, and reading niches behind dark green floor-length curtains, each with a low armchair and a small table.");
  info(f, "prayer", 29, 12, 3, 1, "Prayer room 531", "祈祷室 531", "Room 531 is the prayer room. The team did not film inside.");

  const npcs: NpcDef[] = [
    { id: "b5-5-student", char: "visitor2", tx: 21, ty: 14, dir: "left", name: "Student", nameZh: "同学" },
    { id: "b5-5-reader", char: "visitor4", tx: 4, ty: 10, dir: "left", name: "Reader", nameZh: "读者" },
  ];
  return {
    id: "b5-5",
    name: "Building 5 5/F",
    nameZh: "五号楼 5 层",
    cols: f.COLS,
    rows: f.ROWS,
    ground: f.ground,
    solid,
    props,
    npcs,
    triggers: f.triggers,
    spawns: { lift: { tx: 2, ty: 3, dir: "down" } },
    labels: [
      { x: 14 * T, y: 13 * T - 46, en: "Learning Commons", zh: "学习共享空间" },
      { x: 3 * T, y: WH - 150, en: "Lift", zh: "电梯" },
    ],
  };
}
