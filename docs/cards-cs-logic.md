# CS cards: functions (defence)

Whiteboard: "control (logic) CS: for, break (skip one turn)", "for range [DIGIT 3] do: ____". Sources: part 1 19:24 to 21:10, part 2 01:31 and 06:41, **part 4 00:00 to 01:46, 08:02 to 11:49, 15:32 (current rule)**.

## functions are defence only (part 4 change)

- **Functions are only used to defend. A shield must be a function. You can't use a function in an attack** (p4 08:02 to 08:35, 11:05 to 11:45).
- A shield is planted **while the opponent is making their move**, and it only activates if that move is an ATTACK (p4 01:52 to 03:03).
- This replaces part 1's `for range 3 do +2` as an attack/heal.

## for

- `for range <digit>: <operation>` repeats the operation on the incoming damage.
- Example: attack of 14 vs shield **`for range 3: -2`** = -6, so you take **14 - 6 = 8** (p4 11:16 to 11:36).
- Part 1 said the slot can hold another CS card (nesting, 20:54). Not revisited in part 4.

## if

- **Needs comparisons: `<`, `>`, `<=`, `>=`** (p4 00:00 to 00:12).
- **The action is fixed and specific, with little freedom** (p4 00:12 to 00:47).
- Idea: **guess how hard the opponent will hit.** `if damage > 5: -5` (p4 01:04 to 01:46, 11:49).

## break

- Board: "break (skip one turn)". Not discussed in part 4. Whether it's a function, a power-up or dropped is open.

## getting functions

- **You start with one or two functions**, maybe weak ones, and **win more by beating professors** (p4 15:36 to 15:59).

## concepts to teach (p2 06:41)

for loop, maybe while, if / else if / else. Nothing advanced.
