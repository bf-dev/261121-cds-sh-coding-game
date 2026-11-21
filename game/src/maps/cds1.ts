import type { GameMap } from "../engine/types";
import { stubMap } from "./stub";

/** what the lift floor guide says is on each floor */
export function floorInfo(floor: number): { en: string; zh: string } {
  return { en: `CDS1 ${floor}/F`, zh: `一号楼 ${floor} 层` };
}

export function buildCds1Floor(floor: number): GameMap {
  const info = floorInfo(floor);
  const m = stubMap(`cds1-${floor}`, info.en, info.zh, 30, 18, "#d8d2c4");
  m.spawns = { lift: { tx: 5, ty: 4, dir: "down" }, door: { tx: 15, ty: 15, dir: "up" } };
  m.triggers.push({ id: "lift", tx: 4, ty: 2, w: 3, h: 1, en: "Lift", zh: "电梯", action: { type: "lift" } });
  if (floor === 1) m.triggers.push({ id: "exit", tx: 14, ty: 16, w: 3, h: 1, en: "Exit", zh: "出口", auto: true, action: { type: "goto", map: "outside", spawn: "cds1-door" } });
  m.npcs.push({ id: `prof${floor}`, char: `prof${floor}`, tx: 20, ty: 8, dir: "down", name: "Professor", nameZh: "教授", action: { type: "battle", floor } });
  return m;
}
