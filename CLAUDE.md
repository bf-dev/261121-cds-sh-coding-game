# CLAUDE.md

This is the shared repo for a hackathon team building a **coding education card-battle game set on the HKU CDS Shanghai campus** (CDS-SH "Your campus, your game" hackathon, 2026-11-21, demo at 4 pm). Several teammates work here with Claude Code. The repo holds the design and the prompts first. The game code gets added once the concept is ready.

Start with `docs/overview.md`.

## repo map

```
CLAUDE.md                 this file: rules for anyone (human or Claude) working here
README.md                 short intro for humans
docs/                     the design, one concept per file
  overview.md             the main idea, links to everything else
  hackathon-brief.md      organisers' rules: theme, audience, 4 pm deadline, judging
  map-and-campus.md       buildings, floors, real places
  progression-and-story.md  CDS1 -> key -> Building 5 power-ups -> grand hall boss
  game-flow.md            A vs B, turns, hand, opponent AI
  cards-digits.md         DIGIT 0-9
  cards-math.md           + - x ÷ ^ log (mod)
  cards-cs-logic.md       for, break, more control cards
  cards-power-ups.md      Red Bull and other power-ups
  art-style.md            2D pixel art from real photos
  avatars.md              who appears in the game
  education.md            explaining it to non-coders
  decisions.md            settled points, each with a source
  open-questions.md       everything not settled yet
buildings/                the campus, distilled from all photos and video: one folder per place
  README.md               index and how to use it
  outside/                site, roads, plaza, footbridge, lawn + lion, lockers, gate
  cds1/                   CDS1 tower: entrance, lobby, floor guide, floors
  b5/                     Building 5: hall, lobby, amenity floor, 5/F, 6/F
  b6/                     dining cluster / senior common room (building unconfirmed)
  grand-hall/             the final boss room: auditorium, LED wall, stage
prompts/                  reusable prompts, one task per file, built on docs/ and buildings/
game/                     the playable game (TypeScript, Vite). README.md = run, DESIGN-CHOICES.md = defaults picked
resources/                raw material, kept as real files (see resources/README.md)
  recordings/             meeting audio (Git LFS)
  transcripts/            raw + cleaned transcripts
  photos/                 whiteboard and building photos
  videos/                 building walk-throughs (Git LFS)
```

## sources of truth

1. Meeting recordings in `resources/recordings/`: part 1 (30 min: whiteboard, hackathon briefing, core design), part 2 (9 min: answers to the open questions), part 3 (10 min: logistics while filming, little design), part 4 (20 min: revised battle rules, **overrides parts 1 and 2 where they differ**). Cleaned transcripts are `resources/transcripts/*.clean.md`, raw ones are `*.raw.txt`.
2. `resources/photos/2026-11-21-whiteboard.jpg`, the whiteboard from that meeting. A line-by-line reading is in `resources/README.md`.
3. Campus photos and video in `resources/photos/` and `resources/videos/`. **Use `buildings/` instead of the raw videos**: every place has its keyframes and a README there. Open a video only if `buildings/` is missing something, and then add what you found to `buildings/`.
4. Anything a teammate adds later: a new recording, photo or chat export goes into `resources/` first, then into the docs.

The docs come from these sources. If a doc and a source disagree, the source wins. Fix the doc.

## rules

- **One concept per file.** A new mechanic, building or system gets its own file in `docs/`, linked from `overview.md`. Don't make one big design doc.
- **Cite the source for every design claim**: `(mm:ss)` for part 1, `(p2 mm:ss)`, `(p3 mm:ss)`, `(p4 mm:ss)` for later parts, `board`, or the new resource file. If you can't cite it, it isn't a decision. Put it in `open-questions.md` or mark it as a proposal.
- **Don't invent design.** Ideas from Claude or a teammate are welcome, but label them `proposal (<name>, <date>)` until the team agrees.
- **When the design changes, update the docs in the same commit**: the concept file, plus `decisions.md` or `open-questions.md`. A settled question moves from open-questions to decisions.
- **Prompts in `prompts/` reference docs, they don't copy them.** Tell the model which doc files to read, so prompts don't go stale.
- **Raw files stay raw.** Don't edit recordings, photos or raw transcripts. Corrections go in the cleaned transcript or the docs.
- **No secrets.** The lab API key, gateway IP and dashboard passwords go in a local `.env` (gitignored), never in a commit.
- Plain wording, short lines, no filler.

## working together

- Pull before you start (`git pull`). Commit small, push often. Prefixes: `docs:`, `feat:`, `fix:`, `chore:`.
- Branch `main`. Short-lived branches are fine if two people edit the same doc.
- Audio and video use Git LFS (`.gitattributes`). Run `git lfs install` once.
- Name new resources `YYYY-MM-DD-what.ext` or `<building>-<floor>-<what>.ext`, and add a line to `resources/README.md`.

## the game: build and run

The game is in `game/`: a TypeScript browser game (Vite, canvas, no engine), built on 2026-11-21 from `prompts/build-game.md`.

```
cd game
npm install          # npm install --include=dev if NODE_ENV=production is set
npm run dev          # http://localhost:5173
npm run build        # typecheck + static files in game/dist
npm run preview      # serve the build
```

- It plays with no `.env` (rule-based opponents). For the lab model copy `game/.env.example` to `game/.env` and fill in `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`. Details in `game/README.md`.
- Battle pieces are **Scratch-style blocks**, not cards or code text (decision #29).
- Every default the builder picked is in `game/DESIGN-CHOICES.md`, labelled as a proposal. When the team keeps one, move it to `docs/decisions.md`.
- Rules live in `game/src/battle/rules.ts` (no DOM). Blocks, rewards and pop-up texts are data in `game/src/data/`. Maps are drawn in code from `buildings/` in `game/src/maps/`. If a doc changes a rule, change these and the doc in the same commit.
- Presentation: `Demo mode` on the title screen plays a full match by itself; `Level select` jumps to any floor or the Grand Hall.
- Story, professors and their lines are in `game/src/data/professors.ts`. The lineup follows `docs/professor-levels.md`.
- Story (decision #45, `docs/visitor-journey-story.md`): an invited visitor. New game plays a short opening film, starts at the welcome dinner in Building 5 1/F, then 14 mentors in CDS-1 (stamp, block and postcard each) and Leo's final challenge. Postcard facts and the optional lab questions are in `game/src/data/labs.ts`. `Sandbox mode` on the title screen has no battles.
- Background music is the HKU anthem as a chiptune rendered from the score: `game/src/assets/hku-anthem.mp3` (renderer and sources in `resources/audio/`).
- The HKU logo is the official file in `game/src/assets/` (from hku.hk). Never redraw it; use `crest()` / `logoFull()` from `game/src/art/logo.ts`.
- Online copy: https://insu.ng/cds/ (static build, rule-based opponents), republished with `game/scripts/deploy-insu.sh` on Insung's server.
