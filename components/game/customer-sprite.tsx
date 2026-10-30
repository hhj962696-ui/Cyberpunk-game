// Simple neon silhouettes, one look per customer type (viewBox 64x80)
const LOOKS: Record<string, { color: string; extra: React.ReactNode }> = {
  worker: {
    color: "var(--neon-gold)",
    extra: <path d="M18 18a14 14 0 0 1 28 0v2H18z" fill="var(--neon-gold)" fillOpacity="0.35" />,
  },
  hacker: {
    color: "var(--neon-green)",
    extra: (
      <>
        <path d="M16 30c0-14 7-22 16-22s16 8 16 22" />
        <rect x="22" y="22" width="20" height="5" rx="2" fill="var(--neon-green)" fillOpacity="0.5" />
      </>
    ),
  },
  cyborg: {
    color: "var(--neon-cyan)",
    extra: (
      <>
        <circle cx="38" cy="23" r="3" fill="var(--destructive)" stroke="var(--destructive)" />
        <path d="M44 20h6M44 26h4" />
      </>
    ),
  },
  salaryman: {
    color: "var(--neon-purple)",
    extra: <path d="M32 42l-3 6 3 14 3-14z" fill="var(--neon-purple)" fillOpacity="0.5" />,
  },
  tycoon: {
    color: "var(--neon-gold)",
    extra: (
      <>
        <rect x="22" y="2" width="20" height="12" rx="1" fill="var(--neon-gold)" fillOpacity="0.35" />
        <path d="M16 14h32" />
      </>
    ),
  },
}

export function CustomerSprite({
  type,
  mood = "ok",
  size = 64,
  x,
  y,
}: {
  type: string
  mood?: "ok" | "angry" | "happy"
  size?: number
  x?: number
  y?: number
}) {
  const look = LOOKS[type] ?? LOOKS.worker
  const color = mood === "angry" ? "var(--destructive)" : look.color
  return (
    <svg
      x={x}
      y={y}
      width={size}
      height={size * 1.25}
      viewBox="0 0 64 80"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      aria-hidden="true"
    >
      <circle cx="32" cy="24" r="12" />
      <path d="M12 78c0-20 9-34 20-34s20 14 20 34" />
      {look.extra}
      {mood === "happy" && <path d="M27 27q5 4 10 0" />}
      {mood === "angry" && <path d="M26 30q6-4 12 0M25 19l5 2M39 19l-5 2" />}
    </svg>
  )
}
