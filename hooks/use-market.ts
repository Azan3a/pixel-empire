"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export function useMarket() {
  const sellResourceMutation = useMutation(api.world.sellResource);

  const sellResource = async (item: string, amount: number = 1) => {
    try {
      const res = await sellResourceMutation({ item, amount });
      if (res && "error" in res && res.error) {
        toast.error(res.error as string);
        return { success: false, error: res.error };
      }
      return { success: true };
    } catch (e) {
      toast.error("Failed to sell resource");
      return { success: false, error: e };
    }
  };

  return {
    sellResource,
  };
}
