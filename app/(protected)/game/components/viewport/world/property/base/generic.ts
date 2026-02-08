// components/game/viewport/world/property/base/generic.ts

import { Graphics } from "pixi.js";
import type { BuildingPalette } from "../buildingPalettes";
import { tintColor } from "../propertyDrawHelpers";

export function drawGenericBase(
  g: Graphics,
  w: number,
  h: number,
  c: BuildingPalette,
  bf: number,
): void {
  g.rect(0, 0, w, h);
  g.fill({ color: tintColor(c.wall, bf) });

  g.rect(0, 0, w, 5);
  g.fill({ color: tintColor(c.roof, bf) });

  g.setStrokeStyle({ color: tintColor(c.trim, bf), width: 0.5, alpha: 0.2 });
  for (let ly = 8; ly < h; ly += 8) {
    g.moveTo(2, ly).lineTo(w - 2, ly);
  }
  g.stroke();
}
