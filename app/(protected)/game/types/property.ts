// types/property.ts
import { Id } from "@/convex/_generated/dataModel";
import type {
  PropertyCategory,
  PropertySubType,
  ZoneId,
} from "@/convex/mapZones";

export interface Property {
  _id: Id<"properties">;
  _creationTime: number;
  name: string;
  price: number;
  income: number;
  x: number;
  y: number;
  width: number;
  height: number;
  category: PropertyCategory;
  subType: PropertySubType;
  zoneId: ZoneId;
  maxOwners: number;
  /** Whether the current player owns this property (from joined query) */
  isOwned: boolean;
  /** Total number of players who own this property */
  ownerCount: number;
  /** Total income earned from this property by the current player */
  totalEarned?: number;
}
