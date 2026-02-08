// /hooks/use-player.ts
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Player } from "@game/types/player";

export function usePlayer() {
  const playerInfo = useQuery(api.players.getPlayerInfo);
  const alivePlayers =
    (useQuery(api.players.getAlivePlayers) as Player[]) || [];
  const leaderboard = useQuery(api.players.getLeaderboard) || [];

  const initPlayer = useMutation(api.players.getOrCreatePlayer);
  const updatePosition = useMutation(api.players.updatePosition);

  return {
    playerInfo,
    alivePlayers,
    leaderboard,
    initPlayer,
    updatePosition,
  };
}
