// Snake in the research room: collect 8 data dots. Optional mini-game (docs/visitor-journey-story.md).
// Also holds miniFrame(), the shared window of the three mini-games in history.ts and shanghai.ts.

import "./mini2.css";
import { h, ui } from "../ui/dom";

export interface MiniFrame {
  /** the game goes here */
  body: HTMLElement;
  /** game buttons (Try again, Check, Done) go here, left of "How was this made?" */
  actions: HTMLElement;
  say(text: string, bad?: boolean): void;
  close(): void;
}

interface FrameOpts {
  kind: string;
  kicker: string;
  title: string;
  zh: string;
  intro: string;
  /** what the "How was this made?" panel shows, built again each time it opens */
  how: () => (HTMLElement | string)[];
  onHow?: (open: boolean) => void;
  onKey?: (e: KeyboardEvent) => void;
  onLeave: () => void;
}

export const pyBox = (label: string, code: string): HTMLElement => h("div", { class: "pybox" }, h("span", { class: "pylabel" }, label), h("pre", {}, code));

/** one full-screen window in the style of the dialogs, with the How button and Leave */
export function miniFrame(o: FrameOpts): MiniFrame {
  const body = h("div", { class: "mg2-body" });
  const status = h("div", { class: "mg2-status" });
  const how = h("div", { class: "mg2-how mg2-hidden" });
  const actions = h("span", { style: "display: contents" });
  const howBtn = h("button", { class: "btn", type: "button", "data-mg2": "how" }, "How was this made?");
  howBtn.onclick = () => {
    const open = how.classList.contains("mg2-hidden");
    how.classList.toggle("mg2-hidden", !open);
    if (open) how.replaceChildren(...o.how().map((x) => (typeof x === "string" ? h("p", {}, x) : x)));
    howBtn.textContent = open ? "Hide the explanation" : "How was this made?";
    o.onHow?.(open);
  };
  const leave = h("button", { class: "btn", type: "button", "data-mg2": "leave", onclick: () => o.onLeave() }, "Leave");
  const main = h("div", { class: "dialog-main" }, h("div", { class: "kicker" }, o.kicker), h("h2", {}, o.title), h("p", { class: "mg2-intro" }, o.intro), body, status, h("div", { class: "mg2-buttons" }, actions, h("span", { class: "mg2-spacer" }), howBtn, leave), how);
  const veil = h("div", { class: "veil mg2" }, h("div", { class: `dialog wide mg2-box ${o.kind}`, role: "dialog" }, main));
  const key = (e: KeyboardEvent) => {
    // the campus underneath must not hear any key while a mini-game is open
    e.stopPropagation();
    if (e.key === "Escape") o.onLeave();
    else o.onKey?.(e);
  };
  window.addEventListener("keydown", key, true);
  ui().append(veil);
  return {
    body,
    actions,
    say(text, bad = false) {
      status.textContent = text;
      status.classList.toggle("bad", bad);
    },
    close() {
      window.removeEventListener("keydown", key, true);
      veil.remove();
    },
  };
}

// ------------------------------------------------------------------ snake
const COLS = 20;
const ROWS = 14;
const CELL = 36;
const TARGET = 8;
const TICK_MS = 240;

type P = [number, number];
const same = (a: P, b: P): boolean => a[0] === b[0] && a[1] === b[1];

const DIRS: Record<string, P> = { ArrowUp: [0, -1], w: [0, -1], W: [0, -1], ArrowDown: [0, 1], s: [0, 1], S: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0], ArrowRight: [1, 0], d: [1, 0], D: [1, 0] };

function rr(g: CanvasRenderingContext2D, x: number, y: number, w: number, hh: number, r: number): void {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + hh, r);
  g.arcTo(x + w, y + hh, x, y + hh, r);
  g.arcTo(x, y + hh, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/** resolves true when the player collected all 8 data dots, false when they left before that */
export function playSnake(): Promise<boolean> {
  return new Promise((resolve) => {
    let snake: P[] = [];
    let dir: P = [1, 0];
    let next: P = [1, 0];
    let dot: P = [0, 0];
    let score = 0;
    let state: "ready" | "run" | "pause" | "over" | "won" = "ready";
    let timer = 0;
    let done = false;
    let last = "No run yet. Start one, then open this again to see the check that ended it.";

    const canvas = h("canvas", { class: "mg2-snake", width: COLS * CELL, height: ROWS * CELL });
    const g = canvas.getContext("2d")!;
    const scoreEl = h("b", {}, "0");
    const again = h("button", { class: "btn primary mg2-hidden", type: "button", "data-mg2": "again" }, "Try again");
    const doneBtn = h("button", { class: "btn primary mg2-hidden", type: "button", "data-mg2": "done" }, "Done");
    const pad = h("div", { class: "mg2-pad" });
    for (const [cls, label, d] of [["u", "▲", [0, -1]], ["l", "◀", [-1, 0]], ["r", "▶", [1, 0]], ["d", "▼", [0, 1]]] as [string, string, P][]) {
      pad.append(h("button", { class: cls, type: "button", "data-mg2": `dir-${cls}`, onclick: () => steer(d) }, label));
    }

    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = 0;
    };
    const finish = (won: boolean) => {
      if (done) return;
      done = true;
      stop();
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onBlur);
      f.close();
      resolve(won);
    };

    const f = miniFrame({
      kind: "snake",
      kicker: "Research room · optional",
      title: "Data Snake",
      zh: "数据贪吃蛇",
      intro: `Steer the snake to the pink data dots. Collect ${TARGET} to finish. Do not run into the wall or into your own tail.`,
      how: () => [
        "The rule in plain words: a few times a second the head moves one square in the direction you chose. The game then asks three questions, in this order. Is the new square outside the grid? Is it already part of the snake? Is there a data dot on it?",
        h("p", { class: "then" }, last),
        pyBox("The same three checks in Python", `head = (x + dx, y + dy)\nif not (0 <= head[0] < ${COLS} and 0 <= head[1] < ${ROWS}):\n    game_over("wall")\nelif head in snake:\n    game_over("own tail")\nelif head == dot:\n    score += 1          # and the snake grows by one`),
      ],
      onHow: (open) => {
        if (open) pause();
      },
      onKey: (e) => {
        const d = DIRS[e.key];
        if (!d) return;
        e.preventDefault();
        steer(d);
      },
      onLeave: () => finish(state === "won"),
    });

    function placeDot(): void {
      const free: P[] = [];
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (!snake.some((s) => same(s, [x, y]))) free.push([x, y]);
      dot = free[Math.floor(Math.random() * free.length)];
    }

    function draw(): void {
      g.fillStyle = "#fffdf8";
      g.fillRect(0, 0, canvas.width, canvas.height);
      g.fillStyle = "#ffe0e8";
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) g.fillRect(x * CELL + CELL / 2 - 2, y * CELL + CELL / 2 - 2, 4, 4);
      // the data dot
      const dx = dot[0] * CELL + CELL / 2;
      const dy = dot[1] * CELL + CELL / 2;
      g.fillStyle = "#ff8fab";
      g.beginPath();
      g.arc(dx, dy, 12, 0, Math.PI * 2);
      g.fill();
      g.lineWidth = 3;
      g.strokeStyle = "#6d4433";
      g.stroke();
      g.fillStyle = "#fff";
      g.beginPath();
      g.arc(dx - 4, dy - 4, 3.5, 0, Math.PI * 2);
      g.fill();
      // the snake, tail first so the head sits on top
      for (let i = snake.length - 1; i >= 0; i--) {
        const [x, y] = snake[i];
        rr(g, x * CELL + 3, y * CELL + 3, CELL - 6, CELL - 6, 10);
        g.fillStyle = i === 0 ? "#1c9a73" : i % 2 ? "#7fd8b0" : "#5cc79a";
        g.fill();
        g.lineWidth = 3;
        g.strokeStyle = "#094a37";
        g.stroke();
      }
      const [hx, hy] = snake[0];
      const cx = hx * CELL + CELL / 2;
      const cy = hy * CELL + CELL / 2;
      for (const side of [-1, 1]) {
        const ex = cx + dir[0] * 6 + (dir[0] === 0 ? side * 7 : 0);
        const ey = cy + dir[1] * 6 + (dir[1] === 0 ? side * 7 : 0);
        g.fillStyle = "#fff";
        g.beginPath();
        g.arc(ex, ey, 5, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "#2b1f2e";
        g.beginPath();
        g.arc(ex + dir[0] * 1.5, ey + dir[1] * 1.5, 2.5, 0, Math.PI * 2);
        g.fill();
      }
    }

    function reset(): void {
      stop();
      snake = [[6, 7], [5, 7], [4, 7]];
      dir = [1, 0];
      next = [1, 0];
      score = 0;
      scoreEl.textContent = "0";
      placeDot();
      state = "ready";
      again.classList.add("mg2-hidden");
      f.say("Press an arrow key, or tap an arrow, to start.");
      draw();
    }

    function pause(): void {
      if (state !== "run") return;
      stop();
      state = "pause";
      f.say("Paused. Press or tap an arrow to go on.");
    }
    const onBlur = () => pause();

    function steer(d: P): void {
      if (state === "over" || state === "won") return;
      // a snake cannot turn straight back into its own neck
      if (!(d[0] === -dir[0] && d[1] === -dir[1])) next = d;
      if (state !== "run") {
        state = "run";
        f.say(`Data dots: ${score} of ${TARGET}.`);
        timer = window.setInterval(tick, TICK_MS);
      }
    }

    function lose(text: string, why: string): void {
      stop();
      state = "over";
      last = why;
      again.classList.remove("mg2-hidden");
      f.say(text, true);
    }

    function tick(): void {
      dir = next;
      const head: P = [snake[0][0] + dir[0], snake[0][1] + dir[1]];
      if (head[0] < 0 || head[0] >= COLS || head[1] < 0 || head[1] >= ROWS) {
        lose("Bump! That was the wall.", `Your last run: the head moved to (${head[0]}, ${head[1]}). The grid only goes from 0 to ${COLS - 1} across and 0 to ${ROWS - 1} down, so the first check was true.`);
        return;
      }
      if (snake.some((s) => same(s, head))) {
        lose("Oops! You ran into your own tail.", `Your last run: the head moved to (${head[0]}, ${head[1]}), a square the snake was already on, so the second check was true.`);
        return;
      }
      snake.unshift(head);
      if (same(head, dot)) {
        score++;
        scoreEl.textContent = String(score);
        last = `Your last dot: the head reached (${head[0]}, ${head[1]}), where the dot was, so the third check was true and the score became ${score}.`;
        if (score >= TARGET) {
          stop();
          state = "won";
          draw();
          doneBtn.classList.remove("mg2-hidden");
          f.say(`All ${TARGET} data dots collected. Nice steering!`);
          return;
        }
        placeDot();
        f.say(`Data dots: ${score} of ${TARGET}.`);
      } else snake.pop();
      draw();
    }

    again.onclick = () => reset();
    doneBtn.onclick = () => finish(true);
    f.actions.append(again, doneBtn);
    f.body.append(h("div", { class: "mg2-snake-row" }, canvas, h("div", { class: "mg2-side" }, h("div", { class: "mg2-score" }, "Data dots ", scoreEl, ` / ${TARGET}`), pad, h("div", { class: "mg2-keys" }, "Arrow keys or WASD work too"))));
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onBlur);
    reset();
  });
}
