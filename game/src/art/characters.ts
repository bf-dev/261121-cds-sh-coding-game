// Every character in the game, drawn in code: the student, the 14 teachers of
// docs/professor-levels.md (one per CDS-1 floor), Leo the HKU lion, the guard and four visitors.

import type { CharSheet } from "../engine/types";
import { mk } from "./px";
import { humanFrames, type HumanSpec } from "./char-human";
import { humanPortrait } from "./char-portrait";
import { leoSheet } from "./char-leo";

const cache = new Map<string, CharSheet>();

const HKU_GREEN = "#1e7a55";
const SKIN = { pale: "#f6d7ba", light: "#f0c59c", warm: "#e4b081", tan: "#cf9a6c", brown: "#a87048", deep: "#7c4c30" };
const HAIR = { black: "#221c28", dark: "#3a2a24", brown: "#6b4630", auburn: "#8e4326", blonde: "#c8a25a", grey: "#8f8f9b", silver: "#c9c9d2", white: "#e8e8ee" };

const SPECS: Record<string, HumanSpec> = {
  // the player: dark hair, HKU-green hoodie, jeans, backpack, white sneakers
  student: { skin: SKIN.light, hair: HAIR.black, hairStyle: "spiky", top: "hoodie", topColor: HKU_GREEN, bottom: "jeans", bottomColor: "#3d5f96", shoes: "#f2f2ee", acc: ["backpack"], accColor: "#d9773a", height: 116 },

  // The 14 challengers follow docs/professor-levels.md. Looks are taken from each person's
  // official HKU staff photo (hair, glasses, what they wear), kept simple and friendly.
  // 1 Dr. Alan Dougherty: blond side-swept hair, pale-framed glasses, black jacket over a blue shirt
  prof1: { skin: SKIN.pale, hair: HAIR.blonde, hairStyle: "side", top: "cardigan", topColor: "#2b2b32", shirt: "#7f9bc8", bottom: "jeans", bottomColor: "#39445e", shoes: "#2a2530", glasses: "square", glassesColor: "#aeb3c0", height: 121 },
  // 2 Dr. Shengzhi Qin (Brian): short upswept black hair, black glasses, white shirt
  prof2: { skin: SKIN.light, hair: HAIR.black, hairStyle: "spiky", top: "shirt", topColor: "#f1f1ee", bottom: "trousers", bottomColor: "#2c3248", shoes: "#2a2530", glasses: "square", height: 118 },
  // 3 Prof. Zhiyi Huang: black side-swept hair, no glasses, navy blazer, pale blue shirt
  prof3: { skin: SKIN.warm, hair: HAIR.black, hairStyle: "side", top: "blazer", topColor: "#232b45", shirt: "#bcd3ee", bottom: "trousers", bottomColor: "#232b45", shoes: "#1f1c22", height: 119 },
  // 4 Prof. Jia Pan: short black hair, dark glasses, navy blazer, light grey shirt
  prof4: { skin: SKIN.light, hair: HAIR.black, hairStyle: "crew", top: "blazer", topColor: "#2a3350", shirt: "#e4e4e8", bottom: "trousers", bottomColor: "#2a3350", shoes: "#1f1c22", glasses: "square", glassesColor: "#2a2a44", height: 119 },
  // 5 Prof. Taku Komura: short greying hair, no glasses, beige checked shirt
  prof5: { skin: SKIN.warm, hair: "#4c4c56", hairStyle: "crew", top: "shirt", topColor: "#ddd3c0", check: "#a59880", bottom: "trousers", bottomColor: "#4b4640", shoes: "#3a2a22", height: 120, build: 2 },
  // 6 Prof. Chenshu Wu: short black hair, high forehead, half-rim glasses, black polo with a red collar edge
  prof6: { skin: SKIN.light, hair: HAIR.black, hairStyle: "crew", top: "polo", topColor: "#26262c", trim: "#d0343c", bottom: "trousers", bottomColor: "#34343c", shoes: "#1f1c22", glasses: "square", height: 119 },
  // 7 Prof. Reynold Cheng: grey-black side part, charcoal suit, striped shirt, navy tie
  prof7: { skin: SKIN.light, hair: "#4e4e58", hairStyle: "side", top: "suit", topColor: "#3d3d46", shirt: "#dfe4f0", tie: "#26335c", bottom: "trousers", bottomColor: "#3d3d46", shoes: "#1f1c22", height: 120, build: 1 },
  // 8 Prof. Chuan Wu: long black hair with a fringe, thin glasses, navy blouse
  prof8: { skin: SKIN.light, hair: HAIR.black, hairStyle: "long", fringe: true, top: "shirt", topColor: "#2f4a7c", bottom: "trousers", bottomColor: "#2a2c38", shoes: "#2a2530", glasses: "round", glassesColor: "#6b6470", height: 113 },
  // 9 Prof. Heming Cui: short black hair brushed to the side, thin glasses, pale blue shirt
  prof9: { skin: SKIN.light, hair: HAIR.black, hairStyle: "side", top: "shirt", topColor: "#bcd6f0", bottom: "trousers", bottomColor: "#39405a", shoes: "#2a2530", glasses: "round", glassesColor: "#8a8a96", height: 119 },
  // 10 Prof. Lequan Yu: short black hair, dark glasses, white polo with a navy collar edge
  prof10: { skin: SKIN.light, hair: HAIR.black, hairStyle: "short", top: "polo", topColor: "#f1f1ee", trim: "#26335c", bottom: "trousers", bottomColor: "#39405a", shoes: "#e9e6dc", glasses: "square", glassesColor: "#3a3a48", height: 120 },
  // 11 Prof. Siu Ming Yiu: grey hair, thin glasses, dark navy polo
  prof11: { skin: SKIN.warm, hair: "#6c6c76", hairStyle: "short", top: "polo", topColor: "#1f2538", bottom: "trousers", bottomColor: "#3a3a44", shoes: "#1f1c22", glasses: "square", glassesColor: "#7a7a86", height: 119, build: 1 },
  // 12 Prof. Ruibang Luo: black side part, thin round glasses, grey cardigan over a white shirt
  prof12: { skin: SKIN.light, hair: HAIR.black, hairStyle: "side", top: "cardigan", topColor: "#8b8d96", shirt: "#f3f3f0", bottom: "trousers", bottomColor: "#3a3f52", shoes: "#3a2a22", glasses: "round", glassesColor: "#7a7a86", height: 117 },
  // 13 Prof. Tak-Wah Lam: short grey hair, no glasses, beige blazer, open white shirt
  prof13: { skin: SKIN.warm, hair: HAIR.grey, hairStyle: "crew", top: "blazer", topColor: "#cdb894", shirt: "#f6f6f2", bottom: "trousers", bottomColor: "#4b4640", shoes: "#3a2a22", height: 118 },
  // 14 Prof. Yi Ma: dark side-parted hair, light-framed glasses, navy blazer, pale blue shirt
  prof14: { skin: SKIN.warm, hair: "#2e2624", hairStyle: "side", top: "blazer", topColor: "#1f2a4a", shirt: "#bcd3ee", bottom: "trousers", bottomColor: "#1f2a4a", shoes: "#121116", glasses: "square", glassesColor: "#a89c8e", height: 122, build: 2 },

  guard: { skin: SKIN.tan, hair: HAIR.black, hairStyle: "crew", top: "uniform", topColor: "#2a3652", bottom: "trousers", bottomColor: "#222b42", shoes: "#121116", acc: ["cap"], height: 120, build: 2 },
  // a parent
  visitor1: { skin: SKIN.light, hair: HAIR.dark, hairStyle: "long", top: "coat", topColor: "#c8a274", shirt: "#f1ead6", bottom: "trousers", bottomColor: "#3a3440", shoes: "#5a3d2b", acc: ["scarf"], accColor: "#b9483e", height: 115 },
  // an offer holder with a tote bag
  visitor2: { skin: SKIN.warm, hair: HAIR.black, hairStyle: "pony", top: "sweater", topColor: "#8fc4e8", shirt: "#f6f1e4", bottom: "jeans", bottomColor: "#4a6aa0", shoes: "#f2f2ee", acc: ["tote"], accColor: "#efe6cf", height: 112 },
  // a child
  visitor3: { skin: SKIN.light, hair: HAIR.dark, hairStyle: "short", top: "hoodie", topColor: "#f0c43c", bottom: "shorts", bottomColor: "#3f6fb0", shoes: "#e0503c", acc: ["backpack"], accColor: "#4aa3c9", height: 84, child: true },
  // a grandparent
  visitor4: { skin: SKIN.light, hair: HAIR.white, hairStyle: "bun", top: "cardigan", topColor: "#8b5a86", shirt: "#f1ead6", bottom: "trousers", bottomColor: "#57504a", shoes: "#3a2a22", glasses: "round", acc: ["cane"], senior: true, height: 106, build: 2 },
};

/** Character ids: "student", "prof1".."prof14", "leo", "guard", "visitor1".."visitor4" */
export function getCharacter(id: string): CharSheet {
  let s = cache.get(id);
  if (!s) cache.set(id, (s = build(id)));
  return s;
}

/** all ids that have their own look (for the sprite sheet viewer) */
export const CHARACTER_IDS: string[] = ["student", ...Array.from({ length: 14 }, (_, i) => `prof${i + 1}`), "leo", "guard", "visitor1", "visitor2", "visitor3", "visitor4"];

function build(id: string): CharSheet {
  if (id === "leo") return leoSheet();
  const spec = SPECS[id] ?? SPECS[`visitor${(([...id].reduce((a, c) => a + c.charCodeAt(0), 0) % 4) + 1)}`];
  let portrait: HTMLCanvasElement;
  try {
    portrait = humanPortrait(spec);
  } catch {
    [portrait] = mk(320, 320);
  }
  return { frames: humanFrames(spec), portrait, w: 64, h: 128 };
}
