// ---------- regions ----------

export type CountryId = "taipei" | "bangkok" | "tokyo" | "seoul" | "newyork" | "paris"

// ---------- ingredients ----------

// How hard an ingredient is to get, from easiest to hardest
export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary"

export const RARITIES: Rarity[] = ["common", "uncommon", "rare", "epic", "legendary"]

export const RARITY_LABEL: Record<Rarity, string> = {
  common: "大宗",
  uncommon: "天然",
  rare: "特產",
  epic: "珍稀",
  legendary: "黑市傳說",
}

export const RARITY_HINT: Record<Rarity, string> = {
  common: "到處都抽得到，攤販天天有貨，一次抽到 4 份。",
  uncommon: "天然食材，大部分地區都有，一次抽到 3 份。",
  rare: "地區特產，只有在產地抽得到或買得到，一次 2 份。",
  epic: "抽中機率只有 4%，攤販偶爾進一份，只在產地出現。",
  legendary: "抽中機率 1%，攤販進貨也只有 1 份，價格驚人。",
}

export type Category = "grain" | "veg" | "fruit" | "meat" | "seafood" | "dairy" | "spice" | "drink"

export const CATEGORY_LABEL: Record<Category, string> = {
  grain: "穀物麵粉",
  veg: "蔬菜豆類",
  fruit: "水果",
  meat: "肉類",
  seafood: "海鮮",
  dairy: "蛋奶",
  spice: "醬料香料",
  drink: "飲品茶酒",
}

export interface Ingredient {
  name: string
  rarity: Rarity
  category: Category
}

const ing = (name: string, rarity: Rarity, category: Category): Ingredient => ({ name, rarity, category })

export const INGREDIENTS = {
  // the original night-market pantry
  noodle: ing("合成麵條", "common", "grain"),
  synmeat: ing("合成肉", "common", "meat"),
  scallion: ing("蔥", "common", "veg"),
  energy: ing("能量液", "common", "drink"),
  soda: ing("氣泡水", "common", "drink"),
  rice: ing("米飯", "common", "grain"),
  tomato: ing("天然番茄", "uncommon", "veg"),
  egg: ing("雞蛋", "uncommon", "dairy"),
  chili: ing("霓虹辣椒", "uncommon", "spice"),
  wagyu: ing("A5 和牛", "legendary", "meat"),

  // pantry staples found almost everywhere
  flour: ing("麵粉", "common", "grain"),
  sugar: ing("合成糖", "common", "spice"),
  soy: ing("醬油", "common", "spice"),
  garlic: ing("大蒜", "common", "veg"),
  onion: ing("洋蔥", "common", "veg"),
  cabbage: ing("高麗菜", "common", "veg"),
  potato: ing("馬鈴薯", "common", "veg"),
  tofu: ing("豆腐", "common", "veg"),
  milk: ing("牛奶", "uncommon", "dairy"),
  butter: ing("奶油", "uncommon", "dairy"),
  lemon: ing("檸檬", "uncommon", "fruit"),
  pork: ing("豬肉", "uncommon", "meat"),
  chicken: ing("雞肉", "uncommon", "meat"),
  beef: ing("牛肉", "rare", "meat"),
  shrimp: ing("白蝦", "rare", "seafood"),
  cheese: ing("起司", "rare", "dairy"),

  // 新台北
  tapioca: ing("珍珠粉圓", "common", "grain"),
  stinkytofu: ing("臭豆腐", "uncommon", "veg"),
  oyster: ing("蚵仔", "rare", "seafood"),
  bamboo: ing("麻竹筍", "rare", "veg"),
  oolong: ing("高山烏龍", "epic", "drink"),
  mullet: ing("烏魚子", "legendary", "seafood"),

  // 新曼谷
  basil: ing("打拋葉", "common", "veg"),
  fishsauce: ing("魚露", "common", "spice"),
  lemongrass: ing("香茅", "uncommon", "spice"),
  coconut: ing("椰奶", "uncommon", "fruit"),
  greencurry: ing("綠咖哩醬", "rare", "spice"),
  mango: ing("金煌芒果", "rare", "fruit"),
  durian: ing("金枕頭榴槤", "epic", "fruit"),
  birdnest: ing("血燕窩", "legendary", "drink"),

  // 新東京
  nori: ing("海苔", "common", "veg"),
  miso: ing("味噌", "uncommon", "spice"),
  salmon: ing("鮭魚", "rare", "seafood"),
  wasabi: ing("真山葵", "rare", "spice"),
  matcha: ing("宇治抹茶", "rare", "drink"),
  tuna: ing("黑鮪魚大腹", "epic", "seafood"),
  fugu: ing("虎河豚", "legendary", "seafood"),

  // 新首爾
  ricecake: ing("年糕", "common", "grain"),
  kimchi: ing("泡菜", "uncommon", "veg"),
  gochujang: ing("韓式辣醬", "uncommon", "spice"),
  soju: ing("燒酒", "rare", "drink"),
  ginseng: ing("高麗人參", "epic", "veg"),
  hanwoo: ing("韓牛", "legendary", "meat"),

  // 新紐約
  lettuce: ing("生菜", "common", "veg"),
  coffee: ing("咖啡豆", "uncommon", "drink"),
  maple: ing("楓糖漿", "rare", "spice"),
  lobster: ing("波士頓龍蝦", "epic", "seafood"),
  dryaged: ing("熟成肋眼", "legendary", "meat"),

  // 新巴黎
  almond: ing("杏仁粉", "uncommon", "grain"),
  chocolate: ing("可可", "uncommon", "spice"),
  wine: ing("波爾多紅酒", "rare", "drink"),
  snail: ing("勃根地蝸牛", "rare", "seafood"),
  foiegras: ing("鵝肝", "epic", "meat"),
  truffle: ing("黑松露", "legendary", "veg"),
} satisfies Record<string, Ingredient>

export type IngredientId = keyof typeof INGREDIENTS

export const INGREDIENT_IDS = Object.keys(INGREDIENTS) as IngredientId[]

// Chance of each rarity on a single draw
export const DRAW_WEIGHTS: Record<Rarity, number> = {
  common: 52,
  uncommon: 28,
  rare: 15,
  epic: 4,
  legendary: 1,
}

// Units received from one draw
export const DRAW_PACK_SIZE: Record<Rarity, number> = {
  common: 4,
  uncommon: 3,
  rare: 2,
  epic: 1,
  legendary: 1,
}

// Base vendor price per unit, in credits
export const VENDOR_BASE_PRICE: Record<Rarity, number> = {
  common: 6,
  uncommon: 14,
  rare: 28,
  epic: 70,
  legendary: 160,
}

// ---------- dishes ----------

// Icon shape used for dishes that don't have their own drawing
export type DishKind = "bowl" | "plate" | "drink" | "bread" | "dessert" | "soup"

export interface Dish {
  name: string
  price: number
  cuisine: CountryId
  kind: DishKind
  recipe: Partial<Record<IngredientId, number>>
}

const dish = (
  name: string,
  price: number,
  cuisine: CountryId,
  kind: DishKind,
  recipe: Partial<Record<IngredientId, number>>,
): Dish => ({ name, price, cuisine, kind, recipe })

export const DISHES = {
  // 新台北
  ramen: dish("霓虹拉麵", 45, "taipei", "bowl", { noodle: 2, synmeat: 1, scallion: 1 }),
  battery: dish("電池氣泡飲", 25, "taipei", "drink", { energy: 1, soda: 1 }),
  bun: dish("合成肉包", 35, "taipei", "bread", { synmeat: 1, scallion: 1, noodle: 1 }),
  spicyRice: dish("赤焰炒飯", 70, "taipei", "bowl", { rice: 1, chili: 1, egg: 1 }),
  tomatoEgg: dish("天然番茄炒蛋", 90, "taipei", "plate", { tomato: 2, egg: 2 }),
  wagyuDon: dish("黑市和牛丼", 220, "taipei", "bowl", { wagyu: 1, rice: 2 }),
  braisedPork: dish("滷肉飯", 60, "taipei", "bowl", { rice: 1, pork: 1, soy: 1 }),
  bubbleTea: dish("珍珠奶茶", 45, "taipei", "drink", { tapioca: 1, milk: 1, sugar: 1 }),
  stinkyTofu: dish("麻辣臭豆腐", 65, "taipei", "plate", { stinkytofu: 2, cabbage: 1, chili: 1 }),
  oysterOmelet: dish("蚵仔煎", 95, "taipei", "plate", { oyster: 1, egg: 1, cabbage: 1 }),
  beefNoodle: dish("紅燒牛肉麵", 120, "taipei", "bowl", { noodle: 2, beef: 1, scallion: 1 }),
  bambooSalad: dish("涼筍沙拉", 85, "taipei", "plate", { bamboo: 2, garlic: 1 }),
  oolongTea: dish("凍頂烏龍茶", 190, "taipei", "drink", { oolong: 1, sugar: 1 }),
  mulletPlatter: dish("炙燒烏魚子", 480, "taipei", "plate", { mullet: 1, garlic: 1, scallion: 1 }),

  // 新曼谷
  kaprao: dish("打拋豬飯", 70, "bangkok", "bowl", { pork: 1, basil: 1, rice: 1, chili: 1 }),
  padThai: dish("泰式炒河粉", 90, "bangkok", "plate", { noodle: 2, egg: 1, fishsauce: 1 }),
  tomYum: dish("冬蔭功", 140, "bangkok", "soup", { shrimp: 2, lemongrass: 1, lemon: 1 }),
  greenCurry: dish("綠咖哩雞", 125, "bangkok", "bowl", { chicken: 1, greencurry: 1, coconut: 1 }),
  mangoRice: dish("芒果糯米飯", 110, "bangkok", "dessert", { mango: 1, rice: 1, coconut: 1 }),
  durianShake: dish("榴槤冰沙", 240, "bangkok", "drink", { durian: 1, coconut: 1, sugar: 1 }),
  birdnestSoup: dish("冰糖燕窩", 520, "bangkok", "soup", { birdnest: 1, sugar: 1 }),

  // 新東京
  misoSoup: dish("味噌湯", 50, "tokyo", "soup", { miso: 1, tofu: 1, scallion: 1 }),
  onigiri: dish("海苔飯糰", 40, "tokyo", "plate", { rice: 1, nori: 1 }),
  tempura: dish("炸蝦天婦羅", 130, "tokyo", "plate", { shrimp: 2, flour: 1, egg: 1 }),
  salmonSushi: dish("鮭魚握壽司", 120, "tokyo", "plate", { rice: 1, salmon: 1, wasabi: 1 }),
  matchaLatte: dish("抹茶拿鐵", 95, "tokyo", "drink", { matcha: 1, milk: 1 }),
  toroSushi: dish("大腹握壽司", 300, "tokyo", "plate", { tuna: 1, rice: 1, wasabi: 1 }),
  fuguSashimi: dish("河豚薄造", 560, "tokyo", "plate", { fugu: 1, lemon: 1 }),

  // 新首爾
  tteokbokki: dish("辣炒年糕", 60, "seoul", "plate", { ricecake: 2, gochujang: 1 }),
  bibimbap: dish("石鍋拌飯", 95, "seoul", "bowl", { rice: 1, egg: 1, kimchi: 1, gochujang: 1 }),
  kimchiStew: dish("泡菜鍋", 100, "seoul", "soup", { kimchi: 2, tofu: 1, pork: 1 }),
  friedChicken: dish("韓式炸雞配燒酒", 150, "seoul", "plate", { chicken: 2, flour: 1, soju: 1 }),
  samgyetang: dish("人參雞湯", 280, "seoul", "soup", { chicken: 1, ginseng: 1, rice: 1, garlic: 1 }),
  hanwooBbq: dish("韓牛燒肉", 500, "seoul", "plate", { hanwoo: 1, garlic: 1, lettuce: 1 }),

  // 新紐約
  fries: dish("霓虹薯條", 35, "newyork", "plate", { potato: 2 }),
  hotdog: dish("合成熱狗", 45, "newyork", "bread", { synmeat: 1, flour: 1, onion: 1 }),
  coldBrew: dish("冷萃咖啡", 55, "newyork", "drink", { coffee: 1, milk: 1 }),
  burger: dish("雙層起司堡", 130, "newyork", "bread", { flour: 1, beef: 1, cheese: 1, lettuce: 1 }),
  pizza: dish("紐約大披薩", 120, "newyork", "plate", { flour: 2, tomato: 1, cheese: 1 }),
  pancake: dish("楓糖鬆餅", 110, "newyork", "dessert", { flour: 1, egg: 1, milk: 1, maple: 1 }),
  lobsterRoll: dish("龍蝦堡", 330, "newyork", "bread", { lobster: 1, flour: 1, butter: 1 }),
  ribeye: dish("熟成肋眼牛排", 560, "newyork", "plate", { dryaged: 1, butter: 1, potato: 1 }),

  // 新巴黎
  croissant: dish("奶油可頌", 60, "paris", "bread", { flour: 1, butter: 2 }),
  onionSoup: dish("焗烤洋蔥湯", 90, "paris", "soup", { onion: 2, cheese: 1, flour: 1 }),
  macaron: dish("馬卡龍", 100, "paris", "dessert", { almond: 2, sugar: 1, egg: 1 }),
  lavaCake: dish("熔岩巧克力", 120, "paris", "dessert", { chocolate: 1, butter: 1, egg: 1, flour: 1 }),
  escargot: dish("焗烤蝸牛", 170, "paris", "plate", { snail: 2, butter: 1, garlic: 1 }),
  bourguignon: dish("紅酒燉牛肉", 210, "paris", "soup", { beef: 1, wine: 1, onion: 1 }),
  foieGras: dish("香煎鵝肝", 380, "paris", "plate", { foiegras: 1, wine: 1 }),
  truffleRisotto: dish("黑松露燉飯", 600, "paris", "bowl", { truffle: 1, rice: 1, cheese: 1 }),
} satisfies Record<string, Dish>

export type DishId = keyof typeof DISHES

export const DISH_IDS = Object.keys(DISHES) as DishId[]

// ---------- countries ----------

export interface Country {
  id: CountryId
  name: string
  flag: string
  blurb: string
  // store level index needed before you can move here
  unlockLevel: number
  // credits to move the stall here
  travelCost: number
  // every dish sells for this much more (or less) here
  priceMult: number
  // foreign cuisines that are the rage here and sell at a premium
  craze: CountryId[]
  // ingredients you can draw or buy while you're here
  pool: IngredientId[]
}

const STAPLES: IngredientId[] = ["noodle", "synmeat", "scallion", "energy", "soda", "rice", "egg", "sugar"]

export const COUNTRIES: Record<CountryId, Country> = {
  taipei: {
    id: "taipei",
    name: "新台北",
    flag: "TW",
    blurb: "起點的霓虹夜市，小吃便宜但客人多。",
    unlockLevel: 0,
    travelCost: 0,
    priceMult: 1,
    craze: ["tokyo"],
    pool: [
      ...STAPLES,
      "tomato", "chili", "wagyu", "soy", "cabbage", "garlic", "pork", "milk",
      "tapioca", "stinkytofu", "oyster", "beef", "bamboo", "oolong", "mullet",
    ],
  },
  bangkok: {
    id: "bangkok",
    name: "新曼谷",
    flag: "TH",
    blurb: "水上夜市，香料便宜，熱帶水果是寶。",
    unlockLevel: 1,
    travelCost: 120,
    priceMult: 0.95,
    craze: ["taipei", "seoul"],
    pool: [
      ...STAPLES,
      "chili", "garlic", "pork", "chicken", "shrimp", "lemon", "basil", "fishsauce",
      "lemongrass", "coconut", "greencurry", "mango", "durian", "birdnest",
    ],
  },
  tokyo: {
    id: "tokyo",
    name: "新東京",
    flag: "JP",
    blurb: "高架下的居酒屋街，願意為好食材付高價。",
    unlockLevel: 1,
    travelCost: 200,
    priceMult: 1.25,
    craze: ["paris", "taipei"],
    pool: [
      ...STAPLES,
      "flour", "tofu", "milk", "lemon", "shrimp", "nori", "miso", "salmon",
      "wasabi", "matcha", "tuna", "wagyu", "fugu",
    ],
  },
  seoul: {
    id: "seoul",
    name: "新首爾",
    flag: "KR",
    blurb: "江南地下城，炸雞和燒酒是夜生活的燃料。",
    unlockLevel: 2,
    travelCost: 250,
    priceMult: 1.15,
    craze: ["newyork", "bangkok"],
    pool: [
      ...STAPLES,
      "flour", "garlic", "tofu", "pork", "chicken", "lettuce", "ricecake", "kimchi",
      "gochujang", "soju", "beef", "ginseng", "hanwoo",
    ],
  },
  newyork: {
    id: "newyork",
    name: "新紐約",
    flag: "US",
    blurb: "摩天樓下的 24 小時餐車，什麼都賣得貴。",
    unlockLevel: 2,
    travelCost: 450,
    priceMult: 1.45,
    craze: ["tokyo", "seoul"],
    pool: [
      ...STAPLES,
      "flour", "onion", "potato", "tomato", "lettuce", "milk", "butter", "beef",
      "cheese", "coffee", "maple", "lobster", "dryaged",
    ],
  },
  paris: {
    id: "paris",
    name: "新巴黎",
    flag: "FR",
    blurb: "懸浮塔下的美食之都，頂級食材的天堂。",
    unlockLevel: 3,
    travelCost: 500,
    priceMult: 1.6,
    craze: ["tokyo", "bangkok"],
    pool: [
      ...STAPLES,
      "flour", "onion", "garlic", "potato", "milk", "butter", "lemon", "beef",
      "cheese", "almond", "chocolate", "wine", "snail", "foiegras", "truffle",
    ],
  },
}

export const COUNTRY_IDS = Object.keys(COUNTRIES) as CountryId[]

// Foreign dishes that are the rage in a country sell for this much more
export const CRAZE_BONUS = 1.3
// Today's hot dish in a country sells for this much more
export const HOT_BONUS = 1.5

// ---------- customers ----------

export interface CustomerType {
  id: string
  name: string
  favorites: DishId[]
  tipRate: number
  weight: number
}

export const CUSTOMERS: CustomerType[] = [
  { id: "worker", name: "碼頭工人", favorites: ["ramen", "bun", "braisedPork", "hotdog", "fries", "kaprao"], tipRate: 0.05, weight: 30 },
  { id: "hacker", name: "駭客", favorites: ["battery", "spicyRice", "coldBrew", "bubbleTea", "tteokbokki"], tipRate: 0.1, weight: 22 },
  { id: "cyborg", name: "義肢族", favorites: ["battery", "ramen", "friedChicken", "burger", "padThai"], tipRate: 0.08, weight: 22 },
  { id: "salaryman", name: "企業上班族", favorites: ["tomatoEgg", "spicyRice", "salmonSushi", "bibimbap", "croissant", "matchaLatte"], tipRate: 0.15, weight: 18 },
  { id: "tycoon", name: "天空花園富豪", favorites: ["wagyuDon", "tomatoEgg", "toroSushi", "truffleRisotto", "ribeye", "foieGras"], tipRate: 0.3, weight: 8 },
]

export const GAME_RULES = {
  startCredits: 200,
  extraDrawCost: 30,
  rentEvery: 7,
  adDrawsPerDay: 2,
  vendorRefreshMs: 12 * 60 * 60 * 1000,
  vendorOfferCount: 4,
}

// Rent is due at the end of every GAME_RULES.rentEvery days. It climbs each week
// and with the size of the place, so the run gets harder until you can't pay.
export function rentFor(week: number, level: number): number {
  const w = week - 1
  return 150 + 100 * w + 40 * w * w + 100 * (level - 1)
}

export interface StoreLevel {
  name: string
  // credits to upgrade into this level (0 for the first)
  cost: number
  tables: number
  burners: number
  freeDraws: number
  menuSize: number
  // extra guests per night
  crowd: number
  cookMs: number
  perk: string
}

export const STORE_LEVELS: StoreLevel[] = [
  { name: "夜市餐車", cost: 0, tables: 4, burners: 2, freeDraws: 5, menuSize: 4, crowd: 0, cookMs: 2000, perk: "" },
  { name: "巷口小店", cost: 600, tables: 5, burners: 2, freeDraws: 6, menuSize: 4, crowd: 1, cookMs: 2000, perk: "+1 張桌子、每天 +1 次免費抽、可以去新曼谷和新東京擺攤" },
  { name: "霓虹食堂", cost: 1500, tables: 5, burners: 3, freeDraws: 6, menuSize: 5, crowd: 2, cookMs: 2000, perk: "+1 個爐台、菜單 +1 道、客人變多、開放新首爾和新紐約" },
  { name: "天橋餐廳", cost: 3200, tables: 6, burners: 3, freeDraws: 7, menuSize: 5, crowd: 3, cookMs: 1700, perk: "+1 張桌子、每天 +1 次免費抽、出菜更快、開放新巴黎" },
  { name: "天空花園名店", cost: 5000, tables: 6, burners: 3, freeDraws: 8, menuSize: 6, crowd: 4, cookMs: 1400, perk: "菜單全開、每天 +1 次免費抽、出菜最快" },
]
