import { rentFor } from "./data"

// Every week of a run is one stage. Later stages have less patient, pickier and more
// numerous customers, and trouble shows up more often after closing.
export interface Stage {
  number: number
  name: string
  // shown when the stage starts
  intro: string
  // multiplies how long customers wait before walking out
  patienceMult: number
  // extra guests per night on top of reputation and store size
  extraGuests: number
  // chance that a customer who can't find a favorite on the menu walks away at the door
  pickyRate: number
  // chance of an event after closing
  eventChance: number
}

const NAMED: { name: string; intro: string }[] = [
  { name: "下城新手週", intro: "客人很有耐心，先熟悉做菜和上菜。" },
  { name: "下班人潮", intro: "上班族變多了，晚上更忙。" },
  { name: "酸雨季", intro: "下雨天客人不想久等。" },
  { name: "幫派地盤", intro: "收攤後的麻煩變多了。" },
  { name: "美食評論週", intro: "挑嘴的客人開始出現，菜單沒有他們愛吃的就不進門。" },
  { name: "霓虹祭典", intro: "祭典人潮湧入，桌子不夠用了。" },
  { name: "企業罷工", intro: "客人火氣很大，耐心更短。" },
  { name: "停電危機", intro: "整條街斷斷續續停電，大家都很急。" },
  { name: "天空花園巡禮", intro: "富豪們下來夜市找好吃的，又多又挑。" },
  { name: "全城直播", intro: "整座城市都在看你的餐廳。" },
  { name: "駭客之夜", intro: "收銀系統天天被盯上。" },
  { name: "傳說主廚挑戰", intro: "最難的一週：最多、最急、最挑的客人。" },
]

export const NAMED_STAGE_COUNT = NAMED.length

export function stageFor(week: number): Stage {
  const n = Math.max(1, week)
  const step = n - 1
  const named = NAMED[n - 1]
  return {
    number: n,
    name: named?.name ?? `無盡之夜 ${n - NAMED.length}`,
    intro: named?.intro ?? "越來越難了，撐得越久排名越高。",
    patienceMult: Math.max(0.5, 1 - 0.045 * step),
    extraGuests: Math.floor(step / 2),
    pickyRate: n < 5 ? 0 : Math.min(0.5, 0.06 * (n - 4)),
    eventChance: Math.min(0.75, 0.3 + 0.04 * step),
  }
}

// Weekly takings needed for 2 and 3 stars. Getting through the week (paying rent) is 1 star.
export function starTargets(week: number, level: number): [number, number] {
  const rent = rentFor(week, level + 1)
  return [rent * 2, rent * 3]
}

export function starsFor(income: number, week: number, level: number): number {
  const [two, three] = starTargets(week, level)
  return income >= three ? 3 : income >= two ? 2 : 1
}

// Bonus paid when a stage is cleared, scaled with the rent so it stays worth having
export function stageReward(stars: number, week: number, level: number): number {
  const rent = rentFor(week, level + 1)
  return stars >= 3 ? Math.round(rent * 0.5) : stars === 2 ? Math.round(rent * 0.25) : 0
}

// Credits from watching an ad during the day
export function adCoinReward(week: number, level: number): number {
  return Math.max(20, Math.round(rentFor(week, level + 1) / 40 / 5) * 5)
}
