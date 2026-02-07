// types/job.ts
import { Id } from "@/convex/_generated/dataModel";

export interface Job {
  _id: Id<"jobs">;
  _creationTime: number;
  type: string;
  status: "available" | "accepted" | "picked_up" | "completed" | "cancelled";
  playerId?: Id<"players">;
  reward: number;
  pickupX: number;
  pickupY: number;
  dropoffX: number;
  dropoffY: number;
  pickupName: string;
  dropoffName: string;
  title: string;
  acceptedAt?: number;
  pickedUpAt?: number;
  completedAt?: number;
}
