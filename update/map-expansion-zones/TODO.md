## Plan: Fixed Island Map Expansion (Map Only)

**TL;DR** — Migrate from a 4000×4000 procedurally generated rectangular map (6 zones) to a fixed 8000×8000 island map (14 zones + river + lake). All 87 buildings get deterministic positions using seeded placement within zone bounds from the design docs. The work is split into 7 incremental phases, each leaving the game in a working state (except Phase 3 which is a short breaking period requiring a DB reset). Viewport culling is critical for performance at 4× area.

**Steps**

### Phase 1: Server-Side Map Data Refactor (non-breaking)

New directory + files exist alongside old ones. Nothing references them yet.

1. Create `convex/map/` directory
2. Create convex/map/constants.ts — copy `MAP_SIZE`, `ROAD_SPACING`, `ROAD_WIDTH`, `SELL_RATE`, `INCOME_COOLDOWN`, spawn point from gameConstants.ts. Set `MAP_SIZE = 8000`. Define new road params per zone type (boulevard 48px, residential 40px, cobblestone 30px, farm gravel 36px, trail 20px).
3. Create convex/map/islands.ts — define the island coastline as a polygon (approximated from the ASCII art in overview.md). Export `isOnLand(x, y): boolean` and `COASTLINE_POLYGON` for both server validation and client rendering.
4. Create convex/map/zones.ts — new `ZoneId` enum/union with 14 members + `river` + `lake`. Zone bounds, speed multipliers, visual config (grass color, tree density/size, etc.), `hasRoads`, road style per zone. Export `getZoneAt(x, y)` that checks island coastline + zone bounds in priority order.
5. Create 14 per-zone data files in `convex/map/zones/` (e.g., forest.ts, downtown.ts, etc.) — each exports: zone bounds, building list with `{ name, type, category, subType, size, position, maxOwners, basePrice, baseIncome, notes }` taken from the design docs. Buildings without exact coordinates get seeded positions within the zone using a deterministic algorithm.
6. Create convex/map/zones/river.ts and convex/map/zones/lake.ts — path segments, bridge positions, width from natural_features.md.
7. Create convex/map/templates/buildings.ts — consolidated building template definitions (all categories/subTypes) with rendering hints. This replaces `BUILDING_TEMPLATES` in current mapZones.ts.

### Phase 2: World Generation Rewrite (non-breaking until deployed)

8. Create a new `initCityV2` mutation in world.ts that: imports all zone data files → iterates each zone's fixed building list → inserts into `properties` table with exact positions/sizes/prices. No procedural placement. Service buildings are included in zone data (no separate `SERVICE_BUILDINGS` array).
9. Create a `resetWorld` mutation that deletes all rows from `properties`, `propertyOwnership`, `inventory`, `jobs` tables, then calls `initCityV2`. This is the DB wipe mechanism.
10. Update schema.ts — add a `zoneId` field to the `properties` table (currently inferred at runtime). This avoids recalculating zone on every query.

### Phase 3: Server-Side Switchover (breaking — requires DB reset)

11. Update players.ts — replace references to `MAP_SIZE` from `gameConstants` → `convex/map/constants`. Replace `WATER_LINE_Y` ocean boundary with `isOnLand(x, y)` from `islands.ts`. Update `getSpawnPoint()` to new downtown center (~5200, 3800).
12. Update jobs.ts — replace `getZoneAt` import → new `convex/map/zones`. Update road-point generation for job pickup/dropoff to use zone-specific road layouts instead of the uniform grid. Update zone-aware landmark names for 14 zones.
13. Update food.ts — update any `MAP_SIZE` or zone imports to new paths.
14. Update crons.ts — no structural changes needed, just verify imports.
15. Remove old `initCity` from world.ts. Remove old `SERVICE_BUILDINGS`. Rename `initCityV2` → `initCity`.
16. Delete (or deprecate) gameConstants.ts and mapZones.ts once all imports are migrated.
17. Run `resetWorld` mutation to wipe DB and populate the fixed map.

### Phase 4: Client Hooks Migration (incremental)

18. Update use-movement.ts/game/hooks/use-movement.ts) — import `getZoneAt`, `ZONES`, `MAP_SIZE` from new `convex/map/` paths. Replace `WATER_LINE_Y` linear boundary with `isOnLand(x, y)` polygon check. Update building collision to use the full properties list (unchanged logic, just import paths).
19. Update use-world.ts/game/hooks/use-world.ts) — import zone data from new paths. Add `zoneId` to enriched property objects (read from DB field instead of computing).
20. Update use-jobs.ts/game/hooks/use-jobs.ts) — update zone imports, expand zone name/icon mapping to 14 zones.
21. Update use-game-time.ts/game/hooks/use-game-time.ts) — no changes unless ambient lighting differs per new zone (it may, for wetlands/mountains).
22. Create use-viewport.ts/game/hooks/use-viewport.ts) — new hook that tracks camera bounds (viewport rectangle in world coordinates), exposes `visibleZones: ZoneId[]` and `isInView(x, y, w, h): boolean` for culling. Used by renderers to skip off-screen zones.

### Phase 5: Rendering — Zone Renderers + Assets (biggest phase)

23. Extract reusable drawing functions from current WorldGrid.tsx/game/components/viewport/world/WorldGrid.tsx) drawing modules into `assets/` directory:
    - `assets/trees/` — `drawPineTree`, `drawOakTree`, `drawPalmTree`, `drawWillowTree`, `drawBush`, `drawStump` (extract + expand from drawTrees.ts/game/components/viewport/world/drawing/drawTrees.ts))
    - `assets/terrain/` — `drawGrass`, `drawSand`, `drawWater`, `drawCobblestone`, `drawDirt`, `drawSwamp`, `drawSnow`, `drawRock` (extract from drawZoneTerrain.ts/game/components/viewport/world/drawing/drawZoneTerrain.ts) and drawBeachAndWater.ts/game/components/viewport/world/drawing/drawBeachAndWater.ts))
    - `assets/decorations/` — `drawBench`, `drawLampPost`, `drawFountain`, `drawFence`, `drawBridge`, `drawDock`, `drawRocks` (extract from drawParkFeatures.ts/game/components/viewport/world/drawing/drawParkFeatures.ts) + new)
24. Create per-zone renderer components in `components/viewport/world/zones/`:
    - Each zone gets a `<ZoneName>Renderer.tsx` (e.g., `ForestRenderer.tsx`, `DowntownRenderer.tsx`, `MountainsRenderer.tsx`, etc.) — 14 files + `RiverRenderer.tsx` + `LakeRenderer.tsx`
    - Each renderer draws: terrain fill (using zone grass color), zone-specific decorations, trees, roads/paths/trails for that zone only
    - Start with the 6 zones that map to existing drawing logic (Downtown, Suburbs, Park, Forest, Beach → Boardwalk/Beach), then build the 8 new ones
    - Create `zones/index.ts` — registry mapping `ZoneId → renderer component`
25. Create `ZoneLayer.tsx` — wrapper component that receives `zoneId`, loads the right renderer, and conditionally renders based on `useViewport().isInView(zoneBounds)`.
26. Rewrite WorldGrid.tsx/game/components/viewport/world/WorldGrid.tsx) — replace the single monolithic `<pixiGraphics>` with a `ZoneLayer` per visible zone. Compose: island shape → ocean fill → visible zone renderers → river → lake. The component becomes a slim orchestrator.
27. Update PropertyNode.tsx/game/components/viewport/world/PropertyNode.tsx) — minimal changes (it already renders per-building). Add viewport culling: skip rendering if building is outside camera view. Expand building palettes in buildingPalettes.ts/game/components/viewport/world/property/buildingPalettes.ts) for new subTypes (cobblestone, farmhouse, warehouse, resort, etc.).
28. Update GameCanvas.tsx/game/components/viewport/GameCanvas.tsx) — integrate `useViewport` for camera bounds. Filter property nodes and other players by visibility before rendering. The camera offset logic stays the same.

### Phase 6: Day/Night + Minimap Updates

29. Expand DayNightOverlay.tsx/game/components/viewport/world/DayNightOverlay.tsx) — add per-zone night lighting for new zones: mountain campfires, old town hanging lanterns, harbor dock lights, farm porch lights, wetland bioluminescence, resort string lights. Each gets a `drawZoneNightLighting.ts` file in `daynight/`.
30. Rewrite FloatingMinimap.tsx/game/components/ui/FloatingMinimap.tsx) — replace uniform grid road drawing with zone-aware terrain colors for 14 zones. Draw island coastline (polygon outline). Draw river as a line, lake as a filled shape. Show zone name on hover/tap. Scale to 8000×8000.

### Phase 7: UI Updates + Polish

31. Update DeliveryHUD.tsx/game/components/ui/DeliveryHUD.tsx) — expand zone name/icon mapping to all 14 zones.
32. Update PropertyDialog.tsx/game/components/ui/PropertyDialog.tsx) — expand zone icon switch to 14 zones. Display `zoneId` from DB field.
33. Update ShopDialog.tsx/game/components/ui/ShopDialog.tsx) — same zone icon expansion.
34. Update Header.tsx/game/components/ui/Header.tsx) — zone indicator now uses new `getZoneAt` (via `useWorld` hook, already abstracted).
35. Create optional `ZoneTransition.tsx` — toast/pill animation when player crosses zone boundaries (nice-to-have polish).
36. Update types/property.ts/game/types/property.ts) — expand `ZoneId` import to new union type, add any new `PropertyCategory`/`PropertySubType` values (e.g., `resource` for lumber camps).

**Verification**

- After Phase 1-2: Run `npx convex dev` — new files should compile without errors. Old game still works.
- After Phase 3: Run `resetWorld` mutation via Convex dashboard. Verify `properties` table has exactly 87 rows with correct positions. Verify player spawn works at new coordinates. Game may render incorrectly until Phase 5.
- After Phase 4: Movement hook compiles, player respects island boundary, zone speed works for all 14 zones.
- After Phase 5: Visual test — walk through all 14 zones and verify terrain, trees, roads, buildings render correctly. Check FPS stays above 30 with viewport culling.
- After Phase 6: Toggle day/night via time skip, verify per-zone lighting. Open minimap, verify 14 zones + coastline + river visible.
- After Phase 7: Click buildings in each zone, verify dialog shows correct zone name/icon. Accept delivery job, verify cross-zone routing works across new zones.

**Decisions**

- **Semi-procedural placement**: Buildings with exact coordinates in design docs use those; remaining buildings get seeded positions within zone bounds using a deterministic algorithm (same result every run).
- **DB wipe at Phase 3**: All player data, property ownership, inventory, and jobs are cleared when switching to the fixed map.
- **Incremental phases**: Each phase is self-contained. Phases 1-2 are additive (no breaking changes). Phase 3 is the switchover point. Phases 4-7 restore and expand client functionality.
- **`convex/map/` as source of truth**: Both server and client import zone/building data from this directory. No duplication.
- **Viewport culling mandatory**: Without it, 8000×8000 PixiJS rendering will tank FPS. Added in Phase 4 (hook) and Phase 5 (rendering).
