import { Id } from "@/convex/_generated/dataModel";

export interface Player {
  _id: Id<"players">;
  _creationTime: number;
  userId: Id<"users">;
  name: string;
  x: number;
  y: number;
  gold: number;
  cash: number;
  jobTitle: string;
  avatar: string;
  lastSeen: number;
}
