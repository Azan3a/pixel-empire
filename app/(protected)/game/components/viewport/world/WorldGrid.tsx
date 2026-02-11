// components/game/viewport/world/WorldGrid.tsx
"use client";

import { Graphics } from "pixi.js";
import { useCallback, memo } from "react";
import { createTintFn } from "./utils/tintFactory";
import { drawOceanAndCoast } from "./drawing/drawOceanAndCoast";
import { drawZoneTerrain } from "./drawing/drawZoneTerrain";
import { drawParkFeatures } from "./drawing/drawParkFeatures";
import { drawRoads } from "./drawing/drawRoads";
import { drawTrees } from "./drawing/drawTrees";
import { drawMapBorder } from "./drawing/drawMapBorder";

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

      drawOceanAndCoast(g, t);
      drawZoneTerrain(g, t);
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
