// Campus overview map for the title screen and the Menu (docs/home-campus-overview.md, Aretha,
// 2026-11-21). The picture is the real outdoor game map drawn small, so it always matches the
// walkable map. North is up. It only explains places: no teleport, no change to progress.

import "./campusmap.css";
import { h, ui } from "./dom";
import { TILE, type GameMap } from "../engine/types";
import { buildMap } from "../maps/index";
import { L } from "../maps/outside-layout";

const PIC_W = 1404; // 18 px per tile on the 1920 x 1080 stage

interface Spot {
  id: string;
  /** centre of the place, in tiles */
  tx: number;
  ty: number;
  en: string;
  zh: string;
  desc: string;
  /** a place the game takes you into */
  main?: boolean;
}

let base: HTMLCanvasElement | null = null;

/** the whole outdoor map at half size: ground, then every prop back to front. No player, no people. */
function picture(): HTMLCanvasElement {
  if (base) return base;
  const m = buildMap("outside");
  const full = document.createElement("canvas");
  full.width = m.cols * TILE;
  full.height = m.rows * TILE;
  const g = full.getContext("2d")!;
  g.drawImage(m.ground, 0, 0);
  m.drawUnder?.(g, 0);
  const props = m.props.slice().sort((a, b) => (a.sortY ?? a.y + a.sprite.height) - (b.sortY ?? b.y + b.sprite.height));
  for (const p of props) g.drawImage(p.sprite, Math.round(p.x), Math.round(p.y));
  m.drawOver?.(g, 0);
  base = shrink(full, full.width / 2);
  return base;
}

/** scale down in halving steps, so thin pixel lines survive */
function shrink(src: HTMLCanvasElement, w: number): HTMLCanvasElement {
  let cur = src;
  while (cur.width / 2 >= w) cur = draw(cur, Math.round(cur.width / 2));
  return cur.width === Math.round(w) ? cur : draw(cur, Math.round(w));
}

function draw(src: HTMLCanvasElement, w: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = Math.round((src.height * w) / src.width);
  const g = c.getContext("2d")!;
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = "high";
  g.drawImage(src, 0, 0, c.width, c.height);
  return c;
}

/** names follow the labels on the walkable map, so a rename there shows up here */
function spots(m: GameMap): Spot[] {
  const label = (start: string) => m.labels?.find((l) => l.en.startsWith(start));
  const zhOf = (start: string, fallback: string, pick: "first" | "last" | "all" = "all") => {
    const zh = label(start)?.zh;
    if (!zh) return fallback;
    const parts = zh.split(" ");
    return pick === "first" ? parts[0] : pick === "last" ? parts[parts.length - 1] : zh;
  };
  const mid = (b: { x: number; y: number; w: number; roof: number; face: number }) => ({ tx: b.x + b.w / 2, ty: b.y + (b.roof + b.face) / 2 });
  const gate = m.triggers.find((t) => t.id === "gate");
  const gateName = gate && gate.action.type === "info" ? { en: gate.action.title, zh: gate.action.titleZh } : { en: "East gate", zh: "东门" };
  const lk = L.lockers;
  const list: Spot[] = [
    { id: "cds1", ...mid(L.cds1), en: "CDS-1", zh: zhOf("CDS-1", "一号楼", "last"), desc: "CDS-1: explore the main academic tower. 14 floors, with a mentor on each one.", main: true },
    { id: "b5", ...mid(L.b5), en: "Building 5", zh: zhOf("Building 5", "五号楼", "first"), desc: "Building 5: welcome dinner on 1/F; gym and study floors unlock later.", main: true },
    { id: "hall", ...mid(L.aud), en: "Grand Hall", zh: zhOf("Grand Hall", "大礼堂"), desc: "Grand Hall: the white glass box at the north end of the central axis." },
    { id: "cds2", ...mid(L.se), en: "CDS-2", zh: zhOf("CDS-2", "二号楼", "last"), desc: "CDS-2: the tower south of CDS-1. You cannot go inside in this game." },
    { id: "other-nw", ...mid(L.cds2), en: "Other campus building", zh: "其他楼宇", desc: "Another tower on the campus. It is not part of this game." },
    { id: "other-sw", ...mid(L.sw), en: "Other campus building", zh: "其他楼宇", desc: "Another tower on the campus. It is not part of this game." },
    { id: "plaza", tx: L.court.cx, ty: L.court.cy, en: "Sunken Plaza", zh: zhOf("Sunken Plaza", "下沉广场"), desc: "Sunken Plaza: a round court a few metres below the plaza, between the towers." },
    { id: "lawn", tx: L.lawn.x + L.lawn.w / 2, ty: L.lawn.y + 1.2, en: "The Lawn", zh: zhOf("The Lawn", "中央草坪"), desc: "The Lawn: Leo the lion and the big white HKU letters. The photo spot of the campus." },
    { id: "meituan", tx: lk.x + 1, ty: lk.mt + lk.len / 2, en: "Meituan lockers", zh: zhOf("Meituan", "美团外卖柜"), desc: "Meituan lockers: food pick-up, east of CDS-1 across the service road." },
    { id: "taobao", tx: lk.x + 1, ty: lk.tb + lk.len / 2, en: "Taobao lockers", zh: zhOf("Taobao", "淘宝闪购柜"), desc: "Taobao lockers: parcel pick-up, next to the food lockers." },
    { id: "fangchun", tx: L.fangchun.x + L.fangchun.w / 2, ty: 31, en: "Fangchun Road", zh: zhOf("Fangchun", "芳春路"), desc: "Fangchun Road: the public road on the east side. The campus address is No. 500." },
  ];
  if (gate) list.push({ id: "gate", tx: gate.tx + gate.w / 2, ty: gate.ty + gate.h / 2, en: cap(gateName.en), zh: gateName.zh, desc: `${cap(gateName.en)}: the guard booth and barrier at the south end of the service road, the way in from the street.` });
  return list;
}

const cap = (s: string) => s.replace(/\b[a-z]/g, (c) => c.toUpperCase());

/** small picture with a caption for the title screen. The caller attaches the click. */
export function campusMapPreview(): HTMLElement {
  const pic = shrink(picture(), 360);
  pic.className = "campus-preview-pic";
  return h("button", { class: "campus-preview", type: "button", id: "btn-campus-map", "aria-label": "Campus map, open the large map" }, pic, h("span", { class: "campus-preview-cap" }, "Campus map"));
}

/**
 * The small live map of the HUD: the whole campus with a dot where the player is. Inside a building
 * the dot sits on that building. The caller attaches the click and calls update() while walking.
 */
export function campusMini(): { el: HTMLElement; update(here: { map: string; tx: number; ty: number }): void } {
  const W = 288;
  const m = buildMap("outside");
  const pic = shrink(picture(), W);
  pic.className = "campus-mini-pic";
  const k = W / m.cols;
  const dot = h("span", { class: "campus-mini-dot" });
  const tag = h("span", { class: "campus-mini-tag" });
  const el = h("button", { class: "hud campus-mini", type: "button", id: "btn-minimap", "aria-label": "Campus map, open the large map" }, pic, dot, tag);
  const hall = m.labels?.find((l) => l.en.startsWith("Grand Hall"));
  const at = (id: string): { tx: number; ty: number; name: string } | null => {
    if (id.startsWith("cds1-")) return { ...m.spawns["cds1-door"], ty: m.spawns["cds1-door"].ty - 3, name: `CDS-1 ${id.slice(5)}/F` };
    if (id.startsWith("b5-")) return { ...m.spawns["b5-door"], ty: m.spawns["b5-door"].ty - 3, name: `Building 5 ${id.slice(3)}/F` };
    if (id === "hall" && hall) return { tx: hall.x / TILE, ty: hall.y / TILE + 1, name: "Grand Hall" };
    return null;
  };
  let last = "";
  return {
    el,
    update(here) {
      const inside = here.map === "outside" ? null : at(here.map);
      const tx = inside ? inside.tx : here.tx;
      const ty = inside ? inside.ty : here.ty;
      const key = `${here.map}|${tx}|${ty}`;
      if (key === last) return;
      last = key;
      dot.style.left = `${(tx + 0.5) * k}px`;
      dot.style.top = `${(ty + 0.5) * k}px`;
      dot.classList.toggle("inside", !!inside);
      tag.textContent = inside ? `You are in ${inside.name}` : "You are here";
    },
  };
}

let openNow = false;

export function openCampusMap(here?: { map: string; tx: number; ty: number }): Promise<void> {
  if (openNow) return Promise.resolve();
  let m: GameMap;
  let pic: HTMLCanvasElement;
  try {
    m = buildMap("outside");
    pic = shrink(picture(), PIC_W);
  } catch {
    return Promise.resolve();
  }
  openNow = true;
  return new Promise((resolve) => {
    const k = PIC_W / m.cols; // stage px per tile
    pic.className = "campus-canvas";
    const picH = pic.height;
    const before = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const idle = "Tap or hover a place to see what it is.";
    const desc = h("div", { class: "campus-desc", role: "status", "aria-live": "polite" }, idle);
    let chosen: HTMLElement | null = null;
    const show = (text: string) => (desc.textContent = text);

    const box = h("div", { class: "campus-pic", style: `width:${PIC_W}px;height:${picH}px` }, pic);
    const chips: { el: HTMLElement; x: number; y: number }[] = [];
    for (const s of spots(m)) {
      const el = h("button", { class: `campus-chip ${s.main ? "main" : ""}`, type: "button", "data-spot": s.id, "aria-label": s.desc }, s.en);
      el.addEventListener("mouseenter", () => show(s.desc));
      el.addEventListener("focus", () => show(s.desc));
      el.addEventListener("mouseleave", () => show(chosen?.getAttribute("aria-label") ?? idle));
      el.addEventListener("click", () => {
        chosen?.classList.remove("on");
        chosen = el;
        el.classList.add("on");
        show(s.desc);
      });
      chips.push({ el, x: s.tx * k, y: s.ty * k });
      box.append(el);
    }
    box.append(h("div", { class: "campus-north", "aria-label": "North is up" }, h("span", { class: "campus-north-arrow" }), h("b", {}, "N")));
    if (here && here.map === "outside") {
      box.append(h("div", { class: "campus-here", style: `left:${(here.tx + 0.5) * k}px;top:${(here.ty + 0.5) * k}px` }, h("span", { class: "campus-here-dot" }), h("span", { class: "campus-here-tag" }, "You are here")));
    }

    const back = h("button", { class: "btn primary", type: "button", id: "campus-back" }, "Back");
    const panel = h(
      "div",
      { class: "campus", role: "dialog", "aria-modal": "true", "aria-label": "Campus map" },
      h("div", { class: "campus-head" }, h("div", {}, h("span", { class: "kicker" }, "HKU Zhangjiang Base · North is up"), h("h2", {}, "Campus map")), back),
      box,
      h("div", { class: "campus-foot" }, desc, h("div", { class: "campus-legend" }, h("span", { class: "campus-key main" }), "places you go into", h("span", { class: "campus-key" }), "landmarks", h("span", { class: "campus-note" }, "Drawn from the game map, not to scale."))),
    );
    const veil = h("div", { class: "veil campus-veil" }, panel);

    const onKey = (e: KeyboardEvent) => {
      // nothing behind the map reacts to keys while it is open; Tab, Enter and Space still work on the labels
      e.stopPropagation();
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    const swallow = (e: KeyboardEvent) => e.stopPropagation();
    function close(): void {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("keyup", swallow, true);
      veil.remove();
      openNow = false;
      if (before?.isConnected) before.focus();
      resolve();
    }
    back.addEventListener("click", close);
    veil.addEventListener("click", (e) => {
      if (e.target === veil) close();
    });
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("keyup", swallow, true);
    ui().append(veil);

    // centre every label on its place and keep it inside the picture
    for (const c of chips) {
      const w = c.el.offsetWidth;
      const ht = c.el.offsetHeight;
      c.el.style.left = `${Math.max(6, Math.min(PIC_W - w - 6, c.x - w / 2))}px`;
      c.el.style.top = `${Math.max(6, Math.min(picH - ht - 6, c.y - ht / 2))}px`;
    }
    back.focus();
  });
}
