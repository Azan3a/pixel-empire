# Map Expansion: Island Overview

## Island Map

         0    1k   2k   3k   4k   5k   6k   7k  8k
         |    |    |    |    |    |    |    |    |

    0 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    0.4 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    0.8 ~~~~~~~~~~~~~......M.....~~~~~~~~~~~~~~~
    1.2 ~~~~~~~~~~..FFFFF.MMMMM....~~~~~~~~~~~~~
    1.6 ~~~~~~~~..FFFFFFFMMMMMMMMM..~~~~~~~~~~~~
    2.0 ~~~~~~~.FFFFFFFFMMMMMMMMMM...~~~~~~~~~~
    2.4 ~~~~~~.FFFFFFFFFMMMMMMMM.TTT..~~~~~~~~~
    2.8 ~~~~~.FFFFFFFFFFFFFFFFMM.TTTT..~~~~~~~~
    3.2 ~~~~~.FFFFFFFFFFF.R.MMMM.TTTTT.~~~~~~~~
    3.6 ~~~~.FFFFFFFFFFF.RR..MMM.TTTTTT.~~~~~~~
    4.0 ~~~~.FFFFFFFFFF.RR.PP....TTTTTHH.~~~~~~
    4.4 ~~~~.FFFFFFFFF.RR.PPPP.DD.TTTT.HHH.~~~~
    4.8 ~~~~.FFFFFFFF.RR.PPPPP.DDDD.TT.HHHH.~~~
    5.2 ~~~~.FFFFFFF.RR.PPP.LLL.DDDDD.HHHHH.~~~
    5.6 ~~~~..SSSSS.RR.PPP..LLL.DDDDDD..HHH.~~~
    6.0 ~~~~~.SSSS.RR.PPPP..LLL.DDDDDD...HH.~~~
    6.4 ~~~~.SSSSS.R.PPPPP.PPP..DDDDDDD.....~~~
    6.8 ~~~~.SSSSSS.R.PPPPPPPP.CCDDDDDDD.II.~~~
    7.2 ~~~~.SSSSSSS.RR.PPPPP.CCCC.DDDD.III.~~~
    7.6 ~~~.SSSSSSSS.RR.....CCCCC.DDD.IIIII.~~~
    8.0 ~~~.SSSSSSSSS.R.SSS.CCCCCC..IIIIII.~~~~
    8.4 ~~~.SSSSSSSSSS.R.SS.CCCC.IIIIIII.~~~~~~
    8.8 ~~~.SSSSSSSSS..R.SS..IIIIIIIII.~~~~~~~~
    9.2 ~~~..SSSSSSSS.RR.S..IIIIIII.WW.~~~~~~~~
    9.6 ~~~~.SSSSSSSS.RR..IIIIII..WWWW.~~~~~~~~
    10.0 ~~~~.ffffffffff.RR.IIII.WWWWWW.~~~~~~~~
    10.4 ~~~~.fffffffffff.R.III..WWWWWW.~~~~~~~~
    10.8 ~~~~.fffffffffff.RR.I.WWWWWWW.~~~~~~~~~
    11.2 ~~~~~.ffffffffff.RR..WWWWWW.~~~~~~~~~~~
    11.6 ~~~~~.fffffffff..RR.WWWWW.~~~~~~~~~~~~~
    12.0 ~~~~~..ffffffff.RRR.WWWW.~~~~~~~~~~~~~~
    12.4 ~~~~~~..ffffff..RRR.WWW.~~~~~~~~~~~~~~~~
    12.8 ~~~~~~~..fff...RRRR.WW..~~~~~~~~~~~~~~~
    13.2 ~~~~~~~~......BRRRRBBBB..~~~~~.o.~~~~~~
    13.6 ~~~~~~~~~...BBBBRRBBBBB..~~~~~~~~~~~~~~~
    14.0 ~~~~~~~~~~.BBBBBBBBBBB.~~~~~~~~~~~~~~~~~
    14.4 ~~~~~~~~~~~.BBBBBBBBB.~~~~~~~~~~~~~~~~~~
    14.8 ~~~~~~~~~~~~..BBBBB..~~~~~~~~~~~~~~~~~~~
    15.2 ~~~~~~~~~~~~~~.....~~~~~~~~~~~~~~~~~~~~~
    15.6 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

LEGEND
~ Ocean . Beach/Shore F Forest (lumber)
M Mountains T Old Town H Harbor (fishing/shipping)
D Downtown P Park S Suburbs
f Farmland I Industrial B Boardwalk/Resort
R River L Lake W Wetlands
C Commercial Strip o Small Island

## Complete Zone Reference

| #   | Zone                                            | Bounds (x1,y1 → x2,y2)    | Terrain Speed | Key Activities                                                 |
| --- | ----------------------------------------------- | ------------------------- | ------------- | -------------------------------------------------------------- |
| 1   | [Forest](zone_01_forest.md)                     | 600,600 → 3400,3000       | 0.65×         | Lumberjacking, trail hiking, foraging, sawmill                 |
| 2   | [Mountains](zone_02_mountains.md)               | 2800,400 → 5600,2200      | 0.5×          | Mining, climbing, scenic lookouts, quarry                      |
| 3   | [Old Town](zone_03_old_town.md)                 | 5000,1400 → 6800,3600     | 1.0×          | Antique shops, historical quests, unique food, museum          |
| 4   | [Harbor](zone_04_harbor.md)                     | 6400,2600 → 7600,4400     | 1.0×          | Fishing, shipping, fish market, boat rental                    |
| 5   | [Downtown](zone_05_downtown.md)                 | 4000,2800 → 6400,4800     | 1.0×          | Bank, Casino, Police HQ, offices, malls, dense commerce        |
| 6   | [Park](zone_06_park.md)                         | 2000,2600 → 4200,4400     | 0.9×          | Lake fishing, relaxation, events, picnic, paths                |
| 7   | [Suburbs](zone_07_suburbs.md)                   | 600,3200 → 3200,5800      | 1.0×          | Houses, local shops, schools, church, residential life         |
| 8   | [Commercial Strip](zone_08_commercial_strip.md) | 3400,4200 → 5400,5200     | 1.0×          | Connects downtown↔industrial, shops, market hall               |
| 9   | [Farmland](zone_09_farmland.md)                 | 600,5400 → 3800,7000      | 0.85×         | Crop plots, barns, farmer's market, livestock pens             |
| 10  | [Industrial](zone_10_industrial.md)             | 4600,4600 → 6800,6600     | 1.0×          | Factories, warehouses, processing plants, crafting             |
| 11  | [Wetlands](zone_11_wetlands.md)                 | 5600,5800 → 7400,7200     | 0.6×          | Rare fishing, nature reserve, bird watching, herbs             |
| 12  | [Boardwalk/Resort](zone_12_boardwalk_resort.md) | 2200,6800 → 6000,7600     | 1.0×          | Beach shops, resort hotel, pier fishing, arcade, entertainment |
| 13  | [Beach](zone_13_beach.md)                       | Coastal strip ~200px wide | 0.8×          | Shells, swimming, sunbathing, beach vendors                    |
| 14  | [Small Island](zone_14_small_island.md)         | 6800,6600 → 7200,7000     | 0.8×          | Hidden treasure, secret vendor, boat access only               |
| —   | [River & Lake](natural_features.md)             | x≈3400–3800, y:1600→6800  | 0.7× (wading) | Fishing spots along banks, bridges, rapids                     |

---

## Supply Chain Flow Across Zones

```
FOREST ──lumber──→ INDUSTRIAL (Sawmill/Furniture Factory)
                          │
MOUNTAINS ──ore──→ INDUSTRIAL (Smelter/Forge) ──goods──→ COMMERCIAL STRIP ──→ DOWNTOWN shops
                          │                                     ↑
FARMLAND ──crops──→ INDUSTRIAL (Food Processing)               │
                          │                              SUBURBS shops
WETLANDS ──herbs──→ INDUSTRIAL (Apothecary)

HARBOR ──fish──→ BOARDWALK (Fish Market) / DOWNTOWN (Sushi Bar)
         ──imports──→ COMMERCIAL STRIP (Wholesale)
```
