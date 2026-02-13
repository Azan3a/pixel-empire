"use client";

import { Graphics } from "pixi.js";
import { useCallback, memo } from "react";
import { PX } from "../types";

interface PlayerShadowProps {
  topY: number;
  isNight: boolean;
}

function PlayerShadowInner({ topY, isNight }: PlayerShadowProps) {
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

export const PlayerShadow = memo(PlayerShadowInner);
