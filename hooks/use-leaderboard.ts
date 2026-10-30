"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { COUNTRY_IDS } from "@/lib/game/data"
import type { GameState } from "@/lib/game/engine"
import { cleanName, getPlayer, myBestScores, savePlayer, submitScore, type Player } from "@/lib/leaderboard"

// Sends this run's sales for the country to its board whenever a night ends
export function useLeaderboard(state: GameState | null) {
  const [player, setPlayer] = useState<Player | null>(null)
  const lastPhase = useRef<GameState["phase"] | null>(null)

  useEffect(() => setPlayer(getPlayer()), [])

  useEffect(() => {
    if (!state || !player) return
    const ended = lastPhase.current === "serving" && state.phase === "closed"
    lastPhase.current = state.phase
    if (!ended) return
    submitScore(state.country, state.sales[state.country] ?? 0, player).catch(() => {
      // offline: the best score stays on this device and goes up next time
    })
  }, [state, player])

  // Naming yourself puts your best score in every country on the online boards
  const rename = useCallback(async (name: string) => {
    const next = { ...getPlayer(), name: cleanName(name) }
    savePlayer(next)
    setPlayer(next)
    const best = myBestScores()
    await Promise.all(COUNTRY_IDS.map((c) => submitScore(c, best[c] ?? 0, next)))
  }, [])

  return { player, rename }
}
