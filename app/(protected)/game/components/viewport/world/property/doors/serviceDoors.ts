// components/game/viewport/world/property/doors/serviceDoors.ts

import { Graphics } from "pixi.js";
import type { BuildingPalette } from "../buildingPalettes";
import { tintColor } from "../propertyDrawHelpers";

export function drawBankEntrance(
  g: Graphics,
  w: number,
  h: number,
  c: BuildingPalette,
  bf: number,
  isNight: boolean,
): void {
  const doorW = 20;
  const doorH = 18;
  const doorX = w / 2 - doorW / 2;
  const doorY = h - doorH;
  const halfDoor = doorW / 2;

  // Steps
  g.rect(doorX - 6, h - 4, doorW + 12, 4);
  g.fill({ color: tintColor(0xccccbb, bf), alpha: 0.5 });
  g.rect(doorX - 3, h - 6, doorW + 6, 2);
  g.fill({ color: tintColor(0xccccbb, bf), alpha: 0.4 });

  // Recess
  g.rect(doorX - 2, doorY - 2, doorW + 4, doorH + 2);
  g.fill({ color: 0x000000, alpha: 0.08 });

  // Double doors
  g.rect(doorX, doorY, doorW, doorH);
  g.fill({ color: tintColor(c.door, bf) });

  // Panels
  g.rect(doorX + 2, doorY + 2, halfDoor - 3, doorH - 4);
  g.fill({ color: tintColor(c.doorFrame, bf), alpha: 0.2 });
  g.rect(doorX + halfDoor + 1, doorY + 2, halfDoor - 3, doorH - 4);
  g.fill({ color: tintColor(c.doorFrame, bf), alpha: 0.2 });

  // Frame
  g.setStrokeStyle({ color: tintColor(c.accent, bf), width: 1.5, alpha: 0.6 });
  g.rect(doorX, doorY, doorW, doorH);
  g.stroke();
  g.moveTo(doorX + halfDoor, doorY).lineTo(doorX + halfDoor, doorY + doorH);
  g.stroke();

  // Brass handles
  g.circle(doorX + halfDoor - 3, doorY + doorH / 2, 1.5);
  g.fill({ color: tintColor(0xd4af37, bf) });
  g.circle(doorX + halfDoor + 3, doorY + doorH / 2, 1.5);
  g.fill({ color: tintColor(0xd4af37, bf) });

  if (isNight) {
    g.rect(doorX - 3, doorY - 5, doorW + 6, 3);
    g.fill({ color: 0xfff0cc, alpha: 0.1 });
  }
}

export function drawCasinoEntrance(
  g: Graphics,
  w: number,
  h: number,
  c: BuildingPalette,
  bf: number,
  isNight: boolean,
): void {
  const doorW = 22;
  const doorH = 16;
  const doorX = w / 2 - doorW / 2;
  const doorY = h - doorH;

  // Red carpet
  g.rect(doorX + 2, doorY + doorH - 2, doorW - 4, 4);
  g.fill({ color: tintColor(0xaa2244, bf), alpha: 0.5 });

  // Glass doors
  g.rect(doorX, doorY, doorW, doorH);
  g.fill({ color: tintColor(0x221133, bf) });

  // Revolving door
  g.circle(doorX + doorW / 2, doorY + doorH / 2, doorH * 0.35);
  g.fill({ color: tintColor(c.window, bf), alpha: 0.3 });
  g.setStrokeStyle({ color: tintColor(0xccaa00, bf), width: 1, alpha: 0.5 });
  g.circle(doorX + doorW / 2, doorY + doorH / 2, doorH * 0.35);
  g.stroke();

  // Neon frame
  const neonA = isNight ? 0.6 : 0.2;
  g.setStrokeStyle({ color: c.accent, width: 2, alpha: neonA });
  g.rect(doorX - 1, doorY - 1, doorW + 2, doorH + 2);
  g.stroke();

  if (isNight) {
    g.setStrokeStyle({ color: c.accent, width: 6, alpha: 0.08 });
    g.rect(doorX - 1, doorY - 1, doorW + 2, doorH + 2);
    g.stroke();
  }
}
