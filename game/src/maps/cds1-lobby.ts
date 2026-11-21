// CDS1 1/F: entrance lobby, stone wall and turnstiles, lift hall, LED timetable, cafe commons (buildings/cds1 §3).
// From the IMG_3756 walk (3:20 to 3:50): past the gates the lift hall runs straight ahead to the big LED
// wall, with lift doors on both sides of it and the floor guide on the wall just past the gates.
import { mk, rect, ellipse, shade, text, hash } from "../art/px";
import { Floor, T, WALL_PX, stoneFloor, cafeFloor, ao, sunPatch } from "./cds1-kit";
import { wall, liftDoors, door, screen, panel, exitLamp, crest } from "./cds1-wall";
// The eight lifts are two banks of four on either side of the hall that ends at the LED wall.
import { windowBay } from "./cds1-rooms";
import { banquette, tableSet, pouf, plant, counter, clutter } from "./cds1-props";
import { turnstile, fridge, desk } from "./cds1-props2";

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

export function buildLobby(): Floor {
  const f = new Floor(34, 22);
  const g = f.g;
  // floors
  stoneFloor(g, T, WALL_PX, 26 * T, 8 * T);
  cafeFloor(g, 27 * T, WALL_PX, 6 * T, 8 * T, 30 * T, 7 * T);
  rect(g, 27 * T - 2, WALL_PX, 4, 8 * T, "#cfc9b8");
  stoneFloor(g, T, 11 * T, 32 * T, 10 * T);
  // curved inlay border of the lobby floor
  for (let a = 0; a < 400; a++) {
    const t = (a / 400) * Math.PI;
    rect(g, 16.5 * T + Math.cos(t) * 14.5 * T, 20.4 * T - Math.sin(t) * 6.6 * T, 4, 4, "#c9bf9f");
  }
  // light spill from the entrance glass
  for (let j = 0; j < 150; j += 2) for (let i = -j; i < 3 * T + j; i += 4) if ((i + j) % 8 < 4) rect(g, 15 * T + i, 21 * T - j, 2, 2, "rgba(255,255,255,0.3)");

  // back wall, left to right
  wall(g, T, 2 * T, "white");
  // wall screen: the current floor and the Building 5 poster
  screen(g, T + 10, 40, 108, 118, "1  ▲   SAT 星期六", ["BUILDING 5 &", "SPORTS COURT", "ARE NOW OPEN", "7 Days a Week", "08:00-22:00", "HKU Zhangjiang Base"], "#f6f1e4", "#1d2a44");
  rect(g, T + 94, 132, 18, 18, "#16181c");
  for (let q = 0; q < 16; q++) if ((q * 7) % 3) rect(g, T + 96 + (q % 4) * 4, 134 + (q >> 2) * 4, 3, 3, "#f6f1e4");
  wall(g, 3 * T, 8 * T, "white");
  liftDoors(g, 3 * T, 4, "1");
  wall(g, 11 * T, 3 * T, "white");
  panel(g, 11 * T + 8, 30, 176, 104, "SCHOOL OF COMPUTING & DATA SCIENCE", FLOOR_GUIDE, 7);
  rect(g, 11 * T + 60, 144, 26, 34, "#fbfbf8"); // lift safety certificate and info card taped to the wall
  rect(g, 11 * T + 92, 148, 22, 28, "#f3f0e2");
  for (let j = 0; j < 5; j++) rect(g, 11 * T + 63, 150 + j * 5, 20, 1, "#8a8a8a");
  // the LED wall at the end of the lift hall, straight ahead from the turnstiles
  wall(g, 14 * T, 5 * T, "timber");
  const lx = 14 * T + 12;
  rect(g, lx - 4, 22, 304, 150, "#101216");
  rect(g, lx, 26, 296, 142, "#eaf2fc");
  text(g, "Semester 1, 2026", lx + 148, 30, 18, "#2b5fb4", { align: "center" });
  ["Course Title", "Venue", "Exam Date", "Time"].forEach((h, i) => {
    rect(g, lx + 6 + i * 72, 56, 68, 16, "#5b9bd9");
    text(g, h, lx + 40 + i * 72, 59, 8, "#ffffff", { align: "center" });
  });
  for (let r = 0; r < 5; r++)
    for (let i = 0; i < 4; i++) {
      rect(g, lx + 6 + i * 72, 74 + r * 18, 68, 16, r % 2 ? "#cfe3f7" : "#b9d6f2");
      rect(g, lx + 12 + i * 72, 80 + r * 18, 24 + Math.floor(hash(r, i, 3) * 30), 2, "#35507a");
    }
  // the second bank of four lifts, on the other side of the hall
  wall(g, 19 * T, 8 * T, "white");
  liftDoors(g, 19 * T, 4, "1");
  // lecture theatre doors just before the cafe
  wall(g, 27 * T, 3 * T, "fluted");
  door(g, 27 * T + 24, "", "grey");
  door(g, 28 * T + 24, "", "grey");
  text(g, "LECTURE THEATRE 1A", 28.5 * T, 22, 11, "#3a3a3a", { align: "center" });
  text(g, "演讲厅 1A", 28.5 * T, 34, 10, "#6a6a6a", { align: "center" });
  rect(g, 29 * T + 38, 96, 12, 18, "#2b6fd0"); // blue access panel
  windowBay(g, 30 * T, 3 * T, "green");
  sunPatch(g, 30 * T, 3 * T, 110);

  // cafe commons: the bank of glass-front drink fridges and the vending machine (1f-cafe-fridges-01)
  f.put(fridge(), 30, 3, 1);
  f.put(fridge("#2f6fd0"), 31, 3, 1);
  f.put(fridge(), 32, 3, 1);
  f.put(tableSet("#e3c79a", ["#c8443a", "#f4f3ef", "#3f6fb8", "#c8443a"]), 27, 6, 2);
  f.put(tableSet("#f4f3ef", ["#3f6fb8", "#c8443a", "#f4f3ef"]), 30, 8, 2);
  f.put(clutter("pedalbins"), 29, 3, 0, 1, 14, 0);
  f.block(29, 3);

  // the stone wall with the school name, and the security line in its doorway
  const left = partition(13, (pg, W) => stone(pg, W - 4 * T, 24, 4 * T, 152));
  const right = partition(14, (pg) => {
    stone(pg, 0, 24, 4 * T, 152);
    // reception back wall: discs on a circular motif board
    rect(pg, 6 * T - 8, 40, 6 * T + 16, 104, "#f4efe2");
    for (let r = 0; r < 3; r++)
      for (let i = 0; i < 14; i++) {
        const col = ["#2f5fa8", "#1d2f4f", "#e9dfc6", "#6f9ad0"][Math.floor(hash(i, r, 7) * 4)];
        ellipse(pg, 6 * T + 12 + i * 28, 60 + r * 32, 11, 11, shade(col, -0.2));
        ellipse(pg, 6 * T + 12 + i * 28, 59 + r * 32, 10, 10, col);
      }
  });
  f.put(left, 1, 11, 13, 1, 0, 0, true);
  f.put(right, 19, 11, 14, 1, 0, 0, true);
  const [lintel, lg] = mk(5 * T, 84);
  rect(lg, 0, 0, 5 * T, 24, "#d9d5cc");
  rect(lg, 0, 0, 5 * T, 3, "#f3f1ec");
  stone(lg, 0, 24, 5 * T, 56);
  crest(lg, 20, 28, 3.6, "#1f1f1f");
  text(lg, "SCHOOL OF COMPUTING & DATA SCIENCE", 62, 34, 12, "#1f1f1f");
  text(lg, "The University of Hong Kong", 62, 52, 11, "#1f1f1f", { bold: false });
  rect(lg, 0, 80, 5 * T, 4, "#8d9092");
  f.props.push({ sprite: lintel, x: 14 * T, y: 12 * T - 184, sortY: 12 * T + 4 });
  for (let i = 0; i < 5; i++) f.put(turnstile(i === 2), 14 + i, 11, i === 2 ? 0 : 1);
  ao(g, T, 12 * T, 13 * T, 12);
  ao(g, 19 * T, 12 * T, 14 * T, 12);

  // lift hall: long white benches, plants, the corridor to the cafe
  for (const bx of [4, 21]) {
    const [bench, bg] = mk(4 * T, 60);
    rect(bg, 6, 50, 4 * T - 12, 6, "rgba(20,24,40,0.2)");
    rect(bg, 4, 10, 4 * T - 8, 22, "#fbfaf6");
    rect(bg, 4, 10, 4 * T - 8, 3, "#ffffff");
    rect(bg, 4, 32, 4 * T - 8, 18, "#dcd8cd");
    rect(bg, 4, 48, 4 * T - 8, 3, "#a9a59a");
    f.put(bench, bx, 7, 4);
  }
  f.put(plant(5), 1, 4, 1);
  f.put(plant(6), 9, 7, 1);
  f.npc("visitor-c", "visitor3", 13, 8, "up", "Offer holder", "新生");
  // lobby
  f.put(desk(5, "#e6dcc6", "#f6f2e8"), 25, 13, 5);
  // the round banquette and its poufs sit in front of the reception, to the right as you walk in
  f.put(banquette("#c9a879", "#ece5d3"), 22, 18, 5, 2);
  f.put(pouf("#9a9a96"), 27, 17, 0, 1, 10, -8);
  f.put(pouf("#9a9a96"), 21, 19, 0, 1, -6, 4);
  f.put(plant(8), 6, 18, 1);
  f.put(plant(1), 1, 13, 1);
  f.put(plant(3), 31, 19, 1);
  f.put(plant(4), 2, 20, 1);

  // entrance glass and revolving door in the south wall
  f.block(15, 21, 3, 1, 0);
  rect(g, 15 * T, 21 * T, 3 * T, T, "#bfd9e4");
  rect(g, 15 * T, 21 * T, 3 * T, 6, "#B9BCBE");
  ellipse(g, 16.5 * T, 21.5 * T, 70, 26, "#d9eaf0");
  rect(g, 16.5 * T - 70, 21.5 * T - 1, 140, 2, "#8d9092");
  rect(g, 16.5 * T - 1, 21.5 * T - 26, 2, 52, "#8d9092");
  text(g, "HKU", 15 * T + 8, 21 * T + 44, 12, "#ffffff");
  text(g, "Est. 1911", 17 * T + 4, 21 * T + 44, 11, "#ffffff");

  f.lift(3, 8);
  f.triggers.push({ id: "lift-b", tx: 19, ty: 2, w: 8, h: 2, en: "Lift", zh: "电梯", action: { type: "lift" } });
  f.triggers.push({ id: "fridge", tx: 30, ty: 3, w: 3, h: 2, en: "Drink fridge", zh: "饮料柜", action: { type: "powerup", kind: "redbull" } });
  f.spawns.door = { tx: 16, ty: 19, dir: "up" };
  f.triggers.push({ id: "exit", tx: 15, ty: 21, w: 3, h: 1, en: "Exit to campus", zh: "出口", auto: true, action: { type: "goto", map: "outside", spawn: "cds1-door" } });
  f.prof(1, 27, 14);
  f.npc("guard", "guard", 20, 13, "down", "Security guard", "保安");
  f.npc("visitor-a", "visitor1", 28, 18, "left", "Visitor", "访客");
  f.npc("visitor-b", "visitor2", 29, 6, "left", "Student", "学生");
  f.info("poster", 1, 3, 2, 2, "Lift hall screen", "电梯厅屏幕", "The screen by the lifts says BUILDING 5 & SPORTS COURT ARE NOW OPEN, 7 days a week, 08:00 to 22:00. Building 5 is the low block north of this tower.");
  f.info("guide", 11, 3, 3, 1, "Floor guide", "楼层指南", "The panel between the lifts and the LED wall lists the tower: lecture theatres on 1 to 3, classrooms and teaching labs up to 7, research labs on 9 and 10, professors on 11 and 13, the director and the exhibition lounge on 14.");
  f.info("timetable", 14, 3, 5, 1, "LED timetable", "电子课表", "The lift hall runs straight from the turnstiles to a wall-sized LED screen, with four lifts on each side. It shows the Semester 1, 2026 exam timetable: course, venue, date and time.");
  f.info("turnstiles", 13, 12, 7, 1, "Security line", "闸机", "Five stainless turnstiles sit in a doorway cut into the tan stone wall. Each one has a face-recognition terminal at chest height.");
  f.info("cafe", 27, 5, 3, 1, "Cafe commons", "咖啡共享区", "A round room under a ring of screens. The white floor is scattered with red diamond tiles like confetti, one of the most recognisable floors on campus.");
  f.label(16.5, 9.2, "Security line", "闸机");
  return f;
}
