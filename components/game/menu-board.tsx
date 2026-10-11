import { Check, Plus } from "lucide-react"
import { DISHES, DISH_IDS, GAME_RULES, INGREDIENTS, type IngredientId } from "@/lib/game/data"
import { craftableCount, type GameState } from "@/lib/game/engine"
import { DishIcon, IngredientIcon } from "./food-icon"

export function MenuBoard({ state, onToggle }: { state: GameState; onToggle: (id: (typeof DISH_IDS)[number]) => void }) {
  const editable = state.phase === "prep"
  return (
    <div className="h-full overflow-y-auto p-4">
      <p className="text-xs text-muted-foreground mb-4">
        菜單最多 {GAME_RULES.maxMenuSize} 道（已選 {state.menu.length}）。食材夠才做得出來，客人點不到菜就會失望離開。
      </p>
      <ul className="grid gap-3 md:grid-cols-2">
        {DISH_IDS.map((id) => {
          const dish = DISHES[id]
          const count = craftableCount(state.inventory, id)
          const onMenu = state.menu.includes(id)
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
                    <span className="font-mono text-neon-gold text-sm">${dish.price}</span>
                  </div>
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
