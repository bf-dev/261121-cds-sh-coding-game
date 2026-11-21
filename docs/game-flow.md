# game flow

Whiteboard: "game flow -> A vs. B, turn taking". Sources: part 1 21:19 to 23:07, part 2 00:00 to 04:35. Citation format is explained in CLAUDE.md.

## the match

- **Turn-based**, A vs B (board; p2 00:11). The Plants vs. Zombies cooldown idea was dropped as too much work to code (p2 00:11 to 00:22).
- **You play against the AI.** The game is "AI native" (p2 00:27 to 00:36). The lab's local model is the opponent. If the AI can't cope, there needs to be a fallback (p2 00:29). PvP isn't required.
- Each side has **HP** (p2 01:06). **Whoever reaches 0 HP first loses** (p2 04:33). Earlier in part 2 the team also said "respawn" when HP goes negative (p2 01:12 to 01:21). See open-questions.
- It's like a trading card game (19:10). Hand: maybe draw 5 at the start and refill each card you play (22:40). Tentative.

## one turn

From p2 03:44 to 04:29:

1. **Attack phase.** On your turn you build a calculation from your cards (digits, math, CS, power-ups).
2. If the result **heals**, it heals you.
3. If it's **damage**, it goes to the opponent. **The opponent's shield is applied to it** and they take whatever is left.
4. **Shield phase.** Before the opponent's turn you can put up a shield. Then the opponent attacks and your shield applies to their damage.

```
your attack: for range 3 do -2            -> 6 damage
their shield: mod 4                        -> 6 mod 4 = 2
they take 2
```

## shields

- **A shield is a card, or a set of cards, put up before the opponent's turn.** It isn't a separate stat (p2 02:49 to 03:07).
- **The game calculates the incoming damage, then applies the shield's operation to it** (p2 03:25 to 03:33). Examples given: 10 damage vs a `mod 2` shield = 10 mod 2. 10 damage vs a `÷4` shield = 2.5 (p2 03:14 to 03:42).
- `mod` and `÷` are the obvious shield cards (see [cards-math](cards-math.md)).

## turn manipulation

- `break` skips the opponent's turn (board; 22:55). See [cards-cs-logic](cards-cs-logic.md).
- Red Bull gives you two turns (24:46). See [cards-power-ups](cards-power-ups.md).

## demo

- There needs to be a **demo mode** that plays a match by itself, for the presentation of under 15 minutes (p2 07:43 to 07:57).
