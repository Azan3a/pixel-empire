import { Id } from "@/convex/_generated/dataModel";

export interface Property {
  _id: Id<"properties">;
  _creationTime: number;
  name: string;
  price: number;
  income: number;
  ownerId?: Id<"players">;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string; // "residential", "commercial", "industrial"
}
