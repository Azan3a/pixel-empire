// /components/game/viewport/world/WorldGrid.tsx
"use client";

import { Graphics } from "pixi.js";
import { useCallback } from "react";

interface WorldGridProps {
  mapSize: number;
  tileSize: number;
}

export function WorldGrid({ mapSize, tileSize }: WorldGridProps) {
  const drawGrid = useCallback(
    (g: Graphics) => {
      g.clear();
      // Asphalt background (Dark Gray)
      g.rect(0, 0, mapSize, mapSize);
      g.fill({ color: 0x2c2c2c });

      // Faint lines - simulating road markings or parking lots
      g.setStrokeStyle({ color: 0xffffff, width: 1, alpha: 0.1 });

      for (let i = 0; i <= mapSize; i += tileSize) {
        g.moveTo(i, 0).lineTo(i, mapSize);
        g.moveTo(0, i).lineTo(mapSize, i);
      }
      g.stroke();
    },
    [mapSize, tileSize],
  );

  return <pixiGraphics draw={drawGrid} />;
}
