// components/game/viewport/world/PropertyNode.tsx
"use client";

import { Graphics } from "pixi.js";
import { useCallback, memo } from "react";
import { Property } from "@game/types/property";
import { Id } from "@/convex/_generated/dataModel";
import { resolvePalette } from "./property/buildingPalettes";
import { brightnessFactor } from "./property/propertyDrawHelpers";
import { drawBuildingBase } from "./property/base/drawBuildingBase";
import { drawWindows } from "./property/windows/drawWindows";
import { drawDoorAndAccessories } from "./property/doors/drawDoorAndAccessories";
import { drawBuildingBorder } from "./property/drawBuildingBorder";
import { PropertyLabel } from "./property/PropertyLabel";

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
      drawBuildingBorder(g, width, height, category, palette, isOwned, isNight);
    },
    [property, sunlightIntensity],
  );

  const { category, isOwned, ownerCount, maxOwners, price } = property;

  return (
    <pixiContainer
      x={property.x}
      y={property.y}
      eventMode="static"
      cursor="pointer"
      onPointerTap={() => onInteract(property._id)}
    >
      <pixiGraphics draw={drawProperty} />
      <PropertyLabel
        name={property.name}
        category={category}
        isOwned={isOwned}
        ownerCount={ownerCount}
        maxOwners={maxOwners}
        price={price}
        containerWidth={property.width}
        containerHeight={property.height}
      />
    </pixiContainer>
  );
}

export const PropertyNode = memo(PropertyNodeInner);
