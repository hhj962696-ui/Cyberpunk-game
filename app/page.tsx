"use client"

import { useEffect, useState } from "react"
import { ScrollText, Store, Utensils, UtensilsCrossed } from "lucide-react"
import { StatsPanel } from "@/components/game/stats-panel"
import { NightLog } from "@/components/game/night-log"
import { MenuBoard } from "@/components/game/menu-board"
import { VendorStall } from "@/components/game/vendor-stall"
import { ActionPanel } from "@/components/game/action-panel"
import { NightShift } from "@/components/game/night-shift"
import { DrawReveal } from "@/components/game/draw-reveal"
import { useGame } from "@/hooks/use-game"
import { useRewardedAd } from "@/hooks/use-rewarded-ad"
import { adDraw, buyFromVendor, draw, nextDay, noteAdUnavailable, resolveEvent, startShift, toggleMenu } from "@/lib/game/engine"

type Tab = "floor" | "menu" | "vendor" | "log"

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "floor", label: "餐廳", icon: <Utensils className="w-4 h-4" /> },
  { id: "menu", label: "菜單", icon: <UtensilsCrossed className="w-4 h-4" /> },
  { id: "vendor", label: "攤販", icon: <Store className="w-4 h-4" /> },
  { id: "log", label: "日誌", icon: <ScrollText className="w-4 h-4" /> },
]

export default function GamePage() {
  const { state, now, act, reset } = useGame()
  const ad = useRewardedAd()
  const [tab, setTab] = useState<Tab>("floor")
  const eventId = state?.pendingEvent?.id

  // Events are answered in the log
  useEffect(() => {
    if (eventId) setTab("log")
  }, [eventId])

  if (!state) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center text-neon-green text-sm">
        &gt;&gt; 載入中...
      </main>
    )
  }

  const clock = new Date(now).toLocaleTimeString("zh-TW", { hour12: false })

  return (
    <main className="min-h-screen bg-background p-4">
      <header className="mb-4 flex flex-wrap gap-3 items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neon-green animate-pulse shadow-[0_0_10px_var(--neon-green)]" />
            <h1 className="text-xl font-bold tracking-tighter text-foreground">
              NEON<span className="text-neon-green">_</span>NIGHT<span className="text-neon-purple">_</span>MARKET
            </h1>
          </div>
          <span className="text-xs text-muted-foreground border border-border px-2 py-1 rounded-sm">霓虹夜市 v0.1</span>
        </div>
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">DAY:</span>
            <span className="text-neon-green font-mono">{String(state.day).padStart(2, "0")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">CREDITS:</span>
            <span className="text-neon-gold font-mono">{state.credits}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">TIME:</span>
            <span className="text-foreground font-mono">{clock}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-4 lg:h-[calc(100vh-120px)]">
        <aside className="border border-border rounded-sm bg-card overflow-hidden order-2 lg:order-1">
          <StatsPanel state={state} />
        </aside>

        <section className="border border-border rounded-sm overflow-hidden order-1 lg:order-2 min-h-[480px] lg:min-h-0 flex flex-col bg-card">
          <nav className="flex border-b border-border">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs tracking-widest border-b-2 transition-all ${
                  tab === t.id
                    ? "border-neon-green text-neon-green bg-neon-green/5"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.icon}
                {t.label}
                {t.id === "log" && state.pendingEvent && <span className="w-2 h-2 rounded-full bg-neon-gold animate-pulse" />}
              </button>
            ))}
          </nav>
          <div className="flex-1 min-h-0">
            {/* the restaurant stays mounted so a running shift keeps going while you look at other tabs */}
            <div className={tab === "floor" ? "h-full" : "hidden"}>
              <NightShift state={state} act={act} ad={ad} />
            </div>
            {tab === "log" && <NightLog state={state} onChoose={(c) => act((s) => resolveEvent(s, c, Math.random))} />}
            {tab === "menu" && <MenuBoard state={state} onToggle={(id) => act((s) => toggleMenu(s, id))} />}
            {tab === "vendor" && <VendorStall state={state} now={now} onBuy={(i) => act((s) => buyFromVendor(s, i, Date.now()))} />}
          </div>
        </section>

        <aside className="border border-border rounded-sm bg-card overflow-hidden order-3">
          <ActionPanel
            state={state}
            onDraw={() => act((s) => draw(s, Math.random))}
            adPlaying={ad.playing}
            onAdDraw={async () => {
              const rewarded = await ad.show()
              act((s) => (rewarded ? adDraw(s, Math.random) : noteAdUnavailable(s)))
            }}
            onOpen={() => {
              act(startShift)
              setTab("floor")
            }}
            onNextDay={() => act(nextDay)}
            onReset={() => {
              reset()
              setTab("floor")
            }}
          />
        </aside>
      </div>

      <DrawReveal draw={state.lastDraw} />
      <div className="fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-green/30 to-transparent pointer-events-none" />
      <div className="fixed top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-neon-green/30 pointer-events-none" />
      <div className="fixed top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-neon-purple/30 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-neon-purple/30 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-neon-green/30 pointer-events-none" />
    </main>
  )
}
