// Scratch-style blocks as DOM. Moves and shields are shown as snapping blocks instead of
// cards or code text (Insung, 2026-11-21). The Python line is an optional extra.

import { h } from "../ui/dom";
import { toTree, type Move, type Op, type Shield, type Tree, type Verb } from "./rules";
import type { PowerUpKind } from "../engine/types";

export function pill(n: number | string | null, extra = ""): HTMLElement {
  const empty = n === null || (typeof n === "number" && Number.isNaN(n));
  return h("span", { class: `pill ${empty ? "empty" : ""} ${extra}` }, empty ? "" : String(n));
}

export function exprEl(t: Tree): HTMLElement {
  if ("n" in t) return pill(t.n);
  return h("span", { class: `opnode ${t.grouped ? "grouped" : ""}` }, exprEl(t.l), h("span", { class: "sym" }, t.op), exprEl(t.r));
}

export function hatBlock(label: string): HTMLElement {
  return h("div", { class: "blk hat" }, h("span", { class: "flag" }), label);
}

export function verbBlock(verb: Verb): HTMLElement {
  return h("div", { class: `blk stack ${verb === "ATTACK" ? "attack" : "heal"}` }, h("span", { class: `ico ${verb === "ATTACK" ? "sword" : "heart"}` }), verb);
}

/** the move as one block: ATTACK ( 8 + ( 2 × 3 ) ). value = shown after an equals sign when known */
export function moveBlock(m: Pick<Move, "verb" | "digits" | "ops" | "bracket">, value?: number | null): HTMLElement {
  const el = h("div", { class: `blk stack move ${m.verb === "ATTACK" ? "attack" : "heal"}`, "data-part": "move" });
  el.append(h("span", { class: `ico ${m.verb === "ATTACK" ? "sword" : "heart"}` }), h("span", { class: "verb" }, m.verb));
  if (m.digits.length === 0 && m.ops.length === 0) el.append(pill(null));
  else el.append(exprEl(toTree(m)));
  if (value !== undefined && value !== null) el.append(h("span", { class: "eq" }, "="), h("span", { class: "pill result" }, String(value)));
  return el;
}

const varChip = () => h("span", { class: "varchip" }, "damage");

function change(by: number, part: string): HTMLElement {
  return h("div", { class: "blk stack var", "data-part": part }, "change ", varChip(), " by ", Number.isFinite(by) ? pill(`-${by}`) : pill(null));
}

function bool(cmp: string, n: number): HTMLElement {
  return h("span", { class: "bool" }, varChip(), h("span", { class: "sym" }, cmp), pill(n));
}

/** a built-in function call, drawn as a purple bubble: len( numbers ) */
function fnCall(name: string, ...args: (Node | string)[]): HTMLElement {
  return h("span", { class: "opnode fn", "data-part": "head" }, h("span", { class: "sym" }, name), ...args);
}

const numsChip = () => h("span", { class: "varchip" }, "numbers");
const tens = (n: number) => pill(Number.isFinite(n) ? n * 10 : NaN);

/** a function shield as a C-shaped control block (or one stack block for a function call) */
export function shieldBlock(s: Shield): HTMLElement {
  const body = (el: HTMLElement) => h("div", { class: "cblk-body" }, el);
  const c = h("div", { class: "cblk", "data-kind": s.kind });
  const line = (...kids: (Node | string)[]) => {
    c.classList.add("flat");
    c.append(h("div", { class: "blk stack var", "data-part": "body" }, ...kids));
    return c;
  };
  switch (s.kind) {
    case "round":
      return line("set ", varChip(), " to ", fnCall("round", varChip(), h("span", { class: "sym" }, "÷"), pill(2)));
    case "len":
      return line("change ", varChip(), " by −", fnCall("len", numsChip()), h("span", { class: "sym" }, "×"), pill(s.a));
    case "sorted":
      return line("change ", varChip(), " by − middle of ", fnCall("sorted", tens(s.a), tens(s.b), tens(s.c ?? NaN)));
    case "filter":
      return line("change ", varChip(), " by − sum of ", fnCall("filter", numsChip(), h("span", { class: "sym" }, ">"), pill(s.a)));
  }
  const head = (...kids: (Node | string)[]) => h("div", { class: "cblk-head", "data-part": "head" }, ...kids);
  switch (s.kind) {
    case "for1":
    case "for2":
    case "for3":
      c.append(head("repeat ", pill(s.a), " times"), body(change(s.b, "body")));
      break;
    case "halve":
      c.append(head("repeat ", pill(s.a), " times"), body(h("div", { class: "blk stack var", "data-part": "body" }, "set ", varChip(), " to ", h("span", { class: "opnode" }, varChip(), h("span", { class: "sym" }, "÷"), pill(2)))));
      break;
    case "ifgt":
      c.append(head("if ", bool(">", s.a), " then"), body(change(s.b, "body")));
      break;
    case "ifge":
      c.append(head("if ", bool("≥", s.a), " then"), body(change(s.b, "body")));
      break;
    case "iflt":
      c.append(head("if ", bool("<", s.a), " then"), body(h("div", { class: "blk stack var", "data-part": "body" }, "set ", varChip(), " to ", pill(0))));
      break;
    case "ifelse":
      c.append(head("if ", bool(">", s.a), " then"), body(change(s.b, "body")), h("div", { class: "cblk-mid" }, "else"), body(change(s.c ?? NaN, "else")));
      break;
    case "while":
      c.append(head("repeat while ", bool(">", s.a * 10)), body(change(s.b, "body")));
      break;
    default:
      break;
  }
  c.append(h("div", { class: "cblk-foot" }));
  return c;
}

export function hiddenShield(): HTMLElement {
  return h("div", { class: "cblk hidden" }, h("div", { class: "cblk-head" }, h("span", { class: "ico shield" }), "shield planted"), h("div", { class: "cblk-body" }, h("div", { class: "blk stack var" }, "? ? ?")), h("div", { class: "cblk-foot" }));
}

export function opBlock(op: Op): HTMLElement {
  return h("span", { class: "opnode palette" }, pill(null), h("span", { class: "sym" }, op), pill(null));
}

const POWER_LABEL: Record<Exclude<PowerUpKind, "study">, [string, string]> = {
  redbull: ["drink Red Bull", "extra turn"],
  gym: ["gym session", "+1/3 HP"],
  food: ["eat Meituan meal", "+1/4 HP"],
};

export function powerBlock(kind: Exclude<PowerUpKind, "study">, count?: number): HTMLElement {
  const [label, effect] = POWER_LABEL[kind];
  return h("div", { class: `blk stack power ${kind}` }, h("span", { class: `ico ${kind}` }), label, h("span", { class: "pill small" }, effect), count !== undefined && count > 1 ? h("span", { class: "count" }, `×${count}`) : null);
}

/** picture of a block for the pop-ups and the bag */
export function cardPicture(id: string): HTMLElement {
  const sample: Record<string, () => HTMLElement> = {
    ATTACK: () => moveBlock({ verb: "ATTACK", digits: [8], ops: [] }, 8),
    HEAL: () => moveBlock({ verb: "HEAL", digits: [5], ops: [] }, 5),
    number: () => h("span", { class: "row" }, pill(1), pill(5), pill(9)),
    "+": () => moveBlock({ verb: "ATTACK", digits: [4, 3], ops: ["+"] }, 7),
    "-": () => moveBlock({ verb: "ATTACK", digits: [9, 4], ops: ["-"] }, 5),
    "×": () => moveBlock({ verb: "ATTACK", digits: [8, 2, 3], ops: ["+", "×"] }, 14),
    "÷": () => moveBlock({ verb: "ATTACK", digits: [8, 2, 5], ops: ["÷", "+"] }, 9),
    brackets: () => moveBlock({ verb: "ATTACK", digits: [2, 3, 5], ops: ["+", "×"], bracket: [0, 1] }, 25),
    for1: () => shieldBlock({ kind: "for1", a: 3, b: 2 }),
    for2: () => shieldBlock({ kind: "for2", a: 3, b: 2 }),
    for3: () => shieldBlock({ kind: "for3", a: 4, b: 3 }),
    halve: () => shieldBlock({ kind: "halve", a: 2, b: 2 }),
    ifgt: () => shieldBlock({ kind: "ifgt", a: 5, b: 5 }),
    ifge: () => shieldBlock({ kind: "ifge", a: 6, b: 8 }),
    iflt: () => shieldBlock({ kind: "iflt", a: 7, b: 0 }),
    ifelse: () => shieldBlock({ kind: "ifelse", a: 6, b: 8, c: 2 }),
    while: () => shieldBlock({ kind: "while", a: 2, b: 3 }),
    round: () => shieldBlock({ kind: "round", a: 0, b: 0 }),
    len: () => shieldBlock({ kind: "len", a: 4, b: 0 }),
    sorted: () => shieldBlock({ kind: "sorted", a: 6, b: 2, c: 4 }),
    filter: () => shieldBlock({ kind: "filter", a: 4, b: 0 }),
    redbull: () => powerBlock("redbull"),
    gym: () => powerBlock("gym"),
    food: () => powerBlock("food"),
  };
  return h("div", { class: "card-picture" }, (sample[id] ?? sample.number)());
}
