// Tiny DOM helpers for the overlay UI.

type Child = Node | string | null | undefined | false;

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, unknown> = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === "class") el.className = String(v);
    else if (k === "style") el.style.cssText = String(v);
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v as EventListener);
    else if (k === "html") el.innerHTML = String(v);
    else el.setAttribute(k, v === true ? "" : String(v));
  }
  for (const c of children) if (c) el.append(c);
  return el;
}

export const ui = (): HTMLElement => document.getElementById("ui")!;

export const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** global pacing: demo mode and the 2x button change how long animations wait */
export const pace = { speed: 1, auto: false };
export const wait = (ms: number): Promise<void> => sleep(ms / pace.speed);
