// The official HKU crest and logo, used wherever the campus shows them.
// Never redraw the crest by hand: Insung, 2026-11-21, "refer to the correct HKU logo, use the one from the official source".
//
// Source (downloaded 2026-11-21 from the header and footer of https://www.hku.hk/):
//   colour: https://www.hku.hk/adobe/dynamicmedia/deliver/dm-aid--afc8d43c-587a-43f0-b93c-26f8bd397e0e/logo-hku.svg
//   white:  https://www.hku.hk/adobe/dynamicmedia/deliver/dm-aid--8a2df171-9840-4ea1-9be2-6f3b3fa1c907/logo-hku-footer.svg
// assets/hku-logo.svg and hku-logo-white.svg are those files (only a viewBox attribute added).
// assets/hku-crest.svg and hku-crest-white.svg are the same files with the viewBox narrowed to the shield,
// so the university name is cropped off. No path was edited.

import crestUrl from "../assets/hku-crest.svg";
import crestWhiteUrl from "../assets/hku-crest-white.svg";
import logoUrl from "../assets/hku-logo.svg";
import logoWhiteUrl from "../assets/hku-logo-white.svg";
import { mk } from "./px";

type Kind = "crest" | "crestWhite" | "logo" | "logoWhite";

const URLS: Record<Kind, string> = { crest: crestUrl, crestWhite: crestWhiteUrl, logo: logoUrl, logoWhite: logoWhiteUrl };
/** width / height of each file, used until (or if never) the image is loaded */
const ASPECT: Record<Kind, number> = { crest: 35.6 / 40, crestWhite: 48.1 / 54, logo: 208 / 40, logoWhite: 276 / 54 };
const imgs: Partial<Record<Kind, HTMLImageElement>> = {};
const cache = new Map<string, HTMLCanvasElement>();

function load(kind: Kind): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      imgs[kind] = img;
      resolve();
    };
    img.onerror = () => resolve();
    img.src = URLS[kind];
  });
}

/** load the official artwork. Call once before any map is built. Resolves even if a file fails. */
export async function loadLogo(): Promise<void> {
  await Promise.all((Object.keys(URLS) as Kind[]).map(load));
  cache.clear();
}

function scaled(kind: Kind, h: number, tint?: string): HTMLCanvasElement {
  h = Math.max(1, Math.round(h));
  const k = `${kind}:${h}:${tint ?? ""}`;
  let c = cache.get(k);
  if (c) return c;
  const w = Math.max(1, Math.round(ASPECT[kind] * h));
  const [cc, g] = mk(w, h);
  const img = imgs[kind];
  if (img) {
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = "high";
    g.drawImage(img, 0, 0, w, h);
    if (tint) {
      g.globalCompositeOperation = "source-in";
      g.fillStyle = tint;
      g.fillRect(0, 0, w, h);
      g.globalCompositeOperation = "source-over";
    }
  }
  c = cc;
  cache.set(k, c);
  return c;
}

/** the official HKU crest in colour (shield with the lion, the book and the motto scroll) at height h px */
export function crest(h: number): HTMLCanvasElement {
  return scaled("crest", h);
}

/** the official one-colour crest (line version), drawn in the given colour: for etched glass, engraved panels, dark walls */
export function crestMono(h: number, color = "#ffffff"): HTMLCanvasElement {
  return scaled("crestWhite", h, color);
}

/** the official HKU logo (crest with 香港大學 THE UNIVERSITY OF HONG KONG) at height h px */
export function logoFull(h: number): HTMLCanvasElement {
  return scaled("logo", h);
}

/** the official one-colour logo in the given colour */
export function logoMono(h: number, color = "#ffffff"): HTMLCanvasElement {
  return scaled("logoWhite", h, color);
}

/** draw the crest centred in the box (x, y, w, h), as large as fits. color = one-colour version in that colour. */
export function drawCrestIn(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color?: string): void {
  const fit = Math.min(h, w / ASPECT.crest);
  const c = color ? crestMono(fit, color) : crest(fit);
  ctx.drawImage(c, Math.round(x + (w - c.width) / 2), Math.round(y + (h - c.height) / 2));
}
