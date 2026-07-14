"use client"

import dynamic from "next/dynamic"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from "chart.js"
import { Line } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip)

interface WeightChartProps {
  logs: Array<{ date: string; weight: number }>
}

function WeightChartInner({ logs }: WeightChartProps) {
  if (logs.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhum registro de peso ainda
      </p>
    )
  }

  const labels = logs.map((l) =>
    new Date(l.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
  )

  const data = {
    labels,
    datasets: [
      {
        label: "Peso (kg)",
        data: logs.map((l) => l.weight),
        borderColor: "oklch(0.55 0.12 180)",
        backgroundColor: "oklch(0.55 0.12 180 / 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: false },
    },
  }

  return (
    <div className="h-48">
      <Line data={data} options={options} />
    </div>
  )
}

export const WeightChart = dynamic(
  () => Promise.resolve(WeightChartInner),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-lg bg-muted" /> },
)
