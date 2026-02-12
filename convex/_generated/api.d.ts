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
import type * as clothing from "../clothing.js";
import type * as clothingConfig from "../clothingConfig.js";
import type * as crons from "../crons.js";
import type * as economy from "../economy.js";
import type * as food from "../food.js";
import type * as foodConfig from "../foodConfig.js";
import type * as gameConstants from "../gameConstants.js";
import type * as http from "../http.js";
import type * as jobs from "../jobs.js";
import type * as mapZones from "../mapZones.js";
import type * as players from "../players.js";
import type * as properties from "../properties.js";
import type * as time from "../time.js";
import type * as timeConstants from "../timeConstants.js";
import type * as treeConfig from "../treeConfig.js";
import type * as trees from "../trees.js";
import type * as users from "../users.js";
import type * as utils from "../utils.js";
import type * as world from "../world.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  CustomPassword: typeof CustomPassword;
  auth: typeof auth;
  clothing: typeof clothing;
  clothingConfig: typeof clothingConfig;
  crons: typeof crons;
  economy: typeof economy;
  food: typeof food;
  foodConfig: typeof foodConfig;
  gameConstants: typeof gameConstants;
  http: typeof http;
  jobs: typeof jobs;
  mapZones: typeof mapZones;
  players: typeof players;
  properties: typeof properties;
  time: typeof time;
  timeConstants: typeof timeConstants;
  treeConfig: typeof treeConfig;
  trees: typeof trees;
  users: typeof users;
  utils: typeof utils;
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
