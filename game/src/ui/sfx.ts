// Tiny square-wave sound effects, no audio files.

let ac: AudioContext | null = null;
let muted = false;

export function setMuted(m: boolean): void {
  muted = m;
}
export const isMuted = (): boolean => muted;

function tone(freq: number, at: number, dur: number, vol = 0.05, type: OscillatorType = "square"): void {
  if (!ac) return;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, ac.currentTime + at);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + at + dur);
  o.connect(g).connect(ac.destination);
  o.start(ac.currentTime + at);
  o.stop(ac.currentTime + at + dur + 0.02);
}

const SOUNDS: Record<string, () => void> = {
  click: () => tone(660, 0, 0.05, 0.04),
  tick: () => tone(880, 0, 0.06, 0.04),
  run: () => [523, 659, 784].forEach((f, i) => tone(f, i * 0.07, 0.09)),
  shield: () => [392, 330].forEach((f, i) => tone(f, i * 0.09, 0.12, 0.05, "triangle")),
  hit: () => [180, 120, 90].forEach((f, i) => tone(f, i * 0.05, 0.12, 0.08, "sawtooth")),
  block: () => tone(1200, 0, 0.12, 0.04, "triangle"),
  heal: () => [523, 784, 1046].forEach((f, i) => tone(f, i * 0.08, 0.14, 0.05, "triangle")),
  power: () => [392, 523, 659, 1046].forEach((f, i) => tone(f, i * 0.06, 0.1)),
  win: () => [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tone(f, i * 0.12, 0.18, 0.06)),
  lose: () => [392, 330, 262, 196].forEach((f, i) => tone(f, i * 0.16, 0.22, 0.06, "triangle")),
  door: () => [330, 440].forEach((f, i) => tone(f, i * 0.08, 0.1, 0.04, "triangle")),
  lift: () => [880, 660].forEach((f, i) => tone(f, i * 0.2, 0.25, 0.04, "sine")),
};

export function sfx(name: string): void {
  if (muted) return;
  try {
    if (!ac) ac = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ac.state === "suspended") void ac.resume();
    SOUNDS[name]?.();
  } catch {
    /* no audio, no problem */
  }
}
