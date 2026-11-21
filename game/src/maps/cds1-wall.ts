// Things drawn on the back wall of a CDS1 floor: wall finishes, lifts, doors, signs, glass rooms, screens.
import { rect, frame, hash, shade, text, FONT, type Ctx } from "../art/px";
import { WALL_PX, ao } from "./cds1-kit";

const H = WALL_PX; // 192
const TOP = 14; // dark ceiling reveal
const SKIRT = 8;

export type Finish = "white" | "cream" | "timber" | "stone" | "fluted" | "dark";

/** a stretch of back wall from px x, w px wide */
export function wall(g: Ctx, x: number, w: number, finish: Finish = "white"): void {
  const base = { white: "#EFEDE6", cream: "#E9E4DA", timber: "#C9A879", stone: "#CBB894", fluted: "#EFEDE6", dark: "#4a4640" }[finish];
  rect(g, x, 0, w, H, base);
  if (finish === "fluted") {
    for (let i = 0; i < w; i += 8) {
      rect(g, x + i, TOP, 2, H - TOP, "#ffffff");
      rect(g, x + i + 5, TOP, 2, H - TOP, "#d6d3ca");
      rect(g, x + i + 7, TOP, 1, H - TOP, "#bdb9ae");
    }
  } else if (finish === "timber") {
    for (let i = 0; i < w; i += 32) {
      const t = shade(base, (hash(x + i, 1, 51) - 0.5) * 0.14);
      rect(g, x + i, TOP, Math.min(32, w - i), H - TOP, t);
      for (let k = 0; k < 10; k++) rect(g, x + i + 4 + Math.floor(hash(x + i, k, 52) * 24), TOP + 6 + Math.floor(hash(x + i, k, 53) * 130), 1, 12 + Math.floor(hash(x + i, k, 54) * 30), shade(t, -0.1));
      rect(g, x + i, TOP, 1, H - TOP, shade(base, -0.22));
    }
  } else if (finish === "stone") {
    // tan stone with a fine square relief pattern
    for (let j = TOP; j < H - SKIRT; j += 16)
      for (let i = 0; i < w; i += 16) {
        const t = shade(base, (hash(x + i, j, 55) - 0.5) * 0.1);
        rect(g, x + i, j, Math.min(16, w - i), 16, t);
        rect(g, x + i + 3, j + 3, 10, 10, shade(t, 0.08));
        rect(g, x + i + 3, j + 12, 10, 1, shade(t, -0.12));
        rect(g, x + i + 12, j + 3, 1, 10, shade(t, -0.12));
      }
  } else {
    for (let j = TOP; j < H; j += 2) for (let i = 0; i < w; i += 2) if (hash(x + i, j, 56) < 0.04) rect(g, x + i, j, 2, 2, shade(base, -0.05));
    rect(g, x, TOP, w, 10, shade(base, -0.06));
    rect(g, x, H - 40, w, 32, shade(base, -0.03));
  }
  rect(g, x, 0, w, TOP, "#2E2E2E");
  rect(g, x, TOP - 3, w, 3, "#f6e9c8"); // warm cove light
  rect(g, x, H - SKIRT, w, SKIRT, finish === "dark" ? "#2a2826" : shade(base, -0.3));
  rect(g, x, H - SKIRT, w, 1, shade(base, -0.45));
  ao(g, x, H, w, 14);
}

/** green running-man EXIT lamp */
export function exitLamp(g: Ctx, x: number, y = 18): void {
  rect(g, x, y, 34, 14, "#1d2a22");
  rect(g, x + 1, y + 1, 32, 12, "#2fbf6b");
  rect(g, x + 5, y + 3, 4, 4, "#eafff2");
  rect(g, x + 4, y + 7, 7, 2, "#eafff2");
  rect(g, x + 6, y + 9, 2, 3, "#eafff2");
  text(g, "EXIT", x + 13, y + 2, 9, "#eafff2");
}

/** tiny HKU crest: shield with a book, used on signs (s = px scale) */
export function crest(g: Ctx, x: number, y: number, s = 2, c = "#1f1f1f", paper = "#f1efea"): void {
  const rows = [10, 10, 10, 10, 10, 10, 8, 8, 6, 4, 2];
  rows.forEach((w, j) => rect(g, x + ((10 - w) / 2) * s, y + j * s, w * s, s, c));
  rect(g, x + 2 * s, y + 2 * s, 6 * s, 3 * s, paper);
  rect(g, x + 5 * s - 1, y + 2 * s, 2, 3 * s, c);
  rect(g, x + 2 * s, y + 6 * s, 6 * s, s, paper);
}

/** hollow stencil-outline room number over a long rule that turns down to a small oval door handle */
export function roomSign(g: Ctx, x: number, y: number, num: string, size = 22, ink = "#1F1F1F"): void {
  g.font = `700 ${size}px ${FONT}`;
  g.textAlign = "left";
  g.textBaseline = "alphabetic";
  g.lineWidth = 2;
  g.strokeStyle = ink;
  g.strokeText(num, Math.round(x), Math.round(y + size));
  const w = Math.ceil(g.measureText(num).width);
  rect(g, x - 6, y + size + 3, w + 30, 2, ink);
  rect(g, x + w + 22, y + size + 3, 2, 16, ink);
  frame(g, x + w + 19, y + size + 19, 8, 12, ink, 2);
}

/** n brushed-steel lift doors, 2 tiles each, with the raised red floor numeral */
export function liftDoors(g: Ctx, x: number, n: number, numeral: string): void {
  for (let k = 0; k < n; k++) {
    const dx = x + k * 128 + 14;
    rect(g, dx - 6, 34, 112, H - 34 - SKIRT + 8, "#8d9092");
    rect(g, dx - 4, 36, 108, H - 36, "#d5d7d8");
    for (let leaf = 0; leaf < 2; leaf++) {
      const lx = dx + leaf * 50;
      rect(g, lx, 40, 50, H - 40, "#B9BCBE");
      for (let i = 0; i < 50; i += 2) if (hash(lx + i, k, 61) < 0.5) rect(g, lx + i, 40, 1, H - 40, hash(lx + i, k, 62) < 0.5 ? "#c9cccd" : "#a9acae");
      rect(g, lx + 6, 46, 8, H - 60, "rgba(255,255,255,0.35)");
    }
    rect(g, dx + 49, 40, 2, H - 40, "#5d6062");
    // pink prohibition pictograms
    for (let p = 0; p < 2; p++) {
      rect(g, dx + 18 + p * 50, 104, 12, 12, "#f3f3f3");
      frame(g, dx + 18 + p * 50, 104, 12, 12, "#e2578a", 2);
    }
    // call panel with yellow button plate
    rect(g, dx + 108, 96, 12, 34, "#8d9092");
    rect(g, dx + 110, 100, 8, 8, "#e9c84a");
    rect(g, dx + 110, 112, 8, 8, "#e9c84a");
    rect(g, dx + 30, 22, 40, 10, "#1b1b1b");
    text(g, "▲", dx + 50, 22, 9, "#ff9a3c", { align: "center" });
  }
  // raised red numeral with a drop shadow
  const nx = x + n * 64;
  text(g, numeral, nx + 2, 2, 30, "#5e1510", { align: "center" });
  text(g, numeral, nx, 0, 30, "#B02B22", { align: "center" });
}

/** a single door leaf (64 px slot). kind: tan timber, grey double, glass */
export function door(g: Ctx, x: number, num = "", kind: "tan" | "timber" | "grey" | "glass" = "tan", label = ""): void {
  const leaf = { tan: "#C9B79B", timber: "#B08A62", grey: "#8f9499", glass: "#b9d3dd" }[kind];
  rect(g, x + 2, 46, 60, H - 46, "#1F1F1F");
  rect(g, x + 6, 50, 52, H - 50, leaf);
  rect(g, x + 6, 50, 4, H - 50, shade(leaf, 0.15));
  rect(g, x + 54, 50, 4, H - 50, shade(leaf, -0.15));
  if (kind === "tan" || kind === "grey") {
    rect(g, x + 38, 62, 12, 70, "#dfe9ec");
    rect(g, x + 40, 64, 3, 66, "#ffffff");
  }
  if (kind === "glass") {
    rect(g, x + 10, 56, 44, 120, "#cfe3ea");
    rect(g, x + 14, 60, 6, 100, "#eef7fa");
    for (let i = 0; i < 44; i += 4) rect(g, x + 10 + i, 160 + (i % 8 ? 0 : 4), 2, 2, "#ffffff");
  }
  rect(g, x + 12, 118, 4, 14, "#55585a"); // handle
  if (num) {
    rect(g, x + 66, 96, 10, 16, "#1F1F1F"); // card reader
    rect(g, x + 68, 98, 6, 6, "#3e86d8");
    roomSign(g, x + 68, 52, num, 18);
  }
  if (label) text(g, label, x + 32, 30, 11, "#3a3a3a", { align: "center" });
}

/** wall screen: dark bezel, coloured header, text lines */
export function screen(g: Ctx, x: number, y: number, w: number, h: number, title: string, lines: string[], bg = "#eef3fa", head = "#2b5fb4"): void {
  rect(g, x - 3, y - 3, w + 6, h + 6, "#16181c");
  rect(g, x, y, w, h, bg);
  rect(g, x, y, w, Math.min(20, h / 3), head);
  text(g, title, x + w / 2, y + 3, 12, "#ffffff", { align: "center", maxWidth: w - 6 });
  lines.forEach((l, i) => text(g, l, x + w / 2, y + 24 + i * 13, 10, "#26324a", { align: "center", bold: i === 0, maxWidth: w - 8 }));
  rect(g, x + 2, y + 2, 10, 2, "rgba(255,255,255,0.5)");
}

/** big mounted wall letters (red HKU, blue-grey CDS with stripes) */
export function bigLetters(g: Ctx, x: number, y: number, s: string, size: number, color: string, stripe?: string): void {
  g.font = `700 ${size}px Georgia, "Times New Roman", serif`;
  g.textAlign = "left";
  g.textBaseline = "top";
  g.fillStyle = "rgba(40,40,50,0.25)";
  g.fillText(s, x + 4, y + 4);
  g.fillStyle = color;
  g.fillText(s, x, y);
  if (stripe) {
    const w = Math.ceil(g.measureText(s).width);
    g.save();
    g.globalCompositeOperation = "source-atop";
    g.fillStyle = stripe;
    for (let i = 0; i < w; i += 6) g.fillRect(x + i, y + size * 0.3, 2, size * 0.5);
    g.restore();
  }
}

/** black-on-white printed panel: crest, heading and rows; red rows start with "!" */
export function panel(g: Ctx, x: number, y: number, w: number, h: number, heading: string, rows: string[], size = 9): void {
  rect(g, x - 2, y - 2, w + 4, h + 4, "#9a9da0");
  rect(g, x, y, w, h, "#fbfbf8");
  crest(g, x + 5, y + 4, 1);
  text(g, heading, x + 20, y + 4, size, "#1f1f1f", { maxWidth: w - 24 });
  rect(g, x + 4, y + 18, w - 8, 1, "#1f1f1f");
  rows.forEach((r, i) => {
    const red = r.startsWith("!");
    text(g, red ? r.slice(1) : r, x + 5, y + 22 + i * (size + 3), size, red ? "#B02B22" : "#1f1f1f", { bold: false, maxWidth: w - 10 });
  });
}
