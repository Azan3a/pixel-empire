// app/(protected)/game/features/world/canvas/WorldOverlay.tsx
"use client";

import { useMemo } from "react";
import { Property } from "@game/types/property";
import { PropertyLabel } from "@game/features/world/renderers/properties/components/PropertyLabel";

interface WorldOverlayProps {
  width: number;
  height: number;
  renderPos: { x: number; y: number };
  properties: Property[];
}

export function WorldOverlay({
  width,
  height,
  renderPos,
  properties,
}: WorldOverlayProps) {
  const cameraX = width / 2 - renderPos.x;
  const cameraY = height / 2 - renderPos.y;

  const CULL_PADDING = 100;

  const visibleProperties = useMemo(() => {
    return properties.filter(
      (p) =>
        p.x + p.width > renderPos.x - width / 2 - CULL_PADDING &&
        p.x < renderPos.x + width / 2 + CULL_PADDING &&
        p.y + p.height > renderPos.y - height / 2 - CULL_PADDING &&
        p.y < renderPos.y + height / 2 + CULL_PADDING,
    );
  }, [properties, renderPos, width, height]);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ zIndex: 10 }}
    >
      <div
        className="absolute inset-0 transition-none"
        style={{
          transform: `translate(${cameraX}px, ${cameraY}px)`,
        }}
      >
        {visibleProperties.map((prop) => (
          <div
            key={prop._id}
            className="absolute"
            style={{
              left: prop.x + prop.width / 2,
              top: prop.y + prop.height / 2,
            }}
          >
            <PropertyLabel
              name={prop.name}
              category={prop.category}
              isOwned={prop.isOwned}
              ownerCount={prop.ownerCount}
              maxOwners={prop.maxOwners}
              price={prop.price}
              containerWidth={prop.width}
              containerHeight={prop.height}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
