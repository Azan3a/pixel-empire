// components/game/viewport/world/property/drawDoorAndAccessories.ts

import { Graphics } from "pixi.js";
import type { BuildingPalette } from "./buildingPalettes";
import { tintColor } from "./propertyDrawHelpers";
import type { PropertyCategory, PropertySubType } from "@/convex/mapZones";

const INSET = 4;

/**
 * Draw the main door, awning, AC unit, chimney, and smokestack.
 */
export function drawDoorAndAccessories(
  g: Graphics,
  width: number,
  height: number,
  category: PropertyCategory,
  subType: PropertySubType,
  palette: BuildingPalette,
  bf: number,
  isNight: boolean,
): void {
  const isService = category === "service";
  const isShop = category === "shop";

  drawDoor(g, width, height, palette, bf, isService, isNight);
  drawAwning(g, width, height, category, palette, bf, isShop);
  drawACUnit(g, width, category, isShop, bf);
  drawChimney(g, width, category, bf);
  drawSmokestack(g, width, subType, bf, isNight);
}

function drawDoor(
  g: Graphics,
  width: number,
  height: number,
  palette: BuildingPalette,
  bf: number,
  isService: boolean,
  isNight: boolean,
): void {
  const doorW = 10;
  const doorH = 14;
  const doorX = width / 2 - doorW / 2;
  const doorY = height - doorH - INSET;

  g.rect(doorX, doorY, doorW, doorH);
  g.fill({ color: tintColor(palette.door, bf) });
  g.setStrokeStyle({ color: 0x222222, width: 1, alpha: 0.4 });
  g.rect(doorX, doorY, doorW, doorH);
  g.stroke();

  // Door knob
  g.circle(doorX + doorW - 3, doorY + doorH / 2, 1.2);
  g.fill({ color: 0xdaa520 });

  // Service buildings: wider double doors
  if (isService && width > 60) {
    const dblW = 18;
    const dblX = width / 2 - dblW / 2;
    g.rect(dblX, doorY, dblW, doorH);
    g.fill({ color: tintColor(palette.door, bf) });
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
}

function drawAwning(
  g: Graphics,
  width: number,
  height: number,
  category: PropertyCategory,
  palette: BuildingPalette,
  bf: number,
  isShop: boolean,
): void {
  if (!(isShop || category === "commercial") || height <= 40) return;

  const awningH = 8;
  const awningY = height - awningH - 1;
  g.rect(INSET, awningY, width - INSET * 2, awningH);
  g.fill({ color: tintColor(palette.awning, bf) });

  for (let sx = INSET; sx < width - INSET; sx += 10) {
    g.rect(sx, awningY, 5, awningH);
    g.fill({ color: 0xffffff, alpha: 0.2 });
  }
}

function drawACUnit(
  g: Graphics,
  width: number,
  category: PropertyCategory,
  isShop: boolean,
  bf: number,
): void {
  if (!(category === "commercial" || isShop) || width <= 50) return;

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

function drawChimney(
  g: Graphics,
  width: number,
  category: PropertyCategory,
  bf: number,
): void {
  if (category !== "residential" || width <= 40) return;

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

function drawSmokestack(
  g: Graphics,
  width: number,
  subType: PropertySubType,
  bf: number,
  isNight: boolean,
): void {
  if (!(subType === "warehouse" || subType === "factory") || width <= 50)
    return;

  g.rect(width - 14, 2, 6, 14);
  g.fill({ color: tintColor(0x666666, bf) });
  g.setStrokeStyle({
    color: tintColor(0x444444, bf),
    width: 1,
    alpha: 0.5,
  });
  g.rect(width - 14, 2, 6, 14);
  g.stroke();

  if (isNight) {
    g.circle(width - 11, -2, 3);
    g.fill({ color: 0xaaaaaa, alpha: 0.15 });
  }
}
