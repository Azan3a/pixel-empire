"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Property } from "@game/types/property";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

export function useWorld() {
  const properties = (useQuery(api.world.getProperties) as Property[]) || [];

  const buyPropertyMutation = useMutation(api.world.buyProperty);
  const sellPropertyMutation = useMutation(api.world.sellProperty);
  const workJobMutation = useMutation(api.world.workJob);
  const initCityMutation = useMutation(api.world.initCity);

  const buyProperty = async (propertyId: Id<"properties">) => {
    try {
      await buyPropertyMutation({ propertyId });
      toast.success("Property purchased!");
      return { success: true };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to buy property";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const sellProperty = async (propertyId: Id<"properties">) => {
    try {
      const res = await sellPropertyMutation({ propertyId });
      if (res) {
        toast.success(
          `Sold ${res.sold} for $${res.sellPrice.toLocaleString()}`,
        );
      }
      return { success: true };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to sell property";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const workJob = async () => {
    try {
      const res = await workJobMutation();
      if (res && typeof res === "object" && "earned" in res) {
        toast.success(`Worked and earned $${res.earned}`);
      }
      return { success: true };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to work job";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const initCity = async () => {
    try {
      await initCityMutation();
      toast.success("City initialized!");
    } catch {
      toast.error("Failed to initialize city");
    }
  };

  return {
    properties,
    buyProperty,
    sellProperty,
    workJob,
    initCity,
  };
}
