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
      // Subtle background
      g.setFillStyle({ color: 0xf8fafc });
      g.rect(0, 0, mapSize, mapSize);
      g.fill();

      // Subtle lines
      g.setStrokeStyle({ color: 0xe2e8f0, width: 1 });
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
