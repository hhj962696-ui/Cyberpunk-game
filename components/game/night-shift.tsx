"use client"

import { useEffect, useRef, useState } from "react"
import { ChefHat, Flame, Hammer, Moon, Trash2, Users } from "lucide-react"
import { DISHES, type CustomerType, type DishId } from "@/lib/game/data"
import { sfx } from "@/lib/game/sound"
import {
  chooseOrder,
  cookDish,
  craftableCount,
  customerWalkout,
  DOOR,
  endShift,
  moveTable,
  pickCustomer,
  seatsOf,
  serveCustomer,
  shiftCustomerCount,
  startShift,
  storeLevel,
  tipFor,
  type GameState,
  type Inventory,
  type ShiftSummary,
  type Tile,
} from "@/lib/game/engine"
import { DishIcon } from "./food-icon"
import { RestaurantFloor, type FloorFloat, type FloorGuest } from "./restaurant-floor"

const SHIFT_MS = 75_000
const LAST_ARRIVAL_MS = SHIFT_MS - 10_000
const WALK_SPEED = 3 / 1000 // tiles per ms
const COUNTER_SIZE = 4
const TICK_MS = 100
const WRONG_DISH_PENALTY_MS = 3000

interface Point {
  u: number
  v: number
}

interface Guest {
  key: number
  seat: number
  customer: CustomerType
  dish: DishId
  favorite: boolean
  patience: number
  maxPatience: number
  phase: "in" | "seated" | "out"
  path: Point[]
  walked: number
  mood: "ok" | "happy" | "angry"
}

interface Float extends FloorFloat {
  until: number
}

// Walk in through the door, along the front row, then up to the chair
function pathTo(seat: Tile): Point[] {
  const row = DOOR.y + 0.5
  return [
    { u: -1, v: row },
    { u: 0.5, v: row },
    { u: seat.x + 0.5, v: row },
    { u: seat.x + 0.5, v: seat.y + 0.5 },
  ]
}

function pathLength(path: Point[]) {
  let len = 0
  for (let i = 1; i < path.length; i++) len += Math.abs(path[i].u - path[i - 1].u) + Math.abs(path[i].v - path[i - 1].v)
  return len
}

function pointAt(path: Point[], dist: number): Point {
  let left = dist
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]
    const b = path[i]
    const seg = Math.abs(b.u - a.u) + Math.abs(b.v - a.v)
    if (left <= seg) {
      const t = seg === 0 ? 0 : left / seg
      return { u: a.u + (b.u - a.u) * t, v: a.v + (b.v - a.v) * t }
    }
    left -= seg
  }
  return path[path.length - 1]
}

interface Scene {
  elapsed: number
  totalGuests: number
  toSpawn: number
  nextSpawnAt: number
  guests: Guest[]
  burners: ({ dish: DishId; left: number } | null)[]
  cookMs: number
  plates: { key: number; dish: DishId }[]
  selected: number | null
  floats: Float[]
  summary: ShiftSummary
  nextKey: number
  done: boolean
}

function newScene(state: GameState): Scene {
  const total = shiftCustomerCount(state.reputation, state.level, Math.random)
  const level = storeLevel(state)
  return {
    elapsed: 0,
    totalGuests: total,
    toSpawn: total,
    nextSpawnAt: 800,
    guests: [],
    burners: Array(level.burners).fill(null),
    cookMs: level.cookMs,
    plates: [],
    selected: null,
    floats: [],
    summary: { guests: 0, served: 0, lost: 0, income: 0, wasted: 0 },
    nextKey: 1,
    done: false,
  }
}

interface Props {
  state: GameState
  act: (fn: (s: GameState) => GameState) => void
}

export function NightShift({ state, act }: Props) {
  const sceneRef = useRef<Scene | null>(null)
  const menuRef = useRef(state.menu)
  const invRef = useRef<Inventory>(state.inventory)
  const seatsRef = useRef(seatsOf(state.tables))
  const [, setFrame] = useState(0)
  const [decorating, setDecorating] = useState(false)
  const [selectedTable, setSelectedTable] = useState<number | null>(null)
  const [lastSummary, setLastSummary] = useState<ShiftSummary | null>(null)

  menuRef.current = state.menu
  invRef.current = state.inventory
  seatsRef.current = seatsOf(state.tables)

  if (state.phase === "serving" && (!sceneRef.current || sceneRef.current.done)) {
    sceneRef.current = newScene(state)
  }

  const serving = state.phase === "serving"

  useEffect(() => {
    if (!serving) return
    const timer = setInterval(() => {
      const sc = sceneRef.current
      if (!sc || sc.done) return
      sc.elapsed += TICK_MS
      const now = sc.elapsed

      // arrivals
      const seats = seatsRef.current
      if (sc.toSpawn > 0 && now >= sc.nextSpawnAt && now < LAST_ARRIVAL_MS) {
        const taken = new Set(sc.guests.map((g) => g.seat))
        const free = seats.map((_, i) => i).filter((i) => !taken.has(i))
        const customer = pickCustomer(Math.random)
        const order = chooseOrder(customer, menuRef.current, Math.random)
        if (free.length > 0 && order) {
          const seat = free[Math.floor(Math.random() * free.length)]
          const maxPatience = (customer.id === "tycoon" ? 14_000 : 18_000) + Math.random() * 5000
          sc.guests.push({
            key: sc.nextKey++,
            seat,
            customer,
            dish: order.dish,
            favorite: order.favorite,
            patience: maxPatience,
            maxPatience,
            phase: "in",
            path: pathTo(seats[seat]),
            walked: 0,
            mood: "ok",
          })
          sc.toSpawn--
          sc.summary.guests++
          const gap = LAST_ARRIVAL_MS / sc.totalGuests
          sc.nextSpawnAt = now + gap * (0.5 + Math.random() * 0.8)
        }
      }

      // walking and patience
      for (const g of sc.guests) {
        if (g.phase === "in") {
          g.walked += WALK_SPEED * TICK_MS
          if (g.walked >= pathLength(g.path)) g.phase = "seated"
        } else if (g.phase === "out") {
          g.walked -= WALK_SPEED * TICK_MS * 1.3
        } else {
          g.patience -= TICK_MS
          if (g.patience <= 0) {
            g.phase = "out"
            g.mood = "angry"
            sc.summary.lost++
            const p = pointAt(g.path, g.walked)
            sc.floats.push({ key: sc.nextKey++, u: p.u, v: p.v, text: "等太久了！", good: false, until: now + 1400 })
            act((s) => customerWalkout(s, g.customer))
          }
        }
      }
      sc.guests = sc.guests.filter((g) => !(g.phase === "out" && g.walked <= 0))

      // cooking
      sc.burners.forEach((b, i) => {
        if (!b) return
        b.left = Math.max(0, b.left - TICK_MS)
        if (b.left === 0 && sc.plates.length < COUNTER_SIZE) {
          sc.plates.push({ key: sc.nextKey++, dish: b.dish })
          sc.burners[i] = null
          sfx.plateReady()
        }
      })

      sc.floats = sc.floats.filter((f) => f.until > now)

      const nobodyLeft = sc.toSpawn === 0 && sc.guests.length === 0
      if (now >= SHIFT_MS || (nobodyLeft && now > 3000)) {
        sc.guests.forEach((g) => {
          if (g.phase !== "out") sc.summary.lost++
        })
        sc.summary.wasted = sc.plates.length + sc.burners.filter(Boolean).length
        sc.done = true
        const summary = { ...sc.summary }
        setLastSummary(summary)
        act((s) => endShift(s, summary, Math.random))
      }
      setFrame((f) => f + 1)
    }, TICK_MS)
    return () => clearInterval(timer)
  }, [serving, act])

  const sc = sceneRef.current

  const cook = (dish: DishId) => {
    if (!sc || sc.done) return
    const burner = sc.burners.findIndex((b) => b === null)
    if (burner < 0 || craftableCount(invRef.current, dish) === 0) return
    // keep a local copy in step so fast taps can't cook more than we have
    const inv = { ...invRef.current }
    for (const [id, need] of Object.entries(DISHES[dish].recipe)) inv[id as keyof Inventory] -= need as number
    invRef.current = inv
    sc.burners[burner] = { dish, left: sc.cookMs }
    sfx.cook()
    act((s) => cookDish(s, dish))
    setFrame((f) => f + 1)
  }

  const serve = (key: number) => {
    if (!sc || sc.done) return
    const guest = sc.guests.find((g) => g.key === key)
    if (!guest || guest.phase !== "seated") return
    let plateIndex = sc.plates.findIndex((p) => p.key === sc.selected)
    if (plateIndex < 0) plateIndex = sc.plates.findIndex((p) => p.dish === guest.dish)
    if (plateIndex < 0) return
    const plate = sc.plates[plateIndex]
    const at = pointAt(guest.path, guest.walked)
    if (plate.dish !== guest.dish) {
      guest.patience = Math.max(500, guest.patience - WRONG_DISH_PENALTY_MS)
      sc.floats.push({ key: sc.nextKey++, u: at.u, v: at.v, text: "這不是我點的！", good: false, until: sc.elapsed + 1400 })
      sfx.wrong()
      sc.selected = null
      setFrame((f) => f + 1)
      return
    }
    const ratio = guest.patience / guest.maxPatience
    const earned = DISHES[guest.dish].price + tipFor(guest.customer, guest.dish, guest.favorite, ratio)
    sc.plates.splice(plateIndex, 1)
    sc.selected = null
    guest.phase = "out"
    guest.mood = "happy"
    sc.summary.served++
    sc.summary.income += earned
    sc.floats.push({ key: sc.nextKey++, u: at.u, v: at.v, text: `+$${earned}`, good: true, until: sc.elapsed + 1400 })
    act((s) => serveCustomer(s, guest.customer, guest.dish, guest.favorite, ratio))
    setFrame((f) => f + 1)
  }

  const selectPlate = (key: number) => {
    if (!sc) return
    sc.selected = sc.selected === key ? null : key
    sfx.click()
    setFrame((f) => f + 1)
  }

  const discardPlate = () => {
    if (!sc || sc.selected === null) return
    sc.plates = sc.plates.filter((p) => p.key !== sc.selected)
    sc.selected = null
    setFrame((f) => f + 1)
  }

  const guestsForFloor: FloorGuest[] =
    serving && sc
      ? sc.guests.map((g) => {
          const p = pointAt(g.path, Math.max(0, g.walked))
          return {
            key: g.key,
            type: g.customer.id,
            u: p.u,
            v: p.v,
            mood: g.mood === "ok" && g.patience / g.maxPatience < 0.3 ? "angry" : g.mood,
            order:
              g.phase === "seated"
                ? { dish: g.dish, favorite: g.favorite, patience: g.patience / g.maxPatience }
                : undefined,
          }
        })
      : []

  const burnerCount = serving && sc ? sc.burners.length : storeLevel(state).burners
  const timeLeft = sc && serving ? Math.max(0, SHIFT_MS - sc.elapsed) : SHIFT_MS

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Restaurant */}
      <div className="relative shrink-0 border-b border-border bg-cyber-dark" data-tut="floor">
        <div className="aspect-[3/2] sm:aspect-auto sm:h-[46vh] sm:min-h-64 max-h-[560px]">
          <RestaurantFloor
            tables={state.tables}
            guests={guestsForFloor}
            floats={serving && sc ? sc.floats : []}
            burnersBusy={serving && sc ? sc.burners.map(Boolean) : Array(storeLevel(state).burners).fill(false)}
            decorating={decorating && !serving}
            selectedTable={selectedTable}
            onTableClick={(i) => setSelectedTable(selectedTable === i ? null : i)}
            onTileClick={(tile) => {
              if (selectedTable === null) return
              act((s) => moveTable(s, selectedTable, tile))
              setSelectedTable(null)
            }}
            onGuestClick={serve}
          />
        </div>
        {serving && sc ? (
          <div className="absolute top-2 left-3 right-3 flex items-center gap-3 text-xs">
            <Moon className="w-4 h-4 text-neon-purple shrink-0" />
            <div className="flex-1 h-1.5 bg-muted rounded-sm overflow-hidden">
              <div className="h-full bg-neon-purple transition-all" style={{ width: `${(timeLeft / SHIFT_MS) * 100}%` }} />
            </div>
            <span className="font-mono text-foreground w-10 text-right">{Math.ceil(timeLeft / 1000)}s</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-3 h-3" />
              {sc.toSpawn}
            </span>
          </div>
        ) : (
          <IdleOverlay
            state={state}
            summary={lastSummary}
            decorating={decorating}
            hasSelection={selectedTable !== null}
            onDecorate={() => {
              setDecorating(!decorating)
              setSelectedTable(null)
            }}
            onOpen={() => {
              setDecorating(false)
              setSelectedTable(null)
              act(startShift)
            }}
          />
        )}
      </div>

      {/* Kitchen */}
      <div className="p-3 sm:p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>// 出餐台：點盤子再點客人送餐（或直接點客人，自動送上對的菜）</span>
            {sc?.selected != null && serving && (
              <button onClick={discardPlate} className="flex items-center gap-1 text-destructive hover:underline">
                <Trash2 className="w-3 h-3" /> 倒掉
              </button>
            )}
          </div>
          <div className="flex gap-2 min-h-16">
            {Array.from({ length: COUNTER_SIZE }).map((_, i) => {
              const plate = serving ? sc?.plates[i] : undefined
              const selected = plate && sc?.selected === plate.key
              return (
                <button
                  key={plate?.key ?? `empty-${i}`}
                  disabled={!plate}
                  onClick={() => plate && selectPlate(plate.key)}
                  className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all ${
                    plate
                      ? selected
                        ? "border-neon-gold bg-neon-gold/15 shadow-[0_0_14px_var(--neon-gold)] -translate-y-1"
                        : "border-neon-purple/70 bg-neon-purple/10 hover:-translate-y-1 animate-in zoom-in"
                      : "border-dashed border-border"
                  }`}
                  aria-label={plate ? DISHES[plate.dish].name : "空盤"}
                >
                  {plate && <DishIcon id={plate.dish} size={36} />}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Flame className="w-3 h-3" /> // 爐台
          </div>
          <div className={`grid gap-2 ${burnerCount > 2 ? "grid-cols-3" : "grid-cols-2"}`}>
            {Array.from({ length: burnerCount }).map((_, i) => {
              const b = serving ? sc?.burners[i] : null
              return (
                <div key={i} className="h-12 rounded-sm border border-border bg-cyber-dark flex items-center gap-2 px-3">
                  {b ? (
                    <>
                      <DishIcon id={b.dish} size={24} />
                      <div className="flex-1">
                        <div className="text-xs text-foreground">{b.left > 0 ? "料理中…" : "出餐台滿了"}</div>
                        <div className="h-1 bg-muted rounded-sm overflow-hidden mt-1">
                          <div className="h-full bg-neon-gold" style={{ width: `${(1 - b.left / (sc?.cookMs ?? 1)) * 100}%` }} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">空爐</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <ChefHat className="w-3 h-3" /> // 點菜色開始料理（用掉配方食材）
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" data-tut="cook">
            {state.menu.map((dish) => {
              const count = craftableCount(state.inventory, dish)
              const busy = !sc || sc.burners.every((b) => b !== null)
              return (
                <button
                  key={dish}
                  disabled={!serving || count === 0 || busy}
                  onClick={() => cook(dish)}
                  className="p-2 rounded-sm border border-neon-purple/50 bg-neon-purple/5 hover:bg-neon-purple/15 hover:shadow-[0_0_12px_var(--neon-purple)] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center gap-2 text-left"
                >
                  <DishIcon id={dish} size={28} dim={count === 0} />
                  <div className="min-w-0">
                    <div className="text-xs text-foreground truncate">{DISHES[dish].name}</div>
                    <div className={`text-[10px] ${count > 0 ? "text-neon-green" : "text-destructive"}`}>
                      {count > 0 ? `可做 ${count}` : "食材不足"}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function IdleOverlay({
  state,
  summary,
  decorating,
  hasSelection,
  onDecorate,
  onOpen,
}: {
  state: GameState
  summary: ShiftSummary | null
  decorating: boolean
  hasSelection: boolean
  onDecorate: () => void
  onOpen: () => void
}) {
  const canDecorate = state.phase === "prep" || state.phase === "closed"
  let message: React.ReactNode
  if (decorating) {
    message = hasSelection ? "點綠色的地板，把桌子搬過去" : "點一張桌子把它選起來"
  } else if (state.phase === "prep") {
    const empty = state.menu.filter((d) => craftableCount(state.inventory, d) === 0)
    message =
      state.menu.length === 0
        ? "先到「菜單」上架菜色"
        : empty.length > 0
          ? `${empty.map((d) => DISHES[d].name).join("、")} 食材不足，客人點了會做不出來`
          : "準備好就開店，客人會從門口進來"
  } else if (state.phase === "closed") {
    message = (
      <>
        已打烊
        {summary && (
          <>
            ：服務 {summary.served} / {summary.guests} 位，收入 <span className="text-neon-gold">${summary.income}</span>
          </>
        )}
        {state.pendingEvent ? "。有突發事件等你處理（營業日誌）" : "。按「進入下一天」繼續"}
      </>
    )
  } else {
    message = "房租繳不出來，店被收回了。按「重新開始」再挑戰"
  }
  return (
    <div className="absolute top-2 left-2 right-2 flex flex-wrap items-center justify-between gap-2">
      <div className="text-xs text-foreground bg-card/85 border border-border rounded-sm px-2 py-1">{message}</div>
      <div className="flex gap-2">
        {canDecorate && (
          <button
            onClick={onDecorate}
            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-sm border transition-all ${
              decorating ? "border-neon-green text-neon-green bg-neon-green/15" : "border-border text-muted-foreground bg-card/85 hover:text-foreground"
            }`}
          >
            <Hammer className="w-3 h-3" /> {decorating ? "完成裝潢" : "裝潢"}
          </button>
        )}
        {state.phase === "prep" && !decorating && (
          <button
            onClick={onOpen}
            data-tut="open"
            disabled={state.menu.length === 0}
            className="text-xs px-4 py-1.5 rounded-sm border-2 border-neon-purple text-neon-purple bg-neon-purple/15 hover:bg-neon-purple/30 hover:shadow-[0_0_16px_var(--neon-purple)] transition-all tracking-widest disabled:opacity-40"
          >
            ▶ 開始營業
          </button>
        )}
      </div>
    </div>
  )
}
