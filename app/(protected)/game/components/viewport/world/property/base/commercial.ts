// components/game/viewport/world/property/base/commercial.ts

import { Graphics } from "pixi.js";
import type { BuildingPalette } from "../buildingPalettes";
import { tintColor } from "../propertyDrawHelpers";

export function drawOfficeBase(
  g: Graphics,
  w: number,
  h: number,
  c: BuildingPalette,
  bf: number,
): void {
  g.rect(0, 0, w, h);
  g.fill({ color: tintColor(c.wall, bf) });

  // Glass curtain wall grid
  const panelW = 10;
  const panelH = 14;
  const padX = 4;
  const padY = 6;
  g.setStrokeStyle({ color: tintColor(c.trim, bf), width: 0.8, alpha: 0.5 });

  for (let gx = padX; gx + panelW <= w - padX; gx += panelW + 2) {
    for (let gy = padY; gy + panelH <= h - 12; gy += panelH + 2) {
      g.rect(gx, gy, panelW, panelH);
      g.fill({ color: tintColor(c.window, bf), alpha: 0.5 });
      g.rect(gx, gy, panelW, panelH);
      g.stroke();
    }
  }

  // Parapet roof
  g.rect(0, 0, w, 5);
  g.fill({ color: tintColor(c.roof, bf) });
  g.rect(-1, 0, w + 2, 2);
  g.fill({ color: tintColor(c.roofAccent, bf) });

  // Entrance canopy
  const canopyW = Math.min(w * 0.5, 40);
  g.rect(w / 2 - canopyW / 2, h - 6, canopyW, 3);
  g.fill({ color: tintColor(c.accent, bf), alpha: 0.6 });
}

export function drawMallBase(
  g: Graphics,
  w: number,
  h: number,
  c: BuildingPalette,
  bf: number,
): void {
  // Main body
  g.rect(0, 6, w, h - 6);
  g.fill({ color: tintColor(c.wall, bf) });

  // Signage band
  g.rect(0, 6, w, 12);
  g.fill({ color: tintColor(c.accent, bf) });
  g.rect(0, 10, w, 4);
  g.fill({ color: 0xffffff, alpha: 0.15 });

  // Flat roof
  g.rect(-2, 0, w + 4, 8);
  g.fill({ color: tintColor(c.roof, bf) });

  // Storefront glass panels
  const panelH = Math.min(20, h * 0.3);
  const panelY = h - panelH - 4;
  for (let px = 8; px + 18 < w - 8; px += 22) {
    g.rect(px, panelY, 18, panelH);
    g.fill({ color: tintColor(c.window, bf), alpha: 0.5 });
    g.setStrokeStyle({
      color: tintColor(c.windowFrame, bf),
      width: 0.8,
      alpha: 0.5,
    });
    g.rect(px, panelY, 18, panelH);
    g.stroke();
  }

  // Entrance pillars
  const entrances = Math.max(2, Math.floor(w / 50));
  const spacing = w / (entrances + 1);
  for (let ei = 1; ei <= entrances; ei++) {
    const ex = spacing * ei;
    g.rect(ex - 3, h - panelH - 4, 6, panelH + 4);
    g.fill({ color: tintColor(c.trim, bf), alpha: 0.5 });
  }

  // Awning scallops
  g.setStrokeStyle({ color: tintColor(c.awning, bf), width: 2, alpha: 0.6 });
  for (let sx = 4; sx < w - 4; sx += 16) {
    g.moveTo(sx, panelY);
    g.quadraticCurveTo(sx + 8, panelY - 5, sx + 16, panelY);
  }
  g.stroke();
}

export function drawCornerStoreBase(
  g: Graphics,
  w: number,
  h: number,
  c: BuildingPalette,
  bf: number,
): void {
  // Wall
  g.rect(0, 6, w, h - 6);
  g.fill({ color: tintColor(c.wall, bf) });

  // Flat roof
  g.rect(-1, 0, w + 2, 7);
  g.fill({ color: tintColor(c.roof, bf) });

  // Accent band
  g.rect(0, 7, w, 5);
  g.fill({ color: tintColor(c.accent, bf), alpha: 0.4 });

  // Awning
  const awningY = h * 0.45;
  g.rect(3, awningY, w - 6, 8);
  g.fill({ color: tintColor(c.awning, bf) });
  for (let sx = 3; sx < w - 6; sx += 10) {
    g.rect(sx, awningY, 5, 8);
    g.fill({ color: 0xffffff, alpha: 0.2 });
  }

  // Display window
  const displayY = awningY + 12;
  const displayH = h - displayY - 12;
  if (displayH > 6) {
    g.rect(6, displayY, w - 12, displayH);
    g.fill({ color: tintColor(c.window, bf), alpha: 0.5 });
    g.setStrokeStyle({
      color: tintColor(c.windowFrame, bf),
      width: 1,
      alpha: 0.5,
    });
    g.rect(6, displayY, w - 12, displayH);
    g.stroke();
  }
}
