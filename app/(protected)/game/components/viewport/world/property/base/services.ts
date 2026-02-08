// components/game/viewport/world/property/base/services.ts

import { Graphics } from "pixi.js";
import type { BuildingPalette } from "../buildingPalettes";
import { tintColor } from "../propertyDrawHelpers";

export function drawBankBase(
  g: Graphics,
  w: number,
  h: number,
  c: BuildingPalette,
  bf: number,
): void {
  // Stone body
  g.rect(0, 10, w, h - 10);
  g.fill({ color: tintColor(c.wall, bf) });

  // Stone course lines
  g.setStrokeStyle({
    color: tintColor(c.wallLight, bf),
    width: 0.5,
    alpha: 0.15,
  });
  for (let ly = 14; ly < h; ly += 8) {
    g.moveTo(3, ly).lineTo(w - 3, ly);
  }
  g.stroke();

  // Entablature
  g.rect(-3, 4, w + 6, 8);
  g.fill({ color: tintColor(c.trim, bf) });
  g.rect(-4, 2, w + 8, 4);
  g.fill({ color: tintColor(c.roof, bf) });

  // Pediment
  g.moveTo(w * 0.15, 4);
  g.lineTo(w / 2, -4);
  g.lineTo(w * 0.85, 4);
  g.closePath();
  g.fill({ color: tintColor(c.roof, bf) });
  g.setStrokeStyle({
    color: tintColor(c.roofAccent, bf),
    width: 1,
    alpha: 0.5,
  });
  g.moveTo(w * 0.15, 4)
    .lineTo(w / 2, -4)
    .lineTo(w * 0.85, 4);
  g.stroke();

  // Columns
  const colCount = Math.min(6, Math.max(2, Math.floor(w / 20)));
  const colSpacing = (w - 16) / (colCount + 1);
  const colW = 5;
  const colH = h - 20;
  for (let ci = 1; ci <= colCount; ci++) {
    const cx = 8 + colSpacing * ci - colW / 2;
    g.rect(cx, 12, colW, colH);
    g.fill({ color: tintColor(0xddddcc, bf), alpha: 0.7 });
    g.rect(cx - 1, 11, colW + 2, 3);
    g.fill({ color: tintColor(0xccccbb, bf), alpha: 0.6 });
    g.rect(cx - 1, 12 + colH - 2, colW + 2, 3);
    g.fill({ color: tintColor(0xccccbb, bf), alpha: 0.6 });
    g.setStrokeStyle({ color: 0xffffff, width: 0.5, alpha: 0.15 });
    g.moveTo(cx + 1, 14).lineTo(cx + 1, 10 + colH);
    g.stroke();
  }

  // Gold stripe
  g.rect(0, h - 5, w, 3);
  g.fill({ color: tintColor(c.accent, bf), alpha: 0.35 });
}

export function drawCasinoBase(
  g: Graphics,
  w: number,
  h: number,
  c: BuildingPalette,
  bf: number,
  isNight: boolean,
): void {
  // Dark body
  g.rect(0, 0, w, h);
  g.fill({ color: tintColor(c.wall, bf) });

  // Edge gradients
  g.rect(0, 0, 6, h);
  g.fill({ color: 0x000000, alpha: 0.15 });
  g.rect(w - 6, 0, 6, h);
  g.fill({ color: 0x000000, alpha: 0.15 });

  // Crown
  g.rect(-2, 0, w + 4, 8);
  g.fill({ color: tintColor(c.roof, bf) });

  // Neon lines
  const neonAlpha = isNight ? 0.7 : 0.25;
  const neonGlow = isNight ? 0.2 : 0.05;

  g.setStrokeStyle({ color: c.accent, width: 2, alpha: neonAlpha });
  g.moveTo(2, 9).lineTo(w - 2, 9);
  g.stroke();
  if (isNight) {
    g.setStrokeStyle({ color: c.accent, width: 6, alpha: neonGlow });
    g.moveTo(2, 9).lineTo(w - 2, 9);
    g.stroke();
  }

  g.setStrokeStyle({ color: c.trim, width: 2, alpha: neonAlpha });
  g.moveTo(2, h - 3).lineTo(w - 2, h - 3);
  g.stroke();
  if (isNight) {
    g.setStrokeStyle({ color: c.trim, width: 6, alpha: neonGlow });
    g.moveTo(2, h - 3).lineTo(w - 2, h - 3);
    g.stroke();
  }

  g.setStrokeStyle({ color: c.accent, width: 1.5, alpha: neonAlpha * 0.7 });
  g.moveTo(2, 10).lineTo(2, h - 4);
  g.moveTo(w - 2, 10).lineTo(w - 2, h - 4);
  g.stroke();

  // Diamonds
  if (w > 50) {
    const diamondY = h * 0.35;
    const diamondSize = 6;
    const diamondCount = Math.floor((w - 30) / 20);
    const dSpacing = (w - 20) / (diamondCount + 1);
    for (let di = 1; di <= diamondCount; di++) {
      const dx = 10 + dSpacing * di;
      g.moveTo(dx, diamondY - diamondSize);
      g.lineTo(dx + diamondSize, diamondY);
      g.lineTo(dx, diamondY + diamondSize);
      g.lineTo(dx - diamondSize, diamondY);
      g.closePath();
      g.fill({ color: c.trim, alpha: isNight ? 0.5 : 0.2 });
    }
  }

  // Carpet
  const carpetW = Math.min(w * 0.4, 30);
  g.rect(w / 2 - carpetW / 2, h - 5, carpetW, 5);
  g.fill({ color: tintColor(0xaa2244, bf), alpha: 0.5 });
}

export function drawPoliceBase(
  g: Graphics,
  w: number,
  h: number,
  c: BuildingPalette,
  bf: number,
  isNight: boolean,
): void {
  g.rect(0, 0, w, h);
  g.fill({ color: tintColor(c.wall, bf) });

  // Roof
  g.rect(-1, 0, w + 2, 6);
  g.fill({ color: tintColor(c.roof, bf) });

  // Blue band
  g.rect(0, 6, w, 5);
  g.fill({ color: tintColor(c.accent, bf), alpha: 0.6 });

  // Institutional lines
  g.setStrokeStyle({
    color: tintColor(c.wallLight, bf),
    width: 0.5,
    alpha: 0.15,
  });
  for (let ly = 14; ly < h; ly += 10) {
    g.moveTo(3, ly).lineTo(w - 3, ly);
  }
  g.stroke();

  // Shield emblem
  if (w > 50) {
    const bx = w / 2;
    const by = h * 0.4;
    g.moveTo(bx, by - 8);
    g.lineTo(bx + 7, by - 4);
    g.lineTo(bx + 7, by + 4);
    g.lineTo(bx, by + 8);
    g.lineTo(bx - 7, by + 4);
    g.lineTo(bx - 7, by - 4);
    g.closePath();
    g.fill({ color: tintColor(c.accent, bf), alpha: 0.4 });
    g.circle(bx, by, 3);
    g.fill({ color: tintColor(0xddddcc, bf), alpha: 0.5 });
  }

  // Emergency lights
  const lightAlpha = isNight ? 0.7 : 0.25;
  g.circle(w * 0.35, 3, 3);
  g.fill({ color: 0x3b82f6, alpha: lightAlpha });
  g.circle(w * 0.65, 3, 3);
  g.fill({ color: 0xef4444, alpha: lightAlpha });
  if (isNight) {
    g.circle(w * 0.35, 3, 8);
    g.fill({ color: 0x3b82f6, alpha: 0.08 });
    g.circle(w * 0.65, 3, 8);
    g.fill({ color: 0xef4444, alpha: 0.08 });
  }

  // Reinforced door
  g.rect(w / 2 - 10, h - 16, 20, 16);
  g.fill({ color: tintColor(0x4a4a5a, bf) });
  g.setStrokeStyle({ color: tintColor(c.accent, bf), width: 1, alpha: 0.4 });
  g.rect(w / 2 - 10, h - 16, 20, 16);
  g.stroke();
}

export function drawRangerBase(
  g: Graphics,
  w: number,
  h: number,
  c: BuildingPalette,
  bf: number,
): void {
  // Log wall
  g.rect(0, h * 0.3, w, h * 0.7);
  g.fill({ color: tintColor(c.wall, bf) });

  // Log lines
  g.setStrokeStyle({ color: tintColor(c.wallLight, bf), width: 1, alpha: 0.2 });
  for (let ly = h * 0.35; ly < h; ly += 5) {
    g.moveTo(1, ly).lineTo(w - 1, ly);
  }
  g.stroke();

  // Log ends
  g.setStrokeStyle({ color: tintColor(0x6a5a3a, bf), width: 1, alpha: 0.3 });
  for (let ly = h * 0.35; ly < h - 4; ly += 5) {
    g.circle(2, ly + 2.5, 2.5);
    g.stroke();
    g.circle(w - 2, ly + 2.5, 2.5);
    g.stroke();
  }

  // A-frame roof
  g.moveTo(-4, h * 0.3);
  g.lineTo(w / 2, 0);
  g.lineTo(w + 4, h * 0.3);
  g.closePath();
  g.fill({ color: tintColor(c.roof, bf) });

  // Shingle lines
  g.setStrokeStyle({
    color: tintColor(c.roofAccent, bf),
    width: 0.5,
    alpha: 0.25,
  });
  for (let ry = 6; ry < h * 0.3; ry += 5) {
    const ratio = ry / (h * 0.3);
    const indent = w * 0.5 * (1 - ratio);
    g.moveTo(indent - 4, ry).lineTo(w - indent + 4, ry);
  }
  g.stroke();

  // Ridge
  g.setStrokeStyle({ color: tintColor(c.trim, bf), width: 2, alpha: 0.5 });
  g.moveTo(-4, h * 0.3)
    .lineTo(w / 2, 0)
    .lineTo(w + 4, h * 0.3);
  g.stroke();

  // Park sign
  if (w > 40) {
    g.rect(w * 0.25, h * 0.45, w * 0.5, 8);
    g.fill({ color: tintColor(c.accent, bf), alpha: 0.5 });
  }

  // Porch overhang
  g.rect(-2, h * 0.3 - 2, w + 4, 3);
  g.fill({ color: tintColor(0x8a7a5a, bf), alpha: 0.5 });
}
