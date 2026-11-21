# build the game (one shot)

The plan from the meeting: collect everything in this repo, then hand the whole repo to a strong model and let it build the game in one go (27:06, 29:07). Clone the repo, open Claude Code in the root, paste the block below.

```
You are building a playable game for a hackathon demo at 4 pm today (HKU CDS Shanghai, theme "Your campus, your game"). This repo is the full brief.

Read, in this order:
1. CLAUDE.md, then docs/overview.md and docs/hackathon-brief.md.
2. docs/decisions.md. It is binding. Part 4 of the meeting overrides parts 1 and 2; the "replaced" table lists the old rules you must NOT build.
3. docs/game-flow.md, docs/cards-digits.md, docs/cards-math.md, docs/cards-cs-logic.md, docs/cards-power-ups.md, docs/progression-and-story.md, docs/education.md, docs/avatars.md.
4. docs/art-style.md and the two images in docs/art-reference/.
5. buildings/README.md, then each buildings/*/README.md. Look at the keyframes it points to.
docs/open-questions.md lists what is not decided. Where you must choose, use the defaults below, and list every choice in game/DESIGN-CHOICES.md.

Do not open the videos in resources/videos/. buildings/ already has the keyframes and descriptions taken from them. Open a video only if buildings/ is missing something you need, and say so in DESIGN-CHOICES.md.

Goal: a coding education card-battle game on the real HKU CDS Shanghai campus, for first-time visitors of any age (offer holders and their families). A visitor should recognise the campus and learn what a for loop and an if do, in a few minutes.

Must have:
1. Campus you can walk: the outdoor site from buildings/outside/ (plaza, lawn with the lion and HKU letters, sunken round plaza, footbridge, monument sign, lockers) and the CDS1 entrance and 1/F lobby from buildings/cds1/. The player is a student and starts outside CDS1.
2. Art per docs/art-style.md: the 3/4 top-down view and mood of insu.ng/zhangjiang, but much bigger and more detailed. 64 x 64 px tiles, characters about 64 x 128 px with 4-direction walk cycles, 6 to 10 shade ramps per material, cast shadows, every window bay and sign drawn from the keyframes, about 30 x 17 tiles visible at 1920 x 1080. Hard pixel edges, no photo textures, no blur. Use the colour ramps in the buildings READMEs. Bilingual labels (English + 中文).
3. Battle, exactly as in docs/decisions.md #4 to #17:
   - HEAL and ATTACK are base buttons, always available.
   - A move is HEAL or ATTACK, one base digit (1 to 9, no zero), then operators from your random hand: `ATTACK 8 + 2 × 3` = 14. Normal precedence, brackets allowed.
   - Each round the opponent plants a shield, which must be a function: `for range 3: -2` takes 6 off an ATTACK; `if damage > 5: -5`. HEAL ignores the shield. Then the roles swap.
   - Digits and operators are random and replaced after use. Reject any expression that makes a zero divisor.
   - Power-ups are played at the start of a round, before the move (extra turn, extra HP).
   - Show the move as real code while it is built and evaluated, e.g. `damage = 8 + 2 * 3  # 14`, and the shield as `for i in range(3): damage -= 2`.
   - A pop-up explains every new card the first time you get it (what it does, what it equals).
4. Levels per docs/progression-and-story.md: CDS1 floors are levels 1 to 14, with harder professors higher up and more operator slots as you climb (start at 2). Lift between floors. Use the real floors from buildings/cds1/ (1/F lobby, 6/F, 13/F, 14/F); for floors with no footage, reuse those layouts and change the signage to match the floor guide in buildings/cds1/README.md. After floor 14: the grand hall and the final boss, Leo the HKU lion (look in buildings/outside/ for the lion).
5. Building 5 (buildings/b5/) is where you get power-ups and new functions: gym = extra HP, study stair / learning commons = new function card, food (the Meituan lockers, cafe) = heal. How the player gets in is open (docs/open-questions.md); default below.
6. The first battle is a step-by-step tutorial (docs/education.md, prompts/tutorial-for-visitors.md).
7. The AI opponent uses an OpenAI-compatible endpoint from .env: LLM_BASE_URL, LLM_API_KEY, LLM_MODEL (the lab's DeepSeek V4.1 Flash). Professors explain their move in one line. If the call fails, is slow (over 2 s) or returns an illegal move, play a rule-based move. Ship .env.example, never a real key.
8. Demo mode: one button plays a full match on its own, for the presentation.

Defaults for what is still open (replace if docs/decisions.md says otherwise):
- Browser game, single page, `npm run dev`, builds to static files. TypeScript.
- 30 HP each. Hand of 5 digits and operators, refilled after each move. Start with one `for` shield; win `if` from the first professor.
- Maximum expression length: 2 operator slots on floor 1, plus 1 every 3 floors, up to 6.
- Damage is rounded down after the shield. A shield cannot take damage below 0.
- B5 is unlocked by a key won on floor 3, and can be revisited between floors.
- The grand hall interior is not filmed. Design it as the inside of the white glass-box auditorium in buildings/outside/ §3.4, and note it in DESIGN-CHOICES.md.

Put all code under game/. Write game/README.md with how to run it and how to set .env. Before you stop, play a full match to the end in the browser, run demo mode once, and fix what breaks.
```

## after the build

- Commit `game/` and add a "build and run" section to CLAUDE.md.
- Move the defaults the team keeps from `game/DESIGN-CHOICES.md` into `docs/decisions.md`.
