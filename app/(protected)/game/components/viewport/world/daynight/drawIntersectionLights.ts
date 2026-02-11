// components/game/viewport/world/daynight/drawIntersectionLights.ts
import { Graphics } from "pixi.js";
import { ROAD_STYLES } from "@/convex/map/constants";
import { ZONE_VISUALS, getZoneAt, ZONES } from "@/convex/map/zones";
import { ALL_ZONE_DATA, type ZoneRoad } from "@/convex/map/zones/index";
import { isOnLand } from "@/convex/map/islands";

// ── Cached intersection positions ──

interface Intersection {
  x: number;
  y: number;
  lampOffset: number;
}

let _cachedIntersections: Intersection[] | null = null;

function getIntersections(): Intersection[] {
  if (_cachedIntersections) return _cachedIntersections;

  const roads: ZoneRoad[] = Object.values(ALL_ZONE_DATA).flatMap(
    (z) => z.roads,
  );
  const hRoads = roads.filter((r) => r.y1 === r.y2);
  const vRoads = roads.filter((r) => r.x1 === r.x2);

  const intersections: Intersection[] = [];
  const seen = new Set<string>();

  for (const h of hRoads) {
    for (const v of vRoads) {
      // Check if they actually cross
      const hMinX = Math.min(h.x1, h.x2);
      const hMaxX = Math.max(h.x1, h.x2);
      const vMinY = Math.min(v.y1, v.y2);
      const vMaxY = Math.max(v.y1, v.y2);

      if (v.x1 >= hMinX && v.x1 <= hMaxX && h.y1 >= vMinY && h.y1 <= vMaxY) {
        const key = `${v.x1},${h.y1}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const zoneId = getZoneAt(v.x1, h.y1);
        if (!zoneId) continue;
        if (!ZONE_VISUALS[zoneId].hasStreetLights) continue;
        if (!ZONES[zoneId].hasRoads) continue;

        const style = ROAD_STYLES[h.style] || ROAD_STYLES[v.style];
        if (!style) continue;

        intersections.push({
          x: v.x1,
          y: h.y1,
          lampOffset: style.corridor / 2 + 6,
        });
      }
    }
  }

  _cachedIntersections = intersections;
  return intersections;
}

export function drawIntersectionLights(g: Graphics, streetLightAlpha: number) {
  if (streetLightAlpha <= 0.02) return;

  const intersections = getIntersections();

  for (const ix of intersections) {
    const off = ix.lampOffset;
    const lampPositions = [
      { x: ix.x - off, y: ix.y - off },
      { x: ix.x + off, y: ix.y - off },
      { x: ix.x - off, y: ix.y + off },
      { x: ix.x + off, y: ix.y + off },
    ];

    for (const lamp of lampPositions) {
      if (!isOnLand(lamp.x, lamp.y)) continue;
      // Lamp glow
      g.circle(lamp.x, lamp.y, 25);
      g.fill({ color: 0xffee88, alpha: streetLightAlpha * 0.03 });
      // Lamp point
      g.circle(lamp.x, lamp.y, 8);
      g.fill({ color: 0xfff4cc, alpha: streetLightAlpha * 0.1 });
    }
  }
}
