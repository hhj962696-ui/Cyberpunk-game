import { ArrowUpCircle, ChevronRight, Coins, Dices, Gift, Moon, RotateCcw, Sunrise, Tv } from "lucide-react"
import { GAME_RULES } from "@/lib/game/data"
import { nextStoreLevel, rentDue, storeLevel, weekOf, type GameState } from "@/lib/game/engine"
import { adCoinReward } from "@/lib/game/stages"

interface ActionButtonProps {
  icon: React.ReactNode
  label: string
  sublabel?: string
  variant: "primary" | "secondary" | "danger"
  onClick?: () => void
  disabled?: boolean
  tut?: string
}

const VARIANT = {
  primary: "border-neon-green/50 bg-neon-green/5 hover:bg-neon-green/15 hover:border-neon-green hover:shadow-[0_0_15px_var(--neon-green)]",
  secondary: "border-neon-purple/50 bg-neon-purple/5 hover:bg-neon-purple/15 hover:border-neon-purple hover:shadow-[0_0_15px_var(--neon-purple)]",
  danger: "border-destructive/50 bg-destructive/5 hover:bg-destructive/15 hover:border-destructive",
}

const ICON_COLOR = { primary: "text-neon-green", secondary: "text-neon-purple", danger: "text-destructive" }

function ActionButton({ icon, label, sublabel, variant, onClick, disabled, tut }: ActionButtonProps) {
  return (
    <button
      className={`relative w-full p-3 rounded-sm border transition-all duration-200 text-left group active:scale-[0.98] ${VARIANT[variant]} disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none`}
      onClick={onClick}
      disabled={disabled}
      data-tut={tut}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={ICON_COLOR[variant]}>{icon}</div>
          <div>
            <div className="text-sm font-medium text-foreground tracking-wide">{label}</div>
            {sublabel && <div className="text-xs text-muted-foreground">{sublabel}</div>}
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 ${ICON_COLOR[variant]} opacity-50 group-hover:opacity-100 transition-all`} />
      </div>
    </button>
  )
}

interface Props {
  state: GameState
  onDraw: () => void
  onAdDraw: () => void
  onAdCoins: () => void
  onDoubleBonus: () => void
  adPlaying: boolean
  onOpen: () => void
  onNextDay: () => void
  onUpgrade: () => void
  onReset: () => void
}

export function ActionPanel({ state, onDraw, onAdDraw, onAdCoins, onDoubleBonus, adPlaying, onOpen, onNextDay, onUpgrade, onReset }: Props) {
  const prep = state.phase === "prep"
  const free = state.freeDrawsLeft > 0
  const upgrade = nextStoreLevel(state)
  const rent = rentDue(state)
  const rentTonight = state.phase === "closed" && rent.inDays === 0
  const coinReward = adCoinReward(weekOf(state.day), state.level)
  const bonus = state.stageBonus && !state.stageBonus.doubled ? state.stageBonus : null
  const between = state.phase === "prep" || state.phase === "closed"
  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border p-4">
        <div className="text-xs text-neon-purple uppercase tracking-widest mb-1">
          {prep ? "PREP_MODE // 備料中" : state.phase === "serving" ? "OPEN // 營業中" : state.phase === "closed" ? "CLOSED // 已打烊" : "GAME_OVER"}
        </div>
        <h2 className="text-sm uppercase tracking-widest text-foreground">經營指令</h2>
      </div>

      <div className="p-4 space-y-2 border-b border-border">
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">// 白天備料</div>
        <ActionButton
          icon={<Dices className="w-5 h-5" />}
          label={free ? "每日抽食材" : "加抽一次"}
          sublabel={free ? `今天免費 ${state.freeDrawsLeft} / ${storeLevel(state).freeDraws} 次` : `花費 ${GAME_RULES.extraDrawCost} 信用點`}
          variant="primary"
          onClick={onDraw}
          tut="draw"
          disabled={!prep || (!free && state.credits < GAME_RULES.extraDrawCost)}
        />
        <ActionButton
          icon={<Tv className="w-5 h-5" />}
          label={adPlaying ? "廣告播放中…" : "看廣告免費加抽"}
          sublabel={`今天還有 ${state.adDrawsLeft} / ${GAME_RULES.adDrawsPerDay} 次`}
          variant="primary"
          onClick={onAdDraw}
          disabled={!prep || adPlaying || state.adDrawsLeft <= 0}
        />
      </div>

      <div className="p-4 space-y-2 border-b border-border">
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">// 免費領信用點</div>
        <ActionButton
          icon={<Coins className="w-5 h-5" />}
          label={adPlaying ? "廣告播放中…" : `看廣告領 ${coinReward} 信用點`}
          sublabel={`今天還有 ${state.adCoinsLeft} / ${GAME_RULES.adCoinsPerDay} 次`}
          variant="primary"
          onClick={onAdCoins}
          disabled={!between || adPlaying || state.adCoinsLeft <= 0}
        />
        {bonus && (
          <ActionButton
            icon={<Gift className="w-5 h-5" />}
            label={adPlaying ? "廣告播放中…" : `看廣告讓第 ${bonus.week} 關獎勵加倍`}
            sublabel={`再拿 ${bonus.credits} 信用點`}
            variant="primary"
            onClick={onDoubleBonus}
            disabled={!between || adPlaying}
          />
        )}
      </div>

      <div className="p-4 space-y-2 border-b border-border">
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">// 夜間營業</div>
        <ActionButton
          icon={<Moon className="w-5 h-5" />}
          label="開始營業"
          sublabel={state.menu.length === 0 ? "先在菜單上架菜色" : `菜單上有 ${state.menu.length} 道菜`}
          variant="secondary"
          onClick={onOpen}
          disabled={!prep || state.menu.length === 0}
          tut="open"
        />
        <ActionButton
          icon={<Sunrise className="w-5 h-5" />}
          label={rentTonight ? "繳房租，進入下一天" : "進入下一天"}
          sublabel={
            state.pendingEvent
              ? "先處理突發事件"
              : rentTonight
                ? state.credits >= rent.amount
                  ? `房租 ${rent.amount} 信用點`
                  : `房租 ${rent.amount}，錢不夠就會被收店！`
                : undefined
          }
          variant={rentTonight && state.credits < rent.amount ? "danger" : "secondary"}
          onClick={onNextDay}
          disabled={state.phase !== "closed" || state.pendingEvent !== null}
          tut="nextday"
        />
      </div>

      <div className="p-4 space-y-2 border-b border-border">
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">// 店面</div>
        <ActionButton
          icon={<ArrowUpCircle className="w-5 h-5" />}
          label={upgrade ? `升級成「${upgrade.name}」` : "已經是最高等級"}
          sublabel={upgrade ? `${upgrade.cost} 信用點 · ${upgrade.perk}` : "霓虹夜市的傳奇名店"}
          variant="primary"
          onClick={onUpgrade}
          disabled={!upgrade || state.credits < upgrade.cost || state.phase === "serving" || state.phase === "gameover"}
          tut="upgrade"
        />
      </div>

      <div className="p-4 mt-auto">
        <ActionButton
          icon={<RotateCcw className="w-5 h-5" />}
          label="重新開始"
          sublabel="清除存檔，從第 1 天開始"
          variant="danger"
          onClick={() => {
            if (state.phase === "gameover" || confirm("確定要清除存檔重新開始嗎？")) onReset()
          }}
        />
      </div>
    </div>
  )
}
