// app/(protected)/game/features/world/renderers/properties/drawing/doors/residentialDoors.ts

import { Graphics } from "pixi.js";
import type { BuildingPalette } from "../../shared/buildingPalettes";
import { tintColor } from "../../shared/propertyDrawHelpers";

export function drawResidentialDoor(
  g: Graphics,
  w: number,
  h: number,
  c: BuildingPalette,
  bf: number,
  isNight: boolean,
  isRustic: boolean,
): void {
  const doorW = 10;
  const doorH = 14;
  const doorX = w / 2 - doorW / 2;
  const doorY = h - doorH;

  // Step
  g.rect(doorX - 3, h - 3, doorW + 6, 3);
  g.fill({ color: tintColor(0x999988, bf), alpha: 0.5 });

  // Door
  g.rect(doorX, doorY, doorW, doorH);
  g.fill({ color: tintColor(c.door, bf) });

  if (!isRustic) {
    // Panel style
    g.rect(doorX + 2, doorY + 2, doorW - 4, doorH * 0.4);
    g.fill({ color: tintColor(c.doorFrame, bf), alpha: 0.3 });
    g.rect(doorX + 2, doorY + doorH * 0.5, doorW - 4, doorH * 0.4);
    g.fill({ color: tintColor(c.doorFrame, bf), alpha: 0.3 });
  } else {
    // Plank style
    g.setStrokeStyle({
      color: tintColor(c.doorFrame, bf),
      width: 0.5,
      alpha: 0.3,
    });
    for (let px = doorX + 3; px < doorX + doorW - 1; px += 3) {
      g.moveTo(px, doorY + 1).lineTo(px, doorY + doorH - 1);
    }
    g.stroke();
  }

  // Frame
  g.setStrokeStyle({ color: tintColor(c.doorFrame, bf), width: 1, alpha: 0.5 });
  g.rect(doorX, doorY, doorW, doorH);
  g.stroke();

  // Knob
  g.circle(doorX + doorW - 3, doorY + doorH / 2, 1.2);
  g.fill({ color: 0xdaa520 });

  // Porch light
  if (isNight) {
    g.circle(doorX + doorW / 2, doorY - 4, 5);
    g.fill({ color: 0xfff0cc, alpha: 0.15 });
    g.circle(doorX + doorW / 2, doorY - 4, 2);
    g.fill({ color: 0xffeeaa, alpha: 0.7 });
  }
}

export function drawDuplexDoors(
  g: Graphics,
  w: number,
  h: number,
  c: BuildingPalette,
  bf: number,
  isNight: boolean,
): void {
  const doorW = 8;
  const doorH = 13;
  const doorY = h - doorH;

  const leftX = w * 0.25 - doorW / 2;
  const rightX = w * 0.75 - doorW / 2;

  for (const dx of [leftX, rightX]) {
    g.rect(dx, doorY, doorW, doorH);
    g.fill({ color: tintColor(c.door, bf) });
    g.setStrokeStyle({
      color: tintColor(c.doorFrame, bf),
      width: 1,
      alpha: 0.5,
    });
    g.rect(dx, doorY, doorW, doorH);
    g.stroke();
    g.circle(dx + doorW - 2, doorY + doorH / 2, 1);
    g.fill({ color: 0xdaa520 });

    // Step
    g.rect(dx - 2, h - 2, doorW + 4, 2);
    g.fill({ color: tintColor(0x999988, bf), alpha: 0.4 });

    if (isNight) {
      g.circle(dx + doorW / 2, doorY - 3, 4);
      g.fill({ color: 0xfff0cc, alpha: 0.12 });
      g.circle(dx + doorW / 2, doorY - 3, 1.5);
      g.fill({ color: 0xffeeaa, alpha: 0.6 });
    }
  }
}

export function drawApartmentEntrance(
  g: Graphics,
  w: number,
  h: number,
  c: BuildingPalette,
  bf: number,
  isNight: boolean,
): void {
  const doorW = 16;
  const doorH = 14;
  const doorX = w / 2 - doorW / 2;
  const doorY = h - doorH;

  // Recess
  g.rect(doorX - 4, doorY - 4, doorW + 8, doorH + 4);
  g.fill({ color: 0x000000, alpha: 0.1 });

  // Glass doors
  g.rect(doorX, doorY, doorW, doorH);
  g.fill({ color: tintColor(c.window, bf), alpha: 0.4 });
  g.setStrokeStyle({
    color: tintColor(c.doorFrame, bf),
    width: 1.5,
    alpha: 0.6,
  });
  g.rect(doorX, doorY, doorW, doorH);
  g.stroke();
  g.moveTo(doorX + doorW / 2, doorY).lineTo(doorX + doorW / 2, doorY + doorH);
  g.stroke();

  // Handles
  g.setStrokeStyle({ color: 0x999999, width: 1, alpha: 0.7 });
  g.moveTo(doorX + doorW / 2 - 2, doorY + 6).lineTo(
    doorX + doorW / 2 - 2,
    doorY + 10,
  );
  g.moveTo(doorX + doorW / 2 + 2, doorY + 6).lineTo(
    doorX + doorW / 2 + 2,
    doorY + 10,
  );
  g.stroke();

  if (isNight) {
    g.rect(doorX - 2, doorY, doorW + 4, doorH);
    g.fill({ color: 0xfff0cc, alpha: 0.08 });
  }
}
