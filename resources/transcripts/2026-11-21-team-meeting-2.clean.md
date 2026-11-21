# team meeting part 2, 2026-11-21 (cleaned English)

Source: `resources/recordings/2026-11-21-team-meeting-2.m4a` (8:44, ends about 10:54 CST). Raw text: `2026-11-21-team-meeting-2.raw.txt`.

The team goes through `docs/open-questions.md` and answers it. Speakers aren't identified. Unclear words are marked `[?]`. Citations in docs use the form `p2 mm:ss`.

## turns and opponent

- 00:00 Reading out: turn-taking, or a cooldown timer like Plants vs. Zombies?
- 00:11 "**Turn-taking.** The Plants vs. Zombies kind of thing is too much, and it's harder for us to code."
- 00:27 PvP or AI? "**AI.** If the AI isn't capable, there should be another option [a fallback]. But we'll do AI. **AI native.**"

## the number, death

- 00:41 HP, score, or damage? "Score?" "I think it should be **HP**."
- 01:08 "If it goes below zero, do we die?" "Yes." "If it goes negative we die and **respawn**? Or just lose?" "Respawn." [Later, at 04:33, the turn flow ends with "whoever reaches 0 HP first loses". Not reconciled.]

## edge cases

- 01:25 ÷0, log 0, range 0, rounding.
- 01:31 "**Range 0 does nothing.**"
- 01:36 "**Divide by 0: you hurt yourself**, to teach you that you can't divide by zero." "Same for log 0." "Whenever you play one of those, a **glitch** happens, and the glitch hurts you. You lose health."

## mod and shields

- 02:01 "Mod: it's just a mod calculation." "Why add it?" "It significantly decreases the number." "**Mod is a good defensive card.**"
- 02:33 "How do our cards interact with the opponent's attacks? We should have **shields**."
- 02:49 "**Before the opponent's turn, you put something up as a shield.**"
- 02:53 "Should HP and shield be separate stats?" "Not necessary. **The shield is just a card, or a set of cards, that you put up to mitigate the effect.**" "So it's like a power card."
- 03:14 Example: "The opponent deals 10 damage. You put up a shield of **mod 2**, so it does 10 mod 2 damage. In the implementation: **calculate the opponent's damage, then apply your shield's operation to it.** If my shield is **÷4**, that's 10 ÷ 4 = **2.5 damage** to me."

## turn flow

- 03:44 "It's your turn. You put up an attack: some calculation that does damage or heals. **If it heals, it heals you. If it's damage, it's sent to the opponent, their shield is applied to it, and they take whatever's left.** Then the same the other way: the opponent builds an attack, you build a shield."
- 04:33 "**Whoever reaches 0 HP first loses.**"

## more cards

- 04:38 More CS cards: "**AI, you think about it. Please do.**"
- 04:44 Power-ups, a fourth group or items? "Red Bull for two turns. That should be a **fourth card group called Power Ups**."

## places and photos

- 05:01 "**MT is Meituan.**" [Aretha's chat message lists "Meituan, B5, B6, CDS 1".]
- 05:03 "**The food locker, maybe Aretha will take it. She gets floors 6 and 13.**"
- 05:08 "**13 is the professors' offices.**" "Don't add it, it's not needed." "But it's a **different layout**, so we have to take a photo." "I'll get the photo."
- 05:28 "What's floor 6?" "**A normal classroom.**"
- 05:35 "Final boss: **Leo the HKU lion**." "Yes."

## tour, tutorial, audience

- 05:41 "'Tour' on the board: a guided tour mode separate from battles?" "**In the first battle there should be a step-by-step guide.** A tutorial, like games have. We need a tutorial."
- 06:00 Address: "**Doesn't really matter.** You can check the Zhangjiang base address online."
- 06:07 "How do we teach the cards to parents in under a minute?" "That's exactly the problem." "Does it have to be parents? It's general: **first-time visitors.** We just make sure **the operations are simple enough**. **The game should be intuitive for a first-time player regardless of age.** It should introduce coding concepts like **for loop, maybe while loop, if / else if / else**, but nothing too complicated: no calculus, no differentiation, no Markov models."

## player, style, stack, demo

- 07:00 "Who are you?" "**A student.**" "Teachers are opponents, but not exactly: **they challenge you to check you're good enough.**"
- 07:21 "AI can do 3D." "No, too complicated. **Pixel art, 2D.** Based on the project I mentioned, **I'll give you the link.**" [reference link not in the recording]
- 07:40 "**Tech stack: you decide.**" [said to the builder / AI]
- 07:43 "Demo plan: **under 15 minutes.** There should be a demo video, or a **demo mode**. Yes, a demo mode."
- 08:00 "Do we want the expo spot? Discuss later. **Make it as complete as we can, as fast as possible, because we want the expo spot.**"
- 08:18 "**Make the layout as realistic as possible**, as detailed as possible, because we have photos of the buildings. **Large and very detailed, but pixel art, keeping all the details of the buildings.**"
