import { DISHES, INGREDIENTS, type Category, type DishId, type DishKind, type IngredientId, type Rarity } from "@/lib/game/data"

export const RARITY_COLOR: Record<Rarity, string> = {
  common: "var(--neon-green)",
  uncommon: "var(--neon-cyan)",
  rare: "var(--neon-purple)",
  epic: "var(--neon-pink)",
  legendary: "var(--neon-gold)",
}

// Neon line-art icons, drawn on a 32x32 grid. Ingredients without their own
// drawing use their category's.
const CATEGORY_PATHS: Record<Category, React.ReactNode> = {
  grain: (
    <>
      <path d="M16 28V6" />
      <path d="M16 10c-3 0-5-2-5-4 3 0 5 2 5 4zM16 10c3 0 5-2 5-4-3 0-5 2-5 4z" />
      <path d="M16 16c-3 0-5-2-5-4 3 0 5 2 5 4zM16 16c3 0 5-2 5-4-3 0-5 2-5 4z" />
      <path d="M16 22c-3 0-5-2-5-4 3 0 5 2 5 4zM16 22c3 0 5-2 5-4-3 0-5 2-5 4z" />
    </>
  ),
  veg: (
    <>
      <path d="M16 28c-6 0-10-5-10-11 3 0 7 2 10 6 3-4 7-6 10-6 0 6-4 11-10 11z" />
      <path d="M16 23V8M16 8c-2-2-2-4 0-5 2 1 2 3 0 5z" />
    </>
  ),
  fruit: (
    <>
      <circle cx="16" cy="19" r="9" />
      <path d="M16 10c0-3 1-5 3-6M17 8c3-2 6-1 7 1-3 1-5 1-7-1z" />
    </>
  ),
  meat: (
    <>
      <path d="M8 22c-3-3-3-9 2-13s11-4 13 0 0 9-4 12-8 4-11 1z" />
      <path d="M8 22l-3 4M5 26l-1-2M5 26l2 1" />
      <circle cx="15" cy="14" r="2.5" />
    </>
  ),
  seafood: (
    <>
      <path d="M4 16c4-6 11-7 17-3l6-4v14l-6-4c-6 4-13 3-17-3z" />
      <circle cx="10" cy="15" r="1" />
    </>
  ),
  dairy: (
    <>
      <path d="M11 4h10M12 4v5l-3 5v14h14V14l-3-5V4" />
      <path d="M9 18h14" />
    </>
  ),
  spice: (
    <>
      <path d="M11 12h10v15a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2z" />
      <path d="M12 12V8h8v4M13 5h6v3h-6z" />
      <path d="M14 18h4M14 22h4" />
    </>
  ),
  drink: (
    <>
      <path d="M8 8h16l-3 20H11z" />
      <path d="M9 14h14M19 3l-2 11" />
    </>
  ),
}

const INGREDIENT_PATHS: Partial<Record<IngredientId, React.ReactNode>> = {
  noodle: (
    <>
      <path d="M6 10c4 0 4 4 8 4s4-4 8-4 4 4 4 4" />
      <path d="M6 16c4 0 4 4 8 4s4-4 8-4 4 4 4 4" />
      <path d="M6 22c4 0 4 4 8 4s4-4 8-4" />
    </>
  ),
  synmeat: (
    <>
      <rect x="6" y="9" width="20" height="14" rx="3" />
      <path d="M10 13h4M18 13h4M10 19h12" />
    </>
  ),
  scallion: (
    <>
      <path d="M16 28V12" />
      <path d="M16 14c-4-2-6-6-6-10M16 14c4-2 6-6 6-10M16 12V4" />
      <path d="M13 28h6" />
    </>
  ),
  energy: (
    <>
      <rect x="10" y="6" width="12" height="22" rx="2" />
      <path d="M14 3h4v3h-4z" />
      <path d="M17 11l-3 6h4l-3 6" />
    </>
  ),
  soda: (
    <>
      <path d="M10 8h12l-2 20h-8z" />
      <circle cx="15" cy="16" r="1.5" />
      <circle cx="18" cy="21" r="1" />
      <circle cx="14" cy="23" r="1" />
    </>
  ),
  rice: (
    <>
      <path d="M5 16h22a11 11 0 0 1-22 0z" />
      <path d="M9 16c1-4 4-6 7-6s6 2 7 6" />
    </>
  ),
  tomato: (
    <>
      <circle cx="16" cy="18" r="9" />
      <path d="M12 9l4 3 4-3M16 12V6" />
    </>
  ),
  egg: (
    <>
      <path d="M16 5c5 0 9 8 9 14a9 9 0 0 1-18 0c0-6 4-14 9-14z" />
      <path d="M12 19a4 4 0 0 0 4 4" />
    </>
  ),
  chili: (
    <>
      <path d="M22 8c2 8-4 18-14 18 6-4 8-10 8-16" />
      <path d="M16 10c2-2 4-2 6-2M22 8l2-4" />
    </>
  ),
  wagyu: (
    <>
      <path d="M5 14c0-5 6-8 12-8s10 4 10 9-5 10-12 10S5 20 5 14z" />
      <path d="M10 13c3 1 5-1 8 0M12 18c3 1 6-1 9 0M19 10c1 2 3 2 4 2" />
    </>
  ),
}

export function IngredientIcon({ id, size = 28 }: { id: IngredientId; size?: number }) {
  const color = RARITY_COLOR[INGREDIENTS[id].rarity]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ filter: `drop-shadow(0 0 3px ${color})` }}
      aria-label={INGREDIENTS[id].name}
      role="img"
    >
      {INGREDIENT_PATHS[id] ?? CATEGORY_PATHS[INGREDIENTS[id].category]}
    </svg>
  )
}

const KIND_PATHS: Record<DishKind, React.ReactNode> = {
  bowl: (
    <>
      <path d="M4 15h24a12 12 0 0 1-24 0z" />
      <path d="M9 15c1-3 4-5 7-5s6 2 7 5" />
      <path d="M12 26h8" />
    </>
  ),
  plate: (
    <>
      <ellipse cx="16" cy="20" rx="13" ry="6" />
      <ellipse cx="16" cy="19" rx="8" ry="3" />
      <path d="M12 16c1-3 3-4 4-4s3 1 4 4" />
    </>
  ),
  drink: (
    <>
      <path d="M9 9h14l-2 19H11z" />
      <path d="M18 3l-2 6M10 15h12" />
    </>
  ),
  bread: (
    <>
      <path d="M5 20c0-7 5-11 11-11s11 4 11 11z" />
      <path d="M4 20h24v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
      <path d="M11 13l2 3M16 11v4M21 13l-2 3" />
    </>
  ),
  dessert: (
    <>
      <path d="M6 26h20l-2-10H8z" />
      <path d="M8 16c0-4 4-7 8-7s8 3 8 7" />
      <circle cx="16" cy="6" r="2" />
    </>
  ),
  soup: (
    <>
      <path d="M4 14h24v4a12 10 0 0 1-24 0z" />
      <path d="M11 10c0-2 2-2 2-4M16 10c0-2 2-2 2-4M21 10c0-2 2-2 2-4" />
      <path d="M2 14h3M27 14h3" />
    </>
  ),
}

const DISH_PATHS: Partial<Record<DishId, React.ReactNode>> = {
  ramen: (
    <>
      <path d="M4 15h24a12 12 0 0 1-24 0z" />
      <path d="M9 15c0-3 2-3 2-6M15 15c0-3 2-3 2-6M21 15c0-3 2-3 2-6" />
      <path d="M22 4l-8 11M26 5l-8 10" />
    </>
  ),
  battery: (
    <>
      <path d="M9 7h14l-2 21H11z" />
      <path d="M17 2l-3 5" />
      <path d="M17 12l-3 5h4l-3 6" />
    </>
  ),
  bun: (
    <>
      <path d="M5 22c0-8 5-13 11-13s11 5 11 13z" />
      <path d="M16 9c-1 2 0 4 0 4M12 11c0 2 1 3 1 3M20 11c0 2-1 3-1 3" />
      <path d="M4 25h24" />
    </>
  ),
  spicyRice: (
    <>
      <path d="M4 17h24a12 12 0 0 1-24 0z" />
      <path d="M8 17c1-5 4-7 8-7s7 2 8 7" />
      <path d="M16 8c1-2 0-4-1-5M20 9c1-2 1-3 0-5M12 9c-1-2 0-3 1-5" />
    </>
  ),
  tomatoEgg: (
    <>
      <ellipse cx="16" cy="20" rx="12" ry="6" />
      <circle cx="12" cy="18" r="3" />
      <path d="M17 17c2-2 5-1 6 1-2 2-4 2-6-1z" />
    </>
  ),
  wagyuDon: (
    <>
      <path d="M4 16h24a12 12 0 0 1-24 0z" />
      <path d="M7 16c2-4 6-5 9-5s7 1 9 5" />
      <path d="M10 13c3 1 5 0 7-1M15 14c3 0 5-1 7-2" />
    </>
  ),
}

export function DishIcon({
  id,
  size = 32,
  dim = false,
  x,
  y,
}: {
  id: DishId
  size?: number
  dim?: boolean
  x?: number
  y?: number
}) {
  const color = dim ? "var(--muted-foreground)" : "var(--neon-purple)"
  return (
    <svg
      x={x}
      y={y}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={dim ? undefined : { filter: `drop-shadow(0 0 4px ${color})` }}
      aria-hidden="true"
    >
      {DISH_PATHS[id] ?? KIND_PATHS[DISHES[id].kind]}
    </svg>
  )
}
