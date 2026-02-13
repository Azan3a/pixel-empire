"use client";

import { Graphics } from "pixi.js";
import { useCallback, memo } from "react";
import { Property } from "@game/types/property";
import { Id } from "@/convex/_generated/dataModel";
import { resolvePalette } from "@game/features/world/renderers/properties/shared/buildingPalettes";
import { brightnessFactor } from "@game/features/world/renderers/properties/shared/propertyDrawHelpers";
import { drawBuildingBase } from "@game/features/world/renderers/properties/drawing/base/drawBuildingBase";
import { drawWindows } from "@game/features/world/renderers/properties/drawing/windows/drawWindows";
import { drawDoorAndAccessories } from "@game/features/world/renderers/properties/drawing/doors/drawDoorAndAccessories";
import { drawBuildingBorder } from "@game/features/world/renderers/properties/drawing/drawBuildingBorder";
import { getSpecializedRenderer } from "@game/features/world/renderers/properties/PropertyRendererRegistry";

interface PropertyNodeProps {
  property: Property;
  onInteract: (id: Id<"properties">) => void;
  sunlightIntensity?: number;
}

function PropertyNodeInner({
  property,
  onInteract,
  sunlightIntensity = 1,
}: PropertyNodeProps) {
  const drawProperty = useCallback(
    (g: Graphics) => {
      g.clear();

      const {
        width,
        height,
        category,
        subType,
        x: px,
        y: py,
        isOwned,
      } = property;

      const palette = resolvePalette(category, subType);
      const bf = brightnessFactor(sunlightIntensity);
      const isNight = sunlightIntensity < 0.3;
      const isDusk = sunlightIntensity < 0.6;

      const specialized = getSpecializedRenderer(subType);
      if (specialized) {
        specialized({
          g,
          width,
          height,
          category,
          subType,
          palette,
          bf,
          isNight,
          isDusk,
          px,
          py,
        });
      } else {
        drawBuildingBase(
          g,
          width,
          height,
          category,
          subType,
          palette,
          bf,
          isNight,
          px,
          py,
        );
        drawWindows(
          g,
          width,
          height,
          category,
          subType,
          palette,
          bf,
          isNight,
          isDusk,
          px,
          py,
        );
        drawDoorAndAccessories(
          g,
          width,
          height,
          category,
          subType,
          palette,
          bf,
          isNight,
        );
      }

      drawBuildingBorder(g, width, height, category, palette, isOwned, isNight);
    },
    [property, sunlightIntensity],
  );

  return (
    <pixiContainer
      x={property.x}
      y={property.y}
      eventMode="static"
      cursor="pointer"
      onPointerTap={() => onInteract(property._id)}
    >
      <pixiGraphics draw={drawProperty} />
    </pixiContainer>
  );
}

export const PropertyNode = memo(PropertyNodeInner);
