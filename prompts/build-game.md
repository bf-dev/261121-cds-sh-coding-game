# build the game (one shot)

The meeting plan was to collect everything in this repo and then have a strong model build it in one go (27:06, 29:40). Before you run this, settle the open questions marked **[blocking]** below, or accept the defaults this prompt gives.

```
You are building a playable game for a hackathon demo at 4 pm today. Read every file in docs/ first, then resources/README.md. docs/decisions.md is binding. docs/open-questions.md lists what's not decided; where you have to choose, use the defaults below and list every choice you made in game/DESIGN-CHOICES.md.

Goal: a coding education card-battle game set on the HKU CDS Shanghai campus, for first-time visitors and their families (docs/hackathon-brief.md).

Must have:
1. A campus map with the buildings in docs/map-and-campus.md. The player starts in CDS1.
2. A battle screen: player vs opponent, turn-based, using DIGIT, MATH and CS cards exactly as in docs/cards-*.md. Include `for range <digit> do <action>` with nesting, and `break`.
3. A visible "code line" that shows the cards played as an expression, e.g. `for i in range(3): hp += 2`, so visitors see the code their cards make.
4. A short guided first battle that teaches each card type with an example (docs/education.md).
5. Progression from docs/progression-and-story.md: a key in CDS1 unlocks Building 5 power-ups, and the grand hall is the final boss.
6. An opponent that can be either a second local player or the AI (docs/game-flow.md). The AI calls an OpenAI-compatible endpoint configured from .env (LLM_BASE_URL, LLM_API_KEY, LLM_MODEL) and falls back to a simple rule-based player if the call fails. Never hard-code keys.

Defaults for open questions (replace if the team decided otherwise):
- [blocking] platform: browser game, single page, runs from `npm run dev` and builds to static files.
- [blocking] "the number" = HP. Both start at 20. Win by bringing the opponent to 0, or by having the highest HP after 10 rounds.
- hand of 5, refill after each play (docs/game-flow.md 22:40).
- integer maths, round down. ÷0 and log 0 fizzle with a funny message.
- visual style: clean 2D, campus photos from resources/photos as backgrounds where available.

Put all code under game/. Write a short game/README.md with how to run it. Test that a full match can be played to the end before you stop.
```
