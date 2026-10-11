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

  const reset = useCallback(() => setState(newGame(Date.now())), [])

  return { state, now, act, reset }
}
