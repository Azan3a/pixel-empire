// convex/map/water.ts
// Natural water features: The River and The Great Lake.
// River flows from Mountains → Forest → Old Town → Harbor.
// Lake sits at Forest/OldTown boundary.

export interface WaterSegment {
  /** Display name */
  name: string;
  /** Polyline waypoints (x, y) tracing the center of the waterway */
  points: Array<{ x: number; y: number }>;
  /** Average width in pixels */
  width: number;
  /** Type of water */
  type: "river" | "lake";
}

export interface Bridge {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  style: "wood" | "stone";
}

// ─── The River ───────────────────────────────────────────────────
// A ~40-60 px wide river flowing south from the mountains through the park
// and suburbs area, emptying near the boardwalk coast.
// Design docs specify x≈3400–3800, y:1600→6800.

export const RIVER: WaterSegment = {
  name: "Central River",
  type: "river",
  width: 50,
  points: [
    // Origin in the mountains
    { x: 3600, y: 1000 },
    // Flow south through mountains
    { x: 3550, y: 1600 },
    // Mountain/forest boundary
    { x: 3500, y: 2200 },
    // Into park area
    { x: 3450, y: 2800 },
    // Approach lake (north)
    { x: 3400, y: 3300 },
    // Through lake — covered by lake fill
    { x: 3400, y: 3700 },
    // South of park
    { x: 3500, y: 4200 },
    // Suburbs/commercial boundary
    { x: 3500, y: 4800 },
    // Through commercial strip
    { x: 3600, y: 5400 },
    // Farmland
    { x: 3700, y: 6000 },
    // Reaches coast at boardwalk
    { x: 3800, y: 6800 },
  ],
};

// ─── The Great Lake ──────────────────────────────────────────────
// A freshwater lake inside the park zone, centered within the Lake Loop trails.
// Park zone: (2000,2600)→(4200,4400). Lake Loop trails: (3100-3700, 3250-3750).

export const LAKE: WaterSegment = {
  name: "Great Lake",
  type: "lake",
  width: 500, // represents horizontal extent
  points: [
    // Approximate elliptical outline, centered ~(3400, 3500)
    { x: 3150, y: 3400 },
    { x: 3250, y: 3320 },
    { x: 3400, y: 3300 },
    { x: 3550, y: 3320 },
    { x: 3650, y: 3400 },
    { x: 3680, y: 3500 },
    { x: 3650, y: 3600 },
    { x: 3550, y: 3680 },
    { x: 3400, y: 3700 },
    { x: 3250, y: 3680 },
    { x: 3150, y: 3600 },
    { x: 3120, y: 3500 },
  ],
};

export const LAKE_CENTER = { x: 3400, y: 3500 };
export const LAKE_RADIUS_X = 280;
export const LAKE_RADIUS_Y = 200;

/** Quick ellipse hit-test for the lake */
export function isInLake(x: number, y: number): boolean {
  const dx = (x - LAKE_CENTER.x) / LAKE_RADIUS_X;
  const dy = (y - LAKE_CENTER.y) / LAKE_RADIUS_Y;
  return dx * dx + dy * dy <= 1;
}

// ─── Bridges ─────────────────────────────────────────────────────

export const BRIDGES: Bridge[] = [
  {
    name: "Forest Bridge",
    x: 3450,
    y: 2800, // Wooden bridge at forest/park boundary
    width: 70,
    height: 30,
    style: "wood",
  },
  {
    name: "Commercial Bridge",
    x: 3500,
    y: 4800, // Stone bridge at suburbs/commercial boundary
    width: 80,
    height: 30,
    style: "stone",
  },
];

/** Check whether a point falls on any bridge (so player can cross the river) */
export function isOnBridge(x: number, y: number): boolean {
  return BRIDGES.some(
    (b) =>
      x >= b.x - b.width / 2 &&
      x <= b.x + b.width / 2 &&
      y >= b.y - b.height / 2 &&
      y <= b.y + b.height / 2,
  );
}

/** Check whether a point is in the river (center-line ± half-width) */
export function isInRiver(x: number, y: number): boolean {
  const halfW = RIVER.width / 2;
  const pts = RIVER.points;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    // Point-to-segment distance
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) continue;
    let t = ((x - a.x) * dx + (y - a.y) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const px = a.x + t * dx;
    const py = a.y + t * dy;
    const dist = Math.hypot(x - px, y - py);
    if (dist <= halfW) return true;
  }
  return false;
}

/** True if the point is in any water body (river or lake) but NOT on a bridge */
export function isInWater(x: number, y: number): boolean {
  if (isOnBridge(x, y)) return false;
  return isInRiver(x, y) || isInLake(x, y);
}
