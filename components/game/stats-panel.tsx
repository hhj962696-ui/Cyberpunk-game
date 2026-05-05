"use client"

import { Activity, Zap, Shield, Brain, Heart, Cpu } from "lucide-react"

interface StatBarProps {
  label: string
  value: number
  max: number
  color: "green" | "purple" | "red"
  icon: React.ReactNode
}

function StatBar({ label, value, max, color, icon }: StatBarProps) {
  const percentage = (value / max) * 100
  const colorClasses = {
    green: "bg-neon-green shadow-[0_0_10px_var(--neon-green)]",
    purple: "bg-neon-purple shadow-[0_0_10px_var(--neon-purple)]",
    red: "bg-destructive shadow-[0_0_10px_var(--destructive)]",
  }
  const textColorClasses = {
    green: "text-neon-green",
    purple: "text-neon-purple",
    red: "text-destructive",
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <div className={`flex items-center gap-2 ${textColorClasses[color]}`}>
          {icon}
          <span className="text-xs uppercase tracking-wider">{label}</span>
        </div>
        <span className={`text-xs ${textColorClasses[color]}`}>
          {value}/{max}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-sm overflow-hidden border border-border">
        <div
          className={`h-full transition-all duration-500 ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

interface AttributeProps {
  label: string
  value: number
  icon: React.ReactNode
}

function Attribute({ label, value, icon }: AttributeProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-neon-green font-bold">{value}</span>
    </div>
  )
}

export function StatsPanel() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          <span className="text-neon-green text-xs uppercase tracking-widest">
            SYSTEM_ONLINE
          </span>
        </div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">
          V3X_RUNNER
        </h2>
        <p className="text-xs text-muted-foreground">CLASS: NETRUNNER // LV.12</p>
      </div>

      {/* Status Bars */}
      <div className="p-4 border-b border-border">
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
          // STATUS
        </div>
        <StatBar
          label="HP"
          value={78}
          max={100}
          color="red"
          icon={<Heart className="w-3 h-3" />}
        />
        <StatBar
          label="SHIELD"
          value={45}
          max={60}
          color="purple"
          icon={<Shield className="w-3 h-3" />}
        />
        <StatBar
          label="ENERGY"
          value={120}
          max={150}
          color="green"
          icon={<Zap className="w-3 h-3" />}
        />
      </div>

      {/* Attributes */}
      <div className="p-4 flex-1">
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
          // ATTRIBUTES
        </div>
        <Attribute label="STRENGTH" value={14} icon={<Activity className="w-3 h-3" />} />
        <Attribute label="AGILITY" value={18} icon={<Zap className="w-3 h-3" />} />
        <Attribute label="TECH" value={22} icon={<Cpu className="w-3 h-3" />} />
        <Attribute label="INTEL" value={19} icon={<Brain className="w-3 h-3" />} />
      </div>

      {/* Footer Status */}
      <div className="p-4 border-t border-border bg-cyber-dark">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">CREDITS</span>
          <span className="text-neon-green font-mono">¥ 12,450</span>
        </div>
        <div className="flex items-center justify-between text-xs mt-2">
          <span className="text-muted-foreground">LOCATION</span>
          <span className="text-neon-purple font-mono">SECTOR_7G</span>
        </div>
      </div>
    </div>
  )
}
