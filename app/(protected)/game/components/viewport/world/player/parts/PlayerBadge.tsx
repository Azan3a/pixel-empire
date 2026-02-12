// components/game/viewport/world/player/parts/PlayerBadge.tsx
"use client";

import { Graphics } from "pixi.js";
import { useCallback, memo } from "react";
import { darken } from "../utils";

interface PlayerBadgeProps {
  name: string;
  color: number;
  isMe: boolean;
  topY: number;
}

function PlayerBadgeInner({ name, color, isMe, topY }: PlayerBadgeProps) {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();

      // "Me" indicator ring
      if (isMe) {
        g.circle(0, 6, 22);
        g.fill({ color, alpha: 0.08 });
        g.setStrokeStyle({ color, width: 1.5, alpha: 0.25 });
        g.circle(0, 6, 20);
        g.stroke();
      }

      // Name badge background
      const badgeW = Math.max(name.length * 7 + 14, 40);
      const badgeH = 16;
      const badgeY = topY - 20;

      g.roundRect(-badgeW / 2, badgeY, badgeW, badgeH, 3);
      g.fill({ color: isMe ? darken(color, 0.3) : 0x1a1a1a, alpha: 0.8 });

      g.setStrokeStyle({
        color: isMe ? color : 0x444444,
        width: 1,
        alpha: 0.6,
      });
      g.roundRect(-badgeW / 2, badgeY, badgeW, badgeH, 3);
      g.stroke();
    },
    [name, color, isMe, topY],
  );

  return <pixiGraphics draw={draw} />;
}

export const PlayerBadge = memo(PlayerBadgeInner);
