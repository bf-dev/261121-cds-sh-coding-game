// CDS1 professor-office floor, filmed on 13/F and reused for 11 and 12 (buildings/cds1 §5).
import { rect, text, hash, shade } from "../art/px";
import { Floor, T, WALL_PX, timberFloor, vinyl, sunPatch, rug } from "./cds1-kit";
import { wall, liftDoors, door, exitLamp, screen } from "./cds1-wall";
import { glassRoom } from "./cds1-rooms";
import { banquette, tableSet, pouf, plant, counter, clutter, sofa } from "./cds1-props";
import { booth, core } from "./cds1-props2";

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
  vinyl(g, 15 * T, WALL_PX, 12 * T, 2 * T, "#9a9994");

  wall(g, T, T, "cream");
  wall(g, 2 * T, 6 * T, "cream");
  liftDoors(g, 2 * T, 3, String(floor));
  wall(g, 8 * T, T, "cream");
  rect(g, 8 * T + 14, 84, 30, 40, "#fbfbf8"); // printed room notice taped to the wall
  for (let j = 0; j < 7; j++) rect(g, 8 * T + 18, 90 + j * 5, 22, 1, "#6a6a6a");
  exitLamp(g, 8 * T + 14);
  pantry(g, 9 * T);
  wall(g, 15 * T, 12 * T, "cream");
  for (let k = 0; k < 5; k++) door(g, (15 + k * 2) * T + 4, `${floor}${41 + k * 2}`, "timber");
  // wayfinding panel: a photo of the building with a green button
  screen(g, 25 * T + 30, 70, 60, 70, "CDS", ["", ""], "#cfe0ee", "#2f5fa8");
  rect(g, 25 * T + 44, 96, 30, 30, "#9db0c2");
  rect(g, 25 * T + 50, 128, 20, 8, "#3fd07a");
  if (floor === 13) glassRoom(g, 27 * T, 6 * T, "gym", "1354", "GYM 健身房", "city");
  else glassRoom(g, 27 * T, 6 * T, floor === 11 ? "meeting" : "discussion", `${floor}54`, floor === 11 ? "MEETING ROOM" : "DISCUSSION ROOM", "city");

  sunPatch(g, 27 * T, 6 * T, 120);
  rug(g, 1.5 * T, 11 * T + 20, 9 * T, 4.2 * T, "#cfc6b4");
  // lounge by the lifts: long bar counter, cream curved sofas, black drum side tables
  f.put(counter(5, "#efe9dc", "#C4A070"), 2, 8, 5);
  f.put(sofa("#DDD5C6"), 2, 12, 3);
  f.put(sofa("#DDD5C6"), 7, 14, 3);
  f.put(pouf("#2a2a2e"), 3, 13, 0, 1, 8, 4);
  f.put(pouf("#2a2a2e"), 8, 15, 0, 1, 8, 4);
  f.put(plant(floor), 1, 6, 1);
  f.put(plant(floor + 1), 10, 9, 1);
  // round timber-clad core the corridor curves around
  f.put(core(), 14, 12, 3, 2);
  // green booth pods and the second lounge; 11 and 12 swap them around
  const boothRow = floor === 12 ? 16 : 9;
  const loungeRow = floor === 12 ? 10 : 16;
  const n = floor === 11 ? 3 : 4;
  for (let k = 0; k < n; k++) f.put(booth(), 20 + k * 2, boothRow, 2);
  f.put(banquette("#2c3540", "#48566a", "#C4A070"), 23, loungeRow, 5, 2);
  f.put(tableSet("#f4f3ef", ["#f4f3ef", "#3f8f78", "#f4f3ef"]), 19, loungeRow + 3 > 19 ? 13 : loungeRow + 3, 2);
  f.put(tableSet("#f4f3ef", ["#3f8f78", "#f4f3ef"]), 30, 13, 2);
  f.put(tableSet(), 5, 18, 2);
  f.put(counter(4, "#f4f3ef", "#e9e4da"), 10, 20, 4);
  f.put(plant(floor + 2), 32, 19, 1);
  f.put(plant(floor + 5), 29, loungeRow, 1);
  f.put(clutter("boxes"), 28, 5, 1);
  f.put(clutter("boxes"), 21, loungeRow, 1);

  f.lift(2, 6);
  f.prof(floor, 19, 5);
  if (filmed) {
    f.info("notice", 8, 3, 1, 2, "Lift lobby", "电梯厅", "A raised red 13 sits over the brushed steel lift doors, and a printed sheet of room details in Chinese is taped to the wall beside them.");
    f.info("pantry", 9, 3, 6, 1, "Pantry", "茶水间", "A timber box with a herringbone wood-tile splashback, a wavy tile band, a coffee machine, microwave, kettle and a white fridge.");
    f.info("booths", 20, 10, 8, 1, "Green booth pods", "绿色卡座", "Four dark green high-back booths, each with a beige bench and a small oak table, like study or phone booths.");
    f.info("gym", 27, 3, 6, 1, "Gym 1354", "健身房 1354", "The same kit as the 6/F gym, but this one looks out over city towers instead of farmland.");
    f.info("lounge2", 22, 17, 7, 1, "Second lounge", "第二休息区", "A navy curved sofa wraps a timber-clad column. The cardboard boxes on the floor are a real detail from the day we filmed.");
  } else {
    f.info("notice", 8, 3, 1, 2, `${floor}/F professor offices`, `${floor} 层 教授办公室`, floor === 11 ? "The lift guide lists professor offices on 11 and 13. The team did not film 11/F, so this layout follows 13/F." : "12/F is not named on the lift guide. The team did not film it, so the game treats it as another professor floor and follows the 13/F layout.");
  }
  void text;
  return f;
}
