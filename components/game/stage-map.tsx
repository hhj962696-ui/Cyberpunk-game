import { Lock, Star } from "lucide-react"
import { currentStage, weekOf, type GameState } from "@/lib/game/engine"
import { NAMED_STAGE_COUNT, stageFor, starTargets } from "@/lib/game/stages"

function Stars({ count, size = "w-3 h-3" }: { count: number; size?: string }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3].map((i) => (
        <Star key={i} className={`${size} ${i <= count ? "fill-neon-gold text-neon-gold" : "text-muted-foreground/50"}`} />
      ))}
    </span>
  )
}

function Difficulty({ week }: { week: number }) {
  const s = stageFor(week)
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
      <span>耐心 ×{s.patienceMult.toFixed(2)}</span>
      <span>客人 +{s.extraGuests}</span>
      <span>挑嘴 {Math.round(s.pickyRate * 100)}%</span>
      <span>突發事件 {Math.round(s.eventChance * 100)}%</span>
    </div>
  )
}

export function StageMap({ state }: { state: GameState }) {
  const week = weekOf(state.day)
  const stage = currentStage(state)
  const [two, three] = starTargets(week, state.level)
  const progress = Math.min(100, Math.round((state.weekIncome / three) * 100))
  const shown = Math.max(NAMED_STAGE_COUNT, week + 2)
  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <p className="text-xs text-muted-foreground">
        每 7 天是一個關卡。撐到週末繳得出房租就過關（1 星），這週營收越高星星越多，2 星和 3 星有額外獎勵，
        還能看廣告讓獎勵加倍。越後面的關卡客人越沒耐心、越多也越挑嘴。
      </p>

      <div className="p-3 rounded-sm border border-neon-gold bg-neon-gold/5 shadow-[0_0_10px_var(--neon-gold)]">
        <div className="flex items-center justify-between">
          <div className="text-sm text-foreground">
            第 {week} 關 · {stage.name}
          </div>
          <span className="text-[10px] text-muted-foreground">第 {state.day} 天</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1 mb-2">{stage.intro}</div>
        <Difficulty week={week} />
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>本週營收</span>
            <span className="font-mono">
              {state.weekIncome} / ★★ {two} · ★★★ {three}
            </span>
          </div>
          <div className="relative h-2 bg-muted rounded-sm overflow-hidden">
            <div className="h-full bg-neon-gold transition-all" style={{ width: `${progress}%` }} />
            <div className="absolute top-0 bottom-0 w-px bg-foreground/60" style={{ left: `${(two / three) * 100}%` }} />
          </div>
        </div>
      </div>

      <ul className="grid gap-2 md:grid-cols-2">
        {Array.from({ length: shown }, (_, i) => i + 1).map((n) => {
          const s = stageFor(n)
          const stars = state.stageStars[n - 1] ?? 0
          const done = n < week
          const here = n === week
          return (
            <li
              key={n}
              className={`p-2 rounded-sm border text-xs ${
                here ? "border-neon-gold bg-neon-gold/10" : done ? "border-neon-green/40 bg-cyber-dark" : "border-border bg-cyber-dark opacity-60"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-foreground">
                  {n}. {s.name}
                </span>
                {done ? <Stars count={stars} /> : here ? <span className="text-neon-gold">進行中</span> : <Lock className="w-3 h-3 text-muted-foreground" />}
              </div>
              <div className="mt-1">
                <Difficulty week={n} />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
