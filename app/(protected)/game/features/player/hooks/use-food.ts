// hooks/use-food.ts
"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  FoodType,
  FOOD_ITEMS,
  FOOD_KEYS,
  MAX_FOOD_INVENTORY,
} from "@game/shared/contracts/game-config";
import { ConvexError } from "convex/values";
import { toast } from "sonner";
import { useCallback, useMemo } from "react";
import { usePlayer } from "./use-player";
import { Id } from "@/convex/_generated/dataModel";

export function useFood() {
  const buyFoodMutation = useMutation(api.food.buyFood);
  const consumeFoodMutation = useMutation(api.food.consumeFood);
  const { playerInfo, getItemQuantity } = usePlayer();

  const buyFood = async (
    foodType: FoodType,
    shopPropertyId: Id<"properties">,
  ) => {
    try {
      const res = await buyFoodMutation({ foodType, shopPropertyId });
      if (res) {
        toast.success(`${res.emoji} Bought ${res.food}!`);
      }
      return { success: true };
    } catch (e: unknown) {
      const msg =
        e instanceof ConvexError
          ? (e.data as string)
          : e instanceof Error
            ? e.message
            : "Failed to buy food";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const consumeFood = async (foodType: FoodType) => {
    try {
      const res = await consumeFoodMutation({ foodType });
      if (res) {
        toast.success(
          `${res.emoji} Ate ${res.food}! +${res.hungerRestored} hunger`,
        );
      }
      return { success: true };
    } catch (e: unknown) {
      const msg =
        e instanceof ConvexError
          ? (e.data as string)
          : e instanceof Error
            ? e.message
            : "Failed to eat food";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  /** Check if the player can afford a given food type */
  const canAfford = useCallback(
    (foodType: FoodType): boolean => {
      if (!playerInfo) return false;
      const food = FOOD_ITEMS[foodType];
      return (playerInfo.cash ?? 0) >= food.price;
    },
    [playerInfo],
  );

  /** Check how many of a food type the player has in inventory */
  const foodCount = useCallback(
    (foodType: FoodType): number => {
      return getItemQuantity(foodType);
    },
    [getItemQuantity],
  );

  /** Summary of food in inventory */
  const foodInventory = useMemo(() => {
    return (Object.keys(FOOD_ITEMS) as FoodType[]).map((key) => ({
      ...FOOD_ITEMS[key],
      quantity: getItemQuantity(key),
    }));
  }, [getItemQuantity]);

  const totalFoodCount = useMemo(() => {
    const inventory = playerInfo?.inventory ?? [];
    return inventory.reduce(
      (sum, item) => (FOOD_KEYS.has(item.item) ? sum + item.quantity : sum),
      0,
    );
  }, [playerInfo?.inventory]);

  const remainingFoodCapacity = Math.max(
    0,
    MAX_FOOD_INVENTORY - totalFoodCount,
  );
  const canBuyMoreFood = remainingFoodCapacity > 0;

  return {
    buyFood,
    consumeFood,
    canAfford,
    foodCount,
    foodInventory,
    totalFoodCount,
    remainingFoodCapacity,
    canBuyMoreFood,
  };
}
