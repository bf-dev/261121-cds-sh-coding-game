# Code Climb · 编程闯关

The hackathon game: a block-coding battle game on the real HKU CDS Shanghai campus. Browser, TypeScript, canvas, no game engine. All art is drawn in code as pixel art (no photo textures).

## run

Needs Node 20 or newer.

```
cd game
npm install
npm run dev          # http://localhost:5173
```

On a machine where `NODE_ENV=production` is set, use `npm install --include=dev`.

Static build (any static file server can host `dist/`):

```
npm run build
npm run preview      # serves dist/ on http://localhost:4173
```

## the AI opponent (.env)

The game is fully playable with no `.env`: every professor then uses the built-in rule-based AI.

To let the professors think with the lab model, copy `.env.example` to `.env` in `game/` and fill it in. `.env` is gitignored, never commit it.

```
LLM_BASE_URL=http://<lab-gateway-host>:<port>/v1
LLM_API_KEY=<your personal lab API key>
LLM_MODEL=deepseek-v4.1-flash
```

- Restart `npm run dev` (or `npm run preview`) after editing `.env`.
- The browser calls `/llm/chat/completions`; the Vite server forwards it to `LLM_BASE_URL` and adds the key there, so the key never reaches the page.
- This proxy only exists in `npm run dev` and `npm run preview`. A plain static host of `dist/` has no proxy, so it uses the rule-based AI.
- The model is asked at the start of each round, while the player is thinking. If the answer is missing 2 seconds after it is needed, is not valid JSON, or is an illegal move (blocks not in the hand, too many operators, a zero divisor), the rule-based move is played instead. The Menu shows which AI is active.

## controls

| | |
| --- | --- |
| walk | arrow keys or WASD, or the pad on screen |
| talk, open, lift | Space (or Enter, E, or tap the prompt) |
| attack | click blocks: ATTACK or HEAL, a number, then operator and number pairs, then the green flag |
| defend | pick a shield block, tap shield numbers into its empty slots, press Plant. Or `No shield` to save the block. Blocks and numbers are limited per battle |
| Bag | your blocks, with a picture of each |
| Menu | demo mode, level select, title |

## for the presentation

- **Demo mode** (title screen or Menu): plays a full match against Leo in the Grand Hall by itself. `?demo=1` in the URL starts it straight away. `&speed=2` runs it faster.
- **Level select** (title screen or Menu): jump to any floor, or to the Grand Hall, with the blocks you would have by then.
- **Online**: https://insu.ng/cds/ serves the static build (rule-based opponents). `scripts/deploy-insu.sh` rebuilds and republishes it; it only works on Insung's server.
- In a battle: `Speed` cycles 1x, 2x, 3x. `Show Python` shows each block as a line of Python.
- Progress is saved in the browser (localStorage). `New game` wipes it.

Debug links (never touch the saved game):

```
?map=outside&spawn=start        any map: outside, cds1-1 .. cds1-14, b5-1 .. b5-5, hall
?map=cds1-6&tp=10,8             teleport to a tile
?battle=5                       fight floor 5 with a floor-5 kit      ?battle=boss
?battle=5&auto=1&speed=3        let it play itself
?sheet=all                      every character sprite and portrait
```

## layout

```
src/main.ts            game flow: title, HUD, lift, rewards, stations, demo mode
src/state.ts           progress, HP tables, save
src/engine/            types (map contract), world (walk, camera, depth sort, triggers)
src/battle/rules.ts    the rules, no DOM: expressions, shields, hands, rule-based AI
src/battle/blocks.ts   Scratch-style blocks as DOM
src/battle/ui.ts       the battle screen, tutorial coach, demo autoplayer
src/battle/llm.ts      the model opponent and its validation
src/data/              blocks and their pop-up texts, rewards per floor, professors
src/maps/              outside, cds1 (14 floors), b5, grandhall: drawn from buildings/
src/art/               pixel helpers, chibi characters, the official HKU logo loader
src/assets/            HKU logo and crest (SVG, from hku.hk)
```

Design defaults picked during the build are in [DESIGN-CHOICES.md](DESIGN-CHOICES.md).

Fonts: SungSans (Latin) and Noto Sans CJK SC (Chinese), subset to the characters the game uses. After changing any Chinese text run `npm run fonts` (needs `fonttools` and `brotli`, and the two source fonts on the machine).
