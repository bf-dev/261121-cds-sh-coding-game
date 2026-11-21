# outside: the campus site, roads and outdoor landmarks

Everything a pixel artist or level designer needs to draw the outdoor map of the HKU Zhangjiang Base without opening the raw videos. 55 stills, all full resolution, each one a distinct view. Interiors, towers and entrances are covered by the parallel `buildings/cds1/` and `buildings/b5/` folders; this folder overlaps them only where the outside world is needed for context.

Source of truth for the design language of the game: `docs/`, especially `map-and-campus.md` and `art-style.md`. This folder is the photographic and video evidence behind those docs.

---

## 1. The site

- Official English name: **HKU Zhangjiang Base**. Academic unit: HKU School of Computing and Data Science (Shanghai), shortened to **HKU CDS (Shanghai)**.
- Official Chinese name: **香港大學張江基地** (traditional on the opening banner), **香港大学张江基地** (simplified in common use). The school: **香港大學計算與數據科學學院** / **香港大学计算与数据科学学院**.
- Address: **No. 500 Fangchun Road, Pudong, Shanghai** (芳春路500号).
- The block sits inside the **集智天地 (Jizhi Tiandi)** park, also written **张江集电港**, in Zhangjiang Science City. The park is a Zhangjiang Gaoke development with four high-rise towers and several low blocks around a central green axis. HKU leases and occupies part of the block; the towers are shared park buildings with HKU program space.

### The block and its four roads

| side | road | pinyin | source |
| --- | --- | --- | --- |
| north | 祖冲之路 | Zuchongzhi Road | civil defence board plan (verbatim), web park map |
| south | 集电路 | Jidian Road | civil defence board plan (verbatim) |
| west | 集创路 | Jichuang Road | civil defence board plan (verbatim) |
| east | 芳春路 | Fangchun Road | civil defence board plan, the street address, blue road sign |

Compass: the civil defence board carries a **北 North arrow** pointing up its plan, and the drawing on the board puts 祖冲之路 at the top, 集电路 at the bottom, 集创路 at the left and 芳春路 at the right. Two independent sources agree on the east road: the address is 芳春路500号, and the park map marks 香港大学 on the east side of the park beside 芳春路. The site plan (`web-site-plan-01.jpg`) also carries a compass rose with N up.

Block size, read off the site plan dimension strings: roughly **190 m east to west and 160 m north to south**, with a 54.5 m wide central pedestrian axis. The site plan shows six building footprints in a rough 3 by 2 grid plus a low block on the central axis. Use the proportions, not the exact metres.

**Where sources disagree:**

- One web write-up says the block is "north of 祖冲之路". The park map and the shelter board both put 香港大学 **south** of 祖冲之路, with the Line 2 viaduct running along that road. Treat "south of 祖冲之路" as correct.
- The blue road sign photographed beside the lockers reads **银冬路 Yindong Rd** over **集电路 Jidian Rd** with a straight ahead arrow. 银冬路 is not one of the four board streets, so it is most likely the continuation of the east-west road beyond the junction, seen from the campus exit. Do not put 银冬路 on the block boundary without checking; treat it as a road near the east or south edge.
- The team's building names (**CDS1, CDS2, B5, B6, MT**) do not appear on any public source or sign. They are internal labels. The HKU construction board uses letters **A to E** instead (see section 2).

### What is where

- **Two long high-rise slabs** stand face to face across a paved canyon with a footbridge between them. The team calls the pair CDS1 and CDS2 and describes the pair as **H-shaped**.
- **CDS1** is the slab whose ground floor carries the School of Computing and Data Science lobby, the revolving door, the security turnstiles and the lift bank. Narration in the video places the speaker **north of CDS1** with **Building 5** to its north, and the **Meituan lockers** to its east.
- **The central north-south axis** runs from the south road up between the towers: lawn with the lion and the HKU letters, then the sunken round plaza, then the step theatre and the white glass-box auditorium on its plinth.
- **The east side** of the block carries a service road along 芳春路, with Building 5 and its "5" pylon, a turnaround loop, a guard booth with barrier arms, and the two delivery locker walls.
- **Building 5** (HKU name) is the low block with a green roof at the north-east, behind and beside CDS1.

---

## 2. Site sketch

Approximate. North is up. Each item is tagged **[seen]** (visible in the footage or a plan), **[heard]** (narration only) or **[inferred]** (a placement this folder chose). Proportions are loose.

```
                 N     祖冲之路  Zuchongzhi Road   (metro Line 2 viaduct)
   +====================================================================+
   |  E  sports facilities: 400 m track, 2 outdoor courts,              |  [seen, pixel map only]
   |     indoor basketball hall, in the north strip outside the core    |
   +--------------------------------------------------------------------+
   |  [3]        [ A auditorium ]          [ B = Building 5 ]           |  [pixel map A,B] [inferred 3]
   |  NW tower    white glass box           low block, green roof,      |
   |  (guess)     on a stepped plinth,      2 to 6 storeys              |
   |              HKU logo band             [heard] north of CDS1        |
   |                                                                     |
   |  tower CDS2  ||  footbridge  ||  tower CDS1                         |
 W |  [inferred]  ||  oval void   ||  14+ storeys, white vertical fins   | E
   |  14+ storeys ||  on 3 round  ||                                    |   芳春
   |              ||  columns     ||  ================== service road ==|   路
 集|              ||              ||   [5 pylon] [loop] [gate+booth]    |   Fangchun
 创|              ||              ||   [Meituan lockers][Taobao lockers]|   Rd
 路|   long colonnade / pergola of white columns along both tower bases |
   |              [ sunken round plaza, sweeping stair, ring paving ]   |
   |              [ step theatre under the auditorium box ]             |
   |                                                                     |
   |  [ Z 张江高科 ]   [ lawn: lion + white HKU letters ]   [ D tech ]   |  [seen lion/letters]
   |  SW tower        [ monolith sign on the lawn ]        [ landmark ]  |  [inferred Z,D]
   |                                                                     |
   +====================================================================+
                 S     集电路  Jidian Road
```

Reading notes:

- **Solid:** the four roads and the north arrow; two near-identical towers facing each other with a footbridge; a sunken court with a sweeping stair; a permanent lawn with the lion and the HKU letters next to a public road; lockers and a vehicle gate together on the east side; Building 5 north of CDS1.
- **The two canyons.** The site has a north-south central axis (lawn, sunken plaza, auditorium: this is the view in `web-hero-lawn-letters-01.jpg`) and at least one east-west gap between tower slabs (the walk in `canyon-footbridge-01.jpg`). The walkthrough goes through the east-west gap and then turns onto the lawn corner. The sketch above treats the central axis as the spine and the tower pair as flanking it, which matches the site plan and the hero photograph. If the level designer needs one authoritative plan, use `web-site-plan-01.jpg` and `docs/art-reference/zhangjiang-v2-map.png`; the sketch is a reading of those, not a survey.
- **The pixel map is the best placement source.** `docs/art-reference/zhangjiang-v2-map.png` (from `~/workspace/261120-hku-zhangjiang-pixel-map`, see its README "Layout sources") places C (CDS1) on the east of the central axis, an unlabelled matching tower on the west (read as CDS2), A auditorium at the north end of the axis, B (Building 5) north-east behind CDS1, the sunken round plaza on the axis, the lion and HKU letters south of it, and E sports at the far north. That map's own guesses, marked as guesses there, are: NW tower = Building 3, SW tower = 张江高科 tower, D in the south-east corner. Do not present those three as fact.
- **The building letters** from the HKU construction board: **A Auditorium, B Student Amenities and Learning Commons (Building 5), C CDS Main Building (CDS1), D CDS Tech Landmark, E Sports Facilities**. The team's "B6 grand hall" is not a board letter; the most likely physical match is **A**, the white glass box, which is also where the team puts the final stage and the lion boss.

---

## 3. Landmarks

Sizes are estimates from the frames, given as a drawing guide, not measured. Hex values are sampled from the photos and rounded; treat them as a working palette.

### 3.1 The two towers and the canyon

- Two long rectangular slabs, about 14 to 17 storeys, nearly identical. One reads as a **white tower**: dense vertical white fins or blades over dark glass, horizontal silver banding, black glass corner bands. The other is **darker glass** with fine vertical mullions and bronze-brown frames. In practice both faces appear in the pair and the light changes which one looks white.
- Ground floor of each tower is recessed and darker, behind a line of **white columns**, so the towers appear to float above a shaded base.
- Between them: a paved canyon roughly 25 to 35 m wide, grey granite with alternating light and dark bands, painted yellow lane lines, black planter boxes, bare young trees with tripod stakes.
- The canyon is the main level-design corridor: a straight run of about 80 to 100 m between two walls, with the footbridge crossing overhead at the far end.
- Signage: the entrance canopy of CDS1 carries **香港大学** over **计算与数据科学学院** in silver sans-serif capitals; the same words appear in traditional form on web photos as **香港大學計算與數據科學學院**. Glass doors carry a frosted band with repeated **HKU** and **Est. 1911**.
- Colours: white fin `#dfe2e2`, fin shadow `#b9bec2`, dark glass `#2c3540`, glass reflection `#5d7d99`, bronze mullion `#8a6a44`, sky `#9fc4e8`.
- Sources: `plaza-wide-two-towers-01.jpg`, `canyon-footbridge-01.jpg`, `path-twin-glass-01.jpg`, `web-tower-exterior-north-01.jpg`.
- Game: the canyon is the natural "street level" map corridor, two long walls with planters as cover.

### 3.2 The footbridge with the oval void

- A flat elevated deck spanning the canyon at about second storey, roughly 8 to 10 m above the paving, connecting the two towers.
- Carried on **three large round white columns**, about 1.2 m diameter, smooth painted concrete, no capitals.
- A **glass balustrade** runs along the top edge of the deck: thin stainless posts, clear panels, a dark handrail.
- The soffit is a flat white slab. Between the columns there is a **large oval opening cut through the deck**, roughly 6 to 8 m long and 3 to 4 m wide, edged with a dark reveal. From below it reads as an eye or a porthole in the ceiling.
- The deck reads as a bridge from inside the canyon and as a roof from the plaza side.
- Signage: none.
- Colours: deck and columns `#d9dad2` (lit) to `#a8aaa2` (shade), soffit shade `#7d7f78`, handrail `#3a3d40`, glass edge `#b9c6c8`.
- Sources: `canyon-footbridge-01.jpg`, `canyon-footbridge-columns-01.jpg`, `canyon-footbridge-oval-void-01.jpg` (detail of the void), `web-courtyard-footbridge-01.jpg`.
- Game: the oval void is a strong silhouette element. Use it as a ceiling gap for light shafts, or as a drop point onto the level below. Narration: "a bridge and a circular hole, footbridge" (0:44 to 0:52 of the walkthrough).

### 3.3 The sunken round plaza (下沉广场)

- A sunken court cut about 3 to 4 m below plaza level. It reads **oval** from inside the canyon and **circular** from the terrace above; draw it as a rounded oval to be safe.
- Rim: **stainless steel and glass railing**, thin posts, with a planted band and a clipped hedge spiral wrapping the rim on one side.
- A **broad curved staircase** sweeps down the rim, stone treads, no visible handrail in the main view, with a low stone parapet on the outside edge.
- Floor: pale stone paving laid in **concentric dark granite rings** around a circular centre, plus a small door at the bottom level and a run of glazed panels under the planted band.
- On the site plan this is labelled **下沉广场**, at the north end of the central axis.
- Signage: none on the court itself.
- Colours: pale floor `#d3cebb`, dark ring `#6a6a62`, glass green edge `#8fa9a4`, hedge `#4c6b34`, railing stainless `#b6bcc0`.
- Sources: `court-circular-arena-01.jpg` (from above, best), `court-sweeping-stair-01.jpg`, `sunken-court-glass-box-01.jpg`, `court-terrace-path-01.jpg`.
- Game: an arena floor. The rings give a natural boss arena target or a radial telegraph pattern.

### 3.4 The step theatre and the white glass-box auditorium (A, likely the team's B6 / grand hall)

- A low **white glass box**, single storey plus a roof plant room, sitting on a raised **stepped plinth** with a broad flight of wide, shallow stone steps down to the plaza, used as a step theatre.
- Front face is full-height glass with slim frames and a horizontal band carrying **香港大學** and **THE UNIVERSITY OF HONG KONG** with the HKU crest, silver letters on a dark band.
- Width roughly 35 to 45 m, height about 10 to 12 m plus the plinth, depth about 25 m.
- The steps are about 8 to 10 risers, 150 mm rise, 400 mm going, in pale grey stone with dark nosing, flanked by planter beds.
- Behind it, the site's north road; the box is the visual head of the central axis and the backdrop of the lawn in every hero shot.
- Signage verbatim: **香港大學 / THE UNIVERSITY OF HONG KONG** plus the crest. Team language: "grand hall", "B6", final stage, lion boss at the door.
- Colours: white frame `#e6e7e4`, glass `#4a5c66`, glass reflection `#7d95a4`, plinth stone `#cfd0cb`, logo band `#2a2c2b`, silver type `#d8dad6`.
- Sources: `pavilion-glass-box-01.jpg` (from the plaza, with the step flight), `sunken-court-glass-box-01.jpg` (head-on beyond the sunken court), `web-hero-lawn-letters-01.jpg`, `web-grand-opening-staircase-01.jpg`, `web-campus-sign-01.jpg`.
- Game: the team's final stage. The wide steps are a natural approach ramp and the whole box is the "door" to the boss.

### 3.5 The colonnade and pergola

- A long **single-storey colonnade** of white square and round columns, roof slab about 4 to 5 m high, running along the tower bases and linking blocks across the plaza.
- Round columns about 0.6 m diameter in the walkthrough section, square columns about 0.5 m in other runs; plain white, flat soffit.
- It creates a shaded walkway about 4 to 6 m deep, with clipped hedges and black planters tucked between columns.
- Signage: none.
- Colours: column white `#dcded9`, soffit shade `#a7a9a3`, hedge `#4c6b34`.
- Sources: `colonnade-columns-01.jpg`, `colonnade-pergola-01.jpg`, `plaza-pergola-yellow-lines-01.jpg`.
- Game: cover corridor, good for walk-and-talk scenes and for hiding pickups behind columns.

### 3.6 Plaza, paving and yellow markings

- Grey granite paving throughout, laid in **alternating light and dark bands** roughly 0.6 m wide, then large square slabs. A fine pinstripe grid of joints.
- **Yellow painted lane lines**, about 100 mm wide, in single, double and diagonal runs. They sweep around the monument sign and form a long double line down the driveway. They read as cycle or fire-lane markings.
- A **white painted chevron or V arrow** appears on the paving near the tower corner, and white bar markings near the CDS1 forecourt.
- Wide areas of plain paving with no line at all, which is where the props and people sit.
- Colours: light slab `#bdc1c9`, mid slab `#7d828f`, dark band `#60655d`, joint `#8f939a`, yellow paint `#e8c53a`, white paint `#e7e8e4`.
- Sources: `plaza-paving-yellow-lines-01.jpg`, `plaza-canyon-approach-01.jpg`, `driveway-yellow-lane-01.jpg`, `apron-yellow-lines-01.jpg`, `plaza-pergola-yellow-lines-01.jpg`.
- Game: the yellow lines are the cheapest way to make a pixel map read as this campus. Tile them as 1 px wide runs over banded stone.

### 3.7 The monument sign (monolith)

- A freestanding **white slab**, roughly 4.5 m wide, 2.2 m high and 0.4 m thick, sitting directly on a lawn, no base plinth.
- Front face: HKU crest at the left, then three lines of black sans-serif capitals, then a smaller line:
  - **SCHOOL OF**
  - **COMPUTING &**
  - **DATA SCIENCE**
  - **The University of Hong Kong**
- The lawn kerb curves around it, and a yellow lane line sweeps past on the paving side.
- A second, similar slab appears at the building edge near the CDS1 forecourt in the walkthrough. Treat it as the same design, possibly duplicated; the frames do not prove whether there are one or two.
- Signage verbatim as above. Chinese subline, if any, is not legible in any frame.
- Colours: slab `#eeece6`, type `#1d1d1b`, crest `#8c8c86`, lawn `#7aa54a`.
- Sources: `monolith-sign-front-01.jpg` (clean front), `plaza-monolith-sign-tower-01.jpg`, `plaza-monolith-sign-lane-01.jpg`, `web-campus-sign-01.jpg`.
- Game: the team's natural spawn point or fast-travel marker.

### 3.8 The lawn, the lion and the HKU letters

- A permanent lawn of clipped turf, roughly 40 by 25 m, edged with a pale granite kerb about 200 mm high and 400 mm wide, and a low clipped hedge in places.
- **Lion mascot:** a large cartoon lion, seated, about 2.5 m tall, yellow mane with a scalloped edge, cream face and paws, a pale green shirt and brown shorts, guy-roped to the ground. From behind you see the mane as a spiky halo. It is a plush or sculpted mascot figure, not a stone lion. Do not draw a Pokfulam stone lion.
- **HKU letters:** three separate white block letters, about 2 m tall, thick sans-serif, standing directly on the grass a few metres from the lion, reading **H K U**.
- Trees: bare young saplings with tripod stakes on the lawn edge, one or two larger evergreen shrubs.
- Signage: the letters themselves are the sign. The lion has no text.
- Colours: mane `#e8c34a`, mane shadow `#c99f2f`, face and paws `#f3dfae`, shirt `#cfe0c3`, shorts `#8a6a4f`, letters `#f2f2ee`, turf `#8fbf55`, turf shadow `#6f9440`.
- Sources: `lawn-lion-hku-letters-01.jpg` (front three-quarter, best), `lawn-lion-side-01.jpg`, `lawn-hku-letters-01.jpg`, `web-hero-lawn-letters-01.jpg`.
- Game: **lion = final boss**. Narration: "HKU Lion, it's the final boss" (1:27). The team's design doc puts Leo the lion as the last stage (25:10, p2 05:35). The letters are a good landmark and a spawn marker.

### 3.9 The civil defence boards and arrow plates

- Two identical boards stand on the site, one by a hedge bed at a building corner, one beside a curved bench near the entrance area. Same notice, different positions: useful for the map, since the same prop can be placed twice.
- Board: landscape rectangle in a **red frame**, roughly 1.8 m wide and 1.2 m high, on two galvanised round posts about 60 mm diameter, planted in a hedge bed. The red band across the top carries the title and a round red and yellow emblem.
- Content layout, left to right: the block plan with the four street names and the blue shelter area, a north arrow and a 0 / 10 / 20M scale bar at the top right, body text at the right, legend at the bottom right, the Shanghai Civil Defence Office line at the foot.
- Title verbatim: **民防工程人员掩蔽引导图** over **Civil Defense Personnel Shelter Guidance Map**.
- Streets verbatim: **祖冲之路 / Zuchongzhi Road** (top), **集电路 / Jidian Road** (bottom), **集创路 / Jichuang Road** (left), **芳春路 / Fangchun Road** (right). **北 North** arrow. Scale **0 10 20M**.
- Body text verbatim: 本地块地下室内建有民防工程。当有人员掩蔽需求及空袭警报响起时，请立即前往民防工程战时出入口进行掩蔽。 English: A civil defense facility is constructed in the basement of this site. When personnel sheltering is required and an air-raid alarm is sounded, please proceed immediately to the wartime entrances/exits of the civil defense facility for sheltering.
- Legend verbatim (Chinese / English): 地下室范围 / Basement Area, 民防工程范围 / Civil Defense Facility Area, 本标识位置 / Location of This Sign, 您所在的位置 / Your Current Location, 战时主要出入口 / Primary Wartime Entrance/Exit, 战时次要出入口 / Secondary Wartime Entrance/Exit, 人员掩蔽路径 / Personnel Sheltering Route.
- Footer: **上海市民防办公室 (http://mfb.sh.gov.cn)** / Shanghai Municipal Civil Defense Office.
- **Arrow plates:** a small red rectangle with **民防工程** and a white arrow, about 0.8 m wide, on a slim galvanised pole about 2.2 m tall, standing in a planter bed. The same plate hangs on a facade elsewhere.
- Colours: board frame `#d8241f`, panel white `#f2f2ee`, plan blue `#a9cfe0`, red marks `#c8362c`, galvanised post `#9aa0a3`.
- Sources: `sign-civil-defence-board-01.jpg` (full board, legible), `sign-civil-defence-board-plan-01.jpg` (plan detail), `sign-civil-defence-arrow-01.jpg`.
- Game: the board doubles as the in-world minimap. The team's narration literally says "that's a map" while passing it. Draw it as a readable prop with the plan and the north arrow.

### 3.10 Benches, kerbs, planters, bins

- **Curved white benches:** low organic S-shaped concrete benches, about 0.4 m high and 0.5 m wide, in runs of 3 to 6 m, with a **timber seat insert** in the top surface. They double as low retaining edges to the lawn.
- **Kerbs:** pale granite, curved and generous, about 200 mm high. The lawn edge is a continuous smooth curve, not a straight line.
- **Planters:** black rectangular steel boxes, about 1.2 by 0.6 by 0.6 m, standing loose on the paving, planted with ferns, grasses and broad-leaf shrubs.
- **Bins:** stainless twin-litter units, about 1 m tall, with two openings and a small logo, standing free on the paving.
- **Trees:** bare young saplings with 3-pole tripod stakes and tie straps, plus clipped evergreen hedges about 0.6 to 0.9 m high.
- Colours: bench concrete `#e6e6e2`, bench timber `#a9835a`, kerb `#cfd0ce`, planter steel `#26282a`, fern `#5f8a3e`, hedge `#4c6b34`, bin steel `#9aa0a3`.
- Sources: `path-bench-curved-01.jpg`, `path-bench-detail-01.jpg`, `planters-glass-frontage-01.jpg`, `facade-hedge-door-01.jpg`.
- Game: benches are the natural rest or save point; planters are low cover.

### 3.11 Building 5, secondary entrance and the "5" pylon

- A low block of about 5 to 6 storeys, about 23.95 m tall per the site plan, with a green roof, north-east of CDS1.
- **Secondary entrance:** glass doors under a dark flat canopy, a warm timber-lined and brightly lit lobby visible inside, grey granite paving outside, clipped shrubs tight to the glass. The door glass carries a frosted band with **HKU** and **Est. 1911**.
- **Pylon sign:** a slim vertical black-and-white pylon, about 0.4 m wide and 2.2 m tall, standing in a hedge bed. The top half is dark with a white **5**, the lower half lists floors, legible as **5 F** over **1 F** (low confidence on the rest).
- Signage verbatim: **5**, **5 F**, **1 F**, **HKU**, **Est. 1911**.
- Colours: pylon dark `#1f2224`, pylon white `#eceae4`, lobby timber `#b58a5c`, canopy `#2b2d2c`.
- Sources: `b5-secondary-entrance-01.jpg`, `b5-pylon-sign-01.jpg`.
- Game: the team's power-up building, unlocked with a key from CDS1 (gym and study power-ups, 24:38 to 25:07).

### 3.12 The service road, turnaround loop, gate and guard booth

- An **asphalt service road**, about 6 to 7 m wide, running along the east side between building bases, with clipped hedges on both sides and a granite kerb.
- A **turnaround loop** at the gate end, with a row of **short concrete bollards** about 0.8 m high and a tree belt.
- **Guard booth:** a dark grey or black kiosk about 2.5 by 2.5 m with a white base skirt and full-height glazing, standing on a small concrete island.
- **Barrier gate:** a red and white striped boom arm on a low pedestal, about 3 to 4 m long when closed, plus a separate pedestrian gate and a yellow bollard.
- Nearby: a blue direction sign on a grey pole reading **银冬路 Yindong Rd** over **集电路 Jidian Rd**, a traffic light head and a white parked car.
- Colours: asphalt `#3a3d3b`, kerb `#cfd0ce`, booth `#2a2d2e` with white `#e6e6e2` base, boom red `#c8362c`, boom white `#eeeee8`, bollard `#b9b7ad`.
- Sources: `gate-guard-booth-01.jpg`, `gate-barrier-arm-01.jpg`, `turnaround-loop-01.jpg`, `service-road-01.jpg`.
- Game: the checkpoint or locked gate between the campus and the outside. A good place for an access-card puzzle.

### 3.13 The delivery lockers (MT = Meituan)

- Two long locker banks stand a few metres apart on the same concrete plinth beside the service road, near the gate, east of CDS1.
- **Meituan wall:** yellow steel frame, 4 to 6 bays, each bay about 2 m wide and 2.2 m tall. Each bay has a yellow pelmet with the Meituan logo, **美团外卖柜**, **扫码 存取** and a QR code, a CCTV camera on the frame corner, and a grid of white compartments with amber and bronze doors, numbered in columns of 7 up to **125**. Doors are about 350 mm square, with larger ones mixed in.
- **Taobao wall:** white steel frame with red and pink banner strips across each bay carrying **淘宝闪购**, **扫码 存取** and a QR code, then glass-front cubbies in the same numbering scheme, up to 125. A stainless vent or grille unit stands at one end.
- In front: black planter boxes, a red and white retractable belt stanchion, gravel at the plinth edge, shared bicycles docked behind.
- Signage verbatim: **美团外卖柜**, **美团**, **扫码 存取**, **淘宝闪购**.
- Colours: Meituan yellow `#f2c230`, Meituan pelmet text `#b3261e`, locker white `#f2f1ec`, locker amber `#b0894f`, Taobao red `#c8102e`, Taobao banner white `#f6f2ee`, plinth concrete `#b9b7ad`.
- Sources: `lockers-meituan-front-01.jpg`, `lockers-both-walls-01.jpg`, `lockers-taobao-side-01.jpg`, `lockers-meituan-bays-01.jpg`, `lockers-taobao-bays-01.jpg` (with the **银冬路** sign), `lockers-meituan-wide-01.jpg`, `lockers-meituan-pan-01.jpg`.
- The two locker photos were mislabelled at first and have been renamed: `110803-meituan-lockers.jpg` is the yellow Meituan wall, `110809-taobao-lockers.jpg` is the orange Taobao wall with the road sign.
- Game: **MT = Meituan, food = health power-up** (p2 05:01 to 05:07, 24:46 to 25:07). Narration: "My Locker is on the east side of the CDS1 building". Two competing brands make a good choice point: yellow for food and health, white-red for a package or item drop.

---

## 4. Palette

Sampled and rounded from the stills. Use as a starting ramp, then push contrast for pixel work.

| element | light | mid | dark |
| --- | --- | --- | --- |
| paving slabs | `#bdc1c9` | `#7d828f` | `#60655d` |
| yellow paint | `#f0c93c` | `#e8c53a` | `#c9a12a` |
| tower white fins | `#dfe2e2` | `#b9bec2` | `#8b9095` |
| dark glass | `#5d7d99` | `#2c3540` | `#1a2027` |
| bronze mullion | `#a5835a` | `#8a6a44` | `#5e472c` |
| lawn | `#8fbf55` | `#7aa54a` | `#54702f` |
| hedge | `#5f7f3e` | `#4c6b34` | `#33481f` |
| granite kerb and bench | `#e6e6e2` | `#cfd0ce` | `#a9aaa4` |
| timber seat and door | `#b58a5c` | `#a9835a` | `#7a5a37` |
| Meituan yellow | `#f7d453` | `#f2c230` | `#c39a1c` |
| Taobao red | `#e0262f` | `#c8102e` | `#8e0a20` |
| civil board red | `#e8332a` | `#d8241f` | `#a41712` |
| lion mane | `#f0d06a` | `#e8c34a` | `#c99f2f` |
| lion shirt | `#dbe8d2` | `#cfe0c3` | `#a3b79a` |
| sky | `#b8d6ee` | `#9fc4e8` | `#7aa6d0` |
| asphalt | `#4a4d4b` | `#3a3d3b` | `#262827` |

---

## 5. Image index

Video sources:

- **W** = `resources/videos/2026-11-21-insung/IMG_3756-campus-walkthrough.mp4`, 4:36, portrait 1080x1920, timestamp in file time.
- **K** = `resources/videos/2026-11-21-koki/110510-outside-cds1-entrance-b5-lockers-gate.mp4`, 3:26, 1920x1080, Koki's exterior walk, timestamp in file time.
- **A** = `resources/videos/2026-11-21-map-album/102908-meituan-lockers.mp4`, 7.5 s, 1280x720.
- Photos and web files as listed.

| file | shows | source |
| --- | --- | --- |
| plaza-paving-yellow-lines-01.jpg | granite banded paving, yellow double line running diagonally | W @ 0:01 |
| plaza-wide-two-towers-01.jpg | whole plaza, two towers, long white colonnade, yellow line | W @ 0:09 |
| plaza-canyon-approach-01.jpg | tower corner, lawn strip, monument sign ahead, y-junction paving | W @ 0:22 |
| plaza-monolith-sign-tower-01.jpg | monument sign from the side, tower and low white building behind | W @ 0:31 |
| plaza-monolith-sign-lane-01.jpg | monument sign with the yellow lane sweeping past, tower above | W @ 0:34 |
| pavilion-glass-box-01.jpg | white glass box with the HKU logo band, wide terrace steps, black planters, finned tower at left | W @ 0:40 |
| canyon-footbridge-01.jpg | canyon wide: two towers, bridge on columns, sunken court right, planters | W @ 0:43 |
| canyon-footbridge-columns-01.jpg | bridge deck on three round columns over the sunken court, hedge spiral | W @ 0:52 |
| canyon-footbridge-oval-void-01.jpg | detail of the oval opening through the bridge deck, column edge | zoom of W, 0:52 to 1:00 |
| sunken-court-glass-box-01.jpg | sunken court with glass railing and hedge, sweeping stair, glass box pavilion head-on beyond | W @ 1:01 |
| colonnade-columns-01.jpg | round white columns under the bridge deck, soffit, paving shadows | W @ 1:07 |
| colonnade-pergola-01.jpg | colonnade columns with planting and tower behind | W @ 1:10 |
| path-bench-curved-01.jpg | curved white bench with timber insert, lawn, path | W @ 1:16 |
| path-bench-detail-01.jpg | bench and sapling on the curved path, pavilion distant | W @ 1:13 |
| sign-civil-defence-board-01.jpg | civil defence board, full and legible, plan, streets, north arrow, legend | W @ 1:22 |
| sign-civil-defence-board-plan-01.jpg | the board plan on its own, block outline and blue shelter area | crop of the board above |
| sign-civil-defence-arrow-01.jpg | red 民防工程 arrow plate on a slim pole in a hedge bed | W @ 1:25 |
| lawn-lion-side-01.jpg | lion from behind and side on the lawn, towers behind | W @ 1:34 |
| lawn-lion-hku-letters-01.jpg | lion and white HKU letters on the lawn, towers behind, best front view | W @ 1:55 |
| lawn-hku-letters-01.jpg | HKU letters on the lawn in front of a dark glass tower | W @ 2:01 |
| road-edge-sidewalk-01.jpg | sidewalk along the road, yellow line, hedge, street trees, tower | W @ 2:13 |
| planters-glass-frontage-01.jpg | black planter with ferns, glass frontage and facade sign behind | W @ 2:52 |
| apron-yellow-lines-01.jpg | wide paved apron, double yellow lines, finned tower | W @ 3:04 |
| facade-hedge-door-01.jpg | glass single door in the facade behind a clipped hedge | W @ 1:40 |
| entrance-cds1-front-01.jpg | CDS1 entrance front, 香港大学 / 计算与数据科学学院 band, canopy, paving | K @ 0:05 |
| driveway-yellow-lane-01.jpg | driveway with a yellow lane line, colonnade and towers ahead | K @ 0:26 |
| monolith-sign-front-01.jpg | monument sign clean front, crest and all four text lines, lawn and hedge | K @ 0:40 |
| court-terrace-path-01.jpg | walking the terrace above the sunken court, glass box ahead between the towers, glass railing and hedges | K @ 0:50 |
| court-sweeping-stair-01.jpg | sunken court rim and sweeping stair, glass box pavilion behind | K @ 0:54 |
| court-circular-arena-01.jpg | head-on down into the circular arena, concentric ring paving, glass railing | K @ 1:02 |
| path-twin-glass-01.jpg | stone path between two parallel glass buildings, hedges, saplings | K @ 1:10 |
| path-twin-glass-02.jpg | the same path further along, cantilevered glass corners | K @ 1:22 |
| service-road-01.jpg | asphalt service road between long glass buildings, kerb and hedge | K @ 1:54 |
| b5-secondary-entrance-01.jpg | secondary entrance, glass doors, dark canopy, warm timber lobby | K @ 2:04 |
| b5-pylon-sign-01.jpg | slim black and white pylon with 5 over 5 F / 1 F, in a hedge bed | K @ 2:08 |
| turnaround-loop-01.jpg | road loop with concrete bollards, planters, trees, lockers distant | K @ 2:32 |
| gate-guard-booth-01.jpg | guard booth, gate, barrier post, shrubs, road, blue direction sign | K @ 3:07 |
| gate-barrier-arm-01.jpg | guard booth and the red and white boom arm, hedges, planters | K @ 3:13 |
| lockers-meituan-front-01.jpg | Meituan locker wall head-on, yellow pelmets, numbered doors | K @ 2:52 |
| lockers-both-walls-01.jpg | Meituan and Taobao walls side by side from the road | K @ 2:54 |
| lockers-taobao-side-01.jpg | Taobao wall from an angle, gate and road beyond | K @ 3:02 |
| plaza-pergola-yellow-lines-01.jpg | plaza with double yellow lines, long colonnade and grey towers | K @ 3:25 |
| lockers-meituan-bays-01.jpg | Meituan wall, 4 bays, crisp brand band, doors numbered to 125 | photo `110803-meituan-lockers.jpg` (Koki) |
| lockers-taobao-bays-01.jpg | Taobao wall with the blue 银冬路 / 集电路 sign, bikes, planters | photo `110809-taobao-lockers.jpg` (Koki) |
| lockers-meituan-wide-01.jpg | Meituan wall, 6 bays, frontal, trees behind, Taobao edge at right | photo `resources/photos/2026-11-21-map-album/102910-meituan-lockers-1.jpg` |
| lockers-meituan-pan-01.jpg | both locker walls across the asphalt apron, wide pan | A @ 0:03 |
| web-aerial-night-01.jpg | night aerial of the block, towers and podium courts, road corner | https://www.sohu.com/a/945826602_121124027 |
| web-site-plan-01.jpg | official site plan 总平面, six footprints, central axis, sunken plaza, compass | https://www.sohu.com/a/945826602_121124027 |
| web-park-aerial-render-01.jpg | park aerial render, 香港大学 marked at the east edge on 芳春路 | https://www.sohu.com/a/945826602_121124027 |
| web-park-map-01.jpg | park map with the HKU block circled, 祖冲之路 and Line 2 along the north | https://www.sohu.com/a/945826602_121124027 |
| web-hero-lawn-letters-01.jpg | hero: HKU lawn letters, stepped axis, glass box with logo band between towers | https://lead.hku.hk/en/news/2026/09/hku-opens-new-zhangjiang-facilities/ |
| web-grand-opening-staircase-01.jpg | opening view of the glass box, staircase and HKU logo band, flanked by towers | https://lead.hku.hk/en/article/2026/03/hku-launches-strategic-positioning-in-shanghai-celebrating-115-years-of-excellence/ |
| web-courtyard-footbridge-01.jpg | courtyard bridge on round columns, glass box behind, planting | https://www.sohu.com/a/945826602_121124027 |
| web-tower-exterior-north-01.jpg | tower at street level, vertical silver fins, second tower at right | https://www.sohu.com/a/945826602_121124027 |
| web-campus-sign-01.jpg | the SCHOOL OF COMPUTING AND DATA SCIENCE sign with HKU arms, lawn and towers | https://sh.cds.hku.hk/ |

Credit for the sohu images: re-post of a Zhangjiang park feature, photos credited there to 小红书 user 走走. The lead.hku.hk and sh.cds.hku.hk images are HKU's own.

---

## 6. Gaps

- **No labelled aerial.** The night aerial and the site plan are the best; the site plan's block codes (3#, 4#, 5#, 6#, 7#) do not map cleanly to HKU's Building 3 and Building 5, and it is not settled which plan footprints are CDS1 and CDS2.
- **West and south sides are thin.** The walks cover the plaza, the canyon, the lawn, the east service road and the gate. The 集创路 (west) and 集电路 (south) frontages are only seen at an angle; the south road has no clean street-level shot, and no zebra crossing is clearly captured.
- **Building 5 exterior** is one secondary entrance plus the pylon. The green roof, the 1F hall's exterior and the sports court frontage are in `buildings/b5/`.
- **The B6 / grand hall exterior** is only the glass box from the plaza and from web photos. Its sides, rear and entrance doors are missing.
- **The auditorium (A) roof and the roof plant room** are seen from below only.
- **Construction board with the A to E letters** is described in the pixel map README but this folder has no photo of it. Worth one shot if anyone passes it again.
- **Signage not fully read:** the small Chinese line on the monument sign, the internal callout labels on the shelter plan, the pylon floor list beyond 5 F and 1 F.
- **People and props** are deliberately avoided in the stills (a walker appears in one or two frames). If the game needs NPC clothing, shoot again on a weekday.
- **Summer versus late November.** All footage is late November: bare saplings, low sun, long shadows, winter coats. The web hero photos are greener. Pick one season for the game.
