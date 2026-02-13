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
import type * as config_clothingConfig from "../config/clothingConfig.js";
import type * as config_foodConfig from "../config/foodConfig.js";
import type * as config_gameConstants from "../config/gameConstants.js";
import type * as config_mapZones from "../config/mapZones.js";
import type * as config_timeConstants from "../config/timeConstants.js";
import type * as config_treeConfig from "../config/treeConfig.js";
import type * as crons from "../crons.js";
import type * as domains_economy_helpers from "../domains/economy/helpers.js";
import type * as domains_economy_mutations from "../domains/economy/mutations.js";
import type * as domains_jobs_constants from "../domains/jobs/constants.js";
import type * as domains_jobs_generation from "../domains/jobs/generation.js";
import type * as domains_jobs_maintenance from "../domains/jobs/maintenance.js";
import type * as domains_jobs_mutations from "../domains/jobs/mutations.js";
import type * as domains_jobs_naming from "../domains/jobs/naming.js";
import type * as domains_jobs_queries from "../domains/jobs/queries.js";
import type * as domains_players_clothing from "../domains/players/clothing.js";
import type * as domains_players_food from "../domains/players/food.js";
import type * as domains_players_mutations from "../domains/players/mutations.js";
import type * as domains_players_queries from "../domains/players/queries.js";
import type * as domains_players_users from "../domains/players/users.js";
import type * as domains_properties_mutations from "../domains/properties/mutations.js";
import type * as domains_properties_queries from "../domains/properties/queries.js";
import type * as domains_trees_helpers from "../domains/trees/helpers.js";
import type * as domains_trees_maintenance from "../domains/trees/maintenance.js";
import type * as domains_trees_mutations from "../domains/trees/mutations.js";
import type * as domains_trees_queries from "../domains/trees/queries.js";
import type * as domains_world_mutations from "../domains/world/mutations.js";
import type * as domains_world_time from "../domains/world/time.js";
import type * as economy from "../economy.js";
import type * as food from "../food.js";
import type * as http from "../http.js";
import type * as jobs from "../jobs.js";
import type * as players from "../players.js";
import type * as properties from "../properties.js";
import type * as shared_math from "../shared/math.js";
import type * as time from "../time.js";
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
  "config/clothingConfig": typeof config_clothingConfig;
  "config/foodConfig": typeof config_foodConfig;
  "config/gameConstants": typeof config_gameConstants;
  "config/mapZones": typeof config_mapZones;
  "config/timeConstants": typeof config_timeConstants;
  "config/treeConfig": typeof config_treeConfig;
  crons: typeof crons;
  "domains/economy/helpers": typeof domains_economy_helpers;
  "domains/economy/mutations": typeof domains_economy_mutations;
  "domains/jobs/constants": typeof domains_jobs_constants;
  "domains/jobs/generation": typeof domains_jobs_generation;
  "domains/jobs/maintenance": typeof domains_jobs_maintenance;
  "domains/jobs/mutations": typeof domains_jobs_mutations;
  "domains/jobs/naming": typeof domains_jobs_naming;
  "domains/jobs/queries": typeof domains_jobs_queries;
  "domains/players/clothing": typeof domains_players_clothing;
  "domains/players/food": typeof domains_players_food;
  "domains/players/mutations": typeof domains_players_mutations;
  "domains/players/queries": typeof domains_players_queries;
  "domains/players/users": typeof domains_players_users;
  "domains/properties/mutations": typeof domains_properties_mutations;
  "domains/properties/queries": typeof domains_properties_queries;
  "domains/trees/helpers": typeof domains_trees_helpers;
  "domains/trees/maintenance": typeof domains_trees_maintenance;
  "domains/trees/mutations": typeof domains_trees_mutations;
  "domains/trees/queries": typeof domains_trees_queries;
  "domains/world/mutations": typeof domains_world_mutations;
  "domains/world/time": typeof domains_world_time;
  economy: typeof economy;
  food: typeof food;
  http: typeof http;
  jobs: typeof jobs;
  players: typeof players;
  properties: typeof properties;
  "shared/math": typeof shared_math;
  time: typeof time;
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
