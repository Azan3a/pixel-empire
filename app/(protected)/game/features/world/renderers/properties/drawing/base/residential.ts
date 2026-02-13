// app/(protected)/game/features/world/renderers/properties/drawing/base/residential.ts

import { Graphics } from "pixi.js";
import type { BuildingPalette } from "../../shared/buildingPalettes";
import { tintColor } from "../../shared/propertyDrawHelpers";

export function drawHouseBase(
  g: Graphics,
  w: number,
  h: number,
  c: BuildingPalette,
  bf: number,
): void {
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

export function drawDuplexBase(
  g: Graphics,
  w: number,
  h: number,
  c: BuildingPalette,
  bf: number,
): void {
  // Left unit
  g.rect(0, 4, w / 2 - 1, h - 4);
  g.fill({ color: tintColor(c.wall, bf) });

  // Right unit
  g.rect(w / 2 + 1, 4, w / 2 - 1, h - 4);
  g.fill({ color: tintColor(c.wallLight, bf) });

  // Center divider
  g.rect(w / 2 - 1, 4, 2, h - 4);
  g.fill({ color: tintColor(c.trim, bf), alpha: 0.6 });

  // Low-pitch roof
  g.moveTo(-2, 6);
  g.lineTo(w / 2, 0);
  g.lineTo(w + 2, 6);
  g.closePath();
  g.fill({ color: tintColor(c.roof, bf) });

  g.setStrokeStyle({
    color: tintColor(c.roofAccent, bf),
    width: 1,
    alpha: 0.5,
  });
  g.moveTo(-2, 6)
    .lineTo(w / 2, 0)
    .lineTo(w + 2, 6);
  g.stroke();

  // Siding
  g.setStrokeStyle({ color: 0x000000, width: 0.3, alpha: 0.08 });
  for (let ly = 10; ly < h; ly += 7) {
    g.moveTo(2, ly).lineTo(w / 2 - 2, ly);
    g.moveTo(w / 2 + 2, ly).lineTo(w - 2, ly);
  }
  g.stroke();
}

export function drawApartmentBase(
  g: Graphics,
  w: number,
  h: number,
  c: BuildingPalette,
  bf: number,
): void {
  // Main structure
  g.rect(0, 0, w, h);
  g.fill({ color: tintColor(c.wall, bf) });

  // Lighter top
  g.rect(0, 0, w, h * 0.3);
  g.fill({ color: tintColor(c.wallLight, bf), alpha: 0.3 });

  // Floor separators
  const floors = Math.max(2, Math.floor(h / 22));
  const floorH = h / floors;
  g.setStrokeStyle({ color: tintColor(c.trim, bf), width: 1, alpha: 0.35 });
  for (let fi = 1; fi < floors; fi++) {
    g.moveTo(2, fi * floorH).lineTo(w - 2, fi * floorH);
  }
  g.stroke();

  // Balcony rails on alternating floors
  for (let fi = 1; fi < floors; fi += 2) {
    const fy = fi * floorH;
    g.rect(2, fy, w * 0.2, 2);
    g.fill({ color: tintColor(0x999999, bf), alpha: 0.3 });
    g.rect(w - w * 0.2 - 2, fy, w * 0.2, 2);
    g.fill({ color: tintColor(0x999999, bf), alpha: 0.3 });
  }

  // Flat roof with lip
  g.rect(0, 0, w, 4);
  g.fill({ color: tintColor(c.roof, bf) });
  g.setStrokeStyle({
    color: tintColor(c.roofAccent, bf),
    width: 1.5,
    alpha: 0.5,
  });
  g.moveTo(0, 4).lineTo(w, 4);
  g.stroke();

  // Rooftop equipment
  if (w > 40) {
    g.rect(w - 16, 6, 10, 7);
    g.fill({ color: tintColor(0x777777, bf) });
    g.circle(w - 11, 9, 2);
    g.fill({ color: tintColor(0x555555, bf) });
    g.rect(6, 5, 8, 10);
    g.fill({ color: tintColor(0x888888, bf) });
  }
}
