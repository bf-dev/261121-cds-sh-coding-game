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
| In a battle the student steps to the professor's side, so both stand on one line above the HP panels and face each other. The student goes back to where they stood afterwards | |
| The opponent's turn is also inside the limit: the model gets 2 seconds, the rule-based AI is instant | |
| Precedence is shown by nesting: `8 + 2 × 3` draws `2 × 3` as a bubble inside the `+` bubble. Brackets are a bubble with a white outline | answers open question 2 (how brackets are entered): a `( ) Group` button cycles which pair of neighbours is wrapped |

## battle numbers

| choice | value | why |
| --- | --- | --- |
| hand | `slots + 1` numbers and `slots` operators (5 blocks at 2 slots, as in the build prompt) | a hand always has enough blocks to fill every slot |
| operator slots | 2 on floors 1 to 3, then +1 every 3 floors, 6 on floors 13, 14 and Leo | build prompt default |
| operators | `+` and `-` from the start, `×` won on floor 2, `÷` won on floor 4. `^`, `log`, `mod` are not in the game | open question 3. Part 4 only names `+ - × ÷` |
| strong operators | a hand holds at most one `×` and one `÷` | without this, `9 × 9 × 9` ends any match in one move |
| operator draws | weighted `+ : × : - : ÷ = 6 : 4 : 2 : 1` over the unlocked operators. A `-` or `÷` left unused for two completed moves is swapped for a `+` or `×`. Both hands; a skipped turn swaps nothing | `docs/card-draw-randomness.md` (Aretha, 2026-11-21) |
| number draws | 1 to 9, weights 1 for 1 to 3, 2 for 4 and 5, 3 for 6 to 9. No 6 to 9 left in the hand doubles 6 to 9; holding `÷` with no 1 to 3 left doubles 1 to 3. Dealt one at a time. Shield numbers are not affected | `docs/card-draw-randomness.md` (Aretha, 2026-11-21) |
| brackets | won on floor 6. One pair, around two neighbours only | open question 2. `(2 + 3) × 5` is the lesson; longer groups made moves of 400+ |
| player HP | 30, +8 per floor cleared (142 after floor 14, +10 against Leo) | the build prompt says 30 each. Moves grow with the operator slots, so HP grows with the floors |
| professor HP | 14 (tutorial), 18, 24, 44, 50, 56, 80, 86, 92, 100, 106, 112, 122, 130. Leo 140. These were tuned before the weighted draws (#51). With them moves are bigger: a simulation gives 1.4 to 2.8 rounds per match and a careless player wins 67 to 90% from floor 4 up (81% against Leo). HP was left alone because the team asked for shorter matches (p6 29:50); a fifth more professor HP brings back the numbers in the next sentences | lower than the first build (which went up to 180). In a simulation a match is 2 to 3 rounds on floors 1 to 9 and 3 to 5 at the top. A careless player wins floors 1 and 2 almost every time, about 3 in 4 on floor 4, and a bit over half from floor 10 up; a careful one wins about 8 in 10 at the top. Power-ups are not counted |
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
| round() | `set damage to round(damage ÷ 2)`, needs no numbers | `damage = round(damage / 2)` | floor 1, Dr. Dougherty's Round Off |
| if > | `if damage > [A] then: change damage by -[B]` | `if damage > A: damage -= B` | floor 2, Dr. Qin's Security Check |
| if < | `if damage < [A] then: set damage to 0` (1 number) | `if damage < A: damage = 0` | floor 7 |
| if / else | `if damage > [A] then: -[B], else: -[C]` | | floor 8 |
| while | `repeat while damage > [A]0: change damage by -[B]`. The limit is the number times ten | `while damage > 30: damage -= B` | floor 10 |
| len() | `change damage by -len(numbers) × [A]`: counts the number blocks in the attack | `damage -= len(numbers) * A` | floor 12, Prof. Luo's Sequence Length |
| sorted() | `change damage by - middle of sorted([A]0, [B]0, [C]0)` | `damage -= sorted([60, 20, 40])[1]` | floor 13, Prof. Lam's Order the Options |
| filter() | `change damage by - sum of filter(numbers > [A])`: the attack's number blocks bigger than A | `damage -= sum(filter(lambda n: n > A, numbers))` | floor 14, Prof. Ma's Pattern Filter |
| if ≥ | `if damage ≥ [A] then: change damage by -[B]` | | B5 study stair, first visit |

- **Five professors have a shield of their own**, always the first one they plant, announced by name, and won as a block when you beat them: Dougherty `round()`, Qin `if`, Luo `len()`, Lam `sorted()`, Ma `filter()`. The functions come from `docs/professor-levels.md` (Aretha). The other nine functions in that file (`min`, `abs`, `any`, `randint`, `sum`, `max`, `all`, `mod`, and its own `while` variant) are not built. Source for doing these five first: the review Insung forwarded on 2026-11-21 ("give the key professors distinct battles first: Alan, Brian, RB Luo, Tak-Wah Lam, Yi Ma").
- The exact effects of `len()`, `sorted()` and `filter()` are the builder's: `docs/professor-levels.md` marks 13/F and 14/F as experimental. `round()` follows Python: a value exactly in the middle goes to the even number (`round(2.5)` is 2), and the game says so when it happens.
- `while` used to stop at a limit of 1 to 9, which erased any hit. The limit is now the number times ten.
- **The logic is animated, not only the damage**: each test shows a `true` or `false` tag on the block (`8 > 5` true, then the inside runs), loops take the damage down one pass at a time, and the caption reads the step out. Same review, point 2.

Other floor rewards: floor 2 also the `×` block, floor 3 the Building 5 key (build prompt default), floor 4 `÷`, floors 5 and 11 one more shield block per battle, floor 6 brackets, floor 9 and 13 a Red Bull, floor 12 a gym session, floor 14 the Grand Hall invitation. The second study-stair visit gives 2 more shield numbers per battle.

## power-ups

| power-up | effect | where |
| --- | --- | --- |
| Red Bull | an extra turn right after this one | the drink fridges on CDS1 1/F, floors 9 and 13 |
| Gym session | + one third of max HP, may go above the maximum | Building 5 gym on 2/F, floor 12 |
| Meituan meal | + one quarter of max HP | the Meituan lockers outside, east of CDS1 |
| Study | not a power-up: first visit gives the `if ≥` block, second visit 2 more shield numbers per battle | Building 5 study stair, 3/F to 4/F |

- Building 5 has no cafe (Insung, 2026-11-21), so the Red Bull moved to the drink fridges that the footage shows on CDS1 1/F.
- Used at the start of your turn, before the first number is placed (decision #16).
- **Campus details are worth HP**: every info spot found on the maps gives +1 maximum HP in all battles, up to 20. With the study stair (a shield block), the lockers and the fridge, exploring the real places changes the fights. Review point 1 ("make a few campus locations necessary to the adventure").
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

## story (decision #45, `docs/visitor-journey-story.md`; what is built so far)

"The invited visitor". The AI takeover story (#39) and the compulsory labs (#40) were built for about an hour and then replaced.

Built:

- Opening film: five scenes that play by themselves (invitation, welcome dinner in the University Galleria, the 14 mentors, Leo, how to walk), about 20 seconds, Skip is the only button. The game then starts in the Galleria on Building 5 1/F.
- Building 5 1/F is open from the start. Its lift and stair to the upper floors open with the key card from CDS-1 3/F.
- The coached, untimed first lesson is the 1/F challenge with Dr. Dougherty, who stands in the entrance lobby before the gates.
- Mentor tone: every professor gives a stamp, the floor's block and a postcard. The HUD counts `Stamps n/14`.
- Postcards: a picture of the floor as drawn in the game, a crest stamp and one fact from `buildings/` (`POSTCARDS` in `src/data/labs.ts`). The Bag keeps them and the ending shows four.
- Lab doors, open once the floor's mentor is done: a small game and an optional question from the guide about the floor's idea (`LABS` in `src/data/labs.ts`), hint after a wrong answer, +1 maximum HP the first time. After a win the postcard box offers Visit the lab now / Later.
- Games (`src/minigames/`, which floor has which is `FLOOR_GAME` in `src/data/labs.ts`, the builder's pick): word game on 1, 2, 5, 6; Tower of Hanoi on 3, 4, 7; Data Snake on 8 to 10; Hanoi with 4 disks on 11 to 13; HKU milestones on 14; the Shanghai board at the east gate. Each explains itself under "How was this made?" and gives a postcard (HKU Stories or Beyond Campus: Shanghai) and +1 maximum HP the first time.
- The guide (HUD button): Where next, What do my blocks do, Give me a hint, Campus map. The hints are authored, not from the model.
- Bag: HP bar, blocks with what they do and where they came from, items with count, effect and where to get them, the two keys, the postcard album.
- Menu: Campus map, Fast travel to places reached on foot, Opening film.
- HUD: a small live campus map (bottom right) and a Home button that leaves the building.
- People in Building 5 talk (`src/data/people.ts`). They are made up; the host Mei gives the welcome at the door after the film. Their lines follow the story stage (no stamps, first stamps, key card, all 14, CDS Explorer).
- The interface is English only (decision #56). Chinese is left on the signs drawn on the buildings and next to the professors' names.
- Leo is the friendly final examiner. The ending shows a drawn CDS Explorer certificate and the postcard album.
- Sandbox mode (title screen): every door open, no battles, nothing saved.

Not built from the proposal: model-written guide answers, the rhythm, AI-painter and sorting games, and a curated narrative demo (Demo mode is still the Leo match).

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
