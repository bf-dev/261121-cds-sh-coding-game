// Tile layout of the outdoor campus. North is up. Footprints follow the satellite photo
// resources/photos/2026-11-21-whatsapp-satellite-cds1.jpg: four towers in a 2 x 2 grid around the
// central axis (auditorium, sunken plaza, lawn), CDS1 = the north-east tower with Building 5 as
// its low north block, then west to east: CDS1, service road, locker walls, tree strip, Fangchun Road.
export const COLS = 78;
export const ROWS = 44;

export const L = {
  aud: { x: 22, y: 0, w: 16, roof: 3, face: 4 }, // white glass-box auditorium (A)
  b5: { x: 44, y: 0, w: 16, roof: 3, face: 4, door: 51 }, // Building 5 (B)
  cds1: { x: 42, y: 10, w: 16, roof: 5, face: 10, door: 49 }, // CDS1 tower (C), north-east
  cds2: { x: 2, y: 10, w: 16, roof: 5, face: 10, door: 9 }, // the north-west tower
  se: { x: 42, y: 30, w: 16, roof: 4, face: 6, door: 49 }, // south-east tower (D, CDS Tech Landmark)
  sw: { x: 2, y: 30, w: 16, roof: 4, face: 6, door: 9 }, // south-west tower
  bridge: { x: 55, w: 3, y: 25, len: 5 }, // footbridge: runs north to south over the gap between CDS1 and the tower south of it, rows 25..29
  court: { cx: 30, cy: 21.4, rx: 6, ry: 3.7, wall: 72 }, // sunken round plaza
  lawn: { x: 21, y: 28, w: 19, h: 10 },
  sign: { x: 43, y: 27, w: 4, h: 2 }, // lawn strip with the monument sign
  road: { x: 60, w: 4 }, // service road, north to south, between CDS1 and the lockers
  apron: { x: 64, w: 2 }, // paving in front of the lockers
  lockers: { x: 66, mt: 13, tb: 20, len: 6 }, // vertical locker walls, doors facing west: Meituan rows 13..18, Taobao rows 20..25
  strip: { x: 66, w: 4 }, // hedge and tree strip behind the lockers
  fangchun: { x: 70, w: 8 }, // Fangchun Road, the public road on the east edge
  south: 41, // Jidian Road rows 41..43
};
