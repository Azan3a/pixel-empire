// components/game/viewport/world/property/doors/commercialDoors.ts

import { Graphics } from "pixi.js";
import type { BuildingPalette } from "../buildingPalettes";
import { tintColor } from "../propertyDrawHelpers";

export function drawOfficeDoor(
  g: Graphics,
  w: number,
  h: number,
  c: BuildingPalette,
  bf: number,
  isNight: boolean,
): void {
  const doorW = 14;
  const doorH = 13;
  const doorX = w / 2 - doorW / 2;
  const doorY = h - doorH;

  g.rect(doorX, doorY, doorW, doorH);
  g.fill({ color: tintColor(c.window, bf), alpha: 0.35 });
  g.setStrokeStyle({ color: tintColor(c.doorFrame, bf), width: 1, alpha: 0.6 });
  g.rect(doorX, doorY, doorW, doorH);
  g.stroke();
  g.moveTo(doorX + doorW / 2, doorY).lineTo(doorX + doorW / 2, doorY + doorH);
  g.stroke();

  if (isNight) {
    g.rect(doorX - 1, doorY, doorW + 2, doorH);
    g.fill({ color: 0xfff8e0, alpha: 0.06 });
  }
}

export function drawFactoryDoor(
  g: Graphics,
  w: number,
  h: number,
  c: BuildingPalette,
  bf: number,
  isNight: boolean,
): void {
  const doorW = 16;
  const doorH = 16;
  const doorX = w * 0.3 - doorW / 2;
  const doorY = h - doorH;

  g.rect(doorX, doorY, doorW, doorH);
  g.fill({ color: tintColor(0x555544, bf) });

  // Slats
  g.setStrokeStyle({ color: tintColor(0x444433, bf), width: 0.5, alpha: 0.4 });
  for (let sy = doorY + 2; sy < doorY + doorH; sy += 3) {
    g.moveTo(doorX + 1, sy).lineTo(doorX + doorW - 1, sy);
  }
  g.stroke();

  // Frame
  g.setStrokeStyle({ color: tintColor(0x666655, bf), width: 1.5, alpha: 0.5 });
  g.rect(doorX, doorY, doorW, doorH);
  g.stroke();

  // Safety light
  if (isNight) {
    g.circle(doorX + doorW + 4, doorY, 3);
    g.fill({ color: 0xff8800, alpha: 0.5 });
    g.circle(doorX + doorW + 4, doorY, 7);
    g.fill({ color: 0xff8800, alpha: 0.08 });
  }
}
