// components/game/viewport/world/property/drawBuildingBorder.ts

import { Graphics } from "pixi.js";
import type { BuildingPalette } from "./buildingPalettes";
import type { PropertyCategory } from "@/convex/mapZones";

/**
 * Draw building outline and ownership/status glow effects.
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

  // Base outline
  const borderColor = isOwned ? 0x10b981 : isService ? 0xd4a017 : 0x333333;
  const borderWidth = isOwned ? 2.5 : isService ? 2 : 1.5;
  const borderAlpha = isOwned ? 0.9 : isService ? 0.7 : 0.4;

  g.setStrokeStyle({
    color: borderColor,
    width: borderWidth,
    alpha: borderAlpha,
  });
  g.rect(0, 0, width, height);
  g.stroke();

  // Owner glow
  if (isOwned) {
    g.setStrokeStyle({ color: 0x10b981, width: 1.5, alpha: 0.25 });
    g.rect(-3, -3, width + 6, height + 6);
    g.stroke();
    // Corner accents
    const cLen = 6;
    g.setStrokeStyle({ color: 0x10b981, width: 2, alpha: 0.5 });
    // Top-left
    g.moveTo(-2, cLen - 2)
      .lineTo(-2, -2)
      .lineTo(cLen - 2, -2);
    g.stroke();
    // Top-right
    g.moveTo(width - cLen + 2, -2)
      .lineTo(width + 2, -2)
      .lineTo(width + 2, cLen - 2);
    g.stroke();
    // Bottom-left
    g.moveTo(-2, height - cLen + 2)
      .lineTo(-2, height + 2)
      .lineTo(cLen - 2, height + 2);
    g.stroke();
    // Bottom-right
    g.moveTo(width - cLen + 2, height + 2)
      .lineTo(width + 2, height + 2)
      .lineTo(width + 2, height - cLen + 2);
    g.stroke();
  }

  // Service building glow at night
  if (isService && isNight) {
    g.setStrokeStyle({ color: palette.accent, width: 1, alpha: 0.15 });
    g.rect(-2, -2, width + 4, height + 4);
    g.stroke();
  }
}
