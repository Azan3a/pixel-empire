// types/player.ts
import { Id } from "@/convex/_generated/dataModel";

export interface Player {
  _id: Id<"players">;
  _creationTime: number;
  userId: Id<"users">;
  name: string;
  x: number;
  y: number;
  cash: number;
  jobTitle: string;
  avatar: string;
  lastSeen: number;
  hunger?: number;
  walkDistance?: number;
}
