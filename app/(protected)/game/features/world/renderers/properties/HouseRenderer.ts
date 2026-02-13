// app/(protected)/game/features/world/renderers/properties/HouseRenderer.ts
"use client";

import { Graphics } from "pixi.js";
import { BuildingPalette } from "@game/features/world/renderers/properties/shared/buildingPalettes";
import { tintColor } from "@game/features/world/renderers/properties/shared/propertyDrawHelpers";
import { drawSingleWindow } from "@game/features/world/renderers/properties/drawing/windows/windowHelpers";
import { drawResidentialDoor } from "@game/features/world/renderers/properties/drawing/doors/residentialDoors";

export function drawHouse(
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
  // 1. Base
  drawBase(g, w, h, c, bf);

  // 2. Windows
  drawWindows(g, w, h, c, bf, isNight, isDusk, px, py);

  // 3. Doors
  drawResidentialDoor(g, w, h, c, bf, isNight, false);
}

function drawBase(
  g: Graphics,
  w: number,
  h: number,
  c: BuildingPalette,
  bf: number,
) {
  // Main wall
  g.rect(0, h * 0.25, w, h * 0.75);
  g.fill({ color: tintColor(c.wall, bf) });

  // Horizontal siding lines
  g.setStrokeStyle({
    color: tintColor(c.wallLight, bf),
    width: 0.5,
    alpha: 0.3,
  });
  for (let ly = h * 0.3; ly < h; ly += 6) {
    g.moveTo(2, ly).lineTo(w - 2, ly);
  }
  g.stroke();

  // Pitched roof
  g.moveTo(0, h * 0.25);
  g.lineTo(w / 2, 0);
  g.lineTo(w, h * 0.25);
  g.closePath();
  g.fill({ color: tintColor(c.roof, bf) });

  // Roof ridge line
  g.setStrokeStyle({
    color: tintColor(c.roofAccent, bf),
    width: 2,
    alpha: 0.6,
  });
  g.moveTo(w / 2, 0).lineTo(w / 2, 2);
  g.stroke();

  // Roof edge trim
  g.setStrokeStyle({ color: tintColor(c.trim, bf), width: 1.5, alpha: 0.5 });
  g.moveTo(0, h * 0.25)
    .lineTo(w / 2, 0)
    .lineTo(w, h * 0.25);
  g.stroke();

  // Eave shadow
  g.rect(0, h * 0.25, w, 3);
  g.fill({ color: 0x000000, alpha: 0.1 });

  // Porch
  if (w > 40) {
    const porchW = w * 0.4;
    const porchX = w / 2 - porchW / 2;
    g.rect(porchX, h - 8, porchW, 8);
    g.fill({ color: tintColor(0x9a8a6a, bf), alpha: 0.5 });
    g.setStrokeStyle({ color: tintColor(c.trim, bf), width: 1, alpha: 0.5 });
    g.moveTo(porchX, h - 8).lineTo(porchX, h);
    g.moveTo(porchX + porchW, h - 8).lineTo(porchX + porchW, h);
    g.stroke();
  }

  // Chimney
  if (w > 35) {
    const chimX = w * 0.75;
    g.rect(chimX, 2, 7, h * 0.22);
    g.fill({ color: tintColor(0x8a5533, bf) });
    g.rect(chimX - 1, 1, 9, 3);
    g.fill({ color: tintColor(0x7a4523, bf) });
  }
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
