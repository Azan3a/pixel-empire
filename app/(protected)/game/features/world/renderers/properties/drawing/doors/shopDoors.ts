// app/(protected)/game/features/world/renderers/properties/drawing/doors/shopDoors.ts

import { Graphics } from "pixi.js";
import type { BuildingPalette } from "../../shared/buildingPalettes";
import { tintColor } from "../../shared/propertyDrawHelpers";

export function drawShopDoor(
  g: Graphics,
  w: number,
  h: number,
  c: BuildingPalette,
  bf: number,
  isNight: boolean,
): void {
  const doorW = 10;
  const doorH = 13;
  const doorX = w / 2 - doorW / 2;
  const doorY = h - doorH - 2;

  // Recessed entrance
  g.rect(doorX - 2, doorY, doorW + 4, doorH + 2);
  g.fill({ color: 0x000000, alpha: 0.06 });

  // Door
  g.rect(doorX, doorY, doorW, doorH);
  g.fill({ color: tintColor(c.door, bf) });

  // Glass panel
  g.rect(doorX + 2, doorY + 2, doorW - 4, doorH * 0.5);
  g.fill({ color: tintColor(c.window, bf), alpha: 0.3 });

  // Frame
  g.setStrokeStyle({ color: tintColor(c.doorFrame, bf), width: 1, alpha: 0.5 });
  g.rect(doorX, doorY, doorW, doorH);
  g.stroke();

  // Handle
  g.circle(doorX + doorW - 3, doorY + doorH * 0.55, 1.2);
  g.fill({ color: 0xcccccc });

  // Open sign
  if (isNight) {
    g.rect(doorX + 1, doorY - 4, doorW - 2, 3);
    g.fill({ color: 0x44ff44, alpha: 0.2 });
  }
}
