import { COUNTRIES, COUNTRY_IDS, CATEGORY_LABEL, DISHES, DISH_IDS, INGREDIENTS, INGREDIENT_IDS, RARITIES, RARITY_HINT, RARITY_LABEL, type IngredientId } from "@/lib/game/data"
import type { GameState } from "@/lib/game/engine"
import { IngredientIcon, RARITY_COLOR } from "./food-icon"

const origins = (id: IngredientId) => COUNTRY_IDS.filter((c) => COUNTRIES[c].pool.includes(id))
const usedIn = (id: IngredientId) => DISH_IDS.filter((d) => (DISHES[d].recipe as Partial<Record<IngredientId, number>>)[id])

// Every ingredient in the game, by how hard it is to get. Ones you've never had are dimmed.
export function Codex({ state }: { state: GameState }) {
  const found = new Set(state.discovered)
  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-4 gap-2">
        <p className="text-xs text-muted-foreground">食材圖鑑：抽到或買到過的食材會亮起來。去不同地區才收集得到當地特產。</p>
        <span className="font-mono text-sm text-neon-green shrink-0">
          {found.size}/{INGREDIENT_IDS.length}
        </span>
      </div>
      <div className="space-y-5">
        {[...RARITIES].reverse().map((rarity) => {
          const ids = INGREDIENT_IDS.filter((id) => INGREDIENTS[id].rarity === rarity)
          const have = ids.filter((id) => found.has(id)).length
          return (
            <section key={rarity}>
              <div className="flex items-baseline justify-between gap-2 border-b border-border pb-1 mb-2">
                <h3 className="text-sm tracking-widest" style={{ color: RARITY_COLOR[rarity] }}>
                  {RARITY_LABEL[rarity]}
                </h3>
                <span className="text-xs font-mono text-muted-foreground">
                  {have}/{ids.length}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mb-2">{RARITY_HINT[rarity]}</p>
              <ul className="grid gap-2 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {ids.map((id) => {
                  const ing = INGREDIENTS[id]
                  const known = found.has(id)
                  const dishes = usedIn(id)
                  return (
                    <li
                      key={id}
                      className={`flex items-start gap-2 p-2 rounded-sm border bg-cyber-dark ${known ? "border-border" : "border-dashed border-border opacity-50"}`}
                    >
                      <IngredientIcon id={id} size={28} />
                      <div className="min-w-0 text-xs">
                        <div className="text-foreground flex items-center gap-1">
                          {ing.name}
                          {known && state.inventory[id] > 0 && (
                            <span className="font-mono text-muted-foreground">×{state.inventory[id]}</span>
                          )}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {CATEGORY_LABEL[ing.category]} · 產地 {origins(id).map((c) => COUNTRIES[c].name).join("、")}
                        </div>
                        {dishes.length > 0 && (
                          <div className="text-[10px] text-muted-foreground truncate" title={dishes.map((d) => DISHES[d].name).join("、")}>
                            做成 {dishes.map((d) => DISHES[d].name).join("、")}
                          </div>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}
