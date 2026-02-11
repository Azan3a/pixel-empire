// components/game/viewport/world/daynight/drawOldTownLanterns.ts
import { Graphics } from "pixi.js";
import { ROAD_STYLES } from "@/convex/map/constants";
import { ALL_ZONE_DATA } from "@/convex/map/zones/index";

/**
 * Draw warm hanging lanterns along Old Town cobblestone streets.
 * Placed at intervals along each road segment in the zone.
 */
export function drawOldTownLanterns(g: Graphics, streetLightAlpha: number) {
  if (streetLightAlpha <= 0.02) return;

  const roads = ALL_ZONE_DATA.oldtown.roads;
  const spacing = 120; // lantern every 120px along each road

  for (const road of roads) {
    const dx = road.x2 - road.x1;
    const dy = road.y2 - road.y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < spacing) continue;

    const style = ROAD_STYLES[road.style];
    const offset = style ? style.corridor / 2 + 4 : 22;
    const steps = Math.floor(len / spacing);

    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const lx = road.x1 + dx * t;
      const ly = road.y1 + dy * t;

      // Both sides of the road
      const nx = -dy / len; // perpendicular
      const ny = dx / len;

      for (const side of [-1, 1]) {
        const px = lx + nx * offset * side;
        const py = ly + ny * offset * side;

        // Warm lantern glow
        g.circle(px, py, 30);
        g.fill({ color: 0xffcc66, alpha: streetLightAlpha * 0.025 });

        // Inner glow
        g.circle(px, py, 12);
        g.fill({ color: 0xffdd88, alpha: streetLightAlpha * 0.07 });

        // Lantern point
        g.circle(px, py, 4);
        g.fill({ color: 0xffeebb, alpha: streetLightAlpha * 0.4 });
      }
    }
  }
}
