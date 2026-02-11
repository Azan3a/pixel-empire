// components/game/viewport/world/DayNightOverlay.tsx
"use client";

import { Graphics } from "pixi.js";
import { useCallback, memo } from "react";
import { drawAmbientOverlay } from "./drawAmbientOverlay";
import { drawOceanEffects } from "./drawOceanEffects";
import { drawBoardwalkLights } from "./drawBoardwalkLights";
import { drawIntersectionLights } from "./drawIntersectionLights";
import { drawParkLamps } from "./drawParkLamps";
import { drawForestFireflies } from "./drawForestFireflies";
import { drawMountainCampfires } from "./drawMountainCampfires";
import { drawOldTownLanterns } from "./drawOldTownLanterns";
import { drawHarborLights } from "./drawHarborLights";
import { drawFarmPorchLights } from "./drawFarmPorchLights";
import { drawWetlandGlow } from "./drawWetlandGlow";
import { drawIndustrialFloodlights } from "./drawIndustrialFloodlights";

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
      drawMountainCampfires(g, streetLightAlpha);
      drawOldTownLanterns(g, streetLightAlpha);
      drawHarborLights(g, streetLightAlpha);
      drawFarmPorchLights(g, streetLightAlpha);
      drawWetlandGlow(g, streetLightAlpha);
      drawIndustrialFloodlights(g, streetLightAlpha);
    },
    [overlayColor, overlayAlpha, streetLightAlpha],
  );

  return <pixiGraphics draw={draw} />;
}

export const DayNightOverlay = memo(DayNightOverlayInner);
