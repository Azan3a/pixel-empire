"use client";

import { Graphics } from "pixi.js";
import { useCallback, memo } from "react";
import { drawAmbientOverlay } from "./drawAmbientOverlay";
import { drawOceanEffects } from "./drawOceanEffects";
import { drawBoardwalkLights } from "./drawBoardwalkLights";
import { drawIntersectionLights } from "./drawIntersectionLights";
import { drawParkLamps } from "./drawParkLamps";
import { drawForestFireflies } from "./drawForestFireflies";

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
      drawAmbientOverlay(g, overlayColor, overlayAlpha);
      drawOceanEffects(g, overlayAlpha, streetLightAlpha);
      drawBoardwalkLights(g, streetLightAlpha);
      drawIntersectionLights(g, streetLightAlpha);
      drawParkLamps(g, streetLightAlpha);
      drawForestFireflies(g, streetLightAlpha);
    },
    [overlayColor, overlayAlpha, streetLightAlpha],
  );

  return <pixiGraphics draw={draw} />;
}

export const DayNightOverlay = memo(DayNightOverlayInner);
