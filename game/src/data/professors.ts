// The 14 challengers, one per CDS1 floor, plus the boss. All fictional: the team has not yet
// confirmed which real teachers agree to appear (docs/open-questions.md #13).

export interface Professor {
  floor: number;
  char: string;
  name: string;
  nameZh: string;
  /** what they teach, shown under the name */
  topic: string;
  /** one-line greeting before the battle */
  hello: string;
}

const P = (floor: number, name: string, nameZh: string, topic: string, hello: string): Professor => ({ floor, char: `prof${floor}`, name, nameZh, topic, hello });

export const PROFESSORS: Professor[] = [
  P(1, "Dr. Hello", "哈喽博士", "your first line of code", "Welcome to CDS! Let me show you how a battle works. It is just code."),
  P(2, "Dr. Plus", "加号博士", "operators", "Lecture theatre 2A is free. Show me you can add and subtract under pressure."),
  P(3, "Dr. Times", "乘号博士", "multiplication first", "Remember: times goes before plus. I hold the key to Building 5."),
  P(4, "Dr. Slash", "除号博士", "division", "Divide carefully. Never by zero."),
  P(5, "Dr. Loop", "循环博士", "for loops", "I repeat myself. I repeat myself. I repeat myself."),
  P(6, "Dr. Bracket", "括号博士", "brackets", "Classroom floor! (2 + 3) × 5 is not 2 + 3 × 5."),
  P(7, "Dr. Bool", "布尔博士", "comparisons", "True or false: you are ready for the lab floor?"),
  P(8, "Dr. Else", "否则博士", "if / else", "If you win, go up. Else, try again."),
  P(9, "Dr. Range", "范围博士", "range()", "Research lab. We count from zero here."),
  P(10, "Dr. While", "当循环博士", "while loops", "While you are still standing, I keep going."),
  P(11, "Prof. Stack", "栈教授", "thinking ahead", "Professor offices. Plan two moves ahead."),
  P(12, "Prof. Cache", "缓存教授", "remembering", "I remember every move you made downstairs."),
  P(13, "Prof. Kernel", "内核教授", "the core", "Few students reach the 13th floor. Impress me."),
  P(14, "Director Root", "院长 Root", "everything so far", "The exhibition lounge. One last check before the grand hall."),
];

export const LEO = { char: "leo", name: "Leo the HKU lion", nameZh: "港大狮子 Leo", topic: "final exam", hello: "ROAR! Welcome to the grand hall. Show me everything you learned in CDS1!" };

export function professor(floor: number): Professor {
  return PROFESSORS[Math.max(1, Math.min(14, floor)) - 1];
}
