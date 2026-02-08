// hooks/use-world.ts
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Property } from "@game/types/property";
import { Id } from "@/convex/_generated/dataModel";
import { ConvexError } from "convex/values";
import { toast } from "sonner";
import { useMemo } from "react";
import { getZoneAt, ZONES, type ZoneId } from "@/convex/mapZones";

export function useWorld() {
  const queryProperties = useQuery(api.world.getProperties);
  const properties = useMemo(
    () => (queryProperties as Property[]) || [],
    [queryProperties],
  );

  const buyPropertyMutation = useMutation(api.world.buyProperty);
  const sellPropertyMutation = useMutation(api.world.sellProperty);
  const collectIncomeMutation = useMutation(api.world.collectIncome);
  const workJobMutation = useMutation(api.world.workJob);
  const initCityMutation = useMutation(api.world.initCity);

  const buyProperty = async (propertyId: Id<"properties">) => {
    try {
      await buyPropertyMutation({ propertyId });
      toast.success("Property purchased!");
      return { success: true };
    } catch (e: unknown) {
      const msg =
        e instanceof ConvexError
          ? (e.data as string)
          : e instanceof Error
            ? e.message
            : "Failed to buy property";
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
      const msg =
        e instanceof ConvexError
          ? (e.data as string)
          : e instanceof Error
            ? e.message
            : "Failed to sell property";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const collectIncome = async () => {
    try {
      const res = await collectIncomeMutation();
      if (res) {
        toast.success(
          `Collected $${res.totalIncome.toLocaleString()} from ${res.propertiesCollected} ${
            res.propertiesCollected === 1 ? "property" : "properties"
          }!`,
        );
      }
      return { success: true };
    } catch (e: unknown) {
      const msg =
        e instanceof ConvexError
          ? (e.data as string)
          : e instanceof Error
            ? e.message
            : "No income to collect";
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
      const msg =
        e instanceof ConvexError
          ? (e.data as string)
          : e instanceof Error
            ? e.message
            : "Failed to work job";
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

  /** Get zone info for a world position */
  const getZoneInfo = useMemo(() => {
    return (x: number, y: number) => {
      const zoneId = getZoneAt(x, y);
      return ZONES[zoneId];
    };
  }, []);

  /** Current player's owned property count */
  const ownedCount = useMemo(() => {
    return properties.filter((p) => p.isOwned).length;
  }, [properties]);

  /** Estimated total income per cycle from owned properties */
  const totalIncomePerCycle = useMemo(() => {
    return properties
      .filter((p) => p.isOwned)
      .reduce((sum, p) => sum + p.income, 0);
  }, [properties]);

  /** Get a player's current zone based on position */
  const getPlayerZone = useMemo(() => {
    return (x: number, y: number): ZoneId => getZoneAt(x, y);
  }, []);

  return {
    properties,
    buyProperty,
    sellProperty,
    collectIncome,
    workJob,
    initCity,
    getZoneInfo,
    getPlayerZone,
    ownedCount,
    totalIncomePerCycle,
  };
}
