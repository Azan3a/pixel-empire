// components/game/viewport/world/property/drawBuildingBase.ts

import { Graphics } from "pixi.js";
import type { BuildingPalette } from "./buildingPalettes";
import { tintColor } from "./propertyDrawHelpers";
import type { PropertyCategory } from "@/convex/mapZones";

/**
 * Draw shadow, wall fill, roof inset, and category-specific roof details.
 */
export function drawBuildingBase(
  g: Graphics,
  width: number,
  height: number,
  category: PropertyCategory,
  palette: BuildingPalette,
  bf: number,
  isNight: boolean,
): void {
  const inset = 4;

  // Shadow
  const shadowAlpha = isNight ? 0.35 : 0.25;
  g.rect(5, 5, width, height);
  g.fill({ color: 0x000000, alpha: shadowAlpha });

  // Wall
  g.rect(0, 0, width, height);
  g.fill({ color: tintColor(palette.wall, bf) });

  // Roof inset
  g.rect(inset, inset, width - inset * 2, height - inset * 2);
  g.fill({ color: tintColor(palette.roof, bf) });

  // Category-specific roof details
  if (category === "residential") {
    g.setStrokeStyle({
      color: tintColor(0x6b4a2a, bf),
      width: 2,
      alpha: 0.5,
    });
    g.moveTo(inset, height / 2).lineTo(width - inset, height / 2);
    g.stroke();
  } else if (category === "service") {
    const bandH = 3;
    g.rect(inset, inset, width - inset * 2, bandH);
    g.fill({ color: tintColor(palette.accent, bf), alpha: 0.6 });
    g.rect(inset, height - inset - bandH, width - inset * 2, bandH);
    g.fill({ color: tintColor(palette.accent, bf), alpha: 0.6 });
  }
}
