"use client"

import { useEffect, useRef } from "react"
import { AlertTriangle } from "lucide-react"
import { EVENTS, type GameState, type LogEntry } from "@/lib/game/engine"

const LOG_STYLE: Record<LogEntry["type"], string> = {
  system: "text-neon-green",
  draw: "text-neon-cyan",
  sale: "text-foreground",
  miss: "text-destructive",
  event: "text-neon-gold",
  result: "text-neon-purple font-bold",
}

export function NightLog({ state, onChoose }: { state: GameState; onChoose: (choice: number) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [state.log.length, state.pendingEvent])

  const event = state.pendingEvent ? EVENTS[state.pendingEvent.id] : null

  return (
    <div className="h-full flex flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1 text-sm">
        {state.log.map((entry) => (
          <div key={entry.id} className="flex gap-3">
            <span className="text-muted-foreground text-xs font-mono shrink-0 pt-0.5">D{entry.day}</span>
            <span className={LOG_STYLE[entry.type]}>{entry.message}</span>
          </div>
        ))}
      </div>
      {event && (
        <div className="border-t border-neon-gold/50 bg-neon-gold/5 p-4">
          <div className="flex items-center gap-2 text-neon-gold text-sm mb-3">
            <AlertTriangle className="w-4 h-4" /> 突發事件：{event.title}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {event.choices.map((choice, i) => (
              <button
                key={choice.label}
                onClick={() => onChoose(i)}
                className="text-left p-3 rounded-sm border border-neon-gold/50 hover:bg-neon-gold/15 hover:shadow-[0_0_12px_var(--neon-gold)] transition-all"
              >
                <div className="text-sm text-foreground">{choice.label}</div>
                <div className="text-xs text-muted-foreground">{choice.hint}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
