// components/game/viewport/world/player/parts/PlayerTorso.tsx
"use client";

import { Graphics } from "pixi.js";
import { useCallback } from "react";
import { Direction, PlayerAppearance } from "../types";
import { drawPixel, darken, lighten } from "../utils";

interface PlayerTorsoProps {
  cx: number;
  topY: number;
  direction: Direction;
  appearance: PlayerAppearance;
}

export function PlayerTorso({
  cx,
  topY,
  direction,
  appearance,
}: PlayerTorsoProps) {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();

      const { shirtColor } = appearance;
      const shirtShadow = darken(shirtColor, 0.25);
      const isSide = direction === "left" || direction === "right";
      const isBack = direction === "up";

      const dp = (gx: number, gy: number, c: number, a: number = 1) =>
        drawPixel(g, cx, topY, gx, gy, c, a);

      if (isSide) {
        dp(2, 4, shirtColor);
        dp(3, 4, shirtColor);
        dp(4, 4, shirtColor);
        dp(5, 4, shirtShadow);
        dp(2, 5, shirtColor);
        dp(3, 5, shirtColor);
        dp(4, 5, shirtColor);
        dp(5, 5, shirtShadow);
        dp(3, 6, shirtColor);
        dp(4, 6, shirtShadow);
      } else {
        dp(2, 4, shirtColor);
        dp(3, 4, shirtColor);
        dp(4, 4, shirtColor);
        dp(5, 4, shirtColor);
        dp(2, 5, shirtColor);
        dp(3, 5, isBack ? shirtColor : lighten(shirtColor, 0.15));
        dp(4, 5, isBack ? shirtColor : lighten(shirtColor, 0.15));
        dp(5, 5, shirtShadow);
        dp(2, 6, shirtShadow);
        dp(3, 6, shirtColor);
        dp(4, 6, shirtColor);
        dp(5, 6, shirtShadow);
      }
    },
    [cx, topY, direction, appearance],
  );

  return <pixiGraphics draw={draw} />;
}
