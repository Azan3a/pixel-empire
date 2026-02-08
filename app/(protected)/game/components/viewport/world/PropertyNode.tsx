// components/game/viewport/world/PropertyNode.tsx
"use client";

import { Graphics } from "pixi.js";
import { useCallback, memo } from "react";
import { Property } from "@game/types/property";
import { Id } from "@/convex/_generated/dataModel";
import type { PropertyCategory, PropertySubType } from "@/convex/mapZones";

interface PropertyNodeProps {
  property: Property;
  onInteract: (id: Id<"properties">) => void;
  sunlightIntensity?: number;
}

// ── Color palettes per category ──

interface BuildingPalette {
  wall: number;
  roof: number;
  window: number;
  windowLit: number;
  awning: number;
  door: number;
  accent: number;
}

const PALETTES: Record<PropertyCategory, BuildingPalette> = {
  residential: {
    wall: 0x8b6b4a,
    roof: 0xa0784a,
    window: 0xffee88,
    windowLit: 0xffcc44,
    awning: 0x8b6b4a,
    door: 0x5c3a1a,
    accent: 0x8b6b4a,
  },
  commercial: {
    wall: 0x4a6fa5,
    roof: 0x5a82b5,
    window: 0x88ccff,
    windowLit: 0xffdd66,
    awning: 0xcc3333,
    door: 0x3a3a3a,
    accent: 0x4a6fa5,
  },
  shop: {
    wall: 0x6a5a8a,
    roof: 0x7a6a9a,
    window: 0xddccff,
    windowLit: 0xffaa55,
    awning: 0xaa44aa,
    door: 0x4a3a5a,
    accent: 0x9b59b6,
  },
  service: {
    wall: 0x8a8a6a,
    roof: 0x9a9a7a,
    window: 0xccddaa,
    windowLit: 0xffeebb,
    awning: 0xbba030,
    door: 0x4a4a3a,
    accent: 0xd4a017,
  },
};

// ── Sub-type accent overrides ──

const SUBTYPE_ACCENTS: Partial<
  Record<PropertySubType, { wall?: number; accent?: number; awning?: number }>
> = {
  bank: { wall: 0x7a7a6a, accent: 0xd4af37, awning: 0xd4af37 },
  casino: { wall: 0x3a1a4a, accent: 0xff2266, awning: 0xff2266 },
  police_station: { wall: 0x3a4a6a, accent: 0x3b82f6, awning: 0x3b82f6 },
  ranger_station: { wall: 0x4a5a3a, accent: 0x2d8a2d, awning: 0x2d8a2d },
  warehouse: { wall: 0x6a6a5a, accent: 0x8a8a7a },
  factory: { wall: 0x5a5a4a, accent: 0x7a7a6a },
  food_shop: { awning: 0xe67e22 },
  clothing_store: { awning: 0xe91e63 },
  supply_store: { awning: 0x27ae60 },
};

function tintColor(color: number, factor: number): number {
  const r = Math.round(((color >> 16) & 0xff) * factor);
  const g = Math.round(((color >> 8) & 0xff) * factor);
  const b = Math.round((color & 0xff) * factor);
  return (Math.min(255, r) << 16) | (Math.min(255, g) << 8) | Math.min(255, b);
}

function windowLit(px: number, py: number, wx: number, wy: number): boolean {
  const hash = ((px + wx) * 7919 + (py + wy) * 104729) % 100;
  return hash < 55;
}

function PropertyNodeInner({
  property,
  onInteract,
  sunlightIntensity = 1,
}: PropertyNodeProps) {
  const drawProperty = useCallback(
    (g: Graphics) => {
      g.clear();

      const {
        width,
        height,
        category,
        subType,
        x: px,
        y: py,
        isOwned,
      } = property;

      // Resolve palette
      const basePalette = PALETTES[category];
      const overrides = SUBTYPE_ACCENTS[subType] ?? {};
      const c: BuildingPalette = {
        ...basePalette,
        ...overrides,
      };

      const bf = 0.4 + sunlightIntensity * 0.6;
      const isNight = sunlightIntensity < 0.3;
      const isDusk = sunlightIntensity < 0.6;
      const isService = category === "service";
      const isShop = category === "shop";

      // ── Shadow ──
      const shadowAlpha = isNight ? 0.35 : 0.25;
      g.rect(5, 5, width, height);
      g.fill({ color: 0x000000, alpha: shadowAlpha });

      // ── Wall ──
      g.rect(0, 0, width, height);
      g.fill({ color: tintColor(c.wall, bf) });

      // ── Roof inset ──
      const inset = 4;
      g.rect(inset, inset, width - inset * 2, height - inset * 2);
      g.fill({ color: tintColor(c.roof, bf) });

      // ── Category-specific roof details ──
      if (category === "residential") {
        // Roof ridge
        g.setStrokeStyle({
          color: tintColor(0x6b4a2a, bf),
          width: 2,
          alpha: 0.5,
        });
        g.moveTo(inset, height / 2).lineTo(width - inset, height / 2);
        g.stroke();
      } else if (isService) {
        // Service building: horizontal bands
        const bandH = 3;
        g.rect(inset, inset, width - inset * 2, bandH);
        g.fill({ color: tintColor(c.accent, bf), alpha: 0.6 });
        g.rect(inset, height - inset - bandH, width - inset * 2, bandH);
        g.fill({ color: tintColor(c.accent, bf), alpha: 0.6 });
      }

      // ── Sub-type specific features ──
      if (subType === "bank" && width > 40) {
        // Columns
        const colW = 4;
        const colH = height - inset * 2 - 8;
        const cols = Math.min(4, Math.floor((width - 20) / 18));
        const spacing = (width - 20) / (cols + 1);
        for (let ci = 1; ci <= cols; ci++) {
          const cx = 10 + spacing * ci - colW / 2;
          g.rect(cx, inset + 4, colW, colH);
          g.fill({ color: tintColor(0xccccaa, bf), alpha: 0.7 });
          g.setStrokeStyle({
            color: tintColor(0x999977, bf),
            width: 0.5,
            alpha: 0.5,
          });
          g.rect(cx, inset + 4, colW, colH);
          g.stroke();
        }
      }

      if (subType === "casino" && isNight) {
        // Neon glow border
        g.setStrokeStyle({
          color: 0xff2266,
          width: 2,
          alpha: 0.5 + Math.sin(px * 0.1) * 0.2,
        });
        g.rect(1, 1, width - 2, height - 2);
        g.stroke();
        g.setStrokeStyle({ color: 0xffdd00, width: 1, alpha: 0.3 });
        g.rect(3, 3, width - 6, height - 6);
        g.stroke();
      }

      if (subType === "police_station") {
        // Blue light on top
        const lightAlpha = isNight ? 0.6 : 0.3;
        g.circle(width / 2, inset + 4, 4);
        g.fill({ color: 0x3b82f6, alpha: lightAlpha });
        if (isNight) {
          g.circle(width / 2, inset + 4, 10);
          g.fill({ color: 0x3b82f6, alpha: 0.1 });
        }
      }

      // ── Windows ──
      const winW = 6;
      const winH = 7;
      const gapX = category === "residential" ? 20 : 16;
      const gapY = category === "residential" ? 20 : 16;
      const padX = 14;
      const padY = 14;

      for (let wx = padX; wx + winW < width - padX; wx += gapX) {
        for (let wy = padY; wy + winH < height - padY; wy += gapY) {
          const lit = isNight && windowLit(px, py, wx, wy);

          if (lit) {
            g.rect(wx - 2, wy - 2, winW + 4, winH + 4);
            g.fill({ color: c.windowLit, alpha: 0.15 });
            g.rect(wx, wy, winW, winH);
            g.fill({ color: c.windowLit, alpha: 0.95 });
          } else if (isDusk && windowLit(px, py, wx, wy + 1000)) {
            g.rect(wx, wy, winW, winH);
            g.fill({ color: c.windowLit, alpha: 0.4 });
          } else {
            g.rect(wx, wy, winW, winH);
            g.fill({ color: tintColor(c.window, bf), alpha: 0.85 });
          }

          g.setStrokeStyle({ color: 0x333333, width: 0.5, alpha: 0.4 });
          g.rect(wx, wy, winW, winH);
          g.stroke();
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
      g.fill({ color: tintColor(c.door, bf) });
      g.setStrokeStyle({ color: 0x222222, width: 1, alpha: 0.4 });
      g.rect(doorX, doorY, doorW, doorH);
      g.stroke();
      g.circle(doorX + doorW - 3, doorY + doorH / 2, 1.2);
      g.fill({ color: 0xdaa520 });

      // Service buildings: wider double doors
      if (isService && width > 60) {
        const dblW = 18;
        const dblX = width / 2 - dblW / 2;
        g.rect(dblX, doorY, dblW, doorH);
        g.fill({ color: tintColor(c.door, bf) });
        g.setStrokeStyle({ color: 0x222222, width: 1, alpha: 0.4 });
        g.rect(dblX, doorY, dblW, doorH);
        g.stroke();
        g.moveTo(dblX + dblW / 2, doorY).lineTo(dblX + dblW / 2, doorY + doorH);
        g.stroke();
      }

      // Door light at night
      if (isNight) {
        g.circle(doorX + doorW / 2, doorY - 3, 4);
        g.fill({ color: 0xfff0cc, alpha: 0.2 });
        g.circle(doorX + doorW / 2, doorY - 3, 1.5);
        g.fill({ color: 0xffeeaa, alpha: 0.7 });
      }

      // ── Awning (shop + commercial) ──
      if ((isShop || category === "commercial") && height > 40) {
        const awningH = 8;
        const awningY = height - awningH - 1;
        g.rect(inset, awningY, width - inset * 2, awningH);
        g.fill({ color: tintColor(c.awning, bf) });
        for (let sx = inset; sx < width - inset; sx += 10) {
          g.rect(sx, awningY, 5, awningH);
          g.fill({ color: 0xffffff, alpha: 0.2 });
        }
      }

      // ── AC unit (commercial / shop) ──
      if ((category === "commercial" || isShop) && width > 50) {
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

      // ── Chimney (residential) ──
      if (category === "residential" && width > 40) {
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

      // ── Smokestack (warehouse / factory) ──
      if ((subType === "warehouse" || subType === "factory") && width > 50) {
        g.rect(width - 14, 2, 6, 14);
        g.fill({ color: tintColor(0x666666, bf) });
        g.setStrokeStyle({
          color: tintColor(0x444444, bf),
          width: 1,
          alpha: 0.5,
        });
        g.rect(width - 14, 2, 6, 14);
        g.stroke();
        // Smoke puff at night
        if (isNight) {
          g.circle(width - 11, -2, 3);
          g.fill({ color: 0xaaaaaa, alpha: 0.15 });
        }
      }

      // ── Border ──
      const borderColor = isOwned ? 0x10b981 : isService ? 0xd4a017 : 0x222222;
      const borderWidth = isOwned ? 3 : isService ? 2.5 : 2;
      const borderAlpha = isOwned ? 1 : isService ? 0.8 : 0.6;

      g.setStrokeStyle({
        color: borderColor,
        width: borderWidth,
        alpha: borderAlpha,
      });
      g.rect(0, 0, width, height);
      g.stroke();

      // Owner glow
      if (isOwned) {
        g.setStrokeStyle({ color: 0x10b981, width: 1.5, alpha: 0.3 });
        g.rect(-3, -3, width + 6, height + 6);
        g.stroke();
      }

      // Service building glow
      if (isService && isNight) {
        g.setStrokeStyle({ color: c.accent, width: 1, alpha: 0.2 });
        g.rect(-2, -2, width + 4, height + 4);
        g.stroke();
      }
    },
    [property, sunlightIntensity],
  );

  // ── Label logic ──
  const { category, isOwned, ownerCount, maxOwners, price } = property;
  const isService = category === "service";

  let statusText: string;
  let statusColor: string;

  if (isService) {
    statusText = "PUBLIC";
    statusColor = "#d4a017";
  } else if (isOwned) {
    statusText = `YOURS${ownerCount > 1 ? ` (+${ownerCount - 1})` : ""}`;
    statusColor = "#34d399";
  } else if (ownerCount >= maxOwners) {
    statusText = "FULL";
    statusColor = "#999999";
  } else if (ownerCount > 0) {
    statusText = `$${price.toLocaleString()} · ${ownerCount}/${maxOwners}`;
    statusColor = "#4ade80";
  } else {
    statusText = `$${price.toLocaleString()}`;
    statusColor = "#4ade80";
  }

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

      <pixiText
        text={statusText}
        x={property.width / 2}
        y={property.height / 2 + 10}
        anchor={0.5}
        resolution={2}
        style={{
          fill: statusColor,
          fontSize: 10,
          fontFamily: "Arial, sans-serif",
          fontWeight: "bold",
          stroke: { color: "#000000", width: 3, join: "round" as const },
        }}
      />
    </pixiContainer>
  );
}

export const PropertyNode = memo(PropertyNodeInner);
