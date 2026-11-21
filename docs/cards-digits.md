# DIGIT cards

Whiteboard: "DIGIT 0-9". Sources: part 1 17:10 to 17:24, part 4 16:00 to 17:18.

- **Digits are 1 to 9. Zero was removed from the game** because it caused every edge-case problem (×0 too strong, ÷0 and log 0 undefined) (p4 16:00 to 16:56). This replaces the board's 0 to 9.
- **One digit card at a time, no concatenation**: 1 then 9 is not 19 (17:10 to 17:24).
- **Every move starts with one base digit** right after HEAL or ATTACK: `ATTACK 8 ...` (p4 07:36 to 10:06).
- Digits also go into operators (`+ 2`, `× 3`) and functions (`for range 3`).
- **Your digits are drawn at random and change after you use them** (p4 12:51 to 13:09).
- Players can still produce zero mid-expression (1 - 1, log 1), so **the game must check for a zero value** before dividing or taking a log (p4 16:56 to 17:18).
