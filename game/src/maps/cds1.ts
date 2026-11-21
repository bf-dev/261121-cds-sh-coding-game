// CDS1 tower interiors, floors 1 to 14. Filmed floors (1, 6, 13, 14) follow buildings/cds1/README.md;
// the others reuse the 6/F or 13/F layout with the functions from the lift floor guide (§3).
import type { GameMap } from "../engine/types";
import { buildLobby } from "./cds1-lobby";
import { buildClassFloor, type ClassCfg, type Room } from "./cds1-class";
import { buildOfficeFloor } from "./cds1-office";
import { buildExpoFloor } from "./cds1-expo";

const INFO: Record<number, [string, string]> = {
  1: ["Lobby & lecture theatres 1A / 1B", "大堂与演讲厅 1A / 1B"],
  2: ["Lecture theatres 2A / 2B & student lounge", "演讲厅 2A / 2B 与学生休息区"],
  3: ["Lecture theatres 3A / 3B & teaching lab", "演讲厅 3A / 3B 与教学实验室"],
  4: ["Teaching & learning lab", "教学实验室"],
  5: ["Classrooms & student zone", "教室与学生活动区"],
  6: ["Classrooms & teamwork space", "教室与团队协作区"],
  7: ["Teaching & learning lab, classrooms", "教学实验室与教室"],
  8: ["Research lab", "科研实验室"],
  9: ["Research lab", "科研实验室"],
  10: ["Research lab", "科研实验室"],
  11: ["Professor offices", "教授办公室"],
  12: ["Professor offices", "教授办公室"],
  13: ["Professor offices & lounge", "教授办公室与休息区"],
  14: ["Director's office & exhibition lounge", "院长办公室与展览厅"],
};

/** what the lift floor guide says is on each floor */
export function floorInfo(floor: number): { en: string; zh: string } {
  const f = Math.max(1, Math.min(14, Math.round(floor)));
  const [en, zh] = INFO[f];
  return { en: `CDS1 ${f}/F · ${en}`, zh: `一号楼 ${f} 层 · ${zh}` };
}

const R = (kind: Room["kind"], num: string, label: string): Room => ({ kind, num, label });

function classCfg(floor: number): ClassCfg {
  const n = (k: number): string => `${floor}${String(k).padStart(2, "0")}`;
  const base = { floor, navy: "#3E4A63", pale: "#9FAFBE", view: "farm" as const, filmed: false, variant: "team" as const, open: (floor === 4 || floor === 7 || floor === 9 ? "west" : "east") as "east" | "west" | "none", roomNum: n(13), roomLabel: floor >= 8 ? "RESEARCH LAB" : "CLASSROOM" };
  const dir = (rows: string[]): string[] => ["<- TOILET", ...rows];
  switch (floor) {
    case 2:
      return { ...base, variant: "commons", open: "none", rooms: [R("ltdoor", "", "LECTURE THEATRE 2A"), R("ltdoor", "", "LECTURE THEATRE 2B"), R("discussion", n(3), "DISCUSSION ROOM")], doorNum: n(1), doorLabel: "STUDENT LOUNGE", directory: dir(["LT 2A", "LT 2B", `${n(3)} DISCUSSION`, "!STUDENT LOUNGE", "!& ZONE"]), view: "green" };
    case 3:
      return { ...base, navy: "#3b5a5e", pale: "#a5c0bf", rooms: [R("ltdoor", "", "LECTURE THEATRE 3A"), R("ltdoor", "", "LECTURE THEATRE 3B"), R("lab", n(9), "T&L LAB")], doorNum: n(11), doorLabel: "CLASSROOM", directory: dir(["LT 3A", "LT 3B", `${n(9)} T&L LAB`, `${n(11)} CLASSROOM`, "!STUDENT ZONE"]), view: "green" };
    case 4:
      return { ...base, navy: "#4a4763", pale: "#b3aecb", rooms: [R("lab", n(9), "T&L LAB"), R("discussion", n(3), "DISCUSSION ROOM"), R("class", n(11), "CLASSROOM")], doorNum: n(12), doorLabel: "CLASSROOM", directory: dir([`${n(3)} DISCUSSION`, `${n(9)} T&L LAB`, `${n(11)}-${n(12)} CLASSROOM`, "!STUDENT ZONE"]) };
    case 5:
      return { ...base, navy: "#3e5a4c", pale: "#a9c2b0", rooms: [R("class", n(11), "CLASSROOM"), R("meeting", n(7), "MEETING ROOM"), R("lab", n(9), "T&L LAB")], doorNum: n(5), doorLabel: "TEACHING ASSISTANTS", directory: dir([`${n(5)} TEACHING ASSISTANTS`, `${n(7)} MEETING ROOM`, `${n(9)} T&L LAB`, `${n(11)} CLASSROOM`]) };
    case 6:
      return { ...base, filmed: true, rooms: [R("gym", "604", "GYM 健身房"), R("meeting", "607", "MEETING ROOM"), R("discussion", "608", "DISCUSSION ROOM")], doorNum: "609", doorLabel: "T&L LAB", roomNum: "611", directory: dir(["602 STORAGE", "603 DISCUSSION ROOM", "604 GYM", "605 TEACHING ASSISTANTS", "607 MEETING ROOM", "608 DISCUSSION ROOM", "609-610 T&L LAB", "-> 601 TUTORIAL ROOM", "!TEAMWORK SPACE", "611-613 CLASSROOM"]) };
    case 7:
      return { ...base, navy: "#5a4650", pale: "#c9b0b6", rooms: [R("lab", n(9), "T&L LAB"), R("class", n(11), "CLASSROOM"), R("discussion", n(3), "DISCUSSION ROOM")], doorNum: n(1), doorLabel: "TUTORIAL ROOM", directory: dir([`${n(1)} TUTORIAL ROOM`, `${n(3)} DISCUSSION`, `${n(9)} T&L LAB`, `${n(11)} CLASSROOM`]) };
    case 8:
      return { ...base, variant: "lab", view: "city", rooms: [R("lab", n(1), "RESEARCH LAB"), R("server", n(2), "SERVER ROOM"), R("meeting", n(7), "MEETING ROOM")], doorNum: n(5), doorLabel: "RESEARCH LAB", directory: dir([`${n(1)} RESEARCH LAB`, `${n(2)} SERVER ROOM`, `${n(5)} RESEARCH LAB`, `${n(7)} MEETING ROOM`]) };
    case 9:
      return { ...base, variant: "lab", view: "city", rooms: [R("server", n(2), "SERVER ROOM"), R("lab", n(1), "RESEARCH LAB"), R("discussion", n(8), "DISCUSSION ROOM")], doorNum: n(6), doorLabel: "RESEARCH LAB", directory: dir([`${n(1)} RESEARCH LAB`, `${n(2)} SERVER ROOM`, `${n(6)} RESEARCH LAB`, `${n(8)} DISCUSSION`]) };
    default:
      return { ...base, variant: "lab", view: "city", rooms: [R("lab", n(1), "RESEARCH LAB"), R("lab", n(3), "RESEARCH LAB"), R("server", n(2), "SERVER ROOM")], doorNum: n(10), doorLabel: "RESEARCH LAB", directory: dir([`${n(1)} RESEARCH LAB`, `${n(2)} SERVER ROOM`, `${n(3)} RESEARCH LAB`, `${n(10)} RESEARCH LAB`]) };
  }
}

export function buildCds1Floor(floor: number): GameMap {
  const f = Math.max(1, Math.min(14, Math.round(floor)));
  const info = floorInfo(f);
  const built = f === 1 ? buildLobby() : f === 14 ? buildExpoFloor() : f >= 11 ? buildOfficeFloor(f as 11 | 12 | 13) : buildClassFloor(classCfg(f));
  return built.finish(`cds1-${f}`, info.en, info.zh);
}
