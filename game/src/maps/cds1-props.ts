// Furniture sprites for the CDS-1 floors, drawn in the same 3/4 view as the maps.
import { mk, rect, ellipse, shade, hash, shadow, type Ctx } from "../art/px";

const cache = new Map<string, HTMLCanvasElement>();
function memo(key: string, make: () => HTMLCanvasElement): HTMLCanvasElement {
  let c = cache.get(key);
  if (!c) cache.set(key, (c = make()));
  return c;
}

/** upright cylinder: lit from the left, top ellipse at (cx, top) */
export function cyl(g: Ctx, cx: number, top: number, rx: number, ry: number, hgt: number, cTop: string, cSide: string): void {
  ellipse(g, cx, top + hgt, rx, ry, shade(cSide, -0.25));
  rect(g, cx - rx, top, rx * 2, hgt, cSide);
  rect(g, cx - rx, top, Math.round(rx * 0.3), hgt, shade(cSide, 0.14));
  rect(g, cx - Math.round(rx * 0.7), top, Math.round(rx * 0.25), hgt, shade(cSide, 0.07));
  rect(g, cx + Math.round(rx * 0.35), top, Math.round(rx * 0.35), hgt, shade(cSide, -0.1));
  rect(g, cx + Math.round(rx * 0.7), top, Math.ceil(rx * 0.3), hgt, shade(cSide, -0.2));
  ellipse(g, cx, top + hgt, rx, ry, shade(cSide, -0.12));
  rect(g, cx - rx, top + hgt - 2, rx * 2, 2, shade(cSide, -0.12));
  ellipse(g, cx, top, rx, ry, shade(cTop, -0.18));
  ellipse(g, cx, top, rx - 2, Math.max(1, ry - 2), cTop);
}

/** oblique box: top face w x d, front face hgt tall under it */
export function box(g: Ctx, x: number, y: number, w: number, d: number, hgt: number, cTop: string, cFront: string): void {
  rect(g, x, y, w, d, cTop);
  rect(g, x, y, w, 2, shade(cTop, 0.2));
  rect(g, x, y + d, w, hgt, cFront);
  rect(g, x, y + d, w, 2, shade(cFront, -0.18));
  rect(g, x + w - 3, y + d, 3, hgt, shade(cFront, -0.12));
  rect(g, x, y + d + hgt - 2, w, 2, shade(cFront, -0.25));
}

/** the big circular banquette: drum base, seat ring, back cushions around a centre (column optional) */
export function banquette(drum = "#3b4658", seat = "#cfc6b4", column: string | null = null): HTMLCanvasElement {
  return memo(`banq${drum}${seat}${column}`, () => {
    const W = 320;
    const colH = column ? 150 : 0;
    const Hh = 200 + colH;
    const [c, g] = mk(W, Hh);
    const cy = colH + 96;
    shadow(g, 160, cy + 62, 158, 34, 0.22);
    cyl(g, 160, cy, 154, 62, 30, shade(drum, 0.1), drum);
    // seat ring
    ellipse(g, 160, cy - 2, 146, 56, shade(seat, -0.16));
    ellipse(g, 160, cy - 4, 144, 54, seat);
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * Math.PI * 2;
      rect(g, 160 + Math.cos(a) * 120 - 1, cy - 4 + Math.sin(a) * 45 - 4, 2, 9, shade(seat, -0.14));
    }
    // back cushions, a raised inner ring
    cyl(g, 160, cy - 30, 92, 34, 24, shade(seat, 0.08), shade(seat, -0.06));
    for (let k = 0; k < 10; k++) rect(g, 160 - 92 + k * 19 + 8, cy - 28, 2, 24, shade(seat, -0.2));
    ellipse(g, 160, cy - 30, 60, 20, shade(drum, -0.2));
    if (column) {
      cyl(g, 160, 8, 40, 14, cy - 34, shade(column, 0.1), column);
      for (let j = 20; j < cy - 30; j += 40) rect(g, 120, j, 80, 1, shade(column, -0.14));
    } else ellipse(g, 160, cy - 30, 56, 17, shade(drum, 0.05));
    return c;
  });
}

/** curved sofa (3 tiles wide): high back along the north, seat in front, arms at both ends */
export function sofa(color = "#333F4D"): HTMLCanvasElement {
  return memo(`sofa${color}`, () => {
    const [c, g] = mk(192, 116);
    shadow(g, 96, 100, 94, 14, 0.22);
    for (let i = 0; i < 184; i += 4) {
      const t = (i - 90) / 92;
      const bow = Math.round((1 - t * t) * 14); // the middle bows away from us
      const top = 22 - bow;
      rect(g, 4 + i, top, 4, 34, shade(color, 0.04 - Math.abs(t) * 0.06)); // back rest
      rect(g, 4 + i, top, 4, 4, shade(color, 0.28));
      rect(g, 4 + i, top + 34, 4, 26, shade(color, 0.14)); // seat cushion
      rect(g, 4 + i, top + 34, 4, 2, shade(color, -0.2));
      rect(g, 4 + i, top + 60, 4, 16, shade(color, -0.14)); // front
      rect(g, 4 + i, top + 76, 4, 3, shade(color, -0.4));
      if (i % 60 === 56) rect(g, 4 + i, top + 6, 2, 68, shade(color, -0.26));
    }
    for (const x of [0, 172]) {
      rect(g, x, 30, 20, 62, shade(color, 0.08));
      rect(g, x, 30, 20, 4, shade(color, 0.3));
      rect(g, x, 88, 20, 4, shade(color, -0.4));
      rect(g, x + (x ? 0 : 18), 34, 2, 54, shade(color, -0.2));
    }
    return c;
  });
}

/** round table with shell chairs around it (2 tiles wide) */
export function tableSet(top = "#f4f3ef", chairs: string[] = ["#f4f3ef", "#3f8f78"], leg = "#b98d5e"): HTMLCanvasElement {
  return memo(`tbl${top}${chairs.join()}${leg}`, () => {
    const [c, g] = mk(128, 112);
    shadow(g, 64, 96, 56, 12, 0.2);
    const chair = (x: number, y: number, col: string, back: boolean): void => {
      rect(g, x + 2, y + 22, 2, 14, leg);
      rect(g, x + 18, y + 22, 2, 14, leg);
      rect(g, x, y + 12, 22, 12, col);
      rect(g, x, y + 22, 22, 2, shade(col, -0.25));
      if (back) {
        rect(g, x + 1, y - 6, 20, 20, shade(col, -0.06));
        rect(g, x + 1, y - 6, 20, 2, shade(col, 0.3));
      } else rect(g, x + 1, y + 6, 20, 8, shade(col, 0.1));
    };
    chair(52, 14, chairs[0], false); // far chair, behind the table
    chair(6, 44, chairs[1 % chairs.length], false);
    chair(100, 44, chairs[2 % chairs.length], false);
    rect(g, 61, 56, 6, 36, "#2a2a2e");
    ellipse(g, 64, 94, 16, 4, "#2a2a2e");
    ellipse(g, 64, 54, 40, 15, shade(top, -0.25));
    ellipse(g, 64, 51, 40, 15, top);
    ellipse(g, 54, 47, 14, 4, "#ffffff");
    chair(52, 72, chairs[3 % chairs.length], true); // near chair, back to us
    return c;
  });
}

/** round pouf / stool */
export function pouf(color = "#cfc6b4", tall = false): HTMLCanvasElement {
  return memo(`pouf${color}${tall}`, () => {
    const [c, g] = mk(48, tall ? 64 : 44);
    shadow(g, 24, (tall ? 64 : 44) - 8, 22, 6, 0.2);
    if (tall) {
      cyl(g, 24, 16, 10, 4, 36, "#3a3438", "#4b4447");
      cyl(g, 24, 8, 18, 6, 6, "#f1ece0", "#d8d1c2");
    } else cyl(g, 24, 10, 20, 7, 20, shade(color, 0.12), color);
    return c;
  });
}

/** fiddle-leaf fig in a white pot */
export function plant(seed = 1): HTMLCanvasElement {
  return memo(`plant${seed}`, () => {
    const [c, g] = mk(72, 136);
    shadow(g, 36, 126, 26, 7, 0.22);
    cyl(g, 36, 92, 16, 5, 30, "#5a4634", "#f2f0ea");
    rect(g, 34, 46, 4, 50, "#6b5236");
    const greens = ["#2f6b3c", "#3f8449", "#56a05a", "#22532f"];
    for (let k = 0; k < 16; k++) {
      const lx = 10 + Math.floor(hash(k, seed, 91) * 44);
      const ly = 4 + Math.floor(hash(k, seed, 92) * 62);
      const col = greens[k % 4];
      ellipse(g, lx + 8, ly + 9, 9, 11, shade(col, -0.2));
      ellipse(g, lx + 8, ly + 8, 8, 10, col);
      rect(g, lx + 8, ly, 1, 16, shade(col, 0.25));
    }
    return c;
  });
}

/** long counter (w tiles) with bar stools on the south side */
export function counter(w: number, top = "#efe9dc", body = "#C9A879", stools: string | null = "#8a6a45"): HTMLCanvasElement {
  return memo(`ctr${w}${top}${body}${stools}`, () => {
    const W = w * 64;
    const [c, g] = mk(W, 112);
    shadow(g, W / 2, 100, W / 2 - 4, 10, 0.18);
    box(g, 4, 6, W - 8, 26, 52, top, body);
    for (let i = 4; i < W - 8; i += 40) rect(g, i, 34, 1, 50, shade(body, -0.16));
    if (stools)
      for (let i = 28; i < W - 30; i += 52) {
        rect(g, i + 2, 78, 2, 26, "#2a2a2e");
        rect(g, i + 16, 78, 2, 26, "#2a2a2e");
        rect(g, i + 2, 92, 16, 2, "#2a2a2e");
        cyl(g, i + 10, 70, 11, 4, 6, shade(stools, 0.2), stools);
      }
    return c;
  });
}

/** square column clad in pale timber (or any colour), 1 tile */
export function column(color = "#C9A879", tall = 170): HTMLCanvasElement {
  return memo(`col${color}${tall}`, () => {
    const [c, g] = mk(64, tall + 40);
    shadow(g, 34, tall + 30, 30, 8, 0.25);
    rect(g, 4, 0, 56, tall + 34, color);
    rect(g, 4, 0, 8, tall + 34, shade(color, 0.14));
    rect(g, 50, 0, 10, tall + 34, shade(color, -0.16));
    for (let j = 30; j < tall; j += 56) rect(g, 4, j, 56, 1, shade(color, -0.2));
    rect(g, 4, tall + 28, 56, 6, shade(color, -0.35));
    return c;
  });
}

/** loose corridor clutter: "bins" (two black wheelie bins), "copier", "boxes" */
export function clutter(kind: "bins" | "copier" | "boxes" | "pedalbins"): HTMLCanvasElement {
  return memo(`cl${kind}`, () => {
    const [c, g] = mk(96, 96);
    shadow(g, 48, 86, 42, 8, 0.2);
    if (kind === "bins")
      for (const x of [6, 50]) {
        box(g, x, 22, 38, 14, 46, "#2c2d31", "#1d1e21");
        rect(g, x + 2, 18, 34, 5, "#3a3b40");
        rect(g, x + 4, 80, 6, 6, "#101012");
        rect(g, x + 28, 80, 6, 6, "#101012");
      }
    else if (kind === "copier") {
      box(g, 16, 30, 62, 20, 36, "#f4f4f1", "#dcdcd7");
      box(g, 22, 12, 50, 16, 6, "#e9e9e5", "#c9c9c4");
      rect(g, 60, 34, 14, 8, "#2b6fd0");
      rect(g, 20, 60, 54, 2, "#a9a9a4");
      rect(g, 20, 72, 54, 2, "#a9a9a4");
    } else if (kind === "boxes") {
      box(g, 8, 46, 44, 16, 26, "#c9a274", "#b58a5a");
      box(g, 46, 54, 40, 14, 20, "#d2ac7e", "#bb9162");
      box(g, 16, 22, 34, 12, 20, "#cfa878", "#b88d5d");
      rect(g, 28, 46, 4, 16, "#e6d3b0");
      rect(g, 30, 22, 4, 12, "#e6d3b0");
    } else
      for (const [x, col] of [[10, "#6d7175"], [52, "#3f78c8"]] as [number, string][]) {
        cyl(g, x + 16, 34, 15, 5, 46, "#d7d9da", "#B9BCBE");
        rect(g, x + 6, 50, 20, 12, col);
      }
    return c;
  });
}
