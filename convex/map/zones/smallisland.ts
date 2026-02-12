// convex/map/zones/smallisland.ts
// Zone 14: Small Island (7500,7100 → 7900,7500)
// 400×400 — Tiny offshore island SE of the main coast. Lighthouse, dock, rare fishing.

import type { ZoneData } from "./types";

const smallisland: ZoneData = {
  id: "smallisland",
  buildings: [
    {
      name: "Lighthouse",
      category: "service",
      subType: "lighthouse",
      x: 7700,
      y: 7300,
      width: 60,
      height: 60,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Landmark, night light beam, achievement",
    },
    {
      name: "Island Dock",
      category: "service",
      subType: "island_dock",
      x: 7600,
      y: 7150,
      width: 40,
      height: 20,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Boat arrival point, fishing spot",
    },
  ],
  roads: [
    {
      name: "Dock Path",
      x1: 7620,
      y1: 7170,
      x2: 7700,
      y2: 7300,
      style: "stone",
    },
  ],
  decorations: [
    {
      name: "Secret Cave",
      type: "cave_entrance",
      x: 7820,
      y: 7380,
      width: 30,
      height: 30,
    },
  ],
};

export default smallisland;
