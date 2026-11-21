// Tile layout of the outdoor campus. North is up. See buildings/outside/README.md §2.
export const COLS = 68;
export const ROWS = 44;

export const L = {
  aud: { x: 22, y: 0, w: 16, roof: 3, face: 4 }, // white glass-box auditorium (A)
  b5: { x: 44, y: 0, w: 16, roof: 3, face: 4, door: 51 }, // Building 5 (B)
  cds1: { x: 42, y: 10, w: 16, roof: 5, face: 10, door: 49 }, // CDS1 tower (C)
  cds2: { x: 2, y: 10, w: 16, roof: 5, face: 10, door: 9 }, // the facing tower
  bridge: { x: 18, w: 24, row: 15 }, // footbridge footprint rows 15..16
  court: { cx: 30, cy: 21.4, rx: 6, ry: 3.7, wall: 72 }, // sunken round plaza
  lawn: { x: 21, y: 28, w: 19, h: 10 },
  sign: { x: 43, y: 27, w: 4, h: 2 }, // lawn strip with the monument sign
  road: { x: 62, w: 4 }, // service road, north to south
  south: 41, // Jidian Road rows 41..43
};
