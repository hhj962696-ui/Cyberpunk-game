export type Rarity = "common" | "rare" | "legendary"

export type IngredientId =
  | "noodle"
  | "synmeat"
  | "scallion"
  | "energy"
  | "soda"
  | "rice"
  | "tomato"
  | "egg"
  | "chili"
  | "wagyu"

export interface Ingredient {
  id: IngredientId
  name: string
  rarity: Rarity
}

export const INGREDIENTS: Record<IngredientId, Ingredient> = {
  noodle: { id: "noodle", name: "合成麵條", rarity: "common" },
  synmeat: { id: "synmeat", name: "合成肉", rarity: "common" },
  scallion: { id: "scallion", name: "蔥", rarity: "common" },
  energy: { id: "energy", name: "能量液", rarity: "common" },
  soda: { id: "soda", name: "氣泡水", rarity: "common" },
  rice: { id: "rice", name: "米飯", rarity: "common" },
  tomato: { id: "tomato", name: "天然番茄", rarity: "rare" },
  egg: { id: "egg", name: "雞蛋", rarity: "rare" },
  chili: { id: "chili", name: "霓虹辣椒", rarity: "rare" },
  wagyu: { id: "wagyu", name: "和牛", rarity: "legendary" },
}

export const INGREDIENT_IDS = Object.keys(INGREDIENTS) as IngredientId[]

export const RARITY_LABEL: Record<Rarity, string> = {
  common: "合成",
  rare: "天然",
  legendary: "黑市",
}

// Chance of each rarity on a single draw
export const DRAW_WEIGHTS: Record<Rarity, number> = {
  common: 70,
  rare: 25,
  legendary: 5,
}

// Units received from one draw
export const DRAW_PACK_SIZE: Record<Rarity, number> = {
  common: 4,
  rare: 2,
  legendary: 1,
}

// Base vendor price per unit, in credits
export const VENDOR_BASE_PRICE: Record<Rarity, number> = {
  common: 6,
  rare: 18,
  legendary: 80,
}

export type DishId = "ramen" | "battery" | "bun" | "spicyRice" | "tomatoEgg" | "wagyuDon"

export interface Dish {
  id: DishId
  name: string
  price: number
  recipe: Partial<Record<IngredientId, number>>
}

export const DISHES: Record<DishId, Dish> = {
  ramen: { id: "ramen", name: "霓虹拉麵", price: 45, recipe: { noodle: 2, synmeat: 1, scallion: 1 } },
  battery: { id: "battery", name: "電池氣泡飲", price: 25, recipe: { energy: 1, soda: 1 } },
  bun: { id: "bun", name: "合成肉包", price: 35, recipe: { synmeat: 1, scallion: 1, noodle: 1 } },
  spicyRice: { id: "spicyRice", name: "赤焰炒飯", price: 70, recipe: { rice: 1, chili: 1, egg: 1 } },
  tomatoEgg: { id: "tomatoEgg", name: "天然番茄炒蛋", price: 90, recipe: { tomato: 2, egg: 2 } },
  wagyuDon: { id: "wagyuDon", name: "黑市和牛丼", price: 220, recipe: { wagyu: 1, rice: 2 } },
}

export const DISH_IDS = Object.keys(DISHES) as DishId[]

export interface CustomerType {
  id: string
  name: string
  favorites: DishId[]
  tipRate: number
  weight: number
}

export const CUSTOMERS: CustomerType[] = [
  { id: "worker", name: "碼頭工人", favorites: ["ramen", "bun"], tipRate: 0.05, weight: 30 },
  { id: "hacker", name: "駭客", favorites: ["battery", "spicyRice"], tipRate: 0.1, weight: 22 },
  { id: "cyborg", name: "義肢族", favorites: ["battery", "ramen"], tipRate: 0.08, weight: 22 },
  { id: "salaryman", name: "企業上班族", favorites: ["tomatoEgg", "spicyRice"], tipRate: 0.15, weight: 18 },
  { id: "tycoon", name: "天空花園富豪", favorites: ["wagyuDon", "tomatoEgg"], tipRate: 0.3, weight: 8 },
]

export const GAME_RULES = {
  startCredits: 200,
  freeDrawsPerDay: 5,
  extraDrawCost: 30,
  adDrawsPerDay: 2,
  maxMenuSize: 4,
  lastDay: 7,
  goalCredits: 1800,
  vendorRefreshMs: 12 * 60 * 60 * 1000,
  vendorOfferCount: 4,
}
