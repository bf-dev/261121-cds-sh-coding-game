import "./style.css";
import { TILE, VIEW_H, VIEW_W, type Action, type Dir, type PowerUpKind } from "./engine/types";
import { World, type Target } from "./engine/world";
import { getCharacter } from "./art/characters";
import { floorInfo } from "./maps/cds1";
import { setLedText } from "./maps/grandhall";
import { B5_FLOORS } from "./maps/b5";
import { LEO, professor, PROFESSORS } from "./data/professors";
import { CARDS, enemyPool, enemyShieldCount, FN_ORDER, OP_ORDER, POWER_ORDER, REWARDS, STUDY_FNS, STUDY_VISITS } from "./data/cards";
import { applyReward, BOSS_BONUS_HP, BOSS_HP, clearProgress, enemyHp, freshProgress, loadProgress, playerMaxHp, progressAtFloor, saveProgress, shieldBlocksFor, shieldDigitsFor, type Progress } from "./state";
import { runBattle, type BattleConfig } from "./battle/ui";
import { slotsForFloor } from "./battle/rules";
import { cardPicture, hatBlock, moveBlock, shieldBlock } from "./battle/blocks";
import { cardPopup, dialogOpen, showDialog, toast } from "./ui/dialogs";
import { h, pace, sleep, ui } from "./ui/dom";
import { sfx } from "./ui/sfx";
import { llmEnabled } from "./battle/llm";
import { loadLogo } from "./art/logo";

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
  const blocks = h("span", { class: "quest-blocks" }, "Program blocks ", h("b", {}, `${p.cleared}/14`), " · ");
  if (p.bossBeaten) return ["The Grand Hall wall is lit. Explore the campus, there are details left to find."];
  if (p.cleared >= 14) {
    if (world.map?.id === "hall") return [blocks, "Climb the steps and talk to ", h("b", {}, "Leo"), " on the stage."];
    return [blocks, "Next: ", h("b", {}, "the Grand Hall"), ". Take the CDS1 lift and choose Grand Hall. Leo is waiting."];
  }
  const next = professor(p.cleared + 1);
  if (p.cleared === 0 && world.map?.id === "outside") return [blocks, "Walk up to the ", h("b", {}, "CDS1 entrance"), " and go in. ", `${next.name} is in the lobby.`];
  const where = world.map?.id === `cds1-${next.floor}` ? "on this floor" : `on CDS1 ${next.floor}/F (take the lift)`;
  const extra = p.b5key && p.cleared === 3 ? " Building 5 is open now: gym on 2/F, study stair on 3/F." : "";
  return [blocks, "Next: ", h("b", {}, next.name), ` ${where}.${extra}`];
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
      if (a.requires === "b5key" && !progress.b5key) {
        await showDialog({ kicker: "Locked · 未解锁", title: "Building 5 is locked", titleZh: "五号楼", body: [`The student spaces are inside: the gym and the study stair. ${professor(3).name} on CDS1 3/F holds the key. Win the first three floors to get it.`] });
        return;
      }
      if (a.requires === "hallpass" && !progress.hallpass) {
        await showDialog({ kicker: "Locked · 未解锁", title: "The Grand Hall is closed", titleZh: "大礼堂", body: ["The hall is dark and the LED wall is off. Leo only opens the doors for a student who carries all 14 blocks of the welcome program."] });
        return;
      }
      await travel(a.map, a.spawn);
      return;
    case "lift":
      if (a.building === "b5") await b5LiftPicker();
      else await liftPicker();
      return;
    case "battle":
      await fight(a.floor, t);
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
      await showDialog({ kicker: `Campus detail · 校园细节${isNew ? ` · ${progress.found.length} found` : ""}`, title: a.title, titleZh: a.titleZh, body: [a.text] });
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
        h("span", { class: "what" }, info.en.replace(/^CDS1 \d+\/F\s*·?\s*/, "") || `Floor ${f}`, h("span", {}, open ? `${prof.name} · ${prof.topic}` : `Beat ${professor(f - 1).name} on ${f - 1}/F first`)),
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
  await showDialog({ kicker: "After floor 14 · 十四层之后", title: "To the Grand Hall", titleZh: "前往大礼堂", body: ["With all 14 blocks in your bag you ride the lift down and cross the plaza. Leo's seat on the lawn is still empty. The doors of the Grand Hall are open, and the big wall inside is dark, waiting."] });
  await travel("hall", "entry");
  resolve();
}

// ------------------------------------------------------------------ battles
function focusOn(t: Target, screenY: number): void {
  const n = t.npc;
  if (!n) return;
  const nx = n.tx * TILE + TILE / 2;
  const ny = n.ty * TILE + TILE - 10;
  world.focus = { x: (nx + world.px) / 2, y: Math.max(ny, world.py), screenY };
  const dx = nx - world.px;
  const dy = ny - world.py;
  world.dir = (Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up") as Dir;
}

async function battle(cfg: BattleConfig, t: Target | null, screenY = 300): Promise<"win" | "lose" | "quit"> {
  if (t) focusOn(t, screenY);
  // against Leo the camera sits at the top of the hall, so the whole LED wall is in view
  if (cfg.boss && world.focus) world.focus = { x: world.focus.x, y: 0, screenY: 0 };
  inBattle = true;
  showHud(false);
  const speed = pace.speed;
  const result = await runBattle(cfg);
  if (!pace.auto) pace.speed = speed;
  inBattle = false;
  world.focus = null;
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
  if (floor > progress.cleared + 1) {
    await showDialog({ title: prof.name, titleZh: prof.nameZh, portrait: sheet.portrait, body: [`You are not ready for ${floor}/F yet. Beat ${professor(progress.cleared + 1).name} on ${progress.cleared + 1}/F first.`] });
    return;
  }
  if (floor <= progress.cleared) {
    const again = await showDialog<boolean>({ title: prof.name, titleZh: prof.nameZh, portrait: sheet.portrait, body: ["You already have my block of the program. Well done! Want a practice rematch?"], buttons: [{ label: "Go on", value: false, primary: true }, { label: "Rematch", value: true }] });
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
      skill: ((floor - 1) / 13) * 0.85,
      pool: enemyPool(floor),
      foeShields: enemyShieldCount(floor),
      level: (floor - 1) / 13,
      slots: slotsForFloor(floor),
      tutorial: floor === 1 && progress.cleared === 0 && !pace.auto,
    };
    const result = await battle(cfg, t);
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
  const items = [`Block ${floor} of 14 of the welcome program`, r.text, "+5 maximum HP", floor < 14 ? `The lift now goes up to ${floor + 1}/F` : "All 14 floors of CDS1 cleared"];
  if (after > before && floor < 14) items.push(`One more operator slot: your moves can use ${after} operators`);
  await showDialog({ kicker: `CDS1 ${floor}/F cleared · 通过第 ${floor} 层`, title: `You beat ${prof.name}!`, titleZh: "获胜", portrait: getCharacter(prof.char).portrait, body: [`"${prof.win}"`, h("ul", { class: "reward-list" }, ...items.map((i) => h("li", {}, i)))], buttons: [{ label: "Collect", value: true, primary: true }] });
  const id = r.fn ?? r.op ?? (r.brackets ? "brackets" : r.power);
  if (id && !progress.seen.includes(id)) {
    progress.seen.push(id);
    await cardPopup(id);
  }
  save();
}

async function fightBoss(t: Target | null): Promise<void> {
  const sheet = getCharacter("leo");
  while (true) {
    const cfg: BattleConfig = { ...baseConfig(progress), playerMax: playerMaxHp(progress) + BOSS_BONUS_HP, floor: 15, boss: true, place: "Grand Hall · 大礼堂", enemy: LEO, enemyHp: BOSS_HP, skill: 0.75, pool: enemyPool(15, true), foeShields: enemyShieldCount(15, true), level: 1, slots: 6, tutorial: false, onLed: setLedText };
    const result = await battle(cfg, t);
    if (result !== "win") setLedText([]);
    if (result === "quit") return;
    if (result === "win") {
      progress.bossBeaten = true;
      save();
      // the welcome program runs: the wall lights up before anyone speaks
      setLedText(["print('Welcome to HKU CDS Shanghai!')", "# all 14 blocks, run in order", "# Sapientia et Virtus"]);
      showHud(false);
      world.focus = { x: world.px, y: 0, screenY: 0 };
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
  await showDialog({ kicker: "Final exam passed · 通过期末考验", title: "Leo: ROAR! The wall is lit!", titleZh: "点亮大屏", portrait: sheet.portrait, body: ["All 14 blocks run in order, and the Grand Hall wall plays the welcome show for Magic Hour.", "You climbed CDS1, met 14 professors and read every block of the program yourself. Welcome to the HKU School of Computing and Data Science, Shanghai."], buttons: [{ label: "What did I learn?", value: true, primary: true }] });
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
      await showDialog({ kicker: "Study stair · 阶梯自习区", title: "Your head is full", titleZh: "先去闯关", body: ["Beat another professor in CDS1, then come back and study some more."] });
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
    kicker: `Max HP ${playerMaxHp(p)} · floors cleared ${p.cleared} / 14 · campus details found ${p.found.length}`,
    title: "Your blocks",
    titleZh: "背包 · 我的积木",
    wide: true,
    body: [
      ...group("Always in your hand · 基础", ["ATTACK", "HEAL", "number"]),
      ...group("Operators (random each turn) · 运算符", [...OP_ORDER.filter((o) => p.ops.includes(o)), ...(p.brackets ? ["brackets"] : [])]),
      ...group("Shield functions · 护盾函数", FN_ORDER.filter((f) => p.fns.includes(f))),
      ...group("Power-ups · 道具", POWER_ORDER.filter((k) => p.power[k] > 0)),
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
      { label: "Title screen", value: "title" },
    ],
  });
  busy = false;
  world.paused = false;
  if (pick === "demo") await demo();
  else if (pick === "levels") await levelSelect();
  else if (pick === "title") showTitle();
}

async function levelSelect(): Promise<void> {
  busy = true;
  world.paused = true;
  const buttons = [...PROFESSORS.map((p) => ({ label: `${p.floor}/F`, value: p.floor })), { label: "Grand Hall", value: 15 }, { label: "Cancel", value: 0, primary: true }];
  const f = await showDialog<number>({ kicker: "For the presentation · 演示用", title: "Level select", titleZh: "选关", wide: true, body: ["Jump to any floor with the blocks you would have by then. This replaces your current progress."], buttons });
  busy = false;
  world.paused = false;
  if (!f) return;
  progress = progressAtFloor(Math.min(14, f - 1));
  if (f === 15) progress.hallpass = true;
  save();
  title?.remove();
  title = null;
  showHud(true);
  await travel(f === 15 ? "hall" : `cds1-${f}`, f === 15 ? "entry" : "lift");
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
  const cfg: BattleConfig = { ...baseConfig(progress), playerMax: playerMaxHp(progress) + BOSS_BONUS_HP, floor: 15, boss: true, place: "Demo mode · Grand Hall · 大礼堂", enemy: LEO, enemyHp: BOSS_HP, skill: 0.75, pool: enemyPool(15, true), foeShields: enemyShieldCount(15, true), level: 1, slots: 6, tutorial: false, onLed: setLedText, auto: true };
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
    if (fresh) {
      clearProgress();
      progress = freshProgress();
    } else progress = saved ?? freshProgress();
    showHud(true);
    world.enter(progress.map, progress.spawn);
    refreshHud();
    if (fresh) {
      await showDialog({ kicker: "HKU Zhangjiang Base · No. 500 Fangchun Road, Shanghai · 香港大学张江基地", title: "Magic Hour, and the wall is dark", titleZh: "大屏没有亮", portrait: getCharacter("student").portrait, body: ["It is your first evening at HKU's home in Shanghai, where a university founded in 1911 teaches computing in Zhangjiang. Tonight is Magic Hour, and the giant LED wall in the Grand Hall should be playing the welcome show.", "It is not. The wall is dark."], buttons: [{ label: "What happened?", value: true, primary: true }] });
      await showDialog({ kicker: "A note on the lawn · 草坪上的字条", title: "Leo's seat is empty", titleZh: "Leo 不见了", portrait: getCharacter("leo").portrait, body: ['"The welcome show is a program. I split it into 14 blocks and left one with each professor in the CDS1 tower, floor 1 to floor 14. Each of them will hand it to a student who shows they can read it."', '"Climb up, collect all 14, and bring them to me in the Grand Hall. Then we light the wall together. ROAR! Leo"'], buttons: [{ label: "I will do it", value: true, primary: true }] });
      await showDialog({ kicker: "How to play · 玩法", title: "No coding experience needed", titleZh: "不会编程也能玩", portrait: getCharacter("student").portrait, body: ["Each professor checks you in a friendly block battle: snap number and operator blocks into an ATTACK, and build a shield from a repeat block. Win, and the professor's block of the program is yours.", h("p", { class: "dim" }, "Walk: arrow keys or WASD. Talk, open doors, call the lift: Space.")], buttons: [{ label: "Let's go", value: true, primary: true }] });
    }
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
      h("div", { class: "sub" }, "The welcome show on the Grand Hall wall is a program, and its 14 blocks are missing.", h("br", {}), "Explore the real HKU CDS Shanghai campus, win them back in block-coding battles, light the wall."),
    ),
    h(
      "div",
      { class: "menu" },
      saved && saved.cleared > 0 ? h("button", { class: "btn primary", type: "button", id: "btn-continue", onclick: () => void start(false) }, `Continue · 继续 (${saved.cleared}/14)`) : null,
      h("button", { class: `btn ${saved && saved.cleared > 0 ? "" : "primary"}`, type: "button", id: "btn-start", onclick: () => void start(true) }, "New game · 开始"),
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
