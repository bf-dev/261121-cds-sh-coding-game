// Floor-specific CDS-1 props: turnstiles, booths, exhibition drums, bleachers, lab kit, fridges.
import { mk, rect, frame, ellipse, shade, hash, shadow, text, textWidth } from "../art/px";
import { box, cyl } from "./cds1-props";

const cache = new Map<string, HTMLCanvasElement>();
function memo(key: string, make: () => HTMLCanvasElement): HTMLCanvasElement {
  let c = cache.get(key);
  if (!c) cache.set(key, (c = make()));
  return c;
}

/** one turnstile lane (1 tile): two stainless pedestals, glass flaps, face terminal. open = flaps swung away */
export function turnstile(open: boolean): HTMLCanvasElement {
  return memo(`ts${open}`, () => {
    const [c, g] = mk(64, 112);
    shadow(g, 32, 102, 30, 7, 0.2);
    for (const x of [0, 52]) {
      box(g, x, 40, 12, 26, 38, "#d9dbdc", "#B9BCBE");
      rect(g, x + 2, 44, 8, 3, open ? "#3fd07a" : "#e0483c");
    }
    if (!open) {
      rect(g, 12, 52, 18, 30, "rgba(170,215,235,0.75)");
      rect(g, 34, 52, 18, 30, "rgba(170,215,235,0.75)");
      rect(g, 12, 52, 18, 2, "#eaf7fc");
      rect(g, 34, 52, 18, 2, "#eaf7fc");
    } else {
      rect(g, 12, 44, 4, 36, "rgba(170,215,235,0.75)");
      rect(g, 48, 44, 4, 36, "rgba(170,215,235,0.75)");
    }
    // face-recognition terminal on a stalk
    rect(g, 55, 14, 3, 28, "#8d9092");
    rect(g, 48, 0, 16, 22, "#1b1c20");
    rect(g, 50, 2, 12, 16, open ? "#5fd0a0" : "#6fa8e8");
    rect(g, 54, 6, 4, 5, "#f1d2b4");
    return c;
  });
}

/** dark green high-back booth pod with beige bench and a small oak table (2 tiles) */
export function booth(): HTMLCanvasElement {
  return memo("booth", () => {
    const [c, g] = mk(128, 150);
    shadow(g, 64, 140, 60, 9, 0.22);
    const gr = "#4C5A48";
    rect(g, 2, 4, 124, 96, gr);
    rect(g, 2, 4, 124, 3, shade(gr, 0.25));
    rect(g, 2, 4, 14, 136, shade(gr, 0.1));
    rect(g, 112, 4, 14, 136, shade(gr, -0.15));
    for (let i = 20; i < 110; i += 30) rect(g, i, 8, 1, 90, shade(gr, -0.14));
    rect(g, 16, 70, 96, 30, "#D8CDB8"); // back cushion
    rect(g, 16, 70, 96, 2, "#ece4d2");
    rect(g, 64, 72, 1, 28, "#b9ae98");
    rect(g, 16, 100, 96, 22, "#e2d8c4"); // seat
    rect(g, 16, 122, 96, 16, "#b9ae98");
    rect(g, 62, 104, 4, 30, "#1f1f1f");
    box(g, 40, 92, 48, 14, 4, "#e0c08c", "#b99560");
    return c;
  });
}

/** round timber-clad service core (3 tiles wide) the 13/F corridor curves around */
export function core(color = "#C4A070"): HTMLCanvasElement {
  return memo(`core${color}`, () => {
    const [c, g] = mk(192, 250);
    shadow(g, 96, 226, 94, 20, 0.25);
    cyl(g, 96, 22, 92, 20, 200, shade(color, 0.12), color);
    for (let i = 8; i < 184; i += 12) rect(g, i, 26, 1, 196, shade(color, -0.12));
    rect(g, 70, 96, 52, 130, shade(color, -0.2));
    rect(g, 74, 100, 44, 126, shade(color, -0.05));
    rect(g, 110, 160, 3, 12, "#55585a");
    return c;
  });
}

/** exhibition drum wrapped in printed panels with a dark band of text */
export function drum(band: string, title: string, years: string[]): HTMLCanvasElement {
  return memo(`drum${band}${title}`, () => {
    const [c, g] = mk(160, 230);
    shadow(g, 80, 212, 78, 14, 0.25);
    cyl(g, 80, 16, 74, 14, 190, "#d9b98c", "#f3efe6");
    rect(g, 6, 16, 148, 12, "#B98D5E");
    rect(g, 6, 196, 148, 10, "#B98D5E");
    rect(g, 6, 92, 148, 26, band);
    text(g, title, 80, 98, 12, "#ffffff", { align: "center", maxWidth: 136 });
    years.forEach((y, i) => {
      const x = 16 + (i % 4) * 34;
      const yy = i < 4 ? 40 : 130;
      rect(g, x, yy, 24, 18, ["#8a8f96", "#b9a58a", "#6f7f8f", "#a8b3ba"][i % 4]);
      rect(g, x + 2, yy + 2, 20, 8, "#d9dde0");
      text(g, y, x + 12, yy + 22, 9, "#3a3a3a", { align: "center" });
      rect(g, x + 2, yy + 36, 20, 1, "#9a9a9a");
      rect(g, x + 2, yy + 40, 14, 1, "#9a9a9a");
    });
    return c;
  });
}

/** stepped seating block (1 tile) in slate blue or red */
export function stepSeat(color = "#46536B", h = 28): HTMLCanvasElement {
  return memo(`step${color}${h}`, () => {
    const [c, g] = mk(64, 40 + h);
    shadow(g, 32, 34 + h, 30, 5, 0.2);
    box(g, 2, 2, 60, 34, h, shade(color, 0.14), color);
    return c;
  });
}

/** raw concrete planter with green planting (w tiles) */
export function planter(w: number, seed = 1): HTMLCanvasElement {
  return memo(`planter${w}${seed}`, () => {
    const W = w * 64;
    const [c, g] = mk(W, 96);
    shadow(g, W / 2, 88, W / 2 - 4, 7, 0.2);
    box(g, 4, 34, W - 8, 22, 30, "#5a4a38", "#B9B4A8");
    for (let i = 6; i < W - 12; i += 6) {
      const hh = 14 + Math.floor(hash(i, seed, 95) * 30);
      const col = ["#3f8449", "#56a05a", "#2f6b3c", "#7fb86a"][Math.floor(hash(i, seed, 96) * 4)];
      rect(g, i, 54 - hh, 6, hh, col);
      rect(g, i + 1, 54 - hh, 2, 4, shade(col, 0.3));
    }
    return c;
  });
}

/** timber bleacher steps, w x d tiles, rising toward the back */
export function bleachers(w: number, d: number): HTMLCanvasElement {
  return memo(`bleach${w}${d}`, () => {
    const W = w * 64;
    const [c, g] = mk(W, d * 64 + 40);
    const oak = "#C9A879";
    const steps = d * 2;
    for (let s = 0; s < steps; s++) {
      const y = 40 + s * 32 - (steps - s) * 6;
      const inset = (steps - 1 - s) * 0;
      box(g, inset, y, W - inset, 22, 16 + (steps - s) * 2, shade(oak, 0.1 - s * 0.01), shade(oak, -0.12));
      for (let i = 0; i < W; i += 48) rect(g, i + ((s * 20) % 48), y, 1, 22, shade(oak, -0.1));
      if (s % 2 === 0) for (let i = 30 + s * 14; i < W - 40; i += 110) box(g, i, y + 3, 34, 12, 4, ["#3E4A63", "#cfc6b4", "#9E3A32"][(i + s) % 3], "#2a3142");
    }
    return c;
  });
}

/** lab bench with two monitors (2 tiles) or a server rack (1 tile) */
export function labBench(seed = 0): HTMLCanvasElement {
  return memo(`bench${seed}`, () => {
    const [c, g] = mk(128, 112);
    shadow(g, 64, 102, 60, 8, 0.2);
    box(g, 2, 40, 124, 28, 34, "#f1efe9", "#cfcbc0");
    rect(g, 10, 72, 3, 30, "#8d9092");
    rect(g, 115, 72, 3, 30, "#8d9092");
    for (const [x, col] of [[14, "#3fd08a"], [70, "#4f9be8"]] as [number, string][]) {
      rect(g, x + 18, 34, 6, 10, "#2a2a2e");
      rect(g, x, 4, 44, 32, "#16181c");
      rect(g, x + 3, 7, 38, 24, "#0f1a2a");
      for (let j = 0; j < 5; j++) rect(g, x + 6, 10 + j * 4, 8 + Math.floor(hash(x, j, 97 + seed) * 24), 2, j % 2 ? col : "#d9e6f2");
      rect(g, x + 6, 50, 30, 8, "#2a2a2e");
    }
    return c;
  });
}

export function serverRack(): HTMLCanvasElement {
  return memo("rack", () => {
    const [c, g] = mk(64, 160);
    shadow(g, 32, 150, 30, 7, 0.25);
    box(g, 4, 4, 56, 18, 126, "#2b2e36", "#1c1e24");
    for (let j = 0; j < 11; j++) {
      rect(g, 8, 28 + j * 11, 48, 7, "#2d313a");
      for (let i = 0; i < 6; i++) rect(g, 12 + i * 7, 30 + j * 11, 2, 2, hash(i, j, 98) < 0.6 ? "#3fe08a" : hash(i, j, 99) < 0.5 ? "#4fb0ff" : "#f0b23c");
    }
    return c;
  });
}

/** glass-front drink fridge (1 tile); red header = cola */
export function fridge(header = "#c8242b"): HTMLCanvasElement {
  return memo(`fridge${header}`, () => {
    const [c, g] = mk(64, 160);
    shadow(g, 32, 152, 30, 6, 0.25);
    box(g, 2, 2, 60, 12, 138, "#3a3c42", "#26282d");
    rect(g, 6, 16, 52, 20, header);
    text(g, header === "#c8242b" ? "Cola" : "饮料", 32, 19, 12, "#ffffff", { align: "center" });
    rect(g, 6, 40, 52, 104, "#cfe6ee");
    for (let j = 0; j < 4; j++) {
      rect(g, 6, 62 + j * 26, 52, 2, "#9fb3ba");
      for (let i = 0; i < 6; i++) rect(g, 9 + i * 8, 46 + j * 26, 6, 16, ["#c8242b", "#2f6fd0", "#f0b23c", "#2fa86a", "#1b1b1b"][(i + j * 2) % 5]);
    }
    rect(g, 10, 42, 5, 98, "rgba(255,255,255,0.45)");
    frame(g, 6, 40, 52, 104, "#16181c", 2);
    return c;
  });
}

/** white beanbag pod */
export function beanbag(color = "#f1efe9"): HTMLCanvasElement {
  return memo(`bean${color}`, () => {
    const [c, g] = mk(64, 60);
    shadow(g, 32, 50, 30, 7, 0.2);
    ellipse(g, 32, 34, 28, 18, shade(color, -0.2));
    ellipse(g, 32, 30, 27, 17, color);
    ellipse(g, 30, 22, 16, 9, shade(color, -0.08));
    ellipse(g, 26, 20, 8, 3, "#ffffff");
    return c;
  });
}

/** low reception desk: straight (lobby) or curved pale timber with the school name (14/F). w tiles */
export function desk(w: number, body = "#D2BE9E", top = "#efe9dc", line1 = "", line2 = ""): HTMLCanvasElement {
  return memo(`desk${w}${body}${line1}`, () => {
    const W = w * 64;
    const [c, g] = mk(W, 110);
    shadow(g, W / 2, 100, W / 2 - 6, 9, 0.2);
    for (let i = 0; i < W - 8; i += 4) {
      const t = (i - (W - 8) / 2) / ((W - 8) / 2);
      const yy = 30 - Math.round((1 - t * t) * 22) + 22;
      rect(g, 4 + i, yy - 22, 4, 24, top);
      rect(g, 4 + i, yy - 22, 4, 2, "#ffffff");
      rect(g, 4 + i, yy + 2, 4, 50, shade(body, -Math.abs(t) * 0.12));
      rect(g, 4 + i, yy + 2, 4, 2, shade(body, -0.2));
      rect(g, 4 + i, yy + 50, 4, 2, shade(body, -0.3));
      if (i % 40 === 0) rect(g, 4 + i, yy + 4, 1, 46, shade(body, -0.14));
    }
    // the face is tallest in the middle of the curve, so the lettering stays in the middle half:
    // line1 may hold "\n" for a second row, and the size shrinks until the widest row fits
    const rows = line1 ? line1.split("\n") : [];
    const fit = W * 0.5;
    let size = 12;
    while (size > 7 && rows.some((r) => textWidth(g, r, size) > fit)) size--;
    const total = rows.length * (size + 2) + (line2 ? 11 : 0);
    let y = Math.round(60 - total / 2);
    for (const r of rows) {
      text(g, r, W / 2, y, size, "#1f1f1f", { align: "center" });
      y += size + 2;
    }
    if (line2) text(g, line2, W / 2, y + 2, 9, "#1f1f1f", { align: "center", bold: false, maxWidth: fit });
    return c;
  });
}
