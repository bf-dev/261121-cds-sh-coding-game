// The battle screen. One round = your move against their shield, then their move
// against your shield (docs/game-flow.md, part 4 rules). Everything is shown as
// Scratch-style blocks; the blocks light up one by one while they run.

import { h, pace, ui, wait } from "../ui/dom";
import { cardPopup, dialogOpen, showDialog } from "../ui/dialogs";
import { getCharacter } from "../art/characters";
import type { PowerUpKind } from "../engine/types";
import { hatBlock, hiddenShield, moveBlock, opBlock, pill, powerBlock, shieldBlock } from "./blocks";
import { llmEnabled, llmPlan, type LlmPlan } from "./llm";
import {
  bracketOptions,
  candidates,
  dealHand,
  evaluate,
  explainMove,
  explainShield,
  exprText,
  fmt,
  movePython,
  moveValue,
  refill,
  rollShield,
  ruleMove,
  runShield,
  shieldPython,
  shieldText,
  type FnKind,
  type Hand,
  type Move,
  type Op,
  type Shield,
  type Verb,
} from "./rules";
import { sfx } from "../ui/sfx";

type Power = Exclude<PowerUpKind, "study">;

export interface BattleConfig {
  floor: number;
  boss: boolean;
  place: string;
  enemy: { name: string; nameZh: string; char: string; topic: string; hello: string };
  enemyHp: number;
  /** 0..1 */
  skill: number;
  pool: FnKind[];
  playerMax: number;
  slots: number;
  ops: Op[];
  brackets: boolean;
  fns: FnKind[];
  /** carried power-ups, consumed when used */
  power: Record<Power, number>;
  tutorial: boolean;
  /** demo mode: your side plays itself */
  auto: boolean;
  /** block ids already explained; new ones are added */
  seen: Set<string>;
  onLed?: (lines: string[]) => void;
}

export type BattleResult = "win" | "lose" | "quit";

/** each side has this long for a turn (Insung, 2026-11-21). The tutorial battle has no clock. */
export const TURN_SECONDS = 30;

interface CoachStep {
  text: string;
  want: string | null; // an action id that must be done, or null = any action
}

export async function runBattle(cfg: BattleConfig): Promise<BattleResult> {
  const rnd = Math.random;
  const me = { hp: cfg.playerMax, max: cfg.playerMax };
  const foe = { hp: cfg.enemyHp, max: cfg.enemyHp };
  const myHand: Hand = dealHand(cfg.slots, cfg.ops, rnd);
  const foeHand: Hand = dealHand(cfg.slots, cfg.ops, rnd);
  if (cfg.tutorial) {
    myHand.digits = [4, 3, 2];
    myHand.ops = ["+", "-"];
    foeHand.digits = [6, 1, 2];
    foeHand.ops = ["-", "+"];
  }
  let quit: (() => void) | null = null;
  let quitFlag = false;
  let round = 0;

  // ------------------------------------------------------------ layout
  const student = getCharacter("student");
  const enemyChar = getCharacter(cfg.enemy.char);
  const portrait = (src: HTMLCanvasElement) => {
    const c = h("canvas", { class: "portrait", width: src.width, height: src.height });
    c.getContext("2d")!.drawImage(src, 0, 0);
    return c;
  };
  const hpBar = () => h("div", { class: "hp" }, h("div", { class: "fill" }), h("span", { class: "hp-text" }));
  const meBar = hpBar();
  const foeBar = hpBar();
  const mePanel = h("div", { class: "b-side me" }, portrait(student.portrait), h("div", { class: "who" }, h("div", { class: "name" }, "You", h("small", {}, "学生")), meBar));
  const foePanel = h("div", { class: "b-side foe" }, h("div", { class: "who" }, h("div", { class: "name" }, cfg.enemy.name, h("small", {}, cfg.enemy.nameZh)), foeBar), portrait(enemyChar.portrait));
  const watcher = h("div", { class: "watcher off" }, h("span", { class: "wname" }, "damage"), h("span", { class: "wval" }, "0"));
  const caption = h("div", { class: "caption" });
  const bubble = h("div", { class: "bubble off" });
  const roundTag = h("div", { class: "round-tag" });
  const timerEl = h("div", { class: "timer off" }, h("span", { class: "t-num" }, String(TURN_SECONDS)), h("span", { class: "t-label" }, "s"));
  const mid = h("div", { class: "b-mid" }, roundTag, timerEl, watcher, caption);
  const band = h("div", { class: "b-band" }, h("div", { class: "band-title me" }, "Your blocks", h("small", {}, "你的积木")), mid, h("div", { class: "band-title foe" }, `${cfg.enemy.name}'s blocks`, h("small", {}, "对手的积木")));
  const myScript = h("div", { class: "script-body" });
  const foeScript = h("div", { class: "script-body" });
  const myPy = h("pre", { class: "py" });
  const foePy = h("pre", { class: "py" });
  const scripts = h("div", { class: "b-scripts" }, h("div", { class: "script me" }, myScript, myPy), h("div", { class: "script foe" }, foeScript, foePy));
  const palette = h("div", { class: "b-palette" });
  const coachEl = h("div", { class: "coach off" });
  const speedBtn = h("button", { class: "btn small", type: "button", "data-act": "speed" }, `Speed ${pace.speed}x`);
  const pyBtn = h("button", { class: "btn small", type: "button", "data-act": "python" }, "Show Python");
  const quitBtn = h("button", { class: "btn small", type: "button", "data-act": "quit" }, "Leave");
  const tools = h("div", { class: "b-tools" }, h("span", { class: "place" }, cfg.place), pyBtn, speedBtn, quitBtn);
  const root = h("div", { class: `battle ${cfg.boss ? "boss" : ""}`, id: "battle" }, tools, h("div", { class: "b-top" }, mePanel, foePanel), bubble, band, scripts, palette, coachEl);
  ui().append(root);

  speedBtn.onclick = () => {
    pace.speed = pace.speed >= 3 ? 1 : pace.speed + 1;
    speedBtn.textContent = `Speed ${pace.speed}x`;
  };
  pyBtn.onclick = () => {
    root.classList.toggle("show-python");
    pyBtn.textContent = root.classList.contains("show-python") ? "Hide Python" : "Show Python";
  };
  quitBtn.onclick = () => {
    quitFlag = true;
    quit?.();
  };

  const setHp = (bar: HTMLElement, s: { hp: number; max: number }) => {
    (bar.querySelector(".fill") as HTMLElement).style.width = `${Math.max(0, Math.min(100, (s.hp / s.max) * 100))}%`;
    bar.querySelector(".hp-text")!.textContent = `${Math.max(0, s.hp)} / ${s.max} HP`;
    bar.classList.toggle("low", s.hp <= s.max * 0.3);
  };
  const refreshHp = () => {
    setHp(meBar, me);
    setHp(foeBar, foe);
  };
  refreshHp();
  const say = (text: string) => {
    bubble.textContent = text;
    bubble.classList.toggle("off", !text);
  };
  const cap = (text: string) => {
    caption.textContent = text;
  };
  const watch = (name: string | null, value?: number) => {
    watcher.classList.toggle("off", name === null);
    if (name !== null) {
      watcher.querySelector(".wname")!.textContent = name;
      const v = watcher.querySelector(".wval")!;
      v.textContent = fmt(value ?? 0);
      watcher.classList.remove("tick");
      void watcher.offsetWidth;
      watcher.classList.add("tick");
    }
  };
  const floatNum = (panel: HTMLElement, text: string, cls: string) => {
    const f = h("div", { class: `float ${cls}` }, text);
    panel.append(f);
    setTimeout(() => f.remove(), 1400);
  };
  const led = (lines: string[]) => cfg.onLed?.(lines);

  /** the 30 second turn clock. Returns a function that stops it. It waits while a pop-up is open. */
  const startTimer = (onTimeUp: () => void): (() => void) => {
    if (cfg.tutorial) return () => {};
    let left = TURN_SECONDS;
    const show = () => {
      timerEl.classList.remove("off");
      timerEl.classList.toggle("low", left <= 10);
      timerEl.querySelector(".t-num")!.textContent = String(left);
    };
    show();
    const stop = () => {
      clearInterval(id);
      timerEl.classList.add("off");
    };
    const id = window.setInterval(() => {
      if (dialogOpen()) return;
      left--;
      show();
      if (left <= 5 && left > 0) sfx("tick");
      if (left <= 0) {
        stop();
        onTimeUp();
      }
    }, 1000);
    return stop;
  };

  // ------------------------------------------------------------ tutorial coach
  let coachSteps: CoachStep[] = [];
  const coachShow = () => {
    root.querySelectorAll(".glow").forEach((e) => e.classList.remove("glow"));
    const s = coachSteps[0];
    coachEl.classList.toggle("off", !s);
    if (!s) return;
    coachEl.textContent = s.text;
    if (s.want) root.querySelectorAll(`[data-act="${s.want}"]`).forEach((e) => e.classList.add("glow"));
  };
  const coachAllows = (id: string) => !coachSteps.length || coachSteps[0].want === null || coachSteps[0].want === id;
  const coachDid = (id: string) => {
    if (coachSteps.length && (coachSteps[0].want === null || coachSteps[0].want === id)) coachSteps.shift();
    coachShow();
  };
  const coachNote = (text: string) => {
    coachEl.textContent = text;
    coachEl.classList.toggle("off", !text);
  };

  const seeCard = async (id: string, kicker?: string) => {
    if (cfg.seen.has(id)) return;
    cfg.seen.add(id);
    await cardPopup(id, kicker);
  };

  // ------------------------------------------------------------ your move
  interface Built {
    move: Move;
    digitIdx: number[];
    opIdx: number[];
    extraTurn: boolean;
    /** the clock ran out with no number placed: the turn is lost */
    skipped?: boolean;
  }

  function buildMove(): Promise<Built | null> {
    return new Promise((resolve) => {
      let verb: Verb | null = null;
      const dIdx: number[] = [];
      const oIdx: number[] = [];
      let bracketI = 0;
      let extraTurn = false;
      let note = "";
      const stopTimer = startTimer(() => {
        // time is up: run what is on the table, cut back to the last complete move
        while (oIdx.length && oIdx.length >= dIdx.length) oIdx.pop();
        while (dIdx.length > 1 && !evaluate(current())) {
          dIdx.pop();
          oIdx.pop();
        }
        quit = null;
        sfx("block");
        if (!dIdx.length) resolve({ move: { verb: "ATTACK", digits: [], ops: [] }, digitIdx: [], opIdx: [], extraTurn, skipped: true });
        else resolve({ move: { verb: verb ?? "ATTACK", ...current() }, digitIdx: dIdx.slice(), opIdx: oIdx.slice(), extraTurn });
      });
      quit = () => {
        stopTimer();
        resolve(null);
      };

      const current = () => {
        const opts = bracketOptions(dIdx.length);
        return { digits: dIdx.map((i) => myHand.digits[i]), ops: oIdx.map((i) => myHand.ops[i]), bracket: cfg.brackets ? opts[bracketI % opts.length] : undefined };
      };
      const complete = () => verb !== null && dIdx.length >= 1 && dIdx.length === oIdx.length + 1;

      const act = (id: string) => {
        if (!coachAllows(id)) {
          coachEl.classList.remove("nudge");
          void coachEl.offsetWidth;
          coachEl.classList.add("nudge");
          return;
        }
        const [kind, arg] = id.split(":");
        note = "";
        if (kind === "verb") verb = arg as Verb;
        else if (kind === "num") {
          const i = Number(arg);
          if (dIdx.includes(i)) return;
          if (!verb) note = "Start with ATTACK or HEAL.";
          else if (dIdx.length !== oIdx.length) note = "Put an operator block between two numbers.";
          else dIdx.push(i);
        } else if (kind === "op") {
          const i = Number(arg);
          if (oIdx.includes(i)) return;
          if (!verb) note = "Start with ATTACK or HEAL.";
          else if (dIdx.length !== oIdx.length + 1) note = "An operator needs a number before it.";
          else if (oIdx.length >= cfg.slots) note = `Only ${cfg.slots} operator blocks fit on this floor.`;
          else oIdx.push(i);
        } else if (kind === "undo") {
          if (dIdx.length > oIdx.length) dIdx.pop();
          else oIdx.pop();
          bracketI = 0;
        } else if (kind === "group") bracketI++;
        else if (kind === "power") {
          const p = arg as Power;
          if (dIdx.length > 0) note = "Power-ups are used at the start of your turn, before the move.";
          else if (cfg.power[p] > 0) {
            cfg.power[p]--;
            sfx("power");
            if (p === "redbull") {
              extraTurn = true;
              cap("Red Bull! You get an extra turn after this one.");
            } else {
              const gain = Math.ceil(me.max / (p === "gym" ? 3 : 4));
              me.hp = p === "gym" ? me.hp + gain : Math.min(Math.max(me.max, me.hp), me.hp + gain);
              floatNum(mePanel, `+${gain}`, "heal");
              refreshHp();
              cap(p === "gym" ? `Gym session: +${gain} HP.` : `Meituan meal: +${gain} HP.`);
            }
          }
        } else if (kind === "run") {
          if (!complete()) note = "Finish the move first: ATTACK or HEAL, a number, then operator and number pairs.";
          else if (!evaluate(current())) note = "That would divide by zero. Change the move.";
          else {
            sfx("click");
            coachDid(id);
            quit = null;
            stopTimer();
            resolve({ move: { verb: verb!, ...current() }, digitIdx: dIdx.slice(), opIdx: oIdx.slice(), extraTurn });
            return;
          }
        }
        sfx("click");
        if (!note) coachDid(id);
        draw();
      };

      const draw = () => {
        // workspace
        myScript.replaceChildren(hatBlock("when it is my turn"));
        if (verb) {
          const m = { verb, ...current() };
          const ok = complete() ? evaluate(m) : null;
          const v = ok ? Math.max(0, Math.floor(ok.value + 1e-9)) : null;
          myScript.append(moveBlock(m, v));
          myPy.textContent = complete() && ok ? movePython(m as Move) : "";
          if (complete() && !ok) note = "That would divide by zero. Change the move.";
        } else {
          myScript.append(h("div", { class: "blk stack ghost" }, "ATTACK or HEAL", pill(null)));
          myPy.textContent = "";
        }
        if (note) myScript.append(h("div", { class: "note" }, note));
        // palette
        const used = (arr: number[], i: number) => (arr.includes(i) ? "used" : "");
        const verbs = h("div", { class: "pal-group verbs" }, h("div", { class: "pal-title" }, "1. Action", h("small", {}, "动作")), h("div", { class: "pal-row" }, ...(["ATTACK", "HEAL"] as Verb[]).map((v) => h("button", { class: `blk-btn blk stack ${v === "ATTACK" ? "attack" : "heal"} ${verb === v ? "on" : ""}`, type: "button", "data-act": `verb:${v}`, onclick: () => act(`verb:${v}`) }, h("span", { class: `ico ${v === "ATTACK" ? "sword" : "heart"}` }), v))));
        const nums = h("div", { class: "pal-group nums" }, h("div", { class: "pal-title" }, "2. Numbers", h("small", {}, "数字")), h("div", { class: "pal-row" }, ...myHand.digits.map((d, i) => h("button", { class: `pill-btn pill ${used(dIdx, i)}`, type: "button", "data-act": `num:${i}`, onclick: () => act(`num:${i}`) }, String(d)))));
        const ops = h("div", { class: "pal-group ops" }, h("div", { class: "pal-title" }, `3. Operators (up to ${cfg.slots})`, h("small", {}, "运算符")), h("div", { class: "pal-row" }, ...myHand.ops.map((o, i) => h("button", { class: `op-btn ${used(oIdx, i)}`, type: "button", "data-act": `op:${i}`, onclick: () => act(`op:${i}`) }, opBlock(o)))));
        const powers = (Object.keys(cfg.power) as Power[]).filter((p) => cfg.power[p] > 0);
        const pw = powers.length ? h("div", { class: "pal-group powers" }, h("div", { class: "pal-title" }, "Power-ups (before your move)", h("small", {}, "道具")), h("div", { class: "pal-row" }, ...powers.map((p) => h("button", { class: `power-btn ${dIdx.length ? "used" : ""}`, type: "button", "data-act": `power:${p}`, onclick: () => act(`power:${p}`) }, powerBlock(p, cfg.power[p]))))) : null;
        const canGroup = cfg.brackets && dIdx.length >= 3;
        const controls = h(
          "div",
          { class: "pal-group controls" },
          h("button", { class: "btn", type: "button", "data-act": "undo", disabled: dIdx.length + oIdx.length === 0, onclick: () => act("undo") }, "Undo"),
          canGroup ? h("button", { class: "btn", type: "button", "data-act": "group", onclick: () => act("group") }, "( ) Group") : null,
          h("button", { class: `btn go ${complete() ? "" : "dim"}`, type: "button", "data-act": "run", onclick: () => act("run") }, h("span", { class: "flag" }), "Run"),
        );
        palette.replaceChildren(verbs, nums, ops, ...(pw ? [pw] : []), controls);
        coachShow();
      };
      draw();

      if (cfg.auto) void autoBuild(act, () => ({ dIdx, verb }));
    });
  }

  /** demo mode: the student side picks a strong move and clicks it together */
  async function autoBuild(act: (id: string) => void, _peek: () => unknown): Promise<void> {
    await wait(900);
    if (quitFlag) return;
    for (const p of ["gym", "food", "redbull"] as Power[]) {
      const want = p === "redbull" ? round === 2 : me.hp <= me.max * 0.5;
      if (cfg.power[p] > 0 && want) {
        act(`power:${p}`);
        await wait(900);
      }
    }
    const plan = ruleMove(myHand, cfg.slots, cfg.brackets, me, foe, 0.85, rnd);
    act(`verb:${plan.move.verb}`);
    await wait(650);
    for (let i = 0; i < plan.cand.digitIdx.length; i++) {
      if (i > 0) {
        act(`op:${plan.cand.opIdx[i - 1]}`);
        await wait(450);
      }
      act(`num:${plan.cand.digitIdx[i]}`);
      await wait(450);
    }
    if (plan.move.bracket) {
      const opts = bracketOptions(plan.move.digits.length);
      const k = opts.findIndex((o) => o && o[0] === plan.move.bracket![0] && o[1] === plan.move.bracket![1]);
      for (let i = 0; i < k; i++) {
        act("group");
        await wait(300);
      }
    }
    await wait(700);
    if (!quitFlag) act("run");
  }

  // ------------------------------------------------------------ your shield
  function pickShield(offers: Shield[]): Promise<Shield | null> {
    return new Promise((resolve) => {
      let done = false;
      const stopTimer = startTimer(() => {
        // time is up: a random shield is planted for you
        if (done) return;
        done = true;
        quit = null;
        sfx("block");
        resolve(offers[Math.floor(rnd() * offers.length)]);
      });
      quit = () => {
        stopTimer();
        resolve(null);
      };
      const choose = (i: number) => {
        if (done || !coachAllows(`shield:${i}`)) return;
        done = true;
        sfx("click");
        coachDid(`shield:${i}`);
        quit = null;
        stopTimer();
        resolve(offers[i]);
      };
      myScript.replaceChildren(hatBlock("when I am attacked"), h("div", { class: "blk stack ghost" }, "pick a shield below"));
      myPy.textContent = "";
      palette.replaceChildren(
        h(
          "div",
          { class: "pal-group shields" },
          h("div", { class: "pal-title" }, "Plant a shield. Guess how hard they will hit.", h("small", {}, "选择一个护盾积木")),
          h("div", { class: "pal-row" }, ...offers.map((s, i) => h("button", { class: "shield-btn", type: "button", "data-act": `shield:${i}`, onclick: () => choose(i) }, shieldBlock(s)))),
        ),
      );
      coachShow();
      if (cfg.auto) {
        void (async () => {
          await wait(1500);
          if (quitFlag) return;
          // guess: assume a mid-sized hit and take the shield that blocks most of it
          const guess = 6 + cfg.slots * 6;
          let best = 0;
          offers.forEach((s, i) => {
            if (runShield(s, guess).final < runShield(offers[best], guess).final) best = i;
          });
          choose(best);
        })();
      }
    });
  }

  function offerShields(): Shield[] {
    const kinds = cfg.fns.slice().sort(() => rnd() - 0.5);
    const n = Math.min(3, Math.max(2, kinds.length));
    const out: Shield[] = [];
    for (let i = 0; i < n; i++) {
      let s = rollShield(kinds[i % kinds.length], rnd);
      for (let tries = 0; tries < 6 && out.some((o) => shieldText(o) === shieldText(s)); tries++) s = rollShield(kinds[i % kinds.length], rnd);
      out.push(s);
    }
    return out;
  }

  // ------------------------------------------------------------ running the blocks
  async function runTurn(attacker: "me" | "foe", move: Move, shield: Shield, hiddenUntilRun: boolean): Promise<void> {
    const aScript = attacker === "me" ? myScript : foeScript;
    const dScript = attacker === "me" ? foeScript : myScript;
    const aPy = attacker === "me" ? myPy : foePy;
    const dPy = attacker === "me" ? foePy : myPy;
    const aSide = attacker === "me" ? me : foe;
    const dSide = attacker === "me" ? foe : me;
    const aPanel = attacker === "me" ? mePanel : foePanel;
    const dPanel = attacker === "me" ? foePanel : mePanel;
    const aName = attacker === "me" ? "You" : cfg.enemy.name;
    const dName = attacker === "me" ? cfg.enemy.name : "you";
    palette.replaceChildren(h("div", { class: "pal-group busy" }, h("span", { class: "flag" }), "Running the blocks..."));

    const ev = evaluate(move)!;
    const value = Math.max(0, Math.floor(ev.value + 1e-9));
    const varName = move.verb === "ATTACK" ? "damage" : "heal";
    aScript.replaceChildren(hatBlock(attacker === "me" ? "when it is my turn" : "when it is my turn"), moveBlock(move));
    aPy.textContent = movePython(move);
    if (!hiddenUntilRun) {
      dScript.replaceChildren(hatBlock("when I am attacked"), shieldBlock(shield));
      dPy.textContent = shieldPython(shield).join("\n");
    }
    led([`${move.verb} ${exprText(move)}`]);
    const moveEl = aScript.querySelector(".move") as HTMLElement;
    moveEl.classList.add("running");
    sfx("run");
    cap(`${aName} ${attacker === "me" ? "run" : "runs"}: ${move.verb} ${exprText(move)}`);
    await wait(900);
    for (const st of ev.steps) {
      cap(st.text);
      watch(varName, st.value);
      sfx("tick");
      await wait(800);
    }
    watch(varName, value);
    aScript.replaceChild(moveBlock(move, value), aScript.querySelector(".move")!);
    (aScript.querySelector(".move") as HTMLElement).classList.add("running");
    led([`${move.verb} ${exprText(move)} = ${value}`]);
    if (ev.steps.length === 0) cap(`${varName} = ${value}`);
    else if (value !== ev.value) cap(`${fmt(ev.value)} is rounded down to ${value}`);
    await wait(700);
    aScript.querySelector(".move")?.classList.remove("running");

    if (move.verb === "HEAL") {
      const before = aSide.hp;
      aSide.hp = Math.max(aSide.hp, Math.min(aSide.max, aSide.hp + value));
      dScript.querySelector(".cblk")?.classList.add("idle");
      cap(`HEAL goes straight to ${attacker === "me" ? "you" : aName}. The shield does nothing against HEAL.`);
      floatNum(aPanel, `+${aSide.hp - before}`, "heal");
      sfx("heal");
      refreshHp();
      await wait(1500);
    } else {
      // reveal and run the shield
      const block = shieldBlock(shield);
      dScript.replaceChildren(hatBlock("when I am attacked"), block);
      dPy.textContent = shieldPython(shield).join("\n");
      block.classList.add("reveal");
      led([`${move.verb} ${exprText(move)} = ${value}`, shieldText(shield)]);
      cap(`${attacker === "me" ? cfg.enemy.name + "'s" : "Your"} shield runs on damage ${value}.`);
      sfx("shield");
      await wait(1100);
      const { trace, final } = runShield(shield, value);
      for (const st of trace) {
        block.querySelectorAll(".running").forEach((e) => e.classList.remove("running"));
        block.querySelector(`[data-part="${st.part}"]`)?.classList.add("running");
        cap(st.text);
        watch("damage", st.damage);
        sfx("tick");
        await wait(trace.length > 6 ? 520 : 800);
      }
      block.querySelectorAll(".running").forEach((e) => e.classList.remove("running"));
      watch("damage", final);
      dSide.hp = Math.max(0, dSide.hp - final);
      cap(final > 0 ? `${attacker === "me" ? cfg.enemy.name + " takes" : "You take"} ${final} damage${value !== final ? ` (${value} - ${value - final} blocked)` : ""}.` : `The shield blocked everything. ${dName === "you" ? "You take" : dName + " takes"} 0 damage.`);
      led([`${move.verb} ${exprText(move)} = ${value}`, shieldText(shield), `damage = ${final}`]);
      floatNum(dPanel, `-${final}`, "hurt");
      if (final > 0) {
        dPanel.classList.remove("shake");
        void dPanel.offsetWidth;
        dPanel.classList.add("shake");
        sfx("hit");
      } else sfx("block");
      refreshHp();
      await wait(1300);
      // the professor explains in one line
      if (attacker === "me") say(explainShield(shield, value, final));
    }
    if (attacker === "foe") say(pendingSay || explainMove(move));
    await wait(cfg.auto ? 1900 : 1500);
    if (!cfg.seen.has(shield.kind) && move.verb === "ATTACK") await seeCard(shield.kind, attacker === "me" ? `${cfg.enemy.name} used a new block · 新积木` : "Your shield block · 你的护盾积木");
    watch(null);
  }

  let pendingSay = "";

  // ------------------------------------------------------------ the match
  const result = await (async (): Promise<BattleResult> => {
    await showDialog({ kicker: cfg.place, title: cfg.enemy.name, titleZh: cfg.enemy.nameZh, portrait: enemyChar.portrait, body: [cfg.enemy.hello, h("p", { class: "dim" }, `Teaches: ${cfg.enemy.topic}. First to 0 HP loses.`)], buttons: [{ label: cfg.boss ? "Face Leo" : "Start the battle", value: true, primary: true }], autoMs: 2400 });
    if (cfg.tutorial) {
      for (const id of ["ATTACK", "HEAL", "number", "+", "-"]) cfg.seen.add(id);
    } else {
      for (const id of ["ATTACK", "HEAL", "number", ...cfg.ops, ...(cfg.brackets ? ["brackets"] : [])]) await seeCard(id);
    }
    let extra = false;
    while (true) {
      round++;
      roundTag.textContent = `Round ${round}`;
      say("");
      // --- your move against their shield
      const foeOffers = [0, 1].map(() => rollShield(cfg.pool[Math.floor(rnd() * cfg.pool.length)], rnd));
      let foeShield = foeOffers[Math.floor(rnd() * foeOffers.length)];
      if (cfg.tutorial && round === 1) foeShield = { kind: "for1", a: 2, b: 1 };
      // the model is asked now, while you think; when its answer is needed it has 2 s left at most
      const planP: Promise<LlmPlan | null> = cfg.tutorial && round === 1 ? Promise.resolve(null) : llmPlan({ name: cfg.enemy.name, topic: cfg.enemy.topic, skill: cfg.skill, hand: foeHand, slots: cfg.slots, brackets: cfg.floor > 6 || cfg.boss, me: foe, student: me, shields: foeOffers });
      let plan: LlmPlan | null | undefined;
      void planP.then((p) => (plan = p));

      const showFoeShield = cfg.tutorial && round === 1;
      foeScript.replaceChildren(hatBlock("when I am attacked"), showFoeShield ? shieldBlock(foeShield) : hiddenShield());
      foePy.textContent = "";
      cap(extra ? "Extra turn! Build another move." : "Your turn. Build a move with your blocks.");
      extra = false;
      if (cfg.tutorial && round === 1) {
        coachSteps = [
          { text: "On your turn you snap blocks together to make a move. Click the red ATTACK block.", want: "verb:ATTACK" },
          { text: "Every move starts with one number. Click the 4.", want: "num:0" },
          { text: "Operator blocks change the number. Click the + block.", want: "op:0" },
          { text: "+ needs a second number. Click the 3.", want: "num:1" },
          { text: "ATTACK 4 + 3 makes 7 damage. Press the green flag to run your blocks.", want: "run" },
        ];
      } else if (cfg.tutorial && round === 2) {
        coachSteps = [{ text: "Your turn again. HEAL gives HP back to you, and no shield can stop it. Build any move you like, then press Run.", want: null }];
      } else if (cfg.tutorial && round === 3) coachNote("You know the rules now. Beat Dr. Hello to win a new block!");
      else if (cfg.tutorial) coachNote("");
      const built = await buildMove();
      if (!built) return "quit";
      coachSteps = [];
      coachShow();
      if (cfg.tutorial && round === 1) coachNote("Dr. Hello planted a shield: a repeat block. Watch it run its inside block 2 times.");
      if (plan && !(cfg.tutorial && round === 1)) foeShield = foeOffers[plan.shield] ?? foeShield;
      if (built.skipped) {
        cap(`Time is up! ${TURN_SECONDS} seconds passed with no number placed, so you lose this turn.`);
        await wait(2200);
      } else {
        await runTurn("me", built.move, foeShield, !showFoeShield);
        refill(myHand, built.digitIdx, built.opIdx, cfg.ops, rnd);
      }
      if (cfg.tutorial && round === 1) {
        myHand.digits = [2, 5, 6];
        myHand.ops = ["-", "+"];
        coachNote("");
      }
      if (foe.hp <= 0) return "win";
      if (quitFlag) return "quit";
      if (built.extraTurn) {
        extra = true;
        continue;
      }

      // --- their move against your shield
      say("");
      foeScript.replaceChildren(hatBlock("when it is my turn"), h("div", { class: "blk stack ghost thinking" }, `${cfg.enemy.name} is building a move...`));
      foePy.textContent = "";
      cap(`${cfg.enemy.name}'s turn. You cannot see the move yet.`);
      const offers = cfg.tutorial && round === 1 ? [{ kind: "for1" as FnKind, a: 3, b: 1 }] : offerShields();
      if (cfg.tutorial && round === 1) coachSteps = [{ text: "Now Dr. Hello attacks. Shields must be function blocks. Click your repeat block to plant it.", want: "shield:0" }];
      const myShield = await pickShield(offers);
      if (!myShield) return "quit";
      coachSteps = [];
      coachShow();
      myScript.replaceChildren(hatBlock("when I am attacked"), shieldBlock(myShield));
      myPy.textContent = shieldPython(myShield).join("\n");
      // their move: the model's answer if it is ready within 2 s, else the rule-based one
      let foeMove: Move;
      let usedD: number[];
      let usedO: number[];
      pendingSay = "";
      if (cfg.tutorial && round === 1) {
        foeMove = { verb: "ATTACK", digits: [6, 1], ops: ["-"] };
        usedD = [0, 1];
        usedO = [0];
      } else {
        if (plan === undefined && llmEnabled()) plan = await Promise.race([planP, new Promise<null>((r) => setTimeout(() => r(null), 2000))]);
        if (plan) {
          foeMove = plan.move;
          usedD = plan.digitIdx;
          usedO = plan.opIdx;
          pendingSay = plan.say;
        } else {
          const r = ruleMove(foeHand, cfg.slots, cfg.floor > 6 || cfg.boss, foe, me, cfg.skill, rnd);
          foeMove = r.move;
          usedD = r.cand.digitIdx;
          usedO = r.cand.opIdx;
        }
      }
      await wait(600);
      await runTurn("foe", foeMove, myShield, false);
      refill(foeHand, usedD, usedO, cfg.ops, rnd);
      if (me.hp <= 0) return "lose";
      if (quitFlag) return "quit";
    }
  })();

  quit = null;
  coachNote("");
  if (result !== "quit") {
    sfx(result === "win" ? "win" : "lose");
    cap(result === "win" ? `${cfg.enemy.name} is out of HP. You win!` : "You are out of HP.");
    await wait(900);
  }
  led([]);
  root.remove();
  return result;
}

/** the strongest attack a hand can make, used by hints */
export function bestOf(hand: Hand, slots: number, brackets: boolean): number {
  const c = candidates(hand, slots, brackets, Math.random, 300);
  return c.length ? c[c.length - 1].value : 0;
}

export { moveValue };
