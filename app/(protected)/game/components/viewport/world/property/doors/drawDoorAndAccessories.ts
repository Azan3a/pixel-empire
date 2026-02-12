// components/game/viewport/world/property/doors/drawDoorAndAccessories.ts

import { Graphics } from "pixi.js";
import type { BuildingPalette } from "../buildingPalettes";
import type { PropertyCategory, PropertySubType } from "@/convex/map/zones";
import {
  drawResidentialDoor,
  drawDuplexDoors,
  drawApartmentEntrance,
} from "./residentialDoors";
import { drawOfficeDoor, drawFactoryDoor } from "./commercialDoors";
import { drawBankEntrance, drawCasinoEntrance } from "./serviceDoors";
import { drawShopDoor } from "./shopDoors";

export function drawDoorAndAccessories(
  g: Graphics,
  width: number,
  height: number,
  category: PropertyCategory,
  subType: PropertySubType,
  palette: BuildingPalette,
  bf: number,
  isNight: boolean,
): void {
  switch (subType) {
    case "house":
    case "farmhouse":
      drawResidentialDoor(g, width, height, palette, bf, isNight, false);
      break;
    case "duplex":
      drawDuplexDoors(g, width, height, palette, bf, isNight);
      break;
    case "apartment":
    case "luxury_apartment":
    case "condo_tower":
      drawApartmentEntrance(g, width, height, palette, bf, isNight);
      break;
    case "office_tower":
    case "tech_hub":
    case "investment_firm":
    case "law_office":
    case "insurance":
    case "news_tower":
      drawOfficeDoor(g, width, height, palette, bf, isNight);
      break;
    case "sawmill_factory":
    case "smelter":
    case "food_processing":
    case "chemical_plant":
    case "textile_mill":
    case "electronics_factory":
      drawFactoryDoor(g, width, height, palette, bf, isNight);
      break;
    case "bank_tower":
      drawBankEntrance(g, width, height, palette, bf, isNight);
      break;
    case "casino":
      drawCasinoEntrance(g, width, height, palette, bf, isNight);
      break;
    case "ranger_station":
      drawResidentialDoor(g, width, height, palette, bf, isNight, true);
      break;
    case "warehouse":
    case "wholesale":
    case "mega_mall":
    case "mega_mart":
    case "police_hq":
      // Doors drawn in base for these types
      break;
    default:
      drawShopDoor(g, width, height, palette, bf, isNight);
      break;
  }
}
