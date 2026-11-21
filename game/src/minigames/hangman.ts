// Campus word game (Hangman-style, with six lights instead of a gallows): an optional mini-game
// (docs/visitor-journey-story.md, "Optional spaces and mini-games"). Every word is a real thing
// on the campus, described from buildings/. The caller pauses the world.

import "./mini.css";
import { h, sleep, ui } from "../ui/dom";

type Draw = (dot: (x: number, y: number, w: number, hgt: number, c: string) => void, disc: (cx: number, cy: number, r: number, c: string) => void) => void;

interface Word {
  word: string;
  clue: string;
  /** shown after the round */
  fact: string;
  draw: Draw;
}

// picture clues on a 48 x 48 grid
const WORDS: Word[] = [
  {
    word: "LION",
    clue: "The mascot who sits on the lawn, next to the big white HKU letters.",
    fact: "Leo the lion wears a pale green jacket and brown shorts. Most visitors take their first photo with him.",
    draw: (dot, disc) => {
      dot(0, 0, 48, 48, "#bfe6a8");
      for (let i = 0; i < 10; i++) disc(24 + Math.round(16 * Math.cos((i * Math.PI) / 5)), 24 + Math.round(16 * Math.sin((i * Math.PI) / 5)), 6, "#e9a93a");
      disc(24, 24, 16, "#f0b849");
      disc(12, 10, 4, "#f0b849");
      disc(36, 10, 4, "#f0b849");
      disc(12, 10, 2, "#f6a9b4");
      disc(36, 10, 2, "#f6a9b4");
      disc(24, 26, 12, "#fbe6b0");
      dot(18, 22, 3, 4, "#3a2a22");
      dot(27, 22, 3, 4, "#3a2a22");
      dot(18, 22, 1, 1, "#ffffff");
      dot(27, 22, 1, 1, "#ffffff");
      dot(13, 28, 4, 2, "#f6a9b4");
      dot(31, 28, 4, 2, "#f6a9b4");
      dot(22, 28, 4, 2, "#c9675a");
      dot(23, 30, 2, 1, "#8a5a3a");
      dot(21, 31, 2, 1, "#8a5a3a");
      dot(25, 31, 2, 1, "#8a5a3a");
    },
  },
  {
    word: "LIFT",
    clue: "Steel doors on every floor of CDS-1. It carries you from 1/F up to 14/F.",
    fact: "CDS-1 has eight lifts, four on each side of the lift hall. Each car carries 21 people.",
    draw: (dot) => {
      dot(0, 0, 48, 48, "#efe6d6");
      dot(0, 42, 48, 6, "#d8cbb5");
      dot(7, 8, 30, 34, "#7d8790");
      dot(9, 10, 12, 32, "#c9d0d6");
      dot(23, 10, 12, 32, "#c9d0d6");
      dot(21, 10, 2, 32, "#5d666e");
      dot(11, 12, 2, 28, "#e4e9ed");
      dot(25, 12, 2, 28, "#e4e9ed");
      dot(15, 2, 14, 5, "#2a2a2a");
      dot(18, 3, 2, 3, "#ff9a3c");
      dot(21, 3, 2, 3, "#ff9a3c");
      dot(25, 3, 2, 1, "#ff9a3c");
      dot(24, 4, 4, 1, "#ff9a3c");
      dot(40, 22, 4, 8, "#e8c33a");
      dot(41, 24, 2, 2, "#5d666e");
      dot(41, 27, 2, 2, "#5d666e");
    },
  },
  {
    word: "CAFE",
    clue: "The round room on CDS-1 1/F with red diamond tiles in a white floor.",
    fact: "The cafe sits before the security line, with a row of glass-front drink fridges on the wall.",
    draw: (dot, disc) => {
      dot(0, 0, 48, 48, "#f4f1ea");
      const diamond = (x: number, y: number) => {
        dot(x + 1, y, 1, 3, "#d2453c");
        dot(x, y + 1, 3, 1, "#d2453c");
      };
      for (const [x, y] of [[4, 5], [16, 3], [30, 6], [41, 3], [8, 18], [40, 20], [3, 34], [14, 42], [34, 41], [43, 35]]) diamond(x, y);
      disc(24, 25, 10, "#c9a36b");
      disc(24, 24, 10, "#ecd3a8");
      dot(8, 21, 5, 6, "#d2453c");
      dot(35, 21, 5, 6, "#3f6fb0");
      dot(21, 9, 6, 5, "#f7f7f2");
      dot(21, 14, 6, 1, "#b9b2a6");
      dot(20, 20, 4, 4, "#ffffff");
      dot(21, 21, 2, 2, "#8a5a3a");
      dot(26, 25, 4, 4, "#ffffff");
      dot(27, 26, 2, 2, "#8a5a3a");
    },
  },
  {
    word: "LOCKER",
    clue: "Yellow boxes east of CDS-1, across the service road. Students pick up their Meituan food here.",
    fact: "The Meituan lockers stand outdoors with Fangchun Road behind them. Taobao lockers are right beside them.",
    draw: (dot) => {
      dot(0, 0, 48, 48, "#cfe8ff");
      dot(0, 42, 48, 6, "#b9bec6");
      dot(5, 4, 38, 5, "#e0a800");
      dot(5, 9, 38, 33, "#f6c21c");
      for (let x = 5; x <= 43; x += 9.5) dot(Math.round(x), 9, 1, 33, "#b8860b");
      for (let y = 9; y <= 42; y += 8.25) dot(5, Math.round(y), 38, 1, "#b8860b");
      dot(15, 18, 9, 7, "#2a2a2a");
      dot(16, 19, 7, 5, "#7fd0e8");
      for (const [x, y] of [[11, 13], [30, 13], [39, 13], [11, 30], [30, 22], [39, 30], [20, 38]]) dot(x, y, 2, 1, "#8a6a10");
    },
  },
  {
    word: "GYM",
    clue: "Treadmills behind a glass wall. There is one in room 604 of CDS-1 and one on 2/F of Building 5.",
    fact: "A gym session in the game gives back a third of your HP. Even coders need to move.",
    draw: (dot) => {
      dot(0, 0, 48, 48, "#dbeeff");
      dot(0, 36, 48, 12, "#d9b98a");
      dot(0, 36, 48, 1, "#b98f5c");
      dot(6, 14, 6, 16, "#3a3440");
      dot(12, 17, 3, 10, "#5a5460");
      dot(15, 20, 18, 4, "#9aa3ad");
      dot(15, 20, 18, 1, "#c9d0d6");
      dot(33, 17, 3, 10, "#5a5460");
      dot(36, 14, 6, 16, "#3a3440");
      dot(7, 15, 1, 14, "#6a6470");
      dot(37, 15, 1, 14, "#6a6470");
      dot(8, 32, 32, 2, "rgba(90,48,28,0.22)");
    },
  },
  {
    word: "STAIR",
    clue: "Wide timber steps in Building 5 where students sit and study, from 3/F up to 4/F.",
    fact: "The study stair starts on 3/F of Building 5 and ends on 4/F, with sofas tucked under it.",
    draw: (dot) => {
      dot(0, 0, 48, 48, "#f3ead8");
      for (let i = 0; i < 6; i++) {
        const x = 4 + i * 7;
        const y = 38 - i * 6;
        dot(x, y, 44 - x, 6, i % 2 ? "#c99a5e" : "#d9b07a");
        dot(x, y, 44 - x, 1, "#edd0a0");
      }
      dot(4, 44, 40, 2, "#a67843");
      dot(20, 24, 6, 2, "#6fae8f");
      dot(34, 12, 6, 2, "#e7909e");
      dot(27, 15, 3, 3, "#3a3440");
      dot(26, 18, 5, 2, "#4a6aa0");
    },
  },
];

const LIGHTS = 6;
const HINTS = 2;

function picture(w: Word): HTMLCanvasElement {
  const c = h("canvas", { width: 48, height: 48 });
  const g = c.getContext("2d")!;
  const dot = (x: number, y: number, wd: number, hgt: number, col: string) => {
    g.fillStyle = col;
    g.fillRect(x, y, wd, hgt);
  };
  const disc = (cx: number, cy: number, r: number, col: string) => {
    g.fillStyle = col;
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.6) g.fillRect(cx + x, cy + y, 1, 1);
  };
  w.draw(dot, disc);
  return c;
}

/** Play the campus word game. Resolves true if at least one word was solved, false if the player left before that. */
export function playHangman(): Promise<boolean> {
  return new Promise((resolve) => {
    let w: Word = WORDS[0];
    let guessed: string[] = [];
    let wrong = 0;
    let hints = HINTS;
    let roundOver = false;
    let solvedOnce = false;
    let lastGuess: { letter: string; before: string[]; lightsBefore: number; hit: boolean; hinted?: boolean } | null = null;
    let closed = false;
    let sheet: HTMLElement | null = null;
    let result: HTMLElement | null = null;

    const clueBox = h("div", { class: "m1-clue" });
    const wordRow = h("div", { class: "m1-word" });
    const lights = h("div", { class: "m1-lights" });
    const keys = h("div", { class: "m1-keys" });
    const msg = h("p", { class: "m1-msg" });
    const play = h("div", { class: "m1-play" }, wordRow, lights, keys, msg);
    const hintBtn = h("button", { class: "btn", type: "button", "data-mini": "hint", onclick: () => useHint() });
    const howBtn = h("button", { class: "btn", type: "button", "data-mini": "how", onclick: () => openHow() }, "How was this made?");
    const leaveBtn = h("button", { class: "btn", type: "button", "data-mini": "leave", onclick: () => close() }, "Leave");
    const box = h(
      "div",
      { class: "m1-box", role: "dialog" },
      h("div", { class: "m1-kicker" }, "Classroom game"),
      h("h2", {}, "Campus word game"),
      h("p", { class: "m1-guide" }, h("b", {}, "Your guide: "), "Find the campus word one letter at a time. A letter that is not in the word turns off one of your six lights."),
      h("div", { class: "m1-body" }, h("div", { class: "m1-hang" }, clueBox, play)),
      h("div", { class: "m1-foot" }, hintBtn, howBtn, h("span", { class: "spacer" }), leaveBtn),
    );
    const veil = h("div", { class: "veil m1-veil" }, box);

    const shown = (list: string[]): string => w.word.split("").map((c) => (list.includes(c) ? c : "_")).join(" ");
    const left = () => LIGHTS - wrong;
    const done = () => w.word.split("").every((c) => guessed.includes(c));

    function say(text: string, tone: "" | "bad" | "good" = ""): void {
      msg.className = `m1-msg ${tone}`;
      msg.textContent = text;
    }

    function render(fresh = ""): void {
      wordRow.replaceChildren(...w.word.split("").map((c) => h("span", { class: `m1-slot ${guessed.includes(c) ? (c === fresh ? "open" : "") : roundOver ? "missed" : ""}` }, guessed.includes(c) || roundOver ? c : "")));
      lights.replaceChildren(...Array.from({ length: LIGHTS }, (_, i) => h("span", { class: `m1-light ${i < left() ? "" : "off"}` })), h("span", {}, `${left()} of ${LIGHTS} lights on`));
      keys.replaceChildren(
        ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c) => {
          const used = guessed.includes(c);
          return h("button", { class: `m1-key ${used ? (w.word.includes(c) ? "hit" : "miss") : ""}`, type: "button", "data-key": c, disabled: used || roundOver, onclick: () => guess(c) }, c);
        }),
      );
      hintBtn.textContent = `Hint (${hints})`;
      hintBtn.disabled = roundOver || hints <= 0;
    }

    function start(): void {
      const others = WORDS.filter((x) => x !== w || !guessed.length);
      w = others[Math.floor(Math.random() * others.length)];
      guessed = [];
      wrong = 0;
      hints = HINTS;
      roundOver = false;
      lastGuess = null;
      result?.remove();
      result = null;
      clueBox.replaceChildren(picture(w), h("div", { class: "label" }, "Clue"), h("p", {}, w.clue));
      say(`${w.word.length} letters. Click a letter, or type it.`);
      render();
    }

    function guess(c: string): void {
      if (roundOver || sheet || guessed.includes(c)) return;
      const hit = w.word.includes(c);
      lastGuess = { letter: c, before: guessed.slice(), lightsBefore: left(), hit };
      guessed.push(c);
      if (hit) {
        const count = w.word.split("").filter((x) => x === c).length;
        say(count > 1 ? `Yes! ${c} is in the word ${count} times.` : `Yes! ${c} is in the word.`, "good");
      } else {
        wrong++;
        say(`No ${c} in this word. One light goes out.`, "bad");
      }
      render(hit ? c : "");
      if (!hit) lights.classList.add("m1-shake"), setTimeout(() => lights.classList.remove("m1-shake"), 450);
      if (done()) void finish(true);
      else if (left() <= 0) void finish(false);
    }

    function useHint(): void {
      if (roundOver || sheet || hints <= 0) return;
      const hidden = w.word.split("").filter((c) => !guessed.includes(c));
      if (!hidden.length) return;
      hints--;
      const c = hidden[Math.floor(Math.random() * hidden.length)];
      lastGuess = { letter: c, before: guessed.slice(), lightsBefore: left(), hit: true, hinted: true };
      guessed.push(c);
      say(`Your guide whispers: the letter ${c} is in it.`, "good");
      render(c);
      if (done()) void finish(true);
    }

    async function finish(won: boolean): Promise<void> {
      roundOver = true;
      if (won) solvedOnce = true;
      render();
      await sleep(500);
      if (closed) return;
      result = h(
        "div",
        { class: "m1-result" },
        h("h3", {}, won ? `${w.word}!` : `It was ${w.word}`),
        h("p", {}, won ? `You found it with ${left()} of ${LIGHTS} lights still on.` : "All six lights are out this time. The clue will make more sense on your next walk."),
        h("p", { class: "dim" }, w.fact),
        h(
          "div",
          { class: "row" },
          h("button", { class: `btn ${won ? "" : "primary"}`, type: "button", "data-mini": "again", onclick: () => start() }, "Try another word"),
          h("button", { class: `btn ${won ? "primary" : ""}`, type: "button", "data-mini": "done", onclick: () => close() }, won ? "Done" : "Leave"),
        ),
      );
      play.append(result);
    }

    function openHow(): void {
      if (sheet) return;
      const g = lastGuess;
      const letter = g?.letter ?? "A";
      const before = g?.before ?? [];
      const lightsBefore = g?.lightsBefore ?? LIGHTS;
      // the secret word stays hidden in the code until the round is over
      const secret = roundOver ? `"${w.word}"` : `"${"?".repeat(w.word.length)}"`;
      const after = g ? [...before, letter] : before;
      const line = (code: string, note = ""): string => (note ? `${code.padEnd(34)}# ${note}` : code);
      const code = [
        line(`word = ${secret}`, roundOver ? "the secret word" : "secret until the round ends"),
        line(`guessed = [${before.map((c) => `"${c}"`).join(", ")}]`, "letters tried before this one"),
        line(`lights = ${lightsBefore}`),
        "",
        line(`letter = "${letter}"`, g ? (g.hinted ? "the letter your guide gave you" : "your last guess") : "try a letter, then open this again"),
        line("guessed.append(letter)"),
        line("if letter in word:", g ? `${g.hit ? "True" : "False"} this time` : ""),
        line('    print("yes, it is in the word")'),
        line("else:"),
        line("    lights = lights - 1", g && !g.hit ? `one light goes out: ${lightsBefore - 1} left` : "one light goes out"),
        "",
        line('shown = " ".join(c if c in guessed else "_" for c in word)'),
        line("print(shown)", g ? shown(after) : ""),
      ].join("\n");
      sheet = h(
        "div",
        { class: "m1-how" },
        h("div", { class: "m1-kicker" }, "How was this made?"),
        h("h2", {}, "One question per guess"),
        h("p", {}, "The game holds one secret word and a list of the letters you have tried. For every guess it asks a single question: is this letter in the word? If yes, every copy of that letter is shown. If no, one light goes out. Six lights, so six wrong guesses."),
        h("div", { class: "pybox" }, h("span", { class: "pylabel" }, g ? `${g.hinted ? "The hint" : "Your last guess"}, the letter ${letter}, as Python` : "A guess, as Python"), h("pre", {}, code)),
        h("p", { class: "dim" }, "The last two lines build what you see on the cards: a letter if you have guessed it, an underscore if not."),
        h("div", { class: "m1-foot" }, h("span", { class: "spacer" }), h("button", { class: "btn primary", type: "button", "data-mini": "how-close", onclick: () => closeHow() }, "Back to the game")),
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
      if (e.key === "Escape") {
        e.preventDefault();
        if (sheet) closeHow();
        else close();
        return;
      }
      if (sheet || e.ctrlKey || e.metaKey || e.altKey) return;
      if (roundOver) {
        if (e.key === "Enter" && result) {
          e.preventDefault();
          start();
        }
        return;
      }
      if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        guess(e.key.toUpperCase());
      }
    }

    function close(): void {
      if (closed) return;
      closed = true;
      window.removeEventListener("keydown", onKey, true);
      veil.remove();
      resolve(solvedOnce);
    }

    start();
    ui().append(veil);
    window.addEventListener("keydown", onKey, true);
  });
}
