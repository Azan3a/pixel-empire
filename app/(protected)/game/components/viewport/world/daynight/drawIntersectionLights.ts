// components/game/viewport/world/daynight/drawIntersectionLights.ts
import { Graphics } from "pixi.js";
import { ROAD_SPACING, ROAD_WIDTH, SIDEWALK_W } from "@/convex/gameConstants";
import { MAP_SIZE } from "@/convex/map/constants";
import { ZONE_VISUALS, getZoneAt, ZONES } from "@/convex/map/zones";
import { WATER_LINE_Y } from "@/convex/mapZones";

export function drawIntersectionLights(g: Graphics, streetLightAlpha: number) {
  if (streetLightAlpha <= 0.02) return;

  const half = ROAD_WIDTH / 2;
  const fullSidewalk = half + SIDEWALK_W;

  for (let ix = ROAD_SPACING; ix < MAP_SIZE; ix += ROAD_SPACING) {
    for (let iy = ROAD_SPACING; iy < MAP_SIZE; iy += ROAD_SPACING) {
      // Skip intersections in the ocean
      if (iy > WATER_LINE_Y) continue;

      // Check if this intersection's zone has street lights and roads
      const zoneId = getZoneAt(ix, iy);
      if (!zoneId) continue;
      const zone = ZONES[zoneId];
      const vis = ZONE_VISUALS[zoneId];

      if (!vis.hasStreetLights || !zone.hasRoads) continue;

      // Individual lamp posts at intersection corners
      //   g.fill({ color: 0xffee88, alpha: streetLightAlpha * 0.04 });

      // Medium glow
      //   g.circle(ix, iy, 45);
      //   g.fill({ color: 0xffdd66, alpha: streetLightAlpha * 0.08 });

      // Bright center
      //   g.circle(ix, iy, 18);
      //   g.fill({ color: 0xfff4cc, alpha: streetLightAlpha * 0.15 });

      // Individual lamp posts at intersection corners
      const lampOffset = fullSidewalk + 6;
      const lampPositions = [
        { x: ix - lampOffset, y: iy - lampOffset },
        { x: ix + lampOffset, y: iy - lampOffset },
        { x: ix - lampOffset, y: iy + lampOffset },
        { x: ix + lampOffset, y: iy + lampOffset },
      ];

      for (const lamp of lampPositions) {
        if (lamp.y > WATER_LINE_Y) continue;
        // Lamp glow
        g.circle(lamp.x, lamp.y, 25);
        g.fill({ color: 0xffee88, alpha: streetLightAlpha * 0.03 });
        // Lamp point
        g.circle(lamp.x, lamp.y, 8);
        g.fill({ color: 0xfff4cc, alpha: streetLightAlpha * 0.1 });
      }
    }
  }
}
