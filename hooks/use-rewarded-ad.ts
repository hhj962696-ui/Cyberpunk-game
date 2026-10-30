"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { getAdProvider, initAds, showRewardedAd } from "@/lib/ads/rewarded-ads"

export interface RewardedAd {
  playing: boolean
  // Resolves true when the player earned the reward
  show: () => Promise<boolean>
  gameplayStart: () => void
  gameplayStop: () => void
}

export function useRewardedAd(): RewardedAd {
  const [playing, setPlaying] = useState(false)
  const playingRef = useRef(false)

  useEffect(() => {
    initAds()
  }, [])

  const show = useCallback(async () => {
    if (playingRef.current) return false
    playingRef.current = true
    setPlaying(true)
    try {
      return await showRewardedAd()
    } finally {
      playingRef.current = false
      setPlaying(false)
    }
  }, [])

  const gameplayStart = useCallback(() => getAdProvider().gameplayStart(), [])
  const gameplayStop = useCallback(() => getAdProvider().gameplayStop(), [])

  return { playing, show, gameplayStart, gameplayStop }
}
