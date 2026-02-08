// components/game/viewport/world/player/parts/PlayerHead.tsx
"use client";

import { Graphics } from "pixi.js";
import { useCallback } from "react";
import { Direction, PlayerAppearance } from "../types";
import { drawPixel } from "../utils";

interface PlayerHeadProps {
  cx: number;
  topY: number;
  direction: Direction;
  appearance: PlayerAppearance;
}

export function PlayerHead({
  cx,
  topY,
  direction,
  appearance,
}: PlayerHeadProps) {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();

      const { skinColor, skinShadow, hairColor } = appearance;
      const isSide = direction === "left" || direction === "right";
      const isBack = direction === "up";
      const flipX = direction === "left";

      const dp = (gx: number, gy: number, c: number, a: number = 1) =>
        drawPixel(g, cx, topY, gx, gy, c, a);

      if (isSide) {
        // Hair (back layer for side view)
        dp(3 + (flipX ? 1 : 0), 0, hairColor);
        dp(3 + (flipX ? 1 : 0), 1, hairColor);

        // Head
        dp(3, 0, skinColor);
        dp(4, 0, skinColor);
        dp(2, 1, skinColor);
        dp(3, 1, skinColor);
        dp(4, 1, skinColor);
        dp(5, 1, skinColor);
        dp(3, 2, skinColor);
        dp(4, 2, skinColor);
        dp(5, 2, skinShadow);

        // Hair top
        dp(2, 0, hairColor);
        dp(5, 0, hairColor);

        // Eye (one visible)
        const eyeX = flipX ? 3 : 5;
        dp(eyeX, 1, 0xffffff);
        dp(eyeX, 1, 0x222222, 0.7);

        // Neck
        dp(3, 3, skinShadow);
        dp(4, 3, skinShadow);
      } else {
        // Front/Back view

        // Hair
        dp(2, 0, hairColor);
        dp(3, 0, hairColor);
        dp(4, 0, hairColor);
        dp(5, 0, hairColor);

        // Head
        dp(2, 1, skinColor);
        dp(3, 1, skinColor);
        dp(4, 1, skinColor);
        dp(5, 1, skinColor);
        dp(2, 2, skinColor);
        dp(3, 2, skinColor);
        dp(4, 2, skinColor);
        dp(5, 2, skinColor);
        dp(3, 3, skinShadow);
        dp(4, 3, skinShadow);

        if (!isBack) {
          // Face details (front only)
          dp(2, 1, 0xffffff, 0.9);
          dp(5, 1, 0xffffff, 0.9);
          dp(2, 1, 0x222222, 0.6);
          dp(5, 1, 0x222222, 0.6);
          dp(3, 2, skinShadow, 0.5);
          dp(4, 2, skinShadow, 0.5);
        } else {
          // Back of hair
          dp(2, 2, hairColor, 0.8);
          dp(5, 2, hairColor, 0.8);
        }
      }
    },
    [cx, topY, direction, appearance],
  );

  return <pixiGraphics draw={draw} />;
}
