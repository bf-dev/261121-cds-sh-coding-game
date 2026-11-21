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
    return { ...freshProgress(), ...JSON.parse(raw) };
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

// HP grows with the floors because moves grow: 2 operator slots hit for about 10, 6 slots for about 80.
export const playerMaxHp = (p: Progress): number => 30 + 10 * p.cleared;
const ENEMY_HP = [20, 30, 40, 60, 66, 72, 110, 120, 130, 140, 150, 160, 170, 180];
export const enemyHp = (floor: number): number => ENEMY_HP[Math.max(1, Math.min(14, floor)) - 1];
export const BOSS_HP = 180;
export const BOSS_BONUS_HP = 20;

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
  if (cleared >= 10) p.fns.push("for3");
  p.studied = cleared >= 10 ? 2 : cleared >= 6 ? 1 : 0;
  p.seen = ["ATTACK", "HEAL", "number", ...p.ops, ...p.fns, "redbull", "gym", "food", ...(p.brackets ? ["brackets"] : [])];
  return p;
}
