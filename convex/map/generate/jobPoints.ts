// convex/map/generate/jobPoints.ts
// Generates valid job pickup/dropoff locations from the fixed road data.
// Points are sampled along every road segment defined in the zone files.

import { getAllRoads } from "../zones/index";
import { getZoneAt } from "../zones";
import type { ZoneId } from "../zones";

export interface JobPoint {
  x: number;
  y: number;
  zoneId: ZoneId;
}

/** Spacing between sample points along each road segment (px) */
const SAMPLE_SPACING = 100;

let _cached: JobPoint[] | null = null;

/**
 * Return a list of valid spawn points sampled along every road in every zone.
 * Results are cached after first call.
 */
export function getJobSpawnPoints(): JobPoint[] {
  if (_cached) return _cached;

  const points: JobPoint[] = [];
  const allRoads = getAllRoads();

  for (const road of allRoads) {
    const dx = road.x2 - road.x1;
    const dy = road.y2 - road.y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1) continue;

    const steps = Math.max(1, Math.floor(len / SAMPLE_SPACING));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = Math.round(road.x1 + dx * t);
      const y = Math.round(road.y1 + dy * t);
      const zoneId = getZoneAt(x, y);
      if (zoneId) {
        points.push({ x, y, zoneId });
      }
    }
  }

  _cached = points;
  return points;
}
