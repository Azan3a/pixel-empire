import { Id } from "@/convex/_generated/dataModel";

export interface Tree {
  _id: Id<"trees">;
  _creationTime: number;
  x: number;
  y: number;
  growthStage: string;
  plantedAt: number;
  zoneId: string;
}
