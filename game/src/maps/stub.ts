import { TILE, type GameMap } from "../engine/types";
import { mk, rect, text } from "../art/px";

/** Plain placeholder room, used until the real map module is in place. */
export function stubMap(id: string, name: string, nameZh: string, cols = 30, rows = 18, color = "#cfc9bd"): GameMap {
  const [ground, g] = mk(cols * TILE, rows * TILE);
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) rect(g, x * TILE, y * TILE, TILE, TILE, (x + y) % 2 ? color : "#bdb7ab");
  const solid = new Uint8Array(cols * rows);
  for (let x = 0; x < cols; x++) (solid[x] = 1), (solid[(rows - 1) * cols + x] = 1);
  for (let y = 0; y < rows; y++) (solid[y * cols] = 1), (solid[y * cols + cols - 1] = 1);
  text(g, name, 80, 80, 40, "#333");
  return { id, name, nameZh, cols, rows, ground, solid, props: [], npcs: [], triggers: [], spawns: { start: { tx: 4, ty: 4, dir: "down" } } };
}
