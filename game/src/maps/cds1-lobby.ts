// CDS1 1/F, laid out from two walks read at 1 frame per second.
// IMG_3756 (3:21 to 3:45): revolving door, the stone portal with the gates straight ahead, the round
// banquette and timber steps to the right; past the gates the lift hall runs straight to a tall LED
// wall, lift doors on both sides, floor guide on the left wall just inside.
// 105538 (0:00 to 0:55), panning left from the banquette: stone portal, fluted white wall, a gap, a
// timber wall with the Semester timetable screen. The gap is a corridor that runs beside the lift
// core to the round cafe (ring of screens overhead, windows ahead, fridges and a coffee machine on
// the lift-core side, a counter, orange high stools) and the door of lecture theatre 1A is in the
// cafe's timber wall, twin bins beside it.
import { mk, rect, ellipse, shade, text, hash } from "../art/px";
import { Floor, T, WALL_PX, stoneFloor, cafeFloor, ao, sunPatch } from "./cds1-kit";
import { wall, liftDoors, door, screen, panel, exitLamp, crest } from "./cds1-wall";
// The eight lifts are two banks of four on either side of the hall that ends at the LED wall.
import { windowBay } from "./cds1-rooms";
import { banquette, tableSet, pouf, plant, counter, clutter } from "./cds1-props";
import { turnstile, fridge, desk, bleachers } from "./cds1-props2";

export const FLOOR_GUIDE = [
  "14  DIRECTOR & GENERAL OFFICE / EXHIBITION LOUNGE",
  "13/11  PROFESSOR OFFICE",
  "10/9  RESEARCH LAB",
  "!7/3  TEACHING & LEARNING LAB / LT 3A & 3B",
  "!      CLASSROOMS / STUDENT LOUNGE & ZONE",
  "2  LECTURE THEATRE 2A & 2B / STUDENT LOUNGE",
  "1  LOBBY / LECTURE THEATRE 1A & 1B",
];

/** a free-standing wall seen from the south: pale cap on top, face below. w tiles wide */
function partition(w: number, paint: (g: CanvasRenderingContext2D, W: number, top: number, h: number) => void): HTMLCanvasElement {
  const W = w * T;
  const [c, g] = mk(W, 184);
  rect(g, 0, 0, W, 24, "#d9d5cc");
  rect(g, 0, 0, W, 3, "#f3f1ec");
  rect(g, 0, 22, W, 2, "#8d8a82");
  rect(g, 0, 24, W, 160, "#EFEDE6");
  for (let i = 0; i < W; i += 8) {
    rect(g, i, 24, 2, 152, "#ffffff");
    rect(g, i + 5, 24, 2, 152, "#d6d3ca");
    rect(g, i + 7, 24, 1, 152, "#bdb9ae");
  }
  paint(g, W, 24, 152);
  rect(g, 0, 176, W, 8, "#a9a59a");
  return c;
}

function stone(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  const base = "#CBB894";
  for (let j = 0; j < h; j += 16)
    for (let i = 0; i < w; i += 16) {
      const t = shade(base, (hash(x + i, y + j, 55) - 0.5) * 0.1);
      rect(g, x + i, y + j, Math.min(16, w - i), Math.min(16, h - j), t);
      rect(g, x + i + 3, y + j + 3, 10, 10, shade(t, 0.08));
      rect(g, x + i + 3, y + j + 12, 10, 1, shade(t, -0.12));
    }
}

/** the Semester timetable screen, w px wide */
function timetable(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  rect(g, x - 4, y - 4, w + 8, h + 8, "#101216");
  rect(g, x, y, w, h, "#eaf2fc");
  text(g, "Semester 1, 2026", x + w / 2, y + 4, 15, "#2b5fb4", { align: "center" });
  const cw = Math.floor((w - 12) / 4);
  ["Course", "Venue", "Date", "Time"].forEach((hd, i) => {
    rect(g, x + 6 + i * cw, y + 26, cw - 4, 14, "#5b9bd9");
    text(g, hd, x + 4 + i * cw + cw / 2, y + 29, 8, "#ffffff", { align: "center" });
  });
  for (let r = 0; r * 16 + 58 < h; r++)
    for (let i = 0; i < 4; i++) {
      rect(g, x + 6 + i * cw, y + 42 + r * 16, cw - 4, 14, r % 2 ? "#cfe3f7" : "#b9d6f2");
      rect(g, x + 10 + i * cw, y + 48 + r * 16, 14 + Math.floor(hash(r, i, 3) * (cw - 30)), 2, "#35507a");
    }
}

export function buildLobby(): Floor {
  const f = new Floor(34, 22);
  const g = f.g;
  const AX = 22.5; // the axis: revolving door, gates, lift hall, LED wall
  // floors: round cafe in the north-west, lift hall behind the gates, lobby in front
  cafeFloor(g, T, WALL_PX, 7 * T, 8 * T, 4.5 * T, 7 * T);
  stoneFloor(g, 9 * T, WALL_PX, 24 * T, 8 * T, "#DAD7CF");
  stoneFloor(g, T, 11 * T, 32 * T, 10 * T);
  // the ring of screens over the cafe, as the pool of light it throws on the floor
  for (let a = 0; a < 720; a++) {
    const t = (a / 720) * Math.PI * 2;
    const on = Math.floor(a / 30) % 2 === 0;
    rect(g, 4.5 * T + Math.cos(t) * 2.9 * T, 7 * T + Math.sin(t) * 2.5 * T, 4, 4, on ? "rgba(120,170,255,0.55)" : "rgba(255,255,255,0.75)");
    rect(g, 4.5 * T + Math.cos(t) * 2.7 * T, 7 * T + Math.sin(t) * 2.3 * T, 3, 3, "rgba(255,255,255,0.35)");
  }
  // curved inlay border of the lobby floor
  for (let a = 0; a < 400; a++) {
    const t = (a / 400) * Math.PI;
    rect(g, AX * T + Math.cos(t) * 10 * T, 20.4 * T - Math.sin(t) * 6.6 * T, 4, 4, "#c9bf9f");
  }
  // light spill from the entrance glass
  for (let j = 0; j < 150; j += 2) for (let i = -j; i < 3 * T + j; i += 4) if ((i + j) % 8 < 4) rect(g, 21 * T + i, 21 * T - j, 2, 2, "rgba(255,255,255,0.3)");

  // ---- back wall, west to east
  // cafe: windows, the timber wall with the lecture theatre door, then the lift-core side with the fridges
  windowBay(g, T, 2 * T, "green");
  sunPatch(g, T, 2 * T, 110);
  wall(g, 3 * T, 2 * T, "timber");
  door(g, 3 * T + 8, "", "grey");
  text(g, "LECTURE THEATRE 1A", 4 * T, 20, 9, "#3a3a3a", { align: "center" });
  text(g, "演讲厅 1A", 4 * T, 32, 9, "#6a6a6a", { align: "center" });
  rect(g, 4 * T + 22, 96, 12, 18, "#2b6fd0"); // room booking panel
  wall(g, 5 * T, 4 * T, "stone");
  // lift hall: four lifts, floor guide, the tall LED wall at the end of the hall, four more lifts
  wall(g, 9 * T, 8 * T, "white");
  liftDoors(g, 9 * T, 4, "1");
  wall(g, 17 * T, 3 * T, "white");
  panel(g, 17 * T + 8, 30, 176, 104, "SCHOOL OF COMPUTING & DATA SCIENCE", FLOOR_GUIDE, 7);
  rect(g, 17 * T + 60, 144, 26, 34, "#fbfbf8"); // lift safety certificate and info card taped to the wall
  rect(g, 17 * T + 92, 148, 22, 28, "#f3f0e2");
  for (let j = 0; j < 5; j++) rect(g, 17 * T + 63, 150 + j * 5, 20, 1, "#8a8a8a");
  wall(g, 20 * T, 5 * T, "dark");
  const lx = 20 * T + 12;
  rect(g, lx - 4, 14, 304, 164, "#101216");
  for (let j = 0; j < 156; j += 4) rect(g, lx, 18 + j, 296, 4, shade("#2a49c8", 0.25 - (j / 156) * 0.5));
  for (let k = 0; k < 40; k++) rect(g, lx + Math.floor(hash(k, 1, 9) * 290), 20 + Math.floor(hash(k, 2, 9) * 150), 3, 3, "rgba(255,255,255,0.35)");
  ellipse(g, lx + 226, 96, 34, 34, "#f1d2b4");
  rect(g, lx + 180, 126, 92, 48, "#ffffff");
  ellipse(g, lx + 226, 78, 36, 20, "#23201f");
  text(g, "EMPOWER", lx + 14, 44, 30, "#ffffff");
  text(g, "School of Computing", lx + 16, 92, 13, "#dfe8ff");
  text(g, "& Data Science", lx + 16, 110, 13, "#dfe8ff");
  text(g, "HKU · Shanghai", lx + 16, 140, 12, "#ffd75e");
  wall(g, 25 * T, 8 * T, "white");
  liftDoors(g, 25 * T, 4, "1");

  // the wall between the cafe and the lift core
  f.vwall(8, 3, 10);

  // ---- cafe: fridges and coffee machine on the lift-core side (1f-cafe-fridges-01, 105538 0:29)
  f.put(fridge(), 5, 3, 1);
  f.put(fridge("#2f6fd0"), 6, 3, 1);
  f.put(fridge("#2f9e92"), 7, 3, 1);
  f.put(clutter("pedalbins"), 4, 3, 0, 1, 10, 0);
  f.block(4, 3);
  f.put(counter(2, "#f4f3ef", "#e9e4d8", null), 6, 6, 2);
  f.put(tableSet("#f4f3ef", ["#c8443a", "#c8443a", "#c8443a", "#c8443a"]), 1, 5, 2);
  f.put(tableSet("#f4f3ef", ["#e2672e", "#e2672e", "#f4f3ef", "#3f6fb8"]), 4, 8, 2);

  // ---- the wall across the lobby, west to east: timetable screen on timber, the gap to the cafe,
  // fluted white, the stone portal with the gates, stone, then the disc wall over the timber steps
  const screenWall = partition(4, (pg, W) => {
    for (let i = 0; i < W; i += 32) {
      rect(pg, i, 24, 32, 152, shade("#C9A879", (hash(i, 3, 51) - 0.5) * 0.12));
      rect(pg, i, 24, 1, 152, shade("#C9A879", -0.2));
    }
    timetable(pg, 12, 40, W - 24, 112);
  });
  const left = partition(13, (pg, W) => stone(pg, W - 3 * T, 24, 3 * T, 152));
  const right = partition(8, (pg) => {
    stone(pg, 0, 24, 2 * T, 152);
    rect(pg, 2 * T + 8, 36, 6 * T - 16, 112, "#f4efe2");
    for (let r = 0; r < 3; r++)
      for (let i = 0; i < 13; i++) {
        const col = ["#2f5fa8", "#1d2f4f", "#e9dfc6", "#6f9ad0"][Math.floor(hash(i, r, 7) * 4)];
        ellipse(pg, 2 * T + 24 + i * 28, 60 + r * 32, 11, 11, shade(col, -0.2));
        ellipse(pg, 2 * T + 24 + i * 28, 59 + r * 32, 10, 10, col);
      }
  });
  f.put(screenWall, 1, 11, 4, 1, 0, 0, true);
  f.put(left, 7, 11, 13, 1, 0, 0, true);
  f.put(right, 25, 11, 8, 1, 0, 0, true);
  const [lintel, lg] = mk(5 * T, 84);
  rect(lg, 0, 0, 5 * T, 24, "#d9d5cc");
  rect(lg, 0, 0, 5 * T, 3, "#f3f1ec");
  stone(lg, 0, 24, 5 * T, 56);
  crest(lg, 20, 28, 3.6, "#1f1f1f");
  text(lg, "SCHOOL OF COMPUTING & DATA SCIENCE", 62, 34, 12, "#1f1f1f");
  text(lg, "The University of Hong Kong", 62, 52, 11, "#1f1f1f", { bold: false });
  rect(lg, 0, 80, 5 * T, 4, "#8d9092");
  f.props.push({ sprite: lintel, x: 20 * T, y: 12 * T - 184, sortY: 12 * T + 4 });
  for (let i = 0; i < 5; i++) f.put(turnstile(i === 2), 20 + i, 11, i === 2 ? 0 : 1);
  ao(g, T, 12 * T, 4 * T, 12);
  ao(g, 7 * T, 12 * T, 13 * T, 12);
  ao(g, 25 * T, 12 * T, 8 * T, 12);
  // the sign stand at the mouth of the cafe corridor
  const [stand, sg] = mk(40, 96);
  rect(sg, 18, 40, 4, 48, "#2a2c30");
  ellipse(sg, 20, 90, 14, 4, "#2a2c30");
  rect(sg, 2, 8, 36, 34, "#1b1d22");
  rect(sg, 5, 11, 30, 28, "#3f8fd0");
  rect(sg, 8, 16, 20, 2, "#ffffff");
  rect(sg, 8, 22, 24, 2, "#d6e8f8");
  f.put(stand, 7, 12, 0, 1, 12, 0);

  // ---- lift hall: long white benches, plants
  for (const bx of [11, 27]) {
    const [bench, bg] = mk(4 * T, 60);
    rect(bg, 6, 50, 4 * T - 12, 6, "rgba(20,24,40,0.2)");
    rect(bg, 4, 10, 4 * T - 8, 22, "#fbfaf6");
    rect(bg, 4, 10, 4 * T - 8, 3, "#ffffff");
    rect(bg, 4, 32, 4 * T - 8, 18, "#dcd8cd");
    rect(bg, 4, 48, 4 * T - 8, 3, "#a9a59a");
    f.put(bench, bx, 7, 4);
  }
  f.put(plant(5), 9, 9, 1);
  f.put(plant(6), 32, 9, 1);
  f.npc("visitor-c", "visitor3", 19, 7, "up", "Offer holder", "新生");

  // ---- lobby: timber steps under the disc wall, the round banquette in front of them, reception block
  f.put(bleachers(6, 1), 27, 12, 6);
  f.put(banquette("#c9a879", "#ece5d3"), 26, 16, 5, 2);
  f.put(pouf("#9a9a96"), 31, 15, 0, 1, 10, -8);
  f.put(pouf("#9a9a96"), 25, 17, 0, 1, -6, 4);
  f.put(desk(3, "#C9A879", "#e6dcc6"), 30, 18, 3);
  f.put(plant(8), 12, 18, 1);
  f.put(plant(1), 1, 13, 1);
  f.put(plant(3), 32, 20, 1);
  f.put(plant(4), 2, 20, 1);
  f.put(plant(2), 25, 12, 1);

  // entrance glass and revolving door in the south wall
  f.block(21, 21, 3, 1, 0);
  rect(g, 21 * T, 21 * T, 3 * T, T, "#bfd9e4");
  rect(g, 21 * T, 21 * T, 3 * T, 6, "#B9BCBE");
  ellipse(g, AX * T, 21.5 * T, 70, 26, "#d9eaf0");
  rect(g, AX * T - 70, 21.5 * T - 1, 140, 2, "#8d9092");
  rect(g, AX * T - 1, 21.5 * T - 26, 2, 52, "#8d9092");
  text(g, "HKU", 21 * T + 8, 21 * T + 44, 12, "#ffffff");
  text(g, "Est. 1911", 23 * T + 4, 21 * T + 44, 11, "#ffffff");

  f.lift(9, 8);
  f.triggers.push({ id: "lift-b", tx: 25, ty: 2, w: 8, h: 2, en: "Lift", zh: "电梯", action: { type: "lift" } });
  f.triggers.push({ id: "fridge", tx: 5, ty: 3, w: 3, h: 2, en: "Drink fridge", zh: "饮料柜", action: { type: "powerup", kind: "redbull" } });
  f.spawns.door = { tx: 22, ty: 19, dir: "up" };
  f.triggers.push({ id: "exit", tx: 21, ty: 21, w: 3, h: 1, en: "Exit to campus", zh: "出口", auto: true, action: { type: "goto", map: "outside", spawn: "cds1-door" } });
  f.prof(1, 24, 14);
  f.npc("guard", "guard", 18, 13, "down", "Security guard", "保安");
  f.npc("visitor-a", "visitor1", 24, 18, "right", "Visitor", "访客");
  f.npc("visitor-b", "visitor2", 4, 6, "down", "Student", "学生");
  f.info("guide", 17, 3, 3, 1, "Floor guide", "楼层指南", "The panel just inside the gates lists the tower: lecture theatres on 1 to 3, classrooms and teaching labs up to 7, research labs on 9 and 10, professors on 11 and 13, the director and the exhibition lounge on 14. The screen inside each lift car shows the floor and a poster: BUILDING 5 & SPORTS COURT ARE NOW OPEN, 7 days a week, 08:00 to 22:00.");
  f.info("ledwall", 20, 3, 5, 1, "LED wall", "电梯厅大屏", "The lift hall runs straight from the gates to a floor-to-ceiling LED wall that plays HKU films, with four lifts on each side of the hall.");
  f.info("timetable", 1, 12, 4, 1, "LED timetable", "电子课表", "A wall-sized screen on the timber wall left of the gates shows the Semester 1, 2026 exam timetable: course, venue, date and time.");
  f.info("turnstiles", 19, 12, 7, 1, "Security line", "闸机", "Five stainless turnstiles sit in a doorway cut into the tan stone wall, under the school name. Each one has a face-recognition terminal at chest height.");
  f.info("cafe", 3, 7, 3, 1, "Cafe commons", "咖啡共享区", "A round room under a ring of screens, reached by the corridor beside the lift core. The white floor is scattered with red diamond tiles like confetti. Lecture theatre 1A opens off it.");
  f.info("steps", 27, 13, 6, 1, "Timber steps", "木阶梯", "Timber sitting steps under a wall of blue and cream discs, with the round banquette in front. The first thing you see to the right of the revolving door.");
  f.label(AX, 9.2, "Security line", "闸机");
  f.label(5.5, 12.6, "To the cafe", "咖啡区");
  return f;
}
