import { useState } from "react"
import { Check, Flame, Plus, Sparkles } from "lucide-react"
import { COUNTRIES, COUNTRY_IDS, DISHES, DISH_IDS, INGREDIENTS, type CountryId, type DishId, type IngredientId } from "@/lib/game/data"
import { craftableCount, hotDish, priceHere, storeLevel, type GameState } from "@/lib/game/engine"
import { DishIcon, IngredientIcon } from "./food-icon"

type Filter = CountryId | "ready"

export function MenuBoard({ state, onToggle }: { state: GameState; onToggle: (id: DishId) => void }) {
  const editable = state.phase === "prep"
  const [filter, setFilter] = useState<Filter>(state.country)
  const here = COUNTRIES[state.country]
  const hot = hotDish(state.country, state.day)
  const shown = DISH_IDS.filter((id) =>
    filter === "ready" ? craftableCount(state.inventory, id) > 0 || state.menu.includes(id) : DISHES[id].cuisine === filter,
  )
  return (
    <div className="h-full overflow-y-auto p-4">
      <p className="text-xs text-muted-foreground mb-3">
        菜單最多 {storeLevel(state).menuSize} 道（已選 {state.menu.length}）。價格是在{here.name}的賣價，今天的招牌菜
        <span className="text-neon-gold"> [{DISHES[hot].name}] </span>
        賣 1.5 倍，{here.craze.map((c) => COUNTRIES[c].name).join("、")}料理在這裡也特別受歡迎。
      </p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {[...COUNTRY_IDS, "ready" as const].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-2.5 py-1 rounded-sm border transition-all ${
              filter === f ? "border-neon-purple text-neon-purple bg-neon-purple/10" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "ready" ? "現在做得出來" : `${COUNTRIES[f].name}料理`}
          </button>
        ))}
      </div>
      {shown.length === 0 && <p className="text-xs text-muted-foreground">目前沒有食材夠做的菜，先去抽食材或逛攤販吧。</p>}
      <ul className="grid gap-3 md:grid-cols-2">
        {shown.map((id) => {
          const dish = DISHES[id]
          const count = craftableCount(state.inventory, id)
          const onMenu = state.menu.includes(id)
          const price = priceHere(state, id)
          return (
            <li
              key={id}
              className={`p-3 rounded-sm border transition-all ${
                onMenu ? "border-neon-purple bg-neon-purple/10 shadow-[0_0_10px_var(--neon-purple)]" : "border-border bg-cyber-dark"
              }`}
            >
              <div className="flex items-start gap-3">
                <DishIcon id={id} size={36} dim={count === 0} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-foreground">{dish.name}</span>
                    <span className="font-mono text-neon-gold text-sm">${price}</span>
                  </div>
                  {(id === hot || here.craze.includes(dish.cuisine)) && (
                    <div className="flex gap-2 text-[10px] text-neon-gold">
                      {id === hot && (
                        <span className="flex items-center gap-0.5">
                          <Flame className="w-3 h-3" /> 今日招牌
                        </span>
                      )}
                      {here.craze.includes(dish.cuisine) && (
                        <span className="flex items-center gap-0.5">
                          <Sparkles className="w-3 h-3" /> 異國熱潮
                        </span>
                      )}
                    </div>
                  )}
                  <div className={`text-xs ${count > 0 ? "text-neon-green" : "text-destructive"}`}>
                    {count > 0 ? `今晚可做 ${count} 份` : "食材不足"}
                  </div>
                </div>
              </div>
              <ul className="flex flex-wrap gap-2 mt-3">
                {(Object.entries(dish.recipe) as [IngredientId, number][]).map(([ing, need]) => {
                  const have = state.inventory[ing]
                  return (
                    <li
                      key={ing}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-sm border ${
                        have >= need ? "border-border text-foreground" : "border-destructive/60 text-destructive"
                      }`}
                    >
                      <IngredientIcon id={ing} size={16} />
                      {INGREDIENTS[ing].name}
                      <span className="font-mono">
                        {have}/{need}
                      </span>
                    </li>
                  )
                })}
              </ul>
              <button
                disabled={!editable}
                onClick={() => onToggle(id)}
                className={`mt-3 w-full flex items-center justify-center gap-1 text-xs py-1.5 rounded-sm border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  onMenu
                    ? "border-neon-purple text-neon-purple hover:bg-neon-purple/15"
                    : "border-border text-muted-foreground hover:border-neon-purple hover:text-neon-purple"
                }`}
              >
                {onMenu ? (
                  <>
                    <Check className="w-3 h-3" /> 已上架（點擊下架）
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3" /> 加入菜單
                  </>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
