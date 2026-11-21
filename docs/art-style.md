# art style

Sources: part 2 07:21 to 08:38. Insung, 2026-11-21: "follow the art style [of the reference project] but more detailed and realistic".

## reference

**Insung's HKU ZhangJiang pixel map**, live at https://insu.ng/zhangjiang (repo `bf-dev/hku-zhangjiang-pixel-map`). This is the project promised at p2 07:35.

| file | what it shows |
| --- | --- |
| `art-reference/zhangjiang-v2-walk.png` | walking view: the student on the plaza in front of the HKU lawn letters, with the lion behind |
| `art-reference/zhangjiang-v2-map.png` | the whole campus map: buildings A to E, 3, Z, the lawn, the round sunken plaza, roads and tree lines |

What to keep from it:
- 2D pixel art, **3/4 top-down (oblique) view**. Buildings are stacked boxes, with the roof lifted by the building's height and the south facade shown below it. Characters are depth-sorted with buildings, and a tower in front of you fades out.
- Clean, bright, readable palette: pale stone paving, green lawns, pink cherry trees and yellow ginkgo street trees, blue-white glass facades.
- Chunky characters (about 2 tiles tall) with a dark outline.
- Bilingual labels (English + 中文) in SungSans / Noto Sans CJK SC, in cream panels with a dark border.
- Touch-friendly: d-pad or tap-to-walk, an `M` map overlay.

## what to change: much bigger, much more detailed, more realistic

Insung, 2026-11-21: the reference walk view (`art-reference/zhangjiang-v2-walk.png`) is **too low on detail and too small**. Keep its view and mood, but draw at a much higher pixel resolution.

| | reference (insu.ng/zhangjiang) | this game |
| --- | --- | --- |
| tile size | 16 x 16 art px, upscaled | **64 x 64 art px**, about 4x the pixels per tile. Draw at that size, don't upscale small art |
| characters | about 16 x 32 px, simple shapes | **about 64 x 128 px**, with real proportions, clothes, hair, a face readable at 1x, and 4-direction walk cycles |
| buildings | flat boxes with a repeated window strip | **every window bay, mullion, fin, canopy and door drawn**; real storey count and window rhythm from the keyframes; signage you can read at native size |
| materials | 2 or 3 shades each | **6 to 10 shade ramps per material** (granite, glass reflections, timber, marble, grass), with texture: paving joints, glass reflections, wood grain, carpet patterns |
| light | flat | **cast shadows** under buildings, trees and characters, light from the south (noon in November), soft ambient occlusion at wall bases, light spill from lobbies |
| props | a few benches and trees | everything in the keyframes that defines the place: planters, bins, bollards, lamp posts, bikes, the locker walls with numbered doors, the civil-defence boards, the monument sign, the lion's guy ropes |
| screen | the camera shows a lot of tiny campus | **the camera is closer.** At 1920 x 1080 the view shows about 30 x 17 tiles, so one building front fills a good part of the screen |

**Still pixel art**: hard pixel edges, a limited palette per material, no photo textures, no blur, no smooth gradients beyond dithering.

Where the detail comes from:
- **Facades and entrances**: `buildings/*/README.md` and their keyframes. CDS1's white vertical fins and bronze mullions, the "HKU / Est. 1911" frit band, the revolving door under the deep flat canopy, the 香港大学 计算与数据科学学院 letters.
- **Ground**: grey granite paving with the yellow painted lane lines and chevrons, black planter boxes, curved white benches, the white monument sign, the civil-defence boards, the Meituan (yellow) and Taobao (white/red) lockers, the guard booth and barrier gate.
- **Landmarks as they really look**: the footbridge on round white columns with the oval void, the sunken oval court with its sweeping stair, the cartoon lion mascot (yellow mane, pale green top, seated) beside the white 3D HKU letters.
- **Interiors for the battle levels**: CDS1 floor by floor (lobby turnstiles, 6/F teamwork space with the round banquette and blue carpet, 13/F timber and green booth pods) and Building 5 (vaulted hall, white spiral stair, mural and piano, tiered stair study area).

## layout facts from the reference

From the reference project's README (its sources: satellite trace, HKU construction board, official render, ARCHINA landscape write-up). Cross-check with `buildings/outside/`.
- Construction board letters: **A** Auditorium, **B** Student Amenities & Learning Commons (= **Building 5**, low block north of CDS1), **C** CDS Main Building (= **CDS1**), **D** CDS Tech Landmark, **E** Sports Facilities (400 m track, outdoor courts, indoor basketball).
- Central lawn with the HKU letters, a cherry avenue, a step theatre under the north box, and a sunken round plaza.
- Its own guesses (not confirmed): the NW tower is Building 3, the SW tower is the 张江高科 tower, and D is in the SE corner.
