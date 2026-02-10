// convex/map/zones/smallisland.ts
// Zone 14: Small Island (6800,6800 → 7600,7600)
// 800×800 — Tiny offshore island. Lighthouse, dock, rare fishing, secret cave.

import type { ZoneData } from "./types";

const smallisland: ZoneData = {
  id: "smallisland",
  buildings: [
    {
      name: "Lighthouse",
      category: "service",
      subType: "lighthouse",
      x: 7200,
      y: 7150,
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
      x: 7100,
      y: 6850,
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
      x1: 7100,
      y1: 6870,
      x2: 7200,
      y2: 7150,
      style: "stone",
    },
  ],
  decorations: [
    {
      name: "Secret Cave",
      type: "cave_entrance",
      x: 7350,
      y: 7300,
      width: 30,
      height: 30,
    },
  ],
};

export default smallisland;
