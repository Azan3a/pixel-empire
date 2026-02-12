# Pixel Empire

![Pixel Empire Screenshot](/public//image.png)

A modern multiplayer business simulator built with **Next.js**, **Convex**, **PixiJS**, and **Bun**. Inspired by GTA Online's economic gameplay, rendered in a persistent top-down pixel-art city.

Players enter a living city where every block is a potential asset. From running delivery jobs to becoming a real estate mogul, the goal is simple: **accumulate as much money and property as possible.**

**Core Loop:** Accept Deliveries → Earn Cash → Visit Shops → Purchase Property → Collect Income → Build an Empire.

## Vision

A fully player-driven economy with player-run businesses, corporate hiring, specialized jobs, vehicle ownership, resource gathering, and a dynamic real estate market where every building serves a purpose.

## Features

### City & World

- **4000×4000 map** with 6 zones: Downtown, Suburbs, Industrial, Forest, Central Park, and Beach/Boardwalk
- **Zone-based procedural generation** — unique terrain, building styles, property values, and decoration per district
- **Terrain variety** — sandy beaches, forested trails, park paths with ponds, industrial yards, and urban grids
- **Decorative environment** — zone-aware trees, street lights, boardwalk lamps, park lanterns, and forest fireflies at night

### Player & Movement

- **Real-time multiplayer** with throttled position sync
- **Smooth 60fps movement** with diagonal normalization and server sync every 100ms
- **Zone-based speed** — slower in sand (0.8×), forest (0.7×), and park (0.9×)
- **Pixel-art characters** with animated walk cycles, directional facing, and name badges
- **Hunger-based speed scaling** — speed decreases below 25% hunger, halves at zero
- **Ocean boundary** — players can't walk into the water

### Delivery Jobs

- **Active gameplay loop** — accept a delivery, walk to pickup, press F, walk to dropoff, press F
- **Zone-aware generation** — randomized locations with zone-specific landmark names
- **Cross-zone bonus** — deliveries spanning zones pay an extra $20 with a badge
- **Distance-scaled rewards** — longer deliveries pay more (minimum 300 units)
- **Delivery HUD** — compass arrow, live distance counter, zone tag, reward, and "Press F" prompt
- **Animated markers** — pulsing pickup (blue) and dropoff (orange) markers with rotating rings
- **Server-side validation** — proximity checks on pickup and delivery

### Hunger & Survival

- **Hunger meter** with color-coded progress bar in the header
- **Hunger decay** — walking 800 units costs 1, deliveries cost 5, manual labor costs 3
- **Food shops** — walk to in-world shops and buy food (Apple $10 → Full Meal $75), consume from inventory
- **Starvation penalties** — below 25%: slower speed. At 0%: half speed, can't work, red vignette warning

### Economy & Property

- **Instanced ownership** — multiple players independently own the same building (GTA Online style)
- **4 categories:** Residential, Commercial, Shops (Food/Supply/Clothing), and Service (Bank, Casino, etc.)
- **Owner capacity** — each building has a max owner cap with UI showing `X/Y owners`
- **Income collection** — earnings accrue on a per-game-day cooldown (20 real minutes), scale with level
- **Properties tab** — view all owned buildings, total income per cycle, one-click collect
- **Manual labor fallback** — click-based $50 job as guaranteed income

### Day/Night Cycle

- **20-minute game day** cycling through Dawn, Morning, Afternoon, Evening, Dusk, and Night
- **Ambient lighting** — smooth transitions with golden hour warmth, sunset purples, and deep night blues
- **Night effects** — building windows light up (~55%), street lights activate, moon shimmer on ocean

### UI & HUD

- **Header** — avatar, rank, cash, income collect button, hunger bar, game time with phase icon
- **Zone indicator** — current zone name pill below header
- **Floating minimap** — zone-colored terrain, roads, buildings, delivery markers, players, viewport rect
- **Game menu** — tabs for Inventory, Jobs, Properties, Rankings, Chat/Log, and Controls
- **Property dialog** — click any building for category, zone, price, income, owner count, buy/sell
- **Shop dialog** — click nearby shops for type-specific purchasing with server proximity validation

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
git clone <repo-url>
cd pixel-empire
bun install
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
├── convex/                     # Server-side game logic
│   ├── schema.ts               # DB schema (players, properties, jobs, inventory)
│   ├── mapZones.ts             # Zone definitions, building & service templates
│   ├── gameConstants.ts        # Shared constants (MAP_SIZE, roads, spawn)
│   ├── players.ts              # Player CRUD, position sync, hunger decay
│   ├── world.ts                # City generation, buy/sell, income collection
│   ├── jobs.ts                 # Delivery job lifecycle
│   ├── food.ts / foodConfig.ts # Food purchase, hunger restoration, item defs
│   ├── time.ts / timeConstants.ts # Game time, day/night cycle
│   └── ...
├── app/(protected)/game/
│   ├── components/
│   │   ├── ui/                 # HUD, Menus, Overlays
│   │   │   ├── menu/           # GameMenu, InventoryTab, JobsTab, PropertiesTab, etc.
│   │   │   ├── Header.tsx, DeliveryHUD.tsx, FloatingMinimap.tsx
│   │   │   ├── PropertyDialog.tsx, ShopDialog.tsx
│   │   │   └── Loading.tsx
│   │   └── viewport/           # PixiJS Canvas and World rendering
│   │       ├── world/          # Terrain drawing, player chars, buildings, day/night
│   │       └── GameCanvas.tsx
│   ├── hooks/                  # use-movement, use-world, use-jobs, use-food, etc.
│   └── types/                  # TypeScript interfaces
├── components/ui/              # shadcn/ui primitives
└── ...
```

## Development Roadmap

### ✅ Completed

- Persistent multiplayer movement across a 4000×4000 zone-based map (6 districts)
- Zone-aware procedural city generation with terrain variety
- Instanced property ownership with 4 categories (11 ownable templates + 4 service buildings)
- Income collection with per-game-day cooldown
- Modular building rendering with category-specific palettes
- Zone-aware delivery jobs with cross-zone bonuses and landmark names
- Day/night cycle (6 phases) with ambient lighting, window lights, street lamps, fireflies
- Hunger system with food shops and starvation penalties
- Physical shop interaction with proximity validation (Food, Supply, Clothing stores)
- Composite pixel-art player characters with walk animation and directional facing
- Zone-colored minimap, delivery HUD with compass, leaderboard
- Job cleanup cron for abandoned/stale jobs
- Clothing Store for cosmetic avatar customization
- Clean hook-based architecture

### 🔜 Next Up

- **Resource Gathering** — Lumberjacking (Forest), Fishing (Beach/Park), Farming (Suburbs)
- **Vehicles** — Cars/trucks for faster movement and larger delivery capacity
- **Multi-Parcel Deliveries** — Multiple simultaneous deliveries with route optimization bonus
- **Property Upgrades** — Level 1 → 2 → 3 with visual changes and increased income
- **Tool System** — Axes, fishing rods, farming tools purchasable at supply stores
- **NPC Vendors** — Banking, gambling mini-games, quest-giving at service buildings
- **Sound Effects** — Pickup/delivery chimes, footsteps, ambient zone sounds
- **Mobile Controls** — On-screen joystick and touch buttons
- **Chat System** — Proximity and global channels via Convex subscriptions

### 🏗️ Long-Term Vision

- Player-run businesses with pricing, stock management, and customer traffic
- Hiring system with payroll and shifts
- Crafting & manufacturing supply chains (raw materials → factory → store → consumer)
- Stock market, loans & banking, rent system
- Guilds/corporations with shared revenue and territory control
- PvP competition (hostile takeovers, price wars, competitive bidding)
- Seasonal events, procedural quests, reputation system
- Weather system affecting gameplay mechanics
- Community-voted city expansion with new districts

## Resources

- [Convex Docs](https://docs.convex.dev/) · [PixiJS API](https://pixijs.download/release/docs/index.html) · [Next.js Docs](https://nextjs.org/docs) · [shadcn/ui](https://ui.shadcn.com/)

Key changes:

- **Features sections**: Removed redundant detail and implementation specifics, kept the "what" not the "how"
- **Project Structure**: Collapsed deeply nested files into summary lines, grouped related files
- **Completed checklist**: Consolidated from 30+ checkboxes into ~14 concise bullet points
- **Next Up**: Removed sub-bullet explanations, made single-line descriptions
- **Long-Term Vision**: Collapsed to a compact bullet list without sub-details
- **Resources**: Single line instead of a list
