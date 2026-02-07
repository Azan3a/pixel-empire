// hooks/use-food.ts
"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FoodType } from "@/convex/foodConfig";
import { toast } from "sonner";

export function useFood() {
  const buyFoodMutation = useMutation(api.food.buyFood);

  const buyFood = async (foodType: FoodType) => {
    try {
      const res = await buyFoodMutation({ foodType });
      if (res) {
        toast.success(
          `${res.emoji} Ate ${res.food}! +${res.hungerRestored} hunger`,
        );
      }
      return { success: true };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to buy food";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  return { buyFood };
}
