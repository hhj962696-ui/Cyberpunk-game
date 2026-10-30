"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { INGREDIENTS } from "@/lib/game/data"
import type { GameState, LogType } from "@/lib/game/engine"
import { setMuted, sfx, SOUND_KEY } from "@/lib/game/sound"

const LOG_SOUND: Partial<Record<LogType, () => void>> = {
  sale: sfx.serve,
  miss: sfx.walkout,
  event: sfx.event,
  upgrade: sfx.upgrade,
  rent: sfx.rent,
}

// Plays sounds for what changed in the game state, so the engine stays free of side effects
export function useGameSounds(state: GameState | null) {
  const [muted, setMutedState] = useState(false)
  const seenLog = useRef<number | null>(null)
  const seenDraw = useRef<number | null>(null)
  const lastPhase = useRef<GameState["phase"] | null>(null)

  useEffect(() => {
    try {
      const off = localStorage.getItem(SOUND_KEY) === "off"
      setMuted(off)
      setMutedState(off)
    } catch {
      // storage unavailable: sound stays on
    }
  }, [])

  const toggleMute = useCallback(() => {
    const next = !muted
    setMuted(next)
    setMutedState(next)
    try {
      localStorage.setItem(SOUND_KEY, next ? "off" : "on")
    } catch {
      // ignore
    }
    if (!next) sfx.click()
  }, [muted])

  useEffect(() => {
    if (!state) return
    // nothing plays for what was already in the save when the page loaded
    // ...nor when a fresh game replaces the old one
    if (seenLog.current === null || state.nextLogId < seenLog.current) {
      seenLog.current = state.nextLogId
      seenDraw.current = state.lastDraw?.seq ?? 0
      lastPhase.current = state.phase
      return
    }
    // one sound per type per update, so a burst of entries doesn't stack up
    const types = new Set(state.log.filter((e) => e.id >= (seenLog.current ?? 0)).map((e) => e.type))
    seenLog.current = state.nextLogId
    types.forEach((t) => LOG_SOUND[t]?.())

    if (state.lastDraw && state.lastDraw.seq !== seenDraw.current) {
      seenDraw.current = state.lastDraw.seq
      sfx.draw(INGREDIENTS[state.lastDraw.id].rarity)
    }

    if (state.phase !== lastPhase.current) {
      if (state.phase === "serving") sfx.open()
      else if (state.phase === "closed") sfx.close()
      else if (state.phase === "prep" && lastPhase.current === "closed") sfx.newDay()
      else if (state.phase === "gameover") sfx.gameover()
      lastPhase.current = state.phase
    }
  }, [state])

  return { muted, toggleMute }
}
