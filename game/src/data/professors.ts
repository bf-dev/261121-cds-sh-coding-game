// The 14 challengers, one per CDS1 floor, plus Leo in the Grand Hall.
// Lineup: docs/professor-levels.md (Aretha, 2026-11-21). Names, titles and research fields are
// from that file; the lines they say are written for the game and are not quotes.
// Chinese names are not invented: the small label under the name is the field in Chinese.
//
// Story (team voice note, 2026-11-21 afternoon): an AI has taken over CDS and left a bot in the
// lab on every floor. A professor tests the student in a block battle and certifies them for
// that floor; the certified student clears the lab and takes the block the bot was holding.

import type { Shield } from "../battle/rules";

export interface Professor {
  /** their own function: always the first shield they plant, and the block you win from them */
  signature?: { title: string; shield: Shield };
  floor: number;
  char: string;
  name: string;
  /** the field in Chinese, shown small next to the name */
  nameZh: string;
  /** research field, shown under the name */
  topic: string;
  /** greeting before the battle */
  hello: string;
  /** said when the player wins and is certified for the floor */
  win: string;
}

const P = (floor: number, name: string, nameZh: string, topic: string, hello: string, win: string): Professor => ({ floor, char: `prof${floor}`, name, nameZh, topic, hello, win });

export const PROFESSORS: Professor[] = [
  P(
    1,
    "Dr. Alan Dougherty",
    "计算机视觉",
    "computer vision",
    "There you are! The bots are in every lab, and I will not send a student in unprepared. A computer sees a picture as numbers, and a battle here is just numbers too. Show me what Leo taught you.",
    "That is all a program is: small blocks, run in order. You are certified for 1/F. The lab is through the cafe, and its bot is sitting on my Round Off block.",
  ),
  P(
    2,
    "Dr. Shengzhi Qin (Brian)",
    "网络安全",
    "cybersecurity",
    "Security check! Nobody gets past the second floor without showing they can count under pressure. Today least of all.",
    "Access granted. Certified for 2/F. The bot in this floor's lab took my Security Check, an if block, and the × block. Go and get them back.",
  ),
  P(
    3,
    "Prof. Zhiyi Huang",
    "算法",
    "algorithms",
    "An algorithm is a recipe: the same steps, in the right order. So remember, times goes before plus.",
    "Right steps, right order. Certified for 3/F. The bot in the lab here has the key card to Building 5: gym on 2/F, study stair on 3/F.",
  ),
  P(
    4,
    "Prof. Jia Pan",
    "机器人",
    "robotics",
    "A robot does exactly what its program says, nothing more. Divide carefully, and never by zero.",
    "Precise, like a good robot arm. Unlike the one loose in my lab. Certified for 4/F. The ÷ block is in there.",
  ),
  P(
    5,
    "Prof. Taku Komura",
    "计算机动画",
    "animation",
    "Animation is one small move, repeated many times. My shield works the same way. Watch.",
    "Smooth! Certified for 5/F. Clear the lab and you carry one more shield block into every battle.",
  ),
  P(
    6,
    "Prof. Chenshu Wu",
    "智能感知",
    "sensing",
    "Sensors turn the world into numbers. Group them the right way: (2 + 3) × 5 is not 2 + 3 × 5.",
    "You sensed that one coming. Certified for 6/F. The brackets are in the lab.",
  ),
  P(
    7,
    "Prof. Reynold Cheng",
    "不确定数据",
    "uncertain data",
    "Data is never certain, so we keep asking: true or false? Let us see how sure you are.",
    "Probably the best answer I have seen today. Certified for 7/F. The if-smaller-than block is in the lab.",
  ),
  P(
    8,
    "Prof. Chuan Wu",
    "计算机网络",
    "networks",
    "In a network every packet takes one path or the other. If you win, go up. Else, try again.",
    "Delivered, no packets lost. Certified for 8/F. The lab has the if / else block.",
  ),
  P(
    9,
    "Prof. Heming Cui",
    "并行系统",
    "parallel systems",
    "My machines do many jobs at the same time. Can you keep up with one?",
    "Fast enough. Certified for 9/F. The bot in the lab has been hoarding our Red Bull.",
  ),
  P(
    10,
    "Prof. Lequan Yu",
    "医学影像分析",
    "medical image analysis",
    "Reading a scan means looking again and again until you are sure. While you are still standing, I keep going.",
    "A clean result. Certified for 10/F. The lab holds the while block: it repeats as long as its test is true.",
  ),
  P(
    11,
    "Prof. Siu Ming Yiu",
    "信息安全",
    "security",
    "A good lock is a puzzle with one key. Plan two moves ahead.",
    "You found the key. Certified for 11/F. One more shield block is waiting in the lab.",
  ),
  P(
    12,
    "Prof. Ruibang Luo",
    "生物信息学",
    "bioinformatics",
    "DNA is a very long program written with four letters. Yours has nine digits. Show me what you can write.",
    "Nicely sequenced. Certified for 12/F. My len() block and a gym pass are in the lab. Even coders need to move.",
  ),
  P(
    13,
    "Prof. Tak-Wah Lam",
    "算法与健康数据",
    "algorithms and health data",
    "Few students reach the 13th floor. A good algorithm does a lot with a little. Impress me.",
    "Efficient. Certified for 13/F. My sorted() block and a Red Bull are in the lab. One floor left.",
  ),
  P(
    14,
    "Prof. Yi Ma",
    "计算机视觉与人工智能",
    "computer vision and AI",
    "The exhibition lounge, and the last floor. Behind me HKU's milestones run from 1912 to 2024. Tonight you add a line of your own.",
    "All 14 floors certified. Take my filter() block from the lab, then go down to the Grand Hall. The AI is hiding there, and it still has Leo.",
  ),
];

export const LEO = {
  char: "leo",
  name: "Leo the HKU lion",
  nameZh: "港大狮子 Leo",
  topic: "the final test",
  hello: "AI> You cleared my bots from 14 floors. Not bad, for a student. The lion and the wall stay with me. Run your blocks, if you still have any.",
  win: "ROAR! I am back!",
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
