// hooks/use-clothing.ts
"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  ClothingType,
  CLOTHING_ITEMS,
  CLOTHING_KEYS,
  ClothingSlot,
} from "@/convex/clothingConfig";
import { ConvexError } from "convex/values";
import { toast } from "sonner";
import { useCallback, useMemo } from "react";
import { usePlayer } from "./use-player";
import { Id } from "@/convex/_generated/dataModel";

export function useClothing() {
  const buyClothingMutation = useMutation(api.clothing.buyClothing);
  const equipClothingMutation = useMutation(api.clothing.equipClothing);
  const unequipClothingMutation = useMutation(api.clothing.unequipClothing);
  const { playerInfo, getItemQuantity } = usePlayer();

  const buyClothing = async (
    itemKey: ClothingType,
    shopPropertyId: Id<"properties">,
  ) => {
    try {
      const res = await buyClothingMutation({ itemKey, shopPropertyId });
      if (res) {
        toast.success(`${res.emoji} Bought ${res.name}!`);
      }
      return { success: true };
    } catch (e: unknown) {
      const msg =
        e instanceof ConvexError
          ? (e.data as string)
          : e instanceof Error
            ? e.message
            : "Failed to buy clothing";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const equipClothing = async (itemKey: ClothingType) => {
    try {
      const res = await equipClothingMutation({ itemKey });
      if (res) {
        toast.success(`${res.emoji} Equipped ${res.name}!`);
      }
      return { success: true };
    } catch (e: unknown) {
      const msg =
        e instanceof ConvexError
          ? (e.data as string)
          : e instanceof Error
            ? e.message
            : "Failed to equip clothing";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const unequipClothing = async (slot: ClothingSlot) => {
    try {
      await unequipClothingMutation({ slot });
      toast.success("Item unequipped");
      return { success: true };
    } catch (e: unknown) {
      const msg =
        e instanceof ConvexError
          ? (e.data as string)
          : e instanceof Error
            ? e.message
            : "Failed to unequip item";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const canAfford = useCallback(
    (itemKey: ClothingType): boolean => {
      if (!playerInfo) return false;
      const item = CLOTHING_ITEMS[itemKey];
      return (playerInfo.cash ?? 0) >= item.price;
    },
    [playerInfo],
  );

  const clothingCount = useCallback(
    (itemKey: ClothingType): number => {
      return getItemQuantity(itemKey);
    },
    [getItemQuantity],
  );

  /** All clothing items in inventory with quantities */
  const clothingInventory = useMemo(() => {
    return (Object.keys(CLOTHING_ITEMS) as ClothingType[])
      .map((key) => ({
        ...CLOTHING_ITEMS[key],
        quantity: getItemQuantity(key),
      }))
      .filter((item) => item.quantity > 0);
  }, [getItemQuantity]);

  /** Currently equipped clothing from player data */
  const equippedClothing = useMemo(
    () => playerInfo?.equippedClothing ?? {},
    [playerInfo],
  );

  return {
    buyClothing,
    equipClothing,
    unequipClothing,
    canAfford,
    clothingCount,
    clothingInventory,
    equippedClothing,
    CLOTHING_KEYS,
  };
}
