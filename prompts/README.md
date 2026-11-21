# prompts

Reusable prompts for building and iterating the game. One task per file. Each one points the model at `docs/` rather than repeating it, so when the docs change the prompts stay current.

How to use: paste the prompt into Claude Code (or another model) from the repo root, filling in the `<...>` parts. If a prompt's output changes the design, update `docs/` (see CLAUDE.md).

| file | use it to |
| --- | --- |
| `concept-brief.md` | get a one-page pitch of the game from the docs, e.g. for the demo or for a teammate who missed the meeting |
| `build-game.md` | the one-shot build: hand the whole repo to a strong model and get a playable game |
| `card-design.md` | design or balance cards, and propose new CS cards |
| `building-level.md` | design one building or floor as a level |
| `ai-opponent.md` | spec the AI player that runs on the lab's local model |
| `tutorial-for-visitors.md` | design the first two minutes for a parent who has never coded |
| `avatar-art.md` | generate avatar art for staff and the boss |
| `campus-location-art.md` | turn building photos into game backgrounds |
| `ingest-new-resource.md` | fold a new recording, photo or chat into the docs |
