// app/(protected)/game/features/world/renderers/properties/drawing/drawBuildingDetails.ts

import { Graphics } from "pixi.js";
import type { BuildingPalette } from "../shared/buildingPalettes";
import { tintColor } from "../shared/propertyDrawHelpers";
import type { PropertySubType } from "@game/shared/contracts/game-config";

const INSET = 4;

/**
 * Draw sub-type specific architectural features (bank columns, casino neon, police light, etc.).
 */
export function drawBuildingDetails(
  g: Graphics,
  width: number,
  height: number,
  subType: PropertySubType,
  palette: BuildingPalette,
  bf: number,
  isNight: boolean,
  px: number,
): void {
  if (subType === "bank" && width > 40) {
    drawBankColumns(g, width, height, bf);
  }

  if (subType === "casino" && isNight) {
    drawCasinoNeon(g, width, height, px);
  }

  if (subType === "police_station") {
    drawPoliceLight(g, width, isNight);
  }
}

function drawBankColumns(
  g: Graphics,
  width: number,
  height: number,
  bf: number,
): void {
  const colW = 4;
  const colH = height - INSET * 2 - 8;
  const cols = Math.min(4, Math.floor((width - 20) / 18));
  const spacing = (width - 20) / (cols + 1);

  for (let ci = 1; ci <= cols; ci++) {
    const cx = 10 + spacing * ci - colW / 2;
    g.rect(cx, INSET + 4, colW, colH);
    g.fill({ color: tintColor(0xccccaa, bf), alpha: 0.7 });
    g.setStrokeStyle({
      color: tintColor(0x999977, bf),
      width: 0.5,
      alpha: 0.5,
    });
    g.rect(cx, INSET + 4, colW, colH);
    g.stroke();
  }
}

function drawCasinoNeon(
  g: Graphics,
  width: number,
  height: number,
  px: number,
): void {
  g.setStrokeStyle({
    color: 0xff2266,
    width: 2,
    alpha: 0.5 + Math.sin(px * 0.1) * 0.2,
  });
  g.rect(1, 1, width - 2, height - 2);
  g.stroke();
  g.setStrokeStyle({ color: 0xffdd00, width: 1, alpha: 0.3 });
  g.rect(3, 3, width - 6, height - 6);
  g.stroke();
}

function drawPoliceLight(g: Graphics, width: number, isNight: boolean): void {
  const lightAlpha = isNight ? 0.6 : 0.3;
  g.circle(width / 2, INSET + 4, 4);
  g.fill({ color: 0x3b82f6, alpha: lightAlpha });
  if (isNight) {
    g.circle(width / 2, INSET + 4, 10);
    g.fill({ color: 0x3b82f6, alpha: 0.1 });
  }
}
