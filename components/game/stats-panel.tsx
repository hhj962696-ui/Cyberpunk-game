import { Coins, Star, CalendarDays, Package, Store, Trophy } from "lucide-react"
import { INGREDIENTS, INGREDIENT_IDS, RARITY_LABEL, STORE_LEVELS } from "@/lib/game/data"
import { nextStoreLevel, rentDue, storeLevel, weekOf, type GameState } from "@/lib/game/engine"
import { IngredientIcon } from "./food-icon"

export function StatsPanel({ state }: { state: GameState }) {
  const level = storeLevel(state)
  const upgrade = nextStoreLevel(state)
  const rent = rentDue(state)
  const goal = upgrade ? Math.min(100, Math.round((state.credits / upgrade.cost) * 100)) : 100
  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="border-b border-border p-4">
        <div className="text-xs text-neon-green uppercase tracking-widest mb-1">
          LV.{state.level + 1} // 下城巷弄
        </div>
        <h2 className="text-sm uppercase tracking-widest text-foreground">{level.name}</h2>
      </div>

      <div className="p-4 space-y-3 border-b border-border">
        <Stat icon={<Coins className="w-4 h-4" />} label="信用點" value={state.credits} color="text-neon-gold" />
        <Stat icon={<Star className="w-4 h-4" />} label="聲望" value={state.reputation} color="text-neon-purple" />
        <Stat
          icon={<CalendarDays className="w-4 h-4" />}
          label="天數"
          value={`${state.day}（第 ${weekOf(state.day)} 週）`}
          color="text-neon-green"
        />
        <div
          className={`flex items-center justify-between text-xs rounded-sm border px-2 py-1.5 ${
            state.credits < rent.amount ? "border-destructive/60 text-destructive" : "border-border text-muted-foreground"
          }`}
        >
          <span>本週房租</span>
          <span className="font-mono">
            {rent.amount} · {rent.inDays === 0 ? "今晚打烊繳" : `${rent.inDays} 天後`}
          </span>
        </div>
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span className="flex items-center gap-1">
              <Store className="w-3 h-3" />
              {upgrade ? `升級「${upgrade.name}」` : "已是最高等級"}
            </span>
            <span className="font-mono">{upgrade ? `${state.credits} / ${upgrade.cost}` : `LV.${STORE_LEVELS.length}`}</span>
          </div>
          <div className="h-2 bg-muted rounded-sm overflow-hidden">
            <div
              className="h-full bg-neon-gold shadow-[0_0_8px_var(--neon-gold)] transition-all"
              style={{ width: `${goal}%` }}
            />
          </div>
        </div>
      </div>

      {state.best.days > 0 && (
        <div className="px-4 py-2 border-b border-border flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Trophy className="w-3 h-3 text-neon-gold" /> 最佳紀錄
          </span>
          <span className="font-mono">
            {state.best.days} 天 · {STORE_LEVELS[state.best.level].name}
          </span>
        </div>
      )}

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
