import { rect, type Ctx } from "../art/px";

/**
 * A small pixel version of the HKU shield: red chief with a gold lion,
 * green and blue base with an open book. Returns the height drawn.
 */
export function drawCrest(ctx: Ctx, x: number, y: number, w: number): number {
  const h = Math.round(w * 1.18);
  const cx = x + w / 2;
  const half = (j: number): number => {
    const t = j / h;
    if (t < 0.5) return w / 2;
    const u = (t - 0.5) / 0.5;
    return Math.max(0, Math.round((w / 2) * Math.pow(Math.cos((u * Math.PI) / 2), 0.75)));
  };
  const b = Math.max(1, Math.round(w / 14));
  for (let j = 0; j < h; j++) {
    const hw = half(j);
    if (hw > 0) rect(ctx, cx - hw, y + j, hw * 2, 1, j < h * 0.5 ? "#d9b441" : "#a8851f");
  }
  const split = Math.round(h * 0.36);
  for (let j = b; j < h - b; j++) {
    const hw = Math.min(half(j), half(Math.min(h - 1, j + b))) - b;
    if (hw <= 0) continue;
    if (j < split) {
      rect(ctx, cx - hw, y + j, hw * 2, 1, j < split * 0.5 ? "#c21a24" : "#a8121c");
    } else if (j < split + b) {
      rect(ctx, cx - hw, y + j, hw * 2, 1, "#d9b441");
    } else {
      rect(ctx, cx - hw, y + j, hw, 1, "#1f7a4d");
      rect(ctx, cx, y + j, hw, 1, "#1e4fa0");
    }
  }
  const s = Math.max(1, w / 32);
  // lion passant on the chief
  const ly = y + Math.round(split * 0.42);
  rect(ctx, cx - 7 * s, ly, 12 * s, 3 * s, "#f0cf5a");
  rect(ctx, cx + 4 * s, ly - 2 * s, 4 * s, 4 * s, "#f0cf5a");
  rect(ctx, cx - 6 * s, ly + 3 * s, 2 * s, 2 * s, "#d9b441");
  rect(ctx, cx - 2 * s, ly + 3 * s, 2 * s, 2 * s, "#d9b441");
  rect(ctx, cx + 3 * s, ly + 3 * s, 2 * s, 2 * s, "#d9b441");
  rect(ctx, cx - 9 * s, ly - 2 * s, 2 * s, 3 * s, "#f0cf5a");
  // open book on the base
  const by = y + Math.round(h * 0.5);
  const bw = Math.round(7 * s);
  const bh = Math.round(8 * s);
  rect(ctx, cx - bw - s, by, bw, bh, "#f6f1e2");
  rect(ctx, cx + s, by, bw, bh, "#f6f1e2");
  rect(ctx, cx - s, by, 2 * s, bh + s, "#d9b441");
  for (let i = 1; i < 4; i++) {
    rect(ctx, cx - bw, by + i * 2 * s, bw - 2 * s, Math.max(1, s / 2), "#6b5d4a");
    rect(ctx, cx + 2 * s, by + i * 2 * s, bw - 2 * s, Math.max(1, s / 2), "#6b5d4a");
  }
  return h;
}
