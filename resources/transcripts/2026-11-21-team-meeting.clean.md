# team meeting, 2026-11-21 (cleaned English)

Source: `resources/recordings/2026-11-21-team-meeting.m4a` (30:02). Raw machine text: `2026-11-21-team-meeting.raw.txt`.

This is the raw transcript with filler, false starts and cross-talk removed, and obvious mishearings fixed. Anything I couldn't make out is marked `[?]`. Speakers aren't identified, so a new line means a new turn and doesn't tell you who's talking. The organisers' briefing (02:30 to 15:05) is shortened but every fact from it is kept.

## 00:00 to 02:30, whiteboard: buildings and floors

- 00:00 "I wrote it messy on purpose."
- 00:07 We need to go out to the facilities. Building 5. Just one building 5.
- 00:20 These are the main things we need to do.
- 00:26 This one is the grand hall building. This one is small. This one needs a few floors.
- 00:35 For this one we only focus on things we find interesting. Maybe the second floor and the study area.
- 00:45 Study area and stairs. "Oh, we can make stairs, that'd be interesting."
- 00:52 "I think we can scan [?]. It's only five floors [?]."
- 00:56 Second floor, third floor... "stairs actually means the one stage [?]".
- 01:11 [CDS1, per the board] lobby, and just one floor. First floor, second floor. "We can copy for the other floors."
- 01:33 [B6, per the board] the hall, and the senior common room.
- 01:42 Counting floors: "1, 2, 3 ... 10, and we need to make one [?]."
- 01:52 "We can just take a video of it, that's all we need."
- 01:58 And then we have the game part.
- 02:09 Avatars [unclear joking, "Dumbledore"].

## 02:30 to 15:05, organisers' hackathon briefing (condensed)

- 02:38 Introductions: Alan, a lecturer and the person in charge of the lab. Brian, another lecturer. Tristan, a TA. An IT staff member whose name is heard as "Starix" [?]. Ling gives the briefing.
- 03:05 Alan: welcome to the "vibe coding lab". The server rack in the room runs DeepSeek V4.1 Flash, unquantized, on four clusters of four machines. Results will sometimes be great and sometimes terrible.
- 04:13 The pods have a large monitor. They're meant for "mob coding": coder, rubber duck and navigator, with AI replacing one of the humans. Teams are four people, "so at least one of you gets to be the rubber ducky".
- 06:15 Theme: **"Your campus, your game."** Build a **playable campus exploration game** for first-time visitors, including offer-holder students [heard as "O-level students"] and their families and friends visiting the HKU Zhangjiang base. The goal is to make the visit easier, more engaging and fun: help visitors find their way, discover things about the campus, hide details for them to find.
- 07:05 You choose the genre and visual style. Pixel-art RPG was given as an example only.
- 07:19 You can use the local DeepSeek V4.1 Flash on the server racks to help build the game.
- 07:40 **Stop working at 4 pm.** Then live demos. Alan and Brian judge, and there's also peer review.
- 08:12 You can use strong outside models too ("Fable 4.2 [?]" and others). The AI model is a small part. What counts is details, clear interactions and your own design that make the campus recognisable: "give someone a reason to smile and explore".
- 09:03 Monitors, keyboards and a local LLM key are provided. Test before the demo.
- 09:21 **About 15 minutes per presentation.**
- 09:31 **Assessment: 40% peer, 60% judges (Alan and Brian), based on design, implementation and presentation.**
- 09:49 Each person gets two emails: an invitation to the usage dashboard (logs and token usage) and a personal API key. Keep the key private. Tokens are unlimited today.
- 10:51 Connect to the campus network "HKU Shanghai". Base URL is the lab gateway IP. One model name: V4.1 Flash.
- 11:27 Suggested coding agents (heard as Hermes, DeepSeek-something, OpenCode, Cline); you can use your own. Each group has a setup slide. Agent questions go to Ling, network questions to IT.
- 13:47 Alan: this is the first hackathon of a series. **At least one team will be picked to present at a large technology expo in mainland China** (name confidential), but only if they want to.

## 15:05 to 18:15, avatars and the card system

- 15:21 Let's continue with the game elements.
- 15:37 **Avatars.** It depends on how much we have per floor. We can AI-generate the avatars from the CDS teacher list: take a picture of the teacher list and use it. "Just choose people that wouldn't cause trouble." We don't need many.
- 16:09 "Maybe the student list?" "No, no students." Leave it for later.
- 16:28 "Tell us about the game flow first, that's the most important thing."
- 16:39 The idea: there are a few kinds of cards.
  - **Digit** cards.
  - **Math** cards, meaning arithmetic.
  - **CS** cards, about logic and control.
- 17:10 Digit is simple: 0 to 9. You **can't group digits**, so 1 and 9 don't make 19. "You can only use one digit card at a time. That makes more sense and is easier for us to code the logic."
- 17:35 Math: the four arithmetic operations [heard as "4 chematics"], plus/minus, and **power (exponential)**.
- 17:52 "If there's an exponential, there should be a **log**, so all the inverse operations are there and things can cancel out."
- 18:14 "The CS part is the difficult part. That's where most of the mechanics come in."

## 18:15 to 21:20, what the cards do

- 18:22 "The basic idea is **maximising the number**." **Plus is heal, minus is damage.**
- 18:41 **Multiply and divide increase or decrease how much you heal or damage.** For example, you have +1 and multiply by 2, so now it's +2.
- 18:51 "These are randomly chosen [the cards you get], because we're building an equation from the inventory [?]." "Yes, exactly. Our goal is maximising the number."
- 18:59 "What about the CS cards?" "Same thing. There's probably an agent running on the other side doing the same." "So it's almost like a **trading card game**." "CS is the enemy?" "No, CS is another kind of card."
- 19:24 "This is the part that makes it interesting." Someone suggests a **Big O** card [no follow-up].
- 19:51 "This is where we can have fun thinking up special cards, or we can ask AI."
- 20:02 Example: a **for loop**. "The one I first thought of was a for loop. It's basically a **repeat card**. If you have `for`, it automatically takes a range."
- 20:20 "What about mod?" "We can think about it. Mod is more of a math thing."
- 20:27 You put a digit in the slot and then an action. **"For range 3 do +2: you heal yourself by 2, three times."** "That's the same as multiplication."
- 20:54 "The special thing is that **the action doesn't have to be a number. You can put another CS card in it.**" "So you can double a for."
- 21:05 "So we'll have `if` and so on. We can just ask AI to fill that out and add some complicated algorithms."

## 21:19 to 23:10, match structure

- 21:19 "We'll do A versus B." "How does the fight work?"
- 21:32 "A versus B, so it's **multiplayer**, and A and B **take turns**."
- 21:48 "What about **competing with AI**? We have unlimited AI, so an AI agent could be the other player."
- 22:07 "Taking turns and attacking each other is a bit..." "What about a **timer**, like those games where you play a card and then have to wait before you can play again?" "Like Plants vs. Zombies. You click, then you can't click for five seconds."
- 22:25 "I thought it'd be: you draw a card and throw a card away." "But they take three [?]."
- 22:40 "Maybe at the start you **draw about five**, and **whatever card you use, you replace it straight away**."
- 22:55 "It'd be interesting if instead of plain turns we had cards that **skip the other player's turn**." "Yes. So **break, or pass**. Continue."
- 23:07 "We can give the whole idea to AI and ask its opinion."

## 23:10 to 26:40, education angle, buildings and story

- 23:14 "The interesting question is **how we explain this to people who don't code, like the parents**. I think that's the most important part."
- 23:29 "I really like the idea, but it'll be **confusing for first-time visitors**, so we need to explain it up front, really well."
- 23:42 "Present it as a **coding education game based on the CDS1 building**. There should be an explanation and **examples** so people know how it works. Our point is coding education."
- 24:04 "If we split it by building, **each place should have something special**." "It's the experience of learning to code in CDS1, the same as being a student at CDS."
- 24:22 "What I originally pictured: **CDS1 is the main fighting ground**."
- 24:38 "Somewhere in CDS1 **you get a key that unlocks Building 5**."
- 24:46 "**Building 5 is where you get power-ups.** You go to the **gym**, you get stronger. You **study**, you get new cards. The **locker [?]**: you get **food**, you get new power, health. Maybe not just CS cards, maybe another kind that's just power-ups. Like **Red Bull: you get two turns**."
- 25:10 "What about the hall?" "That's the **last stage**." "Or the dorm?" "No, the **grand hall**. The grand hall can be the **final boss**."
- 25:23 "Final boss: [a person's name, heard as Jiangshan / Zhang Shan / Changshan]." "We'd have to replace him when he retires."
- 25:39 "No, make the final boss the **HKU lion**." "**Leo the Lion**." "It has a name? It's on my script [?]."
- 25:48 "I don't think it's good to fight the professors, like they're evil." "We're challenging the professors because they teach. The storyline is more that **you challenge the professors so they can make sure you're strong enough** to go on."
- 26:13 "Should we split it into training and survival? Like make a portal and they fight in the middle of Shanghai?" "That might be a bit too much. We can't scan Shanghai."
- 26:39 [Banter about a teammate, Bosco.]

## 26:49 to 30:02, how we work from here

- 26:51 "How do we start?" "Take a photo of this [the whiteboard] and ask AI." "I've recorded everything, so we have it."
- 27:06 "I think we should have **one repository for the prompt**: all the recordings, all the opinions, all the prompts. We combine them and build it in **one shot**." "Where?" "**GitHub**, so we can work on the prompt together and let the AI build while we're at lunch."
- 27:38 "First, send this to AI and define it. Then set up the unlimited AI." "**The unlimited AI goes into the game, so the AI agents play the game.**"
- 27:59 "I can take photos of the buildings fast." "We can **split the buildings between us**."
- 28:20 "Set up the repo, set up the AI. I'll do the initial prompting and **invite you to the GitHub**. I'll send the photos to you." "Everyone send your email to the chat, for GitHub."
- 28:55 "I'll take photos and send them to the group." "You can **take video** as well." "It can read video?" "Mm-hmm."
- 29:07 "So: make one GitHub repository, wait for the teammates' emails, and get everyone invited. We're making a **prompt repository**, and we'll **hand it to Fable later**."
- 29:46 "What other opinions do we have on the ideas?"
