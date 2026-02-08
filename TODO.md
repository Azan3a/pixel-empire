# Plan: Zone-Based Map Expansion with Instanced Ownership

**TL;DR:** Expand the map to 4000×4000 with 6 distinct zones (Downtown, Suburbs, Beach/Boardwalk, Park, Industrial, Forest). Introduce instanced property ownership so multiple players can own the same building independently — each player gets their own income stream and upgrade path. Add new building types: shops (food, supplies, tools, clothing), bank, casino, police station — where bank/police/casino are public service points and shops are ownable. Replace the current random `initCity` with a zone-based procedural generator. Decompose `WorldGrid.tsx` into terrain layer components.

---

## Steps

1. Define the zone map layout

Create a new file `convex/mapZones.ts` to define zone boundaries:

| Zone                | Rough Area                        | Description                                                |
| ------------------- | --------------------------------- | ---------------------------------------------------------- |
| **Downtown**        | Center (1200–2800, 1200–2800)     | Dense commercial grid, high-value properties, bank, casino |
| **Suburbs**         | North & East bands                | Residential neighborhoods, houses, duplexes, apartments    |
| **Beach/Boardwalk** | South edge (y > 3400)             | Ocean water below, sandy beach strip, boardwalk with shops |
| **Park**            | West-center (200–1000, 1500–2800) | Open green space, paths, benches, ponds — no buildings     |
| **Industrial**      | Northwest (200–1200, 200–1200)    | Warehouses, factories, delivery hub                        |
| **Forest**          | Northeast (2800–3800, 200–1200)   | Dense trees, trails, ranger station                        |

Each zone defines: boundaries, road pattern (grid/organic/none), building density, allowed building types, terrain base color, and decoration rules.

2. Update game constants

In gameConstants.ts: change `MAP_SIZE` to 4000, add zone definitions, add new building type templates with `zoneAffinity` arrays. Add per-zone road spacing (downtown = tighter 200px grid, suburbs = wider 300px, beach = single boardwalk road, park/forest = paths only).

**3. Overhaul the property schema for instanced ownership**

Update schema.ts:

- Change `properties` table: remove `ownerId`, add `maxOwners` (number), `category` field (`"residential" | "commercial" | "service" | "shop"`), `subType` (e.g. `"food_shop"`, `"bank"`, `"casino"`, `"police"`), and `zoneId` (string).
- Add new `propertyOwnership` table: `{ propertyId, playerId, level, purchasedAt, lastCollectedAt }` indexed by `[propertyId]` and `[playerId]`. This is the instanced ownership table — multiple rows per property, one per owning player.
- Each player's income from a property is independent. Properties have a `maxOwners` field (e.g. house=5, apartment=20, mall=50) to optionally cap total owners — or set to `Infinity`-equivalent for true GTA-style uncapped ownership.

**4. New building types**

Add to the building template system in `convex/mapZones.ts` or gameConstants.ts:

| Type           | Category   | Ownable? | Zone                 | Interaction                          |
| -------------- | ---------- | -------- | -------------------- | ------------------------------------ |
| Food Shop      | shop       | Yes      | Downtown, Beach      | Buy food items (replaces menu shop)  |
| Supply Store   | shop       | Yes      | Suburbs, Industrial  | Buy supplies/tools                   |
| Clothing Store | shop       | Yes      | Downtown, Beach      | Buy cosmetics                        |
| Bank           | service    | No       | Downtown             | Deposit/withdraw cash, earn interest |
| Casino         | service    | No       | Downtown             | Gambling minigames                   |
| Police Station | service    | No       | Industrial, Downtown | Pay fines, report crimes (future)    |
| Warehouse      | commercial | Yes      | Industrial           | High income, delivery job bonuses    |
| Ranger Station | service    | No       | Forest               | Forestry jobs (future)               |

**5. Rewrite `initCity` → zone-based procedural generation**

In world.ts: replace the current flat `initCity` with a zone-aware generator:

- Iterate each zone definition
- Generate zone-appropriate road grid using zone's `roadSpacing` and `roadPattern`
- Place buildings using `getCityBlocks()` per-zone, filtered by zone's allowed types
- Place public service buildings at predefined anchor points within their zones
- Ownable buildings get procedural placement within blocks

**6. Update property buy/sell logic for instanced ownership**

In world.ts:

- `buyProperty` → insert into `propertyOwnership` table instead of patching `ownerId`. Check if player already owns this property. Optionally check `maxOwners`.
- `sellProperty` → delete from `propertyOwnership` table, refund at `SELL_RATE`.
- Add `collectIncome` mutation — player collects from all their owned properties (replaces passive income). Income could be on a cooldown (once per game-day).
- `getProperties` query should join with `propertyOwnership` to indicate "you own this" and "X players own this" for the current player.

**7. Decompose `WorldGrid.tsx` into terrain layer components**

Split WorldGrid.tsx/game/components/viewport/world/WorldGrid.tsx) into:

| New File                                   | Responsibility                                      |
| ------------------------------------------ | --------------------------------------------------- |
| `viewport/world/terrain/GrassLayer.tsx`    | Base grass fill with grid lines                     |
| `viewport/world/terrain/RoadNetwork.tsx`   | All roads, intersections, crosswalks, lane markings |
| `viewport/world/terrain/BeachTerrain.tsx`  | Sand gradient, wave animation, water                |
| `viewport/world/terrain/ParkTerrain.tsx`   | Paths, benches, ponds, flower beds                  |
| `viewport/world/terrain/ForestTerrain.tsx` | Dense tree canopy, trails                           |
| `viewport/world/terrain/Decorations.tsx`   | Trees, lamp posts, benches placed procedurally      |
| `viewport/world/terrain/MapBorder.tsx`     | Ocean/edge-of-world rendering                       |
| `viewport/world/WorldGrid.tsx`             | Slim orchestrator that composes all terrain layers  |

Each terrain component receives `tintR/G/B` and renders only its zone region using PixiJS Graphics. Memoized independently — only re-renders when ambient lighting changes.

**8. Add new `PropertyNode` variants**

Extend PropertyNode.tsx/game/components/viewport/world/PropertyNode.tsx) or create adjacent renderers:

- `ShopNode.tsx` — storefront visuals with signage, open/closed states
- `ServiceNode.tsx` — distinctive visuals for bank (columns), casino (neon), police (blue accents)
- `PropertyNode.tsx` refactored to dispatch to the right renderer based on `category`/`subType`

**9. Update the hooks layer**

- use-world.ts/game/hooks/use-world.ts): add `collectIncome`, handle new ownership queries, expose zone info.
- use-movement.ts/game/hooks/use-movement.ts): terrain-aware speed modifiers (slower on sand/forest, normal on roads, no walking in ocean). Update collision with the new 4000×4000 bounds.
- use-player.ts/game/hooks/use-player.ts): expose owned property count, income summary.
- use-food.ts/game/hooks/use-food.ts): refactor food purchasing to work via proximity to food shops (instead of the global menu).
- use-jobs.ts/game/hooks/use-jobs.ts): update `getRoadPoints()` for the new map size and zone-aware job generation.

**10. Update UI components**

- FloatingMinimap.tsx/game/components/ui/FloatingMinimap.tsx): render zone colors, show zone boundaries, handle 4000×4000 scale.
- PropertyDialog.tsx/game/components/ui/PropertyDialog.tsx): show "X players own this" instead of "OWNED", update buy/sell for instanced model.
- Header.tsx/game/components/ui/Header.tsx): show current zone name.
- menu/ShopTab.tsx/game/components/ui/menu/ShopTab.tsx): refactor to work with proximity-based shop interaction or keep as global fallback.
- Add interaction dialogs for Bank, Casino (future minigames placeholder).

**11. Update `GameCanvas.tsx` orchestrator**

In GameCanvas.tsx/game/components/viewport/GameCanvas.tsx): pass zone data to terrain components, handle new property categories in the render loop, update camera bounds for 4000px map.

---

## File Summary

| Area                   | Files to Create                                                                                                                                                                             | Files to Modify                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Zone definitions**   | `convex/mapZones.ts`                                                                                                                                                                        | gameConstants.ts                                                                           |
| **Schema + backend**   | —                                                                                                                                                                                           | schema.ts, world.ts, jobs.ts, food.ts                                                      |
| **Terrain rendering**  | `terrain/GrassLayer.tsx`, `terrain/RoadNetwork.tsx`, `terrain/BeachTerrain.tsx`, `terrain/ParkTerrain.tsx`, `terrain/ForestTerrain.tsx`, `terrain/Decorations.tsx`, `terrain/MapBorder.tsx` | `WorldGrid.tsx` (becomes orchestrator)                                                     |
| **Building rendering** | `world/ShopNode.tsx`, `world/ServiceNode.tsx`                                                                                                                                               | `PropertyNode.tsx`                                                                         |
| **Hooks**              | —                                                                                                                                                                                           | `use-world.ts`, `use-movement.ts`, `use-player.ts`, `use-food.ts`, `use-jobs.ts`           |
| **UI**                 | Bank/Casino interaction dialogs                                                                                                                                                             | `FloatingMinimap.tsx`, `PropertyDialog.tsx`, `Header.tsx`, `ShopTab.tsx`, `GameCanvas.tsx` |
| **Types**              | —                                                                                                                                                                                           | `types/property.ts` (add category, subType, maxOwners)                                     |

---

## Verification

- Run `npx convex dev` after schema changes to verify migration
- Manually test `initCity` generates buildings in correct zones with correct types
- Verify instanced ownership: two players can both buy the same property and each sees "YOURS"
- Walk through each zone boundary and confirm terrain transitions render correctly
- Check that minimap correctly shows zone colors and the 4000px world
- Confirm collision works with new terrain types (can't walk into ocean, slower on sand)
- Test job generation spread across the larger map

---

## Decisions

- **Instanced ownership over game rooms**: avoids the complexity of server sharding and keeps all players in one shared world. Properties never "run out."
- **Public service buildings**: bank, casino, police are permanent fixtures so core game services are always accessible regardless of who owns what.
- **Zone-based procedural over fully predefined**: gives a consistent, recognizable map layout (beach is always south, downtown is always center) while avoiding the tedium of placing every building by hand.
- **`propertyOwnership` join table**: cleanly separates the building (world data) from ownership instances (player data), making instanced ownership a natural database pattern.
