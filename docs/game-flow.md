# game flow

Whiteboard: "game flow -> A vs. B, turn taking". Sources: part 1 21:19 to 23:07, part 2 00:00 to 04:35, **part 4 01:52 to 14:26 (current rule)**.

## the match

- **Turn-based, you vs the AI** ("AI native"), with a fallback if the AI fails (p2 00:11 to 00:36).
- Each side has **HP. Whoever reaches 0 HP first loses** (p2 04:33).
- **Cards are random and change after you use them** (p4 12:51 to 13:09). HEAL and ATTACK are always available (p4 07:09).
- **An inventory panel** shows your cards (p4 10:31).
- **When you get a new card, a pop-up explains what it does and what it's equivalent to** (p4 09:01 to 09:11).

## one turn (part 4)

```
A (you)                                E (enemy)
1. optional power-up (start of round)
2. build a move:                       at the same time, plants a shield
   HEAL|ATTACK  digit  operation         (must be a function: for / if)
   e.g. ATTACK 8 + 2 × 3  = 14
3. evaluate
   HEAL   -> heals A, E's shield does nothing
   ATTACK -> E's shield applies:  for range 3: -2  = -6
             E takes 14 - 6 = 8
then roles swap: E moves, A shields
```

Sources: p4 01:52 to 03:10, 07:21 to 11:49, 18:27.

- Move format: **HEAL or ATTACK, then one base digit, then an operation** (p4 07:21 to 08:02).
- **Max length about six symbols**, starting smaller and growing with level (p4 13:28 to 14:26). A keyboard-style input with no cap was also floated (p4 17:56). Open.

## earlier ideas now replaced

- `+` = heal / `-` = damage (part 1) -> HEAL / ATTACK base cards (p4 06:43).
- `mod` / `÷` as shields (part 2) -> shields must be functions (p4 11:09).
- ÷0 / log 0 glitch (part 2) -> zero removed (p4 16:00).

## demo

A **demo mode** that plays a match by itself, for the presentation of under 15 minutes (p2 07:43 to 07:57).
