"use client";

import { Graphics } from "pixi.js";
import { useCallback, memo } from "react";
import { Direction, PlayerAppearance, WalkCycleOffsets, PX } from "../types";
import { drawPixel, darken } from "../utils";

interface PlayerLegsProps {
  cx: number;
  topY: number;
  direction: Direction;
  appearance: PlayerAppearance;
  offsets: WalkCycleOffsets;
}

function PlayerLegsInner({
  cx,
  topY,
  direction,
  appearance,
  offsets,
}: PlayerLegsProps) {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();

      const { pantsColor, shoeColor, beltColor } = appearance;
      const pantsShadow = darken(pantsColor, 0.25);
      const isSide = direction === "left" || direction === "right";
      const { leftLegY, rightLegY } = offsets;

      const dp = (gx: number, gy: number, c: number, a: number = 1) =>
        drawPixel(g, cx, topY, gx, gy, c, a);

      if (isSide) {
        dp(3, 7, beltColor);
        dp(4, 7, beltColor);

        const legBaseY = 8;

        const frontLegOff = leftLegY / PX;
        dp(3, legBaseY + frontLegOff, pantsColor);
        dp(3, legBaseY + 1 + frontLegOff, pantsColor);
        dp(3, legBaseY + 2 + frontLegOff, pantsShadow);
        dp(3, legBaseY + 3 + frontLegOff, shoeColor);

        const backLegOff = rightLegY / PX;
        dp(4, legBaseY + backLegOff, pantsShadow);
        dp(4, legBaseY + 1 + backLegOff, pantsShadow);
        dp(4, legBaseY + 2 + backLegOff, pantsShadow);
        dp(4, legBaseY + 3 + backLegOff, shoeColor);
      } else {
        dp(2, 7, beltColor);
        dp(3, 7, 0x666666);
        dp(4, 7, 0x666666);
        dp(5, 7, beltColor);

        const legBaseY = 8;

        const llOff = leftLegY / PX;
        dp(2, legBaseY + llOff, pantsColor);
        dp(3, legBaseY + llOff, pantsColor);
        dp(2, legBaseY + 1 + llOff, pantsColor);
        dp(3, legBaseY + 1 + llOff, pantsShadow);
        dp(2, legBaseY + 2 + llOff, pantsShadow);
        dp(3, legBaseY + 2 + llOff, pantsShadow);
        dp(2, legBaseY + 3 + llOff, shoeColor);
        dp(3, legBaseY + 3 + llOff, shoeColor);

        const rlOff = rightLegY / PX;
        dp(4, legBaseY + rlOff, pantsColor);
        dp(5, legBaseY + rlOff, pantsColor);
        dp(4, legBaseY + 1 + rlOff, pantsShadow);
        dp(5, legBaseY + 1 + rlOff, pantsColor);
        dp(4, legBaseY + 2 + rlOff, pantsShadow);
        dp(5, legBaseY + 2 + rlOff, pantsShadow);
        dp(4, legBaseY + 3 + rlOff, shoeColor);
        dp(5, legBaseY + 3 + rlOff, shoeColor);
      }
    },
    [cx, topY, direction, appearance, offsets],
  );

  return <pixiGraphics draw={draw} />;
}

export const PlayerLegs = memo(PlayerLegsInner);
