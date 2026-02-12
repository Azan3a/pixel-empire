# Lumberjacking Update — Implementation Plan

Players encounter trees as physical, server-persisted objects in the **forest zone**. Trees block movement (except seedlings), grow through 4 stages, can be chopped with a purchased axe (3s progress bar), yield wood, and wood is sold for cash at the Ranger Station.

---

## Key Decisions

- **New `trees` table** — clean separation from properties
- **Forest zone only** — park/suburbs/beach keep decorative-only trees
- **4 growth stages** — seedling (no collision, 0 wood) → sapling → young → mature
- **Single axe type** — buy at Ranger Station, 3s chop time
- **Circular collision** — simpler than AABB for round tree trunks
- **Sell wood for cash** at Ranger Station (already in forest at 3060,560)

---

## Phase 1 — Backend Config & Schema

### 1.1 Create `convex/treeConfig.ts`

- [ ] Define `TREE_GROWTH_STAGES` dict: `seedling`, `sapling`, `young`, `mature`
  - Each: `key`, `name`, `size` (collision radius px), `woodYield`, `emoji`, `growthTimeMs`
  - Sizes: 6 / 10 / 14 / 18 — yields: 0 / 1 / 2 / 4
  - Growth times (real ms): 5 min / 10 min / 15 min / ∞ (mature is final)
- [ ] Define `TREE_GROWTH_ORDER`: `['seedling', 'sapling', 'young', 'mature']`
- [ ] Define `AXE_ITEM`: `{ key, name, price: 50, emoji: '🪓', chopTimeMs: 3000, category: 'tool' }`
- [ ] Define `WOOD_ITEM`: `{ key, name, emoji: '🪵', sellPrice: 15, category: 'resource' }`
- [ ] Constants: `TREE_INTERACT_RADIUS = 80`, `TREE_SPAWN_BUILDING_MARGIN = 40`, `TREE_SPAWN_SPACING = 60`, `MAX_FOREST_TREES = 80`, `TREE_REGROW_DELAY_MS = 600000` (10 min)

### 1.2 Update `convex/schema.ts`

- [ ] Add `trees` table:
  ```
  x: v.number()
  y: v.number()
  growthStage: v.string()    // "seedling" | "sapling" | "young" | "mature"
  plantedAt: v.number()      // timestamp when current stage started
  zoneId: v.string()
  ```
- [ ] Add indexes: `by_zone` on `["zoneId"]`

---

## Phase 2 — Backend Mutations & Queries

### 2.1 Create `convex/trees.ts`

- [ ] `query getForestTrees` — returns all trees (position, stage, id) for rendering + collision
- [ ] `mutation initForestTrees` — procedural placement using `seededRandom` (like `world.ts`)
  - Only spawns if tree count < threshold
  - Checks against all `properties` for `TREE_SPAWN_BUILDING_MARGIN` exclusion
  - Enforces `TREE_SPAWN_SPACING` between trees
  - Stays within forest zone bounds, avoids water line
  - All trees start as `mature` on world init (feels like existing forest)
- [ ] `mutation chopTree(treeId)` — auth → player lookup → proximity check → axe in inventory check → delete tree → upsert wood into inventory → return result
- [ ] `mutation sellWood(quantity)` — auth → player lookup → proximity to Ranger Station → wood in inventory check → deduct wood → add cash (`quantity × sellPrice`)
- [ ] `mutation buyAxe` — auth → player lookup → proximity to Ranger Station → cash check → deduct cash → add axe to inventory
- [ ] `internalMutation growTrees` — iterate all non-mature trees, advance stage if `Date.now() - plantedAt >= growthTimeMs`, reset `plantedAt` on promotion
- [ ] `internalMutation spawnNewTrees` — if total count < `MAX_FOREST_TREES`, spawn seedlings at valid positions (away from buildings, other trees). Respawns chopped trees over time.

### 2.2 Update `convex/crons.ts`

- [ ] Add cron: `"grow trees"` — every 2 minutes → `internal.trees.growTrees`
- [ ] Add cron: `"spawn trees"` — every 5 minutes → `internal.trees.spawnNewTrees`

### 2.3 Update `convex/world.ts`

- [ ] In `initCity`: call `initForestTrees` after properties are placed
- [ ] In `resetWorld`: delete all documents in the `trees` table

---

## Phase 3 — Frontend Hook

### 3.1 Create `app/(protected)/game/hooks/use-trees.ts`

- [ ] `useQuery(api.trees.getForestTrees)` — reactive tree data
- [ ] `chopTree(treeId)` — mutation wrapper with toast ("Chopped tree! +N wood 🪵")
- [ ] `sellWood(quantity)` — mutation wrapper with toast
- [ ] `buyAxe()` — mutation wrapper with toast
- [ ] Chopping state: `isChopping`, `choppingTreeId`, `choppingProgress` (0–1)
- [ ] `startChopping(treeId)` — validates proximity + axe client-side, starts timer (`chopTimeMs`), on completion calls `chopTree` mutation
- [ ] `cancelChopping()` — player moves or presses Escape → cancels timer, resets state

---

## Phase 4 — Collision

### 4.1 Update `app/(protected)/game/hooks/use-movement.ts`

- [ ] Accept `trees` array as new parameter (via ref for perf, like `propertiesRef`)
- [ ] After building AABB check, add circular collision for trees:
  - Player AABB vs tree circle (center `x,y`, radius = `stage.size / 2`)
  - Skip `seedling` stage (too small to block)
  - Reject entire movement if colliding (same pattern as buildings)

---

## Phase 5 — Rendering

### 5.1 Create `app/(protected)/game/components/viewport/world/TreeNode.tsx`

- [ ] Interactive PixiJS tree component (like `PropertyNode.tsx`)
- [ ] Render tree at `x,y` with size/shape varying by `growthStage`
  - Reuse canopy-style drawing from `drawTrees.ts` but as `pixiContainer`
  - Seedling = small sprout, sapling = thin trunk + small canopy, young = medium, mature = full
- [ ] `onPointerTap` → triggers tree click callback
- [ ] Subtle glow/highlight when player is within `TREE_INTERACT_RADIUS`

### 5.2 Create `app/(protected)/game/components/viewport/world/ChopProgressBar.tsx`

- [ ] Floating progress bar positioned above the tree being chopped
- [ ] Animated fill over `chopTimeMs` duration
- [ ] Disappears when chopping completes or is cancelled

### 5.3 Update `app/(protected)/game/components/viewport/world/drawing/drawTrees.ts`

- [ ] Skip decorative tree drawing in the **forest zone** (replaced by interactive `TreeNode`)
- [ ] Keep decorative trees in park, suburbs, beach unchanged

### 5.4 Update `app/(protected)/game/components/viewport/GameCanvas.tsx`

- [ ] Import and call `useTrees()` hook
- [ ] Pass `trees` to `useMovement` for collision
- [ ] Render `TreeNode` components between `WorldGrid` and `PropertyNode` (correct z-order)
- [ ] Render `ChopProgressBar` when `isChopping === true`
- [ ] Handle tree click → open `TreeDialog` or start chopping

---

## Phase 6 — UI & Shop

### 6.1 Create `app/(protected)/game/components/ui/TreeDialog.tsx`

- [ ] Shown when clicking a tree within range
- [ ] Displays: tree growth stage, wood yield, emoji
- [ ] "Chop" button (disabled if no axe → shows "You need an axe!")
- [ ] During chopping: shows progress bar, "Cancel" button

### 6.2 Update `app/(protected)/game/components/ui/ShopDialog.tsx`

- [ ] Detect Ranger Station via `subType === 'ranger_station'`
- [ ] Add "Lumberjack" section in Ranger Station shop:
  - Buy Axe: price, current quantity owned
  - Sell Wood: quantity held, price per unit, total value, sell button

### 6.3 Verify inventory display

- [ ] Check `app/(protected)/game/components/ui/menu/` inventory tab renders wood (🪵) and axe (🪓) items with correct emojis/quantities
- [ ] Add tool/resource category styling if needed

---

## Phase 7 — Minimap & Polish

### 7.1 Update `app/(protected)/game/components/ui/FloatingMinimap.tsx`

- [ ] Render small green dots for trees in the forest zone area
- [ ] Scale dot size by growth stage (optional)

### 7.2 Verify `convex/mapZones.ts`

- [ ] Confirm Ranger Station `subType` is `'ranger_station'` (used by shop dialog detection)

---

## Verification Checklist

- [ ] `npx convex dev` compiles without errors after schema change
- [ ] `initForestTrees` spawns trees — none overlap with buildings (check bounds + margin)
- [ ] Trees render in forest zone, decorative trees removed from forest only
- [ ] Trees block player movement (sapling+ sizes)
- [ ] Seedlings don't block movement
- [ ] Buy axe at Ranger Station → appears in inventory
- [ ] Click tree within range → TreeDialog opens
- [ ] Chop tree (3s progress bar) → tree disappears → wood in inventory
- [ ] Cancel chopping (move/Escape) → progress resets
- [ ] Sell wood at Ranger Station → cash increases
- [ ] Cron: trees grow stages over time (seedling → sapling visible)
- [ ] Cron: new seedlings spawn to replace chopped trees
- [ ] Trees never spawn on/near buildings
- [ ] Minimap shows tree dots in forest

---

## File Summary

| #   | File                                                                  | Action                                         |
| --- | --------------------------------------------------------------------- | ---------------------------------------------- |
| 1   | `convex/treeConfig.ts`                                                | **Create**                                     |
| 2   | `convex/schema.ts`                                                    | **Update** — add `trees` table                 |
| 3   | `convex/trees.ts`                                                     | **Create**                                     |
| 4   | `convex/crons.ts`                                                     | **Update** — add tree growth + spawn crons     |
| 5   | `convex/world.ts`                                                     | **Update** — init trees + reset trees          |
| 6   | `app/(protected)/game/hooks/use-trees.ts`                             | **Create**                                     |
| 7   | `app/(protected)/game/hooks/use-movement.ts`                          | **Update** — add tree collision                |
| 8   | `app/(protected)/game/components/viewport/world/TreeNode.tsx`         | **Create**                                     |
| 9   | `app/(protected)/game/components/viewport/world/ChopProgressBar.tsx`  | **Create**                                     |
| 10  | `app/(protected)/game/components/viewport/world/drawing/drawTrees.ts` | **Update** — skip forest zone                  |
| 11  | `app/(protected)/game/components/viewport/GameCanvas.tsx`             | **Update** — integrate trees                   |
| 12  | `app/(protected)/game/components/ui/TreeDialog.tsx`                   | **Create**                                     |
| 13  | `app/(protected)/game/components/ui/ShopDialog.tsx`                   | **Update** — Ranger Station lumberjack section |
| 14  | `app/(protected)/game/components/ui/FloatingMinimap.tsx`              | **Update** — tree dots                         |
| 15  | `convex/mapZones.ts`                                                  | **Verify** — Ranger Station subType            |
