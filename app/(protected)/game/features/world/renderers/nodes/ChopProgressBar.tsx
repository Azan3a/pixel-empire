"use client";

import { Graphics } from "pixi.js";
import { memo, useCallback } from "react";

interface ChopProgressBarProps {
  x: number;
  y: number;
  progress: number;
}

function ChopProgressBarInner({ x, y, progress }: ChopProgressBarProps) {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();

      const w = 44;
      const h = 8;
      const r = 4;
      const p = Math.max(0, Math.min(1, progress));

      g.roundRect(-w / 2, -h / 2, w, h, r);
      g.fill({ color: 0x111827, alpha: 0.7 });

      const fillW = Math.max(0, (w - 2) * p);
      g.roundRect(-w / 2 + 1, -h / 2 + 1, fillW, h - 2, r - 1);
      g.fill({ color: 0x10b981, alpha: 0.9 });

      g.roundRect(-w / 2, -h / 2, w, h, r);
      g.stroke({ color: 0xffffff, alpha: 0.15, width: 1 });
    },
    [progress],
  );

  return (
    <pixiContainer x={x} y={y - 28} eventMode="none">
      <pixiGraphics draw={draw} />
    </pixiContainer>
  );
}

export const ChopProgressBar = memo(ChopProgressBarInner);
