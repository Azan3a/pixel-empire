import { Graphics } from "pixi.js";
import {
  MAP_SIZE,
  ROAD_SPACING,
  ROAD_WIDTH,
  SIDEWALK_W,
  ZONE_VISUALS,
  WATER_LINE_Y,
  getZoneAt,
  ZONES,
} from "@game/shared/contracts/game-config";

export function drawIntersectionLights(g: Graphics, streetLightAlpha: number) {
  if (streetLightAlpha <= 0.02) return;

  const half = ROAD_WIDTH / 2;
  const fullSidewalk = half + SIDEWALK_W;

  for (let ix = ROAD_SPACING; ix < MAP_SIZE; ix += ROAD_SPACING) {
    for (let iy = ROAD_SPACING; iy < MAP_SIZE; iy += ROAD_SPACING) {
      if (iy > WATER_LINE_Y) continue;

      const zoneId = getZoneAt(ix, iy);
      const zone = ZONES[zoneId];
      const vis = ZONE_VISUALS[zoneId];

      if (!vis.hasStreetLights || !zone.hasRoads) continue;

      const lampOffset = fullSidewalk + 6;
      const lampPositions = [
        { x: ix - lampOffset, y: iy - lampOffset },
        { x: ix + lampOffset, y: iy - lampOffset },
        { x: ix - lampOffset, y: iy + lampOffset },
        { x: ix + lampOffset, y: iy + lampOffset },
      ];

      for (const lamp of lampPositions) {
        if (lamp.y > WATER_LINE_Y) continue;
        g.circle(lamp.x, lamp.y, 25);
        g.fill({ color: 0xffee88, alpha: streetLightAlpha * 0.03 });
        g.circle(lamp.x, lamp.y, 8);
        g.fill({ color: 0xfff4cc, alpha: streetLightAlpha * 0.1 });
      }
    }
  }
}
