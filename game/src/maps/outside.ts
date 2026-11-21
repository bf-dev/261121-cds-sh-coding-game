import { TILE, type GameMap, type Prop, type Trigger, type NpcDef, type MapLabel } from "../engine/types";
import { block, rect } from "../art/px";
import { COLS, ROWS, L } from "./outside-layout";
import { drawGround } from "./outside-ground";
import { towerSprite, b5Sprite, auditoriumSprite, bridgeSprite, BRIDGE_H, BRIDGE_COLS } from "./outside-buildings";
import * as P from "./outside-props";

const T = TILE;

// The outdoor site, drawn from buildings/outside/README.md: central axis with the lawn, lion and HKU
// letters, the sunken round plaza and the footbridge, CDS1 on the east of the axis with Building 5
// behind it, and the service road, lockers and gate on the east side.
export function buildOutside(): GameMap {
  const ground = drawGround();
  const solid = new Uint8Array(COLS * ROWS);
  const props: Prop[] = [];
  const S = (tx: number, ty: number, w = 1, h = 1, v = 1): void => block(solid, COLS, tx, ty, w, h, v);

  /** place a sprite with its foot line centred on tile (tx, ty); solid footprint w tiles wide */
  const put = (sprite: HTMLCanvasElement, tx: number, ty: number, w = 1, h = 1, opts: Partial<Prop> = {}): void => {
    const foot = (ty + 1) * T - 6;
    props.push({ sprite, x: Math.round((tx + w / 2) * T - sprite.width / 2), y: foot - sprite.height + 8, sortY: foot, ...opts });
    if (w > 0) S(Math.floor(tx), Math.floor(ty) - h + 1, Math.ceil(w), h);
  };

  // edges and roads
  S(0, 0, 2, ROWS);
  S(66, 0, 2, ROWS);
  S(0, 0, COLS, 1);
  S(0, L.south, COLS, 3);

  // buildings
  const { cds1, cds2, b5, aud, bridge } = L;
  for (const b of [cds1, cds2, b5, aud]) S(b.x, b.y, b.w, b.roof + b.face);
  S(cds1.door, cds1.y + cds1.roof + cds1.face - 1, 2, 1, 0);
  S(b5.door, b5.y + b5.roof + b5.face - 1, 2, 1, 0);
  props.push({ sprite: towerSprite({ w: cds1.w, roof: cds1.roof, face: cds1.face, door: cds1.door - cds1.x, main: true }), x: cds1.x * T, y: cds1.y * T, sortY: 24 * T, fade: true });
  props.push({ sprite: towerSprite({ w: cds2.w, roof: cds2.roof, face: cds2.face, door: cds2.door - cds2.x, main: false }), x: cds2.x * T, y: cds2.y * T, sortY: 24 * T, fade: true });
  props.push({ sprite: b5Sprite({ w: b5.w, roof: b5.roof, face: b5.face, door: b5.door - b5.x }), x: b5.x * T, y: 0, sortY: 6 * T, fade: true });
  props.push({ sprite: auditoriumSprite(aud), x: aud.x * T, y: 0, sortY: 7 * T - 2 });
  props.push({ sprite: bridgeSprite(bridge.w), x: bridge.x * T, y: (bridge.row + 2) * T - BRIDGE_H, sortY: (bridge.row + 2) * T - 2, fade: true });
  for (const f of BRIDGE_COLS) S(bridge.x + Math.floor(bridge.w * f - 0.01), bridge.row + 1);

  // planting beds (drawn on the ground)
  S(aud.x, 7, 1, 3);
  S(aud.x + aud.w - 1, 7, 1, 3);
  S(cds1.x, 25, cds1.door - cds1.x - 1, 1);
  S(cds1.door + 3, 25, cds1.x + cds1.w - cds1.door - 3, 1);
  S(b5.x, 7, b5.door - b5.x - 1, 1);
  S(b5.door + 3, 7, b5.x + b5.w - b5.door - 3, 1);
  S(cds2.x, 25, 6, 1);
  S(cds2.x + 9, 25, 7, 1);
  S(58, 10, 3, 15);

  // sunken round plaza: the rim, railing, hedge and far wall block; the floor and the stair are free
  const c = L.court;
  for (let ty = 15; ty < 28; ty++)
    for (let tx = 21; tx < 40; tx++) {
      const dx = (tx + 0.5 - c.cx) / c.rx, dy = (ty + 0.5 - c.cy) / c.ry;
      const r = Math.hypot(dx, dy);
      const wall = r < 1 && Math.hypot(dx, (ty + 0.5 - c.wall / T - c.cy) / c.ry) > 1;
      if ((r > 0.8 && r < 1.14) || wall || (dy < 0 && r >= 1.14 && r < 1.2)) S(tx, ty);
    }
  S(28, 24, 2, 2, 0); // top of the sweeping stair
  const g = ground.getContext("2d")!;
  rect(g, 28 * T + 4, 24 * T + 30, 2 * T - 8, 74, "#e4e1d4");
  for (let i = 0; i < 5; i++) rect(g, 28 * T + 4, 24 * T + 30 + i * 15, 2 * T - 8, 3, "#aeab9c");
  rect(g, 28 * T, 24 * T + 30, 4, 74, "#b6bcc0");
  rect(g, 30 * T - 4, 24 * T + 30, 4, 74, "#b6bcc0");

  // landmarks
  put(P.lion(), 24, 31, 3, 2);
  put(P.hkuLetters(), 30, 33, 5, 1);
  put(P.monument(), 43, 28, 4, 2);
  put(P.civilBoard(), 52.5, 26, 2, 1);
  put(P.civilBoard(), 42, 8, 2, 1);
  put(P.arrowPlate(), 59, 26, 1, 1);
  put(P.pylon5(), 49, 7, 1, 1);
  put(P.lockers("mt"), 51.8, 31, 9, 2);
  put(P.lockers("tb"), 51.8, 36, 9, 2);
  put(P.booth(), 59.6, 40, 2, 2);
  props.push({ sprite: P.boom(), x: 61 * T + 10, y: 40 * T - 30, sortY: 41 * T - 8 });
  S(62, 40, 4, 1);
  put(P.roadSign(), 66, 37, 1, 1);
  put(P.car(), 63.6, 14, 2, 3);

  // trees: cherry avenue beside the lawn, ginkgo on the street, staked saplings in the canyon
  let seed = 1;
  for (const ty of [29, 32, 35, 38]) {
    put(P.tree("cherry", seed++), 19, ty);
    put(P.tree("cherry", seed++), 41, ty + (ty === 29 ? 1 : 0));
  }
  for (const tx of [3, 7, 11, 15, 20, 24, 34, 38, 44, 48, 53, 57]) put(P.tree("ginkgo", seed++), tx, 40);
  for (let ty = 3; ty < 33; ty += 4) put(P.tree("ginkgo", seed++), 66, ty);
  for (let ty = 2; ty < 40; ty += 4) put(P.tree("green", seed++), 0.6, ty);
  for (const [tx, ty] of [[20, 12], [39, 12], [20, 19], [39, 19], [21, 26], [38, 26], [19, 8], [40, 4], [20, 4], [43, 4]]) put(P.tree("bare", seed++), tx, ty);
  for (const [tx, ty] of [[6, 29], [12, 29], [9, 36], [14, 37], [5, 37], [5, 4], [9, 5], [13, 4], [16, 6]]) put(P.tree(tx % 2 ? "cherry" : "green", seed++), tx, ty);
  put(P.bench(), 6, 7, 3, 1);
  put(P.bench(), 12, 7, 3, 1);

  // street furniture
  for (const [tx, ty] of [[28, 27], [34, 27], [26, 39], [31, 39], [54.5, 26], [9, 32]]) put(P.bench(), tx, ty, 3, 1);
  for (const [tx, ty] of [[35, 26], [36, 26], [51, 32], [51, 37], [61, 31], [18, 13], [41, 13], [45, 31], [26, 11], [33, 11], [8, 26], [10, 26]]) put(P.planter(seed++), tx, ty);
  for (const [tx, ty] of [[19, 27], [41, 27], [19, 37], [41, 37], [47, 9], [61, 28], [30, 11], [50, 39]]) put(P.lamp(), tx, ty, 0);
  for (const [tx, ty] of [[47, 26], [38, 39], [56, 8]]) put(P.bin(), tx, ty);
  ["#f2c230", "#3f9fd8", "#f2c230", "#3fb87a"].forEach((col, i) => put(P.bike(col), 47.6 + i * 0.9, 34, 0));
  S(48, 34, 4, 1);
  for (const ty of [30, 33, 35, 38]) put(P.bollard(), 61, ty, 0);
  for (let i = 0; i < 10; i++) {
    const left = i < 5;
    put(P.shrub(i), (left ? cds1.x + 0.3 : cds1.door + 3.2) + (i % 5) * 1.05, 25, 0);
  }
  for (let i = 0; i < 8; i++) put(P.shrub(i + 20), (i < 4 ? b5.x + 0.6 : b5.door + 3.4) + (i % 4) * 1.3, 7, 0);

  const info = (id: string, tx: number, ty: number, w: number, h: number, en: string, zh: string, textEn: string): Trigger => ({ id, tx, ty, w, h, en, zh, action: { type: "info", title: en, titleZh: zh, text: textEn } });
  const triggers: Trigger[] = [
    { id: "cds1-door", tx: cds1.door, ty: 24, w: 2, h: 1, en: "Enter CDS1", zh: "进入一号楼", auto: true, action: { type: "goto", map: "cds1-1", spawn: "door" } },
    { id: "b5-door", tx: b5.door, ty: 6, w: 2, h: 1, en: "Enter Building 5", zh: "进入五号楼", auto: true, action: { type: "goto", map: "b5-1", spawn: "door", requires: "b5key" } },
    { id: "meituan", tx: 52, ty: 32, w: 9, h: 1, en: "Meituan food locker", zh: "美团外卖柜", action: { type: "powerup", kind: "food" } },
    info("lion", 23, 32, 5, 1, "The HKU lion", "港大狮子", "A seated cartoon lion about 2.5 m tall, with a yellow mane, a pale green jacket and brown shorts, held down by guy ropes. Students say he waits in the grand hall as the final boss."),
    info("hku-letters", 29, 34, 7, 1, "HKU letters", "HKU 立体字", "Three white block letters, each about 2 m tall, standing straight on the grass. This lawn is the favourite photo spot on campus."),
    info("monument", 42, 29, 6, 1, "Monument sign", "学院标志墙", "A white slab with the HKU crest and the words SCHOOL OF COMPUTING & DATA SCIENCE, The University of Hong Kong. The yellow lane line sweeps around it."),
    info("footbridge", 26, 15, 8, 2, "Footbridge", "空中连廊", "A deck on three round white columns links the two towers. Look up: a big oval hole is cut through it, like an eye in the ceiling."),
    info("sunken-plaza", 26, 21, 9, 3, "Sunken round plaza", "下沉广场", "A round court a few metres below the plaza, with a sweeping stair and dark granite rings in the floor. The site plan calls it 下沉广场."),
    info("civil-board", 52, 27, 3, 1, "Civil defence board", "民防工程引导图", "The red board is a real map of this block: Zuchongzhi Road north, Jidian Road south, Jichuang Road west, Fangchun Road east. The basement is a civil defence shelter."),
    info("taobao", 52, 37, 9, 1, "Taobao lockers", "淘宝闪购柜", "The white and red wall is the Taobao parcel locker, numbered up to 125 like its yellow Meituan neighbour."),
    info("gate", 62, 38, 4, 2, "East gate", "东门", "The guard booth and the red and white barrier arm on the service road. Beyond it the blue sign points to Yindong Road and Jidian Road."),
    info("auditorium", 26, 7, 8, 3, "Step theatre and auditorium", "阶梯剧场与礼堂", "The white glass box carries 香港大學 THE UNIVERSITY OF HONG KONG and the crest. Its wide shallow steps double as an outdoor theatre."),
    info("b5-pylon", 48, 8, 2, 1, "Building 5 pylon", "五号楼指示牌", "A slim black and white pylon with a big 5. Building 5 has the gym, the study stair and the learning commons."),
  ];

  const say = (id: string, char: string, tx: number, ty: number, dir: NpcDef["dir"], name: string, nameZh: string, textEn: string): NpcDef => {
    S(tx, ty);
    return { id, char, tx, ty, dir, name, nameZh, action: { type: "info", title: name, titleZh: nameZh, text: textEn } };
  };
  const npcs: NpcDef[] = [
    say("guard", "guard", 61, 37, "left", "Gate guard", "门卫", "Welcome to the HKU Zhangjiang Base, 500 Fangchun Road. CDS1 is the tower with the revolving door. The food lockers are right behind you."),
    say("visitor1", "visitor1", 28, 33, "left", "Visitor", "访客", "We came for the lion photo. My daughter got her offer last week!"),
    say("visitor2", "visitor2", 47, 31, "up", "Parent", "家长", "I have never written code. They say a for loop just repeats something. Is that all?"),
    say("visitor3", "visitor3", 33, 22, "down", "Student", "学生", "Stand on the dark rings and look up at the footbridge. Best echo on campus."),
    say("visitor4", "visitor4", 54, 9, "down", "Student", "学生", "Building 5 needs a key. I heard a professor on the third floor of CDS1 hands it out."),
  ];

  const labels: MapLabel[] = [
    { x: (cds1.door + 1) * T, y: 20.6 * T, en: "CDS1 Main Building", zh: "计算与数据科学学院 一号楼" },
    { x: (b5.door + 1) * T, y: 4.6 * T, en: "Building 5", zh: "五号楼 学生活动与学习共享空间" },
    { x: (aud.x + aud.w / 2) * T, y: 5.2 * T, en: "Auditorium", zh: "礼堂" },
    { x: 35.5 * T, y: 30.2 * T, en: "The Lawn", zh: "中央草坪" },
    { x: c.cx * T, y: 17.2 * T, en: "Sunken Plaza", zh: "下沉广场" },
    { x: 56.2 * T, y: 28.6 * T, en: "Meituan lockers", zh: "美团外卖柜" },
    { x: 56.2 * T, y: 33.6 * T, en: "Taobao lockers", zh: "淘宝闪购柜" },
    { x: 64 * T, y: 39 * T, en: "East Gate", zh: "东门" },
  ];

  const map: GameMap = {
    id: "outside",
    name: "HKU Zhangjiang Base",
    nameZh: "香港大学张江基地",
    cols: COLS,
    rows: ROWS,
    ground,
    solid,
    props,
    npcs,
    triggers,
    labels,
    drawOver: drawPetals,
    spawns: {
      start: { tx: cds1.door, ty: 28, dir: "up" },
      "cds1-door": { tx: cds1.door, ty: 26, dir: "down" },
      "b5-door": { tx: b5.door, ty: 8, dir: "down" },
    },
  };
  for (const s of Object.values(map.spawns)) S(s.tx, s.ty, 1, 1, 0);
  checkReach(map);
  return map;
}

/** cherry petals and ginkgo leaves drifting over the lawn and the south walk */
function drawPetals(ctx: CanvasRenderingContext2D, t: number): void {
  for (let i = 0; i < 110; i++) {
    const pink = i % 3 !== 0;
    const bx = pink ? 17 * T + ((i * 2654435761) % (26 * T)) : (i * 40503) % (62 * T);
    const by0 = pink ? 26 * T : 37 * T;
    const span = pink ? 13 * T : 4 * T;
    const fall = (t * (0.018 + (i % 7) * 0.004) + i * 97) % span;
    const x = bx + Math.sin(t / 900 + i) * 22 + fall * 0.25;
    ctx.fillStyle = pink ? (i % 2 ? "#f7c9d9" : "#f2aecb") : i % 2 ? "#f6d55c" : "#efc23a";
    ctx.fillRect(Math.round(x), Math.round(by0 + fall), 4, (Math.floor(t / 300 + i) & 1) + 3);
  }
}

/** dev check: every trigger must be reachable on foot from the start */
function checkReach(m: GameMap): void {
  const seen = new Uint8Array(m.cols * m.rows);
  const st = m.spawns.start;
  const q = [st.ty * m.cols + st.tx];
  seen[q[0]] = 1;
  while (q.length) {
    const i = q.pop()!;
    const x = i % m.cols, y = (i / m.cols) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, n = ny * m.cols + nx;
      if (nx < 0 || ny < 0 || nx >= m.cols || ny >= m.rows || seen[n] || m.solid[n]) continue;
      seen[n] = 1;
      q.push(n);
    }
  }
  for (const t of m.triggers) {
    let ok = false;
    for (let y = t.ty; y < t.ty + t.h; y++) for (let x = t.tx; x < t.tx + t.w; x++) if (seen[y * m.cols + x]) ok = true;
    if (!ok) console.warn(`[outside] trigger ${t.id} is not reachable from start`);
  }
  for (const n of m.npcs) {
    const near = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen[(n.ty + dy) * m.cols + n.tx + dx]);
    if (!near) console.warn(`[outside] npc ${n.id} is not reachable from start`);
  }
}
