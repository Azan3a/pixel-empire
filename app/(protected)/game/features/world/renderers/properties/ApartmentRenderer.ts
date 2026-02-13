// app/(protected)/game/features/world/renderers/properties/ApartmentRenderer.ts
"use client";

import { Graphics } from "pixi.js";
import { BuildingPalette } from "@game/features/world/renderers/properties/shared/buildingPalettes";
import { tintColor } from "@game/features/world/renderers/properties/shared/propertyDrawHelpers";
import { drawSingleWindow } from "@game/features/world/renderers/properties/drawing/windows/windowHelpers";

export function drawApartment(
  g: Graphics,
  w: number,
  h: number,
  c: BuildingPalette,
  bf: number,
  isNight: boolean,
  isDusk: boolean,
  px: number,
  py: number,
): void {
  // 1. Base Structure
  drawBase(g, w, h, c, bf);

  // 2. Windows
  drawWindows(g, w, h, c, bf, isNight, isDusk, px, py);

  // 3. Entrance
  drawEntrance(g, w, h, c, bf, isNight);
}

function drawBase(
  g: Graphics,
  w: number,
  h: number,
  c: BuildingPalette,
  bf: number,
) {
  // Main structure
  g.rect(0, 0, w, h);
  g.fill({ color: tintColor(c.wall, bf) });

  // Lighter top
  g.rect(0, 0, w, h * 0.3);
  g.fill({ color: tintColor(c.wallLight, bf), alpha: 0.3 });

  // Floor separators
  const floors = Math.max(2, Math.floor(h / 22));
  const floorH = h / floors;
  g.setStrokeStyle({ color: tintColor(c.trim, bf), width: 1, alpha: 0.35 });
  for (let fi = 1; fi < floors; fi++) {
    g.moveTo(2, fi * floorH).lineTo(w - 2, fi * floorH);
  }
  g.stroke();

  // Balcony rails on alternating floors
  for (let fi = 1; fi < floors; fi += 2) {
    const fy = fi * floorH;
    g.rect(2, fy, w * 0.2, 2);
    g.fill({ color: tintColor(0x999999, bf), alpha: 0.3 });
    g.rect(w - w * 0.2 - 2, fy, w * 0.2, 2);
    g.fill({ color: tintColor(0x999999, bf), alpha: 0.3 });
  }

  // Flat roof with lip
  g.rect(0, 0, w, 4);
  g.fill({ color: tintColor(c.roof, bf) });
  g.setStrokeStyle({
    color: tintColor(c.roofAccent, bf),
    width: 1,
    alpha: 0.4,
  });
  g.moveTo(0, 4).lineTo(w, 4).stroke();
}

function drawWindows(
  g: Graphics,
  w: number,
  h: number,
  c: BuildingPalette,
  bf: number,
  isNight: boolean,
  isDusk: boolean,
  px: number,
  py: number,
) {
  const winW = 6;
  const winH = 7;

  for (let wx = 8; wx + winW < w - 8; wx += 12) {
    for (let wy = 10; wy + winH < h - 10; wy += 13) {
      drawSingleWindow(g, wx, wy, winW, winH, c, bf, isNight, isDusk, px, py);
    }
  }
}

function drawEntrance(
  g: Graphics,
  w: number,
  h: number,
  c: BuildingPalette,
  bf: number,
  isNight: boolean,
) {
  void isNight;

  const doorW = 16;
  const doorH = 14;
  const doorX = w / 2 - doorW / 2;
  const doorY = h - doorH;

  // Canopy
  g.rect(doorX - 4, doorY - 3, doorW + 8, 3);
  g.fill({ color: tintColor(c.accent, bf), alpha: 0.5 });

  // Glass double door
  g.rect(doorX, doorY, doorW, doorH);
  g.fill({ color: tintColor(c.window, bf), alpha: 0.4 });
  g.setStrokeStyle({ color: tintColor(c.doorFrame, bf), width: 1, alpha: 0.6 });
  g.rect(doorX, doorY, doorW, doorH);
  g.stroke();
  g.moveTo(doorX + doorW / 2, doorY).lineTo(doorX + doorW / 2, doorY + doorH);
  g.stroke();
}
