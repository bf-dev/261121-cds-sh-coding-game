// Shared contracts between the engine, the maps and the character art.

export const TILE = 64;
export const VIEW_W = 1920;
export const VIEW_H = 1080;

export type Dir = "down" | "up" | "left" | "right";

/** A y-sorted object standing on the map (tree, desk, facade, sign...). */
export interface Prop {
  sprite: HTMLCanvasElement;
  /** world px of the sprite's top-left corner */
  x: number;
  y: number;
  /** world px used for depth sorting; defaults to y + sprite.height (the sprite's foot line) */
  sortY?: number;
  /** fade the sprite when the player walks behind it (towers, tall trees) */
  fade?: boolean;
}

export type PowerUpKind = "gym" | "study" | "food" | "redbull";

/** What happens when the player uses a trigger or talks to an NPC. */
export type Action =
  | { type: "goto"; map: string; spawn: string; requires?: "b5key" | "hallpass" }
  | { type: "lab" } // the floor's lab: a puzzle that hands out the floor's new block once the professor is beaten
  | { type: "lift"; building?: "b5" } // opens the floor picker: CDS-1 by default, Building 5 with building "b5"
  | { type: "battle"; floor: number } // the professor of CDS-1 floor n (1..14)
  | { type: "boss" } // Leo, grand hall
  | { type: "powerup"; kind: PowerUpKind }
  | { type: "info"; title: string; titleZh: string; text: string } // a real campus detail to discover
  | { type: "talk" }; // a person with something to say (data/people.ts)

export interface Trigger {
  id: string;
  /** tile rectangle the player must stand in (or touch) */
  tx: number;
  ty: number;
  w: number;
  h: number;
  /** short bilingual prompt shown on the action button, e.g. "Enter CDS-1" / "进入一号楼" */
  en: string;
  zh: string;
  /** fire as soon as the player steps in (doors). Otherwise needs the action key. */
  auto?: boolean;
  action: Action;
}

export interface NpcDef {
  id: string;
  /** character id for art/characters.ts getCharacter(): "student", "prof1".."prof14", "leo", "guard", "visitor1".. */
  char: string;
  /** tile the NPC stands on (feet) */
  tx: number;
  ty: number;
  dir: Dir;
  name: string;
  nameZh: string;
  action?: Action;
}

export interface MapLabel {
  /** world px of the label's bottom-centre */
  x: number;
  y: number;
  en: string;
  zh: string;
}

export interface GameMap {
  id: string;
  name: string;
  nameZh: string;
  cols: number;
  rows: number;
  /** prerendered floor layer, cols*TILE x rows*TILE */
  ground: HTMLCanvasElement;
  /** cols*rows, 1 = cannot walk. Index = ty * cols + tx */
  solid: Uint8Array;
  props: Prop[];
  npcs: NpcDef[];
  triggers: Trigger[];
  /** named spawn points in tile coordinates */
  spawns: Record<string, { tx: number; ty: number; dir: Dir }>;
  labels?: MapLabel[];
  /** animated extras in world coordinates. under = after ground, before props. over = above everything. */
  drawUnder?: (ctx: CanvasRenderingContext2D, timeMs: number) => void;
  drawOver?: (ctx: CanvasRenderingContext2D, timeMs: number) => void;
  /** ambient tint drawn over the scene, e.g. "rgba(20,10,0,0.25)" for a dim hall */
  tint?: string;
}

/** 64 x 128 frames; feet at the bottom centre. 4 frames per direction (stand, step, stand, step). */
export interface CharSheet {
  frames: Record<Dir, HTMLCanvasElement[]>;
  /** large bust for the battle screen, 320 x 320, facing the viewer */
  portrait: HTMLCanvasElement;
  /** sprite size, default 64 x 128. Leo may be bigger. */
  w: number;
  h: number;
}
