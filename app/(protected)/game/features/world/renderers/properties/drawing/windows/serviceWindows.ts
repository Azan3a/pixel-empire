// app/(protected)/game/features/world/renderers/properties/drawing/windows/serviceWindows.ts

import { Graphics } from "pixi.js";
import type { BuildingPalette } from "../../shared/buildingPalettes";
import { tintColor, isWindowLit } from "../../shared/propertyDrawHelpers";
import { drawGridWindows } from "./windowHelpers";

export function drawBankWindows(
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
  const winW = 8;
  const winH = 16;
  const wy = 18;
  const gapX = 22;

  for (let wx = 14; wx + winW < w - 14; wx += gapX) {
    if (wy + winH > h - 10) continue;

    const lit = isNight && isWindowLit(px, py, wx, wy);
    const duskLit = isDusk && isWindowLit(px, py, wx, wy + 1000);

    // Arched window path
    g.moveTo(wx, wy + 4);
    g.lineTo(wx, wy + winH);
    g.lineTo(wx + winW, wy + winH);
    g.lineTo(wx + winW, wy + 4);
    g.arc(wx + winW / 2, wy + 4, winW / 2, 0, Math.PI, true);
    g.closePath();

    if (lit) {
      g.fill({ color: c.windowLit, alpha: 0.9 });
    } else if (duskLit) {
      g.fill({ color: c.windowLit, alpha: 0.35 });
    } else {
      g.fill({ color: tintColor(c.window, bf), alpha: 0.6 });
    }

    // Frame
    g.setStrokeStyle({
      color: tintColor(c.windowFrame, bf),
      width: 1,
      alpha: 0.5,
    });
    g.moveTo(wx, wy + 4);
    g.lineTo(wx, wy + winH);
    g.lineTo(wx + winW, wy + winH);
    g.lineTo(wx + winW, wy + 4);
    g.arc(wx + winW / 2, wy + 4, winW / 2, 0, Math.PI, true);
    g.closePath();
    g.stroke();

    // Cross bar
    g.moveTo(wx, wy + winH * 0.5).lineTo(wx + winW, wy + winH * 0.5);
    g.stroke();

    // Keystone
    g.circle(wx + winW / 2, wy + 1, 2);
    g.fill({ color: tintColor(c.accent, bf), alpha: 0.3 });
  }
}

export function drawInstitutionalWindows(
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
  drawGridWindows(
    g,
    w,
    h,
    c,
    bf,
    isNight,
    isDusk,
    px,
    py,
    18,
    16,
    7,
    8,
    12,
    16,
  );
}

export function drawCabinWindows(
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
  drawGridWindows(
    g,
    w,
    h,
    c,
    bf,
    isNight,
    isDusk,
    px,
    py,
    16,
    16,
    6,
    7,
    14,
    14,
  );
}
