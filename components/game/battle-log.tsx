"use client"

import { useEffect, useRef, useState } from "react"
import { Terminal } from "lucide-react"

interface LogEntry {
  id: number
  type: "system" | "player" | "enemy" | "critical" | "info"
  message: string
  timestamp: string
}

const initialLogs: LogEntry[] = [
  { id: 1, type: "system", message: ">> COMBAT_SEQUENCE INITIALIZED", timestamp: "18:24:01" },
  { id: 2, type: "info", message: "敵人偵測中... 發現目標: CHROME_GHOST", timestamp: "18:24:02" },
  { id: 3, type: "enemy", message: "CHROME_GHOST 發動了 [電磁脈衝]", timestamp: "18:24:05" },
  { id: 4, type: "player", message: "你啟動了 [防火牆護盾] - 格擋了 45 傷害", timestamp: "18:24:06" },
  { id: 5, type: "player", message: "你發動了 [神經駭入] 對 CHROME_GHOST", timestamp: "18:24:08" },
  { id: 6, type: "critical", message: "!! 暴擊 !! 造成 128 傷害", timestamp: "18:24:08" },
  { id: 7, type: "enemy", message: "CHROME_GHOST 的系統陷入混亂狀態", timestamp: "18:24:09" },
  { id: 8, type: "info", message: "敵人護盾已破壞 - 核心暴露中", timestamp: "18:24:10" },
  { id: 9, type: "player", message: "你發動了 [病毒注入]", timestamp: "18:24:12" },
  { id: 10, type: "enemy", message: "CHROME_GHOST 受到 67 持續傷害", timestamp: "18:24:13" },
  { id: 11, type: "system", message: ">> 能量回復 +15", timestamp: "18:24:15" },
  { id: 12, type: "enemy", message: "CHROME_GHOST 嘗試重啟系統...", timestamp: "18:24:17" },
]

const additionalLogs: LogEntry[] = [
  { id: 13, type: "player", message: "你發動了 [超頻攻擊]", timestamp: "18:24:20" },
  { id: 14, type: "critical", message: "!! 系統過載 !! 造成 256 傷害", timestamp: "18:24:21" },
  { id: 15, type: "system", message: ">> CHROME_GHOST 已被摧毀", timestamp: "18:24:22" },
  { id: 16, type: "info", message: "獲得經驗值: +450 XP", timestamp: "18:24:23" },
  { id: 17, type: "info", message: "掉落物品: [損壞的神經晶片]", timestamp: "18:24:24" },
  { id: 18, type: "system", message: ">> 戰鬥結束 - 勝利", timestamp: "18:24:25" },
]

export function BattleLog() {
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs)
  const [additionalIndex, setAdditionalIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  useEffect(() => {
    if (additionalIndex >= additionalLogs.length) return
    
    const timer = setTimeout(() => {
      setLogs(prev => [...prev, additionalLogs[additionalIndex]])
      setAdditionalIndex(prev => prev + 1)
    }, 2000 + Math.random() * 1500)

    return () => clearTimeout(timer)
  }, [additionalIndex])

  const getLogStyle = (type: LogEntry["type"]) => {
    switch (type) {
      case "system":
        return "text-neon-green"
      case "player":
        return "text-neon-purple"
      case "enemy":
        return "text-destructive"
      case "critical":
        return "text-yellow-400 font-bold animate-pulse"
      case "info":
        return "text-muted-foreground"
      default:
        return "text-foreground"
    }
  }

  return (
    <div className="h-full flex flex-col bg-cyber-dark">
      {/* Header */}
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-neon-green" />
          <h2 className="text-sm uppercase tracking-widest text-foreground">
            COMBAT_LOG
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          <span className="text-xs text-neon-green">RECORDING</span>
        </div>
      </div>

      {/* Log Content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
      >
        {logs.map((log) => (
          <div
            key={log.id}
            className={`flex gap-3 text-sm leading-relaxed ${getLogStyle(log.type)}`}
          >
            <span className="text-muted-foreground/50 shrink-0 font-mono text-xs">
              [{log.timestamp}]
            </span>
            <span className="break-words">{log.message}</span>
          </div>
        ))}
        
        {/* Typing indicator */}
        {additionalIndex < additionalLogs.length && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="animate-pulse">▌</span>
            <span className="text-xs">處理中...</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border p-3 bg-muted/30">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="text-neon-purple">&gt;</span>
          <span className="animate-pulse">等待指令輸入...</span>
        </div>
      </div>
    </div>
  )
}
