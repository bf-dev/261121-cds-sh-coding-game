// Tower of Hanoi: an optional mini-game (docs/visitor-journey-story.md, "Optional spaces and mini-games").
// Not part of the battle rules. The caller pauses the world; this module owns one overlay and its listeners.

import "./mini.css";
import { h, sleep, ui } from "../ui/dom";

const PEG = ["A", "B", "C"];
const GOAL = 2;

type Pegs = number[][]; // each peg from bottom to top, a bigger number is a bigger disk

const legal = (pegs: Pegs, from: number, to: number): boolean => pegs[from].length > 0 && (pegs[to].length === 0 || pegs[from][pegs[from].length - 1] < pegs[to][pegs[to].length - 1]);

/** the next move of the shortest solution from any position (the standard recursion, read off for one step) */
function nextMove(pegs: Pegs, n: number): [number, number] | null {
  const at: number[] = [];
  pegs.forEach((p, i) => p.forEach((d) => (at[d] = i)));
  const step = (k: number, target: number): [number, number] | null => {
    if (k === 0) return null;
    if (at[k] === target) return step(k - 1, target);
    const spare = 3 - at[k] - target;
    return step(k - 1, spare) ?? [at[k], target];
  };
  return step(n, GOAL);
}

const pyList = (a: number[]): string => `[${a.join(", ")}]`;
const pyPegs = (p: Pegs): string => `{"A": ${pyList(p[0])}, "B": ${pyList(p[1])}, "C": ${pyList(p[2])}}`;

/** Play the Tower of Hanoi. Resolves true if the tower was moved at least once, false if the player left before that. */
export function playHanoi(disks: 3 | 4 = 3): Promise<boolean> {
  return new Promise((resolve) => {
    let n: number = disks;
    let pegs: Pegs = [[], [], []];
    let picked: number | null = null;
    let moves = 0;
    let solvedOnce = false;
    let roundOver = false;
    let hint: [number, number] | null = null;
    let last: { from: number; to: number; ok: boolean; before: Pegs } | null = null;
    let closed = false;

    const best = () => 2 ** n - 1;
    const movesChip = h("span", { class: "m1-chip" });
    const bestChip = h("span", { class: "m1-chip soft" });
    const guide = h("p", { class: "m1-guide" });
    const board = h("div", { class: "m1-pegs" });
    const msg = h("p", { class: "m1-msg" });
    const body = h("div", { class: "m1-body" }, board, msg);
    const hintBtn = h("button", { class: "btn", type: "button", "data-mini": "hint", onclick: () => showHint() }, "Hint");
    const howBtn = h("button", { class: "btn", type: "button", "data-mini": "how", onclick: () => openHow() }, "How was this made?");
    const againBtn = h("button", { class: "btn", type: "button", "data-mini": "restart", onclick: () => start(n) }, "Start over");
    const leaveBtn = h("button", { class: "btn", type: "button", "data-mini": "leave", onclick: () => close() }, "Leave");
    const box = h(
      "div",
      { class: "m1-box", role: "dialog" },
      h("div", { class: "m1-kicker" }, "Classroom puzzle"),
      h("h2", {}, "Tower of Hanoi"),
      guide,
      h("div", { class: "m1-stats" }, movesChip, bestChip),
      body,
      h("div", { class: "m1-foot" }, hintBtn, howBtn, h("span", { class: "spacer" }), againBtn, leaveBtn),
    );
    const veil = h("div", { class: "veil m1-veil" }, box);
    let sheet: HTMLElement | null = null;
    let result: HTMLElement | null = null;

    function say(text: string, tone: "" | "bad" | "good" = ""): void {
      msg.className = `m1-msg ${tone}`;
      msg.textContent = text;
    }

    function render(): void {
      movesChip.textContent = `Moves ${moves}`;
      bestChip.textContent = `Fewest possible ${best()}`;
      board.replaceChildren(
        ...pegs.map((p, i) => {
          const el = h("button", { class: `m1-peg ${picked === i ? "picked" : ""} ${hint?.[0] === i ? "from" : ""} ${hint?.[1] === i ? "to" : ""}`, type: "button", "data-peg": i, onclick: () => clickPeg(i) }, h("span", { class: "pole" }), h("span", { class: "base" }));
          p.forEach((d, level) => {
            const top = level === p.length - 1;
            const w = 100 + d * 70;
            const up = picked === i && top;
            el.append(h("span", { class: `m1-disk d${d} ${up ? "up" : ""}`, style: `width:${w}px;margin-left:${-w / 2}px;bottom:${66 + level * 48 + (up ? 70 : 0)}px` }, String(d)));
          });
          el.append(h("span", { class: "name" }, `Peg ${PEG[i]}`, i === GOAL ? h("small", {}, "goal") : null));
          return el;
        }),
      );
    }

    function start(count: number): void {
      n = count;
      pegs = [Array.from({ length: n }, (_, i) => n - i), [], []];
      picked = null;
      moves = 0;
      roundOver = false;
      hint = null;
      last = null;
      result?.remove();
      result = null;
      guide.replaceChildren(h("b", {}, "Your guide: "), `Move all ${n} disks to peg C. One disk at a time, and a bigger disk never sits on a smaller one.`);
      say("Click a peg to pick up its top disk, then click the peg to put it on.");
      hintBtn.disabled = false;
      render();
    }

    function clickPeg(i: number): void {
      if (roundOver || sheet) return;
      hint = null;
      if (picked === null) {
        if (pegs[i].length === 0) {
          say(`Peg ${PEG[i]} is empty. Pick a peg that has a disk.`, "bad");
          render();
          return;
        }
        picked = i;
        say(`You hold disk ${pegs[i][pegs[i].length - 1]}. Click the peg to put it on.`);
        render();
        return;
      }
      const from = picked;
      picked = null;
      if (from === i) {
        say("Put back. Pick any top disk.");
        render();
        return;
      }
      const before = pegs.map((p) => p.slice());
      const ok = legal(pegs, from, i);
      last = { from, to: i, ok, before };
      if (!ok) {
        const d = pegs[from][pegs[from].length - 1];
        const under = pegs[i][pegs[i].length - 1];
        say(`Not allowed: disk ${d} is bigger than disk ${under}. A bigger disk never sits on a smaller one.`, "bad");
        render();
        const el = board.children[i] as HTMLElement | undefined;
        el?.classList.add("m1-shake");
        return;
      }
      pegs[i].push(pegs[from].pop()!);
      moves++;
      say(`Disk ${pegs[i][pegs[i].length - 1]} moved from peg ${PEG[from]} to peg ${PEG[i]}.`);
      render();
      if (pegs[GOAL].length === n) void win();
    }

    function showHint(): void {
      if (roundOver || sheet) return;
      picked = null;
      hint = nextMove(pegs, n);
      if (hint) say(`Hint: move the top disk from peg ${PEG[hint[0]]} to peg ${PEG[hint[1]]}.`, "good");
      render();
    }

    async function win(): Promise<void> {
      roundOver = true;
      solvedOnce = true;
      hintBtn.disabled = true;
      say("The tower is on peg C!", "good");
      await sleep(450);
      if (closed) return;
      const perfect = moves === best();
      result = h(
        "div",
        { class: "m1-result" },
        h("h3", {}, "Solved!"),
        h("p", {}, `You moved ${n} disks in ${moves} moves. The fewest possible is ${best()}.`),
        h("p", { class: "dim" }, perfect ? "That is the shortest solution there is. Perfect!" : "Every extra disk doubles the work: 3 disks need 7 moves, 4 disks need 15."),
        h(
          "div",
          { class: "row" },
          h("button", { class: "btn primary", type: "button", "data-mini": "done", onclick: () => close() }, "Done"),
          h("button", { class: "btn", type: "button", "data-mini": "again", onclick: () => start(n) }, "Play again"),
          n === 3 ? h("button", { class: "btn", type: "button", "data-mini": "bonus", onclick: () => start(4) }, "Bonus round: 4 disks") : null,
        ),
      );
      body.append(result);
    }

    function openHow(): void {
      if (sheet) return;
      // tied to what just happened: the last move tried, or the first move if nothing was tried yet
      const m = last ?? { from: 0, to: 2, ok: legal(pegs, 0, 2), before: pegs.map((p) => p.slice()) };
      const src = m.before[m.from];
      const dst = m.before[m.to];
      const why = src.length === 0 ? "nothing to pick up" : dst.length === 0 ? `peg ${PEG[m.to]} is empty` : `${src[src.length - 1]} < ${dst[dst.length - 1]} is ${m.ok ? "True" : "False"}`;
      const check = [
        `pegs = ${pyPegs(m.before)}`,
        "# each list goes from the bottom disk to the top disk",
        "",
        "def can_move(src, dst):",
        "    if not pegs[src]:",
        "        return False        # nothing to pick up",
        "    if not pegs[dst]:",
        "        return True         # an empty peg takes any disk",
        "    return pegs[src][-1] < pegs[dst][-1]",
        "",
        `can_move("${PEG[m.from]}", "${PEG[m.to]}")    # ${m.ok ? "True" : "False"}: ${why}`,
      ].join("\n");
      const recursion = [
        "def hanoi(n, src, dst, spare):",
        "    if n == 0:",
        "        return",
        "    hanoi(n - 1, src, spare, dst)   # clear the way",
        '    print("move disk", n, "from", src, "to", dst)',
        "    hanoi(n - 1, spare, dst, src)   # stack them back on top",
        "",
        `hanoi(${n}, "A", "C", "B")    # prints ${best()} moves: 2 ** ${n} - 1`,
      ].join("\n");
      const extra = h("div", { style: "display:none" }, h("p", {}, "To move a tower, a computer moves the smaller disks out of the way, moves the biggest disk, then moves the smaller ones back on top. For the smaller tower it does the same thing again. A function that calls itself like this is called recursion."), h("div", { class: "pybox" }, h("span", { class: "pylabel" }, "The whole solution in Python"), h("pre", {}, recursion)));
      const rule = h("div", {}, h("p", {}, "The game keeps three lists of numbers, one list for each peg. When you try a move it asks one question: is the peg you drop on empty, or is its top disk bigger than the disk in your hand? If yes, the move is allowed. That check is the whole rule."), h("div", { class: "pybox" }, h("span", { class: "pylabel" }, last ? `Your last move, peg ${PEG[m.from]} to peg ${PEG[m.to]}, as Python` : "The first move, as Python"), h("pre", {}, check)));
      const MORE = ["Optional: how does a computer solve it?", "Back to the rule"];
      const more = h("button", { class: "btn", type: "button", "data-mini": "recursion" }, MORE[0]);
      more.onclick = () => {
        const open = extra.style.display === "none";
        extra.style.display = open ? "" : "none";
        rule.style.display = open ? "none" : "";
        more.textContent = MORE[open ? 1 : 0];
      };
      sheet = h(
        "div",
        { class: "m1-how" },
        h("div", { class: "m1-kicker" }, "How was this made?"),
        h("h2", {}, "One small check"),
        rule,
        extra,
        h("span", { style: "flex:1" }),
        h("div", { class: "m1-foot" }, more, h("span", { class: "spacer" }), h("button", { class: "btn primary", type: "button", "data-mini": "how-close", onclick: () => closeHow() }, "Back to the puzzle")),
      );
      box.append(sheet);
    }

    function closeHow(): void {
      sheet?.remove();
      sheet = null;
    }

    function onKey(e: KeyboardEvent): void {
      // nothing typed here may reach the game behind
      e.stopPropagation();
      const k = e.key.toLowerCase();
      if (k === "escape") {
        e.preventDefault();
        if (sheet) closeHow();
        else close();
        return;
      }
      if (sheet) return;
      if (roundOver) {
        if (k === "enter") {
          e.preventDefault();
          close();
        }
        return;
      }
      const peg = ["1", "2", "3"].indexOf(k) >= 0 ? ["1", "2", "3"].indexOf(k) : ["a", "b", "c"].indexOf(k);
      if (peg >= 0) {
        e.preventDefault();
        clickPeg(peg);
      } else if (k === "h") {
        e.preventDefault();
        showHint();
      }
    }

    function close(): void {
      if (closed) return;
      closed = true;
      window.removeEventListener("keydown", onKey, true);
      veil.remove();
      resolve(solvedOnce);
    }

    start(n);
    ui().append(veil);
    window.addEventListener("keydown", onKey, true);
  });
}
