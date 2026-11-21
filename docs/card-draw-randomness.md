# Card draw randomness update

Aretha, 2026-11-21. The changes below were built and tested in the local game copy. They are in `game/src/battle/rules.ts` since 2026-11-21 (`drawOp`, `drawDigit`, `dealHand`, `refill`).

## Problem

Unused operator blocks remained in the hand indefinitely. A player who avoided `-` and `÷` could end up with both operator slots occupied by them, making the next move feel forced. The earlier draw weights also placed `-` ahead of `×`.

## Operator draws

The base relative weights are `+ : × : - : ÷ = 6 : 4 : 2 : 1` whenever all four are unlocked. A draw selects only unlocked operators, and the hand still holds at most one `×` and one `÷`.

After each completed move, an unused `-` or `÷` gains one stale turn. At two stale turns, that slot redraws from available `+` and `×` blocks. If neither is available, it redraws from the unlocked operators. Using a block resets its stale count and replaces it normally. This applies to both player and opponent hands. A skipped turn with no move does not trigger a refill.

## Digit draws

Digits remain 1–9, with every digit possible. Base weights per digit are 1 for 1–3, 2 for 4–5, and 3 for 6–9. The next digit is weighted using the rest of the current hand:

- If no remaining digit is 6–9, the weights for 6–9 double.
- If the hand holds `÷` and has no remaining digit 1–3, the weights for 1–3 double, making a small divisor more likely.

Initial digits are dealt one at a time, so later draws also see the digits already dealt. Refills consider the digits that remain and the operators after their refill. Shield numbers are separate and unchanged.

## Verification

`npm run build` passed locally. In 130,000 independent operator draws, observed counts were `+` 59,857, `×` 39,887, `-` 20,269, and `÷` 9,987. A hand containing only `-` and `÷` rotated both slots after two unused moves; randomized checks kept the one-each limit for `×` and `÷`.
