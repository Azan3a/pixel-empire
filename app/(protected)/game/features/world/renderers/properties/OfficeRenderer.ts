// app/(protected)/game/features/world/renderers/properties/OfficeRenderer.ts
"use client";

import { Graphics } from "pixi.js";
import { BuildingPalette } from "@game/features/world/renderers/properties/shared/buildingPalettes";
import { tintColor } from "@game/features/world/renderers/properties/shared/propertyDrawHelpers";

export function drawOffice(
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
  void isDusk;
  void py;

  // 1. Core Structure
  g.rect(0, 0, w, h);
  g.fill({ color: tintColor(c.wall, bf) });

  // 2. Glass curtain wall grid (Integrated logic from drawOfficeBase)
  const panelW = 10;
  const panelH = 14;
  const padX = 4;
  const padY = 6;

  for (let gx = padX; gx + panelW <= w - padX; gx += panelW + 2) {
    for (let gy = padY; gy + panelH <= h - 12; gy += panelH + 2) {
      // Background reflections / internal lights
      g.rect(gx, gy, panelW, panelH);
      const isLit = isNight && Math.sin(px * 0.5 + gy * 0.3 + gx * 0.1) > 0.2;
      g.fill({
        color: isLit ? tintColor(c.windowLit, bf) : tintColor(c.window, bf),
        alpha: isLit ? 0.7 : 0.5,
      });

      // Frame
      g.setStrokeStyle({
        color: tintColor(c.trim, bf),
        width: 0.8,
        alpha: 0.5,
      });
      g.rect(gx, gy, panelW, panelH);
      g.stroke();

      // Highlights
      if (!isNight) {
        g.setStrokeStyle({ color: 0xffffff, width: 0.5, alpha: 0.1 });
        g.moveTo(gx + 1, gy + 1).lineTo(gx + panelW - 1, gy + panelH - 1);
        g.stroke();
      }
    }
  }

  // 3. Parapet roof
  g.rect(0, 0, w, 5);
  g.fill({ color: tintColor(c.roof, bf) });
  g.rect(-1, 0, w + 2, 2);
  g.fill({ color: tintColor(c.roofAccent, bf) });

  // 4. Entrance canopy
  const canopyW = Math.min(w * 0.5, 40);
  const canopyX = w / 2 - canopyW / 2;
  const canopyY = h - 6;
  g.rect(canopyX, canopyY, canopyW, 3);
  g.fill({ color: tintColor(c.accent, bf), alpha: 0.6 });

  // 5. Entrance doors
  const doorW = 12;
  const doorH = 10;
  g.rect(w / 2 - doorW / 2, h - doorH, doorW, doorH);
  g.fill({ color: tintColor(c.window, bf), alpha: 0.3 });
  g.setStrokeStyle({ color: tintColor(c.doorFrame, bf), width: 1, alpha: 0.5 });
  g.rect(w / 2 - doorW / 2, h - doorH, doorW, doorH);
  g.stroke();
  g.moveTo(w / 2, h - doorH).lineTo(w / 2, h);
  g.stroke();
}
