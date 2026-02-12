"use client";

import { useInterpolatedPlayers } from "@game/hooks/use-interpolated-players";
import { PlayerCharacter } from "./player/PlayerCharacter";
import { Player } from "@game/types/player";

interface OtherPlayersProps {
  players: Player[];
  sunlightIntensity: number;
}

export function OtherPlayers({ players, sunlightIntensity }: OtherPlayersProps) {
  const interpolated = useInterpolatedPlayers(players);

  return (
    <>
      {interpolated.map((p) => (
        <PlayerCharacter
          key={p._id}
          x={p.displayX}
          y={p.displayY}
          name={p.name}
          color={0xef4444}
          isMe={false}
          sunlightIntensity={sunlightIntensity}
          equippedClothing={p.equippedClothing}
        />
      ))}
    </>
  );
}
