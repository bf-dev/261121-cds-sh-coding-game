import { mk, rect, hash, ellipse, text, frame, rng, type Ctx } from "../art/px";
import { drawCrestIn } from "../art/logo";

const OUT = "#2a2433";

function ball(g: Ctx, cx: number, cy: number, rx: number, ry: number, fill: string, line: string | null = OUT): void {
  if (line) ellipse(g, cx, cy, rx + 2, ry + 2, line);
  ellipse(g, cx, cy, rx, ry, fill);
}
function gshadow(g: Ctx, cx: number, cy: number, rx: number, ry: number, a = 0.24): void {
  ellipse(g, cx, cy, rx, ry, `rgba(22,26,44,${a})`);
}
function seg(g: Ctx, x0: number, y0: number, x1: number, y1: number, color: string, w = 2): void {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
  g.fillStyle = color;
  for (let s = 0; s <= n; s++) g.fillRect(Math.round(x0 + ((x1 - x0) * s) / n), Math.round(y0 + ((y1 - y0) * s) / n), w, w);
}

const CANOPY: Record<string, string[]> = {
  cherry: ["#93456b", "#b85a86", "#d6729d", "#e88fb4", "#f2aecb", "#f7c9d9", "#fbe3ec"],
  ginkgo: ["#9c6c18", "#c48a1e", "#e0a82a", "#efc23a", "#f6d55c", "#fbe89a", "#fdf3c4"],
  green: ["#2c5222", "#3c6c2c", "#4f8738", "#66a046", "#7fb856", "#9ccf6a", "#b9e08a"],
};

export function tree(kind: "cherry" | "ginkgo" | "green" | "bare", seed: number): HTMLCanvasElement {
  const [c, g] = mk(160, 208);
  const r = rng(seed * 977 + 13);
  gshadow(g, 66, 194, 54, 11);
  // trunk with a tripod stake on the young ones
  rect(g, 74, 110, 12, 86, "#5a4030");
  rect(g, 74, 110, 4, 86, "#7a5a44");
  rect(g, 83, 110, 3, 86, "#3d2b20");
  if (kind === "bare") {
    for (const [dx, dy] of [[-38, -70], [34, -78], [-20, -96], [18, -100], [-46, -40], [44, -46], [2, -108]]) {
      seg(g, 80, 120, 80 + dx, 120 + dy, "#5a4030", 3);
      seg(g, 80 + dx, 120 + dy, 80 + dx * 1.3 + 6, 120 + dy * 1.2, "#7a5a44", 2);
      seg(g, 80 + dx * 0.6, 120 + dy * 0.6, 80 + dx * 0.6 - 14, 120 + dy * 0.9, "#6a4c3a", 2);
    }
    for (const dx of [-26, 26, 0]) seg(g, 80, 150, 80 + dx, 198 - Math.abs(dx) / 6, "#c9b48a", 3);
    rect(g, 72, 148, 16, 5, "#3a3d40");
    return c;
  }
  const ramp = CANOPY[kind];
  const blobs: [number, number, number, number][] = [];
  for (let i = 0; i < 11; i++) blobs.push([80 + (r() - 0.5) * 84, 66 + (r() - 0.5) * 70, 26 + r() * 16, 22 + r() * 12]);
  blobs.push([80, 70, 46, 40]);
  for (const [x, y, rx, ry] of blobs) ellipse(g, x, y + 3, rx + 3, ry + 3, OUT);
  for (const [x, y, rx, ry] of blobs) ellipse(g, x + 2, y + 5, rx, ry, ramp[0]);
  for (const [x, y, rx, ry] of blobs) ellipse(g, x, y, rx, ry - 3, ramp[2]);
  for (const [x, y, rx, ry] of blobs) ellipse(g, x - 4, y - 6, rx * 0.72, ry * 0.66, ramp[3]);
  for (const [x, y, rx, ry] of blobs) ellipse(g, x - 8, y - 10, rx * 0.42, ry * 0.36, ramp[4]);
  for (const [x, y, rx, ry] of blobs)
    for (let k = 0; k < 16; k++) {
      const a = r() * 6.28, d = r();
      const px = x + Math.cos(a) * rx * d * 0.9, py = y + Math.sin(a) * ry * d * 0.85;
      rect(g, px, py, 4, 3, py < y - 4 ? ramp[5 + ((r() * 2) | 0)] : py > y + 8 ? ramp[1] : ramp[4]);
    }
  if (kind !== "green") for (let k = 0; k < 9; k++) rect(g, 30 + r() * 100, 150 + r() * 46, 4, 3, ramp[4 + ((r() * 2) | 0)]); // fallen petals and leaves
  return c;
}

/** the seated cartoon lion mascot on the lawn (yellow mane, pale green jacket, brown shorts, guy ropes) */
export function lion(): HTMLCanvasElement {
  const [c, g] = mk(260, 270);
  const X = 130;
  gshadow(g, X - 8, 250, 104, 16, 0.26);
  for (const [x1, x2] of [[X - 40, 6], [X + 40, 254], [X - 30, 40], [X + 30, 220]]) seg(g, x1, 96, x2, 262, "#d9dad5", 1);
  ball(g, X - 52, 232, 36, 22, "#f0d06a");
  ball(g, X + 52, 232, 36, 22, "#f0d06a");
  ball(g, X, 214, 64, 30, "#8a6a4f");
  ellipse(g, X - 6, 208, 54, 20, "#9c7a5e");
  rect(g, X - 1, 200, 3, 40, "#6b5039");
  ball(g, X, 172, 66, 56, "#cfe0c3");
  ellipse(g, X + 18, 186, 44, 40, "#b9cdb0");
  ellipse(g, X - 10, 160, 40, 38, "#dbe8d2");
  ellipse(g, X, 176, 24, 50, "#f7f6ee");
  rect(g, X - 3, 138, 6, 54, "#7a5a37");
  ball(g, X - 66, 178, 20, 38, "#cfe0c3");
  ball(g, X + 66, 178, 20, 38, "#b9cdb0");
  ball(g, X - 62, 212, 18, 15, "#f3dfae");
  ball(g, X + 62, 212, 18, 15, "#f3dfae");
  for (const s of [-1, 1]) {
    ellipse(g, X + s * 52, 240, 14, 9, "#f3dfae");
    for (const d of [-14, 0, 14]) ellipse(g, X + s * 52 + d, 224, 5, 4, "#f7ead0");
  }
  // mane: a scalloped halo
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * 6.283;
    ball(g, X + Math.cos(a) * 62, 84 + Math.sin(a) * 58, 17, 17, i % 2 ? "#e8c34a" : "#dcb23c");
  }
  ball(g, X, 84, 62, 58, "#e8c34a");
  ellipse(g, X + 10, 96, 52, 46, "#c99f2f");
  ellipse(g, X - 6, 78, 52, 46, "#f0d06a");
  ball(g, X - 44, 36, 14, 14, "#e8c34a");
  ball(g, X + 44, 36, 14, 14, "#e8c34a");
  ellipse(g, X - 44, 38, 7, 8, "#e8a08a");
  ellipse(g, X + 44, 38, 7, 8, "#e8a08a");
  ball(g, X, 88, 44, 40, "#f6dc8c");
  ellipse(g, X - 8, 80, 32, 28, "#fbe7a6");
  ball(g, X, 106, 25, 17, "#f7ead0", "#b98f4a");
  ellipse(g, X, 97, 10, 7, "#8a5a4a");
  rect(g, X - 1, 104, 2, 8, "#8a5a4a");
  rect(g, X - 9, 112, 18, 2, "#8a5a4a");
  for (const s of [-1, 1]) {
    ellipse(g, X + s * 19, 80, 5, 6, "#2a2433");
    rect(g, X + s * 19 - 3, 76, 3, 3, "#ffffff");
    ellipse(g, X + s * 30, 98, 6, 4, "#f2b0a0");
  }
  return c;
}

/** the three white block letters H K U standing on the grass */
export function hkuLetters(): HTMLCanvasElement {
  const [c, g] = mk(330, 150);
  const S = 18, H = 110, y0 = 16;
  const put = (x: number, y: number, w: number, h: number): void => {
    rect(g, x + 7, y + 5, w, h, "#b9bab3");
    rect(g, x, y, w, h, "#f2f2ee");
    rect(g, x, y, w, 3, "#ffffff");
    rect(g, x + w - 3, y, 3, h, "#dcdcd6");
  };
  gshadow(g, 150, y0 + H + 10, 150, 12, 0.22);
  put(10, y0, S, H); put(64, y0, S, H); put(10, y0 + 46, 72, S); // H
  put(122, y0, S, H);
  for (let i = 0; i < 12; i++) { put(140 + i * 4, y0 + 46 - i * 4, S, 8); put(140 + i * 4, y0 + 56 + i * 4.6, S, 8); } // K
  put(234, y0, S, H - 14); put(290, y0, S, H - 14); put(240, y0 + H - S, 62, S); // U
  for (let x = 4; x < 320; x += 6) if (hash(x, 3, 91) < 0.6) rect(g, x, y0 + H + 2 - ((hash(x, 1, 92) * 5) | 0), 2, 6, "#6f9440");
  return c;
}

/** the white monument slab: crest, SCHOOL OF / COMPUTING & / DATA SCIENCE / The University of Hong Kong */
export function monument(): HTMLCanvasElement {
  const [c, g] = mk(300, 160);
  gshadow(g, 140, 148, 146, 10, 0.24);
  rect(g, 14, 10, 280, 136, "#c9c8c0");
  rect(g, 6, 6, 280, 136, "#eeece6");
  rect(g, 6, 6, 280, 3, "#ffffff");
  rect(g, 6, 136, 280, 6, "#d6d4cc");
  drawCrestIn(g, 18, 28, 70, 90, "#6f6f69"); // the official crest, engraved grey as on the real slab
  text(g, "SCHOOL OF", 94, 30, 22, "#1d1d1b");
  text(g, "COMPUTING &", 94, 54, 22, "#1d1d1b");
  text(g, "DATA SCIENCE", 94, 78, 22, "#1d1d1b");
  text(g, "The University of Hong Kong", 94, 106, 11, "#1d1d1b");
  for (let x = 6; x < 290; x += 5) if (hash(x, 5, 93) < 0.6) rect(g, x, 138 + ((hash(x, 2, 94) * 4) | 0), 2, 7, "#7aa54a");
  return c;
}

/** the red-framed civil defence shelter board with the block plan and the four street names */
export function civilBoard(): HTMLCanvasElement {
  const [c, g] = mk(190, 190);
  gshadow(g, 90, 182, 80, 7, 0.22);
  for (const x of [30, 150]) { rect(g, x, 20, 7, 164, "#9aa0a3"); rect(g, x, 20, 2, 164, "#c9ced0"); }
  rect(g, 4, 6, 182, 120, "#a41712");
  rect(g, 4, 6, 180, 118, "#d8241f");
  rect(g, 10, 30, 168, 88, "#f2f2ee");
  ellipse(g, 20, 18, 7, 7, "#e8c53a");
  ellipse(g, 20, 18, 4, 4, "#d8241f");
  text(g, "民防工程人员掩蔽引导图", 32, 8, 11, "#ffffff");
  text(g, "Civil Defense Personnel Shelter Guidance Map", 32, 20, 6, "#ffe9e6");
  rect(g, 20, 44, 78, 60, "#dfe6ea");
  rect(g, 30, 52, 58, 44, "#a9cfe0");
  frame(g, 30, 52, 58, 44, "#5d7d99", 1);
  rect(g, 52, 70, 6, 6, "#c8362c");
  text(g, "祖冲之路", 59, 35, 7, "#333", { align: "center" });
  text(g, "集电路", 59, 106, 7, "#333", { align: "center" });
  text(g, "集", 12, 60, 7, "#333"); text(g, "创", 12, 68, 7, "#333"); text(g, "路", 12, 76, 7, "#333");
  text(g, "芳", 100, 60, 7, "#333"); text(g, "春", 100, 68, 7, "#333"); text(g, "路", 100, 76, 7, "#333");
  text(g, "北 N", 150, 34, 8, "#c8362c");
  seg(g, 144, 46, 144, 34, "#c8362c", 2);
  for (let i = 0; i < 6; i++) rect(g, 114, 52 + i * 6, 58 - (i % 3) * 8, 2, "#77776f");
  for (let i = 0; i < 4; i++) { rect(g, 114, 92 + i * 6, 5, 4, ["#a9cfe0", "#c8362c", "#e8c53a", "#5d7d99"][i]); rect(g, 122, 93 + i * 6, 40, 2, "#9a9a94"); }
  return c;
}

export function arrowPlate(): HTMLCanvasElement {
  const [c, g] = mk(80, 150);
  gshadow(g, 36, 144, 16, 5);
  rect(g, 37, 30, 5, 114, "#9aa0a3");
  rect(g, 6, 6, 68, 28, "#d8241f");
  text(g, "民防工程", 9, 9, 10, "#fff");
  rect(g, 12, 24, 44, 3, "#fff");
  rect(g, 54, 21, 4, 9, "#fff"); rect(g, 58, 23, 4, 5, "#fff");
  return c;
}

/** a delivery locker wall. mt = yellow Meituan, tb = white and red Taobao. Doors are numbered in columns of 7 up to 125. */
export function lockers(kind: "mt" | "tb", bays = 6): HTMLCanvasElement {
  const BW = 92, W = bays * BW + 16, H = 212;
  const [c, g] = mk(W, H);
  const mt = kind === "mt";
  const F = mt ? ["#f7d453", "#f2c230", "#c39a1c", "#8f6f10"] : ["#ffffff", "#f6f2ee", "#cfcbc4", "#9a968f"];
  gshadow(g, W / 2 - 6, H - 8, W / 2, 8, 0.25);
  rect(g, 0, 0, W, 16, F[0]); // roof canopy
  rect(g, 0, 12, W, 4, F[2]);
  rect(g, 6, 16, W - 12, H - 30, F[1]);
  let n = 0;
  for (let b = 0; b < bays; b++) {
    const x = 8 + b * BW;
    rect(g, x, 16, BW, H - 30, F[1]);
    rect(g, x + BW - 3, 16, 3, H - 30, F[2]);
    rect(g, x, 16, 2, H - 30, F[0]);
    // pelmet: logo, name, 扫码 存取, QR
    rect(g, x + 4, 20, BW - 10, 22, mt ? "#f7d453" : "#c8102e");
    if (!mt) rect(g, x + 4, 38, BW - 10, 4, "#f0a0b0");
    frame(g, x + 7, 24, 13, 13, mt ? "#3a2a12" : "#fff", 2);
    text(g, mt ? "美团外卖柜" : "淘宝闪购", x + 23, 24, 10, mt ? "#3a2a12" : "#ffffff");
    for (let q = 0; q < 16; q++) rect(g, x + BW - 20 + (q % 4) * 3, 25 + ((q / 4) | 0) * 3, 3, 3, hash(q, b, 95) < 0.5 ? "#222" : "#fff");
    for (let col = 0; col < 3; col++)
      for (let row = 0; row < 7; row++) {
        const dx = x + 5 + col * 27, dy = 46 + row * 21;
        rect(g, dx, dy, 25, 19, mt ? "#f2f1ec" : "#e9ecec");
        rect(g, dx, dy + 17, 25, 2, "#c9c8c0");
        if (b === 0 && col === 1 && row === 1) { rect(g, dx + 2, dy + 2, 21, 14, "#1d2a33"); rect(g, dx + 4, dy + 4, 17, 8, "#5d9fb8"); continue; }
        n++;
        rect(g, dx + 4, dy + 3, 17, 13, mt ? (hash(n, 1, 96) < 0.25 ? "#c9a36a" : "#b0894f") : hash(n, 1, 97) < 0.3 ? "#9fb9c4" : "#b9c6c8");
        rect(g, dx + 4, dy + 3, 17, 1, mt ? "#8a6a3a" : "#8fa0a8");
        text(g, String(n), dx + 12.5, dy + 5, 9, mt ? "#3a2a12" : "#3d4852", { align: "center" });
      }
    rect(g, x + 2, H - 14, 8, 10, F[2]);
    rect(g, x + BW - 12, H - 14, 8, 10, F[2]);
  }
  rect(g, 6, H - 16, W - 12, 3, F[3]);
  rect(g, 4, 6, 10, 8, "#e9ecec"); // CCTV dome on the frame corner
  ellipse(g, 9, 15, 5, 4, "#2a2d2e");
  return c;
}

/** bay length along the wall and cabinet height (px) of the north-south locker walls */
export const LOCKER_V = { bay: 62, lift: 88, w: 144 };

/**
 * A locker wall running north to south with its doors facing west (toward CDS1), as it stands on
 * the east side of the service road. Seen in the 3/4 view: the long roof, the steeply foreshortened
 * door face on its west side, and the south end panel with the logo.
 */
export function lockersV(kind: "mt" | "tb", bays = 6): HTMLCanvasElement {
  const { bay: BL, lift: LIFT, w: W } = LOCKER_V;
  const LEN = bays * BL + 12;
  const [c, g] = mk(W, LEN + LIFT);
  const mt = kind === "mt";
  const F = mt ? ["#f9dc6a", "#f2c230", "#c39a1c", "#8f6f10"] : ["#ffffff", "#f1ede8", "#cfcbc4", "#9a968f"];
  const FX = 12, FW = 58, RX = FX + FW, RW = W - RX - 6; // door face band, then the roof
  // ground shadow west of the doors and under the south end
  g.fillStyle = "rgba(22,26,44,0.22)";
  g.fillRect(0, LIFT + 6, FX + 4, LEN - 6);
  g.fillRect(FX, LEN + LIFT - 8, W - FX - 2, 8);
  // door face (west side), drawn flat then sheared: its ground edge is on the left and sits LIFT px
  // lower than its top edge, which meets the roof on the right
  const [fc, f] = mk(FW, LEN);
  rect(f, 0, 0, FW, LEN, F[2]);
  let n = 0;
  for (let b = 0; b < bays; b++) {
    const y0 = 6 + b * BL;
    rect(f, 0, y0 - 3, FW, 3, F[3]); // bay joint
    rect(f, FW - 9, y0, 9, BL - 3, mt ? "#f7d453" : "#c8102e"); // pelmet strip
    rect(f, FW - 8, y0 + 4, 6, 6, mt ? "#3a2a12" : "#ffffff");
    for (let q = 0; q < 6; q++) rect(f, FW - 8 + (q % 2) * 3, y0 + BL - 16 + ((q / 2) | 0) * 3, 3, 3, hash(q, b, 95) < 0.5 ? "#222" : "#fff");
    for (let col = 0; col < 3; col++)
      for (let row = 0; row < 7; row++) {
        n++;
        const dy = y0 + 1 + col * 19, dx = Math.round(FW - 16 - row * 6.6);
        const screen = b === 0 && col === 1 && row === 1;
        rect(f, dx, dy, 5, 17, screen ? "#5d9fb8" : mt ? (hash(n, 1, 96) < 0.25 ? "#d0aa70" : "#b8915a") : hash(n, 1, 97) < 0.3 ? "#9fb9c4" : "#c3cfd1");
        rect(f, dx, dy, 5, 1, mt ? "#f2f1ec" : "#eef1f1");
      }
  }
  rect(f, 0, 0, 2, LEN, F[3]); // plinth line at the ground
  rect(f, 0, LEN - 3, FW, 3, F[3]);
  for (let x = 0; x < FW; x += 2) g.drawImage(fc, x, 0, 2, LEN, FX + x, Math.round(LIFT * (1 - (x + 2) / FW)), 2, LEN);
  // roof: long slab, lit west edge, bay seams
  rect(g, RX, 0, RW, LEN, F[1]);
  rect(g, RX, 0, 4, LEN, F[0]);
  rect(g, RX + RW - 5, 0, 5, LEN, F[2]);
  rect(g, RX, 0, RW, 3, F[0]);
  for (let b = 1; b < bays; b++) rect(g, RX + 4, 6 + b * BL - 1, RW - 9, 2, F[2]);
  for (let y = 4; y < LEN - 4; y += 2) for (let x = RX + 6; x < RX + RW - 6; x += 2) if (hash(x, y, 98) < 0.05) rect(g, x, y, 2, 2, F[0]);
  if (!mt) rect(g, RX + 10, 0, 8, LEN, "#c8102e");
  rect(g, RX - 6, 8, 12, 9, "#e9ecec"); // CCTV dome over the first bay
  ellipse(g, RX, 19, 5, 4, "#2a2d2e");
  // south end panel with the logo
  rect(g, RX - 2, LEN, RW + 2, LIFT - 6, F[1]);
  rect(g, RX - 2, LEN, RW + 2, 4, F[2]);
  rect(g, RX - 2, LEN, 3, LIFT - 6, F[0]);
  rect(g, RX + RW - 5, LEN, 5, LIFT - 6, F[2]);
  rect(g, RX - 2, LEN + LIFT - 12, RW + 2, 6, F[3]);
  if (mt) {
    rect(g, RX + 8, LEN + 14, 22, 22, "#3a2a12");
    rect(g, RX + 12, LEN + 18, 14, 14, "#f7d453");
    text(g, "美团", RX + 34, LEN + 15, 17, "#3a2a12");
    text(g, "外卖柜", RX + 9, LEN + 42, 16, "#3a2a12");
  } else {
    rect(g, RX + 2, LEN + 10, RW - 8, 26, "#c8102e");
    text(g, "淘宝", RX + RW / 2 - 2, LEN + 14, 17, "#ffffff", { align: "center" });
    text(g, "闪购柜", RX + RW / 2 - 2, LEN + 42, 16, "#c8102e", { align: "center" });
  }
  return c;
}

export function booth(): HTMLCanvasElement {
  const [c, g] = mk(170, 210);
  gshadow(g, 78, 198, 80, 10, 0.26);
  rect(g, 6, 184, 158, 16, "#cfd0ce"); rect(g, 6, 184, 158, 3, "#eeeeea");
  rect(g, 14, 10, 142, 16, "#3a3d3e"); rect(g, 14, 10, 142, 3, "#55585a");
  rect(g, 20, 26, 130, 160, "#2a2d2e");
  rect(g, 20, 150, 130, 36, "#e6e6e2"); rect(g, 20, 150, 130, 3, "#ffffff"); rect(g, 20, 180, 130, 6, "#a9aaa4");
  for (const x of [28, 88]) { rect(g, x, 36, 54, 108, "#5d7d99"); rect(g, x + 4, 40, 18, 100, "#86a5bf"); rect(g, x, 88, 54, 3, "#2a2d2e"); }
  rect(g, 46, 70, 18, 22, "#2d3350"); ellipse(g, 55, 62, 8, 9, "#e8b990"); rect(g, 46, 52, 18, 5, "#1f2540");
  return c;
}

export function boom(): HTMLCanvasElement {
  const [c, g] = mk(300, 80);
  gshadow(g, 26, 72, 24, 6);
  rect(g, 10, 20, 30, 54, "#e6e6e2"); rect(g, 10, 20, 30, 4, "#fff"); rect(g, 34, 20, 6, 54, "#a9aaa4"); rect(g, 14, 30, 12, 8, "#222");
  for (let i = 0; i < 13; i++) rect(g, 40 + i * 20, 30, 20, 9, i % 2 ? "#eeeee8" : "#c8362c");
  rect(g, 40, 39, 260, 2, "#8e0a20");
  return c;
}

/** low curved white concrete bench with a timber seat insert */
export function bench(): HTMLCanvasElement {
  const [c, g] = mk(170, 62);
  gshadow(g, 82, 52, 82, 8, 0.22);
  for (let x = 0; x < 164; x += 2) {
    const y = Math.round(10 + Math.sin(x / 26) * 6);
    rect(g, x + 2, y, 2, 22, "#e6e6e2");
    rect(g, x + 2, y, 2, 2, "#ffffff");
    rect(g, x + 2, y + 22, 2, 16, "#cfd0ce");
    rect(g, x + 2, y + 36, 2, 3, "#a9aaa4");
    if (x > 16 && x < 148) { rect(g, x + 2, y + 5, 2, 12, (x >> 3) % 4 ? "#b58a5c" : "#a9835a"); rect(g, x + 2, y + 16, 2, 2, "#7a5a37"); }
  }
  return c;
}

/** black steel planter box with ferns and grasses */
export function planter(seed: number): HTMLCanvasElement {
  const [c, g] = mk(96, 110);
  const r = rng(seed * 31 + 7);
  gshadow(g, 44, 100, 46, 8, 0.26);
  rect(g, 8, 52, 80, 50, "#26282a"); rect(g, 8, 52, 80, 10, "#3a3d40"); rect(g, 8, 52, 80, 2, "#55585a"); rect(g, 78, 62, 10, 40, "#1a1c1e");
  const cols = ["#33481f", "#4c6b34", "#5f8a3e", "#7aa54a", "#9bc95f"];
  for (let i = 0; i < 34; i++) {
    const x0 = 14 + r() * 68, lean = (r() - 0.5) * 34, h = 22 + r() * 34;
    seg(g, x0, 58, x0 + lean, 58 - h, cols[(r() * 5) | 0], r() < 0.5 ? 3 : 2);
  }
  return c;
}

export function shrub(seed: number): HTMLCanvasElement {
  const [c, g] = mk(72, 60);
  gshadow(g, 34, 52, 32, 6, 0.22);
  ellipse(g, 36, 32, 32, 24, "#33481f");
  ellipse(g, 35, 29, 30, 21, hash(seed, 1, 98) < 0.3 ? "#9fb08f" : "#4c6b34");
  ellipse(g, 30, 24, 22, 14, hash(seed, 1, 98) < 0.3 ? "#b9c7a9" : "#5f7f3e");
  for (let i = 0; i < 40; i++) rect(g, 10 + hash(i, seed, 99) * 50, 12 + hash(seed, i, 100) * 30, 3, 2, hash(i, seed, 101) < 0.5 ? "#7c9c52" : "#3f5a2a");
  return c;
}

export function lamp(): HTMLCanvasElement {
  const [c, g] = mk(48, 220);
  gshadow(g, 22, 212, 14, 5);
  rect(g, 20, 20, 6, 194, "#3a3d40"); rect(g, 20, 20, 2, 194, "#6a6f73"); rect(g, 16, 204, 14, 10, "#2a2d2e");
  rect(g, 8, 8, 30, 12, "#2a2d2e"); rect(g, 10, 18, 26, 4, "#fff3c4");
  rect(g, 26, 60, 12, 6, "#3a3d40"); rect(g, 34, 58, 8, 10, "#e6e6e2"); // CCTV
  return c;
}

export function bike(color: string): HTMLCanvasElement {
  const [c, g] = mk(92, 64);
  gshadow(g, 44, 58, 40, 5);
  for (const x of [20, 70]) { ellipse(g, x, 42, 16, 16, "#26282a"); ellipse(g, x, 42, 12, 12, "#9aa0a3"); ellipse(g, x, 42, 10, 10, "#c4c8cc"); ellipse(g, x, 42, 3, 3, "#26282a"); }
  seg(g, 20, 42, 40, 22, color, 4); seg(g, 40, 22, 62, 22, color, 4); seg(g, 62, 22, 70, 42, color, 4); seg(g, 40, 22, 46, 42, color, 4); seg(g, 20, 42, 46, 42, color, 3);
  rect(g, 34, 14, 14, 5, "#26282a"); rect(g, 58, 8, 4, 16, "#6a6f73"); rect(g, 54, 6, 14, 4, "#26282a"); rect(g, 64, 12, 14, 10, color);
  return c;
}

export function pylon5(): HTMLCanvasElement {
  const [c, g] = mk(52, 160);
  gshadow(g, 22, 152, 20, 5);
  rect(g, 10, 8, 30, 144, "#eceae4"); rect(g, 36, 8, 4, 144, "#c9c7c0");
  rect(g, 10, 8, 30, 72, "#1f2224"); rect(g, 36, 8, 4, 72, "#111315");
  text(g, "5", 24, 14, 44, "#ffffff", { align: "center" });
  text(g, "5F", 24, 88, 12, "#1f2224", { align: "center" });
  text(g, "1F", 24, 110, 12, "#1f2224", { align: "center" });
  rect(g, 14, 104, 20, 1, "#9a9a94");
  return c;
}

export function roadSign(): HTMLCanvasElement {
  const [c, g] = mk(150, 250);
  gshadow(g, 20, 244, 14, 5);
  rect(g, 16, 10, 7, 236, "#6a6f73"); rect(g, 16, 10, 2, 236, "#9aa0a3");
  rect(g, 22, 18, 124, 74, "#1d5fb0"); frame(g, 24, 20, 120, 70, "#ffffff", 2);
  text(g, "银冬路", 32, 26, 18, "#fff"); text(g, "Yindong Rd.", 32, 46, 9, "#fff");
  rect(g, 44, 58, 4, 16, "#fff"); rect(g, 40, 62, 12, 3, "#fff"); rect(g, 42, 59, 8, 3, "#fff");
  text(g, "集电路", 60, 62, 18, "#fff"); text(g, "Jidian Rd.", 100, 80, 7, "#fff");
  return c;
}

export function bollard(): HTMLCanvasElement {
  const [c, g] = mk(28, 54);
  gshadow(g, 12, 48, 12, 4);
  rect(g, 6, 8, 16, 40, "#b9b7ad"); rect(g, 6, 8, 4, 40, "#d6d4ca"); rect(g, 18, 8, 4, 40, "#8f8d84"); rect(g, 6, 6, 16, 4, "#d6d4ca");
  return c;
}

export function bin(): HTMLCanvasElement {
  const [c, g] = mk(70, 84);
  gshadow(g, 32, 78, 30, 5);
  rect(g, 6, 12, 58, 64, "#9aa0a3"); rect(g, 6, 12, 58, 6, "#c9ced0"); rect(g, 56, 18, 8, 58, "#7d8388"); rect(g, 34, 18, 2, 58, "#6a6f73");
  rect(g, 12, 24, 16, 8, "#26282a"); rect(g, 42, 24, 16, 8, "#26282a"); rect(g, 14, 40, 12, 10, "#3f7fb8"); rect(g, 44, 40, 12, 10, "#6a8f3e");
  return c;
}

export function car(): HTMLCanvasElement {
  const [c, g] = mk(128, 190);
  gshadow(g, 58, 178, 56, 10, 0.28);
  rect(g, 14, 20, 100, 156, "#2a2433"); rect(g, 16, 22, 96, 152, "#eeeeea");
  rect(g, 16, 22, 96, 30, "#f8f8f4"); rect(g, 22, 54, 84, 30, "#3e566e"); rect(g, 26, 58, 30, 22, "#6f8fab");
  rect(g, 22, 84, 84, 50, "#f8f8f4"); rect(g, 22, 134, 84, 18, "#33475b"); rect(g, 16, 152, 96, 22, "#dcdcd6");
  rect(g, 20, 166, 20, 6, "#c8362c"); rect(g, 88, 166, 20, 6, "#c8362c"); rect(g, 44, 164, 40, 9, "#1d5fb0");
  rect(g, 8, 60, 8, 10, "#dcdcd6"); rect(g, 112, 60, 8, 10, "#dcdcd6");
  return c;
}
