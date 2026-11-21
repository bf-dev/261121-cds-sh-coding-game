# overview

**A coding education game set on the HKU CDS Shanghai campus.** Visitors explore real campus buildings and fight card battles where the cards are pieces of code: digits, math operators, and control-flow keywords like `for` and `break`.

Built for the CDS-SH "Your campus, your game" hackathon on 2026-11-21 (see [hackathon-brief](hackathon-brief.md)).

## the idea in one paragraph

You play a student who battles teachers, played by the lab's local AI, in turn-based card fights ([game-flow](game-flow.md)). On your turn you build an attack from cards. Digit cards are 0 to 9 ([cards-digits](cards-digits.md)). Math cards: `+` heals, `-` damages, `x ÷ ^ log` scale the effect, and `mod` / `÷` work as shields against the opponent's attack ([cards-math](cards-math.md)). CS cards are control flow: `for range <digit> do <action>` repeats, loops can nest, and `break` skips the opponent's turn ([cards-cs-logic](cards-cs-logic.md)). Power-ups like Red Bull give you two turns ([cards-power-ups](cards-power-ups.md)). Whoever hits 0 HP first loses. The fights happen in the real campus, drawn as detailed 2D pixel art from our photos ([map-and-campus](map-and-campus.md), [art-style](art-style.md)). CDS1 is the main arena, a key unlocks Building 5's power-ups, and Leo the HKU lion is the final boss in the grand hall ([progression-and-story](progression-and-story.md)). The first battle is a step-by-step tutorial ([education](education.md)).

## who it's for

First-time campus visitors: offer holders and their families and friends (hackathon brief, 06:15). The game has to be intuitive for a first-time player of any age ([education](education.md)).

## whiteboard title

"coding education game based on HKU CDS-SH campus", with "tour" written under it. See `resources/photos/2026-11-21-whiteboard.jpg`.

## status

Concept stage. What's settled is in [decisions](decisions.md). Everything else is in [open-questions](open-questions.md).
