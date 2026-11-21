// The 14 challengers, one per CDS-1 floor, plus Leo in the Grand Hall.
// Lineup: docs/professor-levels.md (Aretha, 2026-11-21). Names, titles and research fields are
// from that file; the lines they say are written for the game and are not quotes.
// Chinese names are the ones HKU publishes (cs.hku.hk and ai.hku.hk staff lists, HKU media directory,
// HKU's bilingual profile for Prof. Komura; checked 2026-11-21), written in simplified characters like
// the rest of the game. HKU publishes no Chinese name for Dr. Dougherty, so he has none here.
//
// Story (docs/visitor-journey-story.md, Aretha, 2026-11-21): the player is an invited visitor. The
// professors are mentors: each one sets a short block challenge and gives a stamp, a postcard and
// the floor's new block. Leo is the friendly final examiner.

import type { Shield } from "../battle/rules";

export interface Professor {
  /** their own function: always the first shield they plant, and the block you win from them */
  signature?: { title: string; shield: Shield };
  floor: number;
  char: string;
  name: string;
  /** the name in Chinese as HKU publishes it, shown small next to the name; empty when HKU gives none */
  nameZh: string;
  /** research field, shown under the name */
  topic: string;
  /** greeting before the battle */
  hello: string;
  /** said when the player completes the challenge */
  win: string;
}

const P = (floor: number, name: string, nameZh: string, topic: string, hello: string, win: string): Professor => ({ floor, char: `prof${floor}`, name, nameZh, topic, hello, win });

export const PROFESSORS: Professor[] = [
  P(
    1,
    "Dr. Alan Dougherty",
    "",
    "computer vision",
    "Welcome to CDS-1! I am your first mentor. A computer sees a picture as numbers, and a challenge here is just numbers too. Let me show you how it works, one step at a time.",
    "That is all a program is: small blocks, run in order. Challenge completed! Here is stamp 1, and my Round Off block. It needs no numbers, so keep it for when yours run out.",
  ),
  P(
    2,
    "Dr. Shengzhi Qin (Brian)",
    "秦圣智",
    "cybersecurity",
    "Security check! Nobody gets past the second floor without showing they can count under pressure.",
    "Access granted. Stamp 2 is yours, with my Security Check, an if block, and the × block. Multiplying is how small numbers get big.",
  ),
  P(
    3,
    "Prof. Zhiyi Huang",
    "黄志毅",
    "algorithms",
    "An algorithm is a recipe: the same steps, in the right order. So remember, times goes before plus.",
    "Right steps, right order. Stamp 3, and the key card to Building 5. Take its lift: the gym is on 2/F, the study stair on 3/F.",
  ),
  P(
    4,
    "Prof. Jia Pan",
    "潘佳",
    "robotics",
    "A robot does exactly what its program says, nothing more. Divide carefully, and never by zero.",
    "Precise, like a good robot arm. Stamp 4 and the ÷ block are yours.",
  ),
  P(
    5,
    "Prof. Taku Komura",
    "幸村琢",
    "animation",
    "Animation is one small move, repeated many times. My shield works the same way. Watch.",
    "Smooth! Stamp 5. From now on you carry one more shield block into every challenge.",
  ),
  P(
    6,
    "Prof. Chenshu Wu",
    "吴陈沭",
    "sensing",
    "Sensors turn the world into numbers. Group them the right way: (2 + 3) × 5 is not 2 + 3 × 5.",
    "You sensed that one coming. Stamp 6 and the brackets are yours.",
  ),
  P(
    7,
    "Prof. Reynold Cheng",
    "郑振刚",
    "uncertain data",
    "Data is never certain, so we keep asking: true or false? Let us see how sure you are.",
    "Probably the best answer I have seen today. Stamp 7, and the if-smaller-than block.",
  ),
  P(
    8,
    "Prof. Chuan Wu",
    "吴川",
    "networks",
    "In a network every packet takes one path or the other. If you win, go up. Else, try again.",
    "Delivered, no packets lost. Stamp 8 and the if / else block.",
  ),
  P(
    9,
    "Prof. Heming Cui",
    "崔鹤鸣",
    "parallel systems",
    "My machines do many jobs at the same time. Can you keep up with one?",
    "Fast enough. Stamp 9, and a Red Bull for the long nights.",
  ),
  P(
    10,
    "Prof. Lequan Yu",
    "于乐全",
    "medical image analysis",
    "Reading a scan means looking again and again until you are sure. While you are still standing, I keep going.",
    "A clean result. Stamp 10 and the while block: it repeats as long as its test is true.",
  ),
  P(
    11,
    "Prof. Siu Ming Yiu",
    "姚兆明",
    "security",
    "A good lock is a puzzle with one key. Plan two moves ahead.",
    "You found the key. Stamp 11, and one more shield block for every challenge.",
  ),
  P(
    12,
    "Prof. Ruibang Luo",
    "罗锐邦",
    "bioinformatics",
    "DNA is a very long program written with four letters. Yours has nine digits. Show me what you can write.",
    "Nicely sequenced. Stamp 12, my len() block, and a gym session. Even coders need to move.",
  ),
  P(
    13,
    "Prof. Tak-Wah Lam",
    "林德华",
    "algorithms and health data",
    "Few students reach the 13th floor. A good algorithm does a lot with a little. Impress me.",
    "Efficient. Stamp 13, my sorted() block, and a Red Bull. One floor left.",
  ),
  P(
    14,
    "Prof. Yi Ma",
    "马毅",
    "computer vision and AI",
    "The exhibition lounge, and the last floor. Behind me HKU's milestones run from 1912 to 2024. Tonight you add a line of your own.",
    "All 14 stamps, and my filter() block too. Leo is waiting in the Grand Hall with your final challenge. Go and show him what you learned.",
  ),
];

export const LEO = {
  char: "leo",
  name: "Leo the HKU lion",
  nameZh: "",
  topic: "the final test",
  hello: "ROAR! You collected all 14 stamps. One friendly final challenge before you graduate as a CDS Explorer: run your blocks against me, right here on the stage!",
  win: "ROAR! Congratulations, CDS Explorer!",
};

// the five professors with a shield of their own (functions from docs/professor-levels.md)
PROFESSORS[0].signature = { title: "Round Off", shield: { kind: "round", a: 0, b: 0 } };
PROFESSORS[1].signature = { title: "Security Check", shield: { kind: "ifgt", a: 5, b: 4 } };
PROFESSORS[11].signature = { title: "Sequence Length", shield: { kind: "len", a: 5, b: 0 } };
PROFESSORS[12].signature = { title: "Order the Options", shield: { kind: "sorted", a: 6, b: 2, c: 4 } };
PROFESSORS[13].signature = { title: "Pattern Filter", shield: { kind: "filter", a: 4, b: 0 } };

export function professor(floor: number): Professor {
  return PROFESSORS[Math.max(1, Math.min(14, floor)) - 1];
}
