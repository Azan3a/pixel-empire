// app/(protected)/game/features/world/renderers/properties/components/PropertyLabel.tsx
"use client";

import { memo } from "react";
import type { PropertyCategory } from "@game/shared/contracts/game-config";

interface PropertyLabelProps {
  name: string;
  category: PropertyCategory;
  isOwned: boolean;
  ownerCount: number;
  maxOwners: number;
  price: number;
  containerWidth: number;
  containerHeight: number;
}

function PropertyLabelInner({
  name,
  category,
  isOwned,
  ownerCount,
  maxOwners,
  price,
  containerWidth,
  containerHeight,
}: PropertyLabelProps) {
  const isService = category === "service";

  let statusText: string;
  let statusColor: string;

  if (isService) {
    statusText = "PUBLIC";
    statusColor = "#d4a017";
  } else if (isOwned) {
    statusText = `YOURS${ownerCount > 1 ? ` (+${ownerCount - 1})` : ""}`;
    statusColor = "#34d399";
  } else if (ownerCount >= maxOwners) {
    statusText = "FULL";
    statusColor = "#999999";
  } else if (ownerCount > 0) {
    statusText = `$${price.toLocaleString()} · ${ownerCount}/${maxOwners}`;
    statusColor = "#4ade80";
  } else {
    statusText = `$${price.toLocaleString()}`;
    statusColor = "#4ade80";
  }

  return (
    <div
      className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 flex-col items-center gap-0.5 text-center"
      style={{
        top: -10,
        width: Math.max(containerWidth + 40, 120),
      }}
    >
      <span className="max-w-full truncate text-[10px] font-bold uppercase tracking-wider text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
        {name}
      </span>
      <span
        className="text-[9px] font-medium tracking-tight drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
        style={{ color: statusColor }}
      >
        {statusText}
      </span>
    </div>
  );
}

export const PropertyLabel = memo(PropertyLabelInner);
