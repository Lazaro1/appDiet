"use client"

import dynamic from "next/dynamic"
import { useMemo } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  type TooltipItem,
} from "chart.js"
import { Line } from "react-chartjs-2"
import { formatWeight } from "@/lib/nutrition/format"
import { cn } from "@/lib/utils"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
)

interface WeightChartProps {
  logs: Array<{ date: string; weight: number }>
  variant?: "line" | "bar"
}

const TEAL = "#0d9488"
const TEAL_SOFT = "rgba(13, 148, 136, 0.15)"
const SURFACE_DIM = "#e0d8d5"

function EmptyState() {
  return (
    <p className="py-8 text-center text-sm text-muted-foreground">
      Nenhum registro de peso ainda
    </p>
  )
}

function WeightLineChart({ logs }: { logs: WeightChartProps["logs"] }) {
  const sorted = useMemo(
    () =>
      [...logs].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    [logs],
  )

  if (sorted.length === 0) return <EmptyState />

  const weights = sorted.map((l) => l.weight)
  const minW = Math.min(...weights)
  const maxW = Math.max(...weights)
  const padding = Math.max((maxW - minW) * 0.2, 0.5)

  const labels = sorted.map((l) =>
    new Date(l.date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    }),
  )

  const data = {
    labels,
    datasets: [
      {
        label: "Peso (kg)",
        data: weights,
        borderColor: TEAL,
        backgroundColor: TEAL_SOFT,
        tension: 0.35,
        fill: true,
        pointBackgroundColor: TEAL,
        pointRadius: sorted.length === 1 ? 4 : 0,
        pointHoverRadius: 5,
        borderWidth: 3,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"line">) => {
            const y = ctx.parsed.y
            return y != null ? formatWeight(y) : ""
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxTicksLimit: 5, font: { size: 11 }, color: "#78716c" },
        border: { color: SURFACE_DIM },
      },
      y: {
        min: minW - padding,
        max: maxW + padding,
        grid: { color: SURFACE_DIM },
        ticks: {
          maxTicksLimit: 4,
          font: { size: 11 },
          color: "#78716c",
          callback: (v: number | string) => `${v}kg`,
        },
        border: { display: false },
      },
    },
  }

  return (
    <div className="h-[140px]">
      <Line data={data} options={options} />
    </div>
  )
}

function WeightBarChart({ logs }: { logs: WeightChartProps["logs"] }) {
  const display = useMemo(() => {
    const sorted = [...logs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )
    return sorted.slice(-5)
  }, [logs])

  if (display.length === 0) return <EmptyState />

  const weights = display.map((l) => l.weight)
  const minW = Math.min(...weights)
  const maxW = Math.max(...weights)
  const range = maxW - minW || 1

  const firstDate = new Date(display[0].date).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
  })
  const lastDate = new Date(
    display[display.length - 1].date,
  ).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
  })

  return (
    <div>
      <div className="flex h-40 items-end gap-2 rounded-lg border border-border bg-surface-raised p-3 pt-8">
        {display.map((log) => {
          const heightPct = 30 + ((log.weight - minW) / range) * 70
          const isLatest = log === display[display.length - 1]

          return (
            <div
              key={log.date}
              className="group relative flex h-full flex-1 flex-col justify-end"
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-ink px-2 py-0.5 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                {formatWeight(log.weight)}
              </div>
              <div
                className={cn(
                  "w-full rounded-t-sm transition-colors",
                  isLatest
                    ? "bg-signature-teal shadow-sm"
                    : "bg-border group-hover:bg-signature-teal/30",
                )}
                style={{ height: `${heightPct}%` }}
              />
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <span>{firstDate}</span>
        <span>{lastDate}</span>
      </div>
    </div>
  )
}

function WeightChartInner({ logs, variant = "line" }: WeightChartProps) {
  if (variant === "bar") {
    return <WeightBarChart logs={logs} />
  }
  return <WeightLineChart logs={logs} />
}

export const WeightChart = dynamic(
  () => Promise.resolve(WeightChartInner),
  {
    ssr: false,
    loading: () => (
      <div className="h-[140px] animate-pulse rounded-lg bg-muted" />
    ),
  },
)
