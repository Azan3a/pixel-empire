# Pixel Empire

A real-time multiplayer pixel art business simulator built with **Next.js**, **Convex**, **PixiJS**, and **Bun**.

Players join a shared persistent world to gather resources, trade with others, sell on a global market, and climb the wealth leaderboard. The MVP focuses on a core loop of resource collection → trading → progression, with real-time player movement and proximity interactions.

Long-term vision: an open-ended economy with player-run businesses, hiring, roles, and empire-building — think Stardew Valley co-op meets Virtonomics, with a retro pixel aesthetic.

## Tech Stack

- **Next.js** – Frontend framework and optimized hosting
- **Convex** – Real-time backend, database, server functions, and authentication
- **PixiJS** – GPU-accelerated 2D rendering for smooth pixel art sprites and animations
- **Tailwind CSS** – Rapid UI styling
- **Bun** – Fast runtime and package manager
- **Convex Auth** – Secure user authentication (already configured)

## Quick Start

If you cloned this repo:

```bash
bun install
bun run dev
```

This starts the Next.js dev server at `http://localhost:3000` and the Convex dev backend.

## Project Setup Notes

### Convex Backend

Your Convex functions, schema, and auth config live in the `/convex` folder.

- To push schema or functions: `npx convex dev`
- To deploy to production: `npx convex deploy`

### Adding PixiJS (if not already installed)

```bash
bun add pixi.js @pixi/react
```

PixiJS is used in the main game canvas for rendering the top-down world, player avatars, and resource nodes.

### Optional: Shadcn UI Components

If you want pre-built accessible UI components (buttons, modals, etc.):

```bash
bunx --bun shadcn@latest init
bunx --bun shadcn@latest add --all   # or add individual components
```

### Environment Variables

Convex Auth requires a few env vars (set via the Convex dashboard or locally):

- `NEXT_PUBLIC_CONVEX_URL` – your deployed Convex URL
- `SITE_URL` – e.g., http://localhost:3000 during dev

These are prompted and configured when you run `npx @convex-dev/auth configure`.

## Folder Structure Highlights

```
/convex          # Convex schema, queries, mutations, server functions
/app             # Next.js pages and layout
/components      # React components (game canvas, HUD panels, UI)
/public/assets   # Pixel art sprites, tilesets, etc.
/lib             # Shared utilities
```

## Development Tips

- Real-time player sync and world state use Convex reactive queries.
- Game logic (collecting resources, market transactions) is server-authoritative via Convex mutations.
- Map rendering: PixiJS viewport in the main game screen component.
- Auth flow: players are auto-created on first login with default avatar and starting balance.

## MVP Features (Current)

- Authenticated login
- Shared top-down pixel art world with real-time player movement
- Resource nodes (Wood, Stone, Ore)
- Inventory and money system
- Global market with simple dynamic pricing
- Leaderboard ranked by net worth

Planned next: proximity chat, direct player-to-player trading, upgrades shop.

## Resources & Learning

- [Convex Docs](https://docs.convex.dev/)
- [Convex Auth](https://labs.convex.dev/auth)
- [Stack by Convex – Multiplayer Game Examples](https://stack.convex.dev/)
- [PixiJS Docs](https://pixijs.com/)
- [Next.js Docs](https://nextjs.org/docs)

## Community

- Join the [Convex Discord](https://convex.dev/community) for real-time help
- Report issues or contribute on GitHub

Happy building your pixel empire! 🚀
