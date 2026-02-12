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
    case "farmhouse":
      drawHouseBase(g, width, height, palette, bf);
      break;
    case "duplex":
      drawDuplexBase(g, width, height, palette, bf);
      break;
    case "apartment":
    case "luxury_apartment":
    case "condo_tower":
      drawApartmentBase(g, width, height, palette, bf);
      break;
    case "office_tower":
    case "tech_hub":
    case "investment_firm":
    case "law_office":
    case "insurance":
    case "news_tower":
      drawOfficeBase(g, width, height, palette, bf);
      break;
    case "mega_mall":
    case "mega_mart":
      drawMallBase(g, width, height, palette, bf);
      break;
    case "general_store":
    case "bookstore":
    case "antique_shop":
    case "pet_shop":
    case "sports_store":
    case "pharmacy":
    case "electronics_store":
    case "furniture_outlet":
    case "auto_parts":
      drawCornerStoreBase(g, width, height, palette, bf);
      break;
    case "warehouse":
    case "wholesale":
      drawWarehouseBase(g, width, height, palette, bf);
      break;
    case "sawmill_factory":
    case "smelter":
    case "food_processing":
    case "chemical_plant":
    case "textile_mill":
    case "electronics_factory":
      drawFactoryBase(g, width, height, palette, bf);
      break;
    case "bakery":
    case "coffee_shop":
    case "food_court":
    case "park_cafe":
    case "farmhouse_kitchen":
    case "fish_market":
    case "ice_cream_stand":
    case "grocery_store":
    case "inn":
    case "tavern":
    case "bait_shop":
    case "seed_store":
    case "ship_supply":
    case "hardware_store":
    case "clothing_store":
    case "tailor":
    case "blacksmith":
    case "herbalist":
    case "surf_shop":
    case "beach_rental":
    case "yacht_club_shop":
    case "gym":
    case "farmers_market":
    case "sawmill":
      drawShopBase(g, width, height, palette, bf, subType);
      break;
    case "bank_tower":
      drawBankBase(g, width, height, palette, bf);
      break;
    case "casino":
      drawCasinoBase(g, width, height, palette, bf, isNight);
      break;
    case "police_hq":
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
