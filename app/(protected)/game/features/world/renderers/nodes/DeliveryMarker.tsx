"use client";

import { Graphics } from "pixi.js";
import { useCallback, useRef, memo } from "react";
import { useTick } from "@pixi/react";

interface DeliveryMarkerProps {
  x: number;
  y: number;
  type: "pickup" | "dropoff";
  label: string;
  active: boolean;
}

function DeliveryMarkerInner({
  x,
  y,
  type,
  label,
  active,
}: DeliveryMarkerProps) {
  const frameRef = useRef(0);
  const gRef = useRef<Graphics | null>(null);

  const color = type === "pickup" ? 0x3b82f6 : 0xf97316;
  const glowColor = type === "pickup" ? 0x60a5fa : 0xfbbf24;

  const drawMarkerImperative = useCallback(
    (g: Graphics) => {
      g.clear();

      if (!active) {
        g.circle(0, 0, 14);
        g.fill({ color, alpha: 0.25 });
        g.setStrokeStyle({ color, width: 2, alpha: 0.3 });
        g.circle(0, 0, 14);
        g.stroke();
        return;
      }

      const pulse = Math.sin(frameRef.current) * 0.5 + 0.5;

      g.ellipse(0, 4, 22, 8);
      g.fill({ color: 0x000000, alpha: 0.15 });

      const outerR = 28 + pulse * 6;
      g.setStrokeStyle({
        color: glowColor,
        width: 2,
        alpha: 0.2 + pulse * 0.2,
      });
      g.circle(0, 0, outerR);
      g.stroke();

      g.setStrokeStyle({ color, width: 2.5, alpha: 0.5 });
      g.circle(0, 0, 20);
      g.stroke();

      const segments = 12;
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2 + frameRef.current * 0.3;
        const r = 24;
        const len = 0.15;
        const x1 = Math.cos(angle) * r;
        const y1 = Math.sin(angle) * r;
        const x2 = Math.cos(angle + len) * r;
        const y2 = Math.sin(angle + len) * r;
        g.setStrokeStyle({ color: glowColor, width: 1.5, alpha: 0.5 });
        g.moveTo(x1, y1).lineTo(x2, y2);
        g.stroke();
      }

      g.circle(0, 0, 14);
      g.fill({ color, alpha: 0.8 });

      g.circle(-3, -3, 7);
      g.fill({ color: 0xffffff, alpha: 0.15 });

      if (type === "pickup") {
        g.rect(-5, -4, 10, 8);
        g.fill({ color: 0xffffff, alpha: 0.9 });
        g.setStrokeStyle({ color: 0x000000, width: 0.8, alpha: 0.3 });
        g.rect(-5, -4, 10, 8);
        g.stroke();
        g.moveTo(0, -4).lineTo(0, 4);
        g.moveTo(-5, 0).lineTo(5, 0);
        g.stroke();
      } else {
        g.moveTo(-2, -5).lineTo(-2, 6);
        g.setStrokeStyle({ color: 0xffffff, width: 1.5, alpha: 0.9 });
        g.stroke();
        g.moveTo(-2, -5).lineTo(6, -2).lineTo(-2, 1);
        g.fill({ color: 0xffffff, alpha: 0.85 });
      }

      g.setStrokeStyle({ color: 0xffffff, width: 2, alpha: 0.6 });
      g.circle(0, 0, 14);
      g.stroke();
    },
    [active, color, glowColor, type],
  );

  useTick(() => {
    if (!active || !gRef.current) return;
    frameRef.current += 0.08;
    drawMarkerImperative(gRef.current);
  });

  const drawStatic = useCallback(
    (g: Graphics) => {
      gRef.current = g;
      drawMarkerImperative(g);
    },
    [drawMarkerImperative],
  );

  return (
    <pixiContainer x={x} y={y} interactiveChildren={false}>
      <pixiGraphics draw={drawStatic} />
      <pixiText
        text={active ? label : ""}
        x={0}
        y={-38}
        anchor={0.5}
        resolution={2}
        style={{
          fill: type === "pickup" ? "#93c5fd" : "#fdba74",
          fontSize: 11,
          fontFamily: "Arial, sans-serif",
          fontWeight: "bold",
          stroke: { color: "#000000", width: 3, join: "round" as const },
          letterSpacing: 0.3,
        }}
      />
      {active && (
        <pixiText
          text={type === "pickup" ? "PICKUP" : "DELIVER"}
          x={0}
          y={22}
          anchor={0.5}
          resolution={2}
          style={{
            fill: "#ffffff",
            fontSize: 9,
            fontFamily: "Arial, sans-serif",
            fontWeight: "bold",
            stroke: { color: "#000000", width: 3, join: "round" as const },
            letterSpacing: 1,
          }}
        />
      )}
    </pixiContainer>
  );
}

export const DeliveryMarker = memo(DeliveryMarkerInner);
