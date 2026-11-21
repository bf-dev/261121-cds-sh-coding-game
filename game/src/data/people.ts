// What the people on campus say when you talk to them.
// The people are made up for the game (proposal, builder 2026-11-21, after Insung: "make students on
// the bldg 5 talk with box and w/ story"). The story they tell is docs/visitor-journey-story.md: an
// invited visitor, the High Table welcome dinner, 14 mentors, Leo's final challenge. The places they
// mention are the ones in buildings/b5/.

import type { Progress } from "../state";

export interface Person {
  name: string;
  role: string;
  say: (p: Progress) => string[];
}

/** where the visitor is in the story: 0 dinner, 1 first stamps, 2 key card, 3 all 14 stamps, 4 CDS Explorer */
const stage = (p: Progress): number => (p.bossBeaten ? 4 : p.cleared >= 14 ? 3 : p.cleared >= 3 ? 2 : p.cleared >= 1 ? 1 : 0);
const by = (lines: string[][]) => (p: Progress) => lines[Math.min(stage(p), lines.length - 1)];

export const PEOPLE: Record<string, Person> = {
  "b5-host": {
    name: "Mei",
    role: "Student host",
    say: by([
      [
        "Welcome to the High Table dinner! I am Mei, a second-year student, and I am your host tonight.",
        "Every guest gets a stamp card. In the CDS-1 tower there are 14 mentors, one on each floor. Each of them teaches you one coding block and stamps your card.",
        "Start with Dr. Dougherty in the CDS-1 lobby. Leave by the glass door and walk south across the plaza. Your guide knows the way.",
      ],
      ["Your first stamps! Keep climbing. Stamp 3 comes with a key card for the rest of this building: the gym, the music room and the study floors."],
      ["Your key card works now. Take our lift or the white stair. The gym on 2/F and the study stair on 3/F both help you in the challenges.", "And keep some energy. Leo only comes out for guests with all 14 stamps."],
      ["All 14 stamps! Leo is waiting on the Grand Hall stage. Take the CDS-1 lift and choose Grand Hall. All of us will be in the seats."],
      ["Here is our CDS Explorer! We cheered so loudly that the hall wall shook. Come back for dinner any time."],
    ]),
  },
  "b5-visitor-1": {
    name: "Sam",
    role: "Guest",
    say: by([
      ["I am a guest too. My sister studies here, and I have never written a line of code.", "She says code is small steps in the right order, like a recipe. I will try the first floor after dessert."],
      ["You met the first mentor? So ATTACK takes HP off and HEAL gives it back. That much I understand now."],
      ["I got stuck on the floor with the × block. Then somebody told me that times goes before plus: 2 + 3 × 4 is 14, not 20."],
      ["You have every stamp? Then I am coming to the Grand Hall to watch."],
      ["I watched your final challenge from the third row. Next year I am applying."],
    ]),
  },
  "b5-visitor-2": {
    name: "Jun",
    role: "First-year student",
    say: by([
      ["These long tables are for the High Table dinner, an HKU tradition. Students and professors eat together and talk.", "The professors are friendly. Their challenges are short: you build a move from number blocks, and they answer with a shield."],
      ["A tip from a first-year: a shield is a small program. Read what it does before you attack."],
      ["A loop shield takes a little off, many times. An if shield only wakes up for a big hit. So sometimes a small ATTACK gets through where a big one does not."],
      ["Leo uses every kind of shield you have seen. You know them all by now."],
      ["I knew you would pass. Welcome to the family."],
    ]),
  },
  "b5-diner-1": {
    name: "Lin",
    role: "Exchange student",
    say: by([
      ["I arrived last month. On my first evening I sat at this table next to a professor, and we talked about robots until the tea was cold.", "Nobody here expects you to know code already. You learn one block at a time."],
      ["Did you see the postcards? Every mentor gives you one. I pin mine above my desk."],
      ["The lab doors in CDS-1 are open after each challenge. There is a small game in each one. Tower of Hanoi took me eleven moves the first time. Seven is the best."],
      ["Fourteen postcards! Only Leo is left."],
      ["Show me the certificate! CDS Explorer. It suits you."],
    ]),
  },
  "b5-guard": {
    name: "Receptionist",
    role: "Building 5 front desk",
    say: (p) =>
      p.b5key
        ? ["Your key card is active. The lift and the white stair take you up: gym and music room on 2/F, study floors from 3/F to 5/F."]
        : ["Good evening, and welcome. The Galleria on this floor is open to every guest tonight.", "The lift and the stair need a key card. Prof. Huang on CDS-1 3/F hands one out together with his stamp."],
  },
  "b5-visitor-3": {
    name: "Pianist",
    role: "Music room regular",
    say: () => ["I play the same four bars again and again until they are right.", "Coders call that a loop: repeat 4 times, play the bars. Your repeat block works the same way."],
  },
  "b5-visitor-4": {
    name: "Gym regular",
    role: "Student",
    say: () => ["Three sets of ten. A loop inside a loop!", "Stop at the gym before a hard floor. In a challenge, a gym session gives you a third of your HP back."],
  },
  "b5-visitor-1b": {
    name: "Student",
    role: "On a break",
    say: () => ["This floor is where we rest: table tennis in the Game Hub, the music room, the multipurpose room.", "Even coders need a break. A rested head finds bugs faster."],
  },
  "b5-3-reader": {
    name: "Student",
    role: "Study stair regular",
    say: () => ["The timber study stair is my favourite seat. Sit down there and you learn something new for your shields.", "It works once for every floor you clear in CDS-1, so come back between challenges."],
  },
  "b5-3-student": {
    name: "Student",
    role: "Debugging",
    say: () => ["My program says 2 + 3 × 5 is 17. I wanted 25.", "Brackets fixed it: (2 + 3) × 5. The computer always does × first, unless you group the numbers."],
  },
  "b5-4-student": {
    name: "Student",
    role: "Group project",
    say: () => ["The meeting rooms up here are for group projects. We book one, fill the whiteboard, and argue about what to call our variables."],
  },
  "b5-4-visitor": {
    name: "Guest",
    role: "From the dinner",
    say: (p) => [p.bossBeaten ? "I saw you on the Grand Hall stage. Leo roared, and then he smiled." : "I came for the dinner and stayed to look around. Have you met Leo yet? Everyone says he is friendlier than he sounds."],
  },
  "b5-5-student": {
    name: "Student",
    role: "Top study floor",
    say: () => ["It is quiet up here, so I can think about my if blocks: if the hit is big, block it, else let it through."],
  },
  "b5-5-reader": {
    name: "Reader",
    role: "Student",
    say: () => ["I am reading about data. A list of numbers is not much until you sort it, filter it or count it.", "The mentors on the top floors of CDS-1 teach exactly those three."],
  },
};
