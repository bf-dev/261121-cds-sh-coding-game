# buildings

The campus, distilled from every photo and video the team took on 2026-11-21, plus official HKU and park images. **Use this folder, not the raw videos.** Each place has its keyframes (distinct views, close-ups of signs and materials) and a README that describes what you need to draw it: shape, materials, colours, signage, furniture, walk order, sketches and gaps.

| folder | place | images | read first |
| --- | --- | --- | --- |
| `outside/` | the site: four roads, two towers and the canyon, footbridge with the oval void, sunken round plaza, lawn with the lion and HKU letters, monument sign, civil-defence boards, service road, gate, delivery lockers | 55 | §1 site, §2 sketch, §3.8 lion |
| `cds1/` | CDS1 tower: entrance, 1/F lobby and turnstiles, lifts, the floor guide, 6/F, 13/F, 14/F | 61 | §3 floor guide (the 14 levels) |
| `b5/` | Building 5: 1/F vaulted galleria and marble lobby, 2/F amenity floor (gym, games, piano, study stair), 4/F co-creation, 5/F learning commons | 60 | §3.3 amenity floor (power-ups) |
| `b6/` | the Senior Common Room suite, a crested dining foyer and canteen, an AI LABS reception. Building number not proven | 30 | Summary, Verdict |
| `grand-hall/` | the final boss room: raked auditorium, walnut walls, timber stage, huge LED wall, lectern with the HKU crest. Building not known | 5 | whole README |

## how each folder works

- `README.md` is the description. Every claim is tagged with how it is known (seen, heard in narration, official source, inferred) and every image is listed in the **image index** with its source file and timestamp.
- Image names are `<floor or zone>-<what>-NN.jpg`, e.g. `cds1/6f-teamwork-circle-sofa-01.jpg`, `outside/lawn-lion-side-01.jpg`. `web-*` images are official or press photos, credited by URL in the README.
- Colours are given as approximate hex ramps per material. They were sampled from phone video, so treat them as a starting palette, not exact paint.
- Sketches are walk-order diagrams, not measured plans.

## what is still not on film

- **The grand hall's building** and the way in from outside. The room itself is in `grand-hall/`; `outside/` §3.4 guesses the white glass-box auditorium.
- **CDS1 floors 3 to 5, 7 to 12.** The floor guide gives their functions (lecture theatres, labs, research, professors). Reuse the 6/F and 13/F layouts, as the team planned (01:11 "we can copy for the other floors").
- **Which building is B6.** Plaque-confirmed Senior Common Room, but the footage never shows a building number.

Each README ends with a **Gaps** list of exact shots that would settle these.

## adding to it

New photo or video of a place: put the raw file in `resources/` (see `prompts/ingest-new-resource.md`), extract only frames that show something not already here, add them to the right folder with the naming above, and add rows to that README's image index.
