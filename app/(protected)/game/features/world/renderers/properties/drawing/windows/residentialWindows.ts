// app/(protected)/game/features/world/renderers/properties/drawing/windows/residentialWindows.ts

import { Graphics } from "pixi.js";
import type { BuildingPalette } from "../../shared/buildingPalettes";
import { tintColor } from "../../shared/propertyDrawHelpers";
import { drawSingleWindow } from "./windowHelpers";

export function drawHouseWindows(
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
  const winW = 9;
  const winH = 10;
  const wallTop = h * 0.28;
  const padX = 12;
  const gapX = 24;

  for (let wx = padX; wx + winW < w - padX; wx += gapX) {
    const wy = wallTop + 10;
    if (wy + winH > h - 16) continue;

    drawSingleWindow(g, wx, wy, winW, winH, c, bf, isNight, isDusk, px, py);

    // Shutters
    const shutterW = 3;
    g.rect(wx - shutterW - 1, wy, shutterW, winH);
    g.fill({ color: tintColor(c.accent, bf), alpha: 0.6 });
    g.rect(wx + winW + 1, wy, shutterW, winH);
    g.fill({ color: tintColor(c.accent, bf), alpha: 0.6 });

    // Sill
    g.rect(wx - 1, wy + winH, winW + 2, 2);
    g.fill({ color: tintColor(c.trim, bf), alpha: 0.5 });

    // Lintel
    g.rect(wx - 1, wy - 2, winW + 2, 2);
    g.fill({ color: tintColor(c.trim, bf), alpha: 0.4 });
  }

  // Dormer
  if (w > 45) {
    const dWinW = 7;
    const dWinH = 6;
    const dWinX = w / 2 - dWinW / 2;
    const dWinY = h * 0.12;
    g.rect(dWinX - 2, dWinY, dWinW + 4, dWinH + 2);
    g.fill({ color: tintColor(c.wall, bf) });
    g.moveTo(dWinX - 3, dWinY);
    g.lineTo(dWinX + dWinW / 2, dWinY - 4);
    g.lineTo(dWinX + dWinW + 3, dWinY);
    g.closePath();
    g.fill({ color: tintColor(c.roof, bf) });
    drawSingleWindow(
      g,
      dWinX,
      dWinY + 1,
      dWinW,
      dWinH,
      c,
      bf,
      isNight,
      isDusk,
      px,
      py,
    );
  }
}

export function drawDuplexWindows(
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
  const winW = 7;
  const winH = 9;
  const wallTop = 12;

  // Left unit
  for (let wx = 8; wx + winW < w / 2 - 4; wx += 18) {
    for (let wy = wallTop; wy + winH < h - 14; wy += 18) {
      drawSingleWindow(g, wx, wy, winW, winH, c, bf, isNight, isDusk, px, py);
      g.rect(wx - 1, wy + winH, winW + 2, 1.5);
      g.fill({ color: tintColor(c.trim, bf), alpha: 0.4 });
    }
  }

  // Right unit
  for (let wx = w / 2 + 6; wx + winW < w - 6; wx += 18) {
    for (let wy = wallTop; wy + winH < h - 14; wy += 18) {
      drawSingleWindow(g, wx, wy, winW, winH, c, bf, isNight, isDusk, px, py);
      g.rect(wx - 1, wy + winH, winW + 2, 1.5);
      g.fill({ color: tintColor(c.trim, bf), alpha: 0.4 });
    }
  }
}

export function drawApartmentWindows(
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
  const winH = 7;

  for (let wx = 8; wx + winW < w - 8; wx += 12) {
    for (let wy = 10; wy + winH < h - 10; wy += 13) {
      drawSingleWindow(g, wx, wy, winW, winH, c, bf, isNight, isDusk, px, py);
    }
  }
}
