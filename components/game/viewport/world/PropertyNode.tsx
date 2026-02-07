"use client";

import { Graphics } from "pixi.js";
import { useCallback } from "react";
import { Property } from "@/types/property";
import { Id } from "@/convex/_generated/dataModel";

interface PropertyNodeProps {
  property: Property;
  isOwner: boolean;
  onInteract: (id: Id<"properties">) => void;
}

const COLORS = {
  commercial: {
    wall: 0x4a6fa5,
    roof: 0x5a82b5,
    window: 0x88ccff,
    awning: 0xcc3333,
    door: 0x3a3a3a,
  },
  residential: {
    wall: 0x8b6b4a,
    roof: 0xa0784a,
    window: 0xffee88,
    awning: 0x8b6b4a,
    door: 0x5c3a1a,
  },
};

export function PropertyNode({
  property,
  isOwner,
  onInteract,
}: PropertyNodeProps) {
  const drawProperty = useCallback(
    (g: Graphics) => {
      g.clear();

      const { width, height, type } = property;
      const isComm = type === "commercial";
      const c = isComm ? COLORS.commercial : COLORS.residential;

      // ── Drop shadow ──
      g.rect(5, 5, width, height);
      g.fill({ color: 0x000000, alpha: 0.25 });

      // ── Wall base ──
      g.rect(0, 0, width, height);
      g.fill({ color: c.wall });

      // ── Roof (inset) ──
      const inset = 4;
      g.rect(inset, inset, width - inset * 2, height - inset * 2);
      g.fill({ color: c.roof });

      // ── Roof ridge line (residential only) ──
      if (!isComm) {
        g.setStrokeStyle({ color: 0x6b4a2a, width: 2, alpha: 0.5 });
        g.moveTo(inset, height / 2).lineTo(width - inset, height / 2);
        g.stroke();
      }

      // ── Windows ──
      const winW = 6;
      const winH = 7;
      const gapX = isComm ? 16 : 20;
      const gapY = isComm ? 16 : 20;
      const padX = 14;
      const padY = 14;

      for (let wx = padX; wx + winW < width - padX; wx += gapX) {
        for (let wy = padY; wy + winH < height - padY; wy += gapY) {
          // Window pane
          g.rect(wx, wy, winW, winH);
          g.fill({ color: c.window, alpha: 0.85 });

          // Window frame
          g.setStrokeStyle({ color: 0x333333, width: 0.5, alpha: 0.4 });
          g.rect(wx, wy, winW, winH);
          g.stroke();

          // Window cross
          g.moveTo(wx + winW / 2, wy).lineTo(wx + winW / 2, wy + winH);
          g.moveTo(wx, wy + winH / 2).lineTo(wx + winW, wy + winH / 2);
          g.stroke();
        }
      }

      // ── Door ──
      const doorW = 10;
      const doorH = 14;
      const doorX = width / 2 - doorW / 2;
      const doorY = height - doorH - inset;

      g.rect(doorX, doorY, doorW, doorH);
      g.fill({ color: c.door });

      // Door frame
      g.setStrokeStyle({ color: 0x222222, width: 1, alpha: 0.4 });
      g.rect(doorX, doorY, doorW, doorH);
      g.stroke();

      // Doorknob
      g.circle(doorX + doorW - 3, doorY + doorH / 2, 1.2);
      g.fill({ color: 0xdaa520 });

      // ── Commercial awning ──
      if (isComm && height > 40) {
        const awningH = 8;
        const awningY = height - awningH - 1;

        g.rect(inset, awningY, width - inset * 2, awningH);
        g.fill({ color: c.awning });

        // Awning stripes
        for (let sx = inset; sx < width - inset; sx += 10) {
          g.rect(sx, awningY, 5, awningH);
          g.fill({ color: 0xffffff, alpha: 0.2 });
        }
      }

      // ── AC unit on roof (commercial) ──
      if (isComm && width > 50) {
        g.rect(width - 18, 8, 10, 8);
        g.fill({ color: 0x888888 });
        g.setStrokeStyle({ color: 0x666666, width: 1, alpha: 0.5 });
        g.rect(width - 18, 8, 10, 8);
        g.stroke();
        // Fan grill
        g.circle(width - 13, 12, 2);
        g.fill({ color: 0x555555 });
      }

      // ── Chimney (residential) ──
      if (!isComm && width > 40) {
        g.rect(width - 16, 4, 8, 10);
        g.fill({ color: 0x8b4513 });
        g.setStrokeStyle({ color: 0x6b3410, width: 1, alpha: 0.5 });
        g.rect(width - 16, 4, 8, 10);
        g.stroke();
      }

      // ── Border ──
      g.setStrokeStyle({
        color: isOwner ? 0x10b981 : 0x222222,
        width: isOwner ? 3 : 2,
        alpha: isOwner ? 1 : 0.6,
      });
      g.rect(0, 0, width, height);
      g.stroke();

      // ── Owner glow (inner border) ──
      if (isOwner) {
        g.setStrokeStyle({ color: 0x10b981, width: 1.5, alpha: 0.3 });
        g.rect(-3, -3, width + 6, height + 6);
        g.stroke();
      }
    },
    [property, isOwner],
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

      {/* Property name */}
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
          stroke: { color: "#000000", width: 3, join: "round" },
          letterSpacing: 0.5,
        }}
      />

      {/* Price / status */}
      {!property.ownerId ? (
        <pixiText
          text={`💰 $${(property.price ?? 0).toLocaleString()}`}
          x={property.width / 2}
          y={property.height / 2 + 10}
          anchor={0.5}
          resolution={2}
          style={{
            fill: "#4ade80",
            fontSize: 11,
            fontFamily: "Arial, sans-serif",
            fontWeight: "bold",
            stroke: { color: "#000000", width: 3, join: "round" },
          }}
        />
      ) : (
        <pixiText
          text="OWNED"
          x={property.width / 2}
          y={property.height / 2 + 10}
          anchor={0.5}
          resolution={2}
          style={{
            fill: isOwner ? "#34d399" : "#999999",
            fontSize: 10,
            fontFamily: "Arial, sans-serif",
            fontWeight: "bold",
            stroke: { color: "#000000", width: 3, join: "round" },
          }}
        />
      )}
    </pixiContainer>
  );
}
