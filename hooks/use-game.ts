"use client"

import { useCallback, useEffect, useState } from "react"
import { loadGame, newGame, SAVE_KEY, syncVendor, type GameState } from "@/lib/game/engine"

export function useGame() {
  const [state, setState] = useState<GameState | null>(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    let raw: string | null = null
    try {
      raw = localStorage.getItem(SAVE_KEY)
    } catch {
      // storage unavailable (private mode): play without saving
    }
    setState(loadGame(raw, Date.now()))
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Roll the vendor stall over when its 12-hour window ends
  useEffect(() => {
    setState((s) => (s ? syncVendor(s, now) : s))
  }, [now])

  useEffect(() => {
    if (!state) return
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state))
    } catch {
      // ignore
    }
  }, [state])

  const act = useCallback((fn: (s: GameState) => GameState) => {
    setState((s) => (s ? fn(s) : s))
  }, [])

  // Starting over keeps the best run on this device
  const reset = useCallback(
    () =>
      setState((s) =>
        newGame(
          Date.now(),
          s ? { days: Math.max(s.best.days, s.day), level: Math.max(s.best.level, s.level) } : undefined,
        ),
      ),
    [],
  )

  return { state, now, act, reset }
}
