"use client"

import { useEffect, useRef, useState } from "react"
import { INGREDIENTS, RARITY_LABEL } from "@/lib/game/data"
import type { GameState } from "@/lib/game/engine"
import { IngredientIcon } from "./food-icon"

const RARITY_STYLE = {
  common: "border-neon-green shadow-[0_0_30px_var(--neon-green)]",
  uncommon: "border-neon-cyan shadow-[0_0_35px_var(--neon-cyan)]",
  rare: "border-neon-purple shadow-[0_0_40px_var(--neon-purple)]",
  epic: "border-neon-pink shadow-[0_0_50px_var(--neon-pink)]",
  legendary: "border-neon-gold shadow-[0_0_60px_var(--neon-gold)]",
}

// Pops a card up for each new draw
export function DrawReveal({ draw }: { draw: GameState["lastDraw"] }) {
  const firstSeq = useRef(draw?.seq ?? 0)
  const [shown, setShown] = useState<GameState["lastDraw"]>(null)

  useEffect(() => {
    if (!draw || draw.seq <= firstSeq.current) return
    setShown(draw)
    const timer = setTimeout(() => setShown(null), 1300)
    return () => clearTimeout(timer)
  }, [draw])

  if (!shown) return null
  const ing = INGREDIENTS[shown.id]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        key={shown.seq}
        className={`w-44 h-60 rounded-lg border-2 bg-card flex flex-col items-center justify-center gap-3 animate-in zoom-in-50 spin-in-12 duration-300 ${RARITY_STYLE[ing.rarity]}`}
      >
        <div className="text-[10px] tracking-widest text-muted-foreground">{RARITY_LABEL[ing.rarity]}</div>
        <IngredientIcon id={shown.id} size={72} />
        <div className="text-base text-foreground">{ing.name}</div>
        <div className="font-mono text-neon-gold">×{shown.amount}</div>
      </div>
    </div>
  )
}
