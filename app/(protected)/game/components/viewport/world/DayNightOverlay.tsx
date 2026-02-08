// components/game/viewport/world/DayNightOverlay.tsx
"use client";

import { Graphics } from "pixi.js";
import { useCallback, memo } from "react";
import {
  MAP_SIZE,
  ROAD_SPACING,
  ROAD_WIDTH,
  SIDEWALK_W,
} from "@/convex/gameConstants";
import {
  ZONES,
  ZONE_VISUALS,
  WATER_LINE_Y,
  BOARDWALK_Y,
  BOARDWALK_HEIGHT,
  getZoneAt,
} from "@/convex/mapZones";

interface DayNightOverlayProps {
  overlayColor: number;
  overlayAlpha: number;
  streetLightAlpha: number;
}

function DayNightOverlayInner({
  overlayColor,
  overlayAlpha,
  streetLightAlpha,
}: DayNightOverlayProps) {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();

      // ── Ambient overlay (covers full map including ocean) ──
      if (overlayAlpha > 0.005) {
        g.rect(0, 0, MAP_SIZE, MAP_SIZE);
        g.fill({ color: overlayColor, alpha: overlayAlpha });
      }

      // ── Extra darkness on ocean at night ──
      if (overlayAlpha > 0.2) {
        g.rect(0, WATER_LINE_Y, MAP_SIZE, MAP_SIZE - WATER_LINE_Y);
        g.fill({ color: 0x050520, alpha: overlayAlpha * 0.3 });
      }

      // ── Moon/water reflection on ocean at night ──
      if (streetLightAlpha > 0.1) {
        const reflectX = MAP_SIZE / 2;
        const reflectY = WATER_LINE_Y + 80;
        // Wide shimmer
        g.ellipse(reflectX, reflectY, 200, 40);
        g.fill({ color: 0xaabbdd, alpha: streetLightAlpha * 0.03 });
        // Narrow shimmer
        g.ellipse(reflectX, reflectY, 80, 15);
        g.fill({ color: 0xccddff, alpha: streetLightAlpha * 0.06 });
      }

      // ── Boardwalk lights ──
      if (streetLightAlpha > 0.02) {
        const bwTop = BOARDWALK_Y - BOARDWALK_HEIGHT / 2;
        const bwMid = BOARDWALK_Y;

        for (let lx = 100; lx < MAP_SIZE; lx += 200) {
          // Wide ambient glow
          g.circle(lx, bwMid, 50);
          g.fill({ color: 0xffee88, alpha: streetLightAlpha * 0.03 });
          // Warm center
          g.circle(lx, bwMid, 20);
          g.fill({ color: 0xffdd66, alpha: streetLightAlpha * 0.08 });
          // Bright bulb
          g.circle(lx, bwTop + 4, 3);
          g.fill({ color: 0xfff4cc, alpha: streetLightAlpha * 0.6 });
        }
      }

      // ── Intersection street lights ──
      if (streetLightAlpha > 0.02) {
        const half = ROAD_WIDTH / 2;
        const fullSidewalk = half + SIDEWALK_W;

        for (let ix = ROAD_SPACING; ix < MAP_SIZE; ix += ROAD_SPACING) {
          for (let iy = ROAD_SPACING; iy < MAP_SIZE; iy += ROAD_SPACING) {
            // Skip intersections in the ocean
            if (iy > WATER_LINE_Y) continue;

            // Check if this intersection's zone has street lights
            const zoneId = getZoneAt(ix, iy);
            const vis = ZONE_VISUALS[zoneId];
            if (!vis.hasStreetLights) continue;

            // Wide soft ambient wash
            g.circle(ix, iy, 80);
            g.fill({ color: 0xffee88, alpha: streetLightAlpha * 0.04 });

            // Medium glow
            g.circle(ix, iy, 45);
            g.fill({ color: 0xffdd66, alpha: streetLightAlpha * 0.08 });

            // Bright center
            g.circle(ix, iy, 18);
            g.fill({ color: 0xfff4cc, alpha: streetLightAlpha * 0.15 });

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

      // ── Park lamp posts along paths ──
      if (streetLightAlpha > 0.02) {
        const parkBounds = ZONES.park.bounds;
        const parkCX = (parkBounds.x1 + parkBounds.x2) / 2;
        const parkCY = (parkBounds.y1 + parkBounds.y2) / 2;

        // Lights along the horizontal path
        for (let lx = parkBounds.x1 + 120; lx < parkBounds.x2 - 80; lx += 180) {
          g.circle(lx, parkCY, 35);
          g.fill({ color: 0xffeedd, alpha: streetLightAlpha * 0.04 });
          g.circle(lx, parkCY, 12);
          g.fill({ color: 0xfff4cc, alpha: streetLightAlpha * 0.1 });
        }

        // Lights along the vertical path
        for (let ly = parkBounds.y1 + 120; ly < parkBounds.y2 - 80; ly += 180) {
          g.circle(parkCX, ly, 35);
          g.fill({ color: 0xffeedd, alpha: streetLightAlpha * 0.04 });
          g.circle(parkCX, ly, 12);
          g.fill({ color: 0xfff4cc, alpha: streetLightAlpha * 0.1 });
        }
      }

      // ── Forest: firefly-like ambient dots ──
      if (streetLightAlpha > 0.3) {
        const forestBounds = ZONES.forest.bounds;
        for (let fi = 0; fi < 20; fi++) {
          const fx =
            forestBounds.x1 +
            ((fi * 7919 + 31) % (forestBounds.x2 - forestBounds.x1));
          const fy =
            forestBounds.y1 +
            ((fi * 104729 + 17) % (forestBounds.y2 - forestBounds.y1));
          g.circle(fx, fy, 3);
          g.fill({ color: 0xccffaa, alpha: streetLightAlpha * 0.08 });
          g.circle(fx, fy, 1);
          g.fill({ color: 0xeeffcc, alpha: streetLightAlpha * 0.15 });
        }
      }
    },
    [overlayColor, overlayAlpha, streetLightAlpha],
  );

  return <pixiGraphics draw={draw} />;
}

export const DayNightOverlay = memo(DayNightOverlayInner);
