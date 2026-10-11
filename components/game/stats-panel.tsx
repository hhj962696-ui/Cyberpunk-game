import { Coins, Star, CalendarDays, Package } from "lucide-react"
import { GAME_RULES, INGREDIENTS, INGREDIENT_IDS, RARITY_LABEL } from "@/lib/game/data"
import type { GameState } from "@/lib/game/engine"
import { IngredientIcon } from "./food-icon"

export function StatsPanel({ state }: { state: GameState }) {
  const goal = Math.min(100, Math.round((state.credits / GAME_RULES.goalCredits) * 100))
  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="border-b border-border p-4">
        <div className="text-xs text-neon-green uppercase tracking-widest mb-1">FOOD_TRUCK // 下城巷弄</div>
        <h2 className="text-sm uppercase tracking-widest text-foreground">餐車狀態</h2>
      </div>

      <div className="p-4 space-y-3 border-b border-border">
        <Stat icon={<Coins className="w-4 h-4" />} label="信用點" value={state.credits} color="text-neon-gold" />
        <Stat icon={<Star className="w-4 h-4" />} label="聲望" value={state.reputation} color="text-neon-purple" />
        <Stat
          icon={<CalendarDays className="w-4 h-4" />}
          label="天數"
          value={`${state.day} / ${GAME_RULES.lastDay}`}
          color="text-neon-green"
        />
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>升級小店目標</span>
            <span className="font-mono">
              {state.credits} / {GAME_RULES.goalCredits}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-sm overflow-hidden">
            <div
              className="h-full bg-neon-gold shadow-[0_0_8px_var(--neon-gold)] transition-all"
              style={{ width: `${goal}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-4 flex-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest mb-3">
          <Package className="w-3 h-3" /> // 食材庫存
        </div>
        <ul className="grid grid-cols-2 gap-2">
          {INGREDIENT_IDS.map((id) => {
            const count = state.inventory[id]
            return (
              <li
                key={id}
                className={`flex items-center gap-2 p-2 rounded-sm border border-border bg-cyber-dark ${count === 0 ? "opacity-40" : ""}`}
              >
                <IngredientIcon id={id} size={24} />
                <div className="min-w-0">
                  <div className="text-xs text-foreground truncate">{INGREDIENTS[id].name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {RARITY_LABEL[INGREDIENTS[id].rarity]} · <span className="font-mono text-foreground">×{count}</span>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

function Stat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: React.ReactNode; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className={color}>{icon}</span>
        {label}
      </div>
      <span className={`font-mono text-lg ${color}`}>{value}</span>
    </div>
  )
}
