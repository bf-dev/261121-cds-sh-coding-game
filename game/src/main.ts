import "./style.css";
import { TILE, VIEW_H, VIEW_W, type Action, type Dir, type PowerUpKind } from "./engine/types";
import { World, type Target } from "./engine/world";
import { getCharacter } from "./art/characters";
import { floorInfo } from "./maps/cds1";
import { setLedText } from "./maps/grandhall";
import { B5_FLOORS } from "./maps/b5";
import { LEO, professor, PROFESSORS } from "./data/professors";
import { PEOPLE } from "./data/people";
import { FLOOR_GAME, GAME_INFO, LABS, POSTCARDS, type ExtraCard, type MiniGame } from "./data/labs";
import { playHanoi } from "./minigames/hanoi";
import { playHangman } from "./minigames/hangman";
import { playSnake } from "./minigames/snake";
import { HISTORY_POSTCARD, playHistory } from "./minigames/history";
import { playShanghai, SHANGHAI_POSTCARDS, shanghaiPicture } from "./minigames/shanghai";
import { campusMapPreview, campusMini, openCampusMap } from "./ui/campusmap";
import { CARDS, enemyPool, enemyShieldCount, FN_ORDER, OP_ORDER, POWER_ORDER, REWARDS, STUDY_FNS, STUDY_VISITS } from "./data/cards";
import { applyReward, BOSS_BONUS_HP, BOSS_HP, campusBonus, clearProgress, enemyHp, freshProgress, loadProgress, playerMaxHp, progressAtFloor, saveProgress, shieldBlocksFor, shieldDigitsFor, type Progress } from "./state";
import { runBattle, type BattleConfig } from "./battle/ui";
import { slotsForFloor } from "./battle/rules";
import { cardPicture, hatBlock, moveBlock, shieldBlock } from "./battle/blocks";
import { cardPopup, dialogOpen, showDialog, toast } from "./ui/dialogs";
import { h, pace, sleep, ui } from "./ui/dom";
import { sfx } from "./ui/sfx";
import { musicOn, setMusic } from "./ui/music";
import { llmEnabled } from "./battle/llm";
import { crest, loadLogo } from "./art/logo";

const params = new URLSearchParams(location.search);
const canvas = document.getElementById("game") as HTMLCanvasElement;
const stage = document.getElementById("stage") as HTMLElement;

function fitStage(): void {
  const s = Math.min(window.innerWidth / VIEW_W, window.innerHeight / VIEW_H);
  const x = Math.round((window.innerWidth - VIEW_W * s) / 2);
  const y = Math.round((window.innerHeight - VIEW_H * s) / 2);
  stage.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
}
window.addEventListener("resize", fitStage);
fitStage();

let progress: Progress = loadProgress() ?? freshProgress();
/** debug links and demo mode never touch the saved game */
let sandbox = false;
/** explore mode: every door is open and nobody battles */
let exploring = false;
const save = () => {
  if (!sandbox) saveProgress(progress);
};

let busy = false; // a dialog flow, battle or transition is running
let inBattle = false;
let currentTarget: Target | null = null;

// ------------------------------------------------------------------ HUD
const locEn = h("span", {});
const hudLoc = h("div", { class: "hud hud-loc panel" }, h("div", { class: "en" }, h("span", { class: "crest" }), locEn));
const hudQuest = h("div", { class: "hud hud-quest panel" });
const promptBtn = h("button", { class: "prompt panel off", type: "button", id: "prompt" });
const fade = h("div", { class: "fade" });
const hudBtns = h(
  "div",
  { class: "hud hud-btns" },
  h("button", { class: "btn", type: "button", id: "btn-home", title: "Leave this building", onclick: () => void goHome() }, "Home"),
  h("button", { class: "btn", type: "button", id: "btn-guide", onclick: () => void openGuide() }, "Guide"),
  h("button", { class: "btn", type: "button", id: "btn-bag", onclick: () => void openBag() }, "Bag"),
  h("button", { class: "btn", type: "button", id: "btn-menu", onclick: () => void openMenu() }, "Menu"),
);
const dpad = h("div", { class: "hud dpad" });
const pad = { x: 0, y: 0 };
for (const [cls, dx, dy, label] of [
  ["up", 0, -1, "▲"],
  ["down", 0, 1, "▼"],
  ["left", -1, 0, "◀"],
  ["right", 1, 0, "▶"],
] as const) {
  const b = h("button", { class: cls, type: "button", "aria-label": cls }, label);
  const on = (e: Event) => {
    e.preventDefault();
    pad.x = dx;
    pad.y = dy;
  };
  const off = () => {
    pad.x = 0;
    pad.y = 0;
  };
  b.addEventListener("pointerdown", on);
  b.addEventListener("pointerup", off);
  b.addEventListener("pointerleave", off);
  b.addEventListener("pointercancel", off);
  dpad.append(b);
}
const here = () => ({ map: world.map.id, tx: Math.floor(world.px / TILE), ty: Math.floor(world.py / TILE) });
/** the small live campus map, built the first time the HUD shows (the art must be loaded first) */
let mini: ReturnType<typeof campusMini> | null = null;
function miniMap(): ReturnType<typeof campusMini> {
  if (mini) return mini;
  mini = campusMini();
  mini.el.addEventListener("click", () => {
    if (busy || dialogOpen()) return;
    busy = true;
    world.paused = true;
    void openCampusMap(here()).then(() => {
      busy = false;
      world.paused = false;
    });
  });
  promptBtn.before(mini.el);
  return mini;
}
ui().append(hudLoc, hudQuest, hudBtns, dpad, promptBtn, fade);
promptBtn.onclick = () => void interact();

function showHud(on: boolean): void {
  for (const el of [hudLoc, hudQuest, hudBtns, dpad]) el.classList.toggle("off", !on);
  mini?.el.classList.toggle("off", !on);
  if (!on) promptBtn.classList.add("off");
  else refreshPrompt();
}

function refreshPrompt(): void {
  const t = currentTarget;
  if (!t || busy) {
    promptBtn.classList.add("off");
    return;
  }
  promptBtn.classList.remove("off");
  promptBtn.replaceChildren(h("kbd", {}, "Space"), t.en);
}

function questText(): (string | Node)[] {
  const p = progress;
  if (exploring) return [h("b", {}, "Sandbox mode"), ": walk anywhere, no battles. The lift, Building 5 and the Grand Hall are open. Menu, then Title screen, to leave."];
  const blocks = h("span", { class: "quest-blocks" }, "Stamps ", h("b", {}, `${p.cleared}/14`), " · ");
  if (p.bossBeaten) return ["You are a CDS Explorer. Keep exploring the campus, there are details left to find."];
  if (p.cleared >= 14) {
    if (world.map?.id === "hall") return [blocks, "Climb the steps and talk to ", h("b", {}, "Leo"), " on the stage for the final challenge."];
    return [blocks, "Next: ", h("b", {}, "the Grand Hall"), ". Take the CDS-1 lift and choose Grand Hall. Leo is waiting."];
  }
  const next = professor(p.cleared + 1);
  if (p.cleared === 0 && world.map?.id === "b5-1") return [blocks, "Enjoy the welcome dinner, then leave by the door and walk south to the ", h("b", {}, "CDS-1 entrance"), "."];
  if (p.cleared === 0 && world.map?.id === "outside") return [blocks, "Walk to the ", h("b", {}, "CDS-1 entrance"), " and go in. ", `${next.name}, your first mentor, is on 1/F.`];
  const where = world.map?.id === `cds1-${next.floor}` ? (next.floor === 1 ? "in the entrance lobby, by the timetable screen" : "in one of the rooms on this floor") : `on CDS-1 ${next.floor}/F (take the lift)`;
  const extra = p.b5key && p.cleared === 3 ? " Building 5 upstairs is open now: gym on 2/F, study stair on 3/F." : "";
  return [blocks, "Next: find ", h("b", {}, next.name), ` ${where}.${extra}`];
}

function refreshHud(): void {
  locEn.textContent = world.map.name;
  document.getElementById("btn-home")!.style.display = world.map.id === "outside" ? "none" : "";
  hudQuest.replaceChildren(...questText());
}

// ------------------------------------------------------------------ world
const world = new World(canvas, {
  mark: (npc) => {
    const a = npc.action;
    if (!a || inBattle) return "";
    if (a.type === "battle") return a.floor <= progress.cleared ? "ok" : a.floor === progress.cleared + 1 ? "!" : "";
    if (a.type === "boss") return progress.bossBeaten ? "ok" : "!";
    return "";
  },
  onAuto: (t) => void runAction(t),
  onTarget: (t) => {
    currentTarget = t;
    refreshPrompt();
  },
});

/** the Home button: straight out of the building you are in, to its door on the campus */
async function goHome(): Promise<void> {
  if (busy || dialogOpen() || world.map.id === "outside") return;
  busy = true;
  world.paused = true;
  await travel("outside", world.map.id.startsWith("b5-") ? "b5-door" : "cds1-door");
  busy = false;
  world.paused = false;
  refreshPrompt();
}

/** a person on campus speaks: one box per line, with their face */
async function talkTo(id: string, char: string, fallbackName: string): Promise<void> {
  const who = PEOPLE[id];
  const lines = who?.say(progress) ?? ["Hello! Enjoy your visit to CDS Shanghai."];
  const portrait = getCharacter(char).portrait;
  for (let i = 0; i < lines.length; i++) {
    const more = i < lines.length - 1;
    const go = await showDialog<boolean>({ kicker: `${who?.role ?? "On campus"} · ${world.map.name}`, title: who?.name ?? fallbackName, portrait, body: [`"${lines[i]}"`], buttons: more ? [{ label: "Next", value: true, primary: true }, { label: "Bye", value: false }] : [{ label: "Bye", value: false, primary: true }] });
    if (!go) return;
  }
}

/** fast-travel stops: a place appears in the list once it has been reached on foot */
const STOPS = [
  { id: "gate", test: /^outside$/, label: "Campus gate and plaza", map: "outside", spawn: "start" },
  { id: "cds1", test: /^cds1-/, label: "CDS-1 lobby", map: "cds1-1", spawn: "door" },
  { id: "b5", test: /^b5-/, label: "Building 5, University Galleria", map: "b5-1", spawn: "door" },
  { id: "hall", test: /^hall$/, label: "Grand Hall", map: "hall", spawn: "entry" },
];

async function travel(map: string, spawn: string, quiet = false): Promise<void> {
  fade.classList.add("on");
  if (!quiet) sfx("door");
  await sleep(240);
  world.enter(map, spawn);
  progress.map = map;
  progress.spawn = spawn;
  const stop = STOPS.find((x) => x.test.test(map));
  if (stop && !progress.visited.includes(stop.id)) progress.visited.push(stop.id);
  save();
  refreshHud();
  await sleep(120);
  fade.classList.remove("on");
}

async function interact(): Promise<void> {
  if (busy || dialogOpen() || !currentTarget) return;
  await runAction(currentTarget);
}

async function runAction(t: Target): Promise<void> {
  if (busy) return;
  busy = true;
  world.paused = true;
  refreshPrompt();
  try {
    await doAction(t.action, t);
  } finally {
    busy = false;
    world.paused = false;
    refreshHud();
    refreshPrompt();
  }
}

async function doAction(a: Action, t: Target): Promise<void> {
  switch (a.type) {
    case "goto":
      if (!progress.b5key && /^b5-[2-5]$/.test(a.map)) {
        await showDialog({ kicker: "Locked", title: "Upstairs opens later", body: ["The University Galleria on this floor is open to every guest. The gym and the study floors above open with the key card you earn on CDS-1 3/F."] });
        return;
      }
      if (a.requires === "b5key" && !progress.b5key && a.map !== "b5-1") {
        await showDialog({ kicker: "Locked", title: "Building 5 is locked", body: [`The student spaces are inside: the gym and the study stair. The key card is in the lab on CDS-1 3/F. Get certified on the first three floors and clear that lab.`] });
        return;
      }
      if (a.requires === "hallpass" && !progress.hallpass) {
        await showDialog({ kicker: "Locked", title: "The Grand Hall is closed", body: ["The Grand Hall opens for Leo's final challenge once you hold all 14 stamps from CDS-1."] });
        return;
      }
      await travel(a.map, a.spawn);
      return;
    case "lift":
      if (a.building === "b5" && !progress.b5key) await showDialog({ kicker: "Locked", title: "Upstairs opens later", body: ["The lift goes to the gym and the study floors. They open with the key card you earn on CDS-1 3/F."] });
      else if (a.building === "b5") await b5LiftPicker();
      else await liftPicker();
      return;
    case "battle":
      await fight(a.floor, t);
      return;
    case "lab":
      await labDoor(Number(/^cds1-(\d+)$/.exec(world.map.id)?.[1] ?? 0));
      return;
    case "boss":
      await fightBoss(t);
      return;
    case "powerup":
      await station(a.kind);
      return;
    case "talk": {
      if (t.npc) await talkTo(t.npc.id, t.npc.char, t.npc.name);
      return;
    }
    case "info": {
      const isNew = !progress.found.includes(t.id);
      if (isNew) {
        progress.found.push(t.id);
        save();
      }
      await showDialog({ kicker: `Campus detail${isNew ? ` · ${progress.found.length} found` : ""}`, title: a.title, body: [a.text, ...(isNew && progress.found.length <= 20 ? [h("p", { class: "dim" }, `You know the campus a little better: +1 maximum HP in every battle (${progress.found.length} of 20).`)] : [])] });
      if (t.id === "gate") {
        const go = await showDialog<boolean>({ kicker: "Discovery board", title: "Beyond campus: Shanghai", body: ["Next to the gate stands a board of illustrated postcards from the city. Match three clues and keep one.", h("p", { class: "dim" }, "Optional. The postcards are illustrations, not maps.")], buttons: [{ label: "Have a look", value: true, primary: true }, { label: "Later", value: false }] });
        if (go) {
          const id = await playShanghai();
          const card = SHANGHAI_POSTCARDS.find((c) => c.id === id);
          if (card) await awardExtra({ ...card, album: "shanghai" });
        }
      }
      return;
    }
  }
}

// ------------------------------------------------------------------ lift
function liftPicker(): Promise<void> {
  return new Promise((resolve) => {
    const here = Number(/^cds1-(\d+)$/.exec(world.map.id)?.[1] ?? 0);
    const grid = h("div", { class: "lift-grid" });
    const veil = h("div", { class: "veil" });
    const close = () => {
      veil.remove();
      window.removeEventListener("keydown", onKey, true);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        resolve();
      }
    };
    const go = async (map: string, spawn: string) => {
      close();
      sfx("lift");
      await travel(map, spawn, true);
      resolve();
    };
    const order = [14, 7, 13, 6, 12, 5, 11, 4, 10, 3, 9, 2, 8, 1];
    for (const f of order) {
      const open = f <= progress.cleared + 1;
      const info = floorInfo(f);
      const prof = professor(f);
      const b = h(
        "button",
        { class: `lift-btn ${open ? "" : "locked"} ${f === here ? "here" : ""}`, type: "button", "data-floor": f, disabled: !open },
        h("span", { class: "num" }, String(f)),
        h("span", { class: "what" }, info.en.replace(/^CDS-1 \d+\/F\s*·?\s*/, "") || `Floor ${f}`, h("span", {}, open ? `${prof.name} · ${prof.topic}` : `Beat ${professor(f - 1).name} on ${f - 1}/F first`)),
        f <= progress.cleared ? h("span", { class: "tick" }, "✓") : null,
      );
      if (open) b.onclick = () => void go(`cds1-${f}`, "lift");
      grid.append(b);
    }
    const hall = progress.hallpass ? h("button", { class: "btn primary", type: "button", id: "lift-hall", onclick: () => void toHall(close, resolve) }, "Grand Hall") : null;
    const box = h(
      "div",
      { class: "dialog wide" },
      h("div", { class: "dialog-main" }, h("div", { class: "kicker" }, "School of Computing & Data Science · The University of Hong Kong"), h("h2", {}, "Lift"), grid, h("div", { class: "dialog-buttons" }, hall, h("button", { class: "btn", type: "button", onclick: () => (close(), resolve()) }, "Stay here"))),
    );
    veil.append(box);
    ui().append(veil);
    window.addEventListener("keydown", onKey, true);
  });
}

/** Building 5: the lift serves 1/F to 5/F, every floor is open once you hold the key */
async function b5LiftPicker(): Promise<void> {
  const here = Number(/^b5-(\d)$/.exec(world.map.id)?.[1] ?? 0);
  const what: Record<number, string> = { 1: "the way out to the plaza", 2: "gym session power-up", 3: "study stair: learn a new block", 4: "project rooms, top of the study stair", 5: "self-study rooms and carrels" };
  const grid = h("div", { class: "lift-grid b5" });
  const floor = await new Promise<number>((resolve) => {
    const veil = h("div", { class: "veil" });
    const done = (f: number) => {
      veil.remove();
      window.removeEventListener("keydown", onKey, true);
      resolve(f);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") done(0);
    };
    for (const f of B5_FLOORS.slice().reverse()) {
      const b = h("button", { class: `lift-btn ${f.floor === here ? "here" : ""}`, type: "button", "data-floor": f.floor }, h("span", { class: "num" }, String(f.floor)), h("span", { class: "what" }, f.name, h("span", {}, what[f.floor] ?? "")));
      b.onclick = () => done(f.floor);
      grid.append(b);
    }
    veil.append(h("div", { class: "dialog wide" }, h("div", { class: "dialog-main" }, h("div", { class: "kicker" }, "Building 5 · HKU Zhangjiang Base"), h("h2", {}, "Lift"), grid, h("div", { class: "dialog-buttons" }, h("button", { class: "btn", type: "button", onclick: () => done(0) }, "Stay here")))));
    ui().append(veil);
    window.addEventListener("keydown", onKey, true);
  });
  if (!floor || floor === here) return;
  sfx("lift");
  await travel(`b5-${floor}`, "lift", true);
}

async function toHall(close: () => void, resolve: () => void): Promise<void> {
  close();
  await showDialog({ kicker: "After floor 14", title: "To the Grand Hall", body: ["With 14 stamps in your bag you ride the lift down and cross the plaza. The doors of the Grand Hall are open, and Leo is on the stage, waving."] });
  await travel("hall", "entry");
  resolve();
}

// ------------------------------------------------------------------ battles
/**
 * Battle pose: the student steps to the professor's side so both stand on one line, above the
 * HP panels, facing each other. Returns a function that puts the student back afterwards.
 */
function battlePose(t: Target, boss: boolean): () => void {
  const n = t.npc;
  if (!n) return () => {};
  const back = { x: world.px, y: world.py, dir: world.dir };
  const nx = n.tx * TILE + TILE / 2;
  const ny = n.ty * TILE + TILE - 10;
  const gap = (boss ? 3 : 2) * TILE;
  // stand on the side the student came from, unless that spot is inside a wall
  const fromLeft = world.px <= nx;
  const side = world.canStand(nx + (fromLeft ? -gap : gap), ny) ? (fromLeft ? -1 : 1) : world.canStand(nx + (fromLeft ? gap : -gap), ny) ? (fromLeft ? 1 : -1) : fromLeft ? -1 : 1;
  world.px = nx + side * gap;
  world.py = ny;
  world.dir = side < 0 ? "right" : "left";
  // against Leo the camera sits at the top of the hall, so the whole LED wall is in view
  world.focus = boss ? { x: (nx + world.px) / 2, y: 0, screenY: 0 } : { x: (nx + world.px) / 2, y: ny, screenY: 196 };
  return () => {
    world.px = back.x;
    world.py = back.y;
    world.dir = back.dir;
  };
}

async function battle(cfg: BattleConfig, t: Target | null, bossPose = cfg.boss): Promise<"win" | "lose" | "quit"> {
  const restore = t ? battlePose(t, bossPose) : () => {};
  inBattle = true;
  showHud(false);
  const speed = pace.speed;
  const result = await runBattle(cfg);
  if (!pace.auto) pace.speed = speed;
  inBattle = false;
  world.focus = null;
  restore();
  world.snapCamera();
  showHud(true);
  for (const id of cfg.seen) if (!progress.seen.includes(id)) progress.seen.push(id);
  save();
  return result;
}

function baseConfig(p: Progress): Pick<BattleConfig, "playerMax" | "ops" | "brackets" | "fns" | "power" | "seen" | "auto" | "shieldBlocks" | "shieldDigits"> {
  return { playerMax: playerMaxHp(p), ops: p.ops.slice(), brackets: p.brackets, fns: FN_ORDER.filter((f) => p.fns.includes(f)), power: p.power, seen: new Set(p.seen), auto: pace.auto, shieldBlocks: shieldBlocksFor(p), shieldDigits: shieldDigitsFor(p) };
}

async function fight(floor: number, t: Target | null): Promise<void> {
  const prof = professor(floor);
  const sheet = getCharacter(prof.char);
  if (exploring) {
    await showDialog({ kicker: `${floorInfo(floor).en} · ${prof.topic}`, title: prof.name, titleZh: prof.nameZh, portrait: sheet.portrait, body: [`"${prof.hello}"`, h("p", { class: "dim" }, "Sandbox mode has no battles. Start a New game from the title screen to take the test.")] });
    return;
  }
  if (floor > progress.cleared + 1) {
    await showDialog({ title: prof.name, titleZh: prof.nameZh, portrait: sheet.portrait, body: [`You are not ready for ${floor}/F yet. Beat ${professor(progress.cleared + 1).name} on ${progress.cleared + 1}/F first.`] });
    return;
  }
  if (floor <= progress.cleared) {
    const again = await showDialog<boolean>({ title: prof.name, titleZh: prof.nameZh, portrait: sheet.portrait, body: ["You already have my stamp. Well done! Want a practice rematch?"], buttons: [{ label: "Go on", value: false, primary: true }, { label: "Rematch", value: true }] });
    if (!again) return;
  }
  while (true) {
    const cfg: BattleConfig = {
      ...baseConfig(progress),
      floor,
      boss: false,
      place: `${floorInfo(floor).en}`,
      enemy: prof,
      enemyHp: enemyHp(floor),
      skill: ((floor - 1) / 13) * 0.95,
      pool: enemyPool(floor),
      foeShields: enemyShieldCount(floor),
      level: (floor - 1) / 13,
      slots: slotsForFloor(floor),
      tutorial: floor === 1 && progress.cleared === 0 && !pace.auto && !progress.seen.includes("tutorial"),
    };
    const result = await battle(cfg, t);
    if (cfg.tutorial && !progress.seen.includes("tutorial")) progress.seen.push("tutorial");
    if (result === "quit") return;
    if (result === "win") {
      if (floor === progress.cleared + 1) await winFloor(floor);
      else await showDialog({ title: "You win again!", portrait: sheet.portrait, body: ["Good practice."] });
      return;
    }
    const retry = await showDialog<boolean>({ kicker: "Out of HP", title: `${prof.name}: Good try!`, portrait: sheet.portrait, body: ["Every professor here was a beginner once. Your blocks are new each battle, so try again.", h("p", { class: "dim" }, "Tip: look at what the shield did last time, and aim your next ATTACK around it.")], buttons: [{ label: "Try again", value: true, primary: true }, { label: "Later", value: false }] });
    if (!retry) return;
  }
}

async function winFloor(floor: number): Promise<void> {
  const prof = professor(floor);
  const r = REWARDS[floor];
  const before = slotsForFloor(floor);
  applyReward(progress, floor);
  const after = slotsForFloor(floor + 1);
  save();
  const snap = snapshot();
  const items = [`Stamp ${floor} of 14 from ${prof.name}`, r.text, `A postcard of ${floor}/F`, "+8 maximum HP", floor < 14 ? `The lift now goes up to ${floor + 1}/F` : "You hold all 14 stamps"];
  if (after > before && floor < 14) items.push(`One more operator slot: your moves can use ${after} operators`);
  await showDialog({ kicker: `CDS-1 ${floor}/F · challenge completed `, title: `Well done! ${prof.name} is impressed`, portrait: getCharacter(prof.char).portrait, body: [`"${prof.win}"`, h("ul", { class: "reward-list" }, ...items.map((i) => h("li", {}, i)))], buttons: [{ label: "Collect", value: true, primary: true }] });
  for (const id of [r.fn, r.op, r.brackets ? "brackets" : undefined, r.power]) {
    if (id && !progress.seen.includes(id)) {
      progress.seen.push(id);
      await cardPopup(id);
    }
  }
  await showDialog({ kicker: `Postcard ${floor} of 14`, title: "A postcard for your bag", body: [postcardEl(floor, snap), h("p", { class: "dim" }, `The lab on this floor is open now: the guide's question and ${GAME_INFO[FLOOR_GAME[floor]].name}. Both are optional, and the door stays open.`)], buttons: [{ label: "Later", value: false, primary: true }, { label: "Visit the lab now", value: true }] }).then((now) => (now ? labDoor(floor) : undefined));
  save();
}

/** what waits in the lab of a floor, in a few words */
function labPrize(floor: number): string {
  const r = REWARDS[floor];
  const parts: string[] = [];
  if (r.fn) parts.push(`the ${CARDS[r.fn].name} block`);
  if (r.op) parts.push(`the ${r.op} block`);
  if (r.brackets) parts.push("the brackets");
  if (r.key) parts.push("the key card to Building 5");
  if (r.shieldBlock) parts.push("one more shield block");
  if (r.power) parts.push(r.power === "gym" ? "a gym pass" : "a can of Red Bull");
  if (r.hallpass) parts.push("the way into the Grand Hall");
  return parts.join(", ");
}

/** the view of the floor right now, for the picture side of a postcard */
function snapshot(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 480;
  c.height = 270;
  const g = c.getContext("2d")!;
  g.imageSmoothingEnabled = false;
  g.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, c.width, c.height);
  return c;
}

function postcardEl(floor: number, picture?: HTMLCanvasElement): HTMLElement {
  return cardEl(POSTCARDS[floor], `${floor}/F`, picture, `CDS-1 ${floor}/F`);
}

/** one postcard: with a picture it is the big one of the win screen, without it the small album card */
function cardEl(c: { title: string; zh: string; fact: string }, tag: string, picture?: HTMLCanvasElement, corner = ""): HTMLElement {
  return h(
    "div",
    { class: `postcard ${picture ? "" : "mini"}` },
    picture ? h("div", { class: "pc-pic" }, picture, h("span", { class: "pc-floor" }, corner)) : null,
    h("div", { class: "pc-text" }, h("div", { class: "pc-stamp" }, crest(picture ? 54 : 34), h("span", {}, tag)), h("b", {}, c.title), h("p", {}, c.fact), picture ? h("div", { class: "pc-from" }, "Greetings from HKU CDS Shanghai") : null),
  );
}

const EXTRA_CARDS: ExtraCard[] = [...Object.values(GAME_INFO).map((g) => (g.card.id === "story-history" ? { ...g.card, ...HISTORY_POSTCARD, id: g.card.id, album: "stories" as const } : g.card)), ...SHANGHAI_POSTCARDS.map((c) => ({ ...c, album: "shanghai" as const }))];

/** an extra postcard from an optional game; the first one of each kind is also worth 1 HP */
async function awardExtra(card: ExtraCard): Promise<void> {
  const isNew = !progress.extras.includes(card.id);
  if (isNew) progress.extras.push(card.id);
  const hp = isNew && !progress.found.includes(card.id) && progress.found.length < 20;
  if (hp) progress.found.push(card.id);
  save();
  sfx("win");
  await showDialog({ kicker: card.album === "shanghai" ? "Beyond Campus: Shanghai" : "HKU Stories", title: isNew ? "A new postcard" : "You have this postcard already", body: [card.album === "shanghai" ? cardEl(card, "SH", shanghaiPicture(card.id), "Shanghai") : cardEl(card, "HKU"), ...(hp ? [h("p", { class: "dim" }, `+1 maximum HP in every challenge (${progress.found.length} of 20).`)] : [])], buttons: [{ label: "Keep it", value: true, primary: true }] });
}

async function runMini(game: MiniGame): Promise<void> {
  const won = game === "hanoi" ? await playHanoi(3) : game === "hanoi4" ? await playHanoi(4) : game === "hangman" ? await playHangman() : game === "snake" ? await playSnake() : await playHistory();
  if (won) await awardExtra(EXTRA_CARDS.find((c) => c.id === GAME_INFO[game].card.id) ?? GAME_INFO[game].card);
}

// ------------------------------------------------------------------ labs: optional, a question from the guide and a small game
async function labDoor(floor: number): Promise<void> {
  const L = LABS[floor];
  if (!floor || !L) return;
  const kicker = `Lab · CDS-1 ${floor}/F`;
  if (floor > progress.cleared && !exploring) {
    await showDialog({ kicker, title: "The lab opens after the challenge", body: [`Meet ${professor(floor).name} first, then come back. Inside: a question from the guide and ${GAME_INFO[FLOOR_GAME[floor]].name}. Both are optional.`] });
    return;
  }
  const game = FLOOR_GAME[floor];
  const info = GAME_INFO[game];
  while (true) {
    const asked = progress.found.includes(`lab-${floor}`);
    const have = progress.extras.includes(info.card.id);
    const pick = await showDialog<string>({
      kicker,
      title: "The lab is open",
      wide: true,
      body: ["Two things to try here. Both are optional, and you can come back at any time.", h("ul", { class: "reward-list" }, h("li", {}, h("b", {}, `${info.name}: `), info.learn, have ? " (postcard collected)" : " Reward: a postcard."), h("li", {}, h("b", {}, "The guide's question: "), "one question about the idea of this floor.", asked ? " (answered)" : " Reward: +1 maximum HP."))],
      buttons: [{ label: info.name, value: "game", primary: true }, { label: "The guide's question", value: "quiz" }, { label: "Leave", value: "leave" }],
    });
    if (pick === "game") await runMini(game);
    else if (pick === "quiz") await labQuiz(floor);
    else return;
  }
}

async function labQuiz(floor: number): Promise<void> {
  const L = LABS[floor];
  const kicker = `Lab · CDS-1 ${floor}/F`;
  const id = `lab-${floor}`;
  let tries = 0;
  while (true) {
    const pick = await showDialog<number>({
      kicker,
      title: "The guide's question",
      wide: true,
      body: [h("p", { class: "dim" }, tries >= 2 ? `Worked step: ${L.why}` : tries ? `Hint: ${L.hint}` : "Your AI guide: \"I can explain, but you make the call. What do you think?\""), ...(L.picture ? [h("div", { class: "lab-pic" }, L.picture())] : []), h("p", { class: "lab-q" }, L.q)],
      buttons: [...L.options.map((label, value) => ({ label, value })), { label: "Later", value: -1 }],
    });
    if (pick === -1) return;
    if (pick === L.answer) break;
    tries++;
    await showDialog({ kicker, title: "Not quite", body: [`"${L.options[pick]}" is not it. ${L.hint}`], buttons: [{ label: "Try again", value: true, primary: true }] });
  }
  const isNew = !progress.found.includes(id);
  if (isNew) progress.found.push(id);
  save();
  sfx("win");
  await showDialog({ kicker, title: "Correct!", body: [L.why, ...(isNew && progress.found.length <= 20 ? [h("p", { class: "dim" }, `+1 maximum HP in every challenge (${progress.found.length} of 20).`)] : [])], buttons: [{ label: "Nice", value: true, primary: true }] });
}

async function fightBoss(t: Target | null): Promise<void> {
  const sheet = getCharacter("leo");
  if (exploring) {
    await showDialog({ kicker: "Grand Hall", title: "Leo the HKU lion", portrait: sheet.portrait, body: ['"ROAR! Welcome to the Grand Hall. The big wall behind me is where the final battle of the game is fought."', h("p", { class: "dim" }, "Sandbox mode has no battles. Start a New game from the title screen to play the story.")] });
    return;
  }
  while (true) {
    const cfg: BattleConfig = { ...baseConfig(progress), playerMax: playerMaxHp(progress) + BOSS_BONUS_HP, floor: 15, boss: true, place: "Grand Hall", enemy: LEO, enemyHp: BOSS_HP, skill: 0.85, pool: enemyPool(15, true), foeShields: enemyShieldCount(15, true), level: 1, slots: 6, tutorial: false, onLed: setLedText };
    const result = await battle(cfg, t);
    if (result !== "win") setLedText([]);
    if (result === "quit") return;
    if (result === "win") {
      progress.bossBeaten = true;
      save();
      // the welcome program runs: the wall lights up before anyone speaks
      setLedText(["print('Congratulations, CDS Explorer!')", "# 14 stamps, 14 mentors, 1 lion", "# Sapientia et Virtus"]);
      showHud(false);
      world.focus = { x: world.px, y: 0, screenY: 0 };
      refreshHud();
      sfx("win");
      await sleep(3200);
      world.focus = null;
      showHud(true);
      await ending();
      return;
    }
    const retry = await showDialog<boolean>({ kicker: "Out of HP", title: "Leo: Almost!", portrait: sheet.portrait, body: ["Leo pats you on the shoulder with a big paw. Lions do not give up, and neither do CDS students."], buttons: [{ label: "Try again", value: true, primary: true }, { label: "Later", value: false }] });
    if (!retry) return;
  }
}

async function ending(): Promise<void> {
  const sheet = getCharacter("leo");
  await showDialog({ kicker: "Final challenge completed", title: "Leo: Congratulations, CDS Explorer!", portrait: sheet.portrait, wide: true, body: [certificateEl(), "The Grand Hall wall lights up, and the friends you met at the welcome dinner are cheering in the seats."], buttons: [{ label: "My postcards", value: true, primary: true }] });
  const mine = EXTRA_CARDS.filter((c) => progress.extras.includes(c.id));
  await showDialog({ kicker: `Your visit in postcards · ${progress.cleared + mine.length} collected`, title: "The album", wide: true, body: [h("div", { class: "postcard-grid album" }, ...Array.from({ length: progress.cleared }, (_, i) => postcardEl(i + 1)), ...mine.map((c) => cardEl(c, c.album === "shanghai" ? "SH" : "HKU")))], buttons: [{ label: "What did I learn?", value: true, primary: true }] });
  await showDialog({
    kicker: "You can read code now",
    title: "What you learned",
    wide: true,
    autoMs: 5000,
    body: [
      h("ul", { class: "reward-list" }, h("li", {}, "A variable holds a number that changes: damage."), h("li", {}, "Operators have an order: × and ÷ before + and -, brackets first."), h("li", {}, "A for loop repeats a block a set number of times: you chose how many."), h("li", {}, "An if runs a block only when a test is true. else is the other path."), h("li", {}, "A while loop repeats as long as a test stays true.")),
      h("div", { class: "pybox" }, h("span", { class: "pylabel" }, "Your last battle, as a Python program"), h("pre", {}, "damage = 8 + 2 * 3      # 14\nfor i in range(3):\n    damage -= 2         # 8\nif damage > 5:\n    damage -= 5         # 3")),
    ],
    buttons: [{ label: "Keep exploring the campus", value: true, primary: true }],
  });
}

function certificateEl(): HTMLElement {
  const d = new Date();
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return h(
    "div",
    { class: "certificate" },
    h("div", { class: "cert-crest" }, crest(96)),
    h("div", { class: "cert-kicker" }, "HKU School of Computing and Data Science · Shanghai"),
    h("div", { class: "cert-title" }, "CDS Explorer"),
    h("div", { class: "cert-text" }, `This visitor climbed the 14 floors of CDS-1, completed ${progress.cleared} block challenges with their mentors and passed Leo's final challenge in the Grand Hall.`),
    h("div", { class: "cert-foot" }, h("span", {}, date), h("span", { class: "cert-sign" }, "Leo", h("small", {}, "the HKU lion"))),
  );
}

// ------------------------------------------------------------------ Building 5 stations and the food lockers
async function station(kind: PowerUpKind): Promise<void> {
  const p = progress;
  if (kind === "study") {
    if (p.studied >= STUDY_VISITS) {
      await showDialog({ kicker: "Study stair", title: "Nothing new to study", body: ["You have learned everything the study stair can teach. The rest comes from the professors."] });
      return;
    }
    if (p.used.study === p.cleared) {
      await showDialog({ kicker: "Study stair", title: "Your head is full", body: ["Beat another professor in CDS-1, then come back and study some more."] });
      return;
    }
    const next = STUDY_FNS[p.studied];
    p.used.study = p.cleared;
    p.studied++;
    sfx("power");
    if (next) {
      if (!p.fns.includes(next)) p.fns.push(next);
      if (!p.seen.includes(next)) p.seen.push(next);
      save();
      await cardPopup(next, "You studied a new block");
    } else {
      save();
      await showDialog({ kicker: "Study stair", title: "You studied hard", body: ["An hour on the timber steps with your notes. From now on you are dealt 2 more shield numbers at the start of every battle."] });
    }
    return;
  }
  const names: Record<string, [string, string, string]> = {
    gym: ["Gym", "Gym session", "You run on the treadmill with the canal outside the window."],
    food: ["Meituan locker", "Meituan meal", "Your order is in the yellow locker: a warm meal box, packed in your bag."],
    redbull: ["Drink fridge", "Red Bull", "A cold can from the glass-front fridge."],
  };
  const [kicker, name, line] = names[kind];
  if (p.power[kind] >= 2) {
    await showDialog({ kicker, title: "Your bag is full", body: [`You already carry 2 of ${name}. Use them in a battle first.`] });
    return;
  }
  if (p.used[kind] === p.cleared) {
    await showDialog({ kicker, title: "Come back later", body: [`You already took a ${name} since your last win. Beat another professor, then come back.`] });
    return;
  }
  p.used[kind] = p.cleared;
  p.power[kind]++;
  save();
  sfx("power");
  await showDialog({ kicker, title: `You got: ${name}`, body: [line, h("p", { class: "dim" }, `In your bag: ${p.power[kind]}. Power-ups are used at the start of your turn in a battle.`)] });
  if (!p.seen.includes(kind)) {
    p.seen.push(kind);
    save();
    await cardPopup(kind, "New power-up");
  }
}

// ------------------------------------------------------------------ bag and menu
/** where each block comes from, for the Bag */
function sourceOf(id: string): string {
  for (let f = 1; f <= 14; f++) {
    const r = REWARDS[f];
    if (r.fn === id || r.op === id || (id === "brackets" && r.brackets)) return `From ${professor(f).name}, CDS-1 ${f}/F.`;
  }
  if (STUDY_FNS.includes(id as (typeof STUDY_FNS)[number])) return "From the study stair in Building 5, 3/F.";
  return "Yours from the start.";
}

const POWER_WHERE: Record<string, string> = {
  redbull: "Where: the drink fridge in the CDS-1 1/F cafe, and from two mentors.",
  gym: "Where: the gym on Building 5 2/F (needs the key card).",
  food: "Where: the yellow Meituan lockers east of CDS-1.",
};

async function openBag(tab = "blocks"): Promise<void> {
  if (busy || dialogOpen()) return;
  busy = true;
  world.paused = true;
  const p = progress;
  const row = (id: string, extra?: string) => {
    const c = CARDS[id];
    return h("div", { class: "bag-row" }, cardPicture(id), h("div", { class: "bag-text" }, h("b", {}, c.name), h("p", {}, c.does), h("p", { class: "example" }, h("b", {}, "Example: "), c.example), h("p", { class: "dim" }, extra ?? sourceOf(id))));
  };
  const section = (title: string, kids: (HTMLElement | null)[]) => (kids.length ? [h("div", { class: "bag-h" }, title), ...kids.filter((k): k is HTMLElement => !!k)] : []);
  while (true) {
    const mine = EXTRA_CARDS.filter((c) => p.extras.includes(c.id));
    const body: HTMLElement[] =
      tab === "blocks"
        ? [h("div", { class: "bag-scroll" }, ...section("Always in your hand", ["ATTACK", "HEAL", "number"].map((id) => row(id))), ...section("Operators (drawn each turn)", [...OP_ORDER.filter((o) => p.ops.includes(o)), ...(p.brackets ? ["brackets"] : [])].map((id) => row(id))), ...section("Shield functions", FN_ORDER.filter((f) => p.fns.includes(f)).map((id) => row(id))))]
        : tab === "items"
          ? [
              h(
                "div",
                { class: "bag-scroll" },
                ...section(
                  "Items",
                  POWER_ORDER.map((k) => row(k, `In your bag: ${p.power[k]} of 2. Use it at the start of your turn in a challenge. ${POWER_WHERE[k]}`)),
                ),
                ...section("Keys", [
                  h("div", { class: "bag-row key" }, h("div", { class: `key-chip ${p.b5key ? "" : "off"}` }, "B5"), h("div", { class: "bag-text" }, h("b", {}, "Building 5 key card"), h("p", {}, p.b5key ? "Opens the lift and the stair of Building 5: gym on 2/F, study floors 3/F to 5/F." : "Not yet. It comes with stamp 3 on CDS-1 3/F. The Galleria on 1/F is open without it."))),
                  h("div", { class: "bag-row key" }, h("div", { class: `key-chip ${p.hallpass ? "" : "off"}` }, "GH"), h("div", { class: "bag-text" }, h("b", {}, "Grand Hall invitation"), h("p", {}, p.hallpass ? "Take the CDS-1 lift and choose Grand Hall for Leo's final challenge." : "Not yet. It comes with stamp 14 on the top floor."))),
                ]),
              ),
            ]
          : [
              h(
                "div",
                { class: "bag-scroll" },
                h("div", { class: "bag-h" }, `CDS-1 floors ${p.cleared}/14`),
                h("div", { class: "postcard-grid" }, ...Array.from({ length: p.cleared }, (_, i) => postcardEl(i + 1))),
                h("div", { class: "bag-h" }, `HKU Stories ${mine.filter((c) => c.album === "stories").length}/${EXTRA_CARDS.filter((c) => c.album === "stories").length}`),
                h("div", { class: "postcard-grid" }, ...mine.filter((c) => c.album === "stories").map((c) => cardEl(c, "HKU"))),
                h("div", { class: "bag-h" }, `Beyond Campus: Shanghai ${mine.filter((c) => c.album === "shanghai").length}/${EXTRA_CARDS.filter((c) => c.album === "shanghai").length}`),
                h("div", { class: "postcard-grid" }, ...mine.filter((c) => c.album === "shanghai").map((c) => cardEl(c, "SH"))),
                p.cleared + mine.length === 0 ? h("p", { class: "dim" }, "No postcards yet. Every mentor gives one, the lab games give more, and the board at the campus gate has the Shanghai set.") : null,
              ),
            ];
    const hp = playerMaxHp(p);
    const hpTop = 30 + 8 * 14 + 20;
    const hpBar = h(
      "div",
      { class: "bag-hp" },
      h("b", {}, `HP ${hp}`),
      h("div", { class: "bag-hp-bar" }, h("span", { class: "hp-base", style: `width:${(30 / hpTop) * 100}%` }), h("span", { class: "hp-stamps", style: `width:${((8 * p.cleared) / hpTop) * 100}%` }), h("span", { class: "hp-campus", style: `width:${(campusBonus(p) / hpTop) * 100}%` })),
      h("small", {}, `30 to start, +${8 * p.cleared} from ${p.cleared} stamps, +${campusBonus(p)} from campus details and lab games. You start every challenge with full HP.`),
    );
    body.unshift(hpBar);
    const pick = await showDialog<string>({
      kicker: `Stamps ${p.cleared} / 14 · campus details found ${p.found.length}`,
      title: tab === "blocks" ? "Your blocks" : tab === "items" ? "Items and keys" : "Postcard album",
      wide: true,
      body: body.filter(Boolean),
      buttons: [
        { label: "Blocks", value: "blocks", primary: tab === "blocks" },
        { label: "Items and keys", value: "items", primary: tab === "items" },
        { label: "Postcards", value: "cards", primary: tab === "cards" },
        { label: "Close", value: "close" },
      ],
    });
    if (pick === "close") break;
    tab = pick;
  }
  busy = false;
  world.paused = false;
}

// ------------------------------------------------------------------ the AI guide: directions, explanations, hints
let hintStep = 0;
let guidePic: HTMLCanvasElement | null = null;

/** the guide's face: a small round helper with a screen, drawn on a 32 px grid */
function guidePortrait(): HTMLCanvasElement {
  if (guidePic) return guidePic;
  const c = document.createElement("canvas");
  c.width = c.height = 320;
  const g = c.getContext("2d")!;
  const px = (col: string, x: number, y: number, w: number, hh: number) => {
    g.fillStyle = col;
    g.fillRect(x * 10, y * 10, w * 10, hh * 10);
  };
  px("#4a3430", 15, 3, 2, 4); // antenna
  px("#ffc94d", 14, 1, 4, 3);
  px("#4a3430", 6, 7, 20, 18); // head outline
  px("#4a3430", 5, 9, 22, 14);
  px("#fffdf5", 7, 8, 18, 16);
  px("#fffdf5", 6, 10, 20, 12);
  px("#0f6b4f", 8, 10, 16, 11); // screen
  px("#c8f0dc", 11, 13, 2, 3); // eyes
  px("#c8f0dc", 19, 13, 2, 3);
  px("#c8f0dc", 12, 18, 8, 1); // smile
  px("#c8f0dc", 11, 17, 1, 1);
  px("#c8f0dc", 20, 17, 1, 1);
  px("#ffb3c1", 9, 16, 2, 1); // cheeks
  px("#ffb3c1", 21, 16, 2, 1);
  px("#4a3430", 3, 13, 3, 6); // ears
  px("#ffc94d", 4, 14, 2, 4);
  px("#4a3430", 26, 13, 3, 6);
  px("#ffc94d", 26, 14, 2, 4);
  px("#4a3430", 10, 25, 12, 5); // body
  px("#e8f7f0", 11, 25, 10, 4);
  px("#b3261e", 15, 26, 2, 2);
  return (guidePic = c);
}

async function openGuide(): Promise<void> {
  if (busy || dialogOpen()) return;
  busy = true;
  world.paused = true;
  const me = guidePortrait();
  let reopen: string | null = null;
  while (true) {
    const pick = await showDialog<string>({
      kicker: "Your AI guide",
      title: "How can I help?",
      portrait: me,
      body: ['"I give directions, explanations and hints. You make the choices."'],
      buttons: [
        { label: "Where next?", value: "where", primary: true },
        { label: "What do my blocks do?", value: "blocks" },
        { label: "Give me a hint", value: "hint" },
        { label: "Campus map", value: "map" },
        { label: "Thanks", value: "close" },
      ],
    });
    if (pick === "close") break;
    if (pick === "blocks") {
      reopen = "blocks";
      break;
    }
    if (pick === "map") {
      await openCampusMap({ map: world.map.id, tx: Math.floor(world.px / TILE), ty: Math.floor(world.py / TILE) });
      continue;
    }
    if (pick === "where") {
      const p = progress;
      const here = world.map.id;
      const steps: string[] = [];
      if (exploring) steps.push("Sandbox mode: nothing is locked. The Menu has fast travel to every place you have reached.");
      else if (p.bossBeaten) steps.push("You have done everything on the trail. The lab games, the Shanghai board at the gate and the campus details are still there to collect.");
      else if (p.cleared >= 14) steps.push(here === "hall" ? "Climb the steps to the stage and talk to Leo." : here.startsWith("cds1-") ? "Walk to the lifts, press Space and choose Grand Hall." : "Go into CDS-1, take a lift and choose Grand Hall.");
      else {
        const next = professor(p.cleared + 1);
        if (here.startsWith("b5-")) steps.push("Leave Building 5 by the glass door on 1/F, then walk south across the plaza to the CDS-1 entrance.");
        else if (here === "outside") steps.push("CDS-1 is the tower with the school name over its doors, south of Building 5. Walk to the entrance and go in.");
        else if (here === "hall") steps.push("Leave the Grand Hall by the door at the back and take the lift.");
        else if (here !== `cds1-${next.floor}`) steps.push(`Walk to the lifts, press Space and choose ${next.floor}/F.`);
        steps.push(next.floor === 1 ? `${next.name} stands in the entrance lobby by the timetable screen, before the security gates.` : `On ${next.floor}/F, ${next.name} is in one of the rooms away from the lifts. Look for the yellow ! over their head.`);
        if (p.cleared > 0) steps.push(`Optional: the lab doors on the floors you finished have a game and a question, and the campus gate has the Shanghai board.`);
      }
      await showDialog({ kicker: "Your AI guide", title: "Where next?", portrait: me, body: [h("ul", { class: "reward-list" }, ...steps.map((x) => h("li", {}, x)))], buttons: [{ label: "Got it", value: true, primary: true }] });
      continue;
    }
    // hints go from a nudge to a worked step
    const next = progress.cleared < 14 ? professor(progress.cleared + 1) : null;
    const sig = next?.signature;
    const hints = [
      "A nudge: watch what the mentor's shield did to your last ATTACK, then build the next move around it. A shield that only stops big hits lets a small one through, and the other way round.",
      "× and ÷ run before + and -. Put your two biggest numbers on either side of ×.",
      "A worked step: with 8, 2, 3 and the blocks + and ×, ATTACK 8 + 2 × 3 is 8 + 6 = 14, but ATTACK 2 + 8 × 3 is 2 + 24 = 26. Same blocks, a different order.",
      sig ? `Your next mentor, ${next!.name}, always opens with the ${sig.title} shield. ${CARDS[sig.shield.kind].does} ${CARDS[sig.shield.kind].example}` : "Shield numbers are dealt once per challenge. Keep one shield block for the round after a small ATTACK from the mentor: the big one usually follows.",
      "HEAL is never blocked by a shield. When your HP is low, a HEAL with × in it can turn the round.",
    ];
    const text = hints[hintStep % hints.length];
    hintStep++;
    await showDialog({ kicker: `Your AI guide · hint ${((hintStep - 1) % hints.length) + 1} of ${hints.length}`, title: "A hint", portrait: me, body: [text], buttons: [{ label: "Thanks", value: true, primary: true }] });
  }
  busy = false;
  world.paused = false;
  if (reopen) await openBag(reopen);
}

async function openMenu(): Promise<void> {
  if (busy || dialogOpen()) return;
  busy = true;
  world.paused = true;
  const pick = await showDialog<string>({
    title: "Menu",
    wide: true,
    body: ["Walk with the arrow keys or WASD (or the pad on screen). Space talks, opens doors and calls the lift.", h("p", { class: "dim" }, llmEnabled() ? "AI opponent: the lab model through .env, with the rule-based fallback." : "AI opponent: rule-based (no .env found).")],
    buttons: [
      { label: "Back to the game", value: "back", primary: true },
      { label: "Campus map", value: "map" },
      { label: "Fast travel", value: "travel" },
      { label: "Opening film", value: "film" },
      { label: musicOn() ? "Music: on" : "Music: off", value: "music" },
      { label: "Demo mode", value: "demo" },
      { label: "Level select", value: "levels" },
      { label: "Building 5", value: "b5" },
      { label: "Title screen", value: "title" },
    ],
  });
  busy = false;
  world.paused = false;
  if (pick === "music") setMusic(!musicOn());
  else if (pick === "map") {
    busy = true;
    world.paused = true;
    await openCampusMap({ map: world.map.id, tx: Math.floor(world.px / TILE), ty: Math.floor(world.py / TILE) });
    busy = false;
    world.paused = false;
  } else if (pick === "travel") await fastTravel();
  else if (pick === "film") {
    busy = true;
    world.paused = true;
    await opening({ map: progress.map, spawn: progress.spawn });
    busy = false;
    world.paused = false;
    refreshPrompt();
  } else if (pick === "demo") await demo();
  else if (pick === "levels") await levelSelect();
  else if (pick === "b5") {
    // shortcut for the presentation: hands over the key and walks you to the Building 5 door
    progress.b5key = true;
    save();
    busy = true;
    world.paused = true;
    await travel("b5-1", "door");
    busy = false;
    world.paused = false;
    refreshPrompt();
  } else if (pick === "title") showTitle();
}

/** return shortcuts between the places that were already reached on foot */
async function fastTravel(): Promise<void> {
  busy = true;
  world.paused = true;
  const open = STOPS.filter((x) => exploring || progress.visited.includes(x.id)).filter((x) => x.id !== "hall" || progress.hallpass);
  const pick = await showDialog<string>({
    kicker: "Fast travel",
    title: "Where to?",
    wide: true,
    body: [open.length ? "A place appears here once you have walked there yourself." : "No stops yet. Walk to a place once and it appears here.", ...(STOPS.length > open.length ? [h("p", { class: "dim" }, `Not reached yet: ${STOPS.filter((x) => !open.includes(x)).map((x) => x.label).join(", ")}.`)] : [])],
    buttons: [...open.map((x) => ({ label: x.label, value: x.id })), { label: "Stay here", value: "", primary: true }],
  });
  const stop = STOPS.find((x) => x.id === pick);
  if (stop) await travel(stop.map, stop.spawn);
  busy = false;
  world.paused = false;
  refreshPrompt();
}

async function levelSelect(): Promise<void> {
  busy = true;
  world.paused = true;
  const buttons = [...PROFESSORS.map((p) => ({ label: `${p.floor}/F`, value: p.floor })), { label: "Grand Hall", value: 15 }, { label: "Building 5", value: 16 }, { label: "Cancel", value: 0, primary: true }];
  const f = await showDialog<number>({ kicker: "For the presentation", title: "Level select", wide: true, body: ["Jump to any floor with the blocks you would have by then. This replaces your current progress."], buttons });
  busy = false;
  world.paused = false;
  if (!f) return;
  sandbox = false;
  exploring = false;
  // Building 5: the kit of a student who just got the key on 3/F
  progress = progressAtFloor(f === 16 ? 3 : Math.min(14, f - 1));
  if (f === 15) progress.hallpass = true;
  progress.seen.push("tutorial");
  save();
  title?.remove();
  title = null;
  showHud(true);
  if (f === 16) await travel("b5-1", "door");
  else await travel(f === 15 ? "hall" : `cds1-${f}`, f === 15 ? "entry" : "lift");
}

// ------------------------------------------------------------------ demo mode
async function demo(): Promise<void> {
  if (busy) return;
  const keep = progress;
  const keepSandbox = sandbox;
  sandbox = true;
  busy = true;
  world.paused = true;
  title?.remove();
  title = null;
  pace.auto = true;
  pace.speed = Number(params.get("speed") ?? 1) || 1;
  progress = progressAtFloor(14);
  progress.hallpass = true;
  showHud(true);
  await travel("hall", "entry");
  const leo = world.map.npcs.find((n) => n.action?.type === "boss");
  let target: Target | null = null;
  if (leo) {
    // walk-on: stand in front of Leo
    world.px = (leo.tx - 3) * TILE + TILE / 2;
    world.py = leo.ty * TILE + TILE - 10;
    world.dir = "right";
    world.snapCamera();
    target = { id: leo.id, en: "", action: { type: "boss" }, npc: leo };
  }
  const cfg: BattleConfig = { ...baseConfig(progress), playerMax: playerMaxHp(progress) + BOSS_BONUS_HP, floor: 15, boss: true, place: "Demo mode · Grand Hall", enemy: LEO, enemyHp: BOSS_HP, skill: 0.85, pool: enemyPool(15, true), foeShields: enemyShieldCount(15, true), level: 1, slots: 6, tutorial: false, onLed: setLedText, auto: true };
  const result = await battle(cfg, target);
  setLedText([]);
  pace.auto = false;
  pace.speed = 1;
  if (result !== "quit") await showDialog({ kicker: "Demo mode", title: result === "win" ? "The student beat Leo" : "Leo won this one", portrait: getCharacter("leo").portrait, body: ["That was a full match played by the game itself: moves built from number and operator blocks, shields built from repeat, if and while blocks with a limited set of numbers."], buttons: [{ label: "Back to the title", value: true, primary: true }] });
  progress = keep;
  sandbox = keepSandbox;
  busy = false;
  world.paused = false;
  showTitle();
}

// ------------------------------------------------------------------ opening: the invitation and the welcome dinner
// docs/visitor-journey-story.md (Aretha, 2026-11-21): an invited visitor, a High Table welcome dinner
// in the University Galleria, a helpful AI guide, professors as mentors, Leo as the friendly final test.
async function opening(back: { map: string; spawn: string } = { map: "b5-1", spawn: "door" }): Promise<void> {
  // plays by itself like a short film: no clicks, only Skip
  const scenes: { map: string; spawn: string; title: string; text: string }[] = [
    { map: "outside", spawn: "start", title: "You are invited to CDS Shanghai", text: "HKU Zhangjiang Base, No. 500 Fangchun Road. Join our welcome dinner, meet the people who teach here, and discover what you can build." },
    { map: "b5-1", spawn: "door", title: "The High Table welcome dinner", text: "University Galleria, Building 5. Long walnut tables, students, professors, and an AI guide on your phone: it gives directions and hints, you make the choices." },
    { map: "cds1-1", spawn: "door", title: "14 floors, 14 mentors", text: "In the CDS-1 tower every mentor has a short block challenge for you. Each one gives a stamp, a postcard and a new coding block. No coding experience needed." },
    { map: "hall", spawn: "entry", title: "Leo's final challenge", text: "Collect all 14 stamps and Leo, the HKU lion, meets you on the Grand Hall stage. Pass, and you graduate as a CDS Explorer." },
    { map: "b5-1", spawn: "door", title: "Your visit starts at the dinner", text: "Walk with the arrow keys or WASD. Space talks, opens doors and calls the lift. When you are ready, leave by the door and walk south to CDS-1." },
  ];
  let skip = false;
  const head = h("div", { class: "intro-title" });
  const text = h("div", { class: "intro-text" });
  const count = h("span", { class: "intro-count" });
  const box = h("div", { class: "intro" }, h("div", { class: "intro-bar top" }, h("span", {}, "HKU CDS Shanghai "), count, h("button", { class: "btn small", type: "button", id: "intro-skip", onclick: () => (skip = true) }, "Skip")), h("div", { class: "intro-bar bottom" }, head, text));
  showHud(false);
  ui().append(box);
  for (let i = 0; i < scenes.length && !skip; i++) {
    const sc = scenes[i];
    fade.classList.add("on");
    await sleep(220);
    world.enter(sc.map, sc.spawn);
    head.textContent = sc.title;
    text.textContent = sc.text;
    count.textContent = `${i + 1} / ${scenes.length}`;
    fade.classList.remove("on");
    for (let t = 0; t < 4200 && !skip; t += 100) await sleep(100);
  }
  fade.classList.add("on");
  await sleep(200);
  box.remove();
  world.enter(back.map, back.spawn);
  showHud(true);
  refreshHud();
  fade.classList.remove("on");
}

// ------------------------------------------------------------------ title
let title: HTMLElement | null = null;

function showTitle(): void {
  title?.remove();
  showHud(false);
  busy = true;
  world.paused = true;
  world.enter("outside", "start");
  const saved = loadProgress();
  const start = async (fresh: boolean) => {
    title?.remove();
    title = null;
    sandbox = false;
    exploring = false;
    if (fresh) {
      clearProgress();
      progress = freshProgress();
    } else progress = saved ?? freshProgress();
    if (fresh) {
      progress.map = "b5-1";
      progress.spawn = "door";
    }
    showHud(true);
    world.enter(progress.map, progress.spawn);
    refreshHud();
    if (fresh) {
      await opening();
      progress.visited.push("b5");
      save();
      // the welcome at the door: the host hands over the stamp card, then the guide says hello
      busy = true;
      world.paused = true;
      await talkTo("b5-host", "visitor3", "Mei");
      await showDialog({ kicker: "Your AI guide", title: "Hello, I am your guide", portrait: guidePortrait(), body: ['"I give directions, explanations and hints. You make the choices. Press Guide at the top of the screen when you want me."', h("p", { class: "dim" }, "Talk to the people at the dinner with Space, or walk out of the glass door to start your first challenge.")], buttons: [{ label: "Let's go", value: true, primary: true }] });
      busy = false;
      world.paused = false;
      refreshPrompt();
    }
    busy = false;
    world.paused = false;
    refreshPrompt();
  };
  // walk the whole campus with every door open and no battles; nothing is saved
  const explore = async () => {
    title?.remove();
    title = null;
    sandbox = true;
    exploring = true;
    progress = progressAtFloor(14);
    progress.hallpass = true;
    progress.b5key = true;
    progress.seen.push("tutorial");
    showHud(true);
    await travel("outside", "start");
    busy = false;
    world.paused = false;
    refreshPrompt();
  };
  const mapBtn = campusMapPreview();
  mapBtn.classList.add("title-map");
  mapBtn.addEventListener("click", () => void openCampusMap());
  title = h(
    "div",
    { class: "title" },
    mapBtn,
    h(
      "div",
      { class: "logo" },
      h("h1", {}, "Code ", h("span", {}, "Climb")),
      h("div", { class: "zh" }, "HKU CDS Shanghai campus"),
      h("div", { class: "logo-blocks" }, h("div", { class: "script-body" }, hatBlock("when it is my turn"), moveBlock({ verb: "ATTACK", digits: [8, 2, 3], ops: ["+", "×"] }, 14)), h("div", { class: "script-body" }, hatBlock("when I am attacked"), shieldBlock({ kind: "for1", a: 3, b: 2 }))),
      h("div", { class: "sub" }, "You are invited to HKU CDS Shanghai: a welcome dinner, 14 mentors and Leo's final challenge.", h("br", {}), "Explore the real campus, learn to code with blocks, collect stamps and postcards."),
    ),
    h(
      "div",
      { class: "menu" },
      saved ? h("button", { class: "btn primary", type: "button", id: "btn-continue", onclick: () => void start(false) }, `Continue (${saved.cleared}/14)`) : null,
      h("button", { class: `btn ${saved ? "" : "primary"}`, type: "button", id: "btn-start", onclick: () => void start(true) }, "New game"),
      h("button", { class: "btn", type: "button", id: "btn-explore", onclick: () => void explore() }, "Sandbox mode"),
      h("button", { class: "btn", type: "button", id: "btn-demo", onclick: () => ((busy = false), void demo()) }, "Demo mode"),
      h("button", { class: "btn", type: "button", id: "btn-levels", onclick: () => void levelSelect().then(() => { if (!title) { busy = false; world.paused = false; refreshPrompt(); } else { busy = true; world.paused = true; } }) }, "Level select"),
    ),
    h("div", { class: "foot" }, "CDS-SH hackathon 2026 · Your campus, your game · a coding education game for first-time visitors"),
  );
  ui().append(title);
}

// ------------------------------------------------------------------ input
const keys = new Set<string>();
const KEYMAP: Record<string, [number, number]> = { ArrowUp: [0, -1], w: [0, -1], W: [0, -1], ArrowDown: [0, 1], s: [0, 1], S: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0], ArrowRight: [1, 0], d: [1, 0], D: [1, 0] };
window.addEventListener("keydown", (e) => {
  if (e.key in KEYMAP) {
    keys.add(e.key);
    e.preventDefault();
  } else if ((e.key === " " || e.key === "Enter" || e.key === "e" || e.key === "E") && !e.repeat) {
    if (!busy && !dialogOpen() && !inBattle) {
      e.preventDefault();
      void interact();
    }
  }
});
window.addEventListener("keyup", (e) => keys.delete(e.key));
window.addEventListener("blur", () => keys.clear());

function readMove(): void {
  let x = pad.x;
  let y = pad.y;
  for (const k of keys) {
    const m = KEYMAP[k];
    if (m) {
      x += m[0];
      y += m[1];
    }
  }
  world.move.x = Math.sign(x);
  world.move.y = Math.sign(y);
}

// ------------------------------------------------------------------ sheet viewer (art check): ?sheet=all or ?sheet=prof3
function sheetViewer(which: string): void {
  const ids = which === "all" ? ["student", ...PROFESSORS.map((p) => p.char), "leo", "guard", "visitor1", "visitor2", "visitor3", "visitor4"] : which.split(",");
  const root = h("div", { class: "sheet" });
  for (const id of ids) {
    const s = getCharacter(id);
    const c = h("canvas", { width: s.w * 4 * 2, height: s.h * 4 * 2 });
    const g = c.getContext("2d")!;
    g.imageSmoothingEnabled = false;
    (["down", "left", "right", "up"] as Dir[]).forEach((d, row) => s.frames[d].forEach((f, col) => g.drawImage(f, col * s.w * 2, row * s.h * 2, s.w * 2, s.h * 2)));
    const p = h("canvas", { width: s.portrait.width, height: s.portrait.height });
    p.getContext("2d")!.drawImage(s.portrait, 0, 0);
    root.append(h("figure", {}, h("figcaption", {}, id), c, p));
  }
  ui().append(root);
}

// ------------------------------------------------------------------ boot
async function boot(): Promise<void> {
  try {
    await Promise.all([document.fonts.load("700 20px SungSans"), document.fonts.load("400 20px SungSans"), document.fonts.load("700 20px CJKSC", "港大")]);
  } catch {
    /* fonts are a nicety */
  }
  await loadLogo();
  const sheet = params.get("sheet");
  if (sheet) {
    showHud(false);
    sheetViewer(sheet);
    return;
  }

  let last = performance.now();
  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    readMove();
    world.update(dt);
    world.render(now);
    if (!hudLoc.classList.contains("off")) miniMap().update(here());
    requestAnimationFrame(frame);
  };

  const map = params.get("map");
  const battleParam = params.get("battle");
  if (params.get("auto")) pace.auto = true;
  if (params.get("speed")) pace.speed = Number(params.get("speed")) || 1;
  if (map || battleParam) {
    // debug links: ?map=cds1-6&spawn=lift&tp=10,8   ?battle=5   ?battle=boss&auto=1
    sandbox = true;
    const floor = battleParam === "boss" ? 15 : Number(battleParam ?? params.get("floor") ?? 15);
    progress = progressAtFloor(Math.max(0, Math.min(14, floor - 1)));
    // ?pending=1: the last floor is certified but its lab is still held by the bot
    if (params.get("pending")) progress.labs = Math.max(0, progress.cleared - 1);
    if (!battleParam) {
      progress.b5key = true;
      progress.hallpass = true;
    }
    const tp = params.get("tp")?.split(",").map(Number);
    const id = map ?? (floor === 15 ? "hall" : `cds1-${floor}`);
    world.enter(id, params.get("spawn") ?? "", tp && tp.length === 2 ? { tx: tp[0], ty: tp[1] } : undefined);
    if (params.get("led")) setLedText(params.get("led")!.split("|"));
    if (params.get("nohud")) showHud(false);
    refreshHud();
    requestAnimationFrame(frame);
    // ?cert=1: look at the certificate
    if (params.get("cert")) setTimeout(() => void showDialog({ kicker: "Final challenge completed", title: "Leo: Congratulations, CDS Explorer!", wide: true, body: [certificateEl()] }), 600);
    // ?postcard=6: look at one postcard
    const pc = Number(params.get("postcard"));
    if (pc) setTimeout(() => void showDialog({ kicker: `Postcard ${pc} of 14`, title: "A postcard for your bag", body: [postcardEl(pc, snapshot())] }), 600);
    if (battleParam) {
      const npc = world.map.npcs.find((n) => n.action?.type === "battle" || n.action?.type === "boss");
      if (npc) {
        const boss = npc.action?.type === "boss";
        world.px = (npc.tx - (boss ? 3 : 0)) * TILE + TILE / 2;
        world.py = (npc.ty + (boss ? 0 : 2)) * TILE + TILE - 10;
        world.snapCamera();
        await runAction({ id: npc.id, en: "", action: npc.action!, npc });
      }
    }
    return;
  }
  showTitle();
  requestAnimationFrame(frame);
  if (params.get("demo")) {
    busy = false;
    void demo();
  }
}

void boot();
