import { StatsPanel } from "@/components/game/stats-panel"
import { BattleLog } from "@/components/game/battle-log"
import { ActionPanel } from "@/components/game/action-panel"

export default function GamePage() {
  return (
    <main className="min-h-screen bg-background p-4">
      {/* Header */}
      <header className="mb-4 flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neon-green animate-pulse shadow-[0_0_10px_var(--neon-green)]" />
            <h1 className="text-xl font-bold tracking-tighter text-foreground">
              NEON<span className="text-neon-green">_</span>EDGE
            </h1>
          </div>
          <span className="text-xs text-muted-foreground border border-border px-2 py-1 rounded-sm">
            v2.4.7
          </span>
        </div>
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">SYSTEM:</span>
            <span className="text-neon-green">OPERATIONAL</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">NET:</span>
            <span className="text-neon-purple">CONNECTED</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">TIME:</span>
            <span className="text-foreground font-mono">18:24:35</span>
          </div>
        </div>
      </header>

      {/* Main Game Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-4 h-[calc(100vh-120px)]">
        {/* Left Panel - Stats */}
        <aside className="border border-border rounded-sm bg-card overflow-hidden order-2 lg:order-1">
          <StatsPanel />
        </aside>

        {/* Center Panel - Battle Log */}
        <section className="border border-border rounded-sm overflow-hidden order-1 lg:order-2 min-h-[400px] lg:min-h-0">
          <BattleLog />
        </section>

        {/* Right Panel - Actions */}
        <aside className="border border-border rounded-sm bg-card overflow-hidden order-3">
          <ActionPanel />
        </aside>
      </div>

      {/* Footer Scanline Effect */}
      <div className="fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-green/30 to-transparent pointer-events-none" />
      
      {/* Corner Decorations */}
      <div className="fixed top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-neon-green/30 pointer-events-none" />
      <div className="fixed top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-neon-purple/30 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-neon-purple/30 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-neon-green/30 pointer-events-none" />
    </main>
  )
}
