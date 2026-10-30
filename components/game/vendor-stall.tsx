import { useState } from "react"
import { Clock, PlayCircle } from "lucide-react"
import { COUNTRIES, GAME_RULES, INGREDIENTS, RARITIES, RARITY_LABEL, type IngredientId } from "@/lib/game/data"
import { adIngredientOptions, missingFor, stapleShelf, vendorOffers, type GameState } from "@/lib/game/engine"
import { IngredientIcon } from "./food-icon"

function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":")
}

interface Props {
  state: GameState
  now: number
  onBuy: (index: number) => void
  onBuyStaple: (id: IngredientId) => void
  // shows a rewarded ad and resolves true when the player earned it
  onWatchAd: () => Promise<boolean>
  onAdReward: (id: IngredientId) => void
}

export function VendorStall({ state, now, onBuy, onBuyStaple, onWatchAd, onAdReward }: Props) {
  const offers = vendorOffers(state.vendorSlot, state.country)
  const refreshAt = (state.vendorSlot + 1) * GAME_RULES.vendorRefreshMs
  const canBuy = state.phase === "prep"
  const [watching, setWatching] = useState(false)
  const short = new Set(state.menu.flatMap((d) => missingFor(state.inventory, d).map((m) => m.id)))
  // what the menu is short of first, then easiest first
  const adOptions = adIngredientOptions(state).sort(
    (a, b) =>
      Number(short.has(b)) - Number(short.has(a)) ||
      RARITIES.indexOf(INGREDIENTS[a].rarity) - RARITIES.indexOf(INGREDIENTS[b].rarity),
  )
  const adsLeft = GAME_RULES.adIngredientsPerDay - state.adClaims
  const [adPick, setAdPick] = useState<IngredientId | null>(null)
  const picked = adPick && adOptions.includes(adPick) ? adPick : adOptions[0]

  const watchAd = async () => {
    if (!picked || watching) return
    setWatching(true)
    try {
      if (await onWatchAd()) onAdReward(picked)
    } finally {
      setWatching(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      <section>
        <div className="text-xs text-neon-green uppercase tracking-widest mb-1">// 基本食材（天天有貨）</div>
        <p className="text-xs text-muted-foreground mb-3">
          {COUNTRIES[state.country].name}的大宗食材隨時買得到，每份 {GAME_RULES.staplePrice} 信用點。標紅的是菜單上缺的。
        </p>
        <ul className="grid gap-2 grid-cols-2 sm:grid-cols-3">
          {stapleShelf(state.country).map((id) => (
            <li key={id}>
              <button
                disabled={!canBuy || state.credits < GAME_RULES.staplePrice}
                onClick={() => onBuyStaple(id)}
                className={`w-full flex items-center gap-2 p-2 rounded-sm border bg-cyber-dark text-left hover:border-neon-green transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  short.has(id) ? "border-destructive/70" : "border-border"
                }`}
              >
                <IngredientIcon id={id} size={24} />
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-foreground truncate">{INGREDIENTS[id].name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    庫存 ×{state.inventory[id]}
                    {short.has(id) && <span className="text-destructive"> · 缺</span>}
                  </div>
                </div>
                <span className="font-mono text-xs text-neon-gold">+1</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="text-xs text-neon-gold uppercase tracking-widest mb-1">// 看廣告領食材</div>
        <p className="text-xs text-muted-foreground mb-3">
          選一種食材，看完一段廣告就送 {GAME_RULES.adIngredientAmount} 份。今天還能領 {adsLeft} 次。
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {adOptions.map((id) => (
            <button
              key={id}
              onClick={() => setAdPick(id)}
              title={`${INGREDIENTS[id].name}（${RARITY_LABEL[INGREDIENTS[id].rarity]}）`}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-sm border transition-all ${
                picked === id
                  ? "border-neon-gold text-neon-gold bg-neon-gold/10"
                  : short.has(id)
                    ? "border-destructive/60 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <IngredientIcon id={id} size={16} />
              {INGREDIENTS[id].name}
            </button>
          ))}
        </div>
        <button
          disabled={!canBuy || adsLeft <= 0 || !picked || watching}
          onClick={watchAd}
          className="w-full flex items-center justify-center gap-1 text-xs py-2 rounded-sm border border-neon-gold/60 text-neon-gold hover:bg-neon-gold/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <PlayCircle className="w-4 h-4" />
          {watching
            ? "廣告播放中…"
            : adsLeft <= 0
              ? "今天的次數用完了"
              : picked
                ? `看廣告領 [${INGREDIENTS[picked].name}] ×${GAME_RULES.adIngredientAmount}`
                : "選一種食材"}
        </button>
      </section>

      <section>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground">
          {COUNTRIES[state.country].name}的黑市攤販，每 12 小時換一批當地貨，換個地區就有不同的貨。
        </p>
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
      </section>
      {!canBuy && <p className="text-xs text-muted-foreground">打烊後攤販不營業，到下一天再來。</p>}
    </div>
  )
}
