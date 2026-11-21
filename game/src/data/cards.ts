// Every block the player can meet, with the text for its first-time pop-up (decision #17).

import type { FnKind, Op } from "../battle/rules";
import type { PowerUpKind } from "../engine/types";

export interface CardInfo {
  id: string;
  group: "base" | "number" | "operator" | "function" | "power-up";
  name: string;
  nameZh: string;
  /** what it does, one or two short sentences */
  does: string;
  /** a worked example */
  example: string;
  /** the same thing in Python */
  python: string;
}

export const CARDS: Record<string, CardInfo> = {
  ATTACK: { id: "ATTACK", group: "base", name: "ATTACK", nameZh: "攻击", does: "Takes HP off your opponent. You always have this block.", example: "ATTACK 8 takes 8 HP off, minus whatever their shield blocks.", python: "damage = 8" },
  HEAL: { id: "HEAL", group: "base", name: "HEAL", nameZh: "治疗", does: "Gives HP back to you. Shields do nothing against it. You always have this block.", example: "HEAL 5 gives you 5 HP.", python: "heal = 5" },
  number: { id: "number", group: "number", name: "Number blocks 1 to 9", nameZh: "数字积木", does: "Every move starts with one number. There is no zero. Numbers are random and you get a new one after you use one.", example: "ATTACK 8 starts at 8.", python: "8" },
  "+": { id: "+", group: "operator", name: "+ plus", nameZh: "加号", does: "Adds a number to your move.", example: "ATTACK 4 + 3 hits for 7.", python: "damage = 4 + 3  # 7" },
  "-": { id: "-", group: "operator", name: "- minus", nameZh: "减号", does: "Takes a number away from your move. Useful to hit an exact value.", example: "ATTACK 9 - 4 hits for 5.", python: "damage = 9 - 4  # 5" },
  "×": { id: "×", group: "operator", name: "× times", nameZh: "乘号", does: "Multiplies. It always goes before + and -, so the inner bubble is worked out first.", example: "ATTACK 8 + 2 × 3: first 2 × 3 = 6, then 8 + 6 = 14.", python: "damage = 8 + 2 * 3  # 14" },
  "÷": { id: "÷", group: "operator", name: "÷ divide", nameZh: "除号", does: "Divides. It also goes before + and -. You can never divide by zero, the game stops you.", example: "ATTACK 8 ÷ 2 + 5: first 8 ÷ 2 = 4, then 4 + 5 = 9.", python: "damage = 8 / 2 + 5  # 9" },
  brackets: { id: "brackets", group: "operator", name: "( ) brackets", nameZh: "括号", does: "The Group button wraps part of your move in its own bubble. That part is worked out first.", example: "(2 + 3) × 5 = 25, but 2 + 3 × 5 = 17.", python: "damage = (2 + 3) * 5  # 25" },
  for1: { id: "for1", group: "function", name: "repeat (for loop)", nameZh: "重复 (for 循环)", does: "A shield. It repeats the block inside it a set number of times. Each time, 1 damage is taken off.", example: "repeat 3: damage - 1 turns a 7 hit into 4.", python: "for i in range(3):\n    damage -= 1" },
  for2: { id: "for2", group: "function", name: "repeat, 2 each time", nameZh: "重复 (每次减 2)", does: "A stronger loop shield. Each time round, 2 damage is taken off.", example: "repeat 3: damage - 2 turns a 14 hit into 8.", python: "for i in range(3):\n    damage -= 2" },
  for3: { id: "for3", group: "function", name: "repeat, 3 each time", nameZh: "重复 (每次减 3)", does: "The strongest plain loop. Each time round, 3 damage is taken off.", example: "repeat 4: damage - 3 blocks 12.", python: "for i in range(4):\n    damage -= 3" },
  halve: { id: "halve", group: "function", name: "repeat: halve", nameZh: "重复减半", does: "A loop that cuts the damage in half each time round. Great against huge hits.", example: "repeat 2: damage ÷ 2 turns 40 into 20, then 10.", python: "for i in range(2):\n    damage /= 2" },
  ifgt: { id: "ifgt", group: "function", name: "if ... then", nameZh: "如果 (if)", does: "A shield that asks a question first. The inside only runs if the answer is yes. You are guessing how hard they will hit.", example: "if damage > 5: damage - 5. A hit of 8 becomes 3. A hit of 5 stays 5.", python: "if damage > 5:\n    damage -= 5" },
  ifge: { id: "ifge", group: "function", name: "if ... ≥", nameZh: "如果大于等于", does: "Like if, with 'greater than or equal'. Equal counts as yes.", example: "if damage ≥ 6: damage - 8. A hit of exactly 6 becomes 0.", python: "if damage >= 6:\n    damage -= 8" },
  iflt: { id: "iflt", group: "function", name: "if ... < (block small hits)", nameZh: "如果小于", does: "Blocks a small hit completely. A big hit goes straight through.", example: "if damage < 7: damage = 0. A hit of 6 does nothing. A hit of 7 does 7.", python: "if damage < 7:\n    damage = 0" },
  ifelse: { id: "ifelse", group: "function", name: "if ... else", nameZh: "如果…否则 (if / else)", does: "Two paths. If the answer is yes the first part runs, otherwise the else part runs. One of them always runs.", example: "if damage > 6: - 8, else: - 2.", python: "if damage > 6:\n    damage -= 8\nelse:\n    damage -= 2" },
  while: { id: "while", group: "function", name: "repeat while (while loop)", nameZh: "当…重复 (while 循环)", does: "Keeps repeating as long as the question is true. You do not know in advance how many times.", example: "while damage > 8: damage - 3. A hit of 20 goes 17, 14, 11, 8, then stops.", python: "while damage > 8:\n    damage -= 3" },
  redbull: { id: "redbull", group: "power-up", name: "Red Bull", nameZh: "红牛", does: "Power-up. Use it at the start of your turn, before your move. You get an extra turn straight after this one.", example: "Drink it, attack, then attack again before the professor moves.", python: "turns += 1" },
  gym: { id: "gym", group: "power-up", name: "Gym session", nameZh: "健身", does: "Power-up from the Building 5 gym. Use it at the start of your turn: +15 HP, even above your maximum.", example: "30 HP becomes 45 HP.", python: "hp += 15" },
  food: { id: "food", group: "power-up", name: "Meituan meal", nameZh: "美团外卖", does: "Power-up from the food lockers. Use it at the start of your turn: +12 HP.", example: "10 HP becomes 22 HP.", python: "hp += 12" },
};

export const FN_ORDER: FnKind[] = ["for1", "ifgt", "for2", "iflt", "ifelse", "while", "halve", "ifge", "for3"];
export const OP_ORDER: Op[] = ["+", "-", "×", "÷"];
export const POWER_ORDER: Exclude<PowerUpKind, "study">[] = ["redbull", "gym", "food"];

export interface Reward {
  /** short line for the win pop-up */
  text: string;
  fn?: FnKind;
  op?: Op;
  brackets?: boolean;
  key?: boolean;
  hallpass?: boolean;
  power?: Exclude<PowerUpKind, "study">;
}

/** what beating the professor on floor n gives you (decision #14: win functions from professors) */
export const REWARDS: Record<number, Reward> = {
  1: { fn: "ifgt", text: "New shield block: if ... then" },
  2: { op: "×", text: "New operator block: × times" },
  3: { key: true, text: "The key to Building 5. Power-ups are waiting there: gym, study stair, cafe." },
  4: { op: "÷", text: "New operator block: ÷ divide" },
  5: { fn: "for2", text: "New shield block: repeat, 2 each time" },
  6: { brackets: true, text: "New: ( ) brackets, with the Group button" },
  7: { fn: "iflt", text: "New shield block: if ... < blocks small hits" },
  8: { fn: "ifelse", text: "New shield block: if ... else" },
  9: { power: "redbull", text: "A can of Red Bull (extra turn)" },
  10: { fn: "while", text: "New shield block: repeat while (while loop)" },
  11: { fn: "halve", text: "New shield block: repeat: halve" },
  12: { power: "gym", text: "A gym session (+15 HP)" },
  13: { power: "redbull", text: "A can of Red Bull (extra turn)" },
  14: { hallpass: true, text: "An invitation to the Grand Hall. Leo the HKU lion is waiting." },
};

/** functions the Building 5 study stair hands out, one per visit after a new floor is cleared */
export const STUDY_FNS: FnKind[] = ["ifge", "for3"];

/** the functions each professor defends with (the one they teach, plus earlier ones) */
export function enemyPool(floor: number, boss = false): FnKind[] {
  if (boss) return ["for3", "ifgt", "ifelse", "while", "halve", "iflt"];
  const pool: FnKind[] = ["for1"];
  if (floor >= 2) pool.push("ifgt");
  if (floor >= 5) pool.push("for2", "for2");
  if (floor >= 7) pool.push("iflt");
  if (floor >= 8) pool.push("ifelse", "ifelse");
  if (floor >= 9) pool.push("for3");
  if (floor >= 10) pool.push("while", "while");
  if (floor >= 11) pool.push("halve");
  if (floor >= 12) pool.push("ifge");
  if (floor >= 5) pool.shift();
  return pool;
}
