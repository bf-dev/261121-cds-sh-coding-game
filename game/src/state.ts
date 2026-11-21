// Player progress, kept in localStorage so a refresh does not lose the climb.

import type { FnKind, Op } from "./battle/rules";
import { REWARDS } from "./data/cards";

export interface Progress {
  /** highest CDS1 floor beaten, 0 = none */
  cleared: number;
  bossBeaten: boolean;
  fns: FnKind[];
  ops: Op[];
  brackets: boolean;
  b5key: boolean;
  hallpass: boolean;
  /** carried power-ups */
  power: { redbull: number; gym: number; food: number };
  /** the floor count at which each Building 5 station was last used (one use per floor cleared) */
  used: { redbull: number; gym: number; food: number; study: number };
  /** how many study-stair functions were collected */
  studied: number;
  /** block ids whose pop-up was shown */
  seen: string[];
  /** info trigger ids discovered */
  found: string[];
  map: string;
  spawn: string;
}

const KEY = "cds-sh-coding-game-v1";

export function freshProgress(): Progress {
  return {
    cleared: 0,
    bossBeaten: false,
    fns: ["for1"],
    ops: ["+", "-"],
    brackets: false,
    b5key: false,
    hallpass: false,
    power: { redbull: 0, gym: 0, food: 0 },
    used: { redbull: -1, gym: -1, food: -1, study: -1 },
    studied: 0,
    seen: [],
    found: [],
    map: "outside",
    spawn: "start",
  };
}

export function loadProgress(): Progress | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p: Progress = { ...freshProgress(), ...JSON.parse(raw) };
    // older saves had fixed loop blocks; the repeat block is now one block with free numbers
    p.fns = p.fns.filter((f) => f !== "for2" && f !== "for3" && f !== "halve");
    return p;
  } catch {
    return null;
  }
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* private mode: play without saving */
  }
}

export function clearProgress(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}

// HP is kept low so a match is 2 to 4 rounds. The first floors are easy on purpose.
export const playerMaxHp = (p: Progress): number => 30 + 5 * p.cleared;
const ENEMY_HP = [14, 18, 24, 34, 40, 46, 58, 64, 70, 82, 88, 94, 102, 110];
export const enemyHp = (floor: number): number => ENEMY_HP[Math.max(1, Math.min(14, floor)) - 1];
export const BOSS_HP = 130;
export const BOSS_BONUS_HP = 10;

/** shield blocks you may plant in one battle, and the numbers dealt for them at the start of the battle */
export const shieldBlocksFor = (p: Progress): number => 2 + (p.cleared >= 5 ? 1 : 0) + (p.cleared >= 11 ? 1 : 0);
export const shieldDigitsFor = (p: Progress): number => shieldBlocksFor(p) * 2 + 1 + (p.studied >= 2 ? 2 : 0);

/** mark floor n as beaten and hand over its reward */
export function applyReward(p: Progress, floor: number): void {
  p.cleared = Math.max(p.cleared, floor);
  const r = REWARDS[floor];
  if (!r) return;
  if (r.fn && !p.fns.includes(r.fn)) p.fns.push(r.fn);
  if (r.op && !p.ops.includes(r.op)) p.ops.push(r.op);
  if (r.brackets) p.brackets = true;
  if (r.key) p.b5key = true;
  if (r.hallpass) p.hallpass = true;
  if (r.power) p.power[r.power] = Math.min(2, p.power[r.power] + 1);
}

/** a kit as if the player had climbed to this floor, for demo mode and the level select */
export function progressAtFloor(cleared: number): Progress {
  const p = freshProgress();
  for (let f = 1; f <= cleared; f++) applyReward(p, f);
  if (cleared >= 3) p.power = { redbull: Math.max(1, p.power.redbull), gym: 1, food: 1 };
  if (cleared >= 6) p.fns.push("ifge");
  p.studied = cleared >= 10 ? 2 : cleared >= 6 ? 1 : 0;
  p.seen = ["ATTACK", "HEAL", "number", ...p.ops, ...p.fns, "redbull", "gym", "food", ...(p.brackets ? ["brackets"] : [])];
  return p;
}
