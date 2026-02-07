// components/game/viewport/world/PropertyNode.tsx
"use client";

import { Graphics } from "pixi.js";
import { useCallback, memo } from "react";
import { Property } from "@/types/property";
import { Id } from "@/convex/_generated/dataModel";

interface PropertyNodeProps {
  property: Property;
  isOwner: boolean;
  onInteract: (id: Id<"properties">) => void;
  sunlightIntensity?: number; // 0 = full dark, 1 = full bright
}

const COLORS = {
  commercial: {
    wall: 0x4a6fa5,
    roof: 0x5a82b5,
    window: 0x88ccff,
    windowLit: 0xffdd66,
    awning: 0xcc3333,
    door: 0x3a3a3a,
  },
  residential: {
    wall: 0x8b6b4a,
    roof: 0xa0784a,
    window: 0xffee88,
    windowLit: 0xffcc44,
    awning: 0x8b6b4a,
    door: 0x5c3a1a,
  },
};

function tintColor(color: number, factor: number): number {
  // factor: 1 = original, 0 = fully dark
  const r = Math.round(((color >> 16) & 0xff) * factor);
  const g = Math.round(((color >> 8) & 0xff) * factor);
  const b = Math.round((color & 0xff) * factor);
  return (Math.min(255, r) << 16) | (Math.min(255, g) << 8) | Math.min(255, b);
}

// Deterministic "random" per window position — decides if a window is lit at night
function windowLit(px: number, py: number, wx: number, wy: number): boolean {
  const hash = ((px + wx) * 7919 + (py + wy) * 104729) % 100;
  return hash < 55; // ~55% of windows lit
}

function PropertyNodeInner({
  property,
  isOwner,
  onInteract,
  sunlightIntensity = 1,
}: PropertyNodeProps) {
  const drawProperty = useCallback(
    (g: Graphics) => {
      g.clear();

      const { width, height, type, x: px, y: py } = property;
      const isComm = type === "commercial";
      const c = isComm ? COLORS.commercial : COLORS.residential;

      // Brightness factor for walls/roof (dimmed at night)
      const bf = 0.4 + sunlightIntensity * 0.6; // range: 0.4 (night) – 1.0 (day)
      const isNight = sunlightIntensity < 0.3;
      const isDusk = sunlightIntensity < 0.6;

      // Shadow (stronger at night from ambient lights)
      const shadowAlpha = isNight ? 0.35 : 0.25;
      g.rect(5, 5, width, height);
      g.fill({ color: 0x000000, alpha: shadowAlpha });

      // Wall
      g.rect(0, 0, width, height);
      g.fill({ color: tintColor(c.wall, bf) });

      // Roof inset
      const inset = 4;
      g.rect(inset, inset, width - inset * 2, height - inset * 2);
      g.fill({ color: tintColor(c.roof, bf) });

      // Roof ridge (residential)
      if (!isComm) {
        g.setStrokeStyle({
          color: tintColor(0x6b4a2a, bf),
          width: 2,
          alpha: 0.5,
        });
        g.moveTo(inset, height / 2).lineTo(width - inset, height / 2);
        g.stroke();
      }

      // Windows — lit individually at night
      const winW = 6;
      const winH = 7;
      const gapX = isComm ? 16 : 20;
      const gapY = isComm ? 16 : 20;
      const padX = 14;
      const padY = 14;

      for (let wx = padX; wx + winW < width - padX; wx += gapX) {
        for (let wy = padY; wy + winH < height - padY; wy += gapY) {
          const lit = isNight && windowLit(px, py, wx, wy);

          if (lit) {
            // Warm glow behind window
            g.rect(wx - 2, wy - 2, winW + 4, winH + 4);
            g.fill({ color: c.windowLit, alpha: 0.15 });

            // Lit window
            g.rect(wx, wy, winW, winH);
            g.fill({ color: c.windowLit, alpha: 0.95 });
          } else if (isDusk && windowLit(px, py, wx, wy + 1000)) {
            // Some windows dimly lit at dusk
            g.rect(wx, wy, winW, winH);
            g.fill({ color: c.windowLit, alpha: 0.4 });
          } else {
            // Daytime / unlit window
            g.rect(wx, wy, winW, winH);
            g.fill({ color: tintColor(c.window, bf), alpha: 0.85 });
          }

          // Window frame
          g.setStrokeStyle({ color: 0x333333, width: 0.5, alpha: 0.4 });
          g.rect(wx, wy, winW, winH);
          g.stroke();
          g.moveTo(wx + winW / 2, wy).lineTo(wx + winW / 2, wy + winH);
          g.moveTo(wx, wy + winH / 2).lineTo(wx + winW, wy + winH / 2);
          g.stroke();
        }
      }

      // Door
      const doorW = 10;
      const doorH = 14;
      const doorX = width / 2 - doorW / 2;
      const doorY = height - doorH - inset;
      g.rect(doorX, doorY, doorW, doorH);
      g.fill({ color: tintColor(c.door, bf) });
      g.setStrokeStyle({ color: 0x222222, width: 1, alpha: 0.4 });
      g.rect(doorX, doorY, doorW, doorH);
      g.stroke();
      g.circle(doorX + doorW - 3, doorY + doorH / 2, 1.2);
      g.fill({ color: 0xdaa520 });

      // Door light at night
      if (isNight) {
        g.circle(doorX + doorW / 2, doorY - 3, 4);
        g.fill({ color: 0xfff0cc, alpha: 0.2 });
        g.circle(doorX + doorW / 2, doorY - 3, 1.5);
        g.fill({ color: 0xffeeaa, alpha: 0.7 });
      }

      // Awning (commercial)
      if (isComm && height > 40) {
        const awningH = 8;
        const awningY = height - awningH - 1;
        g.rect(inset, awningY, width - inset * 2, awningH);
        g.fill({ color: tintColor(c.awning, bf) });
        for (let sx = inset; sx < width - inset; sx += 10) {
          g.rect(sx, awningY, 5, awningH);
          g.fill({ color: 0xffffff, alpha: 0.2 });
        }
      }

      // AC unit (commercial)
      if (isComm && width > 50) {
        g.rect(width - 18, 8, 10, 8);
        g.fill({ color: tintColor(0x888888, bf) });
        g.setStrokeStyle({
          color: tintColor(0x666666, bf),
          width: 1,
          alpha: 0.5,
        });
        g.rect(width - 18, 8, 10, 8);
        g.stroke();
        g.circle(width - 13, 12, 2);
        g.fill({ color: tintColor(0x555555, bf) });
      }

      // Chimney (residential)
      if (!isComm && width > 40) {
        g.rect(width - 16, 4, 8, 10);
        g.fill({ color: tintColor(0x8b4513, bf) });
        g.setStrokeStyle({
          color: tintColor(0x6b3410, bf),
          width: 1,
          alpha: 0.5,
        });
        g.rect(width - 16, 4, 8, 10);
        g.stroke();
      }

      // Border
      g.setStrokeStyle({
        color: isOwner ? 0x10b981 : 0x222222,
        width: isOwner ? 3 : 2,
        alpha: isOwner ? 1 : 0.6,
      });
      g.rect(0, 0, width, height);
      g.stroke();

      // Owner glow
      if (isOwner) {
        g.setStrokeStyle({ color: 0x10b981, width: 1.5, alpha: 0.3 });
        g.rect(-3, -3, width + 6, height + 6);
        g.stroke();
      }
    },
    [property, isOwner, sunlightIntensity],
  );

  return (
    <pixiContainer
      x={property.x}
      y={property.y}
      eventMode="static"
      cursor="pointer"
      onPointerTap={() => onInteract(property._id)}
    >
      <pixiGraphics draw={drawProperty} />

      <pixiText
        text={property.name}
        x={property.width / 2}
        y={property.height / 2 - 8}
        anchor={0.5}
        resolution={2}
        style={{
          fill: "#ffffff",
          fontSize: 12,
          fontFamily: "Arial, sans-serif",
          fontWeight: "bold",
          stroke: { color: "#000000", width: 3, join: "round" as const },
          letterSpacing: 0.5,
        }}
      />

      {!property.ownerId ? (
        <pixiText
          text={`$${property.price.toLocaleString()}`}
          x={property.width / 2}
          y={property.height / 2 + 10}
          anchor={0.5}
          resolution={2}
          style={{
            fill: "#4ade80",
            fontSize: 11,
            fontFamily: "Arial, sans-serif",
            fontWeight: "bold",
            stroke: { color: "#000000", width: 3, join: "round" as const },
          }}
        />
      ) : (
        <pixiText
          text={isOwner ? "YOURS" : "OWNED"}
          x={property.width / 2}
          y={property.height / 2 + 10}
          anchor={0.5}
          resolution={2}
          style={{
            fill: isOwner ? "#34d399" : "#999999",
            fontSize: 10,
            fontFamily: "Arial, sans-serif",
            fontWeight: "bold",
            stroke: { color: "#000000", width: 3, join: "round" as const },
          }}
        />
      )}
    </pixiContainer>
  );
}

export const PropertyNode = memo(PropertyNodeInner);
