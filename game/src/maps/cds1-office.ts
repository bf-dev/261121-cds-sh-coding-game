// CDS1 professor-office floor, filmed on 13/F and reused for 11 and 12 (buildings/cds1 §5).
// Plan from the 13/F walk (111133 video): lift lobby opening onto the lounge with the bar counter and the
// pantry box, grey corridors that bend around round timber-clad cores past the office doors to the gym in
// the corner, the row of green booths in the wide passage, and the second lounge by the windows.
import { rect, text, hash, shade } from "../art/px";
import { Floor, T, WALL_PX, FACE, timberFloor, vinyl, sunPatch, rug } from "./cds1-kit";
import { wall, liftLobby, door, exitLamp, screen, roomSign, panel } from "./cds1-wall";
import { glassRoom } from "./cds1-rooms";
import { banquette, tableSet, pouf, plant, counter, clutter, sofa } from "./cds1-props";
import { booth } from "./cds1-props2";

/** the pantry: a timber box with a herringbone splashback, wavy tile band and appliances (6 tiles) */
function pantry(g: CanvasRenderingContext2D, x: number): void {
  wall(g, x, 6 * T, "timber");
  const ix = x + 40;
  const iw = 6 * T - 80;
  rect(g, ix - 4, 30, iw + 8, 150, "#8d7350");
  rect(g, ix, 34, iw, 96, "#A9703F");
  for (let j = 0; j < 96; j += 8)
    for (let i = 0; i < iw; i += 16) {
      const up = ((i / 16 + j / 8) | 0) % 2 === 0;
      rect(g, ix + i + (up ? 0 : 8), 34 + j, 8, 4, shade("#A9703F", (hash(i, j, 5) - 0.3) * 0.3));
      rect(g, ix + i + (up ? 8 : 0), 38 + j, 8, 4, shade("#A9703F", -0.18));
    }
  for (let i = 0; i < iw; i += 4) rect(g, ix + i, 100 + Math.round(Math.sin(i / 14) * 6), 4, 14, i % 8 ? "#5e7f86" : "#8fb0b3"); // wavy tile band
  rect(g, ix, 130, iw, 10, "#f4f3ef"); // counter
  rect(g, ix, 140, iw, 40, "#C4A070");
  for (let i = 0; i < iw; i += 44) rect(g, ix + i, 142, 1, 38, "#9a7d52");
  rect(g, ix + 12, 108, 30, 22, "#e9e9e5"); // microwave
  rect(g, ix + 15, 111, 18, 16, "#2a2a2e");
  rect(g, ix + 52, 100, 20, 30, "#1c1c20"); // coffee machine
  rect(g, ix + 56, 118, 12, 8, "#c9c9c4");
  rect(g, ix + 82, 112, 12, 18, "#d9d9d4"); // kettle
  rect(g, ix + 120, 124, 40, 6, "#b9bcbe"); // sink
  rect(g, ix + 138, 108, 3, 16, "#8d9092");
  rect(g, ix + iw - 60, 44, 54, 136, "#f6f6f3"); // fridge-freezer
  rect(g, ix + iw - 60, 96, 54, 2, "#b9b9b4");
  rect(g, ix + iw - 54, 70, 3, 20, "#8d9092");
  rect(g, ix + iw - 54, 104, 3, 30, "#8d9092");
}

export function buildOfficeFloor(floor: 11 | 12 | 13): Floor {
  const f = new Floor(34, 22);
  const g = f.g;
  const filmed = floor === 13;
  timberFloor(g, T, WALL_PX, 32 * T, 18 * T, "#B08A62");
  // grey corridor loop: along the office doors, down both sides of the office block, back under it
  vinyl(g, 16 * T, WALL_PX, 17 * T, 4 * T, "#9a9994");
  vinyl(g, T, WALL_PX, 9 * T, 2 * T, "#d9d5cc"); // pale stone of the lift hall
  vinyl(g, 19 * T, 7 * T, 2 * T, 6 * T, "#9a9994");
  vinyl(g, 31 * T, 7 * T, 2 * T, 6 * T, "#9a9994");
  vinyl(g, 19 * T, 12 * T, 14 * T, T, "#9a9994");

  wall(g, T, T, "cream");
  exitLamp(g, T + 10);
  // eight lifts: four on the back wall, four facing them. The white wall behind the south bank
  // carries the drawn room directory and the printed room notice
  liftLobby(f, 2, String(floor), "white", (pg, _W, top) => {
    panel(pg, 40, top + 10, 210, 92, `${floor}/F`, [`<- ${floor}06-${floor}21`, `${floor}22-${floor}45 MEETING ROOM`, `-> ${floor}46-${floor}53`, `${floor}54 ${floor === 13 ? "GYM" : "MEETING ROOM"}`, "LOUNGE / PANTRY"], 7);
    rect(pg, 300, top + 30, 30, 40, "#fbfbf8"); // printed room notice taped to the wall
    for (let j = 0; j < 7; j++) rect(pg, 304, top + 36 + j * 5, 22, 1, "#6a6a6a");
    rect(pg, 380, top + 40, 14, 14, "#b02b22"); // fire alarm
  });
  pantry(g, 10 * T);
  wall(g, 16 * T, 11 * T, "cream");
  for (let k = 0; k < 4; k++) door(g, (16 + k * 2) * T + 4, `${floor}${41 + k * 2}`, "timber");
  // wayfinding panel: a photo of the building with a green button
  screen(g, 24 * T + 60, 70, 60, 70, "CDS", ["", ""], "#cfe0ee", "#2f5fa8");
  rect(g, 24 * T + 74, 96, 30, 30, "#9db0c2");
  rect(g, 24 * T + 80, 128, 20, 8, "#3fd07a");
  if (floor === 13) glassRoom(g, 27 * T, 6 * T, "gym", "1354", "GYM 健身房", "city");
  else glassRoom(g, 27 * T, 6 * T, floor === 11 ? "meeting" : "discussion", `${floor}54`, floor === 11 ? "MEETING ROOM" : "DISCUSSION ROOM", "city");

  sunPatch(g, 27 * T, 6 * T, 120);
  rug(g, 1.5 * T, 11 * T + 20, 9 * T, 4.2 * T, "#cfc6b4");
  // lounge by the lifts: long bar counter, cream curved sofas, black drum side tables
  f.put(counter(5, "#efe9dc", "#C4A070"), 2, 9, 5);
  f.put(sofa("#DDD5C6"), 2, 12, 3);
  f.put(sofa("#DDD5C6"), 7, 14, 3);
  f.put(pouf("#2a2a2e"), 3, 13, 0, 1, 8, 4);
  f.put(pouf("#2a2a2e"), 8, 15, 0, 1, 8, 4);
  f.put(plant(floor), 11, 5, 1);
  f.put(plant(floor + 1), 11, 16, 1);
  // round timber-clad service core beside the pantry; the corridor bends around it
  f.mass(13, 8, 5, 4, "timber", (pg, W, top) => {
    rect(pg, W / 2 - 22, top + 18, 44, FACE - 24, "#a98b5f");
    rect(pg, W / 2 - 18, top + 22, 36, FACE - 28, "#c9ab7c");
    rect(pg, W / 2 + 10, top + 62, 3, 12, "#55585a");
  }, true);
  // the block of offices inside the corridor loop: closed timber doors on a pale wall, numbers etched beside them
  f.mass(21, 8, 10, 4, "white", (pg, W, top) => {
    for (let k = 0; k < 4; k++) {
      const x = 40 + k * 150;
      rect(pg, x - 3, top + 12, 50, FACE - 18, "#1F1F1F");
      rect(pg, x, top + 15, 44, FACE - 21, "#C4A070");
      rect(pg, x + 34, top + 62, 3, 10, "#55585a");
      roomSign(pg, x + 58, top + 20, `${floor}${50 + k}`, 15, "#1F1F1F", 10);
      rect(pg, x + 60, top + 70, 8, 12, "#2b6fd0");
    }
    void W;
  }, true);
  // green booth pods in the wide passage, and the second lounge by the windows; 11 and 12 swap them around
  const boothRow = floor === 12 ? 18 : 15;
  const loungeRow = floor === 12 ? 15 : 18;
  const n = floor === 11 ? 3 : 4;
  for (let k = 0; k < n; k++) f.put(booth(), (floor === 12 ? 22 : 13) + k * 2, boothRow, 2);
  f.put(banquette("#2c3540", "#48566a", "#C4A070"), floor === 12 ? 13 : 24, loungeRow, 5, 2);
  f.put(tableSet("#f4f3ef", ["#f4f3ef", "#3f8f78", "#f4f3ef"]), floor === 12 ? 19 : 30, 16, 2);
  f.put(tableSet("#f4f3ef", ["#3f8f78", "#f4f3ef"]), 21, 19, 2);
  f.put(tableSet(), 5, 18, 2);
  // high bar tables with stools along the glazing
  f.put(counter(4, "#f4f3ef", "#e9e4da"), 27, 20, 4);
  f.put(counter(4, "#f4f3ef", "#e9e4da"), 14, 20, 4);
  f.put(plant(floor + 2), 32, 19, 1);
  f.put(plant(floor + 5), 22, 15, 1);
  f.put(clutter("boxes"), 31, 9, 1);
  f.put(clutter("boxes"), floor === 12 ? 19 : 30, 14, 1);

  f.prof(floor, 19, 5);
  if (filmed) {
    f.info("notice", 3, 8, 5, 1, "Lift lobby wall", "电梯厅", "A raised red 13 sits over the brushed steel lift doors. Round the corner a drawn directory lists the room numbers, and a printed sheet of room details in Chinese is taped to the wall.");
    f.info("pantry", 10, 3, 6, 1, "Pantry", "茶水间", "A timber box with a herringbone wood-tile splashback, a wavy tile band, a coffee machine, microwave, kettle and a white fridge.");
    f.info("booths", 13, 16, 8, 1, "Green booth pods", "绿色卡座", "Four dark green high-back booths, each with a beige bench and a small oak table, like study or phone booths.");
    f.info("core", 13, 12, 5, 1, "Round timber core", "圆形木饰核心筒", "The service cores on this floor are wrapped in curved timber, so the corridor bends around them instead of running straight.");
    f.info("gym", 27, 3, 6, 1, "Gym 1354", "健身房 1354", "The same kit as the 6/F gym, but this one looks out over city towers instead of farmland.");
    f.info("lounge2", 24, 19, 5, 1, "Second lounge", "第二休息区", "A navy curved sofa wraps a timber-clad column. The cardboard boxes on the floor are a real detail from the day we filmed.");
  } else {
    f.info("notice", 3, 8, 5, 1, `${floor}/F professor offices`, `${floor} 层 教授办公室`, floor === 11 ? "The lift guide lists professor offices on 11 and 13. The team did not film 11/F, so this layout follows 13/F." : "12/F is not named on the lift guide. The team did not film it, so the game treats it as another professor floor and follows the 13/F layout.");
  }
  void text;
  return f;
}
