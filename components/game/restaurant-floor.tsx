"use client"

import { DISHES, type DishId } from "@/lib/game/data"
import { canPlaceTable, chairsOf, DOOR, KITCHEN_TILES, ROOM_SIZE, type Tile } from "@/lib/game/engine"
import { DishIcon } from "./food-icon"

// Isometric projection: tile (x, y) has its center at continuous coords (x + 0.5, y + 0.5)
const HALF_W = 32
const HALF_H = 16
const OX = 300
const OY = 120
const WALL = 96
export const FLOOR_VIEWBOX = "0 0 600 400"

export function iso(u: number, v: number) {
  return { x: OX + (u - v) * HALF_W, y: OY + (u + v) * HALF_H }
}

const pts = (list: { x: number; y: number }[]) => list.map((p) => `${p.x},${p.y}`).join(" ")

function box(cx: number, cy: number, w: number, height: number, top: string, left: string, right: string, stroke = "var(--border)") {
  const hh = w / 2
  return (
    <g stroke={stroke} strokeWidth="1">
      <polygon points={`${cx - w},${cy - height} ${cx},${cy + hh - height} ${cx},${cy + hh} ${cx - w},${cy}`} fill={left} />
      <polygon points={`${cx + w},${cy - height} ${cx},${cy + hh - height} ${cx},${cy + hh} ${cx + w},${cy}`} fill={right} />
      <polygon points={`${cx},${cy - hh - height} ${cx + w},${cy - height} ${cx},${cy + hh - height} ${cx - w},${cy - height}`} fill={top} />
    </g>
  )
}

const SKIN = "oklch(0.82 0.06 60)"

const OUTFIT: Record<string, string> = {
  worker: "oklch(0.62 0.14 60)",
  hacker: "oklch(0.45 0.12 150)",
  cyborg: "oklch(0.55 0.10 220)",
  salaryman: "oklch(0.35 0.05 270)",
  tycoon: "oklch(0.50 0.16 320)",
  chef: "oklch(0.92 0.01 0)",
}

export function Character({ type, x, y, mood = "ok" }: { type: string; x: number; y: number; mood?: "ok" | "angry" | "happy" }) {
  const outfit = OUTFIT[type] ?? OUTFIT.worker
  return (
    <g style={mood === "angry" ? { filter: "drop-shadow(0 0 4px var(--destructive))" } : undefined}>
      <ellipse cx={x} cy={y} rx="11" ry="5" fill="black" opacity="0.35" />
      <rect x={x - 9} y={y - 24} width="18" height="22" rx="7" fill={outfit} stroke="black" strokeOpacity="0.3" />
      <circle cx={x} cy={y - 32} r="9" fill={SKIN} stroke="black" strokeOpacity="0.3" />
      {/* eyes */}
      {mood === "angry" ? (
        <path d={`M${x - 5} ${y - 35}l3 1.5M${x + 5} ${y - 35}l-3 1.5`} stroke="black" strokeWidth="1.5" />
      ) : (
        <>
          <circle cx={x - 3} cy={y - 32} r="1.3" fill="black" />
          <circle cx={x + 3} cy={y - 32} r="1.3" fill="black" />
        </>
      )}
      {mood === "happy" && <path d={`M${x - 3} ${y - 28.5}q3 2.5 6 0`} stroke="black" strokeWidth="1.2" fill="none" />}
      {type === "worker" && <path d={`M${x - 10} ${y - 35}a10 9 0 0 1 20 0z`} fill="var(--neon-gold)" />}
      {type === "hacker" && (
        <>
          <path d={`M${x - 11} ${y - 26}c0-16 22-16 22 0`} fill="none" stroke="oklch(0.45 0.12 150)" strokeWidth="4" />
          <rect x={x - 7} y={y - 35} width="14" height="4" rx="2" fill="var(--neon-green)" />
        </>
      )}
      {type === "cyborg" && (
        <>
          <path d={`M${x} ${y - 41}a9 9 0 0 1 0 18z`} fill="oklch(0.7 0.05 220)" />
          <circle cx={x + 4} cy={y - 32} r="2" fill="var(--destructive)" />
        </>
      )}
      {type === "salaryman" && (
        <>
          <path d={`M${x - 9} ${y - 36}a9 8 0 0 1 18 0z`} fill="oklch(0.2 0.02 270)" />
          <path d={`M${x} ${y - 23}l-2 4 2 9 2-9z`} fill="var(--neon-purple)" />
        </>
      )}
      {type === "tycoon" && (
        <>
          <rect x={x - 7} y={y - 52} width="14" height="12" fill="oklch(0.2 0.02 0)" />
          <rect x={x - 11} y={y - 41} width="22" height="3" fill="oklch(0.2 0.02 0)" />
          <rect x={x - 7} y={y - 44} width="14" height="2" fill="var(--neon-gold)" />
        </>
      )}
      {type === "chef" && (
        <>
          <rect x={x - 7} y={y - 50} width="14" height="10" rx="3" fill="white" />
          <circle cx={x - 5} cy={y - 50} r="4" fill="white" />
          <circle cx={x + 5} cy={y - 50} r="4" fill="white" />
        </>
      )}
    </g>
  )
}

export interface FloorGuest {
  key: number
  type: string
  u: number
  v: number
  mood: "ok" | "angry" | "happy"
  order?: { dish: DishId; favorite: boolean; patience: number }
}

export interface FloorFloat {
  key: number
  u: number
  v: number
  text: string
  good: boolean
}

interface Props {
  tables: Tile[]
  guests: FloorGuest[]
  floats: FloorFloat[]
  burnersBusy: boolean[]
  decorating: boolean
  selectedTable: number | null
  onTableClick?: (index: number) => void
  onTileClick?: (tile: Tile) => void
  onGuestClick?: (key: number) => void
}

type Drawable = { depth: number; key: string; node: React.ReactNode }

export function RestaurantFloor({
  tables,
  guests,
  floats,
  burnersBusy,
  decorating,
  selectedTable,
  onTableClick,
  onTileClick,
  onGuestClick,
}: Props) {
  const tiles: Tile[] = []
  for (let y = 0; y < ROOM_SIZE; y++) for (let x = 0; x < ROOM_SIZE; x++) tiles.push({ x, y })

  const drawables: Drawable[] = []

  // kitchen counter + stoves along the back wall
  KITCHEN_TILES.filter((t) => t.y === 0).forEach((t, i) => {
    const c = iso(t.x + 0.5, t.y + 0.5)
    const stove = i > 0
    const busy = stove && burnersBusy[i - 1]
    drawables.push({
      depth: t.x + t.y + 1,
      key: `k${i}`,
      node: (
        <g>
          {box(c.x, c.y + 4, 30, 26, stove ? "oklch(0.3 0.02 260)" : "oklch(0.35 0.03 300)", "oklch(0.22 0.02 260)", "oklch(0.18 0.02 260)")}
          {stove && (
            <ellipse
              cx={c.x}
              cy={c.y - 22}
              rx="10"
              ry="5"
              fill={busy ? "var(--neon-gold)" : "oklch(0.2 0.01 0)"}
              stroke="var(--neon-cyan)"
              style={busy ? { filter: "drop-shadow(0 0 6px var(--neon-gold))" } : undefined}
            />
          )}
          {busy && (
            <path
              d={`M${c.x - 4} ${c.y - 30}q-4 -8 0 -14M${c.x + 4} ${c.y - 30}q4 -8 0 -16`}
              stroke="white"
              strokeOpacity="0.5"
              fill="none"
              className="animate-pulse"
            />
          )}
        </g>
      ),
    })
  })

  // chef behind the counter
  const chef = iso(6.5, 1.5)
  drawables.push({ depth: 8.2, key: "chef", node: <g pointerEvents="none"><Character type="chef" x={chef.x} y={chef.y} mood={burnersBusy.some(Boolean) ? "happy" : "ok"} /></g> })

  tables.forEach((t, i) => {
    const c = iso(t.x + 0.5, t.y + 0.5)
    const selected = selectedTable === i
    chairsOf(t).forEach((ch, j) => {
      const cc = iso(ch.x + 0.5, ch.y + 0.5)
      drawables.push({
        depth: ch.x + ch.y + 1 - 0.01,
        key: `c${i}-${j}`,
        node: <g pointerEvents="none">{box(cc.x, cc.y + 2, 11, 10, "oklch(0.55 0.15 300)", "oklch(0.38 0.12 300)", "oklch(0.3 0.1 300)", "black")}</g>,
      })
    })
    drawables.push({
      depth: t.x + t.y + 1,
      key: `t${i}`,
      node: (
        <g
          onClick={decorating ? () => onTableClick?.(i) : undefined}
          className={decorating ? "cursor-pointer" : undefined}
          pointerEvents={decorating ? undefined : "none"}
          style={selected ? { filter: "drop-shadow(0 0 8px var(--neon-gold))" } : undefined}
        >
          <line x1={c.x} y1={c.y - 16} x2={c.x} y2={c.y + 4} stroke="oklch(0.4 0.02 260)" strokeWidth="3" />
          {box(c.x, c.y - 16, 24, 4, selected ? "var(--neon-gold)" : "oklch(0.75 0.05 200)", "oklch(0.45 0.05 200)", "oklch(0.38 0.05 200)", "black")}
        </g>
      ),
    })
  })

  guests.forEach((g) => {
    const p = iso(g.u, g.v)
    drawables.push({
      depth: g.u + g.v + 0.05,
      key: `g${g.key}`,
      node: (
        <g onClick={() => onGuestClick?.(g.key)} className={g.order ? "cursor-pointer" : undefined}>
          <Character type={g.type} x={p.x} y={p.y - (g.order ? 6 : 0)} mood={g.mood} />
        </g>
      ),
    })
  })

  drawables.sort((a, b) => a.depth - b.depth)

  const selected = selectedTable !== null ? selectedTable : null
  const p00 = iso(0, 0)
  const p80 = iso(ROOM_SIZE, 0)
  const p08 = iso(0, ROOM_SIZE)
  const d0 = iso(0, DOOR.y)
  const d1 = iso(0, DOOR.y + 1)

  return (
    <svg viewBox={FLOOR_VIEWBOX} className="w-full h-full select-none" role="img" aria-label="餐廳">
      {/* back walls */}
      <polygon points={pts([p00, p80, { x: p80.x, y: p80.y - WALL }, { x: p00.x, y: p00.y - WALL }])} fill="oklch(0.2 0.03 280)" stroke="var(--border)" />
      <polygon points={pts([p00, p08, { x: p08.x, y: p08.y - WALL }, { x: p00.x, y: p00.y - WALL }])} fill="oklch(0.17 0.03 280)" stroke="var(--border)" />
      {/* neon strip and sign on the right wall */}
      <line x1={p00.x} y1={p00.y - WALL + 6} x2={p80.x} y2={p80.y - WALL + 6} stroke="var(--neon-purple)" strokeWidth="2" style={{ filter: "drop-shadow(0 0 4px var(--neon-purple))" }} />
      <text
        transform={`matrix(1,0.5,0,1,${iso(1.2, 0).x},${iso(1.2, 0).y - 48})`}
        fontSize="22"
        fontWeight="700"
        fill="var(--neon-cyan)"
        style={{ filter: "drop-shadow(0 0 6px var(--neon-cyan))" }}
      >
        霓虹食堂
      </text>
      {/* window on the left wall */}
      <polygon
        points={pts([
          { x: iso(0, 1.5).x, y: iso(0, 1.5).y - 70 },
          { x: iso(0, 4).x, y: iso(0, 4).y - 70 },
          { x: iso(0, 4).x, y: iso(0, 4).y - 30 },
          { x: iso(0, 1.5).x, y: iso(0, 1.5).y - 30 },
        ])}
        fill="oklch(0.25 0.08 250)"
        stroke="var(--neon-cyan)"
        strokeOpacity="0.6"
      />
      {/* door */}
      <polygon points={pts([d0, d1, { x: d1.x, y: d1.y - 70 }, { x: d0.x, y: d0.y - 70 }])} fill="oklch(0.08 0.01 260)" stroke="var(--neon-green)" strokeWidth="2" style={{ filter: "drop-shadow(0 0 5px var(--neon-green))" }} />

      {/* floor */}
      {tiles.map((t) => {
        const c = iso(t.x + 0.5, t.y + 0.5)
        const valid = decorating && selected !== null && canPlaceTable(tables, selected, t)
        const even = (t.x + t.y) % 2 === 0
        return (
          <polygon
            key={`${t.x},${t.y}`}
            points={`${c.x},${c.y - HALF_H} ${c.x + HALF_W},${c.y} ${c.x},${c.y + HALF_H} ${c.x - HALF_W},${c.y}`}
            fill={valid ? "oklch(0.45 0.15 145)" : even ? "oklch(0.24 0.02 260)" : "oklch(0.2 0.02 260)"}
            stroke={decorating ? "var(--neon-green)" : "oklch(0.3 0.03 280)"}
            strokeOpacity={decorating ? 0.4 : 1}
            onClick={decorating ? () => onTileClick?.(t) : undefined}
            className={valid ? "cursor-pointer" : undefined}
          />
        )
      })}

      {drawables.map((d) => (
        <g key={d.key}>{d.node}</g>
      ))}

      {/* order bubbles on top of everything */}
      {guests
        .filter((g) => g.order)
        .map((g) => {
          const p = iso(g.u, g.v)
          const o = g.order!
          const bx = p.x - 22
          const by = p.y - 96
          const color = o.patience > 0.6 ? "var(--neon-green)" : o.patience > 0.3 ? "var(--neon-gold)" : "var(--destructive)"
          return (
            <g key={`b${g.key}`} onClick={() => onGuestClick?.(g.key)} className="cursor-pointer">
              <rect x={bx} y={by} width="44" height="40" rx="8" fill="var(--card)" stroke={o.favorite ? "var(--neon-gold)" : "var(--border)"} />
              <path d={`M${p.x - 5} ${by + 40}l5 7 5-7z`} fill="var(--card)" />
              <DishIcon id={o.dish} size={26} x={bx + 9} y={by + 3} />
              <rect x={bx + 5} y={by + 32} width="34" height="3" rx="1.5" fill="var(--muted)" />
              <rect x={bx + 5} y={by + 32} width={34 * o.patience} height="3" rx="1.5" fill={color} />
              <title>{DISHES[o.dish].name}</title>
            </g>
          )
        })}

      {floats.map((f) => {
        const p = iso(f.u, f.v)
        return (
          <text
            key={f.key}
            x={p.x}
            y={p.y - 104}
            textAnchor="middle"
            fontSize="14"
            fontWeight="700"
            fill={f.good ? "var(--neon-gold)" : "var(--destructive)"}
            className="animate-in fade-in slide-in-from-bottom-2"
            style={{ filter: "drop-shadow(0 0 3px black)" }}
          >
            {f.text}
          </text>
        )
      })}
    </svg>
  )
}
