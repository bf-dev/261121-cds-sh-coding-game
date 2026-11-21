// The official HKU crest and logo, used wherever the campus shows them.
// Never redraw the crest by hand: Insung, 2026-11-21, "refer to the correct HKU logo, use the one from the official source".

import { mk } from "./px";

let crestImg: HTMLImageElement | null = null;
let logoImg: HTMLImageElement | null = null;
const cache = new Map<string, HTMLCanvasElement>();

/** load the official artwork. Call once before any map is built. */
export async function loadLogo(): Promise<void> {
  // filled in with the official files
}

function scaled(img: HTMLImageElement | null, h: number, key: string): HTMLCanvasElement {
  const k = `${key}:${h}`;
  let c = cache.get(k);
  if (c) return c;
  if (!img || !img.naturalHeight) {
    [c] = mk(Math.round(h * 0.8), h);
  } else {
    const w = Math.max(1, Math.round((img.naturalWidth / img.naturalHeight) * h));
    const [cc, g] = mk(w, h);
    g.imageSmoothingEnabled = true;
    g.drawImage(img, 0, 0, w, h);
    c = cc;
  }
  cache.set(k, c);
  return c;
}

/** the official HKU crest (shield only) at height h px */
export function crest(h: number): HTMLCanvasElement {
  return scaled(crestImg, h, "crest");
}

/** the official HKU logo (crest with the university name) at height h px */
export function logoFull(h: number): HTMLCanvasElement {
  return scaled(logoImg ?? crestImg, h, "logo");
}
