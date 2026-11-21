// The HKU history exhibition on CDS-1 14/F: put five years of the timeline wall in order.
// Optional mini-game (docs/visitor-journey-story.md). The only facts used are the labels printed on
// the wall, as read in buildings/cds1/README.md ("HKU HISTORY | THE MILESTONES": 1912, 1923,
// 1941-1945, 1961, 1967, 1999, 2012, 2024) and the "Est. 1911" band on the entrance doors.
// What happened in each year is not in the repo, so the game does not say.

import { h } from "../ui/dom";
import { miniFrame, pyBox } from "./snake";

interface Year {
  label: string;
  /** what the card is sorted by: the first year of a span */
  y: number;
}

const WALL: Year[] = [
  { label: "1912", y: 1912 },
  { label: "1923", y: 1923 },
  { label: "1941-1945", y: 1941 },
  { label: "1961", y: 1961 },
  { label: "1967", y: 1967 },
  { label: "1999", y: 1999 },
  { label: "2012", y: 2012 },
  { label: "2024", y: 2024 },
];

export const HISTORY_POSTCARD = {
  id: "story-history",
  title: "HKU History: The Milestones",
  zh: "港大历史",
  fact: "In the exhibition lounge on CDS-1 14/F, round drums carry a timeline headed HKU HISTORY | THE MILESTONES. Its labels run from 1912 to 2024. The entrance doors downstairs say Est. 1911.",
};

function shuffle<T>(a: T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

const inOrder = (a: Year[]): boolean => a.every((c, i) => i === 0 || a[i - 1].y < c.y);

/** resolves true when the five years are in order, false when the player left before that */
export function playHistory(): Promise<boolean> {
  return new Promise((resolve) => {
    let cards = shuffle(WALL).slice(0, 5);
    while (inOrder(cards)) cards = shuffle(cards);
    const start = cards.slice();
    const goal = cards.slice().sort((a, b) => a.y - b.y);
    let sel = -1;
    let won = false;
    let done = false;
    /** set after a check: which places were right at that moment */
    let marks: boolean[] | null = null;
    let checks = 0;

    const wall = h("div", { class: "mg2-wall" });
    const check = h("button", { class: "btn primary", type: "button", "data-mg2": "check" }, "Check the order");
    const doneBtn = h("button", { class: "btn primary mg2-hidden", type: "button", "data-mg2": "done" }, "Done");

    const finish = () => {
      if (done) return;
      done = true;
      f.close();
      resolve(won);
    };

    const f = miniFrame({
      kind: "history",
      kicker: "CDS-1 14/F · exhibition lounge · optional",
      title: "The Milestones wall",
      zh: "里程碑时间线",
      intro: "In the exhibition lounge on 14/F, round drums carry a timeline headed HKU HISTORY | THE MILESTONES. Here are five of the years printed on it. Put them in order, earliest on the left. Tap two cards to swap them, or use the small arrows. A clue from the front doors: Est. 1911, so every year on the wall comes after that.",
      how: () => {
        const nums = start.map((c) => c.y);
        const span = start.some((c) => c.label !== String(c.y));
        return [
          "The rule in plain words: look at two cards that sit side by side. If the left one is the later year, swap them. Keep doing that until no pair needs a swap. You just did this by hand, and so does a computer.",
          h("p", { class: "then" }, won ? `You needed ${checks} ${checks === 1 ? "check" : "checks"}. Python sorts the same five cards in one line.` : "Python sorts the same five cards in one line. Finish the wall and compare."),
          pyBox("Your five cards in Python", `years = [${nums.join(", ")}]      # the order you were dealt${span ? "\n# 1941 stands for the 1941-1945 card" : ""}\nsorted(years)\n# [${goal.map((c) => c.y).join(", ")}]`),
        ];
      },
      onKey: (e) => {
        if (e.key === "Enter" && !won) {
          e.preventDefault();
          doCheck();
        }
      },
      onLeave: finish,
    });

    function swap(i: number, j: number): void {
      if (won || j < 0 || j >= cards.length) return;
      [cards[i], cards[j]] = [cards[j], cards[i]];
      sel = -1;
      marks = null;
      f.say("");
      render();
    }

    function render(): void {
      wall.replaceChildren(
        ...cards.map((c, i) => {
          const card = h("button", { class: `mg2-year ${c.label.length > 4 ? "long" : ""} ${i === sel ? "sel" : ""} ${marks?.[i] ? "ok" : ""}`, type: "button", "data-mg2": `year-${i}`, "data-year": c.label, disabled: won }, c.label);
          card.onclick = () => {
            if (sel === -1) {
              sel = i;
              render();
            } else if (sel === i) {
              sel = -1;
              render();
            } else swap(sel, i);
          };
          const left = h("button", { type: "button", "data-mg2": `left-${i}`, disabled: won || i === 0, onclick: () => swap(i, i - 1) }, "◀");
          const right = h("button", { type: "button", "data-mg2": `right-${i}`, disabled: won || i === cards.length - 1, onclick: () => swap(i, i + 1) }, "▶");
          return h("div", { class: "mg2-slot" }, h("div", { class: "pos" }, i === 0 ? "earliest" : i === cards.length - 1 ? "latest" : ""), card, h("div", { class: "mg2-nudge" }, left, right));
        }),
      );
    }

    function doCheck(): void {
      if (won) return;
      checks++;
      sel = -1;
      marks = cards.map((c, i) => c === goal[i]);
      const right = marks.filter(Boolean).length;
      if (right === cards.length) {
        won = true;
        check.classList.add("mg2-hidden");
        doneBtn.classList.remove("mg2-hidden");
        f.say(`In order! ${goal[0].label} comes first and ${goal[goal.length - 1].label} last, just like on the wall.`);
      } else f.say(right ? `${right} of ${cards.length} are in the right place (the green ones). Keep swapping.` : "None are in the right place yet. Which year is the earliest?", true);
      render();
    }

    check.onclick = () => doCheck();
    doneBtn.onclick = finish;
    f.actions.append(check, doneBtn);
    f.body.append(h("div", { class: "mg2-wall-wrap" }, wall));
    wall.before(h("div", { class: "mg2-wall-band", style: "color: var(--ink)" }, "HKU HISTORY | THE MILESTONES"));
    render();
  });
}
