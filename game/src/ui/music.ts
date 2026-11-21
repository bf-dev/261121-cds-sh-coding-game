// Background music: the University Anthem of HKU (source in resources/README.md).
// Browsers only allow sound after a click or a key press, so it starts on the first one.

import url from "../assets/hku-anthem.mp3";
import { isMuted } from "./sfx";

const KEY = "cds-sh-music";

let on = true;
try {
  on = localStorage.getItem(KEY) !== "off";
} catch {
  /* private mode: music stays on, the choice is not kept */
}

const audio = new Audio(url);
audio.loop = true;
audio.volume = 0.22;
audio.preload = "auto";

let started = false;

function sync(): void {
  if (!started) return;
  if (on && !isMuted()) void audio.play().catch(() => {});
  else audio.pause();
}

function firstInput(): void {
  started = true;
  sync();
}
window.addEventListener("pointerdown", firstInput);
window.addEventListener("keydown", firstInput);

export const musicOn = (): boolean => on;

export function setMusic(value: boolean): void {
  on = value;
  try {
    localStorage.setItem(KEY, value ? "on" : "off");
  } catch {
    /* nothing to keep */
  }
  sync();
}
