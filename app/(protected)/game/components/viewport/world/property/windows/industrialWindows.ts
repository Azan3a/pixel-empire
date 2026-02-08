// components/game/viewport/world/property/windows/industrialWindows.ts

import { Graphics } from "pixi.js";
import type { BuildingPalette } from "../buildingPalettes";
import { tintColor, isWindowLit } from "../propertyDrawHelpers";

export function drawWarehouseWindows(
  g: Graphics,
  w: number,
  h: number,
  c: BuildingPalette,
  bf: number,
  isNight: boolean,
  px: number,
  py: number,
): void {
  const winW = 12;
  const winH = 5;
  const wy = 14;

  for (let wx = 12; wx + winW < w - 12; wx += 28) {
    const lit = isNight && isWindowLit(px, py, wx, wy);

    g.rect(wx, wy, winW, winH);
    g.fill({
      color: lit ? c.windowLit : tintColor(c.window, bf),
      alpha: lit ? 0.9 : 0.45,
    });

    g.setStrokeStyle({
      color: tintColor(c.windowFrame, bf),
      width: 1,
      alpha: 0.5,
    });
    g.rect(wx, wy, winW, winH);
    g.stroke();

    // Wire mesh
    g.setStrokeStyle({ color: 0x888888, width: 0.3, alpha: 0.2 });
    g.moveTo(wx + winW / 2, wy).lineTo(wx + winW / 2, wy + winH);
    g.stroke();
  }
}

export function drawFactoryWindows(
  g: Graphics,
  w: number,
  h: number,
  c: BuildingPalette,
  bf: number,
  isNight: boolean,
  px: number,
  py: number,
): void {
  // Band window near top
  const bandY = 16;
  const bandH = 6;
  const bandPad = 8;

  if (w > 30) {
    g.rect(bandPad, bandY, w - bandPad * 2, bandH);
    g.fill({
      color: isNight ? tintColor(c.windowLit, 0.7) : tintColor(c.window, bf),
      alpha: isNight ? 0.6 : 0.4,
    });

    g.setStrokeStyle({
      color: tintColor(c.windowFrame, bf),
      width: 0.8,
      alpha: 0.4,
    });
    for (let mx = bandPad; mx < w - bandPad; mx += 12) {
      g.moveTo(mx, bandY).lineTo(mx, bandY + bandH);
    }
    g.rect(bandPad, bandY, w - bandPad * 2, bandH);
    g.stroke();
  }

  // Lower windows
  const lowerY = h * 0.45;
  for (let wx = 10; wx + 8 < w - 10; wx += 22) {
    if (lowerY + 6 > h - 14) continue;
    const lit = isNight && isWindowLit(px, py, wx, lowerY);
    g.rect(wx, lowerY, 8, 6);
    g.fill({
      color: lit ? c.windowLit : tintColor(c.window, bf),
      alpha: lit ? 0.8 : 0.35,
    });
    g.setStrokeStyle({
      color: tintColor(c.windowFrame, bf),
      width: 0.5,
      alpha: 0.4,
    });
    g.rect(wx, lowerY, 8, 6);
    g.stroke();
  }
}
