import type { Ctx } from "../art/px";
import { drawCrestIn } from "../art/logo";

/**
 * The official HKU crest (art/logo.ts), fitted into a box w wide. Returns the height of the box.
 * Kept under this name so the hall and Building 5 scenes did not have to change.
 */
export function drawCrest(ctx: Ctx, x: number, y: number, w: number): number {
  const h = Math.round(w * 1.18);
  drawCrestIn(ctx, x, y, w, h);
  return h;
}
