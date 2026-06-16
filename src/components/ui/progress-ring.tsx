import { cn } from "@/lib/utils"

interface ProgressRingProps {
  /** Percentage value (0–100) */
  percentage: number
  /** Diameter of the ring in pixels (default: 120) */
  size?: number
  /** Stroke width in pixels (default: 10) */
  strokeWidth?: number
  /** Label displayed below the percentage */
  label?: string
  /** Override fill stroke color (Tailwind text-* class, e.g. "text-accent-warm") */
  color?: string
}

export function ProgressRing({
  percentage,
  size = 120,
  strokeWidth = 10,
  label,
  color,
}: ProgressRingProps) {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - clampedPercentage / 100)

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-surface-raised"
          strokeWidth={strokeWidth}
        />
        {/* Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className={color ?? "text-primary"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-tabular-nums text-[28px] font-bold tracking-tight text-ink">
          {Math.round(clampedPercentage)}%
        </span>
        {label && (
          <span className="text-xs text-muted-foreground">{label}</span>
        )}
      </div>
    </div>
  )
}
