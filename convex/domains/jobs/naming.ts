// convex/domains/jobs/naming.ts

import { getZoneAt, type ZoneId } from "../../mapZones";

/** Simple hash for deterministic naming */
export function hashCoord(x: number, y: number, seed: number): number {
  return Math.abs((x * 7919 + y * 104729 + seed * 31) % 10000);
}

/** Zone-aware landmark name prefixes */
const ZONE_PREFIXES: Record<ZoneId, string[]> = {
  downtown: [
    "Downtown",
    "Central",
    "Midtown",
    "Metro",
    "City",
    "Main St",
    "Tower",
    "Grand",
  ],
  suburbs: [
    "North",
    "South",
    "East",
    "West",
    "Maple",
    "Oak",
    "Pine",
    "Elm",
    "Cedar",
    "Birch",
  ],
  industrial: [
    "Factory",
    "Dock",
    "Freight",
    "Iron",
    "Steel",
    "Harbor",
    "Rail",
    "Yard",
  ],
  forest: [
    "Trail",
    "Ridge",
    "Creek",
    "Hollow",
    "Timber",
    "Pine",
    "Fern",
    "Moss",
  ],
  park: [
    "Garden",
    "Pond",
    "Meadow",
    "Fountain",
    "Bench",
    "Grove",
    "Lawn",
    "Hill",
  ],
  beach: ["Shore", "Pier", "Boardwalk", "Surf", "Tide", "Sand", "Cove", "Wave"],
};

const PLACES = [
  "Market",
  "Plaza",
  "Square",
  "Corner",
  "Station",
  "Depot",
  "Warehouse",
  "Terminal",
  "Hub",
  "Dock",
  "Port",
  "Block",
  "Junction",
  "Exchange",
  "Point",
  "Gate",
  "Yard",
  "Landing",
];

/** Generate a zone-aware landmark name from coordinates */
export function getLandmarkName(x: number, y: number): string {
  const zoneId = getZoneAt(x, y);
  const prefixes = ZONE_PREFIXES[zoneId];

  const h = hashCoord(x, y, 42);
  const prefix = prefixes[h % prefixes.length];
  const place = PLACES[(h >> 4) % PLACES.length];
  return `${prefix} ${place}`;
}

/** Zone-aware job titles */
const ZONE_JOB_TITLES: Record<ZoneId, string[]> = {
  downtown: [
    "Express Courier",
    "Priority Package",
    "VIP Documents",
    "Office Supplies",
    "Catering Order",
    "Legal Papers",
  ],
  suburbs: [
    "Home Delivery",
    "Grocery Run",
    "Furniture Pickup",
    "Mail Package",
    "Garden Supplies",
    "School Supplies",
  ],
  industrial: [
    "Bulk Freight",
    "Parts Delivery",
    "Equipment Haul",
    "Scrap Metal Run",
    "Chemical Transport",
    "Tool Shipment",
  ],
  forest: [
    "Ranger Supplies",
    "Trail Provisions",
    "Wildlife Package",
    "Campsite Delivery",
    "Firewood Bundle",
  ],
  park: [
    "Park Supplies",
    "Event Catering",
    "Maintenance Gear",
    "Festival Setup",
    "Gardening Tools",
  ],
  beach: [
    "Beach Supplies",
    "Surfboard Delivery",
    "Pier Goods",
    "Seafood Express",
    "Boardwalk Restock",
  ],
};

const FALLBACK_TITLES = [
  "Rush Delivery",
  "Priority Package",
  "Express Parcel",
  "Fragile Goods",
  "Urgent Documents",
  "Medical Supplies",
  "Food Delivery",
  "Electronics Shipment",
  "Antique Transport",
  "Special Cargo",
  "Overnight Express",
  "Confidential Docs",
];

/** Generate a job title based on pickup zone */
export function getJobTitle(
  seed: number,
  pickupX: number,
  pickupY: number,
): string {
  const zoneId = getZoneAt(pickupX, pickupY);
  const titles = ZONE_JOB_TITLES[zoneId] ?? FALLBACK_TITLES;
  return titles[seed % titles.length];
}
