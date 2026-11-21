// Window bays and glass-walled rooms seen through the back wall of a CDS-1 floor.
import { rect, hash, shade, text, type Ctx } from "../art/px";
import { WALL_PX, ao } from "./cds1-kit";
import { roomSign } from "./cds1-wall";

const H = WALL_PX;
export type View = "city" | "farm" | "green";

function sky(g: Ctx, x: number, y: number, w: number, h: number, view: View): void {
  const bands = ["#a9cbe6", "#b9d6ec", "#cbe1f1", "#dcecf5", "#eaf3f7"];
  bands.forEach((c, i) => rect(g, x, y + Math.floor((i * h) / 5), w, Math.ceil(h / 5), c));
  const base = y + h;
  if (view === "city") {
    // distant Pudong towers
    for (let i = 0; i < w; i += 10) {
      const hh = 14 + Math.floor(hash(Math.floor((x + i) / 10), 2, 71) * h * 0.55);
      const c = ["#8fa3b8", "#7d92a9", "#9db0c2", "#6f859d"][Math.floor(hash(x + i, 3, 72) * 4)];
      rect(g, x + i, base - hh, 9, hh, c);
      for (let j = 4; j < hh - 2; j += 5) rect(g, x + i + 2, base - hh + j, 5, 1, "#c9d8e4");
    }
  } else if (view === "farm") {
    // fields, greenhouses, orange-roofed villas and pylons (the real 6/F view)
    rect(g, x, base - 40, w, 40, "#8fb37a");
    rect(g, x, base - 40, w, 6, "#a9c1a0");
    for (let i = 0; i < w; i += 22) {
      const r = hash(Math.floor((x + i) / 22), 5, 73);
      if (r < 0.4) {
        rect(g, x + i + 2, base - 22, 14, 9, "#f1ede2");
        rect(g, x + i, base - 27, 18, 5, "#d9783a");
      } else if (r < 0.65) {
        rect(g, x + i, base - 14, 20, 6, "#dfeaea");
        rect(g, x + i, base - 15, 20, 1, "#ffffff");
      } else if (r < 0.78) {
        rect(g, x + i + 8, base - 62, 2, 30, "#6d7680");
        rect(g, x + i + 3, base - 58, 12, 1, "#6d7680");
        rect(g, x + i + 5, base - 50, 8, 1, "#6d7680");
      }
    }
    for (let i = 0; i < w; i += 3) if (hash(x + i, 7, 74) < 0.3) rect(g, x + i, base - 6 - Math.floor(hash(x + i, 8, 75) * 20), 3, 2, "#79a366");
  } else {
    rect(g, x, base - 46, w, 46, "#7fae74");
    for (let i = 0; i < w; i += 14) {
      const hh = 30 + Math.floor(hash(x + i, 9, 76) * 40);
      rect(g, x + i, base - hh, 14, hh, ["#5f9a5c", "#6fa965", "#4f8a55"][Math.floor(hash(x + i, 4, 77) * 3)]);
      rect(g, x + i + 2, base - hh + 2, 6, 4, "#8fc27f");
    }
  }
}

/** full-height window band with slim grey mullions */
export function windowBay(g: Ctx, x: number, w: number, view: View = "city"): void {
  rect(g, x, 0, w, H, "#5b6066");
  rect(g, x, 0, w, 14, "#2E2E2E");
  sky(g, x + 4, 18, w - 8, H - 18 - 22, view);
  for (let i = 0; i <= w - 4; i += 32) rect(g, x + i, 14, 4, H - 14 - 18, "#7b8188");
  rect(g, x, 60, w, 3, "#7b8188");
  // reflections
  for (let i = 12; i < w - 20; i += 64) {
    rect(g, x + i, 24, 6, 90, "rgba(255,255,255,0.28)");
    rect(g, x + i + 10, 24, 2, 60, "rgba(255,255,255,0.28)");
  }
  rect(g, x, H - 22, w, 22, "#d8d4ca");
  rect(g, x, H - 22, w, 3, "#f3f1ec");
  rect(g, x, H - 8, w, 8, "#8d8a82");
  ao(g, x, H, w, 14);
}

export type RoomKind = "gym" | "meeting" | "discussion" | "class" | "lab" | "server" | "theatre";

/** a room behind a glass partition: you see its back wall and furniture, etched number on the glass */
export function glassRoom(g: Ctx, x: number, w: number, kind: RoomKind, num: string, label: string, view: View = "farm"): void {
  const floorY = H - 46;
  rect(g, x, 0, w, H, "#f4f2ec");
  rect(g, x, 0, w, 14, "#2E2E2E");
  // back of the room
  if (kind === "class" || kind === "theatre") {
    rect(g, x + 4, 18, w - 8, floorY - 18, kind === "class" ? "#f7f6f2" : "#3b3a3f");
    if (kind === "class") for (let i = 8; i < w - 8; i += 6) rect(g, x + i, 22, 2, floorY - 40, "#e2e0d8"); // louvre blinds
    else rect(g, x + 20, 30, w - 40, floorY - 56, "#16171b"); // projection screen
  } else if (kind === "server") {
    rect(g, x + 4, 18, w - 8, floorY - 18, "#c9ced3");
  } else sky(g, x + 4, 18, w - 8, floorY - 18, view);
  if (kind !== "class" && kind !== "theatre" && kind !== "server") for (let i = 0; i < w; i += 40) rect(g, x + i, 16, 3, floorY - 16, "#8a9097");
  rect(g, x + 4, floorY, w - 8, 46, kind === "gym" ? "#c9a879" : kind === "theatre" ? "#5a6680" : kind === "server" ? "#9a9a96" : "#55627c");
  // furniture
  const fy = floorY + 10;
  if (kind === "gym") {
    for (let i = 14; i < w - 60; i += 46) {
      rect(g, x + i, fy - 4, 34, 10, "#2b2d33"); // treadmill deck
      rect(g, x + i + 2, fy - 2, 30, 4, "#55585f");
      rect(g, x + i + 4, fy - 38, 3, 36, "#8a8d93");
      rect(g, x + i + 26, fy - 38, 3, 36, "#8a8d93");
      rect(g, x + i + 2, fy - 44, 30, 9, "#1c1d22");
      rect(g, x + i + 6, fy - 42, 22, 4, "#4fc0e8");
    }
    rect(g, x + w - 52, fy - 36, 14, 46, "#3a3c42"); // dumbbell rack
    for (let j = 0; j < 5; j++) rect(g, x + w - 56, fy - 32 + j * 9, 22, 4, "#15161a");
  } else if (kind === "meeting") {
    rect(g, x + 8, 30, 50, 70, "#fbfbf8"); // whiteboard with marker notes
    for (let j = 0; j < 8; j++) rect(g, x + 12, 36 + j * 8, 14 + Math.floor(hash(x, j, 81) * 28), 2, j % 3 ? "#3b62c4" : "#c8443a");
    rect(g, x + w - 60, 34, 48, 62, "#7E8C6E"); // sage felt panel
    rect(g, x + w - 52, 44, 32, 20, "#16181c");
    rect(g, x + 22, fy - 8, w - 60, 16, "#d9bf94");
    rect(g, x + 22, fy + 8, w - 60, 4, "#a98b5f");
    for (let i = 26; i < w - 50; i += 26) rect(g, x + i, fy - 24, 14, 18, "#cfd3d6");
  } else if (kind === "discussion") {
    for (let i = 8; i < w - 20; i += 12) rect(g, x + i, floorY - 20 + ((i / 12) % 2) * 6, 10, 4, "#ffffff"); // zigzag panel
    rect(g, x + w / 2 - 30, fy - 6, 60, 12, "#d6b98a");
    rect(g, x + w / 2 - 4, fy + 6, 8, 16, "#1f1f1f");
    for (const dx of [-52, -30, 20, 42]) rect(g, x + w / 2 + dx, fy - 22, 14, 20, "#f6f6f3");
  } else if (kind === "class") {
    for (let r = 0; r < 2; r++) {
      rect(g, x + 12, fy - 8 + r * 20, w - 40, 6, "#ffffff");
      for (let i = 16; i < w - 40; i += 18) rect(g, x + i, fy - 20 + r * 20, 10, 12, (i / 18 + r) % 2 ? "#c8443a" : "#3f9a6a");
    }
  } else if (kind === "lab") {
    for (let i = 10; i < w - 50; i += 54) {
      rect(g, x + i, fy - 6, 46, 14, "#eceae4");
      rect(g, x + i, fy + 8, 46, 6, "#b7b3a9");
      rect(g, x + i + 4, fy - 28, 18, 16, "#16181c");
      rect(g, x + i + 6, fy - 26, 14, 10, "#3fd08a");
      rect(g, x + i + 26, fy - 28, 18, 16, "#16181c");
      rect(g, x + i + 28, fy - 26, 14, 10, "#4f9be8");
    }
  } else if (kind === "server") {
    for (let i = 10; i < w - 40; i += 34) {
      rect(g, x + i, 36, 28, floorY - 20, "#1c1e24");
      for (let j = 0; j < 10; j++) {
        rect(g, x + i + 3, 42 + j * 10, 22, 6, "#2d313a");
        rect(g, x + i + 5, 44 + j * 10, 2, 2, hash(i, j, 82) < 0.7 ? "#3fe08a" : "#f0b23c");
        rect(g, x + i + 9, 44 + j * 10, 2, 2, hash(i, j, 83) < 0.5 ? "#4fb0ff" : "#3fe08a");
      }
    }
  } else {
    for (let r = 0; r < 3; r++) for (let i = 10 + r * 4; i < w - 20; i += 14) rect(g, x + i, fy - 12 + r * 12, 10, 8, r % 2 ? "#8E8B86" : "#C39A6B");
  }
  // glass front: white frame, pane lines, reflections, dotted frit at the bottom
  rect(g, x, 14, w, 4, "#ffffff");
  rect(g, x, 14, 4, H - 14, "#ffffff");
  rect(g, x + w - 4, 14, 4, H - 14, "#ffffff");
  for (let i = 64; i < w - 20; i += 64) rect(g, x + i, 18, 2, H - 26, "#e6e9ea");
  for (let i = 10; i < w - 30; i += 70) {
    rect(g, x + i, 24, 8, 110, "rgba(255,255,255,0.22)");
    rect(g, x + i + 12, 24, 3, 80, "rgba(255,255,255,0.22)");
  }
  for (let i = 6; i < w - 6; i += 4) rect(g, x + i, H - 18 + (i % 8 ? 0 : 3), 2, 2, "rgba(255,255,255,0.8)");
  rect(g, x, H - 8, w, 8, "#bdb9ae");
  // etched number and label on a solid strip of wall at the left
  rect(g, x + 4, 54, 108, 78, "rgba(244,242,236,0.94)");
  roomSign(g, x + 14, 58, num, 20, "#1F1F1F", 14);
  text(g, label, x + 10, 118, 9, "#3a3a3a", { maxWidth: 98 });
  ao(g, x, H, w, 14);
  void shade;
}
