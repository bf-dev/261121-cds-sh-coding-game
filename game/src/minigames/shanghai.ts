// The Shanghai discovery board at the campus gate: match a clue to an illustrated postcard.
// Optional mini-game (docs/visitor-journey-story.md). The scenes are drawn in code as simple
// illustrations. They are not maps and not drawn from photos.

import { h, sleep } from "../ui/dom";
import { miniFrame, pyBox } from "./snake";

export interface ShanghaiPostcard {
  id: string;
  title: string;
  zh: string;
  fact: string;
}

export const SHANGHAI_POSTCARDS: ShanghaiPostcard[] = [
  { id: "sh-bund", title: "The Bund", zh: "外滩", fact: "The Bund is the riverside promenade along the Huangpu River, lined with historic buildings that face the Pudong skyline." },
  { id: "sh-yu", title: "Yu Garden", zh: "豫园", fact: "Yu Garden is a classical Chinese garden in Shanghai's old city, first laid out in the Ming dynasty." },
  { id: "sh-pearl", title: "Oriental Pearl Tower", zh: "东方明珠", fact: "The Oriental Pearl Tower is a TV tower in Lujiazui, Pudong, known for its pink spheres. It opened in the 1990s." },
  { id: "sh-zhangjiang", title: "Zhangjiang", zh: "张江", fact: "Zhangjiang is the science and technology district of Pudong. The HKU Zhangjiang Base is here, at No. 500 Fangchun Road." },
];

const W = 320;
const H = 200;
type G = CanvasRenderingContext2D;
const box = (g: G, c: string, x: number, y: number, w: number, hh: number): void => {
  g.fillStyle = c;
  g.fillRect(x, y, w, hh);
};
const disc = (g: G, c: string, x: number, y: number, r: number): void => {
  g.fillStyle = c;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
};
const poly = (g: G, c: string, pts: number[]): void => {
  g.fillStyle = c;
  g.beginPath();
  g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.closePath();
  g.fill();
};
function windows(g: G, x: number, y: number, w: number, hh: number, lit: string, dark: string, step = 8): void {
  for (let yy = y; yy < y + hh - 4; yy += step) for (let xx = x; xx < x + w - 3; xx += step) box(g, (xx * 7 + yy * 3) % 5 < 2 ? lit : dark, xx, yy, 4, 5);
}

const SCENES: Record<string, (g: G) => void> = {
  // dusk on the promenade: stone buildings, a green pyramid roof, a clock tower, the river in front
  "sh-bund": (g) => {
    box(g, "#f6b58c", 0, 0, W, 40);
    box(g, "#f9cfa4", 0, 40, W, 30);
    box(g, "#fde3bd", 0, 70, W, 40);
    disc(g, "#fff3c4", 262, 34, 16);
    const stone = ["#d9c7a3", "#cdb892", "#e2d2b0", "#c9b48c", "#d9c7a3", "#cdb892"];
    const xs = [0, 46, 104, 150, 212, 262, 320];
    const tops = [84, 70, 90, 62, 80, 74];
    for (let i = 0; i < 6; i++) {
      box(g, stone[i], xs[i], tops[i], xs[i + 1] - xs[i] - 2, 142 - tops[i]);
      box(g, "#8a7355", xs[i], tops[i], xs[i + 1] - xs[i] - 2, 3);
      windows(g, xs[i] + 5, tops[i] + 9, xs[i + 1] - xs[i] - 10, 138 - tops[i] - 9, "#ffe9a3", "#7a5a3c");
    }
    // green pyramid roof
    poly(g, "#3f8f6a", [52, 70, 75, 34, 98, 70]);
    box(g, "#2f6f52", 73, 26, 4, 10);
    // clock tower
    box(g, "#e2d2b0", 168, 28, 26, 36);
    box(g, "#8a7355", 164, 24, 34, 5);
    poly(g, "#8a7355", [170, 24, 181, 8, 192, 24]);
    disc(g, "#6d4433", 181, 44, 10);
    disc(g, "#fffdf6", 181, 44, 8);
    box(g, "#4a3128", 180, 38, 2, 7);
    box(g, "#4a3128", 180, 43, 6, 2);
    // promenade and railing
    box(g, "#bfae98", 0, 142, W, 14);
    for (let x = 4; x < W; x += 12) box(g, "#6d4433", x, 138, 2, 8);
    box(g, "#6d4433", 0, 138, W, 2);
    for (const x of [40, 120, 200, 280]) {
      box(g, "#4a3128", x, 122, 2, 20);
      disc(g, "#fff3c4", x + 1, 120, 4);
    }
    // the Huangpu
    box(g, "#6fa8dc", 0, 156, W, 44);
    for (let i = 0; i < 26; i++) box(g, i % 3 ? "#9cc4ea" : "#ffe9a3", (i * 53) % W, 160 + ((i * 17) % 36), 14, 2);
    box(g, "#4a3128", 96, 172, 44, 6);
    box(g, "#fffdf6", 106, 164, 22, 8);
  },
  // a pavilion with upturned eaves, a pond, a zigzag bridge, red lanterns
  "sh-yu": (g) => {
    box(g, "#cfe8ff", 0, 0, W, 90);
    disc(g, "#fff", 60, 26, 14);
    disc(g, "#fff", 78, 30, 11);
    // white garden wall with dark tiles
    box(g, "#f6f1e4", 0, 78, W, 34);
    box(g, "#4a4a55", 0, 74, W, 6);
    for (let x = 0; x < W; x += 10) box(g, "#33333d", x, 74, 5, 6);
    // willows
    for (const [x, y] of [[26, 70], [296, 66]]) {
      box(g, "#6d4433", x - 2, y, 5, 46);
      disc(g, "#7fbf6a", x, y - 4, 24);
      disc(g, "#9fd486", x - 12, y + 8, 14);
      disc(g, "#9fd486", x + 12, y + 10, 14);
    }
    // pavilion: two tiers
    const roof = (cx: number, y: number, half: number) => {
      poly(g, "#4a4a55", [cx - half, y + 14, cx - half - 12, y + 4, cx - half + 6, y + 8, cx - 12, y - 8, cx + 12, y - 8, cx + half - 6, y + 8, cx + half + 12, y + 4, cx + half, y + 14]);
      box(g, "#33333d", cx - half, y + 12, half * 2, 3);
    };
    box(g, "#b9483a", 124, 44, 72, 22);
    for (const x of [126, 148, 170, 190]) box(g, "#7a2a20", x, 44, 4, 22);
    box(g, "#b9483a", 110, 78, 100, 30);
    for (const x of [112, 134, 158, 182, 204]) box(g, "#7a2a20", x, 78, 4, 30);
    box(g, "#ffe9a3", 140, 86, 14, 22);
    box(g, "#ffe9a3", 166, 86, 14, 22);
    roof(160, 34, 46);
    roof(160, 66, 64);
    box(g, "#e2b23c", 158, 18, 4, 9);
    // lanterns
    for (const x of [116, 204]) {
      box(g, "#4a3128", x, 80, 1, 6);
      disc(g, "#e0392b", x, 91, 6);
      box(g, "#e2b23c", x - 2, 96, 5, 3);
    }
    // pond
    box(g, "#8fcfc0", 0, 112, W, 88);
    for (let i = 0; i < 20; i++) box(g, "#b7e4d8", (i * 67) % W, 118 + ((i * 23) % 76), 16, 2);
    for (const [x, y] of [[40, 176], [250, 130], [290, 180]]) {
      disc(g, "#5fae6e", x, y, 9);
      disc(g, "#ff8fab", x + 3, y - 2, 3);
    }
    // the zigzag bridge
    const z = [[36, 132], [96, 132], [96, 156], [176, 156], [176, 180], [250, 180]];
    g.lineWidth = 16;
    g.lineJoin = "miter";
    g.strokeStyle = "#8a7355";
    g.beginPath();
    g.moveTo(z[0][0], z[0][1] + 3);
    for (const [x, y] of z.slice(1)) g.lineTo(x, y + 3);
    g.stroke();
    g.strokeStyle = "#efe2c4";
    g.beginPath();
    g.moveTo(z[0][0], z[0][1]);
    for (const [x, y] of z.slice(1)) g.lineTo(x, y);
    g.stroke();
    for (const [x, y] of z) box(g, "#b9483a", x - 3, y - 14, 5, 12);
  },
  // night in Lujiazui: the tower with its spheres above the river
  "sh-pearl": (g) => {
    box(g, "#2a2f5a", 0, 0, W, 80);
    box(g, "#3b3f78", 0, 80, W, 60);
    for (let i = 0; i < 40; i++) box(g, "#fff6cf", (i * 97) % W, (i * 41) % 90, 2, 2);
    disc(g, "#fff3c4", 48, 30, 12);
    disc(g, "#2a2f5a", 54, 26, 11);
    // skyline
    const sky: [number, number, number][] = [[0, 100, 30], [34, 84, 22], [60, 108, 34], [224, 70, 22], [250, 96, 30], [284, 60, 18], [304, 90, 16]];
    for (const [x, y, w] of sky) {
      box(g, "#1d2148", x, y, w, 150 - y);
      windows(g, x + 3, y + 5, w - 4, 146 - y - 5, "#ffe9a3", "#2a2f5a", 7);
    }
    // the tower
    const cx = 152;
    box(g, "#d9dbea", cx - 1, 6, 3, 30);
    disc(g, "#ff8fab", cx, 40, 6);
    box(g, "#d9dbea", cx - 3, 44, 7, 24);
    disc(g, "#ff8fab", cx, 76, 13);
    disc(g, "#ffc9d6", cx - 4, 72, 4);
    box(g, "#d9dbea", cx - 9, 86, 5, 34);
    box(g, "#d9dbea", cx - 2, 86, 5, 34);
    box(g, "#d9dbea", cx + 5, 86, 5, 34);
    disc(g, "#ff8fab", cx, 122, 20);
    disc(g, "#ffc9d6", cx - 7, 115, 6);
    box(g, "#c2607f", cx - 20, 121, 40, 3);
    poly(g, "#d9dbea", [cx - 12, 136, cx - 34, 160, cx - 27, 160, cx - 6, 140]);
    poly(g, "#d9dbea", [cx + 12, 136, cx + 34, 160, cx + 27, 160, cx + 6, 140]);
    box(g, "#d9dbea", cx - 3, 140, 7, 20);
    box(g, "#1d2148", 0, 150, W, 10);
    // river with reflections
    box(g, "#23306e", 0, 160, W, 40);
    for (let i = 0; i < 30; i++) box(g, i % 4 === 0 ? "#ff8fab" : i % 4 === 1 ? "#ffe9a3" : "#3f55a8", (i * 59) % W, 164 + ((i * 13) % 34), 12, 2);
  },
  // the campus district: glass towers with white fins, a lawn, trees in bloom
  "sh-zhangjiang": (g) => {
    box(g, "#cfe8ff", 0, 0, W, 120);
    disc(g, "#fff", 250, 24, 13);
    disc(g, "#fff", 268, 30, 10);
    disc(g, "#fff", 40, 40, 10);
    const tower = (x: number, y: number, w: number, fins: boolean) => {
      box(g, "#2f4a6e", x, y, w, 132 - y);
      for (let yy = y + 6; yy < 128; yy += 12) box(g, "#1d2f4a", x, yy, w, 3);
      if (fins) for (let xx = x + 2; xx < x + w - 1; xx += 5) box(g, "#f3f6f7", xx, y + 2, 2, 130 - y);
      else windows(g, x + 3, y + 9, w - 4, 120 - y, "#8fc4e8", "#4a6aa0", 6);
      box(g, "#f3f6f7", x - 2, y - 3, w + 4, 4);
    };
    tower(40, 26, 62, true);
    tower(108, 78, 70, false);
    tower(212, 38, 58, true);
    box(g, "#ffe9a3", 132, 112, 22, 20);
    box(g, "#6d4433", 142, 112, 2, 20);
    // paving, lawn, trees
    box(g, "#c9cdd6", 0, 132, W, 20);
    for (let x = 0; x < W; x += 22) box(g, "#b7bcc7", x, 132, 1, 20);
    box(g, "#8fc86a", 0, 152, W, 48);
    for (let x = 0; x < W; x += 32) box(g, "#9fd47a", x, 152, 16, 48);
    for (const [x, c1, c2] of [[22, "#ff8fab", "#ffc9d6"], [300, "#f2b63c", "#ffd98a"], [196, "#ff8fab", "#ffc9d6"]] as [number, string, string][]) {
      box(g, "#6d4433", x - 1, 138, 4, 24);
      disc(g, c1, x, 132, 14);
      disc(g, c2, x - 5, 128, 6);
    }
    // a yellow mascot shape and white block letters without any text, as on the real lawn
    disc(g, "#f2b63c", 92, 170, 11);
    disc(g, "#fde3a0", 92, 171, 7);
    box(g, "#cfe6d2", 84, 180, 16, 10);
    for (const x of [130, 152, 174]) {
      box(g, "#ffffff", x, 166, 16, 20);
      box(g, "#dfe6e2", x + 12, 166, 4, 20);
    }
  },
};

// the detail of each scene shown as the visual clue (a square in scene pixels) and the clue in words
const CLUES: Record<string, { crop: [number, number, number]; text: string; key: string }> = {
  "sh-bund": { crop: [146, 6, 70], text: "A long walk beside the Huangpu River, where a clock tower stands among old stone buildings.", key: "clock tower by the river" },
  "sh-yu": { crop: [70, 118, 74], text: "A quiet garden with a zigzag bridge over a pond, and roofs that curl up at the corners.", key: "zigzag bridge in a garden" },
  "sh-pearl": { crop: [112, 82, 80], text: "A tall tower that looks like pink pearls threaded on a needle.", key: "pearls on a needle" },
  "sh-zhangjiang": { crop: [36, 20, 70], text: "The district where this campus stands. You are in it right now.", key: "where this campus stands" },
};

/** the picture side of a Shanghai postcard, 320 x 200 (scale it up with CSS, image-rendering: pixelated) */
export function shanghaiPicture(id: string): HTMLCanvasElement {
  const c = h("canvas", { width: W, height: H });
  const g = c.getContext("2d")!;
  g.imageSmoothingEnabled = false;
  (SCENES[id] ?? SCENES["sh-bund"])(g);
  return c;
}

function shuffle<T>(a: T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

const ROUNDS = 3;

/** resolves the id of the postcard the player keeps (the last place matched), or null when they left */
export function playShanghai(): Promise<string | null> {
  return new Promise((resolve) => {
    const order = shuffle(SHANGHAI_POSTCARDS).slice(0, ROUNDS);
    let round = 0;
    let busy = false;
    let done = false;
    let prize: string | null = null;
    let last: { key: string; pick: string; right: boolean } | null = null;

    const clueCanvas = h("canvas", { width: 150, height: 150 });
    const roundEl = h("div", { class: "round" });
    const clueText = h("div", { class: "text" });
    const cards = h("div", { class: "mg2-cards" });
    const doneBtn = h("button", { class: "btn primary mg2-hidden", type: "button", "data-mg2": "done" }, "Keep the postcard");
    const buttons = new Map<string, HTMLButtonElement>();

    const finish = () => {
      if (done) return;
      done = true;
      f.close();
      resolve(prize);
    };

    const f = miniFrame({
      kind: "shanghai",
      kicker: "Campus gate · Beyond Campus: Shanghai · optional",
      title: "Shanghai discovery board",
      zh: "上海探索板",
      intro: "Four postcards from the city are pinned to the board at the gate. Read the clue, look at the round detail, and tap the postcard it belongs to. Three matches and you keep a postcard.",
      how: () => {
        const answer = last ? SHANGHAI_POSTCARDS.find((p) => CLUES[p.id].key === last!.key)!.title : "";
        return [
          "The rule in plain words: the game keeps a small table. Each clue points to exactly one place. When you tap a postcard, the game looks the clue up in the table and compares the answer with your pick.",
          h("p", { class: "then" }, last ? `Your last tap: the clue was "${last.key}" and you picked ${last.pick}. The table says ${answer}, so the comparison was ${last.right ? "True" : "False"}.` : "Tap a postcard first, then open this again to see your own pick in the code."),
          pyBox("The table in Python: a dictionary", `answers = {\n${SHANGHAI_POSTCARDS.map((p) => `    "${CLUES[p.id].key}": "${p.title}",`).join("\n")}\n}\n${last ? `clue = "${last.key}"\npick = "${last.pick}"\nanswers[clue]            # "${answer}"\nanswers[clue] == pick    # ${last.right ? "True" : "False"}` : `answers["pearls on a needle"]    # "Oriental Pearl Tower"`}`),
        ];
      },
      onLeave: finish,
    });

    function showClue(): void {
      const p = order[round];
      const c = CLUES[p.id];
      const g = clueCanvas.getContext("2d")!;
      g.imageSmoothingEnabled = false;
      g.clearRect(0, 0, 150, 150);
      g.drawImage(shanghaiPicture(p.id), c.crop[0], c.crop[1], c.crop[2], c.crop[2], 0, 0, 150, 150);
      roundEl.textContent = `Clue ${round + 1} of ${ROUNDS}`;
      clueText.textContent = c.text;
      f.say("Which postcard is it?");
    }

    async function pick(p: ShanghaiPostcard): Promise<void> {
      if (busy || prize) return;
      const want = order[round];
      const right = p.id === want.id;
      last = { key: CLUES[want.id].key, pick: p.title, right };
      const b = buttons.get(p.id)!;
      if (!right) {
        b.classList.remove("no");
        void b.offsetWidth;
        b.classList.add("no");
        f.say(`Not ${p.title}. Look at the round detail again.`, true);
        return;
      }
      busy = true;
      b.classList.add("found");
      f.say(`Yes, ${p.title}! ${p.fact}`);
      await sleep(round + 1 >= ROUNDS ? 1400 : 2200);
      if (done) return;
      busy = false;
      round++;
      if (round < ROUNDS) {
        showClue();
        return;
      }
      prize = want.id;
      const big = shanghaiPicture(want.id);
      f.body.replaceChildren(h("div", { class: "mg2-prize" }, big, h("div", {}, h("div", { class: "kicker" }, "Beyond Campus: Shanghai"), h("b", {}, want.title), h("p", {}, want.fact), h("p", { class: "mg2-note" }, "An illustration, not a map."))));
      doneBtn.classList.remove("mg2-hidden");
      f.say(`Three matches. The ${want.title} postcard is yours.`);
    }

    for (const p of SHANGHAI_POSTCARDS) {
      const b = h("button", { class: "mg2-card", type: "button", "data-mg2": `card-${p.id}`, onclick: () => void pick(p) }, shanghaiPicture(p.id), p.title);
      buttons.set(p.id, b);
      cards.append(b);
    }
    doneBtn.onclick = finish;
    f.actions.append(doneBtn);
    f.body.append(h("div", { class: "mg2-clue" }, clueCanvas, h("div", {}, roundEl, clueText)), cards, h("div", { class: "mg2-note" }, "Illustrations, not maps."));
    showClue();
  });
}
