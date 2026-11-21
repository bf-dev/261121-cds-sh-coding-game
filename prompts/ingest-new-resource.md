# ingest a new resource

```
A new file was added: <path in resources/>.

1. If it's audio or video, transcribe it with timestamps into resources/transcripts/<same-name>.raw.txt, plus a cleaned English version (<same-name>.clean.md) in the style of the existing cleaned transcript.
2. Add a line for it to the index in resources/README.md.
3. List every design point it contains. For each one: does it confirm, change or add to something in docs/? Cite the timestamp or describe where in the photo.
4. Update the relevant docs/ files, docs/decisions.md and docs/open-questions.md. Mark anything unagreed as a proposal.
5. Show me the diff summary before committing.
```
