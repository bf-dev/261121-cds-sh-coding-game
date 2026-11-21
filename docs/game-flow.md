# game flow

Whiteboard: "game flow -> A vs. B, turn taking". Transcript 21:19 to 23:07.

## what was said

- **A versus B, two sides taking turns** (21:32 to 21:37). This is written on the board.
- **The opponent can be an AI.** The lab's unlimited local model could play the other side (21:48 to 21:58). Also 19:05: "probably an agent running on that side". Also 27:50: "the AI agents will play the game".
- It's like a **trading card game** (19:10).
- **Hand:** maybe draw about 5 cards at the start, and replace each card as soon as it's played (22:40 to 22:48). Tentative.
- **Goal:** maximise the number (18:22, 18:59, 20:51). What "the number" is (your HP, a score, or the opponent's HP going down) isn't pinned down. Plus heals you and minus damages, which suggests HP.
- **Turn manipulation:** `break` / pass skips the other side's turn (22:55 to 23:05). See [cards-cs-logic](cards-cs-logic.md).

## alternative raised: real-time with cooldown

Instead of strict turns: play a card, then wait out a cooldown before you can play again, like Plants vs. Zombies (22:12 to 22:25). This wasn't settled. Turn-taking is what's on the board.

## where battles happen

Battles happen inside the campus buildings. CDS1 is the main arena. See [progression-and-story](progression-and-story.md).
