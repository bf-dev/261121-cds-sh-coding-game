# decisions

What the team agreed, or said without objection. Citations: `mm:ss` = part 1, `p2` / `p4` = parts 2 and 4, `board` = whiteboard. Later parts override earlier ones. Replaced rules are listed at the bottom.

## rules

| # | decision | source |
| --- | --- | --- |
| 1 | Coding education game based on the HKU CDS-SH campus | board; 23:42 |
| 2 | Turn-based, you vs the AI ("AI native"), with a fallback if the AI fails | p2 00:11 to 00:36 |
| 3 | HP. Whoever reaches 0 HP first loses | p2 01:06, 04:33 |
| 4 | **HEAL and ATTACK are base cards everyone always has** | p4 05:22 to 07:14 |
| 5 | Move = HEAL or ATTACK, one base digit, then an operation. `ATTACK 8 + 2 × 3` = 14 | p4 07:21 to 10:52 |
| 6 | Operators `+ - × ÷` modify the base digit | p4 05:28, 07:14 |
| 7 | **Digits 1 to 9. Zero removed.** The game checks for zero values before ÷ / log | p4 16:00 to 17:18 |
| 8 | One digit card at a time, no concatenation | 17:10 to 17:24 |
| 9 | Digits and operators are random and change after use | p4 12:51 to 13:09 |
| 10 | **Functions are defence only. A shield must be a function** (`for`, `if`) | p4 08:02, 11:05 to 11:45 |
| 11 | The shield is planted during the opponent's move and only works against ATTACK. HEAL goes straight through | p4 01:52 to 03:03 |
| 12 | `for range 3: -2` shield = -6, so 14 damage becomes 8 | p4 11:16 to 11:36 |
| 13 | `if` uses `< > <= >=`, with a fixed specific action, e.g. `if damage > 5: -5` | p4 00:00 to 01:46, 11:49 |
| 14 | Start with one or two functions, win more by beating professors | p4 15:36 to 15:59 |
| 15 | Brackets are allowed (input method open) | p4 17:27 to 17:46 |
| 16 | Power-ups: a fourth group, used at the start of the round before attacking. Extra turn (Red Bull), extra HP | p2 04:44; p4 18:27 to 18:49 |
| 17 | A pop-up explains each new card and what it's equivalent to. An inventory panel shows your cards | p4 09:01, 10:31 |
| 18 | Teach for, maybe while, if / else. Nothing advanced | p2 06:41 to 07:00 |
| 29 | **The battle pieces are shown as Scratch-style blocks, not cards or code text**, so non-CS visitors can follow. The Python equivalent is optional extra (button, pop-ups) | Insung, 2026-11-21, during the build |
| 30 | **Each player has 30 seconds for a turn** | Insung, 2026-11-21, during the build |
| 31 | **The repeat block is built by the player**: tap numbers into it (how many times, how much each time). Shield blocks are limited per battle, and the numbers for them are dealt once at the start of the battle | Insung, 2026-11-21, during the build |
| 32 | **Less HP, fewer shields, shorter matches.** The first floors are easy, each floor up is harder | Insung, 2026-11-21, during the build |
| 33 | The 14 CDS1 floors use the professor lineup in `professor-levels.md`, with characters drawn to resemble them. The game has one consistent story tied to HKU in Shanghai | Insung, 2026-11-21, during the build |
| 34 | The HKU logo and crest are the official artwork from hku.hk, never redrawn | Insung, 2026-11-21, during the build |
| 35 | The last stage is called **Grand Hall** | Insung, 2026-11-21, during the build |
| 36 | Building 5: the lift serves 1/F to 5/F, the study stair connects 3/F and 4/F with sofas under it, 3/F to 5/F are study and meeting rooms, there is no cafe. Meituan lockers stand east of CDS1, upright, across the service road, with Fangchun Road behind them | Insung, 2026-11-21, during the build |
| 37 | The look is cute | Insung, 2026-11-21, during the build |
| 38 | The game is playable online at insu.ng/cds | Insung, 2026-11-21, during the build |
| 39 | **Story: an AI has taken over CDS.** Its bots hold the floors of CDS1. The professors check that the student is qualified to face the bots, floor by floor. The game opens in the Grand Hall with the tutorial, then CDS1, Building 5 unlocks around 3/F, and after the top floor the student enters the Grand Hall and fights the lion. Replaces the "Light the Wall" proposal | team voice note, `resources/transcripts/2026-11-21-team-direction-afternoon.md` |
| 40 | **Every floor gives a postcard** with a fact about CDS Shanghai, **and access to that floor's lab**. The new function block comes from the lab, after a puzzle, not from beating the professor | team voice note, `resources/transcripts/2026-11-21-team-direction-afternoon.md` |
| 41 | The professors stand inside rooms and lecture theatres, so each floor is explored before its battle | team voice note, `resources/transcripts/2026-11-21-team-direction-afternoon.md` |
| 42 | Level select and the Menu have a Building 5 shortcut for the presentation | Insung, 2026-11-21, during the build |
| 43 | CDS1 1/F: the cafe is before the security line, and every gate of the security line is open. Outside: the footbridge deck runs between the two towers | Insung, 2026-11-21, in person |
| 44 | ~~The background music is the HKU anthem, played as retro game music from the written score, with no speech~~ replaced by #57 | Insung, 2026-11-21, during the build |
| 45 | **Story: the invited visitor.** Replaces the AI takeover of #39 and the compulsory labs of #40. The player is invited to CDS Shanghai, starts at the High Table welcome dinner in the University Galleria (Building 5, 1/F), has a helpful AI guide, meets the professors as mentors on the 14 floors, and takes Leo's friendly final challenge in the Grand Hall. Blocks come from the mentors again; a floor still gives a postcard; the lab question is optional | `docs/visitor-journey-story.md` (Aretha) and Insung "check this and apply", 2026-11-21 |
| 46 | The opening plays by itself like a short film, with Skip as the only button | Insung, 2026-11-21, during the build |
| 47 | There is a mode with no battles where people just walk around (Sandbox mode on the title screen) | Insung, 2026-11-21, during the build |
| 48 | Names: `CDS-1`, `CDS-2`, `Grand Hall`. No civil defence sign. 1/F behind the gates is a lift hall with four lifts on each side | Koki, `game/BUGS.md`, 2026-11-21 |
| 49 | Battle animation shows the blocks working on each other: the two numbers of every operation merge into the result, each loop round is its own beat with the amount flying to the damage number, and the bottom half shows the current damage large while blocks run | team, 2026-11-21, during the build |
| 50 | There is no footbridge outside CDS-1. It is removed from the map and from the code | team, 2026-11-21, during the build; Insung, 2026-11-21: "get rid of footbridge" |
| 51 | **Weighted card draws.** Operators are drawn `+ : × : - : ÷ = 6 : 4 : 2 : 1`, an unused `-` or `÷` is swapped for a `+` or `×` after two completed moves, and numbers lean towards 6 to 9 with a small number more likely next to `÷` | `docs/card-draw-randomness.md` (Aretha, 2026-11-21) |
| 52 | **Optional games behind the lab doors**: word game, Tower of Hanoi (3 disks, 4 as the bonus round), Data Snake, the HKU milestones on 14/F, and the Shanghai board at the campus gate. Each has "How was this made?" and gives a postcard, never a block that a later floor needs | `docs/visitor-journey-story.md` (Aretha, 2026-11-21); Insung, 2026-11-21: "please get those done" |
| 53 | **The guide is a button**: Where next, What do my blocks do, Give me a hint (from a nudge to a worked step), Campus map. The Bag has tabs for blocks, items and keys, and the postcard album, with an HP bar on top | `docs/visitor-journey-story.md`; Insung, 2026-11-21: "add an hp bar that is visible in the bag" |
| 54 | **Fast travel** between places already reached on foot, and the opening film can be replayed from the Menu. The ending shows a drawn CDS Explorer certificate and the album | `docs/visitor-journey-story.md` |
| 55 | **Campus map**: a preview on the title screen opens a labelled overview, north up, information only. In play a small map in the corner shows where you are on the whole campus, and a Home button leaves the building you are in | `docs/home-campus-overview.md` (Aretha, 2026-11-21); Insung, 2026-11-21: "a small map for the whole campus that actively shows your location", "a home button to go out of the building you're in" |
| 56 | **The interface is in English only.** Chinese stays where it is written on the real buildings (signs, plates, the CDS-1 entrance) and for the professors' own names | p6 34:54 "Get rid of Chinese"; Insung, 2026-11-21: "remove unnecessary chinese on the user interface, don't remove if it is actually existing on the building" |
| 57 | **Music: "Brighten Me with Virtues" (明我以德)**, the recording from the HKU Alumni music video, replaces the chiptune anthem of #44 | Insung, 2026-11-21: "this just this music" |
| 58 | **The people in Building 5 talk**, in a box with their face, and tell the visitor story as it moves on: the host at the dinner hands over the stamp card, the others react to the stamps you have | Insung, 2026-11-21: "make students on the bldg 5 talk with box and w/ story" |
| 59 | The professors' Chinese names are the ones HKU publishes on its staff pages. Dr. Dougherty has none there, so the game shows none | bug 5 in `game/BUGS.md` (Koki, 2026-11-21); sources in `game/src/data/professors.ts` |

## world and story

| # | decision | source |
| --- | --- | --- |
| 19 | **CDS1 floors are the levels: 14 levels, harder professors higher up** | p4 14:35 to 15:05 |
| 20 | **After floor 14: the grand hall, final boss Leo the HKU lion** | p4 15:05; p2 05:35 |
| 21 | Player is a student. Teachers are challengers, not villains. No real students as characters | p2 07:00 to 07:18; 16:16; 25:48 |
| 22 | Teacher avatars from the CDS teacher list, only people who won't mind | 15:45 to 16:04 |
| 23 | Building 5 holds the power-ups (gym, study, food). A key from CDS1 unlocks it | 24:38 to 25:07 |
| 24 | MT = Meituan food locker. CDS1 6/F classroom floor, 13/F professors' offices | p2 05:01 to 05:34 |
| 25 | The first battle is a step-by-step tutorial. Intuitive for any first-time visitor | p2 05:45 to 06:41 |
| 26 | 2D pixel art, realistic and detailed, from the building photos. Follow the style of https://insu.ng/zhangjiang, but more detailed and realistic | p2 07:21 to 08:38; Insung 2026-11-21 |
| 27 | Tech stack left to the builder. Demo mode. Presentation under 15 min | p2 07:40 to 07:57 |
| 28 | Make it as complete as possible, fast. The team wants the expo spot | p2 08:00 to 08:18 |

## replaced

| old rule | replaced by |
| --- | --- |
| `+` heals, `-` damages (18:22) | HEAL / ATTACK base cards (p4 06:43) |
| `for range 3 do +2` as a heal/attack (20:37) | functions are defence only (p4 08:02) |
| `mod` / `÷` as shield cards (p2 02:21) | shields must be functions (p4 11:09) |
| ÷0 / log 0 "glitch" hurts you (p2 01:36) | zero removed (p4 16:00) |
| digits 0 to 9 (board) | digits 1 to 9 (p4 16:35) |
| CDS1 main arena + B5 unlock (24:22) as the whole map | 14 CDS1 floor levels, then the grand hall (p4 14:35). B5's place is open |
