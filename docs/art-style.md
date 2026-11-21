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

## what to change: more detailed and realistic

- **Facades from the real photos**, not generic glass. Use `buildings/*/README.md` and its keyframes: CDS1's white vertical fins and bronze mullions, the "HKU / Est. 1911" frit band on the doors, the revolving door, the deep flat canopy, the 香港大学 计算与数据科学学院 letters.
- **Real ground details**: grey granite paving with the yellow painted lane lines and chevrons, black planter boxes, curved white benches, the white monument sign, the civil-defence boards, the Meituan (yellow) and Taobao (white/red) locker walls, the guard booth and barrier gate.
- **Landmarks as they really look**: the footbridge on round white columns with the oval void, the sunken oval court with its sweeping stair, the cartoon lion mascot (yellow mane, pale green top, seated) beside the white 3D HKU letters.
- **Interiors for battles and levels**, drawn from the keyframes: CDS1 floor by floor (lobby turnstiles, 6/F teamwork space with the round banquette and blue carpet, 13/F timber and green booth pods), and Building 5 (vaulted hall, white spiral stair, mural and piano, tiered stair study area).
- **More tiles and finer sprites** than the reference. Higher resolution per tile (e.g. 32 px), more colour steps per material, real proportions and window rhythm, signage you can actually read. Still pixel art, not photos.

## layout facts from the reference

From the reference project's README (its sources: satellite trace, HKU construction board, official render, ARCHINA landscape write-up). Cross-check with `buildings/outside/`.
- Construction board letters: **A** Auditorium, **B** Student Amenities & Learning Commons (= **Building 5**, low block north of CDS1), **C** CDS Main Building (= **CDS1**), **D** CDS Tech Landmark, **E** Sports Facilities (400 m track, outdoor courts, indoor basketball).
- Central lawn with the HKU letters, a cherry avenue, a step theatre under the north box, and a sunken round plaza.
- Its own guesses (not confirmed): the NW tower is Building 3, the SW tower is the 张江高科 tower, and D is in the SE corner.
