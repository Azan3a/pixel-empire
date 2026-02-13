"use client";

import { Graphics } from "pixi.js";
import { useCallback, memo } from "react";
import { Direction, PlayerAppearance } from "../types";
import { drawPixel, darken } from "../utils";

interface PlayerHatProps {
  cx: number;
  topY: number;
  direction: Direction;
  appearance: PlayerAppearance;
}

function PlayerHatInner({ cx, topY, direction, appearance }: PlayerHatProps) {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();
      if (appearance.hatColor === undefined) return;

      const color = appearance.hatColor;
      const shadow = darken(color, 0.25);
      const isSide = direction === "left" || direction === "right";
      const flipX = direction === "left";
      const isBack = direction === "up";

      const dp = (gx: number, gy: number, c: number, a: number = 1) =>
        drawPixel(g, cx, topY, gx, gy, c, a);

      if (isSide) {
        const front = flipX ? 1 : 6;
        dp(2, -1, color);
        dp(3, -1, color);
        dp(4, -1, color);
        dp(5, -1, color);
        dp(front, 0, shadow);
        dp(2, 0, shadow);
        dp(3, 0, color);
        dp(4, 0, color);
        dp(5, 0, shadow);
      } else if (isBack) {
        dp(1, -1, shadow);
        dp(2, -1, color);
        dp(3, -1, color);
        dp(4, -1, color);
        dp(5, -1, color);
        dp(6, -1, shadow);
        dp(2, 0, shadow);
        dp(3, 0, color);
        dp(4, 0, color);
        dp(5, 0, shadow);
      } else {
        dp(1, -1, shadow);
        dp(2, -1, color);
        dp(3, -1, color);
        dp(4, -1, color);
        dp(5, -1, color);
        dp(6, -1, shadow);
        dp(1, 0, shadow);
        dp(2, 0, shadow);
        dp(3, 0, shadow);
        dp(4, 0, shadow);
        dp(5, 0, shadow);
        dp(6, 0, shadow);
      }
    },
    [cx, topY, direction, appearance],
  );

  return <pixiGraphics draw={draw} />;
}

export const PlayerHat = memo(PlayerHatInner);
