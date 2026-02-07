# Pixel Empire

A modern multiplayer business simulator built with **Next.js**, **Convex**, **PixiJS**, and **Bun**. Inspired by the high-stakes economic gameplay of GTA Online, but rendered in a persistent top-down city world.

Players enter a living city where every block is a potential asset. From humble beginnings running delivery jobs to becoming a real estate mogul, the goal is simple: **accumulate as much money and property as possible.**

**Core Loop:** Accept Deliveries → Earn Cash → Buy Food to Survive → Purchase Property → Build an Empire.

## Vision

The long-term vision for Pixel Empire is a fully player-driven economy. We aim to support complex city-wide systems including player-run businesses, corporate hiring, specialized job roles, vehicle ownership, and a dynamic real estate market where every building serves a purpose in the global economy.

## Features

### City & World

- **Procedural City Grid** — Roads with lane markings, sidewalks, crosswalks, and intersections generated from shared constants between server and client.
- **Smart Building Placement** — Properties spawn inside city blocks between road corridors, never overlapping roads or sidewalks.
- **Decorative Environment** — Trees, street lights, grass textures, and road details bring the city to life.
- **Server-Side Collision** — AABB collision detection prevents players from walking through buildings.

### Player & Movement

- **Real-Time Multiplayer** — See other players moving around the city in real time with throttled position sync.
- **Smooth Client-Side Movement** — 60fps input loop with diagonal normalization and server sync every 100ms.
- **Detailed Player Characters** — Body shading, specular highlights, animated eyes, smile, and a name badge pill.
- **Hunger-Based Speed Scaling** — Movement speed decreases as hunger drops below 25%, halving at zero.

### Delivery Job System

- **Active Gameplay Loop** — Accept a delivery from the Jobs tab, walk to the pickup marker, press F to collect, walk to the dropoff marker, press F to deliver.
- **Dynamic Job Generation** — Jobs auto-spawn with randomized pickup/dropoff locations along roads, distance-based rewards, and generated landmark names.
- **Delivery HUD** — Compass arrow pointing to the current objective, live distance counter, and contextual "Press F" interaction prompt.
- **Animated Map Markers** — Pulsing pickup (blue) and dropoff (orange) markers with rotating dashed rings on the game world.
- **Server-Side Validation** — Proximity checks on both pickup and delivery to prevent cheating. Single active job enforced.

### Hunger & Survival

- **Hunger Meter** — Displayed in the header with emoji states (😊 → 😐 → 😫 → 💀) and a color-coded progress bar.
- **Hunger Decay** — Walking 800 units costs 1 hunger. Completing a delivery costs 5. Manual labor costs 3.
- **Food Shop** — Buy food from the header popover (Apple $10, Burger $25, Pizza $40, Full Meal $75) to restore hunger.
- **Starvation Penalties** — Below 25% hunger: speed decreases. At 0%: half speed, can't work, red vignette overlay with warning text. Below 10%: can't accept deliveries.

### Economy & Property

- **Real Estate Market** — Purchase commercial and residential properties with varied sizes and prices.
- **Building Variety** — Houses, duplexes, apartments, corner stores, offices, and malls with visual details (windows, doors, chimneys, AC units, awnings).
- **Passive Income** — Owned properties generate income scaled to building size.
- **Manual Labor Fallback** — Click-based $50 work job available as a guaranteed low-pay income source.

### UI & HUD

- **Header Bar** — Top-left pill showing avatar, rank, cash, hunger bar, and food menu.
- **Delivery HUD** — Top-right objective tracker with compass and interaction prompts.
- **Bottom Panel** — Tabbed panel with Inventory, Jobs, Rankings, and Chat tabs.
- **Leaderboard** — Global ranking by cash with top 10 display.

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

Open `http://localhost:3000`. Sign in, and you'll spawn at the first road intersection.

### Controls

| Action                    | Key                 |
| ------------------------- | ------------------- |
| Move                      | `WASD` / Arrow Keys |
| Interact (pickup/deliver) | `F`                 |
| Buy property              | Click on building   |
| Open tabs                 | Bottom panel tabs   |
| Buy food                  | 🍴 button in header |

## Project Structure

```bash
pixel-empire/
├── convex/                    # Server-side game logic
│   ├── schema.ts              # Database schema (players, properties, jobs, inventory)
│   ├── players.ts             # Player CRUD, position sync, hunger decay
│   ├── world.ts               # City generation, property purchases, work job
│   ├── jobs.ts                # Delivery job lifecycle (spawn, accept, pickup, deliver)
│   ├── food.ts                # Food purchase and hunger restoration
│   ├── gameConstants.ts       # Shared constants (road layout, map size, block calculation)
│   └── foodConfig.ts          # Food items, hunger thresholds, decay rates
├── app/                       # Next.js app router
├── components/
│   ├── game/
│   │   ├── viewport/
│   │   │   ├── GameCanvas.tsx          # Main PixiJS canvas with camera system
│   │   │   └── world/
│   │   │       ├── WorldGrid.tsx       # Roads, grass, trees, crosswalks, street lights
│   │   │       ├── PropertyNode.tsx    # Building rendering (windows, doors, roofs)
│   │   │       ├── PlayerCharacter.tsx # Player avatar with face, shading, name badge
│   │   │       └── DeliveryMarker.tsx  # Animated pickup/dropoff markers
│   │   └── ui/
│   │       ├── Header.tsx              # Top-left HUD (cash, hunger, food shop)
│   │       ├── DeliveryHUD.tsx         # Top-right delivery objective tracker
│   │       ├── FloatingMinimap.tsx     # Minimap showing nearby roads and landmarks
│   │       └── menu/
│   │           ├── GameMenu.tsx
│   │           ├── InventoryTab.tsx    # Player inventory display
│   │           ├── JobsTab.tsx         # Delivery job browser and active job tracker
│   │           ├── RankingsTab.tsx     # Leaderboard display
│   │           └── ChatTab.tsx         # Chat/log tab
│   │           └── ControlsTab.tsx
│   └── ui/                    # shadcn/ui primitives
├── hooks/
│   ├── use-player.ts          # Player state, init, position sync
│   ├── use-world.ts           # Properties, city init, buying
│   ├── use-jobs.ts            # Delivery job lifecycle
│   ├── use-food.ts            # Food purchasing
│   └── use-movement.ts        # Client-side input, collision, hunger-based speed
├── types/
│   ├── player.ts              # Player interface
│   ├── property.ts            # Property interface
│   └── job.ts                 # Job interface
└── public/                    # Static assets
```

## Development Roadmap

### ✅ Completed

- [x] Persistent player movement with real-time multiplayer sync
- [x] Procedural city generation with roads, sidewalks, and intersections
- [x] Smart building placement inside city blocks (no road overlap)
- [x] Detailed building graphics (windows, doors, chimneys, awnings)
- [x] Player characters with face, shading, and name badges
- [x] Delivery job system (accept → pickup → deliver → earn)
- [x] Animated delivery markers and compass HUD
- [x] F-key proximity interaction with server-side validation
- [x] Hunger system with food shop and starvation penalties
- [x] Speed scaling based on hunger level
- [x] Property acquisition (residential & commercial)
- [x] Manual labor fallback job
- [x] Leaderboard / ranking system
- [x] Minimap showing nearby landmarks and delivery targets
- [x] Clean hook-based architecture (use-movement, use-jobs, use-food)

### 🔜 Next Up

- [ ] **Passive Income Collection** — Periodic cash drip from owned properties (Convex cron job)
- [ ] **Job Cleanup Cron** — Auto-cancel abandoned/stale jobs after timeout
- [ ] **Sound Effects** — Pickup/delivery chimes, walking footsteps, purchase confirmation
- [ ] **Mobile Controls** — On-screen joystick and touch interaction buttons
- [ ] **Chat System** — Real-time player chat via Convex subscriptions

### 🚀 Mid-Term

- [ ] **Vehicles** — Buy cars/trucks for faster movement and larger delivery capacity
- [ ] **Multi-Parcel Deliveries** — Accept multiple deliveries simultaneously with route optimization bonus
- [ ] **Property Upgrades** — Upgrade buildings to increase income (Level 1 → 2 → 3)
- [ ] **Rent System** — Charge other players rent when they enter your property
- [ ] **NPC Vendors** — Stationary NPCs at buildings for buying supplies, food, and tools
- [ ] **Day/Night Cycle** — Visual lighting changes with time-based job availability
- [ ] **Player Inventory Expansion** — Tools, keys, supplies that affect gameplay
- [ ] **Achievement System** — Milestones for deliveries completed, cash earned, properties owned

### 🏗️ Long-Term Vision

- [ ] **Player-Run Businesses** — Open a shop, restaurant, or service that other players can patronize
- [ ] **Hiring System** — Business owners hire other players as employees with payroll
- [ ] **Stock Market** — Invest in other players' businesses, property values fluctuate
- [ ] **Loans & Banking** — Take loans to buy expensive properties, interest accrues over time
- [ ] **Crafting & Manufacturing** — Industrial properties produce goods from raw materials
- [ ] **Supply Chain** — Transport raw materials → factory → store → consumer
- [ ] **City Expansion** — Vote to expand the map, unlock new districts with different property types
- [ ] **Guilds / Corporations** — Form companies with shared revenue, territory control
- [ ] **PvP Competition** — Hostile takeovers, price wars, competitive bidding on properties
- [ ] **Seasonal Events** — Limited-time jobs, rare properties, holiday decorations
- [ ] **Procedural Quests** — Story-driven mission chains with escalating rewards
- [ ] **Reputation System** — Player ratings affect job availability and business trust

## Resources

- [Convex Documentation](https://docs.convex.dev/)
- [PixiJS API Reference](https://pixijs.download/release/docs/index.html)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
