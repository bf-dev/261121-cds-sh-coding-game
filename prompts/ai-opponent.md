# AI opponent

```
Read docs/game-flow.md, docs/cards-*.md and docs/hackathon-brief.md.

Spec the AI opponent that runs on the lab's local model (DeepSeek V4.1 Flash, OpenAI-compatible API, unlimited tokens, sometimes slow or wrong).

Cover:
1. The game state the AI gets each turn (compact JSON) and the move format it must return.
2. The system prompt for the AI, including a per-opponent personality (e.g. a professor who explains the code concept behind its move in one line).
3. Validation: what happens if it returns an illegal move or times out (fall back to a rule-based move within 2 seconds).
4. Difficulty levels.

Output the spec plus the actual prompt text. Never include real API keys. Read them from .env.
```
