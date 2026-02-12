# Zone 4: Harbor (6400,2600 → 7600,4400)

1200×1800 — Bustling port with docks, a fish market, and shipping warehouses.

```
     6400     6600     6800     7000     7200     7400     7600
      |        |        |        |        |        |        |
2600  ════════════════════════════════════════════════════════
      ║  . . . . . . . . . . . . . . . . . . . . . . . .  ║
      ║  .  ┌────────┐  .  ┌──────────────┐  . . . . . .  ║
2800  ║  .  │HARBOR  │  .  │  CUSTOMS     │  .  . . . . .  ║
      ║  .  │MASTER  │  .  │  HOUSE       │  .  ┌──────┐ ~║~
      ║  .  │60×50   │  .  │  80×60 svc   │  .  │LIGHT │ ~║~
3000  ║  .  │svc     │  .  └──────────────┘  .  │HOUSE │ ~║~
      ║  .  └────────┘  . . . . . . . . . . . .  │40×80 │ ~║~
      ║  . . ═══════════ DOCK ROAD ══════════════ │svc   │ ~║~
3200  ║  . . . . . . . . . . . . . . . . . . . .  └──────┘ ~║~
      ║  .  ┌──────────┐  . .  ┌──────────┐  . . . . . .~~ ║
      ║  .  │ FISH     │  . .  │SHIP      │  .  ╔═PIER═══~~═╗
3400  ║  .  │ MARKET   │  . .  │SUPPLY    │  .  ║ . . .~~~~. ║
      ║  .  │ 100×60   │  . .  │ 60×50    │  .  ║ . . .~~~~. ║
      ║  .  │ shop     │  . .  │ shop     │  .  ║ [BAIT] ~~. ║
3600  ║  .  │ sell fish│  . .  │ rope,net │  .  ║  30×30 ~~. ║
      ║  .  └──────────┘  . .  └──────────┘  .  ║ . . .~~~~. ║
      ║  . . . . . . . . . . . . . . . . . . .  ╚════════~~═╝
3800  ║  . . ═══════ WAREHOUSE ROW ════════════════ . .~~~~~  ║
      ║  .  ┌──────────┐  .  ┌──────────┐  .  ┌──────┐ ~~~  ║
      ║  .  │WAREHOUSE │  .  │WAREHOUSE │  .  │COLD  │ ~~~  ║
4000  ║  .  │  A       │  .  │  B       │  .  │STORE │ ~~~  ║
      ║  .  │  80×60   │  .  │  80×60   │  .  │60×50 │ ~~~  ║
      ║  .  │  comm.   │  .  │  comm.   │  .  │comm. │ ~~~  ║
4200  ║  .  └──────────┘  .  └──────────┘  .  └──────┘ ~~~  ║
      ║  . . . . . . . . . . . . . . . . . . . . . .  ~~~~  ║
      ║  .  ┌──────────────────┐  . .  [BOAT RENTAL] .~~~~  ║
4400  ║  .  │  DRY DOCK        │  . .   50×40 svc   . ~~~~  ║
      ║  .  │  100×70 svc      │  . . . . . . . . . .~~~~  ║
      ║  .  └──────────────────┘  . . . . . . . . .~~~~~~  ║
4600  ════════════════════════════════════════════════════════

KEY:
  .   Dock planks / harbor ground (walkable at 1.0×)
  ~   Water (not walkable, fishing spots)
  ═   Main roads
  ╔╗  Pier structure (extends over water)

BUILDINGS:
  Name              Type       Size      Position       Notes
  Harbor Master     service    60×50     6500,2800      Shipping quests, port authority
  Customs House     service    80×60     6800,2800      Import/export, trade licenses
  Lighthouse        service    40×80     7200,2900      Landmark, visible across map
  Fish Market       shop       100×60    6500,3350      Sell fish, buy seafood
  Ship Supply       shop       60×50     6900,3350      Rope, nets, fishing rods, bait
  Bait Shop         shop       30×30     7200,3500      Bait, lures (on the pier)
  Warehouse A       commercial 80×60     6500,3950      Storage, shipping goods
  Warehouse B       commercial 80×60     6900,3950      Storage, bulk cargo
  Cold Storage      commercial 60×50     7200,3950      Refrigerated fish/food storage
  Dry Dock          service    100×70    6500,4400      Boat repair, future boat purchase
  Boat Rental       service    50×40     7000,4400      Rent boats for island/fishing

FISHING SPOTS (6 spots along waterfront + pier):
  Spot        Position      Fish Types              Rarity
  Pier-1      7300,3400     Cod, Mackerel           Common
  Pier-2      7350,3500     Tuna, Swordfish         Uncommon
  Pier-3      7300,3600     Lobster, Crab           Rare
  Dock-N      7500,3000     Cod, Herring            Common
  Dock-S      7500,4000     Salmon, Trout           Uncommon
  Deep-1      7500,3500     Shark, Marlin           Legendary
```
