// components/game/viewport/world/property/windows/drawWindows.ts

import { Graphics } from "pixi.js";
import type { BuildingPalette } from "../buildingPalettes";
import type { PropertyCategory, PropertySubType } from "@/convex/map/zones";
import { drawGridWindows } from "./windowHelpers";
import {
  drawHouseWindows,
  drawDuplexWindows,
  drawApartmentWindows,
} from "./residentialWindows";
import { drawWarehouseWindows, drawFactoryWindows } from "./industrialWindows";
import {
  drawBankWindows,
  drawInstitutionalWindows,
  drawCabinWindows,
} from "./serviceWindows";
import { drawShopUpperWindows } from "./shopWindows";

export function drawWindows(
  g: Graphics,
  width: number,
  height: number,
  category: PropertyCategory,
  subType: PropertySubType,
  palette: BuildingPalette,
  bf: number,
  isNight: boolean,
  isDusk: boolean,
  px: number,
  py: number,
): void {
  switch (subType) {
    case "house":
      drawHouseWindows(g, width, height, palette, bf, isNight, isDusk, px, py);
      break;
    case "duplex":
      drawDuplexWindows(g, width, height, palette, bf, isNight, isDusk, px, py);
      break;
    case "apartment":
      drawApartmentWindows(
        g,
        width,
        height,
        palette,
        bf,
        isNight,
        isDusk,
        px,
        py,
      );
      break;
    case "office":
    case "mall":
    case "casino":
      // These have their visual style drawn in base
      break;
    case "warehouse":
      drawWarehouseWindows(g, width, height, palette, bf, isNight, px, py);
      break;
    case "factory":
      drawFactoryWindows(g, width, height, palette, bf, isNight, px, py);
      break;
    case "bank":
      drawBankWindows(g, width, height, palette, bf, isNight, isDusk, px, py);
      break;
    case "police_station":
      drawInstitutionalWindows(
        g,
        width,
        height,
        palette,
        bf,
        isNight,
        isDusk,
        px,
        py,
      );
      break;
    case "ranger_station":
      drawCabinWindows(g, width, height, palette, bf, isNight, isDusk, px, py);
      break;
    default:
      if (category === "shop") {
        drawShopUpperWindows(
          g,
          width,
          height,
          palette,
          bf,
          isNight,
          isDusk,
          px,
          py,
        );
      } else {
        drawGridWindows(
          g,
          width,
          height,
          palette,
          bf,
          isNight,
          isDusk,
          px,
          py,
          16,
          16,
          6,
          7,
          14,
          14,
        );
      }
      break;
  }
}
