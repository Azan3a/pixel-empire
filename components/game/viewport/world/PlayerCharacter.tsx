// components/game/viewport/world/PlayerCharacter.tsx
"use client";

import { Graphics } from "pixi.js";
import { useCallback, memo } from "react";

interface PlayerCharacterProps {
  x: number;
  y: number;
  name: string;
  color: number;
  isMe: boolean;
  sunlightIntensity?: number; // 0 = full dark, 1 = full bright
}

function darken(color: number, factor: number): number {
  const r = Math.floor(((color >> 16) & 0xff) * (1 - factor));
  const g = Math.floor(((color >> 8) & 0xff) * (1 - factor));
  const b = Math.floor((color & 0xff) * (1 - factor));
  return (r << 16) | (g << 8) | b;
}

function PlayerCharacterInner({
  x,
  y,
  name,
  color,
  isMe,
  sunlightIntensity = 1,
}: PlayerCharacterProps) {
  const drawPlayer = useCallback(
    (g: Graphics) => {
      g.clear();

      const radius = 20;
      const isNight = sunlightIntensity < 0.3;

      // ── Shadow ──
      g.ellipse(3, radius - 2, radius * 0.8, radius * 0.3);
      g.fill({ color: 0x000000, alpha: isNight ? 0.3 : 0.18 });

      // ── Body base ──
      g.circle(0, 0, radius);
      g.fill({ color });

      // ── Body shading (bottom-right darker) ──
      g.circle(3, 3, radius - 2);
      g.fill({ color: darken(color, 0.2), alpha: 0.3 });

      // ── Body highlight (top-left lighter) ──
      g.circle(-5, -5, radius * 0.55);
      g.fill({ color: 0xffffff, alpha: isNight ? 0.1 : 0.18 });

      // Specular dot
      g.circle(-7, -8, 4);
      g.fill({ color: 0xffffff, alpha: isNight ? 0.15 : 0.3 });

      // ── Body outline ──
      g.setStrokeStyle({
        color: isMe ? 0xffffff : darken(color, 0.4),
        width: 2.5,
        alpha: isMe ? 0.85 : 0.4,
      });
      g.circle(0, 0, radius);
      g.stroke();

      // ── Eyes ──
      g.ellipse(-6, -3, 4, 4.5);
      g.fill({ color: 0xffffff, alpha: 0.95 });
      g.ellipse(6, -3, 4, 4.5);
      g.fill({ color: 0xffffff, alpha: 0.95 });

      // Iris
      g.circle(-5, -3, 2.5);
      g.fill({ color: 0x2a2a4a });
      g.circle(7, -3, 2.5);
      g.fill({ color: 0x2a2a4a });

      // Pupil
      g.circle(-5, -3, 1.2);
      g.fill({ color: 0x000000 });
      g.circle(7, -3, 1.2);
      g.fill({ color: 0x000000 });

      // Eye shine — brighter at night (reflective)
      const shineAlpha = isNight ? 1.0 : 0.9;
      g.circle(-6, -4.5, 1);
      g.fill({ color: 0xffffff, alpha: shineAlpha });
      g.circle(6, -4.5, 1);
      g.fill({ color: 0xffffff, alpha: shineAlpha });

      // ── Mouth ──
      g.setStrokeStyle({ color: darken(color, 0.5), width: 1.5, alpha: 0.45 });
      g.arc(0, 3, 5, 0.3, Math.PI - 0.3);
      g.stroke();

      // ── Name badge background ──
      const badgeW = Math.max(name.length * 7.5 + 14, 40);
      const badgeH = 18;
      const badgeY = -46;

      g.roundRect(-badgeW / 2, badgeY, badgeW, badgeH, 9);
      g.fill({ color: isMe ? darken(color, 0.3) : 0x222222, alpha: 0.7 });

      g.setStrokeStyle({
        color: isMe ? color : 0x555555,
        width: 1,
        alpha: 0.5,
      });
      g.roundRect(-badgeW / 2, badgeY, badgeW, badgeH, 9);
      g.stroke();
    },
    [color, isMe, name.length, sunlightIntensity],
  );

  return (
    <pixiContainer x={x} y={y}>
      <pixiGraphics draw={drawPlayer} />
      <pixiText
        text={name}
        x={0}
        y={-37}
        anchor={0.5}
        resolution={2}
        style={{
          fill: "#ffffff",
          fontSize: 12,
          fontFamily: "Arial, sans-serif",
          fontWeight: "bold",
          letterSpacing: 0.3,
        }}
      />
    </pixiContainer>
  );
}

export const PlayerCharacter = memo(PlayerCharacterInner);
