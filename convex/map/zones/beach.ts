// convex/map/zones/beach.ts
// Zone 13: Beach (6800,4600 → 7800,7200)
// 1000×2600 — Sandy coastline. Casual tourism, surfing, volleyball.

import type { ZoneData } from "./types";

const beach: ZoneData = {
  id: "beach",
  buildings: [
    {
      name: "Beach Club",
      category: "commercial",
      subType: "beach_club",
      x: 7000,
      y: 4900,
      width: 80,
      height: 60,
      maxOwners: 15,
      basePrice: 8000,
      baseIncome: 180,
      notes: "Bar, lounge, music events",
    },
    {
      name: "Volleyball Court A",
      category: "service",
      subType: "volleyball_court",
      x: 7200,
      y: 5400,
      width: 40,
      height: 30,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Free play, tournaments",
    },
    {
      name: "Volleyball Court B",
      category: "service",
      subType: "volleyball_court",
      x: 7200,
      y: 5600,
      width: 40,
      height: 30,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Free play, tournaments",
    },
    {
      name: "Beach Rental",
      category: "shop",
      subType: "beach_rental",
      x: 7100,
      y: 6000,
      width: 50,
      height: 30,
      maxOwners: 10,
      basePrice: 3000,
      baseIncome: 60,
      notes: "Umbrellas, towels, chairs",
    },
    {
      name: "Surf Shop",
      category: "shop",
      subType: "surf_shop",
      x: 7100,
      y: 6500,
      width: 50,
      height: 40,
      maxOwners: 10,
      basePrice: 4000,
      baseIncome: 80,
      notes: "Surfboards, wetsuits",
    },
  ],
  roads: [
    {
      name: "Beach Path",
      x1: 6900,
      y1: 4700,
      x2: 6900,
      y2: 7100,
      style: "stone",
    },
  ],
  decorations: [
    {
      name: "Palm Trees North",
      type: "palm_cluster",
      x: 7400,
      y: 4800,
      width: 60,
      height: 40,
    },
    {
      name: "Palm Trees South",
      type: "palm_cluster",
      x: 7400,
      y: 6800,
      width: 60,
      height: 40,
    },
    {
      name: "Lifeguard Tower",
      type: "lifeguard_tower",
      x: 7500,
      y: 5800,
      width: 20,
      height: 20,
    },
  ],
};

export default beach;
