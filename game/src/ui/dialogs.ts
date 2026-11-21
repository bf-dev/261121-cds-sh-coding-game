// Modal pop-ups: new block explanations, campus details, professor lines, the lift.

import { h, pace, ui } from "./dom";
import { CARDS } from "../data/cards";
import { cardPicture } from "../battle/blocks";

export interface DialogButton<T> {
  label: string;
  value: T;
  primary?: boolean;
}

export interface DialogOpts<T> {
  kicker?: string;
  title: string;
  titleZh?: string;
  body: (string | HTMLElement)[];
  buttons?: DialogButton<T>[];
  portrait?: HTMLCanvasElement;
  wide?: boolean;
  /** demo mode closes the dialog by itself after this long (ms at 1x) */
  autoMs?: number;
}

let openCount = 0;
export const dialogOpen = (): boolean => openCount > 0;

export function showDialog<T = true>(o: DialogOpts<T>): Promise<T> {
  return new Promise((resolve) => {
    const buttons = o.buttons ?? [{ label: "OK", value: true as unknown as T, primary: true }];
    const box = h("div", { class: `dialog ${o.wide ? "wide" : ""}`, role: "dialog" });
    const veil = h("div", { class: "veil" }, box);
    let done = false;
    const close = (v: T) => {
      if (done) return;
      done = true;
      openCount--;
      window.removeEventListener("keydown", onKey, true);
      veil.remove();
      resolve(v);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        close((buttons.find((b) => b.primary) ?? buttons[0]).value);
      } else if (e.key === "Escape" && buttons.length > 1) {
        e.stopPropagation();
        close(buttons[buttons.length - 1].value);
      }
    };
    if (o.portrait) {
      const p = h("canvas", { class: "dialog-portrait", width: o.portrait.width, height: o.portrait.height });
      p.getContext("2d")!.drawImage(o.portrait, 0, 0);
      box.append(p);
    }
    const main = h("div", { class: "dialog-main" });
    if (o.kicker) main.append(h("div", { class: "kicker" }, o.kicker));
    main.append(h("h2", {}, o.title, o.titleZh ? h("small", {}, o.titleZh) : null));
    for (const b of o.body) main.append(typeof b === "string" ? h("p", {}, b) : b);
    const row = h("div", { class: "dialog-buttons" });
    for (const b of buttons) row.append(h("button", { class: `btn ${b.primary ? "primary" : ""}`, type: "button", "data-dialog": b.label, onclick: () => close(b.value) }, b.label));
    main.append(row);
    box.append(main);
    openCount++;
    ui().append(veil);
    // the keydown that opened the dialog must not also close it
    setTimeout(() => window.addEventListener("keydown", onKey, true), 150);
    if (pace.auto) setTimeout(() => close((buttons.find((b) => b.primary) ?? buttons[0]).value), (o.autoMs ?? 2600) / pace.speed);
  });
}

/** "This is your new block, this is what it does, this is the same as ..." (decision #17) */
export function cardPopup(id: string, kicker = "New block"): Promise<true> {
  const c = CARDS[id];
  if (!c) return Promise.resolve(true);
  return showDialog({
    kicker,
    title: c.name,
    wide: true,
    autoMs: 3200,
    body: [
      cardPicture(id),
      h("p", {}, c.does),
      h("p", { class: "example" }, h("b", {}, "Example: "), c.example),
      h("div", { class: "pybox" }, h("span", { class: "pylabel" }, "The same thing in Python"), h("pre", {}, c.python)),
    ],
    buttons: [{ label: "Got it", value: true, primary: true }],
  });
}

let toastTimer = 0;
export function toast(text: string, ms = 2600): void {
  document.querySelector(".toast")?.remove();
  const t = h("div", { class: "toast" }, text);
  ui().append(t);
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => t.remove(), ms);
}
