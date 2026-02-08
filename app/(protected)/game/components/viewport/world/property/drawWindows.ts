// components/game/viewport/world/property/drawWindows.ts

import { Graphics } from "pixi.js";
import type { BuildingPalette } from "./buildingPalettes";
import { tintColor, isWindowLit } from "./propertyDrawHelpers";
import type { PropertyCategory } from "@/convex/mapZones";

/**
 * Draw the grid of windows with lit/unlit states based on time of day.
 */
export function drawWindows(
  g: Graphics,
  width: number,
  height: number,
  category: PropertyCategory,
  palette: BuildingPalette,
  bf: number,
  isNight: boolean,
  isDusk: boolean,
  px: number,
  py: number,
): void {
  const winW = 6;
  const winH = 7;
  const gapX = category === "residential" ? 20 : 16;
  const gapY = category === "residential" ? 20 : 16;
  const padX = 14;
  const padY = 14;

  for (let wx = padX; wx + winW < width - padX; wx += gapX) {
    for (let wy = padY; wy + winH < height - padY; wy += gapY) {
      const lit = isNight && isWindowLit(px, py, wx, wy);

      if (lit) {
        // Glow halo
        g.rect(wx - 2, wy - 2, winW + 4, winH + 4);
        g.fill({ color: palette.windowLit, alpha: 0.15 });
        // Lit window
        g.rect(wx, wy, winW, winH);
        g.fill({ color: palette.windowLit, alpha: 0.95 });
      } else if (isDusk && isWindowLit(px, py, wx, wy + 1000)) {
        g.rect(wx, wy, winW, winH);
        g.fill({ color: palette.windowLit, alpha: 0.4 });
      } else {
        g.rect(wx, wy, winW, winH);
        g.fill({ color: tintColor(palette.window, bf), alpha: 0.85 });
      }

      // Window frame
      g.setStrokeStyle({ color: 0x333333, width: 0.5, alpha: 0.4 });
      g.rect(wx, wy, winW, winH);
      g.stroke();

      // Cross bars
      g.moveTo(wx + winW / 2, wy).lineTo(wx + winW / 2, wy + winH);
      g.moveTo(wx, wy + winH / 2).lineTo(wx + winW, wy + winH / 2);
      g.stroke();
    }
  }
}
