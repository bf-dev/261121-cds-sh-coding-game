// The lab on each CDS-1 floor and the postcard of that floor.
// Team direction (voice note, 2026-11-21 afternoon): beating the professor gives a postcard and
// access to the floor's lab; the new block comes from the lab, after a puzzle.
// In the story the AI left one bot in every lab. The bot asks one question about the block it
// holds. Answer it and the bot shuts down.
// Postcard facts come from buildings/cds1/README.md, buildings/outside/README.md and the lift
// floor guide. Nothing here is invented about the campus.

import { h } from "../ui/dom";
import { moveBlock, shieldBlock } from "../battle/blocks";

export interface Lab {
  /** what the bot is called */
  bot: string;
  /** the question */
  q: string;
  /** the blocks the question is about */
  picture?: () => HTMLElement;
  options: string[];
  answer: number;
  /** shown after a wrong answer */
  hint: string;
  /** shown after the right answer */
  why: string;
}

const code = (text: string) => () => h("div", { class: "pybox" }, h("pre", {}, text));

export const LABS: Record<number, Lab> = {
  1: {
    bot: "ROUND-BOT",
    q: "The ATTACK is 7. This shield halves it, then rounds to a whole number. How much damage gets through?",
    picture: () => shieldBlock({ kind: "round", a: 0, b: 0 }),
    options: ["3", "4", "7"],
    answer: 1,
    hint: "7 ÷ 2 is 3.5. round() goes to the nearest whole number.",
    why: "7 ÷ 2 = 3.5, and round(3.5) is 4. A function takes a value in and gives a value back.",
  },
  2: {
    bot: "CHECK-BOT",
    q: "The ATTACK is 8. What is damage after this block runs?",
    picture: () => shieldBlock({ kind: "ifgt", a: 5, b: 4 }),
    options: ["8", "4", "3"],
    answer: 1,
    hint: "Is 8 bigger than 5? If the test is true, the block inside runs.",
    why: "8 > 5 is true, so the block inside runs: 8 - 4 = 4. With an ATTACK of 5 or less, nothing would happen.",
  },
  3: {
    bot: "ORDER-BOT",
    q: "What does this move come to?",
    picture: () => moveBlock({ verb: "ATTACK", digits: [8, 2, 3], ops: ["+", "×"] }),
    options: ["30", "14", "13"],
    answer: 1,
    hint: "× runs before +, wherever it stands.",
    why: "2 × 3 runs first and makes 6, then 8 + 6 = 14. Every programming language follows this order.",
  },
  4: {
    bot: "DIVIDE-BOT",
    q: "What does this move come to?",
    picture: () => moveBlock({ verb: "ATTACK", digits: [8, 2, 5], ops: ["÷", "+"] }),
    options: ["9", "1", "4"],
    answer: 0,
    hint: "÷ runs before +.",
    why: "8 ÷ 2 runs first and makes 4, then 4 + 5 = 9.",
  },
  5: {
    bot: "LOOP-BOT",
    q: "How much damage does this shield take away in total?",
    picture: () => shieldBlock({ kind: "for1", a: 3, b: 2 }),
    options: ["2", "5", "6"],
    answer: 2,
    hint: "The block inside runs once for every repeat.",
    why: "The block inside runs 3 times, and each run takes 2 away: 3 × 2 = 6. In Python this is a for loop.",
  },
  6: {
    bot: "BRACKET-BOT",
    q: "What does this move come to?",
    picture: () => moveBlock({ verb: "ATTACK", digits: [2, 3, 5], ops: ["+", "×"], bracket: [0, 1] }),
    options: ["17", "25", "10"],
    answer: 1,
    hint: "Whatever is inside the brackets runs first.",
    why: "The brackets run first: 2 + 3 = 5, then 5 × 5 = 25. Without them it would be 2 + 15 = 17.",
  },
  7: {
    bot: "SMALL-BOT",
    q: "The ATTACK is 9. What is damage after this block runs?",
    picture: () => shieldBlock({ kind: "iflt", a: 7, b: 0 }),
    options: ["0", "9", "2"],
    answer: 1,
    hint: "Is 9 smaller than 7?",
    why: "9 < 7 is false, so the block inside is skipped and all 9 gets through. This shield only stops small hits.",
  },
  8: {
    bot: "FORK-BOT",
    q: "The ATTACK is 4. What is damage after this block runs?",
    picture: () => shieldBlock({ kind: "ifelse", a: 6, b: 8, c: 2 }),
    options: ["0", "2", "4"],
    answer: 1,
    hint: "4 > 6 is false, so the else path runs.",
    why: "4 > 6 is false, so the else block runs: 4 - 2 = 2. An if / else always takes exactly one of its two paths.",
  },
  9: {
    bot: "COUNT-BOT",
    q: "How many times does the indented line run?",
    picture: code("for i in range(3):\n    damage -= 2"),
    options: ["2 times", "3 times", "4 times"],
    answer: 1,
    hint: "range(3) counts 0, 1, 2.",
    why: "range(3) counts 0, 1, 2: three rounds. It is the repeat block, written in Python.",
  },
  10: {
    bot: "WHILE-BOT",
    q: "The ATTACK is 30. What is damage when this loop stops?",
    picture: () => shieldBlock({ kind: "while", a: 2, b: 3 }),
    options: ["21", "18", "20"],
    answer: 1,
    hint: "It keeps taking 3 away while damage is still above 20: 30, 27, 24, 21, ...",
    why: "30, 27, 24, 21 are all above 20, so the loop runs four times and stops at 18. A while loop checks its test before every round.",
  },
  11: {
    bot: "PLAN-BOT",
    q: "Which part of this move runs first?",
    picture: () => moveBlock({ verb: "ATTACK", digits: [6, 2, 2], ops: ["-", "×"] }),
    options: ["6 - 2", "2 × 2", "left to right"],
    answer: 1,
    hint: "× and ÷ run before + and -.",
    why: "2 × 2 runs first and makes 4, then 6 - 4 = 2. Put the × where it helps you most.",
  },
  12: {
    bot: "LENGTH-BOT",
    q: "What does this give back?",
    picture: code("len([8, 2, 3])"),
    options: ["13", "3", "8"],
    answer: 1,
    hint: "len() counts the items. It does not add them up.",
    why: "The list holds three numbers, so len() gives 3. A longer ATTACK feeds this shield more.",
  },
  13: {
    bot: "SORT-BOT",
    q: "What does this give back?",
    picture: code("sorted([6, 2, 4])"),
    options: ["[6, 4, 2]", "[2, 4, 6]", "[6, 2, 4]"],
    answer: 1,
    hint: "sorted() puts the smallest first.",
    why: "sorted() gives the same numbers in rising order: [2, 4, 6]. The middle one is 4.",
  },
  14: {
    bot: "FILTER-BOT",
    q: "Which numbers from [8, 2, 3] pass a filter that keeps numbers bigger than 4?",
    picture: () => shieldBlock({ kind: "filter", a: 4, b: 0 }),
    options: ["[2, 3]", "[8]", "[8, 2, 3]"],
    answer: 1,
    hint: "Check each number by itself: is it bigger than 4?",
    why: "Only 8 is bigger than 4, so the filter keeps [8]. Small numbers slip under this shield.",
  },
};

export interface Postcard {
  title: string;
  zh: string;
  fact: string;
}

export const POSTCARDS: Record<number, Postcard> = {
  1: { title: "The lobby", zh: "大堂", fact: "A tan stone wall carries the HKU crest and the school's name. Next door is a round cafe with red diamond tiles in a white floor, and lecture theatres 1A and 1B." },
  2: { title: "Lecture theatres 2A and 2B", zh: "演讲厅 2A / 2B", fact: "Two more lecture theatres and a student lounge. HKU was founded in Hong Kong in 1911. The glass doors downstairs still say Est. 1911." },
  3: { title: "Lecture theatres 3A and 3B", zh: "演讲厅 3A / 3B", fact: "The last pair of lecture theatres, and the first teaching lab. The address of the campus is No. 500 Fangchun Road, Zhangjiang, Pudong." },
  4: { title: "Teaching and learning lab", zh: "教学实验室", fact: "The lift panel reads 14 at the top and B3 at the bottom. Each car carries 21 people." },
  5: { title: "Classrooms and student zone", zh: "教室与学生活动区", fact: "Building 5, north of this tower, is the student amenity centre: sports, study and co-creation space, open 7 days a week." },
  6: { title: "Classrooms and teamwork space", zh: "教室与团队协作区", fact: "Room numbers here are etched in hollow outline digits with a small door-handle doodle. Room 604 is a gym with treadmills behind a glass wall." },
  7: { title: "Teaching lab and classrooms", zh: "教学实验室与教室", fact: "Four roads frame the campus: Zuchongzhi Road to the north, Jidian Road to the south, Jichuang Road to the west and Fangchun Road to the east." },
  8: { title: "Research lab", zh: "科研实验室", fact: "From here up the floors belong to research. Across the plaza stands CDS-2, a tower that looks almost the same as this one." },
  9: { title: "Research lab", zh: "科研实验室", fact: "On the lawn below, big white HKU letters stand next to Leo, the lion mascot. Most visitors take their first photo there." },
  10: { title: "Research lab", zh: "科研实验室", fact: "Students pick up food at the yellow Meituan lockers east of the tower, across the service road. Fangchun Road runs behind them." },
  11: { title: "Professor offices", zh: "教授办公室", fact: "The school's full name is the HKU School of Computing and Data Science. In Chinese: 香港大学计算与数据科学学院." },
  12: { title: "Professor offices", zh: "教授办公室", fact: "A deck on round white columns links the two towers at second-floor height, with a round opening through it." },
  13: { title: "Professor offices and lounge", zh: "教授办公室与休息区", fact: "The professors' floor has a lounge of its own. HKU's motto is Sapientia et Virtus: wisdom and virtue." },
  14: { title: "Exhibition lounge", zh: "展览厅", fact: "The top floor holds the director's office and an exhibition lounge, where a timeline wall runs through HKU's milestones from 1912 to 2024." },
};
