// components/game/viewport/world/DayNightOverlay.tsx
"use client";

import { Graphics } from "pixi.js";
import { useCallback, memo } from "react";
import { MAP_SIZE, ROAD_SPACING } from "@/convex/gameConstants";

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

      // ── Ambient overlay ──
      if (overlayAlpha > 0.005) {
        g.rect(0, 0, MAP_SIZE, MAP_SIZE);
        g.fill({ color: overlayColor, alpha: overlayAlpha });
      }

      // ── Intersection glow only (no standalone street lights) ──
      if (streetLightAlpha > 0.02) {
        for (let ix = ROAD_SPACING; ix < MAP_SIZE; ix += ROAD_SPACING) {
          for (let iy = ROAD_SPACING; iy < MAP_SIZE; iy += ROAD_SPACING) {
            // Wide soft ambient wash
            g.circle(ix, iy, 80);
            g.fill({ color: 0xffee88, alpha: streetLightAlpha * 0.04 });

            // Medium glow
            g.circle(ix, iy, 45);
            g.fill({ color: 0xffdd66, alpha: streetLightAlpha * 0.08 });

            // Bright center
            g.circle(ix, iy, 18);
            g.fill({ color: 0xfff4cc, alpha: streetLightAlpha * 0.15 });
          }
        }
      }
    },
    [overlayColor, overlayAlpha, streetLightAlpha],
  );

  return <pixiGraphics draw={draw} />;
}

export const DayNightOverlay = memo(DayNightOverlayInner);
