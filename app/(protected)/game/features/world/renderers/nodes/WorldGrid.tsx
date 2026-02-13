"use client";

import { Graphics } from "pixi.js";
import { useCallback, memo } from "react";
import { createTintFn } from "@game/features/world/renderers/utils/tintFactory";
import { drawZoneTerrain } from "@game/features/world/renderers/world/drawZoneTerrain";
import { drawBeachAndWater } from "@game/features/world/renderers/world/drawBeachAndWater";
import { drawParkFeatures } from "@game/features/world/renderers/world/drawParkFeatures";
import { drawRoads } from "@game/features/world/renderers/world/drawRoads";
import { drawTrees } from "@game/features/world/renderers/world/drawTrees";
import { drawMapBorder } from "@game/features/world/renderers/world/drawMapBorder";

interface WorldGridProps {
  tintR?: number;
  tintG?: number;
  tintB?: number;
}

function WorldGridInner({ tintR = 1, tintG = 1, tintB = 1 }: WorldGridProps) {
  const drawGrid = useCallback(
    (g: Graphics) => {
      g.clear();
      const t = createTintFn(tintR, tintG, tintB);

      drawZoneTerrain(g, t);
      drawBeachAndWater(g, t);
      drawParkFeatures(g, t);
      drawRoads(g, t);
      drawTrees(g, t);
      drawMapBorder(g);
    },
    [tintR, tintG, tintB],
  );

  return <pixiGraphics draw={drawGrid} />;
}

export const WorldGrid = memo(WorldGridInner);
