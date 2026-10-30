"use client"

import { useEffect, useState } from "react"
import { Crown, RefreshCw, Trophy } from "lucide-react"
import { COUNTRIES, COUNTRY_IDS, type CountryId } from "@/lib/game/data"
import type { GameState } from "@/lib/game/engine"
import { fetchBoard, isOnline, NAME_MAX, type BoardEntry, type Player } from "@/lib/leaderboard"

interface Props {
  state: GameState
  player: Player | null
  onRename: (name: string) => Promise<void>
}

export function Leaderboard({ state, player, onRename }: Props) {
  const [country, setCountry] = useState<CountryId>(state.country)
  const [entries, setEntries] = useState<BoardEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState(player?.name ?? "")
  const [saving, setSaving] = useState(false)
  const [reload, setReload] = useState(0)

  useEffect(() => setDraft(player?.name ?? ""), [player?.name])

  useEffect(() => {
    if (!player) return
    let alive = true
    setEntries(null)
    setError(null)
    fetchBoard(country, player)
      .then((e) => alive && setEntries(e))
      .catch((e: Error) => alive && setError(e.message))
    return () => {
      alive = false
    }
  }, [country, player, reload])

  const save = async () => {
    setSaving(true)
    try {
      await onRename(draft)
      setReload((r) => r + 1)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-xs text-muted-foreground">
          每個地區一張業績榜，記你一局裡在那裡賣出的總額（含小費），每晚打烊自動上傳最好成績。
        </p>
        <button
          onClick={() => setReload((r) => r + 1)}
          className="p-1.5 rounded-sm border border-border text-muted-foreground hover:text-neon-green shrink-0"
          aria-label="重新整理"
          title="重新整理"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {!isOnline() && (
        <p className="text-[11px] text-neon-gold border border-neon-gold/40 rounded-sm px-2 py-1 mb-3">
          線上排行榜還沒開通，現在顯示的是這台裝置的紀錄和電腦對手。
        </p>
      )}

      <form
        className="flex gap-2 mb-4"
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={NAME_MAX}
          placeholder="輸入店名，上榜時顯示"
          className="flex-1 min-w-0 bg-cyber-dark border border-border rounded-sm px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-neon-green"
        />
        <button
          disabled={saving || !draft.trim() || draft.trim() === player?.name}
          className="text-xs px-3 rounded-sm border border-neon-green/60 text-neon-green hover:bg-neon-green/15 disabled:opacity-40"
        >
          {saving ? "儲存中…" : "儲存店名"}
        </button>
      </form>
      {isOnline() && !player?.name && <p className="text-[11px] text-muted-foreground -mt-2 mb-3">取好店名才會出現在線上排行榜。</p>}

      <div className="flex flex-wrap gap-1.5 mb-3">
        {COUNTRY_IDS.map((c) => (
          <button
            key={c}
            onClick={() => setCountry(c)}
            className={`text-xs px-2.5 py-1 rounded-sm border transition-all ${
              country === c ? "border-neon-gold text-neon-gold bg-neon-gold/10" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {COUNTRIES[c].name}
          </button>
        ))}
      </div>

      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : !entries ? (
        <p className="text-xs text-muted-foreground">&gt;&gt; 讀取中...</p>
      ) : entries.length === 0 ? (
        <p className="text-xs text-muted-foreground">{COUNTRIES[country].name}還沒有人上榜，去那裡開店搶第一吧！</p>
      ) : (
        <ol className="space-y-1">
          {entries.map((e, i) => (
            <li
              key={e.pid}
              className={`flex items-center gap-3 px-2 py-1.5 rounded-sm border text-xs ${
                e.me ? "border-neon-green bg-neon-green/10" : "border-border bg-cyber-dark"
              }`}
            >
              <span className={`w-6 text-right font-mono ${i < 3 ? "text-neon-gold" : "text-muted-foreground"}`}>
                {i === 0 ? <Crown className="w-4 h-4 inline" /> : i + 1}
              </span>
              <span className="flex-1 truncate text-foreground">
                {e.name}
                {e.me && <span className="text-neon-green">（你）</span>}
              </span>
              <span className="font-mono text-neon-gold">{e.score.toLocaleString()}</span>
            </li>
          ))}
        </ol>
      )}
      {entries && !entries.some((e) => e.me) && (
        <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1">
          <Trophy className="w-3 h-3" /> 你還沒在{COUNTRIES[country].name}上榜。
        </p>
      )}
    </div>
  )
}
