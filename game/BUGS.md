# Bugs and to-do

Running list of bugs and fixes for the game. Newest at the bottom of each section.

## open

1. Remove the war evacuation sign.
2. "Auditorium" should be named "Grand Hall".
3. "Tower D" should be "CDS2".
4. Spelling of "CDS1" should be "CDS-1". Same for "CDS2" → "CDS-2" (so bug 3 becomes "CDS-2").
5. Update the Chinese names of the non-Chinese professors.
6. Behind the security line there should be an elevator hall with elevators on both sides. Nothing else should be visible behind the security line. Four elevators on each side, in a straight row.
7. The HKU logo in the Grand Hall should be in colour, not black and white. It should be the real logo exactly as it is, not pixel art.
8. "School of Computing & Data Science" does not fit on the desk on 14/F (the floor number was written as "14?f"; confirm it is 14/F).
9. Rename "Auditorium" on Building 5 2/F to "Music Room".
10. "Pool" on Building 5 2/F should be "Multipurpose Room".
11. Building 5 staircase: one stair connects 1/F and 2/F, and another stair connects 2/F to 3/F. The stairs stop at 3/F. It is a circular (curved) stair, with a curve between each floor.

## fixed

Builder, 2026-11-21 15:30. The numbers are the ones under "open".

1. Done. Both civil defence boards and the small arrow sign are gone from the outdoor map.
2. Done. The outdoor label and the info text say Grand Hall.
3. Done. The tower is labelled CDS-2.
4. Done in every text the player sees: CDS-1, CDS-2. Map ids in code stay `cds1-N`.
6. Done. Behind the gates there is only a lift hall, four lifts in a row on each side. The floor guide moved to the wall before the gates, the LED wall is gone, Dr. Dougherty stands in the entrance lobby.
7. The hall already used the official colour crest. The LED wall now carries the full official colour logo (crest plus name) from the hku.hk file.

8. Done. The floor is 14/F. The school name on the reception desk is on two rows and sized to fit the desk front.

Still open: 5 (Chinese names of the non-Chinese professors). The game shows the field in Chinese under every name and no invented names. Send the names you want and they go into `src/data/professors.ts` (`nameZh`).
