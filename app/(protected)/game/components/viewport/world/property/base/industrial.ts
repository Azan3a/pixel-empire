// components/game/viewport/world/property/base/industrial.ts

import { Graphics } from "pixi.js";
import type { BuildingPalette } from "../buildingPalettes";
import { tintColor } from "../propertyDrawHelpers";

export function drawWarehouseBase(
  g: Graphics,
  w: number,
  h: number,
  c: BuildingPalette,
  bf: number,
): void {
  // Main body
  g.rect(0, 4, w, h - 4);
  g.fill({ color: tintColor(c.wall, bf) });

  // Corrugated metal ridges
  g.setStrokeStyle({
    color: tintColor(c.wallLight, bf),
    width: 0.5,
    alpha: 0.25,
  });
  for (let lx = 4; lx < w; lx += 5) {
    g.moveTo(lx, 6).lineTo(lx, h - 2);
  }
  g.stroke();

  // Flat industrial roof
  g.rect(-1, 0, w + 2, 6);
  g.fill({ color: tintColor(c.roof, bf) });

  // Loading dock
  const dockH = Math.min(12, h * 0.15);
  g.rect(0, h - dockH, w, dockH);
  g.fill({ color: tintColor(0x666666, bf) });

  // Roll-up bay doors
  const dockBays = Math.max(1, Math.floor(w / 35));
  const bayW = w / dockBays;
  for (let bi = 0; bi < dockBays; bi++) {
    const bx = bi * bayW + bayW * 0.15;
    const bw = bayW * 0.7;
    g.rect(bx, h - dockH + 2, bw, dockH - 3);
    g.fill({ color: tintColor(0x5a5a4a, bf) });
    // Slats
    g.setStrokeStyle({
      color: tintColor(0x4a4a3a, bf),
      width: 0.5,
      alpha: 0.3,
    });
    for (let sy = h - dockH + 4; sy < h - 2; sy += 3) {
      g.moveTo(bx + 1, sy).lineTo(bx + bw - 1, sy);
    }
    g.stroke();
  }

  // Label stripe
  g.rect(4, 10, w * 0.3, 8);
  g.fill({ color: tintColor(c.accent, bf), alpha: 0.4 });
}

export function drawFactoryBase(
  g: Graphics,
  w: number,
  h: number,
  c: BuildingPalette,
  bf: number,
): void {
  // Main body
  g.rect(0, 8, w, h - 8);
  g.fill({ color: tintColor(c.wall, bf) });

  // Sawtooth roof
  const teethCount = Math.max(2, Math.floor(w / 25));
  const toothW = w / teethCount;
  for (let ti = 0; ti < teethCount; ti++) {
    const tx = ti * toothW;
    g.moveTo(tx, 10);
    g.lineTo(tx + toothW * 0.3, 0);
    g.lineTo(tx + toothW, 10);
    g.closePath();
    g.fill({ color: tintColor(c.roof, bf) });
  }

  // Roof edge
  g.setStrokeStyle({
    color: tintColor(c.roofAccent, bf),
    width: 1,
    alpha: 0.5,
  });
  g.moveTo(0, 10).lineTo(w, 10);
  g.stroke();

  // Smokestacks
  const stackCount = Math.min(3, Math.max(1, Math.floor(w / 40)));
  for (let si = 0; si < stackCount; si++) {
    const sx = w * 0.7 + si * 14;
    if (sx + 7 > w) break;
    g.rect(sx, -6, 7, 16);
    g.fill({ color: tintColor(0x666666, bf) });
    g.rect(sx - 1, -8, 9, 3);
    g.fill({ color: tintColor(0x555555, bf) });
    g.setStrokeStyle({
      color: tintColor(c.accent, bf),
      width: 1.5,
      alpha: 0.4,
    });
    g.moveTo(sx, -2).lineTo(sx + 7, -2);
    g.moveTo(sx, 3).lineTo(sx + 7, 3);
    g.stroke();
  }

  // Corrugated walls
  g.setStrokeStyle({
    color: tintColor(c.wallLight, bf),
    width: 0.4,
    alpha: 0.2,
  });
  for (let lx = 3; lx < w; lx += 5) {
    g.moveTo(lx, 12).lineTo(lx, h - 2);
  }
  g.stroke();

  // Hazard stripe
  const stripeY = h - 6;
  for (let sx = 0; sx < w; sx += 12) {
    g.moveTo(sx, stripeY);
    g.lineTo(sx + 6, stripeY);
    g.lineTo(sx + 12, stripeY + 6);
    g.lineTo(sx + 6, stripeY + 6);
    g.closePath();
    g.fill({ color: tintColor(0xddaa00, bf), alpha: 0.3 });
  }
}
