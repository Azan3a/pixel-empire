import { Id } from "@/convex/_generated/dataModel";

export interface Building {
  _id: Id<"buildings">;
  playerId: Id<"players">;
  ownerName: string;
  type: string;
  x: number;
  y: number;
  level: number;
  lastProducedAt: number;
}
