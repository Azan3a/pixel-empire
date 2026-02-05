"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";

interface BuildTabProps {
  playerGold: number;
  playerX: number;
  playerY: number;
}

const BUILDINGS = [
  {
    id: "lumber_mill",
    name: "Lumber Mill",
    cost: 200,
    emoji: "🪵",
    desc: "Produces Wood",
  },
  {
    id: "stone_mason",
    name: "Stone Mason",
    cost: 500,
    emoji: "🪨",
    desc: "Produces Stone",
  },
  {
    id: "smelter",
    name: "Smelter",
    cost: 1200,
    emoji: "⬟",
    desc: "Produces Ore",
  },
];

interface BuildResponse {
  success: boolean;
  buildingId?: string;
  error?: string;
}

const getOffset = () => Math.random() * 100 - 50;

export function BuildTab({ playerGold, playerX, playerY }: BuildTabProps) {
  const placeBuilding = useMutation(api.world.placeBuilding);

  const handleBuild = (b: (typeof BUILDINGS)[0]) => {
    placeBuilding({
      type: b.id,
      x: playerX + getOffset(),
      y: playerY + getOffset(),
    }).then((res: BuildResponse) => {
      if (res && "error" in res && res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Started building ${b.name}!`);
      }
    });
  };

  return (
    <TabsContent value="build" className="mt-0">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {BUILDINGS.map((b) => (
          <div
            key={b.id}
            className="flex flex-col p-3 rounded-lg border bg-blue-50/20 border-blue-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{b.emoji}</span>
              <span className="font-bold text-xs">{b.name}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mb-2">{b.desc}</p>
            <Button
              size="sm"
              className="h-7 text-[10px] bg-blue-600 hover:bg-blue-700"
              onClick={() => handleBuild(b)}
              disabled={playerGold < b.cost}
            >
              Build (${b.cost})
            </Button>
          </div>
        ))}
      </div>
    </TabsContent>
  );
}
