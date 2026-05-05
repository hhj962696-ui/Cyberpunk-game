"use client"

import { useState } from "react"
import { Sword, Shield, Zap, Cpu, Package, Settings, ChevronRight, Crosshair } from "lucide-react"

interface ActionButtonProps {
  icon: React.ReactNode
  label: string
  sublabel?: string
  variant: "primary" | "secondary" | "danger"
  onClick?: () => void
  disabled?: boolean
  cooldown?: number
}

function ActionButton({ icon, label, sublabel, variant, onClick, disabled, cooldown }: ActionButtonProps) {
  const baseClasses = "relative w-full p-3 rounded-sm border transition-all duration-200 text-left group overflow-hidden"
  
  const variantClasses = {
    primary: `
      border-neon-green/50 bg-neon-green/5 
      hover:bg-neon-green/15 hover:border-neon-green hover:shadow-[0_0_15px_var(--neon-green)]
      active:scale-[0.98]
    `,
    secondary: `
      border-neon-purple/50 bg-neon-purple/5 
      hover:bg-neon-purple/15 hover:border-neon-purple hover:shadow-[0_0_15px_var(--neon-purple)]
      active:scale-[0.98]
    `,
    danger: `
      border-destructive/50 bg-destructive/5 
      hover:bg-destructive/15 hover:border-destructive hover:shadow-[0_0_15px_var(--destructive)]
      active:scale-[0.98]
    `,
  }

  const iconColorClasses = {
    primary: "text-neon-green",
    secondary: "text-neon-purple",
    danger: "text-destructive",
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={onClick}
      disabled={disabled || (cooldown !== undefined && cooldown > 0)}
    >
      {/* Scanline effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <div className="flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          <div className={iconColorClasses[variant]}>{icon}</div>
          <div>
            <div className="text-sm font-medium text-foreground uppercase tracking-wide">
              {label}
            </div>
            {sublabel && (
              <div className="text-xs text-muted-foreground">{sublabel}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {cooldown !== undefined && cooldown > 0 && (
            <span className="text-xs text-muted-foreground font-mono">{cooldown}s</span>
          )}
          <ChevronRight className={`w-4 h-4 ${iconColorClasses[variant]} opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
        </div>
      </div>
    </button>
  )
}

export function ActionPanel() {
  const [selectedAction, setSelectedAction] = useState<string | null>(null)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-2 mb-1">
          <Crosshair className="w-4 h-4 text-neon-purple" />
          <span className="text-xs text-neon-purple uppercase tracking-widest">
            COMBAT_MODE
          </span>
        </div>
        <h2 className="text-sm uppercase tracking-widest text-foreground">
          ACTION_MATRIX
        </h2>
      </div>

      {/* Combat Actions */}
      <div className="p-4 border-b border-border">
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
          // 戰鬥指令
        </div>
        <div className="space-y-2">
          <ActionButton
            icon={<Sword className="w-5 h-5" />}
            label="快速攻擊"
            sublabel="消耗 15 能量"
            variant="primary"
            onClick={() => setSelectedAction("attack")}
          />
          <ActionButton
            icon={<Zap className="w-5 h-5" />}
            label="神經駭入"
            sublabel="消耗 40 能量"
            variant="primary"
            onClick={() => setSelectedAction("hack")}
          />
          <ActionButton
            icon={<Shield className="w-5 h-5" />}
            label="防禦姿態"
            sublabel="下一回合 +50% 減傷"
            variant="secondary"
            onClick={() => setSelectedAction("defend")}
          />
        </div>
      </div>

      {/* Special Actions */}
      <div className="p-4 border-b border-border">
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
          // 特殊技能
        </div>
        <div className="space-y-2">
          <ActionButton
            icon={<Cpu className="w-5 h-5" />}
            label="超頻模式"
            sublabel="冷卻中..."
            variant="danger"
            cooldown={3}
          />
          <ActionButton
            icon={<Zap className="w-5 h-5" />}
            label="EMP 炸彈"
            sublabel="消耗 80 能量"
            variant="danger"
            onClick={() => setSelectedAction("emp")}
          />
        </div>
      </div>

      {/* Utility Actions */}
      <div className="p-4 flex-1">
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
          // 系統功能
        </div>
        <div className="space-y-2">
          <ActionButton
            icon={<Package className="w-5 h-5" />}
            label="物品欄"
            sublabel="4 個物品可用"
            variant="secondary"
            onClick={() => setSelectedAction("inventory")}
          />
          <ActionButton
            icon={<Settings className="w-5 h-5" />}
            label="系統設定"
            variant="secondary"
            onClick={() => setSelectedAction("settings")}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-t border-border bg-cyber-dark">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex flex-col">
            <span className="text-muted-foreground">回合</span>
            <span className="text-neon-green font-mono text-lg">07</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">連擊</span>
            <span className="text-neon-purple font-mono text-lg">x3</span>
          </div>
        </div>
      </div>
    </div>
  )
}
