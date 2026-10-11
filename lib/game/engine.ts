import {
  CUSTOMERS,
  DISHES,
  DISH_IDS,
  DRAW_PACK_SIZE,
  DRAW_WEIGHTS,
  GAME_RULES,
  INGREDIENTS,
  INGREDIENT_IDS,
  VENDOR_BASE_PRICE,
  type DishId,
  type IngredientId,
  type Rarity,
} from "./data"

export type Inventory = Record<IngredientId, number>

export type LogType = "system" | "draw" | "sale" | "miss" | "event" | "result"

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

export type Phase = "prep" | "closed" | "gameover"

export interface GameState {
  version: 1
  day: number
  phase: Phase
  credits: number
  reputation: number
  inventory: Inventory
  menu: DishId[]
  freeDrawsLeft: number
  vendorSlot: number
  vendorBought: number[]
  pendingEvent: PendingEvent | null
  log: LogEntry[]
  nextLogId: number
  won: boolean | null
}

export type Rng = () => number

const emptyInventory = (): Inventory =>
  Object.fromEntries(INGREDIENT_IDS.map((id) => [id, 0])) as Inventory

export function vendorSlotAt(now: number): number {
  return Math.floor(now / GAME_RULES.vendorRefreshMs)
}

export function newGame(now: number): GameState {
  const inventory = emptyInventory()
  inventory.noodle = 4
  inventory.synmeat = 2
  inventory.scallion = 2
  inventory.energy = 1
  inventory.soda = 1
  const state: GameState = {
    version: 1,
    day: 1,
    phase: "prep",
    credits: GAME_RULES.startCredits,
    reputation: 0,
    inventory,
    menu: ["ramen", "battery"],
    freeDrawsLeft: GAME_RULES.freeDrawsPerDay,
    vendorSlot: vendorSlotAt(now),
    vendorBought: [],
    pendingEvent: null,
    log: [],
    nextLogId: 1,
    won: null,
  }
  return addLog(
    state,
    "system",
    `>> 第 1 天。你在下城巷弄開了一台餐車。目標：第 ${GAME_RULES.lastDay} 天結束前存到 ${GAME_RULES.goalCredits} 信用點。`,
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
  const total = DRAW_WEIGHTS.common + DRAW_WEIGHTS.rare + DRAW_WEIGHTS.legendary
  let roll = rng() * total
  for (const rarity of ["common", "rare", "legendary"] as Rarity[]) {
    roll -= DRAW_WEIGHTS[rarity]
    if (roll < 0) return rarity
  }
  return "common"
}

function pick<T>(items: T[], rng: Rng): T {
  return items[Math.floor(rng() * items.length) % items.length]
}

export function drawIngredient(rng: Rng): IngredientId {
  const rarity = pickRarity(rng)
  return pick(INGREDIENT_IDS.filter((id) => INGREDIENTS[id].rarity === rarity), rng)
}

export function draw(state: GameState, rng: Rng): GameState {
  if (state.phase !== "prep") return state
  let next = state
  if (state.freeDrawsLeft > 0) {
    next = { ...next, freeDrawsLeft: next.freeDrawsLeft - 1 }
  } else if (state.credits >= GAME_RULES.extraDrawCost) {
    next = { ...next, credits: next.credits - GAME_RULES.extraDrawCost }
  } else {
    return addLog(state, "system", "信用點不足，無法加抽。")
  }
  const id = drawIngredient(rng)
  const ing = INGREDIENTS[id]
  const amount = DRAW_PACK_SIZE[ing.rarity]
  next = { ...next, inventory: { ...next.inventory, [id]: next.inventory[id] + amount } }
  const tag = ing.rarity === "legendary" ? "★傳說★ " : ing.rarity === "rare" ? "稀有 " : ""
  return addLog(next, "draw", `抽到 ${tag}[${ing.name}] ×${amount}`)
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

export function vendorOffers(slot: number): VendorOffer[] {
  const rng = seededRng(slot * 7919 + 17)
  const offers: VendorOffer[] = []
  const used = new Set<IngredientId>()
  while (offers.length < GAME_RULES.vendorOfferCount) {
    const id = drawIngredient(rng)
    if (used.has(id)) continue
    used.add(id)
    const base = VENDOR_BASE_PRICE[INGREDIENTS[id].rarity]
    const price = Math.round(base * (0.8 + rng() * 0.5))
    const stock = INGREDIENTS[id].rarity === "legendary" ? 1 : 2 + Math.floor(rng() * 4)
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
  const offer = vendorOffers(next.vendorSlot)[offerIndex]
  if (!offer) return next
  const bought = next.vendorBought[offerIndex] ?? 0
  if (bought >= offer.stock) return addLog(next, "system", "攤販這項已經賣完了。")
  if (next.credits < offer.price) return addLog(next, "system", "信用點不足。")
  const vendorBought = [...next.vendorBought]
  vendorBought[offerIndex] = bought + 1
  next = {
    ...next,
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
  if (state.menu.length >= GAME_RULES.maxMenuSize) {
    return addLog(state, "system", `菜單最多只能放 ${GAME_RULES.maxMenuSize} 道菜。`)
  }
  return { ...state, menu: [...state.menu, dishId] }
}

// ---------- business night ----------

function pickCustomer(rng: Rng) {
  const total = CUSTOMERS.reduce((sum, c) => sum + c.weight, 0)
  let roll = rng() * total
  for (const c of CUSTOMERS) {
    roll -= c.weight
    if (roll < 0) return c
  }
  return CUSTOMERS[0]
}

export function customerCount(reputation: number, rng: Rng): number {
  return 5 + Math.floor(Math.max(0, reputation) / 4) + Math.floor(rng() * 4)
}

export function openBusiness(state: GameState, rng: Rng): GameState {
  if (state.phase !== "prep") return state
  let next = addLog(state, "system", `>> 第 ${state.day} 天晚上，開始營業。`)
  const guests = customerCount(state.reputation, rng)
  let income = 0
  let served = 0
  let lost = 0
  for (let i = 0; i < guests; i++) {
    const customer = pickCustomer(rng)
    const available = next.menu.filter((d) => craftableCount(next.inventory, d) > 0)
    const favorite = customer.favorites.find((d) => available.includes(d))
    const dish = favorite ?? (available.length > 0 ? pick(available, rng) : null)
    if (!dish) {
      lost++
      next = { ...next, reputation: next.reputation - 1 }
      next = addLog(next, "miss", `${customer.name} 看了看菜單，沒有能點的菜，失望離開。聲望 -1`)
      continue
    }
    const tip = favorite ? Math.round(DISHES[dish].price * customer.tipRate) : 0
    const rep = favorite ? 2 : 1
    income += DISHES[dish].price + tip
    served++
    next = {
      ...next,
      inventory: consume(next.inventory, dish),
      credits: next.credits + DISHES[dish].price + tip,
      reputation: next.reputation + rep,
    }
    next = addLog(
      next,
      "sale",
      favorite
        ? `${customer.name} 點了最愛的 [${DISHES[dish].name}]！+${DISHES[dish].price} 小費 +${tip}`
        : `${customer.name} 勉強點了 [${DISHES[dish].name}]。+${DISHES[dish].price}`,
    )
  }
  next = addLog(next, "result", `打烊結算：來客 ${guests}，服務 ${served}，流失 ${lost}，收入 ${income} 信用點。`)
  next = { ...next, phase: "closed" }

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

// ---------- day transition ----------

export function nextDay(state: GameState): GameState {
  if (state.phase !== "closed" || state.pendingEvent) return state
  if (state.day >= GAME_RULES.lastDay) {
    const won = state.credits >= GAME_RULES.goalCredits
    const next: GameState = { ...state, phase: "gameover", won }
    return addLog(
      next,
      "system",
      won
        ? `>> 第 ${GAME_RULES.lastDay} 天結束，你存到 ${state.credits} 信用點！餐車升級成小店，霓虹夜市記住了你的名字。`
        : `>> 第 ${GAME_RULES.lastDay} 天結束，只存到 ${state.credits} 信用點，離目標 ${GAME_RULES.goalCredits} 還差一點。再試一次吧。`,
    )
  }
  const next: GameState = {
    ...state,
    day: state.day + 1,
    phase: "prep",
    freeDrawsLeft: GAME_RULES.freeDrawsPerDay,
  }
  return addLog(next, "system", `>> 第 ${next.day} 天。今天的 ${GAME_RULES.freeDrawsPerDay} 次免費抽取已補滿。`)
}

// ---------- persistence ----------

export const SAVE_KEY = "neon-night-market-save"

export function loadGame(raw: string | null, now: number): GameState {
  if (!raw) return newGame(now)
  try {
    const parsed = JSON.parse(raw) as GameState
    if (parsed.version !== 1) return newGame(now)
    return syncVendor({ ...parsed, inventory: { ...emptyInventory(), ...parsed.inventory } }, now)
  } catch {
    return newGame(now)
  }
}
