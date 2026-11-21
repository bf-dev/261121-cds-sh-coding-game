// CDS-1 14/F: director and general office, exhibition lounge (buildings/cds1 §6).
// Plan from the 14/F walk (111812 video): the lift hall has two ends. One end goes through the etched
// glass doors into the white corridor of the director and general office. The other end goes through
// plain glass doors into the lounge: reception desk, the CDS letters on the left wall, then the
// exhibition drums and the event area with the LED wall, step seating and the planted terrace.
import { mk, rect, text, shade } from "../art/px";
import { Floor, T, WALL_PX, FACE, timberFloor, stoneFloor, vinyl, sunPatch } from "./cds1-kit";
import { wall, liftLobby, door, exitLamp, crest, panel } from "./cds1-wall";
import { drawCrestIn } from "../art/logo";
import { windowBay } from "./cds1-rooms";
import { tableSet, plant, counter } from "./cds1-props";
import { drum, stepSeat, planter, desk } from "./cds1-props2";

/** the giant blue-grey CDS letters with fine stripes inside the strokes */
function cdsLetters(): HTMLCanvasElement {
  const [c, g] = mk(470, 170);
  g.font = `700 150px Georgia, "Times New Roman", "Noto Serif", serif`;
  g.textBaseline = "alphabetic";
  g.fillStyle = "#5E7D84";
  let cx = 4;
  for (const ch of "CDS") {
    const w = g.measureText(ch).width;
    g.fillText(ch, cx, 150, 140);
    cx += Math.min(w, 140) + 26;
  }
  g.globalCompositeOperation = "source-atop";
  g.fillStyle = "#8FA6A9";
  for (let i = -170; i < 470; i += 7) for (let j = 30; j < 140; j += 2) g.fillRect(i + j, j, 2, 2);
  g.fillStyle = "#3f5b62";
  
  return c;
}

export function buildExpoFloor(): Floor {
  const f = new Floor(34, 22);
  const g = f.g;
  timberFloor(g, T, WALL_PX, 32 * T, 18 * T, "#C8B08C");
  // lift hall, the way round its west end, and the office corridor: pale glossy stone
  stoneFloor(g, T, WALL_PX, 18 * T, 2 * T, "#DDD9D0");
  stoneFloor(g, T, WALL_PX + 2 * T, 2 * T, 3 * T, "#DDD9D0");
  // the office corridor past the etched doors is white and matt (111812 0:15 to 0:36)
  vinyl(g, 11 * T, WALL_PX, 8 * T, 2 * T, "#ECEAE4");
  rect(g, 11 * T - 4, WALL_PX, 8, 2 * T, "#6f7376"); // door sill
  rect(g, 11 * T - 2, WALL_PX, 4, 2 * T, "#c9cdd0");
  // event area
  stoneFloor(g, 20 * T, WALL_PX, 8 * T, 6 * T, "#DDD9D0");
  // timber terrace band along the windows
  timberFloor(g, 28 * T, WALL_PX, 5 * T, 2 * T, "#b99a6c");
  rect(g, 28 * T, WALL_PX + 2 * T, 5 * T, 6, "#8d7350");
  // plain glass doors between the lift hall and the lounge, standing open
  rect(g, T, 8 * T - 6, 2 * T, 12, "#8d9092");
  rect(g, T + 4, 8 * T - 3, 2 * T - 8, 6, "#d9eaf0");

  // back wall, left to right
  wall(g, T, 2 * T, "white");
  rect(g, T + 30, 60, 44, 70, "#B9BCBE"); // brushed panel with the crest, 14 and B3
  crest(g, T + 41, 63, 2.2, "#3a3d40");
  text(g, "14", T + 52, 94, 14, "#4a4d50", { align: "center" });
  text(g, "B3", T + 52, 110, 12, "#4a4d50", { align: "center" });
  exitLamp(g, T + 10);
  // eight lifts; the lounge side of the south bank is the curved timber wall behind the reception desk
  liftLobby(f, 3, "14", "timber", (pg, W, top) => {
    for (let i = 0; i < W; i += 10) rect(pg, i, top + 4, 3, FACE - 12, "rgba(90,60,30,0.22)"); // timber slats
    rect(pg, W / 2 - 46, top + 8, 92, 96, "#d8c4a2");
    drawCrestIn(pg, W / 2 - 36, top + 12, 72, 84, "#6b5234");
  });
  // etched glass doors of the director and general office, folded open against the wall
  const dx = 11 * T;
  rect(g, dx, 0, 4 * T, WALL_PX, "#3a3d42");
  rect(g, dx, 0, 4 * T, 14, "#2E2E2E");
  rect(g, dx + 6, 18, 4 * T - 12, WALL_PX - 18, "#aab4b8");
  rect(g, dx + 6, 18, 4 * T - 12, 60, "#bcc6ca");
  rect(g, dx + 4 * T / 2 - 2, 18, 4, WALL_PX - 18, "#2a2c30");
  for (let j = 0; j < 5; j++) rect(g, dx + 8, 30 + j * 6, 4 * T - 16, 2, "rgba(255,255,255,0.45)");
  drawCrestIn(g, dx + 28, 62, 76, 80, "#f3f6f7"); // etched crest; the motto scroll is part of the official artwork
  text(g, "SCHOOL OF", dx + 138, 76, 12, "#f3f6f7", { bold: false });
  text(g, "COMPUTING &", dx + 138, 90, 13, "#f3f6f7");
  text(g, "DATA SCIENCE", dx + 138, 105, 13, "#f3f6f7");
  text(g, "The University of Hong Kong", dx + 138, 122, 7, "#f3f6f7", { bold: false });
  for (let j = 0; j < 4; j++) for (let i = 8; i < 4 * T - 10; i += 5) rect(g, dx + i, 152 + j * 6, 3, 2, "rgba(255,255,255,0.7)");
  rect(g, dx + 4 * T / 2 - 12, 96, 4, 26, "#d9dbdc");
  rect(g, dx + 4 * T / 2 + 8, 96, 4, 26, "#d9dbdc");
  // the white office corridor behind them
  wall(g, 15 * T, 5 * T, "white");
  door(g, 15 * T + 8, "1401", "tan");
  door(g, 17 * T + 8, "1402", "tan");
  panel(g, 18 * T + 70, 40, 52, 84, "14/F", ["DIRECTOR &", "GENERAL", "OFFICE", "!EXHIBITION", "!LOUNGE"], 6);
  exitLamp(g, 16 * T + 20);
  // event LED wall playing a talk
  wall(g, 20 * T, 8 * T, "dark");
  const lx = 20 * T + 12;
  rect(g, lx - 4, 20, 8 * T - 16, 150, "#0c0d10");
  rect(g, lx, 24, 8 * T - 24, 142, "#f6f7fa");
  text(g, "Delta", lx + 24, 78, 30, "#16181c");
  text(g, "+", lx + 104, 70, 30, "#2fbf6b");
  rect(g, lx + 160, 24, 250, 142, "#e9eef6");
  rect(g, lx + 160, 24, 26, 142, "#16181c");
  for (let j = 0; j < 6; j++) rect(g, lx + 196, 36 + j * 14, 90 + ((j * 37) % 60), 3, j % 2 ? "#2b5fb4" : "#35507a");
  rect(g, lx + 320, 70, 40, 96, "#27407a"); // the speaker
  rect(g, lx + 328, 44, 24, 28, "#e8b990");
  rect(g, lx + 326, 40, 28, 10, "#2a2a2e");
  rect(g, lx + 352, 84, 20, 6, "#e8b990");
  text(g, "Delta+", lx + 430, 86, 12, "#16181c");
  windowBay(g, 28 * T, 5 * T, "city");
  sunPatch(g, 28 * T, 5 * T, 170);

  // the director and general office block; the giant CDS letters are on its lounge side
  f.mass(11, 5, 9, 3, "white", (pg, _W, top) => {
    pg.drawImage(cdsLetters(), 130, top + 5, 282, 102);
  });
  f.vwall(19, 3, 4);
  // the doorway itself: you walk east out of the lift hall through this frame into the office
  // corridor, with both etched leaves folded back against the wall beside you
  const [frame, fg] = mk(14, 2 * T + 150);
  rect(fg, 0, 0, 14, 2 * T + 150, "#2a2c30");
  rect(fg, 3, 12, 8, 2 * T - 12, "#565a5f"); // head of the frame, seen from below
  rect(fg, 3, 2 * T, 8, 146, "#3d4045"); // the south jamb
  rect(fg, 5, 2 * T + 4, 3, 138, "#8d9092");
  f.props.push({ sprite: frame, x: 11 * T - 7, y: 3 * T - 150, sortY: 5 * T - 2 });
  f.label(13, 4.9, "Director & general office", "院长与综合办公室");

  // reception desk in front of the timber wall, with the school name on its face
  f.put(desk(5, "#D2BE9E", "#efe9dc", "SCHOOL OF COMPUTING & DATA SCIENCE", "The University of Hong Kong"), 4, 10, 5);
  // presentation area: stepped seating blocks, slate blue with a few red
  for (let row = 0; row < 2; row++)
    for (let k = 0; k < 6; k++) {
      const red = (k + row * 2) % 5 === 1;
      f.put(stepSeat(red ? "#9E3A32" : "#46536B", 18 + row * 14), 21 + k, 6 + row * 2, 1);
    }
  // terrace planters and benches
  f.put(planter(3, 1), 28, 3, 3);
  f.put(planter(2, 2), 31, 4, 2);
  f.put(planter(2, 3), 31, 10, 2);
  f.put(planter(2, 4), 31, 15, 2);
  // exhibition drums, between the lounge and the event area
  f.put(drum("#3f6b7a", "HKU HISTORY | THE MILESTONES", ["1912", "1923", "1941-45", "1961", "1967", "1999", "2012", "2024"]), 19, 13, 3, 1, 16);
  f.put(drum("#7a3f4a", "UNDERGRADUATE · Delta+", ["2nd YEAR", "@ CDS", "About", "CDS"]), 24, 16, 3, 1, 16);
  f.put(drum("#2f5fa8", "TAUGHT POSTGRADUATE", ["MSc", "AI", "Data", "FinTech"]), 17, 18, 3, 1, 16);
  // lounge tables with pale wood shell chairs
  const pale = ["#e6d6b8", "#e6d6b8", "#f4f3ef"];
  f.put(tableSet("#f4f3ef", pale), 12, 10, 2);
  f.put(tableSet("#f4f3ef", pale), 15, 12, 2);
  f.put(tableSet("#f4f3ef", pale), 11, 14, 2);
  f.put(tableSet("#f4f3ef", pale), 6, 15, 2);
  f.put(tableSet("#f4f3ef", pale), 27, 12, 2);
  f.put(counter(6, "#f4f3ef", "#f1efe9", "#c9a879"), 4, 20, 6);
  f.put(plant(14), 1, 10, 1);
  f.put(plant(15), 10, 9, 1);
  f.put(plant(16), 20, 9, 1);
  f.put(plant(17), 13, 17, 1);

  // Prof. Ma stands by the HKU milestones drums; the lab is the event area at the far end
  f.prof(14, 18, 14);
  f.lab(28, 3, 3, 2, 4.7);
  f.npc("visitor-14", "visitor3", 21, 15, "up", "Visitor", "访客");
  f.info("glass", 11, 3, 4, 1, "Etched glass doors", "蚀刻玻璃门", "You walk out of the east end of the lift hall through these doors into the white office corridor. They carry an acid-etched HKU crest with the motto SAPIENTIA ET VIRTUS and the school name, over a dotted frit band.");
  f.info("office", 15, 3, 4, 1, "Director & general office", "院长与综合办公室", "A quiet white corridor of closed doors behind the etched glass. The office itself was not filmed.");
  f.info("letters", 12, 8, 6, 1, "CDS letters", "CDS 大字", "Enormous blue-grey CDS letters with a fine stripe texture are mounted flat on the white wall, on your left as you walk from the reception desk into the lounge.");
  f.info("drum", 19, 14, 3, 1, "History drum", "校史圆柱", "HKU HISTORY, THE MILESTONES: a cylinder wrapped in printed panels with a timeline of 1912, 1923, 1941-1945, 1961, 1967, 1999, 2012 and 2024.");
  f.info("led", 21, 3, 6, 2, "Event LED wall", "活动大屏", "A big LED wall faces stepped seating blocks in slate blue, with a few red ones. On the day we filmed it was playing a Delta+ talk.");
  void shade;
  return f;
}
