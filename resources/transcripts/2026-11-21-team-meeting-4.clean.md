# team meeting part 4, 2026-11-21 (cleaned English)

Source: `resources/recordings/2026-11-21-team-meeting-4.qta` (19:31, ends about 11:14 CST). Raw text: `2026-11-21-team-meeting-4.raw.txt`. Cite as `p4 mm:ss`.

The team works through the battle rules again at the whiteboard. **Several rules from parts 1 and 2 change here.** Speakers aren't identified. Unclear words are marked `[?]`. Banter at 06:09 to 06:41 is left out.

## if needs comparisons (00:00 to 01:46)

- 00:00 "We need **comparatives**: less than, greater than, less-or-equal, greater-or-equal."
- 00:12 "The `if` card's action should be **specific**. Not that much flexibility." Example: an `if` that does a fixed thing, like zero damage.
- 01:04 "My original idea for `if`: you **guess how much damage your opponent is about to do**. So `if damage > 5` then you take less. The point is to **build your system before the attack**."

## turn cycle (01:52 to 03:10)

- "A is you, E is the enemy. **A moves: attack or heal. At the same time, E plants a shield.**"
- "**If A attacks, E's shield activates** and E takes less damage depending on the attack. **If A heals, it goes straight to A** and the shield does nothing."
- "Then the same thing the other way."

## HEAL and ATTACK become base cards (03:14 to 07:19)

- 03:21 "Heal is just plus, attack is minus." "But we said all cards come from **drawing**. **If you don't draw a plus or minus, you can't heal or attack.**"
- 04:01 "Maybe plus and minus are the basics everyone always has."
- 04:52 "It's hard to explain to people that **plus is for yourself and minus is for the other person**. Use different buttons."
- 05:22 "**Make it strictly HEAL and ATTACK.**" "Then **plus and times become modifiers.** Heal 3 + 2, attack 3 × 2. All the operators can be used."
- 06:43 Summary: "Instead of plus and minus for heal and attack, use the actual words **HEAL** and **ATTACK**. That's the baseline. Two problems before: if you didn't draw them you were stuck, and plus/minus was confusing. **HEAL and ATTACK are now a basic operation you always have. Plus, minus, multiply, divide are operators.**"

## move format (07:21 to 11:01)

- 07:21 "The format of a move: **first HEAL or ATTACK, second one digit, then an operation.** The operation can be `+2`, `-3`, `+2 ×5`, `×6`. Always this format."
- 09:01 "Every time you get a **new card, it pops up and says: this is your new card, this is what it does, this is equivalent to ...**"
- 09:33 Sketch: you lay down **ATTACK or HEAL**, then the **base digit** (how much you heal or attack), then you build an operation. Example: **ATTACK 8 + 2 × 3**.
- 10:31 "Down here you have a **panel with your inventory**, a bunch of cards."
- 10:45 "It evaluates: **that's 14**. So you deal 14 damage."

## functions are for defence only (08:02 to 11:49)

- 08:02 "To make it simpler, **functions are only for defence. To defend, you must have a function.** You can't use a function in the attack; the attack is always a plain number and a math operation. So you can't say `for range 3, attack 3 times`."
- 11:05 "The opponent can set up a **shield, but it must be a function**. For example a for loop: **`for range 3: -2` = -6**, so the 14 attack becomes **14 - 6 = 8**."
- 11:36 "**Times 0 is not a function.** It has to be a for loop or an `if`." Example: "**if damage > 5 then -5**."

## where cards come from (12:07 to 13:45)

- 12:11 [aside] "You go to the senior common room." "I have the video."
- 12:17 "Do they choose their functions and operations before the game?" "At the start of every round, **random**." "Otherwise they'd always know the best combination."
- 12:51 "**The digits and operators you get are random, and they change after you use them.**"
- 13:10 Example: you only have 1, 1, 1, +, +. Then the best you can do is 1 + 1 + 1 = 3 damage.
- 13:28 "Should there be a **maximum length** for the operation?" "**Six symbols.**"

## levels = CDS1 floors (14:00 to 15:16)

- 14:13 "Six slots, or **more space as the level increases**, so it gets more complicated." "At first maybe two."
- 14:35 "How do we use the map? **On higher floors you meet harder, smarter professors.** CDS1: lobby, then **floor 1 = level 1, floor 2 = level 2, so 14 levels**."
- 15:05 "**After 14, you go to the grand hall and fight the lion.**"

## getting functions (15:32 to 15:59)

- "You start with **one or two functions**, maybe weak ones, and **win more by beating bosses**."

## remove zero (16:00 to 17:18)

- "**Zero is the source of all our problems.** Times 0 is overpowered, and you can't divide by 0 or take log 0. **Remove the number 0 from the game.**"
- "They can still make zero, like 1 - 1 or log 1, so **the game must check that numbers are non-zero**, especially for those operations."

## brackets and input (17:27 to 18:22)

- "**Should we have brackets?** 2 + 3 × 5 vs (2 + 3) × 5 is 17 vs 25 damage." "Sure." "How would brackets take up space?"
- "Maybe it's **like a normal keyboard**: as the level goes up you get more numbers and symbols to choose from, and it's up to you how to use them. **We don't need to fix it at six.**" [conflicts with the six-symbol cap at 13:28; not settled]

## power-ups (18:22 to 19:03)

- "**Power-ups are simple: use one at the start of the round, before you attack, if you want.**"
- "A few kinds: **extra turn**, **extra HP**."
