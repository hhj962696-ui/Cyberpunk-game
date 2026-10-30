import { Clock } from "lucide-react"
import { GAME_RULES, INGREDIENTS, RARITY_LABEL } from "@/lib/game/data"
import { vendorOffers, type GameState } from "@/lib/game/engine"
import { IngredientIcon } from "./food-icon"

function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":")
}

export function VendorStall({ state, now, onBuy }: { state: GameState; now: number; onBuy: (index: number) => void }) {
  const offers = vendorOffers(state.vendorSlot)
  const refreshAt = (state.vendorSlot + 1) * GAME_RULES.vendorRefreshMs
  const canBuy = state.phase === "prep"
  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground">老陳的黑市攤販，每 12 小時換一批貨，用信用點購買。</p>
        <div className="flex items-center gap-1 text-xs text-neon-cyan font-mono shrink-0">
          <Clock className="w-3 h-3" /> {formatCountdown(refreshAt - now)}
        </div>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {offers.map((offer, i) => {
          const ing = INGREDIENTS[offer.ingredient]
          const left = offer.stock - (state.vendorBought[i] ?? 0)
          const affordable = state.credits >= offer.price
          return (
            <li key={offer.ingredient} className="p-3 rounded-sm border border-border bg-cyber-dark">
              <div className="flex items-center gap-3">
                <IngredientIcon id={offer.ingredient} size={36} />
                <div className="flex-1">
                  <div className="text-sm text-foreground">{ing.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {RARITY_LABEL[ing.rarity]} · 剩 {left} 份
                  </div>
                </div>
                <span className="font-mono text-neon-gold">${offer.price}</span>
              </div>
              <button
                disabled={!canBuy || left <= 0 || !affordable}
                onClick={() => onBuy(i)}
                className="mt-3 w-full text-xs py-1.5 rounded-sm border border-neon-cyan/60 text-neon-cyan hover:bg-neon-cyan/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {left <= 0 ? "已售完" : !affordable ? "信用點不足" : "購買 1 份"}
              </button>
            </li>
          )
        })}
      </ul>
      {!canBuy && <p className="text-xs text-muted-foreground mt-4">打烊後攤販不營業，到下一天再來。</p>}
    </div>
  )
}
