import { Flame, Lock, MapPin, Plane } from "lucide-react"
import { COUNTRIES, COUNTRY_IDS, DISHES, INGREDIENTS, RARITIES, STORE_LEVELS, type CountryId } from "@/lib/game/data"
import { canTravel, hotDish, type GameState } from "@/lib/game/engine"
import { IngredientIcon } from "./food-icon"

export function WorldMap({ state, onTravel }: { state: GameState; onTravel: (id: CountryId) => void }) {
  return (
    <div className="h-full overflow-y-auto p-4">
      <p className="text-xs text-muted-foreground mb-4">
        白天可以把餐車搬到別的地區，晚上就在那裡開店。每個地區的物價、受歡迎的料理和能抽到的特產都不同，
        庫存會跟著你走，所以可以把外地特產帶回來賣。業績會記在各地區的排行榜上。
      </p>
      <ul className="grid gap-3 md:grid-cols-2">
        {COUNTRY_IDS.map((id) => {
          const c = COUNTRIES[id]
          const here = state.country === id
          const locked = state.level < c.unlockLevel
          const hot = hotDish(id, state.day)
          const specialties = c.pool
            .filter((i) => RARITIES.indexOf(INGREDIENTS[i].rarity) >= RARITIES.indexOf("rare"))
            .sort((a, b) => RARITIES.indexOf(INGREDIENTS[b].rarity) - RARITIES.indexOf(INGREDIENTS[a].rarity))
          return (
            <li
              key={id}
              className={`p-3 rounded-sm border transition-all ${
                here ? "border-neon-pink bg-neon-pink/10 shadow-[0_0_10px_var(--neon-pink)]" : "border-border bg-cyber-dark"
              } ${locked ? "opacity-60" : ""}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono border border-border rounded-sm px-1">{c.flag}</span>
                  <span className="text-sm text-foreground">{c.name}</span>
                  {here && (
                    <span className="flex items-center gap-0.5 text-[10px] text-neon-pink">
                      <MapPin className="w-3 h-3" /> 你在這裡
                    </span>
                  )}
                </div>
                <span className={`font-mono text-xs ${c.priceMult >= 1 ? "text-neon-gold" : "text-muted-foreground"}`}>
                  物價 ×{c.priceMult}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{c.blurb}</p>
              <div className="text-xs mt-2 space-y-1">
                <div className="flex items-center gap-1 text-neon-gold">
                  <Flame className="w-3 h-3" /> 今日招牌：{DISHES[hot].name}
                </div>
                <div className="text-muted-foreground">
                  流行：{c.craze.map((k) => COUNTRIES[k].name).join("、")}料理（賣 1.3 倍）
                </div>
                <div className="text-muted-foreground">
                  本局業績：<span className="font-mono text-foreground">{state.sales[id] ?? 0}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2" aria-label="地區特產">
                {specialties.map((i) => (
                  <span key={i} title={INGREDIENTS[i].name} className="p-0.5 rounded-sm border border-border">
                    <IngredientIcon id={i} size={18} />
                  </span>
                ))}
              </div>
              {!here && (
                <button
                  disabled={!canTravel(state, id)}
                  onClick={() => onTravel(id)}
                  className="mt-3 w-full flex items-center justify-center gap-1 text-xs py-1.5 rounded-sm border border-neon-pink/60 text-neon-pink hover:bg-neon-pink/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {locked ? (
                    <>
                      <Lock className="w-3 h-3" /> 升級成「{STORE_LEVELS[c.unlockLevel].name}」解鎖
                    </>
                  ) : state.phase !== "prep" ? (
                    "白天備料時才能搬家"
                  ) : (
                    <>
                      <Plane className="w-3 h-3" /> 搬過去{c.travelCost > 0 ? `（運費 ${c.travelCost}）` : "（免費）"}
                    </>
                  )}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
