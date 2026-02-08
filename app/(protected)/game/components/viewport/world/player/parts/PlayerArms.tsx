// components/game/viewport/world/player/parts/PlayerArms.tsx
"use client";

import { Graphics } from "pixi.js";
import { useCallback } from "react";
import { Direction, PlayerAppearance, WalkCycleOffsets, PX } from "../types";
import { drawPixel } from "../utils";

interface PlayerArmsProps {
  cx: number;
  topY: number;
  direction: Direction;
  appearance: PlayerAppearance;
  offsets: WalkCycleOffsets;
}

export function PlayerArms({
  cx,
  topY,
  direction,
  appearance,
  offsets,
}: PlayerArmsProps) {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();

      const { skinColor, shirtColor } = appearance;
      const isSide = direction === "left" || direction === "right";
      const flipX = direction === "left";
      const { leftArmY, rightArmY } = offsets;

      const dp = (gx: number, gy: number, c: number, a: number = 1) =>
        drawPixel(g, cx, topY, gx, gy, c, a);

      const armBaseY = 4;

      if (isSide) {
        // One arm visible in side view
        const armSwing = flipX ? -rightArmY / PX : leftArmY / PX;
        const armX = flipX ? 2 : 5;
        dp(armX, armBaseY + 1 + armSwing, skinColor);
        dp(armX, armBaseY + 2 + armSwing, skinColor);
      } else {
        // Left arm
        const laOff = leftArmY / PX;
        dp(1, armBaseY + laOff, shirtColor);
        dp(1, armBaseY + 1 + laOff, skinColor);
        dp(1, armBaseY + 2 + laOff, skinColor);

        // Right arm
        const raOff = rightArmY / PX;
        dp(6, armBaseY + raOff, shirtColor);
        dp(6, armBaseY + 1 + raOff, skinColor);
        dp(6, armBaseY + 2 + raOff, skinColor);
      }
    },
    [cx, topY, direction, appearance, offsets],
  );

  return <pixiGraphics draw={draw} />;
}
