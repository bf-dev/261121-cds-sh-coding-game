# design choices made during the build

Everything here was picked by the builder on 2026-11-21 because the docs left it open. Treat each row as a `proposal (build, 2026-11-21)` until the team agrees. The ones the team keeps should move to `docs/decisions.md`.

Rules that come straight from `docs/decisions.md` are not repeated here.

## from Insung during the build

| choice | note |
| --- | --- |
| **Blocks, not cards or code text.** Moves and shields are Scratch-style blocks: a red ATTACK or teal HEAL block, white number pills, green operator bubbles, orange C-shaped `repeat` / `if` blocks with `change damage by` inside | Insung, 2026-11-21, during the build: "instead of making it actual cards or like code, make it something like block coding, so like scratch". Added to `docs/decisions.md` as #29 |
| Python is still there, but off by default: a `Show Python` button in the battle, and one "the same thing in Python" box in each new-block pop-up | keeps decision #17 ("what it's equivalent to") and the build prompt's "show the move as real code" without putting code in front of a first-time visitor |
| **30 seconds per turn** for each player: a clock next to the round counter, red for the last 10 seconds | Insung, 2026-11-21, during the build. Added to `docs/decisions.md` as #30 |
| When the clock runs out on your move, the blocks already placed are run (cut back to the last complete move). With no number placed the turn is lost. When it runs out while you pick a shield, a random one of the offered shields is planted | builder's choice for what "time limit" does |
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
| player HP | 30, +10 per floor cleared (170 after floor 14, +20 against Leo) | the build prompt says 30 each. With more slots a move grows from about 10 to about 80, so flat 30 HP made every upper floor a one-move match |
| professor HP | 20 (tutorial), 30, 40, 60, 66, 72, 110, 120, 130, 140, 150, 160, 170, 180. Leo 180 | sized from a simulation so a match lasts about 3 to 5 rounds |
| rounding | a move is rounded down, damage is rounded down after the shield, never below 0 | build prompt default |
| zero divisor | the Run button refuses the move and says why | decision #7 |
| negative move | counts as 0 | not in the docs |
| HEAL | cannot go above maximum HP (the gym power-up can) | not in the docs |
| who goes first | the player, every round | not in the docs |
| shield visibility | the opponent's shield is planted face down and revealed when your ATTACK runs. Your shield is picked before you see their move | "at the same time" (p4 01:52) and "guess how much damage" (p4 01:04). In the tutorial the first shield is shown openly |
| shield choice | each time you defend you get 2 or 3 random function blocks from the ones you own, with random digits, and pick one | p4 12:17 "at the start of every round, random" |
| shield digits | every number in a shield is a digit 1 to 9 | keeps to "digits 1 to 9" |
| nested functions | not in the game | open question 5 |
| `break` | not in the game | open question 4 |

## function blocks (all proposals except `for` and `if >`)

| block | shown as | Python | got from |
| --- | --- | --- | --- |
| for, 1 each | `repeat N times: change damage by -1` | `for i in range(N): damage -= 1` | start |
| if > | `if damage > A then: change damage by -B` | `if damage > A: damage -= B` | floor 1 (build prompt default) |
| for, 2 each | `repeat N times: change damage by -2` | | floor 5 |
| if < | `if damage < A then: set damage to 0` | `if damage < A: damage = 0` | floor 7 |
| if / else | `if damage > A then: -B, else: -C` | | floor 8 |
| while | `repeat while damage > A: change damage by -B` | `while damage > A: damage -= B` | floor 10 |
| for, halve | `repeat N times: set damage to damage ÷ 2` | `for i in range(N): damage /= 2` | floor 11 |
| if ≥ | `if damage ≥ A then: change damage by -B` | | B5 study stair, first visit |
| for, 3 each | `repeat N times: change damage by -3` | | B5 study stair, second visit |

Other floor rewards: floor 3 the Building 5 key (build prompt default), floor 9 and 13 a Red Bull, floor 12 a gym session, floor 14 the Grand Hall invitation.

## power-ups

| power-up | effect | where |
| --- | --- | --- |
| Red Bull | an extra turn right after this one | B5 cafe drinks fridge, floors 9 and 13 |
| Gym session | + one third of max HP, may go above the maximum | B5 gym, floor 12 |
| Meituan meal | + one quarter of max HP | the Meituan lockers outside, the B5 cafe |
| Study | not a power-up: gives the next function block | B5 study stair |

- Used at the start of your turn, before the first number is placed (decision #16).
- You carry at most 2 of each. Each station gives one item per floor cleared, so the player comes back to B5 between floors (open question 8).
- The Meituan lockers work from the start, before B5 is unlocked.

## opponents

| choice | note |
| --- | --- |
| All 14 professors and their names are fictional (Dr. Hello, Dr. Plus ... Director Root) | open question 13: no teacher has agreed to appear yet. Swap names and sprites in `src/data/professors.ts` and `src/art/characters.ts` |
| Rule-based AI: samples legal moves from its hand and picks by skill. Low floors pick a middling move, high floors the best. It heals under 38% HP when it cannot finish the match | skill = (floor - 1) / 13 × 0.85, Leo 0.75 |
| Model AI: one call per round for the move, the shield and a one-line explanation | spec and prompt text are in `src/battle/llm.ts` |
| The one-line explanation without a model is generated from the move ("× and ÷ go before + and -, so 8 + 2 × 3 makes 14") | hackathon brief: professors explain their move |

## world

| choice | note |
| --- | --- |
| All 14 floors are playable (open question 9). Floors 1, 6, 13, 14 follow the footage; the others reuse those layouts with the signage from the lift floor guide | 01:11 "we can copy for the other floors" |
| The lift panel lists every floor with what the floor guide says is there. A floor opens when the one below is beaten | |
| Grand Hall: reached from the CDS1 lift after floor 14, with a short text cutscene | the hall's building and entrance are not on film (open question 11) |
| Leo's seat on the lawn stays where it is outside; he is met on the hall stage | |
| The battle is fought where you stand: the top of the battle screen is the live campus view, with the block workspace under it. Against Leo the hall's LED wall shows the running blocks as text | |
| B6 (Senior Common Room) is not a level | its building is unconfirmed (open question 10) |
| Campus details: info spots on every map, counted in the Bag ("campus details found") | hackathon brief: hidden details, a reason to explore |
| Game title "Code Climb · 编程闯关" | the team has not named the game |
| Demo mode plays the Leo match with a full kit | p2 07:43 |
| The raw videos were not opened; everything comes from `buildings/` | |
