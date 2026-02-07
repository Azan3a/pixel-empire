# Pixel Empire

A modern multiplayer business simulator built with **Next.js**, **Convex**, **PixiJS**, and **Bun**. Inspired by the high-stakes economic gameplay of GTA Online, but rendered in a persistent retro pixel world.

Players enter a living city grid where every square foot is a potential asset. From humble beginnings working entry-level jobs to becoming a real estate mogul, the goal is simple: build an empire that dominates the leaderboard.

**Core Loop:** Working Jobs → Saving Cash → Buying Property → Building an Empire.

## Vision

The long-term vision for Pixel Empire is a fully player-driven economy. We aim to support complex city-wide systems including player-run businesses, corporate hiring, specialized job roles, and a dynamic real estate market where every building serves a purpose in the global economy.

## MVP Features

- **Real-time City Grid:** Smooth, top-down movement with server-side collision detection.
- **Jobs System:** Interactive locations across the map where players can earn their first bit of capital.
- **Real Estate Ownership:** Purchase Commercial and Residential properties that generate passive income.
- **Wealth Leaderboard:** A global ranking system based on liquid cash and total asset valuation.
- **Persistent World:** Your location and assets are saved in real-time via Convex.

## Tech Stack

- **Next.js** – Frontend framework and optimized rendering.
- **Convex** – Real-time backend, database, and server-side game logic.
- **PixiJS** – GPU-accelerated 2D rendering for the city grid and player avatars.
- **Bun** – High-performance runtime and package manager.
- **Tailwind CSS** – Modern UI styling for game panels and HUDs.

## Quick Start

If you've cloned this repository:

```bash
bun install
bun run dev
```

This will start the Next.js development server at `http://localhost:3000` and the Convex background sync service.

## Project Structure

```bash
/convex          # Server-authoritative logic (jobs, property, movement)
/app             # Next.js routes and app layout
/components      # Game HUD, panels, and UI components
/components/game # PixiJS canvas and world rendering logic
/types           # Shared TypeScript interfaces for players and property
/public          # Sprites, tilesets, and static assets
```

## Development Roadmap

- [x] Persistent player movement and sync.
- [x] Basic Job system (Manual labor).
- [x] Property acquisition (Residential/Commercial).
- [ ] Industrial properties and supply chain mechanics.
- [ ] Player-to-player hiring and payroll systems.
- [ ] Proximity-based trading and interaction.

## Resources

- [Convex Documentation](https://docs.convex.dev/)
- [PixiJS API Reference](https://pixijs.download/release/docs/index.html)
- [Next.js Documentation](https://nextjs.org/docs)
