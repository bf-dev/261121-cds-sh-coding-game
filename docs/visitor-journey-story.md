# CDS Shanghai visitor journey — story and game design proposal

**Status:** Proposed story revision, 21 November 2026. This document describes the intended player experience and the changes needed from the current build. It does not claim the features below are already implemented. The player's latest direction takes priority over the earlier AI-takeover plot in decisions #39–40; update those decisions with the team when this direction is adopted.

## One-sentence pitch

A visitor receives a special invitation to CDS Shanghai, joins a High Table welcome dinner, explores the campus with a helpful AI guide, learns simple coding ideas from friendly professors, discovers optional games and Shanghai postcards, and completes Leo's final challenge to graduate as a CDS Explorer.

**Audience:** first-time visitors, friends, families, prospective students and people who have never coded. The experience should be easy to understand, playful, and rewarding without requiring prior coding knowledge.

**Learning message:** At CDS, students learn the building blocks of computing and data science so they can understand problems, build things, and work confidently with AI. AI is a useful teammate: it gives directions, suggestions and explanations. The player makes choices, tests ideas and learns from the results.

## The story, scene by scene

1. **Invitation and arrival.** A 20–30 second skippable pixel-art opening shows an invitation opening, a journey to Shanghai, the CDS campus, and Leo's challenge. Suggested invitation text: “You are invited to CDS Shanghai. Join our welcome dinner, meet the people who teach here, and discover what you can build. Before your visit ends, Leo has one final challenge.” This can be made with in-game art, text and transitions; a separate video file is optional. Provide Skip, replay from Menu, and subtitles.
2. **Welcome dinner.** The player arrives at the University Galleria (University High Table) on Building 5's ground floor. A short High Table welcome scene introduces students, professors and the AI guide. It should feel warm and social, not like a daily food court. The guide gives the player a Student Bag and explains the discovery trail. Story access to this dinner is open from the start; later Building 5 amenities can still be unlocked by the existing floor-3 key. The Galleria is distinct from the Grand Hall and from the 14/F history exhibition.
3. **First lesson.** In CDS1, an easy untimed tutorial teaches ATTACK, HEAL, one number, and a shield with a visible worked result. A professor invites the player to a training challenge. Professors certify progress and encourage the student; they are mentors, not villains. Existing battle rules may stay, but dialogue, labels and win scenes should communicate “challenge completed.”
4. **The climb.** The 14 CDS1 floors remain the main progression. On each floor, the player finds the professor inside a relevant space, completes a short challenge, receives one floor postcard and a program stamp/certification, and learns about any newly unlocked block. Early floors are deliberately easy. Later floors combine familiar ideas rather than requiring a new interface each time. The bag explains every skill again whenever opened.
5. **Discovery detours.** Milestone keys open a few optional spaces: classroom games, a research room, the HKU history exhibition, and a stylised Shanghai discovery board at the campus gate. The player may visit now or save them for later. They are diversions and extra learning, not 14 compulsory lab chores.
6. **Top floor and finale.** After the 14/F mentor challenge, the player reaches the Grand Hall. Leo presents a friendly final test using a small selection of already taught skills. On success, Leo congratulates the player, awards a CDS Explorer certificate, and shows a montage of collected campus and Shanghai postcards. The welcome-dinner community can appear in the closing scene. Leo is the final examiner/mascot, not a captive or an evil AI.

## Main loop and pacing

Explore a recognisable place → meet a mentor → complete the existing block-coding challenge → see a clear example of the newly earned skill → receive a postcard and progress stamp → choose to visit an unlocked optional space or continue upward.

Keep the mandatory route short: a few memorable campus hubs with simple travel, brief dialogue, and brisk early challenges. Do not require detailed exploration of all 14 real floor layouts or 14 extra puzzles. Time a complete playthrough before promising a duration. For a presentation, use a curated demo of invitation, dinner, tutorial, one detour, and Leo; the full 14-floor climb remains available. Portals unlock only after a destination has been visited and serve as return shortcuts between CDS1, Building 5, the gate and the Grand Hall. Shanghai postcards are scenes, not a navigable replica of the city.

## Optional spaces and mini-games

| Place | Activity | What visitors learn | Reward |
| --- | --- | --- | --- |
| Classroom | A short Hangman-style word game with picture clues and familiar campus words. Offer gentle hints and avoid obscure jargon. | How a game checks guesses; a glimpse of classroom life. | Classroom postcard and a small item or cosmetic. |
| Classroom or lab | **Tower of Hanoi:** move three disks between pegs without placing a larger disk on a smaller one. The guide explains the rule visually; optional hints show one next move. Four disks can be a bonus round. | Planning a sequence of steps, a classic computing puzzle, and optionally recursion. | Puzzle postcard or hint token. |
| Research room | A compact Snake game collecting data dots, if time permits. | Movement, score and collision rules; a playful research setting. | Research postcard or item. |
| HKU history exhibition | Choose or arrange a few milestones using clues in the exhibits. | HKU history and the exhibition's real setting. | History postcard. |
| Campus gate | Pick a Shanghai destination from illustrated postcards and match a visual clue. | A taste of Shanghai culture and places beyond campus. | “Beyond Campus: Shanghai” postcard. |

Mini-games do **not** need to use the battle's function blocks. Each has a **How was this made?** button: first show the rule in ordinary language, then an optional short, accurate Python example tied to what just happened. For Hanoi, show the legal-move check first; recursion is an optional extra. Never require reading code to finish a mini-game. Implement one polished game and code reveal first (Hanoi or Hangman); add Snake only if the main route is stable.

## Skills, keys, postcards and inventory

- **Skills:** Core battle functions and operators are awarded through the main mentor route (or a brief required, guided demonstration immediately after it). Do not hide a skill needed for later floors or Leo behind an optional mini-game. On unlock, show a two-step example: what happened in ordinary words, then optional Python. Every skill remains in the Bag with its effect, example, source and current use in battle.
- **Items:** Consumables such as a Meituan meal, Red Bull and gym benefit show quantity, effect and valid timing. Meituan food comes from the actual lockers outside CDS1, not a Building 5 cafe. Optional games may award items, hints or cosmetics.
- **Keys/places:** A milestone key opens an optional destination or amenity, and the Bag shows where it leads. The existing floor-3 Building 5 key can unlock the gym/study areas while the welcome dinner on 1/F remains accessible earlier. Offer “Visit now” and “Later.”
- **Postcards:** One CDS1 floor postcard per level, with pixel art, a short true campus fact, and a map cue where appropriate. Additional collections are “HKU Stories” and “Beyond Campus: Shanghai.” Do not imply that imagined Shanghai postcard scenes are literal campus maps. The album and skill explanations can be reopened at any time; progress is saved.

## AI guide and professors

The guide bot can answer bounded questions such as “Where next?”, “What does this block do?” and “Give me a hint,” using approved place facts and the current quest state. Hints progress from a nudge to a worked step. It can explain the actual move that just ran (“8 > 5 is true, so this shield activated”). It may suggest choices in a mini-game, but players can test and revise them. Do not make AI the villain or the sole source of truth about campus.

The current game already has an optional model-driven professor opponent and a rule-based fallback. Keep that battle fallback. A guide can initially use authored, state-aware dialogue; model-generated phrasing can be added through the server proxy with grounded facts and a deterministic fallback. Battle legality, rewards, puzzle answers, floor unlocks and real-world facts stay under game rules. Avoid putting API keys in the browser or static build.

## Alignment with the repository as reviewed on 21 November 2026

| Current repo | Change in this proposal |
| --- | --- |
| 14 CDS1 levels, professors inside rooms, Grand Hall Leo, block battles and first-time explanations exist. | Retain the core game, recast professor dialogue and end screens as mentoring/certification, and make the early route welcoming. |
| Decision #39 and current dialogue say hostile AI took over; the tutorial opens in the Grand Hall and Leo is controlled by AI. | Replace that plot with an invited visitor, positive AI guide, dinner first, and Leo as a friendly final test. Reserve the Grand Hall for the finale. |
| Decision #40 gives a postcard and access to a lab on every floor; functions are placed behind lab bot puzzles. | Keep a floor postcard, but make only a few distinct side spaces optional. Put essential skills on the main route; optional games give extras. |
| Existing Building 5 key comes around 3/F; B5 includes study/gym and the outdoor Meituan lockers are separate. | Open only the Building 5 Galleria for the initial dinner; use the key for its later amenities. Keep the lockers outdoors. |
| The Bag already displays blocks; current rewards, postcard/lab flow and proposed professor functions vary by floor. | Add item quantities, keys, postcard album and persistent skill explanations. Verify each reward against the live progression before changing it. |
| Demo mode and level select already exist; the game is playable online with rule-based opponents. | Add a short skippable opening and a curated narrative demo. Do not assume the full 14-floor run is short without playtesting. |

**Implementation order:** (1) agree on this story and update decision #39–40; (2) opening/dinner/mentor/Leo dialogue and consistent location names; (3) Bag explanations and postcard album; (4) one key and one optional Hanoi or Hangman room with How was this made?; (5) additional detours, portals and guide enhancements. This is a design proposal, not a claim that these changes are complete.

**Related files:** [decisions](decisions.md), [professor lineup](professor-levels.md), [campus reference](map-and-campus.md), [current game README](../game/README.md), [build defaults](../game/DESIGN-CHOICES.md).
