"use client"

import { useEffect, useRef, useState } from "react"
import { GraduationCap, X } from "lucide-react"
import { GAME_RULES, INGREDIENT_IDS } from "@/lib/game/data"
import type { GameState } from "@/lib/game/engine"
import { sfx } from "@/lib/game/sound"

export const TUTORIAL_KEY = "neon-night-market-tutorial"

// What the game looked like when a step started, so a step can tell when the player did it
interface Snapshot {
  drawSeq: number
  stock: number
  credits: number
}

interface Step {
  // data-tut attribute of the element to point at
  target?: string
  body: string
  // steps without `done` wait for the button
  button?: string
  done?: (s: GameState, at: Snapshot) => boolean
}

const stock = (s: GameState) => INGREDIENT_IDS.reduce((sum, id) => sum + s.inventory[id], 0)

const STEPS: Step[] = [
  {
    body: "歡迎來到霓虹夜市！白天抽食材備料，晚上開店做菜賺信用點。跟著幾個步驟，一分鐘學會怎麼玩。",
    button: "開始",
  },
  {
    target: "draw",
    body: "先按「每日抽食材」。每天都有免費次數，運氣好會抽到稀有的天然食材。",
    done: (s, at) => (s.lastDraw?.seq ?? 0) > at.drawSeq || s.phase !== "prep",
  },
  {
    target: "open",
    body: "菜單上已經有「霓虹拉麵」和「電池氣泡飲」，食材也夠做了。按「開始營業」開店！",
    done: (s) => s.phase !== "prep",
  },
  {
    target: "cook",
    body: "客人入座後，頭上會顯示想吃的菜。點下面的菜色開始料理。",
    done: (s, at) => (s.phase === "serving" && stock(s) < at.stock) || s.phase === "closed",
  },
  {
    target: "floor",
    body: "菜做好會放上出餐台。直接點客人就會把對的菜送過去，送得越快小費越多！",
    done: (s, at) => s.credits > at.credits || s.phase === "closed",
  },
  {
    body: "做得好！繼續招呼客人，等太久的客人會生氣離開。撐到打烊吧。",
    done: (s) => s.phase === "closed" || s.phase === "gameover",
  },
  {
    target: "upgrade",
    body: `每 ${GAME_RULES.rentEvery} 天要繳一次房租，而且越來越貴，繳不出來店就會被收回。把錢存起來「升級店面」，就有更多桌子、爐台和免費抽。按「進入下一天」繼續挑戰吧！`,
    button: "完成",
  },
]

function snapshot(s: GameState): Snapshot {
  return { drawSeq: s.lastDraw?.seq ?? 0, stock: stock(s), credits: s.credits }
}

function findTarget(name: string): HTMLElement | null {
  // the same target can exist in several panels; use the one that is on screen
  const all = Array.from(document.querySelectorAll<HTMLElement>(`[data-tut="${name}"]`))
  return all.find((el) => el.getBoundingClientRect().width > 0) ?? null
}

export function Tutorial({ state, onFinish }: { state: GameState; onFinish: () => void }) {
  const [step, setStep] = useState(0)
  const at = useRef<Snapshot>(snapshot(state))
  const [rect, setRect] = useState<DOMRect | null>(null)
  const current = STEPS[step]

  // Move past every step the player has already done
  useEffect(() => {
    let next = step
    while (STEPS[next]?.done?.(state, at.current)) next++
    if (next !== step) {
      at.current = snapshot(state)
      setStep(next)
    }
  }, [state, step])

  useEffect(() => {
    if (!current?.target) {
      setRect(null)
      return
    }
    const el = findTarget(current.target)
    if (el) {
      const r = el.getBoundingClientRect()
      if (r.top < 0 || r.bottom > window.innerHeight) el.scrollIntoView({ block: "center", behavior: "smooth" })
    }
    const update = () => setRect(findTarget(current.target!)?.getBoundingClientRect() ?? null)
    update()
    const timer = setInterval(update, 200)
    return () => clearInterval(timer)
  }, [current])

  if (!current) return null

  const advance = () => {
    sfx.click()
    if (step === STEPS.length - 1) onFinish()
    else {
      at.current = snapshot(state)
      setStep(step + 1)
    }
  }

  return (
    <>
      {rect && (
        <div
          className="fixed z-40 pointer-events-none rounded-sm border-2 border-neon-gold shadow-[0_0_24px_var(--neon-gold)] animate-pulse transition-all duration-200"
          style={{ left: rect.left - 4, top: rect.top - 4, width: rect.width + 8, height: rect.height + 8 }}
        />
      )}
      <div className="fixed z-50 bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md lg:left-4 lg:translate-x-0 lg:w-[296px] rounded-sm border border-neon-gold/70 bg-card/95 backdrop-blur p-4 shadow-[0_0_30px_oklch(0.85_0.17_85/0.25)] animate-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs text-neon-gold tracking-widest">
            <GraduationCap className="w-4 h-4" /> 新手教學 {step + 1} / {STEPS.length}
          </div>
          <button onClick={onFinish} className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs">
            跳過 <X className="w-3 h-3" />
          </button>
        </div>
        <p className="text-sm text-foreground leading-relaxed">{current.body}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <span key={i} className={`h-1 w-4 rounded-sm ${i <= step ? "bg-neon-gold" : "bg-muted"}`} />
            ))}
          </div>
          {current.button && (
            <button
              onClick={advance}
              className="text-xs px-4 py-1.5 rounded-sm border border-neon-gold text-neon-gold hover:bg-neon-gold/15 tracking-widest"
            >
              {current.button}
            </button>
          )}
        </div>
      </div>
    </>
  )
}
