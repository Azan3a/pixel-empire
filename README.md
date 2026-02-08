# Pixel Empire

A modern multiplayer business simulator built with **Next.js**, **Convex**, **PixiJS**, and **Bun**. Inspired by the high-stakes economic gameplay of GTA Online, but rendered in a persistent top-down city world.

Players enter a living city where every block is a potential asset. From humble beginnings running delivery jobs to becoming a real estate mogul, the goal is simple: **accumulate as much money and property as possible.**

**Core Loop:** Accept Deliveries → Earn Cash → Visit Shops for Food & Supplies → Purchase Property → Collect Income → Build an Empire.

## Vision

The long-term vision for Pixel Empire is a fully player-driven economy. We aim to support complex city-wide systems including player-run businesses, corporate hiring, specialized job roles, vehicle ownership, resource gathering (lumberjacking, fishing, farming), and a dynamic real estate market where every building serves a purpose in the global economy.

## Features

### City & World

- **Massive Game World** — A 4000×4000 map featuring 6 distinct zones: Downtown, Suburbs, Industrial District, Forest, Central Park, and Beach/Boardwalk.
- **Zone-Based Procedural Generation** — Each district has unique terrain colors, building styles, property values, tree density, and decoration rules.
- **Terrain Variety** — Sandy beaches with boardwalk and ocean, forested trails, park paths with ponds, industrial yards, and dense urban grids.
- **Smart Building Placement** — Properties spawn inside city blocks, respecting zone boundaries, road corridors, and the ocean waterline.
- **Decorative Environment** — Zone-aware trees (palm trees on the beach, dense canopy in the forest), street lights at intersections, boardwalk lamps, park path lights, and forest fireflies at night.

### Player & Movement

- **Real-Time Multiplayer** — See other players moving around the city in real time with throttled position sync.
- **Smooth Client-Side Movement** — 60fps input loop with diagonal normalization and server sync every 100ms.
- **Zone-Based Speed** — Movement speed varies by terrain: normal on roads and suburbs, slower in sand (beach 0.8×), forest (0.7×), and park (0.9×).
- **Detailed Player Characters** — Composite pixel-art body parts with body shading, animated walk cycles, directional facing, and name badge pills.
- **Hunger-Based Speed Scaling** — Movement speed decreases as hunger drops below 25%, halving at zero.
- **Ocean Boundary** — Players cannot walk into the water south of the beach.

### Delivery Job System

- **Active Gameplay Loop** — Accept a delivery from the Jobs tab, walk to the pickup marker, press F to collect, walk to the dropoff marker, press F to deliver.
- **Zone-Aware Job Generation** — Jobs auto-spawn with randomized pickup/dropoff locations along roads. Landmark names reflect the zone (e.g., "Pier Dock" on the beach, "Trail Ridge" in the forest).
- **Cross-Zone Bonus** — Deliveries that span different zones pay an extra $20 reward and display a "CROSS-ZONE" badge.
- **Distance-Scaled Rewards** — Longer deliveries pay more. Minimum distance enforced at 300 units.
- **Delivery HUD** — Compass arrow pointing to the current objective, live distance counter (with `1.2k` formatting for large distances), zone tag, reward display, and contextual "Press F" interaction prompt.
- **Animated Map Markers** — Pulsing pickup (blue) and dropoff (orange) markers with rotating dashed rings on the game world.
- **Server-Side Validation** — Proximity checks on both pickup and delivery. Single active job enforced. Hunger check on acceptance.

### Hunger & Survival

- **Hunger Meter** — Displayed in the header with a color-coded progress bar.
- **Hunger Decay** — Walking 800 units costs 1 hunger. Completing a delivery costs 5. Manual labor costs 3.
- **Food System** — Walk to in-world Food Shops to buy food (Apple $10, Burger $25, Pizza $40, Full Meal $75). Click the shop building to open the shop dialog. Food goes to inventory; consume from the Inventory tab to restore hunger.
- **Starvation Penalties** — Below 25% hunger: speed decreases. At 0%: half speed, can't work, red vignette overlay with warning text. Below 10%: can't accept deliveries.

### Economy & Property

- **Instanced Property Ownership** — Multiple players can independently own the same building (GTA Online style). Each player gets their own income stream and upgrade path. Properties never "run out."
- **4 Property Categories:**
  - **Residential** — Houses, Duplexes, Apartments (found in Suburbs and Downtown)
  - **Commercial** — Corner Stores, Offices, Malls, Warehouses, Factories (Downtown and Industrial)
  - **Shops** — Food Shops, Supply Stores, Clothing Stores (ownable, found in Downtown, Beach, Suburbs, Industrial)
  - **Service** — Bank, Casino, Police Station, Ranger Station (public fixtures, not ownable)
- **Owner Capacity** — Each building has a `maxOwners` cap (e.g., House=5, Apartment=20, Mall=50). UI shows `X/Y owners`.
- **Income Collection** — Collect accumulated earnings from all owned properties. Income accrues on a per-game-day cooldown (20 real minutes). Income scales with ownership level.
- **Property Management Tab** — Dedicated "Properties" tab in the game menu showing all owned buildings, total income per cycle, and a one-click collect button.
- **Manual Labor Fallback** — Click-based $50 work job available as a guaranteed low-pay income source.

### Day/Night Cycle

- **20-Minute Game Day** — A full in-game day cycles through Dawn, Morning, Afternoon, Evening, Dusk, and Night every 20 real minutes.
- **Ambient Lighting** — Smooth color transitions: golden hour warmth, sunset purples, deep night blues. All terrain, buildings, and trees tint with the ambient light.
- **Building Window Lights** — Windows individually light up at night (~55% lit) with warm glow effects. Dusk shows partial lighting.
- **Street Lights** — Intersection corner lamps, boardwalk string lights, park path lanterns, and forest fireflies activate at night.
- **Ocean Effects** — Moon shimmer reflection on the water at night. Extra darkness overlay on ocean.

### UI & HUD

- **Header Bar** — Top-left pill showing avatar, rank, cash, property income button (with collect action), hunger bar, and game time with phase icon.
- **Zone Indicator** — Pill below the header showing the current zone name (📍 Downtown, 📍 Forest, etc.).
- **Delivery HUD** — Top-center objective tracker with compass arrow, target zone, cross-zone badge, distance, and reward.
- **Floating Minimap** — Top-right canvas minimap showing zone-colored terrain, roads, buildings (color-coded by category), delivery markers, other players, viewport rectangle, zone name, and coordinates.
- **Game Menu** — Bottom-left FAB opening a dialog with sidebar navigation:
  - **Inventory** — View and consume food items, see supplies.
  - **Jobs** — Available deliveries with zone info, cross-zone badges, and distance. Active job tracker.
  - **Properties** — Owned property list, income stats, collect button.
  - **Rankings** — Global leaderboard by cash.
  - **Chat / Log** — Placeholder for future chat system.
  - **Controls** — Key bindings reference.
- **Property Dialog** — Click any building to see category, zone, price, income, owner count, and buy/sell actions. Service buildings show a "Public" badge with no purchase option.
- **Shop Dialog** — Click a shop building when nearby to open a type-specific shop dialog. Food Shops sell food items, Supply Stores and Clothing Stores show "Coming soon". The dialog also includes property buy/sell actions. Server validates player proximity on every purchase.

## Tech Stack

| Layer     | Technology                       | Role                                         |
| --------- | -------------------------------- | -------------------------------------------- |
| Framework | **Next.js 15**                   | App router, SSR, layout system               |
| Backend   | **Convex**                       | Real-time database, mutations, queries, auth |
| Rendering | **PixiJS 8** + `@pixi/react`     | GPU-accelerated 2D game canvas               |
| Runtime   | **Bun**                          | Package management and dev server            |
| Styling   | **Tailwind CSS** + **shadcn/ui** | Game panels, HUD, overlays                   |
| Auth      | **Convex Auth**                  | Player authentication and session management |

## Quick Start

```bash
# Clone and install
git clone <repo-url>
cd pixel-empire
bun install

# Start dev server (Next.js + Convex)
bun run dev
```

Open `http://localhost:3000`. Sign in, and you'll spawn at the center of Downtown.

### Controls

| Action                    | Key                 |
| ------------------------- | ------------------- |
| Move                      | `WASD` / Arrow Keys |
| Interact (pickup/deliver) | `F`                 |
| Buy property              | Click on building   |
| Toggle menu               | `Tab`               |
| Inventory                 | `I`                 |
| Jobs                      | `J`                 |
| Properties                | `P`                 |
| Rankings                  | `R`                 |
| Chat / Log                | `L`                 |
| Controls help             | `H`                 |

## Project Structure

```bash
pixel-empire/
├── convex/                          # Server-side game logic
│   ├── schema.ts                    # Database schema (players, properties, propertyOwnership, jobs, inventory)
│   ├── mapZones.ts                  # Zone definitions, building templates, service buildings
│   ├── gameConstants.ts             # Shared constants (MAP_SIZE, roads, spawn)
│   ├── players.ts                   # Player CRUD, position sync, hunger decay
│   ├── world.ts                     # Zone-aware city generation, instanced buy/sell, income collection
│   ├── jobs.ts                      # Zone-aware delivery job lifecycle
│   ├── food.ts                      # Food purchase and hunger restoration
│   ├── foodConfig.ts                # Food item definitions and hunger constants
│   ├── time.ts                      # Server game time query
│   ├── timeConstants.ts             # Day/night cycle, ambient lighting
│   └── ...
├── app/
│   ├── (protected)/
│   │   └── game/
│   │       ├── components/
│   │       │   ├── ui/              # HUD, Menus, Overlays
│   │       │   │   ├── menu/        # GameMenu, InventoryTab, JobsTab, PropertiesTab, MapTab, etc.
│   │       │   │   ├── Header.tsx
│   │       │   │   ├── DeliveryHUD.tsx
│   │       │   │   ├── FloatingMinimap.tsx
│   │       │   │   ├── PropertyDialog.tsx
│   │       │   │   ├── ShopDialog.tsx
│   │       │   │   └── Loading.tsx
│   │       │   └── viewport/        # PixiJS Canvas and World rendering
│   │       │       ├── world/
│   │       │       │   ├── drawing/       # Modular terrain draw functions
│   │       │       │   ├── player/        # Composite player character parts
│   │       │       │   ├── property/      # Building rendering (base, doors, windows, details)
│   │       │       │   ├── utils/         # Color, grid, and tint utilities
│   │       │       │   ├── WorldGrid.tsx
│   │       │       │   ├── PropertyNode.tsx
│   │       │       │   ├── DayNightOverlay.tsx
│   │       │       │   └── DeliveryMarker.tsx
│   │       │       └── GameCanvas.tsx
│   │       ├── hooks/               # Game-specific hooks
│   │       │   ├── use-keyboard.ts  # Input handling and key state
│   │       │   ├── use-movement.ts  # Collision, zone speed, ocean boundary
│   │       │   ├── use-world.ts     # Properties, buy/sell, income, zone helpers
│   │       │   ├── use-player.ts    # Player state, inventory, ownership count
│   │       │   ├── use-jobs.ts      # Job lifecycle, zone enrichment
│   │       │   ├── use-food.ts      # Food buy/consume, inventory helpers
│   │       │   └── use-game-time.ts # Day/night cycle, ambient lighting
│   │       └── types/               # TypeScript interfaces
│   │           ├── player.ts
│   │           ├── property.ts
│   │           └── job.ts
│   └── ...
├── components/
│   └── ui/                          # shadcn/ui primitives
└── ...
```

## Development Roadmap

### ✅ Completed

- [x] Persistent player movement with real-time multiplayer sync
- [x] 4000×4000 zone-based map with 6 districts (Downtown, Suburbs, Industrial, Forest, Park, Beach)
- [x] Zone-aware procedural city generation with terrain variety
- [x] Instanced property ownership (multiple players own the same building independently)
- [x] 4 property categories: Residential, Commercial, Shop, Service
- [x] 11 ownable building templates + 4 fixed service buildings
- [x] Per-zone building templates with zone affinity
- [x] Income collection system with per-game-day cooldown
- [x] Properties tab with owned list, income stats, and collect button
- [x] Modular building rendering (category-specific palettes, sub-type details)
- [x] Zone-based terrain rendering (sand, water, forest, park paths, boardwalk)
- [x] Zone-aware movement speed (forest 0.7×, beach 0.8×, park 0.9×)
- [x] Ocean boundary collision
- [x] Zone-aware delivery jobs with cross-zone bonus rewards
- [x] Zone-specific landmark names and job titles
- [x] Day/night cycle with 6 time phases and smooth ambient transitions
- [x] Per-zone night effects (street lights, boardwalk lamps, park lanterns, forest fireflies)
- [x] Building window lighting at night
- [x] Animated delivery markers with compass HUD
- [x] F-key proximity interaction with server-side validation
- [x] Hunger system with food shop and starvation penalties
- [x] Zone-colored minimap with category-coded buildings and zone boundaries
- [x] Property dialog with owner count, category, zone, and service building handling
- [x] Modular WorldGrid drawing (terrain, roads, trees, beach, park split into drawing/ modules)
- [x] Modular PropertyNode rendering (base, doors, windows, details split into property/ modules)
- [x] Player characters with composite parts, walk animation, and directional facing
- [x] Leaderboard / ranking system
- [x] Clean hook-based architecture (use-movement, use-world, use-jobs, use-food, use-player)
- [x] **Physical Shop Interaction** — Removed global shop from the game menu. Players walk to in-world Food Shops, Supply Stores, and Clothing Stores and click them to purchase items. Shop dialog is type-specific with server-side proximity validation.

### 🔜 Next Up

- [ ] **Job Cleanup Cron** — Auto-cancel abandoned/stale jobs after timeout via Convex scheduled functions.
- [ ] **Sound Effects** — Pickup/delivery chimes, walking footsteps, purchase confirmation, zone ambient sounds.
- [ ] **Mobile Controls** — On-screen joystick and touch interaction buttons for mobile play.
- [ ] **Chat System** — Real-time player chat via Convex subscriptions with proximity and global channels.

### 🚀 Mid-Term

- [ ] **Resource Gathering**
  - **Lumberjacking** — Chop trees in the Forest zone for wood. Sell at supply stores or use for crafting.
  - **Fishing** — Cast a line from the Beach pier or Park pond. Sell fish at food shops or consume for hunger.
  - **Farming** — Rent farmland in the Suburbs. Plant, grow, and harvest crops on a timer. Sell produce or use as food ingredients.
- [ ] **Vehicles** — Buy cars/trucks for faster movement and larger delivery capacity.
- [ ] **Multi-Parcel Deliveries** — Accept multiple deliveries simultaneously with route optimization bonus.
- [ ] **Property Upgrades** — Upgrade buildings to increase income (Level 1 → 2 → 3). Visual changes reflect upgrade level.
- [ ] **Tool System** — Axes, fishing rods, farming tools required for resource gathering. Buy at supply stores.
- [ ] **NPC Vendors** — Stationary NPCs at service buildings for banking, gambling mini-games, and quest-giving.
- [ ] **Player Inventory Expansion** — Tools, raw materials, crafted goods, keys, and cosmetics.
- [ ] **Achievement System** — Milestones for deliveries completed, cash earned, properties owned, resources gathered.

### 🏗️ Long-Term Vision

- [ ] **Player-Run Businesses** — Open a shop, restaurant, or service that other players can patronize. Set prices, manage stock.
- [ ] **Hiring System** — Business owners hire other players as employees with payroll and shifts.
- [ ] **Crafting & Manufacturing** — Industrial properties produce goods from raw materials (wood → furniture, fish → sushi, crops → meals).
- [ ] **Supply Chain** — Transport raw materials → factory → store → consumer. Players fill roles at each stage.
- [ ] **Stock Market** — Invest in other players' businesses. Property and business values fluctuate based on activity.
- [ ] **Loans & Banking** — Take loans at the Bank to buy expensive properties. Interest accrues over time. Default consequences.
- [ ] **Rent System** — Charge other players rent when they enter or use your property.
- [ ] **City Expansion** — Community votes to unlock new districts with unique property types and resources.
- [ ] **Guilds / Corporations** — Form companies with shared revenue, territory control, and corporate hierarchy.
- [ ] **PvP Competition** — Hostile takeovers, price wars, competitive bidding on limited properties.
- [ ] **Seasonal Events** — Limited-time jobs, rare properties, holiday decorations, event-exclusive rewards.
- [ ] **Procedural Quests** — Story-driven mission chains with escalating rewards and narrative.
- [ ] **Reputation System** — Player ratings affect job availability, shop prices, and business trust.
- [ ] **Weather System** — Rain, storms, and seasons that affect movement speed, crop growth, and fishing yields.

## Resources

- [Convex Documentation](https://docs.convex.dev/)
- [PixiJS API Reference](https://pixijs.download/release/docs/index.html)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
