// CDS1 classroom-type floor, filmed on 6/F and reused for 2 to 10 (buildings/cds1 §4, §7).
// Plan from the 6/F walk (105838 and 110022 videos): lift lobby and lounge at one end, a corridor that
// runs past the glass rooms on the window side with the timber-clad core on the other side, then the
// big teamwork space at the far end, with classroom 611 behind a timber wall off that space.
import { rect, text, rng } from "../art/px";
import { Floor, T, WALL_PX, FACE, carpet, vinyl, timberFloor, sunPatch, rug } from "./cds1-kit";
import { wall, liftLobby, door, panel, exitLamp, bigLetters, roomSign } from "./cds1-wall";
import { drawCrestIn } from "../art/logo";
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
  /** the walk-in room off the big space (611 on 6/F) */
  roomNum: string;
  roomLabel: string;
  /** which side the walk-in room opens on; "none" = no room, one open commons */
  open: "east" | "west" | "none";
  /** rows of the wall directory */
  directory: string[];
  filmed: boolean;
}

export function buildClassFloor(c: ClassCfg): Floor {
  const f = new Floor(34, 22);
  const g = f.g;
  const r = rng(c.floor * 977 + 5);
  const lab = c.variant === "lab";
  // floors: lift lobby and lounge timber, corridor vinyl, carpet where students sit
  vinyl(g, T, WALL_PX, 32 * T, 4 * T);
  timberFloor(g, T, WALL_PX, 9 * T, 7 * T, "#d2b98f");
  vinyl(g, T, WALL_PX, 9 * T, 2 * T, "#cfccc4"); // pale stone of the lift hall
  if (c.variant === "commons") timberFloor(g, T, 10 * T, 9 * T, 11 * T, "#d8c3a0");
  else carpet(g, T, 10 * T, 9 * T, 11 * T, c.navy, c.pale);
  if (lab) vinyl(g, 22 * T, WALL_PX, 11 * T, 18 * T, "#b9bbb8");
  else carpet(g, 22 * T, WALL_PX, 11 * T, 18 * T, c.navy, c.pale);
  // the walk-in room: pale floor, a carpet strip through its doorway
  const room = c.open !== "none";
  const doorCol = c.open === "west" ? 10 : 21;
  if (room) {
    vinyl(g, 11 * T, 11 * T, 10 * T, 10 * T, lab ? "#c3c6c4" : "#d6d2c8");
    if (!lab) carpet(g, doorCol * T, 14 * T, T, 2 * T, c.navy, c.pale);
    else vinyl(g, doorCol * T, 14 * T, T, 2 * T, "#b9bbb8");
  } else timberFloor(g, 10 * T, 11 * T, 12 * T, 10 * T, "#d8c3a0");
  rect(g, 10 * T - 2, WALL_PX, 3, 4 * T, "#6d6c68");
  rect(g, 22 * T - 2, WALL_PX, 3, 4 * T, "#6d6c68");
  rect(g, T, 10 * T - 2, 9 * T, 3, "#6d6c68");

  // back wall
  wall(g, T, T, "cream");
  exitLamp(g, T + 10);
  // eight lifts: four on the back wall, four facing them. The far side of the south bank is the
  // timber wall of the lounge, with the crest and the drawn directory
  liftLobby(f, 2, String(c.floor), "timber", (pg, _W, top) => {
    rect(pg, 26, top + 12, 68, 88, "#a98b5f"); // niche with the sculpted crest
    rect(pg, 30, top + 16, 60, 80, "#8d7350");
    drawCrestIn(pg, 32, top + 18, 56, 74, "#e6dfcf");
    panel(pg, 124, top + 8, 160, 96, `${c.floor}/F`, c.directory.slice(0, 6), 7);
    if (c.directory.length > 6) panel(pg, 296, top + 8, 150, 96, "->", c.directory.slice(6), 7);
    rect(pg, 458, top + 30, 44, 30, "#16181c"); // small blue wall screen
    rect(pg, 461, top + 33, 38, 24, "#dfeaf8");
    text(pg, String(c.floor), 480, top + 36, 16, "#2b5fb4", { align: "center" });
  });
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
  } else {
    windowBay(g, 25 * T, 8 * T, c.view);
    sunPatch(g, 25 * T, 8 * T);
  }

  // the core between the corridor and the walk-in room: lifts, stores and toilets behind curved timber
  f.mass(10, 7, 12, 4, "timber", (pg, W, top) => {
    if (c.open === "none") return;
    // the room's front wall, seen from inside it
    rect(pg, T, top + 3, W - 2 * T, FACE - 9, "#EFEDE6");
    if (lab) {
      rect(pg, 2 * T, top + 22, 5 * T, 62, "#16181c");
      rect(pg, 2 * T + 4, top + 26, 5 * T - 8, 54, "#1d2a44");
      for (let j = 0; j < 5; j++) rect(pg, 2 * T + 14, top + 34 + j * 9, 120 + ((j * 53) % 140), 2, j % 2 ? "#3fd07a" : "#6fb0ff");
    } else {
      rect(pg, 2 * T, top + 20, 6 * T, 66, "#8d9092"); // whiteboard
      rect(pg, 2 * T + 3, top + 23, 6 * T - 6, 60, "#fbfbf8");
      for (let j = 0; j < 4; j++) rect(pg, 2 * T + 16, top + 32 + j * 11, 90 + ((j * 71 + c.floor * 13) % 180), 2, j % 2 ? "#c8443a" : "#2b5fb4");
    }
    roomSign(pg, 9 * T, top + 22, c.roomNum, 20);
    text(pg, c.roomLabel, 9 * T - 4, top + 78, 9, "#3a3a3a");
  }, true);
  if (room) {
    const closed = c.open === "west" ? 21 : 10;
    f.vwall(closed, 11, 20);
    f.vwall(doorCol, 11, 13);
    f.vwall(doorCol, 16, 20);
  }

  // lift lobby and lounge
  f.put(counter(4, "#efe9dc", "#C9A879"), 5, 10, 4);
  f.put(plant(c.floor), 1, 9, 1);
  if (c.variant === "commons") {
    f.put(fridge(), 9, 9, 1);
    f.put(beanbag(), 2, 12, 1);
    f.put(beanbag(), 4, 13, 1, 1, 10, 0);
    f.put(beanbag("#e4e9f1"), 2, 15, 1);
    f.put(tableSet("#d9dcdf", ["#3f6fb8", "#8a9096"]), 6, 16, 2);
  } else {
    rug(g, 1.5 * T, 12 * T + 20, 4.5 * T, 2.6 * T, "#8f8a80");
    f.put(sofa(), 2, 13, 3);
    f.put(pouf("#f4f3ef", true), 3, 14, 0, 1, 8, 0);
    f.put(tableSet(), 6, 12, 2);
    f.put(tableSet("#f4f3ef", ["#f4f3ef", "#f4f3ef", "#3f8f78"]), 3, 18, 2);
  }
  f.put(plant(c.floor + 3), 8, 20, 1);
  // loose in the corridor outside the lounge: two wheelie bins and the copier (real clutter)
  f.put(clutter("copier"), 19, 6, 1);
  f.put(clutter("bins"), 16, 6, 2);

  // the walk-in room
  if (!room) {
    // 2/F: the kitchen commons runs straight through under the core, long pale wood tables and beanbags
    for (let k = 0; k < 3; k++) f.put(counter(4, "#e3cfa8", "#cdb58a", "#3f6fb8"), 12 + (k % 2) * 5, 13 + k * 3, 4);
    f.put(beanbag(), 18, 19, 1);
    f.put(beanbag("#e4e9f1"), 20, 17, 1);
    f.put(fridge(), 11, 11, 1);
  } else if (lab) {
    for (let row = 0; row < 3; row++) for (let k = 0; k < 3; k++) f.put(labBench(row * 3 + k + c.floor), 12 + k * 3, 13 + row * 3, 2);
    f.put(serverRack(), 20, 19, 1);
    f.put(serverRack(), 20, 20, 1);
  } else {
    // continuous white tables in rows, shell chairs in red and green
    for (let row = 0; row < 3; row++) {
      f.put(counter(4, "#fbfaf6", "#e4e2dc", row % 2 ? "#3f8f78" : "#c8443a"), 12, 13 + row * 3, 4);
      f.put(counter(4, "#fbfaf6", "#e4e2dc", row % 2 ? "#c8443a" : "#3f8f78"), 16, 13 + row * 3, 4);
    }
  }

  // the big space at the end of the corridor
  f.put(column(), 23, 17, 1);
  f.put(bleachers(7, 3), 26, 20, 7, 3);
  if (lab) {
    for (let row = 0; row < 2; row++) for (let k = 0; k < 2; k++) f.put(labBench(row * 2 + k + 20), 25 + k * 4, 10 + row * 4, 2);
    for (let k = 0; k < 3; k++) f.put(serverRack(), 30 + k, 7, 1);
    f.put(clutter("boxes"), 22, 20, 1);
  } else {
    if (c.variant === "team") {
      f.put(banquette("#3b4658", "#cfc6b4", "#e9e2d0"), 25, 12, 5, 2);
      for (const [px, py, col, tall] of [[24, 12, "#cfc6b4", false], [30, 12, "#d9a23c", false], [26, 13, "#cfc6b4", true], [29, 13, "#d9a23c", false], [24, 10, "#4b4447", true]] as [number, number, string, boolean][])
        f.put(pouf(col, tall), px, py, 0, 1, 8, py === 13 ? -20 : 0);
    } else {
      // long pale wood tables of the big commons
      for (let k = 0; k < 2; k++) f.put(counter(5, "#e3cfa8", "#cdb58a", "#3f6fb8"), 25, 10 + k * 4, 5);
    }
    const spots: [number, number][] = [[29, 7], [30, 16], [25, 16], [22, 19], [31, 10]];
    const order = spots.map((sp, i) => [sp, r() + (i < 2 ? -1 : 0)] as [[number, number], number]).sort((a, b) => a[1] - b[1]);
    const palettes = [["#f4f3ef", "#3f8f78", "#f4f3ef"], ["#f4f3ef", "#f4f3ef", "#2f6f8a"], ["#c8443a", "#3f8f78", "#f4f3ef"]];
    order.slice(0, 4).forEach(([[tx, ty]], i) => f.put(tableSet("#f4f3ef", palettes[(i + c.floor) % 3]), tx, ty, tx === 31 ? 1 : 2));
  }
  f.put(plant(c.floor + 7), 32, 5, 1);

  f.prof(c.floor, 23, 8);
  if (c.floor % 2 === 0) f.npc(`student-${c.floor}`, `visitor${(c.floor % 4) + 1}`, 7, 11, "up", "Student", "学生");
  if (room) f.label(15.5, 12.3, `${c.roomNum} ${c.roomLabel[0]}${c.roomLabel.slice(1).toLowerCase()}`, lab ? "科研实验室" : "教室");

  const name = `${c.floor}/F`;
  if (c.filmed) {
    f.info("directory", 4, 8, 4, 1, "Wall directory", "楼层索引", "602 storage, 603 discussion room, 604 gym, 605 teaching assistants, 607 meeting room, 608 discussion room, 609-610 T&L lab, 611-613 classrooms. Room numbers are etched in hollow outline digits.");
    f.info("gym", 10, 3, 4, 1, "Gym 604", "健身房 604", "Treadmills face a window with a surprising view: orange-roofed villas, greenhouses, fields and pylons instead of a city canyon.");
    f.info("meeting", 14, 3, 4, 1, "Meeting room 607", "会议室 607", "A whiteboard wall full of red and blue marker notes, a green felt panel with a display, and a long timber table for eight.");
    f.info("teamwork", 25, 14, 5, 1, "Teamwork space", "团队协作区", "A circular banquette wraps a column on the blue geometric carpet, the carpet of every student space in the building.");
    f.info("bleachers", 26, 17, 7, 1, "Bleacher steps", "阶梯座位", "Tiered timber steps with cushions, an indoor amphitheatre for group work.");
    f.info("letters", 26, 3, 5, 1, "HKU letters", "HKU 红字墙", "Big red HKU letters are mounted on the wall at one end of the teamwork space, over a low bench.");
    f.info("class611", 13, 11, 6, 1, "Classroom 611", "教室 611", "Long continuous white tables in rows, shell chairs in red and green, and white louvre blinds that are always closed, so the room reads as a white box.");
  } else {
    const what = lab ? "research labs" : c.floor === 2 ? "lecture theatres 2A and 2B and a student lounge" : "teaching labs, classrooms and a student zone";
    f.info("directory", 4, 8, 4, 1, `${name} directory`, `${c.floor} 层索引`, `The lift guide lists ${what} on this floor. The team did not film ${name}, so this layout follows the 6/F classroom floor.`);
  }
  return f;
}
