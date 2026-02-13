// app/(protected)/game/features/world/renderers/properties/WarehouseRenderer.ts
"use client";

import { Graphics } from "pixi.js";
import { BuildingPalette } from "@game/features/world/renderers/properties/shared/buildingPalettes";
import { tintColor } from "@game/features/world/renderers/properties/shared/propertyDrawHelpers";

export function drawWarehouse(
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

  // 1. Core Structure (Large flat building)
  g.rect(0, 0, w, h);
  g.fill({ color: tintColor(c.wall, bf) });

  // 2. Corrugated Metal Texture (Simple lines)
  g.setStrokeStyle({ color: tintColor(c.wallLight, bf), width: 1, alpha: 0.2 });
  for (let lx = 4; lx < w; lx += 8) {
    g.moveTo(lx, 5).lineTo(lx, h - 5);
  }
  g.stroke();

  // 3. Loading Dock Bay
  const dockW = Math.min(w * 0.4, 30);
  const dockH = Math.min(h * 0.5, 20);
  const dockX = 10;
  const dockY = h - dockH;

  // Bay frame
  g.rect(dockX - 2, dockY - 2, dockW + 4, dockH + 2);
  g.fill({ color: tintColor(c.trim, bf) });

  // Roll-up door
  g.rect(dockX, dockY, dockW, dockH);
  g.fill({ color: 0x888888, alpha: 0.5 });

  // Door slats
  g.setStrokeStyle({ color: 0x555555, width: 0.5, alpha: 0.4 });
  for (let dy = dockY + 2; dy < h; dy += 3) {
    g.moveTo(dockX, dy).lineTo(dockX + dockW, dy);
  }
  g.stroke();

  // 4. Clerestory windows (top narrow windows)
  const cwW = 8;
  const cwH = 4;
  for (let cx = 8; cx + cwW < w - 8; cx += 16) {
    g.rect(cx, 8, cwW, cwH);
    const isLit = isNight && Math.sin(px * 0.2 + cx * 0.5) > 0.4;
    g.fill({
      color: isLit ? tintColor(c.windowLit, bf) : 0x333333,
      alpha: 0.8,
    });
  }

  // 5. Roof features (AC vents)
  if (w > 50) {
    g.rect(w * 0.6, 2, 8, 4);
    g.fill({ color: tintColor(0x999999, bf) });
    g.rect(w * 0.6 + 2, 0, 4, 3);
    g.fill({ color: tintColor(0x777777, bf) });
  }
}
