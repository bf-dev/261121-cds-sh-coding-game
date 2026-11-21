import type { GameMap } from "../engine/types";
import { stubMap } from "./stub";

export function buildB5(level: 1 | 2): GameMap {
  const m = stubMap(`b5-${level}`, `Building 5 ${level}/F`, `五号楼 ${level} 层`, 30, 18, "#e2dccf");
  if (level === 1) {
    m.spawns = { door: { tx: 15, ty: 15, dir: "up" }, stair: { tx: 6, ty: 5, dir: "down" } };
    m.triggers.push({ id: "exit", tx: 14, ty: 16, w: 3, h: 1, en: "Exit", zh: "出口", auto: true, action: { type: "goto", map: "outside", spawn: "b5-door" } });
    m.triggers.push({ id: "up", tx: 5, ty: 2, w: 3, h: 1, en: "Stairs to 2/F", zh: "上二楼", action: { type: "goto", map: "b5-2", spawn: "stair" } });
  } else {
    m.spawns = { stair: { tx: 6, ty: 5, dir: "down" } };
    m.triggers.push({ id: "down", tx: 5, ty: 2, w: 3, h: 1, en: "Stairs to 1/F", zh: "下一楼", action: { type: "goto", map: "b5-1", spawn: "stair" } });
    m.triggers.push({ id: "gym", tx: 12, ty: 3, w: 2, h: 1, en: "Gym", zh: "健身房", action: { type: "powerup", kind: "gym" } });
    m.triggers.push({ id: "study", tx: 18, ty: 3, w: 2, h: 1, en: "Study stair", zh: "阶梯自习区", action: { type: "powerup", kind: "study" } });
    m.triggers.push({ id: "cafe", tx: 24, ty: 3, w: 2, h: 1, en: "Cafe fridge", zh: "咖啡冰柜", action: { type: "powerup", kind: "redbull" } });
  }
  return m;
}
