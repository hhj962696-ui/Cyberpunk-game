// One small interface over the web-portal ad SDKs, so the game never talks to a portal directly.
// Pick the portal at build time with NEXT_PUBLIC_AD_PROVIDER=crazygames | poki.
// Anything else (or unset) uses the local provider, which grants rewards without showing an ad.

export type AdProviderName = "crazygames" | "poki" | "local"

export interface AdProvider {
  name: AdProviderName
  init(): Promise<void>
  // Resolves true only when the player watched the ad to the end and should get the reward
  showRewarded(): Promise<boolean>
  gameplayStart(): void
  gameplayStop(): void
}

const SDK_URL = {
  crazygames: "https://sdk.crazygames.com/crazygames-sdk-v3.js",
  poki: "https://game-cdn.poki.com/scripts/v2/poki-sdk.js",
}

interface CrazyGamesSDK {
  init(): Promise<void>
  ad: {
    requestAd(
      type: "midgame" | "rewarded",
      callbacks: { adStarted?: () => void; adFinished?: () => void; adError?: (error: unknown) => void },
    ): void
  }
  game: { loadingStop(): void; gameplayStart(): void; gameplayStop(): void }
}

interface PokiSDK {
  init(): Promise<void>
  gameLoadingFinished(): void
  gameplayStart(): void
  gameplayStop(): void
  rewardedBreak(): Promise<boolean>
}

declare global {
  interface Window {
    CrazyGames?: { SDK: CrazyGamesSDK }
    PokiSDK?: PokiSDK
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`failed to load ${src}`))
    document.head.appendChild(script)
  })
}

const localProvider: AdProvider = {
  name: "local",
  init: async () => {},
  showRewarded: async () => true,
  gameplayStart: () => {},
  gameplayStop: () => {},
}

function crazyGamesProvider(): AdProvider {
  let sdk: CrazyGamesSDK | null = null
  return {
    name: "crazygames",
    async init() {
      await loadScript(SDK_URL.crazygames)
      const loaded = window.CrazyGames?.SDK
      if (!loaded) throw new Error("CrazyGames SDK missing")
      await loaded.init()
      loaded.game.loadingStop()
      sdk = loaded
    },
    showRewarded() {
      if (!sdk) return Promise.resolve(false)
      const ready = sdk
      return new Promise((resolve) => {
        ready.ad.requestAd("rewarded", {
          adFinished: () => resolve(true),
          adError: () => resolve(false),
        })
      })
    },
    gameplayStart: () => sdk?.game.gameplayStart(),
    gameplayStop: () => sdk?.game.gameplayStop(),
  }
}

function pokiProvider(): AdProvider {
  let sdk: PokiSDK | null = null
  return {
    name: "poki",
    async init() {
      await loadScript(SDK_URL.poki)
      const loaded = window.PokiSDK
      if (!loaded) throw new Error("Poki SDK missing")
      await loaded.init()
      loaded.gameLoadingFinished()
      sdk = loaded
    },
    async showRewarded() {
      if (!sdk) return false
      try {
        return await sdk.rewardedBreak()
      } catch {
        return false
      }
    },
    gameplayStart: () => sdk?.gameplayStart(),
    gameplayStop: () => sdk?.gameplayStop(),
  }
}

function createProvider(): AdProvider {
  switch (process.env.NEXT_PUBLIC_AD_PROVIDER) {
    case "crazygames":
      return crazyGamesProvider()
    case "poki":
      return pokiProvider()
    default:
      return localProvider
  }
}

let provider: AdProvider | null = null
let initPromise: Promise<boolean> | null = null

export function getAdProvider(): AdProvider {
  provider ??= createProvider()
  return provider
}

// Resolves true when ads can be shown. A blocked or failed SDK leaves the game playable without them.
export function initAds(): Promise<boolean> {
  initPromise ??= getAdProvider()
    .init()
    .then(() => true)
    .catch(() => false)
  return initPromise
}

export async function showRewardedAd(): Promise<boolean> {
  if (!(await initAds())) return false
  try {
    return await getAdProvider().showRewarded()
  } catch {
    return false
  }
}
