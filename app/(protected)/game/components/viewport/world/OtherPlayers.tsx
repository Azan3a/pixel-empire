"use client";

import { memo } from "react";
import { useInterpolatedPlayers } from "@game/hooks/use-interpolated-players";
import { PlayerCharacter } from "./player/PlayerCharacter";
import { Player } from "@game/types/player";
import { getAvatarColor } from "./player/utils";

interface OtherPlayersProps {
  players: Player[];
  sunlightIntensity: number;
}

function OtherPlayersInner({ players, sunlightIntensity }: OtherPlayersProps) {
  const interpolated = useInterpolatedPlayers(players);

  return (
    <>
      {interpolated.map((p) => (
        <PlayerCharacter
          key={p._id}
          x={p.displayX}
          y={p.displayY}
          name={p.name}
          color={getAvatarColor(p.avatar)}
          isMe={false}
          sunlightIntensity={sunlightIntensity}
          equippedClothing={p.equippedClothing}
        />
      ))}
    </>
  );
}

export const OtherPlayers = memo(OtherPlayersInner);
