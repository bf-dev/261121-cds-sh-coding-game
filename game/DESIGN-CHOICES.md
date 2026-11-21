# design choices made during the build

Everything here was picked by the builder on 2026-11-21 because the docs left it open. Treat each row as a `proposal (build, 2026-11-21)` until the team agrees. The ones the team keeps should move to `docs/decisions.md`.

Rules that come straight from `docs/decisions.md` are not repeated here.

## from Insung during the build

| choice | note |
| --- | --- |
| **Blocks, not cards or code text.** Moves and shields are Scratch-style blocks: a red ATTACK or teal HEAL block, white number pills, green operator bubbles, orange C-shaped `repeat` / `if` blocks with `change damage by` inside | Insung, 2026-11-21, during the build: "instead of making it actual cards or like code, make it something like block coding, so like scratch". Added to `docs/decisions.md` as #29 |
| Python is still there, but off by default: a `Show Python` button in the battle, and one "the same thing in Python" box in each new-block pop-up | keeps decision #17 ("what it's equivalent to") and the build prompt's "show the move as real code" without putting code in front of a first-time visitor |
| **30 seconds per turn** for each player: a clock next to the round counter, red for the last 10 seconds | Insung, 2026-11-21, during the build. Added to `docs/decisions.md` as #30 |
| When the clock runs out on your move, the blocks already placed are run (cut back to the last complete move). With no number placed the turn is lost. When it runs out while you build a shield, no shield is planted and nothing is spent | builder's choice for what "time limit" does |
| **Shields are built, and limited.** You pick a function block, then tap shield numbers into its empty slots (`repeat [3] times: change damage by -[2]`). You have 2 shield blocks per battle (3 after floor 5, 4 after floor 11) and a set of shield numbers dealt once at the start of the battle: 2 per block plus 1 (plus 2 after the second study visit). `No shield` saves a block for a bigger hit | Insung, 2026-11-21: "the repeat block should be customizable ... tapping the numbers", "a limited amount of repeat blocks", "the digits ... limited ... based on the digits that you have at the beginning of the battle". `docs/decisions.md` #31. The counts are the builder's |
| The same build-it-yourself rule is used for every shield block (`if`, `if / else`, `while`), not only `repeat` | one way to build a shield is easier to learn than two |
| **Less HP, fewer shields.** A professor may plant 1 shield per battle on floors 1 and 2, 2 on floors 3 to 6, 3 on floors 7 to 14, Leo 4. When they have blocks left they plant one about 6 rounds in 10 | Insung, 2026-11-21: "makes HP less than before", "less the shield because it is boring to have longer and repetitive". `docs/decisions.md` #32 |
| The clock stops while a pop-up is open, and the tutorial battle on floor 1 has no clock | a first-time visitor should not be rushed while reading what a block does |
| The opponent's turn is also inside the limit: the model gets 2 seconds, the rule-based AI is instant | |
| Precedence is shown by nesting: `8 + 2 × 3` draws `2 × 3` as a bubble inside the `+` bubble. Brackets are a bubble with a white outline | answers open question 2 (how brackets are entered): a `( ) Group` button cycles which pair of neighbours is wrapped |

## battle numbers

| choice | value | why |
| --- | --- | --- |
| hand | `slots + 1` numbers and `slots` operators (5 blocks at 2 slots, as in the build prompt) | a hand always has enough blocks to fill every slot |
| operator slots | 2 on floors 1 to 3, then +1 every 3 floors, 6 on floors 13, 14 and Leo | build prompt default |
| operators | `+` and `-` from the start, `×` won on floor 2, `÷` won on floor 4. `^`, `log`, `mod` are not in the game | open question 3. Part 4 only names `+ - × ÷` |
| strong operators | a hand holds at most one `×` and one `÷` | without this, `9 × 9 × 9` ends any match in one move |
| brackets | won on floor 6. One pair, around two neighbours only | open question 2. `(2 + 3) × 5` is the lesson; longer groups made moves of 400+ |
| player HP | 30, +8 per floor cleared (142 after floor 14, +10 against Leo) | the build prompt says 30 each. Moves grow with the operator slots, so HP grows with the floors |
| professor HP | 14 (tutorial), 18, 24, 44, 50, 56, 80, 86, 92, 100, 106, 112, 122, 130. Leo 140 | lower than the first build (which went up to 180). In a simulation a match is 2 to 3 rounds on floors 1 to 9 and 3 to 5 at the top. A careless player wins floors 1 and 2 almost every time, about 3 in 4 on floor 4, and a bit over half from floor 10 up; a careful one wins about 8 in 10 at the top. Power-ups are not counted |
| rounding | a move is rounded down, damage is rounded down after the shield, never below 0 | build prompt default |
| zero divisor | the Run button refuses the move and says why | decision #7 |
| negative move | counts as 0 | not in the docs |
| HEAL | cannot go above maximum HP (the gym power-up can) | not in the docs |
| who goes first | the player, every round | not in the docs |
| shield visibility | the opponent's shield is planted face down and revealed when your ATTACK runs. You can see whether they planted one, and how many blocks they have left. Your shield is built before you see their move | "at the same time" (p4 01:52) and "guess how much damage" (p4 01:04). In the tutorial the first shield is shown openly |
| shield numbers | every number in a shield is a digit 1 to 9, dealt at random at the start of the battle and not refilled | replaces the earlier "2 or 3 random ready-made shields each round" (p4 12:17) after Insung's instruction |
| professors' shields | ready-made, with numbers that grow with the floor (a floor-1 repeat block takes 2 to 3 off, a floor-14 one up to 30) | harder as you go up |
| nested functions | not in the game | open question 5 |
| `break` | not in the game | open question 4 |

## function blocks (all proposals except `for` and `if >`)

Every number slot is filled by the player from the shield numbers.

| block | shown as | Python | got from |
| --- | --- | --- | --- |
| for | `repeat [A] times: change damage by -[B]` | `for i in range(A): damage -= B` | start |
| if > | `if damage > [A] then: change damage by -[B]` | `if damage > A: damage -= B` | floor 1 (build prompt default) |
| if < | `if damage < [A] then: set damage to 0` (needs only 1 number) | `if damage < A: damage = 0` | floor 7 |
| if / else | `if damage > [A] then: -[B], else: -[C]` | | floor 8 |
| while | `repeat while damage > [A]: change damage by -[B]` | `while damage > A: damage -= B` | floor 10 |
| if ≥ | `if damage ≥ [A] then: change damage by -[B]` | | B5 study stair, first visit |

Other floor rewards: floor 3 the Building 5 key (build prompt default), floors 5 and 11 one more shield block per battle, floor 9 and 13 a Red Bull, floor 12 a gym session, floor 14 the Grand Hall invitation. The second study-stair visit gives 2 more shield numbers per battle.

## power-ups

| power-up | effect | where |
| --- | --- | --- |
| Red Bull | an extra turn right after this one | the drink fridges on CDS1 1/F, floors 9 and 13 |
| Gym session | + one third of max HP, may go above the maximum | Building 5 gym on 2/F, floor 12 |
| Meituan meal | + one quarter of max HP | the Meituan lockers outside, east of CDS1 |
| Study | not a power-up: first visit gives the `if ≥` block, second visit 2 more shield numbers per battle | Building 5 study stair, 3/F to 4/F |

- Building 5 has no cafe (Insung, 2026-11-21), so the Red Bull moved to the drink fridges that the footage shows on CDS1 1/F.
- Used at the start of your turn, before the first number is placed (decision #16).
- You carry at most 2 of each. Each station gives one item per floor cleared, so the player comes back to B5 between floors (open question 8).
- The Meituan lockers work from the start, before B5 is unlocked.

## opponents

| choice | note |
| --- | --- |
| The 14 challengers are the lineup in `docs/professor-levels.md` (Aretha): Dr. Alan Dougherty on 1/F up to Prof. Yi Ma on 14/F, with their research fields. The sprites are drawn to resemble them (hair, glasses, clothes) from their public HKU staff photos; the photos are not in the repo | Insung, 2026-11-21: "apply the professor list ... make a character similar to the professors". `docs/decisions.md` #33. **To do for the team: ask each person before the game is shown outside the hackathon** (`docs/avatars.md`, `docs/professor-levels.md`). Names are in `src/data/professors.ts`, looks in `src/art/characters.ts` |
| What each professor says is written for the game, friendly, and built on their field. It is not a quote. No Chinese names are invented: the small label next to a name is the field in Chinese | |
| Only the lineup from `docs/professor-levels.md` is used. Its proposed function per floor (`round`, `min`, `abs`, `any`, `sum` ...) is not built: the rewards per floor are the ones in the table above | 14 new functions did not fit the time left, and Insung asked for fewer shields, not more |
| Rule-based AI: samples legal moves from its hand and picks by skill. Low floors pick a middling move, high floors the best. It heals under 38% HP when it cannot finish the match | skill = (floor - 1) / 13 × 0.95, Leo 0.85 |
| Model AI: one call per round for the move, the shield and a one-line explanation | spec and prompt text are in `src/battle/llm.ts` |
| The one-line explanation without a model is generated from the move ("× and ÷ go before + and -, so 8 + 2 × 3 makes 14") | hackathon brief: professors explain their move |

## story (proposal, build 2026-11-21, asked for by Insung)

"Light the Wall". One story from the title screen to the ending, built only on facts in `buildings/`:

- Place: HKU Zhangjiang Base, No. 500 Fangchun Road, Shanghai. HKU, founded 1911 (the `Est. 1911` door band), teaches computing here. The evening is a "Magic Hour" (the name of the event at which Building 5 opened, 30 Aug 2026).
- Problem: the welcome show on the Grand Hall LED wall is a program, and the wall is dark. Leo the lion split the program into 14 blocks and left one with each professor in CDS1. His seat on the lawn is empty, with a note.
- Climb: each professor hands over their block to a student who shows they can read it. The HUD counts `Program blocks n/14`. The key to Building 5 comes from 3/F.
- End: Leo runs the final test on the Grand Hall stage. When he is beaten the wall lights up with `print('Welcome to HKU CDS Shanghai!')` and the motto on the crest, `Sapientia et Virtus`. On 14/F the professor points at the real HKU milestones exhibition (1912 to 2024).

## world

| choice | note |
| --- | --- |
| All 14 floors are playable (open question 9). Floors 1, 6, 13, 14 follow the footage; the others reuse those layouts with the signage from the lift floor guide | 01:11 "we can copy for the other floors" |
| The lift panel lists every floor with what the floor guide says is there. A floor opens when the one below is beaten | |
| Grand Hall: reached from the CDS1 lift after floor 14, with a short text cutscene | the hall's building and entrance are not on film (open question 11) |
| Leo's seat on the lawn stays where it is outside; he is met on the hall stage | |
| The battle is fought where you stand: the top of the battle screen is the live campus view, with the block workspace under it. Against Leo the hall's LED wall shows the running blocks as text | |
| Building 5 has five floors, joined by a lift that works on every floor: 1/F Galleria, 2/F gym and game hub, 3/F study stair with sofas under it, 4/F co-creation rooms, 5/F learning commons. The study stair joins 3/F and 4/F on foot | Insung, 2026-11-21, `docs/decisions.md` #36 |
| B6 (Senior Common Room) is not a level | its building is unconfirmed (open question 10) |
| Campus details: info spots on every map, counted in the Bag ("campus details found") | hackathon brief: hidden details, a reason to explore |
| Game title "Code Climb · 编程闯关" | the team has not named the game |
| **Cute look.** Chibi characters (the head is about half the figure, big eyes, blush), a round fluffy Leo, rounded pastel panels and pill buttons, HP bars with a heart, small bounces | Insung, 2026-11-21: "the overall design should look cute". `docs/decisions.md` #37 |
| Demo mode plays the Leo match with a full kit | p2 07:43 |
| The raw videos were not opened; everything comes from `buildings/` | |
