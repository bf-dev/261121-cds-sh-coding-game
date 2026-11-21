import type { GameMap } from "../engine/types";
import { stubMap } from "./stub";

export function buildOutside(): GameMap {
  const m = stubMap("outside", "HKU CDS Shanghai campus", "港大计算与数据科学学院 上海", 40, 26, "#d9d4c8");
  m.spawns = { start: { tx: 6, ty: 8, dir: "up" }, "cds1-door": { tx: 6, ty: 5, dir: "down" }, "b5-door": { tx: 20, ty: 5, dir: "down" } };
  m.triggers.push({ id: "cds1-door", tx: 6, ty: 2, w: 2, h: 1, en: "Enter CDS1", zh: "进入一号楼", auto: true, action: { type: "goto", map: "cds1-1", spawn: "door" } });
  m.triggers.push({ id: "b5-door", tx: 20, ty: 2, w: 2, h: 1, en: "Enter Building 5", zh: "进入五号楼", auto: true, action: { type: "goto", map: "b5-1", spawn: "door", requires: "b5key" } });
  m.triggers.push({ id: "meituan", tx: 30, ty: 6, w: 2, h: 1, en: "Meituan food locker", zh: "美团外卖柜", action: { type: "powerup", kind: "food" } });
  return m;
}
