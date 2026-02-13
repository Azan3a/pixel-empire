// app/(protected)/game/features/world/renderers/properties/drawing/doors/drawDoorAndAccessories.ts

import { Graphics } from "pixi.js";
import type { BuildingPalette } from "../../shared/buildingPalettes";
import type {
  PropertyCategory,
  PropertySubType,
} from "@game/shared/contracts/game-config";
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
      drawResidentialDoor(g, width, height, palette, bf, isNight, false);
      break;
    case "duplex":
      drawDuplexDoors(g, width, height, palette, bf, isNight);
      break;
    case "apartment":
      drawApartmentEntrance(g, width, height, palette, bf, isNight);
      break;
    case "office":
      drawOfficeDoor(g, width, height, palette, bf, isNight);
      break;
    case "factory":
      drawFactoryDoor(g, width, height, palette, bf, isNight);
      break;
    case "bank":
      drawBankEntrance(g, width, height, palette, bf, isNight);
      break;
    case "casino":
      drawCasinoEntrance(g, width, height, palette, bf, isNight);
      break;
    case "ranger_station":
      drawResidentialDoor(g, width, height, palette, bf, isNight, true);
      break;
    case "warehouse":
    case "mall":
    case "police_station":
      // Doors drawn in base for these types
      break;
    case "corner_store":
    case "food_shop":
    case "supply_store":
    case "clothing_store":
    default:
      drawShopDoor(g, width, height, palette, bf, isNight);
      break;
  }
}
