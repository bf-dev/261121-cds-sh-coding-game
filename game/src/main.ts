import "./style.css";
import { TILE, VIEW_H, VIEW_W, type Action, type Dir, type PowerUpKind } from "./engine/types";
import { World, type Target } from "./engine/world";
import { getCharacter } from "./art/characters";
import { floorInfo } from "./maps/cds1";
import { setLedText } from "./maps/grandhall";
import { B5_FLOORS } from "./maps/b5";
import { LEO, professor, PROFESSORS } from "./data/professors";
import { LABS, POSTCARDS } from "./data/labs";
import { CARDS, enemyPool, enemyShieldCount, FN_ORDER, OP_ORDER, POWER_ORDER, REWARDS, STUDY_FNS, STUDY_VISITS } from "./data/cards";
import { applyReward, BOSS_BONUS_HP, BOSS_HP, clearProgress, enemyHp, freshProgress, loadProgress, playerMaxHp, progressAtFloor, saveProgress, shieldBlocksFor, shieldDigitsFor, type Progress } from "./state";
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
const locZh = h("div", { class: "zh" });
const hudLoc = h("div", { class: "hud hud-loc panel" }, h("div", { class: "en" }, h("span", { class: "crest" }), locEn), locZh);
const hudQuest = h("div", { class: "hud hud-quest panel" });
const promptBtn = h("button", { class: "prompt panel off", type: "button", id: "prompt" });
const fade = h("div", { class: "fade" });
const hudBtns = h(
  "div",
  { class: "hud hud-btns" },
  h("button", { class: "btn", type: "button", id: "btn-bag", onclick: () => void openBag() }, "Bag 背包"),
  h("button", { class: "btn", type: "button", id: "btn-menu", onclick: () => void openMenu() }, "Menu 菜单"),
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
ui().append(hudLoc, hudQuest, hudBtns, dpad, promptBtn, fade);
promptBtn.onclick = () => void interact();

function showHud(on: boolean): void {
  for (const el of [hudLoc, hudQuest, hudBtns, dpad]) el.classList.toggle("off", !on);
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
  promptBtn.replaceChildren(h("kbd", {}, "Space"), t.en, h("small", {}, t.zh));
}

function questText(): (string | Node)[] {
  const p = progress;
  if (exploring) return [h("b", {}, "Explore mode"), ": walk anywhere, no battles. The lift, Building 5 and the Grand Hall are open. Menu, then Title screen, to leave."];
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
  locZh.textContent = world.map.nameZh;
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

async function travel(map: string, spawn: string, quiet = false): Promise<void> {
  fade.classList.add("on");
  if (!quiet) sfx("door");
  await sleep(240);
  world.enter(map, spawn);
  progress.map = map;
  progress.spawn = spawn;
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
        await showDialog({ kicker: "Locked · 未解锁", title: "Upstairs opens later", titleZh: "楼上暂未开放", body: ["The University Galleria on this floor is open to every guest. The gym and the study floors above open with the key card you earn on CDS-1 3/F."] });
        return;
      }
      if (a.requires === "b5key" && !progress.b5key && a.map !== "b5-1") {
        await showDialog({ kicker: "Locked · 未解锁", title: "Building 5 is locked", titleZh: "五号楼", body: [`The student spaces are inside: the gym and the study stair. The key card is in the lab on CDS-1 3/F. Get certified on the first three floors and clear that lab.`] });
        return;
      }
      if (a.requires === "hallpass" && !progress.hallpass) {
        await showDialog({ kicker: "Locked · 未解锁", title: "The Grand Hall is closed", titleZh: "大礼堂", body: ["The Grand Hall opens for Leo's final challenge once you hold all 14 stamps from CDS-1."] });
        return;
      }
      await travel(a.map, a.spawn);
      return;
    case "lift":
      if (a.building === "b5" && !progress.b5key) await showDialog({ kicker: "Locked · 未解锁", title: "Upstairs opens later", titleZh: "楼上暂未开放", body: ["The lift goes to the gym and the study floors. They open with the key card you earn on CDS-1 3/F."] });
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
    case "info": {
      const isNew = !progress.found.includes(t.id);
      if (isNew) {
        progress.found.push(t.id);
        save();
      }
      await showDialog({ kicker: `Campus detail · 校园细节${isNew ? ` · ${progress.found.length} found` : ""}`, title: a.title, titleZh: a.titleZh, body: [a.text, ...(isNew && progress.found.length <= 20 ? [h("p", { class: "dim" }, `You know the campus a little better: +1 maximum HP in every battle (${progress.found.length} of 20).`)] : [])] });
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
    const hall = progress.hallpass ? h("button", { class: "btn primary", type: "button", id: "lift-hall", onclick: () => void toHall(close, resolve) }, "Grand Hall 大礼堂") : null;
    const box = h(
      "div",
      { class: "dialog wide" },
      h("div", { class: "dialog-main" }, h("div", { class: "kicker" }, "School of Computing & Data Science · The University of Hong Kong"), h("h2", {}, "Lift", h("small", {}, "电梯 · 选择楼层")), grid, h("div", { class: "dialog-buttons" }, hall, h("button", { class: "btn", type: "button", onclick: () => (close(), resolve()) }, "Stay here"))),
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
      const b = h("button", { class: `lift-btn ${f.floor === here ? "here" : ""}`, type: "button", "data-floor": f.floor }, h("span", { class: "num" }, String(f.floor)), h("span", { class: "what" }, `${f.name} · ${f.nameZh}`, h("span", {}, what[f.floor] ?? "")));
      b.onclick = () => done(f.floor);
      grid.append(b);
    }
    veil.append(h("div", { class: "dialog wide" }, h("div", { class: "dialog-main" }, h("div", { class: "kicker" }, "Building 5 · HKU Zhangjiang Base"), h("h2", {}, "Lift", h("small", {}, "电梯 · 选择楼层")), grid, h("div", { class: "dialog-buttons" }, h("button", { class: "btn", type: "button", onclick: () => done(0) }, "Stay here")))));
    ui().append(veil);
    window.addEventListener("keydown", onKey, true);
  });
  if (!floor || floor === here) return;
  sfx("lift");
  await travel(`b5-${floor}`, "lift", true);
}

async function toHall(close: () => void, resolve: () => void): Promise<void> {
  close();
  await showDialog({ kicker: "After floor 14 · 十四层之后", title: "To the Grand Hall", titleZh: "前往大礼堂", body: ["With 14 stamps in your bag you ride the lift down and cross the plaza. The doors of the Grand Hall are open, and Leo is on the stage, waving."] });
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
    await showDialog({ kicker: `${floorInfo(floor).en} · ${prof.topic}`, title: prof.name, titleZh: prof.nameZh, portrait: sheet.portrait, body: [`"${prof.hello}"`, h("p", { class: "dim" }, "Explore mode has no battles. Start a New game from the title screen to take the test.")] });
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
      else await showDialog({ title: "You win again!", titleZh: "再次获胜", portrait: sheet.portrait, body: ["Good practice."] });
      return;
    }
    const retry = await showDialog<boolean>({ kicker: "Out of HP · 生命值归零", title: `${prof.name}: Good try!`, titleZh: "再试一次", portrait: sheet.portrait, body: ["Every professor here was a beginner once. Your blocks are new each battle, so try again.", h("p", { class: "dim" }, "Tip: look at what the shield did last time, and aim your next ATTACK around it.")], buttons: [{ label: "Try again", value: true, primary: true }, { label: "Later", value: false }] });
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
  await showDialog({ kicker: `CDS-1 ${floor}/F · challenge completed · 完成第 ${floor} 层挑战`, title: `Well done! ${prof.name} is impressed`, titleZh: "挑战完成", portrait: getCharacter(prof.char).portrait, body: [`"${prof.win}"`, h("ul", { class: "reward-list" }, ...items.map((i) => h("li", {}, i)))], buttons: [{ label: "Collect", value: true, primary: true }] });
  for (const id of [r.fn, r.op, r.brackets ? "brackets" : undefined, r.power]) {
    if (id && !progress.seen.includes(id)) {
      progress.seen.push(id);
      await cardPopup(id);
    }
  }
  await showDialog({ kicker: `Postcard ${floor} of 14 · 明信片`, title: "A postcard for your bag", titleZh: "收到明信片", body: [postcardEl(floor, snap), h("p", { class: "dim" }, "Optional: the lab on this floor has a question from the guide about what you just learned.")], buttons: [{ label: "Keep it", value: true, primary: true }] });
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
  const c = POSTCARDS[floor];
  return h(
    "div",
    { class: `postcard ${picture ? "" : "mini"}` },
    picture ? h("div", { class: "pc-pic" }, picture, h("span", { class: "pc-floor" }, `CDS-1 ${floor}/F`)) : null,
    h("div", { class: "pc-text" }, h("div", { class: "pc-stamp" }, crest(picture ? 54 : 34), h("span", {}, `${floor}/F`)), h("b", {}, c.title), h("small", {}, c.zh), h("p", {}, c.fact), picture ? h("div", { class: "pc-from" }, "Greetings from HKU CDS Shanghai · 来自港大 CDS 上海") : null),
  );
}

// ------------------------------------------------------------------ labs: an optional question from the guide
async function labDoor(floor: number): Promise<void> {
  const L = LABS[floor];
  if (!floor || !L) return;
  const kicker = `Lab · CDS-1 ${floor}/F · 实验室`;
  if (floor > progress.cleared && !exploring) {
    await showDialog({ kicker, title: "The guide has a question here", titleZh: "稍后再来", body: [`It is about the idea you learn on this floor. Meet ${professor(floor).name} first, then come back. It is optional.`] });
    return;
  }
  const id = `lab-${floor}`;
  let tries = 0;
  while (true) {
    const pick = await showDialog<number>({
      kicker,
      title: "The guide's question",
      titleZh: "向导的小问题",
      wide: true,
      body: [h("p", { class: "dim" }, tries ? `Hint: ${L.hint}` : "Your AI guide: \"I can explain, but you make the call. What do you think?\""), ...(L.picture ? [h("div", { class: "lab-pic" }, L.picture())] : []), h("p", { class: "lab-q" }, L.q)],
      buttons: [...L.options.map((label, value) => ({ label, value })), { label: "Later", value: -1 }],
    });
    if (pick === -1) return;
    if (pick === L.answer) break;
    tries++;
    await showDialog({ kicker, title: "Not quite", titleZh: "再想一想", body: [`"${L.options[pick]}" is not it. ${L.hint}`], buttons: [{ label: "Try again", value: true, primary: true }] });
  }
  const isNew = !progress.found.includes(id);
  if (isNew) progress.found.push(id);
  save();
  sfx("win");
  await showDialog({ kicker, title: "Correct!", titleZh: "答对了", body: [L.why, ...(isNew && progress.found.length <= 20 ? [h("p", { class: "dim" }, `+1 maximum HP in every challenge (${progress.found.length} of 20).`)] : [])], buttons: [{ label: "Nice", value: true, primary: true }] });
}

async function fightBoss(t: Target | null): Promise<void> {
  const sheet = getCharacter("leo");
  if (exploring) {
    await showDialog({ kicker: "Grand Hall · 大礼堂", title: "Leo the HKU lion", titleZh: "港大狮子 Leo", portrait: sheet.portrait, body: ['"ROAR! Welcome to the Grand Hall. The big wall behind me is where the final battle of the game is fought."', h("p", { class: "dim" }, "Explore mode has no battles. Start a New game from the title screen to play the story.")] });
    return;
  }
  while (true) {
    const cfg: BattleConfig = { ...baseConfig(progress), playerMax: playerMaxHp(progress) + BOSS_BONUS_HP, floor: 15, boss: true, place: "Grand Hall · 大礼堂", enemy: LEO, enemyHp: BOSS_HP, skill: 0.85, pool: enemyPool(15, true), foeShields: enemyShieldCount(15, true), level: 1, slots: 6, tutorial: false, onLed: setLedText };
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
    const retry = await showDialog<boolean>({ kicker: "Out of HP · 生命值归零", title: "Leo: Almost!", titleZh: "差一点", portrait: sheet.portrait, body: ["Leo pats you on the shoulder with a big paw. Lions do not give up, and neither do CDS students."], buttons: [{ label: "Try again", value: true, primary: true }, { label: "Later", value: false }] });
    if (!retry) return;
  }
}

async function ending(): Promise<void> {
  const sheet = getCharacter("leo");
  await showDialog({ kicker: "Final challenge completed · 完成最终挑战", title: "Leo: Congratulations, CDS Explorer!", titleZh: "CDS 探索者", portrait: sheet.portrait, wide: true, body: ["Leo hands you a certificate with the HKU crest: CDS Explorer. The Grand Hall wall lights up, and the friends you met at the welcome dinner are cheering in the seats.", "You climbed CDS-1, met 14 mentors and learned to read every block yourself. These are the postcards you collected on the way:", h("div", { class: "postcard-grid" }, ...Array.from({ length: Math.min(4, progress.cleared) }, (_, i) => postcardEl([1, 6, 10, 14][i] <= progress.cleared ? [1, 6, 10, 14][i] : i + 1)))], buttons: [{ label: "What did I learn?", value: true, primary: true }] });
  await showDialog({
    kicker: "You can read code now · 你已经会读代码了",
    title: "What you learned",
    titleZh: "学到了什么",
    wide: true,
    autoMs: 5000,
    body: [
      h("ul", { class: "reward-list" }, h("li", {}, "A variable holds a number that changes: damage."), h("li", {}, "Operators have an order: × and ÷ before + and -, brackets first."), h("li", {}, "A for loop repeats a block a set number of times: you chose how many."), h("li", {}, "An if runs a block only when a test is true. else is the other path."), h("li", {}, "A while loop repeats as long as a test stays true.")),
      h("div", { class: "pybox" }, h("span", { class: "pylabel" }, "Your last battle, as a Python program"), h("pre", {}, "damage = 8 + 2 * 3      # 14\nfor i in range(3):\n    damage -= 2         # 8\nif damage > 5:\n    damage -= 5         # 3")),
    ],
    buttons: [{ label: "Keep exploring the campus", value: true, primary: true }],
  });
}

// ------------------------------------------------------------------ Building 5 stations and the food lockers
async function station(kind: PowerUpKind): Promise<void> {
  const p = progress;
  if (kind === "study") {
    if (p.studied >= STUDY_VISITS) {
      await showDialog({ kicker: "Study stair · 阶梯自习区", title: "Nothing new to study", titleZh: "已经学完", body: ["You have learned everything the study stair can teach. The rest comes from the professors."] });
      return;
    }
    if (p.used.study === p.cleared) {
      await showDialog({ kicker: "Study stair · 阶梯自习区", title: "Your head is full", titleZh: "先去闯关", body: ["Beat another professor in CDS-1, then come back and study some more."] });
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
      await cardPopup(next, "You studied a new block · 学到新积木");
    } else {
      save();
      await showDialog({ kicker: "Study stair · 阶梯自习区", title: "You studied hard", titleZh: "多两个护盾数字", body: ["An hour on the timber steps with your notes. From now on you are dealt 2 more shield numbers at the start of every battle."] });
    }
    return;
  }
  const names: Record<string, [string, string, string]> = {
    gym: ["Gym · 健身房", "Gym session", "You run on the treadmill with the canal outside the window."],
    food: ["Meituan locker · 美团外卖柜", "Meituan meal", "Your order is in the yellow locker: a warm meal box, packed in your bag."],
    redbull: ["Drink fridge · 饮料柜", "Red Bull", "A cold can from the glass-front fridge."],
  };
  const [kicker, name, line] = names[kind];
  if (p.power[kind] >= 2) {
    await showDialog({ kicker, title: "Your bag is full", titleZh: "背包已满", body: [`You already carry 2 of ${name}. Use them in a battle first.`] });
    return;
  }
  if (p.used[kind] === p.cleared) {
    await showDialog({ kicker, title: "Come back later", titleZh: "稍后再来", body: [`You already took a ${name} since your last win. Beat another professor, then come back.`] });
    return;
  }
  p.used[kind] = p.cleared;
  p.power[kind]++;
  save();
  sfx("power");
  await showDialog({ kicker, title: `You got: ${name}`, titleZh: CARDS[kind].nameZh, body: [line, h("p", { class: "dim" }, `In your bag: ${p.power[kind]}. Power-ups are used at the start of your turn in a battle.`)] });
  if (!p.seen.includes(kind)) {
    p.seen.push(kind);
    save();
    await cardPopup(kind, "New power-up · 新道具");
  }
}

// ------------------------------------------------------------------ bag and menu
async function openBag(): Promise<void> {
  if (busy || dialogOpen()) return;
  busy = true;
  world.paused = true;
  const p = progress;
  const group = (title: string, ids: string[]) => (ids.length ? [h("div", { class: "bag-h" }, title), h("div", { class: "bag-grid" }, ...ids.map((id) => cardPicture(id)))] : []);
  await showDialog({
    kicker: `Max HP ${playerMaxHp(p)} · stamps ${p.cleared} / 14 · campus details found ${p.found.length}`,
    title: "Your blocks",
    titleZh: "背包 · 我的积木",
    wide: true,
    body: [
      ...group("Always in your hand · 基础", ["ATTACK", "HEAL", "number"]),
      ...group("Operators (random each turn) · 运算符", [...OP_ORDER.filter((o) => p.ops.includes(o)), ...(p.brackets ? ["brackets"] : [])]),
      ...group("Shield functions · 护盾函数", FN_ORDER.filter((f) => p.fns.includes(f))),
      ...group("Power-ups · 道具", POWER_ORDER.filter((k) => p.power[k] > 0)),
      ...(p.cleared ? [h("div", { class: "bag-h" }, `Postcards · 明信片 ${p.cleared}/14`), h("div", { class: "postcard-grid" }, ...Array.from({ length: p.cleared }, (_, i) => postcardEl(i + 1)))] : []),
    ],
    buttons: [{ label: "Close", value: true, primary: true }],
  });
  busy = false;
  world.paused = false;
}

async function openMenu(): Promise<void> {
  if (busy || dialogOpen()) return;
  busy = true;
  world.paused = true;
  const pick = await showDialog<string>({
    title: "Menu",
    titleZh: "菜单",
    body: ["Walk with the arrow keys or WASD (or the pad on screen). Space talks, opens doors and calls the lift.", h("p", { class: "dim" }, llmEnabled() ? "AI opponent: the lab model through .env, with the rule-based fallback." : "AI opponent: rule-based (no .env found).")],
    buttons: [
      { label: "Back to the game", value: "back", primary: true },
      { label: "Demo mode", value: "demo" },
      { label: "Level select", value: "levels" },
      { label: "Building 5", value: "b5" },
      { label: musicOn() ? "Music: on" : "Music: off", value: "music" },
      { label: "Title screen", value: "title" },
    ],
  });
  busy = false;
  world.paused = false;
  if (pick === "music") setMusic(!musicOn());
  else if (pick === "demo") await demo();
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

async function levelSelect(): Promise<void> {
  busy = true;
  world.paused = true;
  const buttons = [...PROFESSORS.map((p) => ({ label: `${p.floor}/F`, value: p.floor })), { label: "Grand Hall", value: 15 }, { label: "Building 5", value: 16 }, { label: "Cancel", value: 0, primary: true }];
  const f = await showDialog<number>({ kicker: "For the presentation · 演示用", title: "Level select", titleZh: "选关", wide: true, body: ["Jump to any floor with the blocks you would have by then. This replaces your current progress."], buttons });
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
    target = { id: leo.id, en: "", zh: "", action: { type: "boss" }, npc: leo };
  }
  const cfg: BattleConfig = { ...baseConfig(progress), playerMax: playerMaxHp(progress) + BOSS_BONUS_HP, floor: 15, boss: true, place: "Demo mode · Grand Hall · 大礼堂", enemy: LEO, enemyHp: BOSS_HP, skill: 0.85, pool: enemyPool(15, true), foeShields: enemyShieldCount(15, true), level: 1, slots: 6, tutorial: false, onLed: setLedText, auto: true };
  const result = await battle(cfg, target);
  setLedText([]);
  pace.auto = false;
  pace.speed = 1;
  if (result !== "quit") await showDialog({ kicker: "Demo mode · 演示模式", title: result === "win" ? "The student beat Leo" : "Leo won this one", titleZh: "演示结束", portrait: getCharacter("leo").portrait, body: ["That was a full match played by the game itself: moves built from number and operator blocks, shields built from repeat, if and while blocks with a limited set of numbers."], buttons: [{ label: "Back to the title", value: true, primary: true }] });
  progress = keep;
  sandbox = keepSandbox;
  busy = false;
  world.paused = false;
  showTitle();
}

// ------------------------------------------------------------------ opening: the invitation and the welcome dinner
// docs/visitor-journey-story.md (Aretha, 2026-11-21): an invited visitor, a High Table welcome dinner
// in the University Galleria, a helpful AI guide, professors as mentors, Leo as the friendly final test.
async function opening(): Promise<void> {
  // plays by itself like a short film: no clicks, only Skip
  const scenes: { map: string; spawn: string; title: string; zh: string; text: string }[] = [
    { map: "outside", spawn: "start", title: "You are invited to CDS Shanghai", zh: "诚邀您来到港大 CDS 上海", text: "HKU Zhangjiang Base, No. 500 Fangchun Road. Join our welcome dinner, meet the people who teach here, and discover what you can build." },
    { map: "b5-1", spawn: "door", title: "The High Table welcome dinner", zh: "高桌晚宴", text: "University Galleria, Building 5. Long walnut tables, students, professors, and an AI guide on your phone: it gives directions and hints, you make the choices." },
    { map: "cds1-1", spawn: "door", title: "14 floors, 14 mentors", zh: "十四层楼，十四位导师", text: "In the CDS-1 tower every mentor has a short block challenge for you. Each one gives a stamp, a postcard and a new coding block. No coding experience needed." },
    { map: "hall", spawn: "entry", title: "Leo's final challenge", zh: "Leo 的最终挑战", text: "Collect all 14 stamps and Leo, the HKU lion, meets you on the Grand Hall stage. Pass, and you graduate as a CDS Explorer." },
    { map: "b5-1", spawn: "door", title: "Your visit starts at the dinner", zh: "从晚宴出发", text: "Walk with the arrow keys or WASD. Space talks, opens doors and calls the lift. When you are ready, leave by the door and walk south to CDS-1." },
  ];
  let skip = false;
  const head = h("div", { class: "intro-title" });
  const text = h("div", { class: "intro-text" });
  const count = h("span", { class: "intro-count" });
  const box = h("div", { class: "intro" }, h("div", { class: "intro-bar top" }, h("span", {}, "HKU CDS Shanghai · 港大 CDS 上海 "), count, h("button", { class: "btn small", type: "button", id: "intro-skip", onclick: () => (skip = true) }, "Skip")), h("div", { class: "intro-bar bottom" }, head, text));
  showHud(false);
  ui().append(box);
  for (let i = 0; i < scenes.length && !skip; i++) {
    const sc = scenes[i];
    fade.classList.add("on");
    await sleep(220);
    world.enter(sc.map, sc.spawn);
    head.replaceChildren(sc.title, h("small", {}, sc.zh));
    text.textContent = sc.text;
    count.textContent = `${i + 1} / ${scenes.length}`;
    fade.classList.remove("on");
    for (let t = 0; t < 4200 && !skip; t += 100) await sleep(100);
  }
  fade.classList.add("on");
  await sleep(200);
  box.remove();
  world.enter("b5-1", "door");
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
    if (fresh) await opening();
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
  title = h(
    "div",
    { class: "title" },
    h(
      "div",
      { class: "logo" },
      h("h1", {}, "Code ", h("span", {}, "Climb")),
      h("div", { class: "zh" }, "编程闯关 · 港大 CDS 上海校园"),
      h("div", { class: "logo-blocks" }, h("div", { class: "script-body" }, hatBlock("when it is my turn"), moveBlock({ verb: "ATTACK", digits: [8, 2, 3], ops: ["+", "×"] }, 14)), h("div", { class: "script-body" }, hatBlock("when I am attacked"), shieldBlock({ kind: "for1", a: 3, b: 2 }))),
      h("div", { class: "sub" }, "You are invited to HKU CDS Shanghai: a welcome dinner, 14 mentors and Leo's final challenge.", h("br", {}), "Explore the real campus, learn to code with blocks, collect stamps and postcards."),
    ),
    h(
      "div",
      { class: "menu" },
      saved ? h("button", { class: "btn primary", type: "button", id: "btn-continue", onclick: () => void start(false) }, `Continue · 继续 (${saved.cleared}/14)`) : null,
      h("button", { class: `btn ${saved ? "" : "primary"}`, type: "button", id: "btn-start", onclick: () => void start(true) }, "New game · 开始"),
      h("button", { class: "btn", type: "button", id: "btn-explore", onclick: () => void explore() }, "Explore · 自由探索"),
      h("button", { class: "btn", type: "button", id: "btn-demo", onclick: () => ((busy = false), void demo()) }, "Demo mode · 演示"),
      h("button", { class: "btn", type: "button", id: "btn-levels", onclick: () => void levelSelect().then(() => { if (!title) { busy = false; world.paused = false; refreshPrompt(); } else { busy = true; world.paused = true; } }) }, "Level select · 选关"),
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
    // ?postcard=6: look at one postcard
    const pc = Number(params.get("postcard"));
    if (pc) setTimeout(() => void showDialog({ kicker: `Postcard ${pc} of 14 · 明信片`, title: "A postcard for your bag", titleZh: "收到明信片", body: [postcardEl(pc, snapshot())] }), 600);
    if (battleParam) {
      const npc = world.map.npcs.find((n) => n.action?.type === "battle" || n.action?.type === "boss");
      if (npc) {
        const boss = npc.action?.type === "boss";
        world.px = (npc.tx - (boss ? 3 : 0)) * TILE + TILE / 2;
        world.py = (npc.ty + (boss ? 0 : 2)) * TILE + TILE - 10;
        world.snapCamera();
        await runAction({ id: npc.id, en: "", zh: "", action: npc.action!, npc });
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
