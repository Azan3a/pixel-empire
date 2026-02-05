"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { WorldNode } from "@/types/world_node";
import { Building } from "@/types/building";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

export function useWorld() {
  const resources = (useQuery(api.world.getResources) as WorldNode[]) || [];
  const buildings = (useQuery(api.world.getBuildings) as Building[]) || [];

  const collectResourceMutation = useMutation(api.world.collectResource);
  const collectProductionMutation = useMutation(api.world.collectProduction);
  const placeBuildingMutation = useMutation(api.world.placeBuilding);
  const seedResources = useMutation(api.world.seedResources);

  const collectResource = async (nodeId: Id<"world_nodes">) => {
    try {
      const res = await collectResourceMutation({ nodeId });
      if (res && "error" in res && res.error) {
        toast.error(res.error as string);
        return { success: false, error: res.error };
      }
      return { success: true };
    } catch (e) {
      toast.error("Failed to collect resource");
      return { success: false, error: e };
    }
  };

  const collectProduction = async (buildingId: Id<"buildings">) => {
    try {
      const res = await collectProductionMutation({ buildingId });
      if (res && "error" in res && res.error) {
        toast.error(res.error as string);
        return { success: false, error: res.error };
      } else if (res && "amount" in res && typeof res.amount === "number") {
        toast.success(`Collected ${res.amount} ${res.item}`);
        return { success: true, amount: res.amount, item: res.item };
      }
      return { success: true };
    } catch (e) {
      toast.error("Failed to collect production");
      return { success: false, error: e };
    }
  };

  const placeBuilding = async (type: string, x: number, y: number) => {
    try {
      const res = await placeBuildingMutation({ type, x, y });
      if (res && "error" in res && res.error) {
        toast.error(res.error as string);
        return { success: false, error: res.error };
      }
      toast.success(`Started building ${type.replace("_", " ")}!`);
      return { success: true, buildingId: res.buildingId };
    } catch (e) {
      toast.error("Failed to place building");
      return { success: false, error: e };
    }
  };

  return {
    resources,
    buildings,
    collectResource,
    collectProduction,
    placeBuilding,
    seedResources,
  };
}
