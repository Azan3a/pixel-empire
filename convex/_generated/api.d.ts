/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as CustomPassword from "../CustomPassword.js";
import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as food from "../food.js";
import type * as foodConfig from "../foodConfig.js";
import type * as gameConstants from "../gameConstants.js";
import type * as http from "../http.js";
import type * as jobs from "../jobs.js";
import type * as mapZones from "../mapZones.js";
import type * as map_constants from "../map/constants.js";
import type * as map_generate_index from "../map/generate/index.js";
import type * as map_generate_jobPoints from "../map/generate/jobPoints.js";
import type * as map_generate_properties from "../map/generate/properties.js";
import type * as map_generate_reset from "../map/generate/reset.js";
import type * as map_index from "../map/index.js";
import type * as map_islands from "../map/islands.js";
import type * as map_templates_buildings from "../map/templates/buildings.js";
import type * as map_water from "../map/water.js";
import type * as map_zones from "../map/zones.js";
import type * as map_zones_beach from "../map/zones/beach.js";
import type * as map_zones_boardwalk from "../map/zones/boardwalk.js";
import type * as map_zones_commercial from "../map/zones/commercial.js";
import type * as map_zones_downtown from "../map/zones/downtown.js";
import type * as map_zones_farmland from "../map/zones/farmland.js";
import type * as map_zones_forest from "../map/zones/forest.js";
import type * as map_zones_harbor from "../map/zones/harbor.js";
import type * as map_zones_index from "../map/zones/index.js";
import type * as map_zones_industrial from "../map/zones/industrial.js";
import type * as map_zones_mountains from "../map/zones/mountains.js";
import type * as map_zones_oldtown from "../map/zones/oldtown.js";
import type * as map_zones_park from "../map/zones/park.js";
import type * as map_zones_smallisland from "../map/zones/smallisland.js";
import type * as map_zones_suburbs from "../map/zones/suburbs.js";
import type * as map_zones_types from "../map/zones/types.js";
import type * as map_zones_wetlands from "../map/zones/wetlands.js";
import type * as players from "../players.js";
import type * as time from "../time.js";
import type * as timeConstants from "../timeConstants.js";
import type * as users from "../users.js";
import type * as world from "../world.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  CustomPassword: typeof CustomPassword;
  auth: typeof auth;
  crons: typeof crons;
  food: typeof food;
  foodConfig: typeof foodConfig;
  gameConstants: typeof gameConstants;
  http: typeof http;
  jobs: typeof jobs;
  mapZones: typeof mapZones;
  "map/constants": typeof map_constants;
  "map/generate/index": typeof map_generate_index;
  "map/generate/jobPoints": typeof map_generate_jobPoints;
  "map/generate/properties": typeof map_generate_properties;
  "map/generate/reset": typeof map_generate_reset;
  "map/index": typeof map_index;
  "map/islands": typeof map_islands;
  "map/templates/buildings": typeof map_templates_buildings;
  "map/water": typeof map_water;
  "map/zones": typeof map_zones;
  "map/zones/beach": typeof map_zones_beach;
  "map/zones/boardwalk": typeof map_zones_boardwalk;
  "map/zones/commercial": typeof map_zones_commercial;
  "map/zones/downtown": typeof map_zones_downtown;
  "map/zones/farmland": typeof map_zones_farmland;
  "map/zones/forest": typeof map_zones_forest;
  "map/zones/harbor": typeof map_zones_harbor;
  "map/zones/index": typeof map_zones_index;
  "map/zones/industrial": typeof map_zones_industrial;
  "map/zones/mountains": typeof map_zones_mountains;
  "map/zones/oldtown": typeof map_zones_oldtown;
  "map/zones/park": typeof map_zones_park;
  "map/zones/smallisland": typeof map_zones_smallisland;
  "map/zones/suburbs": typeof map_zones_suburbs;
  "map/zones/types": typeof map_zones_types;
  "map/zones/wetlands": typeof map_zones_wetlands;
  players: typeof players;
  time: typeof time;
  timeConstants: typeof timeConstants;
  users: typeof users;
  world: typeof world;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
