// components/game/viewport/world/player/parts/PlayerShadow.tsx
"use client";

import { Graphics } from "pixi.js";
import { useCallback } from "react";
import { PX } from "../types";

interface PlayerShadowProps {
  topY: number;
  isNight: boolean;
}

export function PlayerShadow({ topY, isNight }: PlayerShadowProps) {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();
      g.ellipse(0, topY + 12 * PX, 12, 6);
      g.fill({ color: 0x000000, alpha: isNight ? 0.3 : 0.15 });
    },
    [topY, isNight],
  );

  return <pixiGraphics draw={draw} />;
}
