# Zone 10: Industrial (4600,4600 → 6800,6600)

2200×2000 — Factories, warehouses, and processing plants. The crafting hub of the island.

```
     4600     4800     5000     5200     5400     5600     5800     6000     6200     6400     6600  6800
      |        |        |        |        |        |        |        |        |        |        |     |
4600  ═══════════════════════════════════════════════════════════════════════════════════════════════════
      ║  . . . ═══════════════════ FACTORY ROW NORTH ═══════════════════════════════════════════ . . .  ║
      ║  .  ┌──────────────┐  . .  ┌──────────────┐  . .  ┌──────────────┐  .  ┌──────────┐  . . . .  ║
4800  ║  .  │  SAWMILL     │  . .  │  SMELTER     │  . .  │  FOOD        │  .  │CHEMICAL │  . . . .  ║
      ║  .  │  FACTORY     │  . .  │  & FORGE     │  . .  │  PROCESSING  │  .  │PLANT    │  . . . .  ║
      ║  .  │  140×100     │  . .  │  120×100     │  . .  │  140×100     │  .  │100×80   │  . . . .  ║
5000  ║  .  │  comm.       │  . .  │  comm.       │  . .  │  comm.       │  .  │comm.    │  . . . .  ║
      ║  .  │  wood→planks │  . .  │  ore→ingots  │  . .  │  crops→meals │  .  │herbs→   │  . . . .  ║
      ║  .  │  →furniture  │  . .  │  →tools      │  . .  │  fish→sushi  │  .  │potions  │  . . . .  ║
5200  ║  .  └──────────────┘  . .  └──────────────┘  . .  └──────────────┘  .  └──────────┘  . . . .  ║
      ║  . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .  ║
      ║  . . . ═══════════════════ LOGISTICS AVENUE ═══════════════════════════════════════════ . . . .  ║
5400  ║  .  ┌──────────┐  .  ┌──────────┐  .  ┌──────────┐  .  ┌──────────┐  .  ┌──────────┐  . . .  ║
      ║  .  │WAREHOUSE │  .  │WAREHOUSE │  .  │WAREHOUSE │  .  │WAREHOUSE │  .  │SHIPPING │  . . .  ║
      ║  .  │ C        │  .  │ D        │  .  │ E        │  .  │ F        │  .  │HUB      │  . . .  ║
5600  ║  .  │ 80×60    │  .  │ 80×60    │  .  │ 80×60    │  .  │ 80×60    │  .  │120×80   │  . . .  ║
      ║  .  │ comm.    │  .  │ comm.    │  .  │ comm.    │  .  │ comm.    │  .  │svc      │  . . .  ║
      ║  .  │ general  │  .  │ raw mat. │  .  │ finished │  .  │ cold     │  .  │dispatch │  . . .  ║
5800  ║  .  └──────────┘  .  └──────────┘  .  └──────────┘  .  └──────────┘  .  └──────────┘  . . .  ║
      ║  . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .  ║
      ║  . . . ═══════════════════ INDUSTRIAL SOUTH ═══════════════════════════════════════════ . . . .  ║
6000  ║  .  ┌──────────────┐  . .  ┌──────────────┐  . .  ┌──────────┐  . .  ┌──────────┐  . . . . .  ║
      ║  .  │  TEXTILE     │  . .  │  ELECTRONICS  │  . .  │RECYCLING│  . .  │POWER    │  . . . . .  ║
      ║  .  │  MILL        │  . .  │  FACTORY      │  . .  │CENTER   │  . .  │STATION  │  . . . . .  ║
6200  ║  .  │  120×80      │  . .  │  120×100      │  . .  │80×60    │  . .  │100×80   │  . . . . .  ║
      ║  .  │  comm.       │  . .  │  comm.        │  . .  │svc      │  . .  │svc      │  . . . . .  ║
      ║  .  │  wool→cloth  │  . .  │  ore→circuits │  . .  │salvage  │  . .  │landmark │  . . . . .  ║
6400  ║  .  │  →clothing   │  . .  │  →gadgets     │  . .  │reclaim  │  . .  │utility  │  . . . . .  ║
      ║  .  └──────────────┘  . .  └──────────────┘  . .  └──────────┘  . .  └──────────┘  . . . . .  ║
      ║  . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .  ║
6600  ═══════════════════════════════════════════════════════════════════════════════════════════════════

KEY:
  .   Concrete/asphalt (walkable at 1.0×)
  ═   Industrial roads (heavy-duty, 48px wide)

BUILDINGS:
  Name                Type        Size       Position       Notes
  Sawmill Factory     commercial  140×100    4700,4800      Wood → Planks → Furniture
  Smelter & Forge     commercial  120×100    5100,4800      Ore → Ingots → Tools/Weapons
  Food Processing     commercial  140×100    5500,4800      Crops/Fish → Meals/Sushi
  Chemical Plant      commercial  100×80     6200,4800      Herbs → Potions/Medicine
  Warehouse C         commercial  80×60      4700,5450      General storage
  Warehouse D         commercial  80×60      5000,5450      Raw materials depot
  Warehouse E         commercial  80×60      5300,5450      Finished goods
  Warehouse F         commercial  80×60      5600,5450      Cold storage (fish, produce)
  Shipping Hub        service     120×80     6000,5450      Central dispatch, delivery bonuses
  Textile Mill        commercial  120×80     4700,6050      Wool → Cloth → Clothing
  Electronics Factory commercial  120×100    5200,6050      Ore → Circuits → Gadgets
  Recycling Center    service     80×60      5700,6050      Salvage items, reclaim materials
  Power Station       service     100×80     6100,6050      Landmark, zone power source

CRAFTING CHAINS:
  Chain               Input → Process → Output             Factory
  Lumber              Wood → Sawmill → Planks              Sawmill Factory
  Furniture           Planks → Sawmill → Furniture         Sawmill Factory
  Metal               Ore → Smelter → Ingots              Smelter & Forge
  Tools               Ingots → Forge → Tools/Axes         Smelter & Forge
  Prepared Food       Crops → Processing → Packaged Meals Food Processing
  Sushi               Fish → Processing → Sushi           Food Processing
  Potions             Herbs → Chemical → Health Potions    Chemical Plant
  Cloth               Wool → Textile → Cloth              Textile Mill
  Clothing            Cloth → Textile → Clothing Items     Textile Mill
  Circuits            Ore → Electronics → Circuit Boards   Electronics Factory
  Gadgets             Circuits → Electronics → Gadgets     Electronics Factory
```
