# team meeting part 5, 2026-11-21 afternoon (cleaned English)

Source: "Fangchun Road 11.qta" (Apple Voice Memo, 33:52). Raw text: `2026-11-21-team-meeting-5.raw.txt`. Cite as `p5 mm:ss`. The audio is not in the repo; a converted copy is in `~/workspace/tmp/cds-recordings/audio/Fangchun-Road-11.mp3` for now.

The team sits with the builder (the AI agent) and works through **professors as bosses**: which professors, what function each one teaches, and how those functions stay inside the battle rules. Long stretches of chatter, laptop admin and Whisper loops on silence ("the game is based on the original game", 26:44 to 31:52) are left out. Speakers aren't identified. Unclear words are marked `[?]`.

## what was decided here

- 17:40 There are **practice trainers between the professor bosses**, like Pokemon trainers before a gym leader.
- 19:14 **RB Law, Allen, "Yima" and Brian** must appear in the lineup; real professor names are allowed for now (19:00).
- 20:00 Each professor gets a **unique function or power-up, awarded to the player after beating them**.
- 20:23 **No pop quiz.** Ask the professors about CDS instead (20:29).
- 26:09 **A professor's attack must use the game's own mechanics**, not a special move outside them. Same for their unique function (28:43 to 29:06).
- 27:12 The battle pieces are **block coding like Scratch**, not cards, so non-CS players can read them.
- 33:00 Each professor introduces a **new function from Python or C++** (e.g. `break` skips a turn) that the player keeps after the win.
- 13:16 "Random grading" becomes a **random function used as a defensive card**: a random number less than or equal to the damage coming in.

## the job: professors first (00:00 to 05:00)

- 00:00 "Let's get started with the **professors and their skills**. Where do we start from? Basic programming."
- 00:19 "Are we talking about the defence? Like `for` loop?"
- 00:34 "We are making a campus game." "Wait, not campus game."
- 00:42 "Do we need to give them the full context from here?" "We have a prompt in here, right? ... We have GitHub repos. **Give them the GitHub repository.**"
- 03:32 "Get HKU, give me a list of HKU professors and choose the ones that look the most appropriate." "No, get a list of **HKU CDS professors**." "It can just be HKU professors." "I don't think Shanghai location matters."
- 04:05 "We need to exercise human creativity to think of **10 potential functions** that professors could have."
- 04:15 "One idea was **vibe code**: a power card where it finds the maximum output for you. In the game you can send to AI: **find the best option, the best combination** we can make."
- 04:42 "Ruibang Luo should be strong." 04:49 "How about Dr. Alan? We need him here." 04:56 "Can we make **Ema** the last boss?"
- 05:38 "Come up with 10 mini-games for this- no. Come up with 10 paragraphs of cards that you can get from- ... **or 10 functions**." 05:50 "So you get all the functions and power-ups from [the professors]."
- 05:59 "I had an idea of the **summation symbol**."

## it has to work for non-CS players (07:14 to 08:08)

- 07:39 "How is that non-CS?" 07:51 "**How is it so that non-CS students can play it?** It's for general non-CS students."
- 08:02 "It has to be called like `recurs`[?] and there has to be **a description of what it does**."

## reading the draft: pop quiz, hints, random grading (12:16 to 13:43)

The team reads a draft the builder wrote.

- 12:16 "[?] This is your task: if you cannot damage minus 5 ... I had it: when was HKU founded?"
- 12:42 "**The time limit should decrease**, like from 10 seconds to 5 seconds."
- 12:53 "Friendly professors offer a hint or bonus." 12:58 "**Random grading** is a good idea, but I think we can make it more complex, so we can make it like a **random function**." 13:03 "Block repeated use of bytecode. AI detection."
- 13:16 "For random grading, we can change it to like a **random function**. Make the name more CS but the concept is the same, so **it can be used as a defensive card**: change it into like a **random number less than or equal to the actual damage value**."
- 14:42 "What is **RNG Shield**?" "Oh, defensive..." (the name in the draft)

## cards need levels, and trainers before bosses (16:06 to 18:31)

- 16:06 "The power-ups we have, the ones they provided, are all at the same level. **We need different levels of cards**: some cards are **higher risk** to use, some are **more difficult or complicated concepts**."
- 17:24 to 17:43 "Between every single professor boss, should we have almost like **Pokemon**? **You need trainers leading up to the gym leader. So we need some trainers you can practice on.**"
- 17:47 "Help me make the **game flow**." 18:13 "We need to first decide **which professor is on which floor**." 18:31 "Does it know already that the professors are the **bosses of each level**? We were thinking to get the prof as the boss of each level."
- 18:46 "Level 1-4 in CDS1."

## professor lineup and what each one gives (19:00 to 20:40)

- 19:00 "**Don't use real names, though, right?**" 19:07 "**Let's let them use real names for now.**"
- 19:14 "For each level, must have **RB Law, Allen, and Yima, and Brian**."
- 19:36 "Design possible functions. **Power-ups and functions that are unique to each professor, awarded to the player once they beat them.**"
- 20:17 "So they can pop quiz too?" 20:23 "**No, let's not have that. Maybe not pop quiz. I don't think we should have pop quiz.**"
- 20:29 "How about **you could ask the professors about CDS at HKU Shanghai**?" 20:36 "You could ask Lam[?] about the history of ...[?]"

## professor moves must obey the battle rules (25:59 to 29:28)

- 25:59 "I like these ideas, but the issue is, **will the player be confused: hey, why can't I do that?**"
- 26:09 "**The professor's attacks also need to be within the game's mechanism.** They cannot just be like **Kamehameha**, super ultimate attack power-up, and do something that's **outside the game's logic and core mechanism**."
- 26:39 "The starter pack is **attack, heal, plus, minus**."
- 28:43 "The special unique functions that each of the professors use **need to be also within the basic scope of the game**. There can be special effects, but the **player needs to understand how the professor comes up with that function**. It has to **align with the core mechanics**."
- 29:06 "Can you update the draft of the different unique functions each of the professors have now?" 29:23 "**The GitHub doesn't have professor lists.**" 29:28 "**We'll just make a map first.**"

## change the request: scratch blocks (26:54 to 27:24)

- 26:54 "You know, like **Scratch**."
- 27:12 "For the different cards and the attack mechanism, **instead of making it actual cards, make it block coding, like Scratch**, to make it a little bit easier for non-students to understand."

## change the request: one new function per professor (32:43 to 33:47)

- 32:43 "Currently all of these use the `for` loop, random, etc. **I want to introduce a new function** that can be used with each of the professors, and **after they beat the professor the function can be acquired by the user**."
- 33:11 "The function should be more or less **related to computing and data science**. Take reference from **common functions used in programming languages such as Python and C++**."
- 33:34 "For example, the **`break` keyword in Python, used to skip a turn**."

## also said, not game design

- 24:53 "We should get **professor photos**." 25:07 "**Taku Komura**." (the team laughs that "Komura" sounds like a shield word)
- 25:24 "The floor is a creative lab. No, it's a **vibe coding lab**." (the builder described the floor wrongly)
- 29:43 to 30:43 VPN talk, no game content.
- 16:00 to 16:05, 23:11 to 24:13 personal banter, left out.
