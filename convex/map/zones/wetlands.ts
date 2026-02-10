// convex/map/zones/wetlands.ts
// Zone 11: Wetlands (5600,5800 → 7400,7200)
// 1800×1400 — Marshy nature reserve with rare fishing, herbs, and wildlife.

import type { ZoneData } from "./types";

const wetlands: ZoneData = {
  id: "wetlands",
  buildings: [
    {
      name: "Nature Center",
      category: "service",
      subType: "nature_center",
      x: 5900,
      y: 6200,
      width: 80,
      height: 60,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Research station, herb identification, nature quests",
    },
    {
      name: "Bird Watch Tower",
      category: "service",
      subType: "bird_watch",
      x: 7000,
      y: 6750,
      width: 30,
      height: 30,
      maxOwners: 0,
      basePrice: 0,
      baseIncome: 0,
      notes: "Binoculars, rare bird sightings, achievement",
    },
  ],
  roads: [
    {
      name: "Boardwalk Trail N",
      x1: 5800,
      y1: 6000,
      x2: 7200,
      y2: 6000,
      style: "boardwalk",
    },
    {
      name: "Boardwalk Trail S",
      x1: 5800,
      y1: 7100,
      x2: 7200,
      y2: 7100,
      style: "boardwalk",
    },
    {
      name: "Boardwalk Trail W",
      x1: 5800,
      y1: 6000,
      x2: 5800,
      y2: 7100,
      style: "boardwalk",
    },
    {
      name: "Boardwalk Trail E",
      x1: 7200,
      y1: 6000,
      x2: 7200,
      y2: 7100,
      style: "boardwalk",
    },
  ],
  decorations: [],
};

export default wetlands;
