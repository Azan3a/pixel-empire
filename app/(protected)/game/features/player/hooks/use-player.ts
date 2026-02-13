"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Player } from "@game/types/player";
import { useMemo } from "react";

export function usePlayer() {
  const playerInfo = useQuery(api.players.getPlayerInfo);
  const alivePlayers =
    (useQuery(api.players.getAlivePlayers) as Player[]) || [];
  const leaderboard = useQuery(api.players.getLeaderboard) || [];

  const initPlayer = useMutation(api.players.getOrCreatePlayer);
  const updatePosition = useMutation(api.players.updatePosition);

  /** Number of properties the current player owns */
  const ownedPropertyCount = useMemo(
    () => playerInfo?.ownedPropertyCount ?? 0,
    [playerInfo],
  );

  /** Inventory items grouped by item key */
  const inventory = useMemo(() => playerInfo?.inventory ?? [], [playerInfo]);

  /** Get quantity of a specific item in inventory */
  const getItemQuantity = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of inventory) {
      map.set(item.item, (map.get(item.item) ?? 0) + item.quantity);
    }
    return (itemKey: string) => map.get(itemKey) ?? 0;
  }, [inventory]);

  return {
    playerInfo,
    alivePlayers,
    leaderboard,
    initPlayer,
    updatePosition,
    ownedPropertyCount,
    inventory,
    getItemQuantity,
  };
}
