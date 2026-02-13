// app/(protected)/game/features/world/renderers/properties/drawing/windows/shopWindows.ts

import { Graphics } from "pixi.js";
import type { BuildingPalette } from "../../shared/buildingPalettes";
import { tintColor } from "../../shared/propertyDrawHelpers";
import { drawSingleWindow } from "./windowHelpers";

export function drawShopUpperWindows(
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
  const winW = 6;
  const winH = 6;
  const wy = 14;

  for (let wx = 10; wx + winW < w - 10; wx += 16) {
    if (wy + winH > h * 0.42) continue;
    drawSingleWindow(g, wx, wy, winW, winH, c, bf, isNight, isDusk, px, py);
    g.rect(wx - 1, wy + winH, winW + 2, 1.5);
    g.fill({ color: tintColor(c.trim, bf), alpha: 0.35 });
  }
}
