# overview

**A coding education game set on the HKU CDS Shanghai campus.** Visitors explore real campus buildings and fight card battles where the cards are pieces of code: digits, math operators, and control-flow keywords like `for` and `break`.

Built for the CDS-SH "Your campus, your game" hackathon on 2026-11-21 (see [hackathon-brief](hackathon-brief.md)).

## the idea in one paragraph

You play a student climbing CDS1 floor by floor, 14 levels, battling teachers played by the lab's local AI, and then the HKU lion in the grand hall ([progression-and-story](progression-and-story.md)). Battles are turn-based ([game-flow](game-flow.md)). On your turn you build a move: **HEAL or ATTACK**, a base digit 1 to 9, then operators, e.g. `ATTACK 8 + 2 × 3` = 14 ([cards-digits](cards-digits.md), [cards-math](cards-math.md)). Meanwhile the opponent plants a shield, which must be a function such as `for range 3: -2` or `if damage > 5: -5` ([cards-cs-logic](cards-cs-logic.md)). Power-ups like Red Bull (extra turn) are played at the start of a round ([cards-power-ups](cards-power-ups.md)). Whoever hits 0 HP first loses. The campus is drawn as detailed 2D pixel art from our photos and footage, organised per building in `buildings/` ([map-and-campus](map-and-campus.md), [art-style](art-style.md)). The first battle is a step-by-step tutorial ([education](education.md)).

## who it's for

First-time campus visitors: offer holders and their families and friends (hackathon brief, 06:15). The game has to be intuitive for a first-time player of any age ([education](education.md)).

## whiteboard title

"coding education game based on HKU CDS-SH campus", with "tour" written under it. See `resources/photos/2026-11-21-whiteboard.jpg`.

## status

A playable build is in `game/` (see `CLAUDE.md`, "the game: build and run"). The battle pieces are drawn as Scratch-style blocks instead of cards (decision #29). What's settled is in [decisions](decisions.md). Everything else is in [open-questions](open-questions.md), and the defaults the build picked are in `game/DESIGN-CHOICES.md`.
