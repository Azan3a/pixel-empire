// app/(protected)/game/features/world/renderers/properties/drawing/windows/windowHelpers.ts

import { Graphics } from "pixi.js";
import type { BuildingPalette } from "../../shared/buildingPalettes";
import { tintColor, isWindowLit } from "../../shared/propertyDrawHelpers";

export function drawSingleWindow(
  g: Graphics,
  wx: number,
  wy: number,
  winW: number,
  winH: number,
  c: BuildingPalette,
  bf: number,
  isNight: boolean,
  isDusk: boolean,
  px: number,
  py: number,
): void {
  const lit = isNight && isWindowLit(px, py, wx, wy);
  const duskLit = isDusk && isWindowLit(px, py, wx, wy + 1000);

  if (lit) {
    g.rect(wx - 2, wy - 2, winW + 4, winH + 4);
    g.fill({ color: c.windowLit, alpha: 0.12 });
    g.rect(wx, wy, winW, winH);
    g.fill({ color: c.windowLit, alpha: 0.92 });
  } else if (duskLit) {
    g.rect(wx, wy, winW, winH);
    g.fill({ color: c.windowLit, alpha: 0.35 });
  } else {
    g.rect(wx, wy, winW, winH);
    g.fill({ color: tintColor(c.window, bf), alpha: 0.8 });
  }

  g.setStrokeStyle({
    color: tintColor(c.windowFrame, bf),
    width: 0.5,
    alpha: 0.5,
  });
  g.rect(wx, wy, winW, winH);
  g.stroke();
  g.moveTo(wx + winW / 2, wy).lineTo(wx + winW / 2, wy + winH);
  g.moveTo(wx, wy + winH / 2).lineTo(wx + winW, wy + winH / 2);
  g.stroke();
}

export function drawGridWindows(
  g: Graphics,
  w: number,
  h: number,
  c: BuildingPalette,
  bf: number,
  isNight: boolean,
  isDusk: boolean,
  px: number,
  py: number,
  gapX: number,
  gapY: number,
  winW: number,
  winH: number,
  padX: number,
  padY: number,
): void {
  for (let wx = padX; wx + winW < w - padX; wx += gapX) {
    for (let wy = padY; wy + winH < h - padY; wy += gapY) {
      drawSingleWindow(g, wx, wy, winW, winH, c, bf, isNight, isDusk, px, py);
    }
  }
}
