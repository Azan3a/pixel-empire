# Project Structure

```bash
└── 📁app
    └── 📁(auth)
        └── 📁login
            ├── login-form.tsx
            ├── page.tsx
        └── 📁signup
            ├── page.tsx
            ├── signup-form.tsx
    └── 📁(protected)
        └── 📁game
            ├── page.tsx
        ├── layout.tsx
    ├── globals.css
    ├── layout.tsx
    └── page.tsx
```

```bash
└── 📁components
    └── 📁game
        └── 📁ui
            └── 📁bottom-panel
                ├── BottomPanel.tsx   # handles tab switching and layout
                ├── ChatTab.tsx       # Chat interface for player communication
                ├── InventoryTab.tsx  # Displays player's owned properties and assets
                ├── JobsTab.tsx       # Lists available jobs for players to take on to earn money
                ├── RankingsTab.tsx   # Shows the wealth leaderboard and player rankings
            ├── Header.tsx            # Game header bar (status, money, etc.)
            ├── Loading.tsx
        └── 📁viewport
            └── 📁world
                ├── PlayerCharacter.tsx # Renders the player's avatar and handles movement animations
                ├── PropertyNode.tsx    # Visual representation of properties on the map, showing ownership and value
                ├── WorldGrid.tsx       # Renders the city grid, including roads, buildings, and interactive zones
            └── GameCanvas.tsx          # Main game rendering canvas
    └── 📁ui
        ├── accordion.tsx
        ├── ...
    ├── ConvexClientProvider.tsx
    └── user-avatar.tsx
```

```bash
└── 📁convex
    └── 📁_generated
        ├── api.d.ts
        ├── api.js
        ├── dataModel.d.ts
        ├── server.d.ts
        ├── server.js
    ├── auth.config.ts
    ├── auth.ts
    ├── http.ts
    ├── players.ts
    ├── README.md
    ├── schema.ts
    ├── tsconfig.json
    ├── users.ts
    └── world.ts
```

```bash
└── 📁hooks
    ├── use-auto-resize-textarea.ts
    ├── use-mobile.ts
    ├── use-player.ts
    ├── use-world.ts
    └── useLocalStorage.ts
```

```bash
└── 📁types
    ├── player.ts
    └── property.ts
```
