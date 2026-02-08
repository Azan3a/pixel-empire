// components/game/viewport/world/property/base/shops.ts

import { Graphics } from "pixi.js";
import type { BuildingPalette } from "../buildingPalettes";
import { tintColor } from "../propertyDrawHelpers";
import type { PropertySubType } from "@/convex/mapZones";

export function drawShopBase(
  g: Graphics,
  w: number,
  h: number,
  c: BuildingPalette,
  bf: number,
  subType: PropertySubType,
): void {
  // Upper wall
  g.rect(0, 6, w, h * 0.45);
  g.fill({ color: tintColor(c.wall, bf) });

  // Storefront lower section
  g.rect(0, h * 0.45, w, h * 0.55);
  g.fill({ color: tintColor(c.wallLight, bf) });

  // Divider trim
  g.rect(0, h * 0.44, w, 3);
  g.fill({ color: tintColor(c.trim, bf), alpha: 0.5 });

  // Flat roof
  g.rect(-1, 0, w + 2, 7);
  g.fill({ color: tintColor(c.roof, bf) });

  // Awning
  const awningY = h * 0.45;
  const awningH = 10;
  g.rect(3, awningY, w - 6, awningH);
  g.fill({ color: tintColor(c.awning, bf) });
  for (let sx = 3; sx < w - 6; sx += 10) {
    g.rect(sx, awningY, 5, awningH);
    g.fill({ color: 0xffffff, alpha: 0.2 });
  }

  // Awning shadow
  g.rect(3, awningY + awningH, w - 6, 3);
  g.fill({ color: 0x000000, alpha: 0.08 });

  // Display window
  const displayPad = 8;
  const displayY = awningY + awningH + 4;
  const displayH = h - displayY - 14;
  if (displayH > 8) {
    g.rect(displayPad, displayY, w - displayPad * 2, displayH);
    g.fill({ color: tintColor(c.window, bf), alpha: 0.55 });
    g.setStrokeStyle({
      color: tintColor(c.windowFrame, bf),
      width: 1.5,
      alpha: 0.6,
    });
    g.rect(displayPad, displayY, w - displayPad * 2, displayH);
    g.stroke();
    g.moveTo(w / 2, displayY).lineTo(w / 2, displayY + displayH);
    g.stroke();

    drawDisplayContent(
      g,
      displayPad,
      displayY,
      w - displayPad * 2,
      displayH,
      bf,
      subType,
    );
  }

  // Side trim
  g.setStrokeStyle({ color: tintColor(c.trim, bf), width: 1.5, alpha: 0.3 });
  g.moveTo(0, 7).lineTo(0, h);
  g.moveTo(w, 7).lineTo(w, h);
  g.stroke();
}

function drawDisplayContent(
  g: Graphics,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  bf: number,
  subType: PropertySubType,
): void {
  if (subType === "food_shop") {
    drawFoodDisplay(g, dx, dy, dw, dh, bf);
  } else if (subType === "clothing_store") {
    drawClothingDisplay(g, dx, dy, dw, dh, bf);
  } else if (subType === "supply_store") {
    drawSupplyDisplay(g, dx, dy, dw, dh, bf);
  } else {
    drawGenericDisplay(g, dx, dy, dw, dh, bf);
  }
}

function drawFoodDisplay(
  g: Graphics,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  bf: number,
): void {
  const items = Math.min(3, Math.floor(dw / 20));
  const spacing = dw / (items + 1);
  for (let i = 1; i <= items; i++) {
    const ix = dx + spacing * i;
    g.circle(ix, dy + dh * 0.6, 4);
    g.fill({ color: tintColor(0xeecc88, bf), alpha: 0.5 });
    g.circle(ix, dy + dh * 0.6, 2);
    g.fill({ color: tintColor(0xdd8833, bf), alpha: 0.5 });
  }
}

function drawClothingDisplay(
  g: Graphics,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  bf: number,
): void {
  const mannequins = Math.min(2, Math.floor(dw / 30));
  const spacing = dw / (mannequins + 1);
  for (let i = 1; i <= mannequins; i++) {
    const mx = dx + spacing * i;
    g.circle(mx, dy + dh * 0.25, 3);
    g.fill({ color: tintColor(0xccbbaa, bf), alpha: 0.4 });
    g.rect(mx - 3, dy + dh * 0.35, 6, dh * 0.45);
    g.fill({ color: tintColor(0xe91e63, bf), alpha: 0.25 });
  }
}

function drawSupplyDisplay(
  g: Graphics,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  bf: number,
): void {
  g.setStrokeStyle({ color: tintColor(0x8a7a5a, bf), width: 1, alpha: 0.3 });
  for (let sy = dy + 6; sy < dy + dh - 4; sy += 8) {
    g.moveTo(dx + 4, sy).lineTo(dx + dw - 4, sy);
  }
  g.stroke();
  for (let sy = dy + 6; sy < dy + dh - 4; sy += 8) {
    for (let sx = dx + 6; sx < dx + dw - 8; sx += 10) {
      g.rect(sx, sy - 4, 5, 4);
      g.fill({ color: tintColor(0xaa8855, bf), alpha: 0.25 });
    }
  }
}

function drawGenericDisplay(
  g: Graphics,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  bf: number,
): void {
  g.setStrokeStyle({ color: tintColor(0x999999, bf), width: 0.5, alpha: 0.2 });
  for (let sy = dy + 8; sy < dy + dh - 4; sy += 10) {
    g.moveTo(dx + 4, sy).lineTo(dx + dw - 4, sy);
  }
  g.stroke();
}
