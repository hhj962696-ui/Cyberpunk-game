import { COUNTRIES, COUNTRY_IDS, type CountryId } from "./game/data"
import { seededRng } from "./game/engine"

// Per-country sales boards. With NEXT_PUBLIC_LEADERBOARD_URL set at build time the
// scores go to the online board (see leaderboard-worker/), so every player sees the
// same ranking. Without it the board is kept on this device, padded with rival stalls.

const API = process.env.NEXT_PUBLIC_LEADERBOARD_URL?.replace(/\/$/, "") ?? ""
const PLAYER_KEY = "neon-night-market-player"
const SCORES_KEY = "neon-night-market-scores"

export const BOARD_SIZE = 50
export const NAME_MAX = 16

export const isOnline = () => API !== ""

export interface BoardEntry {
  // public id: the start of a hash of the player's secret id
  pid: string
  name: string
  score: number
  me: boolean
}

export interface Player {
  // kept secret on this device; the server only ever shows a hash of it
  id: string
  name: string
}

function randomId(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

export function cleanName(name: string): string {
  return name.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, NAME_MAX)
}

export function getPlayer(): Player {
  try {
    const saved = JSON.parse(localStorage.getItem(PLAYER_KEY) ?? "null") as Player | null
    if (saved?.id) return saved
  } catch {
    // fall through and make a new one
  }
  const player = { id: randomId(), name: "" }
  savePlayer(player)
  return player
}

export function savePlayer(player: Player) {
  try {
    localStorage.setItem(PLAYER_KEY, JSON.stringify(player))
  } catch {
    // storage unavailable: the name lasts for this visit only
  }
}

export async function publicId(secret: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret))
  return Array.from(new Uint8Array(digest).slice(0, 6), (b) => b.toString(16).padStart(2, "0")).join("")
}

// ---------- this device ----------

function localScores(): Partial<Record<CountryId, number>> {
  try {
    return JSON.parse(localStorage.getItem(SCORES_KEY) ?? "{}")
  } catch {
    return {}
  }
}

const RIVALS = [
  "夜貓拉麵", "鉻合金廚房", "Byte小吃", "霓虹阿嬤", "義肢大廚", "雨夜燒肉", "零號餐車", "量子便當",
  "下城老王", "合成肉之王", "赤焰炒鍋", "深網甜點", "天橋老店", "電子鍋巴", "黑市刀工", "全息壽司",
]

// Rival stalls are fixed per country so the local board feels the same each visit
function rivals(country: CountryId): BoardEntry[] {
  const rng = seededRng(COUNTRY_IDS.indexOf(country) * 7907 + 11)
  const scale = COUNTRIES[country].priceMult * (1 + COUNTRIES[country].unlockLevel / 2)
  const names = [...RIVALS].sort(() => rng() - 0.5)
  return Array.from({ length: 9 }, (_, i) => ({
    pid: `npc${i}`,
    name: names[i],
    score: Math.round((200 + rng() * 2500) * scale * (i < 2 ? 3 : 1)),
    me: false,
  }))
}

// ---------- API ----------

export async function fetchBoard(country: CountryId, player: Player): Promise<BoardEntry[]> {
  const myPid = await publicId(player.id)
  if (isOnline()) {
    const res = await fetch(`${API}/board?country=${country}`)
    if (!res.ok) throw new Error(`排行榜讀取失敗（${res.status}）`)
    const data = (await res.json()) as { entries: Omit<BoardEntry, "me">[] }
    return data.entries.map((e) => ({ ...e, me: e.pid === myPid }))
  }
  const mine = localScores()[country] ?? 0
  const entries = rivals(country)
  if (mine > 0) entries.push({ pid: myPid, name: player.name || "你", score: mine, me: true })
  return entries.sort((a, b) => b.score - a.score).slice(0, BOARD_SIZE)
}

// Keeps the higher of the old and new score
export async function submitScore(country: CountryId, score: number, player: Player): Promise<void> {
  if (score <= 0) return
  const scores = localScores()
  if (score > (scores[country] ?? 0)) {
    scores[country] = score
    try {
      localStorage.setItem(SCORES_KEY, JSON.stringify(scores))
    } catch {
      // ignore
    }
  }
  if (!isOnline() || !player.name) return
  const res = await fetch(`${API}/submit`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ country, score: Math.floor(score), playerId: player.id, name: player.name }),
  })
  if (!res.ok) throw new Error(`上傳成績失敗（${res.status}）`)
}

// Best score on this device, for every country
export function myBestScores(): Partial<Record<CountryId, number>> {
  return localScores()
}
