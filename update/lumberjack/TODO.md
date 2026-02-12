# TODO

## Plan: Lumberjacking — Interactive Trees in Forest Zone

Players will encounter trees as physical, server-persisted objects in the forest zone. Trees block movement, grow through 4 stages (seedling → sapling → young → mature), can be chopped with a purchased axe via a timed progress bar, yield wood, and the wood can be sold for cash at the Ranger Station (which already exists at 3060,560 in the forest). Trees respect building exclusion zones so they never spawn on/near structures.

**Steps**

### Phase 1 — Backend Config & Schema

1. **Create convex/treeConfig.ts** — new config file following the foodConfig.ts pattern. Define:
   - `TREE_GROWTH_STAGES` dictionary: `seedling` (size 6, 0 wood), `sapling` (size 10, 1 wood), `young` (size 14, 2 wood), `mature` (size 18, 4 wood) — each with `key`, `name`, `size` (collision radius in px), `woodYield`, `emoji`, `growthTimeMs` (real-time to reach next stage, e.g. 5/10/15 min)
   - `TREE_GROWTH_ORDER`: `['seedling', 'sapling', 'young', 'mature']`
   - `AXE_ITEM`: `{ key: 'axe', name: 'Axe', price: 50, emoji: '🪓', category: 'tool', chopTimeMs: 3000 }` — single axe type, 3 seconds to chop
   - `WOOD_ITEM`: `{ key: 'wood', name: 'Wood', emoji: '🪵', category: 'resource', sellPrice: 15 }`
   - `TREE_INTERACT_RADIUS = 80` — max distance to start chopping (tighter than shop's 120)
   - `TREE_SPAWN_BUILDING_MARGIN = 40` — exclusion zone around buildings
   - `TREE_SPAWN_SPACING = 60` — min distance between trees
   - `MAX_FOREST_TREES = 80` — max tree count in forest zone
   - `TREE_REGROW_DELAY_MS` — delay before a stump location can respawn a seedling

2. **Update schema.ts** — add a `trees` table:
   - Fields: `x: number`, `y: number`, `growthStage: string` (one of the 4 stage keys), `plantedAt: number` (timestamp when current stage started), `health: number` (chop damage remaining, derived from stage), `zoneId: string`
   - Indexes: `by_zone` (for querying forest trees), `by_position` (for spatial queries)

### Phase 2 — Backend Mutations & Queries

3. **Create convex/trees.ts** — mutation/query file following the `food.ts` pattern:
   - `query getForestTrees` — returns all trees (clients need positions for rendering + collision)
   - `mutation initForestTrees` — procedural placement of initial trees in the forest zone. Uses `seededRandom` (like `world.ts`), checks against all `properties` for building margin exclusion, ensures `TREE_SPAWN_SPACING` between trees, avoids water line. Only runs if tree count < threshold.
   - `mutation chopTree` — auth + player lookup + proximity check (`TREE_INTERACT_RADIUS`) + axe in inventory check + delete tree from DB + add wood to inventory (upsert pattern from `food.ts`) + return result for toast
   - `mutation sellWood` — auth + player lookup + proximity to Ranger Station check + wood in inventory check + deduct wood, add cash (wood quantity × `sellPrice`)
   - `mutation buyAxe` — auth + player lookup + proximity to Ranger Station/supply store + cash check + deduct cash, add axe to inventory
   - `internalMutation growTrees` — iterate all trees, advance stage if `Date.now() - plantedAt >= growthTimeMs` for current stage, skip mature trees. Reset `plantedAt` on promotion.
   - `internalMutation spawnNewTrees` — if total tree count < `MAX_FOREST_TREES`, spawn seedlings at valid positions (away from buildings, other trees, roads). This replaces chopped trees over time.

4. **Update crons.ts** — add two new cron intervals:
   - `"grow trees"` — every 2 minutes, calls `internal.trees.growTrees`
   - `"spawn trees"` — every 5 minutes, calls `internal.trees.spawnNewTrees`

5. **Update world.ts** — call `initForestTrees` in `initCity` (or trigger it after city init) so trees are placed alongside buildings. In `resetWorld`, also delete all entries in the `trees` table.

### Phase 3 — Frontend Hook & State

6. **Create app/(protected)/game/hooks/use-trees.ts/game/hooks/use-trees.ts)** — following `use-food.ts` pattern:
   - `useQuery(api.trees.getForestTrees)` — reactive tree data
   - `chopTree(treeId)` mutation wrapper with toast ("Chopped tree! +4 wood 🪵")
   - `sellWood(quantity)` mutation wrapper with toast
   - `buyAxe()` mutation wrapper with toast
   - `isChopping` state + `choppingProgress` (0–1) for progress bar UI
   - `startChopping(treeId)` — validates proximity + axe in inventory client-side, starts a timer (`AXE_ITEM.chopTimeMs`), on completion calls `chopTree` mutation
   - `cancelChopping()` — player moves or presses escape → cancels timer

### Phase 4 — Collision Integration

7. **Update app/(protected)/game/hooks/use-movement.ts/game/hooks/use-movement.ts)** — add tree collision:
   - Accept `trees` array (from `useTrees`) as a new parameter/ref (use `useRef` for performance, like `propertiesRef`)
   - In the collision check section (after building AABB), add circular collision for trees: player AABB vs tree circle (center `x,y`, radius = `stage.size / 2`). Seedlings (size 6) won't block; sapling+ will.
   - Only collide with trees whose `growthStage !== 'seedling'` (seedlings are too small to block)

### Phase 5 — Rendering

8. **Create app/(protected)/game/components/viewport/world/TreeNode.tsx/game/components/viewport/world/TreeNode.tsx)** — interactive PixiJS tree component (similar to `PropertyNode.tsx`):
   - Renders tree at `x,y` with size/shape varying by `growthStage` (reuse `drawCanopyTree` style from drawTrees.ts but as an interactive `pixiContainer`)
   - `onPointerTap` → triggers chopping logic via callback
   - Visual indicator for choppable range (subtle highlight when player is near)
   - Shows growth stage label on hover

9. **Create app/(protected)/game/components/viewport/world/ChopProgressBar.tsx/game/components/viewport/world/ChopProgressBar.tsx)** — floating progress bar component:
   - Positioned above the tree being chopped
   - Animated fill bar over `chopTimeMs` duration
   - Disappears when chopping completes or is cancelled

10. **Update app/(protected)/game/components/viewport/world/drawing/drawTrees.ts/game/components/viewport/world/drawing/drawTrees.ts)** — skip drawing decorative trees in the forest zone (since they're now replaced by interactive `TreeNode` objects). Keep decorative trees in park/suburbs/beach unchanged.

11. **Update app/(protected)/game/components/viewport/GameCanvas.tsx/game/components/viewport/GameCanvas.tsx)**:
    - Import and call `useTrees()` hook
    - Pass `trees` array to `useMovement` for collision
    - Render `TreeNode` components for each tree (between `WorldGrid` and `PropertyNode` in the render order so they layer correctly)
    - Render `ChopProgressBar` when `isChopping` is true
    - Add tree click handler that calls `startChopping(treeId)`

### Phase 6 — UI & Shop Integration

12. **Create app/(protected)/game/components/ui/TreeDialog.tsx/game/components/ui/TreeDialog.tsx)** — dialog shown when clicking a tree (if in range):
    - Shows tree info (growth stage, wood yield)
    - "Chop" button (disabled if no axe, shows "Need an axe!" message)
    - Progress bar during chopping

13. **Update app/(protected)/game/components/ui/ShopDialog.tsx/game/components/ui/ShopDialog.tsx)** — extend the shop dialog for the Ranger Station (`subType: 'ranger_station'`):
    - Add a "Lumberjack" tab/section showing:
      - Buy Axe button (price, owned count)
      - Sell Wood button (quantity held, total cash value)
    - OR create a separate `RangerStationDialog.tsx` if the shop dialog gets too complex

14. **Update app/(protected)/game/components/ui/menu//game/components/ui/menu/)** — the inventory tab should display wood and axe items properly with their emojis and quantities (this likely works already since inventory uses generic `item` strings, but verify the display handles tool/resource categories).

### Phase 7 — Minimap & Polish

15. **Update app/(protected)/game/components/ui/FloatingMinimap.tsx/game/components/ui/FloatingMinimap.tsx)** — optionally render tree dots in the forest zone area (small green dots) so players can see tree density.

16. **Update mapZones.ts** — if the Ranger Station's `subType` is not already `'ranger_station'`, update the service building definition to use that subType so the shop dialog can detect it. Currently it's `subType: "ranger_station"` — verify this.

**Verification**

- Run `npx convex dev` to validate schema changes compile
- Create a test: spawn trees via `initForestTrees`, verify none overlap with buildings (check all tree positions against property bounds + margin)
- Manual test: navigate to forest zone, verify trees render and block movement
- Manual test: buy axe at Ranger Station, chop a tree, verify wood appears in inventory
- Manual test: sell wood at Ranger Station, verify cash increases
- Wait for cron tick, verify trees grow (seedling → sapling visible size change)
- Verify chopped trees eventually respawn as seedlings (after spawn cron runs)
- Verify seedlings don't block player movement but sapling+ does

**Decisions**

- **New `trees` table** over reusing `properties`: cleaner separation, avoids polluting building queries with tree data
- **Single axe type**: keeps initial implementation simple; can add tiers later
- **Forest zone only**: focused scope; park/suburbs/beach keep decorative trees
- **4 growth stages**: seedling (no collision, 0 wood) → sapling → young → mature (full collision, 4 wood)
- **Timed chopping (3s)**: adds gameplay feel without being tedious
- **Ranger Station as shop**: already exists in forest, repurpose for axe purchases and wood selling
- **Circular tree collision**: simpler than AABB for round objects, cheaper to compute

---

Shall I refine anything, or does this plan look good to write into the TODO.md?
