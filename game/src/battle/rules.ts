// Battle rules, no DOM. Follows docs/decisions.md #4 to #17.

export type Op = "+" | "-" | "×" | "÷";
export type Verb = "ATTACK" | "HEAL";

/** HEAL|ATTACK, one base digit, then operator + digit pairs. bracket = inclusive range of term indexes done first. */
export interface Move {
  verb: Verb;
  digits: number[];
  ops: Op[];
  bracket?: [number, number];
}

export type Tree = { n: number } | { op: Op; l: Tree; r: Tree; grouped?: boolean };

const PREC: Record<Op, number> = { "+": 1, "-": 1, "×": 2, "÷": 2 };

function treeOfFlat(terms: Tree[], ops: Op[]): Tree {
  // multiply and divide first (left to right), then add and subtract
  const t = terms.slice();
  const o = ops.slice();
  for (const level of [2, 1]) {
    for (let i = 0; i < o.length; ) {
      if (PREC[o[i]] === level) {
        t.splice(i, 2, { op: o[i], l: t[i], r: t[i + 1] });
        o.splice(i, 1);
      } else i++;
    }
  }
  return t[0];
}

/** Expression tree with normal precedence. Missing digits (NaN) stay as holes. */
export function toTree(m: Pick<Move, "digits" | "ops" | "bracket">): Tree {
  const terms: Tree[] = m.digits.map((n) => ({ n }));
  while (terms.length < m.ops.length + 1) terms.push({ n: NaN });
  const ops = m.ops.slice();
  const b = m.bracket;
  if (b && b[1] > b[0] && b[1] < terms.length && !(b[0] === 0 && b[1] === terms.length - 1)) {
    const inner = treeOfFlat(terms.slice(b[0], b[1] + 1), ops.slice(b[0], b[1]));
    if ("op" in inner) inner.grouped = true;
    terms.splice(b[0], b[1] - b[0] + 1, inner);
    ops.splice(b[0], b[1] - b[0]);
  }
  return treeOfFlat(terms, ops);
}

export interface EvalStep {
  text: string; // "2 × 3 = 6"
  value: number;
}

/** Evaluate. Returns null if any divisor is zero (the move is rejected). steps = the order the sub-results are computed. */
export function evaluate(m: Pick<Move, "digits" | "ops" | "bracket">): { value: number; steps: EvalStep[] } | null {
  const steps: EvalStep[] = [];
  let bad = false;
  const walk = (t: Tree): number => {
    if ("n" in t) return t.n;
    const a = walk(t.l);
    const b = walk(t.r);
    let v: number;
    if (t.op === "+") v = a + b;
    else if (t.op === "-") v = a - b;
    else if (t.op === "×") v = a * b;
    else {
      if (Math.abs(b) < 1e-9) {
        bad = true;
        return 0;
      }
      v = a / b;
    }
    steps.push({ text: `${fmt(a)} ${t.op} ${fmt(b)} = ${fmt(v)}`, value: v });
    return v;
  };
  const value = walk(toTree(m));
  if (bad || !Number.isFinite(value)) return null;
  return { value, steps };
}

export function fmt(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return String(Math.round(v * 100) / 100);
}

/** what a move finally counts for: rounded down, never below 0 */
export function moveValue(m: Move): number | null {
  const e = evaluate(m);
  return e ? Math.max(0, Math.floor(e.value + 1e-9)) : null;
}

export function exprText(m: Pick<Move, "digits" | "ops" | "bracket">, py = false): string {
  const sym = (o: Op) => (py ? (o === "×" ? "*" : o === "÷" ? "/" : o) : o);
  const out: string[] = [];
  const b = m.bracket && m.bracket[1] > m.bracket[0] ? m.bracket : undefined;
  m.digits.forEach((d, i) => {
    if (i > 0) out.push(sym(m.ops[i - 1]));
    out.push(`${b && b[0] === i ? "(" : ""}${d}${b && b[1] === i ? ")" : ""}`);
  });
  return out.join(" ");
}

export function movePython(m: Move): string {
  const v = moveValue(m);
  const name = m.verb === "ATTACK" ? "damage" : "heal";
  return `${name} = ${exprText(m, true)}  # ${v ?? "error"}`;
}

/** all bracket placements for n terms: contiguous, at least 2 terms, not the whole expression */
export function bracketOptions(n: number): ([number, number] | undefined)[] {
  const out: ([number, number] | undefined)[] = [undefined];
  for (let len = 2; len < n; len++) for (let i = 0; i + len <= n; i++) out.push([i, i + len - 1]);
  return out;
}

// ---------------------------------------------------------------- shields (functions, defence only)

export type FnKind = "for1" | "for2" | "for3" | "ifgt" | "ifge" | "iflt" | "ifelse" | "while" | "halve";

export interface Shield {
  kind: FnKind;
  a: number;
  b: number;
  c?: number;
}

export interface TraceStep {
  /** which line of the block is running: "head" (the loop / test) or "body" / "else" */
  part: "head" | "body" | "else" | "done";
  text: string;
  damage: number;
}

const down = (d: number, k: number) => Math.max(0, d - k);

/** Run a shield on incoming damage. The trace drives the step-by-step animation. */
export function runShield(s: Shield, incoming: number): { trace: TraceStep[]; final: number } {
  let d = incoming;
  const trace: TraceStep[] = [];
  const push = (part: TraceStep["part"], text: string) => trace.push({ part, text, damage: d });
  switch (s.kind) {
    case "for1":
    case "for2":
    case "for3":
      for (let i = 0; i < s.a; i++) {
        const before = d;
        d = down(d, s.b);
        push("body", `loop ${i + 1} of ${s.a}: damage ${fmt(before)} - ${s.b} = ${fmt(d)}`);
      }
      break;
    case "halve":
      for (let i = 0; i < s.a; i++) {
        const before = d;
        d = d / 2;
        push("body", `loop ${i + 1} of ${s.a}: damage ${fmt(before)} ÷ 2 = ${fmt(d)}`);
      }
      break;
    case "ifgt":
    case "ifge": {
      const yes = s.kind === "ifgt" ? d > s.a : d >= s.a;
      push("head", `is ${fmt(d)} ${s.kind === "ifgt" ? ">" : "≥"} ${s.a}? ${yes ? "Yes" : "No, skip the inside"}`);
      if (yes) {
        const before = d;
        d = down(d, s.b);
        push("body", `damage ${fmt(before)} - ${s.b} = ${fmt(d)}`);
      }
      break;
    }
    case "iflt": {
      const yes = d < s.a;
      push("head", `is ${fmt(d)} < ${s.a}? ${yes ? "Yes" : "No, skip the inside"}`);
      if (yes) {
        d = 0;
        push("body", `damage is set to 0`);
      }
      break;
    }
    case "ifelse": {
      const yes = d > s.a;
      push("head", `is ${fmt(d)} > ${s.a}? ${yes ? "Yes: run the first part" : "No: run the else part"}`);
      const before = d;
      d = down(d, yes ? s.b : s.c ?? 0);
      push(yes ? "body" : "else", `damage ${fmt(before)} - ${yes ? s.b : s.c ?? 0} = ${fmt(d)}`);
      break;
    }
    case "while": {
      let guard = 0;
      while (d > s.a && guard++ < 200) {
        const before = d;
        d = down(d, s.b);
        push("body", `${fmt(before)} > ${s.a}, so damage ${fmt(before)} - ${s.b} = ${fmt(d)}`);
      }
      push("head", `is ${fmt(d)} > ${s.a}? No, the loop stops`);
      break;
    }
  }
  const final = Math.max(0, Math.floor(d + 1e-9));
  if (final !== d) {
    d = final;
    push("done", `rounded down to ${final}`);
  }
  return { trace, final };
}

export function shieldPython(s: Shield): string[] {
  switch (s.kind) {
    case "for1":
    case "for2":
    case "for3":
      return [`for i in range(${s.a}):`, `    damage -= ${s.b}`];
    case "halve":
      return [`for i in range(${s.a}):`, `    damage /= 2`];
    case "ifgt":
      return [`if damage > ${s.a}:`, `    damage -= ${s.b}`];
    case "ifge":
      return [`if damage >= ${s.a}:`, `    damage -= ${s.b}`];
    case "iflt":
      return [`if damage < ${s.a}:`, `    damage = 0`];
    case "ifelse":
      return [`if damage > ${s.a}:`, `    damage -= ${s.b}`, `else:`, `    damage -= ${s.c ?? 0}`];
    case "while":
      return [`while damage > ${s.a}:`, `    damage -= ${s.b}`];
  }
}

/** short text form, e.g. "for range 3: -2" (the meeting's notation) */
export function shieldText(s: Shield): string {
  switch (s.kind) {
    case "for1":
    case "for2":
    case "for3":
      return `repeat ${s.a}: damage - ${s.b}`;
    case "halve":
      return `repeat ${s.a}: damage ÷ 2`;
    case "ifgt":
      return `if damage > ${s.a}: damage - ${s.b}`;
    case "ifge":
      return `if damage ≥ ${s.a}: damage - ${s.b}`;
    case "iflt":
      return `if damage < ${s.a}: damage = 0`;
    case "ifelse":
      return `if damage > ${s.a}: - ${s.b}, else: - ${s.c ?? 0}`;
    case "while":
      return `while damage > ${s.a}: damage - ${s.b}`;
  }
}

export type Rnd = () => number;
const ri = (r: Rnd, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));

/** Roll the digits for a function block. Every number is a digit 1 to 9. */
export function rollShield(kind: FnKind, r: Rnd): Shield {
  switch (kind) {
    case "for1":
      return { kind, a: ri(r, 2, 5), b: 1 };
    case "for2":
      return { kind, a: ri(r, 2, 6), b: 2 };
    case "for3":
      return { kind, a: ri(r, 3, 7), b: 3 };
    case "halve":
      return { kind, a: ri(r, 1, 2), b: 2 };
    case "ifgt": {
      const a = ri(r, 3, 9);
      return { kind, a, b: Math.min(9, a + ri(r, 0, 1)) };
    }
    case "ifge": {
      const a = ri(r, 5, 9);
      return { kind, a, b: ri(r, 6, 9) };
    }
    case "iflt":
      return { kind, a: ri(r, 5, 9), b: 0 };
    case "ifelse":
      return { kind, a: ri(r, 5, 9), b: ri(r, 6, 9), c: ri(r, 1, 3) };
    case "while":
      return { kind, a: ri(r, 6, 9), b: ri(r, 2, 5) };
  }
}

// ---------------------------------------------------------------- hands

export interface Hand {
  digits: number[];
  ops: Op[];
}

const OP_WEIGHT: Record<Op, number> = { "+": 0.36, "-": 0.22, "×": 0.26, "÷": 0.16 };

export function drawOp(allowed: Op[], r: Rnd): Op {
  const total = allowed.reduce((a, o) => a + OP_WEIGHT[o], 0);
  let x = r() * total;
  for (const o of allowed) {
    x -= OP_WEIGHT[o];
    if (x <= 0) return o;
  }
  return allowed[0];
}

export const drawDigit = (r: Rnd): number => ri(r, 1, 9);

/** slots operators need slots + 1 digits, so the hand is slots + 1 digits and slots operators (5 blocks at 2 slots) */
export function dealHand(slots: number, allowed: Op[], r: Rnd): Hand {
  return {
    digits: Array.from({ length: slots + 1 }, () => drawDigit(r)),
    ops: Array.from({ length: slots }, () => drawOp(allowed, r)),
  };
}

/** replace the blocks a move used with new random ones (decision #9) */
export function refill(hand: Hand, usedDigitIdx: number[], usedOpIdx: number[], allowed: Op[], r: Rnd): void {
  for (const i of usedDigitIdx) hand.digits[i] = drawDigit(r);
  for (const i of usedOpIdx) hand.ops[i] = drawOp(allowed, r);
}

export function slotsForFloor(floor: number): number {
  // 2 operator slots on floor 1, plus 1 every 3 floors, up to 6
  return Math.min(6, 2 + Math.floor((Math.max(1, floor) - 1) / 3));
}

// ---------------------------------------------------------------- rule-based opponent

export interface Candidate {
  move: Omit<Move, "verb">;
  digitIdx: number[];
  opIdx: number[];
  value: number;
}

/** sample legal expressions from a hand */
export function candidates(hand: Hand, slots: number, brackets: boolean, r: Rnd, samples = 400): Candidate[] {
  const out: Candidate[] = [];
  const seen = new Set<string>();
  const maxOps = Math.min(slots, hand.ops.length, hand.digits.length - 1);
  for (let s = 0; s < samples; s++) {
    const k = s < 40 ? maxOps : ri(r, 0, maxOps);
    const dIdx = shuffle(hand.digits.map((_, i) => i), r).slice(0, k + 1);
    const oIdx = shuffle(hand.ops.map((_, i) => i), r).slice(0, k);
    const m: Omit<Move, "verb"> = { digits: dIdx.map((i) => hand.digits[i]), ops: oIdx.map((i) => hand.ops[i]) };
    if (brackets && k >= 2 && r() < 0.4) {
      const opts = bracketOptions(k + 1);
      m.bracket = opts[ri(r, 1, opts.length - 1)];
    }
    const key = exprText(m);
    if (seen.has(key)) continue;
    seen.add(key);
    const e = evaluate(m);
    if (!e) continue;
    out.push({ move: m, digitIdx: dIdx, opIdx: oIdx, value: Math.max(0, Math.floor(e.value + 1e-9)) });
  }
  return out.sort((a, b) => a.value - b.value);
}

function shuffle<T>(a: T[], r: Rnd): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface Side {
  hp: number;
  max: number;
}

/** skill 0..1: low skill picks middling moves, high skill picks the best and heals at the right time */
export function ruleMove(hand: Hand, slots: number, brackets: boolean, me: Side, foe: Side, skill: number, r: Rnd): { move: Move; cand: Candidate } {
  const c = candidates(hand, slots, brackets, r);
  if (!c.length) {
    const cand: Candidate = { move: { digits: [hand.digits[0]], ops: [] }, digitIdx: [0], opIdx: [], value: hand.digits[0] };
    return { move: { verb: "ATTACK", ...cand.move }, cand };
  }
  const best = c[c.length - 1];
  const q = Math.min(1, 0.4 + 0.6 * skill + (r() - 0.5) * 0.2);
  const pick = c[Math.min(c.length - 1, Math.max(0, Math.round(q * (c.length - 1))))];
  const missing = me.max - me.hp;
  const canKill = best.value >= foe.hp + 4;
  if (canKill && r() < 0.5 + skill * 0.5) return { move: { verb: "ATTACK", ...best.move }, cand: best };
  if (me.hp <= me.max * 0.38 && missing >= 6 && r() < 0.45 + 0.4 * skill) {
    // heal: the smallest candidate that covers what is missing, else the biggest
    const h = c.find((x) => x.value >= missing) ?? best;
    return { move: { verb: "HEAL", ...h.move }, cand: h };
  }
  return { move: { verb: "ATTACK", ...pick.move }, cand: pick };
}

/** one-line teaching comment for a move */
export function explainMove(m: Move): string {
  const v = moveValue(m);
  const hasMul = m.ops.some((o) => o === "×" || o === "÷");
  const hasAdd = m.ops.some((o) => o === "+" || o === "-");
  if (m.verb === "HEAL") return `HEAL ${exprText(m)} gives me ${v} HP. Shields only block ATTACK, so yours does nothing.`;
  if (m.bracket) return `Brackets go first, so ${exprText(m)} makes ${v}.`;
  if (hasMul && hasAdd) return `× and ÷ go before + and -, so ${exprText(m)} makes ${v}.`;
  if (m.ops.length === 0) return `Just the base number: ${v}.`;
  return `${exprText(m)} makes ${v}. I read it left to right.`;
}

export function explainShield(s: Shield, incoming: number, final: number): string {
  const off = incoming - final;
  switch (s.kind) {
    case "for1":
    case "for2":
    case "for3":
      return `My loop ran ${s.a} times, ${s.b} off each time: ${s.a} × ${s.b} = ${s.a * s.b} blocked.`;
    case "halve":
      return `My loop halved your damage ${s.a} time${s.a > 1 ? "s" : ""}: ${incoming} became ${final}.`;
    case "ifgt":
    case "ifge":
    case "iflt":
      return off > 0 ? `My if was true for ${incoming}, so it blocked ${off}.` : `My if was false for ${incoming}, so nothing was blocked. Well aimed!`;
    case "ifelse":
      return `if / else always runs one of its two parts. This time it blocked ${off}.`;
    case "while":
      return off > 0 ? `My while loop kept going until damage was ${s.a} or less.` : `${incoming} was not more than ${s.a}, so my while loop never ran.`;
  }
}
