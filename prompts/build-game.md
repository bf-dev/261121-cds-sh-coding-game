# build the game (one shot)

The meeting plan was to collect everything in this repo and then have a strong model build it in one go (27:06, 29:40). Most rules were settled in part 2 of the meeting. The defaults below cover what's still open in docs/open-questions.md.

```
You are building a playable game for a hackathon demo at 4 pm today. Read every file in docs/ first, then resources/README.md. docs/decisions.md is binding. docs/open-questions.md lists what's not decided; where you have to choose, use the defaults below and list every choice you made in game/DESIGN-CHOICES.md.

Goal: a coding education card-battle game set on the HKU CDS Shanghai campus, for first-time visitors and their families (docs/hackathon-brief.md).

Must have:
1. 2D pixel-art campus map, as detailed and realistic as possible, drawn from the photos and videos in resources/ (docs/art-style.md, docs/map-and-campus.md). The player, a student, starts in CDS1.
2. Turn-based battle vs the AI: build an attack from DIGIT, MATH, CS and POWER-UP cards; heal goes to you, damage goes through the opponent's shield (docs/game-flow.md, docs/cards-*.md). Shields are cards placed before the opponent's turn and applied to incoming damage. ÷0 / log 0 = glitch that hurts the player; for range 0 does nothing.
3. A visible code line for every attack, e.g. `for i in range(3): hp += 2`, so players see the code their cards make.
4. The first battle is a step-by-step tutorial (docs/education.md).
5. Progression (docs/progression-and-story.md): a key in CDS1 unlocks Building 5 power-ups; Leo the HKU lion is the final boss in the grand hall.
6. AI opponent on an OpenAI-compatible endpoint from .env (LLM_BASE_URL, LLM_API_KEY, LLM_MODEL), teachers as challengers who explain their move in one line; if the call fails or returns an illegal move, a rule-based move is played within 2 seconds. Never hard-code keys.
7. A demo mode that plays a full match by itself (docs/game-flow.md).

Defaults for what's still open (replace if the team decided otherwise):
- platform: browser game, single page, runs from `npm run dev`, builds to static files.
- 30 HP each, hand of 5 refilled after each play, an attack uses up to 3 cards, 0 HP loses the match.
- glitch costs the player 3 HP. Damage is rounded down after the shield is applied.
- new CS cards: `if` and `while`, one teaching line each (docs/cards-cs-logic.md).

Put all code under game/. Write a short game/README.md with how to run it. Test that a full match can be played to the end before you stop.
```
