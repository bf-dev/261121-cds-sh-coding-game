# Home-screen campus overview map

**Proposal (Aretha, 2026-11-21).** Add a top-down campus map on the title screen so a first-time visitor can see which building is which before starting. This is a feature specification, not an implemented game change.

## Visitor experience

- Show a small, readable **Campus map · 校园地图** preview on the home screen alongside the existing New game, Continue, Demo mode and Level select actions. Keep those actions immediately visible.
- Selecting the preview or a **View campus map · 查看校园地图** button opens a large map overlay. It works before starting a game and does not change saved progress.
- Show the site from above, with **north up**, a north arrow, and labels directly on or beside each place. Highlight **CDS-1** (main academic tower) and **Building 5** (student spaces). Label the white glass-box **Auditorium** without assuming it is the story Grand Hall.
- Also label the central lawn with Leo/HKU letters, sunken plaza, footbridge, Meituan and Taobao lockers, Fangchun Road on the east, and south entrance. Use a small legend only where direct labels overlap.
- Tapping or hovering on a destination gives a short description, for example “CDS-1 — explore the main academic tower” and “Building 5 — student spaces, unlocked later.” The overview explains places; it does not teleport the player or bypass locks.
- Provide **Back · 返回** and Escape support. Closing restores the title screen. On narrow screens, let the large map scroll or zoom while labels and touch targets stay readable.

## Placement and naming

Use the north-up reference `docs/art-reference/zhangjiang-v2-map.png`, the current layout in `game/src/maps/outside-layout.ts`, and `buildings/outside/README.md`. The overview should match the outdoor walkable map: CDS-1 in the north-east tower, Building 5 north of it, the central lawn/plaza axis, and lockers on the eastern service road. Follow the established pixel-art style.

Label the companion tower **CDS-2** where the latest in-game naming and location match. Leave other towers neutral (“Other campus building”) unless their identities are confirmed. Do not invent a Building 6 or Grand Hall location.

## Implementation notes

- Add the preview and overlay entry to `showTitle()` in `game/src/main.ts`; style them in `game/src/style.css`. The title currently loads the outdoor scene behind the menu.
- Use a lightweight top-down image or drawing based on the campus references. Keep labels accessible as text and give interactive locations keyboard focus and descriptive names.
- Keep the existing New game, Continue, Demo mode, and Level select behavior. The overview is informational and independent of progress.
- Later, the in-game Menu could reuse this map with a “You are here” marker. The home-screen view is the requested first step.

## Acceptance check

1. On first launch, a visitor can find the map without starting and distinguish CDS-1 from Building 5 in a few seconds.
2. The enlarged map has legible labels, a north arrow, descriptions, and a working Back/Escape action on desktop and mobile.
3. Opening and closing it does not start a game, teleport, unlock a location, or change saved progress.
4. Unconfirmed building identities are not presented as facts.

Related: [campus references](map-and-campus.md), [visitor journey](visitor-journey-story.md), [art style](art-style.md).
