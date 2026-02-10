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
// A ~40-60 px wide river flowing south from the mountains through the forest
// and old town, emptying into the harbor.

export const RIVER: WaterSegment = {
  name: "Central River",
  type: "river",
  width: 50,
  points: [
    // Origin high in the mountains
    { x: 1600, y: 1200 },
    // Flow SE through lower mountains
    { x: 1700, y: 1800 },
    // Curve SW into forest
    { x: 1500, y: 2600 },
    // Through forest southward
    { x: 1400, y: 3200 },
    // Past Zone 1 bridge
    { x: 1200, y: 3800 },
    // Approach the lake
    { x: 1800, y: 4000 },
    // Exit lake south, into Old Town area
    { x: 2600, y: 4300 },
    // Past Zone 3 bridge
    { x: 3200, y: 4700 },
    // Enter harbor
    { x: 3600, y: 5000 },
    // Empty into ocean
    { x: 3800, y: 5400 },
  ],
};

// ─── The Great Lake ──────────────────────────────────────────────
// A ~600×400 freshwater lake at the Forest / Old Town boundary.

export const LAKE: WaterSegment = {
  name: "Great Lake",
  type: "lake",
  width: 600, // represents horizontal extent; height is in the polygon
  points: [
    // Approximate elliptical outline, centered ~(2200, 4000)
    { x: 1900, y: 3800 },
    { x: 2050, y: 3750 },
    { x: 2200, y: 3730 },
    { x: 2350, y: 3750 },
    { x: 2500, y: 3800 },
    { x: 2550, y: 3900 },
    { x: 2550, y: 4100 },
    { x: 2500, y: 4200 },
    { x: 2350, y: 4250 },
    { x: 2200, y: 4270 },
    { x: 2050, y: 4250 },
    { x: 1900, y: 4200 },
    { x: 1850, y: 4100 },
    { x: 1850, y: 3900 },
  ],
};

export const LAKE_CENTER = { x: 2200, y: 4000 };
export const LAKE_RADIUS_X = 350;
export const LAKE_RADIUS_Y = 270;

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
    x: 1200,
    y: 3800, // Old wooden bridge in Zone 1 (forest)
    width: 70,
    height: 30,
    style: "wood",
  },
  {
    name: "Old Town Bridge",
    x: 3200,
    y: 4700, // Main stone bridge in Zone 3 (old town)
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
