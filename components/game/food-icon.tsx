import { INGREDIENTS, type DishId, type IngredientId, type Rarity } from "@/lib/game/data"

const RARITY_COLOR: Record<Rarity, string> = {
  common: "var(--neon-green)",
  rare: "var(--neon-cyan)",
  legendary: "var(--neon-gold)",
}

// Neon line-art icons, drawn on a 32x32 grid
const INGREDIENT_PATHS: Record<IngredientId, React.ReactNode> = {
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
      {INGREDIENT_PATHS[id]}
    </svg>
  )
}

const DISH_PATHS: Record<DishId, React.ReactNode> = {
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

export function DishIcon({ id, size = 32, dim = false }: { id: DishId; size?: number; dim?: boolean }) {
  const color = dim ? "var(--muted-foreground)" : "var(--neon-purple)"
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
      style={dim ? undefined : { filter: `drop-shadow(0 0 4px ${color})` }}
      aria-hidden="true"
    >
      {DISH_PATHS[id]}
    </svg>
  )
}
