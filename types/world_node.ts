import { Id } from "@/convex/_generated/dataModel";

export type WorldNode = {
  _id: Id<"world_nodes">;
  _creationTime: number;
  type: "tree" | "rock" | "ore_deposit";
  x: number;
  y: number;
  health: number;
  respawnAt?: number;
};
