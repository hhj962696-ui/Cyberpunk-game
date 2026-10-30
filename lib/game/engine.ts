import {
  COUNTRIES,
  COUNTRY_IDS,
  CRAZE_BONUS,
  CUSTOMERS,
  DISHES,
  DISH_IDS,
  DRAW_PACK_SIZE,
  DRAW_WEIGHTS,
  GAME_RULES,
  HOT_BONUS,
  INGREDIENTS,
  INGREDIENT_IDS,
  rentFor,
  STORE_LEVELS,
  VENDOR_BASE_PRICE,
  RARITIES,
  type CountryId,
  type CustomerType,
  type DishId,
  type IngredientId,
  type Rarity,
  type StoreLevel,
} from "./data"

export type Inventory = Record<IngredientId, number>

export type LogType = "system" | "draw" | "sale" | "miss" | "event" | "result" | "upgrade" | "rent" | "travel"

export interface LogEntry {
  id: number
  day: number
  type: LogType
  message: string
}

export type EventId = "gang" | "critic" | "hack"

export interface PendingEvent {
  id: EventId
}

export type Phase = "prep" | "serving" | "closed" | "gameover"

export interface RunRecord {
  days: number
  level: number
}

export interface GameState {
  version: 3
  day: number
  // where the stall is set up
  country: CountryId
  // credits taken in each country this run (dish price + tips)
  sales: Partial<Record<CountryId, number>>
  // every ingredient the player has ever had, for the catalog
  discovered: IngredientId[]
  // index into STORE_LEVELS
  level: number
  phase: Phase
  credits: number
  reputation: number
  inventory: Inventory
  menu: DishId[]
  freeDrawsLeft: number
  adDrawsLeft: number
  vendorSlot: number
  vendorBought: number[]
  pendingEvent: PendingEvent | null
  log: LogEntry[]
  nextLogId: number
  // the longest run on this device, carried over when starting again
  best: RunRecord
  lastDraw: { id: IngredientId; amount: number; seq: number } | null
  tables: Tile[]
}

export interface Tile {
  x: number
  y: number
}

export type Rng = () => number

const emptyInventory = (): Inventory =>
  Object.fromEntries(INGREDIENT_IDS.map((id) => [id, 0])) as Inventory

export function vendorSlotAt(now: number): number {
  return Math.floor(now / GAME_RULES.vendorRefreshMs)
}

export function storeLevel(state: Pick<GameState, "level">): StoreLevel {
  return STORE_LEVELS[Math.min(state.level, STORE_LEVELS.length - 1)]
}

export function weekOf(day: number): number {
  return Math.ceil(day / GAME_RULES.rentEvery)
}

export function rentDue(state: Pick<GameState, "day" | "level">): { amount: number; inDays: number } {
  const week = weekOf(state.day)
  return { amount: rentFor(week, state.level + 1), inDays: week * GAME_RULES.rentEvery - state.day }
}

export function newGame(now: number, best: RunRecord = { days: 0, level: 0 }): GameState {
  const inventory = emptyInventory()
  inventory.noodle = 4
  inventory.synmeat = 2
  inventory.scallion = 2
  inventory.energy = 1
  inventory.soda = 1
  const state: GameState = {
    version: 3,
    day: 1,
    country: "taipei",
    sales: {},
    discovered: INGREDIENT_IDS.filter((id) => inventory[id] > 0),
    level: 0,
    phase: "prep",
    credits: GAME_RULES.startCredits,
    reputation: 0,
    inventory,
    menu: ["ramen", "battery"],
    freeDrawsLeft: STORE_LEVELS[0].freeDraws,
    adDrawsLeft: GAME_RULES.adDrawsPerDay,
    vendorSlot: vendorSlotAt(now),
    vendorBought: [],
    pendingEvent: null,
    log: [],
    nextLogId: 1,
    best,
    lastDraw: null,
    tables: DEFAULT_TABLES,
  }
  return addLog(
    state,
    "system",
    `>> 第 1 天。你在下城巷弄開了一台餐車。每 ${GAME_RULES.rentEvery} 天要繳一次房租，存錢把餐車升級成名店吧。`,
  )
}

function addLog(state: GameState, type: LogType, message: string): GameState {
  const entry: LogEntry = { id: state.nextLogId, day: state.day, type, message }
  return { ...state, log: [...state.log, entry].slice(-200), nextLogId: state.nextLogId + 1 }
}

// ---------- recipes ----------

export function craftableCount(inventory: Inventory, dishId: DishId): number {
  const recipe = DISHES[dishId].recipe
  let count = Infinity
  for (const [id, need] of Object.entries(recipe) as [IngredientId, number][]) {
    count = Math.min(count, Math.floor(inventory[id] / need))
  }
  return count === Infinity ? 0 : count
}

export function missingFor(inventory: Inventory, dishId: DishId): { id: IngredientId; short: number }[] {
  const recipe = DISHES[dishId].recipe
  return (Object.entries(recipe) as [IngredientId, number][])
    .filter(([id, need]) => inventory[id] < need)
    .map(([id, need]) => ({ id, short: need - inventory[id] }))
}

function consume(inventory: Inventory, dishId: DishId): Inventory {
  const next = { ...inventory }
  for (const [id, need] of Object.entries(DISHES[dishId].recipe) as [IngredientId, number][]) {
    next[id] -= need
  }
  return next
}

// ---------- drawing ----------

function pickRarity(rng: Rng): Rarity {
  const total = RARITIES.reduce((sum, r) => sum + DRAW_WEIGHTS[r], 0)
  let roll = rng() * total
  for (const rarity of RARITIES) {
    roll -= DRAW_WEIGHTS[rarity]
    if (roll < 0) return rarity
  }
  return "common"
}

function pick<T>(items: T[], rng: Rng): T {
  return items[Math.floor(rng() * items.length) % items.length]
}

// Draws come from what the current country's market carries. If it has nothing of
// the rolled rarity, the draw falls back to the next easier one.
export function drawIngredient(rng: Rng, pool: IngredientId[]): IngredientId {
  let tier = RARITIES.indexOf(pickRarity(rng))
  for (; tier > 0; tier--) {
    if (pool.some((id) => INGREDIENTS[id].rarity === RARITIES[tier])) break
  }
  const matching = pool.filter((id) => INGREDIENTS[id].rarity === RARITIES[tier])
  return pick(matching.length > 0 ? matching : pool, rng)
}

function discover(state: GameState, id: IngredientId): GameState {
  return state.discovered.includes(id) ? state : { ...state, discovered: [...state.discovered, id] }
}

export function draw(state: GameState, rng: Rng): GameState {
  if (state.phase !== "prep") return state
  if (state.freeDrawsLeft > 0) {
    return drawInto({ ...state, freeDrawsLeft: state.freeDrawsLeft - 1 }, rng)
  }
  if (state.credits >= GAME_RULES.extraDrawCost) {
    return drawInto({ ...state, credits: state.credits - GAME_RULES.extraDrawCost }, rng)
  }
  return addLog(state, "system", "信用點不足，無法加抽。")
}

// Reward for watching an ad: one free draw, a few times per day
export function adDraw(state: GameState, rng: Rng): GameState {
  if (state.phase !== "prep" || state.adDrawsLeft <= 0) return state
  return drawInto({ ...state, adDrawsLeft: state.adDrawsLeft - 1 }, rng)
}

export function noteAdUnavailable(state: GameState): GameState {
  return addLog(state, "system", "廣告沒有播完，這次沒有獎勵。")
}

function drawInto(state: GameState, rng: Rng): GameState {
  const id = drawIngredient(rng, COUNTRIES[state.country].pool)
  const ing = INGREDIENTS[id]
  const amount = DRAW_PACK_SIZE[ing.rarity]
  const isNew = !state.discovered.includes(id)
  const next: GameState = {
    ...discover(state, id),
    inventory: { ...state.inventory, [id]: state.inventory[id] + amount },
    lastDraw: { id, amount, seq: (state.lastDraw?.seq ?? 0) + 1 },
  }
  const tag = ing.rarity === "legendary" ? "★傳說★ " : ing.rarity === "epic" ? "珍稀 " : ing.rarity === "rare" ? "特產 " : ""
  return addLog(next, "draw", `抽到 ${tag}[${ing.name}] ×${amount}${isNew ? "（圖鑑新登錄！）" : ""}`)
}

// ---------- vendor ----------

export interface VendorOffer {
  ingredient: IngredientId
  price: number
  stock: number
}

// Small deterministic PRNG so every player sees the same stall for a 12-hour window
export function seededRng(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Each country's stall carries its own goods
export function vendorOffers(slot: number, country: CountryId): VendorOffer[] {
  const rng = seededRng(slot * 7919 + 17 + COUNTRY_IDS.indexOf(country) * 104729)
  const pool = COUNTRIES[country].pool
  const offers: VendorOffer[] = []
  const used = new Set<IngredientId>()
  while (offers.length < Math.min(GAME_RULES.vendorOfferCount, pool.length)) {
    const id = drawIngredient(rng, pool)
    if (used.has(id)) continue
    used.add(id)
    const base = VENDOR_BASE_PRICE[INGREDIENTS[id].rarity]
    const price = Math.round(base * (0.8 + rng() * 0.5))
    const rarity = INGREDIENTS[id].rarity
    const stock = rarity === "legendary" || rarity === "epic" ? 1 : 2 + Math.floor(rng() * 4)
    offers.push({ ingredient: id, price, stock })
  }
  return offers
}

// Reset what was bought once the 12-hour window rolls over
export function syncVendor(state: GameState, now: number): GameState {
  const slot = vendorSlotAt(now)
  if (slot === state.vendorSlot) return state
  return { ...state, vendorSlot: slot, vendorBought: [] }
}

export function buyFromVendor(state: GameState, offerIndex: number, now: number): GameState {
  let next = syncVendor(state, now)
  if (next.phase !== "prep") return next
  const offer = vendorOffers(next.vendorSlot, next.country)[offerIndex]
  if (!offer) return next
  const bought = next.vendorBought[offerIndex] ?? 0
  if (bought >= offer.stock) return addLog(next, "system", "攤販這項已經賣完了。")
  if (next.credits < offer.price) return addLog(next, "system", "信用點不足。")
  const vendorBought = [...next.vendorBought]
  vendorBought[offerIndex] = bought + 1
  next = {
    ...discover(next, offer.ingredient),
    credits: next.credits - offer.price,
    vendorBought,
    inventory: { ...next.inventory, [offer.ingredient]: next.inventory[offer.ingredient] + 1 },
  }
  return addLog(next, "draw", `向攤販買了 [${INGREDIENTS[offer.ingredient].name}]，花費 ${offer.price} 信用點`)
}

// ---------- menu ----------

export function toggleMenu(state: GameState, dishId: DishId): GameState {
  if (state.phase !== "prep") return state
  if (state.menu.includes(dishId)) {
    return { ...state, menu: state.menu.filter((d) => d !== dishId) }
  }
  const size = storeLevel(state).menuSize
  if (state.menu.length >= size) {
    return addLog(state, "system", `菜單最多只能放 ${size} 道菜，升級店面可以多放。`)
  }
  return { ...state, menu: [...state.menu, dishId] }
}

// ---------- restaurant layout ----------

// The floor is ROOM_SIZE x ROOM_SIZE tiles. Each table has a chair north and south of it.
export const ROOM_SIZE = 8
export const DOOR: Tile = { x: 0, y: 6 }
export const KITCHEN_TILES: Tile[] = [
  { x: 5, y: 0 },
  { x: 6, y: 0 },
  { x: 7, y: 0 },
  { x: 6, y: 1 },
]
export const DEFAULT_TABLES: Tile[] = [
  { x: 2, y: 2 },
  { x: 4, y: 2 },
  { x: 2, y: 5 },
  { x: 5, y: 5 },
]

export function chairsOf(table: Tile): Tile[] {
  return [
    { x: table.x, y: table.y - 1 },
    { x: table.x, y: table.y + 1 },
  ]
}

export function seatsOf(tables: Tile[]): Tile[] {
  return tables.flatMap(chairsOf)
}

const sameTile = (a: Tile, b: Tile) => a.x === b.x && a.y === b.y

export function canPlaceTable(tables: Tile[], index: number, to: Tile): boolean {
  const footprint = [to, ...chairsOf(to)]
  const others = tables.filter((_, i) => i !== index).flatMap((t) => [t, ...chairsOf(t)])
  const blocked = [...KITCHEN_TILES, DOOR, ...others]
  return footprint.every(
    (t) => t.x >= 0 && t.y >= 0 && t.x < ROOM_SIZE && t.y < ROOM_SIZE && !blocked.some((b) => sameTile(b, t)),
  )
}

export function moveTable(state: GameState, index: number, to: Tile): GameState {
  if (state.phase === "serving" || !canPlaceTable(state.tables, index, to)) return state
  return { ...state, tables: state.tables.map((t, i) => (i === index ? to : t)) }
}

// ---------- business night (played live) ----------

export function pickCustomer(rng: Rng): CustomerType {
  const total = CUSTOMERS.reduce((sum, c) => sum + c.weight, 0)
  let roll = rng() * total
  for (const c of CUSTOMERS) {
    roll -= c.weight
    if (roll < 0) return c
  }
  return CUSTOMERS[0]
}

// Customers order a favorite (or the country's hot dish of the day) from the menu when
// they can, otherwise anything on it. They don't know what's in the kitchen, so the
// player has to have the ingredients.
export function chooseOrder(
  customer: CustomerType,
  menu: DishId[],
  rng: Rng,
  hot?: DishId,
): { dish: DishId; favorite: boolean } | null {
  if (menu.length === 0) return null
  const favorites = [...customer.favorites, ...(hot ? [hot] : [])].filter((d) => menu.includes(d))
  if (favorites.length > 0) return { dish: pick(favorites, rng), favorite: true }
  return { dish: pick(menu, rng), favorite: false }
}

export function shiftCustomerCount(reputation: number, level: number, rng: Rng): number {
  const crowd = STORE_LEVELS[Math.min(level, STORE_LEVELS.length - 1)].crowd
  return 6 + crowd + Math.floor(Math.max(0, reputation) / 4) + Math.floor(rng() * 3)
}

export function startShift(state: GameState): GameState {
  if (state.phase !== "prep" || state.menu.length === 0) return state
  return addLog({ ...state, phase: "serving" }, "system", `>> 第 ${state.day} 天晚上，開始營業。`)
}

export function cookDish(state: GameState, dishId: DishId): GameState {
  if (state.phase !== "serving" || craftableCount(state.inventory, dishId) === 0) return state
  return { ...state, inventory: consume(state.inventory, dishId) }
}

// ---------- countries ----------

// Each country has one dish of the day, from its own cuisine or one it's crazy about
export function hotDish(country: CountryId, day: number): DishId {
  const cuisines = [country, ...COUNTRIES[country].craze]
  const options = DISH_IDS.filter((d) => cuisines.includes(DISHES[d].cuisine))
  return pick(options, seededRng(day * 31 + COUNTRY_IDS.indexOf(country) * 997))
}

export function dishPrice(dishId: DishId, country: CountryId, day: number): number {
  const c = COUNTRIES[country]
  let price = DISHES[dishId].price * c.priceMult
  if (c.craze.includes(DISHES[dishId].cuisine)) price *= CRAZE_BONUS
  if (hotDish(country, day) === dishId) price *= HOT_BONUS
  return Math.round(price)
}

export function priceHere(state: Pick<GameState, "country" | "day">, dishId: DishId): number {
  return dishPrice(dishId, state.country, state.day)
}

export function canTravel(state: GameState, country: CountryId): boolean {
  const c = COUNTRIES[country]
  return (
    state.phase === "prep" && country !== state.country && state.level >= c.unlockLevel && state.credits >= c.travelCost
  )
}

// Moving the stall happens during the day and you open there tonight. The pantry
// comes along, so ingredients bought abroad can be sold anywhere.
export function travel(state: GameState, country: CountryId): GameState {
  const c = COUNTRIES[country]
  if (state.phase !== "prep" || country === state.country) return state
  if (state.level < c.unlockLevel) return addLog(state, "system", `要先把店升級成「${STORE_LEVELS[c.unlockLevel].name}」才能去${c.name}。`)
  if (state.credits < c.travelCost) return addLog(state, "system", `去${c.name}的運費要 ${c.travelCost} 信用點。`)
  return addLog(
    { ...state, country, credits: state.credits - c.travelCost },
    "travel",
    `>> 餐車搬到了${c.name}${c.travelCost > 0 ? `，運費 ${c.travelCost} 信用點` : ""}。今天的招牌是 [${DISHES[hotDish(country, state.day)].name}]。`,
  )
}

// patience: share of the customer's patience left when served (0..1)
export function tipFor(customer: CustomerType, price: number, favorite: boolean, patience: number): number {
  return Math.round(price * customer.tipRate * (favorite ? 1 : 0.5) * (0.5 + patience))
}

export function serveCustomer(
  state: GameState,
  customer: CustomerType,
  dishId: DishId,
  favorite: boolean,
  patience: number,
): GameState {
  const price = priceHere(state, dishId)
  const tip = tipFor(customer, price, favorite, patience)
  const rep = favorite ? 2 : 1
  const sales = { ...state.sales, [state.country]: (state.sales[state.country] ?? 0) + price + tip }
  let next: GameState = { ...state, credits: state.credits + price + tip, reputation: state.reputation + rep, sales }
  next = addLog(
    next,
    "sale",
    `${customer.name} 吃到 [${DISHES[dishId].name}]${favorite ? "，是最愛！" : "。"} +${price} 小費 +${tip}`,
  )
  return next
}

export function customerWalkout(state: GameState, customer: CustomerType): GameState {
  return addLog({ ...state, reputation: state.reputation - 1 }, "miss", `${customer.name} 等太久，氣沖沖地走了。聲望 -1`)
}

export interface ShiftSummary {
  guests: number
  served: number
  lost: number
  income: number
  wasted: number
}

export function endShift(state: GameState, summary: ShiftSummary, rng: Rng): GameState {
  if (state.phase !== "serving") return state
  let next = addLog(
    { ...state, phase: "closed" },
    "result",
    `打烊結算：來客 ${summary.guests}，服務 ${summary.served}，流失 ${summary.lost}，收入 ${summary.income} 信用點。` +
      (summary.wasted > 0 ? `浪費了 ${summary.wasted} 份沒送出的菜。` : ""),
  )
  if (rng() < 0.4) {
    const id = pick<EventId>(["gang", "critic", "hack"], rng)
    next = { ...next, pendingEvent: { id } }
    next = addLog(next, "event", EVENTS[id].intro)
  }
  return next
}

// ---------- events ----------

export interface EventChoice {
  label: string
  hint: string
}

export const EVENTS: Record<EventId, { title: string; intro: string; choices: EventChoice[] }> = {
  gang: {
    title: "幫派收保護費",
    intro: "!! 打烊時，三個戴著鉻合金面具的幫派份子堵住了餐車：「保護費，60 信用點。」",
    choices: [
      { label: "付錢了事", hint: "-60 信用點" },
      { label: "拒絕", hint: "有一半機率被砸攤，損失部分食材" },
    ],
  },
  critic: {
    title: "美食評論家",
    intro: "!! 一位戴著全息墨鏡的美食評論家在收攤前坐了下來，想嚐嚐你的招牌菜。",
    choices: [
      { label: "端上招牌菜", hint: "用掉一份最貴的可做菜色，聲望 +6" },
      { label: "說今天打烊了", hint: "沒有影響" },
    ],
  },
  hack: {
    title: "駭客入侵收銀",
    intro: "!! 收銀系統螢幕閃爍，有駭客正在入侵你的帳戶！",
    choices: [
      { label: "請人修補防火牆", hint: "-50 信用點" },
      { label: "不理它", hint: "損失 20% 信用點" },
    ],
  },
}

export function resolveEvent(state: GameState, choice: number, rng: Rng): GameState {
  const event = state.pendingEvent
  if (!event) return state
  let next: GameState = { ...state, pendingEvent: null }
  if (event.id === "gang") {
    if (choice === 0) {
      const paid = Math.min(60, next.credits)
      next = addLog({ ...next, credits: next.credits - paid }, "event", `你付了 ${paid} 信用點，幫派滿意地離開。`)
    } else if (rng() < 0.5) {
      const inventory = { ...next.inventory }
      for (const id of INGREDIENT_IDS) inventory[id] = Math.floor(inventory[id] / 2)
      next = addLog({ ...next, inventory }, "event", "幫派砸了餐車，你的食材少了一半。")
    } else {
      next = addLog({ ...next, reputation: next.reputation + 2 }, "event", "你硬是把他們瞪走了，街坊對你刮目相看。聲望 +2")
    }
  } else if (event.id === "critic") {
    if (choice === 0) {
      const best = DISH_IDS.filter((d) => craftableCount(next.inventory, d) > 0).sort(
        (a, b) => DISHES[b].price - DISHES[a].price,
      )[0]
      if (best) {
        next = { ...next, inventory: consume(next.inventory, best), reputation: next.reputation + 6 }
        next = addLog(next, "event", `評論家吃完 [${DISHES[best].name}]，在網路上大力推薦。聲望 +6`)
      } else {
        next = addLog({ ...next, reputation: next.reputation - 2 }, "event", "你什麼都做不出來，評論家搖頭離開。聲望 -2")
      }
    } else {
      next = addLog(next, "event", "評論家聳聳肩離開了。")
    }
  } else {
    if (choice === 0) {
      const paid = Math.min(50, next.credits)
      next = addLog({ ...next, credits: next.credits - paid }, "event", `防火牆修好了，花了 ${paid} 信用點。`)
    } else {
      const lost = Math.floor(next.credits * 0.2)
      next = addLog({ ...next, credits: next.credits - lost }, "event", `駭客捲走了 ${lost} 信用點。`)
    }
  }
  return next
}

// ---------- store upgrades ----------

export function nextStoreLevel(state: Pick<GameState, "level">): StoreLevel | null {
  return STORE_LEVELS[state.level + 1] ?? null
}

// First spot (scanning row by row) where a new table and its chairs fit
function freeTableSpot(tables: Tile[]): Tile | null {
  for (let y = 0; y < ROOM_SIZE; y++) {
    for (let x = 0; x < ROOM_SIZE; x++) {
      if (canPlaceTable(tables, -1, { x, y })) return { x, y }
    }
  }
  return null
}

export function upgradeStore(state: GameState): GameState {
  const target = nextStoreLevel(state)
  if (!target || state.phase === "serving" || state.phase === "gameover") return state
  if (state.credits < target.cost) return addLog(state, "system", `升級成「${target.name}」需要 ${target.cost} 信用點。`)
  const tables = [...state.tables]
  while (tables.length < target.tables) {
    const spot = freeTableSpot(tables)
    if (!spot) break
    tables.push(spot)
  }
  const current = storeLevel(state)
  const next: GameState = {
    ...state,
    level: state.level + 1,
    credits: state.credits - target.cost,
    tables,
    // the extra draws apply right away if you upgrade before drawing today
    freeDrawsLeft: state.phase === "prep" ? state.freeDrawsLeft + target.freeDraws - current.freeDraws : state.freeDrawsLeft,
  }
  return addLog(next, "upgrade", `>> 店面升級成「${target.name}」！${target.perk}`)
}

// ---------- day transition ----------

function withBest(state: GameState): GameState {
  const best = {
    days: Math.max(state.best.days, state.day),
    level: Math.max(state.best.level, state.level),
  }
  return { ...state, best }
}

export function nextDay(state: GameState): GameState {
  if (state.phase !== "closed" || state.pendingEvent) return state
  let next: GameState = state
  if (state.day % GAME_RULES.rentEvery === 0) {
    const rent = rentDue(state).amount
    if (state.credits < rent) {
      const over = withBest({ ...state, phase: "gameover" })
      return addLog(
        over,
        "result",
        `>> 房租 ${rent} 信用點繳不出來，房東把${storeLevel(state).name}收回了。你撐了 ${state.day} 天。`,
      )
    }
    next = addLog({ ...next, credits: next.credits - rent }, "rent", `繳了第 ${weekOf(state.day)} 週房租 ${rent} 信用點。`)
  }
  const free = storeLevel(next).freeDraws
  next = withBest({ ...next, day: next.day + 1, phase: "prep", freeDrawsLeft: free, adDrawsLeft: GAME_RULES.adDrawsPerDay })
  const upcoming = rentDue(next)
  return addLog(
    next,
    "system",
    `>> 第 ${next.day} 天。今天的 ${free} 次免費抽取已補滿，${COUNTRIES[next.country].name}今天的招牌是 [${DISHES[hotDish(next.country, next.day)].name}]。` +
      (next.day % GAME_RULES.rentEvery === 1 ? `這週房租 ${upcoming.amount} 信用點，${upcoming.inDays} 天後打烊時繳。` : ""),
  )
}

// ---------- persistence ----------

export const SAVE_KEY = "neon-night-market-save"

export function loadGame(raw: string | null, now: number): GameState {
  if (!raw) return newGame(now)
  try {
    const parsed = JSON.parse(raw) as Omit<Partial<GameState>, "version"> & { version: number; won?: unknown }
    if (parsed.version !== 1 && parsed.version !== 2 && parsed.version !== 3) return newGame(now)
    // v1 was a fixed 7-day run; a finished one starts over, an unfinished one keeps going
    if (parsed.version === 1 && parsed.phase === "gameover") return newGame(now)
    const { won: _won, ...rest } = parsed
    const inventory = { ...emptyInventory(), ...parsed.inventory }
    let state = {
      lastDraw: null,
      tables: DEFAULT_TABLES,
      level: 0,
      adDrawsLeft: GAME_RULES.adDrawsPerDay,
      best: { days: 0, level: 0 },
      country: "taipei",
      sales: {},
      discovered: INGREDIENT_IDS.filter((id) => inventory[id] > 0),
      ...rest,
      version: 3,
      inventory,
    } as GameState
    // The page was closed mid-shift: the night is over
    if (state.phase === "serving") {
      state = addLog({ ...state, phase: "closed" }, "system", "營業中途離開，今晚提早打烊了。")
    }
    return syncVendor(state, now)
  } catch {
    return newGame(now)
  }
}
