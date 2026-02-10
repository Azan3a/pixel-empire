Here's the proposed project structure for the 8000×8000 island map:

```
└── 📁convex
    └── 📁_generated
        ├── api.d.ts
        ├── api.js
        ├── dataModel.d.ts
        ├── server.d.ts
        ├── server.js
    │
    │  # ── Core Server Logic ──
    ├── auth.config.ts
    ├── auth.ts
    ├── crons.ts
    ├── CustomPassword.ts
    ├── food.ts
    ├── foodConfig.ts
    ├── http.ts
    ├── jobs.ts
    ├── players.ts
    ├── schema.ts
    ├── time.ts
    ├── timeConstants.ts
    ├── tsconfig.json
    ├── users.ts
    ├── world.ts
    ├── resources.ts              # NEW — resource gathering mutations (chop, mine, fish, harvest)
    ├── crafting.ts               # NEW — crafting/processing mutations
    ├── shops.ts                  # NEW — proximity shop buy/sell mutations (replaces menu shop)
    │
    │  # ── Map Data (shared server + client) ──
    └── 📁map
        ├── constants.ts          # MAP_SIZE=8000, ROAD_WIDTH, SELL_RATE, INCOME_COOLDOWN, etc.
        ├── islands.ts            # Island shape definition (coastline polygon, ocean mask)
        │
        │  # Zone master registry
        ├── zones.ts              # ZoneId enum, zone bounds, speed multipliers, zone resolver
        │
        │  # Per-zone data files (buildings, roads, resources, decorations)
        └── 📁zones
            ├── forest.ts         # Zone 1: bounds, buildings[], treeClusters[], trails[], lumberCamps[]
            ├── mountains.ts      # Zone 2: bounds, buildings[], mineDeposits[], switchbacks[]
            ├── oldtown.ts        # Zone 3: bounds, buildings[], cobblestoneGrid, townSquare
            ├── harbor.ts         # Zone 4: bounds, buildings[], docks[], fishingSpots[], pier
            ├── downtown.ts       # Zone 5: bounds, buildings[], boulevards[], intersections[]
            ├── park.ts           # Zone 6: bounds, buildings[], lake, paths[], benches[], flowerBeds[]
            ├── suburbs.ts        # Zone 7: bounds, buildings[], streets[], yards[]
            ├── commercial.ts     # Zone 8: bounds, buildings[], marketBoulevard
            ├── farmland.ts       # Zone 9: bounds, buildings[], cropPlots[], livestockPens[], barns[]
            ├── industrial.ts     # Zone 10: bounds, buildings[], factories[], warehouses[], craftingChains[]
            ├── wetlands.ts       # Zone 11: bounds, buildings[], ponds[], herbPatches[], boardwalkTrail
            ├── boardwalk.ts      # Zone 12: bounds, buildings[], promenade, pier, fishingSpots[]
            ├── beach.ts          # Zone 13: coastline strip def, shellSpawns[], accessPoints[]
            ├── smallisland.ts    # Zone 14: bounds, buildings[], treasureSpot, boatDock
            ├── river.ts          # River path segments, bridges[], fishingSpots[]
            └── lake.ts           # Lake bounds, fishingSpots[], boatDock, smallIsland
        │
        │  # Building + resource template definitions
        └── 📁templates
            ├── buildings.ts      # BuildingTemplate[], all building type defs with category/subType/size
            ├── resources.ts      # ResourceNode types (tree, ore, fish, crop, herb, shell, treasure)
            ├── craftingRecipes.ts # Recipe definitions: input items → factory → output items
            ├── fishTable.ts      # Fish species, rarity, zones, sell prices
            ├── cropTable.ts      # Crop types, grow times, yields, seasons
            └── oreTable.ts       # Ore/mineral types, yields, tool requirements
```

```
└── 📁game
    │
    │  # ── Shared Types ──
    └── 📁types
        ├── player.ts
        ├── property.ts
        ├── job.ts
        ├── resource.ts           # NEW — ResourceNode, FishingSpot, CropPlot, MineDeposit, TreeCluster
        ├── crafting.ts           # NEW — Recipe, CraftingStation, MaterialStack
        ├── zone.ts               # NEW — ZoneId, ZoneDef, ZoneVisuals (re-exports from convex/map)
        └── inventory.ts          # NEW — InventoryItem, ItemCategory, ItemDef
    │
    │  # ── Assets (static data for rendering) ──
    └── 📁assets
        │  # Tree/vegetation visual definitions
        └── 📁trees
            ├── index.ts          # Re-exports, getTreeRenderer(type)
            ├── oakTree.ts        # drawOakTree(g, x, y, size, tint) — forest/suburbs
            ├── pineTree.ts       # drawPineTree(g, x, y, size, tint) — forest/mountains
            ├── palmTree.ts       # drawPalmTree(g, x, y, size, tint) — beach/boardwalk
            ├── willowTree.ts     # drawWillowTree(g, x, y, size, tint) — park/wetlands
            ├── bushes.ts         # drawBush(g, x, y, size, tint) — various
            ├── stump.ts          # drawStump(g, x, y, size, tint) — harvested tree
            └── farmTree.ts       # drawFruitTree(g, x, y, size, tint) — farmland
        │
        │  # Decoration visual definitions
        └── 📁decorations
            ├── index.ts
            ├── bench.ts          # drawBench(g, x, y, tint)
            ├── lampPost.ts       # drawLampPost(g, x, y, tint, lit)
            ├── fountain.ts       # drawFountain(g, x, y, tint)
            ├── sign.ts           # drawSign(g, x, y, text, tint)
            ├── fence.ts          # drawFence(g, x1, y1, x2, y2, tint)
            ├── bridge.ts         # drawBridge(g, x, y, width, tint)
            ├── dock.ts           # drawDock(g, x, y, w, h, tint)
            ├── well.ts           # drawWell(g, x, y, tint)
            ├── windmill.ts       # drawWindmill(g, x, y, tint, frame)
            ├── rocks.ts          # drawRock(g, x, y, size, tint) — mountains/beach
            └── crops.ts          # drawCropPlot(g, x, y, w, h, cropType, growth, tint)
        │
        │  # Terrain texture helpers
        └── 📁terrain
            ├── index.ts
            ├── grass.ts          # drawGrassTexture(g, x, y, w, h, variant, tint)
            ├── sand.ts           # drawSandTexture(g, x, y, w, h, wet, tint)
            ├── rock.ts           # drawRockTerrain(g, x, y, w, h, tint)
            ├── dirt.ts           # drawDirtPath(g, x, y, w, h, tint)
            ├── cobblestone.ts    # drawCobblestone(g, x, y, w, h, tint)
            ├── swamp.ts          # drawSwampTexture(g, x, y, w, h, tint)
            ├── water.ts          # drawWater(g, x, y, w, h, depth, tint)
            └── snow.ts           # drawSnow(g, x, y, w, h, tint) — mountain peaks
        │
        │  # Resource node visuals
        └── 📁resources
            ├── index.ts
            ├── oreNode.ts        # drawOreNode(g, x, y, type, depleted, tint)
            ├── fishingSpot.ts    # drawFishingSpot(g, x, y, active, tint)
            ├── herbPatch.ts      # drawHerbPatch(g, x, y, type, tint)
            ├── shellSpawn.ts     # drawShell(g, x, y, type, tint)
            └── treasureSpot.ts   # drawTreasureSpot(g, x, y, dug, tint)
    │
    │  # ── Hooks ──
    └── 📁hooks
        ├── use-food.ts
        ├── use-game-time.ts
        ├── use-jobs.ts
        ├── use-keyboard.ts
        ├── use-movement.ts
        ├── use-player.ts
        ├── use-world.ts
        ├── use-resources.ts      # NEW — gathering, fishing, mining, farming interactions
        ├── use-crafting.ts       # NEW — recipe lookup, crafting station interaction
        ├── use-shop.ts           # NEW — proximity shop detection, buy/sell at physical shops
        └── use-viewport.ts       # NEW — camera bounds, viewport culling, zone visibility
    │
    │  # ── Components ──
    └── 📁components
        └── 📁ui
            └── 📁menu
                ├── ChatTab.tsx
                ├── ControlsTabs.tsx
                ├── GameMenu.tsx
                ├── InventoryTab.tsx
                ├── JobsTab.tsx
                ├── MapTab.tsx
                ├── ProfileTab.tsx
                ├── PropertiesTab.tsx
                ├── RankingsTab.tsx
                ├── CraftingTab.tsx    # NEW — recipe browser, crafting queue
                ├── ResourcesTab.tsx   # NEW — gathered resources, skill levels
            │
            │  # HUD + Dialogs
            ├── DeliveryHUD.tsx
            ├── FloatingMinimap.tsx
            ├── GameStatus.tsx
            ├── Header.tsx
            ├── Loading.css
            ├── Loading.tsx
            ├── PropertyDialog.tsx
            ├── ShopDialog.tsx
            ├── ResourceHUD.tsx        # NEW — gathering progress bar, tool durability
            ├── ZoneTransition.tsx     # NEW — zone name toast when crossing boundaries
            ├── BoatTravel.tsx         # NEW — cinematic boat ride overlay
        │
        └── 📁viewport
            │
            ├── GameCanvas.tsx
            │
            └── 📁world
                │
                │  # ── Player ──
                └── 📁player
                    └── 📁parts
                        ├── index.ts
                        ├── PlayerArms.tsx
                        ├── PlayerBadge.tsx
                        ├── PlayerHead.tsx
                        ├── PlayerLegs.tsx
                        ├── PlayerShadow.tsx
                        ├── PlayerTorso.tsx
                    ├── PlayerCharacter.tsx
                    ├── types.ts
                    ├── utils.ts
                │
                │  # ── Property/Building Rendering ──
                └── 📁property
                    └── 📁base
                        ├── commercial.ts
                        ├── drawBuildingBase.ts
                        ├── generic.ts
                        ├── industrial.ts
                        ├── residential.ts
                        ├── services.ts
                        ├── shops.ts
                        ├── resource.ts     # NEW — lumber camps, mines, barns
                        ├── farm.ts         # NEW — farmhouse, barn, silo rendering
                    └── 📁doors
                        ├── commercialDoors.ts
                        ├── drawDoorAndAccessories.ts
                        ├── residentialDoors.ts
                        ├── serviceDoors.ts
                        ├── shopDoors.ts
                    └── 📁windows
                        ├── drawWindows.ts
                        ├── industrialWindows.ts
                        ├── residentialWindows.ts
                        ├── serviceWindows.ts
                        ├── shopWindows.ts
                        ├── windowHelpers.ts
                    ├── buildingPalettes.ts
                    ├── drawBuildingBorder.ts
                    ├── drawBuildingDetails.ts
                    ├── propertyDrawHelpers.ts
                    ├── PropertyLabel.tsx
                │
                ├── PropertyNode.tsx
                ├── DeliveryMarker.tsx
                │
                │  # ── Zone Terrain Renderers (1 file per zone) ──
                └── 📁zones
                    ├── index.ts              # Zone renderer registry, getZoneRenderer(zoneId)
                    ├── ZoneLayer.tsx          # Orchestrator — renders only visible zones
                    ├── ForestZone.tsx         # Dense trees, trails, clearings, stumps
                    ├── MountainZone.tsx       # Rocky terrain, switchbacks, cliff edges, snow peaks
                    ├── OldTownZone.tsx        # Cobblestone streets, narrow roads, town square
                    ├── HarborZone.tsx         # Docks, water edge, pier, cranes
                    ├── DowntownZone.tsx       # Wide boulevards, dense grid, tall building shadows
                    ├── ParkZone.tsx           # Paths, lake, flower beds, benches, fountain
                    ├── SuburbsZone.tsx        # Named streets, lawns, yard trees, fences
                    ├── CommercialZone.tsx      # Market boulevard, signage, parking lots
                    ├── FarmlandZone.tsx        # Crop plots, dirt roads, fences, livestock pens
                    ├── IndustrialZone.tsx      # Concrete, pipes, smokestacks, loading bays
                    ├── WetlandsZone.tsx        # Swamp water, raised boardwalk, reeds, fog
                    ├── BoardwalkZone.tsx       # Plank deck, pier extension, beach transition
                    ├── BeachZone.tsx           # Sand gradient, wave foam, shells
                    ├── SmallIslandZone.tsx     # Tiny island with palms and sand
                    ├── RiverRenderer.tsx       # River path, current lines, bridges
                    └── LakeRenderer.tsx        # Lake fill, lily pads, small island, boat
                │
                │  # ── Resource Node Rendering ──
                └── 📁resources
                    ├── ResourceNode.tsx        # Generic resource node component (dispatches to type)
                    ├── TreeCluster.tsx         # Harvestable tree cluster with depletion state
                    ├── MineNode.tsx            # Ore deposit with sparkle, depletion state
                    ├── FishingSpotMarker.tsx   # Bobber animation, catch indicator
                    ├── CropPlotNode.tsx        # Growth stages, watering state, harvest-ready glow
                    ├── HerbPatchNode.tsx       # Herb patch with forage indicator
                    └── ShellNode.tsx           # Beach shell collectible
                │
                │  # ── Day/Night Overlay ──
                └── 📁daynight
                    ├── DayNightOverlay.tsx
                    ├── drawAmbientOverlay.ts
                    ├── drawBoardwalkLights.ts
                    ├── drawForestFireflies.ts
                    ├── drawIntersectionLights.ts
                    ├── drawOceanEffects.ts
                    ├── drawParkLamps.ts
                    ├── drawHarborLights.ts     # NEW — dock lights, lighthouse beam
                    ├── drawOldTownLanterns.ts   # NEW — hanging lanterns, warm glow
                    ├── drawFarmLights.ts        # NEW — barn lights, porch lights
                    ├── drawIndustrialLights.ts  # NEW — floodlights, warning beacons
                    └── drawWetlandGlow.ts       # NEW — bioluminescent swamp glow
                │
                │  # ── Shared Drawing Utilities ──
                └── 📁utils
                    ├── colorUtils.ts
                    ├── gridHelpers.ts
                    ├── tintFactory.ts
                    ├── culling.ts             # NEW — viewport frustum culling helpers
                    └── coastline.ts           # NEW — island shape test, isOnLand(x,y)
                │
                │  # ── Legacy (replaced by zones/) ──
                │  WorldGrid.tsx               # Slim orchestrator: composes ZoneLayer + river + lake
    │
    └── 📁utils                    # General client utilities
    ├── layout.tsx
    └── page.tsx
```

---

**Key architectural decisions:**

| Decision                                                              | Rationale                                                                                                                                                                                                                      |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`convex/map/` directory**                                           | All map data lives server-side in `convex/map/` — zone definitions, building positions, resource locations, crafting recipes. Shared by both server (collision, spawning, validation) and client (rendering, UI).              |
| **Per-zone data files** (`convex/map/zones/*.ts`)                     | Each zone's buildings, resources, roads, and decorations are defined in a single data file with exact coordinates. No procedural generation — the map is fixed and identical for all players.                                  |
| **Template tables** (`convex/map/templates/`)                         | Building templates, fish species, crop types, ore types, and crafting recipes defined as lookup tables. The zone data files reference these by ID.                                                                             |
| **`assets/` directory**                                               | Pure drawing functions — no React, no state. Each file exports a `draw*(g: Graphics, ...)` function. Used by zone renderers and resource nodes. Organized by category: trees, decorations, terrain textures, resource visuals. |
| **Per-zone renderers** (`components/viewport/world/zones/`)           | Each zone gets its own React component that draws its terrain, decorations, and zone-specific effects. `ZoneLayer.tsx` orchestrates which zones are visible based on camera position (viewport culling).                       |
| **`WorldGrid.tsx` becomes orchestrator**                              | Instead of one massive draw function, it composes `ZoneLayer` + `RiverRenderer` + `LakeRenderer`. Each sub-renderer only draws when in view.                                                                                   |
| **Resource node components** (`components/viewport/world/resources/`) | Each resource type (trees, mines, fishing, crops, herbs, shells) gets a dedicated PixiJS component with state (depleted, growing, harvestable) and animations.                                                                 |
| **Per-zone night lighting** (`daynight/`)                             | Each zone type gets its own lighting file — harbor dock lights, old town hanging lanterns, farm porch lights, industrial floodlights, wetland bioluminescence.                                                                 |
| **New hooks**                                                         | `use-resources` for gathering, `use-crafting` for recipes, `use-shop` for proximity shops, `use-viewport` for camera/culling.                                                                                                  |
| **`culling.ts`**                                                      | Critical for performance on an 8000×8000 map — only render zones, buildings, trees, and resources within the camera viewport.                                                                                                  |
| **`coastline.ts`**                                                    | Island shape defined as a polygon. `isOnLand(x, y)` used by movement, spawning, and rendering to enforce the island boundary instead of a simple rectangle.                                                                    |

---

**Migration path from current → new:**

| Step | What changes                                                                                                                                   |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Create `convex/map/` and move `gameConstants.ts` → `convex/map/constants.ts`, `mapZones.ts` → `convex/map/zones.ts`                            |
| 2    | Create the 14 zone data files in `convex/map/zones/` with exact building positions from the blueprints                                         |
| 3    | Create `convex/map/templates/` with building, fish, crop, ore tables                                                                           |
| 4    | Rewrite `convex/world.ts` `initCity` to read fixed positions from zone data files instead of procedural generation                             |
| 5    | Create `game/assets/` with tree, decoration, terrain, and resource drawing functions (extract from current `WorldGrid.tsx` and `drawTrees.ts`) |
| 6    | Create zone renderer components in `components/viewport/world/zones/` — start with the 6 current zones, then add the 8 new ones                |
| 7    | Replace `WorldGrid.tsx` internals with `ZoneLayer` orchestrator + viewport culling                                                             |
| 8    | Add `use-viewport.ts` hook for camera bounds and zone visibility                                                                               |
| 9    | Add resource node components and `use-resources.ts` hook                                                                                       |
| 10   | Add `convex/resources.ts`, `convex/crafting.ts`, `convex/shops.ts` server mutations                                                            |
| 11   | Update schema for resource nodes, crafting stations, crop plots                                                                                |
| 12   | Add new UI components: `ResourceHUD`, `ZoneTransition`, `CraftingTab`, `ResourcesTab`                                                          |
