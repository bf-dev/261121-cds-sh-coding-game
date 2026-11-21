# POWER-UP cards

**A fourth card group called Power Ups** (p2 04:44 to 05:00).

- **Used at the start of the round, before you attack, if you want** (p4 18:27 to 18:36).
- Kinds named: **extra turn** (Red Bull: two turns, 24:46, p2 04:48), **extra HP** (p4 18:41 to 18:49).
- Power-ups come from **Building 5**: gym = stronger, study = new cards, food locker = health (24:46 to 25:07). See [progression-and-story](progression-and-story.md) and [Building 5](../buildings/b5/).

## Student-life power-up proposals

The effects and locations below are **proposals (Aretha and ChatGPT, 2026-11-21)**, except for the general Red Bull, gym and food ideas cited above. They are not all in the game yet. Keep power-ups as single-use items, distinct from reusable defensive function blocks. Show their effects in plain language first; an optional pop-up can show the related Python or computing idea.

| Item | Where the player finds it | Proposed effect | Coding connection shown optionally |
| --- | --- | --- | --- |
| **Red Bull — Extra Turn** | Building 5 drinks fridge; existing floor rewards | Take one more move after this one resolves. The opponent plants a new shield for that move. | Another iteration of the turn. |
| **Meituan Delivery — Lunch Arrived** | Outdoor Meituan food lockers | Restore HP, up to the normal maximum. | `hp = min(max_hp, hp + heal)`. |
| **`pass` — Awkward Silence** | Classroom | Make the professor's next action a no-op. | Python `pass` does nothing; forcing the opponent's action slot to contain it is the *game effect*. It does not inherently skip another person's turn. |
| **Coffee — Focus Mode** | **Meituan delivery lockers, not the café** | Draw two replacement cards and choose one to keep. | Choosing from new inputs. |
| **`print()` — Show Your Work** | Teaching lab | Reveal the professor's next shield before building an attack. | `print()` displays information. |
| **Ctrl+Z — Undo** | Study area | After seeing an attack preview, return the selected blocks and rebuild once. | A keyboard shortcut, not Python syntax. |
| **Gym Session — Extra Stamina** | Building 5 gym | Increase maximum HP and restore the same amount. | Increasing a variable's limit. |
| **`import` — Borrow a Tool** | Learning commons | Draw three operators and keep one for this battle. | Importing a tool to use. |
| **`try/except` — Bug Catch** | Teaching lab | If a submitted move is invalid, keep the turn and fix it. **Needs redesign if invalid moves already cost nothing**, as in the current build. | Catch an error and recover. |
| **Power Nap — Reset** | Student lounge | Restore some HP and replace the random digit/operator hand. | Resetting state. |

### Suggested first playable set

Red Bull, Meituan Delivery, `pass`, Coffee, and `print()` give distinct choices: another action, healing, disrupting an action, improving a hand, and gaining information. The others can be later campus discoveries. Exact amounts, availability, and carry limits need balancing against the current HP progression in [game/DESIGN-CHOICES.md](../game/DESIGN-CHOICES.md).

### Interaction and teaching

- Let the player find the item at a real campus landmark, then explain it with one short sentence and an example.
- Play at most one power-up at the start of the player's turn; avoid combining Red Bull and `pass` on one turn until tested.
- Show `pass` as a no-op in the professor's action slot. It is a game-specific way of skipping that action, not the literal meaning of the keyword.
- Coffee is delivered from **Meituan**. Its location and art should point to the outdoor Meituan lockers, not the CDS1 or Building 5 café.
