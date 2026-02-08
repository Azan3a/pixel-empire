// components/game/viewport/world/property/drawBuildingBorder.ts

import { Graphics } from "pixi.js";
import type { BuildingPalette } from "./buildingPalettes";
import type { PropertyCategory } from "@/convex/mapZones";

/**
 * Draw building outline border and ownership/service glow effects.
 */
export function drawBuildingBorder(
  g: Graphics,
  width: number,
  height: number,
  category: PropertyCategory,
  palette: BuildingPalette,
  isOwned: boolean,
  isNight: boolean,
): void {
  const isService = category === "service";

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

  // Service building glow at night
  if (isService && isNight) {
    g.setStrokeStyle({ color: palette.accent, width: 1, alpha: 0.2 });
    g.rect(-2, -2, width + 4, height + 4);
    g.stroke();
  }
}
