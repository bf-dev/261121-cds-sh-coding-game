// The AI opponent on an OpenAI-compatible endpoint (the lab's DeepSeek gateway).
// Settings come from .env through the Vite proxy at /llm, see vite.config.ts.
// Anything wrong (no .env, timeout, bad JSON, illegal move) returns null and the
// caller plays the rule-based move instead.

import { evaluate, type Hand, type Move, type Op, type Shield, shieldText } from "./rules";

declare const __LLM_ENABLED__: boolean;
declare const __LLM_MODEL__: string;

export const llmEnabled = (): boolean => typeof __LLM_ENABLED__ !== "undefined" && __LLM_ENABLED__;

export interface LlmPlan {
  move: Move;
  digitIdx: number[];
  opIdx: number[];
  shield: number;
  say: string;
}

export interface LlmState {
  name: string;
  topic: string;
  skill: number;
  hand: Hand;
  slots: number;
  brackets: boolean;
  me: { hp: number; max: number };
  student: { hp: number; max: number };
  shields: Shield[];
}

const SYSTEM = (s: LlmState) => `You are ${s.name}, a friendly teacher at HKU School of Computing and Data Science in Shanghai. You teach ${s.topic}.
You are playing a turn-based block-coding battle against a visiting student. You are a challenger, not a villain.
Rules:
- Your move is HEAL or ATTACK, then one base digit, then up to ${s.slots} operator+digit pairs, using only digits and operators from your hand. Each hand block can be used once.
- Normal precedence: × and ÷ before + and -. ${s.brackets ? "One pair of brackets is allowed." : "No brackets."} Never divide by zero.
- ATTACK takes the value off the student's HP, minus their shield. HEAL gives the value to you and ignores shields.
- You also pick one of your shield functions (by index) for the student's next attack.
- Difficulty ${s.skill.toFixed(2)} of 1: at low difficulty play a modest move, at high difficulty play your strongest.
Reply with JSON only: {"verb":"ATTACK"|"HEAL","expr":"8+2*3","shield":0,"say":"one short sentence that explains the coding idea behind your move to a beginner"}
Write expr with digits, + - * / and optional ( ). No other text.`;

function parseExpr(expr: string, hand: Hand, slots: number, brackets: boolean): Omit<LlmPlan, "shield" | "say" | "move"> & { m: Omit<Move, "verb"> } | null {
  const s = expr.replace(/\s+/g, "").replace(/[x×]/g, "*").replace(/÷/g, "/");
  if (!/^[1-9()+\-*/]+$/.test(s)) return null;
  const digits: number[] = [];
  const ops: Op[] = [];
  let open = -1;
  let bracket: [number, number] | undefined;
  let expectDigit = true;
  for (const ch of s) {
    if (ch === "(") {
      if (!brackets || open >= 0 || bracket || !expectDigit) return null;
      open = digits.length;
    } else if (ch === ")") {
      if (open < 0 || expectDigit) return null;
      bracket = [open, digits.length - 1];
      open = -1;
    } else if (/[1-9]/.test(ch)) {
      if (!expectDigit) return null;
      digits.push(Number(ch));
      expectDigit = false;
    } else {
      if (expectDigit) return null;
      ops.push(ch === "*" ? "×" : ch === "/" ? "÷" : (ch as Op));
      expectDigit = true;
    }
  }
  if (expectDigit || open >= 0 || ops.length > slots) return null;
  if (bracket && (bracket[1] <= bracket[0] || (bracket[0] === 0 && bracket[1] === digits.length - 1))) bracket = undefined;
  // every block must come from the hand, each used once
  const dPool = hand.digits.map((d, i) => ({ d, i }));
  const oPool = hand.ops.map((o, i) => ({ o, i }));
  const digitIdx: number[] = [];
  const opIdx: number[] = [];
  for (const d of digits) {
    const k = dPool.findIndex((x) => x.d === d);
    if (k < 0) return null;
    digitIdx.push(dPool.splice(k, 1)[0].i);
  }
  for (const o of ops) {
    const k = oPool.findIndex((x) => x.o === o);
    if (k < 0) return null;
    opIdx.push(oPool.splice(k, 1)[0].i);
  }
  const m = { digits, ops, bracket };
  if (!evaluate(m)) return null;
  return { m, digitIdx, opIdx };
}

/** Ask the model for this round's move and shield. Resolves null on any problem. */
export async function llmPlan(state: LlmState, timeoutMs = 2000): Promise<LlmPlan | null> {
  if (!llmEnabled()) return null;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const user = JSON.stringify({
      your_hp: state.me.hp,
      your_max_hp: state.me.max,
      student_hp: state.student.hp,
      student_max_hp: state.student.max,
      hand_digits: state.hand.digits,
      hand_operators: state.hand.ops.map((o) => (o === "×" ? "*" : o === "÷" ? "/" : o)),
      max_operators: state.slots,
      shields: state.shields.map((sh, i) => `${i}: ${shieldText(sh)}`),
    });
    const res = await fetch("llm/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ctl.signal,
      body: JSON.stringify({
        model: __LLM_MODEL__,
        temperature: 0.6,
        max_tokens: 160,
        messages: [
          { role: "system", content: SYSTEM(state) },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "";
    const json = /\{[\s\S]*\}/.exec(content)?.[0];
    if (!json) return null;
    const out = JSON.parse(json);
    const verb = out.verb === "HEAL" ? "HEAL" : out.verb === "ATTACK" ? "ATTACK" : null;
    if (!verb || typeof out.expr !== "string") return null;
    const parsed = parseExpr(out.expr, state.hand, state.slots, state.brackets);
    if (!parsed) return null;
    const shield = Number.isInteger(out.shield) && out.shield >= 0 && out.shield < state.shields.length ? out.shield : 0;
    const say = typeof out.say === "string" ? out.say.replace(/—/g, ",").slice(0, 160) : "";
    return { move: { verb, ...parsed.m }, digitIdx: parsed.digitIdx, opIdx: parsed.opIdx, shield, say };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
