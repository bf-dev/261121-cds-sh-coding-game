// CDS1 classroom-type floor, filmed on 6/F and reused for 2 to 10 (buildings/cds1 §4, §7).
import { rect, text, rng } from "../art/px";
import { Floor, T, WALL_PX, carpet, vinyl, timberFloor } from "./cds1-kit";
import { wall, liftDoors, door, screen, panel, exitLamp, crest, bigLetters } from "./cds1-wall";
import { glassRoom, windowBay, type RoomKind, type View } from "./cds1-rooms";
import { banquette, tableSet, pouf, plant, counter, clutter, column, sofa } from "./cds1-props";
import { bleachers, labBench, serverRack, fridge, beanbag } from "./cds1-props2";

export interface Room {
  kind: RoomKind | "ltdoor";
  num: string;
  label: string;
}
export interface ClassCfg {
  floor: number;
  /** three 4-tile rooms along the corridor, then one door */
  rooms: [Room, Room, Room];
  doorNum: string;
  doorLabel: string;
  variant: "team" | "lab" | "commons";
  navy: string;
  pale: string;
  view: View;
  /** rows of the wall directory */
  directory: string[];
  filmed: boolean;
}

export function buildClassFloor(c: ClassCfg): Floor {
  const f = new Floor(34, 22);
  const g = f.g;
  const r = rng(c.floor * 977 + 5);
  // floors: lift lobby timber, corridor vinyl, carpet everywhere students sit
  vinyl(g, T, WALL_PX, 32 * T, 3 * T);
  timberFloor(g, T, WALL_PX, 8 * T, 3 * T, "#d2b98f");
  if (c.variant === "commons") timberFloor(g, T, 6 * T, 9 * T, 15 * T, "#d8c3a0");
  else carpet(g, T, 6 * T, 9 * T, 15 * T, c.navy, c.pale);
  if (c.variant === "lab") vinyl(g, 10 * T, 6 * T, 23 * T, 15 * T, "#b9bbb8");
  else carpet(g, 10 * T, 6 * T, 23 * T, 15 * T, c.navy, c.pale);
  rect(g, T, 6 * T - 2, 32 * T, 3, "#6d6c68");
  rect(g, 10 * T - 2, 6 * T, 3, 15 * T, "#6d6c68");

  // back wall
  wall(g, T, T, "cream");
  wall(g, 2 * T, 4 * T, "cream");
  liftDoors(g, 2 * T, 2, String(c.floor));
  wall(g, 6 * T, 2 * T, "timber");
  rect(g, 6 * T + 30, 44, 68, 84, "#a98b5f"); // niche with the sculpted crest
  rect(g, 6 * T + 34, 48, 60, 76, "#8d7350");
  crest(g, 6 * T + 44, 58, 4, "#d9d2c2", "#8d7350");
  screen(g, 6 * T + 44, 140, 40, 26, String(c.floor), [], "#dfeaf8");
  exitLamp(g, 6 * T + 4);
  wall(g, 8 * T, 2 * T, "white");
  panel(g, 8 * T + 6, 34, 116, 122, `${c.floor}/F`, c.directory, 7);
  c.rooms.forEach((rm, i) => {
    const x = (10 + i * 4) * T;
    if (rm.kind === "ltdoor") {
      wall(g, x, 4 * T, "fluted");
      door(g, x + T, "", "grey");
      door(g, x + 2 * T, "", "grey");
      text(g, rm.label, x + 2 * T, 20, 12, "#3a3a3a", { align: "center" });
      rect(g, x + 3 * T + 6, 96, 12, 18, "#2b6fd0");
      rect(g, x + 20, 80, 22, 30, "#fbfbf8");
    } else glassRoom(g, x, 4 * T, rm.kind, rm.num, rm.label, c.view);
  });
  wall(g, 22 * T, 3 * T, "cream");
  door(g, 22 * T + 20, c.doorNum, "tan");
  text(g, c.doorLabel, 22 * T + 110, 110, 9, "#3a3a3a", { maxWidth: 76 });
  exitLamp(g, 22 * T + 34);
  if (c.floor === 6) {
    wall(g, 25 * T, 8 * T, "white");
    bigLetters(g, 25 * T + 40, 22, "H K U", 132, "#A4342C");
    rect(g, 25 * T + 20, 168, 7 * T, 16, "#C9A879"); // low bench under the letters
    rect(g, 25 * T + 20, 168, 7 * T, 3, "#e0c79c");
  } else windowBay(g, 25 * T, 8 * T, c.view);

  // corridor clutter (bins and the loose copier are real)
  f.put(clutter("bins"), 30, 3, 2);
  f.put(clutter("copier"), 28, 3, 1, 1, 0, 0);
  f.block(29, 3);
  // lounge on the left
  f.put(counter(4, "#efe9dc", "#C9A879"), 2, 8, 4);
  f.put(plant(c.floor), 1, 6, 1);
  if (c.variant === "commons") {
    f.put(fridge(), 8, 7, 1);
    f.put(beanbag(), 2, 12, 1);
    f.put(beanbag(), 4, 13, 1, 1, 10, 0);
    f.put(beanbag("#e4e9f1"), 2, 15, 1);
    f.put(tableSet("#d9dcdf", ["#3f6fb8", "#8a9096"]), 6, 16, 2);
  } else {
    f.put(sofa(), 2, 13, 3);
    f.put(pouf("#f4f3ef", true), 3, 14, 0, 1, 8, 0);
    f.put(tableSet(), 6, 12, 2);
    f.put(tableSet("#f4f3ef", ["#f4f3ef", "#f4f3ef", "#3f8f78"]), 3, 18, 2);
  }
  f.put(plant(c.floor + 3), 8, 20, 1);

  // main space
  f.put(column(), 11, 8, 1);
  f.put(column(), 25, 15, 1);
  const spots: [number, number][] = [[13, 9], [24, 9], [29, 11], [12, 15], [14, 19], [21, 18], [23, 12], [29, 14]];
  if (c.variant === "lab") {
    for (let row = 0; row < 3; row++) for (let k = 0; k < 3; k++) f.put(labBench(row * 3 + k), 14 + k * 4, 9 + row * 4, 2);
    for (let k = 0; k < 4; k++) f.put(serverRack(), 28 + k, 8, 1);
    f.put(serverRack(), 31, 13, 1);
    f.put(serverRack(), 31, 14, 1);
    f.put(tableSet("#f4f3ef", ["#8a9096", "#3f6fb8"]), 27, 18, 2);
    f.put(clutter("boxes"), 12, 19, 1);
  } else {
    if (c.variant === "team") {
      f.put(banquette(), 17, 14, 5, 2);
      for (const [px, py, col, tall] of [[16, 14, "#cfc6b4", false], [22, 14, "#d9a23c", false], [18, 15, "#cfc6b4", true], [21, 15, "#d9a23c", false], [16, 12, "#4b4447", true]] as [number, number, string, boolean][])
        f.put(pouf(col, tall), px, py, 0, 1, 8, py === 15 ? -20 : 0);
    } else {
      // long pale wood tables of the big commons
      for (let k = 0; k < 2; k++) f.put(counter(5, "#e3cfa8", "#cdb58a", "#3f6fb8"), 15, 11 + k * 4, 5);
    }
    f.put(bleachers(7, 3), 26, 20, 7, 3);
    const order = spots.map((s, i) => [s, r() + (i < 2 ? -1 : 0)] as [[number, number], number]).sort((a, b) => a[1] - b[1]);
    const palettes = [["#f4f3ef", "#3f8f78", "#f4f3ef"], ["#f4f3ef", "#f4f3ef", "#2f6f8a"], ["#c8443a", "#3f8f78", "#f4f3ef"]];
    order.slice(0, 5).forEach(([[tx, ty]], i) => {
      if (tx >= 26 && ty >= 17) return;
      f.put(tableSet("#f4f3ef", palettes[(i + c.floor) % 3]), tx, ty, 2);
    });
  }
  f.put(plant(c.floor + 7), 32, 6, 1);

  f.lift(2, 4);
  f.prof(c.floor, 16, 8);
  if (c.floor % 2 === 0) f.npc(`student-${c.floor}`, `visitor${(c.floor % 4) + 1}`, 7, 9, "up", "Student", "学生");

  const name = `${c.floor}/F`;
  if (c.filmed) {
    f.info("directory", 8, 3, 2, 1, "Wall directory", "楼层索引", "602 storage, 603 discussion room, 604 gym, 605 teaching assistants, 607 meeting room, 608 discussion room, 609-610 T&L lab, 611-613 classrooms. Room numbers are etched in hollow outline digits.");
    f.info("gym", 10, 3, 4, 1, "Gym 604", "健身房 604", "Treadmills face a window with a surprising view: orange-roofed villas, greenhouses, fields and pylons instead of a city canyon.");
    f.info("teamwork", 16, 15, 7, 1, "Teamwork space", "团队协作区", "A circular banquette wraps a column on the blue geometric carpet, the carpet of every student space in the building.");
    f.info("bleachers", 26, 17, 7, 1, "Bleacher steps", "阶梯座位", "Tiered timber steps with cushions, an indoor amphitheatre for group work.");
    f.info("letters", 25, 3, 3, 1, "HKU letters", "HKU 红字墙", "Big red HKU letters are mounted on the wall at one end of the teamwork space, over a low bench.");
  } else {
    const what = c.variant === "lab" ? "research labs" : c.floor === 2 ? "lecture theatres 2A and 2B and a student lounge" : "teaching labs, classrooms and a student zone";
    f.info("directory", 8, 3, 2, 1, `${name} directory`, `${c.floor} 层索引`, `The lift guide lists ${what} on this floor. The team did not film ${name}, so this layout follows the 6/F classroom floor.`);
  }
  return f;
}
