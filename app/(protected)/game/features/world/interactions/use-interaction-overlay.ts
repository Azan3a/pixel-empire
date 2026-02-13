// app/(protected)/game/features/world/interactions/use-interaction-overlay.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { Property } from "@game/types/property";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { SHOP_INTERACT_RADIUS } from "@game/shared/contracts/game-config";

export function useInteractionOverlay(
  renderPos: { x: number; y: number },
  properties: Property[],
) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);

  const [selectedShop, setSelectedShop] = useState<Property | null>(null);
  const [shopDialogOpen, setShopDialogOpen] = useState(false);

  const [selectedRangerStation, setSelectedRangerStation] =
    useState<Property | null>(null);
  const [rangerDialogOpen, setRangerDialogOpen] = useState(false);

  const handlePropertyClick = useCallback(
    (propertyId: Id<"properties">) => {
      const prop = properties.find((p) => p._id === propertyId);
      if (!prop) return;

      const centerX = prop.x + prop.width / 2;
      const centerY = prop.y + prop.height / 2;
      const distance = Math.sqrt(
        (centerX - renderPos.x) ** 2 + (centerY - renderPos.y) ** 2,
      );

      if (distance > SHOP_INTERACT_RADIUS) {
        toast("Walk closer to interact", {
          description: `You need to be near ${prop.name} to interact.`,
        });
        return;
      }

      if (prop.subType === "ranger_station") {
        setSelectedRangerStation(prop);
        setRangerDialogOpen(true);
        return;
      }

      if (prop.category === "shop") {
        setSelectedShop(prop);
        setShopDialogOpen(true);
      } else {
        setSelectedProperty(prop);
        setPurchaseDialogOpen(true);
      }
    },
    [renderPos, properties],
  );

  // Auto-close dialogs if player walks too far away
  useEffect(() => {
    const isTooFar = (prop: Property) => {
      const centerX = prop.x + prop.width / 2;
      const centerY = prop.y + prop.height / 2;
      const distance = Math.sqrt(
        (centerX - renderPos.x) ** 2 + (centerY - renderPos.y) ** 2,
      );
      return distance > SHOP_INTERACT_RADIUS + 20;
    };

    if (shopDialogOpen && selectedShop && isTooFar(selectedShop)) {
      setTimeout(() => {
        setShopDialogOpen(false);
        setSelectedShop(null);
      }, 0);
    }

    if (purchaseDialogOpen && selectedProperty && isTooFar(selectedProperty)) {
      setTimeout(() => {
        setPurchaseDialogOpen(false);
        setSelectedProperty(null);
      }, 0);
    }

    if (
      rangerDialogOpen &&
      selectedRangerStation &&
      isTooFar(selectedRangerStation)
    ) {
      setTimeout(() => {
        setRangerDialogOpen(false);
        setSelectedRangerStation(null);
      }, 0);
    }
  }, [
    renderPos,
    shopDialogOpen,
    selectedShop,
    purchaseDialogOpen,
    selectedProperty,
    rangerDialogOpen,
    selectedRangerStation,
  ]);

  return {
    selectedProperty,
    setSelectedProperty,
    purchaseDialogOpen,
    setPurchaseDialogOpen,
    selectedShop,
    setSelectedShop,
    shopDialogOpen,
    setShopDialogOpen,
    selectedRangerStation,
    setSelectedRangerStation,
    rangerDialogOpen,
    setRangerDialogOpen,
    handlePropertyClick,
  };
}
