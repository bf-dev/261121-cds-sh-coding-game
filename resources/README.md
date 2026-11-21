# resources

Raw material. Files here are kept as they were captured. Interpretations go in `docs/`.

## index

| file | what it is |
| --- | --- |
| `recordings/2026-11-21-team-meeting.m4a` | Team meeting at the CDS-SH vibe coding lab, 2026-11-21, starting about 09:58 CST, 30:02 long. 00:00 to 02:30 is the whiteboard session (buildings). 02:30 to 15:05 is the organisers' hackathon briefing. 15:05 to the end is game design and workflow. Git LFS |
| `transcripts/2026-11-21-team-meeting.raw.txt` | Machine transcript with mm:ss timestamps (Whisper large-v3, unedited, one spoken password removed) |
| `transcripts/2026-11-21-team-meeting.segments.json` | Same transcript as JSON segments (`start`, `end` in seconds, `text`) |
| `transcripts/2026-11-21-team-meeting.clean.md` | Cleaned English version, grouped by topic, with timestamps. Use this for citing |
| `recordings/2026-11-21-team-meeting-2.m4a` | Part 2, 8:44, ends about 10:54 CST. The team goes through `docs/open-questions.md` and answers most of it. Git LFS |
| `transcripts/2026-11-21-team-meeting-2.raw.txt`, `.segments.json`, `.clean.md` | Part 2 transcripts, same formats as part 1. Cite as `p2 mm:ss` |
| `photos/2026-11-21-whiteboard.heic` | Original iPhone photo of the whiteboard |
| `photos/2026-11-21-whiteboard.jpg` | JPG copy of the same photo (1600x2133) |

## map album (Aretha, iCloud shared album "MAP", 2026-11-21 10:29 to 10:42 CST)

File names start with the local time the shot was taken (HHMMSS). Photos are 2731x1536 and videos are 720p, which is the most an iCloud shared album serves. Ask Aretha for originals if a background needs more detail. **The building for each shot is a guess until Aretha confirms.**

| file | what it shows | building (guess) |
| --- | --- | --- |
| `videos/2026-11-21-map-album/102908-meituan-lockers.mp4` (7 s) | outdoor Meituan food-delivery locker wall | MT |
| `photos/2026-11-21-map-album/102910-meituan-lockers-1.jpg`, `102914-meituan-lockers-2.jpg` | same lockers | MT |
| `videos/.../103019-building-entrance.mp4` (6 s) | walking up to a glass entrance, "Est. 1911" on the doors | ? |
| `videos/.../103053-b5-1f-hall.mp4` (7 s), `photos/.../103107-b5-1f-hall.jpg` | long hall with arched ceiling, chandeliers, long wooden tables | **Building 5, 1/F** (confirmed by Insung). Not the grand hall |
| `videos/.../103119-lobby-spiral-stairs-1.mp4` (11 s), `103135-lobby-spiral-stairs-2.mp4` (12 s) | lobby: pillar marked "05 / B2", lift "1", white spiral staircase | B5? ("05") |
| `photos/.../103235-lounge-mural-piano.jpg` | lounge with a Shanghai skyline mural and a grand piano | ? |
| `photos/.../103253-pool-table-room.jpg` | glass room with a pool table | ? |
| `photos/.../103258-table-tennis-room.jpg` | table tennis room, yellow "Est. 1911" wall | ? |
| `photos/.../103557-cafe-seating.jpg` | café tables by the windows | ? |
| `photos/.../103609-stairs-study-area.jpg` | wide tiered stair seating with cushions | likely the board's "2/F stairs study area" |
| `photos/.../103642-lounge-hammocks.jpg` | colourful lounge with hammocks and bean bags | ? |
| `videos/.../103735-walkthrough-stairs-study-lounges.mp4` (62 s) | walk-through: stair seating, lounges, curved booths | ? |
| `videos/.../104125-walkthrough-study-floor.mp4` (64 s) | walk-through: open study floor, shelves, study rooms | ? |
| `photos/.../104151-study-booth.jpg` | enclosed single study booth | ? |
| `photos/.../104211-single-study-room.jpg` | small single study room | ? |
| `photos/.../104216-open-study-long-tables.jpg` | open study area with long tables | ? |
| `photos/.../104228-meeting-room.jpg` | small meeting room with a TV and whiteboards | ? |

Aretha also shared a Google Drive folder in the team chat. Its sharing permissions weren't set, so it wasn't downloaded.

## whiteboard reading (`photos/2026-11-21-whiteboard.jpg`)

Handwritten. `[?]` marks words I'm not sure about.

```
coding education game based on HKU CDS-SH campus
tour

- map  ✓
- building   CDS1          B5          B6            MT
             / | | \       ^ lines from "2/F", "stairs", "study area" above B5
             1 2 6 13                  / \
                                    Hall  SCR
                                     |
                                    Lion
- avatars
- game flow  ->  A vs. B
                 turn taking

DIGIT        | (arithmetic)        |  ( control
0-9          |  MATH               |    (logic)
             |  + - x ÷            |    CS
             |  ^  log             |    for
+/-          |  (mod)              |    break
heal  dmg    |                     |    (skip one turn) )

x / ÷ / ^ / log         for range [DIGIT 3] do: ______
augmentation
```

Notes on the reading:
- "tour" is one word under the title. I'm fairly confident but it could be another short word.
- "2/F, stairs, study area" are joined by lines that end above B5. The transcript at 00:35 to 00:49 (second floor, study area, stairs) fits B5, but the lines could also be meant for CDS1.
- Under B6, the two branches read "Hall" (with "Lion" under it) and "SCR". "Lion" is small and partly hidden.
- "(mod)" is in brackets under "log", so it's tentative.
- "control" is written above "(logic)" inside the CS circle. The word after "control" is cut off.
- "for range [DIGIT 3] do:" has an empty underline after it, the action slot.

## related, not added

Other phone voice memos titled "Fangchun Road ..." are named after the place they were recorded. The ones already transcribed are lectures, phone calls or personal, not this game. None were added.
