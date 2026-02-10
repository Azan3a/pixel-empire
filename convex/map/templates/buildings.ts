// convex/map/templates/buildings.ts
// Rendering hints & metadata for every PropertySubType.
// Used by the client renderer to pick sprites, colors, labels.

import type { PropertySubType } from "../zones";

export interface BuildingTemplate {
  /** Same key as the subType on ZoneBuilding */
  subType: PropertySubType;
  /** Human-readable label for UI */
  label: string;
  /** Fallback fill color (hex) when sprites are unavailable */
  color: string;
  /** Roof / accent color (hex) for map rendering */
  roofColor: string;
  /** Emoji for minimap / quick-view */
  icon: string;
}

/**
 * Master lookup keyed by subType.
 * Every building placed in any zone MUST have an entry here.
 */
export const BUILDING_TEMPLATES: Record<PropertySubType, BuildingTemplate> = {
  // ─── Forest ────────────────────────────────────────────────────
  ranger_station: {
    subType: "ranger_station",
    label: "Ranger Station",
    color: "#5D4037",
    roofColor: "#3E2723",
    icon: "🏕️",
  },
  sawmill: {
    subType: "sawmill",
    label: "Sawmill",
    color: "#795548",
    roofColor: "#4E342E",
    icon: "🪚",
  },
  lumber_camp: {
    subType: "lumber_camp",
    label: "Lumber Camp",
    color: "#6D4C41",
    roofColor: "#3E2723",
    icon: "🪵",
  },

  // ─── Mountains ─────────────────────────────────────────────────
  lookout: {
    subType: "lookout",
    label: "Lookout",
    color: "#78909C",
    roofColor: "#546E7A",
    icon: "🔭",
  },
  mine: {
    subType: "mine",
    label: "Mine",
    color: "#607D8B",
    roofColor: "#455A64",
    icon: "⛏️",
  },
  quarry: {
    subType: "quarry",
    label: "Quarry",
    color: "#90A4AE",
    roofColor: "#607D8B",
    icon: "🪨",
  },
  mountain_lodge: {
    subType: "mountain_lodge",
    label: "Mountain Lodge",
    color: "#8D6E63",
    roofColor: "#5D4037",
    icon: "🏔️",
  },

  // ─── Old Town ──────────────────────────────────────────────────
  museum: {
    subType: "museum",
    label: "Museum",
    color: "#BCAAA4",
    roofColor: "#8D6E63",
    icon: "🏛️",
  },
  town_hall: {
    subType: "town_hall",
    label: "Town Hall",
    color: "#D7CCC8",
    roofColor: "#A1887F",
    icon: "🏫",
  },
  clock_tower: {
    subType: "clock_tower",
    label: "Clock Tower",
    color: "#A1887F",
    roofColor: "#6D4C41",
    icon: "🕰️",
  },
  bakery: {
    subType: "bakery",
    label: "Bakery",
    color: "#FFCC80",
    roofColor: "#FFB74D",
    icon: "🍞",
  },
  blacksmith: {
    subType: "blacksmith",
    label: "Blacksmith",
    color: "#616161",
    roofColor: "#424242",
    icon: "⚒️",
  },
  tailor: {
    subType: "tailor",
    label: "Tailor",
    color: "#CE93D8",
    roofColor: "#AB47BC",
    icon: "🧵",
  },
  herbalist: {
    subType: "herbalist",
    label: "Herbalist",
    color: "#A5D6A7",
    roofColor: "#66BB6A",
    icon: "🌿",
  },
  bookstore: {
    subType: "bookstore",
    label: "Bookstore",
    color: "#BCAAA4",
    roofColor: "#8D6E63",
    icon: "📚",
  },
  antique_shop: {
    subType: "antique_shop",
    label: "Antique Shop",
    color: "#D7CCC8",
    roofColor: "#A1887F",
    icon: "🏺",
  },
  tavern: {
    subType: "tavern",
    label: "Tavern",
    color: "#8D6E63",
    roofColor: "#5D4037",
    icon: "🍺",
  },
  general_store: {
    subType: "general_store",
    label: "General Store",
    color: "#A1887F",
    roofColor: "#6D4C41",
    icon: "🏪",
  },
  inn: {
    subType: "inn",
    label: "Inn",
    color: "#BCAAA4",
    roofColor: "#8D6E63",
    icon: "🛏️",
  },

  // ─── Harbor ────────────────────────────────────────────────────
  harbor_master: {
    subType: "harbor_master",
    label: "Harbor Master",
    color: "#1565C0",
    roofColor: "#0D47A1",
    icon: "⚓",
  },
  customs_house: {
    subType: "customs_house",
    label: "Customs House",
    color: "#1976D2",
    roofColor: "#1565C0",
    icon: "🏢",
  },
  lighthouse: {
    subType: "lighthouse",
    label: "Lighthouse",
    color: "#FFFFFF",
    roofColor: "#F44336",
    icon: "🗼",
  },
  dry_dock: {
    subType: "dry_dock",
    label: "Dry Dock",
    color: "#5C6BC0",
    roofColor: "#3949AB",
    icon: "🚢",
  },
  boat_rental: {
    subType: "boat_rental",
    label: "Boat Rental",
    color: "#42A5F5",
    roofColor: "#1E88E5",
    icon: "⛵",
  },
  fish_market: {
    subType: "fish_market",
    label: "Fish Market",
    color: "#4FC3F7",
    roofColor: "#29B6F6",
    icon: "🐟",
  },
  ship_supply: {
    subType: "ship_supply",
    label: "Ship Supply",
    color: "#0288D1",
    roofColor: "#01579B",
    icon: "🔧",
  },
  bait_shop: {
    subType: "bait_shop",
    label: "Bait Shop",
    color: "#4DD0E1",
    roofColor: "#00BCD4",
    icon: "🪱",
  },
  warehouse: {
    subType: "warehouse",
    label: "Warehouse",
    color: "#78909C",
    roofColor: "#546E7A",
    icon: "📦",
  },

  // ─── Downtown ──────────────────────────────────────────────────
  city_hall: {
    subType: "city_hall",
    label: "City Hall",
    color: "#E0E0E0",
    roofColor: "#9E9E9E",
    icon: "🏛️",
  },
  bank_tower: {
    subType: "bank_tower",
    label: "Bank Tower",
    color: "#CFD8DC",
    roofColor: "#90A4AE",
    icon: "🏦",
  },
  stock_exchange: {
    subType: "stock_exchange",
    label: "Stock Exchange",
    color: "#B0BEC5",
    roofColor: "#78909C",
    icon: "📈",
  },
  casino: {
    subType: "casino",
    label: "Casino",
    color: "#FFD54F",
    roofColor: "#FFC107",
    icon: "🎰",
  },
  police_hq: {
    subType: "police_hq",
    label: "Police HQ",
    color: "#90CAF9",
    roofColor: "#42A5F5",
    icon: "🚔",
  },
  mega_mall: {
    subType: "mega_mall",
    label: "Mega Mall",
    color: "#E1BEE7",
    roofColor: "#CE93D8",
    icon: "🏬",
  },
  plaza_hotel: {
    subType: "plaza_hotel",
    label: "Plaza Hotel",
    color: "#F8BBD0",
    roofColor: "#F48FB1",
    icon: "🏨",
  },
  investment_firm: {
    subType: "investment_firm",
    label: "Investment Firm",
    color: "#B0BEC5",
    roofColor: "#78909C",
    icon: "💼",
  },
  law_office: {
    subType: "law_office",
    label: "Law Office",
    color: "#CFD8DC",
    roofColor: "#90A4AE",
    icon: "⚖️",
  },
  insurance: {
    subType: "insurance",
    label: "Insurance Co.",
    color: "#C5CAE9",
    roofColor: "#9FA8DA",
    icon: "🛡️",
  },
  news_tower: {
    subType: "news_tower",
    label: "News Tower",
    color: "#B3E5FC",
    roofColor: "#81D4FA",
    icon: "📡",
  },
  office_tower: {
    subType: "office_tower",
    label: "Office Tower",
    color: "#CFD8DC",
    roofColor: "#B0BEC5",
    icon: "🏢",
  },
  tech_hub: {
    subType: "tech_hub",
    label: "Tech Hub",
    color: "#B2DFDB",
    roofColor: "#80CBC4",
    icon: "💻",
  },
  luxury_apartment: {
    subType: "luxury_apartment",
    label: "Luxury Apartment",
    color: "#F3E5F5",
    roofColor: "#E1BEE7",
    icon: "🏠",
  },
  condo_tower: {
    subType: "condo_tower",
    label: "Condo Tower",
    color: "#E8EAF6",
    roofColor: "#C5CAE9",
    icon: "🏙️",
  },
  food_court: {
    subType: "food_court",
    label: "Food Court",
    color: "#FFE0B2",
    roofColor: "#FFCC80",
    icon: "🍔",
  },
  clothing_store: {
    subType: "clothing_store",
    label: "Clothing Store",
    color: "#F8BBD0",
    roofColor: "#F48FB1",
    icon: "👗",
  },
  coffee_shop: {
    subType: "coffee_shop",
    label: "Coffee Shop",
    color: "#D7CCC8",
    roofColor: "#BCAAA4",
    icon: "☕",
  },
  gym: {
    subType: "gym",
    label: "Gym",
    color: "#C8E6C9",
    roofColor: "#A5D6A7",
    icon: "💪",
  },

  // ─── Park ──────────────────────────────────────────────────────
  botanical_garden: {
    subType: "botanical_garden",
    label: "Botanical Garden",
    color: "#81C784",
    roofColor: "#66BB6A",
    icon: "🌷",
  },
  park_cafe: {
    subType: "park_cafe",
    label: "Park Café",
    color: "#AED581",
    roofColor: "#8BC34A",
    icon: "☕",
  },
  bandstand: {
    subType: "bandstand",
    label: "Bandstand",
    color: "#FFCC80",
    roofColor: "#FFB74D",
    icon: "🎵",
  },

  // ─── Suburbs ───────────────────────────────────────────────────
  house: {
    subType: "house",
    label: "House",
    color: "#BBDEFB",
    roofColor: "#64B5F6",
    icon: "🏡",
  },
  duplex: {
    subType: "duplex",
    label: "Duplex",
    color: "#90CAF9",
    roofColor: "#42A5F5",
    icon: "🏠",
  },
  apartment: {
    subType: "apartment",
    label: "Apartment",
    color: "#B0BEC5",
    roofColor: "#78909C",
    icon: "🏢",
  },
  community_center: {
    subType: "community_center",
    label: "Community Center",
    color: "#FFF9C4",
    roofColor: "#FFF176",
    icon: "🏘️",
  },
  school: {
    subType: "school",
    label: "School",
    color: "#FFECB3",
    roofColor: "#FFD54F",
    icon: "🏫",
  },
  church: {
    subType: "church",
    label: "Church",
    color: "#F5F5F5",
    roofColor: "#E0E0E0",
    icon: "⛪",
  },
  clinic: {
    subType: "clinic",
    label: "Clinic",
    color: "#FFCDD2",
    roofColor: "#EF9A9A",
    icon: "🏥",
  },
  grocery_store: {
    subType: "grocery_store",
    label: "Grocery Store",
    color: "#C8E6C9",
    roofColor: "#A5D6A7",
    icon: "🛒",
  },
  hardware_store: {
    subType: "hardware_store",
    label: "Hardware Store",
    color: "#FFE0B2",
    roofColor: "#FFCC80",
    icon: "🔨",
  },

  // ─── Commercial ────────────────────────────────────────────────
  farmers_market: {
    subType: "farmers_market",
    label: "Farmer's Market",
    color: "#C8E6C9",
    roofColor: "#A5D6A7",
    icon: "🧑‍🌾",
  },
  electronics_store: {
    subType: "electronics_store",
    label: "Electronics Store",
    color: "#B3E5FC",
    roofColor: "#81D4FA",
    icon: "📱",
  },
  mega_mart: {
    subType: "mega_mart",
    label: "Mega Mart",
    color: "#E1BEE7",
    roofColor: "#CE93D8",
    icon: "🏪",
  },
  furniture_outlet: {
    subType: "furniture_outlet",
    label: "Furniture Outlet",
    color: "#D7CCC8",
    roofColor: "#BCAAA4",
    icon: "🛋️",
  },
  auto_parts: {
    subType: "auto_parts",
    label: "Auto Parts",
    color: "#BDBDBD",
    roofColor: "#9E9E9E",
    icon: "🔩",
  },
  pet_shop: {
    subType: "pet_shop",
    label: "Pet Shop",
    color: "#DCEDC8",
    roofColor: "#C5E1A5",
    icon: "🐾",
  },
  wholesale: {
    subType: "wholesale",
    label: "Wholesale Depot",
    color: "#CFD8DC",
    roofColor: "#B0BEC5",
    icon: "📦",
  },
  sports_store: {
    subType: "sports_store",
    label: "Sports Store",
    color: "#B2EBF2",
    roofColor: "#80DEEA",
    icon: "⚽",
  },
  pharmacy: {
    subType: "pharmacy",
    label: "Pharmacy",
    color: "#C8E6C9",
    roofColor: "#81C784",
    icon: "💊",
  },
  bank_branch: {
    subType: "bank_branch",
    label: "Bank Branch",
    color: "#CFD8DC",
    roofColor: "#90A4AE",
    icon: "🏦",
  },

  // ─── Farmland ──────────────────────────────────────────────────
  farmhouse: {
    subType: "farmhouse",
    label: "Farmhouse",
    color: "#A5D6A7",
    roofColor: "#66BB6A",
    icon: "🏡",
  },
  barn: {
    subType: "barn",
    label: "Barn",
    color: "#EF5350",
    roofColor: "#C62828",
    icon: "🏚️",
  },
  seed_store: {
    subType: "seed_store",
    label: "Seed & Feed Store",
    color: "#AED581",
    roofColor: "#8BC34A",
    icon: "🌱",
  },
  farmhouse_kitchen: {
    subType: "farmhouse_kitchen",
    label: "Farmhouse Kitchen",
    color: "#FFCC80",
    roofColor: "#FFA726",
    icon: "🍳",
  },

  // ─── Industrial ────────────────────────────────────────────────
  sawmill_factory: {
    subType: "sawmill_factory",
    label: "Sawmill Factory",
    color: "#8D6E63",
    roofColor: "#5D4037",
    icon: "🏭",
  },
  smelter: {
    subType: "smelter",
    label: "Smelter & Forge",
    color: "#FF8A65",
    roofColor: "#E64A19",
    icon: "🔥",
  },
  food_processing: {
    subType: "food_processing",
    label: "Food Processing",
    color: "#FFE0B2",
    roofColor: "#FFB74D",
    icon: "🥫",
  },
  chemical_plant: {
    subType: "chemical_plant",
    label: "Chemical Plant",
    color: "#E6EE9C",
    roofColor: "#C0CA33",
    icon: "⚗️",
  },
  shipping_hub: {
    subType: "shipping_hub",
    label: "Shipping Hub",
    color: "#90A4AE",
    roofColor: "#607D8B",
    icon: "🚛",
  },
  textile_mill: {
    subType: "textile_mill",
    label: "Textile Mill",
    color: "#CE93D8",
    roofColor: "#AB47BC",
    icon: "🧶",
  },
  electronics_factory: {
    subType: "electronics_factory",
    label: "Electronics Factory",
    color: "#81D4FA",
    roofColor: "#29B6F6",
    icon: "🔌",
  },
  recycling: {
    subType: "recycling",
    label: "Recycling Center",
    color: "#A5D6A7",
    roofColor: "#66BB6A",
    icon: "♻️",
  },
  power_station: {
    subType: "power_station",
    label: "Power Station",
    color: "#FFF176",
    roofColor: "#FFEE58",
    icon: "⚡",
  },

  // ─── Wetlands ──────────────────────────────────────────────────
  nature_center: {
    subType: "nature_center",
    label: "Nature Center",
    color: "#80CBC4",
    roofColor: "#4DB6AC",
    icon: "🌿",
  },
  bird_watch: {
    subType: "bird_watch",
    label: "Bird Watch Tower",
    color: "#A5D6A7",
    roofColor: "#66BB6A",
    icon: "🐦",
  },

  // ─── Boardwalk ─────────────────────────────────────────────────
  luxury_hotel: {
    subType: "luxury_hotel",
    label: "Luxury Hotel",
    color: "#F8BBD0",
    roofColor: "#F48FB1",
    icon: "🏨",
  },
  arcade: {
    subType: "arcade",
    label: "Arcade",
    color: "#CE93D8",
    roofColor: "#BA68C8",
    icon: "🕹️",
  },
  resort_pool: {
    subType: "resort_pool",
    label: "Resort Pool",
    color: "#81D4FA",
    roofColor: "#4FC3F7",
    icon: "🏊",
  },
  ice_cream_stand: {
    subType: "ice_cream_stand",
    label: "Ice Cream Stand",
    color: "#FCE4EC",
    roofColor: "#F8BBD0",
    icon: "🍦",
  },
  yacht_club_shop: {
    subType: "yacht_club_shop",
    label: "Yacht Club Shop",
    color: "#B3E5FC",
    roofColor: "#4FC3F7",
    icon: "🛥️",
  },

  // ─── Beach ─────────────────────────────────────────────────────
  beach_club: {
    subType: "beach_club",
    label: "Beach Club",
    color: "#FFE082",
    roofColor: "#FFD54F",
    icon: "🏖️",
  },
  volleyball_court: {
    subType: "volleyball_court",
    label: "Volleyball Court",
    color: "#FFF9C4",
    roofColor: "#FFF176",
    icon: "🏐",
  },
  beach_rental: {
    subType: "beach_rental",
    label: "Beach Rental",
    color: "#FFECB3",
    roofColor: "#FFD54F",
    icon: "⛱️",
  },
  surf_shop: {
    subType: "surf_shop",
    label: "Surf Shop",
    color: "#80DEEA",
    roofColor: "#26C6DA",
    icon: "🏄",
  },

  // ─── Small Island ──────────────────────────────────────────────
  island_dock: {
    subType: "island_dock",
    label: "Island Dock",
    color: "#8D6E63",
    roofColor: "#5D4037",
    icon: "🪵",
  },
};

/** Look up a building template by subType, with fallback */
export function getBuildingTemplate(
  subType: PropertySubType,
): BuildingTemplate {
  return (
    BUILDING_TEMPLATES[subType] ?? {
      subType,
      label: subType.replace(/_/g, " "),
      color: "#9E9E9E",
      roofColor: "#757575",
      icon: "🏗️",
    }
  );
}
