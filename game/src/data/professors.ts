// The 14 challengers, one per CDS1 floor, plus Leo in the Grand Hall.
// Lineup: docs/professor-levels.md (Aretha, 2026-11-21). Names, titles and research fields are
// from that file; the lines they say are written for the game and are not quotes.
// Chinese names are not invented: the small label under the name is the field in Chinese.
//
// Story ("Light the Wall"): the welcome show on the Grand Hall LED wall is a program. Leo split
// it into 14 blocks and left one with each professor. A professor hands a block over to a
// student who shows they can read it.

export interface Professor {
  floor: number;
  char: string;
  name: string;
  /** the field in Chinese, shown small next to the name */
  nameZh: string;
  /** research field, shown under the name */
  topic: string;
  /** greeting before the battle */
  hello: string;
  /** said when the player wins and the program block is handed over */
  win: string;
}

const P = (floor: number, name: string, nameZh: string, topic: string, hello: string, win: string): Professor => ({ floor, char: `prof${floor}`, name, nameZh, topic, hello, win });

export const PROFESSORS: Professor[] = [
  P(
    1,
    "Dr. Alan Dougherty",
    "计算机视觉",
    "computer vision",
    "Welcome to CDS! Leo left the first block of the welcome program with me. A computer sees a picture as numbers, and a battle here is just numbers too. Let me show you how it works.",
    "That is all a program is: small blocks, run in order. Here is block 1 of the show, and an if block for your shields. You will need it upstairs.",
  ),
  P(
    2,
    "Dr. Shengzhi Qin (Brian)",
    "网络安全",
    "cybersecurity",
    "Security check! Nobody gets past the second floor without showing they can count under pressure.",
    "Access granted. Block 2 is yours, and so is the × block. Multiplying is how small numbers get big.",
  ),
  P(
    3,
    "Prof. Zhiyi Huang",
    "算法",
    "algorithms",
    "An algorithm is a recipe: the same steps, in the right order. So remember, times goes before plus.",
    "Right steps, right order. Block 3, and the key to Building 5. Take its lift: the gym is on 2/F, the study stair on 3/F.",
  ),
  P(
    4,
    "Prof. Jia Pan",
    "机器人",
    "robotics",
    "A robot does exactly what its program says, nothing more. Divide carefully, and never by zero.",
    "Precise, like a good robot arm. Block 4 and the ÷ block are yours.",
  ),
  P(
    5,
    "Prof. Taku Komura",
    "计算机动画",
    "animation",
    "Animation is one small move, repeated many times. My shield works the same way. Watch.",
    "Smooth! Block 5. From now on you carry one more shield block into every battle.",
  ),
  P(
    6,
    "Prof. Chenshu Wu",
    "智能感知",
    "sensing",
    "Sensors turn the world into numbers. Group them the right way: (2 + 3) × 5 is not 2 + 3 × 5.",
    "You sensed that one coming. Block 6 and the brackets are yours.",
  ),
  P(
    7,
    "Prof. Reynold Cheng",
    "不确定数据",
    "uncertain data",
    "Data is never certain, so we keep asking: true or false? Let us see how sure you are.",
    "Probably the best answer I have seen today. Block 7, and the if-smaller-than block.",
  ),
  P(
    8,
    "Prof. Chuan Wu",
    "计算机网络",
    "networks",
    "In a network every packet takes one path or the other. If you win, go up. Else, try again.",
    "Delivered, no packets lost. Block 8 and the if / else block.",
  ),
  P(
    9,
    "Prof. Heming Cui",
    "并行系统",
    "parallel systems",
    "My machines do many jobs at the same time. Can you keep up with one?",
    "Fast enough. Block 9, and a Red Bull for the long nights.",
  ),
  P(
    10,
    "Prof. Lequan Yu",
    "医学影像分析",
    "medical image analysis",
    "Reading a scan means looking again and again until you are sure. While you are still standing, I keep going.",
    "A clean result. Block 10 and the while block: it repeats as long as its test is true.",
  ),
  P(
    11,
    "Prof. Siu Ming Yiu",
    "信息安全",
    "security",
    "A good lock is a puzzle with one key. Plan two moves ahead.",
    "You found the key. Block 11, and one more shield block for every battle.",
  ),
  P(
    12,
    "Prof. Ruibang Luo",
    "生物信息学",
    "bioinformatics",
    "DNA is a very long program written with four letters. Yours has nine digits. Show me what you can write.",
    "Nicely sequenced. Block 12, and a gym session. Even coders need to move.",
  ),
  P(
    13,
    "Prof. Tak-Wah Lam",
    "算法与健康数据",
    "algorithms and health data",
    "Few students reach the 13th floor. A good algorithm does a lot with a little. Impress me.",
    "Efficient. Block 13, and a Red Bull. One floor left.",
  ),
  P(
    14,
    "Prof. Yi Ma",
    "计算机视觉与人工智能",
    "computer vision and AI",
    "The exhibition lounge, and the last block. Behind me HKU's milestones run from 1912 to 2024. Tonight you add a line of your own.",
    "You hold all 14 blocks. Leo is waiting in the Grand Hall. Go and light the wall.",
  ),
];

export const LEO = {
  char: "leo",
  name: "Leo the HKU lion",
  nameZh: "港大狮子 Leo",
  topic: "the final test",
  hello: "ROAR! You brought all 14 blocks. One last test before the wall lights up: run them against me, right here on the stage!",
  win: "ROAR! The wall is lit!",
};

export function professor(floor: number): Professor {
  return PROFESSORS[Math.max(1, Math.min(14, floor)) - 1];
}
