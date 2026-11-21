// Every character in the game, drawn in code: the student, 14 fictional teachers
// (one per CDS1 floor), Leo the HKU lion, the guard and four visitors.

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

  // 1 Dr. Hello: warm young tutor, cardigan and lanyard
  prof1: { skin: SKIN.light, hair: HAIR.brown, hairStyle: "bob", top: "cardigan", topColor: "#e0a83c", shirt: "#f6f1e4", bottom: "trousers", bottomColor: "#6d6f7c", shoes: "#5a3d2b", acc: ["lanyard"], height: 114 },
  // 2 Dr. Plus: light blue shirt, round glasses, coffee
  prof2: { skin: SKIN.warm, hair: HAIR.black, hairStyle: "short", top: "shirt", topColor: "#9cc3e6", bottom: "trousers", bottomColor: "#b59a6a", shoes: "#4a3426", glasses: "round", acc: ["coffee"], height: 118 },
  // 3 Dr. Times: red sweater, curly hair
  prof3: { skin: SKIN.brown, hair: HAIR.dark, hairStyle: "curly", top: "sweater", topColor: "#c8473d", shirt: "#f6f1e4", bottom: "jeans", bottomColor: "#2f3e5e", shoes: "#e9e6dc", acc: ["book"], accColor: "#2f6fb0", height: 115 },
  // 4 Dr. Slash: teal polo, crew cut, laptop
  prof4: { skin: SKIN.tan, hair: HAIR.black, hairStyle: "crew", top: "polo", topColor: "#2b9a93", bottom: "trousers", bottomColor: "#2c3550", shoes: "#2a2530", acc: ["laptop"], height: 120, build: 2 },
  // 5 Dr. Loop: purple sweater vest, long hair, square glasses, skirt
  prof5: { skin: SKIN.pale, hair: HAIR.black, hairStyle: "long", top: "vest", topColor: "#7b4fa8", shirt: "#f6f1e4", bottom: "skirt", bottomColor: "#3b3550", shoes: "#2a2530", glasses: "square", glassesColor: "#b0303a", height: 113 },
  // 6 Dr. Bracket: grey blazer over a blue shirt, no tie, stubble
  prof6: { skin: SKIN.light, hair: HAIR.brown, hairStyle: "side", top: "blazer", topColor: "#9aa0ad", shirt: "#7fa6d6", bottom: "jeans", bottomColor: "#34486e", shoes: "#6a4630", beard: "stubble", acc: ["coffee"], height: 121 },
  // 7 Dr. Bool: navy blazer, auburn bun, glasses
  prof7: { skin: SKIN.light, hair: HAIR.auburn, hairStyle: "bun", top: "blazer", topColor: "#2d3c66", shirt: "#f6f1e4", bottom: "skirt", bottomColor: "#2d3c66", shoes: "#2a2530", glasses: "round", glassesColor: "#7a5a2a", acc: ["lanyard"], height: 114 },
  // 8 Dr. Else: sage sweater, full beard
  prof8: { skin: SKIN.deep, hair: HAIR.black, hairStyle: "crew", top: "sweater", topColor: "#7d9a74", shirt: "#f6f1e4", bottom: "trousers", bottomColor: "#5d4636", shoes: "#2a2530", beard: "full", acc: ["coffee"], height: 122, build: 2 },
  // 9 Dr. Range: research lab coat, ponytail
  prof9: { skin: SKIN.warm, hair: HAIR.black, hairStyle: "pony", top: "coat", topColor: "#eef0f2", shirt: "#6fb3c9", bottom: "trousers", bottomColor: "#39405a", shoes: "#e9e6dc", acc: ["laptop"], accColor: "#d9477a", height: 116 },
  // 10 Dr. While: tweed blazer and tie, receding hair, moustache
  prof10: { skin: SKIN.light, hair: HAIR.brown, hairStyle: "receding", top: "blazer", topColor: "#8a6a48", shirt: "#f1ead6", tie: "#2f6f66", bottom: "trousers", bottomColor: "#4b4038", shoes: "#3a2a22", glasses: "round", beard: "moustache", acc: ["book"], accColor: "#8e2f2f", height: 119, build: 2 },
  // 11 Prof. Stack: charcoal suit, red tie, grey side part
  prof11: { skin: SKIN.light, hair: HAIR.grey, hairStyle: "side", top: "suit", topColor: "#454a58", shirt: "#f3f3f0", tie: "#b3363c", bottom: "trousers", bottomColor: "#454a58", shoes: "#1f1c22", glasses: "square", senior: true, height: 121 },
  // 12 Prof. Cache: navy suit, silver bob, burgundy scarf
  prof12: { skin: SKIN.tan, hair: HAIR.silver, hairStyle: "bob", top: "suit", topColor: "#27375e", shirt: "#f3f3f0", bottom: "trousers", bottomColor: "#27375e", shoes: "#1f1c22", acc: ["scarf"], accColor: "#8e2f4a", senior: true, height: 116 },
  // 13 Prof. Kernel: dark brown suit, bald, white beard
  prof13: { skin: SKIN.brown, hair: HAIR.white, hairStyle: "bald", top: "suit", topColor: "#4a3528", shirt: "#f1ead6", tie: "#c99f2f", bottom: "trousers", bottomColor: "#4a3528", shoes: "#1f1c22", beard: "full", glasses: "round", glassesColor: "#c9a03a", senior: true, height: 118, build: 3 },
  // 14 Director Root: dark suit, HKU-green tie, silver hair
  prof14: { skin: SKIN.pale, hair: HAIR.silver, hairStyle: "side", top: "suit", topColor: "#1d2433", shirt: "#f6f6f2", tie: HKU_GREEN, bottom: "trousers", bottomColor: "#1d2433", shoes: "#121116", glasses: "square", glassesColor: "#8a8a96", senior: true, height: 124, build: 1 },

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
