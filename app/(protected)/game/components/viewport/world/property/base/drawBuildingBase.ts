/* eslint-disable @typescript-eslint/no-unused-vars */
// components/game/viewport/world/property/base/drawBuildingBase.ts

import { Graphics } from "pixi.js";
import type { BuildingPalette } from "../buildingPalettes";
import { tintColor } from "../propertyDrawHelpers";
import type { PropertyCategory, PropertySubType } from "@/convex/map/zones";
import {
  drawHouseBase,
  drawDuplexBase,
  drawApartmentBase,
} from "./residential";
import {
  drawOfficeBase,
  drawMallBase,
  drawCornerStoreBase,
} from "./commercial";
import { drawWarehouseBase, drawFactoryBase } from "./industrial";
import { drawShopBase } from "./shops";
import {
  drawBankBase,
  drawCasinoBase,
  drawPoliceBase,
  drawRangerBase,
} from "./services";
import { drawGenericBase } from "./generic";

export function drawBuildingBase(
  g: Graphics,
  width: number,
  height: number,
  category: PropertyCategory,
  subType: PropertySubType,
  palette: BuildingPalette,
  bf: number,
  isNight: boolean,
  px: number,
  py: number,
): void {
  // Shadow
  const shadowOff = isNight ? 7 : 5;
  const shadowAlpha = isNight ? 0.35 : 0.2;
  g.rect(shadowOff, shadowOff, width, height);
  g.fill({ color: 0x000000, alpha: shadowAlpha });

  // Foundation slab
  g.rect(-2, height - 4, width + 4, 6);
  g.fill({ color: tintColor(0x888888, bf), alpha: 0.5 });

  // Dispatch to sub-type renderer
  switch (subType) {
    case "house":
      drawHouseBase(g, width, height, palette, bf);
      break;
    case "duplex":
      drawDuplexBase(g, width, height, palette, bf);
      break;
    case "apartment":
      drawApartmentBase(g, width, height, palette, bf);
      break;
    case "office":
      drawOfficeBase(g, width, height, palette, bf);
      break;
    case "mall":
      drawMallBase(g, width, height, palette, bf);
      break;
    case "corner_store":
      drawCornerStoreBase(g, width, height, palette, bf);
      break;
    case "warehouse":
      drawWarehouseBase(g, width, height, palette, bf);
      break;
    case "factory":
      drawFactoryBase(g, width, height, palette, bf);
      break;
    case "food_shop":
    case "supply_store":
    case "clothing_store":
      drawShopBase(g, width, height, palette, bf, subType);
      break;
    case "bank":
      drawBankBase(g, width, height, palette, bf);
      break;
    case "casino":
      drawCasinoBase(g, width, height, palette, bf, isNight);
      break;
    case "police_station":
      drawPoliceBase(g, width, height, palette, bf, isNight);
      break;
    case "ranger_station":
      drawRangerBase(g, width, height, palette, bf);
      break;
    default:
      drawGenericBase(g, width, height, palette, bf);
      break;
  }
}
