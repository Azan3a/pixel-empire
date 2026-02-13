// app/(protected)/game/features/world/renderers/properties/PropertyRendererRegistry.ts
"use client";

import { Graphics } from "pixi.js";
import type {
  PropertyCategory,
  PropertySubType,
} from "@game/shared/contracts/game-config";
import { BuildingPalette } from "@game/features/world/renderers/properties/shared/buildingPalettes";
import { drawHouse } from "./HouseRenderer";
import { drawApartment } from "./ApartmentRenderer";
import { drawOffice } from "./OfficeRenderer";
import { drawWarehouse } from "./WarehouseRenderer";

// Standard props passed to any building renderer
export interface BuildingRenderProps {
  g: Graphics;
  width: number;
  height: number;
  category: PropertyCategory;
  subType: PropertySubType;
  palette: BuildingPalette;
  bf: number;
  isNight: boolean;
  isDusk: boolean;
  px: number;
  py: number;
}

/**
 * Registry of specialized building renderers.
 * This meets the requirement of "1 file for drawing a particular building".
 */
const SPECIALIZED_RENDERERS: Partial<
  Record<PropertySubType, (props: BuildingRenderProps) => void>
> = {
  house: (p) =>
    drawHouse(
      p.g,
      p.width,
      p.height,
      p.palette,
      p.bf,
      p.isNight,
      p.isDusk,
      p.px,
      p.py,
    ),
  apartment: (p) =>
    drawApartment(
      p.g,
      p.width,
      p.height,
      p.palette,
      p.bf,
      p.isNight,
      p.isDusk,
      p.px,
      p.py,
    ),
  office: (p) =>
    drawOffice(
      p.g,
      p.width,
      p.height,
      p.palette,
      p.bf,
      p.isNight,
      p.isDusk,
      p.px,
      p.py,
    ),
  warehouse: (p) =>
    drawWarehouse(
      p.g,
      p.width,
      p.height,
      p.palette,
      p.bf,
      p.isNight,
      p.isDusk,
      p.px,
      p.py,
    ),
};

export function getSpecializedRenderer(subType: PropertySubType) {
  return SPECIALIZED_RENDERERS[subType];
}
