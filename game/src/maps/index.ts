import type { GameMap } from "../engine/types";
import { buildOutside } from "./outside";
import { buildCds1Floor } from "./cds1";
import { buildB5 } from "./b5";
import { buildGrandHall } from "./grandhall";

const cache = new Map<string, GameMap>();
const KEEP = 4;

/** map ids: "outside", "cds1-1".."cds1-14", "b5-1", "b5-2", "hall" */
export function buildMap(id: string): GameMap {
  const hit = cache.get(id);
  if (hit) {
    cache.delete(id);
    cache.set(id, hit);
    return hit;
  }
  let m: GameMap;
  const floor = /^cds1-(\d+)$/.exec(id);
  if (floor) m = buildCds1Floor(Math.max(1, Math.min(14, Number(floor[1]))));
  else if (id === "b5-1") m = buildB5(1);
  else if (id === "b5-2") m = buildB5(2);
  else if (id === "hall") m = buildGrandHall();
  else m = buildOutside();
  cache.set(id, m);
  // the outdoor map is the big one, keep it; drop the oldest interior
  if (cache.size > KEEP) {
    for (const k of cache.keys()) {
      if (k !== "outside" && k !== id) {
        cache.delete(k);
        break;
      }
    }
  }
  return m;
}
