import { Id } from "@/convex/_generated/dataModel";

export type Player = {
  _id: Id<"players">;
  _creationTime: number;
  userId: Id<"users">;
  name: string;
  x: number;
  y: number;
  gold: number;
  avatar: string;
  lastSeen: number;
};
