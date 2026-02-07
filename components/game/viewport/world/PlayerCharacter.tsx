// /components/game/viewport/world/PlayerCharacter.tsx
"use client";

import { Graphics } from "pixi.js";
import { useCallback } from "react";

interface PlayerCharacterProps {
  x: number;
  y: number;
  name: string;
  color: number;
  isMe: boolean;
}

export function PlayerCharacter({
  x,
  y,
  name,
  color,
  isMe,
}: PlayerCharacterProps) {
  const drawPlayer = useCallback(
    (g: Graphics) => {
      g.clear();
      // Shadow
      g.setFillStyle({ color: 0x000000, alpha: 0.1 });
      g.ellipse(2, 22, 15, 6);
      g.fill();

      // Body
      g.setFillStyle({ color });
      g.circle(0, 0, 22);
      g.fill();

      // Border
      g.setStrokeStyle({
        color: isMe ? 0xffffff : 0x000000,
        width: 3,
        alpha: isMe ? 0.8 : 0.2,
      });
      g.circle(0, 0, 22);
      g.stroke();
    },
    [color, isMe],
  );

  return (
    <pixiContainer x={x} y={y}>
      <pixiGraphics draw={drawPlayer} />
      <pixiText
        text={name}
        x={0}
        y={-45}
        anchor={0.5}
        style={{
          fill: isMe ? "#059669" : "#333333",
          fontSize: 14,
          fontWeight: isMe ? "900" : "bold",
          dropShadow: {
            blur: isMe ? 4 : 2,
            color: "#ffffff",
            distance: 0,
          },
        }}
      />
    </pixiContainer>
  );
}
